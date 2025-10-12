"use client";

import { useEffect, useState } from "react";
import { AssetPreloader } from "./AssetPreloader";

interface KioskModeProps {
  children: React.ReactNode;
}

export function KioskMode({ children }: KioskModeProps) {
  const [isPreloading, setIsPreloading] = useState(true);

  useEffect(() => {
    // Function to enter fullscreen
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (
          (
            document.documentElement as unknown as {
              webkitRequestFullscreen?: () => Promise<void>;
            }
          ).webkitRequestFullscreen
        ) {
          await (
            document.documentElement as unknown as {
              webkitRequestFullscreen: () => Promise<void>;
            }
          ).webkitRequestFullscreen();
        } else if (
          (
            document.documentElement as unknown as {
              mozRequestFullScreen?: () => Promise<void>;
            }
          ).mozRequestFullScreen
        ) {
          await (
            document.documentElement as unknown as {
              mozRequestFullScreen: () => Promise<void>;
            }
          ).mozRequestFullScreen();
        } else if (
          (
            document.documentElement as unknown as {
              msRequestFullscreen?: () => Promise<void>;
            }
          ).msRequestFullscreen
        ) {
          await (
            document.documentElement as unknown as {
              msRequestFullscreen: () => Promise<void>;
            }
          ).msRequestFullscreen();
        }
      } catch (error) {
        console.log("Fullscreen not supported or failed:", error);
      }
    };

    // Function to hide browser UI elements
    const hideBrowserUI = () => {
      // Hide address bar on mobile browsers
      if (
        window.screen &&
        (
          window.screen as unknown as {
            orientation?: { lock?: (orientation: string) => Promise<void> };
          }
        ).orientation
      ) {
        void (
          window.screen as unknown as {
            orientation: { lock: (orientation: string) => Promise<void> };
          }
        ).orientation.lock?.("landscape");
      }

      // Disable context menu
      document.addEventListener("contextmenu", (e) => e.preventDefault());

      // Disable text selection
      document.addEventListener("selectstart", (e) => e.preventDefault());

      // Disable drag and drop
      document.addEventListener("dragstart", (e) => e.preventDefault());

      // Disable zoom gestures
      document.addEventListener("gesturestart", (e) => e.preventDefault());
      document.addEventListener("gesturechange", (e) => e.preventDefault());
      document.addEventListener("gestureend", (e) => e.preventDefault());

      // Disable pinch zoom
      let lastTouchEnd = 0;
      document.addEventListener(
        "touchend",
        (event) => {
          const now = new Date().getTime();
          if (now - lastTouchEnd <= 300) {
            event.preventDefault();
          }
          lastTouchEnd = now;
        },
        false,
      );
    };

    // Function to register service worker
    const registerServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("Service Worker registered successfully:", registration);

          // Listen for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New content is available, reload the page
                  window.location.reload();
                }
              });
            }
          });

          // Trigger background caching when online
          if (navigator.onLine && registration.active) {
            registration.active.postMessage({ type: "CACHE_ALL" });
          }
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      }
    };

    // Initialize kiosk mode
    const initializeKioskMode = async () => {
      // Register service worker first
      await registerServiceWorker();

      // Hide browser UI
      hideBrowserUI();

      // Enter fullscreen after a short delay to ensure page is loaded
      setTimeout(() => {
        void enterFullscreen();
      }, 1000);
    };

    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      if (
        !document.fullscreenElement &&
        !(document as unknown as { webkitFullscreenElement?: Element })
          .webkitFullscreenElement &&
        !(document as unknown as { mozFullScreenElement?: Element })
          .mozFullScreenElement &&
        !(document as unknown as { msFullscreenElement?: Element })
          .msFullscreenElement
      ) {
        // Exited fullscreen, try to re-enter
        setTimeout(() => {
          void enterFullscreen();
        }, 100);
      }
    };

    // Add event listeners
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    // Initialize kiosk mode
    void initializeKioskMode();

    // Cleanup function
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, []);

  if (isPreloading) {
    return <AssetPreloader onComplete={() => setIsPreloading(false)} />;
  }

  return <>{children}</>;
}
