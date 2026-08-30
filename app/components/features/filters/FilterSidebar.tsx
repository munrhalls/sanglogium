"use client";

import React, { useState } from 'react';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { useFilterParam, useFilterSortPending } from '@/app/hooks/nuqs/useFilterSort';
import { cn } from '@/lib/utils/tailwind';
import { PriceRangeSlider } from './PriceRangeSlider';

/**
 * Shared filter-section pattern.
 *
 * These are the section-header primitives every filter control shares — the
 * collapsible checkbox groups below and PriceRangeSlider. Controls import
 * these rather than restyling their own gold overline label, header row, or
 * active/inactive state colours.
 */
export const filterSectionHeaderRow = 'flex w-full items-center justify-between gap-2';
export const filterSectionHeaderLabel = 'type-overline transition-colors';
export const filterSectionHeaderAction = 'type-caption transition-colors';

/** Active = gold and interactive. Inactive = grey, dimmed, reads as "off". */
export const filterStateActive = 'text-text-accent';
export const filterStateInactive = 'text-text-caption opacity-50';

/**
 * Desktop filter sidebar shell.
 *
 * Option lists and counts are hardcoded placeholders standing in for props that
 * page composition will supply. The checkbox facet groups and `InStockOnlyCheckbox`
 * read/write their F1 URL params (via `useFilterParam`); local useState is only
 * cosmetic (collapse/expand). Nothing here fetches data or touches the product grid.
 */

const BRAND_OPTIONS = [
  { value: 'sennheiser', label: 'Sennheiser', count: 24 },
  { value: 'audio-technica', label: 'Audio-Technica', count: 18 },
  { value: 'beyerdynamic', label: 'Beyerdynamic', count: 11 },
  { value: 'focal', label: 'Focal', count: 6 },
  { value: 'hifiman', label: 'HiFiMan', count: 0 },
];

const CATEGORY_OPTIONS = [
  { value: 'over-ear', label: 'Over-ear', count: 41 },
  { value: 'on-ear', label: 'On-ear', count: 27 },
  { value: 'in-ear', label: 'In-ear', count: 19 },
];

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

const toLabelMap = (options: FilterOption[]): Record<string, string> =>
  Object.fromEntries(options.map((o) => [o.value, o.label]));

/**
 * value -> label maps for the checkbox facets, shared with F6's chip row so the
 * chip label and the sidebar checkbox label can never drift. Same placeholder
 * lists; page composition will eventually supply both from one source.
 */
export const BRAND_LABELS = toLabelMap(BRAND_OPTIONS);
export const CATEGORY_LABELS = toLabelMap(CATEGORY_OPTIONS);

/** The F1 array-param keys that map to a checkbox facet group. */
type FacetParamKey = 'brand' | 'category';

interface CheckboxFilterGroupProps {
  /** F1 array param this group reads & writes. Also the checkbox `name`. */
  paramKey: FacetParamKey;
  label: string;
  options: FilterOption[];
}

/**
 * F5 — one reusable checkbox facet group, bound to a single F1 array param.
 *
 * SRP: (a) on tick, write the group's value set to its F1 param via nuqs;
 * (b) on any URL change (first load, deep link, Back/Forward), render its own
 * ticked state to match the param. It never imports, queries, or reacts to the
 * product grid, product data, result counts, or streaming — `options` and their
 * `count`s are props supplied by page composition.
 *
 * The param key, array delimiter, history mode, shallow flag and page-reset all
 * come from F1 via `useFilterParam`; there is zero bespoke URL-string handling
 * here. Canonical value order is the order `options` are declared in, so the URL
 * is stable regardless of click order. Unknown or duplicate values present in
 * the URL are ignored for display and dropped on the next write ("normalise on
 * next change").
 */
