# Filters & Sorting — Gaps Intelligence Report

> **Scope:** Pure intelligence. Gaps between current code and 100% professional
> (Next 15 / React 19 / Sanity v3 / Zustand / nuqs, June 2026) level, for **filters
> and sorting only**. No solutions, no phases, no tasks — that is the follow-up prompt.
>
> **Method:** Read of actual source (not the partial record file, which only contains
> Section 1 of 8). Every gap below is anchored to a verified file/line.
>
> **Companion file:** `filters-sorting-complete-source-record.md`

---

## 0. Verified Current Architecture (grounding)

| Concern | Current implementation | File |
|---|---|---|
| URL state | nuqs: `?sort=`, `?f=` (array), `?page=`; all `shallow:false` to force server re-render | `app/components/features/filters/useFilterNuqs.ts` |
| Server entry | `page.tsx` **manually** parses `searchParams` (`sort`, `f`), unrolls descendant catalogue keys, creates 3 promises, streams via `<Suspense>` | `app/(store)/products/[...slug]/page.tsx` |
| Product fetch | `getProductsByVfsKeys` → GROQ filter clause + order clause + slice `[0...limit]` (limit capped 100) | `sanity-cms/lib/products/getProductsByVfsKeys.ts` |
| Filter clause builder | `FilterBuilder` (brand / price / priceRange / stockMin / generic) | `sanity-cms/lib/products/FilterBuilder.ts` |
| Filter option source | `getFiltersForCategoryPath` — CMS `categoryFilters` + brands derived from products + price range + max stock | `sanity-cms/lib/products/filter/getFiltersForCategoryPath.ts` |
| Sort source | Hardcoded `<option>` list | `app/components/features/filters/SortDropdown.tsx` |
| Sliders | Client components w/ local drag state, commit on drag-end | `PriceRangeSlider.tsx`, `StockMinimumSlider.tsx` |
| Cross-component pending | Module-level `useSyncExternalStore` store | `useFilterNuqs.ts:14-32` |

**Data flow:** UI → `useFilterNuqs` writes URL → `shallow:false` triggers RSC re-render →
`page.tsx` re-parses params → `getProductsByVfsKeys` re-queries Sanity → streamed back.

---

## A. HAPPY-PATH GAPS (core flow vs 100% professional)

### A1 — Pagination is non-functional `[CRITICAL]`
- nuqs exposes `page` and resets it on every filter/sort change (`useFilterNuqs.ts:73-80`,
  `setPage(null)` in every mutator), **but**:
  - `page.tsx` never reads `query.page`.
  - `getProductsByVfsKeys` has **no offset** — always `[0...effectiveLimit]`
    (`getProductsByVfsKeys.ts:63`), `effectiveLimit` capped at `MAX_PRODUCTS_LIMIT = 100` (`:8,:52`).
  - There is **no total-count query** anywhere for category products.
- Consequences: categories with >100 products **silently truncate**; no next-page / infinite
  scroll; the displayed count is `products.length` (`CategoryPageClient.tsx:41`), i.e. a
  capped, misleading number. The `page` param is dead state in the URL.
- Professional baseline: offset/limit or cursor pagination + a `count(*[...])` total + page
  controls or infinite scroll.

### A2 — "Featured" sort is a no-op (non-deterministic order) `[HIGH]`
- `sort === 'featured'` produces an **empty order clause** (`getProductsByVfsKeys.ts:56-58`),
  so Sanity returns documents in undefined/internal order.
- Verified: the `product` schema has **no** `featured` / `displayOrder` / `popularity` /
  `rating` / `sales` field (only `homepageData.featuredProducts`, which is homepage-only).
- Consequence: the default and most-common listing state has no business-meaningful, stable
  ordering — bad for UX, SSR/hydration stability, and SEO crawl consistency.
- Professional baseline: an explicit deterministic default (e.g. curated order, `_createdAt`,
  or relevance) **and** a real product-level ranking field if "featured" is to mean anything.

