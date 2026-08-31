"use client";

import React from 'react';
import { useClearAllFilters } from '@/app/hooks/nuqs/useFilterSort';

interface EmptyResultsProps {
  /**
   * True when the zero-result view is the product of an active filter/sort
   * combination (not a genuinely empty category). When set, the empty state
   * offers a "Clear filters" affordance that drops every F1 contract param and
   * returns the visitor to the full grid.
   */
  filtersActive?: boolean;
}

export function EmptyResults({ filtersActive = false }: EmptyResultsProps) {
  const clearAll = useClearAllFilters();

  return (
    <div data-testid="empty-results" className="py-16 text-center space-y-4">
      <p className="type-body text-secondary">
        {filtersActive
          ? 'No products match the selected filters.'
          : 'No products found.'}
      </p>

      {filtersActive && (
        <button
          type="button"
          onClick={clearAll}
          className="type-caption rounded-full border border-border-secondary px-4 py-1.5 text-text-body underline-offset-2 transition-colors hover:text-text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
