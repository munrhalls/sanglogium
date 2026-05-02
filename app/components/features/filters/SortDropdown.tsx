"use client";

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export function SortDropdown() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSort = searchParams.get('sort') || 'featured';

  // Build current query string excluding sort param
  const otherParams = new URLSearchParams(searchParams.toString());
  otherParams.delete('sort');
  const otherParamsString = otherParams.toString();

  const handleSortChange = (value: string) => {
    // Build new URL with updated sort parameter
    const params = new URLSearchParams(otherParamsString);
    if (value !== 'featured') {
      params.set('sort', value);
    }
    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;

    // Client-side navigation for instant feedback (no full page reload)
    router.push(newUrl, { scroll: false });
  };

  return (
    <div data-testid="sort-dropdown" className="flex items-center gap-2">
      <label htmlFor="sort" className="type-caption text-secondary-500">Sort by</label>
      <select
        id="sort"
        value={currentSort}
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
