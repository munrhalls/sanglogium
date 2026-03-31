"use client";

import React from 'react';
import { useFilterUrl } from './useFilterUrl';

interface SortDropdownProps {
  currentSort?: string;
}

export function SortDropdown({ currentSort = 'featured' }: SortDropdownProps) {
  return (
    <div data-testid="sort-dropdown" className="flex items-center gap-2">
      <label htmlFor="sort" className="type-caption text-secondary-500">Sort by</label>
      <select
        id="sort"
        defaultValue={currentSort}
        className="input-select"
      >
        <option value="featured">Featured</option>
        <option value="displayPrice:asc">Price: Low to High</option>
        <option value="displayPrice:desc">Price: High to Low</option>
        <option value="name:asc">Name: A-Z</option>
        <option value="name:desc">Name: Z-A</option>
      </select>
    </div>
  );
}
