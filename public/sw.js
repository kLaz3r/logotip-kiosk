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

// Pages to cache for offline use
const PAGES_TO_CACHE = [
  "/",
  "/mugs",
  "/ceasuri",
  "/cutii-etichete-vin",
  "/tocatoare-si-sorturi",
  "/tricouri",
  "/tricouri/aniversari",
  "/tricouri/burlaci-burlacite",
  "/tricouri/cupluri",
  "/tricouri/mamici-tatici",
  "/tricouri/mesaje-amuzante",
];

// Install event - cache static assets and pages
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log("Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache pages for offline use
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        console.log("Caching pages for offline use");
        return Promise.all(
          PAGES_TO_CACHE.map((page) => {
            return fetch(page)
              .then((response) => {
                if (response.ok) {
                  return cache.put(page, response);
                }
              })
              .catch((error) => {
                console.log(`Failed to cache page ${page}:`, error);
              });
          }),
        );
      }),
    ])
      .then(() => {
        console.log("Assets and pages cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Failed to cache assets:", error);
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

      // For navigation requests, try to serve from cache first
      if (request.mode === "navigate") {
        return caches.match(request.url).then((cachedPage) => {
          if (cachedPage) {
            return cachedPage;
          }

          // If not cached, fetch from network
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                // Cache the page for future offline use
                const responseToCache = response.clone();
                caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
              return response;
            })
            .catch(() => {
              // Return offline fallback for navigation requests
              return caches.match("/offline");
            });
        });
      }

      // For other requests, fetch from network
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
          // For non-navigation requests, return a basic offline response
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

  // Cache all pages (navigation requests)
  if (request.mode === "navigate") {
    return true;
  }

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

  // Cache all assets from the assets directory
  if (url.pathname.startsWith("/assets/")) {
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

// Background cache warming - cache all pages and assets when online
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CACHE_ALL") {
    event.waitUntil(cacheAllPagesAndAssets());
  }
});

// Function to cache all pages and assets
async function cacheAllPagesAndAssets() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);

    // Cache all pages
    for (const page of PAGES_TO_CACHE) {
      try {
        const response = await fetch(page);
        if (response.ok) {
          await cache.put(page, response);
          console.log(`Cached page: ${page}`);
        }
      } catch (error) {
        console.log(`Failed to cache page ${page}:`, error);
      }
    }

    // Cache all images from assets directory
    const assetPaths = [
      // Mugs
      "/assets/mugs/mug 1.jpg",
      "/assets/mugs/mug 2.jpg",
      "/assets/mugs/mug 3.jpg",
      // Ceasuri
      "/assets/ceasuri/ceas 1.jpg",
      "/assets/ceasuri/ceas 2.jpg",
      "/assets/ceasuri/ceas 3.jpg",
      // Cutii etichete vin
      "/assets/cutii-etichete-vin/Cutie vin.jpg",
      "/assets/cutii-etichete-vin/CV aniversare.jpg",
      // Tocatoare si sorturi
      "/assets/tocatoare-si-sorturi/Tocator 1.jpg",
      "/assets/tocatoare-si-sorturi/Tocator 2.jpg",
      // Tricouri
      "/assets/tricouri/tricouri-aniversari/tricou 1.jpg",
      "/assets/tricouri/tricouri-aniversari/tricou 2.jpg",
    ];

    for (const assetPath of assetPaths) {
      try {
        const response = await fetch(assetPath);
        if (response.ok) {
          await cache.put(assetPath, response);
          console.log(`Cached asset: ${assetPath}`);
        }
      } catch (error) {
        console.log(`Failed to cache asset ${assetPath}:`, error);
      }
    }

    console.log("Background caching completed");
  } catch (error) {
    console.error("Background caching failed:", error);
  }
}

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
