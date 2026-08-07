//src/app/v1/[[...route]]/route.tsx
import { Hono } from "hono"
import { handle } from "hono/vercel"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { sendPushToUser, uploadBase64Image } from "@/lib/firebase-admin"
import {
  DELIVERY_STATUS_VALUES,
  deliveryStatusMessage,
  type DeliveryStatusValue,
} from "@/lib/delivery-status"

export const runtime = "nodejs"

type ProductImageInput = {
  color?: string
  colorCode?: string
  image?: string
}
type SizeOptionInput = {
  label?: string
  name?:  string
  price?: number
  imageUrl?: string
  isDefault?: boolean
}
type ProductPayload = {
  name?: string
  description?: string
  descriptionP2?: string
  descriptionP3?: string
  price?: number
  originalPrice?: number | null
  brand?: string | null
  category?: string
  subCategory?: string | null
  inStock?: boolean
  stockCount?: number
  badge?: string | null
  isFeatured?: boolean
  warranty?: string | null
  specifications?: unknown
  keyFeatures?: unknown
  images?: ProductImageInput[]
  sizeOptions?: SizeOptionInput[]
}

const PRODUCT_CATEGORIES = new Set([
  "GADGETS",
  "SOLAR",
  "ELECTRONICS",
  "PHONES",
  "COMPUTERS",
  "MACHINERY",
])

// Delivery statuses are validated against this set wherever an admin submits one
const DELIVERY_STATUS_SET = new Set<string>(DELIVERY_STATUS_VALUES)

type AdminOrderUpdatePayload = {
  deliveryStatus?: string | null   // one of DELIVERY_STATUS_VALUES — omit to leave unchanged
  statusNote?: string | null       // optional note attached to the status-history entry
  timelineTitle?: string | null    // e.g. "Reached Kaduna" — omit to skip adding a timeline update
  timelineNote?: string | null     // optional extra detail for the timeline update
  notify?: boolean                 // defaults to true — set false to skip the push notification
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}
function cleanKeyFeatures(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
}

function cleanSizeOptions(value: unknown) {
  if (!Array.isArray(value)) return []

  const results: {
    label:     string
    name:      string
    price:     number
    imageUrl:  string | null
    isDefault: boolean
  }[] = []

  for (const option of value) {
    const label     = cleanOptionalText((option as SizeOptionInput)?.label) ?? ""
    const name      = cleanText((option as SizeOptionInput)?.name)
    const price     = cleanMoney((option as SizeOptionInput)?.price)
    const imageUrl  = cleanOptionalText((option as SizeOptionInput)?.imageUrl)
    const isDefault = Boolean((option as SizeOptionInput)?.isDefault)

    if (name && price !== null) {
      results.push({ label, name, price, imageUrl, isDefault })
    }
  }

  return results
}

