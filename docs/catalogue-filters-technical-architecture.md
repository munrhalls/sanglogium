# Sang Logium — Catalogue Filters: Tech Stack & System Architecture

*2026-08-19. Read-only code trace of the products-grid filter system and the underlying
platform it runs on. Every claim was verified against source files and installed packages
(`node_modules`), not against planning docs. Companion to the earlier bus-stop trace and to
`docs/catalogue-filter-sort-ux-audit-2026-08-16.md` (UX audit).*

---

## 1. Tech stack (verified versions)

| Layer | Tech | Installed version | Where verified |
|---|---|---|---|
| Framework | Next.js **15** App Router (RSC, streaming, dynamic `searchParams`) | `15.5.15` (spec `^15.5.9`) | `node_modules/next/package.json` |
| UI runtime | React **19** (`useTransition`, `useSyncExternalStore`, `cache`) | `19.2.6` | `node_modules/react/package.json` |
| URL state | **nuqs** (`useQueryState`, `nuqs/server` `createLoader`, `NuqsAdapter`) | `2.8.9` (spec `^2.8.3`) | `node_modules/nuqs/package.json` |
| CMS / data | Sanity (+ `next-sanity` client, GROQ) | `sanity 3.99.0`, `next-sanity 9.12.3` | `node_modules/*/package.json` |
| Styling | Tailwind CSS 3.3.5, design tokens in `tailwind.config.ts` | `3.3.5` | `package.json` |
| Tests | Vitest 4.1.5 (unit/integration), Playwright 1.59.1 (E2E) | — | `package.json` |
| Language | TypeScript 5, `strict: true`, `moduleResolution: bundler`, path alias `@/*` | — | `tsconfig.json` |
| Build | `next build` with **prebuild** step `scripts/build-catalogue-index.mjs` | — | `package.json` `prebuild` |

**Platform notes**
- Store UI tree is wrapped in `<NuqsAdapter>` at `app/(store)/layout.tsx:46-77`
  (required by nuqs v2 on the Next App Router).
- Page `searchParams` are a **Promise** (Next 15 contract) and are `await`ed in every
  page → pages render **dynamically** on every navigation that touches the URL.
- Runtime data fetches go through `sanity-cms/lib/client.ts` → `createClient` from
  `next-sanity` with `useCdn: true`, `perspective: "published"`, stega only in preview.
- `data/catalogue-index.json` (the VFS) is **generated at build time** by
  `scripts/build-catalogue-index.mjs` and imported statically by `data/catalogue.ts`;
  `/api/revalidate` fires `revalidateTag("catalogue-index")` on Sanity webhooks.

---

## 2. System layers (big picture)

```
URL  ?sort=…&f=…&page=…            ← single source of truth, deep-linkable
 │
 ├─[CLIENT] useFilterNuqs (nuqs) ────────────────┐
 │   useQueryState x3, shallow:false              │ URL write
 │   toggleFilter / setPriceRange / sort / page   ▼
 │                              ┌── router.replace(url, {scroll:false})  (nuqs App-Router adapter)
 ├─[SERVER] page.tsx            │    dynamic searchParams → RSC re-render
 │   loadCategorySearchParams ──┤    (same nuqs parsers via createLoader)
 │   ↓ keys from VFS            │
 │   getProductsByVfsKeys ──────┘──> GROQ window+count (FilterBuilder clause, allowlist order)
 │   getFiltersForCategoryPath ─────> GROQ facets+counts+price/stock bounds (6 parallel queries)
 │   ↓ Suspense streaming (FilterSection / ProductsSection)
 ├─[CLIENT] CategoryPageClient ── renders controls, grid, chips, pagination
 │   pending pub/sub → isPending dimming
 └─[SEO]  isFacetedQuery → noindex; canonical base URL
```

## 3. Relation-by-relation trace

### R1 — URL ⇄ nuqs contract (single source of truth)
- `lib/catalogue/filterParams.ts` is **isomorphic** (imports only `nuqs/server`): parsers
  for `sort`, `f`, `page`, plus `SORT_OPTIONS` allowlist, `parseFilterEntry`,
  `countActiveFilters`, `resolveSort`, `buildOrderClause`.
