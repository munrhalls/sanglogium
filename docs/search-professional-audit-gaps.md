# Sang Logium — Search: Professional Audit (What Is vs What Should Be)

*2026-08-19. Method: bus-stop-by-bus-stop source trace (see
`docs/search-technical-architecture.md`) compared against the professional execution
expectations in `docs/search-professional-execution-expectations.md` (E1–E12) and the repo's
requirement matrix (`tests/catalogue/filters-sorting-matrix.spec.ts`, tags A*/B*/T*). Every
"what is" claim is verified to a file:line.*

**Verdict:** the interaction shell (debounced autocomplete, keyboard nav, ARIA listbox on
desktop, Suspense streaming, graceful Sanity failure) is solid. The gaps concentrate in the
**sort contract** (the core of any search UX), **pagination edge correctness**, **SEO
hygiene**, and **mobile overlay a11y** — plus one dead component and typing drift.

---

## Gap Summary (prioritized by user impact)

| ID | Gap | Impact | Users hit | Expectation |
|---|---|---|---|---|
| G1 | Search sort is a no-op or wrong (price sorts collapse to `name asc`; score hijacks every order; "Featured" label lies) | **HIGH** | Every shopper who sorts results | E4/E5 |
| G2 | Out-of-range `?page=` renders "No products found" — no clamp, misleading empty state | **HIGH** | Shared/crawled deep links, pagination edges | E6/E8 |
| G3 | Search route params parsed ad hoc; no shared client↔server parser contract (drift) | MED | All users (root architecture of G1) | E1/E2 |
| G4 | "Browse all products" empty-state CTA points to `/products/headphones`, not `/products` | MED | Zero-result users | E8 |
| G5 | `/search?q=…` permutations indexable — no `robots`/canonical (thin+duplicate content) | MED | SEO | E9 |
| G6 | Dead `Searchbar.tsx` — static form, never imported, no submit handler | LOW | Developers | — |
| G7 | Mobile search overlay lacks dialog semantics, Escape-close, focus restore | LOW | Mobile + screen-reader users | E10 |
| G8 | Search pagination uses buttons + `router.push`, not real `<Link>` hrefs | LOW | Middle-clickers, crawlers | E6 |
| G9 | `products as any` typing drift + duplicated sort-allowlist logic | LOW | Developers | E12 |

---

## HIGH — G1..G2

### G1 — Search sort is a no-op or wrong
- **Should be (professional):** the dropdown's chosen sort is the actual result order
  (expectations E4/E5; matrix A1/T3.1 "applies sort before slicing the page window"); the
  default option honestly reflects the default order; one allowlist serves UI and server.
- **What is (verified), three independent defects:**
  1. **Contract drift:** the client writes `?sort=<SORT_OPTIONS value>` from
     `lib/catalogue/filterParams.ts:57-71` (`featured`, `price_data.unit_amount:asc/desc`,
     `name:asc/desc`) via `useFilterNuqs.ts:265-270`, but `searchProductsFull` parses with
     `sort.split(':')` and accepts only `name`/`unit_amount`
     (`sanity-cms/lib/products/searchProducts.ts:87-92`). `price_data.unit_amount:asc`
     splits into 3 parts → `field='price_data'` → falls back to `name asc` (line 86).
  2. **Score hijack:** the window is ordered `order(score desc, ${orderClause})`
     (`searchProducts.ts:125`); score is 20/15/10 per product (lines 120-124), so the user's
     sort applies only inside equal-score buckets.
  3. **Default lie:** the dropdown defaults to "Featured" (`filterParams.ts:184`,
     `useFilterNuqs.ts:290`) but the server default is `name asc` (`searchProducts.ts:86`).
- **Real UX problem:** on `/search`, "Price: Low to High" and "Price: High to Low" visibly
  do nothing (results keep the same name order); "Featured" is displayed while results are
  name-ordered; even working sorts are relevance-bucketed first. Shoppers can't rely on the
  one tool search results are bought by — sorting — and conclude the feature is broken.

### G2 — Out-of-range `?page=` renders a misleading "No products found"
- **Should be (professional):** the server clamps `page` to `totalPages` (matrix A1/T3.3;
  the category page already does this at `getProductsByVfsKeys.ts:79-84`) and the UI
  distinguishes "page out of range" from "no results" (expectation E8).
- **What is (verified):** `searchProductsFull` never clamps — it slices
  `[offset...offset+perPage]` from any page (`searchProducts.ts:83,125`). An out-of-range
  page returns an **empty window while `totalCount` stays > 0**. `SearchResults.tsx:18-20`
  then renders `SearchEmpty`, i.e. "No products found … We couldn't find any products
  matching …" (`SearchEmpty.tsx:20-24`) — for a query that has products.
- **Real UX problem:** a shared link `/search?q=sennheiser&page=99` (or a crawler hitting
  pagination permutations) tells the shopper the query has no results at all — a false
  negative that looks like a broken search or out-of-stock everything.

---

## MEDIUM — G3..G5

### G3 — No shared param contract for the search route (ad-hoc parsing)
- **Should be (professional):** one isomorphic parser contract (nuqs `createLoader`) consumed
  by both the page and the client (expectations E1/E2; matrix A3/B12/T1.5). The category
  route does exactly this via `loadCategorySearchParams` (`lib/catalogue/searchParams.ts:17-21`).
