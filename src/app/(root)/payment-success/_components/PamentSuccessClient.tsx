"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Loader2, ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"

type Status = "loading" | "success" | "failed"

const POLL_ATTEMPTS = 6
const POLL_DELAY_MS = 1500

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

export default function PaymentSuccessClient({
  reference,
  orderId,
}: {
  reference: string | null
  orderId: string | null
}) {
  const [status, setStatus] = useState<Status>("loading")
  const [resolvedOrderId, setResolvedOrderId] = useState<string | null>(orderId)

  const theme = {
    primary: "#16a34a",
    primaryLight: "#dcfce7",
    primaryText: "#065f46",
  }

  useEffect(() => {
    if (!reference) {
      setStatus("failed")
      return
    }

    const verify = async () => {
      try {
        // ── Poll DB first: webhook may still be in-flight when Paystack redirects ──
        for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
          const params = new URLSearchParams({ reference })
          if (orderId) params.set("orderId", orderId)

          const res = await fetch(`/api/verify-payment?${params.toString()}`)
          const data = await res.json()

          if (data.success) {
            if (data.orderId) setResolvedOrderId(data.orderId)
            setStatus("success")
            return
          }

          // reason === "order_failed" is a definitive failure, stop polling
          if (data.reason === "order_failed") {
            setStatus("failed")
            return
          }

          // Still pending — wait before next attempt (skip delay on last attempt)
          if (attempt < POLL_ATTEMPTS - 1) {
            await sleep(POLL_DELAY_MS)
          }
        }

        // All attempts exhausted without success
        setStatus("failed")
      } catch {
        setStatus("failed")
      }
    }

    verify()
  }, [reference, orderId])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">

        {/* ── Loading ── */}
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-gray-300" />
            <h2 className="text-lg font-bold text-gray-800">
              Confirming your payment...
            </h2>
            <p className="text-sm text-gray-400">
              Please do not close this page.
            </p>
          </div>
        )}

        {/* ── Success ── */}
        {status === "success" && (
          <div className="space-y-5">
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: theme.primary }} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Payment Successful 🎉
              </h2>
              <p className="text-sm text-gray-500">
                Your order has been confirmed and is being processed.
              </p>
            </div>

            <div
              className="text-xs p-3 rounded-xl font-mono"
              style={{
                backgroundColor: `${theme.primary}10`,
                color: theme.primaryText,
              }}
            >
              Ref: {reference}
            </div>

            {/* ── CTA ── */}
            <Link
              href={resolvedOrderId ? `/orders/${resolvedOrderId}` : "/orders"}
              className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: theme.primary }}
            >
              <ShoppingBag className="w-4 h-4" />
              View My Order
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        )}

        {/* ── Failed ── */}
        {status === "failed" && (
          <div className="space-y-4">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Payment Not Confirmed
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                We could not verify your payment. If you were charged, your
                order will update automatically within a few minutes.
              </p>
            </div>

            {reference && (
              <p className="text-xs font-mono text-gray-400 bg-gray-50 rounded-lg px-3 py-2 break-all">
                Ref: {reference}
              </p>
            )}

            <Link
              href="/orders"
              className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Check My Orders
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}