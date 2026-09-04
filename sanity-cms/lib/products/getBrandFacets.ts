import { sanityFetch } from '@/sanity-cms/lib/client';
import { groq } from 'next-sanity';
import { cache } from 'react';

// React cache is only available in React Server Components; skip it in tests.
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn) as T;
  } catch {
    return fn;
  }
};

export interface BrandFacet {
  /** brand slug, emitted verbatim from `slug.current` — the value the URL/grid use. */
  slug: string;
  label: string;
  count: number;
}

/**
 * brand slug -> label, derived from the `brands` facet list, so the F6 chip
 * label and the F5 sidebar checkbox label can never drift. Pure — safe to call
 * from a Server Component (unlike a helper exported from the client sidebar).
 */
export const brandLabelMap = (brands: BrandFacet[]): Record<string, string> =>
  Object.fromEntries(brands.map((b) => [b.slug, b.label]));

export interface GetBrandFacetsOptions {
  /** The route's VFS key set (getAllLeafKeys() / unrollDescendantKeys). */
  keys: string[];
  // A `&&`-prefixed predicate + its named params, built by buildProductQuery
  // WITHOUT the brand branch — so the facet is disjunctive (price / in-stock
  // narrow it, the brand selection itself does not).
  whereClause?: string;
  params?: Record<string, unknown>;
  /** Brand slugs currently ticked in the URL — kept in the list even at count 0. */
  selectedSlugs?: string[];
}

/**
 * Disjunctive brand facet for the catalogue filter sidebar.
 *
 * Lists every brand with >= 1 product in `keys` that also satisfies the applied
 * price / in-stock filters (via `whereClause`), each with that filtered count.
 * A brand the shopper has already ticked stays in the list even if its count is
 * now 0, so it can be unticked. Order: count desc, then label asc.
 *
 * Count-only: one query, no product rows. The per-brand count sub-filter scans
 * the same key set `getProductsCount` already does.
 */
const getBrandFacetsFn = async ({
  keys,
  whereClause = '',
  params = {},
  selectedSlugs = [],
}: GetBrandFacetsOptions): Promise<BrandFacet[]> => {
  if (!keys.length) return [];

  const query = groq`*[_type == "brand" && defined(slug.current)]{
    "slug": slug.current,
    "label": name,
    "count": count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0${whereClause} && ^.slug.current in filterAttributes.brand])
  }`;

  const selected = new Set(selectedSlugs.map((s) => s.toLowerCase()));

  try {
    const rows = (await sanityFetch<BrandFacet[]>({ query, params: { keys, ...params } })) ?? [];

    return rows
      .filter((b) => b.slug && (b.count > 0 || selected.has(b.slug.toLowerCase())))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  } catch (error) {
    console.error(`[getBrandFacets] Failed for ${keys.length} keys:`, error);
    return [];
  }
};

export const getBrandFacets = withCache(getBrandFacetsFn) as (
  options: GetBrandFacetsOptions
) => Promise<BrandFacet[]>;
