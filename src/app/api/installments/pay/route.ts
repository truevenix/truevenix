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

type PayPayload = { planId?: string }

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Login required." }, { status: 401, headers: CORS })
    }

    const body = (await req.json().catch(() => null)) as PayPayload | null
    const planId = body?.planId?.trim()
    if (!planId) {
      return NextResponse.json({ error: "planId is required." }, { status: 400, headers: CORS })
    }

    const plan = await db.installmentPlan.findUnique({
      where: { id: planId },
      include: {
        payments: { orderBy: { installmentNo: "asc" } },
        order: { select: { id: true, customerEmail: true } },
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

    const nextPayment = plan.payments.find((p) => p.status !== "PAID")
    if (!nextPayment) {
      return NextResponse.json({ error: "No unpaid installment found on this plan." }, { status: 400, headers: CORS })
    }

    // Already has a live Paystack link from an earlier tap — reuse it
    // rather than opening a second transaction for the same installment.
    if (nextPayment.status === "PENDING" && nextPayment.paymentUrl) {
      return NextResponse.json({
        payment: {
          provider: "paystack",
          reference: nextPayment.reference,
          authorizationUrl: nextPayment.paymentUrl,
        },
        installmentNo: nextPayment.installmentNo,
      }, { headers: CORS })
    }

    const paystackSecret = process.env.PAYSTACK_SECRET
    if (!paystackSecret) {
      return NextResponse.json({ error: "Payments are not configured." }, { status: 500, headers: CORS })
    }

    const customerEmail = plan.user.email ?? plan.order.customerEmail

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
      installmentNo: nextPayment.installmentNo,
    }, { headers: CORS })
  } catch (err) {
    console.error("[installments/pay POST]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: CORS })
  }
}
