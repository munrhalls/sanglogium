"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { SortDropdown } from './SortDropdown';

interface MobileControlsBarProps {
  productCount: number;
  onOpenFilters: () => void;
  currentSort?: string;
}

export function MobileControlsBar({
  productCount,
  onOpenFilters,
  currentSort = 'featured'
}: MobileControlsBarProps) {
  const searchParams = useSearchParams();
  const activeFilterCount = searchParams.getAll('f').length;

  return (
    <div
      data-testid="mobile-controls-bar"
      className="flex items-center gap-3 lg:hidden mb-4 px-4"
    >
      {/* Filters button */}
      <button
        type="button"
        onClick={onOpenFilters}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 btn-secondary"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="21" x2="4" y2="14"></line>
          <line x1="4" y1="10" x2="4" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12" y2="3"></line>
          <line x1="20" y1="21" x2="20" y2="16"></line>
          <line x1="20" y1="12" x2="20" y2="3"></line>
          <line x1="1" y1="14" x2="7" y2="14"></line>
          <line x1="9" y1="8" x2="15" y2="8"></line>
          <line x1="17" y1="16" x2="23" y2="16"></line>
        </svg>
        <span className="type-caption">
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </span>
      </button>

      {/* Sort dropdown */}
      <div className="flex-1">
        <SortDropdown currentSort={currentSort} />
      </div>
    </div>
  );
}

