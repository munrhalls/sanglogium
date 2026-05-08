"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlass, X, ArrowLeft } from '@phosphor-icons/react';
import { cn } from '@/lib/utils/tailwind';
import { AutocompleteOverlay } from '@/app/components/features/search/AutocompleteOverlay';
import { searchProductsAutocomplete } from '@/sanity-cms/lib/products/searchProducts';
import type { AutocompleteProduct } from '@/sanity-cms/lib/products/searchProducts';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export default function SearchField() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteProduct[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
    setActiveIndex(-1);
    setAutocompleteResults([]);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return;
    closeOverlay();
    setMobileExpanded(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }, [query, router, closeOverlay]);

  const handleClear = useCallback(() => {
    setQuery('');
    closeOverlay();
    inputRef.current?.focus();
    mobileInputRef.current?.focus();
  }, [closeOverlay]);

  const handleMobileOpen = useCallback(() => {
    setMobileExpanded(true);
  }, []);

  const handleMobileClose = useCallback(() => {
    setMobileExpanded(false);
    setQuery('');
    closeOverlay();
  }, [closeOverlay]);

  const handleOverlayItemClick = useCallback(() => {
    closeOverlay();
    setMobileExpanded(false);
  }, [closeOverlay]);

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

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const results = await searchProductsAutocomplete(query);
        if (!controller.signal.aborted) {
          setAutocompleteResults(results);
          setActiveIndex(-1);
          setIsLoading(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, closeOverlay]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeOverlay();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeOverlay]);

  // Focus mobile input on expand
  useEffect(() => {
    if (mobileExpanded && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [mobileExpanded]);

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
          setMobileExpanded(false);
          router.push(`/product/${product.slug.current}`);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeOverlay();
        break;
    }
  }, [isOverlayOpen, activeIndex, autocompleteResults, closeOverlay, router]);

  const showOverlay = isOverlayOpen && query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <>
      {/* Mobile: icon-only trigger (visible below sm) */}
      <button
        type="button"
        onClick={handleMobileOpen}
        className="sm:hidden flex items-center justify-center w-9 h-9 text-secondary-500 hover:text-primary transition-colors"
        aria-label="Open search"
      >
        <MagnifyingGlass size={20} />
      </button>

      {/* Mobile: expanded full-width search overlay */}
      {mobileExpanded && (
        <div className="sm:hidden fixed inset-0 z-[60] bg-brand-900 flex flex-col">
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
                />
              )}
            </form>
          </div>
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
          />
        )}
      </div>
    </>
  );
}
