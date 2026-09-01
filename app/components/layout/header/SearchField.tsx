"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlass, X, ArrowLeft } from '@phosphor-icons/react';
import { cn } from '@/lib/utils/tailwind';
import { AutocompleteOverlay } from '@/app/components/features/search/AutocompleteOverlay';
import { useSearchOverlay } from '@/app/hooks/nuqs/useSearchOverlay';
import { SearchZeroQueryPanel } from '@/app/components/features/search/SearchZeroQueryPanel';
import { addRecentSearch } from '@/app/components/features/search/recentSearches';
import { searchProductsAutocomplete } from '@/sanity-cms/lib/products/searchProducts';
import type { AutocompleteProduct } from '@/sanity-cms/lib/products/searchProducts';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export default function SearchField() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const { isSearchOpen: mobileExpanded, closeSearch } = useSearchOverlay();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteProduct[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [autocompleteError, setAutocompleteError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
    setActiveIndex(-1);
    setAutocompleteResults([]);
    setAutocompleteError(false);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return;
    addRecentSearch(trimmed);
    closeOverlay();
    // See runSearchTerm: the results URL has no `search` param, so the overlay
    // closes itself. Calling the nuqs setter here races the push and swallows it.
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }, [query, router, closeOverlay]);

  // Zero-query panel: a tapped recent/popular term reuses the existing search path.
  const runSearchTerm = useCallback((term: string) => {
    const trimmed = term.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return;
    addRecentSearch(trimmed);
    closeOverlay();
    // Navigate straight to the results route. That URL carries no `search`
    // param, so the overlay (driven by that param) closes on its own — calling
    // the nuqs setter here as well races the push and can swallow it.
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }, [router, closeOverlay]);

  const handleClear = useCallback(() => {
    setQuery('');
    closeOverlay();
    inputRef.current?.focus();
    mobileInputRef.current?.focus();
  }, [closeOverlay]);

  const handleMobileClose = useCallback(() => {
    closeSearch();
    setQuery('');
    closeOverlay();
    // Restore focus to the bottom-nav search trigger (G7) so keyboard/screen-reader
    // users keep their context when the mobile search overlay closes.
    document.getElementById('mobile-search-trigger')?.focus();
  }, [closeOverlay, closeSearch]);

  const handleOverlayItemClick = useCallback(() => {
    closeOverlay();
    closeSearch();
  }, [closeOverlay, closeSearch]);

  // Debounced autocomplete fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (query.trim().length < MIN_QUERY_LENGTH) {
      closeOverlay();
      return;
    }

    setIsLoading(true);
    setIsOverlayOpen(true);
    setAutocompleteError(false);

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const results = await searchProductsAutocomplete(query);
        if (!controller.signal.aborted) {
          setAutocompleteResults(results);
          setActiveIndex(-1);
          setIsLoading(false);
          setAutocompleteError(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setAutocompleteError(true);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, closeOverlay]);

  // Click outside to close (desktop only; mobile overlay is modal)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mobileExpanded) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeOverlay();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeOverlay, mobileExpanded]);

  // Focus mobile input on expand
  useEffect(() => {
    if (mobileExpanded && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [mobileExpanded]);

  // Escape closes the mobile search overlay (dialog semantics, G7).
  useEffect(() => {
    if (!mobileExpanded) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleMobileClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileExpanded, handleMobileClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOverlayOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev =>
          prev < autocompleteResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (activeIndex >= 0 && autocompleteResults[activeIndex]) {
          e.preventDefault();
          const product = autocompleteResults[activeIndex];
          closeOverlay();
          closeSearch();
          router.push(`/product/${product.slug.current}`);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeOverlay();
        break;
    }
  }, [isOverlayOpen, activeIndex, autocompleteResults, closeOverlay, closeSearch, router]);

  const showOverlay = isOverlayOpen && query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <>
      {/* Mobile: expanded full-width search overlay.
          The trigger lives in the bottom action bar (ActionBar); it opens this
          overlay via the shared `search` URL param (useSearchOverlay). */}
      {mobileExpanded && (
        <div
          className="sm:hidden fixed inset-0 z-[60] bg-brand-900 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Search products"
        >
          <div className="flex items-center gap-2 h-[var(--mobile-header-h)] px-4">
            <button
              type="button"
              onClick={handleMobileClose}
              className="flex items-center justify-center w-9 h-9 text-secondary-500 hover:text-primary transition-colors"
              aria-label="Close search"
            >
              <ArrowLeft size={20} />
            </button>
            <form
              onSubmit={handleSubmit}
              role="search"
              aria-label="Search products"
              className="flex-1 relative"
            >
              <div
                className={cn(
                  "flex items-center gap-3 px-3 h-9 w-full",
                  "bg-secondary-300 transition-all duration-300",
                  "focus-within:bg-brand-400 focus-within:shadow-md"
                )}
                style={{ borderRadius: '3px' }}
              >
                <MagnifyingGlass
                  size={16}
                  className="shrink-0 text-secondary-600 transition-colors duration-300"
                />
                <input
                  ref={mobileInputRef}
                  type="text"
                  placeholder="Search products..."
                  aria-label="Search products"
                  aria-expanded={showOverlay}
                  aria-controls="autocomplete-listbox"
                  aria-activedescendant={activeIndex >= 0 ? `autocomplete-item-${activeIndex}` : undefined}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={500}
                  className={cn(
                    "w-full border-none bg-transparent outline-none",
                    "text-body text-brand-700 transition-colors duration-300",
                    "selection:bg-brand-700 selection:text-brand-400",
                    "placeholder:text-secondary-600 focus:placeholder:text-brand-800"
                  )}
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="shrink-0 text-secondary-500 hover:text-primary transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {showOverlay && (
                <AutocompleteOverlay
                  results={autocompleteResults}
                  query={query}
                  activeIndex={activeIndex}
                  isLoading={isLoading}
                  showThumbnails={false}
                  onItemClick={handleOverlayItemClick}
                  error={autocompleteError}
                />
              )}
            </form>
          </div>
          {query.trim().length < MIN_QUERY_LENGTH && (
            // Full-bleed, full-height on mobile: this wrapper owns the surface and
            // runs edge-to-edge down to the bottom of the overlay. The zero-query
            // panel's own card chrome (inset margin, border, radius, shadow) is
            // flattened here so there is no floating card and no black dead space.
            <div
              className={cn(
                "flex-1 min-h-0 overflow-y-auto bg-surface-elevated",
                "[&>div]:mt-0 [&>div]:border-0 [&>div]:rounded-none [&>div]:shadow-none [&>div]:bg-transparent"
              )}
            >
              <SearchZeroQueryPanel onSelect={runSearchTerm} />
            </div>
          )}
        </div>
      )}

      {/* Desktop: visible search field (hidden below sm) */}
      <div ref={containerRef} className="hidden sm:block relative">
        <form
          onSubmit={handleSubmit}
          role="search"
          aria-label="Search products"
        >
          <div
            className={cn(
              "group flex items-center gap-4 px-4 h-9",
              "sm:max-w-xs md:max-w-sm lg-desktop:max-w-xl lg-touch:max-w-md",
              "bg-secondary-300 shadow-sm transition-all duration-300 ease-out",
              "hover:bg-secondary-100",
              "focus-within:bg-brand-400 focus-within:shadow-md"
            )}
            style={{ borderRadius: '3px' }}
          >
            <MagnifyingGlass
              size={16}
              className={cn(
                "shrink-0 transition-all duration-300",
                "text-secondary-600",
                "group-focus-within:text-brand-800"
              )}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              aria-label="Search products"
              aria-expanded={showOverlay}
              aria-controls="autocomplete-listbox"
              aria-activedescendant={activeIndex >= 0 ? `autocomplete-item-${activeIndex}` : undefined}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (query.trim().length >= MIN_QUERY_LENGTH && autocompleteResults.length > 0) {
                  setIsOverlayOpen(true);
                }
              }}
              maxLength={500}
              className={cn(
                "w-full border-none bg-transparent outline-none",
                "text-body text-brand-700 transition-colors duration-300",
                "selection:bg-brand-700 selection:text-brand-400",
                "placeholder:text-secondary-600 focus:placeholder:text-brand-800"
              )}
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="shrink-0 text-secondary-500 hover:text-primary transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </form>
        {showOverlay && (
          <AutocompleteOverlay
            results={autocompleteResults}
            query={query}
            activeIndex={activeIndex}
            isLoading={isLoading}
            showThumbnails={true}
            onItemClick={handleOverlayItemClick}
            error={autocompleteError}
          />
        )}
      </div>
    </>
  );
}
