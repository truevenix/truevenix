"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, Lock, RotateCcw, Sparkles, User, Bot } from "lucide-react"
import Link from "next/link"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Message = {
  id:      string
  role:    "user" | "assistant"
  content: string
  error?:  boolean
}

export type AIProductContext = {
  name:           string
  brand:          string | null
  category:       string
  subCategory:    string | null
  price:          number
  originalPrice:  number | null
  warranty:       string | null
  inStock:        boolean
  description:    string
  keyFeatures:    string[] | null
  specifications: Record<string, string>
}

type Props = {
  product: AIProductContext
}

// ─────────────────────────────────────────────
// ROTATING PLACEHOLDER QUESTIONS
// ─────────────────────────────────────────────

const PLACEHOLDER_BASE = [
  "Ask anything about this product…",
  "Is this compatible with my setup?",
  "What's included in the box?",
  "Can this power my fridge and TV at once?",
  "How do I install this inverter?",
  "What battery size do I need for this?",
  "Is this good for a 3-bedroom flat?",
]

function getPlaceholders(productName: string): string[] {
  return [
    `Ask anything about the ${productName}…`,
    `How long will the ${productName} last?`,
    `Is the ${productName} good for my home?`,
    "Can this power my fridge and TV at once?",
    "What battery size do I need with this?",
    "What's included in the box?",
    "Is this compatible with my existing setup?",
  ]
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />")
}

// Short name — first word only, max 12 chars
function shortName(full: string | null | undefined): string {
  if (!full) return "there"
  const first = full.trim().split(/\s+/)[0]
  return first.length > 12 ? first.slice(0, 12) : first
}

