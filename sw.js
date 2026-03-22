// sw.js — Service Worker for TimeSync
// This file runs in the background on the user's device
// and fires the notification even when the browser tab is not active

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Listen for a message from the app to schedule a notification
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, delay } = event.data;

    // Wait until the timer runs out, then fire the notification
    setTimeout(() => {
      self.registration.showNotification(title, {
        body: 'Tap to open TimeSync',
        icon: 'https://timesync-app.vercel.app/icon.png',
        badge: 'https://timesync-app.vercel.app/icon.png',
        tag: 'timesync-alert',
        requireInteraction: true, // keeps notification visible until dismissed
        actions: [
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
    }, delay);
  }
});

// When user clicks the notification, open the app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // If TimeSync is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('timesync') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(self.location.origin);
      }
    })
  );
});
