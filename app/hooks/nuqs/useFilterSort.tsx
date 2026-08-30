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
//   • FilterSortPendingProvider / useFilterSortPending — the shared "URL
//     transition in flight" affordance. nuqs 2.8 has no built-in pending flag,
//     so the contract owns one: writes are wrapped in a React transition and
//     V1/V2 read `useFilterSortPending()` to dim / spin the surface.

import {
  createContext,
  startTransition as reactStartTransition,
  useCallback,
  useContext,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from "react";
import { parseAsInteger, useQueryState, useQueryStates } from "nuqs";
import {
  FILTER_SORT_URL_OPTIONS,
  PAGE_PARAM_KEY,
  filterSortParsers,
} from "@/lib/catalogue/filterSortParams";

// ─────────────────────────────────────────────────────────────────────────────
// Shared pending affordance
// ─────────────────────────────────────────────────────────────────────────────

type PendingContextValue = {
  isPending: boolean;
  startTransition: TransitionStartFunction;
};

// Default: no provider → writes still work (plain React.startTransition), the
// surface just never reports "pending".
const FilterSortPendingContext = createContext<PendingContextValue>({
  isPending: false,
  startTransition: reactStartTransition,
});

/**
 * Mount once around the catalogue filter/sort surface (V1/V2). Every control
 * write routed through `useFilterParam` / `useClearAllFilters` is wrapped in
 * this transition, so `useFilterSortPending()` anywhere inside reflects whether
 * a URL update is settling.
 */
export function FilterSortPendingProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return (
    <FilterSortPendingContext.Provider value={{ isPending, startTransition }}>
      {children}
    </FilterSortPendingContext.Provider>
  );
}

/** True while a filter/sort URL update is in flight. Renders the pending UI. */
export function useFilterSortPending(): boolean {
  return useContext(FilterSortPendingContext).isPending;
}

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

type FilterKey = keyof typeof filterSortParsers;

/**
 * Read/write a single contract param (`sort`, `minPrice`, `brand`, …) with the
 * shared URL options applied and the page reset wired in. F2–F6 use this so the
 * history mode, shallow flag and page-reset behaviour can never drift between
 * controls.
 *
 * `optionOverrides` lets F3's price control switch to `history: "replace"` for
 * its debounced drag writes.
 */
export function useFilterParam<K extends FilterKey>(
  key: K,
  optionOverrides?: { history?: "push" | "replace" },
) {
  const { startTransition } = useContext(FilterSortPendingContext);
  const resetPage = usePageReset();

  const [value, setValueRaw] = useQueryState(
    key,
    filterSortParsers[key].withOptions({
      ...FILTER_SORT_URL_OPTIONS,
      ...optionOverrides,
      startTransition,
    }),
  );

  const setValue = useCallback(
    (next: typeof value) => {
      startTransition(() => {
        setValueRaw(next);
        resetPage();
      });
    },
    [setValueRaw, resetPage, startTransition],
  );

  return [value, setValue] as const;
}

/**
 * F6's "Clear all": remove every filter/sort param this contract owns in one URL
 * write, then reset the page. Unrelated params (`?q=` from search) survive
 * because nuqs merges rather than replaces the query.
 */
export function useClearAllFilters() {
  const { startTransition } = useContext(FilterSortPendingContext);
  const [, setAll] = useQueryStates(filterSortParsers, FILTER_SORT_URL_OPTIONS);
  const resetPage = usePageReset();

  return useCallback(() => {
    startTransition(() => {
      setAll(null);
      resetPage();
    });
  }, [setAll, resetPage, startTransition]);
}
