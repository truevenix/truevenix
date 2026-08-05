"use client"

import { useCallback, useEffect, useState } from "react"
import { fetchToken } from "@/lib/firebase"
import { useCurrentUser } from "@/hooks/use-current-user"

const STORAGE_KEY = "venix:fcmToken"

export type WebPushStatus =
  | "unsupported"
  | "loading"
  | "enabled"
  | "disabled"
  | "denied"
  | "pending" // token exists but no account attached yet

export function useWebPush() {
  const currentUser = useCurrentUser()
  const [status, setStatus] = useState<WebPushStatus>("loading")
  const [busy, setBusy] = useState(false)

  const checkStatus = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported")
      return
    }

    if (Notification.permission === "denied") {
      setStatus("denied")
      return
    }

    const savedToken = localStorage.getItem(STORAGE_KEY)

    // Permission granted + token cached → verify server-side if logged in
    if (Notification.permission === "granted" && savedToken) {
      if (currentUser) {
        try {
          const res = await fetch(`/api/save-fcm-token?fcmToken=${encodeURIComponent(savedToken)}`)
          const data = await res.json().catch(() => null)
          setStatus(data?.subscribed ? "enabled" : "disabled")
          if (!data?.subscribed) localStorage.removeItem(STORAGE_KEY)
        } catch {
          setStatus("enabled") // Network error, trust local state
        }
      } else {
        setStatus("pending") // Has token + permission, but no account yet
      }
      return
    }

    // Permission granted but NO token cached + user logged in → fetch one now
    if (Notification.permission === "granted" && !savedToken && currentUser) {
      setBusy(true)
      try {
        const token = await fetchToken()
        if (token) {
          localStorage.setItem(STORAGE_KEY, token)
          const res = await fetch("/api/save-fcm-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fcmToken: token, platform: "WEB" }),
          })
          if (res.ok) {
            setStatus("enabled")
            return
          }
        }
        setStatus("disabled")
      } catch {
        setStatus("disabled")
      } finally {
        setBusy(false)
      }
      return
    }

    // Permission granted but NO token + NO user → disabled (user needs to toggle)
    if (Notification.permission === "granted" && !savedToken && !currentUser) {
      setStatus("disabled")
      return
    }

    // Permission not granted (default/prompt)
    setStatus("disabled")
  }, [currentUser])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  // Auto-attach cached token when user logs in
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY)
    if (currentUser && savedToken && Notification.permission === "granted") {
      fetch("/api/save-fcm-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fcmToken: savedToken, platform: "WEB" }),
      })
        .then(res => {
          if (res.ok) setStatus("enabled")
        })
        .catch(() => {}) // Silent fail, checkStatus will reconcile
    }
  }, [currentUser])

  const enable = useCallback(async (): Promise<{ ok: boolean; message?: string }> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return { ok: false, message: "Notifications aren't supported in this browser." }
    }

    setBusy(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "disabled")
        return {
          ok: false,
          message:
            permission === "denied"
              ? "Notifications are blocked. Enable them in your browser's site settings."
              : "Notification permission was dismissed.",
        }
      }

      const token = await fetchToken()
      if (!token) {
        return { ok: false, message: "Could not get a notification token from this browser." }
      }

      // Always cache locally, even if logged out
      localStorage.setItem(STORAGE_KEY, token)

      // If user is logged in, attach to account immediately
      if (currentUser) {
        const res = await fetch("/api/save-fcm-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fcmToken: token, platform: "WEB" }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          return { ok: false, message: data?.error ?? "Could not save notification settings." }
        }

        setStatus("enabled")
      } else {
        // Guest grant — token cached, will attach on next login
        setStatus("pending")
      }

      return { ok: true }
    } catch (err) {
      console.error("[use-web-push] enable failed:", err)
      return { ok: false, message: "Something went wrong enabling notifications." }
    } finally {
      setBusy(false)
    }
  }, [currentUser])

  const disable = useCallback(async (): Promise<{ ok: boolean; message?: string }> => {
    const token = localStorage.getItem(STORAGE_KEY)
    setBusy(true)
    try {
      if (token) {
        await fetch("/api/save-fcm-token", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fcmToken: token }),
        }).catch(() => {})
      }
      localStorage.removeItem(STORAGE_KEY)
      setStatus("disabled")
      return { ok: true }
    } finally {
      setBusy(false)
    }
  }, [])

  return { status, busy, enable, disable }
}