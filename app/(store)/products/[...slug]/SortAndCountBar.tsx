import React from 'react';
import { SortDropdown } from '@/app/components/features/filters/SortDropdown';

/**
 * Desktop sort & count bar: product count on the left, sort dropdown on the
 * right. Owns only its own row layout — the select styling belongs to
 * SortDropdown.
 *
 * Tracer bullet 4: hardcoded count, no state, no URL access.
 */

const PRODUCT_COUNT = 27;

export function SortAndCountBar() {
  return (
    <div
      data-testid="sort-and-count-bar"
      className="flex flex-wrap items-center justify-between gap-4 pb-6"
    >
      <span className="type-caption text-text-caption">
        {PRODUCT_COUNT} {PRODUCT_COUNT === 1 ? 'product' : 'products'}
      </span>
      <SortDropdown />
    </div>
  );
}
