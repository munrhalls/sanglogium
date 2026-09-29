"use client";

import React, { useEffect, useRef, useState } from "react";
import type { FocusEvent, FormEvent, KeyboardEvent } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/tailwind";
import { AutocompletePanel } from "./AutocompletePanel";
import { SearchInput } from "./SearchInput";
import { SearchZeroQueryPanel } from "./SearchZeroQueryPanel";
import { MIN_QUERY_LENGTH } from "./useSearchController";
import type { SearchController } from "./useSearchController";

interface SearchFieldDesktopProps {
  search: SearchController;
  /** The mobile sheet owns search while it is open; this field stays quiet. */
  sheetOpen: boolean;
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName);
}

/**
 * Header search field for sm and up (tablet + desktop): a wide field whose
 * popup shows recent / browse / popular on focus and live product suggestions
 * once two characters are typed. Fully keyboard operable (arrows, Enter,
 * Escape, Tab) and reachable from anywhere with the `/` shortcut.
 */
export function SearchFieldDesktop({ search, sheetOpen }: SearchFieldDesktopProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showPopup = isOpen && !sheetOpen;
  const showSuggestions = showPopup && search.showSuggestions;
  const listboxId = `${search.idBase}-listbox`;

  const closePopup = () => {
    setIsOpen(false);
    search.setActiveIndex(-1);
    search.setEditing(false);
  };

  // `/` focuses the field from anywhere on the page (unless already typing).
  useEffect(() => {
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditable(e.target)) return;
      const input = inputRef.current;
      // offsetParent is null while the field is display:none (phones).
      if (!input || input.offsetParent === null) return;
      e.preventDefault();
      input.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    // Focus moving between the input and the popup's own controls keeps it open.
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) closePopup();
  };

  const finish = () => {
    inputRef.current?.blur();
    closePopup();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (search.submit()) finish();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) =>
    search.handleKeyDown(e, {
      isOpen: showPopup,
      onOpen: () => setIsOpen(true),
      onActivate: finish,
      onEscape: () => {
        if (showPopup) {
          closePopup();
          return true;
        }
        if (search.query) {
          search.clear();
          return true;
        }
        return false;
      },
    });

  return (
    <div
      onBlur={handleBlur}
      className="relative hidden min-w-0 flex-1 sm:mx-auto sm:block sm:max-w-md md:max-w-lg lg:max-w-xl"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => {
          // The form's 4px strips above/below the bar are part of the hit area.
          if (e.target === e.currentTarget) inputRef.current?.focus();
        }}
        role="search"
        aria-label="Search products"
        className="flex h-11 w-full items-center"
      >
        <div
          className={cn(
            "group flex h-9 w-full items-center rounded-md pl-4 lg:h-11",
            "bg-secondary-300 shadow-sm transition-all duration-300 ease-out",
            "hover:bg-secondary-100 focus-within:bg-brand-400 focus-within:shadow-md"
          )}
        >
          <MagnifyingGlass
            size={16}
            className="shrink-0 text-secondary-700 transition-colors duration-300 group-focus-within:text-brand-800"
            aria-hidden="true"
          />
          <SearchInput
            ref={inputRef}
            value={search.query}
            placeholder="Search headphones, IEMs, DACs..."
            expanded={showSuggestions}
            listboxId={showSuggestions ? listboxId : undefined}
            activeOptionId={
              showSuggestions && search.activeIndex >= 0
                ? search.optionId(search.activeIndex)
                : undefined
            }
            onChange={(e) => {
              search.setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsOpen(true);
              if (search.trimmed.length >= MIN_QUERY_LENGTH) search.setEditing(true);
            }}
            onKeyDown={handleKeyDown}
            className="px-3"
          />
          {search.query ? (
            <button
              type="button"
              onClick={() => {
                search.clear();
                setIsOpen(true);
                inputRef.current?.focus();
              }}
              className="-my-1 flex h-11 w-11 shrink-0 items-center justify-center text-secondary-700 transition-colors hover:text-brand-700 lg:my-0"
              aria-label="Clear search"
            >
              <X size={14} weight="bold" aria-hidden="true" />
            </button>
          ) : (
            <kbd
              aria-hidden="true"
              className="mr-3 hidden h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-secondary-500 font-sans text-xs text-secondary-700 group-focus-within:hidden pointer-fine:inline-flex"
            >
              /
            </kbd>
          )}
        </div>
      </form>

      <p role="status" className="sr-only">
        {showPopup ? search.statusMessage : ""}
      </p>

      {showPopup && (
        <div
          role="region"
          aria-label="Search suggestions"
          tabIndex={0}
          // Keep focus in the input when the popup is pressed (prevents the
          // blur-before-click race that would unmount a suggestion mid-tap).
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            "absolute left-0 top-full z-50 mt-2 w-full",
            "min-w-[min(30rem,calc(100vw_-_2rem))]",
            "max-h-[min(36rem,calc(100dvh_-_6rem))] overflow-y-auto overscroll-contain",
            "rounded-lg border border-border-secondary bg-surface-elevated shadow-cardDark"
          )}
        >
          {showSuggestions ? (
            <AutocompletePanel
              variant="popup"
              query={search.query}
              results={search.results}
              isFetching={search.isFetching}
              hasError={search.hasError}
              activeIndex={search.activeIndex}
              listboxId={listboxId}
              optionId={search.optionId}
              onActiveChange={search.setActiveIndex}
              onProductClick={(product) => {
                search.openProduct(product);
                finish();
              }}
              onViewAll={() => {
                if (search.submit()) finish();
              }}
              onNavigate={(href) => {
                search.go(href);
                finish();
              }}
            />
          ) : (
            <SearchZeroQueryPanel
              onSearchTerm={(term) => {
                if (search.submit(term)) finish();
              }}
              onNavigate={(href) => {
                search.go(href);
                finish();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
