type RawQuery = { [key: string]: string | string[] | undefined };

/**
 * A "faceted" listing (any filter, non-default sort, or page > 1) must not be
 * indexed — only the canonical base category is indexable (A9).
 */
export function isFacetedQuery(query: RawQuery): boolean {
  if (query.f) return true;
  if (query.sort) return true;
  const page = Array.isArray(query.page) ? query.page[0] : query.page;
  if (page && page !== "1") return true;
  return false;
}

/** Canonical path for a category, ignoring all query facets. */
export function canonicalCategoryPath(slug: string[]): string {
  return `/products/${slug.join("/")}`;
}
