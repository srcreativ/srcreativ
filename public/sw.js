const CACHE = "sr-studio-assets-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

// Cache immutable static files only. Navigation requests stay network-first so
// inquiries, admin data, and new deployments are never served stale.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    request.mode === "navigate"
  )
    return;
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (
            response.ok &&
            (url.pathname.startsWith("/assets/") ||
              url.pathname.startsWith("/videos/") ||
              url.pathname.endsWith(".svg"))
          ) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
