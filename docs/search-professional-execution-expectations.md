# Sang Logium — Search: Professional Execution Expectations

*2026-08-19. Intel gathered from: (1) authoritative framework docs — **nuqs v2.8.9** docs
(`nuqs.dev/docs/*`), **Next.js 15.5.x** pinned docs (`nextjs.org/docs/15/...`), **React 19**
reference (`react.dev`), **Sanity GROQ** docs (the `match` operator); (2) the repo's own
requirement matrix (`tests/catalogue/filters-sorting-matrix.spec.ts`, tags A*/B*/T* — the
catalogue program's requirements that the search surface is expected to match); (3) verified
current source state. Basis for `docs/search-professional-audit-gaps.md`.*

---

## Part A — What "professional execution" means in this stack (intel distillate)

1. **The URL is the single source of truth.** Query state (`q`, `sort`, `page`) must be
   deep-linkable and shareable; the server renders from the awaited `searchParams` page prop
   and the client writes through one shared parser contract (`nuqs/server` `createLoader` +
   the same parsers in `useQueryState`) so SSR and CSR can never drift.
2. **`shallow:false` + SSR-friendly throttling.** nuqs's own invariant (error 422):
   `limitUrlUpdates: debounce` should be used in SSR scenarios **with** `shallow: false`;
   throttle URL writes, use `clearOnDefault` for clean URLs.
3. **Server truth, streamed.** Next.js 15: `searchParams` is a Promise, awaited in the page;
   pass promises into `<Suspense>` children so the shell renders immediately. React `cache()`
   dedupes; `Promise.all` fans out independent queries (count + window).
4. **`useSearchParams` requires a Suspense boundary** in client components during prerender.
5. **Search results must respect the user's explicit ordering.** Relevance scoring is the
   *default* ordering; once the user picks a sort, that sort must be the actual order of the
   page window (applied before slicing), not a tiebreaker inside relevance buckets.
6. **Security by construction.** Sort values are allowlisted → literal GROQ `order` clauses;
   query strings are trimmed and never concatenated into the query except as a GROQ `match`
   parameter; the CDN read client (`useCdn:true`) is the only public path.
7. **Edge states are designed, not accidental.** Empty query, zero results (with next
   actions), out-of-range page (clamp, don't lie), Sanity failure (graceful empty + error
   surface with retry).
8. **SEO parity with URL state.** `/search` base is indexable; query permutations
   (`?q=`, `?sort=`, `?page=`) are `noindex,follow`; ordering is deterministic.
9. **Accessibility is non-negotiable.** Search input labelled, autocomplete follows the ARIA
   combobox/listbox pattern (`role=listbox`, `role=option`, `aria-activedescendant`,
   `aria-expanded`, `aria-controls`), mobile overlay is a real dialog (Escape-to-close,
   focus restore to trigger, focus trap).
10. **Performance discipline.** Debounce + abort autocomplete requests; server-side GROQ
    with parallel count+window; no client filter runtime; 6-item autocomplete cap.

---

## Part B — Key expectations of professional search execution (given this stack)

**E1 — URL is the single, deep-linkable source of truth for q/sort/page.**
Authority: nuqs docs (shallow/history/SEO). Repo reqs: A3/B12/T1.3–T1.7 (by analogy).
Status: **partial** — `q`/`sort`/`page` round-trip in the URL (`page.tsx:13-16`) but there
is no shared contract behind them.

**E2 — One parser contract shared by client and server (no SSR↔CSR drift).**
Authority: nuqs `createLoader` (`nuqs/server`) + "reuse in `useQueryStates`". Repo: A3/B12/T1.5.
Status: **gap** — the search route parses params ad hoc (`page.tsx:13-16`) while the client
`SortDropdown` writes via nuqs parsers from `filterParams.ts:57-71`; the server data layer
re-parses with its own allowlist (`searchProducts.ts:87-92`). Two contracts = drift (G1/G3).

**E3 — Server renders truth from the awaited `searchParams` page prop; client reads via
`useSearchParams` inside a Suspense boundary.**
Authority: Next.js `page.js` (searchParams Promise) + `useSearchParams` (Suspense during
prerender). Status: **implemented** — `page.tsx:12` awaits; `Header.tsx:20-22` wraps
`SearchField` in `<Suspense>`; `SearchResults` streams under `page.tsx:23`.

**E4 — Search has a relevance default ordering, plus an explicit allowlisted sort contract.**
Authority: nuqs SSR guide + repo B1/T1.4 (allowlist → literal GROQ order, injection-proof).
Status: **partial** — `searchProducts.ts:86-92` allowlists, but the list does not match the
UI options (`filterParams.ts:57-71`), `featured` is not a search order, and the default
`name asc` contradicts the UI's "Featured" label.

**E5 — An explicit user sort is applied as the primary order, before slicing.**
Authority: professional search UX; repo A1/T3.1 ("applies sort before slicing the page
window"). Status: **gap** — `order(score desc, ${orderClause})` (`searchProducts.ts:125`)
makes the user's sort secondary to relevance (G1).

**E6 — Pagination clamps out-of-range pages, shows "Showing X–Y of Z", and uses real links.**
Authority: repo A1/T3.3 (clamp) + T3.4; the category page already implements the clamp
(`getProductsByVfsKeys.ts:79-84`) and link-based pagination
(`app/components/features/products/Pagination.tsx:27-36`). Status: **partial** —
"Showing X–Y of Z" + `aria-live` present (`SearchPagination.tsx:42-59`), but no clamp
(empty window for `?page=` too high, G2) and buttons/`router.push` instead of `<Link>`
(G8).

**E7 — Pending/loading feedback is non-blocking and truthful.**
Authority: React 19 `useTransition`; repo A7/T6.2. Status: **implemented** — Suspense
skeleton (`page.tsx:23`, `ProductGridSkeleton`), autocomplete skeleton + error state
(`AutocompleteOverlay.tsx:54-65`), server-action failure surfaces in the overlay
(`SearchField.tsx:95-100`).

**E8 — Edge states are designed: empty q, zero results with next actions, out-of-range page,
failure with retry.**
Authority: repo A4/T6.1 + B2/T2.1. Status: **partial** — empty query & zero-result states
with suggestions exist (`SearchEmpty.tsx:16-44`), error boundary + retry
(`error.tsx`, `SearchError.tsx:10-28`), but out-of-range `?page=` renders the zero-result
state instead of clamping (G2), and the zero-result "Browse all products" CTA points at the
wrong destination (G4).

**E9 — SEO parity: `/search` base indexable; query permutations noindex; deterministic order.**
Authority: repo A9; implemented pattern `isFacetedQuery` → `noindex,follow`
(`lib/catalogue/seo.ts:7-13`, `app/(store)/products/page.tsx:60`). Status: **gap** —
`generateMetadata` (`page.tsx:30-44`) sets title/description only; no `robots`/canonical for
`?q=`/`?sort=`/`?page=` (G5). `/search` is in the sitemap (`app/sitemap.ts:65`).

**E10 — Accessibility: labelled input, ARIA combobox pattern, mobile overlay as dialog with
focus restore.**
Authority: ARIA APG combobox pattern + WCAG 2.2; repo B11/T7.3 (mobile drawer bar). Status:
**partial** — desktop autocomplete wires `role=listbox`/`role=option`/`aria-activedescendant`
(`SearchField.tsx:278-280`, `AutocompleteOverlay.tsx:45-47`), but the mobile full-screen
overlay (`SearchField.tsx:173-246`) has no `role="dialog"`, no focus trap, Escape only closes
the overlay (not the expanded screen), and close doesn't restore focus to the trigger (G7).

**E11 — Performance: debounce + abort autocomplete; parallel count+window; CDN caching.**
Authority: Sanity docs (CDN read client) + repo T2.2. Status: **implemented** — 300 ms
debounce + AbortController (`SearchField.tsx:70-106`), `Promise.all` count+window
(`searchProducts.ts:104-128`), `useCdn:true` (`client.ts:12`). Note: in-flight requests are
not aborted on unmount (watch item only).

**E12 — Typed data contracts and graceful degradation.**
Authority: repo B2/T2.1 + TS `strict`. Status: **partial** — Sanity failure degrades to empty
results with logging (`searchProducts.ts:131-134`), but `SearchResults.tsx:29` passes
`products as any` into `ProductGrid` (typing drift, G9).

