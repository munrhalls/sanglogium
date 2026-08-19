# Sang Logium — Search: Tech Stack & System Architecture

*2026-08-19. Read-only bus-stop trace of the site-wide search feature (`/search`) and the
platform it runs on. Every claim was verified against source files and installed packages
(`node_modules`), not against planning docs. Companion to
`docs/search-professional-execution-expectations.md` and
`docs/search-professional-audit-gaps.md`.*

---

## 1. Tech stack (verified versions)

| Layer | Tech | Installed version | Where verified |
|---|---|---|---|
| Framework | Next.js **15** App Router (RSC, streaming, dynamic `searchParams` Promise) | `15.5.15` (spec `^15.5.9`) | `node_modules/next/package.json` |
| UI runtime | React **19** (`useTransition`, `useSyncExternalStore`, `cache`) | `19.2.6` | `node_modules/react/package.json` |
| URL state | **nuqs** (`useQueryState`, `nuqs/server` `createLoader`, `NuqsAdapter`) | `2.8.9` (spec `^2.8.3`) | `node_modules/nuqs/package.json` |
| CMS / data | Sanity (+ `next-sanity` client, GROQ, `match` full-text) | `sanity 3.99.0`, `next-sanity 9.12.3`, `@sanity/client 7.21.0` | `node_modules/*/package.json` |
| Styling | Tailwind CSS + design tokens | `3.4.19` (spec `^3.3.5`) | `node_modules/tailwindcss/package.json` |
| Tests | Vitest 4.1.5 (unit/integration), Playwright 1.59.1 (E2E) | — | `package.json` |
| Language | TypeScript 5, `strict`, path alias `@/*` | — | `tsconfig.json` |

**Platform notes**
- Store UI tree is wrapped in `<NuqsAdapter>` at `app/(store)/layout.tsx:46` — required by
  nuqs v2 on the Next App Router; `SearchField`/`SortDropdown` can therefore use
  `useQueryState`.
- `searchParams` is a **Promise** (Next 15 contract) and is awaited in `page.tsx:12` → the
  search page renders **dynamically** on every URL change.
- Runtime queries go through `sanity-cms/lib/client.ts` → `createClient` with
  `useCdn: true` (line 12) and `perspective: "published"` (line 19); `sanityFetch` is a
  thin wrapper (`client.ts:43-51`). No token in the public path.
- Search is **catalogue-scoped**: both queries require
  `defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0`
  (`searchProducts.ts:45,94`) — products not placed in the catalogue tree are invisible to
  search and autocomplete.

---

## 2. System layers (big picture)

```
Header (all store pages)
 ├─ SearchField (client, useRouter/useSearchParams)
 │    submit → /search?q=…            autocomplete → searchProductsAutocomplete (GROQ, 6 max)
 │    300 ms debounce + AbortController; keyboard nav; mobile full-screen overlay
 │    AutocompleteOverlay (role=listbox) → AutocompleteItem → /product/<slug>
 └─ dead: Searchbar.tsx (static form, never imported)

/search route  app/(store)/search/page.tsx
 ├─ await searchParams → ad-hoc parse q / sort / page  (no shared loader)
 ├─ searchProductsFull(q, sort, page)  — server action layer (sanity-cms/lib/products/searchProducts.ts)
 │    filterClause: name|sku|brand|specifications[]|overviewFields[]  match $query*
 │    Promise.all [ count(*[filterClause]) , *[filterClause]{…} | order(score desc, <sort>) [off…off+n] ]
 ├─ Suspense fallback ProductGridSkeleton
 ├─ SearchResults (RSC): SortDropdown + "N products" + ProductGrid + SearchPagination
 └─ error.tsx → SearchError (client retry)
```

## 3. Relation-by-relation trace

### R1 — Search entry points (header ⇄ route)
- `Header.tsx:20-22` renders `<SearchField />` inside `<Suspense>` (required because
  `useSearchParams` needs a boundary during prerender).
