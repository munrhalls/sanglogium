import React from 'react';
import { FilterSliderRow, FilterSliderSection } from './PriceRangeSlider';

/**
 * Tracer bullet 3: stock minimum, presentational only.
 *
 * Deliberately owns no track, handle, or header styling of its own — it renders
 * PriceRangeSlider's FilterSliderSection/FilterSliderRow so the two sliders stay
 * one pattern. Rendered inactive here to show the gray, 60%-opacity idle state.
 */
export function StockMinimumSlider() {
  return (
    <FilterSliderSection label="Availability" active={false}>
      <FilterSliderRow label="Minimum Stock" value="Any" percent={0} active={false} />
    </FilterSliderSection>
  );
}
