"use client";

import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BackButton } from "~/components/BackButton";
import { CategoryCard } from "~/components/CategoryCard";
import { DesignGrid } from "~/components/DesignGrid";
import { NavigationBreadcrumb } from "~/components/NavigationBreadcrumb";
import { Pagination } from "~/components/Pagination";
import type { Category, Design } from "~/data/types";
import { useSwipeGesture } from "~/hooks/useSwipeGesture";
import { getFirstImageForCategory } from "~/lib/catalogue";

interface CategoryPageClientProps {
  category: Category;
  designs: Design[];
  categorySlug: string;
}

export function CategoryPageClient({
  category,
  designs,
  categorySlug,
}: CategoryPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  // Restore pagination state from URL params and clean up URL
  useEffect(() => {
    const fromPage = searchParams.get("fromPage");
    if (fromPage) {
      const pageNumber = parseInt(fromPage, 10);
      if (pageNumber > 0) {
        setCurrentPage(pageNumber);
        // Replace the URL to remove the fromPage parameter
        router.replace(`/${categorySlug}`);
      }
    }
  }, [searchParams, router, categorySlug]);

  const hasSubcategories = Boolean(category?.subcategories?.length);
  const itemsPerPage = 6;
  const subcategories = category?.subcategories ?? [];
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubcategories = hasSubcategories
    ? subcategories.slice(startIndex, startIndex + itemsPerPage)
    : [];

  const totalItems = hasSubcategories ? subcategories.length : designs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const swipeState = useSwipeGesture({
    onSwipeLeft: () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    },
    onSwipeRight: () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
  });

  if (!category) return notFound();

  const transformStyle = {
    transform: `translateX(${swipeState.offset}px)`,
    transition: swipeState.isTransitioning
      ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      : "none",
  };

  return (
    <main className="h-screen overflow-hidden px-4 py-6">
      <div className="container mx-auto flex h-full min-h-0 flex-col">
        <div className="mb-6 flex shrink-0 items-center gap-4">
          <BackButton returnTo="/" />
          <NavigationBreadcrumb
            items={[{ label: "Acasă", href: "/" }, { label: category.name }]}
            variant="light"
          />
        </div>
        {hasSubcategories ? (
          <>
            <div
              className="mx-auto grid h-full w-full grid-cols-3 [grid-template-rows:repeat(2,minmax(0,1fr))] gap-3"
              style={transformStyle}
            >
              {paginatedSubcategories.map((sc) => (
                <CategoryCard
                  key={sc.id}
                  category={{
                    id: sc.id,
                    name: sc.name,
                    slug: sc.slug,
                    description: sc.description,
                  }}
                  href={`/${category.slug}/${sc.slug}`}
                  image={getFirstImageForCategory(category.id, sc.id)}
                />
              ))}
            </div>
            <div className="mt-auto">
              <Pagination
                totalItems={subcategories.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        ) : (
          <DesignGrid
            designs={designs}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            transformStyle={transformStyle}
          />
        )}
      </div>
    </main>
  );
}
