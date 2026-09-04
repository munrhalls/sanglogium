"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  filterSectionHeaderRow,
  filterSectionHeaderLabel,
  filterStateActive,
  filterStateInactive,
} from "./FilterSidebar";
import { useFilterParam } from "@/app/hooks/nuqs/useFilterSort";
import { DEFAULT_PRICE_CEILING, PREMIUM_TIERS } from "@/lib/catalogue/priceBounds";
import { formatPriceMajor } from "@/lib/utils/price";

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
  "price-range-input pointer-events-none absolute left-0 right-0 top-1/2 h-3 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 " +
  // Vertical centring: the input box is exactly thumb-height (12px) and is
  // itself centred on the track line (top-1/2 -translate-y-1/2). Both engines
  // then centre the 12px thumb on the equally-tall runnable track, so the disc
  // centre-y lands on the input mid-line — and thus the track centreline — with
  // no per-engine margin correction. Do NOT reintroduce a margin-top hack.
  "[&::-webkit-slider-runnable-track]:h-full [&::-webkit-slider-runnable-track]:bg-transparent " +
  // NB: the -webkit-appearance:none reset + border-radius the WebKit thumb needs
  // to render as a disc lives in globals.css (.price-range-input) — Tailwind v3
  // emits only unprefixed `appearance` and won't compile that on this pseudo.
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:box-border [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-accent-500 [&::-webkit-slider-thumb]:bg-accent-500 [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.5)] [&::-webkit-slider-thumb:hover]:border-accent-400 " +
  // Firefox centres ::-moz-range-thumb on ::-moz-range-track automatically.
  "[&::-moz-range-track]:h-full [&::-moz-range-track]:bg-transparent " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:box-border [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-accent-500 [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.5)]";

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
  maxDisabled = false,
}: {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  minLabel: string;
  maxLabel: string;
  onChangeMin: (value: number) => void;
  onChangeMax: (value: number) => void;
  /** Premium tier active: the max handle is frozen and greyed, the track fill
   *  runs the full width, and only the minimum handle stays draggable. */
  maxDisabled?: boolean;
}) {
  const span = max > min ? max - min : 1;
  const startPercent = ((minValue - min) / span) * 100;
  const endPercent = maxDisabled ? 100 : ((maxValue - min) / span) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="relative h-6">
        <div
          className="rounded-full absolute left-1.5 right-1.5 top-1/2 h-0.5 -translate-y-1/2"
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
          disabled={maxDisabled}
          title={
            maxDisabled
              ? "Set by the premium tier — untick it to use the slider maximum"
              : undefined
          }
          onChange={(event) => onChangeMax(Math.max(Number(event.target.value), minValue))}
          className={`${THUMB_CLASSES}${
            maxDisabled
              ? " cursor-not-allowed opacity-40 [&::-webkit-slider-thumb]:cursor-not-allowed [&::-moz-range-thumb]:cursor-not-allowed"
              : ""
          }`}
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

/**
 * Which premium tier (if any) the current `maxPrice` selects. A tier is active
 * only in a premium category and only when `maxPrice` sits above the slider's
 * ceiling; an exact match wins, otherwise the nearest tier at or above the
 * value (a hand-typed URL never lands between tiers). `maxPrice` within the
 * slider's range → no tier, the normal handle governs.
 */
function resolveActiveTier(
  maxPrice: number | null,
  sliderMax: number,
  premium: boolean,
): number | null {
  if (!premium || maxPrice == null || maxPrice <= sliderMax) return null;
  const exact = PREMIUM_TIERS.find((tier) => tier === maxPrice);
  if (exact != null) return exact;
  return (
    PREMIUM_TIERS.find((tier) => tier >= maxPrice) ??
    PREMIUM_TIERS[PREMIUM_TIERS.length - 1]
  );
}

function TierCheck({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-brand-400 transition-colors ${
        checked ? "bg-brand-400" : "bg-surface-elevated group-hover:bg-brand-400/20"
      }`}
    >
      {checked && (
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-brand-900">
          <path
            d="M3 8L6.5 11.5L13 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

/**
 * Premium tier track — the fixed $20k / $30k / $40k ceilings strung as
 * checkboxes along a short horizontal connector line, shown below the slider in
 * categories with a luxury tail. Line and boxes are `brand-400` (not the
 * slider's gold accent) so it reads as a separate premium control. Ticking a
 * tier writes its exact value to the shared `maxPrice` param; ticking the
 * active one again — or the track's own reset — hands the ceiling back to the
 * slider's max handle. Single-select: only one tier is ever active.
 */
function PremiumTierTrack({
  activeTier,
  onPick,
  onClear,
}: {
  activeTier: number | null;
  onPick: (value: number) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="type-caption text-brand-400">Premium tier</span>
        <ResetButton
          active={activeTier != null}
          label="Reset premium tier"
          onClick={onClear}
        />
      </div>
      <div className="relative grid grid-cols-3 pt-1">
        {/* Connector line: centre of the first checkbox (1/6) to the last (5/6). */}
        <div className="pointer-events-none absolute left-[16.666%] right-[16.666%] top-[14px] h-0.5 -translate-y-1/2 bg-brand-400" />
        {PREMIUM_TIERS.map((tier) => {
          const checked = activeTier === tier;
          return (
            <button
              key={tier}
              type="button"
              role="checkbox"
              aria-checked={checked}
              aria-label={formatPriceMajor(tier)}
              onClick={() => (checked ? onClear() : onPick(tier))}
              className="group relative flex flex-col items-center gap-1.5 rounded-sm py-0.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
            >
              <TierCheck checked={checked} />
              <span
                className={`type-caption tabular-nums ${
                  checked ? "text-brand-200" : "text-brand-400"
                }`}
              >
                ${tier / 1000}k
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PriceRangeSlider({
  min = 0,
  max = DEFAULT_PRICE_CEILING,
  premium = false,
}: {
  /** Slider bounds in whole dollars — supplied by page composition (F1's
   *  `resolvePriceBounds` at the call site), never computed here. */
  min?: number;
  max?: number;
  /** Category has products priced above the normal slider ceiling: render the
   *  premium tier track below the slider. When a tier is active it overrides the
   *  slider's max handle (frozen + greyed) while the min handle keeps working. */
  premium?: boolean;
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

  const activeTier = resolveActiveTier(maxPrice, max, premium);

  // Last-write-wins: each drag tick reschedules the write, so only the resting
  // value lands in the address bar. The min and max handles write independently
  // so adjusting the minimum never disturbs an active premium tier's `maxPrice`.
  // A handle sitting on its bound clears its param (clean-URL rule).
  const commitMin = useCallback(
    (nextMin: number) => {
      clearTimer();
      timer.current = setTimeout(() => {
        setMinPrice(nextMin <= min ? null : nextMin);
      }, PRICE_WRITE_DEBOUNCE_MS);
    },
    [clearTimer, setMinPrice, min],
  );

  // In a premium category the max handle at its bound still writes `max` (the
  // sub-ceiling cap) rather than clearing the param — so the luxury tail stays
  // excluded once the shopper has engaged the price control, and unticking a
  // tier produces a visible change. Non-premium keeps the clean-URL rule.
  const commitMax = useCallback(
    (nextMax: number) => {
      clearTimer();
      timer.current = setTimeout(() => {
        setMaxPrice(nextMax >= max ? (premium ? max : null) : nextMax);
      }, PRICE_WRITE_DEBOUNCE_MS);
    },
    [clearTimer, setMaxPrice, max, premium],
  );

  const handleMin = useCallback(
    (value: number) => {
      const next = Math.min(value, localMax);
      setLocalMin(next);
      commitMin(next);
    },
    [commitMin, localMax],
  );

  const handleMax = useCallback(
    (value: number) => {
      const next = Math.max(value, localMin);
      setLocalMax(next);
      commitMax(next);
    },
    [commitMax, localMin],
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
        maxValue={activeTier != null ? max : localMax}
        minLabel={formatPriceMajor(localMin)}
        maxLabel={formatPriceMajor(activeTier != null ? activeTier : localMax)}
        onChangeMin={handleMin}
        onChangeMax={handleMax}
        maxDisabled={activeTier != null}
      />

      {premium && (
        <PremiumTierTrack
          activeTier={activeTier}
          onPick={(value) => {
            clearTimer();
            setMaxPrice(value);
          }}
          onClear={() => {
            clearTimer();
            // Hand the ceiling back to the slider's max handle, which rests at
            // the sub-$10k cap — so the result set updates immediately.
            setMaxPrice(max);
          }}
        />
      )}
    </FilterSliderSection>
  );
}
