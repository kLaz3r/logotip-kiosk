"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import type { Category } from "~/data/types";

interface CategoryCardProps {
  category: Category;
  href: string;
  image?: string;
}

export const CategoryCard = memo(function CategoryCard({
  category,
  href,
  image,
}: CategoryCardProps) {
  return (
    <div className="h-full">
      <Link href={href} className="block h-full">
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition hover:shadow-md active:scale-[0.98]">
          {image && (
            <div className="bg-background relative w-full flex-1">
              <Image
                src={image}
                alt={category.name}
                fill
                className="object-cover"
                sizes="33vw"
                loading="lazy"
              />
            </div>
          )}
          <div className="p-4 text-center">
            <h3 className="font-display text-primary text-lg leading-tight font-semibold">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-text/70 mt-1 text-sm">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
});
