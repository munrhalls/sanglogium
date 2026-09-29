# Search UX — architect handoff (as of 2026-09-29)

## Role and axis
- You are the architect: output phases and tasks only (as `.md` in `_project/search-ux/`) for Devin, which the user pastes one phase at a time. No implementation by you. Invoke `/architect` if available.
- Axis: search UX only. Four size turns: 1 mobile (DONE), 2 tablet, 3 small desktop, 4 desktop + final checks. Bug patches ride alongside.
- Bar: elite professional, 8+/10. Each turn ends with one Devin PR. No no-mistakes, no builds, speed first.

## Hard rules (repo + user)
- Never run tsc/build/lint/tests/dev server/curl, never use subagents. User checks live on `localhost:3000`. Devin gets the same ban.
- No `$(...)` or backticks in shell commands. Print paths as `file://` URIs. Chat answers short; deliverables in files.
- Plan format that worked: numbered phases, small tasks with file refs, `Done =` checklist `- [ ] (a)`, a human live-check list, PR via `npx -y gh-axi`.
- Bash classifier sometimes errors transiently; retry, or use Read on known paths meanwhile.

## Current search architecture (on main; read `docs/search-ux.md` first)
- Phones (<sm): `SearchBarTrigger` in header opens `SearchSheet` (full-screen dialog, sized by `useVisualViewportBox`); bottom-bar trigger `#mobile-search-trigger` opens it via `?search=true` (`useSearchOverlay`).
- sm+: `SearchFieldDesktop` popup. Shared: `useSearchController`, `AutocompletePanel` (variant popup|sheet), `SearchInput`, `SearchZeroQueryPanel`, `searchLinks`, `recentSearches`, `HighlightedText`. Composed by `app/components/layout/header/SearchField.tsx`.
- `/search`: `app/(store)/search/{page,SearchResults}.tsx`, `SearchHeader`, `SearchEmpty`, `SearchPagination` (numbered pills on tablet/desktop). Ranking + queries: `sanity-cms/lib/products/searchProducts.ts` (in-memory scoring over ≤2000 matches). Redirects: `lib/catalogue/detectSearchRedirect.ts`.
- Image reveal trap: `ProductImage` blurs until `data-shown` is set by `ImageRevealScript` (only in `ProductGrid`); use `reveal={false}` for thumbnails outside grids (`AI_LESSONS` L03/L06/L07/L11).
- Breakpoints: `sm` 640; `lg-touch` / `lg-desktop` are height-split and don't inherit (`docs/vertical-space-lg-touch.md`).

## State
- On main: sheet rebuild (PR #5), numbered pagination (#11), suggestion-thumbnail blur fix, sheet top-spacing/safe-area fix (#14). Both fixes live-verified by the user.
- Open: PR #12 "Search results: sort control + scroll-to-top on page change" (branch `search-ux/mobile`, resolved against main, not merged, not live-checked). Adds `SearchSort`, sort in `searchProductsFull` + `page.tsx`, removes `scroll={false}` from pagination.
- Local checkout was dirty and diverged; user was committing everything and rebasing onto origin/main. Temp worktree `scratchpad/pr12` may still exist (`git worktree remove`).

## Known gaps not yet done (from my mobile audit; re-verify against code before planning)
- Faceted filters on results, typo tolerance / "did you mean", server-side ranking changes: deliberately out of scope so far.
- Tablet-specific check of the sm+ popup (it is the tablet surface too): width, touch targets, keyboard, `sm`–`lg` header layout, results grid columns, pagination pills.
- Sort control was only designed for phones; check it at sm+.

## Next step
Turn 2 (tablet, ~640–1023px): gather intel from the files above, gap-scan, gap-close, then write `_project/search-ux/04-tablet-devin-phases.md` (same format), on a fresh branch from updated `origin/main`. Read the actual files; don't rely on this summary for values.
