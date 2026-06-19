// Server-side search-params loader for the category page.
//
// Kept separate from `filterParams.ts` so the `nuqs/server` import never leaks
// into client bundles. `createLoader` is isomorphic (no React cache), giving a
// single trusted parse of `sort`/`f`/`page` shared with the client contract.
//
// Closes (Phase 1): A3 (type-safe server adapter instead of ad-hoc parsing),
// B12 (server reuses the exact same parsers as the client).

import { createLoader } from "nuqs/server";
import { sortParser, filtersParser, pageParser } from "./filterParams";

/**
 * Parse a category page's search params into `{ sort, f, page }`.
 * Accepts a plain record, URLSearchParams, or a Promise thereof.
 */
export const loadCategorySearchParams = createLoader({
  sort: sortParser,
  f: filtersParser,
  page: pageParser,
});
