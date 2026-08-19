"use client";

import React from 'react';
import { useFilterNuqs } from '@/app/components/features/filters/useFilterNuqs';
import { centsToDisplay } from '@/lib/utils/price';

export function EmptyResults() {
  const { parsedFilters, removeFilter, clearAllFilters, hasActiveFilters } = useFilterNuqs();

  // Chip label formatting mirrors ActiveFilters.tsx. The empty state has no
  // filter-group label map, so facet chips use the fallback copy for price /
  // stock filters and the raw key for the rest.
  const formatFilterLabel = (filter: { field: string; value: string }): string => {
    if (filter.field === 'priceRange') {
      if (filter.value.startsWith('min:')) {
        const minCents = parseInt(filter.value.replace('min:', ''), 10);
        return `Price above: $${centsToDisplay(minCents)}`;
      }
      if (filter.value.startsWith('max:')) {
        const maxCents = parseInt(filter.value.replace('max:', ''), 10);
        return `Price up to: $${centsToDisplay(maxCents)}`;
      }
    }
    if (filter.field === 'stockMin') {
      return `Min stock: ${filter.value}`;
    }
    return `${filter.field}:${filter.value}`;
  };

  return (
    <div data-testid="empty-results" className="py-16 text-center space-y-4">
      <p className="type-body text-secondary">
        No products match your current filters.
      </p>

      {hasActiveFilters && (
        <>
          {/* Removable active-facet chips (reuse ActiveFilters chip pattern, G11) */}
          <div className="flex flex-wrap justify-center gap-2">
            {parsedFilters?.map((filter) => {
              if (!filter || !filter.field || !filter.value) return null;
              const filterKey = `${filter.field}:${filter.value}`;
              return (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => removeFilter(filter.field, filter.value)}
                  aria-label={`Remove filter: ${formatFilterLabel(filter)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-elevated border border-brand-400 rounded-lg type-caption text-primary hover:border-brand-200 transition-colors cursor-pointer"
                >
                  <span aria-hidden="true">{formatFilterLabel(filter)}</span>
                  <span aria-hidden="true" className="text-caption hover:text-primary transition-colors">×</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={clearAllFilters}
            data-testid="reset-filters"
            className="btn-secondary"
          >
            Clear all filters
          </button>
        </>
      )}
    </div>
  );
}
