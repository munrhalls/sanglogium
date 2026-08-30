"use client";

import React from 'react';
import { SORT_OPTIONS } from '@/lib/catalogue/filterSortParams';
import { useFilterParam } from '@/app/hooks/nuqs/useFilterSort';

/**
 * Sort dropdown — a small caption label next to a native <select> styled as a
 * bordered input control (native chevron removed, gold chevron drawn instead).
 * The same component is reused by the desktop sort bar and the mobile controls
 * bar, so all sort styling lives here only.
 *
 * F2: this control's ONLY job is URL <-> its own display. It reads/writes the
 * `sort` param through F1's shared contract (option list + parser + history/
 * shallow options all come from F1 — never hardcoded here) and does not touch
 * the product grid, product data, result counts or streaming. Junk `?sort=`
 * values fall back to the default via F1's parser and are never written back;
 * picking the default ("Featured") clears the param from the URL.
 */

export function SortDropdown() {
  const [sort, setSort] = useFilterParam('sort');

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="type-caption text-text-caption whitespace-nowrap">
        Sort by
      </label>
      <div className="relative">
        <select
          id="sort"
          name="sort"
          value={sort}
          onChange={(event) => setSort(event.target.value as typeof sort)}
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
