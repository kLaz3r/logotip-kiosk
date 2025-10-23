import data from "~/data/catalogue.json";
import type { CatalogueData, Category, Design } from "~/data/types";

const catalogueData = data as unknown as CatalogueData;

if (!catalogueData?.categories || !catalogueData?.designs) {
  throw new Error("Invalid catalogue data");
}

// Memoization caches for expensive lookups
const categorySlugCache = new Map<string, Category | undefined>();
const designIdCache = new Map<string, Design | undefined>();
const designsByCategoryCache = new Map<string, Design[]>();
const firstImageCache = new Map<string, string | undefined>();

export function getCategories(): Category[] {
  return catalogueData.categories;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  if (!categorySlugCache.has(slug)) {
    const category = catalogueData.categories.find((cat) => cat.slug === slug);
    categorySlugCache.set(slug, category);
  }
  return categorySlugCache.get(slug);
}

export function getDesignsByCategory(
  categoryId: string,
  subcategoryId?: string,
): Design[] {
  const cacheKey = subcategoryId
    ? `${categoryId}:${subcategoryId}`
    : categoryId;

  if (!designsByCategoryCache.has(cacheKey)) {
    const designs = catalogueData.designs.filter((design) => {
      if (subcategoryId) {
        return (
          design.categoryId === categoryId &&
          design.subcategoryId === subcategoryId
        );
      }
      return design.categoryId === categoryId;
    });
    designsByCategoryCache.set(cacheKey, designs);
  }

  return designsByCategoryCache.get(cacheKey)!;
}

export function getDesignById(id: string): Design | undefined {
  if (!designIdCache.has(id)) {
    const design = catalogueData.designs.find((design) => design.id === id);
    designIdCache.set(id, design);
  }
  return designIdCache.get(id);
}

export function getDesigns(): Design[] {
  return catalogueData.designs;
}

export function getFirstImageForCategory(
  categoryId: string,
  subcategoryId?: string,
): string | undefined {
  const cacheKey = subcategoryId
    ? `${categoryId}:${subcategoryId}`
    : categoryId;

  if (!firstImageCache.has(cacheKey)) {
    const designs = getDesignsByCategory(categoryId, subcategoryId);
    const image = designs.length > 0 ? designs[0]?.image : undefined;
    firstImageCache.set(cacheKey, image);
  }

  return firstImageCache.get(cacheKey);
}

export function getAllCategorySlugs(): string[] {
  return catalogueData.categories.map((cat) => cat.slug);
}

export function getAllSubcategoryPaths(): Array<{
  category: string;
  subcategory: string;
}> {
  const paths: Array<{ category: string; subcategory: string }> = [];

  catalogueData.categories.forEach((category) => {
    if (category.subcategories && category.subcategories.length > 0) {
      category.subcategories.forEach((subcategory) => {
        paths.push({
          category: category.slug,
          subcategory: subcategory.slug,
        });
      });
    }
  });

  return paths;
}
