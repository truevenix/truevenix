// src/lib/firebase-admin.ts
// Server-side Firebase Admin SDK. This is separate from src/lib/firebase.ts,
// which is the browser-side client SDK used to *request* a device token.
// This file *sends* pushes to tokens already saved via /api/save-fcm-token.
//
// Required env vars (Firebase console → Project settings → Service accounts
// → Generate new private key):
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY   (paste the full PEM, including the \n line breaks)

import crypto from "crypto"
import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"
import { getStorage } from "firebase-admin/storage"
import { db } from "@/lib/db"

const STORAGE_BUCKET = "myproject-d1128.firebasestorage.app"

function getFirebaseAdminApp(): App {
  const existing = getApps()
  if (existing.length > 0) return existing[0]

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel/most env UIs escape newlines — turn them back into real ones.
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: STORAGE_BUCKET,
  })
}

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

/**
 * Reusable: upload a base64-encoded image straight from a server route
 * (no browser File object available, e.g. the Expo app) to Firebase
 * Storage, and return its public download URL. Used today for profile
 * avatar uploads — src/lib/upload.tsx already covers the browser-File
 * case for the web admin's product image uploads via the client SDK's
 * uploadBytesResumable + getDownloadURL, which issues a Firebase download
 * token rather than a GCS ACL. This mirrors that exact scheme server-side:
 * setting `public: true` / a GCS object ACL instead would either throw
 * outright (buckets with uniform bucket-level access reject per-object
 * ACLs) or produce a URL Firebase Storage's default security rules won't
 * actually serve, since those rules gate on the download token, not on
 * whether the object is ACL-public.
 */
export async function uploadBase64Image(
  base64: string,
  contentType: string,
  folder: string
): Promise<string> {
  const extension = ALLOWED_IMAGE_TYPES[contentType]
  if (!extension) throw new Error("Unsupported image type. Use JPEG, PNG, or WEBP.")

  getFirebaseAdminApp()
  const bucket = getStorage().bucket(STORAGE_BUCKET)
  const filePath = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`
  const file = bucket.file(filePath)
  const downloadToken = crypto.randomUUID()

  const buffer = Buffer.from(base64, "base64")
  await file.save(buffer, {
    metadata: {
      contentType,
      metadata: { firebaseStorageDownloadTokens: downloadToken },
    },
  })

  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`
}

export type PushPayload = {
  title: string
  body: string
  /** All values must be strings — FCM data payloads don't accept other types. */
  data?: Record<string, string>
}

export type PushResult = { sent: number; failed: number }

const DEAD_TOKEN_ERROR_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
])

// Expo-managed apps (the Truevenix Android/iOS app) register an Expo push
// token, not a raw FCM registration token — it looks like
// "ExponentPushToken[xxxxxxx]" and only Expo's own push API understands it.
// The web app's browser FCM tokens are long opaque strings with no such
// prefix, so this is a reliable way to route each token to the right sender
// without needing a separate "channel" field in the DB.
function isExpoPushToken(token: string): boolean {
  return token.startsWith("ExponentPushToken[") || token.startsWith("ExpoPushToken[")
}

type ExpoPushTicket = {
  status: "ok" | "error"
  message?: string
  details?: { error?: string }
}

/**
 * Sends to Expo push tokens via Expo's push API — no extra package needed,
 * it's a plain HTTPS endpoint. Returns which token indices are dead so the
 * caller can prune them the same way as the Firebase Admin path.
 */
async function sendViaExpo(tokens: string[], payload: PushPayload): Promise<{ result: PushResult; deadIndexes: number[] }> {
  const messages = tokens.map((to) => ({
    to,
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
    channelId: "orders", // matches the Android channel created client-side in notification.service.ts
  }))

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(messages),
  })

  const body = (await response.json().catch(() => null)) as { data?: ExpoPushTicket[] } | null
  const tickets = body?.data ?? []

  const deadIndexes: number[] = []
  let sent = 0
  let failed = 0

  tickets.forEach((ticket, i) => {
    if (ticket.status === "ok") {
      sent += 1
    } else {
      failed += 1
      if (ticket.details?.error === "DeviceNotRegistered") deadIndexes.push(i)
    }
  })

  return { result: { sent, failed }, deadIndexes }
}

/**
 * Sends to genuine FCM tokens (the web app's browser subscriptions) via
 * Firebase Admin. Returns which token indices Firebase reports as dead.
 */
async function sendViaFirebase(tokens: string[], payload: PushPayload): Promise<{ result: PushResult; deadIndexes: number[] }> {
  const messaging = getMessaging(getFirebaseAdminApp())

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data ?? {},
    webpush: {
      notification: { icon: "/android-chrome-192x192.png" },
      fcmOptions: { link: payload.data?.link ?? "/" },
    },
  })

  const deadIndexes: number[] = []
  response.responses.forEach((result, i) => {
    if (!result.success && result.error && DEAD_TOKEN_ERROR_CODES.has(result.error.code)) {
      deadIndexes.push(i)
    }
  })

  return { result: { sent: response.successCount, failed: response.failureCount }, deadIndexes }
}

/**
 * Reusable: send a push notification to every device (web + Android + iOS)
 * a given user has registered. Splits tokens by which service understands
 * them (Expo push API for the mobile app, Firebase Admin for the web app),
 * sends both, and merges the results. Automatically deletes tokens either
 * service reports as dead, so the DeviceToken table stays clean without a
 * separate cron job.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<PushResult> {
  const tokens = await db.deviceToken.findMany({
    where: { userId },
    select: { id: true, token: true },
  })

  if (tokens.length === 0) return { sent: 0, failed: 0 }

  const expoTokens = tokens.filter((t) => isExpoPushToken(t.token))
  const fcmTokens = tokens.filter((t) => !isExpoPushToken(t.token))

  const [expoOutcome, fcmOutcome] = await Promise.all([
    expoTokens.length > 0 ? sendViaExpo(expoTokens.map((t) => t.token), payload) : null,
    fcmTokens.length > 0 ? sendViaFirebase(fcmTokens.map((t) => t.token), payload) : null,
  ])

  const deadTokenIds = [
    ...(expoOutcome?.deadIndexes.map((i) => expoTokens[i].id) ?? []),
    ...(fcmOutcome?.deadIndexes.map((i) => fcmTokens[i].id) ?? []),
  ]

  if (deadTokenIds.length > 0) {
    await db.deviceToken.deleteMany({ where: { id: { in: deadTokenIds } } })
  }

  return {
    sent: (expoOutcome?.result.sent ?? 0) + (fcmOutcome?.result.sent ?? 0),
    failed: (expoOutcome?.result.failed ?? 0) + (fcmOutcome?.result.failed ?? 0),
  }
}

/**
 * Reusable: send the same push to several users at once (e.g. a broadcast).
 * Not used by the order-timeline feature today, but kept generic for the
 * next thing that needs multi-user push — avoids re-deriving this pattern.
 */
export async function sendPushToUsers(userIds: string[], payload: PushPayload): Promise<PushResult> {
  const results = await Promise.all(userIds.map((userId) => sendPushToUser(userId, payload)))
  return results.reduce(
    (total, result) => ({ sent: total.sent + result.sent, failed: total.failed + result.failed }),
    { sent: 0, failed: 0 }
  )
}