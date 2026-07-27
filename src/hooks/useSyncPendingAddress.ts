//src/hooks/useSyncPendingAddress.ts
"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useDeliveryAddress } from "@/context/DeliveryAddressContext"

export function useSyncPendingAddress() {
  const { data: session, status } = useSession()
  const {
    pendingAddress,
    clearPendingAddress,
    saveAddress,
    claimGuestAddresses,
  } = useDeliveryAddress()

  const hasSyncedPending = useRef(false)
  const hasClaimedGuest = useRef(false)

  // 1. Push the localStorage-only pending address into the account.
  useEffect(() => {
    if (status !== "authenticated") return
    if (!session?.user?.id) return
    if (!pendingAddress) return
    if (hasSyncedPending.current) return

    hasSyncedPending.current = true

    const { id, ...formData } = pendingAddress
    saveAddress(formData as Parameters<typeof saveAddress>[0]).then((saved) => {
      if (saved) {
        clearPendingAddress()
      } else {
        hasSyncedPending.current = false // allow retry on next render
      }
    })
  }, [status, session?.user?.id, pendingAddress, saveAddress, clearPendingAddress])

  // 2. Re-attach any addresses already saved in the DB under this account's
  //    email from a previous guest checkout (guestEmail, userId: null).
  useEffect(() => {
    if (status !== "authenticated") return
    if (!session?.user?.id) return
    if (hasClaimedGuest.current) return

    hasClaimedGuest.current = true
    claimGuestAddresses()
  }, [status, session?.user?.id, claimGuestAddresses])
}