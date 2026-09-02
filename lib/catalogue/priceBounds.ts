import { centsToDisplay } from "@/lib/utils/price";

/** Fallback display ceiling (dollars) when a category has no derivable max price. */
export const DEFAULT_PRICE_CEILING = 1000;

export interface PriceRangeData {
  minPrice: number | null; // cents
  maxPrice: number | null; // cents
}

/** Slider display bounds in whole-ish dollars, as consumed by PriceRangeSlider. */
export interface PriceBounds {
  min: number;
  max: number;
}

/**
 * Resolve slider display bounds (dollars) from category price data. Uses
 * `!= null` checks so a legitimate 0 bound is honored (B6), and derives the
 * max from real data instead of a hardcoded ceiling.
 */
export function resolvePriceBounds(data?: PriceRangeData): PriceBounds {
  const min = data?.minPrice != null ? centsToDisplay(data.minPrice) : 0;
  const max = data?.maxPrice != null ? centsToDisplay(data.maxPrice) : DEFAULT_PRICE_CEILING;
  return { min, max };
}
