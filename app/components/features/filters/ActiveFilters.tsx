"use client";

import React from 'react';
import { useFilterNuqs } from './useFilterNuqs';

interface FilterGroup {
  field: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface ActiveFiltersProps {
  filterGroups: FilterGroup[];
}

export function ActiveFilters({ filterGroups }: ActiveFiltersProps) {
  const { filters, parsedFilters, removeFilter, clearAllFilters, hasActiveFilters } = useFilterNuqs();

  if (!hasActiveFilters) {
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

    // Handle priceRange filters
    if (filter.field === 'priceRange') {
      if (filter.value.startsWith('min:')) {
        const min = filter.value.slice(4);
        return `Price above: $${min}`;
      }
      if (filter.value.startsWith('max:')) {
        const max = filter.value.slice(4);
        return `Price up to: $${max}`;
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
      {parsedFilters.map((filter) => {
        const filterKey = `${filter.field}:${filter.value}`;
        return (
          <button
            key={filterKey}
            type="button"
            onClick={() => removeFilter(filter.field, filter.value)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-elevated border border-brand-400 rounded-lg type-caption text-primary hover:border-brand-200 transition-colors cursor-pointer"
          >
            <span>{formatFilterLabel(filter)}</span>
            <span aria-label={`Remove filter`} className="text-caption hover:text-primary transition-colors">×</span>
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
