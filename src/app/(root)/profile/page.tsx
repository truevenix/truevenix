"use client"
// app/profile/page.tsx — Truevenix profile page
//
// Restructured to match the mobile app's account screen: one scrollable
// page, sections stacked top to bottom, no Account/Activity/Settings tab
// switcher. Settings rows that had nothing behind them (Dark Mode, Language,
// Change Password, Two-Factor Auth, the notification toggle that never
// persisted anywhere) are dropped rather than kept as dead UI — same
// principle the mobile screen already followed. Address management stays
// fully inline here (unlike mobile, which links out to a separate screen)
// since it was already built and working.

import { signOut, useSession } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  User, Mail, Phone, MapPin, ShoppingBag, Heart,
  HelpCircle, FileText, ShieldCheck, LogOut, ChevronRight, Camera,
  Plus, Trash2, Edit2, Loader2, Home, Briefcase, Repeat, Bell, BellOff,
} from "lucide-react"
import { AddressModal, type Address, type AddressForm } from "@/components/AddressModal"
import { useCurrentUser } from "@/hooks/use-current-user"
import { handleProfileImageSaveToFirebase } from "@/lib/upload"
import { useWebPush } from "@/hooks/use-web-push"

// ─── Row item ─────────────────────────────────────────────────────────────────

