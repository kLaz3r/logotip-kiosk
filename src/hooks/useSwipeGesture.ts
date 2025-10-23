import { useEffect, useRef, useState } from "react";

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
}

interface SwipeState {
  offset: number;
  isTransitioning: boolean;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 50,
}: SwipeGestureOptions) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeState, setSwipeState] = useState<SwipeState>({
    offset: 0,
    isTransitioning: false,
  });

  // Reset isTransitioning after animation completes
  useEffect(() => {
    if (swipeState.isTransitioning) {
      const timeout = setTimeout(() => {
        setSwipeState((prev) => ({ ...prev, isTransitioning: false }));
      }, 300); // Match the CSS transition duration

      return () => clearTimeout(timeout);
    }
  }, [swipeState.isTransitioning]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0]?.clientX ?? null;
      touchStartY.current = e.touches[0]?.clientY ?? null;
      setSwipeState({ offset: 0, isTransitioning: false });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) {
        return;
      }

      const touchCurrentX = e.touches[0]?.clientX ?? touchStartX.current;
      const touchCurrentY = e.touches[0]?.clientY ?? touchStartY.current;

      const deltaX = touchCurrentX - touchStartX.current;
      const deltaY = touchCurrentY - touchStartY.current;

      // Only track horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Add resistance at the edges (using a very subtle damping factor)
        const dampingFactor = 0.05;
        setSwipeState({
          offset: deltaX * dampingFactor,
          isTransitioning: false,
        });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) {
        return;
      }

      const touchEndX = e.changedTouches[0]?.clientX ?? touchStartX.current;
      const touchEndY = e.changedTouches[0]?.clientY ?? touchStartY.current;

      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;

      // Check if horizontal swipe is more dominant than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > minSwipeDistance) {
          // Swipe right (left to right) - go to previous page
          setSwipeState({ offset: 0, isTransitioning: true });
          onSwipeRight?.();
        } else if (deltaX < -minSwipeDistance) {
          // Swipe left (right to left) - go to next page
          setSwipeState({ offset: 0, isTransitioning: true });
          onSwipeLeft?.();
        } else {
          // Not enough distance, bounce back
          setSwipeState({ offset: 0, isTransitioning: true });
        }
      } else {
        // Reset if vertical swipe
        setSwipeState({ offset: 0, isTransitioning: true });
      }

      touchStartX.current = null;
      touchStartY.current = null;
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, minSwipeDistance]);

  return swipeState;
}
