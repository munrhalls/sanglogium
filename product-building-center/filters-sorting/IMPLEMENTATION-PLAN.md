# Filters & Sorting — Streaming Blueprint Implementation Plan

Source of truth: `component-tree.mermaid` and `state-flow-sequence.mermaid` in this folder.
Execute **one phase at a time**. Inside a phase, do the tasks in order, then **STOP** and report.

---

## HARD RULES — read before touching any file

You are coding the blueprint. **Nothing else.**

**BANNED actions (do none of these, ever, during this program):**
- `npm run dev`, `next dev`, `next build`, `next start`, `curl` to the dev server
- `tsc`, `eslint`, `prettier`, any lint/format/type command
- `vitest`, `jest`, `playwright`, any test command
- Chrome / CDP / any browser automation
- `npm install` / `npm ci`
- `git` commands (no commit, no push)
- Any command that "verifies", "checks", "builds", or "runs" the app

**BANNED behaviors:**
- Do NOT read files that are not named in the task you are on.
- Do NOT edit files that are not named in the task you are on.
- Do NOT add tests, explanatory comments, console.logs, or "improvements".
- Do NOT refactor, rename, or reformat anything outside the exact instruction.
- Do NOT touch shared/global components or data helpers (see "Do not touch" list).

**You have exactly one job per task:** write the file exactly as specified. When done, stop and report the file(s) you wrote.

---

## Fixed constants (use these literally)

- `ROW_SIZE = 8`  (products per streaming chunk / row)
- `PER_PAGE = 24` (page size = 3 × ROW_SIZE)
- GROQ slice is **EXCLUSIVE** (two dots): `[offset..offset+limit]` returns exactly `limit` items.

---

## Files this program creates / edits (overview)

| # | File | Action |
|---|------|--------|
| 1 | `sanity-cms/lib/products/getProductsSlice.ts` | CREATE |
| 2 | `app/(store)/products/[...slug]/ProductRowSkeleton.tsx` | CREATE |
| 3 | `app/(store)/products/[...slug]/ProductRow.tsx` | CREATE |
| 4 | `app/(store)/products/[...slug]/StreamedProductGrid.tsx` | CREATE |
| 5 | `app/(store)/products/[...slug]/ProductsToolbar.tsx` | CREATE |
| 6 | `app/(store)/products/[...slug]/ProductsSection.tsx` | REWRITE |
| 7 | `app/(store)/products/[...slug]/page.tsx` | REWRITE |
| 8 | `app/(store)/products/[...slug]/CategoryPageClient.tsx` | DELETE |

## Do NOT touch (under any circumstance)

- `app/components/features/products/ProductGrid.tsx`  ← the search page uses it
- `sanity-cms/lib/products/getProductsByVfsKeys.ts`   ← template only; leave as-is
- `lib/catalogue/filterParams.ts`  (sort allowlist, DEFAULT_PER_PAGE, parsers)
- `sanity-cms/lib/products/FilterBuilder.ts`
- `app/components/features/filters/*`  (useFilterNuqs, SortDropdown, FilterSidebar, ActiveFilters, MobileControlsBar, MobileFilterDrawer)
- `app/components/features/products/Pagination.tsx`, `EmptyResults.tsx`, `ProductCard.tsx`, `ProductCardSkeleton.tsx`
- `sanity-cms/lib/products/filter/getFiltersForCategoryPath.ts`
- `lib/wishlist.ts`, `lib/catalogue/pagination.ts`

---

## PHASE 1 — Data layer: slice + count

### Task 1.1 — CREATE `sanity-cms/lib/products/getProductsSlice.ts`

Write this file **verbatim**:

