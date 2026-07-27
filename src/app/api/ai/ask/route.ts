//src/app/api/ai/ask/route.ts
import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { verifyMobileToken } from "@/lib/verifyMobileToken"

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

const MAX_USER_MESSAGE_LENGTH = 400
const MAX_HISTORY_TURNS       = 6
const MAX_OUTPUT_TOKENS       = 600
const MODEL                   = "claude-haiku-4-5-20251001"
const MAX_TOOL_ROUNDS         = 3      // reduced from 5 — 5 sequential search rounds risks blowing the time budget
const DAILY_MESSAGE_LIMIT     = 10
const COMPLETION_TOKENS       = 150
const KEEP_ALIVE_MS           = 8000
const DEADLINE_MS             = 45000  // hard wall-clock budget, leaves headroom under the 60s Vercel ceiling

export const maxDuration = 60
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

type RequestUser = { id: string; name: string; email: string }

async function getRequestUser(req: NextRequest): Promise<RequestUser | null> {
  const session = await auth()
  if (session?.user?.id && session.user.email) {
    console.log("[AI Ask] Auth resolved via web session:", session.user.id)
    return {
      id:    session.user.id,
      name:  session.user.name ?? "Customer",
      email: session.user.email,
    }
  }

  const authHeader = req.headers.get("authorization")
  console.log("[AI Ask] No web session. Authorization header present:", !!authHeader)

  if (!authHeader?.startsWith("Bearer ")) {
    console.log("[AI Ask] No Bearer token found — rejecting.")
    return null
  }

  const token = authHeader.slice("Bearer ".length)

  let payload: { userId?: string } | null = null
  try {
    payload = await verifyMobileToken(token)
  } catch (err) {
    console.error("[AI Ask] verifyMobileToken threw:", err)
    return null
  }

  if (!payload?.userId) {
    console.log("[AI Ask] verifyMobileToken returned no userId. Payload:", payload)
    return null
  }

  const user = await db.user.findUnique({
    where:  { id: payload.userId },
    select: { id: true, name: true, email: true },
  })

  if (!user?.email) {
    console.log("[AI Ask] No matching user found for id:", payload.userId)
    return null
  }

  console.log("[AI Ask] Auth resolved via mobile Bearer token:", user.id)
  return { id: user.id, name: user.name ?? "Customer", email: user.email }
}

// ─────────────────────────────────────────────
// DAILY USAGE LIMITER
// ─────────────────────────────────────────────

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

async function checkAndIncrementDailyLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const date = getTodayKey()

  const usage = await db.aiChatUsage.upsert({
    where:  { userId_date: { userId, date } },
    create: { userId, date, count: 1 },
    update: { count: { increment: 1 } },
  })

  console.log(`[AI Ask] Daily usage for ${userId} on ${date}: ${usage.count}/${DAILY_MESSAGE_LIMIT}`)

  if (usage.count > DAILY_MESSAGE_LIMIT) {
    return { allowed: false, remaining: 0 }
  }
  return { allowed: true, remaining: DAILY_MESSAGE_LIMIT - usage.count }
}

// ─────────────────────────────────────────────
// INPUT SANITISER
// ─────────────────────────────────────────────

function sanitiseInput(raw: string): string {
  return raw
    .trim()
    .slice(0, MAX_USER_MESSAGE_LENGTH)
    .replace(/<[^>]*>/g, "")
    .replace(/\s{3,}/g, "  ")
}

// ─────────────────────────────────────────────
// PRODUCT CONTEXT BUILDER
// ─────────────────────────────────────────────

type ProductContext = {
  name: string
  brand: string | null
  category: string
  subCategory: string | null
  price: number
  originalPrice: number | null
  warranty: string | null
  inStock: boolean
  description: string
  keyFeatures: string[] | null
  specifications: Record<string, string>
}