### A3 — No nuqs server-side adapter (parser duplication / drift) `[HIGH]`
- Verified: no `createSearchParamsCache` / `createLoader` / `parseAsInteger` anywhere in repo.
- Server parses params with ad-hoc checks: `typeof query.sort === 'string'` and a **manual
  comma-split** `rawFilters.flatMap(f => f.split(','))` (`page.tsx:32-36`) that the **client
  hook does not mirror**.
- Result: two independent parsing implementations (client `useQueryState` vs server manual)
  = guaranteed drift surface. This is the canonical nuqs anti-pattern in June 2026.
- Professional baseline: shared `parseAs*` definitions + `createSearchParamsCache` consumed by
  both `page.tsx` and the hook (single source of truth).

### A4 — No empty / zero-results state `[HIGH]`
- When filters/sort yield 0 products, `CategoryPageClient` renders `<ProductGrid products={[]}/>`
  with no "No products match — clear filters" messaging or reset CTA (`CategoryPageClient.tsx:75`).
- Professional baseline: explicit empty state with one-click filter reset.

### A5 — `getFiltersForCategoryPath` runs 5 sequential round-trips + unbounded fetch `[HIGH]`
- Five `await sanityFetch` calls run **sequentially**, not in parallel: CMS filters, min-price,
  max-price, max-stock, then all products (`getFiltersForCategoryPath.ts:44,74,83,98,108`).
- The final products query fetches **every product in the category** (no limit) solely to derive
  the brand set (`:108-115`). For large categories this loads the whole catalogue subtree.
- Professional baseline: `Promise.all` the independent queries; derive distinct brands via GROQ
  (`array::unique` / grouping) instead of client-side dedupe over an unbounded fetch.

### A6 — Sort options & valid sorts are not a shared config `[MEDIUM]`
- `SortDropdown.tsx:18-22` hardcodes the option list; the server independently splits/interprets
  `sort` (`getProductsByVfsKeys.ts:55`). No shared allowlist/config ties UI options to server-
  accepted sorts → silent drift and the validation gap in B1.
- Professional baseline: one exported sort-config (label, urlValue, GROQ field+dir) consumed by
  both dropdown and query layer.

### A7 — No pending/skeleton feedback on re-filter; no scroll management `[MEDIUM]`
- `<Suspense>` fallbacks (`page.tsx:68,82`) fire only on first load; param changes are same-route
  navigations, so only the text `"(Loading...)"` (`CategoryPageClient.tsx:60`) signals work.
- No skeleton/dimming on re-query, no scroll restoration/scroll-to-top on page/sort change.
- Professional baseline: visible pending state (optimistic/dimmed grid) + deliberate scroll handling.

### A8 — Active/mobile filter counts are inaccurate `[MEDIUM]`
- `MobileControlsBar` counts `searchParams.getAll('f').length` (`MobileControlsBar.tsx:8` of record).
  Because filters can be comma-joined into a single `f` entry (server splits on comma, `page.tsx:36`),
  `f=brand:a,brand:b` counts as **1**, not 2 → count drift vs reality.
- Professional baseline: count from the same normalized parser the server uses.

### A9 — Sort/filter not reflected in document metadata or SEO controls `[MEDIUM]`
- Filtered/sorted/paged URLs are full navigations (`shallow:false`) → indexable permutations
  with no canonical / `robots` strategy for filter combinations.
- Professional baseline (core e-commerce filter/sort practice): canonical to the base category +
  controlled indexation of filter facets; stable default order for crawl consistency (ties to A2).

---

## B. EDGE-CASE GAPS (robustness / correctness / a11y vs 100% professional)

### B1 — Sort **field** is interpolated into GROQ with NO allowlist `[CRITICAL — security]`
- `getProductsByVfsKeys.ts:55-58`: `| order(${sortField} ${dir})`. `sortField` comes **raw**
  from the URL (`page.tsx:32` does no validation). Only `dir` is constrained (asc/desc ternary).
- Contrast: `searchProducts.ts:87` **does** allowlist (`['name','unit_amount']`). The category
  path does not. A crafted `?sort=<anything>:asc` injects an arbitrary identifier/path into the
  order clause → at best a malformed GROQ throw (uncaught → see B2), at worst order-clause injection.
