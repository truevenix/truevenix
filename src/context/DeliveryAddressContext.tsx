//src/context/DeliveryAddressContext.tsx
"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react"
import { useSession } from "next-auth/react"
import type { Address, AddressForm } from "@/components/AddressModal"

const GUEST_ADDRESS_KEY = "guestAddress"

type DeliveryAddressContextType = {
  /** localStorage-only address for an unauthenticated visitor */
  pendingAddress: Address | null
  /** resolved address for the current session (signed-in user's default) */
  activeAddress: Address | null
  loading: boolean
  setPendingAddress: (addr: Address) => void
  clearPendingAddress: () => void
  saveAddress: (data: AddressForm, existingId?: string) => Promise<Address | null>
  deleteAddress: (id?: string) => Promise<void>
  refreshActiveAddress: () => Promise<void>
  claimGuestAddresses: () => Promise<void>
}

const DeliveryAddressContext = createContext<DeliveryAddressContextType | null>(null)

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID()
    } catch {
      // fall through
    }
  }
  return `addr_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function DeliveryAddressProvider({ children }: { children: ReactNode }) {
  const { status } = useSession()
  const [pendingAddress, setPendingAddressState] = useState<Address | null>(null)
  const [activeAddress, setActiveAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(false)

  // ── Load any guest address saved locally, once on mount ────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(GUEST_ADDRESS_KEY)
    if (stored) {
      try {
        setPendingAddressState(JSON.parse(stored))
      } catch {
        localStorage.removeItem(GUEST_ADDRESS_KEY)
      }
    }
  }, [])

  const setPendingAddress = useCallback((addr: Address) => {
    setPendingAddressState(addr)
    localStorage.setItem(GUEST_ADDRESS_KEY, JSON.stringify(addr))
  }, [])

  const clearPendingAddress = useCallback(() => {
    setPendingAddressState(null)
    localStorage.removeItem(GUEST_ADDRESS_KEY)
  }, [])

  // ── Pull the signed-in user's default/first address ────────────────────────
  const refreshActiveAddress = useCallback(async () => {
    if (status !== "authenticated") return
    setLoading(true)
    try {
      const res = await fetch("/api/addresses")
      if (res.ok) {
        const data = await res.json()
        const addresses: Address[] = data.addresses ?? []
        setActiveAddress(addresses.find((a) => a.isDefault) ?? addresses[0] ?? null)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [status])

  // ── Re-attach addresses saved under guestEmail === this account's email ────
  const claimGuestAddresses = useCallback(async () => {
    if (status !== "authenticated") return
    try {
      const res = await fetch("/api/addresses/claim", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        if (data.claimed > 0) await refreshActiveAddress()
      }
    } catch {
      // silent — non-critical background reconciliation
    }
  }, [status, refreshActiveAddress])

  useEffect(() => {
    if (status === "authenticated") {
      refreshActiveAddress()
    } else if (status === "unauthenticated") {
      setActiveAddress(null)
    }
  }, [status, refreshActiveAddress])

  // ── Save (create or edit) ───────────────────────────────────────────────────
  const saveAddress = useCallback(
    async (data: AddressForm, existingId?: string): Promise<Address | null> => {
      if (status === "authenticated") {
        const url = existingId ? `/api/addresses/${existingId}` : "/api/addresses"
        const method = existingId ? "PATCH" : "POST"
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) return null
        const json = await res.json()
        await refreshActiveAddress()
        return json.address as Address
      }

      // Not signed in — localStorage only. (No email is collected in the
      // navbar flow, so this can't be written to the DB under guestEmail;
      // it gets pushed up automatically once the user logs in.)
      const saved: Address = { id: existingId ?? pendingAddress?.id ?? generateId(), ...data }
      setPendingAddress(saved)
      return saved
    },
    [status, pendingAddress, refreshActiveAddress, setPendingAddress]
  )

  // ── Delete ───────────────────────────────────────────────────────────────
  const deleteAddress = useCallback(
    async (id?: string) => {
      if (status === "authenticated") {
        const targetId = id ?? activeAddress?.id
        if (!targetId) return
        const res = await fetch(`/api/addresses/${targetId}`, { method: "DELETE" })
        if (res.ok) {
          setActiveAddress(null)
          refreshActiveAddress()
        }
      } else {
        clearPendingAddress()
      }
    },
    [status, activeAddress, clearPendingAddress, refreshActiveAddress]
  )

  return (
    <DeliveryAddressContext.Provider
      value={{
        pendingAddress,
        activeAddress,
        loading,
        setPendingAddress,
        clearPendingAddress,
        saveAddress,
        deleteAddress,
        refreshActiveAddress,
        claimGuestAddresses,
      }}
    >
      {children}
    </DeliveryAddressContext.Provider>
  )
}

export function useDeliveryAddress() {
  const ctx = useContext(DeliveryAddressContext)
  if (!ctx) throw new Error("useDeliveryAddress must be used inside DeliveryAddressProvider")
  return ctx
}