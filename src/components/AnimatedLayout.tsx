"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface AnimatedLayoutProps {
  children: ReactNode;
}

export function AnimatedLayout({ children }: AnimatedLayoutProps) {
  const pathname = usePathname();

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
      }}
    >
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            willChange: "opacity",
            background: "inherit",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)",
            position: "absolute",
            inset: 0,
            width: "100%",
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
