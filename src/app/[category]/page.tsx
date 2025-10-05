"use client";

import { notFound } from "next/navigation";
import { use, useState } from "react";
import { BackButton } from "~/components/BackButton";
import { CategoryCard } from "~/components/CategoryCard";
import { DesignGrid } from "~/components/DesignGrid";
import { NavigationBreadcrumb } from "~/components/NavigationBreadcrumb";
import { Pagination } from "~/components/Pagination";
import { getCategoryBySlug, getDesignsByCategory } from "~/lib/catalogue";

interface PageProps {
  params: Promise<{ category: string }>;
}

export default function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = use(
    params as unknown as Promise<{ category: string }>,
  );
  const category = getCategoryBySlug(categorySlug);
  const [currentPage, setCurrentPage] = useState(1);

  if (!category) return notFound();

  const hasSubcategories = Boolean(category.subcategories?.length);
  const designs = hasSubcategories ? [] : getDesignsByCategory(category.id);
  const itemsPerPage = 6;
  const subcategories = category.subcategories ?? [];
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubcategories = hasSubcategories
    ? subcategories.slice(startIndex, startIndex + itemsPerPage)
    : [];

  return (
    <main className="h-screen overflow-hidden px-4 py-6">
      <div className="container mx-auto flex h-full min-h-0 flex-col">
        <div className="mb-6 flex shrink-0 items-center gap-4">
          <BackButton />
          <NavigationBreadcrumb
            items={[{ label: "Acasă", href: "/" }, { label: category.name }]}
            variant="light"
          />
        </div>
        {hasSubcategories ? (
          <>
            <div className="mx-auto grid h-full w-full grid-cols-3 [grid-template-rows:repeat(2,minmax(0,1fr))] gap-3">
              {paginatedSubcategories.map((sc, index) => (
                <CategoryCard
                  key={sc.id}
                  category={{
                    id: sc.id,
                    name: sc.name,
                    slug: sc.slug,
                    description: sc.description,
                  }}
                  href={`/${category.slug}/${sc.slug}`}
                  index={startIndex + index}
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
          />
        )}
      </div>
    </main>
  );
}
