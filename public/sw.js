const CACHE_VERSION = "hc360-shell-v1"
const STATIC_CACHE = `hc360-static-${CACHE_VERSION}`
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable.png",
  "/apple-touch-icon.png",
]

// Install: Cache App Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(APP_SHELL)
      })
      .then(() => self.skipWaiting()),
  )
})

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key.startsWith("hc360-") && key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch strategy
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET requests from same origin or Google Fonts
  if (request.method !== "GET") return

  // Navigation requests (HTML): Network first with fallback to cached index.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() =>
          caches
            .match("/index.html")
            .then((cached) => cached || caches.match("/")),
        ),
    )
    return
  }

  // Same-origin static assets (/assets/*, fonts, icons)
  if (url.origin === self.location.origin) {
    if (
      url.pathname.startsWith("/assets/") ||
      url.pathname.endsWith(".svg") ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".woff2")
    ) {
      event.respondWith(caches.match(request).then((cached) => {
          if (cached) return cached
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone()
              caches
                .open(STATIC_CACHE)
                .then((cache) => cache.put(request, clone))
            }
            return response
          })
        }))
      return
    }
  }

  // Google Fonts CDN
  if (
    url.origin.includes("fonts.googleapis.com") ||
    url.origin.includes("fonts.gstatic.com")
  ) {
    event.respondWith(caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
      }))
  }
})
