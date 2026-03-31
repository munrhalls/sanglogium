"use client";

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { buildFilterUrl } from '@/lib/filters/urlParams';

export function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'featured';

  const handleSortChange = (value: string) => {
    const newUrl = buildFilterUrl(
      pathname,
      new URLSearchParams(searchParams.toString()),
      { sort: value === 'featured' ? null : value }
    );
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
        <option value="displayPrice:asc">Price: Low to High</option>
        <option value="displayPrice:desc">Price: High to Low</option>
        <option value="name:asc">Name: A-Z</option>
        <option value="name:desc">Name: Z-A</option>
      </select>
    </div>
  );
}
