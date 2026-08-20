"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SortDropdown } from '@/app/components/features/filters/SortDropdown';
import { ActiveFilters } from '@/app/components/features/filters/ActiveFilters';
import { MobileControlsBar } from '@/app/components/features/filters/MobileControlsBar';
import { MobileFilterDrawer } from '@/app/components/features/filters/MobileFilterDrawer';
import { useFilterPending, useFilterNuqs } from '@/app/components/features/filters/useFilterNuqs';
import { useSearchParams, useParams } from 'next/navigation';
import { buildValidFilterFields, stripUnknownFilters } from '@/lib/catalogue/filterUtils';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  field: string;
  label: string;
  options: FilterOption[];
}

interface ProductsToolbarProps {
  filters: FilterGroup[];
  priceRange: { minPrice: number | null; maxPrice: number | null };
  maxStock: number | null;
  totalCount: number;
  categoryName?: string;
}

export function ProductsToolbar({
  filters,
  priceRange,
  maxStock,
  totalCount,
}: ProductsToolbarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerOpenRef = useRef(false);
  const isPending = useFilterPending();

  const openDrawer = () => {
    if (drawerOpenRef.current) return;
    drawerOpenRef.current = true;
    window.history.pushState({ filterDrawer: true }, '');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (!drawerOpenRef.current) return;
    drawerOpenRef.current = false;
    setIsDrawerOpen(false);
    window.history.back();
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>('[data-testid="open-filters-button"]')
        ?.focus();
    });
  };

  // Browser back closes the drawer (an entry is pushed on open).
  useEffect(() => {
    const onPopState = () => {
      if (!drawerOpenRef.current) return;
      drawerOpenRef.current = false;
      setIsDrawerOpen(false);
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>('[data-testid="open-filters-button"]')
          ?.focus();
      });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const {
    filters: activeUrlFilters,
    setFilters,
    clearAllFilters,
    handleSortChange,
  } = useFilterNuqs();

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

  useEffect(() => {
    if (!activeUrlFilters || activeUrlFilters.length === 0) return;
    const validFields = buildValidFilterFields(filters);
    const cleaned = stripUnknownFilters(activeUrlFilters, validFields);
    if (cleaned.length !== activeUrlFilters.length) {
      setFilters(cleaned);
    }
  }, [filters, activeUrlFilters, setFilters]);

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

  const productCount = totalCount;
  const countLabel = productCount === 1 ? 'product' : 'products';

  return (
    <>
      {/* Mobile drawer */}
      <MobileFilterDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        filters={filters}
        priceRange={priceRange}
        maxStock={maxStock}
      />

      <div className="min-w-0">
        {/* Desktop: Sort + Result count */}
        <div className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 mb-6 border-b border-border-secondary">
          <SortDropdown />
          <span className="type-metadata text-secondary">
            {productCount} {countLabel} {isPending && '(Loading...)'}
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

        {/* Active filters */}
        <ActiveFilters filterGroups={filters} />
      </div>
    </>
  );
}
