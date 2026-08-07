// app/api/paystack/webhook/route.ts

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import type { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { sendOrderEmails, type OrderItem as MailOrderItem } from "@/lib/mail"

const installmentPaymentWithPlanInclude = {
  plan: {
    include: {
      order: { include: { user: true, orderItems: true } },
      payments: true,
    },
  },
} satisfies Prisma.InstallmentPaymentInclude

type InstallmentPaymentWithPlan = Prisma.InstallmentPaymentGetPayload<{
  include: typeof installmentPaymentWithPlanInclude
}>

export const runtime = "nodejs"

function timingSafeEqual(a: string, b: string) {
  const ab = Buffer.from(a, "utf8")
  const bb = Buffer.from(b, "utf8")
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Verify webhook signature ──────────────────────────────────────
    const rawBody = await req.text()
    const signature = req.headers.get("x-paystack-signature") ?? ""

    const secret = process.env.PAYSTACK_SECRET
    if (!secret) {
      console.error("[venix webhook] PAYSTACK_SECRET missing")
      return NextResponse.json({ error: "server misconfigured" }, { status: 500 })
    }

    const computed = crypto.createHmac("sha512", secret).update(rawBody).digest("hex")
    if (!timingSafeEqual(computed, signature)) {
      console.error("[venix webhook] Invalid Paystack signature")
      return NextResponse.json({ error: "invalid signature" }, { status: 400 })
    }

    // ── 2. Parse event ─────────────────────────────────────────────────────
    const event = JSON.parse(rawBody)
    const eventType = event?.event as string

    console.log("[venix webhook] Paystack event received:", eventType)

    if (eventType !== "charge.success") {
      console.log(`[venix webhook] Unhandled event type: ${eventType}`)
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    // ── 3. charge.success ────────────────────────────────────────────────
    const data = event?.data
    const paymentReference = data?.reference as string
    const amountKobo = data?.amount as number
    const channel = data?.channel as string
    const metadata = data?.metadata ?? {}

    if (!paymentReference) {
      console.warn("[venix webhook] charge.success missing reference")
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    // Reject stray events from other Truevenix verticals
    if (metadata.source && metadata.source !== "venix") {
      console.warn(`[venix webhook] Rejected event from source: ${metadata.source}`)
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    // ── 4. Installment payments have their own reference format ───────────
    // (see lib/installments.ts: `${orderReferenceId}-INST-${n}`), so check
    // that table first — a hit here means this charge is one installment
    // toward a plan, not a full one-off order payment.
    const installmentPayment = await db.installmentPayment.findUnique({
      where: { reference: paymentReference },
      include: installmentPaymentWithPlanInclude,
    })

    if (installmentPayment) {
      return handleInstallmentCharge(installmentPayment, amountKobo, channel)
    }

    // ── 5. Otherwise, treat this as a normal one-off order payment ────────
    let order = await db.order.findUnique({
      where: { referenceId: paymentReference },
      include: { user: true, orderItems: true },
    })

    if (!order && metadata.orderId) {
      order = await db.order.findUnique({
        where: { id: metadata.orderId },
        include: { user: true, orderItems: true },
      })
    }

    if (!order) {
      console.warn(`[venix webhook] No order found for reference: ${paymentReference}`)
      console.error("[venix webhook] Orphaned payment:", {
        reference: paymentReference,
        amount: amountKobo / 100,
        channel,
        metadata,
        receivedAt: new Date().toISOString(),
      })
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    // ── 6. Already processed guard ───────────────────────────────────────
    if (order.status === "PAID") {
      console.log(`[venix webhook] Order ${order.id} already PAID — skipping`)
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    // ── 7. Amount verification (10 Naira tolerance) ──────────────────────
    const expectedKobo = Math.round(order.amount * 100)
    const diff = Math.abs(expectedKobo - amountKobo)

    if (diff > 1000) {
      console.warn(
        `[venix webhook] Amount mismatch for order ${order.id}. ` +
        `Expected: ${expectedKobo} kobo, Got: ${amountKobo} kobo`
      )
      await db.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      })
      return NextResponse.json({ error: "amount mismatch" }, { status: 400 })
    }

    // ── 8. Mark order as paid ────────────────────────────────────────────
    await db.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        deliveryStatus: "CONFIRMED",
        paidAt: new Date(),
        paymentProvider: "paystack",
        statusUpdates: {
          create: {
            status: "CONFIRMED",
            note: "Payment confirmed via webhook.",
          },
        },
      },
    })

    console.log(`[venix webhook] Order ${order.id} marked PAID (${order.user ? "user" : "guest"})`)

    // ── 9. Resolve customer identity for confirmation email ─────────────
    // order.userId may be set, but order.user could also be null if the
    // session was lost and only customerEmail was stored — fall back chain.
    const customerEmail = order.user?.email ?? order.customerEmail ?? null
    const customerName =
      order.user?.name ??
      order.customerName ??
      (order.customerEmail ? order.customerEmail.split("@")[0] : "Customer")
    const customerPhone = order.customerPhone ?? order.user?.phoneNumber ?? null

    // ── 10. Send confirmation emails (customer + admin) ──────────────────
    try {
      const emailItems: MailOrderItem[] = order.orderItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
        variant: item.imageColor && item.imageColor !== "Default" ? item.imageColor : undefined,
      }))

      await sendOrderEmails({
        customerName,
        customerEmail,
        customerPhone,
        orderReference: order.referenceId,
        items: emailItems,
        totalAmount: order.amount,
        paymentMethod: channel || "card",
        paymentReference,
      })

      console.log(`[venix webhook] Confirmation email sent for order ${order.id} to ${customerEmail}`)
    } catch (emailErr) {
      // Never fail the webhook over an email error — payment is already confirmed
      console.error(`[venix webhook] Email failed for order ${order.id}:`, emailErr)
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error("[venix webhook] Unhandled error:", err)
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}

