"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Pagination } from "~/components/Pagination";
import { getCategories, getFirstImageForCategory } from "~/lib/catalogue";

export default function HomePage() {
  const categories = getCategories();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = categories.slice(startIndex, endIndex);
  return (
    <main className="bg-background h-screen overflow-hidden">
      <section
        className="container mx-auto h-full bg-cover px-4 py-6"
        style={{ backgroundImage: "url(/logotip-bg.svg)" }}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="mb-6 flex shrink-0 items-center justify-between gap-4">
            <h1 className="font-display text-3xl font-bold text-white">
              Categorii de produse
            </h1>
            <Image
              src="/logo.svg"
              alt="Logotip"
              width={140}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </div>
          <div className="mx-auto grid h-full w-full grid-cols-3 [grid-template-rows:repeat(2,minmax(0,1fr))] gap-3">
            {paginatedCategories.map((cat) => {
              const firstImage = getFirstImageForCategory(cat.id);
              return (
                <Link
                  key={cat.id}
                  href={`/${cat.slug}`}
                  className="block h-full"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition hover:shadow-md active:scale-[0.98]">
                    {firstImage && (
                      <div className="bg-background relative w-full flex-1">
                        <Image
                          src={firstImage}
                          alt={cat.name}
                          fill
                          className="object-cover"
                          sizes="33vw"
                        />
                      </div>
                    )}
                    <div className="p-4 text-center">
                      <h2 className="font-display text-primary text-lg leading-tight font-semibold">
                        {cat.name}
                      </h2>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-auto">
            <Pagination
              totalItems={categories.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