- `lib/catalogue/searchParams.ts` exposes `loadCategorySearchParams = createLoader({sort, f, page})`.
  **Both the client hook and the server loader consume the exact same parsers** → no
  client/server drift by construction. Tested in `lib/catalogue/__tests__/filterParams.spec.ts`.
- Wire format: `?f=` is comma-joined, percent-encoded entries (`brand%3A…%2Ctype%3A…`).
  Multiple `?f=` params are normalized to comma-joined on the server before parsing.

### R2 — nuqs client hook ⇄ URL mutation (verified mechanism)
- `app/components/features/filters/useFilterNuqs.ts` — three `useQueryState` bindings with
  `shallow: false`, `throttleMs: 50`, `clearOnDefault: true` (lines 54–84).
- **Verified in nuqs source** (`node_modules/nuqs/dist/adapters/next/impl.app-*.js`):
  - `if (!options.shallow) setOptimisticSearchParams(search);`
  - `if (!options.shallow) router.replace(url, { scroll: false });`
  → `shallow:false` means nuqs calls the **App Router** (`router.replace`), i.e. a real
  client-side navigation that re-runs the page's server components, rather than a bare
  `history` swap.
- nuqs's own invariant (error 422 in `nuqs/dist/context-*.js`): *"`limitUrlUpdates: debounce`
  should be used in SSR scenarios, with `shallow: false`"* — this app deliberately uses that
  exact combo: `debounce(500)` `limitUrlUpdates` on the price/stock setters + `shallow:false`.
- Every mutating helper (`toggleFilter`, `removeFilter`, `clearAllFilters`, `setPriceRange`,
  `setStockMinimum`, `handleSortChange`) runs inside `startTransition` and resets
  `?page=` (`setPage(null)`), so a filter change always returns to page 1.

### R3 — URL change ⇄ RSC server re-render
- Both listing pages `await searchParams` (`app/(store)/products/page.tsx:18`,
  `app/(store)/products/[...slug]/page.tsx:24-25`) → reading searchParams marks the route
  **dynamic**. Each `router.replace` from R2 re-executes the server component with the new URL.
- Server parse (R1) → VFS key resolution (R4) → parallel data promises (R5) → streaming (R6).
- Client components are re-rendered with the freshly streamed props; `isPending` (module
  pub/sub) dims the grid while in flight (`CategoryPageClient.tsx:173`).

### R4 — Category scoping via the VFS
- `data/catalogue.ts`: `resolveSlugToId(slug)` → slot ID (→ `notFound()` if missing);
  `unrollDescendantKeys(nodeId)` → all descendant **leaf** slot IDs;
  `getAllLeafKeys()` → every leaf for `/products`.
- Products carry `catalogueLocationKeys` (array of slot IDs) — GROQ scopes by array
  intersection `count(catalogueLocationKeys[@ in $keys]) > 0`.

### R5 — Data layer ⇄ Sanity (parallel, cached, streamed)
- `sanity-cms/lib/products/getProductsByVfsKeys.ts`: builds GROQ via `FilterBuilder` +
  `buildOrderClause`, runs **count + window queries in parallel** (`Promise.all`), window
  `[offset...end]`, `perPage` capped at 100, `sort` applied before slice. React `cache()`d.
- `sanity-cms/lib/products/filter/getFiltersForCategoryPath.ts`: **6 concurrent Sanity
  queries** (CMS filter items, min price, max price, max stock, product count, facet data).
  React `cache()`d; graceful `EMPTY_RESULT` on error.
- Both are invoked as **un-awaited promises** in the pages and only awaited inside
  Suspense-wrapped async components (`FilterSection.tsx`, `ProductsSection.tsx` →
  `Promise.all([products, filters, wishlist])`) → streaming skeletons while resolving.
- Category page awaits only the lightweight `getCategoryMetadata` (VFS-backed) for the header.

