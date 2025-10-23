import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryPageClient } from "~/components/CategoryPageClient";
import {
  getAllCategorySlugs,
  getCategoryBySlug,
  getDesignsByCategory,
} from "~/lib/catalogue";

interface PageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  const slugs = getAllCategorySlugs();
  return slugs.map((slug) => ({
    category: slug,
  }));
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) return notFound();

  const hasSubcategories = Boolean(category?.subcategories?.length);
  const designs = hasSubcategories
    ? []
    : getDesignsByCategory(category?.id ?? "");

  return (
    <Suspense fallback={null}>
      <CategoryPageClient
        category={category}
        designs={designs}
        categorySlug={categorySlug}
      />
    </Suspense>
  );
}
