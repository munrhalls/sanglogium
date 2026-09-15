'use client';

import React from 'react';
import { FACETS, SORT_DEFAULT, SORT_OPTIONS } from '@/app/(test)/poc/filter-sort/headphones/lib/facetConfig';
import { useFilterParam, useClearAllFilters } from '@/app/(test)/poc/filter-sort/headphones/lib/useFilterParam';
import { humanizeFacetValue } from '@/lib/catalogue/humanizeFacetValue';
import { formatPriceMajor } from '@/lib/utils/price';

/**
 * POC-local mirror of app/components/features/filters/ActiveFilterChips.tsx.
 * SINGLE RESPONSIBILITY: URL <-> its own display. Renders one chip per active
 * value and, on interaction, writes the corrected value back through the
 * shared hook. Never imports or reacts to the product grid, product data,
 * result counts or streaming.
 */

interface ActiveFilterChipsProps {
  brandLabels?: Record<string, string>;
}

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

const sortLabel = (value: string) => SORT_OPTIONS.find((o) => o.value === value)?.label ?? value;
const formatRangeChipValue = (value: number, unit: string) => (unit === 'm' ? `${value.toFixed(1)}m` : `${Math.round(value)} ${unit}`);

export function ActiveFilterChips({ brandLabels = {} }: ActiveFilterChipsProps) {
  const [sort, setSort] = useFilterParam('sort') as [string, (v: string) => void];
  const [minPrice, setMinPrice] = useFilterParam('minPrice') as [number | null, (v: number | null) => void];
  const [maxPrice, setMaxPrice] = useFilterParam('maxPrice') as [number | null, (v: number | null) => void];
  const [minRating, setMinRating] = useFilterParam('minRating') as [number | null, (v: number | null) => void];
  const clearAll = useClearAllFilters();

  // Stable hook-order access to every generic facet param (and, for range
  // facets, their Min/Max pair) — FACETS is a static, compile-time-constant
  // array, so this loop calling a fixed sequence of hooks is safe every
  // render (same pattern production's own ActiveFilterChips.tsx uses over
  // FILTER_FACETS).
  type ArraySetter = [string[], (next: string[] | ((prev: string[]) => string[])) => void];
  type BoolSetter = [boolean, (next: boolean) => void];
  type NumSetter = [number | null, (next: number | null) => void];

  const checkboxSetters = new Map<string, ArraySetter>();
  const booleanSetters = new Map<string, BoolSetter>();
  const rangeSetters = new Map<string, [NumSetter, NumSetter]>();

  for (const facet of FACETS) {
    if (facet.control === 'boolean') {
      booleanSetters.set(facet.id, useFilterParam(facet.id) as unknown as BoolSetter);
    } else if (facet.control === 'range') {
      const minTuple = useFilterParam(`${facet.id}Min`) as unknown as NumSetter;
      const maxTuple = useFilterParam(`${facet.id}Max`) as unknown as NumSetter;
      rangeSetters.set(facet.id, [minTuple, maxTuple]);
    } else {
      checkboxSetters.set(facet.id, useFilterParam(facet.id) as unknown as ArraySetter);
    }
  }

  const chips: Chip[] = [];

  if (minPrice != null || maxPrice != null) {
    let priceText: string;
    if (minPrice != null && maxPrice != null) priceText = `${formatPriceMajor(minPrice)} – ${formatPriceMajor(maxPrice)}`;
    else if (minPrice != null) priceText = `From ${formatPriceMajor(minPrice)}`;
    else priceText = `Up to ${formatPriceMajor(maxPrice as number)}`;
    chips.push({
      key: 'price',
      label: priceText,
      onRemove: () => {
        setMinPrice(null);
        setMaxPrice(null);
      },
    });
  }

  if (minRating != null) {
    chips.push({ key: 'minRating', label: `${minRating}★ & up`, onRemove: () => setMinRating(null) });
  }

  if (sort !== SORT_DEFAULT) {
    chips.push({ key: 'sort', label: `Sort: ${sortLabel(sort)}`, onRemove: () => setSort(SORT_DEFAULT) });
  }

  for (const facet of FACETS) {
    if (facet.control === 'boolean') {
      const [active, setActive] = booleanSetters.get(facet.id)!;
      if (active) chips.push({ key: facet.id, label: facet.label, onRemove: () => setActive(false) });
      continue;
    }

    if (facet.control === 'range') {
      const [[minVal, setMinVal], [maxVal, setMaxVal]] = rangeSetters.get(facet.id)!;
      if (minVal == null && maxVal == null) continue;
      let label: string;
      if (minVal != null && maxVal != null) label = `${facet.label}: ${formatRangeChipValue(minVal, facet.unit)} – ${formatRangeChipValue(maxVal, facet.unit)}`;
      else if (minVal != null) label = `${facet.label}: ${formatRangeChipValue(minVal, facet.unit)}+`;
      else label = `${facet.label}: up to ${formatRangeChipValue(maxVal as number, facet.unit)}`;
      chips.push({
        key: facet.id,
        label,
        onRemove: () => {
          setMinVal(null);
          setMaxVal(null);
        },
      });
      continue;
    }

    // checkbox
    const [selected, setSelected] = checkboxSetters.get(facet.id)!;
    for (const value of selected ?? []) {
      chips.push({
        key: `${facet.id}:${value}`,
        label: brandLabels[value] ?? humanizeFacetValue(value),
        onRemove: () => setSelected((prev) => (prev ?? []).filter((v) => v !== value)),
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <div data-testid="poc-active-filter-chips" className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="type-caption inline-flex items-center gap-1.5 rounded-full border border-border-secondary bg-surface-elevated py-1 pl-3 pr-1.5 text-text-body"
        >
          {chip.label}
          <button
            type="button"
            aria-label={`Remove ${chip.label} filter`}
            onClick={chip.onRemove}
            className="flex h-5 w-5 items-center justify-center rounded-full text-text-accent transition-colors hover:bg-accent-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3 w-3">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={clearAll}
        className="type-caption rounded-full px-3 py-1 text-text-caption underline-offset-2 transition-colors hover:text-text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
      >
        Clear all
      </button>
    </div>
  );
}