// Short product name — first 3 words
function shortProduct(name: string): string {
  const words = name.trim().split(/\s+/)
  return words.slice(0, 3).join(" ") + (words.length > 3 ? "…" : "")
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function ProductAskAI({ product }: Props) {
  const { data: session, status } = useSession()

  const [messages,    setMessages]    = useState<Message[]>([])
  const [input,       setInput]       = useState("")
  const [isStreaming, setIsStreaming]  = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [inputError,  setInputError]  = useState<string | null>(null)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [placeholderVisible, setPlaceholderVisible] = useState(true)

  const scrollRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)
  const abortRef   = useRef<AbortController | null>(null)

  const isSignedIn = status === "authenticated" && !!session?.user?.id
  const placeholders = getPlaceholders(product.name)
  const hasChat = messages.length > 0

  // ── Rotate placeholder text ──
  useEffect(() => {
    if (hasChat) return // stop rotating once user starts chatting
    const interval = setInterval(() => {
      setPlaceholderVisible(false)
      setTimeout(() => {
        setPlaceholderIdx((i) => (i + 1) % placeholders.length)
        setPlaceholderVisible(true)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [hasChat, placeholders.length])

  // ── Auto-scroll ──
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isStreaming])

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  const clearChat = () => {
    abortRef.current?.abort()
    setMessages([])
    setInput("")
    setInputError(null)
    setIsStreaming(false)
    setIsSearching(false)
  }

  // ── Send message ──
  const sendMessage = useCallback(async (text?: string) => {
    const messageText = (text ?? input).trim()
    if (!messageText || isStreaming || !isSignedIn) return

    if (messageText.length > 500) {
      setInputError("Please keep your question under 500 characters.")
      return
    }

    setInputError(null)
    setInput("")

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
    }

    const userMsg: Message = { id: generateId(), role: "user", content: messageText }
    setMessages((prev) => [...prev, userMsg])
    setIsStreaming(true)
    setIsSearching(true)

    const assistantId = generateId()
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }])

    const history = messages.map((m) => ({ role: m.role, content: m.content }))

    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      const response = await fetch("/api/ai/ask", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        signal:  abortController.signal,
        body: JSON.stringify({ message: messageText, product, history }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId
            ? { ...m, content: errData?.error ?? "Something went wrong. Please try again.", error: true }
            : m
          )
        )
        return
      }

      const reader  = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error("No response body")

      let buffer = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const jsonStr = line.slice(6).trim()
          if (!jsonStr) continue

          try {
            const parsed = JSON.parse(jsonStr)
            if (parsed.done) break
            if (parsed.error) {
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId
                  ? { ...m, content: parsed.error, error: true }
                  : m
                )
              )
              break
            }
            if (parsed.delta) {
              setIsSearching(false)
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId
                  ? { ...m, content: m.content + parsed.delta }
                  : m
                )
              )
            }
          } catch { /* skip malformed lines */ }
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId
          ? { ...m, content: "Connection lost. Please check your internet and try again.", error: true }
          : m
        )
      )
    } finally {
      setIsStreaming(false)
      setIsSearching(false)
      abortRef.current = null
    }
  }, [input, isStreaming, isSignedIn, messages, product])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

      {/* ── Greeting header ── */}
      <div
        className="flex items-center gap-3 px-4 pt-4 pb-3"
        style={{ borderBottom: "1px solid #f3f4f6" }}
      >
        {/* Bot avatar */}
        <div
          className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, var(--theme-primary) 0%, color-mix(in srgb, var(--theme-primary) 70%, #000) 100%)" }}
        >
          <Sparkles size={18} className="text-white" />
          {/* Online dot */}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-black text-gray-900 leading-none">
              {isSignedIn
                ? `Hello, ${shortName(session?.user?.name)} 👋`
                : "AI Product Advisor"}
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 leading-tight truncate">
            I can answer questions on the{" "}
            <span className="font-semibold text-gray-600">{shortProduct(product.name)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Clear button — only when there's a conversation */}
          {hasChat && (
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              title="Clear chat"
            >
              <RotateCcw size={13} />
            </button>
          )}

          {/* Powered by Claude badge */}
          <div
            className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold"
            style={{ backgroundColor: "color-mix(in srgb, var(--theme-primary) 10%, transparent)", color: "var(--theme-primary)" }}
          >
            <Bot size={10} />
            Powered by Claude
          </div>
        </div>
      </div>

      {/* ── Chat messages (only shown after first message) ── */}
      <AnimatePresence>
        {hasChat && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              ref={scrollRef}
              className="flex flex-col gap-3 px-4 py-3 overflow-y-auto"
              style={{ maxHeight: "340px" }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 ${
                      msg.role === "user" ? "bg-gray-100" : ""
                    }`}
                    style={msg.role === "assistant"
                      ? { background: "linear-gradient(135deg, var(--theme-primary), color-mix(in srgb, var(--theme-primary) 70%, #000))" }
                      : {}
                    }
                  >
                    {msg.role === "user" ? (
                      session?.user?.image
                        ? <img src={session.user.image} alt="You" className="w-6 h-6 rounded-full object-cover" />
                        : <User size={11} className="text-gray-400" />
                    ) : (
                      <Sparkles size={11} className="text-white" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`relative max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-sm text-white"
                        : msg.error
                        ? "rounded-bl-sm bg-red-50 text-red-600 border border-red-100"
                        : "rounded-bl-sm text-gray-700"
                    }`}
                    style={
                      msg.role === "user"
                        ? { backgroundColor: "var(--theme-primary)" }
                        : msg.error ? {}
                        : { backgroundColor: "#f9fafb", border: "1px solid #f3f4f6" }
                    }
                  >
                    {/* Typing / searching indicator */}
                    {msg.role === "assistant" && msg.content === "" && !msg.error ? (
                      <div className="flex items-center gap-2 py-0.5">
                        <div className="flex items-center gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: "var(--theme-primary)" }}
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                        {isSearching && (
                          <span className="text-[10px] font-medium" style={{ color: "var(--theme-primary)" }}>
                            searching the web…
                          </span>
                        )}
                      </div>
                    ) : msg.role === "assistant" ? (
                      <span dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input area — always visible ── */}
      <div className="px-4 pb-4 pt-3">
        {/* Not signed in — overlay message inside the input area */}
        {!isSignedIn ? (
          <div
            className="flex items-center justify-between rounded-xl border px-4 py-3 gap-3"
            style={{ borderColor: "color-mix(in srgb, var(--theme-primary) 25%, transparent)", backgroundColor: "color-mix(in srgb, var(--theme-primary) 4%, transparent)" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Lock size={14} style={{ color: "var(--theme-primary)" }} className="flex-shrink-0" />
              <p className="text-sm text-gray-500 truncate">Sign in to ask questions about this product</p>
            </div>
            <Link
              href="/auth/login"
              className="flex-shrink-0 text-xs font-black px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--theme-primary)" }}
            >
              Sign in
            </Link>
          </div>
        ) : (
          <>
            {inputError && (
              <p className="text-xs text-red-500 mb-2 px-1">{inputError}</p>
            )}

            <div
              className="flex items-end gap-2 rounded-xl border px-3 py-2 transition-all focus-within:shadow-sm"
              style={{
                borderColor: "color-mix(in srgb, var(--theme-primary) 30%, #e5e7eb)",
              }}
            >
              {/* Rotating placeholder lives inside the textarea via a layered div */}
              <div className="relative flex-1">
                {/* Custom animated placeholder (only shown when input is empty) */}
                {!input && !hasChat && (
                  <div className="absolute inset-0 flex items-center pointer-events-none select-none">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={placeholderIdx}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: placeholderVisible ? 1 : 0, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25 }}
                        className="text-sm text-gray-400 truncate pr-2"
                      >
                        {placeholders[placeholderIdx]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    setInputError(null)
                  }}
                  onKeyDown={handleKeyDown}
                  // Native placeholder only shown after first message (simpler UX)
                  placeholder={hasChat ? "Ask a follow-up question…" : ""}
                  rows={1}
                  maxLength={500}
                  disabled={isStreaming}
                  className="w-full resize-none bg-transparent text-sm text-gray-800 outline-none leading-relaxed py-1 disabled:opacity-60"
                  style={{ minHeight: "36px", maxHeight: "112px" }}
                  onInput={(e) => {
                    const el = e.currentTarget
                    el.style.height = "auto"
                    el.style.height = `${Math.min(el.scrollHeight, 112)}px`
                  }}
                />
              </div>

              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isStreaming}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed mb-0.5"
                style={{ backgroundColor: "var(--theme-primary)" }}
                aria-label="Send"
              >
                {isStreaming
                  ? <Loader2 size={14} className="text-white animate-spin" />
                  : <Send size={13} className="text-white translate-x-px" />
                }
              </button>
            </div>

            <p className="text-[10px] text-gray-300 mt-1.5 text-center">
              AI answers are for guidance only · {input.length}/500
            </p>
          </>
        )}
      </div>
    </div>
  )
}