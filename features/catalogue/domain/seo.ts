type RawQuery = { [key: string]: string | string[] | undefined };

/**
 * A "faceted" listing (page > 1) must not be indexed — only the canonical
 * base category is indexable (A9).
 */
export function isFacetedQuery(query: RawQuery): boolean {
  const page = Array.isArray(query.page) ? query.page[0] : query.page;
  if (page && page !== "1") return true;
  return false;
}

/** Canonical path for a category, ignoring all query facets. */
export function canonicalCategoryPath(slug: string[]): string {
  return `/products/${slug.join("/")}`;
}
