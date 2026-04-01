"use client";

import React, { useEffect } from 'react';
import { useFilterNuqs } from './useFilterNuqs';
import { PriceRangeSlider } from './PriceRangeSlider';
import { StockMinimumSlider } from './StockMinimumSlider';
import { Checkbox } from '@/app/components/ui/Checkbox';

interface FilterOption {
  value: string;
  label: string;
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
  const { isFilterActive, toggleFilter, getPriceRange, setPriceRange, clearPriceRange, getStockMinimum, setStockMinimum, clearStockMinimum } = useFilterNuqs();
  const currentPriceRange = getPriceRange();
  const currentStockMinimum = getStockMinimum();

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

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const drawer = document.querySelector('[data-testid="mobile-filter-drawer"]') as HTMLElement;
    if (!drawer) return;

    const focusableElements = drawer.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element when drawer opens
    firstElement?.focus();
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
        data-testid="mobile-filter-drawer"
        className={`
          fixed bottom-0 left-0 right-0 z-50 max-h-[85vh]
          transform transition-transform duration-300 ease-out
          lg:hidden
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        aria-label="Filter options"
      >
        <div className="flex flex-col h-full bg-surface-card rounded-t-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-secondary">
            <h2 className="type-overline">
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
                min={priceRangeData?.minPrice ?? 0}
                max={priceRangeData?.maxPrice ?? 10000}
                value={currentPriceRange}
                onChange={setPriceRange}
                onClear={clearPriceRange}
              />

              <StockMinimumSlider
                maxStock={maxStock ?? 100}
                value={currentStockMinimum}
                onChange={setStockMinimum}
                onClear={clearStockMinimum}
              />

              {filters.map((group) => (
                <fieldset key={group.field} className="space-y-3">
                  <legend className="type-overline text-accent-500 section-header-anchor">
                    {group.label}
                  </legend>

                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isChecked = isFilterActive(group.field, option.value);
                      return (
                        <Checkbox
                          key={option.value}
                          name={group.field}
                          value={option.value}
                          checked={isChecked}
                          onChange={() => toggleFilter(group.field, option.value)}
                          label={option.label}
                        />
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </form>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 p-4 border-t border-border-secondary bg-surface-card">
            <button
              type="button"
              onClick={onClose}
              className="w-full btn-primary"
            >
              Show Results
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
