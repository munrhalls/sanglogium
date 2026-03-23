"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { X, ArrowDown, ArrowUp } from "@phosphor-icons/react";
import { FilterOptions } from "../filters/FilterTypes";
import { Suspense } from "react";

interface AppliedFiltersProps {
  filterOptions?: FilterOptions;
}

function AppliedFiltersContent({
  filterOptions = [],
}: AppliedFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const updateSearchParams = (key: string, value: string | null = null) => {
    const current = new URLSearchParams(searchParams.toString());
    if (key.includes("_min") || key.includes("_max")) {
      current.delete(key);
    } else if (key.includes("price") || key.includes("stock")) {
      const baseKey = key.split("_")[0];
      current.delete(`${baseKey}_min`);
      current.delete(`${baseKey}_max`);
    } else if (value === null) {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    router.replace(`${pathname}?${current.toString()}`, { scroll: false });
  };
  const toggleSortDirection = (): void => {
    const current = new URLSearchParams(searchParams.toString());
    const currentSort = current.get("sort");
    const currentDir = current.get("dir") || "asc";
    if (currentSort) {
      current.set("dir", currentDir === "asc" ? "desc" : "asc");
      router.replace(`${pathname}?${current.toString()}`, { scroll: false });
    }
  };
  const getFilterDisplayName = (key: string): string => {
    const baseKey = key.includes("_") ? key.split("_")[0] : key;
    const filter = filterOptions.find(
      (opt) => opt.name && opt.name.toLowerCase() === baseKey.toLowerCase(),
    );
    if (filter) {
      return filter.name ?? "";
    }
    return baseKey
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s: string) => s.toUpperCase())
      .replace(/_/g, " ");
  };
  const formatFilterValue = (key: string, value: string): string => {
    if (key === "price") {
      return `${value}`;
    }
    if (key.includes("_min")) {
      return `Min: ${key.includes("price") ? "$" : ""}${value}`;
    }
    if (key.includes("_max")) {
      return `Max: ${key.includes("price") ? "$" : ""}${value}`;
    }
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.join(", ");
      }
      return String(parsed);
    } catch {
      return String(value);
    }
  };
  const activeFilters: {
    filters: Array<{ key: string; value: string }>;
    sort: { name: string; dir: string } | null;
  } = Array.from(searchParams.entries())
    .filter(([key]) => !key.includes("page"))
    .reduce(
      (
        acc: {
          filters: Array<{ key: string; value: string }>;
          sort: { name: string; dir: string } | null;
        },
        [key, value],
      ) => {
        if (!value) return acc;
        if (key === "sort" || key === "dir") {
          if (key === "sort") {
            acc.sort = { name: value, dir: searchParams.get("dir") || "asc" };
          }
          return acc;
        }
        acc.filters.push({ key, value });
        return acc;
      },
      { filters: [], sort: null },
    );
  if (activeFilters.filters.length === 0 && !activeFilters.sort) {
    return null;
  }
  const formatActiveSortName = (name: string): string => {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s: string) => s.toUpperCase())
      .replace(/_/g, " ");
  };
  return (
    <div className="py-3 px-4">
      {}
      <div className="flex flex-wrap gap-2">
        {activeFilters.filters.map(({ key, value }) => (
          <div
            key={key}
            className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
          >
            <span className="font-medium mr-1">
              {getFilterDisplayName(key)}:
            </span>
            <span className="text-gray-700">
              {formatFilterValue(key, value)}
            </span>
            <button
              onClick={() => updateSearchParams(key)}
              className="ml-2 text-gray-500 hover:text-gray-800"
              aria-label={`Remove ${key} filter`}
            >
              <X size={18} />
            </button>
          </div>
        ))}
        {activeFilters.sort && (
          <div className="flex items-center bg-blue-100 rounded-full px-5 py-1 text-sm md:text-lg">
            <span className="font-medium mr-1">Sort:</span>
            <span className="text-gray-700">
              {formatActiveSortName(activeFilters.sort.name)}
            </span>
            <button
              onClick={toggleSortDirection}
              className="mx-2 md:mx-3 text-blue-600 hover:text-orange-500"
              aria-label="Toggle sort direction"
            >
              {activeFilters.sort.dir === "asc" ? (
                <ArrowUp size={18} />
              ) : (
                <ArrowDown size={18} />
              )}
            </button>
            <button
              onClick={() => {
                updateSearchParams("sort");
                updateSearchParams("dir");
              }}
              className="ml-1 text-gray-500 hover:text-gray-800"
              aria-label="Remove sort"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {(activeFilters.filters.length > 0 || activeFilters.sort) && (
          <button
            onClick={() => {
              const current = new URLSearchParams();
              router.replace(`${pathname}?${current.toString()}`, {
                scroll: false,
              });
            }}
            className="px-3 text-sm border rounded-full text-blue-600 hover:text-white hover:bg-blue-800 font-medium"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}

export default function AppliedFilters(props: AppliedFiltersProps) {
  return (
    <Suspense fallback={null}>
      <AppliedFiltersContent {...props} />
    </Suspense>
  );
}
