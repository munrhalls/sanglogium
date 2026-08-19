# Sang Logium — Catalogue Filters: Professional Execution Expectations

*2026-08-19. Intel gathered from: (1) authoritative framework docs — **nuqs v2.9.6** docs
(`nuqs.dev/docs/*`), **Next.js 15.5.x** pinned docs (`nextjs.org/docs/15/...`), **React 19**
reference (`react.dev`), **Sanity GROQ** cheat sheet; (2) the repo's own requirement matrix
(`tests/catalogue/filters-sorting-matrix.spec.ts`, tags A*/B*/T*); (3) verified current
source state. Basis for the next execution step.*

---

## Part A — What "professional execution" means in this stack (intel distillate)

1. **URL is the single source of truth.** nuqs defaults are deliberately client-first
   (History API only, replace the current entry, no server request). Opting into
   `shallow: false` is the *explicit, documented* way to tell the server: *"re-render the RSC
   tree from the updated query state."* Professional filter UIs on the App Router use the
   page `searchParams` prop server-side + `useQueryState` client-side from **one shared
   parser contract** (`nuqs/server` `createLoader` + the same parsers in `useQueryStates`).
2. **`shallow:false` must be paired with SSR-friendly debouncing.** nuqs's own invariant
   (error 422): `limitUrlUpdates: debounce` should be used in SSR scenarios **with**
   `shallow: false`. Also: throttle URL writes (browser rate-limiting), use `clearOnDefault`
   for clean URLs, and provide `eq` for array parsers.
