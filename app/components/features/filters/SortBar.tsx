'use client';

import React from 'react';
import { SortDropdown } from './SortDropdown';
import type { Category } from './facetRegistry';

/** POC-local mirror of app/components/features/filters/SortBar.tsx. */
export function SortBar({ totalCount, category }: { totalCount: number; category?: Category }) {
  return (
    <div data-testid="poc-sort-bar" className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <span className="type-caption text-text-caption" aria-live="polite">
        {totalCount} {totalCount === 1 ? 'product' : 'products'}
      </span>
      <SortDropdown category={category} />
    </div>
  );
}
