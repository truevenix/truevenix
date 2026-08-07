"use client"

// src/components/admin/UpdateOrderModal.tsx
// Opened from the "Update order" item in the admin orders table's action
// menu. Two independent things can happen in one submit:
//   1. Change deliveryStatus (adds a row to OrderStatusUpdate)
//   2. Post a free-text shipping update (adds a row to OrderTimeline)
// Either, both, or the push-notification toggle can be used on their own.

import { useEffect, useState } from "react"
import { Bell, BellOff, CheckCircle2, Clock, CreditCard, Loader2, Truck, X, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DELIVERY_STATUS_OPTIONS, deliveryStatusConfig, type DeliveryStatusValue } from "@/lib/delivery-status"
import { cn } from "@/lib/utils"

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })
}

export type UpdateOrderModalOrder = {
  id: string
  referenceId: string
  customerName: string | null
  customerEmail: string
  deliveryStatus: string
  userId: string | null
}

type UpdatedOrderResult = {
  id: string
  deliveryStatus: string
  statusUpdates: { id: string; status: string; note: string | null; createdAt: string }[]
  timeline: { id: string; title: string; note: string | null; createdAt: string }[]
}

// Only the installment slice of GET /api/v1/admin/orders/:id — the rest of
// that response duplicates what the row already passed in as `order`.
type InstallmentPaymentRow = {
  id: string
  installmentNo: number
  amount: number
  status: "PENDING" | "PAID" | "FAILED"
  paidAt: string | null
}

type InstallmentPlanDetail = {
  id: string
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "DEFAULTED"
  totalAmount: number
  amountPaid: number
  numberOfInstallments: number
  payments: InstallmentPaymentRow[]
}

type Props = {
  order: UpdateOrderModalOrder
  onClose: () => void
  onSuccess: (order: UpdatedOrderResult, push: { sent: number; failed: number } | null) => void
}

const PLAN_STATUS_STYLE: Record<InstallmentPlanDetail["status"], string> = {
  ACTIVE: "text-amber-700 bg-amber-50 border-amber-200",
  COMPLETED: "text-emerald-700 bg-emerald-50 border-emerald-200",
  CANCELLED: "text-slate-500 bg-slate-50 border-slate-200",
  DEFAULTED: "text-red-700 bg-red-50 border-red-200",
}

