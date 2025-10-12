"use client";

import { useEffect, useState } from "react";

interface OfflineErrorBoundaryProps {
  children: React.ReactNode;
}

export function OfflineErrorBoundary({ children }: OfflineErrorBoundaryProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);

      // Check if we have cached content before showing offline message
      if ("caches" in window) {
        void caches
          .open("logotip-dynamic-v1")
          .then((cache) => {
            return cache.keys();
          })
          .then((keys) => {
            const hasPages = keys.some(
              (request) => request.mode === "navigate",
            );

            if (hasPages) {
              // Don't show offline message if we have cached content
              setShowOfflineMessage(false);
              return;
            }

            // Show offline message only if no cached content
            setShowOfflineMessage(true);
          })
          .catch((error) => {
            console.log("Failed to check cache:", error);
            // Show offline message on error
            setShowOfflineMessage(true);
          });
      } else {
        // Show offline message if no cache API
        setShowOfflineMessage(true);
      }
    };

    // Check initial online status
    setIsOnline(navigator.onLine);

    // Check for cached content on mount
    const checkCachedContent = () => {
      if ("caches" in window) {
        void caches
          .open("logotip-dynamic-v1")
          .then((cache) => {
            return cache.keys();
          })
          .then((keys) => {
            const hasPages = keys.some(
              (request) => request.mode === "navigate",
            );
            if (hasPages && !navigator.onLine) {
              setShowOfflineMessage(false);
            }
          })
          .catch((error) => {
            console.log("Failed to check cache:", error);
          });
      }
    };

    checkCachedContent();

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Don't render anything if we're online or not showing offline message
  if (isOnline || !showOfflineMessage) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 max-w-sm rounded-lg bg-red-600 px-4 py-2 text-white shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
          <span className="text-sm font-medium">Offline</span>
        </div>
        <p className="mt-1 text-xs text-red-100">
          Aplicația funcționează în modul offline
        </p>
      </div>
    </>
  );
}
