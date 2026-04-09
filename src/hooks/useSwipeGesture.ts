import { useEffect, useRef, useState, useCallback } from "react";

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
  const containerWidth = useRef<number>(0);
  const [swipeState, setSwipeState] = useState<SwipeState>({
    offset: 0,
    isTransitioning: false,
  });

  // Get container width for animation calculations
  useEffect(() => {
    const updateWidth = () => {
      containerWidth.current = window.innerWidth;
    };
    updateWidth();
    window.addEventListener("resize", updateWidth, { passive: true });
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Trigger page navigation with delay for animation
  const triggerSwipeLeft = useCallback(() => {
    // Animate the content off-screen to the left
    setSwipeState({ offset: -containerWidth.current * 0.3, isTransitioning: true });
    // Delay actual page change to let animation play
    setTimeout(() => {
      onSwipeLeft?.();
      // Reset after page change (component will unmount anyway, but for safety)
      setSwipeState({ offset: 0, isTransitioning: false });
    }, 300);
  }, [onSwipeLeft]);

  const triggerSwipeRight = useCallback(() => {
    // Animate the content off-screen to the right
    setSwipeState({ offset: containerWidth.current * 0.3, isTransitioning: true });
    // Delay actual page change to let animation play
    setTimeout(() => {
      onSwipeRight?.();
      // Reset after page change
      setSwipeState({ offset: 0, isTransitioning: false });
    }, 300);
  }, [onSwipeRight]);

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
        // Add resistance for natural feel
        const resistance = 0.6;
        setSwipeState({
          offset: deltaX * resistance,
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
          // Swipe right - animate then go to previous page
          triggerSwipeRight();
        } else if (deltaX < -minSwipeDistance) {
          // Swipe left - animate then go to next page
          triggerSwipeLeft();
        } else {
          // Not enough distance, bounce back smoothly
          setSwipeState({ offset: 0, isTransitioning: true });
        }
      } else {
        // Reset if vertical swipe
        setSwipeState({ offset: 0, isTransitioning: true });
      }

      touchStartX.current = null;
      touchStartY.current = null;
    };

    // Use capturing phase to ensure we get events even if other handlers stop propagation
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
      capture: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: true, capture: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true, capture: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart, { capture: true });
      document.removeEventListener("touchmove", handleTouchMove, { capture: true });
      document.removeEventListener("touchend", handleTouchEnd, { capture: true });
    };
  }, [triggerSwipeLeft, triggerSwipeRight, minSwipeDistance]);

  return swipeState;
}
