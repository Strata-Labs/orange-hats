import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}) => {
  return (
    <div className="flex justify-center items-center gap-4 my-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        className="px-6 py-2 bg-main-orange text-black rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft />
      </button>

      <div className="flex items-center gap-2 text-secondary-white">
        <span>Page</span>
        <span className="px-3 py-1 bg-main-dark-grey rounded-md">
          {currentPage}
        </span>
        <span>of {totalPages}</span>
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="px-6 py-2 bg-main-orange text-black rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight />
      </button>
    </div>
  );
};

export default Pagination;
