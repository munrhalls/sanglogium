"use client";

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { buildFilterUrl } from '@/lib/filters/urlParams';

interface FilterGroup {
  field: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface ActiveFiltersProps {
  filterGroups: FilterGroup[];
}

export function ActiveFilters({ filterGroups }: ActiveFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get active filters from URL
  const activeFilters = searchParams.getAll('f');

  if (activeFilters.length === 0) {
    return null;
  }

  // Build label map from filter groups
  const labelMap = new Map<string, string>();
  filterGroups.forEach((group) => {
    group.options.forEach((opt) => {
      labelMap.set(`${group.field}:${opt.value}`, `${group.label}: ${opt.label}`);
    });
  });

  const handleRemoveFilter = (filterKey: string) => {
    const newUrl = buildFilterUrl(
      pathname,
      new URLSearchParams(searchParams.toString()),
      { removeFilter: filterKey }
    );
    router.push(newUrl, { scroll: false });
  };

  const handleClearAll = () => {
    const newUrl = buildFilterUrl(
      pathname,
      new URLSearchParams(searchParams.toString()),
      { clearFilters: true }
    );
    router.push(newUrl, { scroll: false });
  };

  return (
    <div data-testid="active-filters" className="flex flex-wrap gap-2 mb-6">
      {activeFilters.map((filterKey) => (
        <button
          key={filterKey}
          type="button"
          onClick={() => handleRemoveFilter(filterKey)}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-elevated border border-brand-400 rounded-sm type-caption text-primary hover:border-brand-200 transition-colors cursor-pointer"
        >
          <span>{labelMap.get(filterKey) || filterKey}</span>
          <span aria-label={`Remove filter`} className="text-caption hover:text-primary transition-colors">×</span>
        </button>
      ))}

      <button
        type="button"
        onClick={handleClearAll}
        className="type-caption text-accent-500 underline hover:text-brand-100 transition-colors cursor-pointer"
      >
        Clear all
      </button>
    </div>
  );
}
