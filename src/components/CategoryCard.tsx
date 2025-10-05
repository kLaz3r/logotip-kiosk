"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { Category } from "~/data/types";

interface CategoryCardProps {
  category: Category;
  href: string;
}

export function CategoryCard({ category, href }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <Link
        href={href}
        className="group block rounded-xl border border-black/10 bg-white p-6 shadow-sm transition hover:shadow-md active:scale-[0.98]"
      >
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <h3 className="font-display text-primary text-2xl font-semibold">
            {category.name}
          </h3>
          {category.description ? (
            <p className="text-text/70 text-sm">{category.description}</p>
          ) : null}
          <div className="bg-secondary/20 h-12 w-12 shrink-0 rounded-full" />
        </div>
      </Link>
    </motion.div>
  );
}
