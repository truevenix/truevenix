// lib/installments.ts
//
// Shared helpers for the installment (BNPL) payment feature. Kept separate
// from the route handlers so both /api/paystack/initialize and
// /api/installments/pay compute amounts and references the exact same way —
// any drift here would make the webhook's amount-verification step reject
// legitimate payments.

export const ALLOWED_INSTALLMENT_COUNTS = [2, 3, 4] as const
export type InstallmentCount = (typeof ALLOWED_INSTALLMENT_COUNTS)[number]

export function isAllowedInstallmentCount(value: unknown): value is InstallmentCount {
  return ALLOWED_INSTALLMENT_COUNTS.includes(value as InstallmentCount)
}

// 1 installment = 1 month. Returns the sentence shown next to the count
// picker, e.g. "You'll have 2 months to complete this payment." The last
// count in ALLOWED_INSTALLMENT_COUNTS is always called the "maximum" so this
// doesn't need editing again if the max ever changes.
export function installmentDurationLabel(count: number): string {
  const isMax = count === ALLOWED_INSTALLMENT_COUNTS[ALLOWED_INSTALLMENT_COUNTS.length - 1]
  return isMax
    ? `You'll have ${count} months maximum to complete this payment.`
    : `You'll have ${count} month${count === 1 ? "" : "s"} to complete this payment.`
}

// Placeholder page — see handoff note. Kept as one constant so mobile and
// web point at the same URL without needing a coordinated redeploy.
export const INSTALLMENT_TERMS_URL = "https://www.truevenix.com/installment-terms"

// Splits totalAmount into `count` installments. Every installment except the
// last is floored to the nearest Naira so we never round up and overcharge;
// the last installment absorbs whatever remainder that leaves, so the sum of
// the parts always equals totalAmount exactly (kobo-safe for Paystack).
export function computeInstallmentAmounts(totalAmount: number, count: number): number[] {
  const base = Math.floor(totalAmount / count)
  const amounts = new Array(count - 1).fill(base)
  const sumSoFar = base * (count - 1)
  const last = Math.round((totalAmount - sumSoFar) * 100) / 100
  amounts.push(last)
  return amounts
}

// e.g. "VNX-1735212345-AB12CD34" + 2 -> "VNX-1735212345-AB12CD34-INST-2"
// Kept distinct from the order's own referenceId so the webhook can tell at
// a glance (and by DB lookup) whether a charge.success event is for a
// one-off order payment or for one specific installment.
export function installmentReference(orderReferenceId: string, installmentNo: number) {
  return `${orderReferenceId}-INST-${installmentNo}`
}