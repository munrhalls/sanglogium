# Filters & Sorting — Source Code Synopsis

## 1. Architecture Overview

Server-side filtering/sorting via URL query params (`?f=brand:sennheiser&sort=price_data.unit_amount:asc`).
Client toggles filters → URL updates → `router.refresh()` → Server Component re-runs → fresh GROQ query with filters.

**No client-side product filtering.** All product filtering happens in Sanity GROQ.

---

## 2. Data Flow

```
User clicks checkbox/slider/sort
  ↓
useFilterNuqs → updates URL (?f=..., ?sort=...)
  ↓
router.refresh() → Server Component re-executes
  ↓
CategoryPage (page.tsx) reads query.f / query.sort
  ↓
getProductsByVfsKeys({ keys, sort, filters }) → FilterBuilder.buildClause()
  ↓
Sanity GROQ with dynamic filter clause + order clause
  ↓
Products re-rendered
```

---

## 3. Files Traced

### Client Layer ("use client")

| File | Purpose |
|------|---------|
| `app/components/features/filters/useFilterNuqs.ts` | Core hook. Uses `nuqs` to sync filter/sort/page state to URL. Exposes: toggleFilter, removeFilter, clearAllFilters, setPriceRange, setStockMinimum, handleSortChange. Calls `router.refresh()` after every mutation to trigger server re-render. |
| `app/components/features/filters/FilterSidebar.tsx` | Desktop sidebar. Renders PriceRangeSlider, StockMinimumSlider, and checkbox groups from CMS filter config. |
| `app/components/features/filters/MobileFilterDrawer.tsx` | Mobile bottom-sheet drawer. Same filter UI as sidebar but with Escape key handler, focus trap, backdrop overlay, sticky "Show Results" footer. |
| `app/components/features/filters/MobileControlsBar.tsx` | Mobile top bar with "Filters (N)" button + SortDropdown. Counts active filters from `searchParams.getAll('f')`. |
| `app/components/features/filters/MobileFilterToggle.tsx` | Unused simple toggle button (orphaned). |
| `app/components/features/filters/SortDropdown.tsx` | `<select>` with 5 options: featured, price asc/desc, name asc/desc. |
| `app/components/features/filters/ActiveFilters.tsx` | Pill buttons showing active filters with "×" remove and "Clear all". Formats priceRange cents → dollars for display. |
| `app/components/features/filters/PriceRangeSlider.tsx` | Dual range sliders (min/max) with gradient styling, invalid-state auto-fix (min > max clamping), clear button. Values in dollars; converts to cents for URL via `displayToCents()`. |
| `app/components/features/filters/StockMinimumSlider.tsx` | Single range slider for minimum stock. Value 0 = "Any", >0 = "At least N items". |
| `app/components/ui/Checkbox.tsx` | Custom styled checkbox with peer/sr-only pattern. |

### Server Layer (Server Components / Server Actions)

| File | Purpose |
|------|---------|
| `app/(store)/products/[...slug]/page.tsx` | Category page. Parses `query.sort` and `query.f` from URL. Handles comma-separated filters. Calls `getProductsByVfsKeys()`, `getCategoryMetadata()`, `getFiltersForCategoryPath()`. Streams products + filters via Suspense. |
| `app/(store)/products/[...slug]/FilterSection.tsx` | Async wrapper that awaits `filtersPromise` and renders `<FilterSidebar />`. |
| `app/(store)/products/[...slug]/ProductsSection.tsx` | Awaits `productsPromise` + `filtersPromise`, then renders `<CategoryPageClient />`. |
| `app/(store)/products/[...slug]/CategoryPageClient.tsx` | Client orchestrator. Renders SortDropdown (desktop), MobileControlsBar, ActiveFilters, ProductGrid. Manages `isDrawerOpen` state for mobile filter drawer. |
| `app/(store)/search/SearchResults.tsx` | Search results page. Uses `SortDropdown` only (no filter UI). Sort param passed to `searchProductsFull()`. |
| `app/components/features/filters/FilterConfigProvider.tsx` | Server component that fetches filters via `getFiltersForCategoryPathAction()` and passes to render prop child. **Unused in current flow** — page.tsx calls `getFiltersForCategoryPath()` directly instead. |

### Data Access Layer (Sanity CMS)

| File | Purpose |
|------|---------|
| `sanity-cms/lib/products/getProductsByVfsKeys.ts` | Fetches products by catalogue keys. Builds `orderClause` from `sort` param. Delegates filter clause to `FilterBuilder.buildClause()`. Capped at 100 products (`MAX_PRODUCTS_LIMIT`). Uses `react.cache()`. |
| `sanity-cms/lib/products/FilterBuilder.ts` | **Pure class, no dependencies.** Builds GROQ filter clauses from URL filter strings. Supports: `brand` (OR logic, case-insensitive), `price`/`priceRange` (min/max), `stockMin` (>=), generic fields (matches `overviewFields` or `specifications`). Escapes quotes, validates numeric input. |
| `sanity-cms/lib/products/filter/getFiltersForCategoryPath.ts` | Fetches available filters for a category: (1) CMS `categoryFilters` config (checkbox/radio/multiselect/boolean), (2) dynamic price range via GROQ order slicing, (3) dynamic max stock, (4) brand list extracted from actual products. Uses `react.cache()`. |
| `sanity-cms/lib/products/sort/getSortablesForCategoryPath.ts` | Returns sort options. Defaults to 5 hardcoded options. Tries CMS `categorySortables` first; falls back to defaults. Uses `react.cache()`. |
| `sanity-cms/lib/products/searchProducts.ts` | Search products (autocomplete + full). `searchProductsFull()` supports `sort` param with same `field:dir` format. |
| `app/actions/categories.ts` | Server actions: `getFiltersForCategoryPathAction()` and `getSortablesForCategoryPathAction()`. Both catch errors and return safe fallbacks. |

