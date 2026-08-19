"use client";

import React from 'react';
import { useFilterNuqs } from './useFilterNuqs';
import { PriceRangeSlider } from './PriceRangeSlider';
import { StockMinimumSlider } from './StockMinimumSlider';
import { Checkbox } from '@/app/components/ui/Checkbox';
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

interface FilterSidebarProps {
  filters: FilterGroup[];
  priceRange?: { minPrice: number | null; maxPrice: number | null };
  maxStock?: number | null;
}

interface CollapsibleFilterGroupProps {
  group: FilterGroup;
  isFilterActive: (field: string, value: string) => boolean;
  toggleFilter: (field: string, value: string) => void;
}

/**
 * A single filter facet rendered as an accessible disclosure (G6): the group
 * label is a toggle button (aria-expanded, keyboard-operable via native button)
 * that collapses long CMS option lists. Defaults to expanded so existing
 * behavior is preserved; the Checkbox rendering is unchanged.
 */
export function CollapsibleFilterGroup({ group, isFilterActive, toggleFilter }: CollapsibleFilterGroupProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const panelId = `filter-group-${group.field}`;

  return (
    <div className="space-y-3">
      <h4 className="type-overline text-accent-500 section-header-anchor">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-2 text-left text-current hover:text-primary transition-colors"
        >
          <span>{group.label}</span>
          <span aria-hidden="true" className="text-caption">
            {isOpen ? '−' : '+'}
          </span>
        </button>
      </h4>
      <div
        id={panelId}
        role="group"
        aria-label={group.label}
        className="space-y-2"
        hidden={!isOpen}
      >
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
              count={option.count}
              disabled={!isChecked && (option.count ?? 0) === 0}
            />
          );
        })}
      </div>
    </div>
  );
}

export function FilterSidebar({ filters, priceRange: priceRangeData, maxStock }: FilterSidebarProps) {
  const { priceRange, setPriceRange, clearPriceRange, isFilterActive, toggleFilter, stockMinimum, setStockMinimum, clearStockMinimum, activeFilterCount, clearAllFilters } = useFilterNuqs();

  const { min: minPriceDollars, max: maxPriceDollars } = resolvePriceBounds(priceRangeData);

  return (
    <aside
      data-testid="filter-sidebar"
      className="w-full"
    >
      <div className="bg-surface-elevated border border-border-secondary rounded-sm p-6 space-y-6">
        <h3 className="type-overline text-accent-500">
          Filters
        </h3>

        <form className="space-y-6">
          {/* Active-filter summary above the first control so desktop shoppers see
              the applied state where they act (G5). Content-column chips remain. */}
          {activeFilterCount > 0 && (
            <div
              data-testid="sidebar-active-summary"
              className="flex items-center justify-between gap-2"
            >
              <p className="type-caption text-secondary">
                {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} applied
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="type-caption text-accent-500 underline hover:text-brand-100 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

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
    </aside>
  );
}
