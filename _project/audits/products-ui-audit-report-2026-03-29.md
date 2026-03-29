# Products UI Audit Report - March 29, 2026

## Executive Summary

Your assumptions are **confirmed**. The products UI is indeed legacy implementation with significant architectural drift from current patterns. The codebase shows clear evidence of organic growth without refactoring, mixing outdated approaches with newer patterns.

---

## Area 1: Products Listing (`/products/*`)

### Pages Audited
- `app/(store)/products/page.tsx` - Root products page
- `app/(store)/products/[...category]/page.tsx` - Category products page

### Critical Issues Found

**1. Excessive Tailwind Class Proliferation**
- `@/app/(store)/products/page.tsx:59-125` contains **50+ arbitrary utility classes**
- Hardcoded color values: `bg-slate-200`, `bg-blue-950`, `text-gray-500`
- Arbitrary values: `max-w-[1400px]`, `grid-cols-[280px_1fr]`, `shadow-[0_-2px_10px_rgba(0,0,0,0.1)]`

**2. Broken Responsive Strategy**
- Dual-layout approach (desktop/mobile) with duplicated logic
- `hidden md:block` vs `flex h-dvh flex-col overflow-hidden md:hidden`
- Same data fetching logic duplicated twice in each page

**3. VFS Integration Incomplete**
- `@/app/(store)/products/[...category]/page.tsx:49-50` uses VFS functions but has fallback to empty arrays
- Early return in `getSelectedProducts` (line 106-111) prevents showing products without catalogue keys

**4. Mixture of Server/Client Boundaries**
- Page is Server Component but imports many Client wrappers
- SidebarClient.tsx is "use client" but receives server-fetched data

---

## Area 2: Product Detail (`/product/[id]`)

### Pages Audited
- `app/(store)/product/[id]/page.tsx`
- `app/(store)/product/[id]/ProductPageGallery.tsx`
- `app/(store)/product/[id]/StockIndicator.tsx`

### Critical Issues Found

**1. Import Error (Broken Code)**
```typescript
@/app/(store)/product/[id]/page.tsx:69
<InfoTooltip information={field.information} />
```
- Component imported as `InfoToolTip` (line 6 commented) but used as `InfoTooltip`
- Will throw runtime error if overviewFields/specifications have tooltips

**2. Excessive Client Components**
- `@/app/(store)/product/[id]/ProductPageGallery.tsx` - "use client" for simple image switching
- Uses React state for what could be CSS-only or server-rendered

**3. Hardcoded Styling**
- Arbitrary values: `max-w-[500px]`, `max-w-[700px]`, `grid-cols-[auto_1fr]`
- Mix of semantic and utility classes

**4. StockIndicator is Static/Dummy**
- `@/app/(store)/product/[id]/StockIndicator.tsx` always shows "In stock & shipping"
- Hardcoded text, no actual stock check logic
- Uses hardcoded `text-green-700`

---

## Area 3: Search (`/search`)

### Pages Audited
- `app/(store)/search/page.tsx`
- `app/components/features/search/SearchForm.tsx`
- `app/components/layout/header/Searchbar.tsx`

### Critical Issues Found

**1. Two Separate Search Components (Not DRY)**
- `SearchForm.tsx` - legacy, uses Phosphor icons, has action="/search"
- `Searchbar.tsx` - newer design system version, uses SVG icons
- Searchbar.tsx is **NOT FUNCTIONAL** - no form action, no submit handler

**2. SearchForm is Disconnected**
- `@/app/components/features/search/SearchForm.tsx` uses `action="/search"` but header uses `Searchbar.tsx`
- User cannot actually search from header

**3. Hardcoded Styling**
- `@/app/(store)/search/page.tsx:12` - `bg-slate-200`, `max-w-4xl`
- `@/app/components/features/search/SearchForm.tsx:16` - `placeholder-orange-400`

---

## Area 4: Shared Components

### ProductThumb.tsx
**Major Issue**: Contains explicit TODO acknowledging the problem:
```typescript
@/app/components/features/products/ProductThumb.tsx:20
// TODO there's some kinda issue with how it's all organized, this whole 
// products feature NEEDS REWORK TO MINIMIZE CLIENT COMPONENTS USE AND 
// MAX SERVER COMPONENTS USAGE
```
- 40+ Tailwind classes
- Hardcoded colors: `border-gray-200`, `text-gray-800`, `hover:border-gray-300`

### ProductsGrid.tsx
- Simple wrapper but uses `bg-slate-200` (non-design-system)

### Filter System (`/app/components/ui/filters/*`)
**Critical: Complex Over-Engineering**
- `@/app/components/ui/filters/Filters.tsx:144-152` - Client component with Suspense wrapper
- `@/app/components/ui/filters/Filters.tsx:20-90` - 70+ lines of query string manipulation
- Hardcoded styling: `bg-blue-700`, `animate-spin`, `border-t-transparent`

### Sort System (`/app/components/ui/sortables/*`)
**Same Issues as Filters**
- `@/app/components/ui/sortables/SortClient.tsx:110-140` - Hardcoded button colors
- Complex direction icon logic (lines 59-76) for simple toggle

### Pagination
- `@/app/components/ui/pagination/Pagination.tsx:46-49` - Hardcoded `bg-blue-500`
- Duplicate Prev/Next buttons for mobile/desktop

### Mobile Drawers
- `@/app/components/ui/drawers/filter/ProductsFilterDrawer.tsx:20` - `bg-blue-950`
- Same pattern repeated for sort drawer

---

## Area 5: Data Layer

### Sanity Queries (`/sanity/lib/products/*`)

