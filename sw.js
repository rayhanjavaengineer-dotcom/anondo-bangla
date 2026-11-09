/* Anondo Bangla — resilient offline cache v5 */
const CACHE_NAME = "anondo-bangla-global-v6";
const CORE_ASSETS = ["./", "./index.html", "./manifest.json", "./premium.css", "./travel-tools.css", "./travel-tools.js", "./profile-section.css", "./profile-section.js", "./global-tools.css", "./global-tools.js", "./brand-logo.svg", "./favicon.svg", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./og-image.png"];
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(CORE_ASSETS.map(async path => { try { await cache.add(path); } catch (e) { /* optional asset may be unavailable */ } }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("anondo-bangla-") && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request, { cache: "no-store" });
        if (fresh && fresh.ok) { const cache = await caches.open(CACHE_NAME); cache.put("./index.html", fresh.clone()); }
        return fresh;
      } catch (error) { return (await caches.match(request)) || (await caches.match("./index.html")) || Response.error(); }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(request);
    const network = fetch(request).then(response => {
      if (response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => null);
    return cached || (await network) || Response.error();
  })());
});
