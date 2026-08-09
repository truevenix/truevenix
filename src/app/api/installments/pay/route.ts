// app/api/installments/pay/route.ts
//
// Initializes a fresh Paystack transaction for the next unpaid installment
// on a plan the caller owns. Used by the "Pay next installment" button on
// the profile page and by the Expo app. If the installment already has a
// live paymentUrl from a previous initialize call we hand that back
// instead of minting a new Paystack transaction on every tap.

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { verifyMobileToken } from "@/lib/verifyMobileToken"

export const runtime = "nodejs"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const session = await auth()
  if (session?.user?.id) return session.user.id

  const header = req.headers.get("Authorization")
  if (header?.startsWith("Bearer ")) {
    const payload = await verifyMobileToken(header.split(" ")[1])
    if (payload?.userId) return payload.userId
  }

  return null
}

type PayPayload = { planId?: string; mode?: "next" | "full" }

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Login required." }, { status: 401, headers: CORS })
    }

    const body = (await req.json().catch(() => null)) as PayPayload | null
    const planId = body?.planId?.trim()
    const mode: "next" | "full" = body?.mode === "full" ? "full" : "next"
    if (!planId) {
      return NextResponse.json({ error: "planId is required." }, { status: 400, headers: CORS })
    }

    const plan = await db.installmentPlan.findUnique({
      where: { id: planId },
      include: {
        payments: { orderBy: { installmentNo: "asc" } },
        order: { select: { id: true, referenceId: true, customerEmail: true } },
        user: { select: { email: true } },
      },
    })

    if (!plan || plan.userId !== userId) {
      // Same 404 whether it doesn't exist or belongs to someone else — don't
      // leak which plan IDs are real.
      return NextResponse.json({ error: "Plan not found." }, { status: 404, headers: CORS })
    }

    if (plan.status === "COMPLETED") {
      return NextResponse.json({ error: "This plan is already fully paid." }, { status: 400, headers: CORS })
    }
    if (plan.status === "CANCELLED") {
      return NextResponse.json({ error: "This plan has been cancelled." }, { status: 400, headers: CORS })
    }

    const unpaidPayments = plan.payments.filter((p) => p.status !== "PAID")
    if (unpaidPayments.length === 0) {
      return NextResponse.json({ error: "No unpaid installment found on this plan." }, { status: 400, headers: CORS })
    }

    const paystackSecret = process.env.PAYSTACK_SECRET
    if (!paystackSecret) {
      return NextResponse.json({ error: "Payments are not configured." }, { status: 500, headers: CORS })
    }

    const customerEmail = plan.user.email ?? plan.order.customerEmail

    // ── "Pay complete" — charge every remaining unpaid installment in one
    // go, so the shopper doesn't have to wait out the schedule to get their
    // order fully paid and moving. This branch never reuses a cached
    // paymentUrl (the remaining total changes the moment any installment
    // gets paid, next or full, so nothing here is safe to cache) and always
    // mints a fresh Paystack transaction with its own one-off reference.
    // The webhook recognizes it via `metadata.type === "installment_full"`
    // rather than a database lookup, since this reference never lives on an
    // InstallmentPayment row.
    if (mode === "full") {
      const remainingAmount = unpaidPayments.reduce((sum, p) => sum + p.amount, 0)
      const fullReference = `${plan.order.referenceId}-INST-ALL-${Date.now()}`

      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: Math.round(remainingAmount * 100),
          reference: fullReference,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?orderId=${plan.order.id}`,
          metadata: {
            source: "venix",
            orderId: plan.order.id,
            userId,
            type: "installment_full",
            installmentPlanId: plan.id,
            installmentPaymentIds: unpaidPayments.map((p) => p.id),
          },
        }),
      })

      const paymentData = await response.json()

      if (!response.ok || !paymentData.status) {
        return NextResponse.json(
          { error: paymentData.message || "Unable to initialize payment." },
          { status: 502, headers: CORS }
        )
      }

      return NextResponse.json({
        payment: {
          provider: "paystack",
          reference: paymentData.data.reference,
          authorizationUrl: paymentData.data.authorization_url,
          accessCode: paymentData.data.access_code,
        },
        mode: "full",
        remainingAmount,
        installmentsRemaining: unpaidPayments.length,
      }, { headers: CORS })
    }

    // ── "Pay next installment" — unchanged default behavior ────────────────
    const nextPayment = unpaidPayments[0]

    // Already has a live Paystack link from an earlier tap — reuse it
    // rather than opening a second transaction for the same installment.
    if (nextPayment.status === "PENDING" && nextPayment.paymentUrl) {
      return NextResponse.json({
        payment: {
          provider: "paystack",
          reference: nextPayment.reference,
          authorizationUrl: nextPayment.paymentUrl,
        },
        mode: "next",
        installmentNo: nextPayment.installmentNo,
      }, { headers: CORS })
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: customerEmail,
        amount: Math.round(nextPayment.amount * 100),
        reference: nextPayment.reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?orderId=${plan.order.id}`,
        metadata: {
          source: "venix",
          orderId: plan.order.id,
          userId,
          type: "installment",
          installmentPlanId: plan.id,
          installmentPaymentId: nextPayment.id,
          installmentNo: nextPayment.installmentNo,
        },
      }),
    })

    const paymentData = await response.json()

    if (!response.ok || !paymentData.status) {
      return NextResponse.json(
        { error: paymentData.message || "Unable to initialize payment." },
        { status: 502, headers: CORS }
      )
    }

    await db.installmentPayment.update({
      where: { id: nextPayment.id },
      data: { paymentUrl: paymentData.data.authorization_url },
    })

    return NextResponse.json({
      payment: {
        provider: "paystack",
        reference: paymentData.data.reference,
        authorizationUrl: paymentData.data.authorization_url,
        accessCode: paymentData.data.access_code,
      },
      mode: "next",
      installmentNo: nextPayment.installmentNo,
    }, { headers: CORS })
  } catch (err) {
    console.error("[installments/pay POST]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: CORS })
  }
}