```ts
import { sanityFetch } from '@/sanity-cms/lib/client';
import { groq } from 'next-sanity';
import { FilterBuilder } from './FilterBuilder';
import { buildOrderClause } from '@/lib/catalogue/filterParams';
import type { Product } from './getProductsByVfsKeys';

// Streaming blueprint constants.
export const ROW_SIZE = 8;
export const PER_PAGE = 24;

export interface GetProductsCountOptions {
  keys: string[];
  filters?: string[];
}

export interface GetProductsSliceOptions {
  keys: string[];
  sort?: string;
  filters?: string[];
  offset: number;
  limit: number;
}

export async function getProductsCount({ keys, filters = [] }: GetProductsCountOptions): Promise<number> {
  if (!keys.length) return 0;
  const filterClause = FilterBuilder.buildClause(filters);
  const countQuery = groq`count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}])`;
  try {
    return (await sanityFetch<number>({ query: countQuery, params: { keys } })) ?? 0;
  } catch (error) {
    console.error('[getProductsCount] Failed:', error);
    return 0;
  }
}

export async function getProductsSlice({ keys, sort = 'featured', filters = [], offset, limit }: GetProductsSliceOptions): Promise<Product[]> {
  if (!keys.length) return [];
  const orderClause = buildOrderClause(sort);
  const filterClause = FilterBuilder.buildClause(filters);
  // EXCLUSIVE slice: two dots -> exactly `limit` items (offset..offset+limit).
  const productsQuery = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}] ${orderClause} [${offset}..${offset + limit}] {
    _id,
    name,
    brand->{
      _id,
      name,
      slug
    },
    price_data,
    stock,
    reservedStock,
    "availableStock": stock - reservedStock,
    image {
      asset {
        _ref
      }
    },
    slug {
      current
    },
    catalogueLocationKeys
  }`;
  try {
    return (await sanityFetch<Product[]>({ query: productsQuery, params: { keys } })) ?? [];
  } catch (error) {
    console.error('[getProductsSlice] Failed:', error);
    return [];
  }
}
```

STOP.

---

## PHASE 2 — Row + row skeleton

### Task 2.1 — CREATE `app/(store)/products/[...slug]/ProductRowSkeleton.tsx`

Write this file **verbatim**:

```tsx
import React from 'react';
import { ProductCardSkeleton } from '@/app/components/features/products';

