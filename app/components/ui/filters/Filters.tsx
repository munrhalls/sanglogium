"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import FilterItem from "./FilterItem";
import parseFilterValue from "./helpers/parseFilterValue";
import normalizeFilters from "./helpers/normalizeFilters";
import { FilterOptions } from "./FilterTypes";

function FiltersContent({
  filterOptions,
}: {
  filterOptions: FilterOptions;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isTransitioning, setIsTransitioning] = useState(false);
  if (!Array.isArray(filterOptions) || filterOptions.length === 0) {
    return <div className="filters">No filters available</div>;
  }
  function handleFilterChange(
    name: string,
    value:
      | string
      | number
      | boolean
      | { min?: number; max?: number }
      | string[]
      | null,
    type: string
  ) {
    setIsTransitioning(true);
    const params = new URLSearchParams(searchParams.toString());
    if (type === "checkbox" && value === false) {
      params.delete(name);
    } else if (!value || (Array.isArray(value) && value.length === 0)) {
      params.delete(name);
    } else if (type === "multiselect") {
      const valueToStore = Array.isArray(value) ? value : [value];
      params.set(name, JSON.stringify(valueToStore));
    } else if (type === "range") {
      if (
        typeof value === "object" &&
        value !== null &&
        "min" in value &&
        value.min !== undefined
      ) {
        params.set(`${name}_min`, String(value.min));
      } else {
        params.delete(`${name}_min`);
      }
      if (
        typeof value === "object" &&
        value !== null &&
        "max" in value &&
        value.max !== undefined &&
        value.max !== null
      ) {
        params.set(`${name}_max`, String(value.max));
      } else {
        params.delete(`${name}_max`);
      }
      params.delete(name);
    } else {
      params.set(name, String(value).toLowerCase().trim());
    }
    params.set("page", "1");
    const filterObj = Object.fromEntries(params.entries());
    const normalized = normalizeFilters(filterObj);
    const normalizedParams = new URLSearchParams();
    Object.entries(normalized).forEach(([key, val]) => {
      normalizedParams.set(key, String(val));
    });
    if (!normalizedParams.has("page")) {
      normalizedParams.set("page", "1");
    }
    router.push(`${pathname}?${normalizedParams.toString()}`, {
      scroll: false,
    });
    setTimeout(() => setIsTransitioning(false), 600);
  }
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
  }
  function handleReset() {
    setIsTransitioning(true);
    const params = new URLSearchParams();
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setTimeout(() => setIsTransitioning(false), 600);
  }
  return (
    <div className="filters relative p-4">
      {isTransitioning && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/50">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-700 border-t-transparent"></div>
        </div>
      )}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {filterOptions.map((filter, index) => {
          if (!filter || !filter.name || !filter.type) return null;
          const normalizedName = (filter.name || "").toLowerCase().trim();
          const paramValue = searchParams.get(normalizedName);
          const filterType = filter.type as
            | "boolean"
            | "checkbox"
            | "multiselect"
            | "radio"
            | "range";
          const currentValue = parseFilterValue(paramValue, filterType);
          return (
            <FilterItem
              key={`${filter.name}-${index}`}
              filter={filter}
              value={currentValue}
              onChange={(
                value:
                  | string
                  | number
                  | boolean
                  | { min?: number; max?: number }
                  | string[]
                  | null
              ) => handleFilterChange(normalizedName, value, filterType)}
            />
          );
        })}
        {filterOptions.length > 0 && (
          <div className="mt-4">
            <button
              type="reset"
              onClick={handleReset}
              className="rounded border border-gray-300 px-4 py-2"
            >
              Clear All
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default function Filters(props: {
  filterOptions: FilterOptions;
}) {
  return (
    <Suspense fallback={null}>
      <FiltersContent {...props} />
    </Suspense>
  );
}
