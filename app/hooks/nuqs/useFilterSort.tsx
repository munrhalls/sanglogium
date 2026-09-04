"use client";

// F1 client helpers layered on the headless contract in
// lib/catalogue/filterSortParams.ts. Headless still applies: no visible control,
// no data access, no import of the grid / product data / counts / streaming.
//
// What this adds on top of the raw parsers:
//   • useFilterParam       — read/write one contract param with the shared URL
//                            options + automatic page reset baked in.
//   • usePageReset         — clear `?page=` (a filter/sort change resets to p.1).
//   • useClearAllFilters   — F6's "Clear all": drop every contract param at once.
//
// Every URL write runs inside React.startTransition — the catalogue navigation
// does not trip `loading.tsx` and the old grid stays visible while the RSC
// re-renders. The control surface never reads a pending / in-flight signal
// (sang-logium-aks): controls write the URL and reflect the URL, nothing more.

import { startTransition, useCallback } from "react";
import { parseAsInteger, useQueryState, useQueryStates } from "nuqs";
import {
  FILTER_SORT_URL_OPTIONS,
  PAGE_PARAM_KEY,
  type SortValue,
  filterSortParsers,
} from "@/lib/catalogue/filterSortParams";

// ─────────────────────────────────────────────────────────────────────────────
// Param read/write
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clear `?page=` back to page 1. A filter/sort change can move a product out of
 * the current page window, so every control calls this alongside its own write.
 * Uses `history: "replace"` so it doesn't add its own Back-stack entry — it
 * rides along with the control's push.
 */
export function usePageReset() {
  const [, setPage] = useQueryState(
    PAGE_PARAM_KEY,
    parseAsInteger.withOptions({ history: "replace", shallow: true, scroll: false }),
  );
  return useCallback(() => setPage(null), [setPage]);
}

/**
 * Read/write a single contract param (`sort`, `minPrice`, `brand`, …) with the
 * shared URL options applied and the page reset wired in. F2–F6 use this so the
 * history mode, shallow flag and page-reset behaviour can never drift between
 * controls.
 *
 * `optionOverrides` lets F3's price control switch to `history: "replace"` for
 * its debounced drag writes.
 *
 * Returns `any` because the set of filter facets is driven by the dynamic
 * facet-map; consumers (F2–F6) cast to their concrete parser types.
 */
export function useFilterParam(
  key: string,
  optionOverrides?: { history?: "push" | "replace" },
): [any, any] {
  const resetPage = usePageReset();

  const parser = (filterSortParsers as Record<string, any>)[key];
  const [value, setValueRaw] = useQueryState(
    key,
    parser.withOptions({
      ...FILTER_SORT_URL_OPTIONS,
      ...optionOverrides,
      startTransition,
    }),
  ) as unknown as [any, any];

  // Accept nuqs's full setter arg — an absolute value OR a functional updater
  // `(prev) => next`. Array facets (brand/category) MUST use the updater form:
  // two checkbox clicks in the same frame both close over the same stale
  // `value`, so passing `[...value, slug]` twice drops the first slug. The
  // updater runs against nuqs's synchronously-maintained internal state, so
  // rapid multi-toggle composes correctly. See spike sang-logium-28t.
  const setValue = useCallback(
    (next: Parameters<typeof setValueRaw>[0]) => {
      startTransition(() => {
        setValueRaw(next);
        resetPage();
      });
    },
    [setValueRaw, resetPage, startTransition],
  );

  return [value, setValue] as [any, any];
}

/**
 * F6's "Clear all": remove every filter/sort param this contract owns in one URL
 * write, then reset the page. Unrelated params (`?q=` from search) survive
 * because nuqs merges rather than replaces the query.
 */
export function useClearAllFilters() {
  const [, setAll] = useQueryStates(filterSortParsers, FILTER_SORT_URL_OPTIONS);
  const resetPage = usePageReset();

  return useCallback(() => {
    startTransition(() => {
      setAll(null);
      resetPage();
    });
  }, [setAll, resetPage, startTransition]);
}
