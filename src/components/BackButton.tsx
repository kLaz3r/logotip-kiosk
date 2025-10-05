"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
}

export function BackButton({
  fallbackHref = "/",
  label = "Înapoi",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }, [router, fallbackHref]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-primary inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium shadow-sm active:scale-[0.98]"
    >
      <span aria-hidden>←</span>
      {label}
    </button>
  );
}
