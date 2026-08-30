"use client";

import React, { useState } from 'react';

/**
 * Sort dropdown — a small caption label next to a native <select> styled as a
 * bordered input control (native chevron removed, gold chevron drawn instead).
 * The same component is reused by the desktop sort bar and (later) the mobile
 * controls bar, so all sort styling lives here only.
 *
 * Static surface only: local state is cosmetic, nothing is read from or
 * written to the URL and no products are sorted.
 */

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'name-asc', label: 'Name: A-Z' },
];

export function SortDropdown() {
  const [sort, setSort] = useState('featured');

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
