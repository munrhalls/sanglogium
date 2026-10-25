"use client";

// F1 client helpers layered on the headless contract in
// the product-filtering feature's url/filterSortParams.ts. Headless still applies: no visible control,
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

import { startTransition, useCallback, useMemo } from "react";
import { parseAsInteger, useQueryState, useQueryStates } from "nuqs";
import {
  FILTER_SORT_URL_OPTIONS,
  PAGE_PARAM_KEY,
  type SortValue,
  facetSignature,
  filterParsersFor,
  filterSortParsers,
  parserForControl,
} from "@/features/product-filtering/url/filterSortParams";
import type {
  FacetControl,
  FacetSet,
} from "@/features/product-filtering/core/types/facetProjection";

// ─────────────────────────────────────────────────────────────────────────────
// Param read/write
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clear `?page=` back to page 1. A filter/sort change can move a product out of
 * the current page window, so every control calls this alongside its own write.
 * Uses `history: "replace"` so it doesn't add its own Back-stack entry — it
 * rides along with the control's push.
 */
function usePageReset() {
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
 * `options.history` lets F3's price control switch to `history: "replace"` for
 * its debounced drag writes. `options.control` picks the parser for a facet
 * param — the control the product data gave the facet decides its URL kind.
 *
 * Returns `any` because the set of filter facets is driven by the dynamic
 * facet set; consumers (F2–F6) cast to their concrete parser types.
 */
export function useFilterParam(
  key: string,
  options?: { history?: "push" | "replace"; control?: FacetControl },
): [any, any] {
  const resetPage = usePageReset();

  const parser = options?.control
    ? parserForControl(options.control)
    : (filterSortParsers as Record<string, any>)[key];
  const [value, setValueRaw] = useQueryState(
    key,
    parser.withOptions({
      ...FILTER_SORT_URL_OPTIONS,
      history: options?.history ?? FILTER_SORT_URL_OPTIONS.history,
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
 * write, then reset the page. With a facet set, that set's own keys are cleared
 * too. Unrelated params (`?q=` from search) survive because nuqs merges rather
 * than replaces the query.
 */
export function useClearAllFilters(facetSet?: FacetSet) {
  const signature = facetSet ? facetSignature(facetSet) : '';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const parsers = useMemo(() => (facetSet ? filterParsersFor(facetSet) : filterSortParsers), [signature]);
  const [, setAll] = useQueryStates(parsers, FILTER_SORT_URL_OPTIONS);
  const resetPage = usePageReset();

  return useCallback(() => {
    startTransition(() => {
      setAll(null);
      resetPage();
    });
  }, [setAll, resetPage, startTransition]);
}
