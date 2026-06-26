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
  const containerWidth = useRef<number>(0);
  const onSwipeLeftRef = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);
  const [swipeState, setSwipeState] = useState<SwipeState>({
    offset: 0,
    isTransitioning: false,
  });

  onSwipeLeftRef.current = onSwipeLeft;
  onSwipeRightRef.current = onSwipeRight;

  useEffect(() => {
    containerWidth.current = window.innerWidth;
    const updateWidth = () => {
      containerWidth.current = window.innerWidth;
    };
    window.addEventListener("resize", updateWidth, { passive: true });
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0]?.clientX ?? null;
      touchStartY.current = e.touches[0]?.clientY ?? null;
      setSwipeState({ offset: 0, isTransitioning: false });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const deltaX =
        (e.touches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
      const deltaY =
        (e.touches[0]?.clientY ?? touchStartY.current) - touchStartY.current;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setSwipeState({
          offset: deltaX * 0.6,
          isTransitioning: false,
        });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const touchEndX =
        e.changedTouches[0]?.clientX ?? touchStartX.current;
      const touchEndY =
        e.changedTouches[0]?.clientY ?? touchStartY.current;
      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > minSwipeDistance) {
          setSwipeState({
            offset: containerWidth.current * 0.3,
            isTransitioning: true,
          });
          setTimeout(() => {
            onSwipeRightRef.current?.();
            setSwipeState({ offset: 0, isTransitioning: false });
          }, 300);
        } else if (deltaX < -minSwipeDistance) {
          setSwipeState({
            offset: -containerWidth.current * 0.3,
            isTransitioning: true,
          });
          setTimeout(() => {
            onSwipeLeftRef.current?.();
            setSwipeState({ offset: 0, isTransitioning: false });
          }, 300);
        } else {
          setSwipeState({ offset: 0, isTransitioning: true });
        }
      } else {
        setSwipeState({ offset: 0, isTransitioning: true });
      }

      touchStartX.current = null;
      touchStartY.current = null;
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
      capture: true,
    });
    document.addEventListener("touchmove", handleTouchMove, {
      passive: true,
      capture: true,
    });
    document.addEventListener("touchend", handleTouchEnd, {
      passive: true,
      capture: true,
    });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart, {
        capture: true,
      });
      document.removeEventListener("touchmove", handleTouchMove, {
        capture: true,
      });
      document.removeEventListener("touchend", handleTouchEnd, { capture: true });
    };
  }, [minSwipeDistance]);

  return swipeState;
}
