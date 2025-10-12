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
      setShowOfflineMessage(true);
    };

    // Check initial online status
    setIsOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Show offline message after a delay to avoid flickering
    let timeoutId: NodeJS.Timeout;
    if (!navigator.onLine) {
      timeoutId = setTimeout(() => {
        setShowOfflineMessage(true);
      }, 1000);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Don't render anything if we're online or not showing offline message
  if (isOnline || !showOfflineMessage) {
    return <>{children}</>;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm rounded-lg bg-red-600 px-4 py-2 text-white shadow-lg">
      <div className="flex items-center space-x-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
        <span className="text-sm font-medium">Offline</span>
      </div>
      <p className="mt-1 text-xs text-red-100">
        Aplicația funcționează în modul offline
      </p>
    </div>
  );
}
