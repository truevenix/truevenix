"use client"

// app/orders/[referenceId]/page.tsx
// Unified: always uses /api/v1/orders/:referenceId?email=...
// Logged-in users  → email read from session automatically
// Guest users      → email read from ?email= URL param

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Hash,
  MapPin,
  Navigation,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  XCircle,
  Zap,
} from "lucide-react"
import { useCurrentUserWithStatus } from "@/hooks/use-current-user"
import { DELIVERY_STATUS_INDEX, DELIVERY_STEPS } from "@/lib/delivery-status"

// ── Types ──────────────────────────────────────────────────────────────────────
interface OrderItem {
  id:             string
  name:           string
  description:    string
  quantity:       number
  price:          number
  imageUrl:       string
  imageColor:     string
  imageColorCode: string
  category:       string
  brand:          string | null
}

interface StatusUpdate {
  id:        string
  status:    string
  note:      string | null
  createdAt: string
}

// Free-text shipping updates an admin posts — independent of deliveryStatus.
// e.g. "Reached Kaduna" while the order is still sitting at SHIPPED.
interface TimelineEntry {
  id:        string
  title:     string
  note:      string | null
  createdAt: string
}

interface InstallmentPaymentRow {
  id:            string
  installmentNo: number
  amount:        number
  status:        "PENDING" | "PAID" | "FAILED"
  paidAt:        string | null
}

interface InstallmentPlan {
  id:                   string
  status:               "ACTIVE" | "COMPLETED" | "CANCELLED" | "DEFAULTED"
  totalAmount:          number
  amountPaid:           number
  numberOfInstallments: number
  payments:             InstallmentPaymentRow[]
}

interface Order {
  id:             string
  amount:         number
  currency:       string
  status:         string
  deliveryStatus: string
  createDate:     string
  referenceId:    string
  address:        string | null
  phoneNumber:    string | null
  customerEmail:  string
  customerName:   string | null
  customerPhone:  string | null
  orderItems:     OrderItem[]
  statusUpdates:  StatusUpdate[]
  timeline:       TimelineEntry[]
  installmentPlan: InstallmentPlan | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatPrice(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
  })
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

// ── Status config ──────────────────────────────────────────────────────────────
const PAYMENT: Record<string, {
  label: string; desc: string; color: string; bg: string; icon: typeof CheckCircle2
}> = {
  PAID:             { label: "Payment confirmed",  desc: "Your payment was received successfully.",       color: "#15803d", bg: "#dcfce7", icon: CheckCircle2 },
  SUCCESS:          { label: "Payment confirmed",  desc: "Your payment was received successfully.",       color: "#15803d", bg: "#dcfce7", icon: CheckCircle2 },
  PENDING:          { label: "Payment pending",    desc: "We are awaiting payment confirmation.",         color: "#b45309", bg: "#fef3c7", icon: Clock        },
  AWAITING_PAYMENT: { label: "Awaiting payment",   desc: "Complete your payment to confirm this order.", color: "#b45309", bg: "#fef3c7", icon: Clock        },
  FAILED:           { label: "Payment failed",     desc: "The payment for this order was declined.",     color: "#b91c1c", bg: "#fee2e2", icon: XCircle      },
}

