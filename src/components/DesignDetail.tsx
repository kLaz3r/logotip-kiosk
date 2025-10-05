"use client";

import { motion } from "motion/react";
import Image from "next/image";
import type { Design } from "~/data/types";

interface DesignDetailProps {
  design: Design;
}

export function DesignDetail({ design }: DesignDetailProps) {
  const formatRon = (value: number) => `${value.toLocaleString("ro-RO")} RON`;
  const pricingEntries = Object.entries(design.pricing);
  const hasTags = Boolean(design.tags?.length);
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <motion.div
        className="relative aspect-square w-full overflow-hidden rounded-xl border border-black/10 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Image
          src={design.image}
          alt={design.name}
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut", delay: 0.04 }}
      >
        <h1 className="font-display text-3xl font-bold text-white">
          {design.name}
        </h1>
        {hasTags ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {design.tags?.map((tag) => (
              <span
                key={tag}
                className="text-primary rounded-full bg-white px-3 py-1 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4">
          {design.description ? (
            <p className="text-white/80">{design.description}</p>
          ) : null}
        </div>

        <motion.div
          className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut", delay: 0.06 }}
        >
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-text text-base font-semibold tracking-wide uppercase">
              Prețuri
            </h2>
            {design.priceRange ? (
              <p className="text-primary text-sm font-medium md:text-base">
                {design.priceRange.min === design.priceRange.max
                  ? `Fix ${formatRon(design.priceRange.min)}`
                  : `De la ${formatRon(design.priceRange.min)} până la ${formatRon(
                      design.priceRange.max,
                    )}`}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {pricingEntries.map(([type, price]) => (
              <div
                key={type}
                className="bg-primary/5 flex items-center justify-between rounded-lg border border-black/10 px-4 py-4"
              >
                <span className="text-text text-base font-medium md:text-lg">
                  {type}
                </span>
                <span className="text-primary text-base font-semibold md:text-lg">
                  {formatRon(price)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-6 space-y-3">
          {design.materials?.length ? (
            <p className="text-sm text-white/80">
              Materiale: {design.materials.join(", ")}
            </p>
          ) : null}
          {design.sizes?.length ? (
            <p className="text-sm text-white/80">
              Mărimi: {design.sizes.join(", ")}
            </p>
          ) : null}
          {design.turnaroundTime ? (
            <p className="text-sm text-white/80">
              Timp execuție: {design.turnaroundTime}
            </p>
          ) : null}
        </div>

        <motion.div
          className="mt-10 rounded-2xl border border-black/10 bg-white p-6 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut", delay: 0.08 }}
        >
          <p className="text-primary text-base font-semibold md:text-lg">
            Întreabă un reprezentant pentru comandă
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
