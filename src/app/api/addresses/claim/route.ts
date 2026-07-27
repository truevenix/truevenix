//src/app/api/addresses/claim/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { verifyMobileToken } from "@/lib/verifyMobileToken"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
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

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS })
    }

    // Prefer the authenticated user's own email — never trust a client-supplied
    // guestEmail here, or one account could claim another email's addresses.
    const user = await db.user.findUnique({
      where:  { id: userId },
      select: { email: true },
    })

    if (!user?.email) {
      return NextResponse.json({ success: true, claimed: 0 }, { headers: CORS })
    }

    const email = user.email.toLowerCase().trim()

    const orphaned = await db.address.findMany({
      where: { guestEmail: email, userId: null },
      select: { id: true, isDefault: true },
    })

    if (orphaned.length === 0) {
      return NextResponse.json({ success: true, claimed: 0 }, { headers: CORS })
    }

    // If the account already has a default address, don't let a claimed
    // guest address silently override it — demote incoming defaults instead.
    const hasExistingDefault = await db.address.findFirst({
      where:  { userId, isDefault: true },
      select: { id: true },
    })

    await db.$transaction(
      orphaned.map((addr) =>
        db.address.update({
          where: { id: addr.id },
          data: {
            userId,
            guestEmail: null,
            isDefault: hasExistingDefault ? false : addr.isDefault,
          },
        })
      )
    )

    return NextResponse.json({ success: true, claimed: orphaned.length }, { headers: CORS })
  } catch (err) {
    console.error("[addresses/claim POST]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: CORS })
  }
}