/* Anondo Bangla offline cache — v2 premium */
const CACHE_NAME = "anondo-bangla-premium-v2";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./premium.css",
  "./brand-logo.svg",
  "./favicon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./og-image.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache =>
    cache.addAll(CORE_ASSETS).catch(() => cache.addAll(CORE_ASSETS.filter(path => path !== "./og-image.png")))
  ));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(key => key.startsWith("anondo-bangla-") && key !== CACHE_NAME).map(key => caches.delete(key)))
  ));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(cached => {
    if (cached) return cached;
    return fetch(event.request).then(response => {
      if (response && response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match("./index.html"));
  }));
});
