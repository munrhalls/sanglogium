"use client";

import React, { useState } from 'react';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { useFilterParam } from '@/app/hooks/nuqs/useFilterSort';
import { PriceRangeSlider } from './PriceRangeSlider';
import { FILTER_FACETS, type FilterFacet } from '@/lib/catalogue/facetMap';
import type { CatalogueFacets } from '@/sanity-cms/lib/products/getFilterFacets';
import type { PriceBounds } from '@/lib/catalogue/priceBounds';

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
 * Facet option lists + counts are supplied by page composition (the RSC) as the
 * `facets` prop — disjunctive facets fetched from Sanity keyed on the route's
 * VFS key set. The controls read/write their F1 URL params (via `useFilterParam`);
 * local useState is only cosmetic (collapse/expand). Nothing here fetches data or
 * touches the product grid.
 */

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

/** Any F1 param key that maps to a checkbox group. */
type FacetParamKey = string;

interface CheckboxFilterGroupProps {
  /** F1 array param this group reads & writes. */
  paramKey: FacetParamKey;
  /** Section heading. */
  label: string;
  options: FilterOption[];
}

function CheckboxFilterGroup({ paramKey, label, options }: CheckboxFilterGroupProps) {
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useFilterParam(paramKey) as unknown as [string[], (v: string[] | ((prev: string[]) => string[])) => void];

  const order = new Map(options.map((option, index) => [option.value, index]));
  const selectedArray = selected ?? [];

  const isFilterActive = (value: string): boolean =>
    selectedArray.some((s) => s.toLowerCase() === value.toLowerCase());

  const canonicalize = (values: string[]) =>
    Array.from(new Set(values.filter((value) => order.has(value)))).sort(
      (a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0),
    );

  const toggle = (value: string) => {
    setSelected((prev) => {
      const prevArray = prev ?? [];
      const active = prevArray.some((s) => s.toLowerCase() === value.toLowerCase());
      return active
        ? canonicalize(prevArray).filter((v) => v.toLowerCase() !== value.toLowerCase())
        : canonicalize([...prevArray, value]);
    });
  };

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
              name={paramKey}
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

interface BooleanFilterProps {
  /** F1 boolean param this control reads & writes. */
  paramKey: FacetParamKey;
  label: string;
  count?: number;
}

function BooleanFilter({ paramKey, label, count }: BooleanFilterProps) {
  const [active, setActive] = useFilterParam(paramKey) as unknown as [boolean, (v: boolean | ((prev: boolean) => boolean)) => void];

  return (
    <Checkbox
      name={paramKey}
      value={paramKey}
      label={label}
      count={count}
      checked={active}
      disabled={count === 0 && !active}
      onChange={() => setActive((prev) => !prev)}
    />
  );
}

/** Header for the price section. */
function PriceSection({ priceBounds }: { priceBounds: PriceBounds }) {
  return (
    <div className="flex flex-col gap-3">
      <div className={filterSectionHeaderRow}>
        <span className={filterSectionHeaderLabel}>Price</span>
      </div>
      <PriceRangeSlider min={priceBounds.min} max={priceBounds.max} />
    </div>
  );
}

/**
 * The stack of filter controls, with no wrapper chrome of its own. Shared
 * verbatim between the desktop sidebar and the mobile filter drawer so both
 * surfaces stay identical. Returned as a fragment so callers own the layout
 * container.
 */
export function FilterControls({ facets, priceBounds }: { facets: CatalogueFacets; priceBounds: PriceBounds }) {
  return (
    <>
      <PriceSection priceBounds={priceBounds} />

      {FILTER_FACETS.map((facet) => {
        if (facet.urlParam === 'price') return null;

        if (facet.type === 'boolean') {
          return (
            <BooleanFilter
              key={facet.urlParam}
              paramKey={facet.urlParam}
              label={facet.facet}
              count={facets.booleans[facet.urlParam]}
            />
          );
        }

        const options = facets.groups[facet.urlParam] ?? [];
        return (
          <CheckboxFilterGroup
            key={facet.urlParam}
            paramKey={facet.urlParam}
            label={facet.facet}
            options={options}
          />
        );
      })}
    </>
  );
}

export function FilterSidebar({ facets, priceBounds }: { facets: CatalogueFacets; priceBounds: PriceBounds }) {
  return (
    <aside
      data-testid="filter-sidebar"
      aria-label="Filters"
      className="hidden lg-touch:block lg-desktop:block w-64 shrink-0 self-start sticky top-0 pt-6 max-h-screen overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* Visually static and always interactive: a control writes the URL and
          reflects the URL, never waiting on a fetch / transition in flight. */}
      <div className="flex flex-col gap-6 rounded-md border border-border-secondary bg-surface-elevated p-6">
        <span className="type-overline">Filters</span>
        <FilterControls facets={facets} priceBounds={priceBounds} />
      </div>
    </aside>
  );
}
