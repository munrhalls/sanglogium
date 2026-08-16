# Sang Logium — Catalogue Filter & Sort UX Audit

*2026-08-16. Subject: category listing filter/sort stack across desktop sidebar + mobile drawer. Methodology: static code audit of the full filter/sort path — `lib/catalogue/filterParams.ts` (nuqs contract), `app/components/features/filters/*` (UI + `useFilterNuqs`), `app/(store)/products/[...slug]/page.tsx` + `CategoryPageClient.tsx` (server/client orchestration), `sanity-cms/lib/products/FilterBuilder.ts` + `getProductsByVfsKeys.ts` + `filter/getFiltersForCategoryPath.ts` (GROQ faceting), `lib/catalogue/seo.ts` (canonical/noindex). No build, test, or browser runs (resource-lean audit).*

**Stack context.** Next.js 15 App Router (RSC streaming) · React 19 (`useTransition`, `useSyncExternalStore`) · **nuqs 2.8.3** URL state (`sort`, `f`, `page`) with isomorphic parsers shared client↔server via `createLoader` · Sanity CMS (CMS-defined facets, GROQ server-side filtering) · Tailwind tokens.

## Scoring framework

| # | Metric | What it measures | Score |
|---|---|---|---|
| 1 | URL-State Architecture & State Management | Deep-linkable/shareable state, SSR↔CSR parity, single source of truth | 9 |
| 2 | Facet Discovery & Layout | Sidebar/drawer discoverability, active-filter visibility | 8 |
| 3 | Facet Counts & Adaptive Refinement | Per-option counts; options react to other active filters | 2 |
| 4 | Filtering Feedback & Pending UX | Perceived latency, loading/pending treatment | 6 |
| 5 | Sort UX | Options offered, affordance, page-reset correctness | 6 |
| 6 | Price & Availability Range UX | Precision, keyboard/drag behavior, input affordances | 7 |
| 7 | Mobile UX | Drawer correctness, dismissal semantics, back-button | 6 |
| 8 | Accessibility (WCAG 2.2) | Focus visibility, dialog semantics, labels, landmarks | 5 |
| 9 | Performance & Resource Efficiency | Round-trips, throttling/debounce, bundle footprint | 7 |
| 10 | SEO & Shareability | Canonical, noindex faceted, crawlable pagination | 9 |
| 11 | Empty / Error / Edge States | Out-of-range pages, zero results, failure paths | 6 |
| 12 | Code Health & Consistency | Allowlists, sanitization, test coverage, duplication | 8 |
| | **Overall** | Weighted composite | **6.5 / 10** |

## Metric-by-metric findings

**1. URL-State Architecture — 9.** Genuinely strong. `lib/catalogue/filterParams.ts` is the single contract: custom `filtersParser` (comma-safe, percent-encoded, array-aware `eq`), `sortParser` with `clearOnDefault`, `pageParser`. Server consumes the *same* parsers via `loadCategorySearchParams` (`nuqs/server` `createLoader`), so URL parsing can't drift between client and server. Sort is an allowlist of hardcoded GROQ `order` literals (injection-proof by construction), featured order is deterministic (`displayPriority desc, _createdAt desc`). `FilterBuilder` sanitizes strings and validates numerics. Gaps are minor: the mobile filter drawer is local `useState`, not bound to the existing `useDrawer` nuqs hook (wired for global drawers but not reused here), so the drawer itself is not in the URL / back-stack; pending state is a hand-rolled module pub/sub (works, but redundant vs. React context or nuqs).

**2. Facet Discovery & Layout — 8.** Desktop: sticky, scrollable sidebar with price/availability sliders + checkbox groups. Mobile: `Filters (n)` button with live count badge, bottom-sheet drawer. Active filters render as removable chips + "Clear all" on both breakpoints. Gaps: filter groups are not collapsible (long CMS option lists are always expanded); the desktop sidebar shows no active-filter summary above the fold (chips only appear in the content column); mobile "Show Results" button is decorative — filters already applied live, so the affordance implies pending changes that don't exist.

**3. Facet Counts & Adaptive Refinement — 2. THE critical gap.** No facet option displays a result count, and options are computed statically per category (`getFiltersForCategoryPath` fetches brand names once). They are never re-intersected with the currently active filters, and options that would yield zero results are neither disabled nor hidden. Baymard/Amazon/Best Buy-level category pages treat count + refinement as table stakes (counts guide decisions; disabling empty facets prevents dead-end clicks). The data is *cheap to add* because the server already runs a `count(...)` query per filter change — but no per-option counts are requested.

**4. Filtering Feedback & Pending UX — 6.** `shallow: false` + `useTransition` gives a real pending signal: grid dims to `opacity-60`, result count shows "(Loading...)". Scroll-to-top fires on sort/page change. Gaps: the grid shows stale content dimmed rather than a skeleton; the sidebar isn't dimmed at all (user can't tell the facets are also re-validating); no optimistic/instant client-side filtering for a catalog this small (~100s of SKUs); the `stripUnknownFilters` client effect performs a *second* sanitize-then-`setFilters` pass after mount on deep-linked unknown params — a visible correction flash; an out-of-range `?page=99` isn't clamped, yielding a misleading empty state (see #11).


