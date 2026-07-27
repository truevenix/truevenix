import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

const POLL_ATTEMPTS = 6
const POLL_DELAY_MS = 1500

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference")
  const orderId = req.nextUrl.searchParams.get("orderId")

  if (!reference) {
    return NextResponse.json({ success: false, reason: "missing_reference" })
  }

  try {
    // ── 1. Poll DB first (webhook may already have updated the order) ──────────
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      const order = await findOrder(reference, orderId ?? undefined)

      if (order?.status === "SUCCESS") {
        return NextResponse.json({ success: true, orderId: order.id })
      }

      if (order?.status === "FAILED") {
        return NextResponse.json({ success: false, reason: "order_failed" })
      }

      // Order still PENDING — wait before next poll
      if (attempt < POLL_ATTEMPTS - 1) {
        await sleep(POLL_DELAY_MS)
      }
    }

    // ── 2. DB still shows PENDING — verify directly with Paystack ─────────────
    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) {
      console.error("[verify-payment] PAYSTACK_SECRET_KEY missing")
      return NextResponse.json({ success: false, reason: "server_misconfigured" })
    }

    const psRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
        cache: "no-store",
      }
    )

    if (!psRes.ok) {
      console.error("[verify-payment] Paystack API error:", psRes.status, await psRes.text())
      return NextResponse.json({ success: false, reason: "paystack_error" })
    }

    const psData = await psRes.json()
    console.log("[verify-payment] Paystack verify status:", psData?.data?.status)

    if (psData?.data?.status !== "success") {
      return NextResponse.json({ success: false, reason: "paystack_not_success" })
    }

    // ── 3. Paystack confirmed — update order ourselves (webhook was late) ──────
    const order = await findOrder(reference, orderId ?? undefined)

    if (!order) {
      console.warn("[verify-payment] No order found for reference:", reference)
      return NextResponse.json({ success: false, reason: "order_not_found" })
    }

    if (order.status !== "SUCCESS") {
      await db.order.update({
        where: { id: order.id },
        data: { status: "SUCCESS", deliveryStatus: "CONFIRMED" },
      })
    }

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (err) {
    console.error("[verify-payment] Unexpected error:", err)
    return NextResponse.json({ success: false, reason: "server_error" })
  }
}

async function findOrder(reference: string, orderId?: string) {
  let order = await db.order.findUnique({ where: { referenceId: reference } })
  if (!order && orderId) {
    order = await db.order.findUnique({ where: { id: orderId } })
  }
  return order
}