function cleanMoney(value: unknown) {
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : null
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function cleanOptionalText(value: unknown) {
  const text = cleanText(value)
  return text ? text : null
}

function cleanProductCategory(value: unknown) {
  const category = cleanText(value).toUpperCase()
  return PRODUCT_CATEGORIES.has(category) ? category : null
}

function cleanImages(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((image) => ({
      color: cleanOptionalText((image as ProductImageInput)?.color) ?? "Default",
      colorCode: cleanOptionalText((image as ProductImageInput)?.colorCode) ?? "#475569",
      image: cleanText((image as ProductImageInput)?.image),
    }))
    .filter((image) => image.image)
}

async function requireAdmin() {
  const session = await auth().catch(() => null)
  return session?.user?.role === "ADMIN" ? session : null
}

async function requireSession() {
  const session = await auth().catch(() => null)
  return session?.user?.id ? session : null
}

async function requireUserId() {
  const session = await requireSession()
  return session?.user?.id ?? null
}

function normalizeProductPayload(body: ProductPayload | null, partial = false) {
  if (!body || typeof body !== "object") {
    return { error: "Product payload is required." }
  }

  const name = cleanText(body.name)
  const description = cleanText(body.description)
  const descriptionP2 = cleanOptionalText(body.descriptionP2)
  const descriptionP3 = cleanOptionalText(body.descriptionP3)
  const price = cleanMoney(body.price)
  const originalPrice =
    body.originalPrice === null || body.originalPrice === undefined
      ? null
      : cleanMoney(body.originalPrice)
  const category = cleanProductCategory(body.category)
  const stockCount = Number(body.stockCount)
  const images = cleanImages(body.images)

  if (!partial || name) {
    if (!name) return { error: "Product name is required." }
  }

  if (!partial || description) {
    if (!description) return { error: "Product description is required." }
  }

  if (!partial || body.price !== undefined) {
    if (price === null) return { error: "A valid product price is required." }
  }

  if (!partial || body.category !== undefined) {
    if (!category) return { error: "Choose a valid truevenix product category." }
  }

  if (!partial || body.images !== undefined) {
    if (images.length === 0) return { error: "Add at least one product image." }
  }

  if (body.originalPrice !== null && body.originalPrice !== undefined && originalPrice === null) {
    return { error: "Original price must be a valid amount." }
  }

  return {
    data: {
      ...(name ? { name } : {}),
      ...(description ? { description } : {}),
      ...(price !== null ? { price } : {}),
      ...(body.originalPrice !== undefined ? { originalPrice } : {}),
      ...(body.brand !== undefined ? { brand: cleanOptionalText(body.brand) } : {}),
      ...(category ? { category: category as never } : {}),
      ...(body.subCategory !== undefined ? { subCategory: cleanOptionalText(body.subCategory) } : {}),
      ...(body.inStock !== undefined ? { inStock: Boolean(body.inStock) } : {}),
      ...(body.stockCount !== undefined
        ? { stockCount: Number.isFinite(stockCount) ? Math.max(0, Math.floor(stockCount)) : 0 }
        : {}),
      ...(body.badge !== undefined ? { badge: cleanOptionalText(body.badge) } : {}),
      ...(body.isFeatured !== undefined ? { isFeatured: Boolean(body.isFeatured) } : {}),
      ...(body.warranty !== undefined ? { warranty: cleanOptionalText(body.warranty) } : {}),
      ...(body.specifications !== undefined ? { specifications: body.specifications as never } : {}),
      ...(body.keyFeatures !== undefined ? { keyFeatures: cleanKeyFeatures(body.keyFeatures) } : {}),
      ...(body.sizeOptions  !== undefined ? { sizeOptions:  cleanSizeOptions(body.sizeOptions) } : {}),
      ...(body.descriptionP2 !== undefined ? { descriptionP2 } : {}),
      ...(body.descriptionP3 !== undefined ? { descriptionP3 } : {}),
      ...(body.images !== undefined ? { images } : {}),
    },
  }
}

const productSelect = {
  id: true,
  name: true,
  description: true,
  descriptionP2: true,
  descriptionP3: true,
  price: true,
  originalPrice: true,
  category: true,
  subCategory: true,
  brand: true,
  inStock: true,
  stockCount: true,
  badge: true,
  isFeatured: true,
  warranty: true,
  specifications: true,
  keyFeatures: true,
  images: {
    select: { id: true, color: true, colorCode: true, image: true },
  },
  sizeOptions: {
    select:  { id: true, label: true, name: true, price: true, imageUrl: true, isDefault: true },
    orderBy: [{ isDefault: "desc" as const }, { price: "asc" as const }],
  },
}

const orderInclude = {
  orderItems: true,
  // Delivery-status history (Placed / Confirmed / Shipped / Delivered / Cancelled).
  // Driven automatically by the Paystack webhook and by admin status changes.
  statusUpdates: {
    orderBy: { createdAt: "desc" as const },
  },
  // Free-text shipping updates, independent of deliveryStatus — e.g. "Reached Kaduna".
  // Added only by admins from the dashboard, shown to the customer on their order page.
  timeline: {
    orderBy: { createdAt: "desc" as const },
  },
   // Only present when this order was placed with "Pay in installments" —
  // null for every other order. Carries the full payment-by-payment
  // breakdown so both the customer order page and the admin order view can
  // render a timeline of what's been paid and what's still outstanding.
  installmentPlan: {
    include: {
      payments: { orderBy: { installmentNo: "asc" as const } },
    },
  },
} as const

// Same shape as orderInclude, plus the linked user id/name/email so the admin
// endpoints can target a push notification without a second query.
const orderAdminInclude = {
  ...orderInclude,
  user: {
    select: { id: true, name: true, email: true },
  },
} as const

const app = new Hono().basePath("/api/v1")

// ─── health

app.get("/health", (c) => c.json({ ok: true, service: "truevenix-api" }))

// --profile
app.post("/profile/avatar", async (c) => {
  const userId = await requireUserId()
  if (!userId) return c.json({ error: "Login required." }, 401)

  const body = (await c.req.json().catch(() => null)) as
    | { imageUrl?: string; base64?: string; contentType?: string }
    | null

  // Web already uploaded directly to Firebase Storage client-side (same
  // uploadBytesResumable + getDownloadURL pattern as every other image in
  // the app — see src/lib/upload.tsx) and just needs the URL persisted.
  const providedUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : ""

  // Mobile has no browser File object, so it sends base64 instead and this
  // route uploads it server-side via firebase-admin (see uploadBase64Image).
  const base64 = typeof body?.base64 === "string" ? body.base64 : ""
  const contentType = typeof body?.contentType === "string" ? body.contentType : ""

  let imageUrl: string
  if (providedUrl) {
    imageUrl = providedUrl
  } else if (base64 && contentType) {
    try {
      imageUrl = await uploadBase64Image(base64, contentType, "profile")
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : "Upload failed." }, 400)
    }
  } else {
    return c.json({ error: "Provide either imageUrl, or base64 and contentType." }, 400)
  }

  const user = await db.user.update({
    where: { id: userId },
    data: { image: imageUrl },
    select: {
      id: true, name: true, username: true, email: true, image: true,
      role: true, phoneNumber: true, onboarded: true,
      isTwoFactorEnabled: true, emailVerified: true,
    },
  })

  return c.json({ user: { ...user, emailVerified: user.emailVerified?.toISOString() ?? null } })
})