// ── Delivery tracker ───────────────────────────────────────────────────────────
function DeliveryTracker({ status }: { status: string }) {
  const currentIdx  = DELIVERY_STATUS_INDEX[status as keyof typeof DELIVERY_STATUS_INDEX] ?? 0
  const isCancelled = status === "CANCELLED"

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600">
        <XCircle size={15} className="text-red-500" />
        Order cancelled
      </div>
    )
  }

  return (
    <div className="flex items-center">
      {DELIVERY_STEPS.map((step, i) => {
        const done    = i <= currentIdx
        const current = i === currentIdx
        const last    = i === DELIVERY_STEPS.length - 1
        return (
          <div key={step.value} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  done ? "bg-[var(--theme-primary)] border-[var(--theme-primary)]" : "bg-gray-100 border-gray-200"
                } ${current ? "ring-4 ring-[var(--theme-primary)]/20" : ""}`}
              >
                {done
                  ? <CheckCircle2 size={13} color="white" />
                  : <div className="h-2 w-2 rounded-full bg-gray-300" />
                }
              </div>
              <span
                className={`whitespace-nowrap text-center text-[10px] font-semibold leading-tight ${
                  done ? "text-[var(--theme-primary)]" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {!last && (
              <div
                className={`mx-1 mb-5 h-0.5 flex-1 rounded-full transition-all ${
                  i < currentIdx ? "bg-[var(--theme-primary)]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Installment timeline ──────────────────────────────────────────────────
// Only rendered when this order was placed with "Pay in installments" —
// shows exactly what's been paid and what's still outstanding, plus a way
// to pay the next installment without leaving the order page.
const PLAN_STATUS_STYLE: Record<InstallmentPlan["status"], { label: string; cls: string }> = {
  ACTIVE:     { label: "Active",    cls: "text-amber-700 bg-amber-50 border-amber-200" },
  COMPLETED:  { label: "Completed", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  CANCELLED:  { label: "Cancelled", cls: "text-gray-500 bg-gray-50 border-gray-200" },
  DEFAULTED:  { label: "Defaulted", cls: "text-red-700 bg-red-50 border-red-200" },
}

function InstallmentTimeline({ plan, currency }: { plan: InstallmentPlan; currency: string }) {
  const [paying, setPaying] = useState(false)
  const pct = plan.totalAmount > 0 ? Math.min(100, Math.round((plan.amountPaid / plan.totalAmount) * 100)) : 0
  const nextPayment = plan.payments.find((p) => p.status !== "PAID") ?? null
  const { label, cls } = PLAN_STATUS_STYLE[plan.status]

  async function handlePayNext() {
    if (!nextPayment || paying) return
    setPaying(true)
    try {
      const res = await fetch("/api/installments/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not start payment")
      if (data.payment?.authorizationUrl) {
        window.location.href = data.payment.authorizationUrl
        return
      }
    } catch {
      // Silently fall through — button just re-enables so they can retry.
    }
    setPaying(false)
  }

  return (
    <Section title="Installment plan" icon={CreditCard}>
      <div className="mb-4 flex items-center justify-between">
        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>{label}</span>
        <span className="text-xs font-semibold text-gray-500">
          {plan.payments.filter((p) => p.status === "PAID").length} of {plan.numberOfInstallments} paid
        </span>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-600">
            {formatPrice(plan.amountPaid, currency)} of {formatPrice(plan.totalAmount, currency)} paid
          </span>
          <span className="font-bold text-[var(--theme-primary)]">{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: "var(--theme-primary)" }}
          />
        </div>
      </div>

      <ol className="space-y-2">
        {plan.payments.map((payment) => {
          const isPaid = payment.status === "PAID"
          const isFailed = payment.status === "FAILED"
          return (
            <li
              key={payment.id}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
                isPaid ? "border-emerald-200 bg-emerald-50/60" : isFailed ? "border-red-200 bg-red-50/60" : "border-gray-100 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isPaid ? (
                  <CheckCircle2 size={15} className="text-emerald-600" />
                ) : isFailed ? (
                  <XCircle size={15} className="text-red-500" />
                ) : (
                  <Clock size={15} className="text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    Installment {payment.installmentNo} of {plan.numberOfInstallments}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {isPaid && payment.paidAt
                      ? `Paid ${formatDateTime(payment.paidAt)}`
                      : isFailed
                      ? "Payment failed — you can retry below"
                      : "Not yet paid"}
                  </p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-gray-900">{formatPrice(payment.amount, currency)}</span>
            </li>
          )
        })}
      </ol>

      {plan.status === "ACTIVE" && nextPayment && (
        <button
          onClick={handlePayNext}
          disabled={paying}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: "var(--theme-primary)" }}
        >
          <CreditCard size={15} />
          {paying
            ? "Redirecting…"
            : `Pay installment ${nextPayment.installmentNo} — ${formatPrice(nextPayment.amount, currency)}`}
        </button>
      )}
    </Section>
  )
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={14} className="text-gray-400" />
        <h2 className="text-sm font-extrabold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-5 w-32 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    </main>
  )
}

// ── Core detail ────────────────────────────────────────────────────────────────
function OrderDetail() {
  const { user, isLoading } = useCurrentUserWithStatus()
  const params       = useParams()
  const searchParams = useSearchParams()
  const router       = useRouter()

  const referenceId = params?.referenceId as string
  const emailParam  = searchParams.get("email")

  const [order,   setOrder]   = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
    if (isLoading) return   // wait for session to resolve
    fetchOrder()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, referenceId])

  async function fetchOrder() {
    setLoading(true)
    setError("")

    // Resolve which email to use:
    // 1. Logged-in user  → session email (most reliable, no spoofing)
    // 2. Guest           → ?email= URL param
    // 3. Neither         → redirect to lookup
    const email = user?.email ?? emailParam

    if (!email) {
      router.replace("/orders")
      return
    }

    try {
      const url = `/api/v1/orders/${referenceId}?email=${encodeURIComponent(email)}`
      const res = await fetch(url)

      // Guard against HTML error pages
      const contentType = res.headers.get("content-type") ?? ""
      if (!contentType.includes("application/json")) {
        throw new Error("Order not found.")
      }

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Order not found.")

      setOrder(json.order ?? null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) return <DetailSkeleton />

  // Back link — always carries email so Hono can verify on the list page too
  const resolvedEmail = user?.email ?? emailParam ?? ""
  const backHref = resolvedEmail
    ? `/orders?email=${encodeURIComponent(resolvedEmail)}`
    : "/orders"

  if (error || !order) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-5 pt-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-800">Order not found</h2>
          <p className="text-sm text-gray-500">
            {error || "This order doesn't exist or you don't have access to it."}
          </p>
          <Link
            href={backHref}
            className="flex items-center gap-2 rounded-xl bg-[var(--theme-primary)] px-6 py-2.5 text-sm font-bold text-white hover:opacity-90"
          >
            <ArrowLeft size={14} />
            Back to orders
          </Link>
        </div>
      </main>
    )
  }

  const payment     = PAYMENT[order.status?.toUpperCase()] ?? PAYMENT.PENDING
  const PayIcon     = payment.icon
  const subtotal    = order.orderItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalQty    = order.orderItems.reduce((s, i) => s + i.quantity, 0)
  const deliveryFee = order.amount - subtotal

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-700"
        >
          <ArrowLeft size={14} />
          Back to orders
        </Link>

        <div className="flex flex-col gap-4">
          {/* ── Payment banner ────────────────────────────────────────────── */}
          <div
            className="flex items-start gap-4 rounded-2xl p-5"
            style={{ backgroundColor: payment.bg }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${payment.color}20` }}
            >
              <PayIcon size={20} style={{ color: payment.color }} />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-gray-800">{payment.label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{payment.desc}</p>
            </div>
            <span className="flex-shrink-0 text-lg font-extrabold text-[var(--theme-primary)]">
              {formatPrice(order.amount, order.currency)}
            </span>
          </div>

          {/* ── Order metadata ────────────────────────────────────────────── */}
          <Section title="Order details" icon={Hash}>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Reference</p>
                <p className="font-mono text-xs font-bold text-gray-700">{order.referenceId}</p>
              </div>
              <div>
                <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Order ID</p>
                <p className="font-mono text-xs font-bold text-gray-700">{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="mb-0.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  <CalendarDays size={10} /> Date placed
                </p>
                <p className="text-xs font-semibold text-gray-700">{formatDate(order.createDate)}</p>
              </div>
              <div>
                <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Currency</p>
                <p className="text-xs font-semibold text-gray-700">{order.currency}</p>
              </div>
            </div>
          </Section>

          {/* ── Delivery tracker ──────────────────────────────────────────── */}
          <Section title="Delivery status" icon={Truck}>
            <DeliveryTracker status={order.deliveryStatus} />
          </Section>

          {/* ── Installment plan ─────────────────────────────────────────────
              Only present when this order was placed with "Pay in
              installments" — shows what's been paid, what's outstanding,
              and lets the customer pay the next one right here. */}
          {order.installmentPlan && (
            <InstallmentTimeline plan={order.installmentPlan} currency={order.currency} />
          )}

          {/* ── Shipping updates ─────────────────────────────────────────────
              Free-text updates posted by an admin, independent of delivery
              status — e.g. "Reached Kaduna" while the order still shows
              "Shipped" above. Newest first. */}
          {order.timeline?.length > 0 && (
            <Section title="Shipping updates" icon={Navigation}>
              <div className="space-y-3">
                {order.timeline.map((update) => (
                  <div key={update.id} className="border-l-2 border-[var(--theme-primary)]/30 pl-3">
                    <p className="text-sm font-bold text-gray-800">{update.title}</p>
                    {update.note && <p className="text-xs text-gray-500">{update.note}</p>}
                    <p className="mt-0.5 text-[11px] text-gray-400">{formatDateTime(update.createdAt)}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Status history ───────────────────────────────────────────────
              Driven automatically by deliveryStatus changes (Paystack webhook
              or an admin status change) — distinct from Shipping updates above. */}
          {order.statusUpdates?.length > 0 && (
            <Section title="Status history" icon={Clock}>
              <div className="space-y-3">
                {order.statusUpdates.map((update) => (
                  <div key={update.id} className="border-l-2 border-gray-200 pl-3">
                    <p className="text-sm font-bold capitalize text-gray-800">
                      {update.status.charAt(0) + update.status.slice(1).toLowerCase()}
                    </p>
                    {update.note && <p className="text-xs text-gray-500">{update.note}</p>}
                    <p className="mt-0.5 text-[11px] text-gray-400">{formatDateTime(update.createdAt)}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Delivery info ─────────────────────────────────────────────── */}
          <Section title="Delivery information" icon={MapPin}>
            {order.address ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-[var(--theme-primary-light)] p-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--theme-primary)]/15">
                    <MapPin size={13} className="text-[var(--theme-primary)]" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Delivery address
                    </p>
                    <p className="text-sm font-semibold leading-snug text-gray-700">{order.address}</p>
                  </div>
                </div>

                {(order.customerPhone || order.phoneNumber) && (
                  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-[var(--theme-primary-light)] p-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--theme-primary)]/15">
                      <Phone size={13} className="text-[var(--theme-primary)]" />
                    </div>
                    <div>
                      <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Contact number
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {order.customerPhone ?? order.phoneNumber}
                      </p>
                    </div>
                  </div>
                )}

                <p className="flex items-center gap-1 text-[11px] text-gray-400">
                  <AlertCircle size={10} />
                  Delivery details cannot be changed once an order is placed.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No delivery address recorded.</p>
            )}
          </Section>

          {/* ── Items ─────────────────────────────────────────────────────── */}
          <Section title={`Items ordered (${totalQty})`} icon={ShoppingBag}>
            <div className="divide-y divide-gray-50">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-contain p-1.5"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <p className="line-clamp-2 text-sm font-bold leading-snug text-gray-800">{item.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full border border-gray-200"
                          style={{ backgroundColor: item.imageColorCode }}
                        />
                        <span className="text-xs text-gray-400">{item.imageColor}</span>
                        {item.brand && <span className="text-xs text-gray-400">· {item.brand}</span>}
                        <span className="text-xs text-gray-300">· {item.category}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Qty: <span className="font-bold text-gray-600">{item.quantity}</span>
                      </span>
                      <span className="text-sm font-extrabold text-[var(--theme-primary)]">
                        {formatPrice(item.price * item.quantity, order.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Price summary ─────────────────────────────────────────────── */}
          <Section title="Price summary" icon={CreditCard}>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal ({totalQty} item{totalQty !== 1 ? "s" : ""})</span>
                <span className="font-semibold text-gray-700">{formatPrice(subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery fee</span>
                <span className="font-semibold text-gray-700">
                  {deliveryFee <= 0
                    ? <span className="font-bold text-green-600">Free 🎉</span>
                    : formatPrice(deliveryFee, order.currency)
                  }
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2.5 text-base font-extrabold">
                <span>Total paid</span>
                <span className="text-[var(--theme-primary)]">{formatPrice(order.amount, order.currency)}</span>
              </div>
            </div>
          </Section>

          {/* ── Help CTA ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                <Package size={14} className="text-[var(--theme-primary)]" />
                Need help with this order?
              </p>
              <p className="mt-0.5 text-xs text-gray-400">Our support team is ready to assist you.</p>
            </div>
            <Link
              href="/contact-us"
              className="flex-shrink-0 rounded-xl bg-[var(--theme-primary)] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
            >
              Contact us
            </Link>
          </div>

          <div className="pb-4 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--theme-primary)] hover:opacity-80"
            >
              <Zap size={13} />
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <OrderDetail />
    </Suspense>
  )
}