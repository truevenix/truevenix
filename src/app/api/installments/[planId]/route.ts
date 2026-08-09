// app/api/installments/[planId]/route.ts
//
// Fetches one installment plan in full — every installment's amount, status
// and paid date, plus the underlying order — for the "Installment Details"
// page. Same shape as the list endpoint's per-plan object, just scoped to
// one plan instead of returning all of them.

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { verifyMobileToken } from "@/lib/verifyMobileToken"

export const runtime = "nodejs"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const userId = await resolveUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Login required." }, { status: 401, headers: CORS })
    }

    const { planId } = await params

    const plan = await db.installmentPlan.findUnique({
      where: { id: planId },
      include: {
        payments: { orderBy: { installmentNo: "asc" } },
        order: {
          select: {
            id: true,
            referenceId: true,
            createDate: true,
            deliveryStatus: true,
            orderItems: {
              select: {
                id: true, name: true, quantity: true, price: true,
                imageUrl: true, imageColor: true, imageColorCode: true,
              },
            },
          },
        },
      },
    })

    if (!plan || plan.userId !== userId) {
      // Same 404 whether it doesn't exist or belongs to someone else — don't
      // leak which plan IDs are real.
      return NextResponse.json({ error: "Plan not found." }, { status: 404, headers: CORS })
    }

    const nextPayment = plan.payments.find((p) => p.status !== "PAID") ?? null
    const paidCount = plan.payments.filter((p) => p.status === "PAID").length
    const amountRemaining = Math.max(plan.totalAmount - plan.amountPaid, 0)

    return NextResponse.json({
      success: true,
      plan: {
        id: plan.id,
        status: plan.status,
        totalAmount: plan.totalAmount,
        amountPaid: plan.amountPaid,
        amountRemaining,
        numberOfInstallments: plan.numberOfInstallments,
        installmentsPaid: paidCount,
        installmentAmount: plan.installmentAmount,
        createdAt: plan.createdAt,
        order: {
          id: plan.order.id,
          referenceId: plan.order.referenceId,
          createDate: plan.order.createDate,
          deliveryStatus: plan.order.deliveryStatus,
          items: plan.order.orderItems,
        },
        payments: plan.payments.map((p) => ({
          id: p.id,
          installmentNo: p.installmentNo,
          amount: p.amount,
          status: p.status,
          paidAt: p.paidAt,
        })),
        nextPayment: nextPayment && {
          id: nextPayment.id,
          installmentNo: nextPayment.installmentNo,
          amount: nextPayment.amount,
          paymentUrl: nextPayment.paymentUrl,
        },
      },
    }, { headers: CORS })
  } catch (err) {
    console.error("[installments/[planId] GET]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: CORS })
  }
}