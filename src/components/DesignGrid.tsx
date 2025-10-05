import { DesignCard } from "~/components/DesignCard";
import type { Design } from "~/data/types";

interface DesignGridProps {
  designs: Design[];
}

export function DesignGrid({ designs }: DesignGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {designs.map((d) => (
        <DesignCard key={d.id} design={d} />
      ))}
    </div>
  );
}
