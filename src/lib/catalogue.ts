import type { CatalogueData, Category, Design } from "@/data/types";
import catalogueRaw from "@/data/catalogue.json";

const data = catalogueRaw as unknown as CatalogueData;

const categorySlugCache = new Map<string, Category | undefined>();
const designIdCache = new Map<string, Design | undefined>();
const designsByCategoryCache = new Map<string, Design[]>();
const firstImageCache = new Map<string, string | undefined>();

export function getCategories(): Category[] {
  return data.categories;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  if (!categorySlugCache.has(slug)) {
    categorySlugCache.set(slug, data.categories.find((c) => c.slug === slug));
  }
  return categorySlugCache.get(slug);
}

export function getDesignsByCategory(categoryId: string, subcategoryId?: string): Design[] {
  const key = subcategoryId ? `${categoryId}:${subcategoryId}` : categoryId;
  if (!designsByCategoryCache.has(key)) {
    designsByCategoryCache.set(
      key,
      data.designs.filter((d) =>
        subcategoryId
          ? d.categoryId === categoryId && d.subcategoryId === subcategoryId
          : d.categoryId === categoryId,
      ),
    );
  }
  return designsByCategoryCache.get(key)!;
}

export function getDesignById(id: string): Design | undefined {
  if (!designIdCache.has(id)) {
    designIdCache.set(id, data.designs.find((d) => d.id === id));
  }
  return designIdCache.get(id);
}

export function getDesigns(): Design[] {
  return data.designs;
}

export function getFirstImage(categoryId: string, subcategoryId?: string): string | undefined {
  const key = subcategoryId ? `${categoryId}:${subcategoryId}` : categoryId;
  if (!firstImageCache.has(key)) {
    firstImageCache.set(key, getDesignsByCategory(categoryId, subcategoryId)[0]?.image);
  }
  return firstImageCache.get(key);
}

export function getAllSubcategoryPaths(): Array<{
  category: string;
  subcategory: string;
}> {
  const paths: Array<{ category: string; subcategory: string }> = [];
  for (const cat of data.categories) {
    if (cat.subcategories?.length) {
      for (const sc of cat.subcategories) {
        paths.push({ category: cat.slug, subcategory: sc.slug });
      }
    }
  }
  return paths;
}
