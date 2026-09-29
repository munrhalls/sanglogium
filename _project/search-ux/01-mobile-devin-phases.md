# Search UX — Turn 1 of 4: MOBILE (< 640px, i.e. below `sm`)

Paste ONE phase at a time to Devin. Finish a phase fully before the next. After Phase 6, open ONE PR.

## Global rules (Devin: read first, apply to every phase)

- Scope = search UX on **mobile only** (`< sm`). Do not change any `sm:`/`md:`/`lg*:` behaviour or look. Shared components: only mobile-first base classes, desktop must render identically.
- **Banned:** `tsc`, `next build`, lint, tests, `npm run dev`, curl, Lighthouse, `npm install`, no-mistakes, subagents. Edit source only; human checks live on `localhost:3000`. No `$(...)`/backticks in shell commands.
- Minimal diff. No new deps, no new abstractions beyond what a task names.
- Any edit to `h-full` / `min-h-` / `max-h-` / `aspect-` under `app/components/**`: re-read your diff against `docs/vertical-space-lg-touch.md` before finishing.
- Touch targets ≥ 44×44px. Text inputs ≥ 16px font (no iOS zoom).
- Setup once: `bd create` ONE issue "Search UX mobile"; work on branch `search-ux/mobile`: if it does not exist, `git switch -c search-ux/mobile main` (this file `_project/search-ux/01-mobile-devin-phases.md` is the only thing that should ride along; commit it first). Commit per phase (`git commit`, no push until Phase 6).

## Verified current state (read from code, 2026-09-29)

Files: `app/components/layout/header/SearchField.tsx` (mobile overlay = `sm:hidden fixed inset-0`, opened via `?search=true` through `app/hooks/nuqs/useSearchOverlay.ts`; trigger lives in the bottom action bar, id `mobile-search-trigger`), `app/components/features/search/{AutocompleteOverlay,AutocompleteItem,SearchZeroQueryPanel,recentSearches,SearchHeader,SearchEmpty,SearchPagination}`, `app/(store)/search/{page,SearchResults}.tsx`, `sanity-cms/lib/products/searchProducts.ts`.

Gaps found (each maps to a task below):
- Input is `type="text"` with no `enterKeyHint`/`autoComplete`/`autoCorrect`/`autoCapitalize`/`spellCheck`; height 36px; close button 36px; clear "X" is 14px with no padding.
- Autocomplete dropdown is `absolute top-full` inside the 56px header row: unbounded height, floats over the surface, can run under the keyboard.
- `AutocompleteItem`: `p-3` is on the `<li>`, the `<Link>` is inside → 12px dead tap ring. Skeleton hides its thumbnail below `md` while real rows show one → layout jump.
- Every keystroke flips to skeleton even when results already exist → flicker.
- ARIA: input lacks `role="combobox"`/`aria-autocomplete`; `role="listbox"` wraps `<ul>`s, headers and links (invalid); same id `autocomplete-listbox` is rendered by both mobile and desktop trees; no live-region announcement.
- `handleMobileClose` wipes the query; reopening the overlay on `/search?q=foo` shows an empty field. No scroll lock behind the overlay.
- Results page on mobile shows no visible/editable query (header field is `hidden sm:block`); breadcrumb + overline + huge uppercase H1 eat the fold; long query overflows; count reads "1 products".
- `SearchPagination` uses `scroll={false}`: tapping Next at the bottom leaves the user at the bottom of the new page; one-row layout overflows at 320px; targets ~32px.
- `SearchEmpty`: `<h3>` under `<h1>` (skipped level); 1-char query says "couldn't find…"; buttons small.
- No sort on results (`searchProductsFull(q, undefined, page)` ignores `sort`).
- Recent searches: no per-item remove.

Deliberately out of scope (later, non-mobile-size work): faceted filters on results, typo tolerance / "did you mean", server-side ranking changes.

---

## Phase 1 — Field, touch targets, focus, scroll lock  (`SearchField.tsx`, mobile overlay branch only)

