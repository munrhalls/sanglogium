"use client";

import { useQueryState, debounce } from "nuqs";
import { useTransition, useEffect, useSyncExternalStore, useMemo } from "react";
import { displayToCents, centsToDisplay } from "@/lib/utils/price";
import {
  sortParser,
  filtersParser,
  pageParser,
  parseFilterEntry,
  countActiveFilters,
} from "@/lib/catalogue/filterParams";

const PRICE_RANGE_URL_LIMITER = debounce(500);
const STOCK_RANGE_URL_LIMITER = debounce(500);

export interface FilterState {
  field: string;
  value: string;
}

// Module-level shared pending state for cross-component isPending
let pendingState = false;
const subscribers = new Set<() => void>();

function getPendingSnapshot() { return pendingState; }
function subscribeToPending(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}
function setPendingState(value: boolean) {
  if (pendingState !== value) {
    pendingState = value;
    subscribers.forEach(cb => cb());
  }
}

export function useFilterPending() {
  return useSyncExternalStore(subscribeToPending, getPendingSnapshot);
}

/**
 * Hook for managing filter state in URL with nuqs
 * nuqs shallow: false triggers server re-render automatically
 */
export function useFilterNuqs() {
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPendingState(isPending);
  }, [isPending]);

  // Sort state: ?sort=price_data.unit_amount:asc
  const [sort, setSort] = useQueryState(
    "sort",
    sortParser.withOptions({
      shallow: false,
      throttleMs: 50,
      clearOnDefault: true,
    })
  );

  // Page state: ?page=2
  const [, setPage] = useQueryState(
    "page",
    pageParser.withOptions({
      shallow: false,
      throttleMs: 50,
      clearOnDefault: true,
    })
  );

  // Array of active filters: ?f=brand:sennheiser&f=type:open-back
  const [filters, setFilters] = useQueryState(
    "f",
    filtersParser.withOptions({
      // shallow: false triggers a server re-render so the new filters re-query
      shallow: false,
      // Throttle URL updates to prevent browser rate-limiting
      throttleMs: 50,
      // Clear param when empty array (clean URLs)
      clearOnDefault: true,
    })
  );

  /**
   * Toggle a filter on/off
   * Updates URL and triggers server re-render via nuqs shallow: false
   */
  const toggleFilter = (field: string, value: string) => {
    startTransition(() => {
      setPage(null);
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
    });
  };
    /**
   * Remove a specific filter
   */
  const removeFilter = (field: string, value: string) => {
    startTransition(() => {
      setPage(null);
      const filterKey = `${field}:${value}`;
      setFilters((prev) => (prev || []).filter((f) => f !== filterKey));
    });
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    startTransition(() => {
      setPage(null);
      setFilters([]);
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
    .map(parseFilterEntry)
    .filter((f): f is FilterState => f !== null);

  /**
   * Memoized price range from filters (prevents reference instability)
   */
  const priceRange = useMemo((): { min?: number; max?: number } => {
    const priceFilters = parsedFilters.filter(f => f.field === 'priceRange');
    const range: { min?: number; max?: number } = {};

    priceFilters.forEach(filter => {
      if (filter.value.startsWith('min:')) {
        const min = parseInt(filter.value.slice(4), 10);
        if (!isNaN(min)) range.min = centsToDisplay(min);
      } else if (filter.value.startsWith('max:')) {
        const max = parseInt(filter.value.slice(4), 10);
        if (!isNaN(max)) range.max = centsToDisplay(max);
      }
    });

    return range;
  }, [parsedFilters]);

  /**
   * Set price range
   * Convert dollars to cents for URL storage (FilterBuilder expects cents)
   */
  const setPriceRange = (range: { min?: number; max?: number }) => {
    startTransition(() => {
      setPage(null);
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
          const minCents = displayToCents(range.min);
          newFilters.push(`priceRange:min:${minCents}`);
        }
        if (range.max !== undefined) {
          const maxCents = displayToCents(range.max);
          newFilters.push(`priceRange:max:${maxCents}`);
        }

        return newFilters;
      }, { limitUrlUpdates: PRICE_RANGE_URL_LIMITER });
    });
  };

  /**
   * Clear price range
   */
  const clearPriceRange = () => {
    startTransition(() => {
      setPage(null);
      setFilters((prev) => (prev || []).filter(f => !f.startsWith('priceRange:')), { limitUrlUpdates: PRICE_RANGE_URL_LIMITER });
    });
  };

  /**
   * Memoized stock minimum from filters (prevents unnecessary re-renders)
   */
  const stockMinimum = useMemo((): number => {
    const stockFilters = parsedFilters.filter(f => f.field === 'stockMin');

    if (stockFilters.length === 0) return 0;

    const value = parseInt(stockFilters[0].value, 10);
    return isNaN(value) ? 0 : value;
  }, [parsedFilters]);

  /**
   * Set stock minimum
   */
  const setStockMinimum = (value: number) => {
    startTransition(() => {
      setPage(null);
      setFilters((prev) => {
        const current = prev || [];
        const withoutStock = current.filter(f => !f.startsWith('stockMin:'));

        if (value <= 0) {
          // Clear filter if value is 0 or negative
          return withoutStock;
        }

        return [...withoutStock, `stockMin:${value}`];
      }, { limitUrlUpdates: STOCK_RANGE_URL_LIMITER });
    });
  };

  /**
   * Clear stock minimum
   */
  const clearStockMinimum = () => {
    startTransition(() => {
      setPage(null);
      setFilters((prev) => (prev || []).filter(f => !f.startsWith('stockMin:')), { limitUrlUpdates: STOCK_RANGE_URL_LIMITER });
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

  /**
   * Change sort option
   */
  const handleSortChange = (value: string) => {
    startTransition(() => {
      setPage(null);
      setSort(value === "featured" ? null : value);
    });
  };

  return {
    filters,
    setFilters,
    toggleFilter,
    removeFilter,
    clearAllFilters,
    isFilterActive,
    hasActiveFilters: (filters || []).length > 0,
    activeFilterCount: countActiveFilters(filters || []),
    parsedFilters,
    priceRange,
    setPriceRange,
    clearPriceRange,
    isPriceRangeActive,
    stockMinimum,
    setStockMinimum,
    clearStockMinimum,
    isStockMinimumActive,
    sort: sort || "featured",
    handleSortChange,
    isPending,
  };
}
