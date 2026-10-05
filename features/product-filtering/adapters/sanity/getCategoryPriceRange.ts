import "server-only";
import { sanityFetch } from '@/platform/db/client';
import { groq } from 'next-sanity';
import type { PriceRangeData } from '@/features/product-filtering/core/rules/priceBounds';
import type { PriceRangeSource } from '@/features/product-filtering/core/ports';

/**
 * Raw min / max product price (in CENTS) across a catalogue category — the
 * FULL category span, deliberately not narrowed by active filters. `prices`
 * is the bare list of unit amounts so resolvePriceBounds can tell a far
 * top-end outlier from a genuinely wide category. Throws on a failed fetch —
 * the safe-null decision lives in queries/getCategoryPriceRange.
 */
export const fetchCategoryPriceRange: PriceRangeSource = async ({ keys }) => {
  const query = groq`{
    "minPrice": math::min(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0].price_data.unit_amount),
    "maxPrice": math::max(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0].price_data.unit_amount),
    "prices": *[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0].price_data.unit_amount
  }`;

  return sanityFetch<PriceRangeData | null>({ query, params: { keys } });
};