// ─── products 

app.get("/products", async (c) => {
  const query = c.req.query("q")?.trim()
  const category = c.req.query("category")?.trim().toUpperCase()
  const brand = c.req.query("brand")?.trim()
  const badge = c.req.query("badge")?.trim()
  const inStock = c.req.query("inStock")
  const minPrice = Number(c.req.query("minPrice"))
  const maxPrice = Number(c.req.query("maxPrice"))
  const page = Math.max(Number(c.req.query("page")) || 1, 1)
  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 20, 1), 60)
  const sortBy = c.req.query("sortBy")
  const sortOrder = c.req.query("sortOrder") === "asc" ? "asc" : "desc"
  const skip = (page - 1) * limit

  const orderBy =
    sortBy === "price" || sortBy === "name" || sortBy === "createdAt"
      ? { [sortBy]: sortOrder }
      : { createdAt: "desc" as const }

  const where = {
    ...(category && category !== "ALL" ? { category: category as never } : {}),
    ...(brand ? { brand: { equals: brand, mode: "insensitive" as const } } : {}),
    ...(badge ? { badge: { equals: badge, mode: "insensitive" as const } } : {}),
    ...(inStock === "true" ? { inStock: true } : {}),
    ...(inStock === "false" ? { inStock: false } : {}),
    ...(Number.isFinite(minPrice) || Number.isFinite(maxPrice)
      ? {
          price: {
            ...(Number.isFinite(minPrice) ? { gte: minPrice } : {}),
            ...(Number.isFinite(maxPrice) ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } },
            { brand: { contains: query, mode: "insensitive" as const } },
            { subCategory: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      select: productSelect,
      orderBy: [{ isFeatured: "desc" }, orderBy],
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ])

  return c.json({
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(Math.ceil(total / limit), 1),
    },
  })
})

