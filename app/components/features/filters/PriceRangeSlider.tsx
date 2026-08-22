"use client";

import React from 'react';
import {
  filterSectionHeaderRow,
  filterSectionHeaderLabel,
  filterStateActive,
  filterStateInactive,
} from './FilterSidebar';

/**
 * Price range slider — and the owner of the shared slider pattern.
 *
 * `FilterSliderSection`, `FilterSliderRow` and `ResetButton` below are the
 * single definition of the filter-slider look: header row + reset button,
 * caption label / current value row, and the 8px rounded track with its
 * active (gold) and inactive (grey, dimmed) fills. StockMinimumSlider imports
 * these rather than restating any of it.
 *
 * Tracer bullet 3: hardcoded values, no state, no URL access.
 */

const TRACK_ACTIVE_FILL = '#D4AF37'; // accent-500
const TRACK_ACTIVE_REST = '#2E2E2D'; // secondary-800
const TRACK_INACTIVE_FILL = '#9A9997'; // secondary-500
const TRACK_INACTIVE_REST = '#4A4948'; // secondary-700

function ResetIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 8a5.5 5.5 0 1 0 1.7-3.97M2.5 2.5V5.5H5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ResetButton({ active, label }: { active: boolean; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={!active}
      className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
        active
          ? `${filterStateActive} hover:bg-accent-500/10`
          : `${filterStateInactive} cursor-not-allowed`
      }`}
    >
      <ResetIcon />
    </button>
  );
}

export function FilterSliderSection({
  label,
  active,
  resetLabel,
  children,
}: {
  label: string;
  active: boolean;
  resetLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className={filterSectionHeaderRow}>
        <span className={filterSectionHeaderLabel}>{label}</span>
        <ResetButton active={active} label={resetLabel} />
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export function FilterSliderRow({
  label,
  displayValue,
  value,
  min,
  max,
  active,
}: {
  label: string;
  displayValue: string;
  value: number;
  min: number;
  max: number;
  active: boolean;
}) {
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const fill = active ? TRACK_ACTIVE_FILL : TRACK_INACTIVE_FILL;
  const rest = active ? TRACK_ACTIVE_REST : TRACK_INACTIVE_REST;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="type-caption text-text-caption">{label}</span>
        <span className="type-caption text-text-caption">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        defaultValue={value}
        aria-label={label}
        style={{
          background: `linear-gradient(to right, ${fill} 0%, ${fill} ${percent}%, ${rest} ${percent}%, ${rest} 100%)`,
        }}
        className={`
          h-2 w-full cursor-pointer appearance-none rounded-full
          ${active ? '' : 'opacity-60'}
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500
          [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-border-secondary
          [&::-webkit-slider-thumb]:bg-brand-400 [&::-webkit-slider-thumb]:cursor-grab
          [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-border-secondary
          [&::-moz-range-thumb]:bg-brand-400 [&::-moz-range-thumb]:cursor-grab
        `}
      />
    </div>
  );
}

const PRICE_MIN = 0;
const PRICE_MAX = 2000;
const PRICE_SELECTED_MIN = 250;
const PRICE_SELECTED_MAX = 1200;

export function PriceRangeSlider() {
  return (
    <FilterSliderSection label="Price" active resetLabel="Reset price filter">
      <FilterSliderRow
        label="Min"
        displayValue={`$${PRICE_SELECTED_MIN}`}
        value={PRICE_SELECTED_MIN}
        min={PRICE_MIN}
        max={PRICE_MAX}
        active
      />
      <FilterSliderRow
        label="Max"
        displayValue={`$${PRICE_SELECTED_MAX}`}
        value={PRICE_SELECTED_MAX}
        min={PRICE_MIN}
        max={PRICE_MAX}
        active
      />
    </FilterSliderSection>
  );
}
