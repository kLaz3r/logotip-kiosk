const CACHE_NAME = "logotip-kiosk-v1";
const STATIC_CACHE_NAME = "logotip-static-v1";
const DYNAMIC_CACHE_NAME = "logotip-dynamic-v1";

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/logo.svg",
  "/back.svg",
  "/logotip-bg.svg",
  "/offline",
  // Fonts
  "/fonts/FuturaPT-Book.ttf",
  "/fonts/FuturaPT-BookObl.ttf",
  "/fonts/FuturaPT-Medium.ttf",
  "/fonts/FuturaPT-MediumObl.ttf",
  "/fonts/FuturaPT-Demi.ttf",
  "/fonts/FuturaPT-DemiObl.ttf",
  "/fonts/FuturaPT-Bold.ttf",
  "/fonts/FuturaPT-BoldObl.ttf",
  "/fonts/FuturaPT-ExtraBold.ttf",
  "/fonts/FuturaPT-ExtraBoldObl.ttf",
  "/fonts/FuturaPT-Heavy.ttf",
  "/fonts/FuturaPT-HeavyObl.ttf",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("Static assets cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Failed to cache static assets:", error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME
            ) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("Service Worker activated");
        return self.clients.claim();
      }),
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache images, fonts, and other assets
          if (shouldCache(request)) {
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Return offline fallback for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/offline");
          }

          // For other requests, return a basic offline response
          return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({
              "Content-Type": "text/plain",
            }),
          });
        });
    }),
  );
});

// Helper function to determine if a request should be cached
function shouldCache(request) {
  const url = new URL(request.url);

  // Cache images
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
    return true;
  }

  // Cache fonts
  if (url.pathname.match(/\.(ttf|woff|woff2|eot)$/)) {
    return true;
  }

  // Cache CSS and JS
  if (url.pathname.match(/\.(css|js)$/)) {
    return true;
  }

  // Cache API responses (catalogue data)
  if (url.pathname.includes("/api/") || url.pathname.includes("/catalogue")) {
    return true;
  }

  // Cache Next.js static assets
  if (url.pathname.startsWith("/_next/static/")) {
    return true;
  }

  return false;
}

// Handle background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle any pending offline actions here
      Promise.resolve(),
    );
  }
});

// Handle push notifications (if needed in the future)
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  const options = {
    body: event.data ? event.data.text() : "New update available",
    icon: "/logo.svg",
    badge: "/favicon.ico",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(self.registration.showNotification("Logotip Kiosk", options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  event.waitUntil(clients.openWindow("/"));
});
