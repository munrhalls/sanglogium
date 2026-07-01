# Complete Filters and Sorting Source Code Record

## Table of Contents
1. [Frontend Filter Feature Components](#1-frontend-filter-feature-components)
2. [UI Filter/Sort Components](#2-ui-filtersort-components)
3. [Page Components](#3-page-components)
4. [Actions and Utilities](#4-actions-and-utilities)
5. [Sanity Data Layer](#5-sanity-data-layer)
6. [Sanity Schema Types](#6-sanity-schema-types)
7. [Sanity Utility Scripts](#7-sanity-utility-scripts)
8. [Other Related Files](#8-other-related-files)

---

## 1. Frontend Filter Feature Components

### `app/components/features/filters/useFilterNuqs.ts`

```typescript
"use client";

import { useQueryState, parseAsArrayOf, parseAsString, debounce } from "nuqs";
import { useTransition, useEffect, useSyncExternalStore, useMemo } from "react";
import { displayToCents, centsToDisplay } from "@/lib/utils/price";

const PRICE_RANGE_URL_LIMITER = debounce(500);

export interface FilterState {
  field: string;
  value: string;
}

// Module-level shared pending state for cross-component isPending
let pendingState = false;
const subscribers = new Set<() => void>();

function getPendingSnapshot() { return pendingState; }
function subscribeToPending(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}
function setPendingState(value: boolean) {
  if (pendingState !== value) {
    pendingState = value;
    subscribers.forEach(cb => cb());
  }
}

export function useFilterPending() {
  return useSyncExternalStore(subscribeToPending, getPendingSnapshot);
}

function parseFilter(filterString: string): FilterState | null {
  const separatorIndex = filterString.indexOf(":");
  if (separatorIndex === -1) return null;
  const field = filterString.slice(0, separatorIndex);
  const value = filterString.slice(separatorIndex + 1);
  if (!field || !value) return null;
  return { field, value };
}

export function useFilterNuqs() {
  const [isPending, startTransition] = useTransition();
  useEffect(() => { setPendingState(isPending); }, [isPending]);

  const [sort, setSort] = useQueryState("sort", parseAsString.withOptions({ shallow: false, throttleMs: 50, clearOnDefault: true }).withDefault("featured"));
  const [, setPage] = useQueryState("page", parseAsString.withOptions({ shallow: false, throttleMs: 50, clearOnDefault: true }));
  const [filters, setFilters] = useQueryState("f", parseAsArrayOf(parseAsString).withOptions({ shallow: false, throttleMs: 50, clearOnDefault: true }).withDefault([]));

  const toggleFilter = (field: string, value: string) => {
    startTransition(() => {
      setPage(null);
      setFilters((currentFilters) => {
        const current = currentFilters || [];
        const filterString = `${field}:${value}`;
        const filterIndex = current.indexOf(filterString);
        if (filterIndex === -1) { return [...currentFilters, filterString]; }
        else { return currentFilters.filter((_, index) => index !== filterIndex); }
      });
    });
  };

  const removeFilter = (field: string, value: string) => {
    startTransition(() => {
      setPage(null);
      const filterKey = `${field}:${value}`;
      setFilters((prev) => (prev || []).filter((f) => f !== filterKey));
    });
  };

  const clearAllFilters = () => {
    startTransition(() => { setPage(null); setFilters([]); });
  };

  const isFilterActive = (field: string, value: string): boolean => {
    const filterKey = `${field}:${value}`;
    return (filters || []).includes(filterKey);
  };

  const parsedFilters: FilterState[] = (filters || []).map(parseFilter).filter((f): f is FilterState => f !== null);

  const priceRange = useMemo((): { min?: number; max?: number } => {
    const priceFilters = parsedFilters.filter(f => f.field === 'priceRange');
    const range: { min?: number; max?: number } = {};
    priceFilters.forEach(filter => {
      if (filter.value.startsWith('min:')) {
        const min = parseInt(filter.value.slice(4), 10);
        if (!isNaN(min)) range.min = centsToDisplay(min);
      } else if (filter.value.startsWith('max:')) {
        const max = parseInt(filter.value.slice(4), 10);
        if (!isNaN(max)) range.max = centsToDisplay(max);
      }
    });
    return range;
  }, [parsedFilters]);

  const setPriceRange = (range: { min?: number; max?: number }) => {
    startTransition(() => {
      setPage(null);
      setFilters((prev) => {
        const current = prev || [];
        const withoutPrice = current.filter(f => !f.startsWith('priceRange:'));
        const newFilters = [...withoutPrice];
        if (range.min !== undefined && range.max !== undefined && range.min >= range.max) { return current; }
        if (range.min !== undefined) { const minCents = displayToCents(range.min); newFilters.push(`priceRange:min:${minCents}`); }
        if (range.max !== undefined) { const maxCents = displayToCents(range.max); newFilters.push(`priceRange:max:${maxCents}`); }
        return newFilters;
      }, { limitUrlUpdates: PRICE_RANGE_URL_LIMITER });
    });
  };

  const clearPriceRange = () => {
    startTransition(() => {
      setPage(null);
      setFilters((prev) => (prev || []).filter(f => !f.startsWith('priceRange:')), { limitUrlUpdates: PRICE_RANGE_URL_LIMITER });
    });
  };

  const stockMinimum = useMemo((): number => {
    const stockFilters = parsedFilters.filter(f => f.field === 'stockMin');
    if (stockFilters.length === 0) return 0;
    const value = parseInt(stockFilters[0].value, 10);
    return isNaN(value) ? 0 : value;
  }, [parsedFilters]);

  const setStockMinimum = (value: number) => {
    startTransition(() => {
      setPage(null);
      setFilters((prev) => {
        const current = prev || [];
        const withoutStock = current.filter(f => !f.startsWith('stockMin:'));
        if (value <= 0) { return withoutStock; }
        return [...withoutStock, `stockMin:${value}`];
      });
    });
  };

  const clearStockMinimum = () => {
    startTransition(() => { setPage(null); setFilters((prev) => (prev || []).filter(f => !f.startsWith('stockMin:'))); });
  };

  const isPriceRangeActive = (): boolean => parsedFilters.some(f => f.field === 'priceRange');
  const isStockMinimumActive = (): boolean => parsedFilters.some(f => f.field === 'stockMin');

  const handleSortChange = (value: string) => {
    startTransition(() => { setPage(null); setSort(value === "featured" ? null : value); });
  };

  return {
    filters, setFilters, toggleFilter, removeFilter, clearAllFilters,
    isFilterActive, hasActiveFilters: (filters || []).length > 0,
    parsedFilters, priceRange, setPriceRange, clearPriceRange, isPriceRangeActive,
    stockMinimum, setStockMinimum, clearStockMinimum, isStockMinimumActive,
    sort: sort || "featured", handleSortChange, isPending,
  };
}
```

### `app/components/features/filters/ActiveFilters.tsx`

```typescript
"use client";
import React from 'react';
import { useFilterNuqs } from './useFilterNuqs';
import { centsToDisplay } from '@/lib/utils/price';

interface FilterGroup {
  field: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface ActiveFiltersProps {
  filterGroups?: FilterGroup[];
}

export function ActiveFilters({ filterGroups }: ActiveFiltersProps) {
  const { filters, parsedFilters, removeFilter, clearAllFilters, hasActiveFilters } = useFilterNuqs();
  if (!hasActiveFilters || !filterGroups) { return null; }

  const labelMap = new Map<string, string>();
  filterGroups.forEach((group) => {
    group.options.forEach((opt) => {
      labelMap.set(`${group.field}:${opt.value}`, `${group.label}: ${opt.label}`);
    });
  });

  const formatFilterLabel = (filter: { field: string; value: string }): string => {
    const filterKey = `${filter.field}:${filter.value}`;
    if (labelMap.has(filterKey)) { return labelMap.get(filterKey)!; }
    if (filter.field === 'priceRange') {
      if (filter.value.startsWith('min:')) {
        const minCents = parseInt(filter.value.replace('min:', ''), 10);
        return `Price above: $${centsToDisplay(minCents)}`;
      }
      if (filter.value.startsWith('max:')) {
        const maxCents = parseInt(filter.value.replace('max:', ''), 10);
        return `Price up to: $${centsToDisplay(maxCents)}`;
      }
    }
    if (filter.field === 'stockMin') { return `Min stock: ${filter.value}`; }
    return filterKey;
  };

  return (
    <div data-testid="active-filters" className="flex flex-wrap gap-2 mb-6">
      {parsedFilters?.map((filter) => {
        if (!filter || !filter.field || !filter.value) return null;
        const filterKey = `${filter.field}:${filter.value}`;
        return (
          <button key={filterKey} type="button" onClick={() => removeFilter(filter.field, filter.value)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-elevated border border-brand-400 rounded-lg type-caption text-primary hover:border-brand-200 transition-colors cursor-pointer">
            <span>{formatFilterLabel(filter)}</span>
            <span aria-label={`Remove filter`} className="text-caption hover:text-primary transition-colors">×</span>
          </button>
        );
      })}
      <button type="button" onClick={clearAllFilters}
        className="type-caption text-accent-500 underline hover:text-brand-100 transition-colors cursor-pointer">
        Clear all
      </button>
    </div>
  );
}
```

### `app/components/features/filters/FilterSidebar.tsx`

```typescript
"use client";
import React from 'react';
import { useFilterNuqs } from './useFilterNuqs';
import { PriceRangeSlider } from './PriceRangeSlider';
import { StockMinimumSlider } from './StockMinimumSlider';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { centsToDisplay } from '@/lib/utils/price';

interface FilterOption { value: string; label: string; }
interface FilterGroup { field: string; label: string; options: FilterOption[]; }
interface FilterSidebarProps {
  filters: FilterGroup[];
  priceRange?: { minPrice: number | null; maxPrice: number | null };
  maxStock?: number | null;
}

export function FilterSidebar({ filters, priceRange: priceRangeData, maxStock }: FilterSidebarProps) {
  const { priceRange, setPriceRange, clearPriceRange, isFilterActive, toggleFilter, stockMinimum, setStockMinimum, clearStockMinimum } = useFilterNuqs();
  const minPriceDollars = priceRangeData?.minPrice ? centsToDisplay(priceRangeData.minPrice) : 0;
  const maxPriceDollars = priceRangeData?.maxPrice ? centsToDisplay(priceRangeData.maxPrice) : 10000;

  return (
    <aside data-testid="filter-sidebar" className="w-full">
      <div className="bg-surface-elevated border border-border-secondary rounded-sm p-6 space-y-6">
        <h3 className="type-overline text-accent-500">Filters</h3>
        <form className="space-y-6">
          <PriceRangeSlider min={minPriceDollars} max={maxPriceDollars} value={priceRange} onChange={setPriceRange} onClear={clearPriceRange} />
          <StockMinimumSlider maxStock={maxStock ?? 100} value={stockMinimum} onChange={setStockMinimum} onClear={clearStockMinimum} />
          {filters.map((group) => (
            <fieldset key={group.field} className="space-y-3">
              <legend className="type-overline text-accent-500 section-header-anchor">{group.label}</legend>
              <div className="space-y-2">
                {group.options.map((option) => {
                  const isChecked = isFilterActive(group.field, option.value);
                  return (<Checkbox key={option.value} name={group.field} value={option.value} checked={isChecked} onChange={() => toggleFilter(group.field, option.value)} label={option.label} />);
                })}
              </div>
            </fieldset>
          ))}
        </form>
      </div>
    </aside>
  );
}
```

### `app/components/features/filters/MobileControlsBar.tsx`

```typescript
"use client";
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { SortDropdown } from './SortDropdown';

interface MobileControlsBarProps { productCount: number; onOpenFilters: () => void; }

export function MobileControlsBar({ productCount, onOpenFilters }: MobileControlsBarProps) {
  const searchParams = useSearchParams();
  const activeFilterCount = searchParams.getAll('f').length;
  return (
    <div data-testid="mobile-controls-bar" className="flex items-center gap-3 lg:hidden mb-4 px-4">
      <button type="button" onClick={onOpenFilters} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 btn-secondary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line>
          <line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line>
          <line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line>
          <line x1="17" y1="16" x2="23" y2="16"></line>
        </svg>
        <span className="type-caption">Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
      </button>
      <div className="flex-1"><SortDropdown /></div>
    </div>
  );
}
```

### `app/components/features/filters/MobileFilterDrawer.tsx`

```typescript
"use client";
import React, { useEffect } from 'react';
import { useFilterNuqs } from './useFilterNuqs';
import { PriceRangeSlider } from './PriceRangeSlider';
import { StockMinimumSlider } from './StockMinimumSlider';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { centsToDisplay } from '@/lib/utils/price';

interface FilterOption { value: string; label: string; }
interface FilterGroup { field: string; label: string; options: FilterOption[]; }
interface MobileFilterDrawerProps {
  isOpen: boolean; onClose: () => void; filters: FilterGroup[];
  priceRange?: { minPrice: number | null; maxPrice: number | null }; maxStock?: number | null;
}

export function MobileFilterDrawer({ isOpen, onClose, filters, priceRange: priceRangeData, maxStock }: MobileFilterDrawerProps) {
  const { isFilterActive, toggleFilter, priceRange, setPriceRange, clearPriceRange, stockMinimum, setStockMinimum, clearStockMinimum } = useFilterNuqs();
  const minPriceDollars = priceRangeData?.minPrice ? centsToDisplay(priceRangeData.minPrice) : 0;
  const maxPriceDollars = priceRangeData?.maxPrice ? centsToDisplay(priceRangeData.maxPrice) : 10000;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const drawer = document.querySelector('[data-testid="mobile-filter-drawer"]') as HTMLElement;
    if (!drawer) return;
    const focusableElements = drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) { if (document.activeElement === firstElement) { e.preventDefault(); lastElement?.focus(); }}
      else { if (document.activeElement === lastElement) { e.preventDefault(); firstElement?.focus(); }}
    };
    firstElement?.focus();
    drawer.addEventListener('keydown', handleTabKey);
    return () => drawer.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-brand-900/60 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside data-testid="mobile-filter-drawer"
        className={`fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] transform transition-transform duration-300 ease-out lg:hidden ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        aria-label="Filter options">
        <div className="flex flex-col h-full bg-surface-card rounded-t-lg">
          <div className="flex items-center justify-between p-4 border-b border-border-secondary">
            <h2 className="type-overline">Filters</h2>
            <button type="button" onClick={onClose} className="p-2 text-secondary hover:text-primary transition-colors" aria-label="Close filters">Done</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <form className="space-y-6">
              <PriceRangeSlider min={minPriceDollars} max={maxPriceDollars} value={priceRange} onChange={setPriceRange} onClear={clearPriceRange} />
              <StockMinimumSlider maxStock={maxStock ?? 100} value={stockMinimum} onChange={setStockMinimum} onClear={clearStockMinimum} />
              {filters.map((group) => (
                <fieldset key={group.field} className="space-y-3">
                  <legend className="type-overline text-accent-500 section-header-anchor">{group.label}</legend>
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isChecked = isFilterActive(group.field, option.value);
                      return (<Checkbox key={option.value} name={group.field} value={option.value} checked={isChecked} onChange={() => toggleFilter(group.field, option.value)} label={option.label} />);
                    })}
                  </div>
                </fieldset>
              ))}
            </form>
          </div>
          <div className="sticky bottom-0 p-4 border-t border-border-secondary bg-surface-card">
            <button type="button" onClick={onClose} className="w-full btn-primary">Show Results</button>
          </div>
        </div>
      </aside>
    </>
  );
}
```

<!-- END SECTION 1 -->
