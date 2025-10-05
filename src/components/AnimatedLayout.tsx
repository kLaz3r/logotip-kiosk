"use client";

import type { ReactNode } from "react";

interface AnimatedLayoutProps {
  children: ReactNode;
}

export function AnimatedLayout({ children }: AnimatedLayoutProps) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background: "inherit",
          position: "absolute",
          inset: 0,
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
