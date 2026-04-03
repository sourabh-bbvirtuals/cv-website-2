import React from 'react';

interface PaginationProps {
  totalPages: number;
  validCurrentPage: number;
  totalItems: number;
  showingStart: number;
  showingEnd: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onScrollToTop: () => void;
}

export function Pagination({
  totalPages,
  validCurrentPage,
  totalItems,
  showingStart,
  showingEnd,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onScrollToTop,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Pagination Info and Page Size Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-4 order-2 lg:order-1">
          <div className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">{showingStart}</span> to{' '}
            <span className="font-medium">{showingEnd}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="page-size"
              className="text-sm text-gray-700 whitespace-nowrap"
            >
              Show:
            </label>
            <select
              id="page-size"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1 pr-8 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
              }}
            >
              <option value={30}>30 per page</option>
              <option value={60}>60 per page</option>
              <option value={120}>120 per page</option>
            </select>
          </div>
        </div>

        {/* Pagination Controls */}
        <nav
          className="flex items-center space-x-1 order-1 lg:order-2"
          aria-label="Pagination"
        >
          {/* Scroll to Top Button */}
          <button
            onClick={onScrollToTop}
            className="px-2 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 transition-all duration-200"
            title="Scroll to top"
            aria-label="Scroll to top"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>

          {/* First Page Button */}
          <button
            onClick={() => onPageChange(1)}
            disabled={validCurrentPage <= 1}
            className="px-2 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="First page"
            aria-label="Go to first page"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Previous Button */}
          <button
            onClick={() => onPageChange(validCurrentPage - 1)}
            disabled={validCurrentPage <= 1}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              validCurrentPage > 1
                ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
            }`}
            aria-label="Go to previous page"
          >
            Previous
          </button>

          {/* Page Numbers */}
          {Array.from(
            { length: Math.min(5, totalPages) },
            (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (validCurrentPage <= 3) {
                pageNum = i + 1;
              } else if (validCurrentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = validCurrentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    pageNum === validCurrentPage
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={
                    pageNum === validCurrentPage
                      ? 'page'
                      : undefined
                  }
                >
                  {pageNum}
                </button>
              );
            },
          )}

          {/* Next Button */}
          <button
            onClick={() => onPageChange(validCurrentPage + 1)}
            disabled={validCurrentPage >= totalPages}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              validCurrentPage < totalPages
                ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
            }`}
            aria-label="Go to next page"
          >
            Next
          </button>

          {/* Last Page Button */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={validCurrentPage >= totalPages}
            className="px-2 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="Last page"
            aria-label="Go to last page"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
}
