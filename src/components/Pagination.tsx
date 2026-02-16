import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords?: number;
  limit?: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  if (totalPages <= 0) return null;

  const getPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const startRecord = totalRecords ? (currentPage - 1) * (limit || 10) + 1 : 0;
  const endRecord = totalRecords
    ? Math.min(currentPage * (limit || 10), totalRecords)
    : 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 gap-3">
      {/* Left: Record info + per-page selector */}
      <div className="flex items-center gap-4">
        {totalRecords !== undefined && (
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{startRecord}</span>
            {' – '}
            <span className="font-semibold text-gray-900">{endRecord}</span>
            {' of '}
            <span className="font-semibold text-gray-900">{totalRecords}</span> records
          </p>
        )}
        {onLimitChange && limit && (
          <div className="flex items-center gap-1.5">
            <label className="text-sm text-gray-500">Per page:</label>
            <select
              value={limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value))}
              className="rounded-lg border border-gray-300 py-1 px-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none appearance-none bg-white cursor-pointer"
            >
              {[5, 10, 15, 20, 25, 50].map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Mobile simple nav */}
      <div className="flex sm:hidden items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Desktop full pagination */}
      {totalPages > 1 && (
        <nav className="hidden sm:flex isolate items-center gap-1">
          {/* First */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          {/* Previous */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          {getPages().map((page, idx) =>
            typeof page === 'string' ? (
              <span
                key={`ellipsis-${idx}`}
                className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-3.5 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 transition-colors ${
                  currentPage === page
                    ? 'z-10 bg-indigo-600 text-white ring-indigo-600 hover:bg-indigo-700'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {/* Last */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
};
