'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { ProgressiveFilterOptionList } from '@/app/components/features/filters/ProgressiveFilterOptionList';
import {
  FilterSliderSection,
  DualRangeSlider,
  ResetButton,
  filterSectionHeaderRow,
  filterSectionHeaderLabel,
  filterSectionHeaderAction,
  filterStateActive,
  filterStateInactive,
} from '@/app/components/features/filters/PriceRangeSlider';
import { humanizeFacetValue } from '@/lib/catalogue/humanizeFacetValue';
import { formatPriceMajor } from '@/lib/utils/price';
import { getFacetModule, type Category, type AnyFacetDef, type FacetOptionCount } from './facetRegistry';

/**
 * Re-export the shared filter-section header primitives defined in
 * PriceRangeSlider.tsx so FilterSidebar.tsx can expose them in one place.
 */
export { filterSectionHeaderRow, filterSectionHeaderLabel, filterSectionHeaderAction, filterStateActive, filterStateInactive };

type SetArray = (next: string[] | ((prev: string[]) => string[])) => void;

// Every control below takes `category` and resolves its own useFilterParam
// through facetRegistry.ts's per-category module (sang-logium-3rv.6) --
// before that, every one of these imported headphones' useFilterParam
// directly, so /products/audio-electronics and /products/accessories wrote
// their filter state through headphones' URL-param contract instead of
// their own.

export function CheckboxGroup({
  category,
  facet,
  counts,
  brandLabels,
}: {
  category: Category;
  facet: AnyFacetDef;
  counts: FacetOptionCount[];
  brandLabels?: Record<string, string>;
}) {
  const { useFilterParam } = getFacetModule(category);
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useFilterParam(facet.id) as [string[], SetArray];
  const selectedArray = selected ?? [];

  // facet.options (this POC's hand-typed slugs) and counts[].value
  // (facetMap.ts's independently hand-typed valueVocab) are two separately
  // authored vocabularies for the same concept and routinely differ only in
  // case/format (e.g. 'sbc' vs 'SBC', 'ipx4' vs 'IPX4') — compare
  // case-insensitively so that drift doesn't silently zero out a real count.
  const countFor = (value: string) =>
    counts.find((c) => c.value.toLowerCase() === value.toLowerCase())?.count ?? 0;
  const labelFor = (value: string) => brandLabels?.[value] ?? humanizeFacetValue(value);

  const staticOptions = facet.options === 'derived' ? null : facet.options;
  const options = (staticOptions ?? counts.map((c) => ({ value: c.value, label: labelFor(c.value) }))).map((o) => ({
    value: o.value,
    label: o.label,
    count: countFor(o.value),
  }));

  const isFilterActive = (value: string) => selectedArray.some((s) => s.toLowerCase() === value.toLowerCase());

  const toggle = (value: string) => {
    setSelected((prev) => {
      const prevArray = prev ?? [];
      const active = prevArray.some((s) => s.toLowerCase() === value.toLowerCase());
      return active ? prevArray.filter((v) => v.toLowerCase() !== value.toLowerCase()) : [...prevArray, value];
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
        <span className={`${filterSectionHeaderLabel} group-hover/header:text-text-primary`}>{facet.label}</span>
        <span
          aria-hidden="true"
          className={`${filterSectionHeaderAction} ${filterStateActive} group-hover/header:text-text-primary`}
        >
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded &&
        (facet.id === 'brand' ? (
          <ProgressiveFilterOptionList
            paramKey={facet.id}
            label={facet.label}
            options={options}
            isFilterActive={isFilterActive}
            toggle={toggle}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {options.map((option) => (
              <Checkbox
                key={option.value}
                name={facet.id}
                value={option.value}
                label={option.label}
                count={option.count}
                checked={isFilterActive(option.value)}
                disabled={option.count === 0 && !isFilterActive(option.value)}
                onChange={() => toggle(option.value)}
              />
            ))}
          </div>
        ))}
    </div>
  );
}

export function BooleanToggle({ category, facet, count }: { category: Category; facet: AnyFacetDef; count?: number }) {
  const { useFilterParam } = getFacetModule(category);
  const [active, setActive] = useFilterParam(facet.id) as [boolean, (v: boolean | ((prev: boolean) => boolean)) => void];

  return (
    <Checkbox
      name={facet.id}
      value={facet.id}
      label={facet.label}
      count={count}
      checked={Boolean(active)}
      disabled={count === 0 && !active}
      onChange={() => setActive((prev) => !prev)}
    />
  );
}

function formatRangeValue(value: number, unit: string): string {
  if (unit === 'm') return `${value.toFixed(1)}m`;
  return `${Math.round(value)} ${unit}`;
}

const RANGE_WRITE_DEBOUNCE_MS = 300;

export function RangeControl({
  category,
  facet,
  bounds,
}: {
  category: Category;
  facet: AnyFacetDef;
  /** Real category span from getFilterFacets; falls back to facet's
   *  hardcoded min/max (sang-logium-3rv.5) when a bound is missing --
   *  e.g. zero matching products, or a route this prop was not threaded to
   *  yet -- same "always have a usable slider" fallback PriceControl gets
   *  from resolvePriceBounds' DEFAULT_PRICE_CEILING. */
  bounds?: { min: number | null; max: number | null };
}) {
  const { useFilterParam } = getFacetModule(category);
  const boundsMin = bounds?.min ?? facet.min ?? 0;
  const boundsMax = bounds?.max ?? facet.max ?? 0;

  const [minParam, setMinParam] = useFilterParam(`${facet.id}Min`, { history: 'replace' }) as [
    number | null,
    (v: number | null) => void,
  ];
  const [maxParam, setMaxParam] = useFilterParam(`${facet.id}Max`, { history: 'replace' }) as [
    number | null,
    (v: number | null) => void,
  ];

  const urlMin = minParam ?? boundsMin;
  const urlMax = maxParam ?? boundsMax;

  const [localMin, setLocalMin] = useState(urlMin);
  const [localMax, setLocalMax] = useState(urlMax);

  useEffect(() => {
    setLocalMin(urlMin);
    setLocalMax(urlMax);
  }, [urlMin, urlMax]);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);
  useEffect(() => clearTimer, [clearTimer]);

  const commitMin = useCallback(
    (next: number) => {
      clearTimer();
      timer.current = setTimeout(() => setMinParam(next <= boundsMin ? null : next), RANGE_WRITE_DEBOUNCE_MS);
    },
    [clearTimer, setMinParam, boundsMin],
  );
  const commitMax = useCallback(
    (next: number) => {
      clearTimer();
      timer.current = setTimeout(() => setMaxParam(next >= boundsMax ? null : next), RANGE_WRITE_DEBOUNCE_MS);
    },
    [clearTimer, setMaxParam, boundsMax],
  );

  const active = minParam != null || maxParam != null;

  return (
    <FilterSliderSection
      label={facet.label}
      active={active}
      resetLabel={`Reset ${facet.label} filter`}
      onReset={() => {
        clearTimer();
        setLocalMin(boundsMin);
        setLocalMax(boundsMax);
        setMinParam(null);
        setMaxParam(null);
      }}
    >
      <DualRangeSlider
        min={boundsMin}
        max={boundsMax}
        minValue={localMin}
        maxValue={localMax}
        minLabel={formatRangeValue(localMin, facet.unit ?? '')}
        maxLabel={formatRangeValue(localMax, facet.unit ?? '')}
        onChangeMin={(value) => {
          const next = Math.min(value, localMax);
          setLocalMin(next);
          commitMin(next);
        }}
        onChangeMax={(value) => {
          const next = Math.max(value, localMin);
          setLocalMax(next);
          commitMax(next);
        }}
      />
    </FilterSliderSection>
  );
}