### Utilities

| File | Purpose |
|------|---------|
| `lib/filters/urlParams.ts` | URL param helpers: `parseFilterParams()`, `parseFilterState()`, `buildFilterUrl()`, `isFilterActive()`, `toggleFilter()`. **Mostly unused** — `useFilterNuqs` uses nuqs directly. `parseFilterParams()` has special logic for comma-separated and min/max sub-values. |
| `lib/utils/price.ts` | `centsToDisplay()` and `displayToCents()`. Used for price slider values (cents in URL, dollars in UI). |

### Tests

| File | Purpose |
|------|---------|
| `app/components/features/filters/__tests__/price-filtering.test.tsx` | 3 vitest tests verifying cents ↔ dollars conversion for slider ↔ URL ↔ backend. |

---

## 4. URL Schema

| Param | Format | Example |
|-------|--------|---------|
| `f` (filter) | `field:value` | `f=brand:sennheiser`, `f=priceRange:min:2000`, `f=priceRange:max:10000`, `f=stockMin:5` |
| `sort` | `field:dir` or `featured` | `sort=price_data.unit_amount:asc` |
| `page` | string | `page=2` (placeholder, pagination not implemented) |

**Comma-separated filters** in a single `f` param are split: `f=brand:Hifiman,brand:Focal` → `["brand:Hifiman", "brand:Focal"]`.

---

## 5. GROQ Filter Construction

FilterBuilder groups filters by field, then emits clauses:

- **brand**: `&& (lower(brand->name) == lower("Sennheiser") || lower(brand->name) == lower("Focal"))`
- **priceRange**: `&& (price_data.unit_amount >= 2000 && price_data.unit_amount <= 10000)`
- **stockMin**: `&& (stock >= 5)`
- **generic** (e.g. driverType): `&& (count(overviewFields[@.title == "driverType" && @.value == "dynamic"]) > 0 || count(specifications[...]) > 0)`

Injected into base query:
```groq
*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 {filterClause}] {orderClause} [0...100]
```

---

## 6. Known Issues / Gaps

1. **SortDropdown is hardcoded** — `SortDropdown.tsx` has 5 hardcoded `<option>` values. It does NOT consume `getSortablesForCategoryPath()` dynamically. The CMS `categorySortables` feature exists in backend but is not wired to the UI.
2. **FilterConfigProvider is orphaned** — exists as render-prop component but page.tsx fetches filters directly via `getFiltersForCategoryPath()`.
3. **MobileFilterToggle is orphaned** — simple button, never imported anywhere.
4. **urlParams.ts is mostly dead code** — `useFilterNuqs` uses nuqs directly; these helpers are not imported by active components.
5. **Search does not use FilterBuilder** — `searchProductsFull()` has its own sort logic but no filter UI; search results cannot be filtered by brand/price.
6. **No pagination on category pages** — `MAX_PRODUCTS_LIMIT = 100` caps results; no "Load more" or page numbers.
7. **Category page reads all products to extract brands** — `getFiltersForCategoryPath.ts` fetches ALL products in category (up to Sanity default limit) just to extract unique brands. Could be optimized with GROQ aggregation.

---

## 7. Call Site Verification

| Module | Actually used by | Status |
|--------|-----------------|--------|
| `useFilterNuqs` | FilterSidebar, MobileFilterDrawer, ActiveFilters, SortDropdown, MobileControlsBar | **Active** |
| `FilterSidebar` | FilterSection.tsx (via page.tsx Suspense) | **Active** |
| `MobileFilterDrawer` | CategoryPageClient.tsx | **Active** |
| `MobileControlsBar` | CategoryPageClient.tsx | **Active** |
| `ActiveFilters` | CategoryPageClient.tsx | **Active** |
| `SortDropdown` | CategoryPageClient.tsx, SearchResults.tsx | **Active** |
| `FilterConfigProvider` | Not imported anywhere | **Orphaned** |
| `MobileFilterToggle` | Not imported anywhere | **Orphaned** |
| `FilterBuilder` | getProductsByVfsKeys.ts | **Active** |
| `getFiltersForCategoryPath` | page.tsx, FilterSection.tsx | **Active** |
| `getSortablesForCategoryPath` | categories.ts action only | **Backend only, UI unwired** |
| `urlParams.ts` | Not imported by active components | **Mostly dead** |
