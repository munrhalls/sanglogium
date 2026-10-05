"use client";

import React from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/platform/utils/tailwind";

interface SearchBarTriggerProps {
  /** The query currently shown on the results page, if any. */
  query: string;
  onOpen: () => void;
}

/**
 * Phone (<sm) header search bar. It looks like a field but is a button: the
 * real input lives in the full-screen sheet so the keyboard opens over a screen
 * that has room for suggestions. Shows the active query on the results page so
 * it is always visible and one tap away from being edited.
 */
export function SearchBarTrigger({ query, onOpen }: SearchBarTriggerProps) {
  return (
    <button
      id="mobile-search-bar"
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={query ? `Search products, current search ${query}` : "Search products"}
      // The button owns the full 44px header height as its hit area; the visible
      // bar inside it is 36px so the header keeps its breathing room.
      className="group flex h-11 min-w-0 flex-1 touch-manipulation items-center sm:hidden"
    >
      <span
        className={cn(
          "flex h-9 w-full min-w-0 items-center gap-2 rounded-md bg-secondary-300 px-3 text-left",
          "transition-colors duration-150 group-active:bg-brand-400",
          "group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-brand-400"
        )}
      >
        <MagnifyingGlass size={16} weight="bold" className="shrink-0 text-secondary-700" aria-hidden="true" />
        <span className="type-body truncate text-brand-700">
          {query || <span className="text-secondary-700">Search products</span>}
        </span>
      </span>
    </button>
  );
}
