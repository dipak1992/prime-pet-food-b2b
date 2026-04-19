"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <div className="flex items-center justify-between border-t border-[#e7e4dc] bg-white px-6 py-4">
      <div className="text-sm text-gray-600">
        Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-2 rounded-lg border border-[#e7e4dc] px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="flex gap-1">
          {visiblePages.map((p, idx) => {
            const prevPage = visiblePages[idx - 1];
            const showEllipsis = prevPage && p - prevPage > 1;

            return (
              <div key={p}>
                {showEllipsis && (
                  <span className="px-2 py-2 text-gray-600">...</span>
                )}
                <button
                  onClick={() => onPageChange(p)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    p === currentPage
                      ? "bg-green-600 text-white"
                      : "border border-[#e7e4dc] text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-2 rounded-lg border border-[#e7e4dc] px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
