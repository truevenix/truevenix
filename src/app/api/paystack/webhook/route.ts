// app/api/paystack/webhook/route.ts

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"
import { sendOrderEmails, type OrderItem as MailOrderItem } from "@/lib/mail"

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

    // ── 4. Find the order ────────────────────────────────────────────────
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

    // ── 5. Already processed guard ───────────────────────────────────────
    if (order.status === "PAID") {
      console.log(`[venix webhook] Order ${order.id} already PAID — skipping`)
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    // ── 6. Amount verification (10 Naira tolerance) ──────────────────────
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

    // ── 7. Mark order as paid ────────────────────────────────────────────
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

    // ── 8. Resolve customer identity for confirmation email ─────────────
    // order.userId may be set, but order.user could also be null if the
    // session was lost and only customerEmail was stored — fall back chain.
    const customerEmail = order.user?.email ?? order.customerEmail ?? null
    const customerName =
      order.user?.name ??
      order.customerName ??
      (order.customerEmail ? order.customerEmail.split("@")[0] : "Customer")
    const customerPhone = order.customerPhone ?? order.user?.phoneNumber ?? null

    // ── 9. Send confirmation emails (customer + admin) ──────────────────
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