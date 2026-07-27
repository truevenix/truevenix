// public/firebase-messaging-sw.js
// Handles push notifications when the truevenix tab is closed or backgrounded.
// Foreground messages (tab open and focused) are handled in src/lib/firebase.ts
// / src/hooks/useFcmToken.tsx instead — this file only covers the background case.
//
// Config values here are the same public firebaseConfig already used in
// src/lib/firebase.ts. They are safe to expose (they identify the Firebase
// project, not a secret) but service workers can't import from the app
// bundle, so they're duplicated here on purpose.

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js")

firebase.initializeApp({
  apiKey: "AIzaSyBg7C4NQhwn5kh2WQqwujBQ3WDOejsxT-s",
  authDomain: "myproject-d1128.firebaseapp.com",
  projectId: "myproject-d1128",
  storageBucket: "myproject-d1128.firebasestorage.app",
  messagingSenderId: "86654026088",
  appId: "1:86654026088:web:de309d266435f7c374d6dd",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "truevenix"
  const body = payload.notification?.body || ""
  const link = payload.data?.link || "/"

  self.registration.showNotification(title, {
    body,
    icon: "/android-chrome-192x192.png",
    badge: "/favicon-32x32.png",
    data: { link },
  })
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const link = event.notification?.data?.link || "/"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(link) && "focus" in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(link)
    })
  )
})
