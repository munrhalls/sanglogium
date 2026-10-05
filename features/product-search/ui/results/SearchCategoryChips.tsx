'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/platform/utils/tailwind';

interface SearchCategoryChipsProps {
  counts: { id: string; label: string; count: number }[];
  active?: string;
  allCount: number;
}

/**
 * "Refine by category" row on /search: single-select links that set `cat`,
 * keep every other param (q, filters, sort) and reset the page.
 */
export function SearchCategoryChips({ counts, active, allCount }: SearchCategoryChipsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const visible = counts.filter((c) => c.count > 0 || c.id === active);
  if (visible.length < 2 && !active) return null;

  const hrefFor = (id?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set('cat', id);
    else params.delete('cat');
    params.delete('page');
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const chip = 'inline-flex min-h-11 items-center rounded-full border px-4 type-caption transition-colors';
  const on = 'border-accent-500 bg-surface-card text-text-primary';
  const off = 'border-border-secondary text-text-body hover:border-accent-500 hover:text-text-primary';

  return (
    <nav aria-label="Refine by category" className="mb-4 flex flex-wrap gap-2">
      <Link href={hrefFor()} aria-current={!active ? 'true' : undefined} className={cn(chip, !active ? on : off)}>
        All ({allCount})
      </Link>
      {visible.map((c) => (
        <Link
          key={c.id}
          href={hrefFor(c.id)}
          aria-current={active === c.id ? 'true' : undefined}
          className={cn(chip, active === c.id ? on : off)}
        >
          {c.label} ({c.count})
        </Link>
      ))}
    </nav>
  );
}
