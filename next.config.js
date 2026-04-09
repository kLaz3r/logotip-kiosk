/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import withPWAInit from "@ducanh2912/next-pwa";
import "./src/env.js";

const ONE_YEAR = 365 * 24 * 60 * 60;

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false, // Don't reload on reconnect for kiosk mode
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
    // Precache critical pages for offline-first experience
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      // FONTS: CacheFirst with long expiration (never expires for kiosk)
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-font-assets",
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: ONE_YEAR,
          },
        },
      },
      // IMAGES: CacheFirst - all assets should be cached forever
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-image-assets",
          expiration: {
            maxEntries: 2000, // Increased for all kiosk images
            maxAgeSeconds: ONE_YEAR,
          },
        },
      },
      // NEXT.JS STATIC ASSETS: CacheFirst (these have hashed filenames)
      {
        urlPattern: /\/_next\/static\/.+/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-assets",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: ONE_YEAR,
          },
        },
      },
      // JS/CSS: CacheFirst with long expiration
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-js-css-assets",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: ONE_YEAR,
          },
        },
      },
      // DATA FILES (catalogue.json): CacheFirst - data rarely changes
      {
        urlPattern: /\/data\/[^/]+\.json$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-data-assets",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: ONE_YEAR,
          },
        },
      },
      // NEXT.JS PAGE DATA: StaleWhileRevalidate
      {
        urlPattern: /\/_next\/data\/.+\.json$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-data",
          expiration: {
            maxEntries: 200, // All pages
            maxAgeSeconds: ONE_YEAR,
          },
        },
      },
      // PAGES: StaleWhileRevalidate - works offline
      // This is critical: serves cached pages when offline
      {
        urlPattern: ({ url, sameOrigin }) => {
          if (!sameOrigin) return false;
          const path = url.pathname;
          if (path.startsWith("/api/")) return false;
          if (path.startsWith("/_next/")) return false;
          if (path.startsWith("/assets/")) return false;
          if (path.startsWith("/fonts/")) return false;
          if (path.includes(".")) return false;
          return true;
        },
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "pages",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: ONE_YEAR,
          },
        },
      },
      // FALLBACK: Cache any other same-origin requests
      {
        urlPattern: ({ sameOrigin }) => sameOrigin,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "fallback",
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: ONE_YEAR,
          },
        },
      },
    ],
  },
});

/** @type {import("next").NextConfig} */
const config = {
  // PWA and Kiosk optimizations
  output: "standalone",
  poweredByHeader: false,
  compress: true,

  // Image optimization for better performance
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },

  // Asset optimization and performance improvements
  experimental: {
    // Enable CSS optimization with critters
    optimizeCss: true,
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Headers for PWA and caching
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withPWA(config);
