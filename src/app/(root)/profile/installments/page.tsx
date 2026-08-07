"use client"
// app/(root)/profile/installments/page.tsx — "Installment Payments" screen,
// linked from the main profile page. Shows every plan the signed-in user
// has, how much of each has been paid so far, and a button to pay the next
// installment when one is due.

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Package, Loader2, CheckCircle2, Clock, CreditCard, AlertCircle } from "lucide-react"
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
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  )
}

function ProgressBar({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0
  return (
    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: "var(--theme-primary)" }}
      />
    </div>
  )
}

function PlanCard({ plan, onPay, payingId }: {
  plan: InstallmentPlan
  onPay: (plan: InstallmentPlan) => void
  payingId: string | null
}) {
  const firstItem = plan.order.items[0]
  const extraCount = plan.order.items.length - 1
  const pct = plan.totalAmount > 0 ? Math.round((plan.amountPaid / plan.totalAmount) * 100) : 0
  const isPaying = payingId === plan.id

  return (
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
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-800 truncate">
              {firstItem?.name ?? "Order"}
              {extraCount > 0 && <span className="text-gray-400 font-normal"> +{extraCount} more</span>}
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Order #{plan.order.referenceId}</p>
          <div className="mt-2 flex items-center gap-2">
            <StatusPill status={plan.status} />
            <span className="text-[11px] text-gray-500">
              {plan.installmentsPaid} of {plan.numberOfInstallments} installments paid
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
      </div>

      {/* Per-installment breakdown */}
      <div className="mt-4 flex flex-wrap gap-2">
        {plan.payments.map((p) => (
          <div
            key={p.id}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border ${
              p.status === "PAID"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : p.status === "FAILED"
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-gray-50 text-gray-500 border-gray-200"
            }`}
          >
            {p.status === "PAID" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
            #{p.installmentNo} · {formatPrice(p.amount)}
          </div>
        ))}
      </div>

      {plan.status === "ACTIVE" && plan.nextPayment && (
        <button
          onClick={() => onPay(plan)}
          disabled={isPaying}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-bold text-white transition-all duration-200 disabled:opacity-60"
          style={{ backgroundColor: "var(--theme-primary)" }}
        >
          {isPaying ? (
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
    </motion.div>
  )
}

export default function InstallmentPlansPage() {
  const [plans, setPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payingId, setPayingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/installments")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not load installment plans")
      setPlans(data.plans ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load installment plans")
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (plan: InstallmentPlan) => {
    setPayingId(plan.id)
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
      } else {
        toast.error("Payment link unavailable. Please try again.")
        setPayingId(null)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start payment")
      setPayingId(null)
    }
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: "color-mix(in srgb, var(--theme-primary) 4%, white)" }}
    >
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <Link href="/profile" className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-base font-extrabold text-gray-800">Installment Payments</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--theme-primary)]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-gray-500">{error}</p>
            <button
              onClick={fetchPlans}
              className="mt-2 px-4 py-2 text-xs font-bold rounded-full text-white bg-[var(--theme-primary)]"
            >
              Try again
            </button>
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <CreditCard className="w-8 h-8 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">No installment plans yet</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Choose &quot;Pay in installments&quot; at checkout to split a purchase into smaller payments.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onPay={handlePay} payingId={payingId} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