export function ProductRowSkeleton() {
  return (
    <div className="grid gap-8 grid-cols-1 xs:grid-cols-2 lg-desktop:grid-cols-3 lg-touch:grid-cols-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

STOP.

### Task 2.2 — CREATE `app/(store)/products/[...slug]/ProductRow.tsx`

Write this file **verbatim**:

```tsx
import React from 'react';
import { ProductCard } from '@/app/components/features/products';
import { getProductsSlice } from '@/sanity-cms/lib/products/getProductsSlice';

interface ProductRowProps {
  keys: string[];
  sort: string;
  filters: string[];
  offset: number;
  limit: number;
  wishlistSet: Set<string>;
}

export async function ProductRow({ keys, sort, filters, offset, limit, wishlistSet }: ProductRowProps) {
  const products = await getProductsSlice({ keys, sort, filters, offset, limit });

  if (products.length === 0) return null;

  return (
    <div className="grid gap-8 grid-cols-1 xs:grid-cols-2 lg-desktop:grid-cols-3 lg-touch:grid-cols-2">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} isWishlisted={wishlistSet.has(product._id)} />
      ))}
    </div>
  );
}
```

STOP.

---

## PHASE 3 — The streamed grid (server)

### Task 3.1 — CREATE `app/(store)/products/[...slug]/StreamedProductGrid.tsx`

Write this file **verbatim**:

```tsx
import React, { Suspense } from 'react';
import { getWishlistProductIds } from '@/lib/wishlist';
import { ROW_SIZE } from '@/sanity-cms/lib/products/getProductsSlice';
import { ProductRow } from './ProductRow';
import { ProductRowSkeleton } from './ProductRowSkeleton';

interface StreamedProductGridProps {
  keys: string[];
  sort: string;
  filters: string[];
  pageStart: number;
  rowCount: number;
  filterKey: string;
}

export async function StreamedProductGrid({ keys, sort, filters, pageStart, rowCount, filterKey }: StreamedProductGridProps) {
  const wishlistProductIds = await getWishlistProductIds();
  const wishlistSet = new Set(wishlistProductIds);

  return (
    <div className="flex flex-col gap-8">
      {Array.from({ length: rowCount }).map((_, i) => (
        <Suspense key={`${filterKey}:${i}`} fallback={<ProductRowSkeleton />}>
          <ProductRow
            keys={keys}
            sort={sort}
            filters={filters}
            offset={pageStart + i * ROW_SIZE}
            limit={ROW_SIZE}
            wishlistSet={wishlistSet}
          />
        </Suspense>
      ))}
    </div>
  );
}
```

STOP.

---

## PHASE 4 — Client toolbar (sort / count / mobile controls / active filters / drawer)

### Task 4.1 — CREATE `app/(store)/products/[...slug]/ProductsToolbar.tsx`

This is the client "toolbar" only — it does **not** render the product grid, the empty state, or pagination (those move to `page.tsx`).

Write this file **verbatim**:

```tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SortDropdown } from '@/app/components/features/filters/SortDropdown';
import { ActiveFilters } from '@/app/components/features/filters/ActiveFilters';
import { MobileControlsBar } from '@/app/components/features/filters/MobileControlsBar';
import { MobileFilterDrawer } from '@/app/components/features/filters/MobileFilterDrawer';
import { useFilterPending, useFilterNuqs } from '@/app/components/features/filters/useFilterNuqs';
import { useSearchParams, useParams } from 'next/navigation';
import { buildValidFilterFields, stripUnknownFilters } from '@/lib/catalogue/filterUtils';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  field: string;
  label: string;
  options: FilterOption[];
}

interface ProductsToolbarProps {
  filters: FilterGroup[];
  priceRange: { minPrice: number | null; maxPrice: number | null };
  maxStock: number | null;
  totalCount: number;
  categoryName?: string;
}

export function ProductsToolbar({
  filters,
  priceRange,
  maxStock,
  totalCount,
}: ProductsToolbarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerOpenRef = useRef(false);
  const isPending = useFilterPending();

  const openDrawer = () => {
    if (drawerOpenRef.current) return;
    drawerOpenRef.current = true;
    window.history.pushState({ filterDrawer: true }, '');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (!drawerOpenRef.current) return;
    drawerOpenRef.current = false;
    setIsDrawerOpen(false);
    window.history.back();
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>('[data-testid="open-filters-button"]')
        ?.focus();
    });
  };

  // Browser back closes the drawer (an entry is pushed on open).
  useEffect(() => {
    const onPopState = () => {
      if (!drawerOpenRef.current) return;
      drawerOpenRef.current = false;
      setIsDrawerOpen(false);
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>('[data-testid="open-filters-button"]')
          ?.focus();
      });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const {
    filters: activeUrlFilters,
    setFilters,
    clearAllFilters,
    handleSortChange,
  } = useFilterNuqs();

  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort');
  const currentPageParam = searchParams.get('page');
  const prevSortRef = useRef(currentSort);
  const prevPageRef = useRef(currentPageParam);

  useEffect(() => {
    const sortChanged = prevSortRef.current !== currentSort;
    const pageChanged = prevPageRef.current !== currentPageParam;
    prevSortRef.current = currentSort;
    prevPageRef.current = currentPageParam;
    if (sortChanged || pageChanged) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentSort, currentPageParam]);

  useEffect(() => {
    if (!activeUrlFilters || activeUrlFilters.length === 0) return;
    const validFields = buildValidFilterFields(filters);
    const cleaned = stripUnknownFilters(activeUrlFilters, validFields);
    if (cleaned.length !== activeUrlFilters.length) {
      setFilters(cleaned);
    }
  }, [filters, activeUrlFilters, setFilters]);

  const params = useParams();
  const slugStr = Array.isArray(params?.slug)
    ? (params.slug as string[]).join('/')
    : String(params?.slug ?? '');
  const prevSlugRef = useRef(slugStr);

  useEffect(() => {
    if (prevSlugRef.current === slugStr) return;
    prevSlugRef.current = slugStr;
    clearAllFilters();
    handleSortChange('featured');
  }, [slugStr, clearAllFilters, handleSortChange]);

  const productCount = totalCount;
  const countLabel = productCount === 1 ? 'product' : 'products';

  return (
    <>
      {/* Mobile drawer */}
      <MobileFilterDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        filters={filters}
        priceRange={priceRange}
        maxStock={maxStock}
      />

      <div className="min-w-0">
        {/* Desktop: Sort + Result count */}
        <div className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 mb-6 border-b border-border-secondary">
          <SortDropdown />
          <span className="type-metadata text-secondary">
            {productCount} {countLabel} {isPending && '(Loading...)'}
          </span>
        </div>

        {/* Mobile controls */}
        <div className="lg:hidden">
          <MobileControlsBar
            productCount={totalCount}
            onOpenFilters={openDrawer}
            isOpen={isDrawerOpen}
          />
        </div>

        {/* Active filters */}
        <ActiveFilters filterGroups={filters} />
      </div>
    </>
  );
}
```

STOP.

---

## PHASE 5 — Wire it together + cleanup

### Task 5.1 — REWRITE `app/(store)/products/[...slug]/ProductsSection.tsx`

Replace the **entire contents** of this file with:

```tsx
import React from 'react';
import { ProductsToolbar } from './ProductsToolbar';
import type { FilterResult } from '@/sanity-cms/lib/products/filter/getFiltersForCategoryPath';

interface ProductsSectionProps {
  filtersPromise: Promise<FilterResult>;
  totalCount: number;
  categoryName: string;
}

export async function ProductsSection({
  filtersPromise,
  totalCount,
  categoryName,
}: ProductsSectionProps) {
  const filterResult = await filtersPromise;

  return (
    <ProductsToolbar
      filters={filterResult.filters}
      priceRange={filterResult.priceRange}
      maxStock={filterResult.maxStock}
      totalCount={totalCount}
      categoryName={categoryName}
    />
  );
}
```

STOP.

### Task 5.2 — REWRITE `app/(store)/products/[...slug]/page.tsx` (part 1 of 2)

Replace the **entire contents** of this file with the code below, then continue with part 2 (the `return (...)` JSX + `generateMetadata`) in the next chunk.

```tsx
import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getCategoryMetadata } from '@/sanity-cms/lib/products/getCategoryMetadata';
import { getFiltersForCategoryPath, getValidFilterFields } from '@/sanity-cms/lib/products/filter/getFiltersForCategoryPath';
import { getProductsCount, PER_PAGE, ROW_SIZE } from '@/sanity-cms/lib/products/getProductsSlice';
import { loadCategorySearchParams } from '@/lib/catalogue/searchParams';
import { stripUnknownFilters } from '@/lib/catalogue/filterUtils';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { EmptyResults } from '@/app/components/features/products/EmptyResults';
import { Pagination } from '@/app/components/features/products/Pagination';
import { ProductsSection } from './ProductsSection';
import { FilterSection } from './FilterSection';
import { StreamedProductGrid } from './StreamedProductGrid';
import { FilterSidebarSkeleton } from '@/app/components/skeletons/FilterSidebarSkeleton';
import Breadcrumbs from '@/app/components/ui/breadcrumbs/CategoryBreadcrumbs';
import { isFacetedQuery, canonicalCategoryPath } from '@/lib/catalogue/seo';

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const leafSlug = slug[slug.length - 1];
  const nodeId = resolveSlugToId(leafSlug);

  if (!nodeId) {
    notFound();
  }

  const { sort, f: filters, page } = loadCategorySearchParams({
    ...query,
    f: Array.isArray(query.f) ? query.f.join(',') : query.f,
  });

  const descendantKeys = unrollDescendantKeys(nodeId);

  const validFields = await getValidFilterFields(descendantKeys);
  const cleanedFilters = stripUnknownFilters(filters, validFields);

  const filtersPromise = getFiltersForCategoryPath(descendantKeys, cleanedFilters);

  const metadata = await getCategoryMetadata(nodeId);
  if (!metadata) {
    notFound();
  }

  const totalCount = await getProductsCount({ keys: descendantKeys, filters: cleanedFilters });
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / PER_PAGE) : 0;
  const effectivePage = totalPages > 0 ? Math.min(Math.max(page, 1), totalPages) : page;
  const isPageOutOfRange = totalPages > 0 && page > totalPages;
  const pageStart = (effectivePage - 1) * PER_PAGE;
  const rowCount = totalCount === 0 ? 0 : Math.ceil(Math.min(PER_PAGE, totalCount - pageStart) / ROW_SIZE);
  const filterKey = [sort, cleanedFilters.join(','), effectivePage].join('|');

  const categoryPath = slug.length > 1
    ? slug[0].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : undefined;

  // PART 2 CONTINUES HERE (return JSX)
```

STOP — part 2 (return JSX + generateMetadata) is next.

### Task 5.2 (part 2 of 2) — the `return (...)` JSX + `generateMetadata`

Continue the `page.tsx` file from the `// PART 2 CONTINUES HERE (return JSX)` comment. Write exactly this (replacing that comment line), then close the component and add `generateMetadata`:

```tsx
  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-8 pb-12">
      <div className="grid grid-cols-1 lg-desktop:grid-cols-[240px_minmax(0,1fr)] lg-touch:grid-cols-[240px_minmax(0,1fr)] gap-8 items-stretch">
        <aside className="hidden lg-desktop:block lg-touch:block sticky top-[var(--desktop-header-h)] h-[calc(100vh-var(--desktop-header-h))] overflow-y-auto scrollbar-none pt-6 self-start">
          <Suspense fallback={<FilterSidebarSkeleton />}>
            <FilterSection filtersPromise={filtersPromise} />
          </Suspense>
        </aside>

        <main className="min-w-0 w-full pt-6">
          <div className="pb-4">
            <Breadcrumbs categoryParts={slug} />
            <ShopHeader title={metadata.name} overline={categoryPath} />
          </div>

          <Suspense fallback={null}>
            <ProductsSection
              filtersPromise={filtersPromise}
              totalCount={totalCount}
              categoryName={metadata.name}
            />
          </Suspense>

          {totalCount === 0 ? (
            <EmptyResults />
          ) : (
            <>
              {isPageOutOfRange && (
                <div
                  role="status"
                  data-testid="page-out-of-range"
                  className="mb-4 rounded-md border border-warning-500/40 bg-warning-500/10 px-4 py-3 type-body text-warning-500"
                >
                  The page you requested is out of range. Showing the last page of results.
                </div>
              )}
              <StreamedProductGrid
                keys={descendantKeys}
                sort={sort}
                filters={cleanedFilters}
                pageStart={pageStart}
                rowCount={rowCount}
                filterKey={filterKey}
              />
            </>
          )}

          <Pagination
            currentPage={effectivePage}
            totalPages={totalPages}
            totalCount={totalCount}
            perPage={PER_PAGE}
          />
        </main>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const leafSlug = slug[slug.length - 1];
  const nodeId = resolveSlugToId(leafSlug);

  if (!nodeId) {
    return { title: 'Category Not Found' };
  }

  const metadata = await getCategoryMetadata(nodeId);

  if (!metadata) {
    return { title: 'Category Not Found' };
  }

  return {
    title: `${metadata.name} — Sang Logium`,
    description: `Browse ${metadata.name} headphones and audio equipment`,
    alternates: { canonical: canonicalCategoryPath(slug) },
    robots: isFacetedQuery(query) ? { index: false, follow: true } : undefined,
  };
}
```

STOP.

### Task 5.3 — DELETE `app/(store)/products/[...slug]/CategoryPageClient.tsx`

Delete the file `app/(store)/products/[...slug]/CategoryPageClient.tsx`. It is now unused (replaced by `ProductsToolbar.tsx`). Do not touch any other file.

STOP.

---

## DONE

Program complete when all 8 files are done (5 created, 2 rewritten, 1 deleted). Report the list of files you wrote/deleted. Do not run anything.





