# Sang Logium — Catalogue Filters: Professional Audit (What Is vs What Should Be)

*2026-08-19. Method: bus-stop-by-bus-stop source trace (see
`docs/catalogue-filters-technical-architecture.md`) compared against the professional
execution expectations in `docs/catalogue-filters-professional-execution-expectations.md`
(E1–E18), the repo's own requirement matrix (`tests/catalogue/filters-sorting-matrix.spec.ts`),
and the 2026-08-16 UX audit. Every "what is" claim is verified to a file:line. Priorities are
by real user-impact, not code-size.*

**Verdict:** the architecture layer (URL contract, `shallow:false` RSC re-render, GROQ
server-truth, security) is professional. The gaps concentrate in *adaptive correctness of the
facet UI*, *edge-state handling*, and *feedback/a11y polish* — not in the core loop.

---

## Gap Summary (prioritized by user impact)

| ID | Gap | Impact | Users hit | Repo req |
|---|---|---|---|---|
| G1 | Price & stock slider bounds ignore active filters (facets adapt, bounds don't) | **HIGH** | Every shopper who combines facets | A5/T2.3 spirit |
| G2 | Out-of-range `?page=` renders a misleading state, no clamp | **HIGH** | Shared/crawled URLs, pagination edges | A1/T3.3 |
| G3 | Unknown/stale filter fields only stripped client-side → SSR flash of empty | **HIGH** | Users of stale shared URLs; post-CMS-change | B3/T5.1 |
| G4 | Mobile "Show Results" button is decorative | MED | Mobile filterers | B11/T7.3 |
| G5 | Desktop sidebar shows no active-filter summary above the fold | MED | Desktop filterers | — |
| G6 | Filter groups are not collapsible | MED | Categories with long option lists | — |
| G7 | No "Showing X–Y of Z" on catalogue (search has it) | MED | Pagers on large categories | A1/T3.4 |
| G8 | Pending feedback asymmetric (grid only, not sidebar) | MED | All users on slow queries | A7/T6.2 |
| G9 | Slider labels not programmatically bound (a11y) | MED | Screen-reader users | B11/T7.3 |
| G10 | Two competing empty-state messages | MED | Out-of-range + zero-result users | A4/T6.1 |
| G11 | Empty state offers no next actions | LOW | Zero-result users | A4/T6.1 |
| G12 | Slider logic duplicated across two components | LOW | Developers | — |
| G13 | CMS-configured sort options are dead code | LOW | Curators (biz flexibility) | — |
| G14 | Brand facets alphabetized, not count-ordered | LOW | Brand shoppers | — |
| G15 | `/products` (all-products) has no canonical URL | LOW | SEO | A9/T8.1 |
| G16 | Hand-crafted lowercase brand URLs don't highlight checked | LOW | URL-sharers | — |
| G17 | Sanity CDN staleness for price/stock (~60s) — watch item | LOW | Stock-sensitive buyers | — |
| G18 | Rapid multi-toggle ordering not guaranteed (watch item) | LOW | Power users | — |

---

## HIGH — G1..G3

### G1 — Price & stock slider bounds ignore the active filters
- **Should be (professional):** adaptive faceting is holistic — when a shopper selects facets,
  every remaining control (counts *and* slider bounds) must reflect the surviving product set.
  Repo's own matrix (A5/T2.3) and the audit metric-3 intent require options to react to other
  active filters.
- **What is (verified):** `sanity-cms/lib/products/filter/getFiltersForCategoryPath.ts` restricts
  the **facet-count** query to active filters (`filterClause` at line 82, used in `facetData`
  query line 141) but the **min-price (118–123), max-price (124–129) and max-stock (130–135)
  queries do not receive `filterClause`** — they always scan the whole category.
- **Real UX problem:** user ticks "Brand: Focal" (Focal tops out at $2,800) but the price slider
  still spans the category's full $0–$3,999. The visible range promises products that don't exist
  under the active filter: dragging the min handle to $3,000 yields an empty grid even though Focal
  products clearly exist — the slider lied. Users conclude "out of stock / no match" and abandon.
  Same for the Availability slider (max stock stays category-wide).

### G2 — Out-of-range `?page=` renders a misleading state (no clamp)
- **Should be (professional):** the server clamps `page` to `totalPages` (matrix **A1/T3.3** —
  "reads the page param and clamps out-of-range pages") and the UI distinguishes "page out of
  range" from "no results" (audit #4).
- **What is (verified):** `sanity-cms/lib/products/getProductsByVfsKeys.ts:61` only floors the
  page (`Math.max(1, …)`); nothing clamps to `totalPages`. The page passes `currentPage={page}`
  straight into `CategoryPageClient`. At line 174, `totalCount === 0` gates `EmptyResults`, but an
  out-of-range page returns `totalCount` = full filtered count (>0) with an empty window → falls
  into `ProductGrid`, whose own internal empty branch renders **"No products found in this
  category"** (`ProductGrid.tsx:13-18`). Meanwhile `Pagination` (currentPage > totalPages) renders
  page links with **no active highlight** and a `Prev` link to 98.
- **Real UX problem:** a shared deep link `…?f=brand:sennheiser&page=9` renders "No products found
  in this category" with a broken pagination bar — the shopper believes the filter is broken or the
  category is empty. Bots crawl these permutations, and "no products found" is also wrong copy for
  a page that *does* have products. Two different "empty" messages (G10) make it worse.

### G3 — Unknown/stale filter fields are stripped only client-side
- **Should be (professional):** validation happens once, at the server parse boundary
  (expectation E11; matrix **B3/T5.1** — "strips unknown filters before querying"; audit #5).
- **What is (verified):** `lib/catalogue/filterUtils.ts` (`stripUnknownFilters`) is called only in
  a `useEffect` in `CategoryPageClient.tsx:114-121`, **after** the server has already queried with
  the stale field. The server never validates `f` fields before building GROQ
  (`FilterBuilder.buildGenericFilter` will happily emit a clause for any field name).
- **Real UX problem:** a curator removes a facet (e.g. "Color") from Sanity. Every bookmarked URL
  with `?f=color:red` now server-renders an empty grid ("No products match your current filters"),
  then the client effect strips the stale filter and re-queries — a visible **flash of empty**
  on every visit, plus a wasted server round-trip per page load. It also means any future server
  consumers of `f` inherit the same stale-field risk.


---

## MEDIUM — G4..G10

### G4 — Mobile "Show Results" button is decorative
- **Should be (professional):** a submit-style affordance must either apply pending changes or not
  exist (audit #2: "the affordance implies pending changes that don't exist").
- **What is (verified):** `MobileFilterDrawer.tsx:179-192` — the button only `onClose()`s and
  `scrollIntoView`s the grid; filters were already applied live on toggle.
- **Real UX problem:** on mobile, shoppers tap "Show Results" expecting an apply/confirm step, then
  a filter they selected gets *silently applied anyway* — either a redundant tap or, worse, a tap
  on a deselected-looking control that still filters. The mental model of "select → apply" is
  violated and there is no way to batch filter edits before committing.

### G5 — Desktop sidebar has no active-filter summary above the fold
- **Should be (professional):** the surface where the shopper acts should also *show state*
  (audit #2).
- **What is (verified):** `FilterSidebar.tsx` renders price/stock sliders + groups only; the
  removable chips (`ActiveFilters.tsx`) live in the content column (`CategoryPageClient.tsx:171`).
- **Real UX problem:** a shopper on a long sidebar loses track of which boxes are checked — the
  checkbox highlight is the only signal. There is no "3 filters applied · Clear all" line where
  the filters are, so they must cross the layout gap to the right column to verify or clear state.

### G6 — Filter groups are not collapsible
- **Should be (professional):** long CMS-defined option lists should collapse/expand to keep the
  facet surface scannable (audit #2).
- **What is (verified):** `FilterSidebar.tsx:59-83` and `MobileFilterDrawer.tsx:149-173` render
  every `fieldset` always expanded; the CMS can define arbitrarily long option arrays.
- **Real UX problem:** a category with a 40-option "Connectivity" or "Colour" facet forces the
  shopper to scroll past the whole list to reach the grid; on mobile the drawer becomes a
  wall of checkboxes. Facet discovery degrades precisely where the catalogue is largest.

### G7 — Catalogue pagination lacks "Showing X–Y of Z"
- **Should be (professional):** e-commerce listings report position (audit #4/#11).
- **What is (verified):** the catalogue `Pagination.tsx` shows only prev/page/next; the **search**
  surface already has `Showing {startItem}–{endItem} of {totalCount}` (`SearchPagination.tsx:43`).
- **Real UX problem:** inconsistency between surfaces aside, on a >100-product category a shopper
  has no positional feedback ("I'm on page 3 of 5", "are there 100 or 300 more?"). Without it,
  paging feels like an endless feed; with it, users can reason about depth of results.

### G8 — Pending feedback is asymmetric (grid only)
- **Should be (professional):** while a re-filter is in flight, the state-changing surface should
  also signal pending (audit #5; matrix A7/T6.2).
- **What is (verified):** `CategoryPageClient.tsx:173` dims only the grid wrapper
  (`opacity-60 pointer-events-none`). The sidebar and the active-filter chips stay at full opacity
  with no pending indicator; the "(Loading…)" text label exists only in the desktop count row
  (`:157`) and not on mobile.
- **Real UX problem:** on slow queries, the shopper can't tell whether their click registered —
  the only cue is the grid dimming. On mobile the cue is even weaker (no text). Users re-click
  checkboxes, queueing redundant round-trips (compounds G18).

### G9 — Range-slider labels are not programmatically bound
- **Should be (professional):** WCAG — inputs need accessible names (audit #8; matrix B11/T7.3).
- **What is (verified):** `PriceRangeSlider.tsx:126-128,165-167` and `StockMinimumSlider.tsx:104`
  render `<label>` text as siblings with **no `htmlFor` / `aria-labelledby`** on the `<input
  type="range">`s.
- **Real UX problem:** screen-reader users land on the sliders without a name — the native input
  exposes only its value, not what the value means ("Min/Max/At least N items"). Voice dictation
  and AT tooling cannot address the control reliably.

### G10 — Two competing empty-state messages
- **Should be (professional):** one deliberate empty-state model with correct copy per cause
  (audit #11; matrix A4/T6.1).
- **What is (verified):** `CategoryPageClient.tsx:174` picks `EmptyResults` ("No products match
  your current filters" + reset) when `totalCount===0`, but the out-of-range page reaches
  `ProductGrid.tsx:13-18` ("No products found in this category", **no reset CTA**).
- **Real UX problem:** depending on *why* the grid is empty, the shopper sees different copy and
  different escape hatches. The wrong-page case gets no "Clear all filters" CTA and the blamey
  "found in this category" phrasing — the two messages actively disagree about whether a filter
  or the category is at fault.


---

## LOW — G11..G18

### G11 — Empty state offers no next actions
- **Should be (professional):** a dead-end empty grid is an anti-pattern (audit #11).
- **What is:** `EmptyResults.tsx` shows the message + "Clear all filters" only; no "remove this
  facet", no related-category links.
- **Real UX problem:** when one facet (not all) causes zero results, the shopper must guess which
  checkbox to uncheck — usually toggling the *last* thing they touched, which may not be the
  culprit. Recovery is trial-and-error.

### G12 — Slider logic duplicated
- **Should be (professional):** one shared range-slider hook (audit #12, E18).
- **What is:** `PriceRangeSlider.tsx` and `StockMinimumSlider.tsx` are near-identical copies of
  drag/keyboard/clear/commit logic.
- **Real UX problem:** none directly — but every future fix (a11y labels, G9; step precision)
  must be applied twice and can silently drift, which is how regressions reach users later.

### G13 — CMS-configured sort options are dead code
- **Should be (professional):** no dead paths; a single source of truth for sort options.
- **What is:** `sanity-cms/lib/products/sort/getSortablesForCategoryPath.ts` + `app/actions/
  categories.ts` exist and are never called by the listing UI; `SortDropdown.tsx` uses the
  hardcoded `SORT_OPTIONS` allowlist.
- **Real UX problem:** curators cannot add/order sort options (e.g. a "Newest" option — audit #6)
  from the CMS; the site ships a fixed menu. The two systems can drift, and anyone reading the
  code will wrongly assume CMS sort is live.

### G14 — Brand facets alphabetized, not count-ordered
- **Should be (professional):** high-result facets lead (discoverability).
- **What is:** `getFiltersForCategoryPath.ts` sorts the derived/CMS-intersected brand options with
  `.sort()` (alphabetical) in both branches (lines 228, 245), ignoring `count`.
- **Real UX problem:** a boutique shopper scrolling "Brand" sees the catalogue's 40 smallest
  brands before Sennheiser/Focal if the alphabet says so; the brands with 30+ products (the ones
  the category is actually about) are buried.

### G15 — `/products` (all-products) has no canonical URL
- **Should be (professional):** the base listing carries its own canonical (E15; audit #10 is
  silent on this path).
- **What is:** `app/(store)/products/page.tsx:55-61` sets title/description/robots but no
  `alternates.canonical`; the category page does (`[...slug]/page.tsx:120`).
- **Real UX problem:** minor SEO — `?sort=`/`?f=` permutations of `/products` have no explicit
  canonical target, leaving canonicalization to the `noindex,follow` robots rule alone.

### G16 — Hand-crafted lowercase brand URLs don't reflect as checked
- **Should be (professional):** URL state always mirrors control state.
- **What is:** `isFilterActive` (`useFilterNuqs.ts:132-135`) does exact string matching
  (`filters.includes("brand:value")`), while the query itself is case-insensitive
  (`FilterBuilder` lowercases both sides).
- **Real UX problem:** a shared/crafted `?f=brand:sennheiser` (lowercase) filters correctly but
  the sidebar shows no checkbox checked — the UI and the applied filter disagree. Rare, but it is
  a state-mirroring violation users can trip over via shared links.

### G17 — Price/stock freshness is CDN-bound (~60s)
- **Should be (professional):** stock-sensitive data is fresh.
- **What is:** `sanity-cms/lib/client.ts` uses `useCdn: true`; Sanity CDN serves up to ~60s-stale
  data for these queries (plus the 5-minute page Cache-Control in `next.config.ts`).
- **Real UX problem:** "Min stock 2" may show a product whose stock just hit 0 — the shopper adds
  to basket and gets a reservation failure downstream. Acceptable for a boutique, worth an explicit
  decision (and a `revalidateTag` hook if it matters).

### G18 — Rapid multi-toggle ordering is not guaranteed (watch item)
- **Should be (professional):** last interaction wins deterministically.
- **What is:** all mutators wrap `router.replace` in `startTransition`; React docs state Actions
  within a Transition do not guarantee execution order across async boundaries, and nuqs throttles
  at 50ms.
- **Real UX problem:** a power user rapidly toggling two boxes can in principle land on a URL whose
  final state is not the last click. In practice throttling + latest-wins navigation makes this
  rare; verify with a fast-click test before treating as fixed.


---

## Closing notes

**Stale claims in the 2026-08-16 audit (do not re-plan against them):**
- Metric-3 "facet counts + adaptive refinement" scored 2 / listed as gap #1 — **implemented**
  (adaptive counts + disabled zero-count options; verified in source and its spec).
- "No `peer-focus-visible` ring on the Checkbox" — **implemented** (`Checkbox.tsx:31`).
- "Drawer closed-state focusability" — **implemented** (`inert={!isOpen}` + focus trap + restore).

**Test-matrix hygiene:** `tests/catalogue/filters-sorting-matrix.spec.ts` still lists 35 `it.todo`
stubs including several now-implemented behaviors (T3.1 sort-before-slice, T4.1 `displayPriority`,
T6.1 empty state) — the matrix needs a reconciliation pass so remaining todos are only true gaps.

**Recommended execution order for the next step (impact-first):**
1. G1 — apply `filterClause` to the min/max price + max-stock queries (one-line each; adaptive
   bounds complete the facet story).
2. G2 — clamp `page` to `totalPages` server-side + differentiate "page out of range" copy (also
   resolves the G10 message split).
3. G3 — move `stripUnknownFilters` to the server parse step (`loadCategorySearchParams` /
   page.tsx), keep the client effect as a backstop.
4. G4–G6 — re-purpose or remove "Show Results"; add sidebar active-summary; make groups
   collapsible.
5. G7–G10 — add "Showing X–Y of Z", pending cues on sidebar, slider label bindings, unify empty
   states.
6. G11–G18 — polish and hygiene as budget allows.

**Cross-references:** architecture trace →
`docs/catalogue-filters-technical-architecture.md`; expectations → `docs/catalogue-filters-
professional-execution-expectations.md`; UX audit → `docs/catalogue-filter-sort-ux-audit-2026-08-16.md`.

