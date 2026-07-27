import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { verifyMobileToken } from "@/lib/verifyMobileToken"

const UpdateSchema = z.object({
  label:            z.string().optional(),
  fullName:         z.string().min(1).optional(),
  phoneNumber:      z.string().optional(),
  state:            z.string().min(1).optional(),
  lga:              z.string().min(1).optional(),
  town:             z.string().min(1).optional(),
  street:           z.string().optional(),
  isDefault:        z.boolean().optional(),
  latitude:         z.number().optional(),
  longitude:        z.number().optional(),
  formattedAddress: z.string().optional(),
  placeId:          z.string().optional(),
  guestEmail:       z.string().email().optional(),
})

type Identity =
  | { kind: "user";  userId:     string }
  | { kind: "guest"; guestEmail: string }
  | null

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

async function resolveAddressScope(identity: Identity): Promise<AddressScope> {
  if (!identity) return { guestEmail: "" }
  if (identity.kind === "user") return { userId: identity.userId }

  const existingUser = await db.user.findUnique({
    where:  { email: identity.guestEmail },
    select: { id: true },
  })

  return existingUser
    ? { userId: existingUser.id }
    : { guestEmail: identity.guestEmail }
}

async function findOwnedAddress(id: string, scope: AddressScope) {
  return db.address.findFirst({ where: { id, ...scope } })
}

// PATCH /api/addresses/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body     = await req.json()
    const identity = await resolveIdentity(req, body)
    if (!identity) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id }  = await params
    const scope   = await resolveAddressScope(identity)
    const existing = await findOwnedAddress(id, scope)
    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { guestEmail: _ignored, ...data } = parsed.data

    if (data.isDefault) {
      await db.address.updateMany({ where: scope, data: { isDefault: false } })
    }

    const updated = await db.address.update({ where: { id }, data })

    return NextResponse.json({ success: true, address: updated })
  } catch (err) {
    console.error("[addresses PATCH]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// DELETE /api/addresses/[id]  — guest email via ?guestEmail= query param
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await resolveIdentity(req)
    if (!identity) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id }   = await params
    const scope    = await resolveAddressScope(identity)
    const existing = await findOwnedAddress(id, scope)
    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    await db.address.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[addresses DELETE]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}