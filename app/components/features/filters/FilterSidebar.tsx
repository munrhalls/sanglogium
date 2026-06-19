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

export function FilterSidebar({ filters, priceRange: priceRangeData, maxStock }: FilterSidebarProps) {
  const { priceRange, setPriceRange, clearPriceRange, isFilterActive, toggleFilter, stockMinimum, setStockMinimum, clearStockMinimum } = useFilterNuqs();

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
    </aside>
  );
}