app.get("/products/:id", async (c) => {
  const product = await db.product.findUnique({
    where: { id: c.req.param("id") },
    select: productSelect,
  })

  if (!product) {
    return c.json({ error: "Product not found" }, 404)
  }

  return c.json({ product })
})

app.get("/products/:id/related", async (c) => {
  const productId = c.req.param("id")
  const category = c.req.query("category")?.trim().toUpperCase()
  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 10, 1), 20)

  const product = category
    ? null
    : await db.product.findUnique({
        where: { id: productId },
        select: { category: true },
      })

  const relatedCategory = category || product?.category

  const products = await db.product.findMany({
    where: {
      id: { not: productId },
      ...(relatedCategory ? { category: relatedCategory as never } : {}),
      inStock: true,
    },
    select: productSelect,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
  })

  return c.json({ products })
})

app.post("/products", async (c) => {
  const admin = await requireAdmin()

  if (!admin) {
    return c.json({ error: "Admin access is required." }, 403)
  }

  const body = (await c.req.json().catch(() => null)) as ProductPayload | null
  const normalized = normalizeProductPayload(body)

  if ("error" in normalized) {
    return c.json({ error: normalized.error }, 400)
  }

  const data = normalized.data

  const product = await db.product.create({
    data: {
      name: data.name!,
      description: data.description!,
      descriptionP2: data.descriptionP2 ?? null,
      descriptionP3: data.descriptionP3 ?? null,
      price: data.price!,
      originalPrice: data.originalPrice ?? null,
      brand: data.brand ?? null,
      category: data.category!,
      subCategory: data.subCategory ?? null,
      inStock: data.inStock ?? true,
      stockCount: data.stockCount ?? 0,
      badge: data.badge ?? null,
      isFeatured: data.isFeatured ?? false,
      warranty: data.warranty ?? null,
      ...(data.specifications !== undefined ? { specifications: data.specifications } : {}),
      ...(data.keyFeatures !== undefined ? { keyFeatures: data.keyFeatures } : {}),
      images: {
        create: data.images!,
      },
      ...(data.sizeOptions?.length
        ? { sizeOptions: { create: data.sizeOptions } }
        : {}),
    },
    select: productSelect,
  })

  return c.json({ product }, 201)
})

app.patch("/products/:id", async (c) => {
  const admin = await requireAdmin()

  if (!admin) {
    return c.json({ error: "Admin access is required." }, 403)
  }

  const body = (await c.req.json().catch(() => null)) as ProductPayload | null
  const normalized = normalizeProductPayload(body, true)

  if ("error" in normalized) {
    return c.json({ error: normalized.error }, 400)
  }

  const { images, sizeOptions, ...productData } = normalized.data

  const existing = await db.product.findUnique({
    where: { id: c.req.param("id") },
    select: { id: true },
  })

  if (!existing) {
    return c.json({ error: "Product not found." }, 404)
  }

  const product = await db.product.update({
    where: { id: existing.id },
    data: {
      ...productData,
      ...(images
        ? {
            images: {
              deleteMany: {},
              create: images,
            },
          }
        : {}),
      ...(sizeOptions !== undefined
        ? { sizeOptions: { deleteMany: {}, create: sizeOptions } }
        : {}),
    },
    select: productSelect,
  })

  return c.json({ product })
})

app.delete("/products/:id", async (c) => {
  const admin = await requireAdmin()

  if (!admin) {
    return c.json({ error: "Admin access is required." }, 403)
  }

  const existing = await db.product.findUnique({
    where: { id: c.req.param("id") },
    select: { id: true, name: true },
  })

  if (!existing) {
    return c.json({ error: "Product not found." }, 404)
  }

  try {
    await db.product.delete({ where: { id: existing.id } })
  } catch {
    return c.json({ error: "This product is linked to orders and cannot be deleted." }, 409)
  }

  return c.json({ ok: true, product: existing })
})

