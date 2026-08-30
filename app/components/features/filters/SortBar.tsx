"use client";

import React from 'react';
import { SortDropdown } from './SortDropdown';
import { useFilterSortPending } from '@/app/hooks/nuqs/useFilterSort';

/**
 * The bar above the product grid: result count on the left, sort control on
 * the right. The count is the real total already fetched by the page — it is
 * displayed only, nothing here filters or sorts.
 *
 * The count row is shared by every breakpoint (its span is not hidden below
 * lg), so the '(Loading...)' pending cue appended here covers both the desktop
 * count row and the mobile count (G8).
 */
export function SortBar({ totalCount }: { totalCount: number }) {
  const isPending = useFilterSortPending();

  return (
    <div
      data-testid="sort-bar"
      className="mb-6 flex flex-wrap items-center justify-between gap-4"
    >
      <span className="type-caption text-text-caption" aria-live="polite">
        {totalCount} {totalCount === 1 ? 'product' : 'products'}
        {isPending && ' (Loading...)'}
      </span>
      {/* Sort lives in the mobile controls row below lg; here only on desktop. */}
      <div className="hidden lg-touch:block lg-desktop:block">
        <SortDropdown />
      </div>
    </div>
  );
}
