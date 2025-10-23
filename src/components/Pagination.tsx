"use client";

import { memo, useCallback, useMemo } from "react";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  currentPage: number;
}

export const Pagination = memo(function Pagination({
  totalItems,
  itemsPerPage,
  onPageChange,
  currentPage,
}: PaginationProps) {
  const totalPages = useMemo(
    () => Math.ceil(totalItems / itemsPerPage),
    [totalItems, itemsPerPage],
  );

  const visiblePages = useMemo(() => {
    if (totalPages <= 1) return [];

    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          currentPage - 2,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          currentPage + 2,
        );
      }
    }

    return pages;
  }, [totalPages, currentPage]);

  const handlePrevious = useCallback(() => {
    onPageChange(currentPage - 1);
  }, [onPageChange, currentPage]);

  const handleNext = useCallback(() => {
    onPageChange(currentPage + 1);
  }, [onPageChange, currentPage]);

  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="text-primary hover:bg-primary/5 rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        ← Anterior
      </button>

      <div className="flex items-center gap-1">
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`rounded-md px-2.5 py-1.5 text-sm font-medium ${
              currentPage === page
                ? "bg-primary text-white"
                : "text-primary hover:bg-primary/5 border border-black/10 bg-white"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="text-primary hover:bg-primary/5 rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        Următor →
      </button>
    </div>
  );
});
