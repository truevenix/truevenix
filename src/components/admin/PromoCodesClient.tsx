"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Hash, Percent, Plus, Tag, Trash2, Ticket } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type PromoCode = {
  id: string
  code: string
  percentage: number
  isActive: boolean
  expiresAt: string | null
  usageLimit: number | null
  usageCount: number
  createdAt: string
  updatedAt: string
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function PromoCodesClient({
  initialPromoCodes,
}: {
  initialPromoCodes: PromoCode[]
}) {
  const [promoCodes, setPromoCodes] = useState(initialPromoCodes)
  const [isCreating, setIsCreating] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    code: "",
    percentage: "",
    expiresAt: "",
    usageLimit: "",
  })

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: val }))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    const code = form.code.trim()
    const percentage = Number(form.percentage)

    if (!code) {
      toast.error("Enter a promo code")
      return
    }
    if (!Number.isFinite(percentage) || percentage < 1 || percentage > 100) {
      toast.error("Percentage must be between 1 and 100")
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          percentage,
          ...(form.expiresAt && { expiresAt: new Date(form.expiresAt).toISOString() }),
          ...(form.usageLimit && { usageLimit: Number(form.usageLimit) }),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not create promo code")

      setPromoCodes((current) => [data.promo, ...current])
      setForm({ code: "", percentage: "", expiresAt: "", usageLimit: "" })
      toast.success(`Promo code ${data.promo.code} created`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create promo code")
    } finally {
      setIsCreating(false)
    }
  }

  const toggleActive = async (promo: PromoCode) => {
    setTogglingId(promo.id)
    try {
      const res = await fetch(`/api/admin/promo-codes/${promo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !promo.isActive }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not update promo code")

      setPromoCodes((current) =>
        current.map((p) => (p.id === promo.id ? { ...p, isActive: data.promo.isActive } : p))
      )
      toast.success(`${promo.code} ${data.promo.isActive ? "activated" : "deactivated"}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update promo code")
    } finally {
      setTogglingId(null)
    }
  }

  const deletePromo = async (promo: PromoCode) => {
    if (!confirm(`Delete promo code ${promo.code}? This can't be undone.`)) return

    setDeletingId(promo.id)
    try {
      const res = await fetch(`/api/admin/promo-codes/${promo.id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Could not delete promo code")

      setPromoCodes((current) => current.filter((p) => p.id !== promo.id))
      toast.success("Promo code deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete promo code")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/admin"
            className="flex w-fit items-center gap-1.5 text-xs font-black text-slate-400 hover:text-slate-900"
          >
            <ArrowLeft size={13} />
            Back to dashboard
          </Link>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">truevenix admin</p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-950 md:text-3xl">
              <Ticket size={26} className="text-[var(--theme-primary)]" />
              Promo codes
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        {/* Create form */}
        <form
          onSubmit={handleCreate}
          className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="flex items-center gap-2 font-black text-slate-900">
            <Plus size={16} className="text-[var(--theme-primary)]" />
            Create promo code
          </h2>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Tag size={12} /> Code
            </label>
            <Input
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="e.g. truevenix10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Percent size={12} /> Discount percentage
            </label>
            <Input
              type="number"
              min={1}
              max={100}
              value={form.percentage}
              onChange={(e) => set("percentage", e.target.value)}
              placeholder="e.g. 10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Calendar size={12} /> Expires on (optional)
            </label>
            <Input
              type="date"
              value={form.expiresAt}
              onChange={(e) => set("expiresAt", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Hash size={12} /> Usage limit (optional)
            </label>
            <Input
              type="number"
              min={1}
              value={form.usageLimit}
              onChange={(e) => set("usageLimit", e.target.value)}
              placeholder="Unlimited if left blank"
            />
          </div>

          <Button type="submit" disabled={isCreating} className="w-full gap-2">
            <Plus size={16} />
            {isCreating ? "Creating…" : "Create promo code"}
          </Button>
        </form>

        {/* List */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          {promoCodes.length === 0 ? (
            <div className="py-16 text-center text-sm font-semibold text-slate-400">
              No promo codes yet. Create your first one.
            </div>
          ) : (
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promoCodes.map((promo) => (
                  <tr key={promo.id}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">{promo.code}</td>
                    <td className="px-4 py-3 font-black text-slate-900">{promo.percentage}%</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {promo.usageCount}
                      {promo.usageLimit ? ` / ${promo.usageLimit}` : ""}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {promo.expiresAt ? formatDate(promo.expiresAt) : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(promo)}
                        disabled={togglingId === promo.id}
                        className="rounded-full px-2.5 py-1 text-[11px] font-black transition disabled:opacity-50"
                        style={{
                          color: promo.isActive ? "#059669" : "#94a3b8",
                          backgroundColor: promo.isActive ? "#ecfdf5" : "#f1f5f9",
                        }}
                      >
                        {promo.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deletePromo(promo)}
                        disabled={deletingId === promo.id}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50"
                        aria-label={`Delete ${promo.code}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
