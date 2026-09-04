import { centsToDisplay } from "@/lib/utils/price";

/** Fallback display ceiling (dollars) when a category has no derivable max price. */
export const DEFAULT_PRICE_CEILING = 1000;

/**
 * Ceiling (dollars) of the normal draggable price slider. When a category has
 * products priced above this, the slider scale is spent entirely on the
 * sub-$10k range where products actually cluster; the luxury tail above is
 * reached through the fixed premium tier checkboxes instead.
 */
export const NORMAL_PRICE_CEILING = 10_000;

/**
 * Fixed premium tier ceilings (dollars), in $10k increments. Rendered as a
 * single-select row of checkboxes strung along a short connector line below the
 * slider, and only when a category has products priced above
 * `NORMAL_PRICE_CEILING`. Ticking one writes that exact value to the shared
 * `maxPrice` URL param — inclusive ("up to $40,000"), never "and up".
 */
export const PREMIUM_TIERS = [20_000, 30_000, 40_000] as const;

/**
 * When a premium tier is selected, the price minimum snaps up to this floor
 * (dollars) — a shopper reaching for $20k+ gear is not also looking at $50
 * cables. Clearing the tier restores whatever minimum was in force before.
 */
export const PREMIUM_TIER_MIN = 4_000;

export interface PriceRangeData {
  minPrice: number | null; // cents
  maxPrice: number | null; // cents
  /** Every product price in the category, cents, unsorted. Optional: absent
   *  (or empty) simply means "no distribution known". */
  prices?: number[];
}

/** Slider display bounds in whole-ish dollars, as consumed by PriceRangeSlider. */
export interface PriceBounds {
  min: number;
  max: number;
  /** True when the category has products priced above `NORMAL_PRICE_CEILING`:
   *  the slider is capped at `max` (≤ the ceiling) and the premium tier track
   *  is shown so the luxury tail stays selectable. */
  premium: boolean;
}

/**
 * Resolve slider display bounds (dollars) from category price data. Uses
 * `!= null` checks so a legitimate 0 bound is honored (B6), and derives the
 * max from real data instead of a hardcoded ceiling.
 *
 * When the category's priciest product sits above `NORMAL_PRICE_CEILING`, the
 * returned `max` is capped at the highest product price still under that
 * ceiling (so the slider width covers where products cluster) and `premium` is
 * set. The premium tier checkboxes then own the range above the cap.
 */
export function resolvePriceBounds(data?: PriceRangeData): PriceBounds {
  const min = data?.minPrice != null ? centsToDisplay(data.minPrice) : 0;
  const trueMax =
    data?.maxPrice != null ? centsToDisplay(data.maxPrice) : DEFAULT_PRICE_CEILING;

  if (trueMax <= NORMAL_PRICE_CEILING) {
    return { min, max: trueMax, premium: false };
  }

  const underCeiling = (data?.prices ?? [])
    .map(centsToDisplay)
    .filter((price) => price < NORMAL_PRICE_CEILING);
  const cappedMax = underCeiling.length
    ? Math.max(...underCeiling)
    : NORMAL_PRICE_CEILING;

  return { min, max: Math.max(cappedMax, min), premium: true };
}
