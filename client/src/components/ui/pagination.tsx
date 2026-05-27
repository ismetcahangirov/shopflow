// src/components/ui/pagination.tsx
// High-fidelity premium styled Pagination component supporting sibling ranges, boundaries, active styling, and text info indicators

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  totalEntries?: number;
  pageSize?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  totalEntries,
  pageSize = 10,
  className,
  ...props
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis for large scales
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first, last, currentPage, and siblings
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push("ellipsis-start");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  // Info calculations
  const startEntry = (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalEntries || 0);

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 w-full",
        className
      )}
      {...props}
    >
      {/* Informative text */}
      {showInfo && totalEntries !== undefined ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 select-none">
          Toplam{" "}
          <span className="font-bold text-slate-900 dark:text-white">
            {totalEntries}
          </span>{" "}
          nəticədən{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {startEntry}-{endEntry}
          </span>{" "}
          arası göstərilir
        </p>
      ) : showInfo ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 select-none">
          Səhifə{" "}
          <span className="font-bold text-slate-900 dark:text-white">
            {currentPage}
          </span>{" "}
          / <span className="font-semibold">{totalPages}</span>
        </p>
      ) : (
        <div />
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5" data-testid="pagination-buttons">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Əvvəlki səhifə"
          className="h-8 w-8 rounded-xl"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((page, index) => {
          if (typeof page === "string") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-8 w-8 items-center justify-center text-slate-400 dark:text-slate-650"
                data-testid="pagination-ellipsis"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <Button
              key={page}
              variant={isActive ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-8 w-8 text-xs font-bold rounded-lg transition-all duration-200",
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                  : "border-slate-200/80 text-slate-650 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-900"
              )}
              onClick={() => onPageChange(page)}
              aria-label={`Səhifə ${page}`}
              aria-current={isActive ? "page" : undefined}
            >
              {page}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Növbəti səhifə"
          className="h-8 w-8 rounded-xl"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
