'use client';

import React from 'react';
import { getFacetModule, type Category } from './facetRegistry';

/**
 * POC-local mirror of app/components/features/filters/SortDropdown.tsx.
 * URL <-> its own display only — never touches the product grid, data, counts
 * or streaming.
 *
 * Category-aware since sang-logium-3rv.6 (SORT_OPTIONS/parser shape happen to
 * be identical across all three categories today, so this was never a
 * functional bug -- but the hardcoded headphones import was inconsistent
 * with every other control now going through facetRegistry.ts).
 */
export function SortDropdown({ category = 'headphones' }: { category?: Category }) {
  const { SORT_OPTIONS, useFilterParam } = getFacetModule(category);
  const [sort, setSort] = useFilterParam('sort');

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="poc-sort" className="type-caption text-text-caption whitespace-nowrap">
        Sort by
      </label>
      <div className="relative">
        <select
          id="poc-sort"
          name="sort"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="type-body rounded-sm appearance-none border border-border-secondary bg-surface-elevated py-2 pl-3 pr-9 text-text-body transition-colors hover:border-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-text-accent"
        >
          <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
