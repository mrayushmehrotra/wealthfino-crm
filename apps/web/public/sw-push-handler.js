self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const res = await fetch("/api/announcements?limit=1", {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        })

        if (!res.ok) return

        const payload = await res.json()
        const latest = payload?.data?.[0]
        if (!latest) return

        await self.registration.showNotification(
          latest.title || "New Announcement",
          {
            body: latest.body || "A new company announcement has been posted.",
            icon: "/icon-192x192.png",
            badge: "/icon-192x192.png",
            data: {
              url: "/announcements",
              announcementId: latest.id,
            },
            tag: `announcement-${latest.id || Date.now()}`,
            renotify: true,
          }
        )
      } catch (_) {
        await self.registration.showNotification("New Announcement", {
          body: "A new company announcement has been posted.",
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          data: {
            url: "/announcements",
          },
        })
      }
    })()
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(
    (async () => {
      const targetUrl = event.notification?.data?.url || "/announcements"
      const clientsList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      })

      for (const client of clientsList) {
        if ("focus" in client && client.url.includes(targetUrl)) {
          return client.focus()
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })()
  )
})
