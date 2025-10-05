import { notFound } from "next/navigation";
import { DesignDetail } from "~/components/DesignDetail";
import { NavigationBreadcrumb } from "~/components/NavigationBreadcrumb";
import data from "~/data/catalogue.json" assert { type: "json" };
import type { CatalogueData } from "~/data/types";
import { getCategories, getDesignById } from "~/lib/catalogue";

interface PageProps {
  params: { id: string };
}

export default function DesignPage({ params }: PageProps) {
  const design = getDesignById(params.id);
  if (!design) return notFound();

  const categories = getCategories();
  const category = categories.find((c) => c.id === design.categoryId);
  const subcategory = category?.subcategories?.find(
    (s) => s.id === design.subcategoryId,
  );

  return (
    <main className="container mx-auto min-h-screen px-4 py-6">
      <NavigationBreadcrumb
        items={[
          { label: "Acasă", href: "/" },
          category
            ? { label: category.name, href: `/${category.slug}` }
            : { label: "Categorie" },
          subcategory ? { label: subcategory.name } : { label: design.name },
        ]}
      />
      <DesignDetail design={design} />
    </main>
  );
}

export function generateStaticParams() {
  // Using static JSON import to enumerate IDs for SSG
  const allDesigns = (data as CatalogueData).designs;
  return allDesigns.map((d) => ({ id: d.id }));
}