function CheckboxFilterGroup({ paramKey, label, options }: CheckboxFilterGroupProps) {
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useFilterParam(paramKey) as unknown as [string[], (v: string[] | ((prev: string[]) => string[])) => void];

  const order = new Map(options.map((option, index) => [option.value, index]));
  const selectedArray = selected ?? [];

  // For brand field, use case-insensitive comparison; for all others, use exact match
  const isFilterActive = (value: string): boolean => {
    if (paramKey === 'brand') {
      return selectedArray.some((s) => s.toLowerCase() === value.toLowerCase());
    }
    return selectedArray.includes(value);
  };

  const canonicalize = (values: string[]) =>
    Array.from(new Set(values.filter((value) => order.has(value)))).sort(
      (a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0),
    );

  const toggle = (value: string) => {
    // Functional updater, not `[...selectedArray, value]`: `selected` is stale
    // between renders, so two fast clicks would otherwise drop the first.
    setSelected((prev) => {
      const prevArray = prev ?? [];
      const active =
        paramKey === 'brand'
          ? prevArray.some((s) => s.toLowerCase() === value.toLowerCase())
          : prevArray.includes(value);
      // An empty set serializes to the key being absent (F1 clean-URL rule).
      return active
        ? canonicalize(prevArray).filter((v) => v.toLowerCase() !== value.toLowerCase())
        : canonicalize([...prevArray, value]);
    });
  };

  const name = paramKey;

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        className={`${filterSectionHeaderRow} group/header`}
      >
        <span className={`${filterSectionHeaderLabel} group-hover/header:text-text-primary`}>
          {label}
        </span>
        <span
          aria-hidden="true"
          className={`${filterSectionHeaderAction} ${filterStateActive} group-hover/header:text-text-primary`}
        >
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-2">
          {options.map((option) => (
            <Checkbox
              key={option.value}
              name={name}
              value={option.value}
              label={option.label}
              count={option.count}
              checked={isFilterActive(option.value)}
              disabled={option.count === 0 && !isFilterActive(option.value)}
              onChange={() => toggle(option.value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * F4 — the only responsibility here: on tick, write the F1 `inStock` boolean to
 * the URL; on any URL change (deep link, Back/Forward), render to match it.
 * Knows nothing about the grid, product data, counts, or streaming. The param
 * key/value, default, junk handling, history mode and page-reset all come from
 * F1 via `useFilterParam` — no bespoke URL handling here.
 */
function InStockOnlyCheckbox() {
  const [inStock, setInStock] = useFilterParam('inStock') as unknown as [boolean, (v: boolean | ((prev: boolean) => boolean)) => void];

  return (
    <Checkbox
      name="in-stock"
      value="in-stock"
      label="In stock only"
      checked={inStock}
      onChange={() => setInStock((prev) => !prev)}
    />
  );
}

/**
 * The stack of filter controls, with no wrapper chrome of its own. Shared
 * verbatim between the desktop sidebar and the mobile filter drawer so both
 * surfaces stay identical. Returned as a fragment so callers own the layout
 * container (and the desktop markup below is unchanged).
 */
export function FilterControls() {
  return (
    <>
      <PriceRangeSlider />
      <InStockOnlyCheckbox />
      <CheckboxFilterGroup paramKey="brand" label="Brand" options={BRAND_OPTIONS} />
      <CheckboxFilterGroup paramKey="category" label="Category" options={CATEGORY_OPTIONS} />
    </>
  );
}

export function FilterSidebar() {
  const isPending = useFilterSortPending();

  return (
    <aside
      data-testid="filter-sidebar"
      aria-label="Filters"
      className="hidden lg-touch:block lg-desktop:block w-64 shrink-0 self-start sticky top-0 pt-6 max-h-screen overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div
        className={cn(
          "flex flex-col gap-6 rounded-md border border-border-secondary bg-surface-elevated p-6",
          "transition-opacity",
          // Mirror the grid's pending cue: dim + block interaction while a
          // filter/sort URL update is in flight (G8).
          isPending && "opacity-60 pointer-events-none",
        )}
      >
        <span className="type-overline">Filters</span>
        <FilterControls />
      </div>
    </aside>
  );
}
