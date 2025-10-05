import data from "~/data/catalogue.json" assert { type: "json" };
import type { CatalogueData, Category, Design } from "~/data/types";

const catalogueData = data as unknown as CatalogueData;

export function getCategories(): Category[] {
  return catalogueData.categories;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return catalogueData.categories.find((cat) => cat.slug === slug);
}

export function getDesignsByCategory(
  categoryId: string,
  subcategoryId?: string,
): Design[] {
  return catalogueData.designs.filter((design) => {
    if (subcategoryId) {
      return (
        design.categoryId === categoryId &&
        design.subcategoryId === subcategoryId
      );
    }
    return design.categoryId === categoryId;
  });
}

export function getDesignById(id: string): Design | undefined {
  return catalogueData.designs.find((design) => design.id === id);
}

export function getFirstImageForCategory(
  categoryId: string,
  subcategoryId?: string,
): string | undefined {
  const designs = getDesignsByCategory(categoryId, subcategoryId);
  return designs.length > 0 ? designs[0]?.image : undefined;
}
