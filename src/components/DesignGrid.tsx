import type { CSSProperties } from "react";
import { memo, useMemo } from "react";
import { DesignCard } from "~/components/DesignCard";
import { Pagination } from "~/components/Pagination";
import type { Design } from "~/data/types";

interface DesignGridProps {
  designs: Design[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
  transformStyle?: CSSProperties;
}

export const DesignGrid = memo(function DesignGrid({
  designs,
  currentPage = 1,
  onPageChange,
  itemsPerPage = 6,
  transformStyle,
}: DesignGridProps) {
  const paginatedDesigns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return designs.slice(startIndex, endIndex);
  }, [designs, currentPage, itemsPerPage]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="mx-auto grid h-full w-full grid-cols-3 [grid-template-rows:repeat(2,minmax(0,1fr))] gap-3"
        style={transformStyle}
      >
        {paginatedDesigns.map((d) => (
          <DesignCard key={d.id} design={d} currentPage={currentPage} />
        ))}
      </div>

      {onPageChange && (
        <div className="mt-auto">
          <Pagination
            totalItems={designs.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
});
