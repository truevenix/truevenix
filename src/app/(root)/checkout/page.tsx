"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMutation } from "@tanstack/react-query"
import {ArrowLeft, CheckCircle2, CreditCard, Mail, MapPin, Package, Phone, User, Loader2, AlertCircle, Check, Truck, Lock, LogIn, Plus, Edit2, Home, Briefcase,} from "lucide-react"
import { toast } from "sonner"
import { formatPrice, useCart } from "@/context/cart-context"
import { useCurrentUserWithStatus } from "@/hooks/use-current-user"
import { AddressModal, type Address, type AddressForm } from "@/components/AddressModal"
import { useDeliveryAddress } from "@/context/DeliveryAddressContext"

// ─── Helpers ───────────────────────────────────────────────────────────────────

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function formatAddressLine(addr: Address) {
  return [addr.street, addr.town, addr.lga, addr.state].filter(Boolean).join(", ")
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  icon: Icon,
  label,
  error,
  children,
}: {
  icon: React.ElementType
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
        <Icon size={13} style={{ color: "var(--theme-primary)" }} />
        {label}
      </span>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  )
}

// ─── Styled input ──────────────────────────────────────────────────────────────

function StyledInput({
  value,
  onChange,
  placeholder,
  type = "text",
  valid,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
  valid?: boolean
  disabled?: boolean
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border-2 px-3.5 py-2.5 transition-all duration-200"
      style={{
        borderColor: focused ? "var(--theme-primary)" : "hsl(var(--border))",
        boxShadow: focused
          ? "0 0 0 3px color-mix(in srgb, var(--theme-primary) 15%, transparent)"
          : "none",
        opacity: disabled ? 0.7 : 1,
        backgroundColor: disabled ? "hsl(var(--muted))" : "transparent",
      }}
    >
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed"
      />
      {valid && <Check size={14} className="shrink-0 text-emerald-500" />}
    </div>
  )
}

// ─── Styled textarea ───────────────────────────────────────────────────────────

function StyledTextarea({
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  rows?: number
}) {
  const [focused, setFocused] = useState(false)

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="w-full resize-none rounded-xl border-2 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all duration-200"
      style={{
        borderColor: focused ? "var(--theme-primary)" : "hsl(var(--border))",
        boxShadow: focused
          ? "0 0 0 3px color-mix(in srgb, var(--theme-primary) 15%, transparent)"
          : "none",
      }}
    />
  )
}

// ─── Payment method card ───────────────────────────────────────────────────────

