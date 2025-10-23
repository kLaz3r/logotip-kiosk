import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SubcategoryPageClient } from "~/components/SubcategoryPageClient";
import {
  getAllSubcategoryPaths,
  getCategoryBySlug,
  getDesignsByCategory,
} from "~/lib/catalogue";

interface PageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

export function generateStaticParams() {
  return getAllSubcategoryPaths();
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;

  const category = getCategoryBySlug(categorySlug);
  const subcategory = category?.subcategories?.find(
    (s) => s.slug === subcategorySlug,
  );

  if (!category) return notFound();
  if (!subcategory) return notFound();

  const designs = getDesignsByCategory(category.id, subcategory.id);

  return (
    <Suspense fallback={null}>
      <SubcategoryPageClient
        category={category}
        subcategory={subcategory}
        designs={designs}
        categorySlug={categorySlug}
        subcategorySlug={subcategorySlug}
      />
    </Suspense>
  );
}