**5. Sort UX — 6.** Five options (Featured, Price ↑/↓, Name A-Z/Z-A) from the shared allowlist; sort change resets to page 1; category change resets to Featured; native `<select>` is accessible and thumb-friendly. Gaps: no "Newest" sort even though `_createdAt` is already part of the featured tiebreak; no "Best Selling"/rating sort (no rating data exists site-wide — noted in the PDP audit); with `DEFAULT_PER_PAGE = 100` most categories never paginate, which undercuts pagination-dependent sort behavior; no sort preference persistence.

**6. Price & Availability Range UX — 7.** Dual native range sliders commit on drag-end/keyup with a 500 ms URL debounce (`limitUrlUpdates`), preventing mid-drag server spam — a thoughtful touch. Clear buttons exist and disable when inactive. Gaps: no numeric min/max inputs (precision control is a professional expectation alongside sliders); labels show bare integers without comma/currency formatting consistency; the "Availability" stock-minimum slider is an atypical facet for a boutique catalog and its label "Min stock" reads technical.

**7. Mobile UX — 6.** Bottom sheet with sticky header ("Done") + footer ("Show Results"), backdrop click-to-close, Escape handler, manual focus trap, `aria-expanded`/`aria-controls` on the trigger. Gaps: when closed the drawer is translated off-screen but **remains in the tab order and accessibility tree** (no `hidden`/`inert`/`aria-hidden`), so keyboard/screen-reader users can land on invisible controls; focus isn't restored to the Filters trigger on close; the drawer has no `role="dialog"`/`aria-modal`; back button doesn't close it; "Show Results" is a no-op close button.

**8. Accessibility — 5.** Good bones: native inputs, labels, legends, chips with descriptive `aria-label`, `aria-current="page"` on pagination, keyboard-operable sliders, Escape/trap in the drawer. Blocking gaps: the custom `Checkbox` hides the real input (`sr-only`) and paints a styled box **with no `peer-focus-visible` ring anywhere** (confirmed by search — the only `focus-visible` styles in the UI package are on `QuantitySelector`) → fails WCAG 2.4.7 Focus Visible for the entire filter option set; drawer closed-state focusability (from #7); slider labels aren't programmatically bound (`<label>` text is a sibling, not `htmlFor`/`aria-labelledby`).


**9. Performance & Resource Efficiency — 7.** Server-side GROQ filtering with parallel count+window queries, React `cache`, streaming Suspense skeletons, 50 ms URL throttle, 500 ms range debounce, tiny nuqs footprint, no client filter runtime. Gaps: every single checkbox toggle triggers a full server round-trip + RSC re-render; for a boutique catalog client-side filtering would be instant, but the architecture chose server truth (which powers #1/#10) — the professional middle ground is count-only faceting endpoints + optimistic UI, which is also what #3 needs.

**10. SEO & Shareability — 9.** Canonical base URL, `robots: noindex, follow` on any faceted/sorted/paginated query, real `<a href>` pagination preserving all params, `clearOnDefault` keeps URLs clean, content renders without JS. No significant gap.

**11. Empty / Error / Edge States — 6.** `EmptyResults` shows a message + "Clear all filters" (good); Suspense skeletons exist; `error.tsx` present. Gaps: out-of-range `?page=99` returns `totalCount=0` for the window → the user sees *"No products match your current filters"* even though the filters are fine — wrong message for a wrong-page condition; empty state doesn't suggest removing a specific facet or offer related categories; no "Showing X–Y of Z" line.

**12. Code Health & Consistency — 8.** Single parser contract, allowlist-driven sort, sanitizing FilterBuilder, unit tests for `FilterBuilder`/`filterParams`/`pagination`/`getFiltersForCategoryPath`. Gaps: duplicated slider logic between `PriceRangeSlider` and `StockMinimumSlider` (nearly identical drag/keyboard/clear code); `setFilters` is exposed to the client for the sanitize effect when the server could strip unknown fields once at parse time; generic filters embed CMS option strings into GROQ (sanitized, but field/value drift from CMS content is a latent brittleness — same class of issue flagged in the PDP audit re: `overviewFields`).


## Gaps to professional level (priority order)

1. **Facet counts + adaptive refinement (P1).** Add per-option counts to `getFiltersForCategoryPath` (one extra GROQ aggregation, re-queried on filter change) and disable zero-result options. Takes #3 from 2 → 8. Highest-leverage item.
2. **Focus-visible on the custom Checkbox (P1, 10-min fix).** Add `peer-focus-visible:ring` classes. Fixes WCAG 2.4.7 across every facet.
3. **Mobile drawer correctness (P1).** Hide/`inert` the closed drawer, restore focus to the trigger, add `role="dialog"`+`aria-modal`+`aria-labelledby`, wire back-button close (reuse `useDrawer`). Remove or re-purpose the no-op "Show Results" button.
4. **Edge-state correctness (P2).** Clamp `?page` to `totalPages` server-side; differentiate "page out of range" from "no results"; add "Showing X–Y of Z".
5. **Feedback upgrade (P2).** Skeleton or keep-last-committed grid during pending; dim sidebar too; move `stripUnknownFilters` to the server parse step.
6. **Sort & range completeness (P2).** Add "Newest" sort; add numeric min/max price inputs; format range labels consistently.
7. **Deduplication (P3).** Extract a shared `useRangeSlider` from the two sliders.

**Not in scope:** site-wide search (`searchProducts`) — separate surface; wishlist/account state.
