"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  filterSectionHeaderRow,
  filterSectionHeaderLabel,
  filterStateActive,
  filterStateInactive,
} from "./FilterSidebar";
import { useFilterParam } from "@/app/hooks/nuqs/useFilterSort";
import { DEFAULT_PRICE_CEILING } from "@/lib/catalogue/priceBounds";

/**
 * Price range slider — and the owner of the shared slider pattern.
 *
 * `FilterSliderSection`, `DualRangeSlider` and `ResetButton` below are the
 * single definition of the filter-slider look: header row + reset button, the
 * rounded track with its grey rest fill and gold active fill, and the two
 * draggable handles. Other filter sliders import these rather than restating
 * any of it.
 *
 * F3: `PriceRangeSlider` (bottom of the file) is the URL-wired control. Its
 * only job is (a) on interaction, write the correct value to F1's
 * `minPrice` / `maxPrice` params (whole dollars, debounced, `history:"replace"`);
 * (b) on any URL change — first load, deep link, Back/Forward — render its
 * handles to match. It never queries product data or result counts; the
 * slider's `min` / `max` bounds arrive as props from page composition.
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

/** ms to wait after the last drag tick before the resting value hits the URL. */
const PRICE_WRITE_DEBOUNCE_MS = 300;

/**
 * Coerce a raw URL value to a usable handle position: null / non-numeric →
 * `fallback` (the handle rests at its bound); out-of-range → clamped to
 * `[min, max]` so a hand-edited URL can never throw or push a handle off-track.
 */
function clampToBounds(
  value: number | null,
  min: number,
  max: number,
  fallback: number,
): number {
  if (value == null || Number.isNaN(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

export function PriceRangeSlider({
  min = 0,
  max = DEFAULT_PRICE_CEILING,
}: {
  /** Slider bounds in whole dollars — supplied by page composition (F1's
   *  `resolvePriceBounds` at the call site), never computed here. */
  min?: number;
  max?: number;
} = {}) {
  // history:"replace" — a drag is one continuous gesture, not N Back-stack
  // entries. Unit is whole dollars, matching F1's URL contract.
  const [minPrice, setMinPrice] = useFilterParam("minPrice", { history: "replace" });
  const [maxPrice, setMaxPrice] = useFilterParam("maxPrice", { history: "replace" });

  // URL → handle positions. Clamp to bounds, and enforce min ≤ max on read so a
  // crossed / swapped URL still renders sanely.
  const urlMin = clampToBounds(minPrice, min, max, min);
  const urlMax = clampToBounds(maxPrice, min, max, max);
  const displayMin = Math.min(urlMin, urlMax);
  const displayMax = Math.max(urlMin, urlMax);

  // Local mirror so the handles track the pointer instantly; the URL catches up
  // on a trailing debounce.
  const [localMin, setLocalMin] = useState(displayMin);
  const [localMax, setLocalMax] = useState(displayMax);

  // Re-sync whenever the URL changes from outside this component — first load,
  // deep link, Back/Forward, Clear all.
  useEffect(() => {
    setLocalMin(displayMin);
    setLocalMax(displayMax);
  }, [displayMin, displayMax]);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);
  useEffect(() => clearTimer, [clearTimer]);

  // Last-write-wins: each drag tick reschedules the write, so only the resting
  // value lands in the address bar. A handle sitting on its bound clears its
  // param (clean-URL rule).
  const commit = useCallback(
    (nextMin: number, nextMax: number) => {
      clearTimer();
      timer.current = setTimeout(() => {
        setMinPrice(nextMin <= min ? null : nextMin);
        setMaxPrice(nextMax >= max ? null : nextMax);
      }, PRICE_WRITE_DEBOUNCE_MS);
    },
    [clearTimer, setMinPrice, setMaxPrice, min, max],
  );

  const handleMin = useCallback(
    (value: number) => {
      const next = Math.min(value, localMax);
      setLocalMin(next);
      commit(next, localMax);
    },
    [commit, localMax],
  );

  const handleMax = useCallback(
    (value: number) => {
      const next = Math.max(value, localMin);
      setLocalMax(next);
      commit(localMin, next);
    },
    [commit, localMin],
  );

  const active = minPrice != null || maxPrice != null;

  return (
    <FilterSliderSection
      label="Price"
      active={active}
      resetLabel="Reset price filter"
      onReset={() => {
        clearTimer();
        setLocalMin(min);
        setLocalMax(max);
        setMinPrice(null);
        setMaxPrice(null);
      }}
    >
      <DualRangeSlider
        min={min}
        max={max}
        minValue={localMin}
        maxValue={localMax}
        minLabel={`$${localMin}`}
        maxLabel={`$${localMax}`}
        onChangeMin={handleMin}
        onChangeMax={handleMax}
      />
    </FilterSliderSection>
  );
}
