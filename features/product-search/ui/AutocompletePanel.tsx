"use client";

import React, { useEffect } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import { ArrowRight, MagnifyingGlass, SquaresFour, Tag } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/tailwind";
import { ProductImage } from "@/features/products";
import { formatPrice } from "@/lib/utils/price";
import type { AutocompleteProduct } from "../domain/searchTypes";
import { HighlightedText } from "./HighlightedText";
import { CATEGORY_SUGGESTIONS } from "../config/searchSuggestions";
import type { SuggestionEntry } from "../domain/suggestionEntries";
import { isPlainLeftClick, productHref, searchHref } from "./searchLinks";

interface AutocompletePanelProps {
  /** popup = desktop dropdown, sheet = full-bleed list inside the mobile sheet. */
  variant: "popup" | "sheet";
  query: string;
  results: AutocompleteProduct[];
  /** Category / brand entries shown above the products. */
  entries: SuggestionEntry[];
  isFetching: boolean;
  hasError: boolean;
  activeIndex: number;
  listboxId: string;
  optionId: (index: number) => string;
  onActiveChange: (index: number) => void;
  onProductClick: (product: AutocompleteProduct) => void;
  onEntryClick: (entry: SuggestionEntry) => void;
  onViewAll: () => void;
  onNavigate: (href: string) => void;
}

function SuggestionSkeleton() {
  return (
    <div className="flex min-h-16 items-center gap-3 px-3 py-2" aria-hidden="true">
      <div className="h-12 w-12 shrink-0 animate-pulse rounded-md bg-secondary-700" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-secondary-700" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-secondary-700" />
      </div>
    </div>
  );
}

/**
 * Suggestion list for the search combobox. Only real `option`s live inside the
 * `listbox` (products, then a final "see all results" option); headings, empty
 * and error copy sit outside it. Options are anchors with real hrefs, so
 * middle-click / open-in-new-tab keep working; plain clicks are routed through
 * the controller so the history entry is handled correctly.
 */
