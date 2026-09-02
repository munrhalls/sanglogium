import { sanityFetch } from '@/sanity-cms/lib/client';
import { groq } from 'next-sanity';
import { cache } from 'react';
import type { PriceRangeData } from '@/lib/catalogue/priceBounds';

// React cache is only available in React Server Components; skip it in tests.
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn) as T;
  } catch {
    return fn;
  }
};

export interface GetCategoryPriceRangeOptions {
  /** The route's VFS key set (getAllLeafKeys() / unrollDescendantKeys). */
  keys: string[];
}

/**
 * Full min / max product price (in CENTS) across a catalogue category.
 *
 * Feeds the price slider's draggable bounds via `resolvePriceBounds`. The range
 * is the FULL category span — deliberately NOT narrowed by the active
 * price / brand / in-stock filters, so the shopper can always drag the max
 * handle back up past the current selection. `keys` only, no `whereClause`.
 *
 * Count-only shape, mirroring `getBrandFacets` / `getProductsCount`: one groq
 * query, no product rows, `withCache` wrapper, try/catch → safe null range.
 * `price_data.unit_amount` is cents; converting to display dollars is
 * `resolvePriceBounds`'s job (`centsToDisplay`) — this helper never divides by 100.
 */
const getCategoryPriceRangeFn = async ({ keys }: GetCategoryPriceRangeOptions): Promise<PriceRangeData> => {
  if (!keys.length) return { minPrice: null, maxPrice: null };

  const query = groq`{
    "minPrice": math::min(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0].price_data.unit_amount),
    "maxPrice": math::max(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0].price_data.unit_amount)
  }`;

  try {
    const result = await sanityFetch<PriceRangeData | null>({ query, params: { keys } });
    return {
      minPrice: result?.minPrice ?? null,
      maxPrice: result?.maxPrice ?? null,
    };
  } catch (error) {
    console.error(`[getCategoryPriceRange] Failed for ${keys.length} keys:`, error);
    return { minPrice: null, maxPrice: null };
  }
};

export const getCategoryPriceRange = withCache(getCategoryPriceRangeFn) as (
  options: GetCategoryPriceRangeOptions
) => Promise<PriceRangeData>;