- Professional baseline: server-side allowlist of sort fields (shared with A6).

### B2 — No error handling in the category query path `[HIGH]`
- `getProductsByVfsKeys` and `getFiltersForCategoryPath` have **no try/catch** (unlike
  `searchProductsFull`, `searchProducts.ts:129-132`). A bad sort/filter or Sanity outage → unhandled
  rejection → page crash instead of graceful empty/degraded state.
- Professional baseline: catch + degrade to empty result with logged error.

### B3 — Invalid / stale URL filters are not reconciled `[HIGH]`
- Arbitrary `f=foo:bar` or `f=brand:NonexistentBrand` is passed straight to
  `FilterBuilder.buildGenericFilter` (`FilterBuilder.ts:160`) → queries `overviewFields`/
  `specifications`; result is silently 0 products. `ActiveFilters` then renders a raw `foo:bar`
  chip via fallback (`ActiveFilters.tsx:61`).
- No validation against the category's actual filter groups.
- Professional baseline: strip/ignore unknown filters or surface an "invalid filter" state.

### B4 — Comma in a filter **value** corrupts parsing `[HIGH]`
- `page.tsx:36` splits every `f` entry on comma. nuqs `parseAsArrayOf(parseAsString)` also uses
  comma as its default array separator. A brand or spec value containing a comma (e.g. "A, B Audio")
  is split into bogus filters. Double/uncoordinated comma handling (nuqs vs manual) is the root.
- Professional baseline: a single, escape-safe (de)serialization for the `f` param.

### B5 — Manual `priceRange` URL with min > max returns 0 silently `[MEDIUM]`
- The hook guards `min >= max` (`useFilterNuqs.ts:189-192`) and the slider enforces ordering,
  but a hand-edited URL with separate `priceRange:min` / `priceRange:max` entries bypasses the hook;
  `FilterBuilder` emits both `>=`/`<=` (`FilterBuilder.ts:123-141`) → empty set, no feedback.
- Professional baseline: server-side range sanity check + user feedback.

### B6 — Price slider hard-coded ceiling of $10,000 `[MEDIUM]`
- When a category has no `maxPrice`, both sidebars default `max` to `10000` dollars
  (`FilterSidebar.tsx:32`, `MobileFilterDrawer.tsx:34`). If real max price exceeds this (or the
  max-price query returns null for a populated category), the slider **cannot reach** the true max.
- Also `priceRangeData?.minPrice ? ...` treats a legitimate `minPrice` of `0` as falsy (`:31`/`:33`).
- Professional baseline: drive bounds from actual data; treat 0 as a valid bound.

### B7 — Stock filter ignores `reservedStock` / `availableStock` `[MEDIUM]`
- The query computes `availableStock = stock - reservedStock` (`getProductsByVfsKeys.ts:74`), but
  the stock-minimum filter matches raw `stock >= n` (`FilterBuilder.ts:150`). "Min available" intent
  vs "raw stock" semantics diverge once reservations exist.
- Professional baseline: filter on `availableStock` (or define the semantic explicitly).

### B8 — Stock slider has no debounce (price does) `[MEDIUM]`
- Price uses `debounce(500)` (`useFilterNuqs.ts:7`, applied in `setPriceRange`/`clearPriceRange`).
  Stock has none (`setStockMinimum`, `:233`). Drag-end mitigates mouse drags, but keyboard arrow
  steps commit immediately per keypress → a server re-render per arrow press. Inconsistent.
- Professional baseline: consistent debounce/throttle across both range controls.

### B9 — Brand option intersection is case-sensitive `[LOW]`
- Filtering matches case-insensitively (`lower(brand->name) == lower(...)`, `FilterBuilder.ts:91`),
  but option building uses exact `brandSet.has(brand)` (`getFiltersForCategoryPath.ts:177`). A CMS
  brand option whose casing differs from the product's brand name is dropped from the visible options.
- Professional baseline: normalize casing on both sides.