function PaymentCard({
  value,
  current,
  label,
  description,
  icon: Icon,
  onSelect,
}: {
  value: "paystack" | "pay-on-delivery"
  current: string
  label: string
  description: string
  icon: React.ElementType
  onSelect: () => void
}) {
  const selected = value === current

  return (
    <div
      onClick={onSelect}
      className="relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200"
      style={{
        borderColor: selected ? "var(--theme-primary)" : "hsl(var(--border))",
        backgroundColor: selected
          ? "color-mix(in srgb, var(--theme-primary) 6%, white)"
          : "white",
        boxShadow: selected
          ? "0 4px 14px color-mix(in srgb, var(--theme-primary) 18%, transparent)"
          : "none",
      }}
    >
      {selected && (
        <div
          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--theme-primary)" }}
        >
          <Check size={11} className="stroke-[3] text-white" />
        </div>
      )}
      <div className="flex items-start gap-3 pr-6">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200"
          style={{
            backgroundColor: selected
              ? "color-mix(in srgb, var(--theme-primary) 16%, transparent)"
              : "color-mix(in srgb, var(--theme-primary) 8%, white)",
          }}
        >
          <Icon size={16} style={{ color: "var(--theme-primary)" }} />
        </div>
        <div>
          <p
            className="text-sm font-bold"
            style={{ color: selected ? "var(--theme-primary)" : "#1f2937" }}
          >
            {label}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Address card ──────────────────────────────────────────────────────────────

function AddressCard({
  addr,
  selected,
  onSelect,
  onEdit,
}: {
  addr: Address
  selected: boolean
  onSelect: () => void
  onEdit: () => void
}) {
  const Icon =
    addr.label === "Work" ? Briefcase : addr.label === "Other" ? MapPin : Home

  return (
    <motion.div
      layout
      onClick={onSelect}
      className="relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200"
      style={{
        borderColor: selected ? "var(--theme-primary)" : "hsl(var(--border))",
        backgroundColor: selected
          ? "color-mix(in srgb, var(--theme-primary) 5%, white)"
          : "white",
        boxShadow: selected
          ? "0 4px 12px color-mix(in srgb, var(--theme-primary) 18%, transparent)"
          : "none",
      }}
    >
      {selected && (
        <div
          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--theme-primary)" }}
        >
          <Check size={11} className="stroke-[3] text-white" />
        </div>
      )}

      <div className="flex items-start gap-3 pr-6">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200"
          style={{
            backgroundColor: selected
              ? "color-mix(in srgb, var(--theme-primary) 15%, white)"
              : "color-mix(in srgb, var(--theme-primary) 6%, white)",
          }}
        >
          <Icon size={15} style={{ color: "var(--theme-primary)" }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-sm font-bold"
              style={{ color: selected ? "var(--theme-primary)" : "#1f2937" }}
            >
              {addr.label ?? "Address"}
            </span>
            {addr.isDefault && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  color: "var(--theme-primary)",
                  backgroundColor:
                    "color-mix(in srgb, var(--theme-primary) 12%, white)",
                  border:
                    "1px solid color-mix(in srgb, var(--theme-primary) 25%, transparent)",
                }}
              >
                Default
              </span>
            )}
          </div>
          {addr.fullName && (
            <p className="mt-0.5 text-xs font-semibold text-gray-700">
              {addr.fullName}
            </p>
          )}
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
            {formatAddressLine(addr)}
          </p>
          {addr.phoneNumber && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
              <Phone size={10} /> {addr.phoneNumber}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onEdit()
        }}
        className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-200"
        style={{
          backgroundColor: selected
            ? "color-mix(in srgb, var(--theme-primary) 12%, white)"
            : "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor =
            "color-mix(in srgb, var(--theme-primary) 15%, white)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = selected
            ? "color-mix(in srgb, var(--theme-primary) 12%, white)"
            : "transparent"
        }}
      >
        <Edit2 size={13} style={{ color: "var(--theme-primary)" }} />
      </button>
    </motion.div>
  )
}

// ─── Account / guest banner ────────────────────────────────────────────────────

