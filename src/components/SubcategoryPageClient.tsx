"use client";

import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BackButton } from "~/components/BackButton";
import { DesignGrid } from "~/components/DesignGrid";
import { NavigationBreadcrumb } from "~/components/NavigationBreadcrumb";
import type { Category, Design, Subcategory } from "~/data/types";
import { useSwipeGesture } from "~/hooks/useSwipeGesture";

interface SubcategoryPageClientProps {
  category: Category;
  subcategory: Subcategory;
  designs: Design[];
  categorySlug: string;
  subcategorySlug: string;
}

export function SubcategoryPageClient({
  category,
  subcategory,
  designs,
  categorySlug,
  subcategorySlug,
}: SubcategoryPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;
  const totalPages = useMemo(
    () => Math.ceil(designs.length / itemsPerPage),
    [designs.length, itemsPerPage],
  );

  const handleSwipeLeft = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const handleSwipeRight = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const swipeState = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  const transformStyle = useMemo(
    () => ({
      transform: `translateX(${swipeState.offset}px)`,
      transition: swipeState.isTransitioning
        ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        : "none",
    }),
    [swipeState.offset, swipeState.isTransitioning],
  );

  // Restore pagination state from URL params and clean up URL
  useEffect(() => {
    const fromPage = searchParams.get("fromPage");
    if (fromPage) {
      const pageNumber = parseInt(fromPage, 10);
      if (pageNumber > 0) {
        setCurrentPage(pageNumber);
        // Replace the URL to remove the fromPage parameter
        router.replace(`/${categorySlug}/${subcategorySlug}`);
      }
    }
  }, [searchParams, router, categorySlug, subcategorySlug]);

  // Early returns after all hooks
  if (!category) return notFound();
  if (!subcategory) return notFound();

  return (
    <main className="h-screen overflow-hidden px-4 py-6">
      <div className="container mx-auto flex h-full min-h-0 flex-col">
        <div className="mb-6 flex shrink-0 items-center gap-4">
          <BackButton returnTo={`/${categorySlug}`} />
          <NavigationBreadcrumb
            items={[
              { label: "Acasă", href: "/" },
              { label: category.name, href: `/${category.slug}` },
              { label: subcategory.name },
            ]}
            variant="light"
          />
        </div>
        <DesignGrid
          designs={designs}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          transformStyle={transformStyle}
        />
      </div>
    </main>
  );
}
