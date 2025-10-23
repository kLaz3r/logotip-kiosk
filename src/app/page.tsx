import { HomePageClient } from "~/components/HomePageClient";
import { getCategories, getFirstImageForCategory } from "~/lib/catalogue";

// Server component: fetch data on server, pass to client
export default function HomePage() {
  const categories = getCategories();

  // Pre-compute all category images on server to avoid client-side lookups
  const categoryImages = categories.reduce(
    (acc, cat) => {
      acc[cat.id] = getFirstImageForCategory(cat.id);
      return acc;
    },
    {} as Record<string, string | undefined>,
  );

  return (
    <HomePageClient categories={categories} categoryImages={categoryImages} />
  );
}
