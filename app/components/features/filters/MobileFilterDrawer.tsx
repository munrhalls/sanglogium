"use client";

import React, { useEffect } from 'react';
import { useFilterNuqs } from './useFilterNuqs';
import { PriceRangeSlider } from './PriceRangeSlider';
import { StockMinimumSlider } from './StockMinimumSlider';
import { CollapsibleFilterGroup } from './FilterSidebar';
import { resolvePriceBounds } from '@/lib/catalogue/priceBounds';

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

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterGroup[];
  priceRange?: { minPrice: number | null; maxPrice: number | null };
  maxStock?: number | null;
}

export function MobileFilterDrawer({ isOpen, onClose, filters, priceRange: priceRangeData, maxStock }: MobileFilterDrawerProps) {
  const { isFilterActive, toggleFilter, priceRange, setPriceRange, clearPriceRange, stockMinimum, setStockMinimum, clearStockMinimum } = useFilterNuqs();

  const { min: minPriceDollars, max: maxPriceDollars } = resolvePriceBounds(priceRangeData);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap — queries focusable nodes on every Tab keypress (dynamic content safe)
  useEffect(() => {
    if (!isOpen) return;

    const drawer = document.querySelector('[data-testid="mobile-filter-drawer"]') as HTMLElement;
    if (!drawer) return;

    const getFocusable = (): HTMLElement[] =>
      Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );

    // Focus first element when drawer opens
    getFocusable()[0]?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const els = getFocusable();
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    drawer.addEventListener('keydown', handleTabKey);
    return () => drawer.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);


  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-brand-900/60 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Bottom sheet drawer */}
      <aside
        id="mobile-filter-drawer"
        data-testid="mobile-filter-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-filter-drawer-title"
        inert={!isOpen}
        className={`
          fixed bottom-0 left-0 right-0 z-50 max-h-[85vh]
          transform transition-transform duration-300 ease-out
          lg:hidden
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="flex flex-col h-full bg-surface-card rounded-t-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-secondary">
            <h2 id="mobile-filter-drawer-title" className="type-overline">
              Filters
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-secondary hover:text-primary transition-colors"
              aria-label="Close filters"
            >
              Done
            </button>
          </div>

          {/* Filter content */}
          <div className="flex-1 overflow-y-auto p-4">
            <form className="space-y-6">
              <PriceRangeSlider
                min={minPriceDollars}
                max={maxPriceDollars}
                value={priceRange}
                onChange={setPriceRange}
                onClear={clearPriceRange}
              />

              <StockMinimumSlider
                maxStock={maxStock ?? 100}
                value={stockMinimum}
                onChange={setStockMinimum}
                onClear={clearStockMinimum}
              />

              {filters.map((group) => (
                <CollapsibleFilterGroup
                  key={group.field}
                  group={group}
                  isFilterActive={isFilterActive}
                  toggleFilter={toggleFilter}
                />
              ))}
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
