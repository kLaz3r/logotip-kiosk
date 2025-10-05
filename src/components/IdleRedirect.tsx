"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface IdleRedirectProps {
  timeoutMs?: number;
  to?: string;
}

export function IdleRedirect({
  timeoutMs = 90000,
  to = "/",
}: IdleRedirectProps) {
  const router = useRouter();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const reset = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        router.push(to);
      }, timeoutMs);
    };

    reset();

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keypress",
      "touchstart",
      "scroll",
    ];
    events.forEach((evt) =>
      window.addEventListener(evt, reset, { passive: true }),
    );

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      events.forEach((evt) => window.removeEventListener(evt, reset));
    };
  }, [router, timeoutMs, to]);

  return null;
}
