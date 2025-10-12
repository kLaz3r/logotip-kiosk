"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  returnTo?: string;
}

export function BackButton({
  fallbackHref = "/",
  label = "Înapoi",
  returnTo,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    if (returnTo) {
      router.replace(returnTo);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }, [router, fallbackHref, returnTo]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-primary inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium shadow-sm active:scale-[0.98]"
    >
      <span aria-hidden>←</span>
      {label}
    </button>
  );
}
