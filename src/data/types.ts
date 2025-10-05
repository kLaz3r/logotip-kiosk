export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Design {
  id: string;
  categoryId: string;
  subcategoryId?: string | null;
  name: string;
  image: string;
  pricing: Record<string, number>;
  priceRange?: { min: number; max: number };
  description?: string;
  tags?: string[];
  featured?: boolean;
  materials?: string[];
  sizes?: string[];
  turnaroundTime?: string;
}

export interface CatalogueData {
  categories: Category[];
  designs: Design[];
}
