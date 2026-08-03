import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

export const runtime = "nodejs"

const Schema = z.object({
  code: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ valid: false, message: "Enter a promo code" }, { status: 400 })
    }

    const code = parsed.data.code.trim().toUpperCase()

    const promo = await db.promoCode.findUnique({ where: { code } })

    if (!promo) {
      return NextResponse.json({ valid: false, message: "Invalid promo code" }, { status: 404 })
    }

    if (!promo.isActive) {
      return NextResponse.json({ valid: false, message: "Promo code is inactive" }, { status: 400 })
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, message: "Promo code has expired" }, { status: 400 })
    }

    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return NextResponse.json(
        { valid: false, message: "Promo code has reached its usage limit" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      code: promo.code,
      percentage: promo.percentage,
    })
  } catch (err) {
    console.error("[promo/validate]", err)
    return NextResponse.json({ valid: false, message: "Server error" }, { status: 500 })
  }
}
