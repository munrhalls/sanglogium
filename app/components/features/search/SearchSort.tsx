"use client";

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name A–Z' },
] as const;

export function SearchSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = searchParams.get('sort') ?? 'relevance';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === 'relevance') {
      params.delete('sort');
    } else {
      params.set('sort', e.target.value);
    }
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <label className="flex items-center gap-2">
      <span className="type-caption text-secondary">Sort</span>
      <select
        value={current}
        onChange={handleChange}
        className="h-11 min-h-[44px] px-2 bg-secondary-300 type-caption text-primary rounded-md"
        aria-label="Sort search results"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