### B10 — Slider keyboard a11y commits on every keystroke `[LOW]`
- `isDragging` ref is only set by mouse/touch handlers; keyboard arrow changes go through the
  non-dragging path and commit immediately (`PriceRangeSlider.tsx:48-64`, `StockMinimumSlider.tsx:34-39`).
  Combined with B8, stock keyboard use spams the server.

### B11 — Mobile drawer focus trap is stale / partial `[LOW]`
- Focus trap snapshots focusable elements once on open via `data-testid` query
  (`MobileFilterDrawer.tsx:51-83`); dynamic content changes don't update trap boundaries.
- Mobile "Filters" button lacks `aria-expanded`/`aria-controls`; remove-filter chips use a generic
  `aria-label="Remove filter"` for all chips (`ActiveFilters.tsx:77`) rather than naming the filter.
- Professional baseline: live focus-trap + descriptive ARIA.

### B12 — `parseFilter` vs `groupFiltersByField` use different split strategies `[LOW]`
- Client `parseFilter` uses `indexOf(':')` (first colon, `useFilterNuqs.ts:38`); server
  `groupFiltersByField` uses `split(':')` + `slice(1).join(':')` (`FilterBuilder.ts:62-65`).
  They currently agree for `priceRange:min:N`, but the two implementations are independent and can
  diverge for any future colon-bearing value.
- Professional baseline: one shared (de)serialization helper.

### B13 — No reset of stale `page`/filters when category (slug) changes `[LOW]`
- Navigating between categories keeps `?f=` / `?sort=` / `?page=` in the URL; filters from the
  previous category may be invalid for the new one (ties to B3) and `page` may exceed the new set.
- Professional baseline: reconcile/clear params on category change.

---

## C. Severity Roll-up

| ID | Gap | Severity |
|---|---|---|
| A1 | Pagination non-functional | CRITICAL |
| B1 | Unvalidated sort field → GROQ injection/crash | CRITICAL |
| A2 | "Featured" sort = arbitrary order | HIGH |
| A3 | No nuqs server adapter (parser drift) | HIGH |
| A4 | No empty-results state | HIGH |
| A5 | Sequential + unbounded filter queries | HIGH |
| B2 | No error handling in query path | HIGH |
| B3 | Stale/invalid filters not reconciled | HIGH |
| B4 | Comma in filter value corrupts parsing | HIGH |
| A6 | Sort config not shared | MEDIUM |
| A7 | No re-filter pending/scroll UX | MEDIUM |
| A8 | Inaccurate filter counts | MEDIUM |
| A9 | No SEO/canonical for facets | MEDIUM |
| B5 | min>max URL → silent 0 | MEDIUM |
| B6 | $10k slider ceiling / 0 falsy | MEDIUM |
| B7 | Stock filter ignores availableStock | MEDIUM |
| B8 | Stock slider no debounce | MEDIUM |
| B9–B13 | Casing, keyboard, focus trap, parser split, stale params | LOW |

---

## D. Scope Boundary (not gaps, deliberately excluded)

- **Test coverage** — excluded per instruction (to be redone wholesale).
- **`price.ts` rounding** — `displayToCents` uses `Math.round`; integer-dollar sliders make
  precision loss negligible. Noted only as low priority (relevant edge: values entered in dollars
  always round to whole cents — acceptable).
- Non-filter/sort catalogue concerns (cart, product detail, search ranking) — out of scope except
  where `searchProducts.ts` provides a direct contrast (B1, B2).

---

## E. Coverage Statement (gaps-scan DoD)

- Whole filter/sort surface scanned: client hook, 6 UI components, server page, 2 RSC wrappers,
  query builder, filter-config loader, Sanity schema, price util.
- Each major gap/red-flag/over-complication captured with file/line evidence; severities assigned.
- False-positive guard: pagination, "featured" no-op, missing sort allowlist, and absent nuqs
  server adapter were each **verified directly in source** (not inferred). No fabricated APIs.
- Known omissions: none within filter/sort scope. Excluded items are listed in Section D with reason.
