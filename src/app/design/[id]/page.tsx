import { notFound } from "next/navigation";
import { use } from "react";
import { DesignDetail } from "~/components/DesignDetail";
import { NavigationBreadcrumb } from "~/components/NavigationBreadcrumb";
import { getCategories, getDesignById } from "~/lib/catalogue";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DesignPage({ params }: PageProps) {
  const { id } = use(params as unknown as Promise<{ id: string }>);
  const design = getDesignById(id);
  if (!design) return notFound();

  const categories = getCategories();
  const category = categories.find((c) => c.id === design.categoryId);
  const subcategory = category?.subcategories?.find(
    (s) => s.id === design.subcategoryId,
  );

  return (
    <main className="container mx-auto h-screen overflow-hidden px-4 py-6">
      <NavigationBreadcrumb
        items={[
          { label: "Acasă", href: "/" },
          category
            ? { label: category.name, href: `/${category.slug}` }
            : { label: "Categorie" },
          subcategory ? { label: subcategory.name } : { label: design.name },
        ]}
        variant="light"
      />
      <DesignDetail design={design} />
    </main>
  );
}
