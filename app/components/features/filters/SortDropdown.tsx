"use client";

import React from 'react';
import { useFilterNuqs } from './useFilterNuqs';

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
        <option value="featured">Featured</option>
        <option value="price_data.unit_amount:asc">Price: Low to High</option>
        <option value="price_data.unit_amount:desc">Price: High to Low</option>
        <option value="name:asc">Name: A-Z</option>
        <option value="name:desc">Name: Z-A</option>
      </select>
    </div>
  );
}
