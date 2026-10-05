"use client";

import React, { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import { Clock, MagnifyingGlass, X } from "@phosphor-icons/react";
import { cn } from "@/platform/utils/tailwind";
import { clearRecentSearches, getRecentSearches, removeRecentSearch } from "@/features/product-search/model/recentSearches";
import { CATEGORY_SUGGESTIONS, POPULAR_SEARCHES } from "@/features/product-search/config/searchSuggestions";
import { isPlainLeftClick } from "@/features/product-search/ui/isPlainLeftClick";

/**
 * Zero-query state, shown by both search surfaces before the shopper has typed
 * two characters: recent searches (removable one by one), direct category
 * shortcuts, and popular search terms. Purely presentational: it fetches
 * nothing and delegates every action to the parent.
 */

interface SearchZeroQueryPanelProps {
  onSearchTerm: (term: string) => void;
  onNavigate: (href: string) => void;
}

const heading = "type-overline text-accent-500";
const rowClass = cn(
  "flex min-h-12 w-full min-w-0 items-center gap-3 px-3 py-2 text-left",
  "type-body text-primary transition-colors duration-150",
  "hover:bg-surface-card active:bg-surface-card"
);
const chipClass = cn(
  "inline-flex min-h-11 items-center rounded-md border border-border-secondary px-4",
  "type-body text-primary transition-colors duration-150",
  "hover:bg-surface-card active:bg-surface-card"
);

export function SearchZeroQueryPanel({ onSearchTerm, onNavigate }: SearchZeroQueryPanelProps) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  const handleLinkClick =
    (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      if (!isPlainLeftClick(e)) return;
      e.preventDefault();
      onNavigate(href);
    };

  return (
    <div className="pb-4">
      {recent.length > 0 && (
        <section aria-labelledby="search-recent-heading" className="pt-2">
          <div className="flex items-center justify-between pl-3">
            <h2 id="search-recent-heading" className={heading}>
              Recent
            </h2>
            <button
              type="button"
              onClick={() => {
                clearRecentSearches();
                setRecent([]);
              }}
              className="type-caption min-h-11 px-3 text-secondary transition-colors hover:text-primary"
            >
              Clear all
            </button>
          </div>
          <ul>
            {recent.map((term) => (
              <li key={term} className="flex items-center">
                <button
                  type="button"
                  className={cn(rowClass, "flex-1")}
                  onClick={() => onSearchTerm(term)}
                >
                  <Clock size={18} className="shrink-0 text-secondary-500" aria-hidden="true" />
                  <span className="truncate">{term}</span>
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${term} from recent searches`}
                  onClick={() => setRecent(removeRecentSearch(term))}
                  className="flex h-12 w-12 shrink-0 items-center justify-center text-secondary-500 transition-colors hover:text-primary"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="search-browse-heading" className="px-3 pt-4">
        <h2 id="search-browse-heading" className={cn(heading, "mb-2")}>
          Browse
        </h2>
        <ul className="flex flex-wrap gap-2">
          {CATEGORY_SUGGESTIONS.map((category) => (
            <li key={category.href}>
              <Link
                href={category.href}
                onClick={handleLinkClick(category.href)}
                className={chipClass}
              >
                {category.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="search-popular-heading" className="px-3 pt-5">
        <h2 id="search-popular-heading" className={cn(heading, "mb-2")}>
          Popular searches
        </h2>
        <ul className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((term) => (
            <li key={term}>
              <button type="button" onClick={() => onSearchTerm(term)} className={chipClass}>
                <MagnifyingGlass
                  size={16}
                  className="mr-2 shrink-0 text-secondary-500"
                  aria-hidden="true"
                />
                {term}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