- `SearchField.handleSubmit` (`SearchField.tsx:38-45`) trims the query, requires ≥ 2 chars,
  and does `router.push('/search?q=' + encodeURIComponent(trimmed))` — a full navigation
  that re-runs the RSC tree.
- **Dead code:** `app/components/layout/header/Searchbar.tsx:5-44` — a static
  `<form role="search">` with a search icon and input but **no submit handler, no state,
  no `q` output**; it is never imported (verified: the only reference in the repo is its own
  definition).

### R2 — Autocomplete path (client ⇄ server action ⇄ GROQ)
- Debounce `DEBOUNCE_MS = 300` (`SearchField.tsx:11`), `MIN_QUERY_LENGTH = 2` (line 12).
- Effect at `SearchField.tsx:70-106`: aborts the previous `AbortController`, sets
  loading/overlay, then inside the debounce timer calls the server action
  `searchProductsAutocomplete(query)` (line 88) — a `'use server'` function
  (`searchProducts.ts:1`).
- GROQ (`searchProducts.ts:44-63`): `name|sku|brand|specifications[].value|overviewFields[].value
  match $query` with `$query = <trimmed>*` (line 41), plus a `score` select
  (name match = 20, brand match = 15, else 10), ordered `score desc, name asc`, sliced
  `[0...6]` (`MAX_AUTOCOMPLETE`, line 6). Errors are caught and `[]` returned
  (lines 66-69); the client surface shows the error state via the catch in
  `SearchField.tsx:95-100`.
- Keyboard: ArrowDown/ArrowUp move `activeIndex`, Enter on an active item navigates to
  `/product/<slug>` (`SearchField.tsx:128-156`); Escape closes the overlay.
- Overlay UI: `AutocompleteOverlay.tsx:29-95` (`role="listbox"`, skeleton while loading,
  "No products match '…'", "View all results" link); `AutocompleteItem.tsx:16-49`
  (`role="option"`, thumbnail, price via `centsToDisplay`).
- Mobile: icon-only trigger (`sm:hidden`, line 166), full-screen fixed overlay
  (`SearchField.tsx:173-246`) with its own input; close button clears and hides.

### R3 — Full results path (URL ⇄ page ⇄ query ⇄ UI)
- `app/(store)/search/page.tsx:11-18`: awaits `searchParams`, then **manually** derives
  `q` (string, default `''`), `sort` (string, default `undefined`), `page`
  (`parseInt`, default 1, floor at ≥ 1). No nuqs loader, no allowlist lookup at parse time.
- `searchProductsFull(q, sort, page)` (`page.tsx:18`) — signature
  `searchProducts.ts:72-77`, `perPage` defaults to 24 (`DEFAULT_PER_PAGE`, line 8).
- Sort resolution is an **independent, second allowlist** inside the data layer
  (`searchProducts.ts:86-92`): `sort.split(':')` → only `name` and `unit_amount` with
  `asc|desc`; anything else (including `featured` and `price_data.unit_amount:*`) falls back
  to `name asc` (line 86).
- Filter clause (`searchProducts.ts:94-100`) mirrors the autocomplete clause. Count and
  window are fetched concurrently (`Promise.all`, lines 104-128); the window select adds
  `stock`, `reservedStock`, `availableStock` (line 116) and orders

### R5 — Pagination
- `SearchPagination.tsx:11-72` (client): reads `page` from `useSearchParams` (line 15),
  computes `totalPages` (line 16), renders nothing for ≤ 1 page (line 19), mutates URL via
  `router.push(pathname + '?' + params, { scroll: false })` (lines 23-32) — **buttons, not
  `<Link>` hrefs** (contrast: catalogue `app/components/features/products/Pagination.tsx:27-36`
  renders real crawlable links preserving all params).
- "Showing X–Y of Z" + "Page X of Y" with `aria-live` (lines 42-59).
- **No server-side clamp:** `searchProductsFull` accepts any page and slices blindly
  (`searchProducts.ts:83,125`); an out-of-range `?page=` yields an empty window while
  `totalCount` stays > 0. (The category page closes this at `getProductsByVfsKeys.ts:79-84`.)

