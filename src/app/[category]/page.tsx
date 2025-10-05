"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { BackButton } from "~/components/BackButton";
import { DesignGrid } from "~/components/DesignGrid";
import { NavigationBreadcrumb } from "~/components/NavigationBreadcrumb";
import { Pagination } from "~/components/Pagination";
import {
  getCategoryBySlug,
  getDesignsByCategory,
  getFirstImageForCategory,
} from "~/lib/catalogue";

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
  const paginatedSubcategories = hasSubcategories
    ? subcategories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      )
    : [];

  return (
    <main
      className="h-screen overflow-hidden px-4 py-6"
      style={{ backgroundImage: "url(/logotip-bg.svg)" }}
    >
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
              {paginatedSubcategories.map((sc) => {
                const firstImage = getFirstImageForCategory(category.id, sc.id);
                return (
                  <Link
                    key={sc.id}
                    href={`/${category.slug}/${sc.slug}`}
                    className="block h-full"
                  >
                    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition hover:shadow-md active:scale-[0.98]">
                      {firstImage && (
                        <div className="bg-background relative w-full flex-1">
                          <Image
                            src={firstImage}
                            alt={sc.name}
                            fill
                            className="object-cover"
                            sizes="33vw"
                          />
                        </div>
                      )}
                      <div className="p-3 text-center">
                        <h2 className="font-display text-primary text-lg leading-tight font-semibold">
                          {sc.name}
                        </h2>
                      </div>
                    </div>
                  </Link>
                );
              })}
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
