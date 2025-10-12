"use client";

import { useSearchParams } from "next/navigation";
import { BackButton } from "~/components/BackButton";
import { DesignDetail } from "~/components/DesignDetail";
import { NavigationBreadcrumb } from "~/components/NavigationBreadcrumb";
import type { Design } from "~/data/types";
import { getCategories } from "~/lib/catalogue";

interface DesignPageClientProps {
  design: Design;
}

export function DesignPageClient({ design }: DesignPageClientProps) {
  const searchParams = useSearchParams();

  const categories = getCategories();
  const category = categories.find((c) => c.id === design.categoryId);
  const subcategory = category?.subcategories?.find(
    (s) => s.id === design.subcategoryId,
  );

  // Determine the return URL based on the design's category/subcategory
  const getReturnUrl = () => {
    const fromPage = searchParams.get("fromPage");
    if (!category) return "/";

    let baseUrl = `/${category.slug}`;
    if (subcategory) {
      baseUrl += `/${subcategory.slug}`;
    }

    return fromPage ? `${baseUrl}?fromPage=${fromPage}` : baseUrl;
  };

  return (
    <main className="h-screen overflow-hidden px-4 py-6">
      <div className="container mx-auto flex h-full min-h-0 flex-col">
        <div className="mb-6 flex shrink-0 items-center gap-4">
          <BackButton returnTo={getReturnUrl()} />
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
