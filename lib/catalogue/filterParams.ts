// Catalogue Filter & Sort Param Contract
//
// Single source of truth for the category page's URL state (`sort`, `f`, `page`),
// shared by the client hook (`useFilterNuqs`) and the server (`page.tsx`,
// `getProductsByVfsKeys`). This module is ISOMORPHIC: it imports only from
// `nuqs` (never `nuqs/server`) so it is safe in both client and server bundles.
//
// Closes (Phase 1): A6 (shared sort config), B1 (sort allowlist — no raw GROQ
// interpolation), B4 (comma-safe filter encoding), B12 (one parser everywhere).
// Closes (Phase 4): A2 (deterministic, curatable "featured" order via T4.2).

import { createParser, parseAsString, parseAsInteger } from "nuqs";

// ---------------------------------------------------------------------------
// Sort contract
// ---------------------------------------------------------------------------

export interface SortOption {
  /** URL value, e.g. "name:asc" or "featured". */
  value: string;
  /** Human label for the dropdown. */
  label: string;
  /**
   * Safe, hardcoded GROQ order expression — the text inside `order(...)`.
   * Every value here is a trusted literal from this allowlist, so no raw URL
   * input ever reaches GROQ (B1). `featured` uses a compound, deterministic
   * expression so the default listing is stable and curatable (A2 / T4.2).
   */
  order: string;
}

export const SORT_DEFAULT = "featured";

/**
 * The default ("featured") GROQ order expression. Curators raise a product by
 * setting `displayPriority` (higher = earlier); an unset value is coalesced to
 * 0 so the feature is correct before any backfill runs. Ties break by newest
 * first (`_createdAt desc`), which is fully deterministic and identical on SSR
 * and CSR (A2 / T4.2).
 */
export const FEATURED_ORDER = "coalesce(displayPriority, 0) desc, _createdAt desc";

/**
 * Default page size for the catalogue grid. Categories at or below this size
 * render as a single page (no pagination UI); larger categories paginate.
 * Shared by the server query default and the client's totalPages computation.
 */
export const DEFAULT_PER_PAGE = 100;

/**
 * The complete, allow-listed set of sort options. The dropdown renders from
 * this list and the server resolves order clauses from it — so UI and query
 * can never drift, and only these trusted `order` literals ever reach GROQ.
 */
export const SORT_OPTIONS: readonly SortOption[] = [
  { value: "featured", label: "Featured", order: FEATURED_ORDER },
  {
    value: "price_data.unit_amount:asc",
    label: "Price: Low to High",
    order: "price_data.unit_amount asc",
  },
  {
    value: "price_data.unit_amount:desc",
    label: "Price: High to Low",
    order: "price_data.unit_amount desc",
  },
  { value: "name:asc", label: "Name: A-Z", order: "name asc" },
  { value: "name:desc", label: "Name: Z-A", order: "name desc" },
] as const;

const SORT_BY_VALUE: ReadonlyMap<string, SortOption> = new Map(
  SORT_OPTIONS.map((opt) => [opt.value, opt])
);

/**
 * Resolve a (possibly hostile) URL sort value to a SAFE, allow-listed option.
 * Unknown or crafted values fall back to the featured default — raw input is
 * never returned, which is what makes GROQ-order injection impossible (B1).
 */
export function resolveSort(value: string | null | undefined): SortOption {
  return (value && SORT_BY_VALUE.get(value)) || SORT_BY_VALUE.get(SORT_DEFAULT)!;
}

/**
 * Build the GROQ order fragment for a sort value, e.g. "| order(name asc)".
 * Always returns a deterministic, non-empty clause (the featured default for
 * unknown values). Only the hardcoded `order` literals from SORT_OPTIONS can
 * appear here, so raw input is never interpolated (B1).
 */
export function buildOrderClause(value: string | null | undefined): string {
  return `| order(${resolveSort(value).order})`;
}

// ---------------------------------------------------------------------------
// Filter (`f`) contract
// ---------------------------------------------------------------------------

/** Single delimiter between filter entries on the wire. */
const FILTER_DELIMITER = ",";

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
  const i = entry.indexOf(":");
  if (i === -1) return null;
  const field = entry.slice(0, i);
  const value = entry.slice(i + 1);
  if (!field || !value) return null;
  return { field, value };
}

/**
 * Custom nuqs parser for the `f` array param. Each entry is percent-encoded
 * before joining, so a value containing the delimiter (or a colon) round-trips
 * safely (B4). Legacy unencoded comma-joined values still parse correctly,
 * because `decodeURIComponent` is a no-op on un-escaped text.
 */
export const filtersParser = createParser({
  parse(query: string): string[] {
    if (!query) return [];
    return query
      .split(FILTER_DELIMITER)
      .map(safeDecode)
      .filter((entry) => entry.length > 0);
  },
  serialize(value: string[]): string {
    return (value ?? []).map(encodeURIComponent).join(FILTER_DELIMITER);
  },
  // Array-aware equality so `clearOnDefault` strips `?f=` when empty and nuqs
  // can detect no-op updates (the default `===` would treat every array as
  // unequal by reference).
  eq(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((value, index) => value === b[index]);
  },
}).withDefault([] as string[]);

/**
 * Count the number of LOGICAL active filters from raw `f` entries, independent
 * of wire encoding (A8). A price range (min + max) collapses to a single
 * active filter; every other field counts once per entry.
 */
export function countActiveFilters(entries: string[]): number {
  let count = 0;
  let countedPriceRange = false;
  for (const entry of entries) {
    const parsed = parseFilterEntry(entry);
    if (!parsed) continue;
    if (parsed.field === "priceRange") {
      if (!countedPriceRange) {
        count += 1;
        countedPriceRange = true;
      }
    } else {
      count += 1;
    }
  }
  return count;
}

// ---------------------------------------------------------------------------
// Shared nuqs parsers (consumed by client hook + server loader)
// ---------------------------------------------------------------------------

/** `?sort=` parser, defaulting to the featured ordering. */
export const sortParser = parseAsString.withDefault(SORT_DEFAULT);

/** `?page=` parser as a 1-based integer. */
export const pageParser = parseAsInteger.withDefault(1);
