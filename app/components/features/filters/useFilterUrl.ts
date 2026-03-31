"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export interface FilterState {
  field: string;
  value: string;
}

export function useFilterUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("s") || "featured";

  const currentFilters: FilterState[] = searchParams
    .getAll("f")
    .map((f) => {
      const [field, value] = f.split(":");
      return { field, value };
    });

  const setSort = useCallback(
    (sort: string) => {
      const params = new URLSearchParams(searchParams);
      if (sort === "featured") {
        params.delete("s");
      } else {
        params.set("s", sort);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const toggleFilter = useCallback(
    (field: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      const filterKey = `${field}:${value}`;
      const existing = params.getAll("f");

      if (existing.includes(filterKey)) {
        // Remove filter
        const filtered = existing.filter((f) => f !== filterKey);
        params.delete("f");
        filtered.forEach((f) => params.append("f", f));
      } else {
        // Add filter
        params.append("f", filterKey);
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const removeFilter = useCallback(
    (field: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      const filterKey = `${field}:${value}`;
      const existing = params.getAll("f");
      const filtered = existing.filter((f) => f !== filterKey);

      params.delete("f");
      filtered.forEach((f) => params.append("f", f));

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("f");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const isFilterActive = useCallback(
    (field: string, value: string) => {
      return currentFilters.some(
        (f) => f.field === field && f.value === value
      );
    },
    [currentFilters]
  );

  return {
    currentSort,
    currentFilters,
    setSort,
    toggleFilter,
    removeFilter,
    clearAllFilters,
    isFilterActive,
  };
}