- T1.1 Mobile `<input>`: `type="search"`, `inputMode="search"`, `enterKeyHint="search"`, `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="off"`, `spellCheck={false}`, `role="combobox"`, `aria-autocomplete="list"`, `aria-haspopup="listbox"`. Add a `[&::-webkit-search-cancel-button]:hidden` (we have our own clear).
- T1.2 Confirm the `text-body` token is ≥16px at base; if not, add `text-base` on the mobile input only.
- T1.3 Sizes: field row `h-11` (44px); back button `w-11 h-11`; clear button `w-11 h-11` (icon stays ~16px, `-mr-2` to keep visual alignment).
- T1.4 `handleMobileClose` must not blank the field: reset `query` to the URL's `q` (`initialQuery`) instead of `''`. On open, focus and `select()` the input so a prefilled query is one tap to replace.
- T1.5 While `mobileExpanded`: lock body scroll (`document.body.style.overflow='hidden'`, restore in cleanup) and add `overscroll-contain` to the overlay's scroll regions.
- T1.6 Give the mobile and desktop listboxes distinct ids (prop `listboxId` on `AutocompleteOverlay`; `aria-controls`/`aria-activedescendant` on each input use its own id; item ids derive from it). Keep desktop visuals unchanged.

Done =
- [ ] (a) iOS-style keyboard shows a "Search" key; no autocorrect/capitalise on the query
- [ ] (b) back/clear/field are ≥44px, layout in the 56px row not broken at 320px
- [ ] (c) open overlay on `/search?q=foo` → field is prefilled and selected; close → still `foo`
- [ ] (d) page behind does not scroll while overlay is open
- [ ] (e) no duplicate DOM ids for the listbox

## Phase 2 — Autocomplete panel on mobile  (`SearchField.tsx`, `AutocompleteOverlay.tsx`, `AutocompleteItem.tsx`)

- T2.1 Mobile only: render `AutocompleteOverlay` **outside** the `<form>` as the overlay's `flex-1 min-h-0 overflow-y-auto overscroll-contain` region under the header row (in-flow, full-bleed, `bg-surface-elevated`, no card border/radius/shadow/`mt-2`/`absolute`) — same flattening the zero-query panel already gets. Desktop keeps its current absolute dropdown. Add `pb-[env(safe-area-inset-bottom)]`.
- T2.2 `AutocompleteItem`: move the `p-3` from `<li>` to the `<Link>` (`min-h-[56px]`) so the whole row is tappable; `li` keeps bg/active styling. Visually identical on desktop.
- T2.3 Skeleton: show the thumbnail placeholder at all widths (drop `hidden md:block`).
- T2.4 No flicker: keep previous `autocompleteResults` while a new fetch is in flight; show skeleton only when there are no results yet. Dim the stale list slightly (`opacity-60`) while `isLoading`. (Do not clear results in the effect except via `closeOverlay`.)
- T2.5 Highlight the matched substring in the product name (`<strong className="font-semibold">`, case-insensitive, first match, plain string ops, no regex from raw input).
- T2.6 Move "View all results for '…'" to the **top** of the list on mobile as a 44px row (thumb-reachable, visible without scrolling); keep it at the bottom on desktop.
- T2.7 ARIA: put `role="listbox"` on the `<ul>` of options only; wrapper div loses the role; headers/links/empty-state stay outside it. Add a visually-hidden `role="status"` line: "N suggestions" / "No suggestions" / "Loading suggestions".

Done =
- [ ] (a) suggestions fill the area under the field, scroll inside the overlay, never run under the top/bottom edge
- [ ] (b) tapping anywhere on a row (incl. padding) navigates
- [ ] (c) typing fast does not flash skeletons once results exist; no thumbnail layout jump
- [ ] (d) matched text is bold; "View all results" is the first row
- [ ] (e) desktop dropdown looks/behaves exactly as before

## Phase 3 — Zero-query panel  (`SearchZeroQueryPanel.tsx`, `recentSearches.ts`)

- T3.1 Per-row remove: a 44×44 "×" button at the end of each Recent row (`aria-label="Remove <term>"`), new `removeRecentSearch(term)` helper (case-insensitive, same try/catch style as siblings). Row tap area stays ≥44px tall; the row button and × are siblings (no nested buttons).
- T3.2 Keep "Clear" (already 44px). Make sure the panel scrolls inside the overlay on 320×568.

Done =
- [ ] (a) remove one recent term without closing the overlay
- [ ] (b) no nested interactive elements; all targets ≥44px

