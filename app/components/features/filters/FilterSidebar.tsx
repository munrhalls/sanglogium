"use client";

import React from 'react';
import { useFilterNuqs } from './useFilterNuqs';
import { PriceRangeSlider } from './PriceRangeSlider';
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

interface FilterSidebarProps {
  filters: FilterGroup[];
  priceRange?: { minPrice: number | null; maxPrice: number | null };
}

export function FilterSidebar({ filters, priceRange: priceRangeData }: FilterSidebarProps) {
  const { getPriceRange, setPriceRange, clearPriceRange, isFilterActive, toggleFilter } = useFilterNuqs();
  const currentPriceRange = getPriceRange();

  return (
    <aside
      data-testid="filter-sidebar"
      className="hidden lg:block w-60 sticky top-desktop-header-h"
    >
      <div className="bg-surface-elevated border border-border-secondary rounded-sm p-6 space-y-6">
        <h3 className="type-overline text-caption">
          Filters
        </h3>

        <form className="space-y-6">
          <PriceRangeSlider
            min={priceRangeData?.minPrice ?? 0}
            max={priceRangeData?.maxPrice ?? 10000}
            value={currentPriceRange}
            onChange={setPriceRange}
            onClear={clearPriceRange}
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
