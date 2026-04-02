"use client";

import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs";
import { useRouter, usePathname } from "next/navigation";
import { startTransition } from "react";

export interface FilterState {
  field: string;
  value: string;
}

/**
 * Parse filter string "field:value" into FilterState
 */
function parseFilter(filterString: string): FilterState | null {
  const separatorIndex = filterString.indexOf(":");
  if (separatorIndex === -1) return null;

  const field = filterString.slice(0, separatorIndex);
  const value = filterString.slice(separatorIndex + 1);

  if (!field || !value) return null;

  return { field, value };
}

/**
 * Hook for managing filter state in URL with nuqs
 * Uses router.refresh() to trigger server re-render with new filters
 */
export function useFilterNuqs() {
  const router = useRouter();
  const pathname = usePathname();

  // Array of active filters: ?f=brand:sennheiser&f=type:open-back
  const [filters, setFilters] = useQueryState(
    "f",
    parseAsArrayOf(parseAsString)
      .withOptions({
        // Deep: true = triggers server re-render (default)
        // This allows server to re-fetch with new filters
        shallow: false,
        // Throttle URL updates to prevent browser rate-limiting
        throttleMs: 50,
        // Clear param when empty array (clean URLs)
        clearOnDefault: true,
      })
      .withDefault([])
  );

  /**
   * Toggle a filter on/off
   * Updates URL and triggers server re-render
   */
  const toggleFilter = (field: string, value: string) => {
    startTransition(() => {
      setFilters((currentFilters) => {
        const current = currentFilters || [];
        const filterString = `${field}:${value}`;
        const filterIndex = current.indexOf(filterString);

        if (filterIndex === -1) {
          // Add filter
          return [...currentFilters, filterString];
        } else {
          // Remove filter
          return currentFilters.filter((_, index) => index !== filterIndex);
        }
      });

      // Trigger server re-render to fetch filtered products
      router.refresh();
    });
  };
    /**
   * Remove a specific filter
   */
  const removeFilter = (field: string, value: string) => {
    startTransition(() => {
      const filterKey = `${field}:${value}`;
      setFilters((prev) => (prev || []).filter((f) => f !== filterKey));
      router.refresh();
    });
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    startTransition(() => {
      setFilters([]);
      router.refresh();
    });
  };

  /**
   * Check if a specific filter is active
   */
  const isFilterActive = (field: string, value: string): boolean => {
    const filterKey = `${field}:${value}`;
    return (filters || []).includes(filterKey);
  };

  /**
 * Get parsed filter states for client-side filtering
 */
  const parsedFilters: FilterState[] = (filters || [])
    .map(parseFilter)
    .filter((f): f is FilterState => f !== null);

  /**
   * Get price range from filters
   */
  const getPriceRange = (): { min?: number; max?: number } => {
    const priceFilters = parsedFilters.filter(f => f.field === 'priceRange');
    const range: { min?: number; max?: number } = {};

    priceFilters.forEach(filter => {
      if (filter.value.startsWith('min:')) {
        const min = parseInt(filter.value.slice(4), 10);
        if (!isNaN(min)) range.min = min;
      } else if (filter.value.startsWith('max:')) {
        const max = parseInt(filter.value.slice(4), 10);
        if (!isNaN(max)) range.max = max;
      }
    });

    return range;
  };

  /**
   * Set price range
   */
  const setPriceRange = (range: { min?: number; max?: number }) => {
    startTransition(() => {
      setFilters((prev) => {
        const current = prev || [];
        const withoutPrice = current.filter(f => !f.startsWith('priceRange:'));
        const newFilters = [...withoutPrice];

        // Validate that min < max
        if (range.min !== undefined && range.max !== undefined && range.min >= range.max) {
          // Don't set invalid range
          return current;
        }

        if (range.min !== undefined) {
          newFilters.push(`priceRange:min:${range.min}`);
        }
        if (range.max !== undefined) {
          newFilters.push(`priceRange:max:${range.max}`);
        }

        return newFilters;
      });
      router.refresh();
    });
  };

  /**
   * Clear price range
   */
  const clearPriceRange = () => {
    startTransition(() => {
      setFilters((prev) => (prev || []).filter(f => !f.startsWith('priceRange:')));
      router.refresh();
    });
  };

  /**
   * Get stock minimum from filters
   */
  const getStockMinimum = (): number => {
    const stockFilters = parsedFilters.filter(f => f.field === 'stockMin');

    if (stockFilters.length === 0) return 0;

    const value = parseInt(stockFilters[0].value, 10);
    return isNaN(value) ? 0 : value;
  };

  /**
   * Set stock minimum
   */
  const setStockMinimum = (value: number) => {
    startTransition(() => {
      setFilters((prev) => {
        const current = prev || [];
        const withoutStock = current.filter(f => !f.startsWith('stockMin:'));

        if (value <= 0) {
          // Clear filter if value is 0 or negative
          return withoutStock;
        }

        return [...withoutStock, `stockMin:${value}`];
      });
      router.refresh();
    });
  };

  /**
   * Clear stock minimum
   */
  const clearStockMinimum = () => {
    startTransition(() => {
      setFilters((prev) => (prev || []).filter(f => !f.startsWith('stockMin:')));
      router.refresh();
    });
  };

  /**
   * Check if price range is active
   */
  const isPriceRangeActive = (): boolean => {
    return parsedFilters.some(f => f.field === 'priceRange');
  };

  /**
   * Check if stock minimum is active
   */
  const isStockMinimumActive = (): boolean => {
    return parsedFilters.some(f => f.field === 'stockMin');
  };

  return {
    filters,
    setFilters,
    toggleFilter,
    removeFilter,
    clearAllFilters,
    isFilterActive,
    hasActiveFilters: (filters || []).length > 0,
    getPriceRange,
    setPriceRange,
    clearPriceRange,
    isPriceRangeActive,
    getStockMinimum,
    setStockMinimum,
    clearStockMinimum,
    isStockMinimumActive,
  };
}
