"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFilterParam } from "@/features/product-filtering/state/useFilterParam";
import {
  DEFAULT_PRICE_CEILING,
  PREMIUM_TIERS,
  PREMIUM_TIER_MIN,
} from "@/features/product-filtering/core/rules/priceBounds";
import { formatPriceMajor } from "@/platform/utils/price";
import { FilterSliderSection, ResetButton } from "./FilterSection";
import { DualRangeSlider } from "./DualRangeSlider";

/**
 * F3: `PriceRangeSlider` is the URL-wired control. Its only job is (a) on
 * interaction, write the correct value to F1's `minPrice` / `maxPrice` params
 * (whole dollars, debounced, `history:"replace"`); (b) on any URL change —
 * first load, deep link, Back/Forward — render its handles to match. It never
 * queries product data or result counts; the slider's `min` / `max` bounds
 * arrive as props from page composition. The shared filter-slider look lives
 * in `./FilterSection` and `./DualRangeSlider`.
 */

/** ms to wait after the last drag tick before the resting value hits the URL. */
const PRICE_WRITE_DEBOUNCE_MS = 300;

/** Coerce a raw URL value to a usable handle position: null / non-numeric →
 *  `fallback`; out-of-range → clamped to `[min, max]`. */
function clampToBounds(
  value: number | null,
  min: number,
  max: number,
  fallback: number,
): number {
  if (value == null || Number.isNaN(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

/** Which premium tier (if any) `maxPrice` selects: active only in a premium
 *  category with `maxPrice` above the ceiling; exact match wins, else nearest
 *  tier at or above. Within slider range → no tier. */
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

  const activeTier = resolveActiveTier(maxPrice, max, premium);

  // URL → handle positions. Clamp to bounds, and enforce min ≤ max on read so a
  // crossed / swapped URL still renders sanely. With a premium tier active the
  // ceiling is the tier, not the (below-cap) `maxPrice` value — the slider's own
  // max handle is frozen at its bound, so treat `max` as the top for ordering.
  const urlMin = clampToBounds(minPrice, min, max, min);
  const urlMax = activeTier != null ? max : clampToBounds(maxPrice, min, max, max);
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

  // The premium floor, kept inside the category's own bounds.
  const premiumFloor = Math.min(Math.max(PREMIUM_TIER_MIN, min), max);

  // The minimum to restore when the premium tier is cleared. `undefined` means
  // "nothing to restore" — either no tier is active, or the shopper has since
  // dragged the min handle themselves and now owns it.
  const restoreMinRef = useRef<number | null | undefined>(undefined);

  // Snap the minimum up to the premium floor once per activation — on tick
  // (below) or, here, when a tier arrives via deep link / Back-Forward. The ref
  // gate keeps this a one-time snap, never a live floor: once snapped the
  // shopper can still drag the minimum anywhere, even below the floor.
  const tierSnappedRef = useRef(false);
  useEffect(() => {
    if (activeTier == null) {
      tierSnappedRef.current = false;
      return;
    }
    if (tierSnappedRef.current) return;
    tierSnappedRef.current = true;
    if (minPrice == null || minPrice < premiumFloor) {
      restoreMinRef.current = minPrice;
      setMinPrice(premiumFloor);
    }
  }, [activeTier, minPrice, premiumFloor, setMinPrice]);

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
      // The shopper is now driving the minimum — drop any remembered pre-tier
      // value so clearing the tier leaves their choice in place.
      restoreMinRef.current = undefined;
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
        // `tierSnappedRef` is reset by the effect once `activeTier` clears —
        // doing it here would race the pending `maxPrice` write and re-snap.
        restoreMinRef.current = undefined;
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
            if (activeTier == null) {
              // Entering premium mode from the normal slider: remember the
              // current minimum, then snap it up to the premium floor.
              restoreMinRef.current = minPrice;
              tierSnappedRef.current = true;
              if (minPrice == null || minPrice < premiumFloor) {
                setMinPrice(premiumFloor);
              }
            }
            // Tier → tier switch leaves the minimum untouched.
            setMaxPrice(value);
          }}
          onClear={() => {
            clearTimer();
            // Hand the ceiling back to the slider's max handle, which rests at
            // the sub-$10k cap — so the result set updates immediately.
            setMaxPrice(max);
            // Restore the minimum that was in force before the tier, unless the
            // shopper has since taken it over (ref cleared by handleMin).
            if (restoreMinRef.current !== undefined) {
              setMinPrice(restoreMinRef.current);
              restoreMinRef.current = undefined;
            }
            // `tierSnappedRef` clears in the effect when `activeTier` goes null;
            // clearing it here would race the pending `maxPrice` write.
          }}
        />
      )}
    </FilterSliderSection>
  );
}
