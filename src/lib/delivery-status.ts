// src/lib/delivery-status.ts
// Single source of truth for delivery-status labels, colors, and copy.
// Previously this was duplicated between the orders list, the order detail
// page, and (soon) the admin dashboard — now everything imports from here.

import { CheckCircle2, Clock, PackageSearch, Truck, XCircle, type LucideIcon } from "lucide-react"

export const DELIVERY_STATUS_VALUES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const

export type DeliveryStatusValue = (typeof DELIVERY_STATUS_VALUES)[number]

export type DeliveryStatusConfig = {
  value: DeliveryStatusValue
  label: string
  color: string
  bg: string
  icon: LucideIcon
}

export const DELIVERY_STATUS_CONFIG: Record<DeliveryStatusValue, DeliveryStatusConfig> = {
  PENDING:   { value: "PENDING",   label: "Placed",    color: "#b45309", bg: "#fef3c7", icon: Clock },
  CONFIRMED: { value: "CONFIRMED", label: "Confirmed", color: "#1d4ed8", bg: "#dbeafe", icon: PackageSearch },
  SHIPPED:   { value: "SHIPPED",   label: "Shipped",   color: "#6d28d9", bg: "#ede9fe", icon: Truck },
  DELIVERED: { value: "DELIVERED", label: "Delivered", color: "#15803d", bg: "#dcfce7", icon: CheckCircle2 },
  CANCELLED: { value: "CANCELLED", label: "Cancelled", color: "#b91c1c", bg: "#fee2e2", icon: XCircle },
}

// Ordered steps for the tracker UI. CANCELLED is a terminal branch, not a step,
// so it's handled separately by whatever component renders the stepper.
export const DELIVERY_STEPS: DeliveryStatusConfig[] = [
  DELIVERY_STATUS_CONFIG.PENDING,
  DELIVERY_STATUS_CONFIG.CONFIRMED,
  DELIVERY_STATUS_CONFIG.SHIPPED,
  DELIVERY_STATUS_CONFIG.DELIVERED,
]

export const DELIVERY_STATUS_INDEX: Record<DeliveryStatusValue, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  CANCELLED: -1,
}

// Flat options for <select> inputs — e.g. the admin "Update order" modal.
export const DELIVERY_STATUS_OPTIONS = DELIVERY_STATUS_VALUES.map((value) => ({
  value,
  label: DELIVERY_STATUS_CONFIG[value].label,
}))

export function deliveryStatusConfig(status: string): DeliveryStatusConfig {
  return DELIVERY_STATUS_CONFIG[status as DeliveryStatusValue] ?? DELIVERY_STATUS_CONFIG.PENDING
}

// Human copy shared by the status-history note and the push notification body.
export function deliveryStatusMessage(status: DeliveryStatusValue): string {
  switch (status) {
    case "PENDING":   return "Your order has been placed and is awaiting confirmation."
    case "CONFIRMED": return "Your order has been confirmed and is being prepared."
    case "SHIPPED":   return "Your order is on its way."
    case "DELIVERED": return "Your order has been delivered. Enjoy!"
    case "CANCELLED": return "Your order has been cancelled."
    default:          return "Your order status has been updated."
  }
}
