import React from 'react';
import { SortDropdown } from '@/app/components/features/filters/SortDropdown';

/**
 * Tracer bullet 4: desktop sort & count row.
 *
 * Sits between the page header and the product grid: result count on the left,
 * sort dropdown on the right. Count is hardcoded — this component never reads
 * the product query, and nothing here imports product-grid code.
 *
 * Hidden below 1024px, matching FilterSidebar. The mobile controls bar is a
 * separate component and a separate bullet.
 */
export function SortAndCountBar() {
  return (
    <div
      data-testid="sort-and-count-bar"
      className="hidden lg-desktop:flex lg-touch:flex items-center justify-between gap-4 border-b border-border-secondary pb-4 mb-6"
    >
      <span className="type-caption text-text-caption">187 products</span>
      <SortDropdown />
    </div>
  );
}
