'use client';

// POC-local mirror of app/hooks/nuqs/useFilterSort.tsx, re-pointed at this
// page's local filterSortParsers. Headless: no visible control, no data
// access, no import of the grid / product data / counts / streaming — the
// contract every Slice-1 control (checkboxes, sliders, sort, chips) reads and
// writes through, so the URL vocabulary can never drift between them.
//
// Every write runs inside React.startTransition, exactly like production:
// the navigation re-renders the page RSC with the new searchParams without
// tripping loading.tsx, so the sidebar stays mounted and interaction never
// waits on the product fetch — this is what makes "always instant" true
// regardless of how long filtering the dataset takes.

import { startTransition, useCallback } from 'react';
import { useQueryState, useQueryStates } from 'nuqs';
import { FILTER_SORT_URL_OPTIONS, filterSortParsers } from './filterSortParams';

/**
 * Read/write a single contract param with the shared URL options applied.
 * Returns `any` because the facet set is data-driven (facetConfig.ts) —
 * callers cast to the concrete type they expect (string[], boolean, number).
 */
export function useFilterParam(
  key: string,
  optionOverrides?: { history?: 'push' | 'replace' },
): [any, any] {
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
  // `(prev) => next`. Array facets MUST use the updater form: two checkbox
  // clicks in the same frame both close over the same stale `value`, so
  // passing `[...value, slug]` twice drops the first slug (sang-logium-28t).
  const setValue = useCallback(
    (next: Parameters<typeof setValueRaw>[0]) => {
      startTransition(() => {
        setValueRaw(next);
      });
    },
    [setValueRaw],
  );

  return [value, setValue] as [any, any];
}

/** F6-equivalent "Clear all": drop every filter/sort param this contract owns
 *  in one URL write. Unrelated params are untouched (nuqs merges). */
export function useClearAllFilters() {
  const [, setAll] = useQueryStates(filterSortParsers, FILTER_SORT_URL_OPTIONS);

  return useCallback(() => {
    startTransition(() => {
      setAll(null);
    });
  }, [setAll]);
}
