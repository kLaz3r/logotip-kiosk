import Image from "next/image";
import Link from "next/link";
import { getCategories } from "~/lib/catalogue";

export default function HomePage() {
  const categories = getCategories();
  return (
    <main className="bg-background min-h-screen">
      <header className="container mx-auto flex items-center justify-center gap-4 px-4 py-6">
        <Image src="/logo.svg" alt="Logotip" width={48} height={48} />
        <h1 className="font-display text-primary text-3xl font-bold">
          Logotip Kiosk
        </h1>
      </header>
      <section
        className="container mx-auto px-4 pt-4 pb-16"
        style={{ backgroundImage: "url(/logotip-bg.svg)" }}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/${cat.slug}`} className="block">
              <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm transition hover:shadow-md active:scale-[0.98]">
                <h2 className="font-display text-primary text-2xl font-semibold">
                  {cat.name}
                </h2>
                {cat.description ? (
                  <p className="text-text/70 mt-2 text-sm">{cat.description}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
