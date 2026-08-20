"use client";

import React, { useEffect } from 'react';
import { ActiveFilters } from '@/app/components/features/filters/ActiveFilters';
import { MobileFilterDrawer } from '@/app/components/features/filters/MobileFilterDrawer';
import { useFilterNuqs } from '@/app/components/features/filters/useFilterNuqs';
import { useDrawerState } from '@/app/components/features/filters/useDrawerState';
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
  categoryName?: string;
}

/**
 * This component now owns ONLY what genuinely needs facet data \u2014 the
 * active-filter chips and the mobile drawer's contents. Sort, result count,
 * and the drawer's open/close state moved to SortAndCountBar + useDrawerState,
 * which never wait on this component's (facet-dependent) mount.
 */
export function ProductsToolbar({
  filters,
  priceRange,
  maxStock,
}: ProductsToolbarProps) {
  const { filters: activeUrlFilters, setFilters } = useFilterNuqs();
  const { isOpen: isDrawerOpen, close: closeDrawer } = useDrawerState();

  useEffect(() => {
    if (!activeUrlFilters || activeUrlFilters.length === 0) return;
    const validFields = buildValidFilterFields(filters);
    const cleaned = stripUnknownFilters(activeUrlFilters, validFields);
    if (cleaned.length !== activeUrlFilters.length) {
      setFilters(cleaned);
    }
  }, [filters, activeUrlFilters, setFilters]);

  return (
    <>
      <MobileFilterDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        filters={filters}
        priceRange={priceRange}
        maxStock={maxStock}
      />

      <ActiveFilters filterGroups={filters} />
    </>
  );
}
