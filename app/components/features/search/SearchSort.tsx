"use client";

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// `sort` on /search is validated by searchProductsFull, not by the catalogue
// parser (whose vocabulary has no `relevance`). `name-asc` is the legacy value.
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'alpha-asc', label: 'Name: A–Z' },
] as const;

export function SearchSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get('sort') ?? 'relevance';
  const normalized = raw === 'name-asc' ? 'alpha-asc' : raw;
  const current = SORT_OPTIONS.some((o) => o.value === normalized) ? normalized : 'relevance';

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
      <span className="type-caption hidden whitespace-nowrap text-text-caption sm:inline">Sort by</span>
      <div className="relative">
        <select
          value={current}
          onChange={handleChange}
          className="type-body min-h-11 appearance-none rounded-sm border border-border-secondary bg-surface-elevated py-2 pl-3 pr-9 text-text-body transition-colors hover:border-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          aria-label="Sort search results"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
    </label>
  );
}
