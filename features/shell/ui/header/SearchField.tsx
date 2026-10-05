"use client";

import React, { useEffect, useRef } from "react";
import { SearchBarTrigger, SearchFieldDesktop, SearchSheet, useSearchController, useSearchOverlay } from "@/features/product-search";
import { fetchSearchSuggestions as searchProductsAutocomplete } from "@/features/product-search";

/**
 * Header search, composed from three surfaces that share one controller:
 *  - phones (<sm): a visible search bar (button) that opens a full-screen sheet
 *  - sm and up: the search field with its suggestion popup
 * The sheet's open state lives in the `search` URL param (useSearchOverlay) so
 * the bottom action bar's trigger and system Back both drive it.
 */
export default function SearchField() {
  const { isSearchOpen, openSearch, closeSearch } = useSearchOverlay();
  const search = useSearchController({ isSheetOpen: isSearchOpen, fetchSuggestions: searchProductsAutocomplete });
  const { reset } = search;

  // Whatever closes the sheet (back arrow, Escape, bottom-bar X, system Back,
  // a navigation), the field must fall back to the URL's query, not stale edits.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !isSearchOpen) reset();
    wasOpen.current = isSearchOpen;
  }, [isSearchOpen, reset]);

  // The sheet is a phone-only surface: if the viewport grows past `sm` while it
  // is open (rotation, resize) or the page loads on a wide screen with
  // ?search=true in the URL, close it instead of leaving the state dangling.
  useEffect(() => {
    if (!isSearchOpen) return;
    const query = window.matchMedia("(min-width: 640px)");
    const closeIfWide = () => {
      if (query.matches) closeSearch();
    };
    closeIfWide();
    query.addEventListener("change", closeIfWide);
    return () => query.removeEventListener("change", closeIfWide);
  }, [isSearchOpen, closeSearch]);

  return (
    <>
      <SearchBarTrigger query={search.urlQuery} onOpen={openSearch} />
      <SearchFieldDesktop search={search} sheetOpen={isSearchOpen} />
      {isSearchOpen && <SearchSheet search={search} onClose={closeSearch} />}
    </>
  );
}
