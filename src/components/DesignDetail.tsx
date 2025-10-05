import Image from "next/image";
import type { Design } from "~/data/types";

interface DesignDetailProps {
  design: Design;
}

export function DesignDetail({ design }: DesignDetailProps) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-black/10 bg-white">
        <Image
          src={design.image}
          alt={design.name}
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
      <div>
        <h1 className="font-display text-primary text-3xl font-bold">
          {design.name}
        </h1>
        <div className="mt-2">
          {Object.entries(design.pricing).map(([type, price]) => (
            <p key={type} className="text-primary text-xl font-semibold">
              {type}: {price} RON
            </p>
          ))}
        </div>
        {design.description ? (
          <p className="text-text/80 mt-4">{design.description}</p>
        ) : null}

        <div className="mt-6 space-y-3">
          {design.customizable ? (
            <p className="bg-secondary/20 rounded px-3 py-2 text-sm">
              Poate fi personalizat cu text/poză
            </p>
          ) : null}
          {design.materials?.length ? (
            <p className="text-text/80 text-sm">
              Materiale: {design.materials.join(", ")}
            </p>
          ) : null}
          {design.sizes?.length ? (
            <p className="text-text/80 text-sm">
              Mărimi: {design.sizes.join(", ")}
            </p>
          ) : null}
          {design.turnaroundTime ? (
            <p className="text-text/80 text-sm">
              Timp execuție: {design.turnaroundTime}
            </p>
          ) : null}
        </div>

        <div className="bg-primary/5 mt-8 rounded-xl p-4">
          <p className="text-primary text-sm font-medium">
            Întreabă un reprezentant pentru comandă
          </p>
        </div>
      </div>
    </div>
  );
}