**1. getSelectedProducts.ts - Query Builder Complexity**
- `@/sanity/lib/products/getSelectedProducts.ts:1-218` - 218 lines of dynamic GROQ construction
- Hardcoded sort logic for specific fields (bassPerformance, detailClarity, etc.)
- String concatenation for query building (fragile, injection risk)

**2. Type Safety Issues**
- `@/app/components/features/products/ProductThumb.tsx:34` - Uses `Product` from sanity.types but manually defines basket structure

**3. VFS Query Exists But Unused**
- `@/sanity/lib/products/getProductsByVfsKeys.ts:1-14` - Clean implementation
- Not integrated into main query flow

---

## Complete File Inventory

### **35 Files Identified for Reset/Deletion:**

**Pages (4):**
- `app/(store)/products/page.tsx`
- `app/(store)/products/[...category]/page.tsx`
- `app/(store)/product/[id]/page.tsx`
- `app/(store)/search/page.tsx`

**Product Components (4):**
- `app/components/features/products/ProductThumb.tsx`
- `app/components/features/products/ProductsGrid.tsx`
- `app/(store)/product/[id]/ProductPageGallery.tsx`
- `app/(store)/product/[id]/StockIndicator.tsx`

**Search Components (2):**
- `app/components/features/search/SearchForm.tsx`
- `app/components/layout/header/Searchbar.tsx`

**Filter System (8):**
- `app/components/ui/filters/Filters.tsx`
- `app/components/ui/filters/FilterItem.tsx`
- `app/components/ui/filters/FilterTypes.ts`
- `app/components/ui/filters/FiltersSkeleton.tsx`
- `app/components/ui/filters/MinOnlyFilter.tsx`
- `app/components/ui/filters/RangeFilter.tsx`
- `app/components/ui/filters/helpers/*` (2 files)

**Sort System (4):**
- `app/components/ui/sortables/SortClient.tsx`
- `app/components/ui/sortables/SortTypes.ts`
- `app/components/ui/sortables/helpers/*` (2 files)

**Pagination (3):**
- `app/components/ui/pagination/Pagination.tsx`
- `app/components/ui/pagination/ProductsPerPageDropdown.tsx`
- `app/components/ui/pagination/generatePageNumbers.ts`

**Drawers (2):**
- `app/components/ui/drawers/filter/ProductsFilterDrawer.tsx`
- `app/components/ui/drawers/sort/ProductsSortDrawer.tsx`
- `app/components/ui/drawers/ProductsFilterSortDrawersWrapper.tsx`

**Helpers (5):**
- `app/(store)/products/helpers/getSelectedFilters.ts`
- `app/(store)/products/helpers/getSelectedSort.ts`
- `app/(store)/products/helpers/getSelectedPagination.ts`
- `app/(store)/products/helpers/formatCategoryTitle.ts`
- `app/(store)/products/helpers/validateFilterObjects.ts`

**Breadcrumbs/Icons/Other (3):**
- `app/components/ui/breadcrumbs/CategoryBreadcrumbs.tsx`
- `app/components/ui/icons/CategoryTitleIcon.tsx`
- `app/components/ui/info-tool-tip/infoTooltip.tsx`

---

## Recommended Action Plan

### Option A: Surgical Reset (Recommended)

**Phase 1: Skeletal Pages (4 files)**
Strip all styling, leave only structural elements:
- Products listing page - keep grid layout structure only
- Product detail page - keep semantic HTML structure
- Search page - keep results layout structure

**Phase 2: Component Simplification (8 files)**
- ProductThumb -> Empty placeholder with `div` structure only
- ProductsGrid -> Empty grid container
- ProductPageGallery -> Placeholder image slots
- StockIndicator -> Empty state placeholder
- SearchForm & Searchbar -> Unstyled form structure
- Pagination -> Page number placeholders

**Phase 3: Filter/Sort System (12 files)**
- Keep type definitions (FilterTypes, SortTypes)
- Reset UI components to unstyled checkboxes/selects
- Keep URL parameter logic (it's functional)

**Phase 4: Delete Obsolete (11 files)**
- CategoryTitleIcon (icon mapping hardcoded)
- InfoTooltip (unused due to bug)
- Validation helpers (can be re-added later)
- Format helpers (pure functions, can redo)
- Drawer wrapper components

### Option B: Complete Deletion

**Delete All 35 Files** and rebuild from scratch when needed. This is safer but loses:
- Functional URL parameter handling for filters/sort/pagination
- Working GROQ query builders (despite complexity, they work)
- Type definitions that align with Sanity schema

---

## Verification of Your Assumptions

| Assumption | Status | Evidence |
|------------|--------|----------|
| Products UI is legacy | **CONFIRMED** | Mix of patterns, TODO comments acknowledging issues |
| Excessive Tailwind classes | **CONFIRMED** | 50+ classes per major component, arbitrary values |
| Zero data interaction needs reset | **CONFIRMED** | Props drilling, client/server boundary confusion |
| Needs redo from scratch | **CONFIRMED** | Architecture drift, broken Searchbar, import errors |

---

## Safe Deletion Candidates (No Dependencies)

These can be deleted immediately without breaking other parts:
1. `app/components/ui/icons/CategoryTitleIcon.tsx`
2. `app/components/ui/info-tool-tip/infoTooltip.tsx`
3. `app/(store)/products/helpers/formatCategoryTitle.ts`
4. `app/(store)/products/helpers/validateFilterObjects.ts`
5. `app/components/features/search/SearchForm.tsx` (unused)

---

**Zero code changes made as requested. This is a pure research/audit report.**
