import Image from "next/image";
import Link from "next/link";
import type { Design } from "~/data/types";

interface DesignCardProps {
  design: Design;
}

export function DesignCard({ design }: DesignCardProps) {
  return (
    <Link
      href={`/design/${design.id}`}
      className="group overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition hover:shadow-md active:scale-[0.98]"
    >
      <div className="bg-background relative aspect-[4/3] w-full">
        <Image
          src={design.image}
          alt={design.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={design.featured}
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-primary text-lg font-semibold">
            {design.name}
          </h4>
          <span className="bg-secondary/20 text-primary rounded px-2 py-1 text-sm font-medium">
            {design.price} RON
          </span>
        </div>
        {design.customizable ? (
          <p className="text-text/70 mt-1 text-xs">Poate fi personalizat</p>
        ) : null}
      </div>
    </Link>
  );
}
