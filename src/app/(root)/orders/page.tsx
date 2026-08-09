"use client"

// app/orders/page.tsx
// Unified: always uses /api/v1/orders?email=...
// Logged-in users → email comes from session (no form needed)
// Guests          → email comes from ?email= param or the lookup form

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { EmptyOrderMockup } from "@/components/EmptyOrderMockup"
import { useSearchParams } from "next/navigation"
import {ArrowLeft,ArrowRight,Calendar,CreditCard,LogIn,Mail,Package,RefreshCw,Search,Truck,User, Zap,} from "lucide-react"
import { useCurrentUserWithStatus } from "@/hooks/use-current-user"
import Navbar from "@/components/layout/Navbar"

// ── Types ──────────────────────────────────────────────────────────────────────
interface OrderItem {
  id:             string
  name:           string
  quantity:       number
  price:          number
  imageUrl:       string
  imageColor:     string
  imageColorCode: string
  category:       string
  brand:          string | null
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
  orderItems:     OrderItem[]
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
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// ── Status config ──────────────────────────────────────────────────────────────
const DELIVERY_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Processing", color: "#b45309", bg: "#fef3c7" },
  CONFIRMED: { label: "Confirmed",  color: "#1d4ed8", bg: "#dbeafe" },
  SHIPPED:   { label: "Shipped",    color: "#6d28d9", bg: "#ede9fe" },
  DELIVERED: { label: "Delivered",  color: "#15803d", bg: "#dcfce7" },
  CANCELLED: { label: "Cancelled",  color: "#b91c1c", bg: "#fee2e2" },
}

const PAYMENT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PAID:             { label: "Paid",             color: "#15803d", bg: "#dcfce7" },
  SUCCESS:          { label: "Paid",             color: "#15803d", bg: "#dcfce7" },
  PENDING:          { label: "Pending",          color: "#b45309", bg: "#fef3c7" },
  AWAITING_PAYMENT: { label: "Awaiting payment", color: "#b45309", bg: "#fef3c7" },
  FAILED:           { label: "Failed",           color: "#b91c1c", bg: "#fee2e2" },
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100" />
      ))}
    </div>
  )
}

// ── Order Card ─────────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const delivery   = DELIVERY_STATUS[order.deliveryStatus] ?? DELIVERY_STATUS.PENDING
  const payment    = PAYMENT_STATUS[order.status?.toUpperCase()] ?? PAYMENT_STATUS.PENDING
  const preview    = order.orderItems.slice(0, 3)
  const extra      = order.orderItems.length - 3
  const itemCount  = order.orderItems.reduce((s, i) => s + i.quantity, 0)

  const href = `/orders/${order.referenceId}?email=${encodeURIComponent(order.customerEmail)}`

  return (
    <li className="relative z-10 list-none transition-all duration-200 group hover:-translate-y-0.5">
      <div className="absolute inset-px z-0 rounded-lg bg-white" />
      <div className="pointer-events-none absolute inset-px z-0 rounded-lg shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:shadow-md" />

      <Link href={href} className="relative z-10 block p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Order
            </p>
            <h3 className="font-mono text-lg/7 font-medium tracking-tight text-gray-950">
              {order.referenceId}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-sm/6 text-gray-600">
              <Calendar size={12} />
              {formatDate(order.createDate)}
            </p>
          </div>

          <div className="text-right">
            <span className="flex items-center justify-end text-sm font-semibold text-gray-700">
              {formatPrice(order.amount, order.currency)}
            </span>

            <div className="mt-2 flex justify-end -space-x-2.5">
              {preview.map((item, i) => (
                <div
                  key={item.id}
                  className="relative h-12 w-12 overflow-hidden rounded-md border-2 border-white bg-gray-50 shadow-sm"
                  style={{ zIndex: preview.length - i }}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-contain p-1"
                    sizes="48px"
                  />
                </div>
              ))}
              {extra > 0 && (
                <div className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-white bg-gray-100 text-xs font-bold text-gray-500 shadow-sm">
                  +{extra}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 space-y-2.5">
          <div className="flex items-center text-sm/5 text-gray-600">
            <Truck className="mr-2 size-4 text-[var(--theme-primary)]" />
            <span className="font-medium">Delivery:</span>
            <span
              className="ml-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{ color: delivery.color, backgroundColor: delivery.bg }}
            >
              {delivery.label}
            </span>
          </div>
          <div className="flex items-center text-sm/5 text-gray-600">
            <CreditCard className="mr-2 size-4 text-[var(--theme-primary)]" />
            <span className="font-medium">Payment:</span>
            <span
              className="ml-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{ color: payment.color, backgroundColor: payment.bg }}
            >
              {payment.label}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-50 pt-4">
          <p className="line-clamp-1 pr-4 text-xs text-gray-400">
            {order.orderItems.map((i) => i.name).join(", ")} · {itemCount} item{itemCount !== 1 ? "s" : ""}
          </p>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--theme-primary)]">
            View <ArrowRight className="size-4" />
          </span>
        </div>
      </Link>
    </li>
  )
}