### R6 — Empty, header, error states
- `SearchEmpty.tsx:16-44`: "No products found", suggestions, and a "Browse all products"
  link that points to **`/products/headphones`** (line 38) instead of the full catalogue
  `/products` (`app/(store)/products/page.tsx`).
- `SearchHeader.tsx:8-36`: breadcrumb + `“QUERY”` heading.
- `error.tsx:6-22` (client) → `SearchError.tsx:10-28` with a retry `reset`.

### R7 — SEO / metadata
- `page.tsx:30-44` `generateMetadata` sets `title`/`description` only — **no `robots`
  noindex, no `alternates.canonical`** for `?q=…?sort=…?page=…` permutations (the category
  page applies `isFacetedQuery` → `noindex,follow` at `app/(store)/products/page.tsx:60`
  via `lib/catalogue/seo.ts:7-13`).
- `app/sitemap.ts:65` includes `/search` (base only); `app/robots.ts` has no disallow for
  search query permutations.

---

## 4. Comparison: search vs the category (filters) system

| Concern | Category (`/products`) | Search (`/search`) |
|---|---|---|
| Param parsing | shared `loadCategorySearchParams` (`lib/catalogue/searchParams.ts:17-21`) | ad-hoc in `page.tsx:13-16` |
| Sort contract | one allowlist `filterParams.ts` SORT_OPTIONS used by UI **and** server | UI uses `filterParams` options, server has a different allowlist (drift) |
| Page clamp | `getProductsByVfsKeys.ts:79-84` clamps to totalPages | none |
| Pagination links | real `<Link href>` | `router.push` buttons |
| Empty-state link | "Clear all filters" | "Browse all products" → `/products/headphones` (wrong target) |
| SEO | noindex on faceted/sorted/paginated | no robots handling at all |
| Sort order | allowlisted literal GROQ `order` | `order(score desc, <user sort>)` — score hijacks |

  `order(score desc, ${orderClause})` (line 125) before slicing `[offset...offset+perPage]`.
- Failure path: `catch` logs and returns `{ products: [], totalCount: 0 }` (lines 131-134).
- UI (`app/(store)/search/SearchResults.tsx:14-35`): `wishlistProductIds` resolved on the
  server (`lib/wishlist.ts:4-14`), empty → `SearchEmpty`; else header row with
  `SortDropdown` (line 25) + `{totalCount} products` (line 26), `ProductGrid` (line 28,
  `products as any`), `SearchPagination` (line 33).

### R4 — Sort contract divergence (the load-bearing defect)
- **Client contract:** `lib/catalogue/filterParams.ts:57-71` `SORT_OPTIONS` — values
  `featured`, `price_data.unit_amount:asc`, `price_data.unit_amount:desc`, `name:asc`,
  `name:desc`. `SortDropdown.tsx:19-23` renders these; `useFilterNuqs.handleSortChange`
  (`useFilterNuqs.ts:265-270`) writes `?sort=<value>` (clearing it for `featured`) via nuqs
  `shallow:false` (lines 54-61).
- **Server contract:** `searchProducts.ts:87-92` — `['name','unit_amount']` with
  `split(':')` (so `price_data.unit_amount:asc` parses to `field='price_data'`,
  `dir='unit_amount'` → fallback).
- Result: on `/search`, **only `name:asc` / `name:desc` survive**; price sorts and
  `featured` all collapse to `name asc`. The dropdown's default label "Featured" (nuqs
  default `sortParser.withDefault(SORT_DEFAULT)`, `filterParams.ts:184`) lies: the server
  default is `name asc` (`searchProducts.ts:86`).
- Even a surviving sort is **still secondary**: `order(score desc, <sort>)`
  (`searchProducts.ts:125`) puts the relevance score first, so user-chosen ordering only
  applies within equal-score buckets. (The category page avoids both problems by consuming
  `buildOrderClause`/`resolveSort` — `getProductsByVfsKeys.ts:68` — from the *same*
  `filterParams.ts` allowlist.)

