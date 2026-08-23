// Catalogue sort & filter param contract (server-side only)
//
// Trimmed from the archived `filterParams.ts`: just the category page's sort
// allowlist and the `f` filter-array parsing. Deliberately has NO nuqs parsers
// and NO client hooks — this module is consumed only by server code in the
// Product Grid actor, which reads the URL and never writes it.
//
// Why an allowlist: raw `?sort=` input must never reach GROQ's `order(...)`.
// Every order expression here is a trusted hardcoded literal, so a crafted
// sort value can only ever fall back to the default.

export interface SortOption {
  /** URL value, e.g. "name:asc" or "featured". */
  value: string;
  /** Human label (kept so a future UI can render from this same list). */
  label: string;
  /** Safe, hardcoded GROQ order expression — the text inside `order(...)`. */
  order: string;
}

export const SORT_DEFAULT = 'featured';

/**
 * The default ("featured") GROQ order expression. Curators raise a product by
 * setting `displayPriority` (higher = earlier); an unset value coalesces to 0.
 * Ties break by newest first, which keeps the default listing deterministic.
 */
export const FEATURED_ORDER = 'coalesce(displayPriority, 0) desc, _createdAt desc';

/** The complete, allow-listed set of category-page sort options. */
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
 * unknown values). Only hardcoded `order` literals can ever appear here.
 */
export function buildOrderClause(value: string | null | undefined): string {
  return `| order(${resolveSort(value).order})`;
}

// ---------------------------------------------------------------------------
// Filter (`f`) contract
// ---------------------------------------------------------------------------

/** Single delimiter between filter entries on the wire. */
const FILTER_DELIMITER = ',';

export interface ParsedFilter {
  field: string;
  value: string;
}

/** Decode a filter segment, tolerating malformed `%` sequences. */
function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Parse one `field:value` entry, splitting on the FIRST colon so compound
 * values (e.g. "priceRange:min:5000") keep their colons. Returns null when the
 * field or value is missing.
 */
export function parseFilterEntry(entry: string): ParsedFilter | null {
  const i = entry.indexOf(':');
  if (i === -1) return null;
  const field = entry.slice(0, i);
  const value = entry.slice(i + 1);
  if (!field || !value) return null;
  return { field, value };
}

/**
 * Parse the raw `?f=` param into the `field:value` entry array that
 * `FilterBuilder.buildClause` consumes. Entries are percent-decoded (so a
 * value containing the delimiter round-trips) and any malformed entry is
 * dropped here rather than being handed to the query builder.
 */
export function parseFilterParam(raw: string | string[] | undefined | null): string[] {
  if (!raw) return [];
  const segments = Array.isArray(raw) ? raw : raw.split(FILTER_DELIMITER);
  return segments
    .map(safeDecode)
    .filter((entry) => parseFilterEntry(entry) !== null);
}
