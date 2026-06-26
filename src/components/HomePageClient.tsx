"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Pagination } from "~/components/Pagination";
import type { Category } from "~/data/types";
import { useSwipeGesture } from "~/hooks/useSwipeGesture";

interface HomePageClientProps {
  categories: Category[];
  categoryImages: Record<string, string | undefined>;
}

export function HomePageClient({
  categories,
  categoryImages,
}: HomePageClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const paginatedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    (currentPage - 1) * itemsPerPage + itemsPerPage,
  );

  const handleSwipeLeft = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const swipeState = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  const transformStyle = {
    transform: `translateX(${swipeState.offset}px)`,
    transition: swipeState.isTransitioning
      ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      : "none",
  };

  return (
    <main className="h-screen overflow-hidden">
      <section className="container mx-auto h-full bg-cover px-4 py-6">
        <div className="flex h-full min-h-0 flex-col">
          <div className="mb-6 flex shrink-0 items-center justify-between gap-4">
            <h1 className="font-display text-3xl font-bold text-white">
              Categorii de produse
            </h1>
            <Image
              src="/logo.svg"
              alt="Logotip"
              width={140}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </div>
          <div
            className="mx-auto grid h-full w-full grid-cols-3 [grid-template-rows:repeat(2,minmax(0,1fr))] gap-3"
            style={transformStyle}
          >
            {paginatedCategories.map((cat, index) => {
              const firstImage = categoryImages[cat.id];
              const isAboveFold = index < 3; // First row is above fold
              return (
                <Link
                  key={cat.id}
                  href={`/${cat.slug}`}
                  className="block h-full"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition hover:shadow-md active:scale-[0.98]">
                    {firstImage && (
                      <div className="bg-background relative w-full flex-1">
                        <Image
                          src={firstImage}
                          alt={cat.name}
                          fill
                          className="object-cover"
                          sizes="33vw"
                          loading={isAboveFold ? "eager" : "lazy"}
                          priority={isAboveFold}
                        />
                      </div>
                    )}
                    <div className="p-4 text-center">
                      <h2 className="font-display text-primary text-lg leading-tight font-semibold">
                        {cat.name}
                      </h2>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-auto">
            <Pagination
              totalItems={categories.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
