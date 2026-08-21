// Product Grid + Server: sort allowlist + filter (`f`) entry parsing.
//
// Trimmed, server-only version of the pre-archival
// product-building-center/filters_archived/lib/catalogue/filterParams.ts —
// only the query-logic pieces the Product Grid + Server actor needs to turn
// URL values into a safe GROQ query. Deliberately NOT isomorphic with client
// hooks/nuqs parsers: this actor never writes the URL, it only reads
// searchParams server-side (see page.tsx), so there is nothing here for a
// client bundle to import.

// ---------------------------------------------------------------------------
// Sort contract
// ---------------------------------------------------------------------------

export interface SortOption {
  /** URL value, e.g. "name:asc" or "featured". */
  value: string;
  /** Human label, kept here so the dropdown and the server never drift. */
  label: string;
  /**
   * Safe, hardcoded GROQ order expression — the text inside `order(...)`.
   * Every value here is a trusted literal from this allowlist, so no raw URL
   * input ever reaches GROQ.
   */
  order: string;
}

export const SORT_DEFAULT = 'featured';

/**
 * The default ("featured") GROQ order expression. Curators raise a product by
 * setting `displayPriority` (higher = earlier); an unset value coalesces to 0.
 * Ties break by newest first, which is deterministic and identical on every
 * request.
 */
export const FEATURED_ORDER = 'coalesce(displayPriority, 0) desc, _createdAt desc';

/**
 * The complete, allow-listed set of sort options for the category page. Only
 * these trusted `order` literals ever reach GROQ.
 */
export const SORT_OPTIONS: readonly SortOption[] = [
  { value: 'featured', label: 'Featured', order: FEATURED_ORDER },
  {
    value: 'price_data.unit_amount:asc',
    label: 'Price: Low to High',
    order: 'price_data.unit_amount asc',
  },
  {
    value: 'price_data.unit_amount:desc',
    label: 'Price: High to Low',
    order: 'price_data.unit_amount desc',
  },
  { value: 'name:asc', label: 'Name: A-Z', order: 'name asc' },
  { value: 'name:desc', label: 'Name: Z-A', order: 'name desc' },
] as const;

const SORT_BY_VALUE: ReadonlyMap<string, SortOption> = new Map(
  SORT_OPTIONS.map((opt) => [opt.value, opt])
);

/**
 * Resolve a (possibly hostile) URL sort value to a SAFE, allow-listed option.
 * Unknown or crafted values fall back to the featured default — raw input is
 * never returned, which is what makes GROQ-order injection impossible.
 */
export function resolveSort(value: string | null | undefined): SortOption {
  return (value && SORT_BY_VALUE.get(value)) || SORT_BY_VALUE.get(SORT_DEFAULT)!;
}

/**
 * Build the GROQ order fragment for a sort value, e.g. "| order(name asc)".
 * Always returns a deterministic, non-empty clause (the featured default for
 * unknown values).
 */
export function buildOrderClause(value: string | null | undefined): string {
  return `| order(${resolveSort(value).order})`;
}

// ---------------------------------------------------------------------------
// Filter (`f`) entry parsing
// ---------------------------------------------------------------------------

/** Single delimiter between filter entries on the wire (?f=brand:Sony,priceRange:min:500). */
const FILTER_DELIMITER = ',';

/** Decode a filter segment, tolerating malformed `%` sequences. */
function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Parse the `f` search param into the `field:value` entry array that
 * FilterBuilder.buildClause expects. Comma-delimited, percent-decoded per
 * entry so a value containing the delimiter round-trips safely.
 */
export function parseFilterParam(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const joined = Array.isArray(raw) ? raw.join(FILTER_DELIMITER) : raw;
  if (!joined) return [];
  return joined
    .split(FILTER_DELIMITER)
    .map(safeDecode)
    .filter((entry) => entry.length > 0);
}