// ── Installment charge handling ──────────────────────────────────────────
// Separated out because the amount check, "already processed" guard, and
// paid-in-full rollup are all scoped to one InstallmentPayment row rather
// than the whole order.
async function handleInstallmentCharge(
  installmentPayment: InstallmentPaymentWithPlan,
  amountKobo: number,
  channel: string
) {
  const { plan } = installmentPayment
  const order = plan.order

  // ── Already processed guard ────────────────────────────────────────────
  if (installmentPayment.status === "PAID") {
    console.log(
      `[venix webhook] Installment ${installmentPayment.installmentNo} of plan ${plan.id} already PAID — skipping`
    )
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  // ── Amount verification (10 Naira tolerance) ───────────────────────────
  const expectedKobo = Math.round(installmentPayment.amount * 100)
  const diff = Math.abs(expectedKobo - amountKobo)

  if (diff > 1000) {
    console.warn(
      `[venix webhook] Amount mismatch for installment ${installmentPayment.id}. ` +
      `Expected: ${expectedKobo} kobo, Got: ${amountKobo} kobo`
    )
    await db.installmentPayment.update({
      where: { id: installmentPayment.id },
      data: { status: "FAILED" },
    })
    return NextResponse.json({ error: "amount mismatch" }, { status: 400 })
  }

  // ── Mark this installment paid, roll the total up onto the plan ───────
  const newAmountPaid = plan.amountPaid + installmentPayment.amount
  const isPlanComplete = newAmountPaid >= plan.totalAmount - 1 // 1 Naira float slack

  await db.$transaction([
    db.installmentPayment.update({
      where: { id: installmentPayment.id },
      data: { status: "PAID", paidAt: new Date() },
    }),
    db.installmentPlan.update({
      where: { id: plan.id },
      data: {
        amountPaid: newAmountPaid,
        status: isPlanComplete ? "COMPLETED" : "ACTIVE",
      },
    }),
    // First installment confirms the order (goods can ship on a down
    // payment); the order only flips to fully PAID once the plan is done.
    db.order.update({
      where: { id: order.id },
      data: {
        status: isPlanComplete ? "PAID" : "PARTIALLY_PAID",
        deliveryStatus: order.deliveryStatus === "PENDING" ? "CONFIRMED" : order.deliveryStatus,
        paidAt: isPlanComplete ? new Date() : order.paidAt,
        paymentProvider: "paystack",
        statusUpdates: {
          create: {
            status: "CONFIRMED",
            note: isPlanComplete
              ? "Final installment received — order fully paid."
              : `Installment ${installmentPayment.installmentNo} of ${plan.numberOfInstallments} received.`,
          },
        },
      },
    }),
  ])

  console.log(
    `[venix webhook] Installment ${installmentPayment.installmentNo}/${plan.numberOfInstallments} ` +
    `for plan ${plan.id} marked PAID (order ${order.id}, complete: ${isPlanComplete})`
  )

  // ── Confirmation email — best-effort, never fails the webhook ─────────
  try {
    const customerEmail = order.user?.email ?? order.customerEmail ?? null
    const customerName =
      order.user?.name ??
      order.customerName ??
      (order.customerEmail ? order.customerEmail.split("@")[0] : "Customer")
    const customerPhone = order.customerPhone ?? order.user?.phoneNumber ?? null

    const emailItems: MailOrderItem[] = order.orderItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.quantity * item.price,
      variant: item.imageColor && item.imageColor !== "Default" ? item.imageColor : undefined,
    }))

    await sendOrderEmails({
      customerName,
      customerEmail,
      customerPhone,
      orderReference: order.referenceId,
      items: emailItems,
      totalAmount: installmentPayment.amount,
      paymentMethod: channel || "card",
      paymentReference: installmentPayment.reference,
    })
  } catch (emailErr) {
    console.error(`[venix webhook] Installment email failed for plan ${plan.id}:`, emailErr)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
