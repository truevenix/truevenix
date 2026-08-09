"use client"
// app/(root)/profile/installments/[planId]/page.tsx — "Installment Details"
// screen for a single plan. Shows the full payment history (every
// installment, paid or not, with its date), and two ways to move a plan
// forward: pay just the next installment due, or pay off everything
// remaining in one go so the order ships without waiting out the schedule.
//
// Missing an installment on its "due" date isn't penalized here — there's no
// late fee and no lockout. The next tap of "Pay next installment" simply
// charges whichever installment is still unpaid, whenever the shopper is
// ready, and "Pay everything now" is always available as a way to skip the
// rest of the schedule.

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Package,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Zap,
  AlertCircle,
  Info,
  Truck,
} from "lucide-react"
import { toast } from "sonner"
import { formatPrice } from "@/context/cart-context"

type InstallmentPaymentRow = {
  id: string
  installmentNo: number
  amount: number
  status: "PENDING" | "PAID" | "FAILED"
  paidAt: string | null
}

type InstallmentPlan = {
  id: string
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "DEFAULTED"
  totalAmount: number
  amountPaid: number
  amountRemaining: number
  numberOfInstallments: number
  installmentsPaid: number
  installmentAmount: number
  createdAt: string
  order: {
    id: string
    referenceId: string
    createDate: string
    deliveryStatus: string
    items: {
      id: string
      name: string
      quantity: number
      price: number
      imageUrl: string
      imageColor: string
      imageColorCode: string
    }[]
  }
  payments: InstallmentPaymentRow[]
  nextPayment: { id: string; installmentNo: number; amount: number; paymentUrl: string | null } | null
}

