"use client";

import React, { useEffect, useRef } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { ArrowLeft, MagnifyingGlass, X } from "@phosphor-icons/react";
import { cn } from "@/platform/utils/tailwind";
import { AutocompletePanel } from "./AutocompletePanel";
import { SearchInput } from "./SearchInput";
import { SearchZeroQueryPanel } from "./SearchZeroQueryPanel";
import { useVisualViewportBox } from "@/features/product-search/model/useVisualViewportBox";
import type { SearchController } from "@/features/product-search/model/useSearchController";

interface SearchSheetProps {
  search: SearchController;
  onClose: () => void;
}

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled])';

/**
 * Mobile (<sm) full-screen search. A modal dialog that is sized from the
 * *visual* viewport, so the scroll area, and the sticky "see all results" row
 * at its foot, always end above the on-screen keyboard instead of behind it.
 *
 * It stays below the bottom action bar (which swaps to an X while search is
 * open), so when no keyboard is up the list stops at the bar's top edge.
 */
export function SearchSheet({ search, onClose }: SearchSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const box = useVisualViewportBox();
  const listboxId = `${search.idBase}-listbox`;
  const showSuggestions = search.showSuggestions;

  // Focus the field on open and select a prefilled query so typing replaces it.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.focus({ preventScroll: true });
    if (input.value) input.select();
  }, []);

  const close = () => {
    onClose();
    // Give focus back to the control that opened the sheet (dialog semantics).
    (
      document.getElementById("mobile-search-trigger") ??
      document.getElementById("mobile-search-bar")
    )?.focus();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (search.submit()) inputRef.current?.blur();
  };

  const handleDialogKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab") return;

    // Keep Tab / Shift+Tab inside the dialog.
    const focusable = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.tabIndex >= 0 && el.getClientRects().length > 0
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) =>
    search.handleKeyDown(e, {
      isOpen: showSuggestions,
      onActivate: () => inputRef.current?.blur(),
      // Escape is handled once, by the dialog.
    });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
      onKeyDown={handleDialogKeyDown}
      className="fixed inset-x-0 top-0 z-[60] flex h-dvh flex-col bg-surface-elevated motion-safe:animate-search-sheet-in sm:hidden"
      style={box ? { top: box.top, height: box.height } : undefined}
    >
      <div
        className="shrink-0 border-b border-border-secondary pb-2 pl-1 pr-3"
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      >
        <div className="flex h-11 items-center gap-1">
        <button
          type="button"
          onClick={close}
          className="flex h-11 w-11 shrink-0 items-center justify-center text-secondary-400 transition-colors hover:text-primary"
          aria-label="Close search"
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </button>

        <form onSubmit={handleSubmit} role="search" aria-label="Search products" className="min-w-0 flex-1">
          <div
            className={cn(
              "flex h-11 items-center rounded-md bg-secondary-300 pl-3",
              "transition-colors duration-300 focus-within:bg-brand-400"
            )}
          >
            <MagnifyingGlass size={18} className="shrink-0 text-secondary-700" aria-hidden="true" />
            <SearchInput
              ref={inputRef}
              value={search.query}
              placeholder="Search products"
              expanded={showSuggestions}
              listboxId={showSuggestions ? listboxId : undefined}
              activeOptionId={
                showSuggestions && search.activeIndex >= 0
                  ? search.optionId(search.activeIndex)
                  : undefined
              }
              onChange={(e) => search.setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="px-2"
            />
            {search.query && (
              <button
                type="button"
                onClick={() => {
                  search.clear();
                  inputRef.current?.focus();
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center text-secondary-700 transition-colors hover:text-brand-700"
                aria-label="Clear search"
              >
                <X size={16} weight="bold" aria-hidden="true" />
              </button>
            )}
          </div>
        </form>
        </div>
      </div>

      <p role="status" className="sr-only">
        {search.statusMessage}
      </p>

      <div
        role="region"
        aria-label="Search suggestions"
        // Focusable so keyboard users can scroll it (options themselves are
        // reached with the arrow keys via aria-activedescendant, not Tab).
        tabIndex={0}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain focus-visible:outline-none",
          // No keyboard: the bottom action bar covers the sheet's lower edge,
          // so end the scroll area above it. With the keyboard up the bar is
          // hidden behind it and the area runs the full visible height.
          !box?.keyboardOpen && "mb-[var(--mobile-menu-h)]"
        )}
      >
        {showSuggestions ? (
          <AutocompletePanel
            variant="sheet"
            query={search.query}
            results={search.results}
            entries={search.entries}
            isFetching={search.isFetching}
            hasError={search.hasError}
            activeIndex={search.activeIndex}
            listboxId={listboxId}
            optionId={search.optionId}
            onActiveChange={search.setActiveIndex}
            onProductClick={search.openProduct}
            onEntryClick={search.openEntry}
            onViewAll={() => search.submit()}
            onNavigate={search.go}
          />
        ) : (
          <SearchZeroQueryPanel
            onSearchTerm={(term) => {
              search.submit(term);
            }}
            onNavigate={search.go}
          />
        )}
      </div>
    </div>
  );
}
