import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { verifyMobileToken } from "@/lib/verifyMobileToken"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

type Identity =
  | { kind: "user";  userId:     string }
  | { kind: "guest"; guestEmail: string }
  | null

// ── Scope is what we actually query Prisma with ──────────────────────────────
type AddressScope =
  | { userId: string;     guestEmail?: never }
  | { guestEmail: string; userId?: never }

async function resolveIdentity(req: NextRequest, body?: Record<string, unknown>): Promise<Identity> {
  const session = await auth()
  if (session?.user?.id) return { kind: "user", userId: session.user.id }

  const header = req.headers.get("Authorization")
  if (header?.startsWith("Bearer ")) {
    const payload = await verifyMobileToken(header.split(" ")[1])
    if (payload?.userId) return { kind: "user", userId: payload.userId }
  }

  const guestEmail =
    req.nextUrl.searchParams.get("guestEmail") ??
    (typeof body?.guestEmail === "string" ? body.guestEmail : null)

  if (guestEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
    return { kind: "guest", guestEmail: guestEmail.trim().toLowerCase() }
  }

  return null
}

// ── If the guest email belongs to a real account, resolve to that userId ─────
// Returns the scope AND whether we promoted a guest email to a real userId.
async function resolveAddressScope(
  identity: Identity,
): Promise<{ scope: AddressScope; userFound: boolean }> {
  if (!identity) return { scope: { guestEmail: "" }, userFound: false } // unreachable — callers guard

  if (identity.kind === "user") {
    return { scope: { userId: identity.userId }, userFound: false }
  }

  // Guest path: check if this email already has an account
  const existingUser = await db.user.findUnique({
    where:  { email: identity.guestEmail },
    select: { id: true },
  })

  if (existingUser) {
    return { scope: { userId: existingUser.id }, userFound: true }
  }

  return { scope: { guestEmail: identity.guestEmail }, userFound: false }
}

const AddressSchema = z.object({
  label:            z.string().optional(),
  fullName:         z.string().min(1, "Full name is required"),
  phoneNumber:      z.string().optional(),
  state:            z.string().min(1, "State is required"),
  lga:              z.string().min(1, "LGA is required"),
  town:             z.string().min(1, "Town is required"),
  street:           z.string().optional(),
  isDefault:        z.boolean().optional().default(false),
  latitude:         z.number().optional(),
  longitude:        z.number().optional(),
  formattedAddress: z.string().optional(),
  placeId:          z.string().optional(),
  guestEmail:       z.string().email().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const identity = await resolveIdentity(req)
    if (!identity) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS })
    }

    const { scope, userFound } = await resolveAddressScope(identity)

    const addresses = await db.address.findMany({
      where:   scope,
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      select: {
        id: true, label: true, fullName: true, phoneNumber: true,
        state: true, lga: true, town: true, street: true,
        isDefault: true, createdAt: true,
      },
    })

    // userFound tells the checkout page to show an "account found" banner
    return NextResponse.json({ success: true, addresses, userFound }, { headers: CORS })
  } catch (err) {
    console.error("[addresses GET]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: CORS })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body     = await req.json()
    const identity = await resolveIdentity(req, body)
    if (!identity) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: CORS })
    }

    const parsed = AddressSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400, headers: CORS })
    }

    const { guestEmail: _ignored, ...data } = parsed.data

    const { scope } = await resolveAddressScope(identity)

    if (data.isDefault) {
      await db.address.updateMany({ where: scope, data: { isDefault: false } })
    }

    const address = await db.address.create({ data: { ...data, ...scope } })

    return NextResponse.json({ success: true, address }, { status: 201, headers: CORS })
  } catch (err) {
    console.error("[addresses POST]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: CORS })
  }
}