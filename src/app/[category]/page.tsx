import Link from "next/link";
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
  params: { category: string };
}

export default function CategoryPage({ params }: PageProps) {
  const category = getCategoryBySlug(params.category);
  if (!category) return notFound();

  const hasSubcategories = Boolean(category.subcategories?.length);
  const designs = hasSubcategories ? [] : getDesignsByCategory(category.id);

  return (
    <main className="container mx-auto min-h-screen px-4 py-6">
      <div className="mb-3 flex items-center gap-3">
        <BackButton />
      </div>
      <NavigationBreadcrumb
        items={[{ label: "Acasă", href: "/" }, { label: category.name }]}
      />
      <h1 className="font-display text-primary mb-4 text-3xl font-bold">
        {category.name}
      </h1>

      {hasSubcategories ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.subcategories?.map((sc) => (
            <Link
              key={sc.id}
              href={`/${category.slug}/${sc.slug}`}
              className="block"
            >
              <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm transition hover:shadow-md active:scale-[0.98]">
                <h2 className="text-primary text-xl font-semibold">
                  {sc.name}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <DesignGrid designs={designs} />
      )}
    </main>
  );
}

export function generateStaticParams() {
  const categories = getCategories();
  return categories.map((c) => ({ category: c.slug }));
}