function StatusPill({ status }: { status: InstallmentPlan["status"] }) {
  const map = {
    ACTIVE: { label: "Active", cls: "text-amber-700 bg-amber-50 border-amber-200" },
    COMPLETED: { label: "Completed", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    CANCELLED: { label: "Cancelled", cls: "text-gray-500 bg-gray-50 border-gray-200" },
    DEFAULTED: { label: "Defaulted", cls: "text-red-700 bg-red-50 border-red-200" },
  } as const
  const { label, cls } = map[status]
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${cls}`}>
      {label}
    </span>
  )
}

function ProgressBar({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0
  return (
    <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: "var(--theme-primary)" }}
      />
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
}

// One row per installment in the full history list — this is the "see all
// the payments they've made" view.
function PaymentRow({ payment }: { payment: InstallmentPaymentRow }) {
  const isPaid = payment.status === "PAID"
  const isFailed = payment.status === "FAILED"

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3.5 py-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
            isPaid ? "bg-emerald-50" : isFailed ? "bg-red-50" : "bg-gray-50"
          }`}
        >
          {isPaid ? (
            <CheckCircle2 size={15} className="text-emerald-600" />
          ) : isFailed ? (
            <XCircle size={15} className="text-red-500" />
          ) : (
            <Clock size={15} className="text-gray-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">Installment #{payment.installmentNo}</p>
          <p className="text-xs text-gray-400">
            {isPaid && payment.paidAt
              ? `Paid ${formatDate(payment.paidAt)}`
              : isFailed
              ? "Payment attempt failed — try again anytime"
              : "Not yet paid"}
          </p>
        </div>
      </div>
      <span className="text-sm font-bold text-gray-800">{formatPrice(payment.amount)}</span>
    </div>
  )
}

export default function InstallmentPlanDetailPage() {
  const params = useParams()
  const planId = params?.planId as string

  const [plan, setPlan] = useState<InstallmentPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payingMode, setPayingMode] = useState<"next" | "full" | null>(null)

  useEffect(() => {
    if (planId) fetchPlan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId])

  const fetchPlan = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/installments/${planId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not load this installment plan")
      setPlan(data.plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this installment plan")
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (mode: "next" | "full") => {
    if (!plan) return
    setPayingMode(mode)
    try {
      const res = await fetch("/api/installments/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, mode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not start payment")

      if (data.payment?.authorizationUrl) {
        window.location.href = data.payment.authorizationUrl
      } else {
        toast.error("Payment link unavailable. Please try again.")
        setPayingMode(null)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start payment")
      setPayingMode(null)
    }
  }

  const pct = plan && plan.totalAmount > 0 ? Math.round((plan.amountPaid / plan.totalAmount) * 100) : 0
  const firstItem = plan?.order.items[0]
  const extraCount = plan ? plan.order.items.length - 1 : 0
  const hasMissedPayment = plan?.payments.some((p) => p.status === "FAILED") ?? false

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: "color-mix(in srgb, var(--theme-primary) 4%, white)" }}
    >
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <Link href="/profile/installments" className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-base font-extrabold text-gray-800">Installment Details</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--theme-primary)]" />
          </div>
        ) : error || !plan ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-gray-500">{error || "Plan not found"}</p>
            <button
              onClick={fetchPlan}
              className="mt-2 px-4 py-2 text-xs font-bold rounded-full text-white bg-[var(--theme-primary)]"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Order summary card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex items-start gap-3">
                {firstItem?.imageUrl ? (
                  <div
                    className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border"
                    style={{ borderColor: firstItem.imageColorCode || "#e5e7eb" }}
                  >
                    <Image src={firstItem.imageUrl} alt={firstItem.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {firstItem?.name ?? "Order"}
                    {extraCount > 0 && <span className="text-gray-400 font-normal"> +{extraCount} more</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Order #{plan.order.referenceId}</p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <StatusPill status={plan.status} />
                    <span className="flex items-center gap-1 text-[11px] text-gray-500">
                      <Truck size={11} /> {plan.order.deliveryStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-600">
                    {formatPrice(plan.amountPaid)} of {formatPrice(plan.totalAmount)} paid
                  </span>
                  <span className="text-xs font-bold" style={{ color: "var(--theme-primary)" }}>{pct}%</span>
                </div>
                <ProgressBar paid={plan.amountPaid} total={plan.totalAmount} />
                <p className="mt-1.5 text-[11px] text-gray-400">
                  {plan.installmentsPaid} of {plan.numberOfInstallments} installments paid
                </p>
              </div>
            </motion.div>

            {/* No-penalty note — shown whenever the plan still has money
                owed, so it's there before anything's even missed, not just
                after a failure. */}
            {plan.status === "ACTIVE" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex gap-2.5 rounded-2xl border p-3.5"
                style={{
                  borderColor: "color-mix(in srgb, var(--theme-primary) 20%, #e5e7eb)",
                  backgroundColor: "color-mix(in srgb, var(--theme-primary) 5%, white)",
                }}
              >
                <Info size={16} className="shrink-0 mt-0.5" style={{ color: "var(--theme-primary)" }} />
                <p className="text-xs leading-relaxed text-gray-600">
                  {hasMissedPayment ? (
                    <>
                      No penalties for a missed installment — just pay it whenever you&apos;re ready with{" "}
                      <strong>&quot;Pay next installment&quot;</strong> below.
                    </>
                  ) : (
                    <>
                      If you ever miss an installment, there&apos;s no penalty — simply pay it the next time you&apos;re
                      ready to pay.
                    </>
                  )}{" "}
                  Want it done sooner? <strong>&quot;Pay everything now&quot;</strong> settles the rest in one payment.
                </p>
              </motion.div>
            )}

            {/* Payment history */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              <h2 className="mb-3 text-sm font-extrabold text-gray-800">Payment history</h2>
              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {plan.payments.map((p) => (
                    <PaymentRow key={p.id} payment={p} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Actions */}
            {plan.status === "ACTIVE" && (
              <div className="flex flex-col gap-2.5">
                {plan.nextPayment && (
                  <button
                    onClick={() => handlePay("next")}
                    disabled={payingMode !== null}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition-all duration-200 disabled:opacity-60"
                    style={{ backgroundColor: "var(--theme-primary)" }}
                  >
                    {payingMode === "next" ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Redirecting…
                      </>
                    ) : (
                      <>
                        <CreditCard size={15} />
                        Pay installment #{plan.nextPayment.installmentNo} — {formatPrice(plan.nextPayment.amount)}
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => handlePay("full")}
                  disabled={payingMode !== null}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 py-3 text-sm font-bold transition-all duration-200 disabled:opacity-60"
                  style={{ borderColor: "var(--theme-primary)", color: "var(--theme-primary)" }}
                >
                  {payingMode === "full" ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Redirecting…
                    </>
                  ) : (
                    <>
                      <Zap size={15} />
                      Pay everything now — {formatPrice(plan.amountRemaining)}
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-gray-400">
                  Paying the remaining balance in full settles the plan immediately.
                </p>
              </div>
            )}

            {plan.status === "COMPLETED" && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5">
                <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
                <p className="text-xs font-semibold text-emerald-700">
                  This plan is fully paid — nothing left to do.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}