3. **Server truth, streamed.** Next.js 15: read `searchParams` via the awaited page prop
   (layouts never receive it — they don't re-render on navigation). nuqs's SSR guide's pro
   tip: *don't await the loader result — pass the promise into `<Suspense>` children* so the
   static shell renders immediately and dynamic parts stream in. React `cache()` dedupes
   fetches per render; `Promise.all` fans out independent queries.
4. **`useSearchParams` in a client component requires a Suspense boundary** during static
   prerendering — without it the initial page falls back to client-side rendering.
5. **Pending state is a first-class UX concern.** React 19 `useTransition`'s `isPending`
   should drive non-blocking feedback (dim/keep-last-committed) instead of a full spinner;
   the current UI stays visible until the next state is ready.
6. **Filtering must be secure by construction.** Sort values never interpolate raw input
   (allowlist → literal GROQ `order`); filter strings are escaped; numerics validated.
   nuqs's `createLoader` explicitly warns it does **not** validate data — professional
   execution layers validation/sanitization on top.
7. **Faceting is adaptive, not static.** Facet option counts must reflect the *currently
   filtered* set (re-queried against active filters) and zero-result options disabled — this
   is the trust signal of a professional sidebar.
8. **Edge states are designed, not accidental.** Empty results with a working reset; page
   clamping; unknown/stale filter stripping; inverted price-range guard; honoring a real
   `0` bound; category-change reset; graceful degradation on Sanity failure.
9. **SEO parity with URL state.** Query strings used for local-only state get a canonical
   base URL (`alternates.canonical`); faceted permutations are `noindex,follow`; base listing
   order is deterministic/crawl-stable; pagination is real `<a href>` preserving all params.
10. **Accessibility is non-negotiable on filter controls.** WCAG 2.4.7 focus-visible on
    custom controls, proper dialog semantics (`role="dialog"`, `aria-modal`,
    `aria-labelledby`), live focus trap, Escape-to-close, focus restore to the trigger,
    descriptive `aria-label`s, keyboard-operable sliders.

---

## Part B — Key expectations of professional filter execution (given this stack)

**E1 — URL is the single, deep-linkable source of truth for filter/sort/page.**
Authority: nuqs docs (shallow/history/SEO). Repo reqs: A3/B12/T1.3–T1.7. Status: **implemented** —
`lib/catalogue/filterParams.ts` is the only contract; `f`/`sort`/`page` round-trip cleanly;
`clearOnDefault` keeps URLs clean.

**E2 — One parser contract shared by client and server (no SSR↔CSR drift).**
Authority: nuqs `createLoader` (`nuqs/server`) + "reuse in `useQueryStates`". Repo: A3/B12/T1.5.
Status: **implemented** — `useFilterNuqs` and `loadCategorySearchParams` import the same parsers.
Professional add-on already present: `resolveSort`/`FilterBuilder` validate on top of the
loader (nuqs warns loaders don't validate).

**E3 — Server renders truth from the awaited `searchParams` page prop; client reads via
`useSearchParams` inside a Suspense boundary.**
Authority: Next.js `page.js` (`searchParams` Promise, layouts don't get it) + `useSearchParams`
(Suspense requirement during prerender). Status: **implemented** — both pages `await searchParams`;
`CategoryPageClient`, `SortDropdown`, `Pagination`, `MobileControlsBar` render inside
Suspense-wrapped async sections.

**E4 — Every filter/sort/page mutation notifies the server (`shallow:false` → RSC re-render).**
Authority: nuqs options (shallow section) + verified adapter behavior (`router.replace`). Status:
**implemented** — `useFilterNuqs` uses `shallow:false` + `throttleMs:50` + `clearOnDefault` on
`sort`/`f`/`page`; pages are dynamic because they read `searchParams`.

**E5 — SSR-safe rate limiting: debounce range inputs, throttle all URL writes.**
Authority: nuqs error-422 invariant (`debounce` with `shallow:false`) + throttle docs. Status:
**implemented** — 50ms throttle, 500ms `debounce` on price/stock setters via `limitUrlUpdates`.

**E6 — Mutations are non-blocking and reset pagination: `startTransition` + `setPage(null)`.**
Authority: React 19 `useTransition` (pending visual state, non-blocking router navigation). Status:
**implemented** — every mutator runs in `startTransition` and clears `?page=`.

**E7 — Filter/sort semantics are injection-proof and never interpolate raw input.**
Authority: security-by-construction; nuqs docs (parser safety). Repo: A6/B1/T1.2–T1.4.
Status: **implemented + unit-tested** (`filterParams.spec.ts`, `FilterBuilder.spec.ts`,
`getProductsByVfsKeys.spec.ts` crafted-value tests).

**E8 — Data layer: parallel queries, React `cache`, streaming, bounded page window.**
Authority: Next.js fetching guide (`cache`+`Promise.all`+preload), nuqs SSR pro tip (don't await,
stream via Suspense). Repo: A5/T2.2, A1/T3.1–T3.2. Status: **implemented** — un-awaited promises,
`Promise.all` (count+window; 6 facet queries), `cache()`d fetchers, `perPage` capped at 100.

**E9 — Result count and pagination are correct: full filtered total + sort-before-slice + reach
all products.**
Authority: repo A1/T3.1–T3.4 (e-commerce correctness). Status: **implemented except page clamp** —
`totalCount` is the full filtered count; sort applied before the slice (tested); numbered

**E10 — Adaptive facet counts with disabled zero-result options.**
Authority: professional faceting; repo A5/T2.3. Status: **implemented** — `computeFilterCounts` +
`withCounts` in `getFiltersForCategoryPath`; facet-data query filtered by active filters;
`disabled={!isChecked && count===0}` in both sidebar and drawer.
*(Note: the 2026-08-16 UX audit still scores this metric 2 and lists it as gap #1 — stale vs. source.)*

**E11 — Edge-state correctness: empty + reset, unknown filters, min>max, real 0 bound.**
Repo: A4/T6.1, B3/T5.1, B5/T5.2, B6/T5.3, B13/T5.6. Status: **partial** —
`EmptyResults` + reset CTA ✓; `stripUnknownFilters` client-side ✓ (matrix wants it stripped
server-side before querying — open); `min>max` guarded in `setPriceRange` and `FilterBuilder` ✓;
`0` bound honored via `!= null` in `resolvePriceBounds` ✓; category-change reset ✓
(`clearAllFilters` + `handleSortChange('featured')`).

**E12 — Pending UX driven by `isPending`, no jarring full reloads.**
Authority: React `useTransition`. Repo: A7/T6.2. Status: **implemented** (module pub/sub +
`useSyncExternalStore` + grid dim + "(Loading…)" label). Professional polish still available:
keep-last-committed grid / sidebar dim while pending.

**E13 — Scroll management: reset to top on sort/page change, not on in-place toggles.**
Status: **implemented** — `scrollTo({top:0})` on sort/page param change in `CategoryPageClient`.

**E14 — Accessibility: focus-visible, dialog semantics, focus trap, aria-labels, keyboard
operability.**
Status: **implemented** — `Checkbox` has `peer-focus-visible:outline` ✓ (audit claim of missing
ring is stale); drawer has `role="dialog"`/`aria-modal`/`aria-labelledby`/`inert` when closed/
focus trap/Escape/focus-restore-to-trigger ✓; chips carry descriptive `aria-label`s ✓; sliders
are keyboard-operable (arrow keys commit via debounced path) ✓. **Open (audit #8):** slider
labels are siblings, not `htmlFor`/`aria-labelledby`-bound.

**E15 — SEO: canonical base URL, `noindex,follow` faceted permutations, crawl-stable base order,
crawlable pagination.**
Authority: nuqs SEO guide (`alternates.canonical` for local-only state). Repo: A9/T8.1–T8.2.
Status: **implemented** — `isFacetedQuery` → `robots`, `canonicalCategoryPath`, deterministic
featured order (`displayPriority` schema + specs), real `<Link>` pagination. Open: crawl-stability
test (T8.2 matrix todo).

**E16 — Mobile drawer UX: back-button integration, focus restore, no fake affordances.**
Status: **implemented** — history-push/pop close, focus restore to `open-filters-button`. **Open
(audit #7/#2):** the "Show Results" button is decorative (filters apply live); drawer not bound
to the existing `useDrawer` nuqs hook.

**E17 — Resilience: empty safe-shapes and logging on Sanity failure; no crash paths.**
Repo: B2/T2.1. Status: **implemented** — `getProductsByVfsKeys` and `getFiltersForCategoryPath`
return `{products:[], totalCount:0}` / `EMPTY_RESULT` and `console.error` on failure.

**E18 — Code health: single parser contract, tested builders, no duplicated control logic.**
Status: **partial** — parser/FilterBuilder/pagination/getFilters specs exist; matrix has 35
`it.todo` stubs mapping every phase (several already implemented with real specs, e.g. T4.1
`displayPriority`). **Open:** slider duplication between `PriceRangeSlider`/`StockMinimumSlider`;
CMS-defined sortables (`getSortablesForCategoryPath`) + server actions exist but are not consumed
by the listing UI (dead path).

pagination preserves all params. **Open:** out-of-range `?page` is not clamped to `totalPages`
(T3.3 still a matrix todo); `?page=99` currently shows a misleading empty state.

