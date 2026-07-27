"use client"

import { useState } from "react"
import { X, CheckCircle, Loader2, Home, Briefcase, MapPin, Trash2 } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

// ─── Types (export so both pages can import) ──────────────────────────────────

export interface Address {
  id: string
  label?: string | null
  fullName?: string | null
  phoneNumber?: string | null
  state: string
  lga: string
  town: string
  street?: string | null
  isDefault: boolean
}

export interface AddressForm {
  label: string
  fullName: string
  phoneNumber: string
  state: string
  lga: string
  town: string
  street: string
  isDefault: boolean
}

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 " +
  "focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/25 focus:border-[var(--theme-primary)] transition-all"

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
        {label}
        {required && <span className="text-[var(--theme-primary)] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ─── AddressModal ─────────────────────────────────────────────────────────────

interface AddressModalProps {
  /** Pass an existing address to edit, or null/undefined to create a new one */
  address?: Address | null
  onClose: () => void
  onSave: (data: AddressForm) => Promise<void>
  onDelete?: () => Promise<void> | void
  defaultName?: string
}

const NIGERIAN_STATES = [
"FCT", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
"Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe",
"Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
"Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
"Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
]

const LABEL_OPTIONS = [
  { key: "Home",  Icon: Home },
  { key: "Work",  Icon: Briefcase },
  { key: "Other", Icon: MapPin },
] as const

export function AddressModal({ address, onClose, onSave, onDelete, defaultName }: AddressModalProps) {
   const user = useCurrentUser()
  const [form, setForm] = useState<AddressForm>({
    label:       address?.label       ?? "Home",
    fullName:    address?.fullName    ?? user?.name ?? defaultName ?? "",
    phoneNumber: address?.phoneNumber ?? "",
    state:       address?.state       ?? "Abuja",
    lga:         address?.lga         ?? "",
    town:        address?.town        ?? "",
    street:      address?.street      ?? "",
    isDefault:   address?.isDefault   ?? false,
  })
  const [saving, setSaving] = useState(false)

  const set =
    (key: keyof AddressForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({
        ...f,
        [key]:
          e.target.type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : e.target.value,
      }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {address ? "Edit Address" : "Add New Address"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {address ? "Update your delivery address" : "Save a new delivery address"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">

          {/* Label selector */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Address Label
            </label>
            <div className="flex gap-2">
              {LABEL_OPTIONS.map(({ key, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, label: key }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    form.label === key
                      ? "bg-[var(--theme-primary)] text-white border-[var(--theme-primary)]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[var(--theme-primary)]/40 hover:text-[var(--theme-primary)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Full name */}
          <Field label="Full Name" required>
            <input
              value={form.fullName}
              onChange={set("fullName")}
              placeholder="e.g. Adewale Tunde"
              required
              className={inputCls}
            />
          </Field>

          {/* Phone */}
          <Field label="Phone Number">
            <input
              value={form.phoneNumber}
              onChange={set("phoneNumber")}
              placeholder="+234 800 000 0000"
              type="tel"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            {/* State */}
            <Field label="State" required>
              <select value={form.state} onChange={set("state")} required className={inputCls}>
                {NIGERIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>

            {/* LGA */}
            <Field label="LGA" required>
              <input
                value={form.lga}
                onChange={set("lga")}
                placeholder="e.g. Ibadan North"
                required
                className={inputCls}
              />
            </Field>
          </div>

          {/* Town */}
          <Field label="Town / Area" required>
            <input
              value={form.town}
              onChange={set("town")}
              placeholder="e.g. Bodija"
              required
              className={inputCls}
            />
          </Field>

          {/* Street */}
          <Field label="Street Address">
            <input
              value={form.street}
              onChange={set("street")}
              placeholder="e.g. 14 Awolowo Avenue"
              className={inputCls}
            />
          </Field>

          {/* Set as default */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={set("isDefault")}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-[var(--theme-primary)] transition-colors" />
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-4" />
            </div>
            <span className="text-sm font-medium text-gray-700">Set as default address</span>
          </label>

          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[var(--theme-primary)] hover:opacity-90 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-[var(--theme-primary)]/20"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> {address ? "Update Address" : "Save Address"}</>
            )}
          </button>

          {address && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full py-3 mt-2 flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Address
            </button>
          )}
        </form>
      </div>
    </div>
  )
}