// ─── orders ────────────────────────────────────────────────────────────────

app.get("/orders", async (c) => {
  const email = c.req.query("email")

  if (!email) {
    return c.json({ error: "Email is required." }, 400)
  }

  const orders = await db.order.findMany({
    where: { customerEmail: normalizeEmail(email) },
    include: orderInclude,
    orderBy: { createDate: "desc" },
  })

  return c.json({ orders })
})

app.get("/orders/:referenceId", async (c) => {
  const email = c.req.query("email")

  if (!email) {
    return c.json({ error: "Email is required." }, 400)
  }

  const order = await db.order.findFirst({
    where: {
      referenceId: c.req.param("referenceId"),
      customerEmail: normalizeEmail(email),
    },
    include: orderInclude,
  })

  if (!order) {
    return c.json({ error: "Order not found for that email." }, 404)
  }

  return c.json({ order })
})

// ─── admin: orders ─────────────────────────────────────────────────────────
// Powers the "Update order" action on the admin dashboard: change the
// delivery status, add a free-text timeline update (or both at once), and
// optionally push-notify the customer's registered devices.

app.get("/admin/orders/:id", async (c) => {
  const session = await requireAdmin()
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const order = await db.order.findUnique({
    where: { id: c.req.param("id") },
    include: orderAdminInclude,
  })
  if (!order) return c.json({ error: "Order not found." }, 404)

  return c.json({ order })
})

app.patch("/admin/orders/:id", async (c) => {
  const session = await requireAdmin()
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  const body = (await c.req.json().catch(() => null)) as AdminOrderUpdatePayload | null
  if (!body || typeof body !== "object") {
    return c.json({ error: "Payload is required." }, 400)
  }

  const orderId = c.req.param("id")
  const existing = await db.order.findUnique({ where: { id: orderId } })
  if (!existing) return c.json({ error: "Order not found." }, 404)

  const requestedStatus = cleanOptionalText(body.deliveryStatus)?.toUpperCase() ?? null
  const validStatus = requestedStatus && DELIVERY_STATUS_SET.has(requestedStatus)
    ? (requestedStatus as DeliveryStatusValue)
    : null
  const statusChanged = Boolean(validStatus) && validStatus !== existing.deliveryStatus
  const statusNote = cleanOptionalText(body.statusNote)

  const timelineTitle = cleanOptionalText(body.timelineTitle)
  const timelineNote = cleanOptionalText(body.timelineNote)

  if (!statusChanged && !timelineTitle) {
    return c.json(
      { error: "Nothing to update — change the delivery status or add a timeline update." },
      400
    )
  }

  const order = await db.order.update({
    where: { id: orderId },
    data: {
      ...(statusChanged ? { deliveryStatus: validStatus as never } : {}),
      ...(statusChanged
        ? { statusUpdates: { create: { status: validStatus as never, note: statusNote } } }
        : {}),
      ...(timelineTitle
        ? { timeline: { create: { title: timelineTitle, note: timelineNote } } }
        : {}),
    },
    include: orderAdminInclude,
  })

  // ── Push notification ────────────────────────────────────────────────
  // Only registered users have device tokens — guest checkouts fall back to
  // the order-status emails already sent elsewhere, so we skip silently.
  let push: { sent: number; failed: number } | null = null
  const shouldNotify = body.notify !== false && Boolean(order.userId)

  if (shouldNotify && order.userId) {
    const messageParts: string[] = []
    if (statusChanged) messageParts.push(deliveryStatusMessage(validStatus as DeliveryStatusValue))
    if (timelineTitle) messageParts.push(timelineTitle)

    try {
      push = await sendPushToUser(order.userId, {
        title: `Order ${order.referenceId}`,
        body: messageParts.join(" · "),
        data: {
          orderId: order.id,
          referenceId: order.referenceId,
          link: `/orders/${order.referenceId}`,
        },
      })
    } catch (err) {
      console.error("[venix admin] push notification failed:", err)
    }
  }

  return c.json({ order, push })
})

