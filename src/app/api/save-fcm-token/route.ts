// app/api/save-fcm-token/route.ts
// Same dual-auth shape as app/api/addresses/route.ts: NextAuth session for
// the web app, Bearer mobile token for the Expo app. Push tokens only make
// sense for signed-in users, so unlike addresses there's no guest fallback.

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { verifyMobileToken } from "@/lib/verifyMobileToken"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

const VALID_PLATFORMS = new Set(["WEB", "ANDROID", "IOS"])

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
  const userId = await resolveUserId(req)
  if (!userId) {
    return NextResponse.json({ error: "Login required." }, { status: 401, headers: CORS })
  }

  const body = await req.json().catch(() => null) as { fcmToken?: string; platform?: string } | null
  const fcmToken = typeof body?.fcmToken === "string" ? body.fcmToken.trim() : ""
  const platformInput = typeof body?.platform === "string" ? body.platform.toUpperCase() : "WEB"
  const platform = VALID_PLATFORMS.has(platformInput) ? platformInput : "WEB"

  if (!fcmToken) {
    return NextResponse.json({ error: "fcmToken is required." }, { status: 400, headers: CORS })
  }

  // A token can move between accounts on a shared device (logout/login), so
  // upsert on the token itself rather than on (userId, token).
  await db.deviceToken.upsert({
    where: { token: fcmToken },
    update: { userId, platform: platform as never },
    create: { userId, token: fcmToken, platform: platform as never },
  })

  return NextResponse.json({ ok: true }, { headers: CORS })
}

// Used by the account screen's notification toggle to reflect DB truth on
// load, rather than just trusting a local flag — the token could have been
// pruned server-side (see sendPushToUser's dead-token cleanup) without the
// device knowing.
export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req)
  if (!userId) {
    return NextResponse.json({ error: "Login required." }, { status: 401, headers: CORS })
  }

  const fcmToken = req.nextUrl.searchParams.get("fcmToken")?.trim()
  if (!fcmToken) {
    return NextResponse.json({ error: "fcmToken query param is required." }, { status: 400, headers: CORS })
  }

  const existing = await db.deviceToken.findUnique({
    where: { token: fcmToken },
    select: { userId: true },
  })

  return NextResponse.json({ subscribed: existing?.userId === userId }, { headers: CORS })
}

// Removes this device's token — used when the user toggles notifications
// off. Note this can only stop pushes from being sent (deletes the DB row);
// it can't revoke the OS-level notification permission itself, since no app
// can do that programmatically. If the person re-enables the toggle later,
// permission is already granted so no system prompt reappears.
export async function DELETE(req: NextRequest) {
  const userId = await resolveUserId(req)
  if (!userId) {
    return NextResponse.json({ error: "Login required." }, { status: 401, headers: CORS })
  }

  const body = await req.json().catch(() => null) as { fcmToken?: string } | null
  const fcmToken = typeof body?.fcmToken === "string" ? body.fcmToken.trim() : ""
  if (!fcmToken) {
    return NextResponse.json({ error: "fcmToken is required." }, { status: 400, headers: CORS })
  }

  // Only delete if it actually belongs to this user — a token collision
  // across accounts shouldn't let one user delete another's row.
  await db.deviceToken.deleteMany({ where: { token: fcmToken, userId } })

  return NextResponse.json({ ok: true }, { headers: CORS })
}