const RATING_TIERS = [4, 3] as const;

export function PriceControl({ category, min, max }: { category: Category; min: number; max: number }) {
  const { useFilterParam } = getFacetModule(category);
  const [minParam, setMinParam] = useFilterParam('minPrice', { history: 'replace' }) as [
    number | null,
    (v: number | null) => void,
  ];
  const [maxParam, setMaxParam] = useFilterParam('maxPrice', { history: 'replace' }) as [
    number | null,
    (v: number | null) => void,
  ];

  const urlMin = minParam ?? min;
  const urlMax = maxParam ?? max;
  const [localMin, setLocalMin] = useState(urlMin);
  const [localMax, setLocalMax] = useState(urlMax);

  useEffect(() => {
    setLocalMin(urlMin);
    setLocalMax(urlMax);
  }, [urlMin, urlMax]);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const commit = (setter: (v: number | null) => void, bound: number) => (next: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setter(next === bound ? null : next), RANGE_WRITE_DEBOUNCE_MS);
  };

  const active = minParam != null || maxParam != null;

  return (
    <FilterSliderSection
      label="Price"
      active={active}
      resetLabel="Reset price filter"
      onReset={() => {
        if (timer.current) clearTimeout(timer.current);
        setLocalMin(min);
        setLocalMax(max);
        setMinParam(null);
        setMaxParam(null);
      }}
    >
      <DualRangeSlider
        min={min}
        max={max}
        minValue={localMin}
        maxValue={localMax}
        minLabel={formatPriceMajor(localMin)}
        maxLabel={formatPriceMajor(localMax)}
        onChangeMin={(value) => {
          const next = Math.min(value, localMax);
          setLocalMin(next);
          commit(setMinParam, min)(next);
        }}
        onChangeMax={(value) => {
          const next = Math.max(value, localMin);
          setLocalMax(next);
          commit(setMaxParam, max)(next);
        }}
      />
    </FilterSliderSection>
  );
}

export function RatingControl({ category }: { category: Category }) {
  const { useFilterParam } = getFacetModule(category);
  const [minRating, setMinRating] = useFilterParam('minRating') as [number | null, (v: number | null) => void];

  return (
    <div className="flex flex-col gap-3">
      <div className={filterSectionHeaderRow}>
        <span className={filterSectionHeaderLabel}>Customer Rating</span>
        <ResetButton active={minRating != null} label="Reset rating filter" onClick={() => setMinRating(null)} />
      </div>
      <div className="flex flex-col gap-2">
        {RATING_TIERS.map((tier) => {
          const checked = minRating === tier;
          return (
            <Checkbox
              key={tier}
              name="minRating"
              value={String(tier)}
              label={`${tier}★ & up`}
              checked={checked}
              onChange={() => setMinRating(checked ? null : tier)}
            />
          );
        })}
      </div>
    </div>
  );
}