function buildProductContext(p: ProductContext): string {
  const lines: string[] = [
    `Product: ${p.name}`,
    `Brand: ${p.brand ?? "Unknown"}`,
    `Category: ${p.category}${p.subCategory ? ` › ${p.subCategory}` : ""}`,
    `Price: ₦${p.price.toLocaleString("en-NG")}${p.originalPrice ? ` (was ₦${p.originalPrice.toLocaleString("en-NG")})` : ""}`,
    `In Stock: ${p.inStock ? "Yes" : "No"}`,
    `Warranty: ${p.warranty ?? "Not specified"}`,
  ]

  if (p.keyFeatures && p.keyFeatures.length > 0) {
    lines.push(`\nKey Features:\n${p.keyFeatures.map((f) => `- ${f}`).join("\n")}`)
  }

  const specs = Object.entries(p.specifications)
  if (specs.length > 0) {
    lines.push(`\nSpecifications:\n${specs.map(([k, v]) => `- ${k}: ${v}`).join("\n")}`)
  }

  const desc = p.description.trim().slice(0, 600)
  lines.push(`\nDescription:\n${desc}${p.description.length > 600 ? "…" : ""}`)

  return lines.join("\n")
}

// ─────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────

function buildSystemPrompt(productContext: string, userName: string): string {
  return `You are a helpful product advisor for Truevenix, a Nigerian electronics and solar energy e-commerce store. You are answering questions from a signed-in customer named ${userName}.

Your role is to help customers understand the product they are viewing so they can make a confident buying decision.

PRODUCT BEING DISCUSSED:
${productContext}

GUIDELINES:
- Answer only questions related to this product or closely related topics (compatibility, use cases, comparisons with similar products on Truevenix, installation advice for solar/inverter products, etc.).
- Be honest. If you do not know something or the product data does not cover it, say so clearly and suggest the customer contact Truevenix support.
- Keep answers concise — 2 to 4 short paragraphs maximum. Customers are often on mobile.
- Use simple, friendly English. Avoid jargon unless the customer uses it first.
- Prices are in Nigerian Naira (₦). The store is based in Nigeria.
- Never make up specifications or features not listed in the product data above.
- If a question is completely unrelated to this product or Truevenix, politely redirect.
- Do not discuss competitors' prices or make promises about Truevenix policies you are not certain of.`
}

// ─────────────────────────────────────────────
// TRUNCATION HANDLER
// ─────────────────────────────────────────────

async function completeTruncatedResponse(
  client: Anthropic,
  systemPrompt: string,
  turnMessages: Anthropic.MessageParam[],
  partial: string
): Promise<string> {
  try {
    const completion = await client.messages.create({
      model:      MODEL,
      max_tokens: COMPLETION_TOKENS,
      system:     systemPrompt,
      messages: [
        ...turnMessages,
        { role: "assistant" as const, content: partial },
        {
          role:    "user" as const,
          content: "Complete your previous answer in one concise sentence. Do not repeat anything already said.",
        },
      ],
    })

    const tail = completion.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")

    return partial + " " + tail
  } catch (err) {
    console.error("[AI Ask] completeTruncatedResponse failed:", err)
    return partial
  }
}

// ─────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────

type ConversationMessage = { role: "user" | "assistant"; content: string }

type RequestBody = {
  message: string
  product: ProductContext
  history: ConversationMessage[]
}

