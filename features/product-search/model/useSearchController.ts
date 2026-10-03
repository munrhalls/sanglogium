"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AutocompleteProduct } from "@/features/product-search/domain/searchTypes";
import { addRecentSearch } from "./recentSearches";
import { productHref, searchHref } from "@/features/product-search/domain/searchLinks";
import { buildSuggestionEntries } from "@/features/product-search/domain/suggestionEntries";
import type { SuggestionEntry } from "@/features/product-search/domain/suggestionEntries";

export const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 150;
const CACHE_MAX = 30;

interface KeyDownOptions {
  /** Is the suggestion popup currently visible on this surface? */
  isOpen: boolean;
  /** ArrowDown pressed while closed: the surface should re-open its popup. */
  onOpen?: () => void;
  /** Escape pressed. Return true when the surface handled it (event is then cancelled). */
  onEscape?: () => boolean;
  /** Enter chose a suggestion / "see all": the surface should blur + close itself. */
  onActivate?: () => void;
}

/**
 * The search state machine shared by the desktop field and the mobile sheet:
 * query text, debounced + cached suggestion fetching (previous results stay on
 * screen while the next ones load), keyboard navigation over the option list
 * (products, then the trailing "see all results" option) and navigation.
 *
 * It owns no DOM and no refs. Surfaces own focus, blur and visibility.
 * The suggestion fetcher is injected so the feature never imports sanity-cms.
 */
export function useSearchController({
  isSheetOpen,
  fetchSuggestions,
}: {
  isSheetOpen: boolean;
  fetchSuggestions: (query: string) => Promise<AutocompleteProduct[]>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const idBase = useId();

  const [query, setQueryState] = useState(urlQuery);
  // False while the text merely mirrors the URL (results page load, back/forward):
  // suggestions must not pop open until the shopper actually interacts.
  const [isEditing, setIsEditing] = useState(false);
  const [results, setResults] = useState<AutocompleteProduct[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const cacheRef = useRef(new Map<string, AutocompleteProduct[]>());

  const trimmed = query.trim();
  const showSuggestions = isEditing && trimmed.length >= MIN_QUERY_LENGTH;
  // Category / brand entries (derived from the products), then every product,
  // then the trailing "see all results" option, in that order.
  const entries = useMemo(
    () => (showSuggestions ? buildSuggestionEntries(trimmed, results) : []),
    [showSuggestions, trimmed, results]
  );
  const optionCount = showSuggestions ? entries.length + results.length + 1 : 0;

  // Keep the text in sync with the URL when it changes externally.
  useEffect(() => {
    setQueryState(urlQuery);
    setIsEditing(false);
    setActiveIndex(-1);
  }, [urlQuery]);

  useEffect(() => {
    if (!isEditing || trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsFetching(false);
      setHasError(false);
      setActiveIndex(-1);
      return;
    }

    const key = trimmed.toLowerCase();
    const cached = cacheRef.current.get(key);
    if (cached) {
      setResults(cached);
      setIsFetching(false);
      setHasError(false);
      setActiveIndex(-1);
      return;
    }

    setIsFetching(true);
    setHasError(false);
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const next = await fetchSuggestions(trimmed);
        if (cancelled) return;
        const cache = cacheRef.current;
        cache.set(key, next);
        if (cache.size > CACHE_MAX) {
          const oldest = cache.keys().next().value;
          if (oldest !== undefined) cache.delete(oldest);
        }
        setResults(next);
        setIsFetching(false);
        setActiveIndex(-1);
      } catch {
        if (cancelled) return;
        setResults([]);
        setIsFetching(false);
        setHasError(true);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed, isEditing, fetchSuggestions]);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    setIsEditing(true);
  }, []);

  const clear = useCallback(() => {
    setQueryState("");
    setIsEditing(true);
  }, []);

  /** Discard edits and show the URL's query again (used when the sheet closes). */
  const reset = useCallback(() => {
    setQueryState(urlQuery);
    setIsEditing(false);
    setActiveIndex(-1);
  }, [urlQuery]);

  // While the sheet is open the history entry it pushed must be replaced, not
  // stacked on: otherwise Back from the destination would re-open the sheet.
  const go = useCallback(
    (href: string) => {
      if (isSheetOpen) router.replace(href);
      else router.push(href);
    },
    [router, isSheetOpen]
  );

  const submit = useCallback(
    (term?: string): boolean => {
      const value = (term ?? query).trim();
      if (value.length < MIN_QUERY_LENGTH) return false;
      addRecentSearch(value);
      setIsEditing(false);
      go(searchHref(value));
      return true;
    },
    [query, go]
  );

  const openProduct = useCallback(
    (product: AutocompleteProduct) => {
      setIsEditing(false);
      go(productHref(product.slug.current));
    },
    [go]
  );

  const openEntry = useCallback(
    (entry: SuggestionEntry) => {
      setIsEditing(false);
      go(entry.href);
    },
    [go]
  );

  const optionId = useCallback((index: number) => `${idBase}-option-${index}`, [idBase]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, options: KeyDownOptions) => {
      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp": {
          if (trimmed.length < MIN_QUERY_LENGTH) return;
          e.preventDefault();
          if (!options.isOpen) {
            setIsEditing(true);
            options.onOpen?.();
            return;
          }
          const direction = e.key === "ArrowDown" ? 1 : -1;
          setActiveIndex((current) => {
            const next = current + direction;
            // Cycle: input (-1) -> first option -> ... -> last option -> input.
            if (next < -1) return optionCount - 1;
            if (next > optionCount - 1) return -1;
            return next;
          });
          return;
        }
        case "Enter": {
          if (!options.isOpen || !showSuggestions || activeIndex < 0) return;
          e.preventDefault();
          const productIndex = activeIndex - entries.length;
          if (activeIndex < entries.length) openEntry(entries[activeIndex]);
          else if (productIndex < results.length) openProduct(results[productIndex]);
          else submit();
          options.onActivate?.();
          return;
        }
        case "Escape": {
          if (options.onEscape?.()) e.preventDefault();
          return;
        }
      }
    },
    [trimmed, optionCount, showSuggestions, activeIndex, entries, results, openEntry, openProduct, submit]
  );

  let statusMessage = "";
  if (showSuggestions) {
    if (hasError) statusMessage = "Suggestions unavailable. Press Enter to search.";
    else if (results.length === 0 && isFetching) statusMessage = "Loading suggestions";
    else if (results.length === 0) statusMessage = "No quick matches. Press Enter to search.";
    else
      statusMessage = `${results.length} suggestion${results.length === 1 ? "" : "s"} available. Use the up and down arrow keys to review.`;
  }

  return {
    idBase,
    urlQuery,
    query,
    trimmed,
    setQuery,
    setEditing: setIsEditing,
    clear,
    reset,
    results,
    entries,
    openEntry,
    isFetching,
    hasError,
    showSuggestions,
    optionCount,
    activeIndex,
    setActiveIndex,
    optionId,
    statusMessage,
    handleKeyDown,
    submit,
    openProduct,
    go,
  };
}

export type SearchController = ReturnType<typeof useSearchController>;
