"use client";

import React from 'react';
import { useFilterNuqs } from './useFilterNuqs';
import { SORT_OPTIONS } from '@/lib/catalogue/filterParams';

export function SortDropdown() {
  const { sort, handleSortChange } = useFilterNuqs();

  return (
    <div data-testid="sort-dropdown" className="flex items-center gap-2">
      <label htmlFor="sort" className="type-caption text-secondary-500">Sort by</label>
      <select
        id="sort"
        value={sort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="input-select"
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
