// Retire the service worker used by older Saaristolautat releases. Keeping this
// file at the old URL lets installed home-screen apps discover the update and
// move back to normal network loading without requiring users to reinstall.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await self.clients.claim();
    await Promise.all((await caches.keys()).map(cacheName => caches.delete(cacheName)));
    await self.registration.unregister();
    const windows = await self.clients.matchAll({ type: 'window' });
    await Promise.all(windows.map(client => client.navigate(client.url)));
  })());
});
