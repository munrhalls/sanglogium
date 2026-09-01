import { useQueryState, parseAsBoolean } from "nuqs";

// Shared open-state for the mobile full-screen search overlay. SearchField
// (header) renders the overlay; ActionBar (bottom nav) is a separate subtree,
// so the trigger and the overlay communicate through this URL param.
export function useSearchOverlay() {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsBoolean.withOptions({ history: "push" })
  );

  return {
    isSearchOpen: !!search,
    openSearch: () => setSearch(true),
    closeSearch: () => setSearch(null),
  };
}
