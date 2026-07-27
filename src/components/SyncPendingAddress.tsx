//src/components/SyncPendingAddress.tsx
"use client"

import { useSyncPendingAddress } from "@/hooks/useSyncPendingAddress"

export function SyncPendingAddress() {
  useSyncPendingAddress()
  return null
}