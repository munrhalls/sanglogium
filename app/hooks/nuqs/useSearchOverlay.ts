import { useCallback, useEffect } from "react";
import { useQueryState, parseAsBoolean } from "nuqs";

// True only while the overlay is open AND was opened by an in-app push, i.e. the
// previous history entry is the page the shopper came from.
let openedByPush = false;

// Shared open-state for the mobile full-screen search sheet. SearchField
// (header) renders the sheet; ActionBar (bottom nav) is a separate subtree,
// so the trigger and the sheet communicate through this URL param.
//
// History contract: opening pushes an entry (so the system Back gesture closes
// the sheet), and closing pops that same entry. Closing must never push a new
// entry, otherwise Back would re-open the sheet the shopper just dismissed.
export function useSearchOverlay() {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsBoolean.withOptions({ history: "push" })
  );
  const isSearchOpen = !!search;

  useEffect(() => {
    if (!isSearchOpen) openedByPush = false;
  }, [isSearchOpen]);

  const openSearch = useCallback(() => {
    openedByPush = true;
    void setSearch(true);
  }, [setSearch]);

  const closeSearch = useCallback(() => {
    if (openedByPush) {
      openedByPush = false;
      window.history.back();
      return;
    }
    // Arrived on a URL that already carried ?search=true (reload, shared link):
    // there is no entry of ours to pop, so drop the param in place.
    void setSearch(null, { history: "replace" });
  }, [setSearch]);

  return { isSearchOpen, openSearch, closeSearch };
}
