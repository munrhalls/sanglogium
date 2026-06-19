"use client";

import React from 'react';
import { useFilterNuqs } from '@/app/components/features/filters/useFilterNuqs';

export function EmptyResults() {
  const { clearAllFilters, hasActiveFilters } = useFilterNuqs();
  return (
    <div data-testid="empty-results" className="py-16 text-center space-y-4">
      <p className="type-body text-secondary">
        No products match your current filters.
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          data-testid="reset-filters"
          className="btn-secondary"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
