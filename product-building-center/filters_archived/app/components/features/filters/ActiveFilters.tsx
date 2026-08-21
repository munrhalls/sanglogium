"use client";

import React from 'react';
import { useFilterNuqs } from './useFilterNuqs';
import { centsToDisplay } from '@/lib/utils/price';

interface FilterGroup {
  field: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface ActiveFiltersProps {
  filterGroups?: FilterGroup[];
}

export function ActiveFilters({ filterGroups }: ActiveFiltersProps) {
  const { filters, parsedFilters, removeFilter, clearAllFilters, hasActiveFilters } = useFilterNuqs();

  if (!hasActiveFilters || !filterGroups) {
    return null;
  }

  // Build label map from filter groups for display
  const labelMap = new Map<string, string>();
  filterGroups.forEach((group) => {
    group.options.forEach((opt) => {
      labelMap.set(`${group.field}:${opt.value}`, `${group.label}: ${opt.label}`);
    });
  });

  // Format filter for display
  const formatFilterLabel = (filter: { field: string; value: string }): string => {
    const filterKey = `${filter.field}:${filter.value}`;

    // Check if it's in the label map first
    if (labelMap.has(filterKey)) {
      return labelMap.get(filterKey)!;
    }

    // URL stores values in cents, convert to dollars for display
    if (filter.field === 'priceRange') {
      if (filter.value.startsWith('min:')) {
        const minCents = parseInt(filter.value.replace('min:', ''), 10);
        const minDollars = centsToDisplay(minCents);
        return `Price above: $${minDollars}`;
      }
      if (filter.value.startsWith('max:')) {
        const maxCents = parseInt(filter.value.replace('max:', ''), 10);
        const maxDollars = centsToDisplay(maxCents);
        return `Price up to: $${maxDollars}`;
      }
    }

    // Handle stockMin filters
    if (filter.field === 'stockMin') {
      return `Min stock: ${filter.value}`;
    }

    // Fallback to raw filter key
    return filterKey;
  };

  return (
    <div data-testid="active-filters" className="flex flex-wrap gap-2 mb-6">
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

      <button
        type="button"
        onClick={clearAllFilters}
        className="type-caption text-accent-500 underline hover:text-brand-100 transition-colors cursor-pointer"
      >
        Clear all
      </button>
    </div>
  );
}
