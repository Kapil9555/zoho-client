'use client';

import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export default function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onLimitChange,
}) {
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between border border-gray-200 text-sm bg-gray-50 text-gray-700 rounded-md overflow-hidden">
        <div className="flex items-center px-4 py-2 space-x-2 border-r">
          <span>Items per page:</span>
          <div className="relative">
            <select
              className="bg-transparent outline-none appearance-none pr-5 cursor-pointer"
              value={itemsPerPage}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value)) {
                  onLimitChange(value);
                  onPageChange(1);
                }
              }}
            >
              {[5, 10, 25, 50].map((limit) => (
                <option key={limit} value={limit} className="text-black">
                  {limit}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-1 top-1.5 pointer-events-none" />
          </div>
        </div>

        <div className="px-4 py-2 border-r">
          {(currentPage - 1) * itemsPerPage + 1}–
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </div>

        <div className="flex items-center px-4 py-2 space-x-2 border-r">
          <div className="relative">
            <select
              className="bg-transparent outline-none appearance-none pr-5 cursor-pointer"
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (!isNaN(page)) onPageChange(page);
              }}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p} className="text-black">
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-1 top-1.5 pointer-events-none" />
          </div>
          <span>of {totalPages} pages</span>
        </div>

        <div className="flex items-center px-4 py-2 space-x-2">
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 rounded disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}