- **What is (verified):** `app/(store)/search/page.tsx:13-16` manually derives
  `q`/`sort`/`page` (raw string ops), while the client `SortDropdown` writes with nuqs
  parsers (`useFilterNuqs.ts:54-61`) and the data layer re-parses sort with yet another
  allowlist (`searchProducts.ts:87-92`).
- **Real UX problem:** this is the architecture that lets G1 happen — the UI, the page, and
  the query layer each interpret `sort` differently, so the visible dropdown and the served
  results can always drift. Any future param (`highlight`, `inStock`) inherits the same
  three-way parsing risk.

### G4 — "Browse all products" CTA points at the wrong destination
- **Should be (professional):** the zero-result state's escape hatch goes to the full
  catalogue (`/products`, which exists at `app/(store)/products/page.tsx`) — expectation E8.
- **What is (verified):** `SearchEmpty.tsx:38` — `<Link href="/products/headphones">Browse
  all products →</Link>`. The label says "all products" but the destination is a single
  subcategory.
- **Real UX problem:** a shopper with zero matches clicks the one helpful-looking CTA and
  lands on Headphones only — they never discover the broader catalogue, and the "all
  products" promise is broken at the exact moment the user is most disoriented.

### G5 — Search query permutations are indexable (no robots/canonical)
- **Should be (professional):** query-string-driven result pages are `noindex,follow` with a
  canonical base (expectation E9; implemented for the category route at
  `app/(store)/products/page.tsx:60` via `lib/catalogue/seo.ts:7-13`).
- **What is (verified):** `generateMetadata` (`page.tsx:30-44`) emits `title`/`description`
  only — no `robots`, no `alternates.canonical`. `app/robots.ts` disallows only `/studio/`.
  `/search` itself is in the sitemap (`app/sitemap.ts:65`) — fine for the base — but every
  `?q=…&sort=…&page=…` permutation is now freely crawlable thin/duplicate content.
- **Real UX problem:** search-result pages are transient by nature (inventory + relevance
  change constantly); indexing them pollutes SERPs with near-duplicate, stale pages that
  compete with the real catalogue pages and erode the site's organic footprint.

---

## LOW — G6..G9

### G6 — Dead `Searchbar.tsx` component
- **Should be (professional):** no unreachable, misleading search UI ships to the bundle
  (one search surface — `SearchField`).
- **What is (verified):** `app/components/layout/header/Searchbar.tsx:5-44` is a static
  `<form role="search">` with a search icon and an input but **no submit handler, no state,
  no `q` output**. It is never imported — the only reference in the repo is its own
  definition.
- **Real UX problem:** none for users (it never renders) — it is dead weight (bundle bytes)
  and a maintenance trap: any future editor may wire it up, producing a second, broken
  search surface alongside `SearchField`.

### G7 — Mobile search overlay lacks dialog semantics + focus management
- **Should be (professional):** the full-screen mobile search is a modal dialog —
  `role="dialog"`/`aria-modal`/`aria-labelledby`, Escape-to-close, focus trap, and focus
  restore to the trigger on close (expectation E10; the catalogue drawer bar B11/T7.3 sets
  the same bar).
- **What is (verified):** `SearchField.tsx:173-246` renders a `fixed inset-0` overlay with
  no dialog semantics; Escape (handled at `SearchField.tsx:151-154`) only calls
  `closeOverlay` — it does **not** collapse `mobileExpanded`; `handleMobileClose`
  (`SearchField.tsx:58-62`) never restores focus to the "Open search" trigger (line 166).
- **Real UX problem:** mobile users who tap the search icon get a screen with no Escape
  affordance, keyboard/screen-reader users lose focus context (focus stays on a now-hidden
  control), and assistive tech announces a plain region rather than a dialog.

### G8 — Search pagination uses buttons + `router.push`, not real links
- **Should be (professional):** pagination is real `<Link href>` elements preserving every
  param (expectation E6; the catalogue implements exactly this at
  `app/components/features/products/Pagination.tsx:27-36`).
- **What is (verified):** `SearchPagination.tsx:21-32` — `goToPage` builds the URL string
  and calls `router.push(newUrl, { scroll: false })` from `<button>`s (lines 47-69).
- **Real UX problem:** no middle-click / open-in-new-tab, no `rel="prev"/"next"`, and the
  back button behavior differs from link-based navigation — a silent inconsistency with the
  rest of the store's pagination and with crawlers that can't discover deep search pages
  (compounds G5).

### G9 — Loose typing + duplicated sort-allowlist logic (code health)
- **Should be (professional):** typed data contracts end-to-end and one sort contract
  (expectation E12; matrix B1/T1.4).
- **What is (verified):** `SearchResults.tsx:29` passes `products as any` into `ProductGrid`
  (masking the `SearchProduct` ⇄ `Product` shape drift), and the sort allowlist in
  `searchProducts.ts:87-92` re-implements what `filterParams.ts:57-94` already owns.
- **Real UX problem:** none directly; it is the maintenance seam where G1's drift lives and
  the `as any` hides real type mismatches (e.g. `image`, `slug`) from the compiler.