function RowItem({
  icon: Icon, iconBg, iconColor, label, value, onClick, danger,
}: {
  icon: React.ElementType
  iconBg: string
  iconColor?: string
  label: string
  value?: string
  onClick?: () => void
  danger?: boolean
}) {
  const Wrapper = onClick ? "button" : "div"
  return (
    <Wrapper
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 text-left transition-colors duration-200 ${
        onClick ? "hover:bg-gray-50 cursor-pointer" : ""
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-[17px] h-[17px] ${iconColor ?? (danger ? "text-red-500" : "text-[var(--theme-primary)]")}`} />
      </div>
      <span className={`flex-1 text-sm font-medium ${danger ? "text-red-500" : "text-gray-800"}`}>{label}</span>
      <div className="flex items-center gap-1.5 max-w-[160px]">
        {value && <span className="text-xs truncate text-gray-400">{value}</span>}
        {onClick && !danger && <ChevronRight className="w-4 h-4 text-gray-300" />}
      </div>
    </Wrapper>
  )
}

function ToggleRow({
  icon: Icon, iconBg, iconColor, label, sublabel, checked, disabled, busy, onChange,
}: {
  icon: React.ElementType
  iconBg: string
  iconColor?: string
  label: string
  sublabel?: string
  checked: boolean
  disabled?: boolean
  busy?: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="flex w-full items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-[17px] h-[17px] ${iconColor ?? "text-[var(--theme-primary)]"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled || busy}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full shrink-0 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
          checked ? "bg-[var(--theme-primary)]" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}

function SectionHead({ title }: { title: string }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest mt-5 mb-2 px-1 text-[var(--theme-primary)]">
      {title}
    </p>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {children}
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const user = useCurrentUser()
  const { update } = useSession()

  const [avatarUrl, setAvatarUrl]       = useState<string | null>(user?.image ?? null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadProgress, setUploadProgress]   = useState(0)
  const [addresses, setAddresses]       = useState<Address[]>([])
  const [addrLoading, setAddrLoading]   = useState(false)
  const [showModal, setShowModal]       = useState(false)
  const [editingAddr, setEditingAddr]   = useState<Address | null>(null)
  const [toast, setToast]               = useState<{ msg: string; type: "ok" | "err" } | null>(null)
  const fileRef                         = useRef<HTMLInputElement>(null)
  const webPush                         = useWebPush()

  useEffect(() => { if (user?.image) setAvatarUrl(user.image) }, [user?.image])

  useEffect(() => {
    fetchAddresses()
  }, [])

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Push notifications ─────────────────────────────────────────────────

  const handleTogglePush = async (next: boolean) => {
    const result = next ? await webPush.enable() : await webPush.disable()
    if (result.ok) {
      showToast(next ? "Push notifications enabled" : "Push notifications turned off")
    } else if (result.message) {
      showToast(result.message, "err")
    }
  }

  // ── Address helpers ────────────────────────────────────────────────────────

  const fetchAddresses = async () => {
    setAddrLoading(true)
    try {
      const res = await fetch("/api/addresses")
      if (res.ok) {
        const data = await res.json()
        setAddresses(data.addresses ?? [])
      }
    } catch { /* silent */ }
    finally { setAddrLoading(false) }
  }

  const handleSaveAddress = async (form: AddressForm) => {
    const method = editingAddr ? "PATCH" : "POST"
    const url    = editingAddr ? `/api/addresses/${editingAddr.id}` : "/api/addresses"
    const res    = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      showToast(editingAddr ? "Address updated" : "Address saved")
      setShowModal(false)
      setEditingAddr(null)
      fetchAddresses()
    } else {
      showToast("Could not save address", "err")
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" })
    if (res.ok) {
      showToast("Address removed")
      setAddresses(a => a.filter(x => x.id !== id))
    } else {
      showToast("Could not delete address", "err")
    }
  }

  // ── Avatar upload ──────────────────────────────────────────────────────────
  // Uploads straight to Firebase Storage client-side (same pattern as every
  // other image in the app — src/lib/upload.tsx), then tells the backend the
  // resulting URL so it can save it against the signed-in user. The backend
  // endpoint (POST /api/v1/profile/avatar) is shared with the mobile app,
  // which uploads to the same "profile" folder server-side instead, since it
  // has no browser File object to work with.

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    setUploadProgress(0)

    try {
      const imageUrl = await handleProfileImageSaveToFirebase(file, setUploadProgress)

      const res = await fetch("/api/v1/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? "Could not save profile photo")
      }

      setAvatarUrl(imageUrl)
      await update({ image: imageUrl })
      showToast("Profile photo updated")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update profile photo", "err")
    } finally {
      setUploadingAvatar(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const displayName = user?.name || (user?.email?.split('@')[0]) || "Truevenix User"
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto bg-[var(--theme-primary-light)]">
            <User className="w-10 h-10 text-[var(--theme-primary)]" />
          </div>
          <p className="text-lg font-bold text-gray-700">Not signed in</p>
          <a
            href="/auth/login"
            className="inline-block px-8 py-3 text-white font-bold rounded-full transition-all duration-200 bg-[var(--theme-primary)] hover:opacity-90"
          >
            Sign In
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
              toast.type === "ok" ? "bg-emerald-600" : "bg-red-500"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address modal */}
      <AnimatePresence>
        {showModal && (
          <AddressModal
            address={editingAddr}
            onClose={() => { setShowModal(false); setEditingAddr(null) }}
            onSave={handleSaveAddress}
            onDelete={editingAddr ? () => handleDeleteAddress(editingAddr.id) : undefined}
          />
        )}
      </AnimatePresence>

      <div className="max-w-xl mx-auto pb-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative pt-10 pb-6 px-5 border-b border-gray-100"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-[3px] border-[var(--theme-primary-light)] overflow-hidden">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--theme-primary-light)]">
                    <span className="text-2xl font-black text-[var(--theme-primary)]">{initials}</span>
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                    <span className="text-[10px] font-bold text-white">{uploadProgress}%</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center transition-all duration-200 hover:scale-105 border-2 border-[var(--theme-primary)] disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <h1 className="text-xl font-black text-gray-900 mt-1">{displayName}</h1>

            {user?.email && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Mail size={12} />
                {user.email}
              </p>
            )}
          </div>
        </motion.div>

        <div className="px-4 mt-5">
          {/* Personal information */}
          <SectionHead title="Personal Information" />
          <Card>
            <RowItem
              icon={User}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              label="Full Name"
              value={displayName}
            />
            <RowItem
              icon={Mail}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              label="Email"
              value={user?.email ?? "—"}
            />
            <RowItem
              icon={Phone}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              label="Phone"
              value={user?.phonenumber ?? "Not added"}
            />
          </Card>

          {/* Addresses */}
          <div className="flex items-center justify-between mt-5 mb-2 px-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--theme-primary)]">
              Saved Addresses
            </p>
            <button
              onClick={() => { setEditingAddr(null); setShowModal(true) }}
              className="flex items-center gap-1 text-xs font-bold text-[var(--theme-primary)] hover:opacity-80 transition-opacity duration-200"
            >
              <Plus className="w-3.5 h-3.5" /> Add New
            </button>
          </div>

          {addrLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--theme-primary)]" />
            </div>
          ) : addresses.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center py-8 gap-2">
                <MapPin className="w-8 h-8 text-gray-300" />
                <p className="text-sm font-semibold text-gray-500">No addresses yet</p>
                <p className="text-xs text-gray-400 text-center">Add your home or office for faster checkout</p>
                <button
                  onClick={() => { setEditingAddr(null); setShowModal(true) }}
                  className="mt-2 px-5 py-2 text-white text-sm font-bold rounded-full transition-all duration-200 bg-[var(--theme-primary)] hover:opacity-90"
                >
                  Add Address
                </button>
              </div>
            </Card>
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence>
                {addresses.map(addr => (
                  <motion.div
                    key={addr.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-[var(--theme-primary-light)]">
                          {addr.label === "Work" ? (
                            <Briefcase className="w-4 h-4 text-[var(--theme-primary)]" />
                          ) : (
                            <Home className="w-4 h-4 text-[var(--theme-primary)]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-800">{addr.label ?? "Address"}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-[var(--theme-primary)] bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {[addr.street, addr.town, addr.lga, addr.state].filter(Boolean).join(", ")}
                          </p>
                          {addr.phoneNumber && (
                            <p className="text-xs text-gray-400">{addr.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => { setEditingAddr(addr); setShowModal(true) }}
                          className="p-1.5 rounded-lg transition-colors duration-200 bg-[var(--theme-primary)]/10 hover:bg-[var(--theme-primary)]/20"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <button
                onClick={() => { setEditingAddr(null); setShowModal(true) }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-[var(--theme-primary)] hover:border-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] transition-all duration-200"
              >
                <Plus className="w-4 h-4" /> Add Another Address
              </button>
            </div>
          )}

          {/* Preferences */}
          <SectionHead title="Preferences" />
          <Card>
            {webPush.status === "unsupported" ? (
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gray-50">
                  <BellOff className="w-[17px] h-[17px] text-gray-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Push notifications</span>
                  <p className="text-xs text-gray-400 mt-0.5">Not supported in this browser</p>
                </div>
              </div>
            ) : (
              // Find this section in your profile page and update:
<ToggleRow
  icon={webPush.status === "enabled" || webPush.status === "pending" ? Bell : BellOff}
  iconBg="bg-violet-50"
  iconColor="text-violet-600"
  label="Push Notifications"
  sublabel={
    webPush.status === "denied"
      ? "Blocked — enable in browser settings"
      : webPush.status === "pending"
      ? "Enabled — will link to your account shortly"
      : "Order updates and promo alerts on this device"
  }
  checked={webPush.status === "enabled" || webPush.status === "pending"}
  disabled={webPush.status === "denied" || webPush.status === "loading"}
  busy={webPush.busy}
  onChange={handleTogglePush}
/>
            )}
          </Card>

          {/* Truevenix account */}
          <SectionHead title="Truevenix Account" />
          <Card>
            <RowItem icon={ShoppingBag} iconBg="bg-amber-50" iconColor="text-amber-600" label="My Orders" onClick={() => window.location.href = "/orders"} />
            <RowItem icon={Heart}       iconBg="bg-red-50"   iconColor="text-red-500"   label="Wishlist"   onClick={() => window.location.href = "/wishlist"} />
          </Card>

          {/* Support */}
          <SectionHead title="Support" />
          <Card>
            <RowItem icon={HelpCircle}  iconBg="bg-blue-50"    iconColor="text-blue-600"    label="Help & FAQ"        onClick={() => window.open("https://www.truevenix.com/contact-us", "_blank")} />
            <RowItem icon={FileText}    iconBg="bg-violet-50"  iconColor="text-violet-600"  label="Terms & Conditions" onClick={() => window.open("https://www.truevenix.com/terms-and-conditions", "_blank")} />
            <RowItem icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Privacy Policy"    onClick={() => window.open("https://www.truevenix.com/privacy-policy", "_blank")} />
            <RowItem icon={Repeat}      iconBg="bg-red-50"     iconColor="text-red-500"     label="Return Policy"     onClick={() => window.open("https://www.truevenix.com/return-policy", "_blank")} />
          </Card>

          {/* Sign out */}
          <SectionHead title="" />
          <Card>
            <RowItem
              icon={LogOut}
              iconBg="bg-red-50"
              label="Sign Out"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              danger
            />
          </Card>
        </div>
      </div>
    </div>
  )
}