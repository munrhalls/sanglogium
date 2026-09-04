"use client";

import React from "react";
import { useQueryStates } from "nuqs";
import {
  SORT_OPTIONS,
  SORT_DEFAULT,
  filterSortParsers,
  FILTER_SORT_URL_OPTIONS,
  type SortValue,
} from "@/lib/catalogue/filterSortParams";
import { FILTER_FACETS, isPlaceholderVocab } from "@/lib/catalogue/facetMap";
import {
  useFilterParam,
  useClearAllFilters,
  usePageReset,
} from "@/app/hooks/nuqs/useFilterSort";
import { formatPriceMajor } from "@/lib/utils/price";
import { humanizeFacetValue } from "@/lib/catalogue/humanizeFacetValue";

/**
 * F6 — the active-filter chip row + "Clear all".
 *
 * SINGLE RESPONSIBILITY: URL <-> its own display. It renders one chip per active
 * value in the F1 contract and, on interaction, writes the corrected value back
 * through F1's setters. It does NOT import, query or react to the product grid,
 * product data, result counts or streaming.
 *
 * Every param key, parser, default and history/shallow option comes from F1
 * (`lib/catalogue/filterSortParams.ts` + `useFilterSort`) — nothing about the URL
 * vocabulary is restated here, so it stays in lockstep with F2–F5.
 *
 * Human-readable labels come from the same option list F5 receives as a prop
 * (`brandLabels`). A value with no matching label falls back to the raw slug —
 * never a blank chip.
 */

type LabelMap = Record<string, string>;

interface ActiveFilterChipsProps {
  /** brand slug -> label, from F5's brand option list. */
  brandLabels?: LabelMap;
}

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

const formatPrice = (dollars: number) => formatPriceMajor(dollars);

const sortLabel = (value: string) =>
  SORT_OPTIONS.find((o) => o.value === value)?.label ?? value;

export function ActiveFilterChips({
  brandLabels = {},
}: ActiveFilterChipsProps) {
  const [sort, setSort] = useFilterParam("sort") as unknown as [
    SortValue,
    (v: SortValue | ((prev: SortValue) => SortValue)) => void,
  ];
  const [inStock, setInStock] = useFilterParam("inStock") as unknown as [
    boolean,
    (v: boolean | ((prev: boolean) => boolean)) => void,
  ];
  const [brand, setBrand] = useFilterParam("brand") as unknown as [
    string[],
    (v: string[] | ((prev: string[]) => string[])) => void,
  ];
  const [{ minPrice, maxPrice }, setPrice] = useQueryStates(
    {
      minPrice: filterSortParsers.minPrice,
      maxPrice: filterSortParsers.maxPrice,
    },
    FILTER_SORT_URL_OPTIONS,
  );
  const resetPage = usePageReset();
  const clearAll = useClearAllFilters();

  // Stable hook-order access to the remaining filterAttributes facet params.
  type FacetSetter = [unknown, (next: unknown | ((prev: unknown) => unknown)) => void];
  const facetSetters = new Map<string, FacetSetter>();
  for (const facet of FILTER_FACETS) {
    if (facet.urlParam === 'price' || facet.urlParam === 'brand' || facet.urlParam === 'inStock') continue;
    facetSetters.set(facet.urlParam, useFilterParam(facet.urlParam) as unknown as FacetSetter);
  }

  const chips: Chip[] = [];

  // Unknown URL values (e.g. ?brand=notabrand, ?driverType=banana) are inert on
  // the server (see lib/catalogue/sanitizeFilterState.ts); mirror that here so
  // no chip is rendered for a value that filters nothing. brand is data-derived
  // — its known set is the brandLabels map the page passes in (skip the check
  // when that map is empty, e.g. a facet fetch failure). (jw8.3)
  const knownBrands = Object.keys(brandLabels);
  const isKnownBrand = (slug: string) =>
    knownBrands.length === 0 ||
    Boolean(brandLabels[slug]) ||
    Boolean(brandLabels[slug.toLowerCase()]);

  brand?.filter(isKnownBrand).forEach((slug) => {
    chips.push({
      key: `brand:${slug}`,
      label: brandLabels[slug] ?? humanizeFacetValue(slug),
      onRemove: () => setBrand((prev) => (prev ?? []).filter((v) => v !== slug)),
    });
  });

  if (minPrice != null || maxPrice != null) {
    let priceText: string;
    if (minPrice != null && maxPrice != null) {
      priceText = `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`;
    } else if (minPrice != null) {
      priceText = `From ${formatPrice(minPrice)}`;
    } else {
      priceText = `Up to ${formatPrice(maxPrice as number)}`;
    }
    chips.push({
      key: "price",
      label: priceText,
      onRemove: () => {
        setPrice({ minPrice: null, maxPrice: null });
        resetPage();
      },
    });
  }

  if (inStock) {
    chips.push({
      key: "inStock",
      label: "In stock only",
      onRemove: () => setInStock(false),
    });
  }

  if (sort !== SORT_DEFAULT) {
    chips.push({
      key: "sort",
      label: `Sort: ${sortLabel(sort)}`,
      onRemove: () => setSort(SORT_DEFAULT),
    });
  }

  // Render chips for the remaining filterAttributes facets.
  for (const facet of FILTER_FACETS) {
    if (
      facet.urlParam === 'price' ||
      facet.urlParam === 'brand' ||
      facet.urlParam === 'inStock'
    ) {
      continue;
    }

    const setterTuple = facetSetters.get(facet.urlParam);
    if (!setterTuple) continue;
    const [rawValue, setRawValue] = setterTuple;

    if (facet.type === 'boolean') {
      if (rawValue === true) {
        chips.push({
          key: facet.urlParam,
          label: facet.facet,
          onRemove: () => (setRawValue as (v: boolean) => void)(false),
        });
      }
      continue;
    }

    const closedVocab = isPlaceholderVocab(facet.valueVocab)
      ? null
      : new Set(facet.valueVocab.map((v) => v.toLowerCase()));

    const selected = Array.isArray(rawValue) ? rawValue : [];
    for (const value of selected) {
      const slug = String(value);
      if (closedVocab && !closedVocab.has(slug.toLowerCase())) continue;
      chips.push({
        key: `${facet.urlParam}:${slug}`,
        label: brandLabels[slug] ?? humanizeFacetValue(slug),
        onRemove: () =>
          (setRawValue as (v: string[] | ((prev: string[]) => string[])) => void)((prev: string[]) =>
            prev.filter((v) => v !== slug)
          ),
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <div
      data-testid="active-filter-chips"
      className="mb-6 flex flex-wrap items-center gap-2"
    >
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
            <svg
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="h-3 w-3"
            >
              <path
                d="M3.5 3.5l9 9M12.5 3.5l-9 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
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
