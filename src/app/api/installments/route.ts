// app/api/installments/route.ts
//
// Lists the current user's installment plans, most recent first, for the
// "Installment Payments" section on the profile page. Same dual-auth shape
// as /api/addresses and /api/save-fcm-token: NextAuth session for the web
// app, Bearer mobile token for the Expo app — installments are account-only
// so there's no guest fallback here.

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

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Login required." }, { status: 401, headers: CORS })
    }

    const plans = await db.installmentPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
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

    // Shape the response around "how much has this person paid so far for
    // this particular goods" — that's the whole point of the feature — plus
    // whichever installment is next in line so the profile page / app can
    // put a single "Pay next installment" button in front of the user.
    const result = plans.map((plan) => {
      const nextPayment = plan.payments.find((p) => p.status !== "PAID") ?? null
      const paidCount = plan.payments.filter((p) => p.status === "PAID").length

      return {
        id: plan.id,
        status: plan.status,
        totalAmount: plan.totalAmount,
        amountPaid: plan.amountPaid,
        amountRemaining: Math.max(plan.totalAmount - plan.amountPaid, 0),
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
      }
    })

    return NextResponse.json({ success: true, plans: result }, { headers: CORS })
  } catch (err) {
    console.error("[installments GET]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: CORS })
  }
}
