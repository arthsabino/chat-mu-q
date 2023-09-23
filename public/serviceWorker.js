//@ts-check

/// <reference no-default-lib="true"/>
/// <reference lib="esnext"/>
/// <reference lib="webworker"/>

const sw = /** @type {ServiceWorkerGlobalScope & typeof globalThis} */ (
  globalThis
);

sw.addEventListener("push", (event) => {
  const message = event.data?.json()
  const { title, body, icon, image, channelId} = message;

  console.log("Received push message", message)

  const handlePushEvent = async () => {
    const windowClient = await sw.clients.matchAll({ type: "window"})

    if(windowClient.length > 0) {
      const appInFocus = windowClient.some(client => client.focused)

      if(appInFocus) {
        console.log("App in focus, no notification.")
        return
      }
    }

    await sw.registration.showNotification(title, {
      body,
      icon,
      image,
      badge: '/icon.png',
      actions: [{ title: "Open chat", action: "open_chat" }],
      tag: channelId,
      renotify: true,
      data: { channelId }
    })
  }
  event.waitUntil(handlePushEvent())
});


sw.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  notification.close()

  const handleNotificationClicked = async() => {
    const windowClients = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const channelId = notification.data.channelId

    if(windowClients.length > 0) {
      await windowClients[0].focus()
      windowClients[0].postMessage({ channelId })
    } else {
      sw.clients.openWindow("/chat?channelId=" + channelId)
    }
  }

  event.waitUntil(handleNotificationClicked())
})