export async function POST(req: NextRequest) {
  console.log("[AI Ask] ── POST received ──")
  console.log("[AI Ask] Host header:", req.headers.get("host"))
  console.log("[AI Ask] Origin header:", req.headers.get("origin"))
  console.log("[AI Ask] User-Agent:", req.headers.get("user-agent"))
  console.log("[AI Ask] Has Authorization header:", !!req.headers.get("authorization"))

  const user = await getRequestUser(req)

  if (!user) {
    console.log("[AI Ask] Rejecting — no authenticated user resolved.")
    return NextResponse.json(
      { error: "You must be signed in to use the AI assistant." },
      { status: 401 }
    )
  }

  const userId   = user.id
  const userName = user.name

  const { allowed, remaining } = await checkAndIncrementDailyLimit(userId)
  if (!allowed) {
    console.log("[AI Ask] Rejecting — daily limit exceeded for user:", userId)
    return NextResponse.json(
      { error: `You've used today's ${DAILY_MESSAGE_LIMIT} free questions for the AI assistant. Please come back tomorrow.` },
      { status: 429 }
    )
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch (err) {
    console.error("[AI Ask] Failed to parse request body:", err)
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const { message, product, history } = body
  console.log("[AI Ask] Incoming message:", message?.slice(0, 100))
  console.log("[AI Ask] Product name:", product?.name)
  console.log("[AI Ask] History length:", Array.isArray(history) ? history.length : "n/a")

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required." }, { status: 400 })
  }
  if (!product || typeof product !== "object") {
    return NextResponse.json({ error: "Product context is required." }, { status: 400 })
  }

  const cleanMessage = sanitiseInput(message)
  if (cleanMessage.length === 0) {
    return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 })
  }

  const safeProduct: ProductContext = {
    name:          String(product.name ?? "").slice(0, 200),
    brand:         product.brand ? String(product.brand).slice(0, 100) : null,
    category:      String(product.category ?? "").slice(0, 100),
    subCategory:   product.subCategory ? String(product.subCategory).slice(0, 100) : null,
    price:         Number(product.price) || 0,
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    warranty:      product.warranty ? String(product.warranty).slice(0, 100) : null,
    inStock:       Boolean(product.inStock),
    description:   String(product.description ?? "").slice(0, 2000),
    keyFeatures:   Array.isArray(product.keyFeatures)
                     ? product.keyFeatures.filter((f): f is string => typeof f === "string").slice(0, 20).map((f) => f.slice(0, 200))
                     : null,
    specifications: typeof product.specifications === "object" && product.specifications !== null
                     ? Object.fromEntries(
                         Object.entries(product.specifications as Record<string, unknown>)
                           .slice(0, 30)
                           .map(([k, v]) => [String(k).slice(0, 100), String(v).slice(0, 200)])
                       )
                     : {},
  }

  const safeHistory: ConversationMessage[] = (Array.isArray(history) ? history : [])
    .filter(
      (m): m is ConversationMessage =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length > 0
    )
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }))

  const messages: Anthropic.MessageParam[] = [...safeHistory, { role: "user", content: cleanMessage }]

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error("[AI Ask] ANTHROPIC_API_KEY is not set")
    return NextResponse.json(
      { error: "AI service is temporarily unavailable. Please try again later." },
      { status: 503 }
    )
  }

  const client = new Anthropic({ apiKey })

  const tools: Anthropic.Tool[] = [
    {
      type: "web_search_20250305" as Anthropic.Tool["type"],
      name: "web_search",
      // @ts-expect-error — web_search_20250305 is a server tool; no input_schema needed
      max_uses: MAX_TOOL_ROUNDS,
    },
  ]

  const systemPrompt = buildSystemPrompt(buildProductContext(safeProduct), userName)
  const encoder      = new TextEncoder()
  const startedAt    = Date.now()

  const readable = new ReadableStream({
    async start(controller) {
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keep-alive\n\n`))
        } catch (err) {
          console.error("[AI Ask] Keep-alive enqueue failed (stream likely closed):", err)
        }
      }, KEEP_ALIVE_MS)

      function sendChunks(finalText: string) {
        console.log("[AI Ask] Sending final text, length:", finalText.length)
        const words  = finalText.split(" ")
        const chunks: string[] = []

        for (let i = 0; i < words.length; i += 3) {
          chunks.push(words.slice(i, i + 3).join(" ") + (i + 3 < words.length ? " " : ""))
        }

        let idx = 0
        const flush = () => {
          if (idx >= chunks.length) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
            controller.close()
            console.log("[AI Ask] Stream closed normally.")
            return
          }
          const data = JSON.stringify({ delta: chunks[idx++] })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          setTimeout(flush, 20)
        }
        flush()
      }

      try {
        let turnMessages: Anthropic.MessageParam[] = [...messages]
        let finalText  = ""
        let toolRounds = 0

        while (toolRounds < MAX_TOOL_ROUNDS) {
          if (Date.now() - startedAt > DEADLINE_MS) {
            console.warn("[AI Ask] Hit wall-clock deadline before end_turn — breaking loop.")
            break
          }

          console.log(`[AI Ask] Calling Anthropic — round ${toolRounds}, elapsed ${Date.now() - startedAt}ms`)

          const response = await client.messages.create({
            model:      MODEL,
            max_tokens: MAX_OUTPUT_TOKENS,
            system:     systemPrompt,
            tools,
            messages:   turnMessages,
          })

          console.log("[AI Ask] stop_reason:", response.stop_reason)

          if (response.stop_reason === "end_turn") {
            finalText = response.content
              .filter((b): b is Anthropic.TextBlock => b.type === "text")
              .map((b) => b.text)
              .join("")
            break
          }

          if (response.stop_reason === "max_tokens") {
            const partial = response.content
              .filter((b): b is Anthropic.TextBlock => b.type === "text")
              .map((b) => b.text)
              .join("")
            console.log("[AI Ask] Truncated at max_tokens, completing...")
            finalText = await completeTruncatedResponse(client, systemPrompt, turnMessages, partial)
            break
          }

          if (response.stop_reason === "tool_use") {
            toolRounds++
            console.log(`[AI Ask] Tool use requested — round ${toolRounds}/${MAX_TOOL_ROUNDS}`)

            turnMessages = [...turnMessages, { role: "assistant" as const, content: response.content }]

            const toolResults: Anthropic.ToolResultBlockParam[] = response.content
              .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
              .map((b) => ({ type: "tool_result" as const, tool_use_id: b.id, content: "" }))

            if (toolResults.length > 0) {
              turnMessages = [...turnMessages, { role: "user" as const, content: toolResults }]
            }
            continue
          }

          console.warn("[AI Ask] Unexpected stop_reason:", response.stop_reason)
          finalText = response.content
            .filter((b): b is Anthropic.TextBlock => b.type === "text")
            .map((b) => b.text)
            .join("")
          break
        }

        if (!finalText) {
          console.log("[AI Ask] No finalText after loop — calling fallback without tools.")
          const fallback = await client.messages.create({
            model:      MODEL,
            max_tokens: MAX_OUTPUT_TOKENS,
            system:     systemPrompt,
            messages:   turnMessages,
          })

          console.log("[AI Ask] Fallback stop_reason:", fallback.stop_reason)

          const fallbackPartial = fallback.content
            .filter((b): b is Anthropic.TextBlock => b.type === "text")
            .map((b) => b.text)
            .join("")

          finalText = fallback.stop_reason === "max_tokens"
            ? await completeTruncatedResponse(client, systemPrompt, turnMessages, fallbackPartial)
            : fallbackPartial
        }

        if (!finalText) {
          console.error("[AI Ask] Still no finalText after fallback — sending error to client.")
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "The assistant couldn't come up with an answer. Please try rephrasing your question." })}\n\n`)
          )
          clearInterval(keepAlive)
          controller.close()
          return
        }

        clearInterval(keepAlive)
        sendChunks(finalText)
      } catch (streamError) {
        clearInterval(keepAlive)
        console.error("[AI Ask] Anthropic API error inside stream:", streamError)
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Unable to reach the AI service right now. Please try again in a moment." })}\n\n`)
          )
          controller.close()
        } catch (closeErr) {
          console.error("[AI Ask] Failed to send error to client — stream may already be closed:", closeErr)
        }
      }
    },
  })

  console.log(`[AI Ask] Returning stream. Elapsed so far: ${Date.now() - startedAt}ms`)

  return new Response(readable, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection:      "keep-alive",
      "X-Content-Type-Options":      "nosniff",
      "X-Frame-Options":             "DENY",
      "X-Daily-Questions-Remaining": String(remaining),
    },
  })
}

export async function GET() {
  console.log("[AI Ask] GET hit directly (should not normally happen) — returning 405.")
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
export async function PUT()    { return NextResponse.json({ error: "Method not allowed" }, { status: 405 }) }
export async function DELETE() { return NextResponse.json({ error: "Method not allowed" }, { status: 405 }) }