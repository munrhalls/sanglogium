"use client";
import { useSearchParams, usePathname } from "next/navigation";
import { X } from "@phosphor-icons/react";
import Filters from "../../filters/Filters";
import { FilterOptions } from "../../filters/FilterTypes";
import Link from "next/link";
import { Suspense } from "react";

function ProductsFilterDrawerContent({
  filterOptions = [],
}: {
  filterOptions: FilterOptions;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isOpen = searchParams.get("filter") === "true";

  return (
    <div
      className={`fixed inset-y-0 left-0 w-full transform bg-blue-950 text-white shadow-xl sm:w-[85%] md:hidden ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } z-50 transition-transform duration-300 ease-in-out`}
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold text-white">Filter Products</h2>
          <Link
            href={pathname}
            className="rounded-full p-2 hover:bg-blue-900"
            aria-label="Close filter drawer"
            scroll={false}
          >
            <X className="h-6 w-6" />
          </Link>
        </header>
        <div className="flex-1 overflow-y-auto p-4 text-white">
          <Filters filterOptions={filterOptions} />
        </div>
        <footer className="border-t p-4">
          <Link
            href={pathname}
            className="block w-full rounded-md bg-white py-2 text-center font-medium text-blue-950"
            scroll={false}
          >
            Apply Filters
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default function ProductsFilterDrawer(props: {
  filterOptions: FilterOptions;
}) {
  return (
    <Suspense fallback={null}>
      <ProductsFilterDrawerContent {...props} />
    </Suspense>
  );
}
