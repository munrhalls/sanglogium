"use client";

import React, { useEffect, useRef } from 'react';
import { SortDropdown } from '@/app/components/features/filters/SortDropdown';
import { MobileControlsBar } from '@/app/components/features/filters/MobileControlsBar';
import { useFilterPending, useFilterNuqs } from '@/app/components/features/filters/useFilterNuqs';
import { useSearchParams, useParams } from 'next/navigation';
import { useDrawerState } from '@/app/components/features/filters/useDrawerState';

interface SortAndCountBarProps {
  totalCount: number;
}

/**
 * Sort, result count, and the mobile drawer trigger need ZERO facet data.
 * This renders directly from page.tsx as soon as totalCount is known — it
 * never waits on the slower facet promise that gates the sidebar/drawer
 * content (ProductsToolbar / FilterSidebar).
 */
export function SortAndCountBar({ totalCount }: SortAndCountBarProps) {
  const isPending = useFilterPending();
  const { clearAllFilters, handleSortChange } = useFilterNuqs();
  const { isOpen: isDrawerOpen, open: openDrawer } = useDrawerState();

  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort');
  const currentPageParam = searchParams.get('page');
  const prevSortRef = useRef(currentSort);
  const prevPageRef = useRef(currentPageParam);

  useEffect(() => {
    const sortChanged = prevSortRef.current !== currentSort;
    const pageChanged = prevPageRef.current !== currentPageParam;
    prevSortRef.current = currentSort;
    prevPageRef.current = currentPageParam;
    if (sortChanged || pageChanged) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentSort, currentPageParam]);

  const params = useParams();
  const slugStr = Array.isArray(params?.slug)
    ? (params.slug as string[]).join('/')
    : String(params?.slug ?? '');
  const prevSlugRef = useRef(slugStr);

  useEffect(() => {
    if (prevSlugRef.current === slugStr) return;
    prevSlugRef.current = slugStr;
    clearAllFilters();
    handleSortChange('featured');
  }, [slugStr, clearAllFilters, handleSortChange]);

  const countLabel = totalCount === 1 ? 'product' : 'products';

  return (
    <div className="min-w-0">
      {/* Desktop: Sort + Result count */}
      <div className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 mb-6 border-b border-border-secondary">
        <SortDropdown />
        <span className="type-metadata text-secondary">
          {totalCount} {countLabel} {isPending && '(Loading...)'}
        </span>
      </div>

      {/* Mobile controls */}
      <div className="lg:hidden">
        <MobileControlsBar
          productCount={totalCount}
          onOpenFilters={openDrawer}
          isOpen={isDrawerOpen}
        />
      </div>
    </div>
  );
}
