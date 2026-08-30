"use client";

import React, { useState } from "react";
import {
  filterSectionHeaderRow,
  filterSectionHeaderLabel,
  filterStateActive,
  filterStateInactive,
} from "./FilterSidebar";

/**
 * Price range slider — and the owner of the shared slider pattern.
 *
 * `FilterSliderSection`, `DualRangeSlider` and `ResetButton` below are the
 * single definition of the filter-slider look: header row + reset button, the
 * rounded track with its grey rest fill and gold active fill, and the two
 * draggable handles. Other filter sliders import these rather than restating
 * any of it.
 *
 * Static surface only: bounds are hardcoded, state is cosmetic, no URL access.
 */

const TRACK_ACTIVE_FILL = "#D4AF37"; // accent-500
const TRACK_REST = "#4A4948"; // secondary-700

const THUMB_CLASSES =
  "pointer-events-none absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-500 " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-border-secondary [&::-webkit-slider-thumb]:bg-brand-400 " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-border-secondary [&::-moz-range-thumb]:bg-brand-400";

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

export function ResetButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={!active}
      onClick={onClick}
      className={`rounded-full flex h-6 w-6 items-center justify-center transition-colors ${
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
  onReset,
  children,
}: {
  label: string;
  active: boolean;
  resetLabel: string;
  onReset?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className={filterSectionHeaderRow}>
        <span className={filterSectionHeaderLabel}>{label}</span>
        <ResetButton active={active} label={resetLabel} onClick={onReset} />
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export function DualRangeSlider({
  min,
  max,
  minValue,
  maxValue,
  minLabel,
  maxLabel,
  onChangeMin,
  onChangeMax,
}: {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  minLabel: string;
  maxLabel: string;
  onChangeMin: (value: number) => void;
  onChangeMax: (value: number) => void;
}) {
  const span = max > min ? max - min : 1;
  const startPercent = ((minValue - min) / span) * 100;
  const endPercent = ((maxValue - min) / span) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-4">
        <div
          className="rounded-full absolute inset-x-0 top-1 h-2"
          style={{
            background: `linear-gradient(to right, ${TRACK_REST} 0%, ${TRACK_REST} ${startPercent}%, ${TRACK_ACTIVE_FILL} ${startPercent}%, ${TRACK_ACTIVE_FILL} ${endPercent}%, ${TRACK_REST} ${endPercent}%, ${TRACK_REST} 100%)`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={minValue}
          aria-label="Minimum price"
          onChange={(event) => onChangeMin(Math.min(Number(event.target.value), maxValue))}
          className={THUMB_CLASSES}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxValue}
          aria-label="Maximum price"
          onChange={(event) => onChangeMax(Math.max(Number(event.target.value), minValue))}
          className={THUMB_CLASSES}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="type-caption text-text-caption">{minLabel}</span>
        <span className="type-caption text-text-caption">{maxLabel}</span>
      </div>
    </div>
  );
}

const PRICE_MIN = 0;
const PRICE_MAX = 2000;
const PRICE_SELECTED_MIN = 250;
const PRICE_SELECTED_MAX = 1200;

export function PriceRangeSlider() {
  const [minValue, setMinValue] = useState(PRICE_SELECTED_MIN);
  const [maxValue, setMaxValue] = useState(PRICE_SELECTED_MAX);

  const atDefaults = minValue === PRICE_MIN && maxValue === PRICE_MAX;

  return (
    <FilterSliderSection
      label="Price"
      active={!atDefaults}
      resetLabel="Reset price filter"
      onReset={() => {
        setMinValue(PRICE_MIN);
        setMaxValue(PRICE_MAX);
      }}
    >
      <DualRangeSlider
        min={PRICE_MIN}
        max={PRICE_MAX}
        minValue={minValue}
        maxValue={maxValue}
        minLabel={`$${minValue}`}
        maxLabel={`$${maxValue}`}
        onChangeMin={setMinValue}
        onChangeMax={setMaxValue}
      />
    </FilterSliderSection>
  );
}
