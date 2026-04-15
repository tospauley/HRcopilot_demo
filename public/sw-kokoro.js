/**
 * sw-kokoro.js — Kokoro was removed. This SW unregisters itself.
 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    self.registration.unregister().then(() => self.clients.claim())
  );
});
