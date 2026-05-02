/* eslint-disable */
/**
 * NexGen Connect — service worker.
 *
 * Hand-rolled (no Workbox) so the bundle stays tight and the cache
 * shape is auditable. Three strategies:
 *
 *   network-first    HTML routes — fall back to /app/offline cache
 *   stale-while-rev  CSS / JS / fonts
 *   cache-first      icons + manifest
 *
 * Push handler routes the JSON payload's `kind` to a localised title
 * + URL; tap → focuses the existing tab or opens a new one to the URL.
 *
 * v16 web pivot §Bucket 9.
 */

const VERSION = "v1";
const STATIC_CACHE = `nx-static-${VERSION}`;
const RUNTIME_CACHE = `nx-runtime-${VERSION}`;
const HTML_CACHE = `nx-html-${VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/app/corridor",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE, HTML_CACHE].includes(k))
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // HTML — network-first, cache the latest, fall back to cache then to /app/offline.
  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(htmlNetworkFirst(req));
    return;
  }

  // Static assets — stale-while-revalidate.
  if (
    req.url.includes("/_next/static/") ||
    req.url.endsWith(".css") ||
    req.url.endsWith(".js") ||
    req.url.includes("/icons/")
  ) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Manifest — cache-first.
  if (req.url.endsWith("/manifest.webmanifest")) {
    event.respondWith(cacheFirst(req));
    return;
  }
});

async function htmlNetworkFirst(req) {
  try {
    const fresh = await fetch(req);
    const cache = await caches.open(HTML_CACHE);
    cache.put(req, fresh.clone());
    return fresh;
  } catch (_) {
    const cached = await caches.match(req);
    if (cached) return cached;
    const offline = await caches.match("/");
    return offline ?? Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(req);
  const fetched = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || fetched;
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const fresh = await fetch(req);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(req, fresh.clone());
  return fresh;
}

// -----------------------------------------------------------------------
// Push notifications
// -----------------------------------------------------------------------
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: "NexGen Connect", body: event.data?.text() ?? "" };
  }
  const { title = "NexGen Connect", body = "", url = "/app/corridor", kind } = data;
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url, kind },
      tag: kind,
      renotify: true,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? "/app/corridor";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