// ── Installment timeline ─────────────────────────────────────────────────
// Read-only for now — the admin can see exactly what's been paid and what's
// still outstanding for this order, per installment. Marking installments
// paid/failed only ever happens via the Paystack webhook, so there's
// nothing to edit here.
function InstallmentTimeline({ plan }: { plan: InstallmentPlanDetail }) {
  const pct = plan.totalAmount > 0 ? Math.min(100, Math.round((plan.amountPaid / plan.totalAmount) * 100)) : 0

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
          <CreditCard size={13} /> Installment plan
        </Label>
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black", PLAN_STATUS_STYLE[plan.status])}>
          {plan.status.charAt(0) + plan.status.slice(1).toLowerCase()}
        </span>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-600">
          <span>{formatPrice(plan.amountPaid)} of {formatPrice(plan.totalAmount)} paid</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ol className="grid gap-2">
        {plan.payments.map((payment) => {
          const isPaid = payment.status === "PAID"
          const isFailed = payment.status === "FAILED"
          return (
            <li
              key={payment.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5",
                isPaid ? "border-emerald-200 bg-emerald-50/60" : isFailed ? "border-red-200 bg-red-50/60" : "border-slate-200 bg-slate-50"
              )}
            >
              <div className="flex items-center gap-2.5">
                {isPaid ? (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                ) : isFailed ? (
                  <XCircle size={16} className="text-red-500" />
                ) : (
                  <Clock size={16} className="text-slate-400" />
                )}
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Installment {payment.installmentNo} of {plan.numberOfInstallments}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isPaid && payment.paidAt
                      ? `Paid ${formatDateTime(payment.paidAt)}`
                      : isFailed
                      ? "Payment failed"
                      : "Not yet paid"}
                  </p>
                </div>
              </div>
              <span className="text-sm font-black text-slate-900">{formatPrice(payment.amount)}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default function UpdateOrderModal({ order, onClose, onSuccess }: Props) {
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatusValue>(
    order.deliveryStatus as DeliveryStatusValue
  )
  const [statusNote, setStatusNote] = useState("")
  const [timelineTitle, setTimelineTitle] = useState("")
  const [timelineNote, setTimelineNote] = useState("")
  const [notify, setNotify] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetched separately from the shallow `order` prop (the orders table row
  // only carries the fields needed to render the table) so opening the
  // modal is instant and the installment breakdown loads in just after.
  const [installmentPlan, setInstallmentPlan] = useState<InstallmentPlanDetail | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoadingPlan(true)
    fetch(`/api/v1/admin/orders/${order.id}`)
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return
        setInstallmentPlan(body?.order?.installmentPlan ?? null)
      })
      .catch(() => {
        if (!cancelled) setInstallmentPlan(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingPlan(false)
      })
    return () => {
      cancelled = true
    }
  }, [order.id])

  const canRegisterPush = Boolean(order.userId)
  const statusChanged = deliveryStatus !== order.deliveryStatus
  const hasTimelineUpdate = timelineTitle.trim().length > 0
  const canSubmit = statusChanged || hasTimelineUpdate

  async function handleSubmit() {
    if (!canSubmit || submitting) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/v1/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryStatus: statusChanged ? deliveryStatus : undefined,
          statusNote: statusChanged ? statusNote.trim() || null : undefined,
          timelineTitle: hasTimelineUpdate ? timelineTitle.trim() : undefined,
          timelineNote: hasTimelineUpdate ? timelineNote.trim() || null : undefined,
          notify,
        }),
      })

      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || "Unable to update order.")

      const push = body.push as { sent: number; failed: number } | null
      if (notify && canRegisterPush) {
        if (push && push.sent > 0) {
          toast.success(`Order updated — push sent to ${push.sent} device${push.sent === 1 ? "" : "s"}.`)
        } else {
          toast.success("Order updated. No active devices to push to.")
        }
      } else {
        toast.success("Order updated.")
      }

      onSuccess(body.order, push)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update order.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
      <div className="mx-auto min-h-full max-w-lg overflow-hidden rounded-[24px] bg-white shadow-2xl">
        {/* Header */}
        <header className="relative bg-slate-950 text-white">
          <div className="flex items-start justify-between gap-4 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white/50">
                  truevenix admin
                </p>
                <h1 className="text-lg font-black">Update order</h1>
                <p className="mt-0.5 font-mono text-xs text-white/60">{order.referenceId}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Close update order modal"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="grid gap-6 p-5 sm:p-7">
          <p className="text-sm text-slate-500">
            {order.customerName ?? "Guest"} · <span className="text-slate-400">{order.customerEmail}</span>
          </p>

          {/* ── Delivery status ─────────────────────────────────────────── */}
          <section className="grid gap-3">
            <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
              <Truck size={13} /> Delivery status
            </Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {DELIVERY_STATUS_OPTIONS.map((option) => {
                const config = deliveryStatusConfig(option.value)
                const active = deliveryStatus === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDeliveryStatus(option.value)}
                    className={cn(
                      "rounded-xl border-2 px-2 py-2 text-center text-[11px] font-black transition",
                      active ? "text-white" : "text-slate-500"
                    )}
                    style={{
                      background: active ? config.color : `${config.color}14`,
                      borderColor: active ? config.color : `${config.color}33`,
                    }}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
            {statusChanged && (
              <Input
                value={statusNote}
                onChange={(event) => setStatusNote(event.target.value)}
                placeholder="Optional note for this status change (visible to the customer)"
              />
            )}
          </section>

          <div className="h-px bg-slate-100" />

          {/* ── Installment timeline ────────────────────────────────────── */}
          {/* Only rendered once the fetch resolves and this order actually
              has a plan attached — most orders won't, so nothing shows. */}
          {loadingPlan ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Loader2 size={13} className="animate-spin" /> Checking for an installment plan…
            </div>
          ) : installmentPlan ? (
            <>
              <InstallmentTimeline plan={installmentPlan} />
              <div className="h-px bg-slate-100" />
            </>
          ) : null}

          {/* ── Free-text timeline update ───────────────────────────────── */}
          <section className="grid gap-3">
            <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
              <Clock size={13} /> Add a shipping update
            </Label>
            <p className="text-xs text-slate-400">
              Independent of delivery status — post as many as you like while the order sits at
              "Shipped", e.g. "Reached Kaduna", then "Arrived at our Zaria office".
            </p>
            <Input
              value={timelineTitle}
              onChange={(event) => setTimelineTitle(event.target.value)}
              placeholder="e.g. Order has reached Kaduna"
            />
            <Input
              value={timelineNote}
              onChange={(event) => setTimelineNote(event.target.value)}
              placeholder="Optional extra detail"
            />
          </section>

          <div className="h-px bg-slate-100" />

          {/* ── Push notification toggle ────────────────────────────────── */}
          <section>
            <button
              type="button"
              onClick={() => canRegisterPush && setNotify((current) => !current)}
              disabled={!canRegisterPush}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left transition",
                notify && canRegisterPush ? "border-slate-950 bg-slate-950/[0.03]" : "border-slate-200",
                !canRegisterPush && "cursor-not-allowed opacity-50"
              )}
            >
              <span className="flex items-center gap-3">
                {notify && canRegisterPush ? (
                  <Bell size={16} className="text-slate-950" />
                ) : (
                  <BellOff size={16} className="text-slate-400" />
                )}
                <span>
                  <span className="block text-sm font-black text-slate-900">
                    Push-notify the customer
                  </span>
                  <span className="block text-xs text-slate-400">
                    {canRegisterPush
                      ? "Sends to every device where they've enabled notifications"
                      : "Guest checkout — no account to push to"}
                  </span>
                </span>
              </span>
              <span
                className={cn(
                  "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
                  notify && canRegisterPush ? "bg-slate-950" : "bg-slate-200"
                )}
              >
                <span
                  className={cn(
                    "h-5 w-5 rounded-full bg-white shadow transition-transform",
                    notify && canRegisterPush ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </span>
            </button>
          </section>

          {/* ── Footer ───────────────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={!canSubmit || submitting} className="gap-2">
              {submitting && <Loader2 size={15} className="animate-spin" />}
              Save update
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