// ── Shared fetch + list logic ──────────────────────────────────────────────────
function useOrders(email: string) {
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [page,    setPage]    = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 10

  useEffect(() => {
    if (!email) return
    fetchOrders(email, page)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, page])

  async function fetchOrders(addr: string, p: number) {
    setLoading(true)
    setError("")
    try {
      const res  = await fetch(`/api/v1/orders?email=${encodeURIComponent(addr.trim().toLowerCase())}`)

      const contentType = res.headers.get("content-type") ?? ""
      if (!contentType.includes("application/json")) {
        throw new Error("Unexpected server response. Please try again.")
      }

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Unable to load orders.")

      const all = (json.orders ?? []) as Order[]
      // Client-side pagination since Hono route returns all orders
      setTotalPages(Math.max(Math.ceil(all.length / LIMIT), 1))
      setOrders(all.slice((p - 1) * LIMIT, p * LIMIT))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return { orders, loading, error, page, setPage, totalPages, refetch: () => fetchOrders(email, page) }
}

// ── Authenticated view ─────────────────────────────────────────────────────────
function AuthOrderList({ email }: { email: string }) {
  const { orders, loading, error, page, setPage, totalPages, refetch } = useOrders(email)

  if (loading) return <OrderSkeleton />

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        {error}
      </div>
    )
  }

if (orders.length === 0) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white py-12 text-center">
      <EmptyOrderMockup className="h-64 w-56" />
      <div className="mt-4">
        <p className="text-lg font-extrabold text-gray-800">No orders yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Your purchases will appear here once you place an order.
        </p>
      </div>
      <Link
        href="/shop"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--theme-primary)] px-6 py-2.5 text-sm font-bold text-white hover:opacity-90"
      >
        <Zap size={14} />
        Browse products
      </Link>
    </div>
  )
}
  return (
    <div>
      <ul className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={14} />
          </button>
          <span className="text-sm text-gray-500">
            Page <span className="font-bold text-gray-800">{page}</span> of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// ── Guest email lookup ─────────────────────────────────────────────────────────
function GuestOrderLookup() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get("email") ?? ""

  const [inputEmail,     setInputEmail]     = useState(initialEmail)
  const [submittedEmail, setSubmittedEmail] = useState(initialEmail)
  const [searched,       setSearched]       = useState(!!initialEmail)

  const { orders, loading, error } = useOrders(submittedEmail)

  // Auto-trigger if ?email= is in the URL (e.g. Paystack redirect)
  useEffect(() => {
    if (initialEmail) setSearched(true)
  }, [initialEmail])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!inputEmail.trim()) return
    setSubmittedEmail(inputEmail.trim())
    setSearched(true)
  }

  return (
    <div>
      {/* ── Login prompt banner ──────────────────────────────────────────── */}
      <div className="mb-4 rounded-2xl border border-gray-100 bg-[var(--theme-primary-light)] p-4">
        <div className="flex items-center gap-2">
          <User size={14} style={{ color: "var(--theme-primary)" }} />
          <p className="text-xs font-bold text-gray-700">
            Viewing as a{" "}
            <span style={{ color: "var(--theme-primary)" }}>guest</span>
          </p>
        </div>
        <p className="mt-1.5 text-xs text-gray-500">
          Sign in to your Truevenix account to see all your orders automatically. No
          account yet? You can still track an order below using the email address you
          used at checkout.
        </p>
        <Link
          href="/auth/login?callbackUrl=/orders"
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[var(--theme-primary)] px-4 py-2 text-xs font-bold text-white hover:opacity-90"
        >
          <LogIn size={13} />
          Sign in to view your orders
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--theme-primary)]">
            Order lookup
          </p>
          <h1 className="mt-1.5 text-2xl font-extrabold text-gray-900">
            Find your orders
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter the email address you used at checkout.
          </p>
        </div>

        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <div className="relative flex-1">
            <Mail
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[var(--theme-primary)]/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--theme-primary)] px-5 text-sm font-bold text-white transition-colors hover:opacity-90 disabled:opacity-60"
          >
            <Search size={14} />
            {loading ? "Searching…" : "Find orders"}
          </button>
        </form>
      </section>

      <div className="mt-5 space-y-4">
        {loading && <OrderSkeleton />}

        {error && !loading && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

       {!loading && searched && submittedEmail && orders.length === 0 && !error && (
  <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white py-12 text-center">
    <EmptyOrderMockup className="h-64 w-56" />
    <div className="mt-4">
      <p className="font-bold text-gray-800">No orders found</p>
      <p className="mt-1 text-sm text-gray-500">
        Try the exact email used at checkout.
      </p>
    </div>
  </div>
)}

        {!loading && orders.length > 0 && (
          <ul className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}


// ── Main shell ─────────────────────────────────────────────────────────────────
function OrdersContent() {
  const { user, isLoading, isAuthenticated } = useCurrentUserWithStatus()

  // Refresh handler for logged-in users
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
              {isAuthenticated ? "My orders" : "Track an order"}
            </h1>
            {isAuthenticated && user?.email && (
              <p className="mt-0.5 text-sm text-gray-400">
                Signed in as{" "}
                <span className="font-semibold text-gray-600">{user.email}</span>
              </p>
            )}
          </div>

          {isAuthenticated && (
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          )}
        </div>

        {isLoading ? (
          <OrderSkeleton />
        ) : isAuthenticated && user?.email ? (
          // Key forces AuthOrderList to remount on refresh
          <AuthOrderList key={refreshKey} email={user.email} />
        ) : (
          <GuestOrderLookup />
        )}
      </div>
    </main>
  )
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <OrderSkeleton />
          </div>
        </main>
      }
    >
      <>
                <Navbar showSearch={false} />
      <OrdersContent />
      </>
    </Suspense>
  )
}