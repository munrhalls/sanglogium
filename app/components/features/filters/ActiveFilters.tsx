"use client";

import React from 'react';
import { useFilterUrl } from './useFilterUrl';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  field: string;
  label: string;
  options: FilterOption[];
}

interface ActiveFiltersProps {
  filterGroups: FilterGroup[];
}

export function ActiveFilters({ filterGroups }: ActiveFiltersProps) {
  const { currentFilters, removeFilter, clearAllFilters } = useFilterUrl();

  if (currentFilters.length === 0) {
    return null;
  }

  // Build label map from filter groups
  const labelMap = new Map<string, string>();
  filterGroups.forEach((group) => {
    group.options.forEach((opt) => {
      labelMap.set(`${group.field}:${opt.value}`, `${group.label}: ${opt.label}`);
    });
  });

  return (
    <div data-testid="active-filters" className="flex flex-wrap gap-2 mb-6">
      {currentFilters.map((filter) => (
        <button
          key={`${filter.field}:${filter.value}`}
          type="button"
          onClick={() => removeFilter(filter.field, filter.value)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-elevated border border-secondary-700 text-body text-brand-200 hover:border-brand-400 hover:text-brand-100 transition-colors cursor-pointer"
        >
          <span>{labelMap.get(`${filter.field}:${filter.value}`) || `${filter.field}: ${filter.value}`}</span>
          <span aria-label={`Remove filter`} className="text-secondary-400 hover:text-brand-400">X</span>
        </button>
      ))}

      <button
        type="button"
        onClick={clearAllFilters}
        className="text-body text-secondary-400 hover:text-brand-400 underline cursor-pointer transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