### R6 — FilterBuilder ⇄ GROQ safety
- `sanity-cms/lib/products/FilterBuilder.ts`, single `buildClause(filters)` shared by the
  **products query and the facet query** (same semantics in both).
- `brand` → OR of `lower(brand->name) == lower("<v>")`; `priceRange` → validated integer
  `>=`/`<=` on `price_data.unit_amount`; `stockMin` → `(stock - reservedStock) >= n`;
  generic fields → OR of `overviewFields`/`specifications` `title=="<f>" && value=="<v>"` matches.
- Guards: `"`-escaping (`sanitizeString`), integer-only numerics (`validateNumeric`), field
  length cap 100. Sort never interpolates raw input (`resolveSort` allowlist → literal order).


### R7 — Facet counts & adaptive refinement
- The facet-data query (R5) is **restricted by the currently active filter clause**, so
  per-option counts reflect the filtered set (adaptive, not static).
- `computeFilterCounts` dedupes per product; brand keys lowercased to match the builder's
  case-insensitive brand clause. Options with `count === 0` are **disabled** in the UI
  (`FilterSidebar.tsx:77`, `MobileFilterDrawer.tsx:167`).

### R8 — UI controls ⇄ hook state
- `FilterSidebar.tsx` (desktop) and `MobileFilterDrawer.tsx` (mobile) both consume
  `useFilterNuqs()` and render identical controls: `PriceRangeSlider`,
  `StockMinimumSlider`, and one `Checkbox` per option (`isFilterActive`, `toggleFilter`).
- `PriceRangeSlider`/`StockMinimumSlider` hold local drag state, commit on drag-end /
  arrow-key release, and call the debounced `setPriceRange` / `setStockMinimum`.
- `SortDropdown.tsx` renders from the shared `SORT_OPTIONS` allowlist (same list the server
  resolves order from → UI and query cannot drift).
- `MobileControlsBar` shows the live `activeFilterCount` badge; the drawer is a local
  `useState` + history-push (not a nuqs-bound param).
- `ActiveFilters.tsx` renders removable chips (label map from CMS groups; special
  price/stock formatting) + "Clear all".

### R9 — CategoryPageClient ⇄ grid / empty / pagination
- `CategoryPageClient.tsx` decides: `totalCount === 0 → EmptyResults`, else `ProductGrid`;
  `Pagination` from `totalPagesFor` (100/page). `ProductGrid` maps `ProductCard`s; the
  wishlist heart uses `wishlistProductIds` passed through from the server.
- `Pagination.tsx` builds real `<Link>` hrefs preserving **all** other params, mutating only
  `?page=` → crawler-friendly and reuses the same server-render path.
- Sanitizes stale filters: `buildValidFilterFields` + `stripUnknownFilters`
  (`lib/catalogue/filterUtils.ts`) → drops `f` entries whose field no longer exists.
- Resets state on category change: slug change → `clearAllFilters()` + `handleSortChange('featured')`.

### R10 — Pending-state pub/sub
- `useFilterNuqs.ts:22-40`: module-level `pendingState` + subscriber set;
  `useFilterPending()` reads it via `useSyncExternalStore`; every hook instance mirrors its
  `useTransition` `isPending` into it. Consumer: `CategoryPageClient` (grid dimming + count "(Loading…)").

### R11 — SEO layer
- `lib/catalogue/seo.ts`: `isFacetedQuery` → `robots: { index: false, follow: true }` for any
  `f`/`sort`/`page>1`; `canonicalCategoryPath` → canonical base URL. Wired in both pages'
  `generateMetadata`.

### R12 — Adjacent systems (same platform, separate surfaces)
- **Search** (`sanity-cms/lib/products/searchProducts.ts`): its own GROQ `match` + scoring;
  does **not** reuse `FilterBuilder` or the nuqs contract (separate surface by design).
- **CMS sortables** (`sanity-cms/lib/products/sort/getSortablesForCategoryPath.ts`): exists
  and is exposed via `app/actions/categories.ts` server actions, but the **listing UI does
  not consume it** — `SortDropdown` uses the hardcoded `SORT_OPTIONS` allowlist. The server
  actions exist but the page path calls the RSC functions directly.

