"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { Design } from "~/data/types";

interface DesignCardProps {
  design: Design;
  index?: number;
  currentPage?: number;
}

export function DesignCard({
  design,
  index = 0,
  currentPage,
}: DesignCardProps) {
  const href = currentPage
    ? `/design/${design.id}?fromPage=${currentPage}`
    : `/design/${design.id}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.1,
        delay: index * 0.05,
        ease: "easeOut",
      }}
    >
      <Link
        href={href}
        className="group flex h-full flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm transition hover:shadow-md active:scale-[0.98]"
      >
        <div className="bg-background relative w-full flex-1">
          <Image
            src={design.image}
            alt={design.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={design.featured}
          />
        </div>
        <div className="p-3 text-center">
          <h4 className="font-display text-primary text-lg leading-tight font-semibold">
            {design.name}
          </h4>
        </div>
      </Link>
    </motion.div>
  );
}
