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
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm transition hover:shadow-md active:scale-[0.98]"
    >
      <div className="bg-background relative w-full flex-1">
        <Image
          src={design.image}
          alt={design.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={design.featured}
        />
      </div>
      <div className="p-3">
        <h4 className="font-display text-primary text-base leading-tight font-semibold">
          {design.name}
        </h4>
        {design.customizable ? (
          <p className="text-text/70 mt-1 text-[11px]">Poate fi personalizat</p>
        ) : null}
      </div>
    </Link>
  );
}
