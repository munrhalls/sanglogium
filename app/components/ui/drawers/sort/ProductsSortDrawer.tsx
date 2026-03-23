"use client";
import { useSearchParams, usePathname } from "next/navigation";
import { X } from "@phosphor-icons/react";
import SortClient from "../../sortables/SortClient";
import { SortOption } from "../../sortables/SortTypes";
import Link from "next/link";
import { Suspense } from "react";

function ProductsSortDrawerContent({
  sortOptions = [],
}: {
  sortOptions: SortOption[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isOpen = searchParams.get("sort") === "true";

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full transform bg-blue-950 text-white shadow-xl sm:w-[85%] md:hidden ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } z-50 transition-transform duration-300 ease-in-out`}
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold text-white">Sort Products</h2>
          <Link
            href={pathname}
            className="rounded-full p-2 hover:bg-blue-900"
            aria-label="Close sort drawer"
            scroll={false}
          >
            <X className="h-6 w-6" />
          </Link>
        </header>
        <div className="flex-1 overflow-y-auto p-4 text-white">
          <SortClient
            initialSortOptions={sortOptions}
            currentSort={sortOptions.length > 0 ? sortOptions[0].name : ""}
          />
        </div>
        <footer className="border-t p-4">
          <Link
            href={pathname}
            className="block w-full rounded-md bg-white py-2 text-center font-medium text-blue-950"
            scroll={false}
          >
            Apply Sort
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default function ProductsSortDrawer(props: {
  sortOptions: SortOption[];
}) {
  return (
    <Suspense fallback={null}>
      <ProductsSortDrawerContent {...props} />
    </Suspense>
  );
}
