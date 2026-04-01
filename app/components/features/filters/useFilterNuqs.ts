"use client";

import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs";

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
 * Uses shallow routing for instant UI updates (no server roundtrip)
 */
export function useFilterNuqs() {
  // Array of active filters: ?f=brand:sennheiser&f=type:open-back
  const [filters, setFilters] = useQueryState(
    "f",
    parseAsArrayOf(parseAsString)
      .withOptions({
        // Shallow: true = client-only URL update, NO server re-render
        // This eliminates the lag from router.push()
        shallow: true,
        // Throttle URL updates to prevent browser rate-limiting
        throttleMs: 50,
        // Clear param when empty array (clean URLs)
        clearOnDefault: true,
      })
      .withDefault([])
  );

  /**
   * Toggle a filter on/off
   * Instant UI feedback, URL updates in background
   */
  const toggleFilter = (field: string, value: string) => {
    const filterKey = `${field}:${value}`;

    setFilters((prev) => {
      const current = prev || [];
      const exists = current.includes(filterKey);

      if (exists) {
        // Remove filter
        return current.filter((f) => f !== filterKey);
      } else {
        // Add filter
        return [...current, filterKey];
      }
    });
  };

  /**
   * Remove a specific filter
   */
  const removeFilter = (field: string, value: string) => {
    const filterKey = `${field}:${value}`;
    setFilters((prev) => (prev || []).filter((f) => f !== filterKey));
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    setFilters([]);
  };

  /**
   * Check if a specific filter is active
   */
  const isFilterActive = (field: string, value: string): boolean => {
    const filterKey = `${field}:${value}`;
    return filters.includes(filterKey);
  };

  /**
 * Get parsed filter states for client-side filtering
 */
  const parsedFilters: FilterState[] = filters
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
  };

  /**
   * Clear price range
   */
  const clearPriceRange = () => {
    setFilters((prev) => (prev || []).filter(f => !f.startsWith('priceRange:')));
  };

  /**
   * Check if price range is active
   */
  const isPriceRangeActive = (): boolean => {
    return parsedFilters.some(f => f.field === 'priceRange');
  };

  return {
    filters,
    parsedFilters,
    toggleFilter,
    removeFilter,
    clearAllFilters,
    isFilterActive,
    hasActiveFilters: filters.length > 0,
    getPriceRange,
    setPriceRange,
    clearPriceRange,
    isPriceRangeActive,
  };
}
