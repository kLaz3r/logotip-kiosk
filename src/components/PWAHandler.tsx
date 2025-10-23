"use client";

import { useEffect } from "react";

export function PWAHandler() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker
      window.addEventListener("load", () => {
        void navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            console.log("Service Worker registered:", registration);

            // Check for updates periodically
            setInterval(() => {
              void registration.update();
            }, 60000); // Check every minute

            // Listen for updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    console.log("New service worker available");
                    // Auto-update without prompting (for kiosk mode)
                    newWorker.postMessage({ type: "SKIP_WAITING" });
                    window.location.reload();
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });

        // Handle service worker updates
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("Service Worker controller changed");
        });
      });

      // Pre-cache visible images using IntersectionObserver for better performance
      const cacheVisibleAssets = () => {
        if (!navigator.serviceWorker.controller) return;

        const images = Array.from(document.querySelectorAll("img"));
        const imageUrls = images
          .map((img) => img.src)
          .filter((src) => src && !src.startsWith("data:"));

        if (imageUrls.length > 0) {
          navigator.serviceWorker.controller.postMessage({
            type: "CACHE_URLS",
            urls: imageUrls,
          });
        }
      };

      // Cache assets on initial load
      window.addEventListener("load", cacheVisibleAssets);

      // Use IntersectionObserver to cache images as they become visible
      const imageObserver = new IntersectionObserver(
        (entries) => {
          const visibleImages = entries
            .filter((entry) => entry.isIntersecting)
            .map((entry) => (entry.target as HTMLImageElement).src)
            .filter((src) => src && !src.startsWith("data:"));

          if (visibleImages.length > 0 && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: "CACHE_URLS",
              urls: visibleImages,
            });
          }
        },
        {
          rootMargin: "50px", // Preload images 50px before they enter viewport
        },
      );

      // Observe all images
      const observeImages = () => {
        document.querySelectorAll("img").forEach((img) => {
          imageObserver.observe(img);
        });
      };

      // Throttled mutation observer to avoid excessive callbacks
      let mutationTimeout: number | null = null;
      const observer = new MutationObserver(() => {
        if (mutationTimeout) return;
        mutationTimeout = window.setTimeout(() => {
          observeImages();
          mutationTimeout = null;
        }, 500); // Throttle to 500ms
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      observeImages(); // Initial observation

      return () => {
        observer.disconnect();
        imageObserver.disconnect();
        if (mutationTimeout) window.clearTimeout(mutationTimeout);
      };
    }

    // Force landscape orientation if supported
    if (typeof window !== "undefined" && "screen" in window) {
      interface ScreenOrientationInterface {
        lock?: (orientation: string) => Promise<void>;
      }

      const screenObj = window.screen as Screen & {
        orientation?: ScreenOrientationInterface;
      };
      if (screenObj.orientation?.lock) {
        void screenObj.orientation.lock("landscape").catch((error: Error) => {
          console.log("Screen orientation lock not supported:", error);
        });
      }
    }

    // Prevent context menu (for kiosk mode)
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener("contextmenu", preventContextMenu);

    // Prevent text selection (for kiosk mode)
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    // Request fullscreen on interaction
    const requestFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        void elem.requestFullscreen().catch((error) => {
          console.log("Fullscreen request failed:", error);
        });
      }
    };

    // Try to go fullscreen on first interaction
    const fullscreenHandler = () => {
      requestFullscreen();
      document.removeEventListener("click", fullscreenHandler);
      document.removeEventListener("touchstart", fullscreenHandler);
    };

    document.addEventListener("click", fullscreenHandler, { once: true });
    document.addEventListener("touchstart", fullscreenHandler, { once: true });

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("click", fullscreenHandler);
      document.removeEventListener("touchstart", fullscreenHandler);
    };
  }, []);

  return null;
}
