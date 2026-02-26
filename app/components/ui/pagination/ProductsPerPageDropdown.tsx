"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const DEFAULT_PAGE_SIZE = 15;

function ProductsPerPageDropdownContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const itemsPerPage = searchParams.get("size")
    ? String(searchParams.get("size"))
    : String(DEFAULT_PAGE_SIZE);
  const options = [5, 10, 15, 25, 50];
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = String(e.target.value);
    const params = new URLSearchParams(searchParams);
    params.set("size", newSize);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };
  return (
    <div className="col-start-1 col-span-2 px-2 flex md:justify-center md:items-center ">
      <label
        htmlFor="itemsPerPage"
        className="font-iceland text-xs font-semibold mr-1 flex flex-col items-center justify-center md:mr-2 md:text-sm"
      >
        <span>Products</span>
        <span>/ page</span>
      </label>
      <select
        id="itemsPerPage"
        value={itemsPerPage}
        onChange={handleChange}
        className="border rounded text-xs md:px-2 md:py-1 md:text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ProductsPerPageDropdown() {
  return (
    <Suspense fallback={null}>
      <ProductsPerPageDropdownContent />
    </Suspense>
  );
}
