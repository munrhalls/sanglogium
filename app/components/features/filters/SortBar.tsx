import React from 'react';
import { SortDropdown } from './SortDropdown';

/**
 * The bar above the product grid: result count on the left, sort control on
 * the right. The count is the real total already fetched by the page — it is
 * displayed only, nothing here filters or sorts.
 */
export function SortBar({ totalCount }: { totalCount: number }) {
  return (
    <div
      data-testid="sort-bar"
      className="mb-6 flex flex-wrap items-center justify-between gap-4"
    >
      <span className="type-caption text-text-caption">
        {totalCount} {totalCount === 1 ? 'product' : 'products'}
      </span>
      {/* Sort lives in the mobile controls row below lg; here only on desktop. */}
      <div className="hidden lg-touch:block lg-desktop:block">
        <SortDropdown />
      </div>
    </div>
  );
}
