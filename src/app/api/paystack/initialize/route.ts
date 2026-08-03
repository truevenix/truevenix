import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { sendOrderCreatedEmails } from "@/lib/mail"

export const runtime = "nodejs"

const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  category: true,
  brand: true,
  inStock: true,
  images: {
    select: { id: true, color: true, colorCode: true, image: true },
  },
} as const

const orderInclude = {
  orderItems: true,
  statusUpdates: {
    orderBy: { createdAt: "desc" as const },
  },
} as const

type CheckoutItemInput = {
  productId: string
  quantity: number
  imageColor?: string
  imageColorCode?: string
  imageUrl?: string
}

type InitializePayload = {
  customerName?: string
  customerEmail?: string
  guestEmail?: string
  customerPhone?: string
  address?: string
  paymentMethod?: string
  promoCode?: string
  items?: CheckoutItemInput[]
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function cleanQuantity(value: unknown) {
  const quantity = Number(value)
  return Number.isFinite(quantity) && quantity > 0 ? Math.min(Math.floor(quantity), 99) : 0
}

function orderReference() {
  return `VNX-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as InitializePayload | null
    const items = body?.items ?? []

    // ── Step 1: Resolve identity ────────────────────────────────────────────
    const session = await auth().catch(() => null)

    let resolvedUserId: string | null = session?.user?.id ?? null
    let resolvedGuestEmail: string | null = null

    const rawEmail = body?.customerEmail || body?.guestEmail || ""
    const inputEmail = rawEmail ? normalizeEmail(rawEmail) : ""

    let customerEmail = inputEmail

    if (!resolvedUserId) {
      if (!inputEmail) {
        return NextResponse.json(
          { error: "A valid email address is required to place an order." },
          { status: 400 }
        )
      }

      const matchedUser = await db.user.findUnique({
        where: { email: inputEmail },
        select: { id: true, email: true },
      })

      if (matchedUser) {
        resolvedUserId = matchedUser.id
        resolvedGuestEmail = null
        customerEmail = matchedUser.email!
      } else {
        resolvedGuestEmail = inputEmail
        customerEmail = inputEmail
      }
    } else {
      if (!customerEmail) {
        const accountUser = await db.user.findUnique({
          where: { id: resolvedUserId },
          select: { email: true },
        })
        customerEmail = accountUser?.email ? normalizeEmail(accountUser.email) : ""
      }

      if (!customerEmail) {
        return NextResponse.json(
          { error: "A valid email address is required to place an order." },
          { status: 400 }
        )
      }
    }

    // ── Step 2: Validate items ──────────────────────────────────────────────

    if (items.length === 0) {
      return NextResponse.json({ error: "Add at least one product before checking out." }, { status: 400 })
    }

    const requestedItems = items
      .map((item) => ({
        ...item,
        quantity: cleanQuantity(item.quantity),
      }))
      .filter((item) => item.productId && item.quantity > 0)

    if (requestedItems.length === 0) {
      return NextResponse.json({ error: "Order items are invalid." }, { status: 400 })
    }

    const products = await db.product.findMany({
      where: {
        id: { in: requestedItems.map((item) => item.productId) },
        inStock: true,
      },
      select: productSelect,
    })

    const productMap = new Map(products.map((product) => [product.id, product]))
    const missingItem = requestedItems.find((item) => !productMap.has(item.productId))

    if (missingItem) {
      return NextResponse.json({ error: "One or more products are unavailable." }, { status: 409 })
    }

    const orderItems = requestedItems.map((item) => {
      const product = productMap.get(item.productId)!
      const selectedImage =
        product.images.find((image) => image.color === item.imageColor) ?? product.images[0]

      return {
        productId: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        brand: product.brand,
        quantity: item.quantity,
        price: product.price,
        imageColor: item.imageColor || selectedImage?.color || "Default",
        imageColorCode: item.imageColorCode || selectedImage?.colorCode || "#475569",
        imageUrl: item.imageUrl || selectedImage?.image || "",
      }
    })

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const referenceId = orderReference()
    const paymentMethod = body?.paymentMethod?.trim() || "paystack"

    // ── Step 2b: Validate promo code (server is the source of truth — never ──
    // trust a discount amount computed on the client) ────────────────────────

    let appliedPromo: { id: string; code: string; percentage: number } | null = null
    let discountAmount = 0

    const rawPromoCode = body?.promoCode?.trim()
    if (rawPromoCode) {
      const promoCode = rawPromoCode.toUpperCase()
      const promo = await db.promoCode.findUnique({ where: { code: promoCode } })

      if (!promo) {
        return NextResponse.json({ error: "Invalid promo code" }, { status: 400 })
      }
      if (!promo.isActive) {
        return NextResponse.json({ error: "This promo code is no longer active" }, { status: 400 })
      }
      if (promo.expiresAt && promo.expiresAt < new Date()) {
        return NextResponse.json({ error: "This promo code has expired" }, { status: 400 })
      }
      if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
        return NextResponse.json({ error: "This promo code has reached its usage limit" }, { status: 400 })
      }

      appliedPromo = { id: promo.id, code: promo.code, percentage: promo.percentage }
      discountAmount = Math.round((subtotal * promo.percentage) / 100)
    }

    const amount = Math.max(subtotal - discountAmount, 0)

    // ── Step 3: Create the order ────────────────────────────────────────────

    const orderData: any = {
      customerEmail,
      customerName: body?.customerName?.trim() || null,
      customerPhone: body?.customerPhone?.trim() || null,
      phoneNumber: body?.customerPhone?.trim() || null,
      address: body?.address?.trim() || null,
      amount,
      currency: "NGN",
      status: paymentMethod === "pay-on-delivery" ? "PENDING" : "AWAITING_PAYMENT",
      paymentMethod,
      referenceId,
      ...(appliedPromo && {
        promoCode: appliedPromo.code,
        discountPercent: appliedPromo.percentage,
        discountAmount,
      }),
      orderItems: {
        create: orderItems,
      },
      statusUpdates: {
        create: {
          status: "PENDING",
          note: "Order received.",
        },
      },
    }

    if (resolvedUserId) {
      orderData.user = { connect: { id: resolvedUserId } }
    }

    if (resolvedGuestEmail) {
      orderData.guestEmail = resolvedGuestEmail
    }

    const order = await db.order.create({
      data: orderData,
      include: orderInclude,
    })

    if (appliedPromo) {
      await db.promoCode.update({
        where: { id: appliedPromo.id },
        data: { usageCount: { increment: 1 } },
      }).catch((err) => console.error("[paystack/initialize] promo usage increment failed:", err))
    }

    // Prepared once, used by whichever return path fires below
    const orderCreatedEmailItems = orderItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
      variant: item.imageColor && item.imageColor !== "Default" ? item.imageColor : undefined,
    }))

    const sendAckEmail = () =>
      sendOrderCreatedEmails({
        customerName: body?.customerName?.trim() || "Customer",
        customerEmail,
        customerPhone: body?.customerPhone?.trim() || null,
        orderReference: referenceId,
        items: orderCreatedEmailItems,
        totalAmount: amount,
        paymentMethod,
      }).catch((err: { message: any; stack: any }) => {
        console.error("[paystack/initialize] order created email failed:", err)
        console.error("[paystack/initialize] email error details:", {
          message: err?.message,
          stack: err?.stack,
          customerEmail,
          orderReference: referenceId,
        })
      })

    // ── Step 4: Pay-on-delivery skips Paystack entirely ─────────────────────

    if (paymentMethod === "pay-on-delivery") {
      await sendAckEmail()
      return NextResponse.json({ order }, { status: 201 })
    }

    // ── Step 5: Initialize Paystack transaction (critical path, runs first) ──

    const paystackSecret = process.env.PAYSTACK_SECRET

    if (!paystackSecret) {
      await sendAckEmail()
      return NextResponse.json({
        order,
        payment: {
          provider: "manual",
          reference: order.referenceId,
          authorizationUrl: null,
          message: "Order saved. Add PAYSTACK_SECRET to enable online card payment initialization.",
        },
      })
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: customerEmail,
        amount: Math.round(amount * 100),
        reference: order.referenceId,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?orderId=${order.id}`,
        metadata: {
          orderId: order.id,
          customerName: order.customerName,
          userId: resolvedUserId,
          guestEmail: resolvedGuestEmail,
          referenceId,
        },
      }),
    })

    const paymentData = await response.json()

    if (!response.ok || !paymentData.status) {
      await db.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      })
      // Payment failed to initialize — don't send a "your order was received" email
      return NextResponse.json({ error: paymentData.message || "Unable to initialize payment." }, { status: 502 })
    }

    await db.order.update({
      where: { id: order.id },
      data: {
        paymentProvider: "paystack",
        paymentUrl: paymentData.data.authorization_url,
      },
    })

    // ── Step 6: Payment initialized successfully — send the acknowledgement email last ──

    await sendAckEmail()

    return NextResponse.json({
      order,
      payment: {
        provider: "paystack",
        reference: paymentData.data.reference,
        authorizationUrl: paymentData.data.authorization_url,
        accessCode: paymentData.data.access_code,
      },
    }, { status: 201 })
  } catch (err) {
    console.error("[paystack/initialize]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}



// import { NextRequest, NextResponse } from "next/server"
// import { db } from "@/lib/db"
// import { auth } from "@/auth"
// import { sendOrderCreatedEmails } from "@/lib/mail"

// export const runtime = "nodejs"

// const productSelect = {
//   id: true,
//   name: true,
//   description: true,
//   price: true,
//   category: true,
//   brand: true,
//   inStock: true,
//   images: {
//     select: { id: true, color: true, colorCode: true, image: true },
//   },
// } as const

// const orderInclude = {
//   orderItems: true,
//   statusUpdates: {
//     orderBy: { createdAt: "desc" as const },
//   },
// } as const

// type CheckoutItemInput = {
//   productId: string
//   quantity: number
//   imageColor?: string
//   imageColorCode?: string
//   imageUrl?: string
// }

// type InitializePayload = {
//   customerName?: string
//   customerEmail?: string
//   guestEmail?: string
//   customerPhone?: string
//   address?: string
//   paymentMethod?: string
//   promoCode?: string
//   items?: CheckoutItemInput[]
// }

// function normalizeEmail(email: string) {
//   return email.trim().toLowerCase()
// }

// function cleanQuantity(value: unknown) {
//   const quantity = Number(value)
//   return Number.isFinite(quantity) && quantity > 0 ? Math.min(Math.floor(quantity), 99) : 0
// }

// function orderReference() {
//   return `VNX-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = (await req.json().catch(() => null)) as InitializePayload | null
//     const items = body?.items ?? []

//     // ── Step 1: Resolve identity ────────────────────────────────────────────
//     const session = await auth().catch(() => null)

//     let resolvedUserId: string | null = session?.user?.id ?? null
//     let resolvedGuestEmail: string | null = null

//     const rawEmail = body?.customerEmail || body?.guestEmail || ""
//     const inputEmail = rawEmail ? normalizeEmail(rawEmail) : ""

//     let customerEmail = inputEmail

//     if (!resolvedUserId) {
//       if (!inputEmail) {
//         return NextResponse.json(
//           { error: "A valid email address is required to place an order." },
//           { status: 400 }
//         )
//       }

//       const matchedUser = await db.user.findUnique({
//         where: { email: inputEmail },
//         select: { id: true, email: true },
//       })

//       if (matchedUser) {
//         resolvedUserId = matchedUser.id
//         resolvedGuestEmail = null
//         customerEmail = matchedUser.email!
//       } else {
//         resolvedGuestEmail = inputEmail
//         customerEmail = inputEmail
//       }
//     } else {
//       if (!customerEmail) {
//         const accountUser = await db.user.findUnique({
//           where: { id: resolvedUserId },
//           select: { email: true },
//         })
//         customerEmail = accountUser?.email ? normalizeEmail(accountUser.email) : ""
//       }

//       if (!customerEmail) {
//         return NextResponse.json(
//           { error: "A valid email address is required to place an order." },
//           { status: 400 }
//         )
//       }
//     }

//     // ── Step 2: Validate items ──────────────────────────────────────────────

//     if (items.length === 0) {
//       return NextResponse.json({ error: "Add at least one product before checking out." }, { status: 400 })
//     }

//     const requestedItems = items
//       .map((item) => ({
//         ...item,
//         quantity: cleanQuantity(item.quantity),
//       }))
//       .filter((item) => item.productId && item.quantity > 0)

//     if (requestedItems.length === 0) {
//       return NextResponse.json({ error: "Order items are invalid." }, { status: 400 })
//     }

//     const products = await db.product.findMany({
//       where: {
//         id: { in: requestedItems.map((item) => item.productId) },
//         inStock: true,
//       },
//       select: productSelect,
//     })

//     const productMap = new Map(products.map((product) => [product.id, product]))
//     const missingItem = requestedItems.find((item) => !productMap.has(item.productId))

//     if (missingItem) {
//       return NextResponse.json({ error: "One or more products are unavailable." }, { status: 409 })
//     }

//     const orderItems = requestedItems.map((item) => {
//       const product = productMap.get(item.productId)!
//       const selectedImage =
//         product.images.find((image) => image.color === item.imageColor) ?? product.images[0]

//       return {
//         productId: product.id,
//         name: product.name,
//         description: product.description,
//         category: product.category,
//         brand: product.brand,
//         quantity: item.quantity,
//         price: product.price,
//         imageColor: item.imageColor || selectedImage?.color || "Default",
//         imageColorCode: item.imageColorCode || selectedImage?.colorCode || "#475569",
//         imageUrl: item.imageUrl || selectedImage?.image || "",
//       }
//     })

//     const amount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
//     const referenceId = orderReference()
//     const paymentMethod = body?.paymentMethod?.trim() || "paystack"

//     // ── Step 3: Create the order ────────────────────────────────────────────

//     const orderData: any = {
//       customerEmail,
//       customerName: body?.customerName?.trim() || null,
//       customerPhone: body?.customerPhone?.trim() || null,
//       phoneNumber: body?.customerPhone?.trim() || null,
//       address: body?.address?.trim() || null,
//       amount,
//       currency: "NGN",
//       status: paymentMethod === "pay-on-delivery" ? "PENDING" : "AWAITING_PAYMENT",
//       paymentMethod,
//       referenceId,
//       orderItems: {
//         create: orderItems,
//       },
//       statusUpdates: {
//         create: {
//           status: "PENDING",
//           note: "Order received.",
//         },
//       },
//     }

//     if (resolvedUserId) {
//       orderData.user = { connect: { id: resolvedUserId } }
//     }

//     if (resolvedGuestEmail) {
//       orderData.guestEmail = resolvedGuestEmail
//     }

//     const order = await db.order.create({
//       data: orderData,
//       include: orderInclude,
//     })

//     // Prepared once, used by whichever return path fires below
//     const orderCreatedEmailItems = orderItems.map((item) => ({
//       name: item.name,
//       quantity: item.quantity,
//       price: item.price,
//       subtotal: item.price * item.quantity,
//       variant: item.imageColor && item.imageColor !== "Default" ? item.imageColor : undefined,
//     }))

//     const sendAckEmail = () =>
//       sendOrderCreatedEmails({
//         customerName: body?.customerName?.trim() || "Customer",
//         customerEmail,
//         customerPhone: body?.customerPhone?.trim() || null,
//         orderReference: referenceId,
//         items: orderCreatedEmailItems,
//         totalAmount: amount,
//         paymentMethod,
//       }).catch((err: { message: any; stack: any }) => {
//         console.error("[paystack/initialize] order created email failed:", err)
//         console.error("[paystack/initialize] email error details:", {
//           message: err?.message,
//           stack: err?.stack,
//           customerEmail,
//           orderReference: referenceId,
//         })
//       })

//     // ── Step 4: Pay-on-delivery skips Paystack entirely ─────────────────────

//     if (paymentMethod === "pay-on-delivery") {
//       await sendAckEmail()
//       return NextResponse.json({ order }, { status: 201 })
//     }

//     // ── Step 5: Initialize Paystack transaction (critical path, runs first) ──

//     const paystackSecret = process.env.PAYSTACK_SECRET

//     if (!paystackSecret) {
//       await sendAckEmail()
//       return NextResponse.json({
//         order,
//         payment: {
//           provider: "manual",
//           reference: order.referenceId,
//           authorizationUrl: null,
//           message: "Order saved. Add PAYSTACK_SECRET to enable online card payment initialization.",
//         },
//       })
//     }

//     const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin

//     const response = await fetch("https://api.paystack.co/transaction/initialize", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${paystackSecret}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email: customerEmail,
//         amount: Math.round(amount * 100),
//         reference: order.referenceId,
//         callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?orderId=${order.id}`,
//         metadata: {
//           orderId: order.id,
//           customerName: order.customerName,
//           userId: resolvedUserId,
//           guestEmail: resolvedGuestEmail,
//           referenceId,
//         },
//       }),
//     })

//     const paymentData = await response.json()

//     if (!response.ok || !paymentData.status) {
//       await db.order.update({
//         where: { id: order.id },
//         data: { status: "FAILED" },
//       })
//       // Payment failed to initialize — don't send a "your order was received" email
//       return NextResponse.json({ error: paymentData.message || "Unable to initialize payment." }, { status: 502 })
//     }

//     await db.order.update({
//       where: { id: order.id },
//       data: {
//         paymentProvider: "paystack",
//         paymentUrl: paymentData.data.authorization_url,
//       },
//     })

//     // ── Step 6: Payment initialized successfully — send the acknowledgement email last ──

//     await sendAckEmail()

//     return NextResponse.json({
//       order,
//       payment: {
//         provider: "paystack",
//         reference: paymentData.data.reference,
//         authorizationUrl: paymentData.data.authorization_url,
//         accessCode: paymentData.data.access_code,
//       },
//     }, { status: 201 })
//   } catch (err) {
//     console.error("[paystack/initialize]", err)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

