import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, use } from "react";
import { getCategories, getDesignById, getDesigns } from "~/lib/catalogue";
import { DesignPageClient } from "./DesignPageClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate static params for all design pages
export async function generateStaticParams() {
  try {
    const designs = getDesigns();
    return designs.map((design) => ({
      id: design.id,
    }));
  } catch {
    return [];
  }
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

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DesignPageClient design={design} />
    </Suspense>
  );
}