function AccountBanner({
  user,
  sessionLoading,
}: {
  user: ReturnType<typeof useCurrentUserWithStatus>["user"]
  sessionLoading: boolean
}) {
  if (sessionLoading) {
    return (
      <div
        className="rounded-2xl border bg-white p-5 shadow-sm"
        style={{
          borderColor:
            "color-mix(in srgb, var(--theme-primary) 20%, hsl(var(--border)))",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 animate-pulse rounded-full"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--theme-primary) 10%, #e5e7eb)",
            }}
          />
          <div className="flex flex-col gap-2">
            <div
              className="h-3 w-32 animate-pulse rounded-full"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--theme-primary) 8%, #e5e7eb)",
              }}
            />
            <div
              className="h-2.5 w-48 animate-pulse rounded-full"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--theme-primary) 5%, #e5e7eb)",
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "User"
  const userInitials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-white p-5 shadow-sm"
        style={{
          borderColor:
            "color-mix(in srgb, var(--theme-primary) 20%, hsl(var(--border)))",
        }}
      >
        <h2 className="mb-4 flex items-center gap-2 font-extrabold text-gray-800">
          <User size={16} style={{ color: "var(--theme-primary)" }} />
          Ordering As
        </h2>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--theme-primary) 8%, white)",
              color: "var(--theme-primary)",
              borderColor:
                "color-mix(in srgb, var(--theme-primary) 20%, hsl(var(--border)))",
            }}
          >
            {userInitials}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{displayName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-white p-5 shadow-sm"
      style={{
        borderColor:
          "color-mix(in srgb, var(--theme-primary) 20%, hsl(var(--border)))",
      }}
    >
      <div
        className="flex items-center justify-between rounded-xl p-3.5"
        style={{
          background: "color-mix(in srgb, var(--theme-primary) 6%, white)",
          border:
            "1px solid color-mix(in srgb, var(--theme-primary) 20%, transparent)",
        }}
      >
        <div className="flex items-center gap-2">
          <User size={14} style={{ color: "var(--theme-primary)" }} />
          <p className="text-xs font-bold text-gray-700">
            Checking out as a{" "}
            <span style={{ color: "var(--theme-primary)" }}>guest</span>
          </p>
        </div>
        <Link
          href="/auth/login?callbackUrl=/checkout"
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all"
          style={{
            color: "var(--theme-primary)",
            background: "color-mix(in srgb, var(--theme-primary) 10%, white)",
          }}
        >
          <LogIn size={11} /> Sign in
        </Link>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-gray-500">
        Sign in for faster checkout next time, or continue below without an
        account — just use a real email so you can track your order afterward.
      </p>
    </motion.div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { user, isLoading: sessionLoading } = useCurrentUserWithStatus()
  const { items, totalItems, totalPrice, deliveryFee, clearCart } = useCart()
  const { pendingAddress, activeAddress } = useDeliveryAddress()

  // Grand total = subtotal + delivery (no promo on checkout page — applied on cart page)
  const grandTotal = totalPrice + deliveryFee

  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({})

  // ── Contact + payment form ─────────────────────────────────────────────────
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    paymentMethod: "paystack" as "paystack" | "pay-on-delivery",
    notes: "",
  })

  // ── Address state ──────────────────────────────────────────────────────────
  const [addresses, setAddresses]           = useState<Address[]>([])
  const [addrLoading, setAddrLoading]       = useState(false)
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null)
  const [showModal, setShowModal]           = useState(false)
  const [editingAddr, setEditingAddr]       = useState<Address | null>(null)

  const selectedAddr = addresses.find((a) => a.id === selectedAddrId) ?? null

  // ── Prefill form: session first, then whatever the navbar's "Deliver to" ───
  // flow already captured (activeAddress for signed-in users, pendingAddress
  // in localStorage for guests) as a fallback for the name field.
  useEffect(() => {
    if (sessionLoading) return
    setForm((f) => {
      if (f.customerName && f.customerEmail) return f

      const fallbackName = user
        ? activeAddress?.fullName ?? ""
        : pendingAddress?.fullName ?? ""

      return {
        ...f,
        customerName: f.customerName || user?.name || fallbackName,
        customerEmail: f.customerEmail || user?.email || "",
      }
    })
  }, [user, sessionLoading, activeAddress, pendingAddress])

  const effectiveEmail = user?.email ?? form.customerEmail.trim()

  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: val }))
    setFormErrors((e) => ({ ...e, [key]: undefined }))
  }

  // ── Fetch addresses ────────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionLoading) return

    if (user) {
      ;(async () => {
        setAddrLoading(true)
        try {
          const res = await fetch("/api/addresses")
          if (res.ok) {
            const data = await res.json()
            let list: Address[] = data.addresses ?? []

            // Fold in the navbar's activeAddress if the API response
            // somehow doesn't already include it (edge case / stale fetch)
            if (activeAddress && !list.some((a) => a.id === activeAddress.id)) {
              list = [activeAddress, ...list]
            }

            setAddresses(list)
            const def = list.find((a) => a.isDefault) ?? list[0]
            if (def) setSelectedAddrId(def.id)
          }
        } catch {
          toast.error("Could not load your addresses")
        } finally {
          setAddrLoading(false)
        }
      })()
      return
    }

    if (!isValidEmail(form.customerEmail)) {
      // No email yet to look up saved addresses — but the navbar's
      // "Deliver to" flow may have already captured one locally, so
      // surface that instead of leaving the section empty.
      if (pendingAddress) {
        setAddresses([pendingAddress])
        setSelectedAddrId(pendingAddress.id)
      } else {
        setAddresses([])
        setSelectedAddrId(null)
      }
      setAddrLoading(false)
      return
    }

    ;(async () => {
      setAddrLoading(true)
      try {
        const res = await fetch(
          `/api/addresses?guestEmail=${encodeURIComponent(form.customerEmail.trim())}`
        )
        if (res.ok) {
          const data = await res.json()
          let list: Address[] = data.addresses ?? []

          // pendingAddress only lives in localStorage until it's actually
          // saved server-side — fold it in if it's not already present.
          if (pendingAddress && !list.some((a) => a.id === pendingAddress.id)) {
            list = [pendingAddress, ...list]
          }

          setAddresses(list)
          const def = list.find((a) => a.isDefault) ?? pendingAddress ?? list[0]
          if (def) setSelectedAddrId(def.id)
        }
      } catch {
        // Guest fetch failed — fall back to the locally saved address, if any
        if (pendingAddress) {
          setAddresses([pendingAddress])
          setSelectedAddrId(pendingAddress.id)
        }
      } finally {
        setAddrLoading(false)
      }
    })()
  }, [user, sessionLoading, form.customerEmail, pendingAddress, activeAddress])

  // ── Address CRUD ───────────────────────────────────────────────────────────
  const handleSaveAddress = async (formData: AddressForm) => {
    const method = editingAddr ? "PATCH" : "POST"
    const url = editingAddr
      ? `/api/addresses/${editingAddr.id}`
      : "/api/addresses"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        ...(!user && { guestEmail: form.customerEmail.trim() }),
      }),
    })

    if (res.ok) {
      const data = await res.json()
      if (editingAddr) {
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingAddr.id ? data.address : a))
        )
      } else {
        setAddresses((prev) => [...prev, data.address])
        setSelectedAddrId(data.address.id)
      }
      toast.success(editingAddr ? "Address updated ✓" : "Address saved ✓")
      setShowModal(false)
      setEditingAddr(null)
    } else {
      toast.error("Could not save address")
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return

    const url = user
      ? `/api/addresses/${id}`
      : `/api/addresses/${id}?guestEmail=${encodeURIComponent(form.customerEmail.trim())}`

    const res = await fetch(url, { method: "DELETE" })

    if (res.ok) {
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      if (selectedAddrId === id) {
        const remaining = addresses.filter((a) => a.id !== id)
        const def = remaining.find((a) => a.isDefault) ?? remaining[0]
        setSelectedAddrId(def?.id ?? null)
      }
      toast.success("Address removed")
    } else {
      toast.error("Could not delete address")
    }
  }

  // ── Derived guard states ───────────────────────────────────────────────────
  const hasValidEmail = user ? true : isValidEmail(form.customerEmail)
  const hasName       = form.customerName.trim().length > 0
  const hasAddress    = Boolean(selectedAddrId)
  const hasPhone      = Boolean(selectedAddr?.phoneNumber)
  const canOrder      = hasName && hasValidEmail && hasAddress && hasPhone && items.length > 0

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const next: typeof formErrors = {}
    if (!form.customerName.trim()) next.customerName = "Name is required"
    if (!user) {
      if (!form.customerEmail.trim()) next.customerEmail = "Email is required"
      else if (!isValidEmail(form.customerEmail))
        next.customerEmail = "Enter a valid email address"
    }
    if (!hasAddress) next.address = "Please select a delivery address"
    if (hasAddress && !hasPhone)
      next.phone = "Your selected address needs a phone number — edit it to add one"
    setFormErrors(next)
    return Object.keys(next).length === 0
  }

  // ── Initialize payment ─────────────────────────────────────────────────────
  const { mutate: initializePayment, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      const checkoutItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        imageColor: item.imageColor ?? "Default",
        imageColorCode: item.imageColorCode ?? "#475569",
        imageUrl: item.imageUrl ?? "",
      }))

      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          customerEmail: user ? null : effectiveEmail,
          guestEmail: user ? null : effectiveEmail,
          customerPhone: selectedAddr?.phoneNumber ?? "",
          address: selectedAddr ? formatAddressLine(selectedAddr) : "",
          paymentMethod: form.paymentMethod,
          deliveryFee,
          items: checkoutItems,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment")
      return data
    },
    onSuccess: (data) => {
      clearCart()

      if (form.paymentMethod === "pay-on-delivery") {
        toast.success("Order placed! We will contact you before delivery.")
        if (data.order?.referenceId) {
          window.location.href = `/orders?email=${encodeURIComponent(data.order.customerEmail)}`
        }
        return
      }

      if (data.payment?.authorizationUrl) {
        toast.success("Redirecting to payment…")
        window.location.href = data.payment.authorizationUrl
      } else {
        toast.info(data.payment?.message || "Order saved. Payment can be completed manually.")
      }
    },
    onError: (e: Error) => {
      toast.error(e.message || "Failed to place order. Please try again.")
    },
  })

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (items.length === 0) {
      toast.error("Your cart is empty.")
      return
    }
    initializePayment()
  }

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-4"
        style={{ backgroundColor: "color-mix(in srgb, var(--theme-primary) 4%, white)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "color-mix(in srgb, var(--theme-primary) 10%, white)" }}
          >
            <Package size={32} style={{ color: "var(--theme-primary)" }} />
          </div>
          <p className="mb-1 font-bold text-gray-800">Your cart is empty</p>
          <p className="mb-5 text-sm text-gray-500">Add some items before checking out.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white"
            style={{ backgroundColor: "var(--theme-primary)" }}
          >
            Browse products
          </Link>
        </motion.div>
      </main>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main
      className="min-h-screen px-4 py-8 md:px-6 md:py-12"
      style={{ backgroundColor: "color-mix(in srgb, var(--theme-primary) 4%, white)" }}
    >
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors duration-200 hover:text-gray-900"
          >
            <ArrowLeft size={14} /> Back to cart
          </Link>
          <p
            className="text-sm font-black uppercase tracking-widest"
            style={{ color: "var(--theme-primary)" }}
          >
            {sessionLoading ? "" : user ? "Checkout" : "Guest checkout"}
          </p>
          <p className="mt-1.5 text-sm text-gray-500">
            {sessionLoading
              ? "Loading your details…"
              : user
                ? "Review your order and confirm delivery details below."
                : " "}
          </p>
        </div>

        {/* Address modal */}
        <AnimatePresence>
          {showModal && (
            <AddressModal
              address={editingAddr}
              onClose={() => { setShowModal(false); setEditingAddr(null) }}
              onSave={handleSaveAddress}
              onDelete={editingAddr ? () => handleDeleteAddress(editingAddr.id) : undefined}
              defaultName={form.customerName.trim() || user?.name || ""}
            />
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* ══ LEFT COLUMN ══════════════════════════════════════════ */}
            <div className="flex flex-col gap-5 lg:col-span-2">

              {/* 1. Account / Guest Banner */}
              <AccountBanner user={user} sessionLoading={sessionLoading} />

              {/* 2. Contact Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 }}
                className="rounded-2xl border bg-white p-5 shadow-sm"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--theme-primary) 20%, hsl(var(--border)))",
                }}
              >
                <h2 className="mb-4 flex items-center gap-2 font-extrabold text-gray-800">
                  <User size={16} style={{ color: "var(--theme-primary)" }} />
                  Contact Details
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field icon={User} label="Full name" error={formErrors.customerName}>
                    <StyledInput
                      value={form.customerName}
                      onChange={(v) => set("customerName", v)}
                      placeholder="Your full name"
                      valid={form.customerName.trim().length > 1}
                    />
                  </Field>
                  <Field icon={Mail} label="Email address" error={formErrors.customerEmail}>
                    <StyledInput
                      type="email"
                      value={form.customerEmail}
                      onChange={(v) => set("customerEmail", v)}
                      placeholder="name@example.com"
                      valid={isValidEmail(form.customerEmail)}
                      disabled={Boolean(user?.email)}
                    />
                  </Field>
                </div>

                {user?.email && (
                  <p className="mt-2 text-[11px] text-gray-400">
                    Using your account email. To use a different email, sign out first.
                  </p>
                )}
              </motion.div>

              {/* 3. Delivery Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="rounded-2xl border bg-white p-5 shadow-sm"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--theme-primary) 20%, hsl(var(--border)))",
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-extrabold text-gray-800">
                    <MapPin size={16} style={{ color: "var(--theme-primary)" }} />
                    Delivery Address
                  </h2>
                  {!sessionLoading && (user || isValidEmail(form.customerEmail)) && (
                    <button
                      type="button"
                      onClick={() => { setEditingAddr(null); setShowModal(true) }}
                      className="flex items-center gap-1 text-xs font-bold transition-colors duration-200"
                      style={{ color: "var(--theme-primary)" }}
                    >
                      <Plus size={13} /> Add New
                    </button>
                  )}
                </div>

                {hasAddress && !hasPhone && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-amber-700"
                    style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}
                  >
                    <AlertCircle size={13} className="shrink-0" />
                    This address has no phone number — edit it to add one before placing your order.
                  </motion.div>
                )}

                {sessionLoading ? (
                  <div className="flex items-center justify-center gap-2 py-10">
                    <Loader2 size={18} className="animate-spin" style={{ color: "var(--theme-primary)" }} />
                    <span className="text-sm text-gray-400">Loading your details…</span>
                  </div>
                ) : !user && !isValidEmail(form.customerEmail) ? (
                  <div
                    className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed py-10"
                    style={{ borderColor: "color-mix(in srgb, var(--theme-primary) 25%, #e5e7eb)" }}
                  >
                    <Mail size={20} style={{ color: "color-mix(in srgb, var(--theme-primary) 40%, #9ca3af)" }} />
                    <p className="text-sm font-bold text-gray-500">Enter your email above first</p>
                    <p className="text-xs text-gray-400">Your saved addresses will appear here</p>
                  </div>
                ) : addrLoading ? (
                  <div className="flex items-center justify-center gap-2 py-10">
                    <Loader2 size={18} className="animate-spin" style={{ color: "var(--theme-primary)" }} />
                    <span className="text-sm text-gray-400">Loading addresses…</span>
                  </div>
                ) : addresses.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed py-10"
                    style={{ borderColor: "color-mix(in srgb, var(--theme-primary) 25%, #e5e7eb)" }}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: "color-mix(in srgb, var(--theme-primary) 8%, white)" }}
                    >
                      <MapPin size={20} style={{ color: "var(--theme-primary)" }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-700">No saved addresses</p>
                      <p className="mt-0.5 text-xs text-gray-400">Add a delivery address to continue</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setEditingAddr(null); setShowModal(true) }}
                      className="flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold text-white shadow-sm transition-all duration-200"
                      style={{ backgroundColor: "var(--theme-primary)" }}
                    >
                      <Plus size={14} /> Add Address
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <AnimatePresence>
                      {addresses.map((addr) => (
                        <AddressCard
                          key={addr.id}
                          addr={addr}
                          selected={addr.id === selectedAddrId}
                          onSelect={() => setSelectedAddrId(addr.id)}
                          onEdit={() => { setEditingAddr(addr); setShowModal(true) }}
                        />
                      ))}
                    </AnimatePresence>

                    <button
                      type="button"
                      onClick={() => { setEditingAddr(null); setShowModal(true) }}
                      className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3 text-sm font-medium transition-all duration-200"
                      style={{
                        borderColor: "color-mix(in srgb, var(--theme-primary) 25%, #e5e7eb)",
                        color: "var(--theme-primary)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--theme-primary)"
                        e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--theme-primary) 4%, white)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "color-mix(in srgb, var(--theme-primary) 25%, #e5e7eb)"
                        e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <Plus size={14} /> Add Another Address
                    </button>
                  </div>
                )}
              </motion.div>

              {/* 4. Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
                className="rounded-2xl border bg-white p-5 shadow-sm"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--theme-primary) 20%, hsl(var(--border)))",
                }}
              >
                <h2 className="mb-4 flex items-center gap-2 font-extrabold text-gray-800">
                  <CreditCard size={16} style={{ color: "var(--theme-primary)" }} />
                  Payment Method
                </h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  <PaymentCard
                    value="paystack"
                    current={form.paymentMethod}
                    label="Online payment"
                    description="Cards, bank transfer, USSD & more"
                    icon={Lock}
                    onSelect={() => set("paymentMethod", "paystack")}
                  />
                  <PaymentCard
                    value="pay-on-delivery"
                    current={form.paymentMethod}
                    label="Pay on delivery"
                    description="Cash when your order arrives"
                    icon={Truck}
                    onSelect={() => set("paymentMethod", "pay-on-delivery")}
                  />
                </div>

                {form.paymentMethod === "paystack" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 flex items-start gap-3 rounded-xl p-3.5"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--theme-primary) 6%, white)",
                      border: "1px solid color-mix(in srgb, var(--theme-primary) 20%, transparent)",
                    }}
                  >
                    <span className="shrink-0 text-lg">🔒</span>
                    <p className="text-xs leading-relaxed text-gray-600">
                      You&apos;ll be redirected to Paystack&apos;s secure checkout after placing your order.
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* 5. Order Notes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="rounded-2xl border bg-white p-5 shadow-sm"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--theme-primary) 20%, hsl(var(--border)))",
                }}
              >
                <h2 className="mb-3 text-sm font-extrabold text-gray-800">
                  Order Notes{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </h2>
                <StyledTextarea
                  value={form.notes}
                  onChange={(v) => set("notes", v)}
                  placeholder="Any special delivery instructions… e.g. 'Call before arrival'"
                />
              </motion.div>

              {/* Delivery notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 rounded-2xl p-4 text-sm"
                style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}
              >
                <span className="shrink-0 text-xl">🚚</span>
                <div>
                  <p className="mb-0.5 font-bold text-orange-700">Delivery available nationwide</p>
                  <p className="text-xs leading-relaxed text-orange-600/80">
                    Enter your full address including state so we can confirm delivery to your area.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* ══ RIGHT COLUMN — Order Summary ═════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-4"
            >
              <div
                className="sticky top-6 rounded-2xl border bg-white p-5 shadow-sm"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--theme-primary) 20%, hsl(var(--border)))",
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-extrabold text-gray-900">Order Summary</h2>
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: "var(--theme-primary)" }}
                  >
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Items list */}
                <div className="mb-4 flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.cartKey}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex gap-3"
                      >
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                          style={{
                            backgroundColor: "color-mix(in srgb, var(--theme-primary) 8%, white)",
                            border: "1px solid color-mix(in srgb, var(--theme-primary) 15%, transparent)",
                          }}
                        >
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={48}
                              height={48}
                              className="h-full w-full rounded-xl object-cover"
                            />
                          ) : (
                            <Package size={18} style={{ color: "var(--theme-primary)" }} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-xs font-semibold text-gray-800">
                            {item.name}
                          </p>
                          {item.imageColor ? (
                            <p className="text-[10px] text-gray-400">
                              {item.imageColor} · ×{item.quantity}
                            </p>
                          ) : (
                            <p className="text-[10px] text-gray-400">Qty {item.quantity}</p>
                          )}
                        </div>
                        <span
                          className="shrink-0 text-xs font-black"
                          style={{ color: "var(--theme-primary)" }}
                        >
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pricing breakdown */}
                <div
                  className="space-y-2 border-t pt-4 text-sm"
                  style={{
                    borderColor: "color-mix(in srgb, var(--theme-primary) 15%, hsl(var(--border)))",
                  }}
                >
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-800">{formatPrice(totalPrice)}</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-500">
                    <span>Delivery</span>
                    <span className="font-bold text-gray-800">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        formatPrice(deliveryFee)
                      )}
                    </span>
                  </div>

                  {deliveryFee === 0 && (
                    <p className="text-[11px] text-emerald-600">
                      🎉 Free delivery applied
                    </p>
                  )}

                  <div
                    className="flex items-center justify-between border-t pt-3"
                    style={{
                      borderColor: "color-mix(in srgb, var(--theme-primary) 15%, hsl(var(--border)))",
                    }}
                  >
                    <span className="font-extrabold text-gray-900">Total</span>
                    <span
                      className="text-xl font-black"
                      style={{ color: "var(--theme-primary)" }}
                    >
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Delivering-to preview */}
                {selectedAddr && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 rounded-xl p-3"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--theme-primary) 6%, white)",
                      border: "1px solid color-mix(in srgb, var(--theme-primary) 20%, transparent)",
                    }}
                  >
                    <p
                      className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--theme-primary)" }}
                    >
                      <MapPin size={10} /> Delivering to
                    </p>
                    <p className="text-xs font-semibold text-gray-800">
                      {selectedAddr.fullName || form.customerName}
                    </p>
                    <p className="text-xs text-gray-500">{formatAddressLine(selectedAddr)}</p>
                    {selectedAddr.phoneNumber && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                        <Phone size={10} /> {selectedAddr.phoneNumber}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Validation hints */}
                <AnimatePresence>
                  {!canOrder && !sessionLoading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-1.5 overflow-hidden"
                    >
                      {!hasName && (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-red-500">
                          <AlertCircle size={11} className="shrink-0" /> Name is required
                        </div>
                      )}
                      {!hasValidEmail && (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-red-500">
                          <AlertCircle size={11} className="shrink-0" /> Valid email required
                        </div>
                      )}
                      {!hasAddress && (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-red-500">
                          <AlertCircle size={11} className="shrink-0" /> Delivery address required
                        </div>
                      )}
                      {hasAddress && !hasPhone && (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600">
                          <AlertCircle size={11} className="shrink-0" /> Address needs a phone number
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting || sessionLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all duration-200 disabled:opacity-60"
                  style={{
                    backgroundColor: canOrder ? "var(--theme-primary)" : "#9CA3AF",
                    boxShadow: canOrder
                      ? "0 8px 20px color-mix(in srgb, var(--theme-primary) 30%, transparent)"
                      : "none",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {form.paymentMethod === "paystack"
                        ? "Initializing payment…"
                        : "Placing order…"}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      {form.paymentMethod === "paystack"
                        ? `Pay ${formatPrice(grandTotal)}`
                        : "Place order"}
                    </>
                  )}
                </motion.button>

                {!canOrder && !sessionLoading && (
                  <p className="mt-2 text-center text-[11px] text-gray-400">
                    Fill in all fields above to continue
                  </p>
                )}
              </div>
            </motion.div>

          </div>
        </form>
      </div>
    </main>
  )
}