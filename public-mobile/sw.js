// BHARAT YATRA — PRODUCTION WEB PUSH SERVICE WORKER (sw.js)
// Handles background push events, system notification rendering, and interactive click routing.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) {
    console.warn('[ServiceWorker] Push event received but no payload data present');
    return;
  }

  let payload = {
    title: 'BharatYatra Journey Update ✈️',
    body: 'You have a new travel notification.',
    icon: '/logo.png',
    badge: '/logo.png',
    url: '/notifications',
    data: {},
  };

  try {
    const rawData = event.data.json();
    payload = {
      title: rawData.title || payload.title,
      body: rawData.body || rawData.message || payload.body,
      icon: rawData.icon || '/logo.png',
      badge: rawData.badge || '/logo.png',
      url: rawData.url || rawData.deepLink || rawData.data?.url || '/notifications',
      tag: rawData.id || rawData.type || 'bharatyatra-push',
      data: rawData.data || { url: rawData.url || '/notifications' },
    };
  } catch (err) {
    console.error('[ServiceWorker] Failed to parse push notification JSON:', err);
    payload.body = event.data.text();
  }

  const notificationOptions = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    tag: payload.tag,
    renotify: true,
    requireInteraction: true,
    data: {
      url: payload.url,
      ...payload.data,
    },
    actions: [
      { action: 'explore', title: 'View Details 🗺️' },
      { action: 'close', title: 'Dismiss' },
    ],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/notifications';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If tab is already open on BharatYatra domain, focus and navigate
        for (const client of clientList) {
          if ('focus' in client && 'navigate' in client) {
            client.focus();
            return client.navigate(targetUrl);
          }
        }
        // Otherwise open a new tab/window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[ServiceWorker] Push subscription changed/expired.');
  // Future re-subscription logic can be handled via client postMessage
});
