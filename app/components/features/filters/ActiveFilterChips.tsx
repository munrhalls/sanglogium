"use client";

import React from "react";
import { useQueryStates } from "nuqs";
import {
  SORT_OPTIONS,
  SORT_DEFAULT,
  filterSortParsers,
  FILTER_SORT_URL_OPTIONS,
} from "@/lib/catalogue/filterSortParams";
import {
  useFilterParam,
  useClearAllFilters,
  usePageReset,
} from "@/app/hooks/nuqs/useFilterSort";

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
 * Human-readable labels come from the same option lists F5 receives as props
 * (`brandLabels` / `categoryLabels`). A value with no matching label falls back
 * to the raw slug — never a blank chip.
 */

type LabelMap = Record<string, string>;

interface ActiveFilterChipsProps {
  /** brand slug -> label, from F5's brand option list. */
  brandLabels?: LabelMap;
  /** category key -> label, from F5's category option list. */
  categoryLabels?: LabelMap;
}

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

const formatPrice = (dollars: number) => `$${dollars.toLocaleString("en-US")}`;

const sortLabel = (value: string) =>
  SORT_OPTIONS.find((o) => o.value === value)?.label ?? value;

export function ActiveFilterChips({
  brandLabels = {},
  categoryLabels = {},
}: ActiveFilterChipsProps) {
  const [sort, setSort] = useFilterParam("sort");
  const [inStock, setInStock] = useFilterParam("inStock");
  const [brand, setBrand] = useFilterParam("brand");
  const [category, setCategory] = useFilterParam("category");
  const [{ minPrice, maxPrice }, setPrice] = useQueryStates(
    {
      minPrice: filterSortParsers.minPrice,
      maxPrice: filterSortParsers.maxPrice,
    },
    FILTER_SORT_URL_OPTIONS,
  );
  const resetPage = usePageReset();
  const clearAll = useClearAllFilters();

  const chips: Chip[] = [];

  brand.forEach((slug) => {
    chips.push({
      key: `brand:${slug}`,
      label: brandLabels[slug] ?? slug,
      onRemove: () => setBrand((prev) => (prev ?? []).filter((v) => v !== slug)),
    });
  });

  category.forEach((catKey) => {
    chips.push({
      key: `category:${catKey}`,
      label: categoryLabels[catKey] ?? catKey,
      onRemove: () => setCategory((prev) => (prev ?? []).filter((v) => v !== catKey)),
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
