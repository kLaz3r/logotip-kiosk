"use client";

import { notFound, useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { BackButton } from "~/components/BackButton";
import { DesignGrid } from "~/components/DesignGrid";
import { NavigationBreadcrumb } from "~/components/NavigationBreadcrumb";
import { useSwipeGesture } from "~/hooks/useSwipeGesture";
import { getCategoryBySlug, getDesignsByCategory } from "~/lib/catalogue";

interface PageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

export default function SubcategoryPage({ params }: PageProps) {
  const { category: categorySlug, subcategory: subcategorySlug } = use(
    params as unknown as Promise<{ category: string; subcategory: string }>,
  );

  const category = getCategoryBySlug(categorySlug);
  const subcategory = category?.subcategories?.find(
    (s) => s.slug === subcategorySlug,
  );
  const designs =
    category && subcategory
      ? getDesignsByCategory(category.id, subcategory.id)
      : [];
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
        router.replace(`/${categorySlug}/${subcategorySlug}`);
      }
    }
  }, [searchParams, router, categorySlug, subcategorySlug]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(designs.length / itemsPerPage);

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
  if (!subcategory) return notFound();

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
