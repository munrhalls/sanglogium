'use client';

import React from 'react';
import { SortDropdown } from './SortDropdown';
import type { Category } from './facetRegistry';
import { MobileFilterSheet, type MobileFilterSheetProps } from './MobileFilterSheet';

/**
 * `mobileFilterProps` is optional so existing non-catalogue callers of
 * SortBar (if any) keep compiling unchanged; the two products pages that
 * render a FilterSidebar always pass it, which is what puts the mobile
 * filter trigger next to the product count below the lg-touch/lg-desktop
 * breakpoint pair -- the same row FilterSidebar's desktop <aside> would
 * otherwise leave with no way to reach filters at all.
 */
export function SortBar({
  totalCount,
  category,
  mobileFilterProps,
}: {
  totalCount: number;
  category?: Category;
  mobileFilterProps?: Omit<MobileFilterSheetProps, 'totalCount' | 'category'>;
}) {
  return (
    <div data-testid="poc-sort-bar" className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {mobileFilterProps && (
          <MobileFilterSheet {...mobileFilterProps} category={category} totalCount={totalCount} />
        )}
        <span className="type-caption text-text-caption" aria-live="polite">
          {totalCount} {totalCount === 1 ? 'product' : 'products'}
        </span>
      </div>
      <SortDropdown category={category} />
    </div>
  );
}
