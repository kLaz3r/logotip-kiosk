import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { use } from "react";
import { BackButton } from "~/components/BackButton";
import { DesignDetail } from "~/components/DesignDetail";
import { NavigationBreadcrumb } from "~/components/NavigationBreadcrumb";
import type { Design } from "~/data/types";
import { getCategories, getDesignById, getDesigns } from "~/lib/catalogue";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate static params for all design pages
export async function generateStaticParams() {
  const designs = getDesigns();

  return designs.map((design: Design) => ({
    id: design.id,
  }));
}

// Generate metadata for each design page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const design = getDesignById(id);

  if (!design) {
    return {
      title: "Design Not Found",
    };
  }

  const categories = getCategories();
  const category = categories.find((c) => c.id === design.categoryId);

  return {
    title: `${design.name} - ${category?.name ?? "Design"}`,
    description: `Personalizat ${design.name} - ${category?.name ?? "design personalizat"}. ${design.tags?.join(", ") ?? ""}`,
    openGraph: {
      title: `${design.name} - ${category?.name ?? "Design"}`,
      description: `Personalizat ${design.name} - ${category?.name ?? "design personalizat"}. ${design.tags?.join(", ") ?? ""}`,
      images: [
        {
          url: design.image,
          width: 800,
          height: 600,
          alt: design.name,
        },
      ],
    },
  };
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
