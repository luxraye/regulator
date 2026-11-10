const CACHE_NAME = "ceda-portal-v2";

const SHELL_URLS = [
  "/",
  "/calls",
  "/track",
  "/eligibility",
  "/register",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Pass through dynamic, authenticated, and API routes
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("/auth/") ||
    event.request.url.includes("/dashboard")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        // Never return undefined to respondWith (prevents 'TypeError: Failed to convert value to Response')
        return new Response("Offline", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "text/plain" },
        });
      })
  );
});
