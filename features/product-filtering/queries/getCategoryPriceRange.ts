// Read use case: full-span category price range (cents) for the price slider.
// Takes its port as the first parameter; the Sanity fetch lives in
// adapters/sanity/. Feeds resolvePriceBounds, which owns the cents->dollars
// conversion — this never divides by 100.

import type { PriceRangeData } from '@/features/product-filtering/core/rules/priceBounds';
import type { PriceRangeSource } from '@/features/product-filtering/core/ports';

export interface GetCategoryPriceRangeOptions {
  /** The route's VFS key set (getAllLeafKeys() / unrollDescendantKeys). */
  keys: string[];
}

export async function getCategoryPriceRange(
  fetchRange: PriceRangeSource,
  { keys }: GetCategoryPriceRangeOptions,
): Promise<PriceRangeData> {
  if (!keys.length) return { minPrice: null, maxPrice: null, prices: [] };

  try {
    const result = await fetchRange({ keys });
    return {
      minPrice: result?.minPrice ?? null,
      maxPrice: result?.maxPrice ?? null,
      prices: (result?.prices ?? []).filter(
        (price): price is number => typeof price === 'number',
      ),
    };
  } catch (error) {
    console.error(`[getCategoryPriceRange] Failed for ${keys.length} keys:`, error);
    return { minPrice: null, maxPrice: null, prices: [] };
  }
}
