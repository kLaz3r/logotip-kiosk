"use client";

import { memo } from "react";

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
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const visiblePages: number[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      visiblePages.push(i);
    }
  } else if (currentPage <= 3) {
    visiblePages.push(1, 2, 3, 4, 5);
  } else if (currentPage >= totalPages - 2) {
    visiblePages.push(
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    );
  } else {
    visiblePages.push(
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    );
  }

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
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
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="text-primary hover:bg-primary/5 rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        Următor →
      </button>
    </div>
  );
});