export function AutocompletePanel({
  variant,
  query,
  results,
  entries,
  isFetching,
  hasError,
  activeIndex,
  listboxId,
  optionId,
  onActiveChange,
  onProductClick,
  onEntryClick,
  onViewAll,
  onNavigate,
}: AutocompletePanelProps) {
  const trimmed = query.trim();
  const isSheet = variant === "sheet";
  // Option order: entries, products, then "see all results".
  const productOffset = entries.length;
  const viewAllIndex = entries.length + results.length;
  const showSkeleton = isFetching && results.length === 0;
  const showEmpty = !isFetching && !hasError && results.length === 0 && entries.length === 0;
  const categoryEntries = entries.filter((e) => e.kind === "category");
  const brandEntries = entries.filter((e) => e.kind === "brand");

  // Keep the keyboard-highlighted option inside the scroll area.
  useEffect(() => {
    if (activeIndex < 0) return;
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, optionId]);

  const handleClick =
    (action: () => void) => (e: MouseEvent<HTMLAnchorElement>) => {
      if (!isPlainLeftClick(e)) return;
      e.preventDefault();
      action();
    };

  const optionBase = cn(
    "flex items-center gap-3 border-l-2 px-3 transition-colors duration-150",
    "focus-visible:outline-none"
  );

  const renderEntry = (entry: SuggestionEntry, index: number) => {
    const isActive = index === activeIndex;
    const Icon = entry.kind === "category" ? SquaresFour : Tag;
    return (
      <a
        key={`${entry.kind}-${entry.href}`}
        id={optionId(index)}
        role="option"
        aria-selected={isActive}
        href={entry.href}
        tabIndex={-1}
        onMouseMove={() => {
          if (!isActive) onActiveChange(index);
        }}
        onClick={handleClick(() => onEntryClick(entry))}
        className={cn(
          optionBase,
          "min-h-12 py-2",
          isActive ? "border-brand-400 bg-surface-card" : "border-transparent hover:bg-surface-card"
        )}
      >
        <Icon size={18} className="shrink-0 text-secondary-500" aria-hidden="true" />
        <span className="type-body min-w-0 flex-1 truncate text-secondary-300">
          <HighlightedText text={entry.label} query={trimmed} />
        </span>
        <ArrowRight size={16} className="shrink-0 text-secondary-500" aria-hidden="true" />
      </a>
    );
  };

  return (
    <div className="flex flex-col">
      {showSkeleton && (
        <div className="py-1">
          <SuggestionSkeleton />
          <SuggestionSkeleton />
          <SuggestionSkeleton />
        </div>
      )}

      {hasError && (
        <p className="type-body px-3 pb-2 pt-3 text-secondary">
          Suggestions are unavailable right now. You can still search.
        </p>
      )}

      {showEmpty && (
        <div className="px-3 pb-2 pt-3">
          <p className="type-body text-secondary">
            No quick matches for &lsquo;{trimmed}&rsquo;.
          </p>
        </div>
      )}

      <div
        role="listbox"
        id={listboxId}
        aria-label="Search suggestions"
        aria-busy={isFetching}
        className={cn(results.length > 0 && isFetching && "opacity-60 transition-opacity")}
      >
        {categoryEntries.length > 0 && (
          <div role="group" aria-label="Categories">
            <p className="type-overline px-3 pb-1 pt-3 text-accent-500">Categories</p>
            {categoryEntries.map((entry) => renderEntry(entry, entries.indexOf(entry)))}
          </div>
        )}
        {brandEntries.length > 0 && (
          <div role="group" aria-label="Brands">
            <p className="type-overline px-3 pb-1 pt-3 text-accent-500">Brands</p>
            {brandEntries.map((entry) => renderEntry(entry, entries.indexOf(entry)))}
          </div>
        )}
        {results.length > 0 && (
          <p className="type-overline px-3 pb-1 pt-3 text-accent-500" role="presentation">
            Products
          </p>
        )}
        {results.map((product, resultIndex) => {
          const index = productOffset + resultIndex;
          const isActive = index === activeIndex;
          const brandName = product.brand?.name;
          return (
            <a
              key={product._id}
              id={optionId(index)}
              role="option"
              aria-selected={isActive}
              href={productHref(product.slug.current)}
              tabIndex={-1}
              onMouseMove={() => {
                if (!isActive) onActiveChange(index);
              }}
              onClick={handleClick(() => onProductClick(product))}
              className={cn(
                optionBase,
                "min-h-16 py-2",
                isActive ? "border-brand-400 bg-surface-card" : "border-transparent hover:bg-surface-card"
              )}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-productImage">
                {product.image && (
                  <ProductImage
                    image={product.image}
                    alt=""
                    reveal={false}
                    sizes="48px"
                    className="h-full w-full object-contain mix-blend-multiply"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="type-body line-clamp-2 break-words text-secondary-300">
                  <HighlightedText text={product.name} query={trimmed} />
                </span>
                {brandName && (
                  <span className="type-caption truncate text-secondary">{brandName}</span>
                )}
              </div>
              <span className="type-product-price shrink-0 pl-2">
                {formatPrice(product.price_data.unit_amount)}
              </span>
            </a>
          );
        })}

        <a
          id={optionId(viewAllIndex)}
          role="option"
          aria-selected={activeIndex === viewAllIndex}
          href={searchHref(trimmed)}
          tabIndex={-1}
          onMouseMove={() => {
            if (activeIndex !== viewAllIndex) onActiveChange(viewAllIndex);
          }}
          onClick={handleClick(onViewAll)}
          className={cn(
            optionBase,
            "sticky bottom-0 min-h-14 justify-between border-t border-t-border-secondary py-3",
            "bg-surface-elevated",
            activeIndex === viewAllIndex
              ? "border-l-brand-400 bg-surface-card"
              : "border-l-transparent hover:bg-surface-card",
            isSheet && "shadow-[0_-8px_16px_rgba(0,0,0,0.25)]"
          )}
        >
          <span className="flex min-w-0 items-center gap-3">
            <MagnifyingGlass size={18} className="shrink-0 text-secondary-500" aria-hidden="true" />
            <span className="type-body truncate text-primary">
              See all results for <span className="font-semibold">&ldquo;{trimmed}&rdquo;</span>
            </span>
          </span>
          <ArrowRight size={18} className="shrink-0 text-brand-400" aria-hidden="true" />
        </a>
      </div>

      {(showEmpty || hasError) && (
        <div className="px-3 pb-4 pt-3">
          <p className="type-overline mb-2 text-accent-500">Try instead</p>
          <ul className="flex flex-wrap gap-2">
            {CATEGORY_SUGGESTIONS.map((category) => (
              <li key={category.href}>
                <Link
                  href={category.href}
                  onClick={handleClick(() => onNavigate(category.href))}
                  className="btn-secondary type-body inline-flex min-h-11 items-center px-4"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
