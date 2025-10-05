import { notFound } from "next/navigation";
import { BackButton } from "~/components/BackButton";
import { DesignGrid } from "~/components/DesignGrid";
import { NavigationBreadcrumb } from "~/components/NavigationBreadcrumb";
import {
  getCategories,
  getCategoryBySlug,
  getDesignsByCategory,
} from "~/lib/catalogue";

interface PageProps {
  params: { category: string; subcategory: string };
}

export default function SubcategoryPage({ params }: PageProps) {
  const category = getCategoryBySlug(params.category);
  if (!category) return notFound();
  const subcategory = category.subcategories?.find(
    (s) => s.slug === params.subcategory,
  );
  if (!subcategory) return notFound();

  const designs = getDesignsByCategory(category.id, subcategory.id);

  return (
    <main className="container mx-auto min-h-screen px-4 py-6">
      <div className="mb-3 flex items-center gap-3">
        <BackButton />
      </div>
      <NavigationBreadcrumb
        items={[
          { label: "Acasă", href: "/" },
          { label: category.name, href: `/${category.slug}` },
          { label: subcategory.name },
        ]}
      />
      <h1 className="font-display text-primary mb-4 text-3xl font-bold">
        {subcategory.name}
      </h1>
      <DesignGrid designs={designs} />
    </main>
  );
}

export function generateStaticParams() {
  const categories = getCategories();
  const params: { category: string; subcategory: string }[] = [];
  for (const c of categories) {
    for (const s of c.subcategories ?? []) {
      params.push({ category: c.slug, subcategory: s.slug });
    }
  }
  return params;
}
