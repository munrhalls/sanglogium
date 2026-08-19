"use client";

import React from 'react';
import { useQueryState } from "nuqs";
import { useFilterNuqs } from './useFilterNuqs';
import {
  SORT_OPTIONS,
  SEARCH_SORT_OPTIONS,
  SEARCH_SORT_DEFAULT,
  searchSortParser,
  pageParser,
} from '@/lib/catalogue/filterParams';
import type { SortOption } from '@/lib/catalogue/filterParams';

// Stable, module-level nuqs bindings for the search page (G1).
const searchSortState = searchSortParser.withOptions({
  shallow: false,
  throttleMs: 50,
  clearOnDefault: true,
});
const searchPageState = pageParser.withOptions({
  shallow: false,
  throttleMs: 50,
  clearOnDefault: true,
});

interface SortDropdownProps {
  /** Options to render. Defaults to the category SORT_OPTIONS. */
  options?: readonly SortOption[];
  /**
   * When true, uses the search page's sort contract: SEARCH_SORT_OPTIONS with a
   * "relevance" default and no score prefix on explicit sorts (G1).
   */
  searchMode?: boolean;
}

function SortSelect({
  options,
  value,
  onChange,
}: {
  options: readonly SortOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div data-testid="sort-dropdown" className="flex items-center gap-2">
      <label htmlFor="sort" className="type-caption text-secondary-500">Sort by</label>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-select"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CategorySortDropdown({ options }: { options: readonly SortOption[] }) {
  const { sort, handleSortChange } = useFilterNuqs();
  return <SortSelect options={options} value={sort} onChange={handleSortChange} />;
}

function SearchSortDropdown() {
  const [sort, setSort] = useQueryState("sort", searchSortState);
  const [, setPage] = useQueryState("page", searchPageState);

  const handleSortChange = (value: string) => {
    // Sorting restarts from page 1 (clean results) and re-runs the RSC query.
    setPage(null);
    setSort(value === SEARCH_SORT_DEFAULT ? null : value);
  };

  // Degrade gracefully for crafted ?sort= values outside the search allowlist
  // (server already falls back to the relevance default).
  const currentSort = SEARCH_SORT_OPTIONS.some((o) => o.value === sort)
    ? sort
    : SEARCH_SORT_DEFAULT;

  return (
    <SortSelect
      options={SEARCH_SORT_OPTIONS}
      value={currentSort ?? SEARCH_SORT_DEFAULT}
      onChange={handleSortChange}
    />
  );
}

export function SortDropdown({ options = SORT_OPTIONS, searchMode = false }: SortDropdownProps) {
  return searchMode ? <SearchSortDropdown /> : <CategorySortDropdown options={options} />;
}