## Phase 4 — Results header, query chip, count, empty state  (`SearchHeader.tsx`, `SearchResults.tsx`, `SearchEmpty.tsx`, new tiny client component)

- T4.1 New `app/components/features/search/SearchQueryBar.tsx` (`"use client"`, `sm:hidden`): a 44px full-width button styled like the header field showing the magnifier, the current query (truncated) and a clear "×". Tap the bar → `openSearch()` from `useSearchOverlay` (field is prefilled, Phase 1). Tap "×" → `router.push('/search')` after stopping propagation. Render it at the top of `SearchHeader` output (above the H1), only when `query` is non-empty.
- T4.2 `SearchHeader` mobile compaction (base classes only): hide the breadcrumb below `sm` (`hidden sm:flex`); tighter `mb`; H1 gets `break-words` and `line-clamp-2`, and the uppercase quote style scales down at base (`text-2xl`-equivalent existing token, check tokens). Keep the H1 in the DOM.
- T4.3 `SearchResults`: pluralise — `1 product` / `N products`. Put the count and (Phase 5) sort on one row.
- T4.4 `SearchEmpty`: `<h3>` → `<h2>`; if `query.trim().length` is 1, message "Type at least 2 characters"; category buttons become a 2-column grid on mobile with `min-h-[44px]`; "Browse all products" stays a ≥44px ghost link. Also add a one-line tip "Check spelling or try a brand or model name."

Done =
- [ ] (a) on `/search?q=hd800` mobile the query is visible, tap opens prefilled overlay, × returns to empty `/search`
- [ ] (b) results start higher on screen (no breadcrumb); 60-char query wraps/clamps without horizontal scroll
- [ ] (c) "1 product" singular; empty state has correct heading level and 44px buttons

## Phase 5 — Pagination + sort  (`SearchPagination.tsx`, `searchProducts.ts`, `page.tsx`, new tiny sort control)

- T5.1 `SearchPagination`: remove `scroll={false}` from both Links so page change scrolls to top. Mobile layout: stack (`flex-col gap-3`, `sm:flex-row sm:justify-between`), Previous/Next `min-h-[44px] flex-1 sm:flex-none` centred, "Showing X–Y of Z" and "Page a of b" on their own lines. No overflow at 320px.
- T5.2 `searchProductsFull`: honour the existing `sort` arg with a whitelist: `relevance` (default, current behaviour), `price-asc`, `price-desc`, `name-asc`. Apply to the already in-memory `products` array before slicing (price = `price_data.unit_amount`; ties fall back to the relevance comparator). Unknown values → relevance.
- T5.3 `page.tsx`: read `sort` from `searchParams` (same string-or-array handling as `q`), pass it through.
- T5.4 New `SearchSort.tsx` (`"use client"`): native `<select>` (best mobile picker), label "Sort", 44px tall, options above. On change: keep `q`, set/delete `sort`, delete `page`, `router.push`. Render in the count row of `SearchResults`.

Done =
- [ ] (a) tapping Next at the bottom lands at the top of page 2
- [ ] (b) sort options reorder results; changing sort resets to page 1; URL keeps `q`
- [ ] (c) pagination fits 320px, targets ≥44px

## Phase 6 — Bottom trigger audit + final pass + PR

- T6.1 Locate the trigger (`grep -rn "mobile-search-trigger" app`). Ensure: ≥44px target, `aria-label="Search"`, `aria-haspopup="dialog"`, `aria-expanded={isSearchOpen}`, visible focus ring, safe-area padding intact. Fix only what is missing.
- T6.2 Re-read the full diff once: no `sm:+` changes, no leftover debug, no dead imports.
- T6.3 Push `search-ux/mobile` and open the PR with `npx -y gh-axi` (title "Search UX: mobile"). **No no-mistakes, no CI waiting.**
- T6.4 Hand the human this live check (localhost:3000, DevTools 375×812 then 320×568): open search → type "hd800" → tap suggestion; submit → results → edit via query bar → sort → Next page; empty query "zzzz"; 1 char; recent remove/clear; back button closes overlay.

Done =
- [ ] (a) PR open, diff limited to files named above
- [ ] (b) human checklist delivered
