import data from "~/data/catalogue.json";
import type { CatalogueData, Category, Design } from "~/data/types";

const catalogueData = data as unknown as CatalogueData;

if (!catalogueData?.categories || !catalogueData?.designs) {
  throw new Error("Invalid catalogue data");
}

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

export function getDesigns(): Design[] {
  return catalogueData.designs;
}

export function getFirstImageForCategory(
  categoryId: string,
  subcategoryId?: string,
): string | undefined {
  const designs = getDesignsByCategory(categoryId, subcategoryId);
  return designs.length > 0 ? designs[0]?.image : undefined;
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
