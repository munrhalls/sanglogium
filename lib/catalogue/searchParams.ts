// Server-side search-params loader for the category page.
//
// Kept separate from `filterParams.ts` so the `nuqs/server` import never leaks
// into client bundles. `createLoader` is isomorphic (no React cache), giving a
// single trusted parse of `sort`/`f`/`page` shared with the client contract.
//
// Closes (Phase 1): A3 (type-safe server adapter instead of ad-hoc parsing),
// B12 (server reuses the exact same parsers as the client).

import { createLoader, parseAsString } from "nuqs/server";
import {
  sortParser,
  filtersParser,
  pageParser,
  searchSortParser,
} from "./filterParams";

/**
 * Parse a category page's search params into `{ sort, f, page }`.
 * Accepts a plain record, URLSearchParams, or a Promise thereof.
 */
export const loadCategorySearchParams = createLoader({
  sort: sortParser,
  f: filtersParser,
  page: pageParser,
});

/**
 * Search page's `?q=` parser (any string; empty default keeps bare `/search`
 * URLs clean).
 */
export const searchQParser = parseAsString.withDefault("");

/**
 * Parse the search page's search params into `{ q, sort, page }` using the
 * SAME parsers the client consumes (nuqs `searchSortParser`, shared `pageParser`)
 * — one trusted parse, no client↔server drift (G3).
 */
export const loadSearchSearchParams = createLoader({
  q: searchQParser,
  sort: searchSortParser,
  page: pageParser,
});

