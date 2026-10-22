// How the facet and price-range reads use Next's Data Cache: served for FACET_REVALIDATE_SECONDS before
// Sanity is asked again, and cleared at once by the tag that app/api/revalidate/route.ts revalidates on
// every publish. 300 s matches the s-maxage in next.config.ts. It is also how stale the "In stock (N)"
// count may get when stock changes without a publish (checkout is unaffected: stock is checked
// atomically, ADR-002). Change the number to change that.

export const FACET_REVALIDATE_SECONDS = 300;

export const CATALOGUE_TAG = 'catalogue-index';

export const CATALOGUE_FETCH_CACHE = { revalidate: FACET_REVALIDATE_SECONDS, tags: [CATALOGUE_TAG] };
