"use client";

import React from 'react';
import { FilterSliderSection, FilterSliderRow } from './PriceRangeSlider';

/**
 * Stock minimum slider.
 *
 * Reuses PriceRangeSlider's section/row/track pattern wholesale — no track,
 * handle, header or state styling is defined here. Single row, inactive by
 * default (grey, dimmed) per the style guide.
 *
 * Tracer bullet 3: hardcoded value, no state, no URL access.
 */

const STOCK_MIN = 0;
const STOCK_MAX = 50;
const STOCK_SELECTED = 0;

export function StockMinimumSlider() {
  return (
    <FilterSliderSection
      label="Availability"
      active={false}
      resetLabel="Reset stock filter"
    >
      <FilterSliderRow
        label="Minimum Stock"
        displayValue={`${STOCK_SELECTED}`}
        value={STOCK_SELECTED}
        min={STOCK_MIN}
        max={STOCK_MAX}
        active={false}
      />
    </FilterSliderSection>
  );
}