// ─── payments ──────────────────────────────────────────────────────────────

app.get("/payments/verify/:referenceId", async (c) => {
  const referenceId = c.req.param("referenceId")
  const paystackSecret = process.env.PAYSTACK_SECRET

  const order = await db.order.findUnique({
    where: { referenceId },
    include: orderInclude,
  })

  if (!order) {
    return c.json({ error: "Order not found." }, 404)
  }

  if (!paystackSecret) {
    return c.json({ order, payment: { provider: "manual", verified: false } })
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${referenceId}`, {
    headers: { Authorization: `Bearer ${paystackSecret}` },
  })
  const paymentData = await response.json()
  const paid = Boolean(response.ok && paymentData.status && paymentData.data?.status === "success")

  const updatedOrder = paid
    ? await db.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          deliveryStatus: "CONFIRMED",
          paidAt: new Date(),
          statusUpdates: {
            create: {
              status: "CONFIRMED",
              note: "Payment confirmed.",
            },
          },
        },
        include: orderInclude,
      })
    : order

  return c.json({ order: updatedOrder, payment: { provider: "paystack", verified: paid } })
})

// ─── brands ────────────────────────────────────────────────────────────────

app.get("/brands", async (c) => {
  const brands = await db.product.findMany({
    where: { brand: { not: null } },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  })
  return c.json({
    brands: brands.map((b) => b.brand).filter(Boolean) as string[],
  })
})

// ─── categories ────────────────────────────────────────────────────────────

app.get("/categories/grouped", async (c) => {
  const rows = await db.product.findMany({
    where: { subCategory: { not: null } },
    select: { category: true, subCategory: true },
    distinct: ["category", "subCategory"],
    orderBy: [{ category: "asc" }, { subCategory: "asc" }],
  })

  const grouped: Record<string, string[]> = {}
  for (const row of rows) {
    if (!row.subCategory) continue
    const key = row.category as string
    if (!grouped[key]) grouped[key] = []
    if (!grouped[key].includes(row.subCategory)) {
      grouped[key].push(row.subCategory)
    }
  }

  return c.json({ grouped })
})

// ─── wishlist ──────────────────────────────────────────────────────────────

app.get("/wishlist", async (c) => {
  const session = await requireSession()
  if (!session) return c.json({ error: "Login required." }, 401)

  const items = await db.wishlist.findMany({
    where: { userId: session.user.id },
    include: { product: { select: productSelect } },
    orderBy: { createdAt: "desc" },
  })

  return c.json({ items })
})

app.post("/wishlist/:productId", async (c) => {
  const session = await requireSession()
  if (!session) return c.json({ error: "Login required." }, 401)

  const userId = session.user.id!
  const productId = c.req.param("productId")

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true },
  })
  if (!product) return c.json({ error: "Product not found." }, 404)

  const existing = await db.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  })

  if (existing) {
    await db.wishlist.delete({ where: { id: existing.id } })
    return c.json({ wishlisted: false })
  }

  await db.wishlist.create({ data: { userId, productId } })
  return c.json({ wishlisted: true })
})

app.get("/wishlist/:productId/status", async (c) => {
  const session = await requireSession()
  if (!session) return c.json({ wishlisted: false })

  const userId = session.user.id!
  const productId = c.req.param("productId")

  const item = await db.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  })

  return c.json({ wishlisted: !!item })
})

app.delete("/wishlist/:productId", async (c) => {
  const session = await requireSession()
  if (!session) return c.json({ error: "Login required." }, 401)

  const userId = session.user.id!
  const productId = c.req.param("productId")

  await db.wishlist.deleteMany({ where: { userId, productId } })
  return c.json({ wishlisted: false })
})

// ─── exports ───────────────────────────────────────────────────────────────

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)