---

## 4. Priority ranking of relations (importance for behavior)

1. **R1 + R2 (shared parser contract + `shallow:false` navigation)** — the architectural
   keystone: one URL contract, no client/server drift, every state change is a server-truth
   re-render. Losing either breaks deep-linking or SSR/CSR parity.
2. **R5 + R6 (parallel Sanity queries + FilterBuilder safety)** — correctness & security:
   count/window parity, adaptive facets, injection-proof clauses.
3. **R3 (dynamic re-render loop)** — the whole "filtering happens server-side" behavior.
4. **R7 (adaptive counts)** — the UX trust signal that makes the facet sidebar honest.
5. **R4 (VFS scoping)** — category correctness; fast, build-time-derived.
6. **R9 (edge handling + sanitization)** — stale-CMS and empty/out-of-range states.
7. **R10 (pending UX)** and **R11 (SEO)** — polish/trust; R12 is adjacent, not coupled.


---

## 5. Comparisons

| Axis | Choice in this codebase | Alternative | Verdict |
|---|---|---|---|
| Where filtering happens | Server (GROQ), client only edits URL | Client-side array filtering | Server truth powers SEO, deep-links, and single source of truth (R1/R3); costs a round-trip per toggle |
| Facet counts | Adaptive to active filters (R7) | Static counts per category | Adaptive is correct; static would mislead once filters apply |
| Sort options | Hardcoded allowlist + literal GROQ order | CMS-defined sortables (exists, unused) | Allowlist is injection-proof and cannot drift; CMS sortables are dead code in the UI path |
| Generic filters | Sanitized GROQ string interpolation | Strict CMS-field FK validation | Safe today (`"`-escaping) but latent brittleness if CMS titles drift (flagged in audit #12) |
| URL throttling | 50ms throttle + 500ms debounce, `shallow:false` | Immediate full nav | Matches nuqs's documented SSR scenario; avoids browser rate-limiting |
| Drawer state | Local `useState` + history push | nuqs-bound param | Works but drawer is not deep-linkable / not in back-stack (audit #7) |
| Pending state | Hand-rolled module pub/sub | React context / nuqs | Functional; small redundancy (audit #1) |

---

## 6. Verified invariants (do not violate)

1. **One URL contract**: `filterParams.ts` is the only place `sort`/`f`/`page` are defined;
   client and server both import from it.
2. **Server truth**: products are filtered/paginated/sorted in GROQ only; the client never
   filters the array.
3. **`shallow:false` + `startTransition` + `setPage(null)`** on every filter mutation.
4. **Sort is allowlisted**; raw sort input can never reach GROQ.
5. **`FilterBuilder.buildClause` is shared** by products and facets (semantics can't diverge).
6. **Counts reflect the filtered set** and zero-count options are disabled.
7. **URLs stay clean** (`clearOnDefault` strips `?f=`/`?sort=featured`; pagination drops `?page=1`).
8. **Faceted pages are noindexed**; canonical is the bare category path.

---

## 7. Notes for next steps

- The 2026-08-16 UX audit scores *facet counts & adaptive refinement* at **2** and lists it
  as gap #1 — **current source already implements per-option counts + disabled zero-count
  options** (verified in R7). Any next-step plan should re-verify against the code, not the
  audit's scoring.
- Known edges worth addressing next (from audit, still valid): out-of-range `?page=` shows
  "no results" instead of a page clamp; the mobile drawer "Show Results" button is
  decorative; focus-visible ring missing on the custom `Checkbox`; sliders duplicate
  logic; `stripUnknownFilters` could move server-side.
- Revalidation surface: `/api/revalidate` only tags `catalogue-index`; product/facet data is
  served from Sanity CDN (`useCdn`) with the global 5-minute `Cache-Control` in
  `next.config.ts` — filter queries are therefore CDN-cached, not revalidated per toggle.

