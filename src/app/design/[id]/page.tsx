import { notFound } from "next/navigation";
import { use } from "react";
import { BackButton } from "~/components/BackButton";
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
    <main className="h-screen overflow-hidden px-4 py-6">
      <div className="container mx-auto flex h-full min-h-0 flex-col">
        <div className="mb-6 flex shrink-0 items-center gap-4">
          <BackButton />
          <NavigationBreadcrumb
            items={[
              { label: "Acasă", href: "/" },
              category
                ? { label: category.name, href: `/${category.slug}` }
                : { label: "Categorie" },
              subcategory
                ? { label: subcategory.name }
                : { label: design.name },
            ]}
            variant="light"
          />
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
          <div className="w-full max-w-6xl">
            <DesignDetail design={design} />
          </div>
        </div>
      </div>
    </main>
  );
}
