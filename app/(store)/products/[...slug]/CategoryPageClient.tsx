"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ProductGrid } from '@/app/components/features/products';
import { SortDropdown } from '@/app/components/features/filters/SortDropdown';
import { ActiveFilters } from '@/app/components/features/filters/ActiveFilters';
import { MobileControlsBar } from '@/app/components/features/filters/MobileControlsBar';
import { MobileFilterDrawer } from '@/app/components/features/filters/MobileFilterDrawer';
import { useFilterPending, useFilterNuqs } from '@/app/components/features/filters/useFilterNuqs';
import { useSearchParams, useParams } from 'next/navigation';
import { buildValidFilterFields, stripUnknownFilters } from '@/lib/catalogue/filterUtils';
import { Pagination } from '@/app/components/features/products/Pagination';
import { EmptyResults } from '@/app/components/features/products/EmptyResults';
import { totalPagesFor } from '@/lib/catalogue/pagination';
// Product type is passed through from server; ProductGrid has its own compatible local type

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  field: string;
  label: string;
  options: FilterOption[];
}

interface CategoryPageClientProps {
  filters: FilterGroup[];
  priceRange: { minPrice: number | null; maxPrice: number | null };
  maxStock: number | null;
  products: any[];
  totalCount: number;
  currentPage: number;
  perPage: number;
  categoryName?: string;
}

export function CategoryPageClient({
  filters,
  priceRange,
  maxStock,
  products,
  totalCount,
  currentPage,
  perPage,
  categoryName,
}: CategoryPageClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isPending = useFilterPending();

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
  // Products are filtered server-side; totalCount is the full filtered total
  // across all pages (not just the current window).
  const productCount = totalCount;
  const countLabel = productCount === 1 ? 'product' : 'products';
  const totalPages = totalPagesFor(totalCount, perPage);

  return (
    <>
      {/* Mobile drawer */}
      <MobileFilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
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
            onOpenFilters={() => setIsDrawerOpen(true)}
            isOpen={isDrawerOpen}
          />
        </div>

        {/* Active filters */}
        <ActiveFilters filterGroups={filters} />

        <div className={isPending ? 'opacity-60 transition-opacity pointer-events-none' : 'transition-opacity'}>
          {totalCount === 0 ? <EmptyResults /> : <ProductGrid products={products} />}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </>
  );
}
