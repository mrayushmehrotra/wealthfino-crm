"use client"

import { useEffect } from "react"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0))
}

async function getPublicKey() {
  const res = await fetch("/api/push/public-key", { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to load push key")
  const data = await res.json()
  return data?.data?.publicKey as string
}

async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  if (existing) {
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(existing.toJSON()),
    })
    return
  }

  const publicKey = await getPublicKey()
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  })

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  })
}

export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return false

  await fetch("/api/push/subscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  })

  return subscription.unsubscribe()
}

export async function getPushSubscriptionState() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "unsupported" as const
  }

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()

  if (subscription) return "enabled" as const
  if (Notification.permission === "denied") return "denied" as const
  return "disabled" as const
}

export function PushNotificationBootstrap() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return
    if (!("Notification" in window)) return

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true

    const run = async () => {
      try {
        if (Notification.permission === "granted") {
          await subscribeToPush()
          return
        }

        if (!isStandalone || Notification.permission !== "default") return

        const permission = await Notification.requestPermission()
        if (permission === "granted") {
          await subscribeToPush()
        }
      } catch {
        // ignore push bootstrap failures; announcements still work without notifications
      }
    }

    run()
  }, [])

  return null
}
