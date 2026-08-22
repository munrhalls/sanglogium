import React from 'react';

/**
 * Sort dropdown — a small caption label next to a native <select> styled as a
 * bordered input control. The same component is reused by the desktop sort bar
 * and (later) the mobile controls bar, so all sort styling lives here only.
 *
 * Tracer bullet 4: hardcoded selected value, no state, no URL access.
 */

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
];

const SELECTED_SORT = 'relevance';

export function SortDropdown() {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="type-caption text-text-caption whitespace-nowrap">
        Sort by
      </label>
      <select
        id="sort"
        name="sort"
        defaultValue={SELECTED_SORT}
        className="type-body rounded-sm border border-border-secondary bg-surface-elevated px-3 py-2 text-text-body transition-colors hover:border-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
