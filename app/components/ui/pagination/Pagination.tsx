"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductsPerPageDropdown from "./ProductsPerPageDropdown";
import generatePageNumbers from "./generatePageNumbers";
import { Suspense } from "react";

const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_PAGE = 1;

function PaginationContent({
  totalProductsCount,
}: {
  totalProductsCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (totalProductsCount === undefined) return null;
  const currentPage = Number(searchParams.get("page")) || DEFAULT_PAGE;
  const pageSize = Number(searchParams.get("size")) || DEFAULT_PAGE_SIZE;
  const pagesCount = Math.ceil(totalProductsCount / pageSize);
  const createPageUrl = (pageNum: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNum.toString());
    return `${pathname}?${params.toString()}`;
  };
  const handlePrevPage = () => {
    if (currentPage > 1) {
      router.push(createPageUrl(currentPage - 1));
    }
  };
  const handleNextPage = () => {
    if (currentPage < pagesCount) {
      router.push(createPageUrl(currentPage + 1));
    }
  };
  const pageNavItems = generatePageNumbers(currentPage, pagesCount);
  const NumberButton = ({ pageNum }: { pageNum: number | string }) => (
    <a
      href={createPageUrl(pageNum)}
      onClick={(e) => {
        e.preventDefault();
        router.push(createPageUrl(pageNum));
      }}
      className={`text-xs px-1 md:py-1 mx-1 md:px-3 py-1 rounded-xl ${
        pageNum === currentPage
          ? "bg-blue-500 text-white"
          : "bg-gray-200 hover:bg-gray-300"
      }`}
    >
      {pageNum}
    </a>
  );
  return (
    <div>
      <div className="grid grid-cols-8 md:flex md:items-center md:justify-between ">
        <h1 className="hidden md:block text-sm">
          Page {currentPage} of {pagesCount}
        </h1>
        <ProductsPerPageDropdown />
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className={`col-start-4 w-12 md:hidden px-1 md:px-3 md:py-1 text-xs rounded ${
            currentPage <= 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Prev
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage >= pagesCount}
          className={`col-start-6 w-12 md:hidden  px-1 md:px-3 md:py-1 text-xs py-1 rounded ${
            currentPage >= pagesCount
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Next
        </button>
      </div>
      <div className="px-4 flex justify-around items-center max-w-[400px] my-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className={`hidden md:block px-1 md:px-3 md:py-1 text-xs rounded ${
            currentPage <= 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Prev
        </button>
        <div className="flex">
          {pageNavItems.map((item, index) =>
            item === "..." ? (
              <span
                key={`text-xs ellipsis-${index}`}
                className="pagination-ellipsis"
              >
                ...
              </span>
            ) : (
              <NumberButton key={`page-${item}`} pageNum={item} />
            ),
          )}
        </div>
        <button
          onClick={handleNextPage}
          disabled={currentPage >= pagesCount}
          className={`hidden md:block  px-1 md:px-3 md:py-1 text-xs py-1 rounded ${
            currentPage >= pagesCount
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function Pagination(props: {
  totalProductsCount: number;
}) {
  return (
    <Suspense fallback={null}>
      <PaginationContent {...props} />
    </Suspense>
  );
}
