import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers
  const pages: number[] = [];
  const maxDisplayedPages = 5;

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);

  if (endPage - startPage + 1 < maxDisplayedPages) {
    startPage = Math.max(1, endPage - maxDisplayedPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePageSelect = (page: number) => {
    onPageChange(page);
    // Smooth scroll to top of catalog section
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className={`flex items-center justify-center gap-1.5 my-8 ${className}`}>
      {/* Previous Page Arrow Button */}
      {currentPage > 1 && (
        <button
          onClick={() => handlePageSelect(currentPage - 1)}
          className="w-11 h-11 flex items-center justify-center bg-white border border-[#181310] text-[#181310] hover:bg-gray-100 transition cursor-pointer rounded-none text-sm font-sans font-bold select-none"
          aria-label="Previous Page"
          title="Previous Page"
        >
          ←
        </button>
      )}

      {/* First Page button if startPage > 1 */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => handlePageSelect(1)}
            className={`w-11 h-11 flex items-center justify-center border transition cursor-pointer rounded-none text-sm font-sans font-bold select-none ${
              currentPage === 1
                ? 'bg-[#181310] text-white border-[#181310]'
                : 'bg-white text-[#181310] border-[#181310] hover:bg-gray-100'
            }`}
          >
            1
          </button>
          {startPage > 2 && (
            <span className="w-8 h-11 flex items-center justify-center text-[#181310] font-bold select-none text-xs">...</span>
          )}
        </>
      )}

      {/* Main Page Numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => handlePageSelect(page)}
          className={`w-11 h-11 flex items-center justify-center border transition cursor-pointer rounded-none text-sm font-sans font-bold select-none ${
            currentPage === page
              ? 'bg-[#181310] text-white border-[#181310]'
              : 'bg-white text-[#181310] border-[#181310] hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Last Page button if endPage < totalPages */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="w-8 h-11 flex items-center justify-center text-[#181310] font-bold select-none text-xs">...</span>
          )}
          <button
            onClick={() => handlePageSelect(totalPages)}
            className={`w-11 h-11 flex items-center justify-center border transition cursor-pointer rounded-none text-sm font-sans font-bold select-none ${
              currentPage === totalPages
                ? 'bg-[#181310] text-white border-[#181310]'
                : 'bg-white text-[#181310] border-[#181310] hover:bg-gray-100'
            }`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Page Arrow Button */}
      {currentPage < totalPages && (
        <button
          onClick={() => handlePageSelect(currentPage + 1)}
          className="w-11 h-11 flex items-center justify-center bg-white border border-[#181310] text-[#181310] hover:bg-gray-100 transition cursor-pointer rounded-none text-sm font-sans font-bold select-none"
          aria-label="Next Page"
          title="Next Page"
        >
          →
        </button>
      )}
    </div>
  );
};
