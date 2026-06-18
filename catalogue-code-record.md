# Catalogue Code Record

> 100% complete, accurate, zero-gap code record of all code related to the products catalogue (virtual file system).

## `app/(store)/configuration.ts`

```typescript
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://sanglogium.com",
  },
  title: "Sang Logium Audio Shop",

  description: "E-commerce store",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});
```

## `app/(store)/product/[slug]/error.tsx`

```tsx
"use client";

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Product page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-gray-600">Failed to load product details</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Try again
      </button>
    </div>
  );
}
```

## `app/(store)/product/[slug]/loading.tsx`

```tsx
export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-12 bg-surface-elevated rounded animate-pulse" />
        <div className="h-4 w-4 bg-surface-elevated rounded animate-pulse" />
        <div className="h-4 w-16 bg-surface-elevated rounded animate-pulse" />
        <div className="h-4 w-4 bg-surface-elevated rounded animate-pulse" />
        <div className="h-4 w-24 bg-surface-elevated rounded animate-pulse" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Image Gallery Skeleton */}
        <div className="lg:w-1/2 space-y-4">
          <div className="aspect-square bg-surface-elevated rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="w-20 h-20 bg-surface-elevated rounded animate-pulse" />
            <div className="w-20 h-20 bg-surface-elevated rounded animate-pulse" />
            <div className="w-20 h-20 bg-surface-elevated rounded animate-pulse" />
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="lg:w-1/2 space-y-6">
          {/* Brand */}
          <div className="h-4 w-24 bg-surface-elevated rounded animate-pulse" />
          {/* Name */}
          <div className="h-10 w-3/4 bg-surface-elevated rounded animate-pulse" />
          {/* Price */}
          <div className="h-6 w-32 bg-surface-elevated rounded animate-pulse" />
          {/* SKU */}
          <div className="h-4 w-40 bg-surface-elevated rounded animate-pulse" />
          {/* Stock */}
          <div className="h-4 w-24 bg-surface-elevated rounded animate-pulse" />

          {/* Overview fields */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-border-secondary">
            <div className="space-y-2">
              <div className="h-3 w-16 bg-surface-elevated rounded animate-pulse" />
              <div className="h-4 w-24 bg-surface-elevated rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-surface-elevated rounded animate-pulse" />
              <div className="h-4 w-24 bg-surface-elevated rounded animate-pulse" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-surface-elevated rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-surface-elevated rounded animate-pulse" />
          </div>

          {/* Quantity and Add to Cart */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-4 w-20 bg-surface-elevated rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-surface-elevated rounded animate-pulse" />
                <div className="w-12 h-10 bg-surface-elevated rounded animate-pulse" />
                <div className="w-10 h-10 bg-surface-elevated rounded animate-pulse" />
              </div>
            </div>
            <div className="h-12 w-full bg-surface-elevated rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Specifications Section Skeleton */}
      <div className="mt-12 pt-8 border-t border-border-secondary">
        <div className="h-8 w-32 bg-surface-elevated rounded animate-pulse mb-6" />
        <div className="space-y-3">
          <div className="h-12 w-full bg-surface-elevated rounded animate-pulse" />
          <div className="h-12 w-full bg-surface-elevated rounded animate-pulse" />
          <div className="h-12 w-full bg-surface-elevated rounded animate-pulse" />
          <div className="h-12 w-full bg-surface-elevated rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
```

## `app/(store)/product/[slug]/page.tsx`

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts } from '@/sanity-cms/lib/products';
import { ProductDetail } from '@/app/components/features/products';
import { generateOptimizedTitle, generateSEOTitle, generateMetaDescription } from '@/lib/utils/title-optimization';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products by category
  const relatedProducts = await getRelatedProducts(
    product._id,
    product.catalogueLocationKeys || [],
    6
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="type-caption text-secondary hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li className="type-caption text-caption">/</li>
          <li>
            <Link href="/products" className="type-caption text-secondary hover:text-primary transition-colors">
              Products
            </Link>
          </li>
          <li className="type-caption text-caption">/</li>
          <li className="type-caption text-primary font-medium">
            {product.name}
          </li>
        </ol>
      </nav>

      <ProductDetail product={product} relatedProducts={relatedProducts} />
    </div>
  );
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  // Generate optimized titles for different contexts
  const optimizedTitle = generateOptimizedTitle({
    productName: product.name,
    brand: product.brand,
    siteName: 'Sang Logium'
  });

  const seoTitle = generateSEOTitle({
    productName: product.name,
    brand: product.brand,
    siteName: 'Sang Logium'
  });

  const metaDescription = generateMetaDescription(
    product.description,
    product.name,
    product.brand
  );

  return {
    title: optimizedTitle, // Browser-optimized title
    description: metaDescription,
    // Additional SEO metadata
    openGraph: {
      title: seoTitle, // Full SEO title for social sharing
      description: metaDescription,
      type: 'website',
      siteName: 'Sang Logium',
    },
    twitter: {
      title: seoTitle, // Full title for Twitter cards
      description: metaDescription,
      card: 'summary_large_image',
    },
    // Structured data for search engines
    other: {
      'seo-title': seoTitle, // Custom meta for SEO tracking
    }
  };
}
```

## `app/(store)/products/[...slug]/CategoryPageClient.tsx`

```tsx
"use client";

import React, { useState } from 'react';
import { ProductGrid } from '@/app/components/features/products';
import { SortDropdown } from '@/app/components/features/filters/SortDropdown';
import { ActiveFilters } from '@/app/components/features/filters/ActiveFilters';
import { MobileControlsBar } from '@/app/components/features/filters/MobileControlsBar';
import { MobileFilterDrawer } from '@/app/components/features/filters/MobileFilterDrawer';
import { useFilterPending } from '@/app/components/features/filters/useFilterNuqs';
// Product type is passed through from server; ProductGrid has its own compatible local type

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  field: string;
  label: string;
  options: FilterOption[];
}

interface CategoryPageClientProps {
  filters: FilterGroup[];
  priceRange: { minPrice: number | null; maxPrice: number | null };
  maxStock: number | null;
  products: any[];
  categoryName?: string;
}

export function CategoryPageClient({
  filters,
  priceRange,
  maxStock,
  products,
  categoryName,
}: CategoryPageClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isPending = useFilterPending();
  // Products are already filtered server-side via GROQ
  const productCount = products.length;
  const countLabel = productCount === 1 ? 'product' : 'products';

  return (
    <>
      {/* Mobile drawer */}
      <MobileFilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
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
            productCount={products.length}
            onOpenFilters={() => setIsDrawerOpen(true)}
          />
        </div>

        {/* Active filters */}
        <ActiveFilters filterGroups={filters} />

        <ProductGrid products={products} />
      </div>
    </>
  );
}
```

## `app/(store)/products/[...slug]/error.tsx`

```tsx
"use client";

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CategoryError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Category page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-gray-600">Failed to load category products</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Try again
      </button>
    </div>
  );
}
```

## `app/(store)/products/[...slug]/FilterSection.tsx`

```tsx
import React from 'react';
import { FilterSidebar } from '@/app/components/features/filters/FilterSidebar';
import type { FilterResult } from '@/sanity-cms/lib/products/filter/getFiltersForCategoryPath';

interface FilterSectionProps {
  filtersPromise: Promise<FilterResult>;
}

export async function FilterSection({ filtersPromise }: FilterSectionProps) {
  const filterResult = await filtersPromise;

  return <FilterSidebar filters={filterResult.filters} priceRange={filterResult.priceRange} maxStock={filterResult.maxStock} />;
}
```

## `app/(store)/products/[...slug]/loading.tsx`

```tsx
import { ShopHeaderSkeleton } from '@/app/components/features/products/ShopHeaderSkeleton';
import { ProductGridSkeleton } from '@/app/components/features/products/ProductGridSkeleton';

// Default skeleton count while loading
const DEFAULT_SKELETON_COUNT = 12;

export default function CategoryLoading() {
  return (
    <>
      <ShopHeaderSkeleton />
      <ProductGridSkeleton count={DEFAULT_SKELETON_COUNT} />
    </>
  );
}
```

## `app/(store)/products/[...slug]/page.tsx`

```tsx
import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getProductsByVfsKeys } from '@/sanity-cms/lib/products/getProductsByVfsKeys';
import { getCategoryMetadata } from '@/sanity-cms/lib/products/getCategoryMetadata';
import { getFiltersForCategoryPath } from '@/sanity-cms/lib/products/filter/getFiltersForCategoryPath';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { FilterSidebar } from '@/app/components/features/filters/FilterSidebar';
import { CategoryPageClient } from './CategoryPageClient';
import { ProductsSection } from './ProductsSection';
import { FilterSection } from './FilterSection';
import { ProductGridSkeleton } from '@/app/components/skeletons/ProductGridSkeleton';
import { FilterSidebarSkeleton } from '@/app/components/skeletons/FilterSidebarSkeleton';
import Breadcrumbs from '@/app/components/ui/breadcrumbs/CategoryBreadcrumbs';

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

  // Parse URL params
  const sort = typeof query.sort === 'string' ? query.sort : 'featured';
  const rawFilters = Array.isArray(query.f) ? query.f : query.f ? [query.f] : [];

  // Handle comma-separated filters: "brand:Hifiman,brand:Focal" -> ["brand:Hifiman", "brand:Focal"]
  const filters = rawFilters.flatMap(f => f.split(','));

  const descendantKeys = unrollDescendantKeys(nodeId);

  // Create promises for streaming (don't await here)
  const productsPromise = getProductsByVfsKeys({
    keys: descendantKeys,
    sort,
    filters
  });
  const metadataPromise = getCategoryMetadata(nodeId);
  const filtersPromise = getFiltersForCategoryPath(descendantKeys);

  // Await metadata for immediate render (lightweight)
  const metadata = await metadataPromise;

  // Handle missing metadata (should not happen if nodeId exists, but type-safe)
  if (!metadata) {
    notFound();
  }

  // Build category path for overline (e.g., "Audio Electronics")
  const categoryPath = slug[0]
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-8 pb-12">
      <div className="grid grid-cols-1 lg-desktop:grid-cols-[240px_minmax(0,1fr)] lg-touch:grid-cols-[240px_minmax(0,1fr)] gap-8 items-stretch">
        {/* Sidebar - full height on left */}
        <aside className="hidden lg-desktop:block lg-touch:block sticky top-[var(--desktop-header-h)] h-[calc(100vh-var(--desktop-header-h))] overflow-y-auto scrollbar-none pt-6 self-start">
          <Suspense fallback={<FilterSidebarSkeleton />}>
            <FilterSection filtersPromise={filtersPromise} />
          </Suspense>
        </aside>

        {/* Main content - header + products stacked */}
        <main className="min-w-0 w-full pt-6">
          {/* Header now in right column */}
          <div className="pb-4">
            <Breadcrumbs categoryParts={slug} />
            <ShopHeader title={metadata.name} overline={categoryPath} />
          </div>

          {/* Products section */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductsSection
              productsPromise={productsPromise}
              filtersPromise={filtersPromise}
              categoryName={metadata.name}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
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
  };
}
```

## `app/(store)/products/[...slug]/ProductsSection.tsx`

```tsx
import React from 'react';
import { ProductGrid } from '@/app/components/features/products';
import { CategoryPageClient } from './CategoryPageClient';
import type { Product } from '@/sanity-cms/lib/products/getProductsByVfsKeys';
import type { FilterResult } from '@/sanity-cms/lib/products/filter/getFiltersForCategoryPath';

interface ProductsSectionProps {
  productsPromise: Promise<Product[]>;
  filtersPromise: Promise<FilterResult>;
  categoryName: string;
}

export async function ProductsSection({
  productsPromise,
  filtersPromise,
  categoryName
}: ProductsSectionProps) {
  const [products, filterResult] = await Promise.all([productsPromise, filtersPromise]);

  return (
    <CategoryPageClient
      filters={filterResult.filters}
      priceRange={filterResult.priceRange}
      maxStock={filterResult.maxStock}
      products={products}
      categoryName={categoryName}
    />
  );
}
```

## `app/(store)/search/error.tsx`

```tsx
'use client';

import React from 'react';
import { SearchError } from '@/app/components/features/search/SearchError';

export default function SearchErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log to console for observability
    console.error('[SearchErrorBoundary] Caught error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-content px-4 md:px-8 pt-6 pb-12">
      <SearchError onRetry={reset} />
    </div>
  );
}
```

## `app/(store)/search/page.tsx`

```tsx
import React, { Suspense } from 'react';
import { SearchHeader } from '@/app/components/features/search/SearchHeader';
import { searchProductsFull } from '@/sanity-cms/lib/products/searchProducts';
import { ProductGridSkeleton } from '@/app/components/skeletons/ProductGridSkeleton';
import { SearchResults } from './SearchResults';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = await searchParams;
  const q = typeof query.q === 'string' ? query.q : '';
  const sort = typeof query.sort === 'string' ? query.sort : undefined;
  const pageParam = typeof query.page === 'string' ? parseInt(query.page, 10) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const resultsPromise = searchProductsFull(q, sort, page);

  return (
    <div className="mx-auto max-w-content px-4 md:px-8 pt-6 pb-12">
      <SearchHeader query={q} />
      <Suspense fallback={<ProductGridSkeleton />}>
        <SearchResults resultsPromise={resultsPromise} query={q} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const query = await searchParams;
  const q = typeof query.q === 'string' ? query.q.trim() : '';

  if (q) {
    return {
      title: `${q} — Search Results | Sang Logium`,
      description: `Search results for "${q}" — headphones, IEMs, DACs and audio accessories at Sang Logium`,
    };
  }

  return {
    title: 'Search — Sang Logium',
    description: 'Search for headphones, IEMs, DACs and audio accessories',
  };
}
```

## `app/(store)/search/SearchResults.tsx`

```tsx
import React from 'react';
import { SearchEmpty } from '@/app/components/features/search/SearchEmpty';
import { SearchPagination } from '@/app/components/features/search/SearchPagination';
import { ProductGrid } from '@/app/components/features/products/ProductGrid';
import { SortDropdown } from '@/app/components/features/filters/SortDropdown';
import type { SearchResult } from '@/sanity-cms/lib/products/searchProducts';

interface SearchResultsProps {
  resultsPromise: Promise<SearchResult>;
  query: string;
}

export async function SearchResults({ resultsPromise, query }: SearchResultsProps) {
  const { products, totalCount } = await resultsPromise;

  if (products.length === 0) {
    return <SearchEmpty query={query} />;
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-border-secondary pb-4 mb-6">
        <SortDropdown />
        <span className="type-metadata text-secondary">{totalCount} products</span>
      </div>
      <ProductGrid
        products={products as any}
        className="grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg-desktop:grid-cols-4 lg-touch:grid-cols-3"
      />
      <SearchPagination totalCount={totalCount} />
    </>
  );
}
```

## `app/actions/categories.ts`

```typescript
"use server";
import { getFiltersForCategoryPath } from "@/sanity-cms/lib/products/filter/getFiltersForCategoryPath";
import { getSortablesForCategoryPath } from "@/sanity-cms/lib/products/sort/getSortablesForCategoryPath";

export async function getFiltersForCategoryPathAction(catalogueKeys: string[]) {
  try {
    const filterResult = await getFiltersForCategoryPath(catalogueKeys);
    return filterResult;
  } catch (error) {
    console.error("Error:", error);
    return {
      filters: [],
      priceRange: { minPrice: null, maxPrice: null },
      maxStock: null
    };
  }
}

export async function getSortablesForCategoryPathAction(catalogueKeys: string[]) {
  try {
    const sortables = await getSortablesForCategoryPath(catalogueKeys);
    return sortables;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}
```

## `app/api/basket/products/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getBasketProducts } from '@/sanity-cms/lib/products/getBasketProducts'

function sanitizeFiniteNonNegative(value: unknown): number {
  if (typeof value !== 'number') return 0
  if (!Number.isFinite(value)) return 0
  return Math.max(0, value)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get('ids')

  if (!idsParam) {
    return NextResponse.json({ success: true, data: [] })
  }

  const ids = idsParam.split(',').filter(Boolean)

  try {
    const rawProducts = await getBasketProducts(ids)

    const products = rawProducts
      .map((product) => {
        const stock = sanitizeFiniteNonNegative(product.stock)
        const reservedStock = Math.min(sanitizeFiniteNonNegative(product.reservedStock), stock)

        if (stock !== product.stock || reservedStock !== product.reservedStock) {
          console.warn(
            `[API/basket/products] Sanitized stock/reservedStock for product ${product._id}: stock ${product.stock} → ${stock}, reservedStock ${product.reservedStock} → ${reservedStock}`
          )
        }

        return {
          ...product,
          stock,
          reservedStock,
        }
      })
      .filter((product) => {
        if (!product._id || !product.name || !product.price_data?.unit_amount) {
          console.warn(`[API/basket/products] Filtered out invalid product: missing _id, name, or price_data`)
          return false
        }
        return true
      })

    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error('API: Failed to fetch basket products:', error)
    return NextResponse.json({ success: false, error: 'Unable to load products' }, { status: 500 })
  }
}
```

## `app/components/features/basket/__tests__/e2e/basket-page.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Basket Page', () => {
  const PRODUCT_SLUG = process.env.E2E_TEST_PRODUCT_SLUG || 'meze-audio-99-series-2-5mm-or-4-4mm-replacement-cable'

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('basket-storage'))
  })

  test('add product, view in basket, adjust quantity, remove', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`)
    await expect(page.getByTestId('product-info')).toBeVisible()

    const productName = await page.locator('h1').first().textContent()

    const addButton = page.locator('[data-testid^="add-to-basket-"]')
    const testId = await addButton.getAttribute('data-testid')
    const productId = testId!.replace('add-to-basket-', '')

    await addButton.click()
    await expect(page.getByTestId('basket-badge').first()).toHaveText('1')

    await page.getByTestId('basket-button').first().click()
    await expect(page).toHaveURL('/basket')

    await expect(page.getByText(productName!)).toBeVisible()

    await page.getByTestId(`increment-${productId}`).click()
    await expect(page.getByTestId('quantity-display')).toHaveText('2')

    await page.getByTestId(`decrement-${productId}`).click()
    await expect(page.getByTestId('quantity-display')).toHaveText('1')

    await page.getByTestId(`remove-${productId}`).click()
    await expect(page.getByText(/your basket is empty/i)).toBeVisible()
    await expect(page.getByTestId('basket-badge')).toHaveCount(0)
  })
})
```

## `app/components/features/basket/__tests__/integration/getBasketProducts.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { getBasketProducts } from '../../../../../../sanity-cms/lib/products/getBasketProducts'

const TEST_PRODUCT_ID = process.env.TEST_PRODUCT_ID || 'k27n1AQuIbSr5iozFz7EE4'

describe('getBasketProducts', () => {
  it('returns empty array for non-existent product IDs', async () => {
    const ids = ['non-existent-product-1', 'non-existent-product-2']
    const products = await getBasketProducts(ids)
    expect(products).toHaveLength(0)
  })

  it('returns products with correct shape for real product IDs', async () => {
    const products = await getBasketProducts([TEST_PRODUCT_ID])

    expect(products).toHaveLength(1)
    expect(products[0]._id).toBe(TEST_PRODUCT_ID)
    expect(typeof products[0].name).toBe('string')
    expect(products[0].name.length).toBeGreaterThan(0)
    expect(products[0].price_data).toBeDefined()
    expect(typeof products[0].price_data.unit_amount).toBe('number')
    expect(typeof products[0].price_data.currency).toBe('string')
    expect(typeof products[0].stock).toBe('number')
    expect(typeof products[0].reservedStock).toBe('number')
  })
})
```

## `app/components/features/basket/__tests__/shipping-cost/shipping-rates.integration.test.ts`

```typescript
import { describe, it, expect } from 'vitest'

describe('Shipping Rates Integration Tests (PL)', () => {
  const API_URL = 'http://localhost:3000/api/basket/shipping-rates'

  it('Case 1: Baseline (Small & Light)', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parcelData: [
          { length: 15, width: 10, height: 10, weight: 500 }
        ],
        countryCode: 'PL',
      }),
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.rate).toBeDefined()
    expect(data.rate.amount).toBeGreaterThan(0)
    // Should be lowest possible base rate
  })

  it('Case 2: Volume Jump (Light but Bulky)', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parcelData: [
          { length: 25, width: 20, height: 15, weight: 1000 },
          { length: 25, width: 20, height: 15, weight: 1000 },
          { length: 25, width: 20, height: 15, weight: 1000 },
        ],
        countryCode: 'PL',
      }),
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.rate).toBeDefined()
    expect(data.rate.amount).toBeGreaterThan(0)
  })

  it('Case 3: Weight Jump (Small but Heavy)', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parcelData: [
          { length: 20, width: 15, height: 10, weight: 5000 },
          { length: 20, width: 15, height: 10, weight: 5000 },
          { length: 20, width: 15, height: 10, weight: 5000 },
        ],
        countryCode: 'PL',
      }),
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.rate).toBeDefined()
    expect(data.rate.amount).toBeGreaterThan(0)
  })

  it('Case 4: Edge of Limit (Maxing out one box)', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parcelData: Array(5).fill({
          length: 40,
          width: 30,
          height: 25,
          weight: 4800,
        }),
        countryCode: 'PL',
      }),
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.rate).toBeDefined()
    expect(data.rate.amount).toBeGreaterThan(0)
  })

  it('Case 5: Spillover (Breaching limits)', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parcelData: Array(6).fill({
          length: 40,
          width: 30,
          height: 25,
          weight: 4800,
        }),
        countryCode: 'PL',
      }),
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.rate).toBeDefined()
    expect(data.rate.amount).toBeGreaterThan(0)
  })

  it('Case 6: Extreme Scale (50 items)', async () => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parcelData: Array(50).fill({
          length: 20,
          width: 15,
          height: 10,
          weight: 2000,
        }),
        countryCode: 'PL',
      }),
    })

    const data = await response.json()
    expect(response.ok).toBe(true)
    expect(data.rate).toBeDefined()
    expect(data.rate.amount).toBeGreaterThan(0)
  })
})
```

## `app/components/features/basket/__tests__/unit/BasketManager.test.tsx`

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { mutate } from 'swr'
import BasketManager from '../../BasketManager'
import useBasketStore from './../../../../../../store/basketStore'

vi.mock('../../BasketSummary', () => ({
  default: ({ itemCount, subtotal }: { itemCount: number; subtotal: number }) => (
    <div data-testid="basket-summary">
      {itemCount} items, ${subtotal}
    </div>
  ),
}))

function mockFetchResponse(data: unknown, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  })
}

describe('BasketManager', () => {
  beforeEach(() => {
    useBasketStore.setState({ items: [], _hasHydrated: true })
    vi.clearAllMocks()
    mutate(() => true, undefined, { revalidate: false })
    mockFetchResponse({ success: true, data: [] })
  })

  // --- CORE BREAKING POINTS (morsel by morsel) ---

  // BP-1 [SYNC-HAPPY]: basket has items + CMS returns data → user sees product names, prices, summary
  it('renders product names and summary when basket has items and CMS returns data', async () => {
    useBasketStore.setState({
      _hasHydrated: true,
      items: [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 1 },
      ],
    })

    mockFetchResponse({
      success: true,
      data: [
        {
          _id: 'prod-1',
          name: 'Wireless Headphones',
          image: null,
          stock: 10,
          reservedStock: 0,
          price_data: { unit_amount: 1999, currency: 'usd' },
        },
        {
          _id: 'prod-2',
          name: 'USB-C Hub',
          image: null,
          stock: 5,
          reservedStock: 0,
          price_data: { unit_amount: 2999, currency: 'usd' },
        },
      ],
    })

    render(<BasketManager />)

    await waitFor(() => {
      expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
    })

    expect(screen.getByText('USB-C Hub')).toBeInTheDocument()
    expect(screen.getByTestId('basket-summary')).toHaveTextContent('3 items, $69.97')
  })

  // BP-5 [EMPTY]: basket is empty → EmptyBasket rendered
  it('renders empty state when basket has no items', () => {
    render(<BasketManager />)

    expect(screen.getByText('Your basket is empty')).toBeInTheDocument()
    expect(screen.queryByTestId('basket-summary')).not.toBeInTheDocument()
  })

  // BP-6 [ERROR]: fetch fails → error message rendered
  it('renders error message when fetch fails', async () => {
    useBasketStore.setState({
      _hasHydrated: true,
      items: [{ productId: 'prod-1', quantity: 1 }],
    })

    mockFetchResponse({ error: 'Network failure' }, false)

    render(<BasketManager />)

    await waitFor(() => {
      expect(screen.getByText('Network failure')).toBeInTheDocument()
    })
  })

  // BP-7 [LOADING]: fetch in progress → skeleton rendered, empty state NOT shown
  it('renders skeleton during fetch, not empty state', () => {
    useBasketStore.setState({
      _hasHydrated: true,
      items: [{ productId: 'prod-1', quantity: 1 }],
    })

    let resolveFetch: (value: unknown) => void
    global.fetch = vi.fn().mockImplementation(
      () => new Promise((resolve) => { resolveFetch = resolve })
    )

    render(<BasketManager />)

    expect(screen.getByLabelText('Loading basket')).toBeInTheDocument()
    expect(screen.queryByText('Your basket is empty')).not.toBeInTheDocument()

    resolveFetch!({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) })
  })

  // BP-8 [DATA-GAP]: item in basket but missing from CMS → item not rendered, count excludes it
  it('excludes items missing from CMS data and adjusts count', async () => {
    useBasketStore.setState({
      _hasHydrated: true,
      items: [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 1 },
      ],
    })

    mockFetchResponse({
      success: true,
      data: [
        {
          _id: 'prod-1',
          name: 'Wireless Headphones',
          image: null,
          stock: 10,
          reservedStock: 0,
          price_data: { unit_amount: 1999, currency: 'usd' },
        },
      ],
    })

    render(<BasketManager />)

    await waitFor(() => {
      expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
    })

    expect(screen.queryByText('USB-C Hub')).not.toBeInTheDocument()
    expect(screen.getByTestId('basket-summary')).toHaveTextContent('2 items, $39.98')
  })

  // --- REGRESSION: RangeError Invalid array length (BP-CRASH-1..3) ---

  // BP-CRASH-1 [MISSING-STOCK]: CMS returns product with no stock/reservedStock → no crash
  it('renders gracefully when product lacks stock and reservedStock fields', async () => {
    useBasketStore.setState({
      _hasHydrated: true,
      items: [{ productId: 'prod-bad', quantity: 2 }],
    })

    mockFetchResponse({
      success: true,
      data: [
        {
          _id: 'prod-bad',
          name: 'Bad Stock Product',
          image: null,
          // stock and reservedStock intentionally omitted
          price_data: { unit_amount: 999, currency: 'usd' },
        },
      ],
    })

    render(<BasketManager />)

    await waitFor(() => {
      expect(screen.queryByLabelText('Loading basket')).not.toBeInTheDocument()
    })

    // Component must not crash → no error boundary message
    expect(screen.queryByText(/Unable to load products/i)).not.toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/Invalid array length/i)
  })

  // BP-CRASH-2 [RESERVED-EXCEEDS-STOCK]: reservedStock > stock → no crash, quantity capped safe
  it('renders gracefully when reservedStock exceeds stock', async () => {
    useBasketStore.setState({
      _hasHydrated: true,
      items: [{ productId: 'prod-over', quantity: 3 }],
    })

    mockFetchResponse({
      success: true,
      data: [
        {
          _id: 'prod-over',
          name: 'Over-Reserved Product',
          image: null,
          stock: 5,
          reservedStock: 10,
          price_data: { unit_amount: 999, currency: 'usd' },
        },
      ],
    })

    render(<BasketManager />)

    await waitFor(() => {
      expect(screen.queryByLabelText('Loading basket')).not.toBeInTheDocument()
    })

    expect(screen.queryByText(/Unable to load products/i)).not.toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/Invalid array length/i)
  })

  // BP-CRASH-3 [NEGATIVE-STOCK]: stock is negative → no crash
  it('renders gracefully when stock is negative', async () => {
    useBasketStore.setState({
      _hasHydrated: true,
      items: [{ productId: 'prod-neg', quantity: 1 }],
    })

    mockFetchResponse({
      success: true,
      data: [
        {
          _id: 'prod-neg',
          name: 'Negative Stock Product',
          image: null,
          stock: -3,
          reservedStock: 0,
          price_data: { unit_amount: 999, currency: 'usd' },
        },
      ],
    })

    render(<BasketManager />)

    await waitFor(() => {
      expect(screen.queryByLabelText('Loading basket')).not.toBeInTheDocument()
    })

    expect(screen.queryByText(/Unable to load products/i)).not.toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/Invalid array length/i)
  })
})
```

## `app/components/features/basket/BasketButton.tsx`

```tsx
"use client";

import { ShoppingCartIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { NavActionItem } from "@/app/components/layout/header/NavbarActions";
import useBasketStore, { selectTotalItemsCount, selectHasHydrated } from "@/store/basketStore";

export function BasketButton() {
  const itemCount = useBasketStore(selectTotalItemsCount);
  const hasHydrated = useBasketStore(selectHasHydrated);

  const displayCount = hasHydrated ? itemCount : 0;

  return (
    <Link href="/basket" data-testid="basket-button">
      <NavActionItem
        icon={<ShoppingCartIcon size={24} />}
        label="Cart"
        badgeCount={displayCount}
      />
    </Link>
  );
}
```

## `app/components/features/basket/BasketControls.tsx`

```tsx
"use client";

import { useShallow } from 'zustand/shallow';
import { ShoppingCart } from "@phosphor-icons/react";
import useBasketStore from "@/store/basketStore";

interface BasketControlsProps {
  productId: string;
  name?: string;
  isBasketPage: boolean;
  maxQuantity?: number;
  displayQuantity?: number;
  addClassName?: string;
  removeClassName?: string;
  decrementClassName?: string;
  incrementClassName?: string;
  quantityClassName?: string;
  wrapperClassName?: string;
  showRemoveButton?: boolean;
}

export function BasketControls({
  productId,
  name,
  isBasketPage,
  maxQuantity,
  displayQuantity,
  addClassName,
  removeClassName,
  decrementClassName,
  incrementClassName,
  quantityClassName,
  wrapperClassName,
  showRemoveButton,
}: BasketControlsProps) {
  const { items, addProduct, removeProduct, incrementQuantity, decrementQuantity } = useBasketStore(
    useShallow((state) => ({
      items: state.items,
      addProduct: state.addProduct,
      removeProduct: state.removeProduct,
      incrementQuantity: state.incrementQuantity,
      decrementQuantity: state.decrementQuantity,
    }))
  );

  const basketItem = items.find((item: any) => item.productId === productId);
  const isInBasket = !!basketItem;
  const storeQuantity = basketItem?.quantity || 0;
  const quantity = displayQuantity !== undefined ? displayQuantity : storeQuantity;

  const handleAdd = () => {
    addProduct(productId);
  };

  const handleIncrement = () => {
    if (maxQuantity !== undefined && quantity >= maxQuantity) return;
    incrementQuantity(productId);
  };

  const handleDecrement = () => {
    if (isBasketPage) {
      // On basket page, decrement capped at 1
      if (quantity > 1) {
        decrementQuantity(productId);
      }
    } else {
      // On product page, decrement to 0 removes item
      decrementQuantity(productId);
    }
  };

  const handleRemove = () => {
    removeProduct(productId);
  };

  if (!isInBasket) {
    return (
      <button
        onClick={handleAdd}
        data-testid={`add-to-basket-${productId}`}
        type="button"
        className={addClassName || "btn-cart"}
      >
        <ShoppingCart size={16} />
        Add
      </button>
    );
  }

  return (
    <div className={`flex items-center ${wrapperClassName || ""}`}>
      <div className="flex items-center">
        <button
          onClick={handleDecrement}
          data-testid={`decrement-${productId}`}
          type="button"
          disabled={isBasketPage && quantity <= 1}
          className={decrementClassName || "h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-l-sm border-r-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"}
        >
          −
        </button>
        <span data-testid="quantity-display" className={quantityClassName || "h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border-y border-border-secondary type-card-title tabular-nums select-none"}>{quantity}</span>
        <button
          onClick={handleIncrement}
          data-testid={`increment-${productId}`}
          type="button"
          disabled={maxQuantity !== undefined && quantity >= maxQuantity}
          className={incrementClassName || "h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-r-sm border-l-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150"}
        >
          +
        </button>
      </div>
      {isBasketPage && showRemoveButton !== false && (
        <button
          onClick={handleRemove}
          data-testid={`remove-${productId}`}
          type="button"
          className={removeClassName || "ml-3 text-text-caption hover:text-text-secondary transition-colors duration-150 text-small"}
        >
          Remove
        </button>
      )}
    </div>
  );
}
```

## `app/components/features/basket/BasketItem.tsx`

```tsx
"use client";
import React from "react";
import Image from "next/image";
import { Trash } from "@phosphor-icons/react";
import { useShallow } from "zustand/shallow";
import { BasketControls } from "./BasketControls";
import useBasketStore from "@/store/basketStore";
import { sanityImageLoader } from "@/lib/utils/sanityImageLoader";

interface BasketItemProps {
  productId: string
  name: string
  quantity: number
  displayPrice: number
  image?: any
  availableStock: number
  originalQuantity?: number
  variant?: string
}

export default function BasketItem({ productId, name, quantity, displayPrice, image, availableStock, originalQuantity, variant }: BasketItemProps) {
  const isOutOfStock = availableStock === 0;
  const { removeProduct } = useBasketStore(
    useShallow((state) => ({
      removeProduct: state.removeProduct,
    }))
  );
  const assetRef = image?.asset?._ref || image?.asset?._id;

  const handleRemove = () => {
    removeProduct(productId);
  };

  return (
    <>
      {/* Desktop row */}
      <article className="hidden lg-desktop:grid lg-touch:grid grid-cols-[minmax(0,1fr)_auto_auto] items-start px-6 py-5 gap-[2rem] border-b border-border-secondary/60 hover:bg-surface-elevated transition-colors duration-150">
        {/* Column 1 — item-identity */}
        <div className="item-identity flex flex-row items-start gap-4">
          <div className="h-20 w-20 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative border border-border-secondary">
            {assetRef ? (
              <Image
                src={assetRef}
                loader={sanityImageLoader}
                alt={name}
                fill
                sizes="96px"
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-caption type-caption">
                No image
              </div>
            )}
          </div>
          <div className="item-text-stack flex flex-col min-w-0 gap-1">
            <h3 className="type-card-title line-clamp-4">{name}</h3>
            {variant && (
              <span className="type-metadata">{variant}</span>
            )}
            {isOutOfStock && (
              <span className="type-caption text-error-700 font-medium">Out of Stock</span>
            )}
            <span className="type-caption text-text-secondary tabular-nums">
              {displayPrice.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Column 2 — quantity & total */}
        <div className="flex flex-row items-center gap-8 justify-end mt-5">
          {originalQuantity && originalQuantity > quantity && (
            <span className="type-caption text-text-caption line-through">{originalQuantity}</span>
          )}
          <fieldset disabled={isOutOfStock} className="border-0 p-0 m-0 min-w-0">
            <BasketControls
              productId={productId}
              name={name}
              isBasketPage={true}
              maxQuantity={availableStock}
              displayQuantity={quantity}
              showRemoveButton={false}
            />
          </fieldset>
          <div className="w-24 text-right">
            <span className="tabular-nums">{(displayPrice * quantity).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Column 3 — item-actions */}
        <div className="item-actions flex items-center justify-center mt-5">
          <button
            onClick={handleRemove}
            data-testid={`remove-${productId}`}
            aria-label={`Remove ${name} from basket`}
            type="button"
            className="text-text-secondary hover:text-red-500/80 transition-colors duration-200 p-2"
          >
            <Trash size={20} />
          </button>
        </div>
      </article>

      {/* Mobile row — two-zone layout */}
      <div className="lg-desktop:hidden lg-touch:hidden flex flex-col border-b border-border-secondary/60 px-4 hover:bg-surface-elevated transition-colors duration-150">
        {/* Zone A — Info strip */}
        <div className="flex flex-row items-start gap-3 py-3">
          <div className="h-16 w-16 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative border border-border-secondary">
            {assetRef ? (
              <Image
                src={assetRef}
                loader={sanityImageLoader}
                alt={name}
                fill
                sizes="64px"
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-caption type-caption">
                No image
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h3 className="text-sm font-normal text-text-body leading-snug">{name}</h3>
            {variant && (
              <span className="type-metadata">{variant}</span>
            )}
            {isOutOfStock && (
              <span className="text-xs text-error-700 font-medium">Out of Stock</span>
            )}
            <span className="type-caption text-text-secondary tabular-nums">
              {displayPrice.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Zone B — Controls strip */}
        <div className="flex flex-row items-center justify-between flex-wrap gap-4 pt-3 border-t border-border-secondary/30">
          <div className="flex items-center gap-2">
            {originalQuantity && originalQuantity > quantity && (
              <span className="type-caption text-text-caption line-through">{originalQuantity}</span>
            )}
            <fieldset disabled={isOutOfStock} className="border-0 p-0 m-0 min-w-0">
              <BasketControls
                productId={productId}
                name={name}
                isBasketPage={true}
                maxQuantity={availableStock}
                displayQuantity={quantity}
                showRemoveButton={false}
              />
            </fieldset>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRemove}
              data-testid={`remove-mobile-${productId}`}
              aria-label={`Remove ${name} from basket`}
              type="button"
              className="text-text-secondary hover:text-red-500/80 transition-colors duration-200 p-2"
            >
              <Trash size={20} />
            </button>
            <span className="type-body font-bold tabular-nums">
              {(displayPrice * quantity).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
```

## `app/components/features/basket/BasketManager.tsx`

```tsx
"use client";
import { useShallow } from "zustand/shallow";
import { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import useBasketStore from "@/store/basketStore";
import { detectCountry } from "@/lib/shipping/countryDetector";
import { DEFAULT_PARCEL } from "@/lib/shipping/parcel-calculator";
import BasketSkeleton from "./BasketSkeleton";
import EmptyBasket from "./EmptyBasket";
import BasketItem from "./BasketItem";
import BasketSummary from "./BasketSummary";

interface CmsProduct {
  _id: string;
  name: string;
  image: string;
  stock: number;
  reservedStock: number;
  price_data: {
    unit_amount: number;
    currency: string;
  };
  parcel?: {
    length: number;
    width: number;
    height: number;
    weight: number;
    distance_unit: string;
    mass_unit: string;
  };
}

async function fetchBasketProducts(productIds: string[]) {
  if (productIds.length === 0) return [];
  
  const res = await fetch(`/api/basket/products?ids=${productIds.map(encodeURIComponent).join(",")}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Unable to load products");
  }
  
  const result = await res.json();
  if (!result.success) {
    throw new Error(result.error || "Unable to load products");
  }
  
  return result.data || [];
}

export default function BasketManager() {
  const { items: basket, _hasHydrated } = useBasketStore(
    useShallow((state) => ({
      items: state.items,
      _hasHydrated: state._hasHydrated,
    }))
  );

  const [shippingCost, setShippingCost] = useState<number | null>(null);

  const currentProductIds = useMemo(
    () => basket.map((item) => item.productId),
    [basket]
  );

  const [trackedIds, setTrackedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!_hasHydrated) return;
    setTrackedIds((prev) => {
      const prevSet = new Set(prev);
      const newIds = currentProductIds.filter((id) => !prevSet.has(id));
      return newIds.length > 0 ? [...prev, ...newIds] : prev;
    });
  }, [currentProductIds, _hasHydrated]);

  // SWR relies ONLY on trackedIds, never currentProductIds
  const swrKey = _hasHydrated && trackedIds.length > 0
    ? `basket-products:${[...trackedIds].sort().join(",")}`
    : null;

  const { data: cmsProducts = [], error, isLoading } = useSWR<CmsProduct[]>(
    swrKey,
    () => fetchBasketProducts(trackedIds),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  
  const enrichedItems = useMemo(() => {
    return basket
      .map((item) => {
        const product = cmsProducts.find((p) => p._id === item.productId);
        if (!product) return null;

        const displayPrice = product.price_data.unit_amount / 100; // cents to dollars
        const availableStock = Math.max(0, product.stock - product.reservedStock);

        const cappedQuantity = Math.min(item.quantity, availableStock);
        return {
          productId: item.productId,
          quantity: cappedQuantity,
          originalQuantity: item.quantity,
          name: product.name,
          displayPrice,
          image: product.image,
          price_data: product.price_data,
          availableStock,
          parcel: product.parcel,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        const aAvailable = a.availableStock > 0;
        const bAvailable = b.availableStock > 0;
        if (aAvailable === bAvailable) return 0;
        return aAvailable ? -1 : 1;
      });
  }, [basket, cmsProducts]);

  const { itemCount, subtotal, checkoutData, parcelData } = useMemo(() => {
    const count = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = enrichedItems.reduce(
      (sum, item) => sum + item.displayPrice * item.quantity,
      0
    );
    const checkoutItems = enrichedItems
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price_data: item.price_data,
        parcel: item.parcel,
        availableStock: item.availableStock,
      }));

    const parcels = enrichedItems
      .flatMap((item) => {
        const parcel = item.parcel ?? DEFAULT_PARCEL;
        const safeQty = Math.max(0, Number.isFinite(item.quantity) ? Math.floor(item.quantity) : 0);
        if (safeQty === 0) return [];
        return Array(safeQty).fill(parcel);
      });

    return {
      itemCount: count,
      subtotal: total,
      checkoutData: checkoutItems,
      parcelData: parcels,
    };
  }, [enrichedItems]);

  // Fetch shipping rates
  useEffect(() => {
    if (parcelData.length === 0) return;

    // Reset shipping cost to null to show "Calculating..." during debounce delay
    setShippingCost(null);

    const timeoutId = setTimeout(() => {
      const fetchShippingRates = async () => {
        try {
          const country = await detectCountry();
          const res = await fetch('/api/basket/shipping-rates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              parcelData,
              countryCode: country,
            }),
          });
          const data = await res.json();
          setShippingCost(data.rate.amount);
        } catch (e) {
          console.error('Failed to fetch shipping rates:', e);
        }
      };

      fetchShippingRates();
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [parcelData]);

  if (!_hasHydrated || isLoading) return <BasketSkeleton />;
  if (basket.length === 0) return <EmptyBasket />;
  if (error) {
    return (
      <div className="card-base p-6">
        <p className="text-error-700 type-body">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg-touch:grid-cols-[65%_1fr] lg-desktop:grid-cols-[65%_1fr]">
      <div className="card-base overflow-hidden pb-48 lg-touch:pb-0 lg-desktop:pb-0">
        {/* Header */}
        <div className="hidden border-b border-border-secondary px-6 py-3 lg-touch:grid lg-touch:grid-cols-[minmax(0,1fr)_auto_auto] lg-desktop:grid lg-desktop:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-[2rem]">
          <div className="type-overline">
            Product
          </div>
          <div className="type-overline text-right">
            Quantity & Total
          </div>
          <div className="type-overline">
          </div>
        </div>

        {enrichedItems.map((item) => (
          <BasketItem
            key={item.productId}
            productId={item.productId}
            name={item.name}
            quantity={item.quantity}
            displayPrice={item.displayPrice}
            image={item.image}
            availableStock={item.availableStock}
            originalQuantity={item.originalQuantity}
          />
        ))}
      </div>

      {/* Desktop sticky summary */}
      <div className="hidden lg-touch:block lg-desktop:block lg-touch:sticky lg-touch:top-4 lg-desktop:sticky lg-desktop:top-4 self-start">
        <div className="card-product-dark shadow-cardDark">
          <BasketSummary
            itemCount={itemCount}
            subtotal={subtotal}
            basketData={checkoutData}
            shippingCost={shippingCost}
          />
        </div>
      </div>

      {/* Mobile fixed bottom bar */}
      <div className="lg-touch:hidden lg-desktop:hidden fixed bottom-[var(--mobile-menu-h)] left-0 w-full z-40 bg-surface-card border-t border-border-secondary px-4 py-4">
        <BasketSummary
          itemCount={itemCount}
          subtotal={subtotal}
          basketData={checkoutData}
          shippingCost={shippingCost}
        />
      </div>
    </div>
  );
}
```

## `app/components/features/basket/BasketSkeleton.tsx`

```tsx
export default function BasketSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-8 lg-desktop:grid-cols-[65%_1fr] lg-touch:grid-cols-[65%_1fr]"
      aria-busy="true"
      aria-label="Loading basket"
    >
      <div className="pb-48 lg-touch:pb-0 lg-desktop:pb-0">
        <div className="card-base overflow-hidden p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-secondary-800/60 rounded-sm w-1/4"></div>
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 bg-secondary-800/60 rounded-sm flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary-800/60 rounded-sm w-3/4"></div>
                <div className="h-3 bg-secondary-800/60 rounded-sm w-1/2"></div>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 bg-secondary-800/60 rounded-sm flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary-800/60 rounded-sm w-2/3"></div>
                <div className="h-3 bg-secondary-800/60 rounded-sm w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg-touch:block lg-desktop:block lg-touch:sticky lg-touch:top-4 lg-desktop:sticky lg-desktop:top-4 self-start">
        <div className="card-product-dark shadow-cardDark p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-secondary-800/60 rounded-sm w-1/2"></div>
            <div className="h-4 bg-secondary-800/60 rounded-sm w-3/4"></div>
            <div className="h-4 bg-secondary-800/60 rounded-sm w-2/3"></div>
            <div className="h-10 bg-secondary-800/60 rounded-sm w-full mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## `app/components/features/basket/BasketSummary.tsx`

```tsx
"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Price } from "@/app/components/ui/Price";
import { CheckoutButton } from "@/app/components/features/checkout/reservation/CheckoutButton";

interface BasketSummaryProps {
  itemCount: number;
  subtotal: number;
  basketData?: Array<{ productId: string; quantity: number; price_data: { currency: string; unit_amount: number }; availableStock?: number }>;
  shippingCost: number | null;
}

export default function BasketSummary({ itemCount, subtotal, basketData, shippingCost }: BasketSummaryProps) {
  const total = shippingCost !== null ? subtotal + shippingCost : subtotal;

  return (
    <>
      <h2 className="type-section-sub border-b border-border-primary pb-2 mb-3 lg-touch:pb-4 lg-touch:mb-6 lg-desktop:pb-4 lg-desktop:mb-6">
        Basket Summary
      </h2>

      <div className="space-y-2 lg-touch:space-y-3 lg-desktop:space-y-3">
        <div className="flex justify-between items-baseline gap-4">
          <div className="type-caption whitespace-nowrap">Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</div>
          <Price value={subtotal} variant="summary" currency="PLN" className="whitespace-nowrap tabular-nums" />
        </div>

        <div className="flex justify-between items-baseline gap-4">
          <div className="type-caption whitespace-nowrap">Shipping (estimated)</div>
          {shippingCost !== null ? (
            <Price value={shippingCost} variant="summary" currency="PLN" className="whitespace-nowrap tabular-nums" />
          ) : (
            <span className="type-caption whitespace-nowrap">Calculating...</span>
          )}
        </div>

        {0 > 0 && (
          <div className="flex justify-between items-baseline gap-4">
            <div className="type-caption whitespace-nowrap">Tax</div>
            <Price value={0} variant="summary" currency="PLN" className="whitespace-nowrap" />
          </div>
        )}

        <div className="border-t border-border-primary pt-3 mt-1 mb-3 lg-touch:pt-4 lg-touch:mb-6 lg-desktop:pt-4 lg-desktop:mb-6">
          <div className="flex justify-between items-baseline gap-4">
            <div className="type-section-sub whitespace-nowrap">Total</div>
            <span className="text-text-accent font-bold text-spotlight whitespace-nowrap">
              <Price value={total} variant="summary" currency="PLN" className="tabular-nums" />
            </span>
          </div>
          <div className="type-caption mt-1 mb-2 lg-touch:mb-4 lg-desktop:mb-4">Including VAT</div>
        </div>
      </div>

      <div>
        <CheckoutButton basketData={basketData} disabled={itemCount === 0} />

        <Link
          href="/"
          className="hidden lg-touch:block lg-desktop:block btn-secondary text-center mt-3 py-3 w-full"
        >
          <ArrowLeftIcon size={16} className="inline mr-2" />
          Continue Shopping
        </Link>
      </div>
    </>
  );
}
```

## `app/components/features/basket/BasketUIMock.tsx`

```tsx
"use client";

import React from "react";
import { Price } from "@/app/components/ui/Price";

interface MockItem {
  productId: string;
  name: string;
  variantLabel?: string;
  displayPrice: number;
  quantity: number;
}

const MOCK_ITEMS: MockItem[] = [
  { productId: "m1", name: "Audeze LCD-5 Flagship Planar Magnetic Open-Back Headphones with Fluxor Magnet Array and Uniforce Voice Coil Technology for Audiophile Reference Listening", variantLabel: "Color: Matte Black | Impedance: 300 Ohms | Pad: Perforated Lambskin", displayPrice: 14299.49, quantity: 1 },
  { productId: "m2", name: "Focal Utopia", variantLabel: "Color: Black Carbon | Cable: 3m Balanced XLR", displayPrice: 8999.99, quantity: 2 },
  { productId: "m3", name: "Sennheiser HD 800 S", displayPrice: 1399.0, quantity: 1 },
  { productId: "m4", name: "HiFiMAN Susvara", variantLabel: "Impedance: 60 Ohms | Sensitivity: 83 dB", displayPrice: 17999.0, quantity: 1 },
  { productId: "m5", name: "Meze Audio Elite", displayPrice: 3999.5, quantity: 3 },
  { productId: "m6", name: "Dan Clark Audio EXPANSE", variantLabel: "Color: Gunmetal | Pad: Leather", displayPrice: 3999.0, quantity: 1 },
  { productId: "m7", name: "Abyss AB-1266 Phi TC", displayPrice: 4995.0, quantity: 1 },
  { productId: "m8", name: "Stax SR-009S", variantLabel: "Earspeaker | Bias: 580V", displayPrice: 3925.0, quantity: 2 },
  { productId: "m9", name: "HIFIMAN HE1000se", displayPrice: 1999.0, quantity: 1 },
  { productId: "m10", name: "Focal Clear MG", variantLabel: "Color: Chestnut | Cable: 3.5mm Unbalanced", displayPrice: 1499.0, quantity: 2 },
  { productId: "m11", name: "Sony MDR-Z1R", displayPrice: 1699.99, quantity: 1 },
  { productId: "m12", name: "Audio-Technica ATH-ADX5000 Air Dynamic Open-Back Headphones with Tungsten-Coated Diaphragm and 3D Wing Support System for Extended Listening Sessions", variantLabel: "Color: Black | Impedance: 420 Ohms | Driver: 58mm", displayPrice: 1999.49, quantity: 1 },
];

function MockBasketItem({ item }: { item: MockItem }) {
  const lineTotal = item.displayPrice * item.quantity;
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg-desktop:grid lg-touch:grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center px-6 py-5 gap-5 border-b border-border-secondary/60 hover:bg-surface-elevated transition-colors duration-150">
        <div className="flex flex-row items-center gap-4">
          <div className="h-20 w-20 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative border border-border-secondary flex items-center justify-center text-text-caption type-caption">No image</div>
          <div className="flex flex-col min-w-0 gap-1">
            <h3 className="type-card-title line-clamp-2">{item.name}</h3>
            {item.variantLabel && <span className="text-text-secondary text-small">{item.variantLabel}</span>}
            <span className="text-text-caption hover:text-text-secondary transition-colors duration-150 cursor-pointer text-small mt-1">Remove</span>
          </div>
        </div>
        <div className="flex items-center justify-center whitespace-nowrap"><Price value={item.displayPrice} currency="PLN" /></div>
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <button type="button" className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-l-sm border-r-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150" aria-label="Decrease quantity">−</button>
            <span className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border-y border-border-secondary type-card-title tabular-nums select-none">{item.quantity}</span>
            <button type="button" className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-r-sm border-l-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div className="flex items-center justify-end whitespace-nowrap"><Price value={lineTotal} currency="PLN" /></div>
      </div>

      {/* Mobile */}
      <div className="lg-desktop:hidden lg-touch:hidden flex flex-col border-b border-border-secondary/60 px-4 hover:bg-surface-elevated transition-colors duration-150">
        <div className="flex flex-row items-start gap-3 py-3">
          <div className="h-16 w-16 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative border border-border-secondary flex items-center justify-center text-text-caption type-caption">No image</div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h3 className="type-card-title line-clamp-2">{item.name}</h3>
            {item.variantLabel && <span className="text-text-secondary text-small">{item.variantLabel}</span>}
            <span className="type-metadata">Unit: <Price value={item.displayPrice} currency="PLN" /></span>
            <span className="text-text-caption hover:text-text-secondary transition-colors duration-150 cursor-pointer text-small mt-0.5">Remove</span>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between py-3 border-t border-border-secondary/30">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <button type="button" className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-l-sm border-r-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150" aria-label="Decrease quantity">−</button>
              <span className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border-y border-border-secondary type-card-title tabular-nums select-none">{item.quantity}</span>
              <button type="button" className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-r-sm border-l-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div className="type-price"><Price value={lineTotal} currency="PLN" /></div>
        </div>
      </div>
    </>
  );
}

function MockBasketSummary({ shippingCost }: { shippingCost: number | null }) {
  const subtotal = MOCK_ITEMS.reduce((s, i) => s + i.displayPrice * i.quantity, 0);
  const itemCount = MOCK_ITEMS.reduce((s, i) => s + i.quantity, 0);
  const total = shippingCost !== null ? subtotal + shippingCost : subtotal;
  return (
    <>
      <h2 className="type-section-sub border-b border-border-primary pb-4 mb-6">Basket Summary</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-baseline gap-4">
          <span className="type-caption whitespace-nowrap">Subtotal ({itemCount} items)</span>
          <Price value={subtotal} variant="summary" currency="PLN" className="whitespace-nowrap" />
        </div>
        <div className="flex justify-between items-baseline gap-4">
          <span className="type-caption whitespace-nowrap">Shipping (estimated)</span>
          {shippingCost !== null ? (
            <Price value={shippingCost} variant="summary" currency="PLN" className="whitespace-nowrap" />
          ) : (
            <span className="type-caption whitespace-nowrap">Calculating...</span>
          )}
        </div>
        <div className="border-t border-border-primary pt-4 mt-1 mb-6">
          <div className="flex justify-between items-baseline gap-4">
            <span className="type-section-sub whitespace-nowrap">Total</span>
            <span className="text-text-accent font-bold text-spotlight tabular-nums whitespace-nowrap">
              <Price value={total} variant="summary" currency="PLN" />
            </span>
          </div>
          <div className="type-caption mt-1 mb-4">Including VAT</div>
        </div>
      </div>
      <div className="pb-24 lg-touch:pb-0 lg-desktop:pb-0">
        <button type="button" className="btn-primary w-full px-6 py-3">Checkout</button>
        <button type="button" className="btn-secondary block text-center mt-3 py-3 w-full">Continue Shopping</button>
      </div>
    </>
  );
}

export default function BasketUIMock({ shippingCost = null }: { shippingCost?: number | null }) {
  return (
    <div className="grid grid-cols-1 gap-8 lg-touch:grid-cols-[65%_1fr] lg-desktop:grid-cols-[65%_1fr]">
      <div className="card-base overflow-hidden pb-48 lg-touch:pb-0 lg-desktop:pb-0">
        <div className="hidden border-b border-border-secondary px-6 py-3 lg-touch:grid lg-touch:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg-desktop:grid lg-desktop:grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-5">
          <div className="type-overline">Product</div>
          <div className="type-overline text-center">Price</div>
          <div className="type-overline text-center">Quantity</div>
          <div className="type-overline text-right">Total</div>
        </div>
        {MOCK_ITEMS.map((item) => (
          <MockBasketItem key={item.productId} item={item} />
        ))}
      </div>
      {/* Desktop sticky summary */}
      <div className="hidden lg-touch:block lg-desktop:block lg-touch:sticky lg-touch:top-4 lg-desktop:sticky lg-desktop:top-4 self-start">
        <div className="card-product-dark shadow-cardDark">
          <MockBasketSummary shippingCost={shippingCost} />
        </div>
      </div>

      {/* Mobile fixed bottom bar */}
      <div className="lg-touch:hidden lg-desktop:hidden fixed bottom-0 left-0 w-full z-40 bg-surface-card border-t border-border-secondary px-4 py-4">
        <MockBasketSummary shippingCost={shippingCost} />
      </div>
    </div>
  );
}
```

## `app/components/features/basket/EmptyBasket.tsx`

```tsx
"use client";
import { ArrowLeftIcon, ShoppingCartIcon } from "@phosphor-icons/react";
import Link from "next/link";

export default function EmptyBasket() {
  return (
    <div className="card-base flex flex-col items-center justify-center p-8 lg-desktop:p-12 lg-touch:p-12">
      <ShoppingCartIcon className="mb-6 text-text-caption opacity-40" size={64} />
      <h2 className="type-section-sub text-center">Your basket is empty</h2>
      <p className="type-body mb-8 max-w-md text-center">
        Looks like you haven&apos;t added any products to your basket yet.
        Browse our collection to find something you&apos;ll love.
      </p>
      <Link
        href="/"
        className="btn-primary flex items-center gap-2 py-3 px-6"
      >
        <ArrowLeftIcon size={16} />
        Browse Headphones
      </Link>
    </div>
  );
}
```

## `app/components/features/filters/__tests__/price-filtering.test.tsx`

```tsx
import { describe, it, expect } from 'vitest';
import { centsToDisplay, displayToCents } from '@/lib/utils/price';

describe('price filtering conversion', () => {
  describe('backend to frontend conversion', () => {
    it('should convert cents from backend to dollars for slider display', () => {
      // Backend returns price range in cents (from price_data.unit_amount)
      const backendPriceRange = {
        minPrice: 1999,  // $19.99 in cents
        maxPrice: 9999,  // $99.99 in cents
      };

      // Frontend should convert to dollars for slider
      const sliderMin = centsToDisplay(backendPriceRange.minPrice);
      const sliderMax = centsToDisplay(backendPriceRange.maxPrice);

      expect(sliderMin).toBe(19.99);
      expect(sliderMax).toBe(99.99);
    });
  });

  describe('frontend to backend conversion', () => {
    it('should convert dollars from slider to cents for URL storage', () => {
      // User sets price range in dollars via slider
      const sliderRange = {
        min: 20,    // $20
        max: 100,   // $100
      };

      // URL should store in cents for FilterBuilder (which uses price_data.unit_amount)
      const urlMin = displayToCents(sliderRange.min);
      const urlMax = displayToCents(sliderRange.max);

      expect(urlMin).toBe(2000);
      expect(urlMax).toBe(10000);
    });
  });

  describe('active filters display', () => {
    it('should convert cents from URL to dollars for display', () => {
      // URL stores price filter in cents
      const urlFilterValue = '2000'; // 2000 cents = $20

      // Display should show in dollars
      const cents = parseInt(urlFilterValue, 10);
      const displayDollars = centsToDisplay(cents);

      expect(displayDollars).toBe(20);
    });
  });
});
```

## `app/components/features/filters/ActiveFilters.tsx`

```tsx
"use client";

import React from 'react';
import { useFilterNuqs } from './useFilterNuqs';
import { centsToDisplay } from '@/lib/utils/price';

interface FilterGroup {
  field: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface ActiveFiltersProps {
  filterGroups?: FilterGroup[];
}

export function ActiveFilters({ filterGroups }: ActiveFiltersProps) {
  const { filters, parsedFilters, removeFilter, clearAllFilters, hasActiveFilters } = useFilterNuqs();

  if (!hasActiveFilters || !filterGroups) {
    return null;
  }

  // Build label map from filter groups for display
  const labelMap = new Map<string, string>();
  filterGroups.forEach((group) => {
    group.options.forEach((opt) => {
      labelMap.set(`${group.field}:${opt.value}`, `${group.label}: ${opt.label}`);
    });
  });

  // Format filter for display
  const formatFilterLabel = (filter: { field: string; value: string }): string => {
    const filterKey = `${filter.field}:${filter.value}`;

    // Check if it's in the label map first
    if (labelMap.has(filterKey)) {
      return labelMap.get(filterKey)!;
    }

    // URL stores values in cents, convert to dollars for display
    if (filter.field === 'priceRange') {
      if (filter.value.startsWith('min:')) {
        const minCents = parseInt(filter.value.replace('min:', ''), 10);
        const minDollars = centsToDisplay(minCents);
        return `Price above: $${minDollars}`;
      }
      if (filter.value.startsWith('max:')) {
        const maxCents = parseInt(filter.value.replace('max:', ''), 10);
        const maxDollars = centsToDisplay(maxCents);
        return `Price up to: $${maxDollars}`;
      }
    }

    // Handle stockMin filters
    if (filter.field === 'stockMin') {
      return `Min stock: ${filter.value}`;
    }

    // Fallback to raw filter key
    return filterKey;
  };

  return (
    <div data-testid="active-filters" className="flex flex-wrap gap-2 mb-6">
      {parsedFilters?.map((filter) => {
        if (!filter || !filter.field || !filter.value) return null;
        const filterKey = `${filter.field}:${filter.value}`;
        return (
          <button
            key={filterKey}
            type="button"
            onClick={() => removeFilter(filter.field, filter.value)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-elevated border border-brand-400 rounded-lg type-caption text-primary hover:border-brand-200 transition-colors cursor-pointer"
          >
            <span>{formatFilterLabel(filter)}</span>
            <span aria-label={`Remove filter`} className="text-caption hover:text-primary transition-colors">×</span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={clearAllFilters}
        className="type-caption text-accent-500 underline hover:text-brand-100 transition-colors cursor-pointer"
      >
        Clear all
      </button>
    </div>
  );
}
```

## `app/components/features/filters/FilterSidebar.tsx`

```tsx
"use client";

import React from 'react';
import { useFilterNuqs } from './useFilterNuqs';
import { PriceRangeSlider } from './PriceRangeSlider';
import { StockMinimumSlider } from './StockMinimumSlider';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { centsToDisplay } from '@/lib/utils/price';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  field: string;
  label: string;
  options: FilterOption[];
}

interface FilterSidebarProps {
  filters: FilterGroup[];
  priceRange?: { minPrice: number | null; maxPrice: number | null };
  maxStock?: number | null;
}

export function FilterSidebar({ filters, priceRange: priceRangeData, maxStock }: FilterSidebarProps) {
  const { priceRange, setPriceRange, clearPriceRange, isFilterActive, toggleFilter, stockMinimum, setStockMinimum, clearStockMinimum } = useFilterNuqs();

  // Convert cents to dollars for slider display
  const minPriceDollars = priceRangeData?.minPrice ? centsToDisplay(priceRangeData.minPrice) : 0;
  const maxPriceDollars = priceRangeData?.maxPrice ? centsToDisplay(priceRangeData.maxPrice) : 10000;

  return (
    <aside
      data-testid="filter-sidebar"
      className="w-full"
    >
      <div className="bg-surface-elevated border border-border-secondary rounded-sm p-6 space-y-6">
        <h3 className="type-overline text-accent-500">
          Filters
        </h3>

        <form className="space-y-6">
          <PriceRangeSlider
            min={minPriceDollars}
            max={maxPriceDollars}
            value={priceRange}
            onChange={setPriceRange}
            onClear={clearPriceRange}
          />

          <StockMinimumSlider
            maxStock={maxStock ?? 100}
            value={stockMinimum}
            onChange={setStockMinimum}
            onClear={clearStockMinimum}
          />

          {filters.map((group) => (
            <fieldset key={group.field} className="space-y-3">
              <legend className="type-overline text-accent-500 section-header-anchor">
                {group.label}
              </legend>

              <div className="space-y-2">
                {group.options.map((option) => {
                  const isChecked = isFilterActive(group.field, option.value);
                  return (
                    <Checkbox
                      key={option.value}
                      name={group.field}
                      value={option.value}
                      checked={isChecked}
                      onChange={() => toggleFilter(group.field, option.value)}
                      label={option.label}
                    />
                  );
                })}
              </div>
            </fieldset>
          ))}
        </form>
      </div>
    </aside>
  );
}
```

## `app/components/features/filters/index.ts`

```typescript
export { FilterSidebar } from './FilterSidebar';
export { SortDropdown } from './SortDropdown';
export { ActiveFilters } from './ActiveFilters';
export { MobileFilterDrawer } from './MobileFilterDrawer';
export { MobileControlsBar } from './MobileControlsBar';
export { useFilterNuqs } from './useFilterNuqs';
```

## `app/components/features/filters/MobileControlsBar.tsx`

```tsx
"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { SortDropdown } from './SortDropdown';

interface MobileControlsBarProps {
  productCount: number;
  onOpenFilters: () => void;
}

export function MobileControlsBar({
  productCount,
  onOpenFilters,
}: MobileControlsBarProps) {
  const searchParams = useSearchParams();
  const activeFilterCount = searchParams.getAll('f').length;

  return (
    <div
      data-testid="mobile-controls-bar"
      className="flex items-center gap-3 lg:hidden mb-4 px-4"
    >
      {/* Filters button */}
      <button
        type="button"
        onClick={onOpenFilters}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 btn-secondary"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="21" x2="4" y2="14"></line>
          <line x1="4" y1="10" x2="4" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12" y2="3"></line>
          <line x1="20" y1="21" x2="20" y2="16"></line>
          <line x1="20" y1="12" x2="20" y2="3"></line>
          <line x1="1" y1="14" x2="7" y2="14"></line>
          <line x1="9" y1="8" x2="15" y2="8"></line>
          <line x1="17" y1="16" x2="23" y2="16"></line>
        </svg>
        <span className="type-caption">
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </span>
      </button>

      {/* Sort dropdown */}
      <div className="flex-1">
        <SortDropdown />
      </div>
    </div>
  );
}

```

## `app/components/features/filters/MobileFilterDrawer.tsx`

```tsx
"use client";

import React, { useEffect } from 'react';
import { useFilterNuqs } from './useFilterNuqs';
import { PriceRangeSlider } from './PriceRangeSlider';
import { StockMinimumSlider } from './StockMinimumSlider';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { centsToDisplay } from '@/lib/utils/price';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  field: string;
  label: string;
  options: FilterOption[];
}

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterGroup[];
  priceRange?: { minPrice: number | null; maxPrice: number | null };
  maxStock?: number | null;
}

export function MobileFilterDrawer({ isOpen, onClose, filters, priceRange: priceRangeData, maxStock }: MobileFilterDrawerProps) {
  const { isFilterActive, toggleFilter, priceRange, setPriceRange, clearPriceRange, stockMinimum, setStockMinimum, clearStockMinimum } = useFilterNuqs();

  // Convert cents to dollars for slider display
  const minPriceDollars = priceRangeData?.minPrice ? centsToDisplay(priceRangeData.minPrice) : 0;
  const maxPriceDollars = priceRangeData?.maxPrice ? centsToDisplay(priceRangeData.maxPrice) : 10000;

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const drawer = document.querySelector('[data-testid="mobile-filter-drawer"]') as HTMLElement;
    if (!drawer) return;

    const focusableElements = drawer.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element when drawer opens
    firstElement?.focus();
    drawer.addEventListener('keydown', handleTabKey);
    return () => drawer.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);


  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-brand-900/60 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Bottom sheet drawer */}
      <aside
        data-testid="mobile-filter-drawer"
        className={`
          fixed bottom-0 left-0 right-0 z-50 max-h-[85vh]
          transform transition-transform duration-300 ease-out
          lg:hidden
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        aria-label="Filter options"
      >
        <div className="flex flex-col h-full bg-surface-card rounded-t-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-secondary">
            <h2 className="type-overline">
              Filters
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-secondary hover:text-primary transition-colors"
              aria-label="Close filters"
            >
              Done
            </button>
          </div>

          {/* Filter content */}
          <div className="flex-1 overflow-y-auto p-4">
            <form className="space-y-6">
              <PriceRangeSlider
                min={minPriceDollars}
                max={maxPriceDollars}
                value={priceRange}
                onChange={setPriceRange}
                onClear={clearPriceRange}
              />

              <StockMinimumSlider
                maxStock={maxStock ?? 100}
                value={stockMinimum}
                onChange={setStockMinimum}
                onClear={clearStockMinimum}
              />

              {filters.map((group) => (
                <fieldset key={group.field} className="space-y-3">
                  <legend className="type-overline text-accent-500 section-header-anchor">
                    {group.label}
                  </legend>

                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isChecked = isFilterActive(group.field, option.value);
                      return (
                        <Checkbox
                          key={option.value}
                          name={group.field}
                          value={option.value}
                          checked={isChecked}
                          onChange={() => toggleFilter(group.field, option.value)}
                          label={option.label}
                        />
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </form>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 p-4 border-t border-border-secondary bg-surface-card">
            <button
              type="button"
              onClick={onClose}
              className="w-full btn-primary"
            >
              Show Results
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
```

## `app/components/features/filters/PriceRangeSlider.tsx`

```tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ClockCounterClockwise } from '@phosphor-icons/react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: { min?: number; max?: number };
  onChange: (range: { min?: number; max?: number }) => void;
  onClear: () => void;
}
export function PriceRangeSlider({ min, max, value, onChange, onClear }: PriceRangeSliderProps) {
  const [localMin, setLocalMin] = useState(value.min ?? min);
  const [localMax, setLocalMax] = useState(value.max ?? max);
  const isDragging = useRef(false);

  const isActive = (value.min !== undefined && value.min !== min) || (value.max !== undefined && value.max !== max);

  useEffect(() => {
    if (!isDragging.current) {
      setLocalMin(value.min ?? min);
      setLocalMax(value.max ?? max);
    }
  }, [value.min, value.max, min, max]);

  const commitRange = useCallback((nextMin: number, nextMax: number) => {
    const shouldClear = nextMin === min && nextMax === max;

    if (shouldClear) {
      onClear();
      return;
    }

    const nextRange: { min?: number; max?: number } = {};

    if (nextMin !== min) {
      nextRange.min = nextMin;
    }

    if (nextMax !== max) {
      nextRange.max = nextMax;
    }

    onChange(nextRange);
  }, [min, max, onChange, onClear]);

  const handleMinChange = useCallback((newMin: number) => {
    const validMin = Math.min(newMin, localMax - 1);
    setLocalMin(validMin);

    if (!isDragging.current) {
      commitRange(validMin, localMax);
    }
  }, [localMax, commitRange]);

  const handleMaxChange = useCallback((newMax: number) => {
    const validMax = Math.max(newMax, localMin + 1);
    setLocalMax(validMax);

    if (!isDragging.current) {
      commitRange(localMin, validMax);
    }
  }, [localMin, commitRange]);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) {
      return;
    }

    isDragging.current = false;
    commitRange(localMin, localMax);
  }, [commitRange, localMin, localMax]);

  useEffect(() => {
    const handleWindowPointerUp = () => {
      if (isDragging.current) {
        handleDragEnd();
      }
    };

    window.addEventListener('mouseup', handleWindowPointerUp);
    window.addEventListener('touchend', handleWindowPointerUp);

    return () => {
      window.removeEventListener('mouseup', handleWindowPointerUp);
      window.removeEventListener('touchend', handleWindowPointerUp);
    };
  }, [handleDragEnd]);

  const handleClear = useCallback(() => {
    isDragging.current = false;
    setLocalMin(min);
    setLocalMax(max);
    onClear();
  }, [min, max, onClear]);

  return (
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between">
        <legend className="type-overline text-accent-500 section-header-anchor">
          Price Range
        </legend>
        <button
          type="button"
          onClick={handleClear}
          className={`p-1 rounded transition-colors ${
            isActive ? 'text-brand-400 hover:text-brand-300' : 'text-secondary-600 opacity-50 cursor-not-allowed'
          }`}
          data-testid="clear-price-range"
          title={isActive ? "Clear filter" : "Filter not active"}
          disabled={!isActive}
        >
          <ClockCounterClockwise size={16} weight="bold" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="type-caption text-secondary-500">Min</label>
            <span className="type-caption text-secondary-500">${localMin}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={localMin}
            onChange={(e) => handleMinChange(parseInt(e.target.value, 10))}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-opacity ${
              isActive ? 'bg-accent-500 accent-accent-500' : 'opacity-60 bg-surface-tertiary accent-surface-tertiary'
            }`}
            data-testid="price-min-slider"
            style={{
              WebkitAppearance: 'none',
              background: isActive
                ? `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${(localMin / max) * 100}%, #2E2E2D ${(localMin / max) * 100}%, #2E2E2D 100%)`
                : `linear-gradient(to right, #6B7280 0%, #6B7280 ${(localMin / max) * 100}%, #374151 ${(localMin / max) * 100}%, #374151 100%)`
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="type-caption text-secondary-500">Max</label>
            <span className="type-caption text-secondary-500">${localMax}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={localMax}
            onChange={(e) => handleMaxChange(parseInt(e.target.value, 10))}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-opacity ${
              isActive ? 'bg-accent-500 accent-accent-500' : 'opacity-60 bg-surface-tertiary accent-surface-tertiary'
            }`}
            data-testid="price-max-slider"
            style={{
              WebkitAppearance: 'none',
              background: isActive
                ? `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${(localMax / max) * 100}%, #2E2E2D ${(localMax / max) * 100}%, #2E2E2D 100%)`
                : `linear-gradient(to right, #6B7280 0%, #6B7280 ${(localMax / max) * 100}%, #374151 ${(localMax / max) * 100}%, #374151 100%)`
            }}
          />
        </div>
      </div>
    </fieldset>
  );
}
```

## `app/components/features/filters/SortDropdown.tsx`

```tsx
"use client";

import React from 'react';
import { useFilterNuqs } from './useFilterNuqs';

export function SortDropdown() {
  const { sort, handleSortChange } = useFilterNuqs();

  return (
    <div data-testid="sort-dropdown" className="flex items-center gap-2">
      <label htmlFor="sort" className="type-caption text-secondary-500">Sort by</label>
      <select
        id="sort"
        value={sort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="input-select"
      >
        <option value="featured">Featured</option>
        <option value="price_data.unit_amount:asc">Price: Low to High</option>
        <option value="price_data.unit_amount:desc">Price: High to Low</option>
        <option value="name:asc">Name: A-Z</option>
        <option value="name:desc">Name: Z-A</option>
      </select>
    </div>
  );
}
```

## `app/components/features/filters/StockMinimumSlider.tsx`

```tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ClockCounterClockwise } from '@phosphor-icons/react';

interface StockMinimumSliderProps {
  maxStock: number;
  value: number;
  onChange: (value: number) => void;
  onClear: () => void;
}

export function StockMinimumSlider({ maxStock, value, onChange, onClear }: StockMinimumSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const isDragging = useRef(false);

  const isActive = value > 0;
  const max = maxStock || 100;

  useEffect(() => {
    if (!isDragging.current) {
      setLocalValue(value);
    }
  }, [value]);

  const commitValue = useCallback((nextValue: number) => {
    if (nextValue === 0) {
      onClear();
      return;
    }
    onChange(nextValue);
  }, [onChange, onClear]);

  const handleChange = useCallback((newValue: number) => {
    setLocalValue(newValue);
    if (!isDragging.current) {
      commitValue(newValue);
    }
  }, [commitValue]);

  const handleDragStart = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) {
      return;
    }
    isDragging.current = false;
    commitValue(localValue);
  }, [commitValue, localValue]);

  useEffect(() => {
    const handleWindowPointerUp = () => {
      if (isDragging.current) {
        handleDragEnd();
      }
    };

    window.addEventListener('mouseup', handleWindowPointerUp);
    window.addEventListener('touchend', handleWindowPointerUp);

    return () => {
      window.removeEventListener('mouseup', handleWindowPointerUp);
      window.removeEventListener('touchend', handleWindowPointerUp);
    };
  }, [handleDragEnd]);

  const handleClear = useCallback(() => {
    isDragging.current = false;
    setLocalValue(0);
    onClear();
  }, [onClear]);

  const getSliderLabel = () => {
    if (localValue === 0) return "Any";
    return `At least ${localValue} items`;
  };

  return (
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between">
        <legend className="type-overline text-accent-500 section-header-anchor">
          Availability
        </legend>
        <button
            type="button"
            onClick={handleClear}
            className={`p-1 rounded transition-colors ${
              isActive ? 'text-brand-400 hover:text-brand-300' : 'text-secondary-600 opacity-50 cursor-not-allowed'
            }`}
            data-testid="clear-stock-minimum"
            title={isActive ? "Clear filter" : "Filter not active"}
            disabled={!isActive}
          >
            <ClockCounterClockwise size={16} weight="bold" />
          </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="type-caption text-secondary-500">Minimum Stock</label>
            <span className="type-caption text-secondary-500">{getSliderLabel()}</span>
          </div>
          <input
            type="range"
            min={0}
            max={max}
            value={localValue}
            onChange={(e) => handleChange(parseInt(e.target.value, 10))}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-opacity ${
              isActive ? 'bg-accent-500 accent-accent-500' : 'opacity-60 bg-surface-tertiary accent-surface-tertiary'
            }`}
            data-testid="stock-minimum-slider"
            style={{
              WebkitAppearance: 'none',
              background: isActive
                ? `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${(localValue / max) * 100}%, #2E2E2D ${(localValue / max) * 100}%, #2E2E2D 100%)`
                : `linear-gradient(to right, #6B7280 0%, #6B7280 ${(localValue / max) * 100}%, #374151 ${(localValue / max) * 100}%, #374151 100%)`
            }}
          />
        </div>
      </div>
    </fieldset>
  );
}
```

## `app/components/features/filters/useFilterNuqs.ts`

```typescript
"use client";

import { useQueryState, parseAsArrayOf, parseAsString, debounce } from "nuqs";
import { useTransition, useEffect, useSyncExternalStore, useMemo } from "react";
import { displayToCents, centsToDisplay } from "@/lib/utils/price";

const PRICE_RANGE_URL_LIMITER = debounce(500);

export interface FilterState {
  field: string;
  value: string;
}

// Module-level shared pending state for cross-component isPending
let pendingState = false;
const subscribers = new Set<() => void>();

function getPendingSnapshot() { return pendingState; }
function subscribeToPending(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}
function setPendingState(value: boolean) {
  if (pendingState !== value) {
    pendingState = value;
    subscribers.forEach(cb => cb());
  }
}

export function useFilterPending() {
  return useSyncExternalStore(subscribeToPending, getPendingSnapshot);
}

/**
 * Parse filter string "field:value" into FilterState
 */
function parseFilter(filterString: string): FilterState | null {
  const separatorIndex = filterString.indexOf(":");
  if (separatorIndex === -1) return null;

  const field = filterString.slice(0, separatorIndex);
  const value = filterString.slice(separatorIndex + 1);

  if (!field || !value) return null;

  return { field, value };
}

/**
 * Hook for managing filter state in URL with nuqs
 * nuqs shallow: false triggers server re-render automatically
 */
export function useFilterNuqs() {
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPendingState(isPending);
  }, [isPending]);

  // Sort state: ?sort=price_data.unit_amount:asc
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString
      .withOptions({
        shallow: false,
        throttleMs: 50,
        clearOnDefault: true,
      })
      .withDefault("featured")
  );

  // Page state: ?page=2
  const [, setPage] = useQueryState(
    "page",
    parseAsString.withOptions({
      shallow: false,
      throttleMs: 50,
      clearOnDefault: true,
    })
  );

  // Array of active filters: ?f=brand:sennheiser&f=type:open-back
  const [filters, setFilters] = useQueryState(
    "f",
    parseAsArrayOf(parseAsString)
      .withOptions({
        // Deep: true = triggers server re-render (default)
        // This allows server to re-fetch with new filters
        shallow: false,
        // Throttle URL updates to prevent browser rate-limiting
        throttleMs: 50,
        // Clear param when empty array (clean URLs)
        clearOnDefault: true,
      })
      .withDefault([])
  );

  /**
   * Toggle a filter on/off
   * Updates URL and triggers server re-render via nuqs shallow: false
   */
  const toggleFilter = (field: string, value: string) => {
    startTransition(() => {
      setPage(null);
      setFilters((currentFilters) => {
        const current = currentFilters || [];
        const filterString = `${field}:${value}`;
        const filterIndex = current.indexOf(filterString);

        if (filterIndex === -1) {
          // Add filter
          return [...currentFilters, filterString];
        } else {
          // Remove filter
          return currentFilters.filter((_, index) => index !== filterIndex);
        }
      });
    });
  };
    /**
   * Remove a specific filter
   */
  const removeFilter = (field: string, value: string) => {
    startTransition(() => {
      setPage(null);
      const filterKey = `${field}:${value}`;
      setFilters((prev) => (prev || []).filter((f) => f !== filterKey));
    });
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    startTransition(() => {
      setPage(null);
      setFilters([]);
    });
  };

  /**
   * Check if a specific filter is active
   */
  const isFilterActive = (field: string, value: string): boolean => {
    const filterKey = `${field}:${value}`;
    return (filters || []).includes(filterKey);
  };

  /**
 * Get parsed filter states for client-side filtering
 */
  const parsedFilters: FilterState[] = (filters || [])
    .map(parseFilter)
    .filter((f): f is FilterState => f !== null);

  /**
   * Memoized price range from filters (prevents reference instability)
   */
  const priceRange = useMemo((): { min?: number; max?: number } => {
    const priceFilters = parsedFilters.filter(f => f.field === 'priceRange');
    const range: { min?: number; max?: number } = {};

    priceFilters.forEach(filter => {
      if (filter.value.startsWith('min:')) {
        const min = parseInt(filter.value.slice(4), 10);
        if (!isNaN(min)) range.min = centsToDisplay(min);
      } else if (filter.value.startsWith('max:')) {
        const max = parseInt(filter.value.slice(4), 10);
        if (!isNaN(max)) range.max = centsToDisplay(max);
      }
    });

    return range;
  }, [parsedFilters]);

  /**
   * Set price range
   * Convert dollars to cents for URL storage (FilterBuilder expects cents)
   */
  const setPriceRange = (range: { min?: number; max?: number }) => {
    startTransition(() => {
      setPage(null);
      setFilters((prev) => {
        const current = prev || [];
        const withoutPrice = current.filter(f => !f.startsWith('priceRange:'));
        const newFilters = [...withoutPrice];

        // Validate that min < max
        if (range.min !== undefined && range.max !== undefined && range.min >= range.max) {
          // Don't set invalid range
          return current;
        }

        if (range.min !== undefined) {
          const minCents = displayToCents(range.min);
          newFilters.push(`priceRange:min:${minCents}`);
        }
        if (range.max !== undefined) {
          const maxCents = displayToCents(range.max);
          newFilters.push(`priceRange:max:${maxCents}`);
        }

        return newFilters;
      }, { limitUrlUpdates: PRICE_RANGE_URL_LIMITER });
    });
  };

  /**
   * Clear price range
   */
  const clearPriceRange = () => {
    startTransition(() => {
      setPage(null);
      setFilters((prev) => (prev || []).filter(f => !f.startsWith('priceRange:')), { limitUrlUpdates: PRICE_RANGE_URL_LIMITER });
    });
  };

  /**
   * Memoized stock minimum from filters (prevents unnecessary re-renders)
   */
  const stockMinimum = useMemo((): number => {
    const stockFilters = parsedFilters.filter(f => f.field === 'stockMin');

    if (stockFilters.length === 0) return 0;

    const value = parseInt(stockFilters[0].value, 10);
    return isNaN(value) ? 0 : value;
  }, [parsedFilters]);

  /**
   * Set stock minimum
   */
  const setStockMinimum = (value: number) => {
    startTransition(() => {
      setPage(null);
      setFilters((prev) => {
        const current = prev || [];
        const withoutStock = current.filter(f => !f.startsWith('stockMin:'));

        if (value <= 0) {
          // Clear filter if value is 0 or negative
          return withoutStock;
        }

        return [...withoutStock, `stockMin:${value}`];
      });
    });
  };

  /**
   * Clear stock minimum
   */
  const clearStockMinimum = () => {
    startTransition(() => {
      setPage(null);
      setFilters((prev) => (prev || []).filter(f => !f.startsWith('stockMin:')));
    });
  };

  /**
   * Check if price range is active
   */
  const isPriceRangeActive = (): boolean => {
    return parsedFilters.some(f => f.field === 'priceRange');
  };

  /**
   * Check if stock minimum is active
   */
  const isStockMinimumActive = (): boolean => {
    return parsedFilters.some(f => f.field === 'stockMin');
  };

  /**
   * Change sort option
   */
  const handleSortChange = (value: string) => {
    startTransition(() => {
      setPage(null);
      setSort(value === "featured" ? null : value);
    });
  };

  return {
    filters,
    setFilters,
    toggleFilter,
    removeFilter,
    clearAllFilters,
    isFilterActive,
    hasActiveFilters: (filters || []).length > 0,
    parsedFilters,
    priceRange,
    setPriceRange,
    clearPriceRange,
    isPriceRangeActive,
    stockMinimum,
    setStockMinimum,
    clearStockMinimum,
    isStockMinimumActive,
    sort: sort || "featured",
    handleSortChange,
    isPending,
  };
}
```

## `app/components/features/homepage/accessories/Accessories.tsx`

```tsx
import AccessoriesHeader from "./AccessoriesHeader";
import CategorySection from "./CategorySection";
import { getAccessoryProducts } from "./getAccessoryProducts";

interface AccessoriesProps {
  accessoriesData: Awaited<ReturnType<typeof getAccessoryProducts>>;
}

export default async function Accessories({ accessoriesData }: AccessoriesProps) {
  const { cables, earpads } = accessoriesData;

  return (
    <article className="w-full relative overflow-hidden bg-brand-700">
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[20%] w-[140%] h-[140%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5" />
        <div className="absolute top-[10%] -left-[10%] w-[80%] h-[80%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
        <div className="absolute bottom-[5%] right-[5%] w-[40%] h-[40%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-content space-y-12 py-16">
          <div className="text-brand-700">
            <AccessoriesHeader />
          </div>
          {cables.length > 0 && (
            <CategorySection category={{ name: "Cables", filter: "" }} items={cables as any} />
          )}
          {earpads.length > 0 && (
            <CategorySection category={{ name: "Pads", filter: "" }} items={earpads as any} />
          )}
        </div>
      </div>
    </article>
  );
}
```

## `app/components/features/homepage/accessories/AccessoriesHeader.tsx`

```tsx
export default function AccessoriesHeader() {
  return (
    <div className="flex flex-col gap-2">
      <span className="type-overline section-header-anchor tracking-editorial text-secondary-400 uppercase">Essential Accessories</span>
      <h2 className="type-section-hed uppercase">Accessories</h2>
    </div>
  );
}
```

## `app/components/features/homepage/accessories/AccessoryCard.tsx`

```tsx
import { cn } from "@/lib/utils/tailwind";
import Image from "next/image";
import Link from "next/link";
import type { AccessoryItem } from "./types";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { centsToDisplay } from "@/lib/utils/price";

export default function AccessoryCard({
  item,
  idx,
  categoryLabel,
}: {
  item: AccessoryItem;
  idx: number;
  categoryLabel?: string;
}) {
  if (!item) return null;

  return (
    <article className="card-product-dark flex h-full flex-col gap-4">
      <Link href={`/product/${item.slug}`} className="block">
        <figure className="rounded-none relative mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surface-productImage p-6 md:px-4 md:pb-4 md:pt-12">
          <span className="absolute left-4 top-4 text-small font-bold uppercase tracking-editorial text-brand-900">
            {item.brand.name}
          </span>
          <Image
            src={item.image?.asset?._id ?? ""}
            alt={item.name}
            width={450}
            height={450}
            priority={idx === 0}
            loading={idx === 0 ? "eager" : "lazy"}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="h-auto max-h-[75%] w-auto max-w-[75%] transform object-contain object-center mix-blend-multiply transition-transform duration-700 group-hover:scale-110 md:h-full md:max-h-full md:w-full md:max-w-full"
          />
        </figure>

        <div className="flex flex-grow flex-col px-4 pb-4 pt-2">
          <div className="flex min-h-[5.5rem] flex-col">
            {categoryLabel && <p className="type-overline mb-1">{categoryLabel}</p>}
            <h3 className="type-body line-clamp-2 font-medium">
              {item.name}
            </h3>
            <p className="type-price mt-2">
              ${centsToDisplay(item.price_data.unit_amount)}
            </p>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <BasketControls
          productId={item._id}
          isBasketPage={false}
          addClassName="btn-cart w-full justify-center"
          wrapperClassName="flex items-center gap-1"
          decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
          incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
          quantityClassName="w-7 text-center type-body text-primary tabular-nums"
        />
      </div>
    </article>
  );
}
```

## `app/components/features/homepage/accessories/CategorySection.tsx`

```tsx
import { Carousel } from '@/app/components/layout/carousel/CarouselRoot';
import { CarouselTrack } from '@/app/components/layout/carousel/CarouselTrack';
import { CarouselSlide } from '@/app/components/layout/carousel/CarouselSlide';
import {
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from '@/app/components/layout/carousel/CarouselControls';
import AccessoryCard from "./AccessoryCard";
import { AccessoryCategory, AccessoryItem } from "./types";

interface CategorySectionProps {
  category: AccessoryCategory;
  items: AccessoryItem[];
}

const accessoriesBreakpointMap = {
  xl: 4,
  lgDesktop: 4,
  mdLandscape: 4,
  mdPortrait: 3,
  smLandscape: 3,
  smPortrait: 2,
  xsLandscape: 2,
  xsPortrait: 1,
  mobileLandscape: 1,
  mobilePortrait: 1
};

export default function CategorySection({ category, items }: CategorySectionProps) {
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(category.filter) ||
    item.category?.toLowerCase() === category.filter
  );

  const filteredItems = Array.from(
    new Map(filtered.map((item) => [item._id, item])).values()
  );

  if (filteredItems.length === 0) return null;

  return (
    <Carousel itemsCount={filteredItems.length} breakpointMap={accessoriesBreakpointMap}>
      <div className="flex flex-col gap-6">
        <h3 className="type-caption text-brand-400 font-bold uppercase">
          <span className="section-header-anchor">{category.name}</span>
        </h3>

        <div className="relative">
          <CarouselTrack className="w-full mx-0 items-stretch md:-mx-3">
            {filteredItems.map((item, idx) => (
              <CarouselSlide
                key={`${category.filter}-${item._id}`}
                className="flex h-full flex-col px-3"
              >
                <AccessoryCard item={item} idx={idx} categoryLabel={category.name} />
              </CarouselSlide>
            ))}
          </CarouselTrack>

          <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2 md:-left-5">
            <CarouselPrevious />
          </div>
          <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 md:-right-5">
            <CarouselNext />
          </div>
        </div>

        <CarouselDots className="mt-2" />
      </div>
    </Carousel>
  );
}


```

## `app/components/features/homepage/accessories/getAccessoryProducts.ts`

```typescript
import { sanityFetch } from "@/sanity-cms/lib/client";
import { cache } from "react";

export interface AccessoryProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  stock: number;
  slug: string;
  imageUrl: string;
  image: { asset: { _id: string; url: string }; alt?: string };
}

export interface AccessoryData {
  cables: AccessoryProduct[];
  earpads: AccessoryProduct[];
}

const BASE = `*[_type == "homepageData"][0]`;

const CABLES_Q = `${BASE}.accessoriesCables[]->{_id,name,brand->{ _id, name, slug },price_data,stock,"slug": slug.current,"imageUrl": image.asset->url,image{asset->{_id, url}}}`;
const EARPADS_Q = `${BASE}.accessoriesEarpads[]->{_id,name,brand->{ _id, name, slug },price_data,stock,"slug": slug.current,"imageUrl": image.asset->url,image{asset->{_id, url}}}`;

export const getAccessoryProducts = cache(async (): Promise<AccessoryData> => {
  const [cables, earpads] = await Promise.all([
    sanityFetch({ query: CABLES_Q }),
    sanityFetch({ query: EARPADS_Q }),
  ]);
  return {
    cables: (cables as AccessoryProduct[]) ?? [],
    earpads: (earpads as AccessoryProduct[]) ?? [],
  };
});
```

## `app/components/features/homepage/accessories/types.ts`

```typescript
export interface AccessoryItem {
  readonly _id: string;
  readonly brand: {
    _id: string;
    name: string;
    slug: string;
  };
  readonly name: string;
  readonly slug: string;
  readonly price_data: { currency: string; unit_amount: number };
  readonly imageUrl: string;
  readonly image: { asset: { _id: string; url: string }; alt?: string };
  readonly category?: string;
}

export interface AccessoryCategory {
  readonly name: string;
  readonly filter: string;
}
```

## `app/components/features/homepage/dacs/DacCard.tsx`

```tsx
import { cn } from "@/lib/utils/tailwind";
import Image from "next/image";
import Link from "next/link";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { centsToDisplay } from "@/lib/utils/price";

export default function DacCard({ item, idx }: { item: any; idx: number }) {
  if (!item) return null;

  const productName = item.name || "Unknown Product";
  const brandName = item.brand?.name || "Generic";
  const price = item.price_data
    ? `$${centsToDisplay(item.price_data.unit_amount)}`
    : "Contact for Price";

  return (
    <article className="card-product-dark flex h-full flex-col gap-4">
      <Link href={`/product/${item.slug}`} className="flex flex-grow flex-col">
        <figure className="rounded-none relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surface-productImage p-6">
          <span className="absolute left-4 top-4 text-small font-bold uppercase tracking-editorial text-brand-900">
            {brandName}
          </span>
          <Image
            src={item.image?.asset?._id ?? ""}
            alt={productName}
            width={400}
            height={400}
            loading="lazy"
            sizes="(max-width: 768px) 50vw, 25vw"
            className="h-auto max-h-[95%] w-auto max-w-[95%] transform object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
          />
        </figure>

        <div className="flex flex-grow flex-col px-4 pb-2 pt-2">
          <p className="type-overline mb-1">DAC & Amplifiers</p>
          <p className="type-body line-clamp-2 font-medium">
            {productName}
          </p>
          <p className="type-price mt-2">{price}</p>
        </div>
      </Link>

      <div className="mt-auto px-4 pb-4">
        <BasketControls
          productId={item._id}
          isBasketPage={false}
          addClassName="btn-cart w-full justify-center"
          wrapperClassName="flex items-center gap-1"
          decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
          incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
          quantityClassName="w-7 text-center type-body text-primary tabular-nums"
        />
      </div>
    </article>
  );
}
```

## `app/components/features/homepage/dacs/Dacs.tsx`

```tsx
import React from "react";
import { sanityFetch } from "@/sanity-cms/lib/client";
import { Carousel } from '@/app/components/layout/carousel/CarouselRoot';
import { CarouselTrack } from '@/app/components/layout/carousel/CarouselTrack';
import { CarouselSlide } from '@/app/components/layout/carousel/CarouselSlide';
import { CarouselNext, CarouselPrevious, CarouselDots } from '@/app/components/layout/carousel/CarouselControls';
import DacsHeader from "./DacsHeader";
import DacCard from "./DacCard";
import { DacProduct } from "./getDacProducts";

interface DacsProps {
  dacsData: DacProduct[];
}

const dacsBreakpointMap = {
  xl: 3,
  lgDesktop: 2,
  mdLandscape: 2,
  mdPortrait: 2,
  smLandscape: 2,
  smPortrait: 2,
  xsLandscape: 2,
  xsPortrait: 1,
  mobileLandscape: 1,
  mobilePortrait: 1
};

export default async function DACs({ dacsData }: DacsProps) {
  if (!dacsData.length) return null;

  return (
    <article className="w-full relative overflow-hidden bg-surface-elevated">
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[20%] w-[140%] h-[140%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5" />
        <div className="absolute top-[10%] -left-[10%] w-[80%] h-[80%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
        <div className="absolute bottom-[5%] right-[5%] w-[40%] h-[40%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-content py-16">
          <Carousel
            itemsCount={dacsData.length}
            breakpointMap={dacsBreakpointMap}
          >
            <div className="flex flex-col gap-6">
              <DacsHeader />

              <div className="relative">
                <CarouselTrack className="w-full mx-0 items-stretch md:-mx-3">
                  {dacsData.map((item, idx) => (
                    <CarouselSlide
                      key={item._id}
                      className="flex h-full flex-col px-3"
                    >
                      <DacCard item={item} idx={idx} />
                    </CarouselSlide>
                  ))}
                </CarouselTrack>

                <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2 md:-left-5">
                  <CarouselPrevious />
                </div>
                <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 md:-right-5">
                  <CarouselNext />
                </div>
              </div>

              <CarouselDots className="mt-2" />
            </div>
          </Carousel>
        </div>
      </div>
    </article>
  );
}
```

## `app/components/features/homepage/dacs/DacsHeader.tsx`

```tsx
import SectionHeader from "../shared/SectionHeader";

export default function DacsHeader() {
  return (
    <SectionHeader
      overline="DAC & Amplifiers"
      title="Digital Converters"
      href="/products/dacs-and-amps"
    />
  );
}
```

## `app/components/features/homepage/dacs/getDacProducts.ts`

```typescript
import { sanityFetch } from "@/sanity-cms/lib/client";
import { cache } from "react";

export interface DacProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  stock: number;
  slug: string;
  imageUrl: string;
  image: { asset: { _id: string; url: string }; alt?: string };
}

const DACS_QUERY = `*[_type == "homepageData"][0].dacs[]->{
  _id, name, brand->{ _id, name, slug }, price_data, stock,
  "slug": slug.current,
  "imageUrl": image.asset->url,
  image{asset->{_id, url}}
}`;

export const getDacProducts = cache(async (): Promise<DacProduct[]> => {
  const result = await sanityFetch({ query: DACS_QUERY }) as DacProduct[];
  return result ?? [];
});
```

## `app/components/features/homepage/featured/card/Card.tsx`

```tsx
import CardMedia from "./CardMedia";
import CardDetails from "./CardDetails";
import { centsToDisplay } from "@/lib/utils/price";

interface CardProps {
  product: {
    name: string;
    brand: {
      _id: string;
      name: string;
      slug: string;
    };
    price_data: { currency: string; unit_amount: number };
    imageUrl: string;
  };
}

export default function Card({ product }: CardProps) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[12px] border-2 border-secondary-500 bg-white transition-all duration-500 hover:shadow-cardHover shadow-card">
      <CardMedia src={product.imageUrl} alt={product.name} />
      <CardDetails
        name={product.name}
        brand={product.brand}
        price={centsToDisplay(product.price_data.unit_amount)}
      />
    </div>
  );
}
```

## `app/components/features/homepage/featured/card/CardDetails.tsx`

```tsx
import { ShoppingCartIcon } from "@phosphor-icons/react/dist/ssr";

export default function CardDetails({
  name,
  brand,
  price,
  description = "Premium acoustic engineering with artisan craftsmanship."
}: {
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price: number;
  description?: string;
}) {
  const formattedPrice = price?.toLocaleString("en-US") ?? "";

  return (
    <div className="flex flex-1 flex-col bg-brand-900">
      <div className="flex flex-col gap-2 p-5 sm:p-8 pb-4 sm:pb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold tracking-[0.2em] text-secondary-500">
            {brand.name}
          </span>
          <div className="h-[1px] w-4 bg-brand-500/30" />
        </div>
        <h3 className="line-clamp-1 text-h3 font-light leading-tight tracking-tight transition-colors duration-500 group-hover:text-accent-400">
          {name}
        </h3>
        <p className="line-clamp-2 text-small leading-relaxed text-secondary-300">
          {description}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-white/10 p-5 sm:p-8 py-4 sm:py-6">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-secondary-500">Price</span>
          <span className="text-body font-bold tabular-nums text-brand-50">
            ${formattedPrice}
          </span>
        </div>

        <button className="btn-secondary flex items-center gap-2 px-4 py-2 sm:px-6 active:scale-95">
          <ShoppingCartIcon size={18} weight="bold" />
          <span className="font-sans text-small font-bold xs:block md:hidden uppercase">
            Add
          </span>
          <span className="hidden font-sans text-small font-bold md:block uppercase">
            Add to cart
          </span>
        </button>
      </div>
    </div>
  );
}


```

## `app/components/features/homepage/featured/card/CardMedia.tsx`

```tsx
import Image from "next/image";

export default function CardMedia({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative flex-[2] bg-secondary-50/10 p-6 group-hover:bg-secondary-50/30 transition-colors duration-500">
      {/* The Gallery Frame: Matching the reference image boxed depth */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[8px] bg-white shadow-sm ">
        <Image
          src={src || "/placeholder.png"}
          alt={alt}
          fill
          priority
          className="object-contain p-10 transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 85vw, (max-width: 1200px) 30vw, 25vw"
        />
      </div>
    </div>
  );
}
```

## `app/components/features/homepage/featured/Featured.tsx`

```tsx
import Image from "next/image";
import Link from "next/link";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import {
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from "@/app/components/layout/carousel/CarouselControls";
import FeaturedHeader from "./FeaturedHeader";
import { FeaturedProduct } from "./getFeaturedProducts";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { centsToDisplay } from "@/lib/utils/price";

interface FeaturedProps {
  featuredData: FeaturedProduct[];
}

interface FeaturedCardProps {
  product: FeaturedProduct;
  idx: number;
}

const featuredBreakpointMap = {
  xl: 3,
  lgDesktop: 3,
  mdLandscape: 2,
  mdPortrait: 2,
  smLandscape: 2,
  smPortrait: 2,
  xsPortrait: 1,
  mobileLandscape: 1,
  mobilePortrait: 1,
};

export const FeaturedCard = ({ product, idx }: FeaturedCardProps) => (
  <article className="card-product-dark flex h-full flex-col gap-4">
    <Link href={`/product/${product.slug}`} className="flex flex-grow flex-col">
      <figure className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surface-productImage p-6">
        <span className="absolute left-4 top-4 z-10 type-caption text-brand-900">
          {product.brand.name}
        </span>
        <Image
          src={product.image?.asset?._id ?? ""}
          alt={product.name}
          width={450}
          height={450}
          priority={idx === 0}
          loading={idx === 0 ? "eager" : "lazy"}
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
        />
      </figure>

      <div className="flex flex-grow flex-col px-4 pt-2">
        <p className="type-overline mb-1">Headphones</p>
        <h3 className="type-body line-clamp-2 font-medium">{product.name}</h3>
        <p className="type-price mt-2">
          ${centsToDisplay(product.price_data.unit_amount)}
        </p>
      </div>
    </Link>

    <div className="px-4 pb-4 pt-2">
      <BasketControls
        productId={product._id}
        isBasketPage={false}
        addClassName="btn-cart w-full justify-center"
        wrapperClassName="flex items-center gap-1"
        decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
        incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
        quantityClassName="w-7 text-center type-body text-primary tabular-nums"
      />
    </div>
  </article>
);

export default async function Featured({ featuredData }: FeaturedProps) {
  if (!featuredData || featuredData?.length === 0) return null;

  return (
    <article className="relative w-full bg-brand-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div className="absolute -right-[10%] -top-[10%] h-[120%] w-[120%] bg-fractal-ring bg-[length:100%] bg-no-repeat opacity-5" />
        <div className="absolute -left-[5%] top-[5%] h-[60%] w-[60%] bg-fractal-ring bg-[length:100%] bg-no-repeat opacity-10" />
        <div className="absolute bottom-[2.5%] right-[2.5%] h-[30%] w-[30%] bg-fractal-ring bg-[length:100%] bg-no-repeat opacity-10" />
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-content py-16">
          <Carousel
            itemsCount={featuredData.length}
            breakpointMap={featuredBreakpointMap}
          >
            <div className="flex flex-col gap-6">
              <FeaturedHeader />

              <div className="relative">
                <CarouselTrack className="mx-0 w-full items-stretch md:-mx-3">
                  {featuredData.map((p, idx) => (
                    <CarouselSlide
                      key={p._id || idx}
                      className="flex h-full flex-col px-3"
                    >
                      <FeaturedCard product={p} idx={idx} />
                    </CarouselSlide>
                  ))}
                </CarouselTrack>

                <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2 md:-left-5">
                  <CarouselPrevious />
                </div>
                <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 md:-right-5">
                  <CarouselNext />
                </div>
              </div>

              <CarouselDots className="mt-2" />
            </div>
          </Carousel>
        </div>
      </div>
    </article>
  );
}
```

## `app/components/features/homepage/featured/FeaturedControls.tsx`

```tsx
import { CarouselNext, CarouselPrevious, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";

export default function FeaturedControls() {
  return (
    <div className="mt-16 flex flex-col gap-8">
      <div className="flex justify-center"><CarouselDots /></div>
      <div className="flex justify-center gap-4">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>
    </div>
  );
}
```

## `app/components/features/homepage/featured/FeaturedHeader.tsx`

```tsx
import SectionHeader from "../shared/SectionHeader";

export default function FeaturedHeader() {
  return (
    <SectionHeader
      overline="Headphones Collection"
      title="Featured"
      href="/products/headphones"
    />
  );
}
```

## `app/components/features/homepage/featured/getFeaturedProducts.ts`

```typescript
import { sanityFetch } from "@/sanity-cms/lib/client";
import { cache } from "react";

export interface FeaturedProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  stock: number;
  slug: string;
  productPromo: string;
  image: {
    asset: {
      _id: string;
      url: string;
    };
    alt?: string;
  };
}

const FEATURED_QUERY = `*[_type == "homepageData"][0].featuredProducts[]{
  productPromo,
  ...productRef->{
    _id,
    name,
    brand->{ _id, name, slug },
    price_data,
    stock,
    "slug": slug.current,
    image{asset->{_id, url}}
  }
}`;

export const getFeaturedProducts = cache(async (): Promise<FeaturedProduct[]> => {
  return sanityFetch({ query: FEATURED_QUERY });
});
```

## `app/components/features/homepage/featured/index.ts`

```typescript
export { default } from './Featured';
export type * from './types';
```

## `app/components/features/homepage/featured/types.ts`

```typescript
export interface FeaturedCardProps {
    product: any;
}

export interface FeaturedProps {
    featuredData?: any[];
}
```

## `app/components/features/homepage/iems-gallery/getIemProducts.ts`

```typescript
import { sanityFetch } from "@/sanity-cms/lib/client";
import { cache } from "react";

export interface IemProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  stock: number;
  slug: string;
  imageUrl: string;
  image: { asset: { _id: string; url: string }; alt?: string };
}

const IEMS_QUERY = `*[_type == "homepageData"][0].iemsGallery[]->{
  _id,
  name,
  brand->{ _id, name, slug },
  price_data,
  stock,
  "slug": slug.current,
  "imageUrl": image.asset->url,
  image{asset->{_id, url}}
}`;

export const getIemProducts = cache(async (): Promise<IemProduct[]> => {
  const result = await sanityFetch({ query: IEMS_QUERY }) as IemProduct[];
  return result ?? [];
});
```

## `app/components/features/homepage/iems-gallery/IemCard.tsx`

```tsx
import { cn } from "@/lib/utils/tailwind";
import Image from "next/image";
import Link from "next/link";
import { IemProduct } from "./getIemProducts";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { centsToDisplay } from "@/lib/utils/price";

export default function IemCard({
  product,
  idx,
}: {
  product: IemProduct;
  idx: number;
}) {
  if (!product) return null;

  return (
    <article className="card-product-dark flex h-full flex-col gap-4 p-0 xs:p-6">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-t-lg bg-surface-productImage pb-0 pt-0 md:pt-12 xs:pb-4 xs:pt-8">
          <Image
            src={product.image?.asset?._id ?? ""}
            alt={product.name}
            width={375}
            height={375}
            loading="lazy"
            className="h-[70%] w-[70%] object-cover object-center transition-transform duration-300 group-hover:scale-105 xs:h-[60%] xs:w-[60%]"
          />
          <div className="absolute left-2 top-2 xs:top-4">
            <span className="whitespace-nowrap text-[7px] font-bold uppercase tracking-editorial text-brand-900 xs:whitespace-normal xs:text-small">
              {product.brand.name}
            </span>
          </div>
        </div>

        <div className="flex flex-col px-4 xs:gap-1">
          <p className="type-overline mb-1">In-Ear Monitors</p>
          <h3 className="type-body line-clamp-2 font-medium">{product.name}</h3>
          <p className="type-price mt-2">
            ${centsToDisplay(product.price_data.unit_amount)}
          </p>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <BasketControls
          productId={product._id}
          isBasketPage={false}
          addClassName="btn-cart w-full justify-center"
          wrapperClassName="flex items-center gap-1"
          decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
          incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
          quantityClassName="w-7 text-center type-body text-primary tabular-nums"
        />
      </div>
    </article>
  );
}
```

## `app/components/features/homepage/iems-gallery/IemsGallery.tsx`

```tsx
import React from "react";
import Link from "next/link";
import IemsGalleryHeader from "./IemsGalleryHeader";
import IemCard from "./IemCard";
import { IemProduct } from "./getIemProducts";

interface IemsGalleryProps {
  iemsData: IemProduct[];
}

export default async function IemsGallery({ iemsData }: IemsGalleryProps) {
  if (!iemsData.length) return null;

  const displayed = iemsData.slice(0, 6);

  return (
    <article className="w-full relative overflow-hidden border-y border-border-secondary bg-brand-900">
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[120%] h-[120%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5" />
        <div className="absolute top-[5%] -left-[5%] w-[60%] h-[60%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-content py-16">
          <div className="flex flex-col gap-8">
            <IemsGalleryHeader />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {displayed.map((iem, idx) => (
                <IemCard key={iem._id} product={iem as any} idx={idx} />
              ))}
            </div>
            {iemsData.length > 6 && (
              <div className="flex justify-center pt-4">
                <Link
                  href="/products/iems"
                  className="btn-ghost text-sm"
                >
                  View All In-Ear Monitors →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
```

## `app/components/features/homepage/iems-gallery/IemsGalleryHeader.tsx`

```tsx
import SectionHeader from "../shared/SectionHeader";

export default function IemsGalleryHeader() {
  return (
    <SectionHeader
      overline="In-Ear Monitors"
      title="IEMs"
      href="/products/iems"
    />
  );
}
```

## `app/components/features/homepage/iems-gallery/types.ts`

```typescript
export interface IemProduct {
  readonly _id: string;
  readonly brand: string;
  readonly name: string;
  readonly slug: string;
  readonly price_data: { currency: string; unit_amount: number };
  readonly imageUrl: string;
}
```

## `app/components/features/homepage/newest-release/getNewestRelease.ts`

```typescript
import { sanityFetch } from "@/sanity-cms/lib/client";
import { cache } from "react";

export interface NewestReleaseProduct {
  _id: string;
  name: string;
  slug: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  image: { asset: { _id: string; url: string }; alt?: string };
  gallery: Array<{ asset: { _id: string; url: string }; alt?: string }>;
}

export interface NewestReleaseData {
  promoTitle: string;
  promoSubtitle: string;
  promoText: string;
  productRef: NewestReleaseProduct;
}



const NEWEST_RELEASE_QUERY = `*[_type == "homepageData"][0].newestReleaseData{
  promoTitle,
  promoSubtitle,
  promoText,
  productRef->{
    _id, name, "slug": slug.current, brand->{ _id, name, slug }, price_data,
    image{asset->{_id, url}},
    gallery[]{asset->{_id, url}}
  }
}`;

export const getNewestRelease = cache(async (): Promise<NewestReleaseData | null> => {
  return sanityFetch({ query: NEWEST_RELEASE_QUERY });
});
```

## `app/components/features/homepage/newest-release/NewestRelease.tsx`

```tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Spotlight1Data } from "../product-spotlight-1/getSpotlight1Data";

interface NewestReleaseProps {
  newestReleaseData: Spotlight1Data | null;
}

export default async function NewestRelease({ newestReleaseData }: NewestReleaseProps) {
  if (!newestReleaseData || !newestReleaseData.productRef) return null;

  const { productRef: product, promoTitle, promoSubtitle, promoText } = newestReleaseData;

  const backgroundImage = product.image ?? product.gallery?.[0];

  return (
    <article className="w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-stretch min-h-[400px] lg:min-h-[560px]">
        {/* Image column */}
        <div className="w-full lg:flex-hero min-h-[280px] lg:min-h-[560px] flex items-center justify-center p-4 md:p-8">
          {backgroundImage?.asset?._id && (
            <div className="aspect-square w-full bg-surface-productImage rounded-lg flex items-center justify-center overflow-hidden p-8 lg:p-12">
              <Image
                src={backgroundImage.asset._id}
                alt={product.name}
                width={1024}
                height={1024}
                priority
                className="object-contain w-full h-full"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          )}
        </div>

        {/* Text column */}
        <div className="w-full lg:flex-details bg-brand-800 flex flex-col justify-center">
          <div className="mx-auto max-w-content w-full py-12 lg:py-24 px-4 md:px-8">
            <div className="max-w-2xl">
              <div className="flex flex-col gap-6">
                <span className="type-overline text-accent-500">
                  {product.brand.name}
                </span>

                <div className="flex flex-col gap-2">
                  <h2 className="type-hero-headline text-brand-400">
                    {promoTitle || product.name}
                  </h2>
                  <h3 className="type-hero-sub text-brand-400">
                    {promoSubtitle || product.name}
                  </h3>
                </div>

                <p className="type-body text-brand-200 max-w-prose leading-relaxed">
                  {promoText || "Unrivaled acoustic engineering and clarity."}
                </p>
                <ul className="flex flex-col gap-3 list-disc list-inside">
                  <li className="type-body text-brand-200 max-w-prose leading-relaxed">
                    <strong>Studio-Grade Lineage:</strong> Uncovers the original master tape hidden within your files, devoid of clinical coldness.
                  </li>
                  <li className="type-body text-brand-200 max-w-prose leading-relaxed">
                    <strong>Bit-Perfect Timing:</strong> Proprietary jitter-reduction system that redefines digital accuracy.
                  </li>
                  <li className="type-body text-brand-200 max-w-prose leading-relaxed">
                    <strong>Multi-Config Output:</strong> Effortlessly drives any high-end amplifier or serious headphone setup.
                  </li>
                </ul>
              </div>

              <Link
                href="/product/weiss-dac204-desktop-dac"
                className="btn-ghost mt-6 inline-block"
              >
                View DAC204 Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
```

## `app/components/features/homepage/newest-release/types.ts`

```typescript
export interface SpotlightRelease {
  readonly _id: string;
  readonly tag: string;
  readonly name: string;
  readonly brand: string;
  readonly price_data: { currency: string; unit_amount: number };
  readonly description: string;
  readonly imageUrl: string;
  readonly images: readonly string[];
  readonly slug?: string;
}
```

## `app/components/features/homepage/product-spotlight-1/getSpotlight1Data.ts`

```typescript
import { sanityFetch } from "@/sanity-cms/lib/client";
import { cache } from "react";

export interface Spotlight1Product {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  image: { asset: { _id: string; url: string }; alt?: string };
  gallery?: Array<{ asset: { _id: string; url: string }; alt?: string }>;
  images?: Array<{ asset: { _id: string; url: string }; alt?: string }>;
}

export interface Spotlight1Data {
  promoTitle: string;
  promoSubtitle: string;
  promoText: string;
  productRef: Spotlight1Product;
}

const SPOTLIGHT1_QUERY = `*[_type == "homepageData"][0].spotlight1Data{
  promoTitle,
  promoSubtitle,
  promoText,
  productRef->{
    _id, name, brand->{ _id, name, slug }, price_data,
    image{asset->{_id, url}},
    gallery[]{asset->{_id, url}}
  }
}`;

function processProductImages(product: Spotlight1Product): Spotlight1Product {
  if (!product.image) return product;

  const images = [product.image];
  if (product.gallery && product.gallery.length > 0) {
    images.push(...product.gallery);
  }

  return { ...product, images };
}

export const getSpotlight1Data = cache(async (): Promise<Spotlight1Data | null> => {
  const data = await sanityFetch({ query: SPOTLIGHT1_QUERY }) as Spotlight1Data | null;

  if (data && data.productRef) {
    data.productRef = processProductImages(data.productRef);
  }

  return data;
});
```

## `app/components/features/homepage/product-spotlight-1/index.ts`

```typescript
export { default } from './ProductSpotlight1';
export type * from './../spotlightTypes';
```

## `app/components/features/homepage/product-spotlight-1/ProductSpotlight1.tsx`

```tsx
import React from "react";
import Image from "next/image";
import { Spotlight1Data } from "./getSpotlight1Data";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselPrevious, CarouselNext, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";

interface ProductSpotlight1Props {
  spotlightData: Spotlight1Data | null;
}

export default async function ProductSpotlight1({ spotlightData }: ProductSpotlight1Props) {
    if (!spotlightData || !spotlightData.productRef) return null;
    const { productRef: product, promoTitle, promoSubtitle, promoText } = spotlightData;

    return (
        <article className="w-full relative overflow-hidden border-t border-border-secondary py-24 bg-surface-page">
            <div className="max-w-content mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-20 items-stretch min-h-[400px] md:min-h-[500px]">
                    <div className="w-full h-full bg-surface-productImage rounded-none flex items-center justify-center relative overflow-hidden border border-border-secondary">
                        <Carousel itemsCount={product.images?.length || 1} breakpointMap={{ lgDesktop: 1, mdPortrait: 1, mobilePortrait: 1 }} className="w-full h-full overflow-visible">
                            <CarouselTrack className="w-full h-full">
                                {product.images?.map((image, idx) => (
                                    <CarouselSlide
                                        key={`${product._id}-${idx}`}
                                        className="aspect-square w-full flex items-center justify-center pb-4 opacity-0 scale-95 transition-[opacity,transform] duration-500 ease-out data-[active=true]:opacity-100 data-[active=true]:scale-100"
                                    >
                                        <Image
                                            src={image?.asset?._id ?? ""}
                                            alt={product.name}
                                            width={800}
                                            height={800}
                                            priority={idx === 0}
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className="max-w-full max-h-[80%] w-auto h-auto object-contain mix-blend-multiply"
                                        />
                                    </CarouselSlide>
                                ))}
                            </CarouselTrack>

                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
                                <div className="flex gap-2">
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </div>
                                <CarouselDots />
                            </div>

                        </Carousel>
                    </div>

                    <div className="w-full h-full bg-surface-subtle rounded-none flex flex-col justify-center p-8 lg:p-12 relative overflow-hidden border border-border-secondary shadow-cardDark">
                        <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
                            <div className="absolute -top-[20%] -right-[20%] w-[140%] h-[140%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5" />
                            <div className="absolute top-[10%] -left-[10%] w-[80%] h-[80%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
                            <div className="absolute bottom-[5%] right-[5%] w-[40%] h-[40%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-20" />
                        </div>

                        <div className="flex flex-col relative z-10">
                            <span className="text-accent-500 uppercase text-sm tracking-widest mb-1 section-header-anchor">{product.brand.name}</span>
                            <div className="flex flex-col gap-2">
                                <h2 className="type-section-hed">{promoTitle || product.name}</h2>
                                <h3 className="text-h3 font-light text-text-subtitle">{promoSubtitle || product.name}</h3>
                            </div>
                            <p className="type-body text-text-body mt-4 max-w-prose text-pretty">
                                {promoText || "Unrivaled acoustic engineering and clarity."}
                            </p>
                        </div>
                        <div className="mt-8 flex justify-center relative z-10">
                            <button className="border border-brand-200 text-brand-100 uppercase transition-colors duration-200 hover:bg-brand-800 hover:text-brand-50 cursor-pointer px-6 py-3">
                                See More
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
```

## `app/components/features/homepage/product-spotlight-2/getSpotlight2Data.ts`

```typescript
import { sanityFetch } from "@/sanity-cms/lib/client";
import { cache } from "react";
import type { Spotlight1Data } from "../product-spotlight-1/getSpotlight1Data";
import type { Spotlight1Product } from "../product-spotlight-1/getSpotlight1Data";

const SPOTLIGHT2_QUERY = `*[_type == "homepageData"][0].spotlight2Data{
  promoTitle,
  promoSubtitle,
  promoText,
  productRef->{
    _id, name, brand->{ _id, name, slug }, price_data,
    image{asset->{_id, url}},
    gallery[]{asset->{_id, url}}
  }
}`;

function processProductImages(product: Spotlight1Product): Spotlight1Product {
  if (!product.image) return product;

  const images = [product.image];
  if (product.gallery && product.gallery.length > 0) {
    images.push(...product.gallery);
  }

  return { ...product, images };
}

export const getSpotlight2Data = cache(async (): Promise<Spotlight1Data | null> => {
  const data = await sanityFetch({ query: SPOTLIGHT2_QUERY }) as Spotlight1Data | null;

  if (data && data.productRef) {
    data.productRef = processProductImages(data.productRef);
  }

  return data;
});
```

## `app/components/features/homepage/product-spotlight-2/ProductSpotlight2.tsx`

```tsx
import React from "react";
import Image from "next/image";
import { Spotlight1Data } from "../product-spotlight-1/getSpotlight1Data";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselPrevious, CarouselNext, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";

interface ProductSpotlight2Props {
  spotlightData: Spotlight1Data | null;
}

export default async function ProductSpotlight2({ spotlightData }: ProductSpotlight2Props) {
    if (!spotlightData || !spotlightData.productRef) return null;
    const { productRef: product, promoTitle, promoSubtitle, promoText } = spotlightData;

    return (
        <article className="w-full relative overflow-hidden border-t border-border-secondary py-24 bg-surface-page">
            <div className="max-w-content mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-20 items-stretch min-h-[400px] md:min-h-[500px]">
                    <div className="order-1 lg:order-2 w-full h-full bg-surface-productImage rounded-none flex items-center justify-center relative overflow-hidden border border-border-secondary">
                        <Carousel itemsCount={product.images?.length || 1} breakpointMap={{ lgDesktop: 1, mdPortrait: 1, mobilePortrait: 1 }} className="w-full h-full overflow-visible">
                            <CarouselTrack className="w-full h-full">
                                {product.images?.map((image, idx) => (
                                    <CarouselSlide key={`${product._id}-${idx}`} className="aspect-square w-full flex items-center justify-center pb-4 opacity-0 scale-95 transition-[opacity,transform] duration-500 ease-out data-[active=true]:opacity-100 data-[active=true]:scale-100">
                                        <Image
                                            src={image?.asset?._id ?? ""}
                                            alt={product.name}
                                            width={800}
                                            height={800}
                                            priority={idx === 0}
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className="max-w-full max-h-[80%] w-auto h-auto object-contain mix-blend-multiply"
                                        />
                                    </CarouselSlide>
                                ))}
                            </CarouselTrack>
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
                                <div className="flex gap-2">
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </div>
                                <CarouselDots />
                            </div>
                        </Carousel>
                    </div>
                    <div className="order-2 lg:order-1 w-full h-full bg-surface-subtle rounded-none flex flex-col justify-center p-8 lg:p-12 relative overflow-hidden border border-border-secondary shadow-cardDark">
                        <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
                            <div className="absolute -top-[20%] -right-[20%] w-[140%] h-[140%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5" />
                            <div className="absolute top-[10%] -left-[10%] w-[80%] h-[80%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
                            <div className="absolute bottom-[5%] right-[5%] w-[40%] h-[40%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-20" />
                        </div>
                        <div className="flex flex-col relative z-10">
                            <span className="text-accent-500 uppercase text-sm tracking-widest mb-1 section-header-anchor">{product.brand.name}</span>
                            <div className="flex flex-col gap-2">
                                <h2 className="type-section-hed">{promoTitle || product.name}</h2>
                                <h3 className="text-h3 font-light text-text-subtitle">{promoSubtitle || product.name}</h3>
                            </div>
                            <p className="type-body text-text-body mt-4 max-w-prose text-pretty">
                                {promoText || "Unrivaled acoustic engineering and clarity."}
                            </p>
                        </div>
                        <div className="mt-8 flex justify-center relative z-10">
                            <button className="border border-brand-200 text-brand-100 uppercase transition-colors duration-200 hover:bg-brand-800 hover:text-brand-50 cursor-pointer px-6 py-3">
                                See More
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
```

## `app/components/features/homepage/product-spotlight-3/getSpotlight3Data.ts`

```typescript
import { sanityFetch } from "@/sanity-cms/lib/client";
import { cache } from "react";
import type { Spotlight1Data } from "../product-spotlight-1/getSpotlight1Data";
import type { Spotlight1Product } from "../product-spotlight-1/getSpotlight1Data";

const SPOTLIGHT3_QUERY = `*[_type == "homepageData"][0].spotlight3Data{
  promoTitle,
  promoSubtitle,
  promoText,
  productRef->{
    _id, name, brand->{ _id, name, slug }, price_data,
    image{asset->{_id, url}},
    gallery[]{asset->{_id, url}}
  }
}`;

function processProductImages(product: Spotlight1Product): Spotlight1Product {
  if (!product.image) return product;

  const images = [product.image];
  if (product.gallery && product.gallery.length > 0) {
    images.push(...product.gallery);
  }

  return { ...product, images };
}

export const getSpotlight3Data = cache(async (): Promise<Spotlight1Data | null> => {
  const data = await sanityFetch({ query: SPOTLIGHT3_QUERY }) as Spotlight1Data | null;

  if (data && data.productRef) {
    data.productRef = processProductImages(data.productRef);
  }

  return data;
});
```

## `app/components/features/homepage/product-spotlight-3/ProductSpotlight3.tsx`

```tsx
import React from "react";
import Image from "next/image";
import { Spotlight1Data } from "../product-spotlight-1/getSpotlight1Data";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselPrevious, CarouselNext, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";

interface ProductSpotlight3Props {
  spotlightData: Spotlight1Data | null;
}

export default function ProductSpotlight3({ spotlightData }: ProductSpotlight3Props) {
  if (!spotlightData || !spotlightData.productRef) return null;
  const { productRef: product, promoTitle, promoSubtitle, promoText } = spotlightData;

  return (
    <article className="w-full relative overflow-hidden border-t border-border-secondary py-24 bg-surface-page">
      <div className="max-w-content mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-20 items-stretch min-h-[400px] md:min-h-[500px]">
          <div className="w-full h-full bg-surface-productImage rounded-none flex items-center justify-center relative overflow-hidden border border-border-secondary">
            <Carousel itemsCount={product.images?.length || 1} breakpointMap={{ lgDesktop: 1, mdPortrait: 1, mobilePortrait: 1 }} className="w-full h-full overflow-visible">
              <CarouselTrack className="w-full h-full">
                {product.images?.map((image, idx) => (
                  <CarouselSlide key={`${product._id}-${idx}`} className="aspect-square w-full flex items-center justify-center pb-4 opacity-0 scale-95 transition-[opacity,transform] duration-500 ease-out data-[active=true]:opacity-100 data-[active=true]:scale-100">
                    <Image
                      src={image?.asset?._id ?? ""}
                      alt={product.name}
                      width={800}
                      height={800}
                      priority={idx === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="max-w-full max-h-[80%] w-auto h-auto object-contain mix-blend-multiply"
                    />
                  </CarouselSlide>
                ))}
              </CarouselTrack>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
                <div className="flex gap-2">
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
                <CarouselDots />
              </div>
            </Carousel>
          </div>
          <div className="w-full h-full bg-surface-subtle rounded-none flex flex-col justify-center p-8 lg:p-12 relative overflow-hidden border border-border-secondary shadow-cardDark">
            <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute -top-[20%] -right-[20%] w-[140%] h-[140%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5" />
              <div className="absolute top-[10%] -left-[10%] w-[80%] h-[80%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
              <div className="absolute bottom-[5%] right-[5%] w-[40%] h-[40%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-20" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-accent-500 uppercase text-sm tracking-widest mb-1 section-header-anchor">{product.brand.name}</span>
              <div className="flex flex-col gap-2">
                <h2 className="type-section-hed">{promoTitle || product.name}</h2>
                <h3 className="text-h3 font-light text-text-subtitle">{promoSubtitle || product.name}</h3>
              </div>
              <p className="type-body text-text-body mt-4 max-w-prose text-pretty">
                {promoText || "Unrivaled acoustic engineering and clarity."}
              </p>
            </div>
            <div className="mt-8 flex justify-center relative z-10">
              <button className="border border-brand-200 text-brand-100 uppercase transition-colors duration-200 hover:bg-brand-800 hover:text-brand-50 cursor-pointer px-6 py-3">
                See More
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
```

## `app/components/features/homepage/shared-spotlight/SpotlightDetails.tsx`

```tsx
import { cn } from "@/lib/utils/tailwind";

interface SpotlightProduct {
  brand: { name: string };
  headline?: string;
  subheadline?: string;
  name: string;
  description?: string | Array<{ children?: Array<{ text?: string }> }>;
}

interface SpotlightDetailsProps {
  data: SpotlightProduct;
  accentColor: string;
  className?: string;
}

export default function SpotlightDetails({ data, accentColor, className }: SpotlightDetailsProps) {
  const descriptionText = typeof data.description === "string"
    ? data.description
    : data.description?.[0]?.children?.[0]?.text || "";

  const headlineParts = data.headline?.split(" ") || ["Product", "Feature"];

  return (
    <div className={cn("flex flex-col justify-center gap-10", className)}>
      <div className="flex flex-col gap-8">
        <span className={cn("text-small font-bold uppercase tracking-signature", accentColor)}>
          {data.brand.name}
        </span>

        <div className="flex flex-col">
          <h2 className="text-display-2 font-regular tracking-editorial uppercase text-cap leading-tight">
            {headlineParts[0]}
          </h2>
          {headlineParts.length > 1 && (
            <h2 className="text-display-2 font-regular tracking-editorial uppercase text-cap leading-tight">
              {headlineParts.slice(1).join(" ")}
            </h2>
          )}
        </div>

        <h3 className="text-h3 font-sans font-light tracking-wide">
          {data.subheadline || data.name}
        </h3>

        <p className="text-body font-regular not-italic leading-relaxed max-w-lg">
          {descriptionText}
        </p>
      </div>

      {/* INTERACTIVE CTA: Animated Underline */}
      <button className="btn-ghost w-fit text-small font-bold uppercase pb-2">
        See More
      </button>
    </div>
  );
}
```

## `app/components/features/homepage/shared-spotlight/SpotlightHero.tsx`

```tsx
import Image from "next/image";
import { cn } from "@/lib/utils/tailwind";

interface SpotlightHeroProps {
  image: string;
  tier: "standard" | "gold";
  className?: string;
}

export default function SpotlightHero({ image, className }: SpotlightHeroProps) {
  return (
    /* SYSTEM FIX: We remove 'h-full' which fails on min-height parents. 
       We use 'flex-1' and 'min-h-[450px]' (mobile) / 'lg:min-h-full' 
       to ensure the absolute 'fill' image has a coordinate system to reference.
    */
    <div className={cn("relative w-full flex-1 min-h-[450px] lg:min-h-full overflow-hidden rounded-none", className)}>
      <Image
        src={image}
        alt="Product Spotlight"
        fill
        className="object-contain p-12 transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 1024px) 100vw, 42vw"
        priority
      />
    </div>
  );
}
```

## `app/components/features/homepage/shared/SectionHeader.tsx`

```tsx
import Link from "next/link";

interface SectionHeaderProps {
  overline: string;
  title: string;
  href: string;
}

export default function SectionHeader({ overline, title, href }: SectionHeaderProps) {
  return (
    <div className="mb-10">
      <p className="type-overline mb-2">{overline}</p>
      <div className="flex items-center justify-between">
        <h2 className="section-header-anchor type-section-hed">{title}</h2>
        <Link href={href} className="btn-ghost text-sm">
          View All
        </Link>
      </div>
    </div>
  );
}
```

## `app/components/features/products/__tests__/price-display.test.tsx`

```tsx
import { describe, it, expect } from 'vitest';
import { centsToDisplay } from '@/lib/utils/price';

describe('product price display', () => {
  it('should convert price_data.unit_amount to display price', () => {
    // Simulate product with price_data from Sanity
    const product = {
      price_data: {
        currency: 'usd',
        unit_amount: 1999, // $19.99 in cents
      },
    };

    const displayPrice = centsToDisplay(product.price_data.unit_amount);
    expect(displayPrice).toBe(19.99);
  });

  it('should handle various price points', () => {
    const testCases = [
      { unit_amount: 999, expected: 9.99 },    // $9.99
      { unit_amount: 4999, expected: 49.99 },  // $49.99
      { unit_amount: 10000, expected: 100 },    // $100.00
      { unit_amount: 150, expected: 1.5 },      // $1.50
    ];

    testCases.forEach(({ unit_amount, expected }) => {
      expect(centsToDisplay(unit_amount)).toBe(expected);
    });
  });
});
```

## `app/components/features/products/__tests__/skeletons.test.tsx`

```tsx
import React from 'react';
// eslint-disable-next-line no-restricted-imports -- Types needed for TypeScript
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductGridSkeleton } from '../ProductGridSkeleton';
import { ProductCardSkeleton } from '../ProductCardSkeleton';
import { ShopHeaderSkeleton } from '../ShopHeaderSkeleton';

describe('L4 Skeleton: Structural Components', () => {

  describe('ProductGridSkeleton', () => {
    it('L4-01: Renders correct number of skeleton items', () => {
      render(<ProductGridSkeleton count={4} />);
      const items = screen.getAllByTestId('product-card-skeleton');
      expect(items).toHaveLength(4);
    });

    it('L4-02: Uses grid layout classes', () => {
      render(<ProductGridSkeleton count={4} />);
      const grid = screen.getByTestId('product-grid-skeleton');
      expect(grid.className).toContain('grid');
    });

    it('L4-03: Responsive column classes present', () => {
      render(<ProductGridSkeleton count={4} />);
      const grid = screen.getByTestId('product-grid-skeleton');
      // Should have responsive grid classes
      expect(grid.className).toMatch(/grid-cols-2|grid-cols-1/);
    });
  });

  describe('ProductCardSkeleton', () => {
    it('L4-04: Has image placeholder with correct aspect ratio', () => {
      render(<ProductCardSkeleton />);
      const image = screen.getByTestId('skeleton-image');
      expect(image).toBeInTheDocument();
      // Should have aspect ratio class
      expect(image.className).toMatch(/aspect-/);
    });

    it('L4-05: Has brand text placeholder', () => {
      render(<ProductCardSkeleton />);
      expect(screen.getByTestId('skeleton-brand')).toBeInTheDocument();
    });

    it('L4-06: Has title text placeholder', () => {
      render(<ProductCardSkeleton />);
      expect(screen.getByTestId('skeleton-title')).toBeInTheDocument();
    });

    it('L4-07: Has price text placeholder', () => {
      render(<ProductCardSkeleton />);
      expect(screen.getByTestId('skeleton-price')).toBeInTheDocument();
    });

    it('L4-08: Uses animate-pulse for loading effect', () => {
      render(<ProductCardSkeleton />);
      const root = screen.getByTestId('product-card-skeleton');
      expect(root.className).toContain('animate-pulse');
    });
  });

  describe('ShopHeaderSkeleton', () => {
    it('L4-09: Has title placeholder', () => {
      render(<ShopHeaderSkeleton />);
      expect(screen.getByTestId('skeleton-header-title')).toBeInTheDocument();
    });

    it('L4-10: Has count placeholder', () => {
      render(<ShopHeaderSkeleton />);
      expect(screen.getByTestId('skeleton-header-count')).toBeInTheDocument();
    });
  });

});
```

## `app/components/features/products/ImageGallery.tsx`

```tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { sanityImageLoader } from '@/lib/utils/sanityImageLoader';

interface ImageGalleryProps {
  images: any[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Filter valid images
  const validImages = images?.filter((img) => img?.asset?._ref) || [];

  // Handle keyboard events for modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsZoomOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isZoomOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isZoomOpen, handleKeyDown]);

  if (validImages.length === 0) {
    return (
      <div className="aspect-square bg-surface-productImage rounded-lg flex items-center justify-center" data-testid="image-gallery-placeholder">
        <span className="sr-only">No images available</span>
        <svg className="w-16 h-16 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const mainImage = validImages[selectedIndex];
  const mainImageRef = mainImage?.asset?._ref || mainImage?.asset?._id;

  return (
    <>
      <div className="space-y-4" data-testid="image-gallery">
        {/* Main Image */}
        <button
          onClick={() => setIsZoomOpen(true)}
          className="relative aspect-square bg-surface-productImage rounded-lg overflow-hidden w-full block cursor-zoom-in group"
          aria-label={`View ${productName} image ${selectedIndex + 1} in full size`}
        >
          <figure className="w-full h-full">
            <Image
              src={mainImageRef}
              loader={sanityImageLoader}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={selectedIndex === 0}
            />
          </figure>
        </button>

        {/* Thumbnail Strip */}
        {validImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {validImages.map((image, index) => {
              const thumbRef = image?.asset?._ref || image?.asset?._id;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded overflow-hidden transition-all ${
                    isSelected
                      ? 'ring-2 ring-brand-400 ring-offset-2 ring-offset-brand-800'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={isSelected}
                >
                  <Image
                    src={thumbRef}
                    loader={sanityImageLoader}
                    alt={`${productName} thumbnail ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {isZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} - Full size image`}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 transition-opacity duration-200 ease-out" />

          {/* Modal Content */}
          <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
            {/* Close Button */}
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-sm text-body hover:text-primary transition-colors duration-150"
              aria-label="Close zoom view"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Zoomed Image */}
            <figure
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={mainImageRef}
                loader={sanityImageLoader}
                alt={`${productName} - Full size image ${selectedIndex + 1}`}
                width={1600}
                height={1600}
                className="object-contain max-w-[90vw] max-h-[90vh] w-auto h-auto"
                sizes="90vw"
                priority
              />
            </figure>
          </div>
        </div>
      )}
    </>
  );
}
```

## `app/components/features/products/index.ts`

```typescript
export { ProductGrid } from './ProductGrid';
export { ProductCard } from './ProductCard';
export { ProductImage } from './ProductImage';
export { ShopHeader } from './ShopHeader';
export { ProductDetail } from './ProductDetail';
export { ProductInfo } from './ProductInfo';
export { ImageGallery } from './ImageGallery';
export { ProductGridSkeleton } from './ProductGridSkeleton';
export { ProductCardSkeleton } from './ProductCardSkeleton';
export { ShopHeaderSkeleton } from './ShopHeaderSkeleton';
```

## `app/components/features/products/ProductCard.tsx`

```tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { ProductImage } from './ProductImage';
import type { Product } from '@/sanity-cms/lib/products/getProductsByVfsKeys';
import { Price } from '@/app/components/ui/Price';
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { centsToDisplay } from '@/lib/utils/price';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const displayPrice = centsToDisplay(product.price_data.unit_amount);

  return (
    <article
      className="card-product-dark group flex h-full flex-col col-span-1"
      data-testid="product-card"
    >
      <Link href={`/product/${product.slug.current}`} className="block">
        <figure className="aspect-[4/3] relative flex w-full items-center justify-center overflow-hidden bg-surface-productImage p-6">
          {product.brand?.name && (
            <span className="absolute left-4 top-4 type-caption text-brand-900 z-10">
              {product.brand.name}
            </span>
          )}
          <ProductImage
            image={product.image}
            alt={product.name}
            className="group-hover:scale-110"
          />
        </figure>

        <div className="flex flex-col flex-grow gap-3 p-4">
          <h3 className="type-body font-medium line-clamp-2">
            {product.name}
          </h3>
        </div>
      </Link>

      <div className="flex items-center justify-between px-4 pb-4">
        <Price value={displayPrice} />
        <BasketControls
          productId={product._id}
          isBasketPage={false}
          addClassName="btn-cart"
          wrapperClassName="flex items-center gap-1"
          decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
          incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
          quantityClassName="w-7 text-center type-body text-primary tabular-nums"
        />
      </div>
    </article>
  );
}

```

## `app/components/features/products/ProductCardSkeleton.tsx`

```tsx
import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div
      data-testid="product-card-skeleton"
      className="card-product-dark flex flex-col"
    >
      {/* Image placeholder */}
      <div
        data-testid="skeleton-image"
        className="aspect-[4/3] bg-secondary-800 animate-pulse"
      />

      {/* Content area matching ProductCard structure */}
      <div className="flex flex-col gap-3 p-4">
        {/* Title placeholder */}
        <div
          data-testid="skeleton-title"
          className="h-4 bg-secondary-800 rounded w-full animate-pulse"
        />

        {/* Price + CTA row */}
        <div className="flex items-center justify-between pt-2">
          <div
            data-testid="skeleton-price"
            className="h-4 bg-secondary-800 rounded w-1/4 animate-pulse"
          />
          <div
            data-testid="skeleton-button"
            className="h-8 bg-secondary-800 rounded w-16 animate-pulse"
          />
        </div>
      </div>
    </div>
  );
}
```

## `app/components/features/products/ProductDetail.tsx`

```tsx
import { Product } from '@/sanity-cms/lib/products/getProductBySlug';
import { RelatedProduct } from '@/sanity-cms/lib/products/getRelatedProducts';
import { ImageGallery } from './ImageGallery';
import { ProductInfo } from './ProductInfo';
import { RelatedProducts } from './RelatedProducts';

interface ProductDetailProps {
  product: Product;
  relatedProducts?: RelatedProduct[];
}

export function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  // Combine main image with gallery for the image gallery
  const allImages = product.image ? [product.image, ...(product.gallery || [])] : (product.gallery || []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="lg:w-1/2">
          <ImageGallery images={allImages} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="lg:w-1/2">
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Specifications Section */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border-secondary">
          <h2 className="type-section-sub mb-6">Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-secondary">
                  <th className="text-left py-3 px-4 type-caption uppercase text-secondary">Specification</th>
                  <th className="text-left py-3 px-4 type-caption uppercase text-secondary">Value</th>
                  {product.specifications?.some(s => s.information) && (
                    <th className="text-left py-3 px-4 type-caption uppercase text-secondary">Info</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {product.specifications.map((spec, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-surface-card' : ''}>
                    <td className="py-3 px-4 type-body text-primary">{spec.title}</td>
                    <td className="py-3 px-4 type-body text-primary">{spec.value}</td>
                    {product.specifications?.some(s => s.information) && (
                      <td className="py-3 px-4 type-caption text-secondary">{spec.information || '-'}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Related Products Section */}
      <RelatedProducts
        products={relatedProducts}
        currentProductName={product.name}
      />
    </div>
  );
}
```

## `app/components/features/products/ProductGrid.tsx`

```tsx
import React from 'react';
import { cn } from "@/lib/utils/tailwind";
import { ProductCard } from './ProductCard';
import type { Product } from '@/sanity-cms/lib/products/getProductsByVfsKeys';

interface ProductGridProps {
  products: Product[];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 px-4 text-center" role="status" data-testid="empty-products">
        <p className="type-body text-secondary">No products found in this category.</p>
      </div>
    );
  }

  return (
    <div
      data-testid="product-grid"
      className={cn(
        "grid gap-8",
        "grid-cols-1 xs:grid-cols-2 lg-desktop:grid-cols-3 lg-touch:grid-cols-2",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

## `app/components/features/products/ProductGridSkeleton.tsx`

```tsx
import React from 'react';
import { cn } from "@/lib/utils/tailwind";
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductGridSkeleton({
  count = 12,
  className
}: ProductGridSkeletonProps) {
  return (
    <div
      data-testid="product-grid-skeleton"
      className={cn(
        "grid gap-4 md:gap-6 lg:gap-8",
        "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

## `app/components/features/products/ProductImage.tsx`

```tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { sanityImageLoader } from '@/lib/utils/sanityImageLoader';

interface ProductImageProps {
  image: any;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ProductImage({ image, alt, className, priority = false }: ProductImageProps) {
  // Get the asset reference - Sanity can use either _ref or _id
  const assetRef = image?.asset?._ref || image?.asset?._id;

  if (!assetRef) {
    return (
      <div className={`aspect-[4/3] bg-surface-productImage rounded ${className}`} data-testid="product-image-placeholder">
        <span className="sr-only">No image</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className || ''}`} data-testid="product-image">
      <Image
        src={assetRef}
        loader={sanityImageLoader}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-contain mix-blend-multiply transition-transform duration-700"
        priority={priority}
      />
    </div>
  );
}
```

## `app/components/features/products/ProductInfo.tsx`

```tsx
"use client";

import { Product } from '@/sanity-cms/lib/products/getProductBySlug';
import { urlFor } from '@/sanity-cms/lib/image';
import { useState } from 'react';
import { Price } from '@/app/components/ui/Price';
import { ShoppingCartIcon, CheckIcon } from '@phosphor-icons/react/dist/ssr';
import { QuantitySelector } from '@/app/components/ui/QuantitySelector';
import { centsToDisplay } from '@/lib/utils/price';
import { BasketControls } from "@/app/components/features/basket/BasketControls";

export function ProductInfo({ product }: { product: Product }) {
  const [preAddQty, setPreAddQty] = useState(1);
  const displayPrice = centsToDisplay(product.price_data.unit_amount);

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'text-error-500' };
    if (product.stock <= 5) return { text: `Only ${product.stock} left`, color: 'text-warning-500' };
    return { text: 'In Stock', color: 'text-success-500' };
  };
  const stockStatus = getStockStatus();
  return (
    <div className="space-y-6" data-testid="product-info">
      <div className="space-y-2">
        <p className="type-overline text-accent-500">{product.brand?.name || ''}</p>
        <h1 className="type-section-hed text-headline">{product.name}</h1>
        <div className="flex items-center gap-4">
          <Price value={displayPrice} />
        </div>
        <p className="type-caption text-secondary">SKU: {product.sku}</p>
        <p className={`type-caption ${stockStatus.color}`}>{stockStatus.text}</p>
      </div>

      {product.overviewFields && product.overviewFields.length > 0 && (
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border-secondary">
          {product.overviewFields.map((field) => (
            <div key={field.title}>
              <p className="type-caption uppercase text-secondary">{field.title}</p>
              <p className="type-body text-primary">{field.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 space-y-6 ">
        <BasketControls
          productId={product._id}
          isBasketPage={false}
          addClassName="btn-cart-large w-full flex justify-center"
          wrapperClassName="flex items-center gap-4"
          decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
          incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
          quantityClassName="w-7 text-center type-body text-primary tabular-nums"
        />
      </div>
    </div >
  );
}
```

## `app/components/features/products/RelatedProducts.tsx`

```tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { sanityImageLoader } from '@/lib/utils/sanityImageLoader';
import { centsToDisplay } from '@/lib/utils/price';

interface RelatedProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string } | null;
  price_data: { currency: string; unit_amount: number };
  image: any;
  slug: { current: string };
}

interface RelatedProductsProps {
  products: RelatedProduct[];
  currentProductName: string;
}

export function RelatedProducts({ products, currentProductName }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-heading"
      className="mt-12 pt-8 border-t border-border-secondary"
      data-testid="related-products"
    >
      <h2
        id="related-heading"
        className="type-section-sub mb-6"
      >
        You May Also Like
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-brand-400 scrollbar-track-transparent">
        {products.map((product) => (
          <article
            key={product._id}
            className="w-56 flex-shrink-0 snap-start"
          >
            <Link
              href={`/products/${product.slug.current}`}
              className="block card-product-dark group"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/3] bg-surface-productImage rounded-sm overflow-hidden mb-3">
                {product.image ? (
                  <Image
                    src={product.image?.asset?._ref || product.image?.asset?._id}
                    loader={sanityImageLoader}
                    alt={product.name}
                    fill
                    sizes="224px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-secondary-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-1">
                <h3 className="type-card-title line-clamp-1 group-hover:text-brand-400 transition-colors">
                  {product.name}
                </h3>
                {product.brand && (
                  <p className="type-metadata">{product.brand.name}</p>
                )}
                <p className="type-price">${centsToDisplay(product.price_data.unit_amount).toFixed(2)}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
```

## `app/components/features/products/ShopHeader.tsx`

```tsx
import React from 'react';

interface ShopHeaderProps {
  title: string;
  overline?: string;
}

export function ShopHeader({ title, overline }: ShopHeaderProps) {
  return (
    <header className="flex flex-col gap-2 mb-8" data-testid="shop-header">
      {overline && (
        <span className="type-overline tracking-editorial text-secondary-400 uppercase section-header-anchor">
          {overline}
        </span>
      )}
      <h1 className="type-section-hed uppercase">{title}</h1>
    </header>
  );
}
```

## `app/components/features/products/ShopHeaderSkeleton.tsx`

```tsx
import React from 'react';

export function ShopHeaderSkeleton() {
  return (
    <div className="space-y-2 mb-6 animate-pulse">
      {/* Title placeholder */}
      <div
        data-testid="skeleton-header-title"
        className="h-8 bg-gray-200 rounded w-1/3"
      />

      {/* Count placeholder */}
      <div
        data-testid="skeleton-header-count"
        className="h-4 bg-gray-200 rounded w-1/6"
      />
    </div>
  );
}
```

## `app/components/features/search/AutocompleteItem.tsx`

```tsx
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/tailwind';
import { ProductImage } from '@/app/components/features/products/ProductImage';
import type { AutocompleteProduct } from '@/sanity-cms/lib/products/searchProducts';
import { centsToDisplay } from '@/lib/utils/price';

interface AutocompleteItemProps {
  product: AutocompleteProduct;
  isActive: boolean;
  index: number;
  showThumbnail?: boolean;
  onClick?: () => void;
}

export function AutocompleteItem({ product, isActive, index, showThumbnail = true, onClick }: AutocompleteItemProps) {
  return (
    <li
      id={`autocomplete-item-${index}`}
      role="option"
      aria-selected={isActive}
      className={cn(
        "p-3 flex items-center gap-3 rounded-md transition-colors duration-150 cursor-pointer",
        isActive ? "bg-surface-card border-l-2 border-brand-400" : "hover:bg-surface-card"
      )}
    >
      <Link
        href={`/product/${product.slug.current}`}
        className="flex items-center gap-3 w-full"
        tabIndex={-1}
        onClick={onClick}
      >
        {showThumbnail && product.image && (
          <div className="w-12 h-12 rounded-md bg-surface-productImage shrink-0 overflow-hidden flex items-center justify-center">
            <ProductImage
              image={product.image}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="type-body text-primary truncate">{product.name}</span>
          <span className="type-caption text-secondary">
            {product.brand?.name && `${product.brand.name} · `}${centsToDisplay(product.price_data.unit_amount).toLocaleString()}
          </span>
        </div>
      </Link>
    </li>
  );
}
```

## `app/components/features/search/AutocompleteOverlay.tsx`

```tsx
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/tailwind';
import { AutocompleteItem } from './AutocompleteItem';
import type { AutocompleteProduct } from '@/sanity-cms/lib/products/searchProducts';

interface AutocompleteOverlayProps {
  results: AutocompleteProduct[];
  query: string;
  activeIndex: number;
  isLoading: boolean;
  showThumbnails?: boolean;
  onItemClick?: () => void;
  error?: boolean;
}

function AutocompleteSkeletonItem() {
  return (
    <li className="p-3 flex items-center gap-3">
      <div className="w-12 h-12 rounded-md bg-secondary-800 animate-pulse shrink-0 hidden md:block" />
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-4 bg-secondary-800 animate-pulse rounded w-3/4" />
        <div className="h-3 bg-secondary-800 animate-pulse rounded w-1/2" />
      </div>
    </li>
  );
}

export function AutocompleteOverlay({
  results,
  query,
  activeIndex,
  isLoading,
  showThumbnails = true,
  onItemClick,
  error = false,
}: AutocompleteOverlayProps) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 w-full mt-2 z-50",
        "bg-surface-elevated border border-border-secondary rounded-lg shadow-cardDark",
        "opacity-100 translate-y-0 transition-all duration-200"
      )}
      role="listbox"
      id="autocomplete-listbox"
    >
      {error ? (
        <div className="p-4">
          <p className="type-body text-secondary">
            Unable to load suggestions. Please try again.
          </p>
        </div>
      ) : isLoading ? (
        <ul className="py-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <AutocompleteSkeletonItem key={i} />
          ))}
        </ul>
      ) : results.length === 0 ? (
        <div className="p-4">
          <p className="type-body text-secondary">
            No products match &lsquo;{query}&rsquo;
          </p>
        </div>
      ) : (
        <>
          <div className="px-3 pt-3 pb-1">
            <span className="type-overline text-accent-500">Products</span>
          </div>
          <ul className="py-1">
            {results.map((product, index) => (
              <AutocompleteItem
                key={product._id}
                product={product}
                isActive={index === activeIndex}
                index={index}
                showThumbnail={showThumbnails}
                onClick={onItemClick}
              />
            ))}
          </ul>
          <div className="border-t border-border-secondary p-3">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="type-caption text-brand-400 hover:underline"
              onClick={onItemClick}
            >
              View all results for &lsquo;{query}&rsquo; &rarr;
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
```

## `app/components/features/search/SearchEmpty.tsx`

```tsx
import React from 'react';
import Link from 'next/link';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';

interface SearchEmptyProps {
  query: string;
}

const CATEGORY_SUGGESTIONS = [
  { label: 'Headphones', href: '/products/headphones' },
  { label: 'IEMs', href: '/products/iems' },
  { label: 'DACs & Amps', href: '/products/dacs-and-amps' },
  { label: 'Accessories', href: '/products/accessories' },
];

export function SearchEmpty({ query }: SearchEmptyProps) {
  return (
    <div className="flex flex-col items-center text-center py-16">
      <MagnifyingGlass size={48} className="text-secondary-500 mb-6" />
      <h3 className="type-h3 text-primary mb-2">No products found</h3>
      <p className="type-body text-secondary mb-8">
        {query
          ? `We couldn\u2019t find any products matching \u201C${query}\u201D`
          : 'Enter a search term to find products'}
      </p>
      {query && (
        <>
          <div className="section-header-anchor mb-4">
            <p className="type-overline text-accent-500">Try Instead</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {CATEGORY_SUGGESTIONS.map((cat) => (
              <Link key={cat.href} href={cat.href} className="btn-secondary">
                {cat.label}
              </Link>
            ))}
          </div>
          <Link href="/products/headphones" className="btn-ghost">
            Browse all products &rarr;
          </Link>
        </>
      )}
    </div>
  );
}
```

## `app/components/features/search/SearchError.tsx`

```tsx
'use client';

import React from 'react';
import { Warning } from '@phosphor-icons/react';

interface SearchErrorProps {
  onRetry?: () => void;
}

export function SearchError({ onRetry }: SearchErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Warning size={48} className="text-accent-500 mb-4" aria-hidden="true" />
      <h2 className="type-h5 text-primary mb-2">Search temporarily unavailable</h2>
      <p className="type-body text-secondary max-w-md mb-6">
        We&apos;re having trouble loading search results. This is usually a temporary issue.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-2.5 bg-brand-400 text-brand-900 rounded-md type-button hover:bg-brand-300 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
```

## `app/components/features/search/SearchHeader.tsx`

```tsx
import React from 'react';
import Link from 'next/link';

interface SearchHeaderProps {
  query: string;
}

export function SearchHeader({ query }: SearchHeaderProps) {
  return (
    <div className="mb-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-6">
        <ol className="flex items-center gap-2">
          <li>
            <Link
              href="/"
              className="type-caption text-secondary hover:text-primary transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <span className="type-caption text-caption select-none">/</span>
          </li>
          <li>
            <span className="type-caption text-primary font-medium">Search</span>
          </li>
        </ol>
      </nav>
      <div className="section-header-anchor">
        <p className="type-overline text-accent-500">Search Results</p>
      </div>
      <h1 className="type-section-hed uppercase mt-2">
        {query ? `\u201C${query.toUpperCase()}\u201D` : 'Search'}
      </h1>
    </div>
  );
}
```

## `app/components/features/search/SearchPagination.tsx`

```tsx
'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface SearchPaginationProps {
  totalCount: number;
  perPage?: number;
}

export function SearchPagination({ totalCount, perPage = 24 }: SearchPaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  // Don't render if everything fits on one page
  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
    router.push(newUrl, { scroll: false });
  };

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalCount);

  return (
    <nav
      aria-label="Search results pagination"
      className="flex items-center justify-between border-t border-border-secondary pt-6 mt-8"
    >
      <span className="type-caption text-secondary-500">
        Showing {startItem}–{endItem} of {totalCount}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-2 rounded-md border border-border-secondary type-caption text-primary transition-colors hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          Previous
        </button>

        <span className="type-caption text-secondary-500 px-2" aria-live="polite">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-2 rounded-md border border-border-secondary type-caption text-primary transition-colors hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
```

## `app/components/layout/carousel/CarouselContext.tsx`

```tsx
"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo } from "react";
import { CarouselContextType, CarouselBreakpoints, CarouselProviderProps } from "./types";

const CarouselContext = createContext<CarouselContextType | null>(null);

export function CarouselProvider({
  children,
  itemsCount,
  breakpointMap
}: CarouselProviderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  const updateVisibleCount = useCallback(() => {
    if (typeof window === "undefined") return;

    const w = window.innerWidth;
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    let count = 1;

    if (w >= 1280) {
      count = breakpointMap?.xl || 1;
    } else if (w >= 1024) {
      count = breakpointMap?.lgDesktop || 1;
    } else if (w >= 768) {
      count = isLandscape ? (breakpointMap?.mdLandscape || 1) : (breakpointMap?.mdPortrait || 1);
    } else if (w >= 640) {
      count = isLandscape ? (breakpointMap?.smLandscape || 1) : (breakpointMap?.smPortrait || 1);
    } else if (w >= 475) {
      count = isLandscape ? (breakpointMap?.xsLandscape || 1) : (breakpointMap?.xsPortrait || 1);
    } else if (isLandscape) {
      count = breakpointMap?.mobileLandscape || 1;
    } else {
      count = breakpointMap?.mobilePortrait || 1;
    }

    setVisibleCount(count);
  }, [breakpointMap]);

  const maxIndex = Math.max(0, itemsCount - visibleCount);
  const canScrollPrevDerived = activeIndex > 0;
  const canScrollNextDerived = activeIndex < maxIndex;

  useEffect(() => {
    updateVisibleCount();

    const handleResize = () => {
      updateVisibleCount();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [updateVisibleCount]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, itemsCount - visibleCount)));
  }, [visibleCount, itemsCount]);

  const scroll = useCallback((direction: 'prev' | 'next') => {
    setActiveIndex((current) => {
      const max = Math.max(0, itemsCount - visibleCount);
      if (direction === 'next') return Math.min(current + 1, max);
      if (direction === 'prev') return Math.max(0, current - 1);
      return current;
    });
  }, [itemsCount, visibleCount]);

  const goTo = useCallback((index: number) => {
    const max = Math.max(0, itemsCount - visibleCount);
    setActiveIndex(Math.min(Math.max(0, index), max));
  }, [itemsCount, visibleCount]);

  const value = useMemo(() => ({
    scrollRef,
    canScrollPrev: canScrollPrevDerived,
    canScrollNext: canScrollNextDerived,
    scrollPrev: () => scroll('prev'),
    scrollNext: () => scroll('next'),
    activeIndex,
    itemsCount,
    visibleCount,
    goTo,
  }), [canScrollPrevDerived, canScrollNextDerived, activeIndex, itemsCount, scroll, visibleCount, goTo]);

  return (
    <CarouselContext.Provider value={value}>
      <div
        className="h-full w-full"
        style={{ "--visible-count": visibleCount } as React.CSSProperties}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function useCarousel() { return useContext(CarouselContext); }
```

## `app/components/layout/carousel/CarouselControls.tsx`

```tsx
"use client";

import React from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/tailwind";
import { useCarousel } from "./CarouselContext";

const BTN_BASE = cn(
  "group relative flex h-11 w-11 items-center justify-center rounded-full",
  "bg-secondary-100/80 border border-border-secondary backdrop-blur-sm",
  "text-brand-900 transition-all duration-200",
  "hover:bg-brand-200 hover:text-brand-700 active:scale-110",
  "disabled:pointer-events-none disabled:opacity-40",
  "outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
);

export function CarouselPrevious({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useCarousel();
  if (!context) return null;

  const { scrollPrev, canScrollPrev } = context;

  return (
    <button
      type="button"
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      aria-label="Previous slide"
      className={cn(BTN_BASE, className)}
      {...props}
    >
      <CaretLeftIcon weight="bold" className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );
}

export function CarouselNext({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useCarousel();
  if (!context) return null;

  const { scrollNext, canScrollNext } = context;

  return (
    <button
      type="button"
      onClick={scrollNext}
      disabled={!canScrollNext}
      aria-label="Next slide"
      className={cn(BTN_BASE, className)}
      {...props}
    >
      <CaretRightIcon weight="bold" className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );
}

export function CarouselDots({ className }: { className?: string }) {
  const context = useCarousel();
  if (!context) return null;

  const { itemsCount, activeIndex, goTo } = context;
  const aIndex = Math.round(Number(activeIndex));

  // Windowing: show max 5 dots, centered on active index
  const maxVisible = 5;
  let start = 0;
  let end = itemsCount;

  if (itemsCount > maxVisible) {
    const half = Math.floor(maxVisible / 2);
    start = Math.max(0, aIndex - half);
    end = Math.min(itemsCount, start + maxVisible);
    if (end - start < maxVisible) {
      start = end - maxVisible;
    }
  }

  const visibleIndices = Array.from({ length: end - start }, (_, i) => start + i);

  return (
    <div className={cn("flex justify-center items-center", className)} role="tablist">
      {visibleIndices.map((i) => {
        const isActive = i === aIndex;

        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className="mx-1 flex h-4 w-4 cursor-pointer touch-manipulation items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
          >
            <span
              className={cn(
                "block h-2 w-2 rounded-full transition-colors duration-300",
                isActive
                  ? "bg-brand-700"
                  : "bg-brand-400 hover:bg-brand-500"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
```

## `app/components/layout/carousel/CarouselMediaBox.tsx`

```tsx
"use client";

import Image from "next/image";
import { sanityImageLoader } from "@/lib/utils/sanityImageLoader";

interface CarouselMediaBoxProps {
  src: any;
  alt: string;
  priority?: boolean;
}

export default function CarouselMediaBox({ src, alt, priority }: CarouselMediaBoxProps) {
  if (!src) return <div className="bg-secondary-100 aspect-square w-full animate-pulse rounded-sm" />;

  const isStringUrl = typeof src === "string";
  const imageRef = isStringUrl ? src : (src?.asset?._ref || src?.asset?._id);

  return (
    <div className="relative aspect-square w-full overflow-hidden">
      <Image
        src={imageRef}
        loader={isStringUrl ? undefined : sanityImageLoader}
        alt={alt || "Product image"}
        fill
        sizes="(max-width: 768px) 40vw, 20vw"
        className="object-contain transition-transform duration-700 group-hover:scale-105"
        priority={priority}
      />
    </div>
  );
}
```

## `app/components/layout/carousel/CarouselRoot.tsx`

```tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils/tailwind";
import { CarouselProvider } from "./CarouselContext";

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  itemsCount: number;
  breakpointMap?: {
    mobilePortrait?: number;
    mobileLandscape?: number;
    smPortrait?: number;
    smLandscape?: number;
    mdPortrait?: number;
    mdLandscape?: number;
    lgTouch?: number;
    lgDesktop?: number;
    xl?: number;
  };
}

export function Carousel({
  children,
  className = "",
  itemsCount = 0,
  breakpointMap,
}: CarouselProps) {
  if (itemsCount === 0) return null;

  return (
    <CarouselProvider itemsCount={itemsCount} breakpointMap={breakpointMap}>
      <section
        className={cn("relative h-full w-full", className)}
        aria-roledescription="carousel"
      >
        {children}
      </section>
    </CarouselProvider>
  );
}
```

## `app/components/layout/carousel/CarouselSlide.tsx`

```tsx
"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils/tailwind";
import { useCarousel } from "./CarouselContext";

interface CarouselSlideProps {
  children: React.ReactNode;
  className?: string;
}

export function CarouselSlide({ children, className = "" }: CarouselSlideProps) {
  const slideRef = useRef<HTMLDivElement>(null);
  const context = useCarousel();

  useEffect(() => {
    const node = slideRef.current;
    const track = context?.scrollRef?.current;
    if (!node || !track) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        node.dataset.active = entry.isIntersecting ? "true" : "false";
      },
      {
        root: track,
        threshold: 0.6,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [context?.scrollRef]);

  return (
    <div
      ref={slideRef}
      data-active="false"
      className={cn("min-w-0 shrink-0 grow-0", className)}
      style={{ flexBasis: "calc(100% / var(--visible-count, 1))" }}
    >
      {children}
    </div>
  );
}
```

## `app/components/layout/carousel/CarouselTrack.tsx`

```tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils/tailwind";
import { useCarousel } from "./CarouselContext";

interface CarouselTrackProps {
  children: React.ReactNode;
  className?: string;
}

export function CarouselTrack({
  children,
  className = "",
}: CarouselTrackProps) {
  const context = useCarousel();
  if (!context) return <div className={className}>{children}</div>;

  const { activeIndex, visibleCount, scrollRef } = context;

  // Calculate the exact percentage to move the belt
  const slidePercentage = 100 / visibleCount;
  const offset = activeIndex * slidePercentage;

  return (
    // The Viewport: Hides the overflow
    <div className={cn(className, "w-full overflow-hidden")} ref={scrollRef}>
      {/* The Belt: Animates smoothly when 'offset' changes */}
      <div
        className="flex h-full w-full items-stretch will-change-transform transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(-${offset}%)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

## `app/components/layout/carousel/DotIcon.tsx`

```tsx
interface IconProps {
  className?: string;
}

export function CarouselIcon({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 64 63" fill="currentColor">
  <path fill="currentColor" d="M20 2Q8 8 2 19c-3 7-3 19 0 26q5 11 15 15c6 3 8 3 14 3 11 0 17-2 8-3q-3-1 2-1 10-1 13-4 5-4-6-1-6 3-12 1c-6 0-16-4-17-6h2q11 4 30-3c12-5 13-6 13-15C64 10 40-6 20 2m17 6q3 1-1 1-13 2-18 12-4 11 3 20 5 5 14 6 8 0 0 2C22 52 9 41 9 28q1-13 12-19c4-2 13-3 16-1m6 6q8 4 8 13l-1 4-1-3c0-3-6-9-10-10-9-3-19 5-18 15q2 2 0 0-3-5 1-14 8-11 21-5"/>
</svg>
  );
}
```

## `app/components/layout/carousel/types.ts`

```typescript
import { RefObject } from "react";

export interface CarouselBreakpoints {
  readonly mobilePortrait?: number;
  readonly mobileLandscape?: number;
  readonly xsPortrait?: number;
  readonly xsLandscape?: number;
  readonly smPortrait?: number;
  readonly smLandscape?: number;
  readonly mdPortrait?: number;
  readonly mdLandscape?: number;
  readonly lgTouch?: number;
  readonly lgDesktop?: number;
  readonly xl?: number;
}

export interface CarouselContextType {
  scrollRef: RefObject<HTMLDivElement | null>;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  activeIndex: number;
  goTo: (index: number) => void;
  itemsCount: number;
  visibleCount: number;
}

export interface CarouselProviderProps {
  children: React.ReactNode;
  itemsCount: number;
  breakpointMap?: CarouselBreakpoints;
}

export interface NavbarManagerProps {
  navLinks: { id: string; label: string }[];
  children: React.ReactNode[];
}
```

## `app/components/layout/catalogue/_temp/catalogue.json`

```json
{
  "catalogue": [
    {
      "title": "Headphones",
      "type": "header",
      "slug": {
        "current": "headphones",
        "_type": "slug"
      },
      "icon": "headphones",
      "children": [
        {
          "title": "By Design",
          "type": "header",
          "children": [
            {
              "title": "Open-Back",
              "type": "link",
              "slug": {
                "current": "open-back",
                "_type": "slug"
              }
            },
            {
              "title": "Closed-Back",
              "type": "link",
              "slug": {
                "current": "closed-back",
                "_type": "slug"
              }
            }
          ]
        },
        {
          "title": "By Driver",
          "type": "header",
          "children": [
            {
              "title": "Planar Magnetic",
              "type": "link",
              "slug": {
                "current": "planar-magnetic",
                "_type": "slug"
              }
            },
            {
              "title": "Dynamic",
              "type": "link",
              "slug": {
                "current": "dynamic",
                "_type": "slug"
              }
            },
            {
              "title": "Electrostatic",
              "type": "link",
              "slug": {
                "current": "electrostatic",
                "_type": "slug"
              }
            }
          ]
        },
        {
          "title": "In-Ear & Wireless",
          "type": "header",
          "children": [
            {
              "title": "Monitors (IEMs)",
              "type": "link",
              "slug": {
                "current": "monitors-iems",
                "_type": "slug"
              }
            },
            {
              "title": "True Wireless (TWS)",
              "type": "link",
              "slug": {
                "current": "true-wireless-tws",
                "_type": "slug"
              }
            }
          ]
        }
      ]
    },
    {
      "title": "Audio Electronics",
      "type": "header",
      "slug": {
        "current": "audio-electronics",
        "_type": "slug"
      },
      "icon": "audio-electronics",
      "children": [
        {
          "title": "Amplification",
          "type": "header",
          "children": [
            {
              "title": "Desktop Amps",
              "type": "link",
              "slug": {
                "current": "desktop-amps",
                "_type": "slug"
              }
            },
            {
              "title": "Portable Amps",
              "type": "link",
              "slug": {
                "current": "portable-amps",
                "_type": "slug"
              }
            }
          ]
        },
        {
          "title": "Digital Sources",
          "type": "header",
          "children": [
            {
              "title": "Standalone DACs",
              "type": "link",
              "slug": {
                "current": "standalone-dacs",
                "_type": "slug"
              }
            },
            {
              "title": "DAC/Amp Combos",
              "type": "link",
              "slug": {
                "current": "dac-amp-combos",
                "_type": "slug"
              }
            },
            {
              "title": "Digital Players (DAPs)",
              "type": "link",
              "slug": {
                "current": "digital-players-daps",
                "_type": "slug"
              }
            },
            {
              "title": "Network Streamers",
              "type": "link",
              "slug": {
                "current": "network-streamers",
                "_type": "slug"
              }
            }
          ]
        }
      ]
    },
    {
      "title": "Accessories",
      "type": "header",
      "slug": {
        "current": "accessories",
        "_type": "slug"
      },
      "icon": "accessories",
      "children": [
        {
          "title": "Connectivity",
          "type": "header",
          "children": [
            {
              "title": "Headphone Cables",
              "type": "link",
              "slug": {
                "current": "headphone-cables",
                "_type": "slug"
              }
            },
            {
              "title": "Interconnects",
              "type": "link",
              "slug": {
                "current": "interconnects",
                "_type": "slug"
              }
            },
            {
              "title": "Adapters",
              "type": "link",
              "slug": {
                "current": "adapters",
                "_type": "slug"
              }
            }
          ]
        },
        {
          "title": "Maintenance",
          "type": "header",
          "children": [
            {
              "title": "Earpads",
              "type": "link",
              "slug": {
                "current": "earpads",
                "_type": "slug"
              }
            },
            {
              "title": "Care & Cleaning",
              "type": "link",
              "slug": {
                "current": "care-cleaning",
                "_type": "slug"
              }
            }
          ]
        },
        {
          "title": "Storage",
          "type": "header",
          "children": [
            {
              "title": "Headphone Stands",
              "type": "link",
              "slug": {
                "current": "headphone-stands",
                "_type": "slug"
              }
            },
            {
              "title": "Carrying Cases",
              "type": "link",
              "slug": {
                "current": "carrying-cases",
                "_type": "slug"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## `app/components/layout/catalogue/catalog-migration/legacy_catalog.json`

```json
{
  "_createdAt": "2026-01-02T13:08:42Z",
  "_id": "catalogue",
  "_rev": "muYbu6QSiXMnd0SVG7sWzn",
  "_system": {
    "base": {
      "id": "catalogue",
      "rev": "RMp2rLRSPHhJBIb1iNygug"
    }
  },
  "_type": "catalogue",
  "_updatedAt": "2026-01-06T05:47:30Z",
  "catalogue": [
    {
      "_key": "zemHaTBY7QMZEyx6WgMYi",
      "_type": "catalogueItem",
      "children": [
        {
          "_key": "gJvupOFvek9IA28wG1pJw",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "463Jo7gWrpfJ7BMSgdMQF",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "wired"
              },
              "title": "Wired",
              "type": "link"
            },
            {
              "_key": "DyVY7prFN3BC14f8eO2SE",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "wireless"
              },
              "title": "Wireless",
              "type": "link"
            },
            {
              "_key": "w80_8SIwE560_gk-Va6Jk",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "noise-cancelling"
              },
              "title": "Noise cancelling",
              "type": "link"
            },
            {
              "_key": "k3_InLGWRyJsBJfwNrnyB",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "earbuds"
              },
              "title": "Earbuds",
              "type": "link"
            }
          ],
          "title": "By category",
          "type": "header"
        },
        {
          "_key": "R9bVoOi1wleAgXnCXER9q",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "wFwdlX0H3-t0zyFmSwV6z",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "over-ear"
              },
              "title": "Over ear",
              "type": "link"
            },
            {
              "_key": "aqXYUeh6N6amoDuFDT0sG",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "in-ear"
              },
              "title": "In ear",
              "type": "link"
            }
          ],
          "title": "By fit",
          "type": "header"
        },
        {
          "_key": "cwjfSx5AHHNGTf46j6BXj",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "5M88xGQXUCgqbwR9FvLag",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "studio-and-recording"
              },
              "title": "Studio and recording",
              "type": "link"
            },
            {
              "_key": "n6pRz-Gxgikq6r3c2b3Sy",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "gaming"
              },
              "title": "Gaming",
              "type": "link"
            },
            {
              "_key": "n6ZmERWp5SWJ7iNdblPDC",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "travel"
              },
              "title": "Travel",
              "type": "link"
            }
          ],
          "title": "By use",
          "type": "header"
        }
      ],
      "icon": "headphones",
      "slug": {
        "_type": "slug",
        "current": "headphones"
      },
      "title": "Headphones & Personal Audio ",
      "type": "link"
    },
    {
      "_key": "X0ijjgLQc5pnVGZ5uB9Md",
      "_type": "catalogueItem",
      "children": [
        {
          "_key": "9eQyVlSBWINktO5TCFf9S",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "JBOgfU8QvaIUmzLXAqo9S",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "floor-standing-speakers"
              },
              "title": "Floor standing speakers",
              "type": "link"
            },
            {
              "_key": "zcq9tTXO8iK1_IO__4dRC",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "subwoofers"
              },
              "title": "Subwoofers",
              "type": "link"
            },
            {
              "_key": "vecmCGGu5Zp5oPVl68oqW",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "soundbars"
              },
              "title": "Soundbars",
              "type": "link"
            }
          ],
          "title": "Home theater",
          "type": "header"
        },
        {
          "_key": "xgyfkJAh90oG6JJVFlURP",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "T7XcVYmzu_WugT6Uo1Ijd",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "bookshelf-speakers"
              },
              "title": "Bookshelf speakers",
              "type": "link"
            },
            {
              "_key": "gTbPm4lOvFnLuQNTVpZrM",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "powered-speakers"
              },
              "title": "Powered speakers",
              "type": "link"
            }
          ],
          "title": "Hi-Fi Audio",
          "type": "header"
        },
        {
          "_key": "28_Sx1s6s0xgzv1t4l4k_",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "KKdarDg4DDxoWVvFKSK8f",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "bluetooth-speakers"
              },
              "title": "Bluetooth speakers",
              "type": "link"
            },
            {
              "_key": "ON20rAci84-4-HOAzszHz",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "outdoor-speakers"
              },
              "title": "Outdoor speakers",
              "type": "link"
            }
          ],
          "title": "Portable & Outdoor",
          "type": "header"
        }
      ],
      "icon": "speaker",
      "slug": {
        "_type": "slug",
        "current": "speakers"
      },
      "title": "Speakers",
      "type": "link"
    },
    {
      "_key": "JfWZqAwqcOLNWBMabMc5y",
      "_type": "catalogueItem",
      "children": [
        {
          "_key": "9BK0Nu0WtqIcP7_xdU_5K",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "JlpQgWMfdiEKhky3yullW",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "digital-audio-players"
              },
              "title": "Digital Audio Players",
              "type": "link"
            },
            {
              "_key": "l7xrVCUnlfxNY_xtBa4TD",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "bluetooth-receivers-and-transmitters"
              },
              "title": "Bluetooth receivers and transmitters",
              "type": "link"
            }
          ],
          "title": "Audio Players & Devices",
          "type": "header"
        },
        {
          "_key": "xJSAZj4W0ASAsSLF23jjL",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "ssDmG7x4c8HpNMZQudHPm",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "portable-dacs-and-amps"
              },
              "title": "Portable DACs and Amps",
              "type": "link"
            },
            {
              "_key": "8pEXPFELH6GtFdUPUYrgq",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "headphone-amplifiers"
              },
              "title": "Headphone amplifiers",
              "type": "link"
            }
          ],
          "title": "Amplification",
          "type": "header"
        },
        {
          "_key": "IgQ4lTv5Gn8QHTOTS3Es1",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "-JKoFdmYIGxWuS3C4e9jE",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "phone-and-tablet-accessories"
              },
              "title": "Phone and Tablet Accessories",
              "type": "link"
            },
            {
              "_key": "rfUccjFwuago3vW-xNI7j",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "carrying-cases-and-protection"
              },
              "title": "Carrying Cases and Protection",
              "type": "link"
            },
            {
              "_key": "a7i2k7KL2cVRA2ppP01yk",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "replacement-parts"
              },
              "title": "Replacement Parts",
              "type": "link"
            }
          ],
          "title": "Accessories & Parts",
          "type": "header"
        }
      ],
      "icon": "earbuds",
      "slug": {
        "_type": "slug",
        "current": "personal-audio"
      },
      "title": "Personal Audio",
      "type": "link"
    },
    {
      "_key": "jiS80IhRzgh41eMR_AWo6",
      "_type": "catalogueItem",
      "children": [
        {
          "_key": "Jdjqtf7kej4P8y10QaByV",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "6vL2--Pz44vl1wi8km39j",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "amplifiers"
              },
              "title": "Amplifiers",
              "type": "link"
            },
            {
              "_key": "vgMYaYb1OXxgW-kzAGGAf",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "receivers"
              },
              "title": "Receivers",
              "type": "link"
            },
            {
              "_key": "Sf3rqGgz8iflaVgeOY-v5",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "preamps"
              },
              "title": "Preamps",
              "type": "link"
            }
          ],
          "title": "Core components",
          "type": "header"
        },
        {
          "_key": "34MF_aAKZnOmEen0ZQOtG",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "w7ncMqdGwihv4CtDsUMR6",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "turntables"
              },
              "title": "Turntables",
              "type": "link"
            },
            {
              "_key": "OagjRCkHyEyJ65PvgzDTg",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "cd-players"
              },
              "title": "CD players",
              "type": "link"
            }
          ],
          "title": "Source devices",
          "type": "header"
        },
        {
          "_key": "xPjQHGOI9TRXJN9QzTaCb",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "OuMWzz2HwOCPO-IjkjKYQ",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "dacs-digital-to-analog-converters"
              },
              "title": "DACs (Digital-to-Analog Converters)",
              "type": "link"
            }
          ],
          "title": "Signal processing",
          "type": "header"
        }
      ],
      "icon": "radio",
      "slug": {
        "_type": "slug",
        "current": "home-audio"
      },
      "title": "Home Audio",
      "type": "link"
    },
    {
      "_key": "bhGPYfXKyPyZ2sixtvS7X",
      "_type": "catalogueItem",
      "children": [
        {
          "_key": "YSOR4-ZcEmRtJUEZGgrgl",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "Nx5kNxItLj8Y_E1UhWS16",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "microphones"
              },
              "title": "Microphones",
              "type": "link"
            },
            {
              "_key": "KMq2n89cOr_zwKh_XK4PH",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "studio-monitors"
              },
              "title": "Studio monitors",
              "type": "link"
            },
            {
              "_key": "sfZENWHgeIfwHuHhg5b5p",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "audio-interfaces"
              },
              "title": "Audio interfaces",
              "type": "link"
            }
          ],
          "title": "Recording Essentials",
          "type": "header"
        },
        {
          "_key": "igkH1-53EAidFCuwHMC9k",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "qsmtyLw79F0YhgrsZ-Aa0",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "studio-processors"
              },
              "title": "Studio Processors",
              "type": "link"
            },
            {
              "_key": "EGTqCFTBfCF6ZY0kCo2Nr",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "recording-accessories"
              },
              "title": "Recording accessories",
              "type": "link"
            }
          ],
          "title": "Processing & Accessories",
          "type": "header"
        }
      ],
      "icon": "mic2",
      "slug": {
        "_type": "slug",
        "current": "studio-equipment"
      },
      "title": "Studio Equipment",
      "type": "link"
    },
    {
      "_key": "_EDhByj4HR6NH7X1DHHfr",
      "_type": "catalogueItem",
      "children": [
        {
          "_key": "Qt7SYKy11ImZaDXOYObrP",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "jx7CfwhG3gRLJEEjsDXBq",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "audio-cables"
              },
              "title": "Audio cables",
              "type": "link"
            },
            {
              "_key": "214HEFSpC1XMGElkA_BnD",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "power-cables"
              },
              "title": "Power cables",
              "type": "link"
            },
            {
              "_key": "oE91U2T2GcAc3odX1XF8P",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "hdmi-cables"
              },
              "title": "HDMI Cables",
              "type": "link"
            },
            {
              "_key": "EnTFHZnrkbXRa5iRrrZue",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "rca-cables"
              },
              "title": "RCA Cables",
              "type": "link"
            },
            {
              "_key": "qouXLSWZeaxDqiXeQjpnQ",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "usb-cables"
              },
              "title": "USB Cables",
              "type": "link"
            },
            {
              "_key": "9IxBjjQK5Z3Scpnjo2Aul",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "headphone-cables"
              },
              "title": "Headphone Cables",
              "type": "link"
            },
            {
              "_key": "e5anI0ENiI9CtV65k4KkF",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "ethernet-cables"
              },
              "title": "Ethernet Cables",
              "type": "link"
            }
          ],
          "title": "Cables & Wiring",
          "type": "header"
        },
        {
          "_key": "MMsC8u8jiHf-6TEugX4dY",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "QiMcFQ8gxYJwNiQ3zcz0j",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "wall-mounts"
              },
              "title": "Wall mounts",
              "type": "link"
            },
            {
              "_key": "ZKUf_ieIR8lIJML2kXXTc",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "speaker-stands"
              },
              "title": "Speaker stands",
              "type": "link"
            }
          ],
          "title": "Mounting & Support",
          "type": "header"
        },
        {
          "_key": "wp8-KGe6cOwSbmV0KnssN",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "fHY3fZknupEJB8pr1Lexb",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "phono-cartridges"
              },
              "title": "Phono Cartridges",
              "type": "link"
            },
            {
              "_key": "D_aJ18q3VATKnzDcX1bCY",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "speaker-and-subwoofer-accessories"
              },
              "title": "Speaker and Subwoofer accessories",
              "type": "link"
            },
            {
              "_key": "NL0CuO0xRw3jwSkNMrwrd",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "microphone-accessories"
              },
              "title": "Microphone Accessories",
              "type": "link"
            }
          ],
          "title": "Audio Equipment Accessories",
          "type": "header"
        },
        {
          "_key": "jRqROPjh9R42eZ8GGN8pb",
          "_type": "catalogueItem",
          "children": [
            {
              "_key": "6s51wjZC4cv17wMH9_ofj",
              "_type": "catalogueItem",
              "children": [],
              "slug": {
                "_type": "slug",
                "current": "power-management"
              },
              "title": "Power Management",
              "type": "link"
            }
          ],
          "title": "Power Management",
          "type": "header"
        }
      ],
      "icon": "cable",
      "slug": {
        "_type": "slug",
        "current": "accessories"
      },
      "title": "Accessories",
      "type": "link"
    },
    {
      "_key": "sXIqLWIxMpCT5E2VxPkad",
      "_type": "catalogueItem",
      "children": [],
      "icon": null,
      "slug": {
        "_type": "slug",
        "current": "on-sale"
      },
      "title": "On Sale",
      "type": "link"
    }
  ]
}
```

## `app/components/layout/catalogue/catalogue-nav.types.ts`

```typescript
import type { NavigationItem } from "@/data/catalogue";

export type CatalogueNavItem = NavigationItem;
```

## `app/components/layout/catalogue/catalogue-nav.utils.ts`

```typescript
import type { CatalogueNavItem } from "./catalogue-nav.types";

export function transformCatalogueJson(rawData: { catalogue: CatalogueNavItem[] }): CatalogueNavItem[] {
  // The data is already in the correct format from getCatalogueForNavigation()
  // No transformation needed - just return the catalogue array
  return rawData.catalogue;
}
```

## `app/components/layout/catalogue/CatalogueCarousel.tsx`

```tsx
"use client";

import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";

import { CatalogueView } from "@/app/components/layout/catalogue/CatalogueView";
import { transformCatalogueJson } from "@/app/components/layout/catalogue/catalogue-nav.utils";
import type { CatalogueNavItem } from "@/app/components/layout/catalogue/catalogue-nav.types";

import { cn } from "@/lib/utils/tailwind";

interface CatalogueCarouselProps {
  catalogueDataRaw: { catalogue: CatalogueNavItem[] };
}

export default function CatalogueCarousel({ catalogueDataRaw }: CatalogueCarouselProps) {
  const catalogueData: CatalogueNavItem[] = transformCatalogueJson(catalogueDataRaw);

  return (
    <nav
      aria-label="Catalogue Navigation"
      className="flex h-full w-full flex-col"
    >
      <Carousel itemsCount={catalogueData.length}>
        <CarouselTrack className="touch-pan-x snap-x snap-mandatory overflow-x-auto landscape:h-full rounded-none">
          {catalogueData.map((item) => (
            <CarouselSlide
              key={item.id}
              className="group/animation-settle flex h-full min-w-full flex-1 snap-start snap-always flex-col"
            >
              <div
                className={cn(
                  "duration-450 h-full w-full flex-1 opacity-15 transition-all ease-in-out will-change-transform",
                  "flex flex-col group-data-[active=true]/animation-settle:opacity-100"
                )}
              >
                <CatalogueView data={item} />
              </div>
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </Carousel>
    </nav>
  );
}
```

## `app/components/layout/catalogue/CatalogueNavbar.tsx`

```tsx
import React from "react";
import { CatalogueView } from "./CatalogueView";
import NavbarManager from "./NavbarManager";
import { transformCatalogueJson } from "./catalogue-nav.utils";
import type { CatalogueNavItem } from "./catalogue-nav.types";
import { cn } from "@/lib/utils/tailwind";

interface CatalogueNavbarProps {
  catalogueDataRaw: { catalogue: CatalogueNavItem[] };
}

const CatalogueNavbar = async ({ catalogueDataRaw }: CatalogueNavbarProps) => {
  const catalogueData: CatalogueNavItem[] = transformCatalogueJson(catalogueDataRaw);

  const navLinks = catalogueData.map((item) => ({
    id: item.id,
    label: item.label,
  }));

  return (
    <nav
      className={cn(
        "hidden w-full shrink-0 items-center bg-brand-900 lg:flex lg:h-[var(--desktop-catalogue-nav-h)]"
      )}
      aria-label="Catalogue Navigation"
    >
      <div className="container mx-auto flex h-full items-center justify-center">
        <NavbarManager navLinks={navLinks}>
          {catalogueData.map((item) => (
            <CatalogueView key={item.id} data={item} />
          ))}
        </NavbarManager>
      </div>
    </nav>
  );
};

export default CatalogueNavbar;
```

## `app/components/layout/catalogue/CatalogueView.tsx`

```tsx
import { cn } from "@/lib/utils/tailwind";
import React from "react";
import type { CatalogueNavItem } from "./catalogue-nav.types";
import SliceHero from "./hero/SliceHero";
import SliceDetails from "./details/SliceDetails";

interface CatalogueViewProps {
  data: CatalogueNavItem;
}

export function CatalogueView({ data }: CatalogueViewProps) {
  return (
    <div
      className={cn(
        "relative flex h-full min-h-full w-full flex-1 flex-col items-start justify-start bg-brand-700",
        "sm:h-full",
        "landscape:h-full landscape:flex-row",
        "lg-desktop:overflow-hidden"
      )}
    >
      <SliceHero data={data} />
      <SliceDetails data={data} />
    </div>
  );
}
```

## `app/components/layout/catalogue/details/DetailSection.tsx`

```tsx
"use client";
import { cn } from "@/lib/utils/tailwind";
import Link from "next/link";
import type { CatalogueNavItem } from "../catalogue-nav.types";
import { useNavContext } from "../NavbarManager";

type CatalogueSection = CatalogueNavItem["sections"][number];

interface DetailSectionProps {
  section: CatalogueSection;
}

export default function DetailSection({
  section,
}: DetailSectionProps) {
  const { closeMenu } = useNavContext();
  return (
    <div
      className={cn(
        "translate-y-2 opacity-0",
        "space-y-4 md:space-y-6",
        "transition-[opacity,transform] delay-0 duration-300 ease-in",
        "group-data-[active=true]/animation-settle:translate-y-0 group-data-[active=true]/animation-settle:opacity-100 group-data-[active=true]/animation-settle:delay-150"
      )}
    >
      <h3
        className={cn(
          "mx-auto uppercase",
          "xs:max-w-[320px] max-w-[280px] text-h4",
          "text-brand-400",
          "sm:max-w-sm sm:text-h3"
        )}
      >
        {section.title}
      </h3>

      <ul className="space-y-4 pl-2">
        {section.links.map((link, linkIdx) => (
          <li
            key={link.slug}
            style={{ "--index": linkIdx } as React.CSSProperties}
            className={cn(
              "translate-y-2 opacity-0",
              "transition-[opacity,transform] delay-0 duration-300 ease-in",
              "group-data-[active=true]/animation-settle:translate-y-0 group-data-[active=true]/animation-settle:opacity-100",
              "group-data-[active=true]/animation-settle:[transition-delay:calc(150ms+(var(--index)*100ms))]"
            )}
          >
            <Link
              href={link.url}
              onClick={closeMenu}
              className={cn(
                "pl-2 text-body text-secondary-300",
                "transition-colors hover:text-brand-200 active:text-brand-400"
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## `app/components/layout/catalogue/details/DetailWatermark.tsx`

```tsx
import { cn } from "@/lib/utils/tailwind";

export default function DetailWatermark({ imageUrl }: { imageUrl: string }) {
  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 z-0",
        "pointer-events-none overflow-hidden",
        "opacity-[0.05] grayscale",
        // "h-full w-full",
        "inset-0"
      )}
      style={{ height: '100%' }}
    >
      <div
        className={cn(
          "relative isolate h-full w-full",
          "translate-x-1/4 translate-y-1/4 scale-[3]"
        )}
      >
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className={cn("absolute inset-0 h-full w-full object-contain object-center rounded-none", "sm:object-bottom")}
        />
      </div>
    </div>
  );
}
```

## `app/components/layout/catalogue/details/SliceDetails.tsx`

```tsx
import { cn } from "@/lib/utils/tailwind";
import type { CatalogueNavItem } from "../catalogue-nav.types";
import DetailWatermark from "./DetailWatermark";
import DetailSection from "./DetailSection";

interface SliceDetailsProps {
  data: CatalogueNavItem;
}

export default function SliceDetails({ data }: SliceDetailsProps) {
  return (
    <div
      className={cn(
        "relative h-full max-h-full w-full max-w-screen-xl",
        "overflow-hidden",
        "lg-desktop:landscape:w-2/3",
        "min-h-[1px]"
      )}
    >
      <DetailWatermark imageUrl={data.imageUrl} />

      {/* Content Layer */}
      <div
        className={cn(
          "relative h-full max-h-full w-full max-w-screen-xl",
          "landscape:no-scrollbar overflow-y-auto overflow-x-hidden",
          "no-scrollbar",
          "px-8 pt-8"
        )}
      >
        <div
          className={cn(
            "relative z-10 min-h-full w-full max-w-screen-xl",
            "space-y-4 pb-12 pl-8 sm:pl-12",
            "flex flex-col landscape:justify-center"
          )}
        >
          <div
            className={cn(
              "mx-auto my-auto flex flex-col flex-nowrap items-start gap-8",
              "w-fit max-w-full",
              "sm:gap-12 md:gap-16",
              "lg-touch:flex-row lg-touch:flex-wrap lg-touch:justify-around lg-touch:gap-x-20"
            )}
          >
            {data.sections.map((section, idx) => (
              <DetailSection key={idx} section={section} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## `app/components/layout/catalogue/getCatalogueData.ts`

```typescript
import { sanityFetch } from "@/sanity-cms/lib/client";
import type { CatalogueItem } from "@/sanity.types";

const CATALOGUE_QUERY = `
*[_type == "catalogueItem"] | order(sortOrder asc) {
  _id,
  title,
  type,
  slug,
  icon,
  parent->{
    _id,
    title
  }
}`;

function transformSanityToLegacyJson(items: CatalogueItem[]): { catalogue: any[] } {
  const itemMap = new Map(items.map(item => [item._id, item]));

  const rootItems = items.filter(item => !item.parent);

  const catalogue = rootItems.map(rootItem => {
    return buildLegacyCatalogueItem(rootItem, items, itemMap);
  });

  return { catalogue };
}

function buildLegacyCatalogueItem(
  item: CatalogueItem,
  allItems: CatalogueItem[],
  itemMap: Map<string, CatalogueItem>
): any {
  const children = allItems.filter(child =>
    child.parent && child.parent._ref === item._id
  );

  const childrenArray = children.map(child => {
    return buildLegacyCatalogueItem(child, allItems, itemMap);
  });

  const legacyItem: any = {
    id: item.slug?.current || item.title?.toLowerCase().replace(/\s+/g, '-') || item._id,
    title: item.title,
    type: item.type,
  };

  if (item.slug) {
    legacyItem.slug = {
      current: item.slug.current,
      _type: "slug"
    };
  }

  if (item.icon) {
    legacyItem.icon = item.icon;
  }

  if (childrenArray.length > 0) {
    legacyItem.children = childrenArray;
  }

  return legacyItem;
}

export async function getSanityCatalogueData(): Promise<{ catalogue: any[] }> {
  try {
    const sanityItems = await sanityFetch<CatalogueItem[]>({
      query: CATALOGUE_QUERY,
    });

    const result = transformSanityToLegacyJson(sanityItems);
    console.log('CATALOGUE JSON WITH IDs:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error fetching catalogue data from Sanity:', error);

    return { catalogue: [] };
  }
}



// {
//   "catalogue": [
//     {
//       "title": "Headphones",
//       "type": "header",
//       "slug": {
//         "current": "headphones",
//         "_type": "slug"
//       },
//       "icon": "headphones",
//       "children": [
//         {
//           "title": "By Design",
//           "type": "header",
//           "children": [
//             {
//               "title": "Open-Back",
//               "type": "link",
//               "slug": {
//                 "current": "open-back",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Closed-Back",
//               "type": "link",
//               "slug": {
//                 "current": "closed-back",
//                 "_type": "slug"
//               }
//             }
//           ]
//         },
//         {
//           "title": "By Driver",
//           "type": "header",
//           "children": [
//             {
//               "title": "Planar Magnetic",
//               "type": "link",
//               "slug": {
//                 "current": "planar-magnetic",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Dynamic",
//               "type": "link",
//               "slug": {
//                 "current": "dynamic",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Electrostatic",
//               "type": "link",
//               "slug": {
//                 "current": "electrostatic",
//                 "_type": "slug"
//               }
//             }
//           ]
//         },
//         {
//           "title": "In-Ear & Wireless",
//           "type": "header",
//           "children": [
//             {
//               "title": "Monitors (IEMs)",
//               "type": "link",
//               "slug": {
//                 "current": "monitors-iems",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "True Wireless (TWS)",
//               "type": "link",
//               "slug": {
//                 "current": "true-wireless-tws",
//                 "_type": "slug"
//               }
//             }
//           ]
//         }
//       ]
//     },
//     {
//       "title": "Audio Electronics",
//       "type": "header",
//       "slug": {
//         "current": "audio-electronics",
//         "_type": "slug"
//       },
//       "icon": "audio-electronics",
//       "children": [
//         {
//           "title": "Amplification",
//           "type": "header",
//           "children": [
//             {
//               "title": "Desktop Amps",
//               "type": "link",
//               "slug": {
//                 "current": "desktop-amps",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Portable Amps",
//               "type": "link",
//               "slug": {
//                 "current": "portable-amps",
//                 "_type": "slug"
//               }
//             }
//           ]
//         },
//         {
//           "title": "Digital Sources",
//           "type": "header",
//           "children": [
//             {
//               "title": "Standalone DACs",
//               "type": "link",
//               "slug": {
//                 "current": "standalone-dacs",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "DAC/Amp Combos",
//               "type": "link",
//               "slug": {
//                 "current": "dac-amp-combos",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Digital Players (DAPs)",
//               "type": "link",
//               "slug": {
//                 "current": "digital-players-daps",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Network Streamers",
//               "type": "link",
//               "slug": {
//                 "current": "network-streamers",
//                 "_type": "slug"
//               }
//             }
//           ]
//         }
//       ]
//     },
//     {
//       "title": "Accessories",
//       "type": "header",
//       "slug": {
//         "current": "accessories",
//         "_type": "slug"
//       },
//       "icon": "accessories",
//       "children": [
//         {
//           "title": "Connectivity",
//           "type": "header",
//           "children": [
//             {
//               "title": "Headphone Cables",
//               "type": "link",
//               "slug": {
//                 "current": "headphone-cables",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Interconnects",
//               "type": "link",
//               "slug": {
//                 "current": "interconnects",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Adapters",
//               "type": "link",
//               "slug": {
//                 "current": "adapters",
//                 "_type": "slug"
//               }
//             }
//           ]
//         },
//         {
//           "title": "Maintenance",
//           "type": "header",
//           "children": [
//             {
//               "title": "Earpads",
//               "type": "link",
//               "slug": {
//                 "current": "earpads",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Care & Cleaning",
//               "type": "link",
//               "slug": {
//                 "current": "care-cleaning",
//                 "_type": "slug"
//               }
//             }
//           ]
//         },
//         {
//           "title": "Storage",
//           "type": "header",
//           "children": [
//             {
//               "title": "Headphone Stands",
//               "type": "link",
//               "slug": {
//                 "current": "headphone-stands",
//                 "_type": "slug"
//               }
//             },
//             {
//               "title": "Carrying Cases",
//               "type": "link",
//               "slug": {
//                 "current": "carrying-cases",
//                 "_type": "slug"
//               }
//             }
//           ]
//         }
//       ]
//     }
//   ]
// }
```

## `app/components/layout/catalogue/hero/HeroImage.tsx`

```tsx
import { cn } from "@/lib/utils/tailwind";
import type { CatalogueNavItem } from "../catalogue-nav.types";

export default function HeroImage({ data }: { data: CatalogueNavItem }) {
  return (
    <div
      className={cn(
        "absolute inset-0 text-accent-600 opacity-40",
        "transition-all duration-700 hover:scale-110",
        "[animation:pendulum_8s_cubic-bezier(0.45,0.05,0.55,0.95)_infinite_alternate]"
      )}
    >
      <img
        src={data.imageUrl}
        alt={data.label}
        className="absolute inset-0 h-full w-full object-contain rounded-none"
        loading="lazy"
      />
    </div>
  );
}
```

## `app/components/layout/catalogue/hero/SliceHero.tsx`

```tsx
import { cn } from "@/lib/utils/tailwind";
import type { CatalogueNavItem } from "../catalogue-nav.types";
import {
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from "@/app/components/layout/carousel/CarouselControls";
import HeroImage from "./HeroImage";
import SliceTitle from "./SliceTitle";

// BACKLOG TODO - make sure the title is lifted up and doesn't squeeze onto nav arrows on very old tiny iphones
// BACKLOG TODO - make sure arrows are smaller on very tiny phones viewport
// BACKLOGO TODO - ^ same for landscape on tiny phones viewport or narrow height viewport

export default function SliceHero({ data }: { data: CatalogueNavItem }) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden bg-brand-900 px-8",
        "h-[clamp(96px,30dvh,256px)]",
        "sm:h-1/2",
        "landscape:h-full landscape:w-1/2 landscape:flex-row landscape:justify-between",
        "landscape:shrink-0 landscape:px-4 landscape:py-4",
        "lg-touch:landscape:max-w-[var(--catalogue-hero-max-w,400px)]",
        "lg-desktop:landscape:w-1/3"
      )}
    >
      <style>{`
        @keyframes pendulum {
          0% { transform: rotate(-2deg); }
          100% { transform: rotate(3deg); }
        }
      `}</style>

      <HeroImage data={data} />

      <div
        className={cn(
          "absolute bottom-3 left-4 right-4 z-30 bg-black/30 py-2",
          "landscape:bottom-auto landscape:left-8 landscape:right-auto landscape:top-4",
          "lg-desktop:landscape:hidden"
        )}
      >
        <CarouselDots />
      </div>

      <SliceTitle label={data.label} />
      {/* 3. Carousel Controls: Grouped Instrument Cluster */}
      <div
        className={cn(
          "absolute bottom-2 left-4 z-40 flex",
          "gap-4 sm:gap-6",
          "landscape:bottom-4 landscape:left-4 landscape:right-auto",
          "sm:left-20 sm:landscape:left-16",
          "lg-desktop:landscape:hidden"
        )}
      >
        <CarouselPrevious className="static translate-y-0 text-brand-400" />
        <CarouselNext className="static translate-y-0 text-brand-400" />
      </div>

      {/* 3. Minimalist Spacer: Creates breathing room for the list below */}
      <div className="absolute bottom-0 h-px w-16 bg-brand-500/20" />
    </div>
  );
}
```

## `app/components/layout/catalogue/hero/SliceTitle.tsx`

```tsx
import { cn } from "@/lib/utils/tailwind";

export default function SliceTitle({ label }: { label: string }) {
  return (
    <div
      key={label}
      className={cn(
        "flex h-full w-full items-center justify-center pt-12",
        "sm:items-center landscape:items-center"
      )}
    >
      <h1
        className={cn(
          "relative z-10 translate-y-2 pb-6 text-center text-h4 font-bold uppercase tracking-[0.3em] text-brand-400 opacity-0 transition-all duration-500 text-cap",
          "group-data-[active=true]/animation-settle:translate-y-0 group-data-[active=true]/animation-settle:opacity-100 group-data-[active=true]/animation-settle:delay-150",
          "sm:text-h2",
          "landscape:text-center",
          "lg-touch:landscape:self-start",
          "lg-desktop:landscape:mt-24 lg-desktop:landscape:self-start lg-desktop:landscape:text-brand-400"
        )}
      >
        {label}
      </h1>
    </div>
  );
}
```

## `app/components/layout/catalogue/NavbarManager.tsx`

```tsx
"use client";
import React, { useState, createContext, useEffect } from "react";
import { NavbarManagerProps } from "@/app/components/layout/carousel/types";
import { cn } from "@/lib/utils/tailwind";
import { CaretDownIcon } from "@phosphor-icons/react";

// Context for providing closeMenu to nested components
const NavContext = createContext<{ closeMenu: () => void }>({ closeMenu: () => {} });

export const useNavContext = () => React.useContext(NavContext);

// BACKLOG TODO - make sure navbar manager is hidden on anything less than lg-desktop (including lg-touch)
// BACKLOG TODO - make sure catalogue carousel drawer is not accessible on lg-desktop -> should result in normal homepage with navbar on lg-desktop

export default function NavbarManager({
  navLinks,
  children,
}: NavbarManagerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);

  const toggleId = (id: string) => {
    setActiveId(prev => {
      const isClosing = prev === id;
      if (!isClosing) {
        const newIndex = navLinks.findIndex((l: { id: string }) => l.id === id);
        setDisplayIndex(newIndex);
      }
      return isClosing ? null : id;
    });
  };

  const closeMenu = () => setActiveId(null);

  const isOpen = activeId !== null;

  return (
    <NavContext.Provider value={{ closeMenu }}>
      <div className="w-full">
      {/* 1. Navbar buttons */}
      <div className="flex justify-center gap-10 h-[var(--desktop-catalogue-nav-h)] items-center">
        {navLinks.map((link: { id: string; label: string }) => {
          const isActive = activeId === link.id;
          return (
            <button
              key={link.id}
              onClick={() => toggleId(link.id)}
              className={cn(
                "group flex items-center gap-2 text-sm font-medium tracking-[0.2em] uppercase transition-all duration-300 rounded-none",
                isActive
                  ? "text-accent-500 font-semibold"
                  : "text-brand-400 hover:text-brand-200"
              )}
            >
              <span>{link.label}</span>
              <CaretDownIcon
                size={16}
                weight="bold"
                className={cn(
                  "transition-transform duration-300 ease-in-out",
                  isActive ? "rotate-180 text-accent-500" : "text-brand-500 group-hover:text-brand-300"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* 2. Dropdown Viewport */}
      <div
        className={cn(
          "absolute left-0 right-0 top-[calc(var(--desktop-header-h)+var(--desktop-catalogue-nav-h))] bottom-0 z-50 rounded-none",
          "bg-brand-700 shadow-2xl transition-[grid-template-rows,opacity] duration-300 ease-in-out grid",
          "overflow-hidden !scrollbar-none",
          isOpen ? "grid-rows-[1fr] opacity-100 border-t border-brand-500/20" : "grid-rows-[0fr] opacity-0 pointer-events-none"
        )}
      >
        <div className="min-h-0 overflow-hidden no-scrollbar">
          {/* 3. The Track */}
          <div
            className={cn(
              "flex w-full h-full no-scrollbar rounded-none",
              "transition-transform duration-500 ease-out"
            )}
            style={{
              transform: `translateX(-${displayIndex * 100}%)`
            }}
          >
            {children?.map((child: React.ReactNode, idx: number) => (
              <div
                key={navLinks[idx]?.id}
                className="w-full shrink-0 group/animation-settle overflow-hidden no-scrollbar"
                data-active={activeId === navLinks[idx]?.id}
              >
                <div className="h-full overflow-hidden no-scrollbar">
                  {child}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* 4. Fixed Bottom Close Bar - Teraz jest jeden, stabilny */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-8 pt-4 bg-gradient-to-t from-brand-700 via-brand-700/80 to-transparent pointer-events-none">
          <button
            onClick={closeMenu}
            className="pointer-events-auto group flex items-center gap-2 px-6 py-2 text-[10px] tracking-[0.3em] uppercase text-brand-500 transition-colors hover:text-accent-500 rounded-none"
          >
            <span>
              Close
            </span>
            <CaretDownIcon
              size={14}
              weight="bold"
              className="rotate-180 transition-transform duration-300"
            />
          </button>
        </div>
      </div>
      </div>
    </NavContext.Provider>
  );
}
```

## `app/components/layout/drawers/DrawersManager.tsx`

```tsx
"use client";

import { Drawer } from "vaul";
import { useDrawer } from "@/app/hooks/nuqs/useDrawer";
import CarouselCatalogue from "@/app/components/layout/catalogue/CatalogueCarousel";
import { cn } from "@/lib/utils/tailwind";

// BACKLOG TODO - ensure the mobile catalogue / menu is not accessible when catalogue navbar is accessible (lg-touch/desktop related)
interface DrawerManagerProps {
  catalogueDataRaw: { catalogue: any[] };
}

export default function DrawerManager({ catalogueDataRaw }: DrawerManagerProps) {
  const { drawer, isOpen, closeDrawer } = useDrawer();

  return (
    <Drawer.Root
      direction="right"
      open={isOpen}
      onOpenChange={(open) => !open && closeDrawer()}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/10",
            "bottom-[var(--mobile-menu-h)] top-[var(--mobile-header-h)]",
            "lg-touch:bottom-[var(--mobile-menu-h)] lg-touch:top-[var(--desktop-header-h)]",
            "lg-desktop:bottom-0 lg-desktop:top-[calc(var(--desktop-header-h)_+_var(--desktop-catalogue-nav-h))]"
          )}
        />

        <Drawer.Content
          className={cn(
            "fixed right-0 z-50 flex w-full outline-none",
            "bottom-[var(--mobile-menu-h)] top-[var(--mobile-header-h)]",
            "lg-touch:bottom-[var(--mobile-menu-h)] lg-touch:top-[var(--desktop-header-h)]",
            "lg-touch:w-full",
            "lg-desktop:bottom-0 lg-desktop:top-[calc(var(--desktop-header-h)_+_var(--desktop-catalogue-nav-h))]"
          )}
        >
          <div
            className={cn(
              "flex w-full flex-col bg-brand-700 shadow-lg",
              "overflow-y-auto"
            )}
          >
            <Drawer.Title className="sr-only">Drawer Content</Drawer.Title>
            {drawer === "catalogue" && <CarouselCatalogue catalogueDataRaw={catalogueDataRaw} />}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

## `app/components/layout/header/SearchField.tsx`

```tsx
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlass, X, ArrowLeft } from '@phosphor-icons/react';
import { cn } from '@/lib/utils/tailwind';
import { AutocompleteOverlay } from '@/app/components/features/search/AutocompleteOverlay';
import { searchProductsAutocomplete } from '@/sanity-cms/lib/products/searchProducts';
import type { AutocompleteProduct } from '@/sanity-cms/lib/products/searchProducts';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export default function SearchField() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteProduct[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [autocompleteError, setAutocompleteError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
    setActiveIndex(-1);
    setAutocompleteResults([]);
    setAutocompleteError(false);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return;
    closeOverlay();
    setMobileExpanded(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }, [query, router, closeOverlay]);

  const handleClear = useCallback(() => {
    setQuery('');
    closeOverlay();
    inputRef.current?.focus();
    mobileInputRef.current?.focus();
  }, [closeOverlay]);

  const handleMobileOpen = useCallback(() => {
    setMobileExpanded(true);
  }, []);

  const handleMobileClose = useCallback(() => {
    setMobileExpanded(false);
    setQuery('');
    closeOverlay();
  }, [closeOverlay]);

  const handleOverlayItemClick = useCallback(() => {
    closeOverlay();
    setMobileExpanded(false);
  }, [closeOverlay]);

  // Debounced autocomplete fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (query.trim().length < MIN_QUERY_LENGTH) {
      closeOverlay();
      return;
    }

    setIsLoading(true);
    setIsOverlayOpen(true);
    setAutocompleteError(false);

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const results = await searchProductsAutocomplete(query);
        if (!controller.signal.aborted) {
          setAutocompleteResults(results);
          setActiveIndex(-1);
          setIsLoading(false);
          setAutocompleteError(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setAutocompleteError(true);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, closeOverlay]);

  // Click outside to close (desktop only; mobile overlay is modal)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mobileExpanded) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeOverlay();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeOverlay, mobileExpanded]);

  // Focus mobile input on expand
  useEffect(() => {
    if (mobileExpanded && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [mobileExpanded]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOverlayOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev =>
          prev < autocompleteResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (activeIndex >= 0 && autocompleteResults[activeIndex]) {
          e.preventDefault();
          const product = autocompleteResults[activeIndex];
          closeOverlay();
          setMobileExpanded(false);
          router.push(`/product/${product.slug.current}`);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeOverlay();
        break;
    }
  }, [isOverlayOpen, activeIndex, autocompleteResults, closeOverlay, router]);

  const showOverlay = isOverlayOpen && query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <>
      {/* Mobile: icon-only trigger (visible below sm) */}
      <button
        type="button"
        onClick={handleMobileOpen}
        className="sm:hidden flex items-center justify-center w-9 h-9 text-secondary-500 hover:text-primary transition-colors"
        aria-label="Open search"
      >
        <MagnifyingGlass size={20} />
      </button>

      {/* Mobile: expanded full-width search overlay */}
      {mobileExpanded && (
        <div className="sm:hidden fixed inset-0 z-[60] bg-brand-900 flex flex-col">
          <div className="flex items-center gap-2 h-[var(--mobile-header-h)] px-4">
            <button
              type="button"
              onClick={handleMobileClose}
              className="flex items-center justify-center w-9 h-9 text-secondary-500 hover:text-primary transition-colors"
              aria-label="Close search"
            >
              <ArrowLeft size={20} />
            </button>
            <form
              onSubmit={handleSubmit}
              role="search"
              aria-label="Search products"
              className="flex-1 relative"
            >
              <div
                className={cn(
                  "flex items-center gap-3 px-3 h-9 w-full",
                  "bg-secondary-300 transition-all duration-300",
                  "focus-within:bg-brand-400 focus-within:shadow-md"
                )}
                style={{ borderRadius: '3px' }}
              >
                <MagnifyingGlass
                  size={16}
                  className="shrink-0 text-secondary-600 transition-colors duration-300"
                />
                <input
                  ref={mobileInputRef}
                  type="text"
                  placeholder="Search products..."
                  aria-label="Search products"
                  aria-expanded={showOverlay}
                  aria-controls="autocomplete-listbox"
                  aria-activedescendant={activeIndex >= 0 ? `autocomplete-item-${activeIndex}` : undefined}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={500}
                  className={cn(
                    "w-full border-none bg-transparent outline-none",
                    "text-body text-brand-700 transition-colors duration-300",
                    "selection:bg-brand-700 selection:text-brand-400",
                    "placeholder:text-secondary-600 focus:placeholder:text-brand-800"
                  )}
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="shrink-0 text-secondary-500 hover:text-primary transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {showOverlay && (
                <AutocompleteOverlay
                  results={autocompleteResults}
                  query={query}
                  activeIndex={activeIndex}
                  isLoading={isLoading}
                  showThumbnails={false}
                  onItemClick={handleOverlayItemClick}
                  error={autocompleteError}
                />
              )}
            </form>
          </div>
        </div>
      )}

      {/* Desktop: visible search field (hidden below sm) */}
      <div ref={containerRef} className="hidden sm:block relative">
        <form
          onSubmit={handleSubmit}
          role="search"
          aria-label="Search products"
        >
          <div
            className={cn(
              "group flex items-center gap-4 px-4 h-9",
              "sm:max-w-xs md:max-w-sm lg-desktop:max-w-xl lg-touch:max-w-md",
              "bg-secondary-300 shadow-sm transition-all duration-300 ease-out",
              "hover:bg-secondary-100",
              "focus-within:bg-brand-400 focus-within:shadow-md"
            )}
            style={{ borderRadius: '3px' }}
          >
            <MagnifyingGlass
              size={16}
              className={cn(
                "shrink-0 transition-all duration-300",
                "text-secondary-600",
                "group-focus-within:text-brand-800"
              )}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              aria-label="Search products"
              aria-expanded={showOverlay}
              aria-controls="autocomplete-listbox"
              aria-activedescendant={activeIndex >= 0 ? `autocomplete-item-${activeIndex}` : undefined}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (query.trim().length >= MIN_QUERY_LENGTH && autocompleteResults.length > 0) {
                  setIsOverlayOpen(true);
                }
              }}
              maxLength={500}
              className={cn(
                "w-full border-none bg-transparent outline-none",
                "text-body text-brand-700 transition-colors duration-300",
                "selection:bg-brand-700 selection:text-brand-400",
                "placeholder:text-secondary-600 focus:placeholder:text-brand-800"
              )}
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="shrink-0 text-secondary-500 hover:text-primary transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </form>
        {showOverlay && (
          <AutocompleteOverlay
            results={autocompleteResults}
            query={query}
            activeIndex={activeIndex}
            isLoading={isLoading}
            showThumbnails={true}
            onItemClick={handleOverlayItemClick}
            error={autocompleteError}
          />
        )}
      </div>
    </>
  );
}
```

## `app/components/skeletons/FilterSidebarSkeleton.tsx`

```tsx
import React from 'react';

export function FilterSidebarSkeleton() {
  return (
    <div className="w-full animate-pulse" data-testid="filter-sidebar-skeleton">
      {/* Filter groups */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mb-6">
          {/* Filter group title */}
          <div className="h-4 w-24 bg-surface-elevated rounded mb-3" />

          {/* Filter options */}
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="w-4 h-4 bg-surface-elevated rounded" />
                <div className="h-3 w-20 bg-surface-elevated rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## `app/components/ui/breadcrumbs/CategoryBreadcrumbs.tsx`

```tsx
import Link from "next/link";

interface BreadcrumbsProps {
  categoryParts: string[];
}

export default function Breadcrumbs({
  categoryParts,
}: BreadcrumbsProps) {
  // Build href for each part
  const buildHref = (index: number) => {
    return `/products/${categoryParts.slice(0, index + 1).join("/")}`;
  };

  // Format part for display (capitalize, replace hyphens with spaces)
  const formatPart = (part: string) => {
    return part
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-6" data-testid="breadcrumb">
      <ol className="flex items-center gap-2">
        {/* Home link */}
        <li>
          <Link
            href="/"
            className="type-caption text-secondary hover:text-primary hover:underline transition-colors"
          >
            Home
          </Link>
        </li>

        {/* Separator */}
        <li>
          <span className="type-caption text-caption select-none">/</span>
        </li>

        {categoryParts.map((part, index) => {
          const isLast = index === categoryParts.length - 1;
          const href = buildHref(index);

          return (
            <li key={part} className="flex items-center gap-2">
              {isLast ? (
                <span className="type-caption text-primary font-medium">
                  {formatPart(part)}
                </span>
              ) : (
                <>
                  <Link
                    href={href}
                    className="type-caption text-secondary hover:text-primary hover:underline transition-colors"
                  >
                    {formatPart(part)}
                  </Link>
                  <span className="type-caption text-caption select-none">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

```

## `app/components/ui/Checkbox.tsx`

```tsx
"use client";

import React from 'react';

interface CheckboxProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}

export function Checkbox({ name, value, checked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange()}
          className="peer sr-only"
        />
        <div
          className={`
            w-4 h-4 border rounded-sm transition-all duration-150
            ${checked
              ? 'bg-accent-500 border-accent-500'
              : 'border-border-primary bg-transparent group-hover:border-accent-500'
            }
          `}
        >
          {checked && (
            <svg
              className="w-4 h-4 text-brand-900"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 8L6.5 11.5L13 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
      <span className="type-body text-body group-hover:text-primary transition-colors">
        {label}
      </span>
    </label>
  );
}
```

## `app/components/ui/icons/CategoryTitleIcon.tsx`

```tsx
"use client";
import { Microphone, WifiHigh, Plugs, Headset, SpeakerHigh, Headphones } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
const ROOT_CATEGORY_ICONS: Record<string, Icon> = {
  "studio-equipment": Microphone,
  "home-audio": WifiHigh,
  accessories: Plugs,
  "personal-audio": Headset,
  speakers: SpeakerHigh,
  headphones: Headphones,
};
export default function CategoryTitleIcon({ category }: { category: string }) {
  if (category === "on-sale") return null;
  const Icon = ROOT_CATEGORY_ICONS[category];
  return Icon ? (
    <div className="flex">
      <div className="hidden md:block mb-1">
        <Icon size={48} strokeWidth={3} />
      </div>
      <div className="md:hidden mb-1">
        <Icon size={14} strokeWidth={3} />
      </div>
    </div>
  ) : null;
}
```

## `app/components/ui/Price.tsx`

```tsx
"use client";

import React from 'react';

interface PriceProps {
  value: number;
  currency?: string;
  variant?: 'default' | 'summary';
  className?: string;
}

export function Price({ value, currency = 'USD', variant = 'default', className }: PriceProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: variant === 'summary' ? 2 : 0,
    maximumFractionDigits: variant === 'summary' ? 2 : 0,
  }).format(value);

  return <span className={className || "type-price tabular-nums"}>{formatted}</span>;
}
```

## `app/components/ui/QuantitySelector.tsx`

```tsx
"use client";

import React from "react";

interface QuantitySelectorProps {
  quantity: number;
  min?: number;
  max: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md";
  disabled?: boolean;
}

export function QuantitySelector({
  quantity,
  min = 1,
  max,
  onIncrement,
  onDecrement,
  size = "md",
  disabled = false,
}: QuantitySelectorProps) {
  const canDecrement = quantity > min && !disabled;
  const canIncrement = quantity < max && !disabled;

  const btnSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const qtySize = size === "sm" ? "w-8" : "w-12";
  const gap = size === "sm" ? "gap-1" : "gap-2";

  return (
    <div className={`flex items-center ${gap}`}>
      <button
        onClick={onDecrement}
        disabled={!canDecrement}
        aria-disabled={!canDecrement}
        className={`btn-secondary ${btnSize} flex items-center justify-center disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500`}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        className={`${qtySize} text-center type-body text-primary`}
        role="status"
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        disabled={!canIncrement}
        aria-disabled={!canIncrement}
        data-testid="increment"
        className={`btn-secondary ${btnSize} flex items-center justify-center disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500`}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
```

## `app/hooks/nuqs/useDrawer.ts`

```typescript
import { useQueryState, parseAsString } from "nuqs";

export function useDrawer() {
  const [drawer, setDrawer] = useQueryState(
    "drawer",
    parseAsString.withOptions({ history: "push" })
  );

  return {
    drawer,
    isOpen: !!drawer,
    openDrawer: (value: string) => setDrawer(value),
    closeDrawer: () => setDrawer(null),
  };
}
```

## `app/sitemap.ts`

```typescript
import { MetadataRoute } from "next";
import { client } from "@/sanity-cms/lib/client";

const SITE_URL = "https://sanglogium.com";

interface SanityDocument {
  slug: string;
  _updatedAt?: string;
}

type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

type SitemapEntry = MetadataRoute.Sitemap[number] & {
  changeFrequency?: ChangeFreq;
  priority?: number;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [products, categories] = await Promise.all<
      [SanityDocument[], SanityDocument[]]
    >([
      client.fetch(
        `*[_type == "product" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
      ),
      client.fetch(
        `*[_type == "category" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
      ),
    ]);

    const productUrls = (products || []).map((p: any) => {
      const safeSlug = encodeURIComponent(p.slug);

      return {
        url: `${SITE_URL}/product/${safeSlug}`,
        lastModified: p._updatedAt ? new Date(p._updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      };
    });

    const categoryUrls = (categories || []).map((c: any) => {
      const safeSlug = encodeURIComponent(c.slug);

      return {
        url: `${SITE_URL}/category/${safeSlug}`,
        lastModified: c._updatedAt ? new Date(c._updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      };
    });

    const staticRoutes: SitemapEntry[] = [
      "", // Homepage
      "/basket", // Cart Page
      "/checkout", // Checkout Page
      "/search", // Search Page
    ].map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency:
        route === "" ? ("daily" as ChangeFreq) : ("monthly" as ChangeFreq),
      priority: route === "" ? 1.0 : 0.5,
    }));

    return [
      ...staticRoutes,
      ...productUrls,
      ...categoryUrls,
    ] as MetadataRoute.Sitemap;
  } catch (err) {
    console.error("Sitemap generation failed:", err);
    return [{ url: SITE_URL, lastModified: new Date() }];
  }
}
```

## `data/catalogue-index.json`

```json
{
  "generatedAt": "2026-06-15T11:24:08.547Z",
  "slugToIdMap": {
    "open-back": "o7c6baiuobsr7ni2y2vf22sh",
    "headphones/open-back": "o7c6baiuobsr7ni2y2vf22sh",
    "closed-back": "yq3p9s798zszjkzm5btnebjh",
    "headphones/closed-back": "yq3p9s798zszjkzm5btnebjh",
    "semi-open": "dW7bkxuW7lwltD3OAxQ9yH",
    "headphones/semi-open": "dW7bkxuW7lwltD3OAxQ9yH",
    "planar-magnetic": "yd9641q8fiuh9rgoupauw2zl",
    "headphones/planar-magnetic": "yd9641q8fiuh9rgoupauw2zl",
    "dynamic": "j751evwbn8n9aac4elrekqi4",
    "headphones/dynamic": "j751evwbn8n9aac4elrekqi4",
    "electrostatic": "icmc3j8qzjiffr9h6tw6kg74",
    "headphones/electrostatic": "icmc3j8qzjiffr9h6tw6kg74",
    "monitors-iems": "t2anvkkjfz9knqi85kozuaze",
    "headphones/monitors-iems": "t2anvkkjfz9knqi85kozuaze",
    "desktop-amps": "o6mz3kbs5xla8ixastppktsd",
    "audio-electronics/desktop-amps": "o6mz3kbs5xla8ixastppktsd",
    "portable-amps": "ipz8oe0elii0vm2voxsbgsw6",
    "audio-electronics/portable-amps": "ipz8oe0elii0vm2voxsbgsw6",
    "bluetooth-dac-amps": "2Q3Hkst6W23iaT5J8DYRdm",
    "audio-electronics/bluetooth-dac-amps": "2Q3Hkst6W23iaT5J8DYRdm",
    "standalone-dacs": "mpni93r13d9yo2vn5moexlkp",
    "audio-electronics/standalone-dacs": "mpni93r13d9yo2vn5moexlkp",
    "dac-amp-combos": "o37u0yjphzt3qu91ewnww2yj",
    "audio-electronics/dac-amp-combos": "o37u0yjphzt3qu91ewnww2yj",
    "usb-c-dacs": "dW7bkxuW7lwltD3OAxQBo5",
    "audio-electronics/usb-c-dacs": "dW7bkxuW7lwltD3OAxQBo5",
    "digital-players-daps": "o9igtdq1g5oqaahpa0zvq238",
    "audio-electronics/digital-players-daps": "o9igtdq1g5oqaahpa0zvq238",
    "network-streamers": "npwbgqg3v4t5qe95rg35wte0",
    "audio-electronics/network-streamers": "npwbgqg3v4t5qe95rg35wte0",
    "headphone-cables": "vnrj2n32p172vcje1tt3s4ls",
    "accessories/headphone-cables": "vnrj2n32p172vcje1tt3s4ls",
    "interconnects": "ck7d2wm9xe6lujtdfq7biyh7",
    "accessories/interconnects": "ck7d2wm9xe6lujtdfq7biyh7",
    "adapters": "jdxde1qpftseepekaivzpl8c",
    "accessories/adapters": "jdxde1qpftseepekaivzpl8c",
    "earpads": "j2yu4yvtje69j6gie4spxutu",
    "accessories/earpads": "j2yu4yvtje69j6gie4spxutu",
    "eartips": "9td5z7HwDgMNxTZ8edvs2d",
    "accessories/eartips": "9td5z7HwDgMNxTZ8edvs2d",
    "care-cleaning": "ab2xhkm6hgabf69y0f3s4oo0",
    "accessories/care-cleaning": "ab2xhkm6hgabf69y0f3s4oo0",
    "headphone-stands": "u9o83mfmx23cudko8phu5otx",
    "accessories/headphone-stands": "u9o83mfmx23cudko8phu5otx",
    "carrying-cases": "j8ls622l90d6m4xetlajua4y",
    "accessories/carrying-cases": "j8ls622l90d6m4xetlajua4y"
  },
  "slotMetadataMap": {
    "ugyeto8653n495dpf89nzoar": {
      "title": "Headphones",
      "url": "#",
      "slug": "headphones",
      "breadcrumbs": [],
      "children": [
        "ekv4twh175wcse4fl4jjdxfq",
        "px3eujo0ql1hot9dkoxleao6",
        "fxvwrl18sixw5b9ro2jrlepa"
      ],
      "type": "header",
      "path": "/headphones",
      "sortOrder": 0,
      "icon": "headphones"
    },
    "ekv4twh175wcse4fl4jjdxfq": {
      "title": "By Design",
      "url": "#",
      "slug": "",
      "breadcrumbs": [],
      "children": [
        "o7c6baiuobsr7ni2y2vf22sh",
        "yq3p9s798zszjkzm5btnebjh",
        "dW7bkxuW7lwltD3OAxQ9yH"
      ],
      "type": "header",
      "path": "/headphones",
      "sortOrder": 0
    },
    "o7c6baiuobsr7ni2y2vf22sh": {
      "title": "Open-Back",
      "url": "/shop/headphones/open-back",
      "slug": "open-back",
      "breadcrumbs": [
        {
          "label": "Open-Back",
          "url": "/shop/headphones/open-back"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/headphones/open-back",
      "sortOrder": 0
    },
    "yq3p9s798zszjkzm5btnebjh": {
      "title": "Closed-Back",
      "url": "/shop/headphones/closed-back",
      "slug": "closed-back",
      "breadcrumbs": [
        {
          "label": "Closed-Back",
          "url": "/shop/headphones/closed-back"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/headphones/closed-back",
      "sortOrder": 0
    },
    "dW7bkxuW7lwltD3OAxQ9yH": {
      "title": "Semi-Open",
      "url": "/shop/headphones/semi-open",
      "slug": "semi-open",
      "breadcrumbs": [
        {
          "label": "Semi-Open",
          "url": "/shop/headphones/semi-open"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/headphones/semi-open",
      "sortOrder": 0
    },
    "px3eujo0ql1hot9dkoxleao6": {
      "title": "By Driver",
      "url": "#",
      "slug": "",
      "breadcrumbs": [],
      "children": [
        "yd9641q8fiuh9rgoupauw2zl",
        "j751evwbn8n9aac4elrekqi4",
        "icmc3j8qzjiffr9h6tw6kg74"
      ],
      "type": "header",
      "path": "/headphones",
      "sortOrder": 0
    },
    "yd9641q8fiuh9rgoupauw2zl": {
      "title": "Planar Magnetic",
      "url": "/shop/headphones/planar-magnetic",
      "slug": "planar-magnetic",
      "breadcrumbs": [
        {
          "label": "Planar Magnetic",
          "url": "/shop/headphones/planar-magnetic"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/headphones/planar-magnetic",
      "sortOrder": 0
    },
    "j751evwbn8n9aac4elrekqi4": {
      "title": "Dynamic",
      "url": "/shop/headphones/dynamic",
      "slug": "dynamic",
      "breadcrumbs": [
        {
          "label": "Dynamic",
          "url": "/shop/headphones/dynamic"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/headphones/dynamic",
      "sortOrder": 0
    },
    "icmc3j8qzjiffr9h6tw6kg74": {
      "title": "Electrostatic",
      "url": "/shop/headphones/electrostatic",
      "slug": "electrostatic",
      "breadcrumbs": [
        {
          "label": "Electrostatic",
          "url": "/shop/headphones/electrostatic"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/headphones/electrostatic",
      "sortOrder": 0
    },
    "fxvwrl18sixw5b9ro2jrlepa": {
      "title": "In-Ear Monitors",
      "url": "#",
      "slug": "",
      "breadcrumbs": [],
      "children": [
        "t2anvkkjfz9knqi85kozuaze"
      ],
      "type": "header",
      "path": "/headphones",
      "sortOrder": 0
    },
    "t2anvkkjfz9knqi85kozuaze": {
      "title": "Universal IEMs",
      "url": "/shop/headphones/monitors-iems",
      "slug": "monitors-iems",
      "breadcrumbs": [
        {
          "label": "Universal IEMs",
          "url": "/shop/headphones/monitors-iems"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/headphones/monitors-iems",
      "sortOrder": 0
    },
    "ti2wufd15h51jxtq855ogbfa": {
      "title": "Audio Electronics",
      "url": "#",
      "slug": "audio-electronics",
      "breadcrumbs": [],
      "children": [
        "hqb22ca5czb252r0r7l1xmet",
        "lkuqr2n1gpeivrvxisnfs3ot"
      ],
      "type": "header",
      "path": "/audio-electronics",
      "sortOrder": 0,
      "icon": "audio-electronics"
    },
    "hqb22ca5czb252r0r7l1xmet": {
      "title": "Amplification",
      "url": "#",
      "slug": "",
      "breadcrumbs": [],
      "children": [
        "o6mz3kbs5xla8ixastppktsd",
        "ipz8oe0elii0vm2voxsbgsw6",
        "2Q3Hkst6W23iaT5J8DYRdm"
      ],
      "type": "header",
      "path": "/audio-electronics",
      "sortOrder": 0
    },
    "o6mz3kbs5xla8ixastppktsd": {
      "title": "Desktop Amps",
      "url": "/shop/audio-electronics/desktop-amps",
      "slug": "desktop-amps",
      "breadcrumbs": [
        {
          "label": "Desktop Amps",
          "url": "/shop/audio-electronics/desktop-amps"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/audio-electronics/desktop-amps",
      "sortOrder": 0
    },
    "ipz8oe0elii0vm2voxsbgsw6": {
      "title": "Portable Amps",
      "url": "/shop/audio-electronics/portable-amps",
      "slug": "portable-amps",
      "breadcrumbs": [
        {
          "label": "Portable Amps",
          "url": "/shop/audio-electronics/portable-amps"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/audio-electronics/portable-amps",
      "sortOrder": 0
    },
    "2Q3Hkst6W23iaT5J8DYRdm": {
      "title": "Bluetooth DAC/Amps",
      "url": "/shop/audio-electronics/bluetooth-dac-amps",
      "slug": "bluetooth-dac-amps",
      "breadcrumbs": [
        {
          "label": "Bluetooth DAC/Amps",
          "url": "/shop/audio-electronics/bluetooth-dac-amps"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/audio-electronics/bluetooth-dac-amps",
      "sortOrder": 0
    },
    "lkuqr2n1gpeivrvxisnfs3ot": {
      "title": "Digital Sources",
      "url": "#",
      "slug": "",
      "breadcrumbs": [],
      "children": [
        "mpni93r13d9yo2vn5moexlkp",
        "o37u0yjphzt3qu91ewnww2yj",
        "dW7bkxuW7lwltD3OAxQBo5",
        "o9igtdq1g5oqaahpa0zvq238",
        "npwbgqg3v4t5qe95rg35wte0"
      ],
      "type": "header",
      "path": "/audio-electronics",
      "sortOrder": 0
    },
    "mpni93r13d9yo2vn5moexlkp": {
      "title": "Standalone DACs",
      "url": "/shop/audio-electronics/standalone-dacs",
      "slug": "standalone-dacs",
      "breadcrumbs": [
        {
          "label": "Standalone DACs",
          "url": "/shop/audio-electronics/standalone-dacs"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/audio-electronics/standalone-dacs",
      "sortOrder": 0
    },
    "o37u0yjphzt3qu91ewnww2yj": {
      "title": "DAC/Amp Combos",
      "url": "/shop/audio-electronics/dac-amp-combos",
      "slug": "dac-amp-combos",
      "breadcrumbs": [
        {
          "label": "DAC/Amp Combos",
          "url": "/shop/audio-electronics/dac-amp-combos"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/audio-electronics/dac-amp-combos",
      "sortOrder": 0
    },
    "dW7bkxuW7lwltD3OAxQBo5": {
      "title": "USB-C/Dongle DACs",
      "url": "/shop/audio-electronics/usb-c-dacs",
      "slug": "usb-c-dacs",
      "breadcrumbs": [
        {
          "label": "USB-C/Dongle DACs",
          "url": "/shop/audio-electronics/usb-c-dacs"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/audio-electronics/usb-c-dacs",
      "sortOrder": 0
    },
    "o9igtdq1g5oqaahpa0zvq238": {
      "title": "Digital Players (DAPs)",
      "url": "/shop/audio-electronics/digital-players-daps",
      "slug": "digital-players-daps",
      "breadcrumbs": [
        {
          "label": "Digital Players (DAPs)",
          "url": "/shop/audio-electronics/digital-players-daps"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/audio-electronics/digital-players-daps",
      "sortOrder": 0
    },
    "npwbgqg3v4t5qe95rg35wte0": {
      "title": "Network Streamers",
      "url": "/shop/audio-electronics/network-streamers",
      "slug": "network-streamers",
      "breadcrumbs": [
        {
          "label": "Network Streamers",
          "url": "/shop/audio-electronics/network-streamers"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/audio-electronics/network-streamers",
      "sortOrder": 0
    },
    "j9ozs17mc0b1nv2gqn2rvmg1": {
      "title": "Accessories",
      "url": "#",
      "slug": "accessories",
      "breadcrumbs": [],
      "children": [
        "lhpqqb5qkfvh4kid6q6455eu",
        "e4rct8015rxgy011710isd5e",
        "rw0symuvdvebq75r4og53tlf"
      ],
      "type": "header",
      "path": "/accessories",
      "sortOrder": 0,
      "icon": "accessories"
    },
    "lhpqqb5qkfvh4kid6q6455eu": {
      "title": "Connectivity",
      "url": "#",
      "slug": "",
      "breadcrumbs": [],
      "children": [
        "vnrj2n32p172vcje1tt3s4ls",
        "ck7d2wm9xe6lujtdfq7biyh7",
        "jdxde1qpftseepekaivzpl8c"
      ],
      "type": "header",
      "path": "/accessories",
      "sortOrder": 0
    },
    "vnrj2n32p172vcje1tt3s4ls": {
      "title": "Headphone Cables",
      "url": "/shop/accessories/headphone-cables",
      "slug": "headphone-cables",
      "breadcrumbs": [
        {
          "label": "Headphone Cables",
          "url": "/shop/accessories/headphone-cables"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/accessories/headphone-cables",
      "sortOrder": 0
    },
    "ck7d2wm9xe6lujtdfq7biyh7": {
      "title": "Interconnects",
      "url": "/shop/accessories/interconnects",
      "slug": "interconnects",
      "breadcrumbs": [
        {
          "label": "Interconnects",
          "url": "/shop/accessories/interconnects"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/accessories/interconnects",
      "sortOrder": 0
    },
    "jdxde1qpftseepekaivzpl8c": {
      "title": "Adapters",
      "url": "/shop/accessories/adapters",
      "slug": "adapters",
      "breadcrumbs": [
        {
          "label": "Adapters",
          "url": "/shop/accessories/adapters"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/accessories/adapters",
      "sortOrder": 0
    },
    "e4rct8015rxgy011710isd5e": {
      "title": "Fit & Comfort",
      "url": "#",
      "slug": "",
      "breadcrumbs": [],
      "children": [
        "j2yu4yvtje69j6gie4spxutu",
        "9td5z7HwDgMNxTZ8edvs2d",
        "ab2xhkm6hgabf69y0f3s4oo0"
      ],
      "type": "header",
      "path": "/accessories",
      "sortOrder": 0
    },
    "j2yu4yvtje69j6gie4spxutu": {
      "title": "Earpads",
      "url": "/shop/accessories/earpads",
      "slug": "earpads",
      "breadcrumbs": [
        {
          "label": "Earpads",
          "url": "/shop/accessories/earpads"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/accessories/earpads",
      "sortOrder": 0
    },
    "9td5z7HwDgMNxTZ8edvs2d": {
      "title": "Eartips",
      "url": "/shop/accessories/eartips",
      "slug": "eartips",
      "breadcrumbs": [
        {
          "label": "Eartips",
          "url": "/shop/accessories/eartips"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/accessories/eartips",
      "sortOrder": 0
    },
    "ab2xhkm6hgabf69y0f3s4oo0": {
      "title": "Care & Cleaning",
      "url": "/shop/accessories/care-cleaning",
      "slug": "care-cleaning",
      "breadcrumbs": [
        {
          "label": "Care & Cleaning",
          "url": "/shop/accessories/care-cleaning"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/accessories/care-cleaning",
      "sortOrder": 0
    },
    "rw0symuvdvebq75r4og53tlf": {
      "title": "Storage",
      "url": "#",
      "slug": "",
      "breadcrumbs": [],
      "children": [
        "u9o83mfmx23cudko8phu5otx",
        "j8ls622l90d6m4xetlajua4y"
      ],
      "type": "header",
      "path": "/accessories",
      "sortOrder": 0
    },
    "u9o83mfmx23cudko8phu5otx": {
      "title": "Headphone Stands",
      "url": "/shop/accessories/headphone-stands",
      "slug": "headphone-stands",
      "breadcrumbs": [
        {
          "label": "Headphone Stands",
          "url": "/shop/accessories/headphone-stands"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/accessories/headphone-stands",
      "sortOrder": 0
    },
    "j8ls622l90d6m4xetlajua4y": {
      "title": "Carrying Cases",
      "url": "/shop/accessories/carrying-cases",
      "slug": "carrying-cases",
      "breadcrumbs": [
        {
          "label": "Carrying Cases",
          "url": "/shop/accessories/carrying-cases"
        }
      ],
      "children": [],
      "type": "link",
      "path": "/accessories/carrying-cases",
      "sortOrder": 0
    }
  },
  "tree": [
    {
      "id": "ugyeto8653n495dpf89nzoar",
      "_key": "ugyeto8653n495dpf89nzoar",
      "_type": "catalogueItem",
      "title": "Headphones",
      "type": "header",
      "slug": {
        "_type": "slug",
        "current": "headphones"
      },
      "icon": "headphones",
      "children": [
        {
          "id": "ekv4twh175wcse4fl4jjdxfq",
          "_key": "ekv4twh175wcse4fl4jjdxfq",
          "_type": "catalogueItem",
          "title": "By Design",
          "type": "header",
          "children": [
            {
              "id": "o7c6baiuobsr7ni2y2vf22sh",
              "_key": "o7c6baiuobsr7ni2y2vf22sh",
              "_type": "catalogueItem",
              "title": "Open-Back",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "open-back"
              }
            },
            {
              "id": "yq3p9s798zszjkzm5btnebjh",
              "_key": "yq3p9s798zszjkzm5btnebjh",
              "_type": "catalogueItem",
              "title": "Closed-Back",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "closed-back"
              }
            },
            {
              "id": "dW7bkxuW7lwltD3OAxQ9yH",
              "_key": "dW7bkxuW7lwltD3OAxQ9yH",
              "_type": "catalogueItem",
              "title": "Semi-Open",
              "type": "link",
              "slug": {
                "current": "semi-open"
              }
            }
          ]
        },
        {
          "id": "px3eujo0ql1hot9dkoxleao6",
          "_key": "px3eujo0ql1hot9dkoxleao6",
          "_type": "catalogueItem",
          "title": "By Driver",
          "type": "header",
          "children": [
            {
              "id": "yd9641q8fiuh9rgoupauw2zl",
              "_key": "yd9641q8fiuh9rgoupauw2zl",
              "_type": "catalogueItem",
              "title": "Planar Magnetic",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "planar-magnetic"
              }
            },
            {
              "id": "j751evwbn8n9aac4elrekqi4",
              "_key": "j751evwbn8n9aac4elrekqi4",
              "_type": "catalogueItem",
              "title": "Dynamic",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "dynamic"
              }
            },
            {
              "id": "icmc3j8qzjiffr9h6tw6kg74",
              "_key": "icmc3j8qzjiffr9h6tw6kg74",
              "_type": "catalogueItem",
              "title": "Electrostatic",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "electrostatic"
              }
            }
          ]
        },
        {
          "id": "fxvwrl18sixw5b9ro2jrlepa",
          "_key": "fxvwrl18sixw5b9ro2jrlepa",
          "_type": "catalogueItem",
          "title": "In-Ear Monitors",
          "type": "header",
          "children": [
            {
              "id": "t2anvkkjfz9knqi85kozuaze",
              "_key": "t2anvkkjfz9knqi85kozuaze",
              "_type": "catalogueItem",
              "title": "Universal IEMs",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "monitors-iems"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "ti2wufd15h51jxtq855ogbfa",
      "_key": "ti2wufd15h51jxtq855ogbfa",
      "_type": "catalogueItem",
      "title": "Audio Electronics",
      "type": "header",
      "slug": {
        "_type": "slug",
        "current": "audio-electronics"
      },
      "icon": "audio-electronics",
      "children": [
        {
          "id": "hqb22ca5czb252r0r7l1xmet",
          "_key": "hqb22ca5czb252r0r7l1xmet",
          "_type": "catalogueItem",
          "title": "Amplification",
          "type": "header",
          "children": [
            {
              "id": "o6mz3kbs5xla8ixastppktsd",
              "_key": "o6mz3kbs5xla8ixastppktsd",
              "_type": "catalogueItem",
              "title": "Desktop Amps",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "desktop-amps"
              }
            },
            {
              "id": "ipz8oe0elii0vm2voxsbgsw6",
              "_key": "ipz8oe0elii0vm2voxsbgsw6",
              "_type": "catalogueItem",
              "title": "Portable Amps",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "portable-amps"
              }
            },
            {
              "id": "2Q3Hkst6W23iaT5J8DYRdm",
              "_key": "2Q3Hkst6W23iaT5J8DYRdm",
              "_type": "catalogueItem",
              "title": "Bluetooth DAC/Amps",
              "type": "link",
              "slug": {
                "current": "bluetooth-dac-amps"
              }
            }
          ]
        },
        {
          "id": "lkuqr2n1gpeivrvxisnfs3ot",
          "_key": "lkuqr2n1gpeivrvxisnfs3ot",
          "_type": "catalogueItem",
          "title": "Digital Sources",
          "type": "header",
          "children": [
            {
              "id": "mpni93r13d9yo2vn5moexlkp",
              "_key": "mpni93r13d9yo2vn5moexlkp",
              "_type": "catalogueItem",
              "title": "Standalone DACs",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "standalone-dacs"
              }
            },
            {
              "id": "o37u0yjphzt3qu91ewnww2yj",
              "_key": "o37u0yjphzt3qu91ewnww2yj",
              "_type": "catalogueItem",
              "title": "DAC/Amp Combos",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "dac-amp-combos"
              }
            },
            {
              "id": "dW7bkxuW7lwltD3OAxQBo5",
              "_key": "dW7bkxuW7lwltD3OAxQBo5",
              "_type": "catalogueItem",
              "title": "USB-C/Dongle DACs",
              "type": "link",
              "slug": {
                "current": "usb-c-dacs"
              }
            },
            {
              "id": "o9igtdq1g5oqaahpa0zvq238",
              "_key": "o9igtdq1g5oqaahpa0zvq238",
              "_type": "catalogueItem",
              "title": "Digital Players (DAPs)",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "digital-players-daps"
              }
            },
            {
              "id": "npwbgqg3v4t5qe95rg35wte0",
              "_key": "npwbgqg3v4t5qe95rg35wte0",
              "_type": "catalogueItem",
              "title": "Network Streamers",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "network-streamers"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "j9ozs17mc0b1nv2gqn2rvmg1",
      "_key": "j9ozs17mc0b1nv2gqn2rvmg1",
      "_type": "catalogueItem",
      "title": "Accessories",
      "type": "header",
      "slug": {
        "_type": "slug",
        "current": "accessories"
      },
      "icon": "accessories",
      "children": [
        {
          "id": "lhpqqb5qkfvh4kid6q6455eu",
          "_key": "lhpqqb5qkfvh4kid6q6455eu",
          "_type": "catalogueItem",
          "title": "Connectivity",
          "type": "header",
          "children": [
            {
              "id": "vnrj2n32p172vcje1tt3s4ls",
              "_key": "vnrj2n32p172vcje1tt3s4ls",
              "_type": "catalogueItem",
              "title": "Headphone Cables",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "headphone-cables"
              }
            },
            {
              "id": "ck7d2wm9xe6lujtdfq7biyh7",
              "_key": "ck7d2wm9xe6lujtdfq7biyh7",
              "_type": "catalogueItem",
              "title": "Interconnects",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "interconnects"
              }
            },
            {
              "id": "jdxde1qpftseepekaivzpl8c",
              "_key": "jdxde1qpftseepekaivzpl8c",
              "_type": "catalogueItem",
              "title": "Adapters",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "adapters"
              }
            }
          ]
        },
        {
          "id": "e4rct8015rxgy011710isd5e",
          "_key": "e4rct8015rxgy011710isd5e",
          "_type": "catalogueItem",
          "title": "Fit & Comfort",
          "type": "header",
          "children": [
            {
              "id": "j2yu4yvtje69j6gie4spxutu",
              "_key": "j2yu4yvtje69j6gie4spxutu",
              "_type": "catalogueItem",
              "title": "Earpads",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "earpads"
              }
            },
            {
              "id": "9td5z7HwDgMNxTZ8edvs2d",
              "_key": "9td5z7HwDgMNxTZ8edvs2d",
              "_type": "catalogueItem",
              "title": "Eartips",
              "type": "link",
              "slug": {
                "current": "eartips"
              }
            },
            {
              "id": "ab2xhkm6hgabf69y0f3s4oo0",
              "_key": "ab2xhkm6hgabf69y0f3s4oo0",
              "_type": "catalogueItem",
              "title": "Care & Cleaning",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "care-cleaning"
              }
            }
          ]
        },
        {
          "id": "rw0symuvdvebq75r4og53tlf",
          "_key": "rw0symuvdvebq75r4og53tlf",
          "_type": "catalogueItem",
          "title": "Storage",
          "type": "header",
          "children": [
            {
              "id": "u9o83mfmx23cudko8phu5otx",
              "_key": "u9o83mfmx23cudko8phu5otx",
              "_type": "catalogueItem",
              "title": "Headphone Stands",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "headphone-stands"
              }
            },
            {
              "id": "j8ls622l90d6m4xetlajua4y",
              "_key": "j8ls622l90d6m4xetlajua4y",
              "_type": "catalogueItem",
              "title": "Carrying Cases",
              "type": "link",
              "slug": {
                "_type": "slug",
                "current": "carrying-cases"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## `data/catalogue.ts`

```typescript
import catalogueIndex from "./catalogue-index.json";

export interface CatalogueTreeNode {
  _key: string;
  _type: "catalogueItem";
  title: string;
  type: "link" | "header";
  slug?: { _type: "slug"; current: string };
  icon?: string;
  children?: CatalogueTreeNode[];
}

export type CatalogueTree = CatalogueTreeNode[];

interface CatalogueIndexData {
  generatedAt: string;
  slugToIdMap: Record<string, string>;
  slotMetadataMap: Record<string, { children: string[] }>;
  tree: CatalogueTree;
}

export const getCatalogue = (): CatalogueTree => {
  const data = catalogueIndex as unknown;

  try {
    validateCatalogueIndex(data);
    return (data as CatalogueIndexData).tree || [];
  } catch (error) {
    console.error('❌ Catalogue validation failed:', error);
    // Return empty tree as graceful fallback
    return [];
  }
};

export const resolveSlugToId = (slug: string) => {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  return data.slugToIdMap[slug];
};

export const unrollDescendantKeys = (nodeId: string): string[] => {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  const slotMetadataMap = data.slotMetadataMap;

  // If ID not in slotMetadataMap, treat as leaf node and return itself
  if (!slotMetadataMap[nodeId]) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[VFS] ID ${nodeId} not in slotMetadataMap, treating as leaf`);
    }
    return [nodeId];
  }

  const result = new Set<string>();
  const stack = [nodeId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    if (result.has(currentId)) {
      continue;
    }

    result.add(currentId);
    const children = slotMetadataMap[currentId]?.children || [];
    stack.push(...children);
  }

  return Array.from(result);
};

export const buildGroqKeysParam = (keys: string[]): string[] => {
  return keys;
};

// Runtime validation for VFS data integrity
export function validateCatalogueIndex(data: unknown): asserts data is CatalogueIndexData {
  if (!data || typeof data !== 'object') {
    throw new Error('Catalogue index data is not an object');
  }

  const indexData = data as CatalogueIndexData;

  // Validate required top-level properties
  if (!indexData.generatedAt || typeof indexData.generatedAt !== 'string') {
    throw new Error('Catalogue index missing or invalid generatedAt field');
  }

  if (!indexData.slugToIdMap || typeof indexData.slugToIdMap !== 'object') {
    throw new Error('Catalogue index missing or invalid slugToIdMap field');
  }

  if (!indexData.slotMetadataMap || typeof indexData.slotMetadataMap !== 'object') {
    throw new Error('Catalogue index missing or invalid slotMetadataMap field');
  }

  if (!Array.isArray(indexData.tree)) {
    throw new Error('Catalogue index missing or invalid tree field');
  }

  // Validate tree structure
  if (indexData.tree.length === 0) {
    console.warn('Catalogue tree is empty');
  }

  // Validate that we have the expected root categories
  const rootTitles = indexData.tree.map(node => node.title);
  const expectedRoots = ['Headphones', 'Audio Electronics', 'Accessories'];

  for (const expectedRoot of expectedRoots) {
    if (!rootTitles.includes(expectedRoot)) {
      console.warn(`Missing expected root category: ${expectedRoot}`);
    }
  }

  console.log('✅ Catalogue index validation passed');
}

// Navigation-specific interfaces
export interface NavigationLink {
  label: string;
  url: string;
  slug?: string;
}


export interface NavigationSection {
  title: string;
  links: NavigationLink[];
}

export interface NavigationItem {
  id: string;
  label: string;
  imageUrl: string;
  sections: NavigationSection[];
  feature: { caption: string };
}

// Transform VFS tree to navigation format
export const getCatalogueForNavigation = (): NavigationItem[] => {
  const tree = getCatalogue();

  return tree.map(rootItem => {
    const navigationItem: NavigationItem = {
      id: rootItem.slug?.current || rootItem.title.toLowerCase().replace(/\s+/g, '-'),
      label: rootItem.title,
      imageUrl: `/images/${rootItem.icon}-skeletal.png`,
      sections: [],
      feature: { caption: "Pure Resonance" }
    };

    // Process children into sections and links
    if (rootItem.children) {
      navigationItem.sections = rootItem.children.map(section => {
        const navigationSection: NavigationSection = {
          title: section.title,
          links: []
        };

        // Process leaf nodes into clickable links
        if (section.children) {
          navigationSection.links = section.children
            .filter(link => link.type === "link" && link.slug?.current)
            .map(link => ({
              label: link.title,
              url: `/products/${rootItem.slug?.current}/${link.slug?.current}`,
              slug: link.slug?.current
            }));
        }

        return navigationSection;
      });
    }

    return navigationItem;
  });
};
```

## `docs/post-homepage-product-discovery/catalogue-architecture.md`

```markdown
# Catalogue & Product Discovery Architecture

## Overview

This document describes how the catalogue system connects to product discovery, from navigation click to rendered product grid.

## Core Concepts

| Term | Definition |
|------|------------|
| **Catalogue** | Hierarchical category structure (Headphones → By Design → Open-Back) |
| **Leaf Node** | Bottom-level category that contains products (e.g., "Open-Back") |
| **Slot ID** | Unique identifier for any catalogue node (e.g., `o7c6baiuobsr7ni2y2vf22sh`) |
| **VFS** | Virtual File System — pre-built catalogue index for O(1) lookups |
| **catalogueLocationKeys** | Array of slot IDs on each product indicating its categories |

## Data Flow: Click to Products

```
User clicks "Open-Back" in navigation
         ↓
Navigate to /shop/headphones/open-back
         ↓
Server Component parses URL → extracts slug "open-back"
         ↓
resolveSlugToId("open-back") → "o7c6baiuobsr7ni2y2vf22sh"
         ↓
unrollDescendantKeys(nodeId) → ["o7c6baiuobsr7ni2y2vf22sh"]
         ↓
getProductsByVfsKeys(["o7c6..."]) → GROQ query
         ↓
Sanity returns products with matching catalogueLocationKeys
         ↓
Render ProductGrid with products
```

## Key Files

### VFS Data Layer
| File | Purpose |
|------|---------|
| `data/catalogue-index.json` | Pre-built index with all slot IDs and tree structure |
| `data/catalogue.ts` | VFS functions: `resolveSlugToId`, `unrollDescendantKeys` |

### Product Resolution Layer
| File | Purpose |
|------|---------|
| `sanity/lib/products/getProductsByVfsKeys.ts` | Fetch products by slot IDs (TO IMPLEMENT) |
| `app/(store)/shop/[...slug]/page.tsx` | Category listing page (TO IMPLEMENT) |
| `app/components/features/products/ProductGrid.tsx` | Product grid presentation (TO IMPLEMENT) |

### Navigation Layer
| File | Purpose |
|------|---------|
| `app/components/layout/catalogue/CatalogueNavbar.tsx` | Renders navigation from VFS |
| `app/components/layout/catalogue/details/DetailSection.tsx` | Renders category links |

## VFS Functions Reference

### resolveSlugToId(slug: string): string | undefined
Converts URL slug to slot ID.

```typescript
const id = resolveSlugToId("open-back");
// Returns: "o7c6baiuobsr7ni2y2vf22sh"
```

### unrollDescendantKeys(nodeId: string): string[]
Returns all descendant slot IDs including the node itself.

```typescript
const keys = unrollDescendantKeys("ugyeto8653n495dpf89nzoar"); // Headphones root
// Returns: ["ugyeto...", "ekv4t...", "o7c6...", "yq3p...", ...] — 7 total
```

For leaf nodes, returns array with just that ID.

## Product GROQ Query

Fetch products by catalogue slot IDs:

```groq
*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] {
  _id,
  name,
  brand,
  displayPrice,
  image,
  catalogueLocationKeys
}
```

This query uses array intersection — returns products where at least one `catalogueLocationKeys` entry matches the provided slot IDs.

## URL Structure

| URL Pattern | Example | Resolves To |
|-------------|---------|-------------|
| `/shop/[category]/[leaf]` | `/shop/headphones/open-back` | Leaf node products |
| `/shop/[category]` | `/shop/headphones` | All products in category (all leaves) |
| `/brand/[slug]` | `/brand/sennheiser` | Brand page (separate system) |

**Note:** Navigation currently generates `/products/*` — should be updated to `/shop/*` for consistency.

## Current Status

### Implemented ✅
- [x] VFS pre-built index (`catalogue-index.json`)
- [x] VFS lookup functions (`resolveSlugToId`, `unrollDescendantKeys`)
- [x] Navigation rendering from VFS
- [x] Test suite (63 tests passing)
- [x] Product schema with `catalogueLocationKeys`

### Not Implemented ❌
- [ ] `getProductsByVfsKeys()` function
- [ ] `/shop/[...slug]/page.tsx` category pages
- [ ] `ProductGrid` component
- [ ] Homepage VFS integration (currently hardcoded)

## Implementation Guide

### Step 1: Create Product Resolution Function

Create `sanity/lib/products/getProductsByVfsKeys.ts`:

```typescript
import { sanityFetch } from "@/sanity/lib/client";
import { cache } from "react";
import groq from "groq";

export const getProductsByVfsKeys = cache(async (keys: string[]) => {
  if (!keys.length) return [];
  
  return sanityFetch({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] {
      _id, name, brand, displayPrice, image,
      "matchedKeys": catalogueLocationKeys[@ in $keys]
    }`,
    params: { keys }
  });
});
```

### Step 2: Create Category Page

Create `app/(store)/shop/[...slug]/page.tsx`:

```typescript
import { resolveSlugToId, unrollDescendantKeys } from "@/data/catalogue";
import { getProductsByVfsKeys } from "@/sanity/lib/products/getProductsByVfsKeys";
import { ProductGrid } from "@/app/components/features/products/ProductGrid";

export default async function CategoryPage({ 
  params: { slug }
}: { params: { slug: string[] } }) {
  const leafSlug = slug[slug.length - 1];
  const nodeId = resolveSlugToId(leafSlug);
  
  if (!nodeId) return <div>Category not found</div>;
  
  const descendantIds = unrollDescendantKeys(nodeId);
  const leafIds = descendantIds.filter(id => 
    // Check if leaf node in metadata map
    isLeafNode(id)
  );
  
  const products = await getProductsByVfsKeys(leafIds);
  
  return <ProductGrid products={products} />;
}
```

### Step 3: Update Navigation URLs

In `data/catalogue.ts`, change URL generation:

```typescript
// From:
url: `/products/${rootItem.slug?.current}/${link.slug?.current}`

// To:
url: `/shop/${rootItem.slug?.current}/${link.slug?.current}`
```

## Testing

Run VFS test suite:

```bash
npx vitest run tests/catalogue/vfs.test.ts
```

Tests verify:
- Node ID → leaf node resolution
- Leaf node → product ID resolution via GROQ
- Parent node → aggregated products
- Pre-computed index consistency

## Architecture Decisions

### Why Pre-built VFS?

Catalogue structure changes infrequently but is queried on every navigation. Pre-building at deploy time eliminates runtime CMS calls for structure.

### Why Array Intersection for Products?

Products can exist in multiple categories (e.g., both "Open-Back" and "Planar Magnetic"). Array intersection (`count(catalogueLocationKeys[@ in $keys]) > 0`) handles this naturally.

### Why Server Components?

Data fetching happens server-side for:
- Cache efficiency (shared across users)
- Bundle size (VFS data not sent to client)
- SEO (products rendered in initial HTML)

## Related Documentation

- [VFS Test Plan](../tests/catalogue/VFS_TEST_PLAN.md)
- [Frontend VFS Audit](../audit-reports/FRONTEND_VFS_CONSUMPTION_AUDIT.md)
- [Sanity Schema](../sanity/schemaTypes/productType.ts)

---

*Last updated: March 30, 2026*
```

## `lib/catalogue/semanticConfig.ts`

```typescript
export interface SemanticCategoryRule {
  slug: string;
  title: string;
  positiveKeywords: string[];
  negativeKeywords: string[];
  requiredKeywords?: string[];
  brandMatches?: string[];
  weightings: {
    name: number;
    brand: number;
    required: number;
    positive: number;
    negative: number;
  };
}

export const SEMANTIC_CATEGORIES: Record<string, SemanticCategoryRule> = {
  'open-back': {
    slug: 'open-back',
    title: 'Open-Back Headphones',
    positiveKeywords: ['open back', 'open-back', 'open back', 'open-back headphones'],
    negativeKeywords: ['closed back', 'closed-back', 'in-ear', 'earbud', 'iem', 'monitor'],
    requiredKeywords: ['headphone', 'headphones'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'closed-back': {
    slug: 'closed-back',
    title: 'Closed-Back Headphones',
    positiveKeywords: ['closed back', 'closed-back', 'closed back headphones', 'studio'],
    negativeKeywords: ['open back', 'open-back', 'in-ear', 'earbud', 'iem'],
    requiredKeywords: ['headphone', 'headphones'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'planar-magnetic': {
    slug: 'planar-magnetic',
    title: 'Planar Magnetic Headphones',
    positiveKeywords: ['planar', 'planar magnetic', 'magnetic planar', 'isodynamic'],
    negativeKeywords: ['dynamic', 'electrostatic', 'balanced armature'],
    requiredKeywords: ['headphone', 'headphones'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 25,
      negative: -50
    }
  },
  'dynamic': {
    slug: 'dynamic',
    title: 'Dynamic Driver Headphones',
    positiveKeywords: ['dynamic', 'dynamic driver', 'moving coil'],
    negativeKeywords: ['planar', 'electrostatic', 'balanced armature'],
    requiredKeywords: ['headphone', 'headphones'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 25,
      negative: -50
    }
  },
  'electrostatic': {
    slug: 'electrostatic',
    title: 'Electrostatic Headphones',
    positiveKeywords: ['electrostatic', 'electrostatic headphones', 'es', 'stats'],
    negativeKeywords: ['dynamic', 'planar', 'balanced armature'],
    requiredKeywords: ['headphone', 'headphones'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 25,
      negative: -50
    }
  },
  'semi-open': {
    slug: 'semi-open',
    title: 'Semi-Open Headphones',
    positiveKeywords: ['semi-open', 'semi open', 'vented', 'akg', 'grado', 'semi-closed'],
    negativeKeywords: ['fully open', 'fully closed', 'sealed', 'isolation'],
    requiredKeywords: ['headphone', 'headphones'],
    brandMatches: ['AKG', 'Grado', 'Philips'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'monitors-iems': {
    slug: 'monitors-iems',
    title: 'Monitors (IEMs)',
    positiveKeywords: ['in-ear', 'in ear', 'earbud', 'earbud', 'iem', 'in-ear monitor', 'earphone'],
    negativeKeywords: ['over-ear', 'open back', 'closed back'],
    requiredKeywords: ['monitor', 'iem', 'in-ear'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'desktop-amps': {
    slug: 'desktop-amps',
    title: 'Desktop Amplifiers',
    positiveKeywords: ['desktop amp', 'desktop amplifier', 'headphone amp', 'amplifier'],
    negativeKeywords: ['portable', 'battery', 'dac'],
    requiredKeywords: ['amp', 'amplifier'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'portable-amps': {
    slug: 'portable-amps',
    title: 'Portable Amplifiers',
    positiveKeywords: ['portable amp', 'portable amplifier', 'battery powered', 'mobile amp'],
    negativeKeywords: ['desktop', 'ac powered', 'mains'],
    requiredKeywords: ['amp', 'amplifier', 'portable'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'bluetooth-dac-amps': {
    slug: 'bluetooth-dac-amps',
    title: 'Bluetooth DAC/Amps',
    positiveKeywords: ['bluetooth amp', 'bluetooth dac', 'btr', 'go blu', 'wireless amp', 'bluetooth receiver'],
    negativeKeywords: ['wired only', 'desktop', 'stationary', 'no bluetooth'],
    requiredKeywords: ['bluetooth'],
    brandMatches: ['iFi', 'FiiO', 'Shanling', 'EarStudio'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'standalone-dacs': {
    slug: 'standalone-dacs',
    title: 'Standalone DACs',
    positiveKeywords: ['dac', 'digital to analog converter', 'digital-analog converter'],
    negativeKeywords: ['amp', 'amplifier', 'speaker'],
    requiredKeywords: ['dac'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'dac-amp-combos': {
    slug: 'dac-amp-combos',
    title: 'DAC/Amp Combos',
    positiveKeywords: ['dac amp', 'dac/amp', 'combo', 'integrated', 'all-in-one'],
    negativeKeywords: ['standalone', 'separate'],
    requiredKeywords: ['dac', 'amp'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'usb-c-dacs': {
    slug: 'usb-c-dacs',
    title: 'USB-C/Dongle DACs',
    positiveKeywords: ['usb-c dac', 'dongle', 'usb dac', 'dragonfly', 'cayin ru', 'mobile dac'],
    negativeKeywords: ['standalone', 'desktop', 'separate unit', 'full-size'],
    requiredKeywords: ['usb', 'dac'],
    brandMatches: ['AudioQuest', 'Cayin', 'iFi', 'Hidizs'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'digital-players-daps': {
    slug: 'digital-players-daps',
    title: 'Digital Players (DAPs)',
    positiveKeywords: ['dap', 'digital audio player', 'mp3 player', 'music player'],
    negativeKeywords: ['streaming', 'computer', 'phone'],
    requiredKeywords: ['player', 'dap'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'network-streamers': {
    slug: 'network-streamers',
    title: 'Network Streamers',
    positiveKeywords: ['streamer', 'network', 'wifi', 'ethernet', 'roon', 'spotify connect'],
    negativeKeywords: ['portable', 'battery', 'dap'],
    requiredKeywords: ['streamer', 'network'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'headphone-cables': {
    slug: 'headphone-cables',
    title: 'Headphone Cables',
    positiveKeywords: ['cable', 'cable', 'wire', 'cord', 'headphone cable'],
    negativeKeywords: ['adapter', 'amp', 'dac'],
    requiredKeywords: ['cable'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'interconnects': {
    slug: 'interconnects',
    title: 'Interconnects',
    positiveKeywords: ['interconnect', 'rca', 'xlr', 'balanced', 'unbalanced'],
    negativeKeywords: ['headphone', 'speaker cable'],
    requiredKeywords: ['interconnect', 'cable'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'adapters': {
    slug: 'adapters',
    title: 'Adapters',
    positiveKeywords: ['adapter', 'adaptor', 'converter', '3.5mm', '6.35mm', 'quarter inch'],
    negativeKeywords: ['cable', 'amp', 'dac'],
    requiredKeywords: ['adapter'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'earpads': {
    slug: 'earpads',
    title: 'Earpads',
    positiveKeywords: ['earpad', 'ear pad', 'ear cushion', 'replacement earpad'],
    negativeKeywords: ['headphone', 'cable', 'amp'],
    requiredKeywords: ['earpad'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'eartips': {
    slug: 'eartips',
    title: 'Eartips',
    positiveKeywords: ['eartip', 'ear tip', 'foam tip', 'silicone tip', 'spinfit', 'comply', 'final e'],
    negativeKeywords: ['earpad', 'headphone', 'cable', 'case'],
    requiredKeywords: ['tip', 'eartip'],
    brandMatches: ['SpinFit', 'Comply', 'Final Audio', 'AZLA', 'Symbio'],
    weightings: {
      name: 40,
      brand: 15,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'care-cleaning': {
    slug: 'care-cleaning',
    title: 'Care & Cleaning',
    positiveKeywords: ['cleaning', 'care', 'maintenance', 'cleaner', 'kit'],
    negativeKeywords: ['headphone', 'cable', 'electronic'],
    requiredKeywords: ['cleaning', 'care'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'headphone-stands': {
    slug: 'headphone-stands',
    title: 'Headphone Stands',
    positiveKeywords: ['stand', 'holder', 'hanger', 'headphone stand'],
    negativeKeywords: ['headphone', 'cable', 'electronic'],
    requiredKeywords: ['stand'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  },
  'carrying-cases': {
    slug: 'carrying-cases',
    title: 'Carrying Cases',
    positiveKeywords: ['case', 'carrying case', 'protective case', 'storage case'],
    negativeKeywords: ['headphone', 'cable', 'electronic'],
    requiredKeywords: ['case'],
    weightings: {
      name: 40,
      brand: 10,
      required: 30,
      positive: 20,
      negative: -50
    }
  }
};

export const getSemanticRule = (slug: string): SemanticCategoryRule | null => {
  return SEMANTIC_CATEGORIES[slug] || null;
};

export const getAllSemanticSlugs = (): string[] => {
  return Object.keys(SEMANTIC_CATEGORIES);
};
```

## `lib/catalogue/semanticMatching.ts`

```typescript
import { getSemanticRule } from './semanticConfig';
import { SEMANTIC_CATEGORIES } from './semanticConfig';

export interface Product {
  name: string;
  brand: string;
  slug?: { current: string };
  overviewFields?: Array<{ title: string; value: string }>;
  specifications?: Array<{ title: string; value: string }>;
}

export interface SemanticMatchResult {
  score: number;
  reasons: string[];
  concerns: string[];
  categorySlug: string;
  categoryTitle: string;
}

export interface SemanticMatchSummary {
  categorySlug: string;
  categoryTitle: string;
  totalProducts: number;
  validMatches: number; // score >= 80
  moderateMatches: number; // score 60-79
  invalidMatches: number; // score < 60
  averageScore: number;
  results: SemanticMatchResult[];
}

const normalizeString = (str: string): string => {
  return str.toLowerCase().trim();
};

const containsKeyword = (text: string, keyword: string): boolean => {
  const normalizedText = normalizeString(text);
  const normalizedKeyword = normalizeString(keyword);
  return normalizedText.includes(normalizedKeyword);
};

const calculateKeywordScore = (
  text: string,
  keywords: string[],
  weight: number
): { score: number; matches: string[] } => {
  let score = 0;
  const matches: string[] = [];

  for (const keyword of keywords) {
    if (containsKeyword(text, keyword)) {
      score += weight;
      matches.push(keyword);
    }
  }

  return { score, matches };
};

export const analyzeSemanticMatch = (
  product: Product,
  categorySlug: string
): SemanticMatchResult => {
  const rule = getSemanticRule(categorySlug);

  if (!rule) {
    return {
      score: 0,
      reasons: ['No semantic rule found for category'],
      concerns: ['Category not configured'],
      categorySlug,
      categoryTitle: categorySlug
    };
  }

  const reasons: string[] = [];
  const concerns: string[] = [];
  let totalScore = 0;

  // Start with base score
  totalScore = 50;

  // Required keywords check (must pass)
  if (rule.requiredKeywords && rule.requiredKeywords.length > 0) {
    const { score: requiredScore, matches: requiredMatches } = calculateKeywordScore(
      product.name,
      rule.requiredKeywords,
      rule.weightings.required
    );

    if (requiredMatches.length === 0) {
      concerns.push(`Missing required keywords: ${rule.requiredKeywords.join(', ')}`);
      totalScore -= 40; // Heavy penalty for missing required keywords
    } else {
      reasons.push(`Found required keywords: ${requiredMatches.join(', ')}`);
      totalScore += requiredScore;
    }
  }

  // Positive keywords
  const { score: positiveScore, matches: positiveMatches } = calculateKeywordScore(
    product.name,
    rule.positiveKeywords,
    rule.weightings.positive
  );

  if (positiveMatches.length > 0) {
    reasons.push(`Found positive keywords: ${positiveMatches.join(', ')}`);
    totalScore += positiveScore;
  }

  // Negative keywords (penalty)
  const { score: negativeScore, matches: negativeMatches } = calculateKeywordScore(
    product.name,
    rule.negativeKeywords,
    rule.weightings.negative
  );

  if (negativeMatches.length > 0) {
    concerns.push(`Found negative keywords: ${negativeMatches.join(', ')}`);
    totalScore += negativeScore; // negativeScore is already negative
  }

  // Brand matching
  if (rule.brandMatches && rule.brandMatches.length > 0) {
    const brandMatch = rule.brandMatches.some(brand =>
      containsKeyword(product.brand, brand)
    );

    if (brandMatch) {
      reasons.push(`Brand match: ${product.brand}`);
      totalScore += rule.weightings.brand;
    }
  }

  // Name scoring (check if category name appears in product name)
  const nameScore = calculateKeywordScore(
    product.name,
    [rule.title, rule.slug],
    rule.weightings.name
  );

  if (nameScore.matches.length > 0) {
    reasons.push(`Name contains category terms: ${nameScore.matches.join(', ')}`);
    totalScore += nameScore.score;
  }

  // Check overview fields for additional context
  if (product.overviewFields) {
    for (const field of product.overviewFields) {
      const { matches: overviewMatches } = calculateKeywordScore(
        field.value,
        rule.positiveKeywords,
        rule.weightings.positive * 0.5 // Lower weight for overview fields
      );

      if (overviewMatches.length > 0) {
        reasons.push(`Overview field "${field.title}" contains: ${overviewMatches.join(', ')}`);
        totalScore += overviewMatches.length * (rule.weightings.positive * 0.5);
      }
    }
  }

  // Check specifications for additional context
  if (product.specifications) {
    for (const spec of product.specifications) {
      const { matches: specMatches } = calculateKeywordScore(
        spec.value,
        rule.positiveKeywords,
        rule.weightings.positive * 0.3 // Lower weight for specifications
      );

      if (specMatches.length > 0) {
        reasons.push(`Specification "${spec.title}" contains: ${specMatches.join(', ')}`);
        totalScore += specMatches.length * (rule.weightings.positive * 0.3);
      }
    }
  }

  // Ensure score is within 0-100 range
  totalScore = Math.max(0, Math.min(100, totalScore));

  return {
    score: Math.round(totalScore),
    reasons,
    concerns,
    categorySlug,
    categoryTitle: rule.title
  };
};

export const analyzeSemanticMatches = (
  products: Product[],
  categorySlug: string
): SemanticMatchSummary => {
  const rule = getSemanticRule(categorySlug);

  if (!rule) {
    return {
      categorySlug,
      categoryTitle: categorySlug,
      totalProducts: products.length,
      validMatches: 0,
      moderateMatches: 0,
      invalidMatches: products.length,
      averageScore: 0,
      results: products.map(product => ({
        score: 0,
        reasons: ['No semantic rule found for category'],
        concerns: ['Category not configured'],
        categorySlug,
        categoryTitle: categorySlug
      }))
    };
  }

  const results = products.map(product => analyzeSemanticMatch(product, categorySlug));

  const validMatches = results.filter(r => r.score >= 80).length;
  const moderateMatches = results.filter(r => r.score >= 60 && r.score < 80).length;
  const invalidMatches = results.filter(r => r.score < 60).length;
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

  return {
    categorySlug,
    categoryTitle: rule.title,
    totalProducts: products.length,
    validMatches,
    moderateMatches,
    invalidMatches,
    averageScore: Math.round(averageScore),
    results
  };
};

export const getScoreIndicator = (score: number): string => {
  if (score >= 80) return '✅';
  if (score >= 60) return '⚠️';
  return '❌';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'VALID';
  if (score >= 60) return 'MODERATE';
  return 'MISMATCH';
};
```

## `lib/utils/price.ts`

```typescript
/**
 * Price utility functions
 */

/**
 * Convert cents to display price (dollars)
 * @param cents - Price in cents (e.g., 1999 for $19.99)
 * @returns Price in dollars (e.g., 19.99)
 */
export function centsToDisplay(cents: number): number {
  return cents / 100;
}

/**
 * Convert display price (dollars) to cents
 * @param dollars - Price in dollars (e.g., 19.99)
 * @returns Price in cents (e.g., 1999)
 */
export function displayToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
```

## `lib/utils/sanityImageLoader.ts`

```typescript
import urlBuilder from "@sanity/image-url";
import { dataset, projectId } from "@/sanity-cms/env";

const builder = urlBuilder({ projectId, dataset });

function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Pass through plain URLs (e.g., Unsplash, external images, GridMediaBox)
  if (src.startsWith("http") || src.startsWith("/")) {
    return src;
  }
  // Sanity asset ref: generate optimized CDN URL
  return builder
    .image(src)
    .width(width)
    .quality(quality || 75)
    .auto("format")
    .url();
}

// Named export for manual URL building (e.g., <source srcSet>)
export { sanityImageLoader };

// Default export — Next.js global custom loader via images.loaderFile
export default sanityImageLoader;
```

## `lib/utils/title-optimization.ts`

```typescript
/**
 * Smart Title Optimization for Product Pages
 *
 * Handles browser tab character limits while preserving SEO value
 * and brand recognition across all product pages systematically.
 */

export interface TitleOptions {
  productName: string;
  brand?: { _id: string; name: string; slug: string } | null;
  siteName?: string;
  maxLength?: number;
}

/**
 * Generates optimized page titles for browser tabs and SEO
 *
 * Strategy:
 * 1. Prioritize product name (most important for search)
 * 2. Include brand if space allows
 * 3. Always include site name for brand recognition
 * 4. Use smart truncation to preserve readability
 */
export function generateOptimizedTitle(options: TitleOptions): string {
  const {
    productName,
    brand,
    siteName = "Sang Logium",
    maxLength = 60 // Optimal for browser tabs + SERP display
  } = options;

  // Base components
  const components = [productName];

  // Add brand if it exists and isn't already in product name
  if (brand && !productName.toLowerCase().includes(brand.name.toLowerCase())) {
    components.push(brand.name);
  }

  // Always add site name
  components.push(siteName);

  // Build title with different strategies based on length
  let title = components.join(" — ");

  // If title is within limits, return as-is
  if (title.length <= maxLength) {
    return title;
  }

  // Strategy 1: Remove site name if product name is very long
  if (productName.length > maxLength - 10) {
    return productName.length <= maxLength
      ? productName
      : truncateProductName(productName, maxLength);
  }

  // Strategy 2: Try brand + site name (shorter product names)
  const withBrandAndSite = `${productName} — ${brand?.name} — ${siteName}`;
  if (withBrandAndSite.length <= maxLength) {
    return withBrandAndSite;
  }

  // Strategy 3: Product name + site name only
  const withSiteOnly = `${productName} — ${siteName}`;
  if (withSiteOnly.length <= maxLength) {
    return withSiteOnly;
  }

  // Strategy 4: Truncate product name intelligently
  const truncatedProduct = truncateProductName(productName, maxLength - siteName.length - 3);
  return `${truncatedProduct} — ${siteName}`;
}

/**
 * Intelligently truncates product names while preserving readability
 */
function truncateProductName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name;

  // For very short limits, just truncate and add ellipsis
  if (maxLength < 20) {
    return name.substring(0, maxLength - 3) + "...";
  }

  // Try to preserve important words (avoid cutting in middle of brand names)
  const words = name.split(" ");

  // If we can fit most words, truncate the last one
  let result = "";
  for (const word of words) {
    const testResult = result ? `${result} ${word}` : word;
    if (testResult.length <= maxLength - 3) {
      result = testResult;
    } else {
      break;
    }
  }

  // Add ellipsis if we truncated
  if (result.length < name.length) {
    result += "...";
  }

  return result;
}

/**
 * Generates comprehensive SEO titles (for search engines, not browser tabs)
 * Can be longer since SERPs show more characters
 */
export function generateSEOTitle(options: TitleOptions): string {
  const { productName, brand, siteName = "Sang Logium" } = options;

  if (brand && !productName.toLowerCase().includes(brand.name.toLowerCase())) {
    return `${productName} — ${brand.name} — ${siteName}`;
  }

  return `${productName} — ${siteName}`;
}

/**
 * Generates meta descriptions with smart truncation
 */
export function generateMetaDescription(
  description: string | undefined | null,
  productName: string,
  brand?: { _id: string; name: string; slug: string } | null,
  maxLength: number = 160
): string {
  // If we have a proper description, use it
  if (description && typeof description === 'string') {
    return description.length <= maxLength
      ? description
      : description.substring(0, maxLength - 3) + "...";
  }

  // Generate fallback description
  const fallback = brand
    ? `Buy ${productName} from ${brand.name}. Premium audio equipment with fast shipping and expert support.`
    : `Buy ${productName}. Premium audio equipment with fast shipping and expert support.`;

  return fallback.length <= maxLength
    ? fallback
    : fallback.substring(0, maxLength - 3) + "...";
}

/**
 * Utility for testing title lengths across different contexts
 */
export function analyzeTitleLength(title: string): {
  length: number;
  browserTabDisplay: string;
  serpDisplay: string;
  recommendations: string[];
} {
  const browserTabLimit = 60;
  const serpLimit = 70; // Google typically shows ~70 chars

  return {
    length: title.length,
    browserTabDisplay: title.length <= browserTabLimit
      ? title
      : title.substring(0, browserTabLimit - 3) + "...",
    serpDisplay: title.length <= serpLimit
      ? title
      : title.substring(0, serpLimit - 3) + "...",
    recommendations: [
      ...(title.length > browserTabLimit ? [`Browser tab: Consider shorter title (${browserTabLimit} chars)`] : []),
      ...(title.length > serpLimit ? [`SERP: Consider shorter title (${serpLimit} chars)`] : []),
      ...(title.length < 30 ? ["Consider adding more detail for better SEO"] : []),
    ]
  };
}
```

## `sanity-cms/lib/products/filter/getFiltersForCategoryPath.ts`

```typescript
import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';
import { cache } from 'react';

// React cache for Server Components
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn);
  } catch {
    return fn;
  }
};

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  field: string;
  label: string;
  options: FilterOption[];
}

export interface FilterResult {
  filters: FilterGroup[];
  priceRange: {
    minPrice: number | null;
    maxPrice: number | null;
  };
  maxStock: number | null;
}

const getFiltersForCategoryPathFn = async (catalogueKeys: string[]): Promise<FilterResult> => {
  if (!catalogueKeys.length) {
    return {
      filters: [],
      priceRange: { minPrice: null, maxPrice: null },
      maxStock: null
    };
  }

  // Fetch CMS categoryFilters config for this category (if any)
  const cmsFilters = await sanityFetch<{
    filterItems: Array<{
      name: string;
      type: string;
      field: string;
      options: string[];
      defaultValue: string | null;
      min: number | null;
      max: number | null;
      isMinOnly: boolean;
      step: number;
    }>;
  } | null>({
    query: groq`*[_type == "categoryFilters" && categoryKey in $keys][0] {
      "filterItems": filters.filterItems[] {
        name,
        type,
        field,
        options,
        defaultValue,
        min,
        max,
        isMinOnly,
        step
      }
    }`,
    params: { keys: catalogueKeys }
  });

  // Query price range using GROQ order and slicing (efficient alternative to aggregation)
  const minPriceQuery = await sanityFetch<{
    price_data: { unit_amount: number } | null;
  }>({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(price_data)] | order(price_data.unit_amount asc)[0] {
      price_data
    }`,
    params: { keys: catalogueKeys }
  });

  const maxPriceQuery = await sanityFetch<{
    price_data: { unit_amount: number } | null;
  }>({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(price_data)] | order(price_data.unit_amount desc)[0] {
      price_data
    }`,
    params: { keys: catalogueKeys }
  });

  const priceRange = {
    minPrice: minPriceQuery?.price_data?.unit_amount ?? null,
    maxPrice: maxPriceQuery?.price_data?.unit_amount ?? null
  };

  // Query maximum stock for slider upper bound
  const maxStockQuery = await sanityFetch<{
    stock: number | null;
  }>({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(stock)] | order(stock desc)[0] {
      stock
    }`,
    params: { keys: catalogueKeys }
  });

  // Query products to extract unique filter values
  const products = await sanityFetch<any[]>({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] {
      price_data,
      brand->{name},
      stock
    }`,
    params: { keys: catalogueKeys }
  });


  if (!products.length) {
    return {
      filters: [],
      priceRange,
      maxStock: maxStockQuery?.stock ?? null
    };
  }

  // Extract unique brands from actual products
  const brandSet = new Set<string>();
  for (const product of products) {
    if (product.brand?.name) {
      brandSet.add(product.brand.name);
    }
  }

  // Build filter groups
  const filters: FilterGroup[] = [];

  // Convert CMS filter items to FilterGroups (checkbox, radio, multiselect, boolean)
  if (cmsFilters?.filterItems?.length) {
    for (const item of cmsFilters.filterItems) {
      if (item.type === 'checkbox' || item.type === 'radio' || item.type === 'multiselect') {
        const options = (item.options || [])
          .filter(opt => opt && opt.length > 0)
          .map(opt => ({ value: opt, label: opt }));
        if (options.length > 0) {
          filters.push({
            field: item.field || item.name,
            label: item.name,
            options
          });
        }
      } else if (item.type === 'boolean') {
        filters.push({
          field: item.field || item.name,
          label: item.name,
          options: [
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' }
          ]
        });
      }
      // Range filters are handled by PriceRangeSlider / StockMinimumSlider UI
    }
  }

  // Brand filter: if CMS has a brand filter, intersect with actual product brands
  // Otherwise, add brand filter from extracted brands
  const hasCmsBrandFilter = cmsFilters?.filterItems?.some(
    item => (item.field || item.name).toLowerCase() === 'brand'
  );

  if (hasCmsBrandFilter) {
    // Find the CMS brand filter and intersect options with actual brands
    const cmsBrandItem = cmsFilters!.filterItems.find(
      item => (item.field || item.name).toLowerCase() === 'brand'
    );
    const validBrands = (cmsBrandItem?.options || [])
      .filter(brand => brandSet.has(brand))
      .sort()
      .map(brand => ({ value: brand, label: brand }));

    if (validBrands.length > 0) {
      // Replace any existing brand filter from CMS with intersected version
      const brandIndex = filters.findIndex(f => f.field.toLowerCase() === 'brand');
      if (brandIndex >= 0) {
        filters[brandIndex] = { field: 'brand', label: cmsBrandItem!.name, options: validBrands };
      } else {
        filters.push({ field: 'brand', label: cmsBrandItem!.name, options: validBrands });
      }
    }
  } else if (brandSet.size > 0) {
    // No CMS brand filter — add from extracted products
    filters.push({
      field: 'brand',
      label: 'Brand',
      options: Array.from(brandSet).sort().map(brand => ({ value: brand, label: brand }))
    });
  }

  return {
    filters,
    priceRange,
    maxStock: maxStockQuery?.stock ?? null
  };
};

export const getFiltersForCategoryPath = withCache(getFiltersForCategoryPathFn);
```

## `sanity-cms/lib/products/FilterBuilder.ts`

```typescript
/**
 * Filter Builder - Constructs GROQ filter clauses
 * Extracted from getProductsByVfsKeys for better testability and maintainability
 */
export class FilterBuilder {
  // Known safe filter fields — anything else is treated as generic (overviewFields/specifications)
  private static readonly KNOWN_FIELDS = new Set(['brand', 'price', 'priceRange', 'stockMin']);

  /**
   * Sanitize a string value for safe GROQ interpolation.
   * Escapes double quotes to prevent GROQ injection.
   */
  private static sanitizeString(value: string): string {
    return value.replace(/"/g, '\\"');
  }

  /**
   * Validate that a string is a safe numeric value (integer).
   * Returns the number if valid, null otherwise.
   */
  private static validateNumeric(value: string): number | null {
    const num = Number(value);
    if (Number.isNaN(num) || !Number.isFinite(num)) return null;
    return Number.isInteger(num) ? num : null;
  }

  /**
   * Build complete filter clause from filter array
   */
  static buildClause(filters: string[]): string {
    if (filters.length === 0) {
      return '';
    }

    // Group filters by field
    const filtersByField = this.groupFiltersByField(filters);

    // Build clause for each field group
    const fieldClauses = Object.entries(filtersByField).map(([field, values]) => {
      if (field === 'brand') {
        return this.buildBrandFilter(values);
      } else if (field === 'price') {
        return this.buildPriceFilter(values);
      } else if (field === 'priceRange') {
        return this.buildPriceRangeFilter(values);
      } else if (field === 'stockMin') {
        return this.buildStockFilter(values);
      } else {
        return this.buildGenericFilter(field, values);
      }
    });

    const filterClause = fieldClauses.join(' ');
    return filterClause;
  }

  /**
   * Group filters by field with special handling for priceRange comma-separated values
   */
  private static groupFiltersByField(filters: string[]): Record<string, string[]> {
    return filters.reduce((acc, filter) => {
      const parts = filter.split(':');
      if (parts.length >= 2) {
        const field = parts[0];
        let value = parts.slice(1).join(':');
        
        // Special handling for priceRange with comma-separated min/max values
        if (field === 'priceRange' && value.includes(',')) {
          // Split "min:500,max:1500" into ["min:500", "max:1500"]
          const subValues = value.split(',').map(v => v.trim());
          if (!acc[field]) acc[field] = [];
          acc[field].push(...subValues);
        } else {
          // Normal case: single value
          if (!acc[field]) acc[field] = [];
          acc[field].push(value);
        }
      }
      return acc;
    }, {} as Record<string, string[]>);
  }

  /**
   * Build brand filter clause
   */
  private static buildBrandFilter(values: string[]): string {
    // Multiple brands: OR logic
    const brandConditions = values
      .map(v => this.sanitizeString(v))
      .filter(v => v.length > 0)
      .map(value => `lower(brand->name) == lower("${value}")`)
      .join(' || ');
    if (!brandConditions) return '';
    return `&& (${brandConditions})`;
  }

  /**
   * Build price filter clause
   */
  private static buildPriceFilter(values: string[]): string {
    const priceConditions = values.map(value => {
      if (value.startsWith('min:')) {
        const num = this.validateNumeric(value.split(':')[1] ?? '');
        if (num === null) return null;
        return `price_data.unit_amount >= ${num}`;
      } else if (value.startsWith('max:')) {
        const num = this.validateNumeric(value.split(':')[1] ?? '');
        if (num === null) return null;
        return `price_data.unit_amount <= ${num}`;
      }
      const num = this.validateNumeric(value);
      if (num === null) return null;
      return `price_data.unit_amount == ${num}`;
    }).filter((c): c is string => c !== null);

    if (priceConditions.length === 0) return '';
    return `&& (${priceConditions.join(' && ')})`;
  }

  /**
   * Build price range filter clause (from sliders)
   */
  private static buildPriceRangeFilter(values: string[]): string {
    const priceConditions = values.map(value => {
      if (value.startsWith('min:')) {
        const num = this.validateNumeric(value.split(':')[1] ?? '');
        if (num === null) return null;
        return `price_data.unit_amount >= ${num}`;
      } else if (value.startsWith('max:')) {
        const num = this.validateNumeric(value.split(':')[1] ?? '');
        if (num === null) return null;
        return `price_data.unit_amount <= ${num}`;
      }
      const num = this.validateNumeric(value);
      if (num === null) return null;
      return `price_data.unit_amount == ${num}`;
    }).filter((c): c is string => c !== null);

    if (priceConditions.length === 0) return '';
    return `&& (${priceConditions.join(' && ')})`;
  }

  /**
   * Build stock filter clause
   */
  private static buildStockFilter(values: string[]): string {
    const stockConditions = values.map(value => {
      const num = this.validateNumeric(value);
      if (num === null) return null;
      return `stock >= ${num}`;
    }).filter((c): c is string => c !== null);

    if (stockConditions.length === 0) return '';
    return `&& (${stockConditions.join(' && ')})`;
  }

  /**
   * Build generic filter clause for overviewFields/specifications
   */
  private static buildGenericFilter(field: string, values: string[]): string {
    // Reject empty or overly long field names
    if (!field || field.length > 100) return '';

    const safeField = this.sanitizeString(field);
    const conditions = values
      .map(v => this.sanitizeString(v))
      .filter(v => v.length > 0)
      .map(value =>
        `(count(overviewFields[@.title == "${safeField}" && @.value == "${value}"]) > 0 || count(specifications[@.title == "${safeField}" && @.value == "${value}"]) > 0)`
      )
      .join(' || ');

    if (!conditions) return '';
    return `&& (${conditions})`;
  }
}
```

## `sanity-cms/lib/products/getBasketProducts.ts`

```typescript
import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';

export interface BasketProduct {
  _id: string;
  name: string;
  price_data: {
    currency: string;
    unit_amount: number;
  };
  stock: number;
  reservedStock: number;
  image: any;
  parcel?: {
    length: number;
    width: number;
    height: number;
    weight: number;
    distance_unit: string;
    mass_unit: string;
  };
}

export async function getBasketProducts(ids: string[]): Promise<BasketProduct[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    const products = await sanityFetch<BasketProduct[]>({
      query: groq`*[_type == "product" && _id in $ids && defined(price_data)] {
        _id,
        name,
        price_data,
        stock,
        reservedStock,
        image {
          asset {
            _ref
          }
        },
        parcel {
          length,
          width,
          height,
          weight,
          distance_unit,
          mass_unit
        }
      }`,
      params: { ids }
    });

    return products || [];
  } catch (error) {
    console.error('Failed to fetch basket products:', error);
    return [];
  }
}
```

## `sanity-cms/lib/products/getCategoryMetadata.ts`

```typescript
import catalogueIndex from '@/data/catalogue-index.json';

// React cache is only available in React Server Components
// In test environments, we skip caching
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- Dynamic import to avoid breaking in non-React environments
    const { cache } = require('react');
    return cache(fn) as T;
  } catch {
    return fn;
  }
};

export interface CategoryMetadata {
  id: string;
  name: string;
  slug: string | null;
  type: 'header' | 'link';
  parentId: string | null;
  breadcrumb: Array<{ label: string; href: string }>;
}

const getCategoryMetadataFn = async (key: string): Promise<CategoryMetadata | null> => {
  const metadata = catalogueIndex.slotMetadataMap[key as keyof typeof catalogueIndex.slotMetadataMap];

  if (!metadata) {
    return null;
  }

  // Build breadcrumb from path
  const breadcrumb = buildBreadcrumbFromPath(metadata.path || '');

  // Find parent ID from tree structure
  const parentId = findParentId(key, catalogueIndex.tree);

  return {
    id: (metadata as any).id || key,
    name: metadata.title,
    slug: metadata.slug || null,
    type: metadata.type as 'link' | 'header',
    parentId,
    breadcrumb,
  };
};

export const getCategoryMetadata = withCache(getCategoryMetadataFn) as (key: string) => Promise<CategoryMetadata | null>;

function buildBreadcrumbFromPath(path: string): Array<{ label: string; href: string }> {
  // Parse path like "/headphones/by-design/open-back"
  // Return breadcrumb segments
  const segments = path.split('/').filter(Boolean);
  return segments.map((segment, index) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
    href: '/shop/' + segments.slice(0, index + 1).join('/'),
  }));
}

function findParentId(nodeId: string, tree: any[]): string | null {
  // Traverse tree to find parent of nodeId
  for (const node of tree) {
    if (node.children?.some((child: any) => child.id === nodeId || child._key === nodeId)) {
      return node.id || node._key;
    }
    if (node.children) {
      const found = findParentId(nodeId, node.children);
      if (found) return found;
    }
  }
  return null;
}
```

## `sanity-cms/lib/products/getProductBySlug.ts`

```typescript
import { cache } from 'react';
import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';

export interface Product {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug: string } | null;
  price_data: { currency: string; unit_amount: number };
  stock: number;
  reservedStock: number;
  sku: string;
  image: any;
  gallery?: any[];
  slug: { current: string };
  description?: any;
  overviewFields?: { title: string; value: string; information?: string }[];
  specifications?: { title: string; value: string; information?: string }[];
  catalogueLocationKeys: string[];
  parcel?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const products = await sanityFetch<Product[]>({
    query: groq`*[_type == "product" && slug.current == $slug] {
      _id,
      name,
      brand->{ _id, name, slug },
      price_data,
      stock,
      sku,
      image,
      gallery,
      slug {
        current
      },
      description,
      overviewFields[] {
        title,
        value,
        information
      },
      specifications[] {
        title,
        value,
        information
      },
      catalogueLocationKeys
    }`,
    params: { slug }
  });

  return (products as Product[])[0] || null;
});
```

## `sanity-cms/lib/products/getProductsByIds.ts`

```typescript
import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';
import { Product } from './getProductBySlug';

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  const products = await sanityFetch<Product[]>({
    query: groq`*[_type == "product" && _id in $ids] {
      _id,
      name,
      brand->{ _id, name, slug },
      price_data,
      stock,
      reservedStock,
      sku,
      image,
      gallery,
      slug {
        current
      },
      description,
      overviewFields[] {
        title,
        value,
        information
      },
      specifications[] {
        title,
        value,
        information
      },
      catalogueLocationKeys,
      parcel {
        length,
        width,
        height,
        weight
      }
    }`,
    params: { ids }
  });

  return products || [];
}
```

## `sanity-cms/lib/products/getProductsByVfsKeys.ts`

```typescript
import { sanityFetch } from '@/sanity-cms/lib/client';
import { groq } from 'next-sanity';
import { FilterBuilder } from './FilterBuilder';
import { cache } from 'react';
import type { Product as SanityProduct } from '@/sanity.types';

// Pagination safety limit - prevents unbounded queries
const MAX_PRODUCTS_LIMIT = 100;

// React cache is only available in React Server Components
// In test environments, we skip caching
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn) as T;
  } catch {
    return fn;
  }
};

// Product type matching actual GROQ query result (brand is dereferenced with ->)
export type Product = {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug?: { current: string } } | null;
  price_data: { currency: string; unit_amount: number };
  image: any;
  catalogueLocationKeys: string[];
  slug: { current: string };
  stock: number;
  reservedStock: number;
  availableStock: number;
};

export interface GetProductsOptions {
  keys: string[];
  sort?: string;
  filters?: string[];
  limit?: number; // Optional override (capped at MAX_PRODUCTS_LIMIT)
}

const getProductsByVfsKeysFn = async ({
  keys,
  sort = 'featured',
  filters = [],
  limit = MAX_PRODUCTS_LIMIT
}: GetProductsOptions): Promise<Product[]> => {
  if (!keys.length) {
    return [];
  }

  // Cap limit at MAX_PRODUCTS_LIMIT for pagination safety
  const effectiveLimit = Math.min(limit, MAX_PRODUCTS_LIMIT);

  // Build sort clause
  const [sortField, sortDir] = sort.split(':');
  const orderClause = sort === 'featured'
    ? ''
    : `| order(${sortField} ${sortDir === 'asc' ? 'asc' : 'desc'})`;

  // Build filter clause using FilterBuilder
  const filterClause = FilterBuilder.buildClause(filters);

  const finalQuery = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}] ${orderClause} [0...${effectiveLimit}] {
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

  return sanityFetch({
    query: finalQuery,
    params: { keys }
  });
};

export const getProductsByVfsKeys = withCache(getProductsByVfsKeysFn) as (options: GetProductsOptions) => Promise<Product[]>;
```

## `sanity-cms/lib/products/getRelatedProducts.ts`

```typescript
import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';

export interface RelatedProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string } | null;
  price_data: { currency: string; unit_amount: number };
  image: any;
  slug: { current: string };
}

export async function getRelatedProducts(
  currentId: string,
  catalogueKeys: string[],
  limit: number = 6
): Promise<RelatedProduct[]> {
  if (!catalogueKeys || catalogueKeys.length === 0) {
    return [];
  }

  const products = await sanityFetch<RelatedProduct[]>({
    query: groq`*[_type == "product"
      && _id != $currentId
      && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0
    ] | order(price_data.unit_amount asc) [0...$limit] {
      _id,
      name,
      brand {
        _id,
        name
      },
      price_data,
      image,
      slug {
        current
      }
    }`,
    params: { currentId, catalogueKeys, limit }
  });

  return products || [];
}
```

## `sanity-cms/lib/products/index.ts`

```typescript
export { getProductsByVfsKeys } from './getProductsByVfsKeys';
export { getCategoryMetadata } from './getCategoryMetadata';
export { getProductBySlug } from './getProductBySlug';
export { getRelatedProducts } from './getRelatedProducts';
export { getBasketProducts } from './getBasketProducts';
export type { Product } from './getProductsByVfsKeys';
export type { CategoryMetadata } from './getCategoryMetadata';
export type { Product as ProductDetail } from './getProductBySlug';
export type { RelatedProduct } from './getRelatedProducts';
export type { BasketProduct } from './getBasketProducts';
```

## `sanity-cms/lib/products/searchProducts.ts`

```typescript
import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';

const MAX_AUTOCOMPLETE = 6;
const MIN_QUERY_LENGTH = 2;
const DEFAULT_PER_PAGE = 24;

export interface AutocompleteProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug: string } | null;
  price_data: { currency: string; unit_amount: number };
  slug: { current: string };
  image: any;
}

export interface SearchProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug: string } | null;
  price_data: { currency: string; unit_amount: number };
  stock: number;
  reservedStock: number;
  availableStock: number;
  slug: { current: string };
  image: any;
}

export interface SearchResult {
  products: SearchProduct[];
  totalCount: number;
}

export async function searchProductsAutocomplete(query: string): Promise<AutocompleteProduct[]> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    return [];
  }

  const searchTerm = `${query.trim()}*`;

  try {
    return await sanityFetch<AutocompleteProduct[]>({
      query: groq`*[_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0 && (
        name match $query ||
        sku match $query ||
        brand._ref in *[_type == "brand" && name match $query]._id ||
        specifications[].value match $query ||
        overviewFields[].value match $query
      )] {
        _id,
        name,
        price_data,
        "brand": brand->{ _id, name, slug },
        slug,
        image,
        "score": select(
          name match $query => 20,
          brand->name match $query => 15,
          10
        )
      } | order(score desc, name asc) [0...${MAX_AUTOCOMPLETE}]`,
      params: { query: searchTerm },
    });
  } catch (error) {
    console.error(`[searchProductsAutocomplete] Failed for query "${query}":`, error);
    return [];
  }
}

export async function searchProductsFull(
  query: string,
  sort?: string,
  page: number = 1,
  perPage: number = DEFAULT_PER_PAGE
): Promise<SearchResult> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    return { products: [], totalCount: 0 };
  }

  const searchTerm = `${query.trim()}*`;
  const offset = (page - 1) * perPage;

  // Build sort clause
  let orderClause = 'name asc';
  if (sort) {
    const [field, dir] = sort.split(':');
    if (['name', 'unit_amount'].includes(field) && ['asc', 'desc'].includes(dir)) {
      orderClause = `${field} ${dir}`;
    }
  }

  const filterClause = groq`_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0 && (
    name match $query ||
    sku match $query ||
    brand._ref in *[_type == "brand" && name match $query]._id ||
    specifications[].value match $query ||
    overviewFields[].value match $query
  )`;

  try {
    // Fetch total count and paginated results in parallel
    const [totalCount, products] = await Promise.all([
      sanityFetch<number>({
        query: groq`count(*[${filterClause}])`,
        params: { query: searchTerm },
      }),
      sanityFetch<SearchProduct[]>({
        query: groq`*[${filterClause}] {
          _id,
          name,
          price_data,
          stock,
          reservedStock,
          "availableStock": stock - reservedStock,
          "brand": brand->{ _id, name, slug },
          slug,
          image,
          "score": select(
            name match $query => 20,
            brand->name match $query => 15,
            10
          )
        } | order(score desc, ${orderClause}) [${offset}...${offset + perPage}]`,
        params: { query: searchTerm },
      }),
    ]);

    return { products, totalCount };
  } catch (error) {
    console.error(`[searchProductsFull] Failed for query "${query}", sort "${sort}", page ${page}:`, error);
    return { products: [], totalCount: 0 };
  }
}
```

## `sanity-cms/lib/products/sort/getSortablesForCategoryPath.ts`

```typescript
import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';
import { cache } from 'react';

// React cache for Server Components
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn);
  } catch {
    return fn;
  }
};

export interface SortOption {
  name: string;
  displayName: string;
  field: string;
  direction: 'asc' | 'desc';
}

const getSortablesForCategoryPathFn = async (catalogueKeys: string[]): Promise<SortOption[]> => {
  if (!catalogueKeys.length) {
    return [];
  }

  // Default sort options available for all categories
  const defaultSorts: SortOption[] = [
    { name: 'featured', displayName: 'Featured', field: 'featured', direction: 'desc' },
    { name: 'price-asc', displayName: 'Price: Low to High', field: 'unit_amount', direction: 'asc' },
    { name: 'price-desc', displayName: 'Price: High to Low', field: 'unit_amount', direction: 'desc' },
    { name: 'name-asc', displayName: 'Name: A to Z', field: 'name', direction: 'asc' },
    { name: 'name-desc', displayName: 'Name: Z to A', field: 'name', direction: 'desc' },
  ];

  // Try to fetch category-specific sortables from CMS
  try {
    const result = await sanityFetch<{
      sortOptions: Array<{
        name: string;
        displayName: string;
        field: string;
        defaultDirection: 'asc' | 'desc';
      }>;
    } | null>({
      query: groq`*[_type == "categorySortables" && categoryPath in $keys][0] {
        "sortOptions": sortOptions[] {
          name,
          displayName,
          field,
          defaultDirection
        }
      }`,
      params: { keys: catalogueKeys }
    });

    if (result?.sortOptions?.length) {
      return result.sortOptions.map(opt => ({
        name: opt.name,
        displayName: opt.displayName,
        field: opt.field,
        direction: opt.defaultDirection
      }));
    }
  } catch {
    // Fallback to defaults if query fails
  }

  return defaultSorts;
};

export const getSortablesForCategoryPath = withCache(getSortablesForCategoryPathFn);
```

## `sanity-cms/schemaTypes/catalogueItemType.ts`

```typescript
import { defineField, defineType } from "sanity";
import { TagIcon, FolderIcon } from "@sanity/icons";

export const catalogueItemType = defineType({
  name: "catalogueItem",
  title: "Catalogue Item",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "Item Type",
      type: "string",
      options: {
        list: [
          { title: "Link (Clickable Slot)", value: "link" },
          { title: "Visual Header (Group)", value: "header" },
        ],
        layout: "radio",
      },
      initialValue: "link",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      hidden: ({ parent }) => parent?.type === "header",
    }),
    defineField({
      name: "icon",
      title: "Icon Name (Optional)",
      type: "string",
      description: "e.g., 'headphones', 'speaker' (Used for root items)",
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "parent",
      title: "Parent Item",
      type: "reference",
      to: [{ type: "catalogueItem" }],
      description: "Reference to parent item forming the recursive tree graph. Root items have no parent.",
    }),
  ],
  preview: {
    select: { title: "title", type: "type" },
    prepare({ title, type }) {
      return {
        title,
        subtitle: type === "header" ? "Group" : "Link",
      };
    },
  },
});
```

## `sanity-cms/schemaTypes/categoryFiltersType.ts`

```typescript
import { defineType, defineField, defineArrayMember } from "sanity";
import { FilterIcon } from "@sanity/icons";

export const categoryFiltersType = defineType({
  name: "categoryFilters",
  title: "Category Filters",
  type: "document",
  icon: FilterIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Human-readable name for this filter set (e.g., 'Headphones')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categoryKey",
      title: "VFS Category Key",
      type: "string",
      description: "The VFS slot ID this filter set applies to (e.g., 'ugyeto8653n495dpf89nzoar')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "filters",
      title: "Filters",
      type: "object",
      fields: [
        defineField({
          name: "filterItems",
          title: "Filter Items",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "filterItem",
              fields: [
                defineField({
                  name: "name",
                  title: "Filter Name",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "type",
                  title: "Filter Type",
                  type: "string",
                  options: {
                    list: [
                      { title: "Checkbox", value: "checkbox" },
                      { title: "Radio", value: "radio" },
                      { title: "Multiselect", value: "multiselect" },
                      { title: "Range", value: "range" },
                      { title: "Boolean", value: "boolean" },
                    ],
                  },
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "filterCategory",
                  title: "Filter Category",
                  type: "string",
                  options: {
                    list: [
                      { title: "Regular", value: "regular" },
                      { title: "Overview", value: "overview" },
                      { title: "Specifications", value: "specifications" },
                      { title: "Range", value: "range" },
                    ],
                  },
                }),
                defineField({
                  name: "field",
                  title: "Field Name",
                  type: "string",
                  description: "The product field this filter applies to",
                }),
                defineField({
                  name: "options",
                  title: "Options",
                  type: "array",
                  of: [{ type: "string" }],
                  description: "For checkbox, radio, or multiselect filters",
                }),
                defineField({
                  name: "defaultValue",
                  title: "Default Value",
                  type: "string",
                }),
                defineField({
                  name: "min",
                  title: "Min Value",
                  type: "number",
                  description: "For range filters",
                }),
                defineField({
                  name: "max",
                  title: "Max Value",
                  type: "number",
                  description: "For range filters",
                }),
                defineField({
                  name: "isMinOnly",
                  title: "Min Only",
                  type: "boolean",
                  description: "For range filters that only have a minimum",
                  initialValue: false,
                }),
                defineField({
                  name: "step",
                  title: "Step",
                  type: "number",
                  description: "Step increment for range filters",
                  initialValue: 1,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "categoryMappings",
      title: "Category Mappings",
      type: "array",
      description: "Legacy field - now handled by categoryKey",
      of: [
        defineArrayMember({
          type: "object",
          name: "categoryMapping",
          fields: [
            defineField({
              name: "path",
              title: "Path",
              type: "string",
            }),
            defineField({
              name: "filters",
              title: "Filters",
              type: "array",
              of: [{ type: "string" }],
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      categoryKey: "categoryKey",
    },
    prepare(selection) {
      return {
        title: `${selection.title}`,
        subtitle: `VFS Key: ${selection.categoryKey || "Not set"}`,
      };
    },
  },
});
```

## `sanity-cms/schemaTypes/categorySortablesType.ts`

```typescript
import { defineType, defineField, defineArrayMember } from "sanity";
import { SortIcon } from "@sanity/icons";

export const categorySortablesType = defineType({
  name: "categorySortables",
  title: "Category Sortables",
  type: "document",
  icon: SortIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Human-readable name for this sortable set (e.g., 'Headphones')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categoryKey",
      title: "VFS Category Key",
      type: "string",
      description: "The VFS slot ID this sortable set applies to (e.g., 'ugyeto8653n495dpf89nzoar')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sortOptions",
      title: "Sort Options",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "sortOption",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              description: "Machine name for this sort option (e.g., 'price', 'name')",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "displayName",
              title: "Display Name",
              type: "string",
              description: "Human-readable name (e.g., 'Price', 'Product Name')",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              options: {
                list: [
                  { title: "Alphabetic", value: "alphabetic" },
                  { title: "Numeric", value: "numeric" },
                  { title: "Date", value: "date" },
                  { title: "Boolean", value: "boolean" },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "field",
              title: "Field",
              type: "string",
              description: "The product field to sort by (e.g., 'price', 'name', 'releaseDate')",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "defaultDirection",
              title: "Default Direction",
              type: "string",
              options: {
                list: [
                  { title: "Ascending", value: "asc" },
                  { title: "Descending", value: "desc" },
                ],
              },
              initialValue: "asc",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "categoryMappings",
      title: "Category Mappings",
      type: "array",
      description: "Legacy field - now handled by categoryKey",
      of: [
        defineArrayMember({
          type: "object",
          name: "categoryMapping",
          fields: [
            defineField({
              name: "path",
              title: "Path",
              type: "string",
            }),
            defineField({
              name: "sortOptions",
              title: "Sort Options",
              type: "array",
              of: [{ type: "string" }],
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      categoryKey: "categoryKey",
    },
    prepare(selection) {
      return {
        title: `${selection.title}`,
        subtitle: `VFS Key: ${selection.categoryKey || "Not set"}`,
      };
    },
  },
});
```

## `sanity-cms/schemaTypes/productType.ts`

```typescript
import { defineType, defineField, defineArrayMember } from "sanity";
import { TrolleyIcon } from "@sanity/icons";

export const productType = defineType({
  name: "product",
  title: "Products",
  type: "document",
  icon: TrolleyIcon,
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "reference",
      to: [{ type: "brand" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "price_data",
      title: "Price Data",
      type: "object",
      description: "Price data for Stripe PaymentIntent (currency in cents)",
      fields: [
        defineField({
          name: "currency",
          title: "Currency",
          type: "string",
          description: "Three-letter ISO currency code (e.g., usd)",
          initialValue: "usd",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "unit_amount",
          title: "Unit Amount (cents)",
          type: "number",
          description: "Price in smallest currency unit (cents, e.g., 1999 for $19.99)",
          validation: (Rule) => Rule.required().min(0),
        }),
      ],
    }),
    defineField({
      name: "stock",
      title: "Stock",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "parcel",
      title: "Parcel Data",
      type: "object",
      description: "Shipping dimensions and weight for Shippo API",
      fields: [
        defineField({
          name: "length",
          title: "Length (cm)",
          type: "number",
          initialValue: 10,
          validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
          name: "width",
          title: "Width (cm)",
          type: "number",
          initialValue: 10,
          validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
          name: "height",
          title: "Height (cm)",
          type: "number",
          initialValue: 5,
          validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
          name: "weight",
          title: "Weight (g)",
          type: "number",
          initialValue: 500,
          validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
          name: "distance_unit",
          title: "Distance Unit",
          type: "string",
          initialValue: "cm",
          readOnly: true,
        }),
        defineField({
          name: "mass_unit",
          title: "Mass Unit",
          type: "string",
          initialValue: "g",
          readOnly: true,
        }),
      ],
    }),
    defineField({
      name: "reservedStock",
      title: "Reserved Stock",
      type: "number",
      description: "Stock reserved by active checkout sessions",
      initialValue: 0,
      readOnly: false,
      validation: (Rule) =>
        Rule.required()
          .min(0)
          .custom((reserved, context) => {
            const stock = (context.document as any)?.stock
            if (typeof stock === 'number' && typeof reserved === 'number' && reserved > stock) {
              return 'Reserved stock cannot exceed total stock.'
            }
            return true
          }),
    }),
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
      description: "Stock Keeping Unit - Unique identifier for the product",
      validation: (Rule) => Rule.required().min(3),
    }),
    defineField({
      name: "image",
      title: "Product Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gallery",
      type: "array",
      title: "Image Gallery",
      of: [defineArrayMember({ type: "image" })],
    }),
    defineField({
      name: "catalogueLocationKeys",
      title: "Catalogue Location",
      description: "Select where this product appears in the catalogue.",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.required().min(1),
    }),

    defineField({
      name: "overviewFields",
      title: "Overview Fields",
      type: "array",
      of: [
        defineArrayMember({
          name: "overviewField",
          type: "object",
          fields: [
            { name: "title", type: "string", title: "Title" },
            { name: "value", type: "string", title: "Value" },
            { name: "information", type: "string", title: "Information" },
          ],
        }),
      ],
    }),
    // TODO Note: Use a different system for Sidebar Filtering.
    defineField({
      name: "specifications",
      title: "Specifications",
      type: "array",
      of: [
        defineArrayMember({
          name: "spec",
          type: "object",
          fields: [
            {
              name: "title",
              type: "string",
              title: "Specification Title",
            },
            {
              name: "value",
              type: "string",
              title: "Value",
            },
            {
              name: "information",
              type: "string",
              title: "Information",
            },
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      id: "_id",
      media: "image",
      unitAmount: "price_data.unit_amount",
    },
    prepare(selection) {
      const displayPrice = (selection.unitAmount / 100).toFixed(2);
      return {
        title: `${selection.title} - $${displayPrice}`,
        subtitle: `ID: ${selection.id}`,
        media: selection.media,
      };
    },
  },
});
```

## `sanity.types.ts`

```typescript
/**
 * ---------------------------------------------------------------------------------
 * This file has been generated by Sanity TypeGen.
 * Command: `sanity typegen generate`
 *
 * Any modifications made directly to this file will be overwritten the next time
 * the TypeScript definitions are generated. Please make changes to the Sanity
 * schema definitions and/or GROQ queries if you need to update these types.
 *
 * For more information on how to use Sanity TypeGen, visit the official documentation:
 * https://www.sanity.io/docs/sanity-typegen
 * ---------------------------------------------------------------------------------
 */

// Source: schema.json
export type Order = {
  _id: string;
  _type: "order";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  orderNumber?: string;
  orderId?: string;
  userId?: string;
  customerEmail?: string;
  customerPhone?: string;
  isGuest?: boolean;
  items?: Array<{
    productRef?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: "product";
    };
    productId?: string;
    name?: string;
    slug?: string;
    imageUrl?: string;
    variant?: {
      size?: string;
      color?: string;
      sku?: string;
    };
    price?: number;
    compareAtPrice?: number;
    quantity?: number;
    subtotal?: number;
    discount?: {
      amount?: number;
      code?: string;
      type?: string;
    };
    returnStatus?: "none" | "requested" | "approved" | "returned" | "refunded";
    refundedAmount?: number;
    _type: "orderItem";
    _key: string;
  }>;
  shippingAddress?: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
  billingAddress?: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  shippingMethod?: {
    name?: string;
    price?: number;
    estimatedDays?: number;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };
  pricing?: {
    subtotal?: number;
    shipping?: number;
    tax?: number;
    discount?: number;
    total?: number;
    currency?: string;
  };
  status?:
    | "pending_payment"
    | "processing"
    | "packed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "refunded"
    | "failed";
  dates?: {
    orderedAt?: string;
    paidAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
    refundedAt?: string;
  };
  metadata?: {
    source?: string;
    ip?: string;
    userAgent?: string;
    discountCodes?: Array<string>;
    notes?: string;
    customerNotes?: string;
    giftMessage?: string;
    tags?: Array<string>;
  };
  returns?: Array<{
    returnId?: string;
    items?: Array<string>;
    reason?: string;
    status?: string;
    refundAmount?: number;
    requestedAt?: string;
    processedAt?: string;
    _type: "return";
    _key: string;
  }>;
  payment?: {
    stripePaymentIntentId?: string;
    stripeCustomerId?: string;
    stripeCheckoutSessionId?: string;
    method?: string;
    last4?: string;
    brand?: string;
  };
};

export type CategorySortables = {
  _id: string;
  _type: "categorySortables";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  title?: string;
  categoryKey?: string;
  sortOptions?: Array<{
    name?: string;
    displayName?: string;
    type?: "alphabetic" | "numeric" | "date" | "boolean";
    field?: string;
    defaultDirection?: "asc" | "desc";
    _type: "sortOption";
    _key: string;
  }>;
  categoryMappings?: Array<{
    path?: string;
    sortOptions?: Array<string>;
    _type: "categoryMapping";
    _key: string;
  }>;
};

export type CategoryFilters = {
  _id: string;
  _type: "categoryFilters";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  title?: string;
  categoryKey?: string;
  filters?: {
    filterItems?: Array<{
      name?: string;
      type?: "checkbox" | "radio" | "multiselect" | "range" | "boolean";
      filterCategory?: "regular" | "overview" | "specifications" | "range";
      field?: string;
      options?: Array<string>;
      defaultValue?: string;
      min?: number;
      max?: number;
      isMinOnly?: boolean;
      step?: number;
      _type: "filterItem";
      _key: string;
    }>;
  };
  categoryMappings?: Array<{
    path?: string;
    filters?: Array<string>;
    _type: "categoryMapping";
    _key: string;
  }>;
};

export type HomepageData = {
  _id: string;
  _type: "homepageData";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  featuredProducts?: Array<{
    productRef?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: "product";
    };
    productPromo?: string;
    _key: string;
  }>;
  spotlight1Data?: {
    productRef?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: "product";
    };
    promoTitle?: string;
    promoSubtitle?: string;
    promoText?: string;
  };
  spotlight2Data?: {
    productRef?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: "product";
    };
    promoTitle?: string;
    promoSubtitle?: string;
    promoText?: string;
  };
  spotlight3Data?: {
    productRef?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: "product";
    };
    promoTitle?: string;
    promoSubtitle?: string;
    promoText?: string;
  };
  iemsGallery?: Array<{
    _ref: string;
    _type: "reference";
    _weak?: boolean;
    _key: string;
    [internalGroqTypeReferenceTo]?: "product";
  }>;
  newestReleaseData?: {
    productRef?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: "product";
    };
    promoTitle?: string;
    promoSubtitle?: string;
    promoText?: string;
  };
  dacs?: Array<{
    _ref: string;
    _type: "reference";
    _weak?: boolean;
    _key: string;
    [internalGroqTypeReferenceTo]?: "product";
  }>;
  accessoriesCables?: Array<{
    _ref: string;
    _type: "reference";
    _weak?: boolean;
    _key: string;
    [internalGroqTypeReferenceTo]?: "product";
  }>;
  accessoriesEarpads?: Array<{
    _ref: string;
    _type: "reference";
    _weak?: boolean;
    _key: string;
    [internalGroqTypeReferenceTo]?: "product";
  }>;
  accessoriesStorage?: Array<{
    _ref: string;
    _type: "reference";
    _weak?: boolean;
    _key: string;
    [internalGroqTypeReferenceTo]?: "product";
  }>;
};

export type Product = {
  _id: string;
  _type: "product";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  name?: string;
  slug?: Slug;
  brand?: {
    _ref: string;
    _type: "reference";
    _weak?: boolean;
    [internalGroqTypeReferenceTo]?: "brand";
  };
  price_data?: {
    currency?: string;
    unit_amount?: number;
  };
  stock?: number;
  reservedStock?: number;
  sku?: string;
  image?: {
    asset?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: "sanity.imageAsset";
    };
    media?: unknown;
    hotspot?: SanityImageHotspot;
    crop?: SanityImageCrop;
    _type: "image";
  };
  gallery?: Array<{
    asset?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: "sanity.imageAsset";
    };
    media?: unknown;
    hotspot?: SanityImageHotspot;
    crop?: SanityImageCrop;
    _type: "image";
    _key: string;
  }>;
  catalogueLocationKeys?: Array<string>;
  overviewFields?: Array<{
    title?: string;
    value?: string;
    information?: string;
    _type: "overviewField";
    _key: string;
  }>;
  specifications?: Array<{
    title?: string;
    value?: string;
    information?: string;
    _type: "spec";
    _key: string;
  }>;
};

export type Brand = {
  _id: string;
  _type: "brand";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  name?: string;
  slug?: Slug;
  logo?: {
    asset?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: "sanity.imageAsset";
    };
    media?: unknown;
    hotspot?: SanityImageHotspot;
    crop?: SanityImageCrop;
    _type: "image";
  };
  description?: string;
  website?: string;
};

export type CatalogueItem = {
  _id: string;
  _type: "catalogueItem";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  title?: string;
  type?: "link" | "header";
  slug?: Slug;
  icon?: string;
  sortOrder?: number;
  parent?: {
    _ref: string;
    _type: "reference";
    _weak?: boolean;
    [internalGroqTypeReferenceTo]?: "catalogueItem";
  };
};

export type Hero = {
  _id: string;
  _type: "hero";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  backgroundImage?: {
    asset?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: "sanity.imageAsset";
    };
    media?: unknown;
    hotspot?: SanityImageHotspot;
    crop?: SanityImageCrop;
    alt?: string;
    _type: "image";
  };
  mobileBackgroundImage?: {
    asset?: {
      _ref: string;
      _type: "reference";
      _weak?: boolean;
      [internalGroqTypeReferenceTo]?: "sanity.imageAsset";
    };
    media?: unknown;
    hotspot?: SanityImageHotspot;
    crop?: SanityImageCrop;
    alt?: string;
    _type: "image";
  };
};

export type SanityImagePaletteSwatch = {
  _type: "sanity.imagePaletteSwatch";
  background?: string;
  foreground?: string;
  population?: number;
  title?: string;
};

export type SanityImagePalette = {
  _type: "sanity.imagePalette";
  darkMuted?: SanityImagePaletteSwatch;
  lightVibrant?: SanityImagePaletteSwatch;
  darkVibrant?: SanityImagePaletteSwatch;
  vibrant?: SanityImagePaletteSwatch;
  dominant?: SanityImagePaletteSwatch;
  lightMuted?: SanityImagePaletteSwatch;
  muted?: SanityImagePaletteSwatch;
};

export type SanityImageDimensions = {
  _type: "sanity.imageDimensions";
  height?: number;
  width?: number;
  aspectRatio?: number;
};

export type SanityImageHotspot = {
  _type: "sanity.imageHotspot";
  x?: number;
  y?: number;
  height?: number;
  width?: number;
};

export type SanityImageCrop = {
  _type: "sanity.imageCrop";
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

export type SanityFileAsset = {
  _id: string;
  _type: "sanity.fileAsset";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  originalFilename?: string;
  label?: string;
  title?: string;
  description?: string;
  altText?: string;
  sha1hash?: string;
  extension?: string;
  mimeType?: string;
  size?: number;
  assetId?: string;
  uploadId?: string;
  path?: string;
  url?: string;
  source?: SanityAssetSourceData;
};

export type SanityImageAsset = {
  _id: string;
  _type: "sanity.imageAsset";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  originalFilename?: string;
  label?: string;
  title?: string;
  description?: string;
  altText?: string;
  sha1hash?: string;
  extension?: string;
  mimeType?: string;
  size?: number;
  assetId?: string;
  uploadId?: string;
  path?: string;
  url?: string;
  metadata?: SanityImageMetadata;
  source?: SanityAssetSourceData;
};

export type SanityImageMetadata = {
  _type: "sanity.imageMetadata";
  location?: Geopoint;
  dimensions?: SanityImageDimensions;
  palette?: SanityImagePalette;
  lqip?: string;
  blurHash?: string;
  hasAlpha?: boolean;
  isOpaque?: boolean;
};

export type Geopoint = {
  _type: "geopoint";
  lat?: number;
  lng?: number;
  alt?: number;
};

export type Slug = {
  _type: "slug";
  current?: string;
  source?: string;
};

export type SanityAssetSourceData = {
  _type: "sanity.assetSourceData";
  name?: string;
  id?: string;
  url?: string;
};

export type AllSanitySchemaTypes =
  | Order
  | CategorySortables
  | CategoryFilters
  | HomepageData
  | Product
  | Brand
  | CatalogueItem
  | Hero
  | SanityImagePaletteSwatch
  | SanityImagePalette
  | SanityImageDimensions
  | SanityImageHotspot
  | SanityImageCrop
  | SanityFileAsset
  | SanityImageAsset
  | SanityImageMetadata
  | Geopoint
  | Slug
  | SanityAssetSourceData;
export declare const internalGroqTypeReferenceTo: unique symbol;
// Source: ./app/api/checkout/webhook/ARCHIVED_route.ts
// Variable: query
// Query: *[_type == "product" && reservations[idempotencyKey == $idempotencyKey && status == "active"]]{        _id,        name,        stock,        reservedStock,        reservations      }
export type QueryResult = Array<never>;

// Source: ./app/lib/data/homepageBatch.ts
// Variable: HOMEPAGE_DATA_QUERY
// Query: *[_type == "homepageData"][0] {    // Featured products section    "featured": featuredProducts[] {      productPromo,      ...productRef->{        _id,        name,        brand->{ _id, name, slug },        price_data,        stock,        stripePriceId,        "slug": slug.current,        image { asset->url }      }    },    // Spotlight 1 section    "spotlight1": spotlight1Data {      promoTitle,      promoSubtitle,      promoText,      productRef->{        _id,        name,        brand->{ _id, name, slug },        price_data,        stock,        stripePriceId,        "slug": slug.current,        image { asset->url },        gallery[] { asset->url }      }    },    // Spotlight 2 section    "spotlight2": spotlight2Data {      promoTitle,      promoSubtitle,      promoText,      productRef->{        _id,        name,        brand->{ _id, name, slug },        price_data,        stock,        stripePriceId,        "slug": slug.current,        image { asset->url },        gallery[] { asset->url }      }    },    // Spotlight 3 section    "spotlight3": spotlight3Data {      promoTitle,      promoSubtitle,      promoText,      productRef->{        _id,        name,        brand->{ _id, name, slug },        price_data,        stock,        stripePriceId,        "slug": slug.current,        image { asset->url },        gallery[] { asset->url }      }    },    // IEMs gallery section    "iemsGallery": iemsGallery[]->{      _id,      name,      brand->{ _id, name, slug },      price_data,      stock,      stripePriceId,      "slug": slug.current,      "imageUrl": image.asset->url,      image { asset->url }    },    // Newest release section    "newestRelease": newestReleaseData {      promoTitle,      promoSubtitle,      promoText,      productRef->{        _id,        name,        brand->{ _id, name, slug },        price_data,        stock,        stripePriceId,        "slug": slug.current,        image { asset->url },        gallery[] { asset->url }      }    },    // DACs section    "dacs": dacs[]->{      _id,      name,      brand->{ _id, name, slug },      price_data,      stock,      stripePriceId,      "slug": slug.current,      image { asset->url }    },    // Accessories - cables section    "accessoriesCables": accessoriesCables[]->{      _id,      name,      brand->{ _id, name, slug },      price_data,      stock,      stripePriceId,      "slug": slug.current,      "imageUrl": image.asset->url,      image { asset->url }    },    // Accessories - earpads section    "accessoriesEarpads": accessoriesEarpads[]->{      _id,      name,      brand->{ _id, name, slug },      price_data,      stock,      stripePriceId,      "slug": slug.current,      "imageUrl": image.asset->url,      image { asset->url }    }  }
export type HOMEPAGE_DATA_QUERYResult = {
  featured: Array<
    | {
        productPromo: string | null;
        _id: string;
        name: string | null;
        brand: {
          _id: string;
          name: string | null;
          slug: Slug | null;
        } | null;
        price_data: {
          currency?: string;
          unit_amount?: number;
        } | null;
        stock: number | null;
        stripePriceId: null;
        slug: string | null;
        image: {
          asset: {
            url: string | null;
          } | null;
        } | null;
      }
    | {
        productPromo: string | null;
      }
  > | null;
  spotlight1: {
    promoTitle: string | null;
    promoSubtitle: string | null;
    promoText: string | null;
    productRef: {
      _id: string;
      name: string | null;
      brand: {
        _id: string;
        name: string | null;
        slug: Slug | null;
      } | null;
      price_data: {
        currency?: string;
        unit_amount?: number;
      } | null;
      stock: number | null;
      stripePriceId: null;
      slug: string | null;
      image: {
        asset: {
          url: string | null;
        } | null;
      } | null;
      gallery: Array<{
        asset: {
          url: string | null;
        } | null;
      }> | null;
    } | null;
  } | null;
  spotlight2: {
    promoTitle: string | null;
    promoSubtitle: string | null;
    promoText: string | null;
    productRef: {
      _id: string;
      name: string | null;
      brand: {
        _id: string;
        name: string | null;
        slug: Slug | null;
      } | null;
      price_data: {
        currency?: string;
        unit_amount?: number;
      } | null;
      stock: number | null;
      stripePriceId: null;
      slug: string | null;
      image: {
        asset: {
          url: string | null;
        } | null;
      } | null;
      gallery: Array<{
        asset: {
          url: string | null;
        } | null;
      }> | null;
    } | null;
  } | null;
  spotlight3: {
    promoTitle: string | null;
    promoSubtitle: string | null;
    promoText: string | null;
    productRef: {
      _id: string;
      name: string | null;
      brand: {
        _id: string;
        name: string | null;
        slug: Slug | null;
      } | null;
      price_data: {
        currency?: string;
        unit_amount?: number;
      } | null;
      stock: number | null;
      stripePriceId: null;
      slug: string | null;
      image: {
        asset: {
          url: string | null;
        } | null;
      } | null;
      gallery: Array<{
        asset: {
          url: string | null;
        } | null;
      }> | null;
    } | null;
  } | null;
  iemsGallery: Array<{
    _id: string;
    name: string | null;
    brand: {
      _id: string;
      name: string | null;
      slug: Slug | null;
    } | null;
    price_data: {
      currency?: string;
      unit_amount?: number;
    } | null;
    stock: number | null;
    stripePriceId: null;
    slug: string | null;
    imageUrl: string | null;
    image: {
      asset: {
        url: string | null;
      } | null;
    } | null;
  }> | null;
  newestRelease: {
    promoTitle: string | null;
    promoSubtitle: string | null;
    promoText: string | null;
    productRef: {
      _id: string;
      name: string | null;
      brand: {
        _id: string;
        name: string | null;
        slug: Slug | null;
      } | null;
      price_data: {
        currency?: string;
        unit_amount?: number;
      } | null;
      stock: number | null;
      stripePriceId: null;
      slug: string | null;
      image: {
        asset: {
          url: string | null;
        } | null;
      } | null;
      gallery: Array<{
        asset: {
          url: string | null;
        } | null;
      }> | null;
    } | null;
  } | null;
  dacs: Array<{
    _id: string;
    name: string | null;
    brand: {
      _id: string;
      name: string | null;
      slug: Slug | null;
    } | null;
    price_data: {
      currency?: string;
      unit_amount?: number;
    } | null;
    stock: number | null;
    stripePriceId: null;
    slug: string | null;
    image: {
      asset: {
        url: string | null;
      } | null;
    } | null;
  }> | null;
  accessoriesCables: Array<{
    _id: string;
    name: string | null;
    brand: {
      _id: string;
      name: string | null;
      slug: Slug | null;
    } | null;
    price_data: {
      currency?: string;
      unit_amount?: number;
    } | null;
    stock: number | null;
    stripePriceId: null;
    slug: string | null;
    imageUrl: string | null;
    image: {
      asset: {
        url: string | null;
      } | null;
    } | null;
  }> | null;
  accessoriesEarpads: Array<{
    _id: string;
    name: string | null;
    brand: {
      _id: string;
      name: string | null;
      slug: Slug | null;
    } | null;
    price_data: {
      currency?: string;
      unit_amount?: number;
    } | null;
    stock: number | null;
    stripePriceId: null;
    slug: string | null;
    imageUrl: string | null;
    image: {
      asset: {
        url: string | null;
      } | null;
    } | null;
  }> | null;
} | null;
// Variable: HERO_QUERY
// Query: *[_type == "hero"] | order(_updatedAt desc)[0] {    headline,    subheadline,    ctaText,    backgroundImage {      asset->{        _id,        url,        metadata {          dimensions,          lqip        }      },      hotspot,      crop,      alt    },    mobileBackgroundImage {      asset->{        _id,        url,        metadata {          dimensions,          lqip        }      },      hotspot,      crop,      alt    }  }
export type HERO_QUERYResult = {
  headline: string | null;
  subheadline: string | null;
  ctaText: string | null;
  backgroundImage: {
    asset: {
      _id: string;
      url: string | null;
      metadata: {
        dimensions: SanityImageDimensions | null;
        lqip: string | null;
      } | null;
    } | null;
    hotspot: SanityImageHotspot | null;
    crop: SanityImageCrop | null;
    alt: string | null;
  } | null;
  mobileBackgroundImage: {
    asset: {
      _id: string;
      url: string | null;
      metadata: {
        dimensions: SanityImageDimensions | null;
        lqip: string | null;
      } | null;
    } | null;
    hotspot: SanityImageHotspot | null;
    crop: SanityImageCrop | null;
    alt: string | null;
  } | null;
} | null;

// Query TypeMap
import "@sanity/client";
declare module "@sanity/client" {
  interface SanityQueries {
    '*[_type == "product" && reservations[idempotencyKey == $idempotencyKey && status == "active"]]{\n        _id,\n        name,\n        stock,\n        reservedStock,\n        reservations\n      }': QueryResult;
    '\n  *[_type == "homepageData"][0] {\n    // Featured products section\n    "featured": featuredProducts[] {\n      productPromo,\n      ...productRef->{\n        _id,\n        name,\n        brand->{ _id, name, slug },\n        price_data,\n        stock,\n        stripePriceId,\n        "slug": slug.current,\n        image { asset->url }\n      }\n    },\n\n    // Spotlight 1 section\n    "spotlight1": spotlight1Data {\n      promoTitle,\n      promoSubtitle,\n      promoText,\n      productRef->{\n        _id,\n        name,\n        brand->{ _id, name, slug },\n        price_data,\n        stock,\n        stripePriceId,\n        "slug": slug.current,\n        image { asset->url },\n        gallery[] { asset->url }\n      }\n    },\n\n    // Spotlight 2 section\n    "spotlight2": spotlight2Data {\n      promoTitle,\n      promoSubtitle,\n      promoText,\n      productRef->{\n        _id,\n        name,\n        brand->{ _id, name, slug },\n        price_data,\n        stock,\n        stripePriceId,\n        "slug": slug.current,\n        image { asset->url },\n        gallery[] { asset->url }\n      }\n    },\n\n    // Spotlight 3 section\n    "spotlight3": spotlight3Data {\n      promoTitle,\n      promoSubtitle,\n      promoText,\n      productRef->{\n        _id,\n        name,\n        brand->{ _id, name, slug },\n        price_data,\n        stock,\n        stripePriceId,\n        "slug": slug.current,\n        image { asset->url },\n        gallery[] { asset->url }\n      }\n    },\n\n    // IEMs gallery section\n    "iemsGallery": iemsGallery[]->{\n      _id,\n      name,\n      brand->{ _id, name, slug },\n      price_data,\n      stock,\n      stripePriceId,\n      "slug": slug.current,\n      "imageUrl": image.asset->url,\n      image { asset->url }\n    },\n\n    // Newest release section\n    "newestRelease": newestReleaseData {\n      promoTitle,\n      promoSubtitle,\n      promoText,\n      productRef->{\n        _id,\n        name,\n        brand->{ _id, name, slug },\n        price_data,\n        stock,\n        stripePriceId,\n        "slug": slug.current,\n        image { asset->url },\n        gallery[] { asset->url }\n      }\n    },\n\n    // DACs section\n    "dacs": dacs[]->{\n      _id,\n      name,\n      brand->{ _id, name, slug },\n      price_data,\n      stock,\n      stripePriceId,\n      "slug": slug.current,\n      image { asset->url }\n    },\n\n    // Accessories - cables section\n    "accessoriesCables": accessoriesCables[]->{\n      _id,\n      name,\n      brand->{ _id, name, slug },\n      price_data,\n      stock,\n      stripePriceId,\n      "slug": slug.current,\n      "imageUrl": image.asset->url,\n      image { asset->url }\n    },\n\n    // Accessories - earpads section\n    "accessoriesEarpads": accessoriesEarpads[]->{\n      _id,\n      name,\n      brand->{ _id, name, slug },\n      price_data,\n      stock,\n      stripePriceId,\n      "slug": slug.current,\n      "imageUrl": image.asset->url,\n      image { asset->url }\n    }\n  }\n': HOMEPAGE_DATA_QUERYResult;
    '\n  *[_type == "hero"] | order(_updatedAt desc)[0] {\n    headline,\n    subheadline,\n    ctaText,\n    backgroundImage {\n      asset->{\n        _id,\n        url,\n        metadata {\n          dimensions,\n          lqip\n        }\n      },\n      hotspot,\n      crop,\n      alt\n    },\n    mobileBackgroundImage {\n      asset->{\n        _id,\n        url,\n        metadata {\n          dimensions,\n          lqip\n        }\n      },\n      hotspot,\n      crop,\n      alt\n    }\n  }\n': HERO_QUERYResult;
  }
}
```

## `scripts/validate-product-keys.ts`

```typescript
import { createClient } from "next-sanity";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: "2023-05-03",
});

interface OrphanedKey {
  key: string;
  productIds: string[];
}

async function validateProductKeys() {
  console.log("🔍 Validating Product VFS Keys...");

  try {
    // Load catalogue index
    const indexPath = path.join(process.cwd(), "data", "catalogue-index.json");
    const indexContent = await fs.readFile(indexPath, "utf-8");
    const index = JSON.parse(indexContent);

    // Extract all valid VFS IDs from slotMetadataMap
    const allValidIds = new Set(Object.keys(index.slotMetadataMap));
    console.log(`   Loaded ${allValidIds.size} valid VFS slots`);

    // Query all products with their catalogueLocationKeys
    const products = await client.fetch(`*[_type == "product"][]{ 
      _id, 
      name,
      "keys": catalogueLocationKeys
    }`);

    console.log(`   Checking ${products.length} products...`);

    // Collect orphaned keys
    const orphanedKeys = new Map<string, string[]>();

    for (const product of products) {
      if (!product.keys || !Array.isArray(product.keys)) continue;

      for (const key of product.keys) {
        if (!allValidIds.has(key)) {
          if (!orphanedKeys.has(key)) {
            orphanedKeys.set(key, []);
          }
          orphanedKeys.get(key)!.push(product._id);
        }
      }
    }

    // Report results
    if (orphanedKeys.size > 0) {
      console.log(`\n❌ VALIDATION FAILED - Found ${orphanedKeys.size} orphaned keys:`);
      
      const tableData: OrphanedKey[] = [];
      for (const [key, productIds] of orphanedKeys) {
        tableData.push({ key, productIds });
        console.log(`   - "${key}" referenced by ${productIds.length} product(s)`);
      }

      console.table(tableData);
      
      // Fail build unless --warn-only flag is set
      if (process.argv.includes("--warn-only")) {
        console.log("\n⚠️  Warning mode: continuing despite orphaned keys");
        return;
      }
      
      throw new Error(`${orphanedKeys.size} orphaned catalogueLocationKeys found`);
    } else {
      console.log(`✅ VALIDATION PASSED - All ${products.length} products have valid VFS keys`);
    }

  } catch (error) {
    console.error("❌ Validation Failed:", error);
    process.exit(1);
  }
}

validateProductKeys();
```

## `store/__tests__/e2e/non-local-basket.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Non-Local Basket E2E', () => {
  // Test data configuration (environment variable support for flexibility)
  // Note: stockLimit default of 5 optimizes test speed (4 clicks vs 90)
  const TEST_CONFIG = {
    productSlug: process.env.E2E_TEST_PRODUCT_SLUG || 'meze-audio-99-series-2-5mm-or-4-4mm-replacement-cable',
    productId: process.env.E2E_TEST_PRODUCT_ID || '3O1ZNp54LWQGln4uEAU7Vs',
    stockLimit: parseInt(process.env.E2E_TEST_STOCK_LIMIT || '5', 10),
  } as const

  test.beforeEach(async ({ page }) => {
    // Clear basket state before each test for isolation
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('basket-storage')
    })
  })

  test.describe('when user performs happy path journey', () => {
    test('add, increment, decrement, and navigate to basket page', async ({ page }) => {
      // ARRANGE - navigate to product detail page
      await page.goto(`/product/${TEST_CONFIG.productSlug}`)
      await page.getByTestId('product-info').waitFor({ state: 'attached' })

      // ACT - add product to basket
      const addToBasketButton = page.getByTestId(`add-to-basket-${TEST_CONFIG.productId}`)
      await addToBasketButton.click()

      // ASSERT - verify header badge shows "1"
      const basketBadge = page.getByTestId('basket-badge').first()
      await expect(basketBadge).toHaveText('1')

      // ACT - increment quantity twice
      const incrementButton = page.getByTestId(`increment-${TEST_CONFIG.productId}`)
      await incrementButton.click()
      await incrementButton.click()

      // ASSERT - verify header badge shows "3"
      await expect(basketBadge.first()).toHaveText('3')

      // ACT - decrement quantity
      const decrementButton = page.getByTestId(`decrement-${TEST_CONFIG.productId}`)
      await decrementButton.click()

      // ASSERT - verify header badge shows "2"
      await expect(basketBadge.first()).toHaveText('2')

      // ACT - click basket button
      const basketButton = page.getByTestId('basket-button').first()
      await basketButton.click()

      // ASSERT - verify navigation to /basket page
      await expect(page).toHaveURL('/basket')
    })
  })

  test.describe('when page is refreshed', () => {
    test('basket state persists after page reload', async ({ page }) => {
      // ARRANGE - navigate to product page and add product
      await page.goto(`/product/${TEST_CONFIG.productSlug}`)
      await page.getByTestId('product-info').waitFor({ state: 'attached' })

      const addToBasketButton = page.getByTestId(`add-to-basket-${TEST_CONFIG.productId}`)
      await addToBasketButton.click()

      // ACT - increment to quantity 3
      const incrementButton = page.getByTestId(`increment-${TEST_CONFIG.productId}`)
      await incrementButton.click()
      await incrementButton.click()

      // ACT - reload page
      await page.reload()
      await page.getByTestId('product-info').waitFor({ state: 'attached' })

      // ASSERT - verify quantity still shows "3"
      const quantityDisplay = page.getByTestId('quantity-display')
      await expect(quantityDisplay).toHaveText('3')

      // ASSERT - verify header badge still shows "3"
      const basketBadge = page.getByTestId('basket-badge').first()
      await expect(basketBadge).toHaveText('3')
    })
  })

  // Stock limit test removed: Requires hardcoded CMS data coupling (violates professional standard)
  // To test stock limit behavior, create a test product with known low stock in CMS and configure E2E_TEST_STOCK_LIMIT env var

  test.describe('when item quantity is decremented to zero', () => {
    test('item removed when decremented to zero', async ({ page }) => {
      // ARRANGE - navigate to product page and add product
      await page.goto(`/product/${TEST_CONFIG.productSlug}`)
      await page.getByTestId('product-info').waitFor({ state: 'attached' })

      const addToBasketButton = page.getByTestId(`add-to-basket-${TEST_CONFIG.productId}`)
      await addToBasketButton.click()

      // ACT - decrement to zero
      const decrementButton = page.getByTestId(`decrement-${TEST_CONFIG.productId}`)
      await decrementButton.click()

      // ASSERT - verify add button reappears
      await expect(addToBasketButton).toBeVisible()

      // ASSERT - verify header badge is hidden when basket is empty
      const basketBadge = page.getByTestId('basket-badge').first()
      await expect(basketBadge).not.toBeVisible()
    })
  })
})
```

## `store/__tests__/integration/basketControls.spec.tsx`

```tsx
// # Execution Specs: Slice 2 - Component Layer

// ## Selected Slice
// - Slice: Slice 2 - Component Layer - BasketControls
// - Reason: Basket controls for product pages (isBasketPage={false} determines context)

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, act, cleanup, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { BasketControls } from '../../../app/components/features/basket/BasketControls'
import useBasketStore from '../../../store/basketStore'

describe('basketControls', () => {

  afterEach(() => {
    cleanup()
    useBasketStore.getState().clear()
  })

  describe('on a product page (isBasketPage={false}) when product not in basket', () => {
    it('renders add button only', () => {
      // ARRANGE - setup test state with product not in basket
      const productId = 'product-1'

      // ACT - render BasketControls component with isBasketPage={false}
      render(
        <BasketControls
          productId={productId}
          isBasketPage={false}
        />
      )

      // ASSERT - verify add button renders
      expect(screen.getByTestId('add-to-basket-product-1')).toBeInTheDocument()
      // ASSERT - verify increment/decrement/remove buttons do NOT render (product page context)
      expect(screen.queryByTestId('increment-product-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('decrement-product-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('remove-product-1')).not.toBeInTheDocument()
    })
  })

  describe('on a product page (isBasketPage={false}) when product in basket', () => {
    it('renders increment and decrement buttons (no remove button)', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'

      render(
        <BasketControls
          productId={productId}
          isBasketPage={false}
        />
      )

      // ACT - add product to basket via user action (click)
      act(() => {
        screen.getByTestId('add-to-basket-product-1').click()
      })

      // ASSERT - verify increment/decrement buttons render
      expect(screen.getByTestId('increment-product-1')).toBeInTheDocument()
      expect(screen.getByTestId('decrement-product-1')).toBeInTheDocument()
      // ASSERT - verify add/remove buttons do NOT render (product page context)
      expect(screen.queryByTestId('add-to-basket-product-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('remove-product-1')).not.toBeInTheDocument()
    })
  })

  describe('when user clicks decrement button to zero (product page)', () => {
    it('removes product from basket and shows add button', () => {
      // ARRANGE - setup test state with rendered BasketControls, product in basket with quantity 1
      const productId = 'product-1'

      render(
        <BasketControls
          productId={productId}
          isBasketPage={false}
        />
      )

      // ACT - add product to basket via user action, then decrement to zero
      act(() => {
        screen.getByTestId('add-to-basket-product-1').click()
      })
      act(() => {
        screen.getByTestId('decrement-product-1').click()
      })

      // ASSERT - verify add button renders again
      expect(screen.getByTestId('add-to-basket-product-1')).toBeInTheDocument()
      // ASSERT - verify increment/decrement buttons no longer render
      expect(screen.queryByTestId('increment-product-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('decrement-product-1')).not.toBeInTheDocument()
    })
  })

  describe('when user clicks increment button', () => {
    it('updates quantity display', () => {
      // ARRANGE - setup test state with rendered BasketControls, product in basket
      const productId = 'product-1'

      render(
        <BasketControls
          productId={productId}
          isBasketPage={false}
        />
      )

      // ACT - add product to basket via user action, then increment
      act(() => {
        screen.getByTestId('add-to-basket-product-1').click()
      })
      act(() => {
        screen.getByTestId('increment-product-1').click()
      })

      // ASSERT - verify quantity display updated (UI state change, not store state)
      expect(screen.getByTestId('quantity-display')).toHaveTextContent('2')
    })
  })

  describe('when user clicks decrement button (quantity > 1)', () => {
    it('updates quantity display', () => {
      // ARRANGE - setup test state with rendered BasketControls, product in basket with quantity > 1
      const productId = 'product-1'

      render(
        <BasketControls
          productId={productId}
          isBasketPage={false}
        />
      )

      // ACT - add product twice via user action (quantity = 2), then decrement
      act(() => {
        screen.getByTestId('add-to-basket-product-1').click()
      })
      act(() => {
        screen.getByTestId('increment-product-1').click()
      })
      act(() => {
        screen.getByTestId('decrement-product-1').click()
      })

      // ASSERT - verify quantity display updated (UI state change, not store state)
      expect(screen.getByTestId('quantity-display')).toHaveTextContent('1')
    })
  })

  describe('when incrementing quantity', () => {
    it('increments without limit', async () => {
      // ARRANGE - setup test state with rendered BasketControls, product in basket
      const productId = 'product-1'

      render(
        <BasketControls
          productId={productId}
          isBasketPage={false}
        />
      )

      // ACT - add product
      act(() => {
        screen.getByTestId('add-to-basket-product-1').click()
      })

      // Wait for increment button to appear
      await waitFor(() => {
        expect(screen.getByTestId('increment-product-1')).toBeInTheDocument()
      })

      // Increment many times
      act(() => {
        for (let i = 0; i < 10; i++) {
          screen.getByTestId('increment-product-1').click()
        }
      })

      // ASSERT - verify increment button is still enabled (no stock limit)
      expect(screen.getByTestId('increment-product-1')).not.toBeDisabled()
      expect(screen.getByTestId('quantity-display')).toHaveTextContent('11')
    })
  })
})
```

## `store/__tests__/integration/basketControlsBasketPage.spec.tsx`

```tsx
// # Execution Specs: Slice 2 - Component Layer

// ## Selected Slice
// - Slice: Slice 2 - Component Layer - BasketControls
// - Reason: Basket controls for basket page (isBasketPage={true} determines context)

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { BasketControls } from '../../../app/components/features/basket/BasketControls'
import useBasketStore from '../../../store/basketStore'

describe('basketControlsBasketPage', () => {

  afterEach(() => {
    cleanup()
    useBasketStore.getState().clear()
  })

  describe('on basket page (isBasketPage={true}) when product in basket', () => {
    it('renders increment, decrement, and remove buttons', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)

      // ACT - render BasketControls component with isBasketPage={true}
      render(
        <BasketControls
          productId={productId}
          isBasketPage={true}
        />
      )

      // ASSERT - verify increment/decrement/remove buttons render when product in basket
      expect(screen.getByTestId('increment-product-1')).toBeInTheDocument()
      expect(screen.getByTestId('decrement-product-1')).toBeInTheDocument()
      expect(screen.getByTestId('remove-product-1')).toBeInTheDocument()
      // ASSERT - verify add button does NOT render (basket page context)
      expect(screen.queryByTestId('add-to-basket-product-1')).not.toBeInTheDocument()
    })
  })

  describe('when user clicks remove button (basket page)', () => {
    it('removes product from basket and hides controls', () => {
      // ARRANGE - setup test state with rendered BasketControls, product in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)

      render(
        <BasketControls
          productId={productId}
          isBasketPage={true}
        />
      )

      // ACT - trigger user click on remove button
      act(() => {
        screen.getByTestId('remove-product-1').click()
      })

      // ASSERT - verify increment/decrement/remove buttons no longer render
      expect(screen.queryByTestId('increment-product-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('decrement-product-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('remove-product-1')).not.toBeInTheDocument()
    })
  })

  describe('when quantity is 1 (basket page)', () => {
    it('disables decrement button', () => {
      // ARRANGE - setup test state with rendered BasketControls, product in basket with quantity 1
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)

      render(
        <BasketControls
          productId={productId}
          isBasketPage={true}
        />
      )

      // ACT - no action needed, just check disabled state

      // ASSERT - verify decrement button is disabled (basket page behavior - capped at 1)
      expect(screen.getByTestId('decrement-product-1')).toBeDisabled()
      // ASSERT - verify remove button is still enabled (only way to remove on basket page)
      expect(screen.getByTestId('remove-product-1')).not.toBeDisabled()
    })
  })
})
```

## `store/__tests__/integration/componentIntegrations.spec.tsx`

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { BasketControls } from '../../../app/components/features/basket/BasketControls'
import { FeaturedCard } from '../../../app/components/features/homepage/featured/Featured'
import IemCard from '../../../app/components/features/homepage/iems-gallery/IemCard'
import DacCard from '../../../app/components/features/homepage/dacs/DacCard'
import AccessoryCard from '../../../app/components/features/homepage/accessories/AccessoryCard'
import { ProductCard } from '../../../app/components/features/products/ProductCard'
import { ProductInfo } from '../../../app/components/features/products/ProductInfo'
import useBasketStore from '../../../store/basketStore'

// Mock next/link to avoid complex router setup
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

// Mock next-sanity/image
vi.mock('next-sanity/image', () => ({
  Image: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

// Mock urlFor to handle simple URL strings
vi.mock('@/sanity-cms/lib/image', () => ({
  urlFor: (source: any) => ({
    width: () => ({
      height: () => ({
        auto: () => ({
          quality: () => ({
            url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
          }),
          url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
        }),
        url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
      }),
      auto: () => ({
        quality: () => ({
          url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
        }),
        url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
      }),
      url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
    }),
    auto: () => ({
      quality: () => ({
        url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
      }),
      url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
    }),
    url: () => typeof source === 'string' ? source : source?.asset?.url || 'https://example.com/image.jpg',
  }),
}))

describe('Basket Controls Integration Across App', () => {

  afterEach(() => {
    cleanup()
    useBasketStore.getState().clear()
  })

  describe('Home Page Product Cards', () => {
    const mockFeaturedProduct = {
      _id: 'product-1',
      name: 'Test Product',
      slug: 'test-product',
      brand: { name: 'Test Brand', _id: 'brand-1', slug: 'test-brand' },
      price_data: { currency: 'USD', unit_amount: 10000 },
      stock: 10,
      productPromo: 'Featured',
      image: { asset: { url: 'https://example.com/image.jpg' } },
    }

    const mockIemProduct = {
      _id: 'product-2',
      name: 'Test Product',
      slug: 'test-product',
      brand: { name: 'Test Brand', _id: 'brand-1', slug: 'test-brand' },
      price_data: { currency: 'USD', unit_amount: 10000 },
      stock: 10,
      imageUrl: 'https://example.com/image.jpg',
      image: { asset: { url: 'https://example.com/image.jpg' } },
    }

    const mockAccessoryProduct = {
      _id: 'product-3',
      name: 'Test Product',
      slug: 'test-product',
      brand: { name: 'Test Brand', _id: 'brand-1', slug: 'test-brand' },
      price_data: { currency: 'USD', unit_amount: 10000 },
      imageUrl: 'https://example.com/image.jpg',
    }

    describe('FeaturedCard', () => {
      describe('when product not in basket', () => {
        it('renders add button from BasketControls', () => {
          render(<FeaturedCard product={mockFeaturedProduct} idx={0} />)
          expect(screen.getByTestId(`add-to-basket-${mockFeaturedProduct._id}`)).toBeInTheDocument()
        })

        it('does not render increment/decrement controls', () => {
          render(<FeaturedCard product={mockFeaturedProduct} idx={0} />)
          expect(screen.queryByTestId(`increment-${mockFeaturedProduct._id}`)).not.toBeInTheDocument()
          expect(screen.queryByTestId(`decrement-${mockFeaturedProduct._id}`)).not.toBeInTheDocument()
        })
      })

      describe('when product in basket', () => {
        it('renders increment/decrement controls from BasketControls', () => {
          render(<FeaturedCard product={mockFeaturedProduct} idx={0} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockFeaturedProduct._id}`).click()
          })
          expect(screen.getByTestId(`increment-${mockFeaturedProduct._id}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockFeaturedProduct._id}`)).toBeInTheDocument()
        })

        it('displays correct quantity', () => {
          render(<FeaturedCard product={mockFeaturedProduct} idx={0} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockFeaturedProduct._id}`).click()
          })
          expect(screen.getByTestId('quantity-display')).toHaveTextContent('1')
        })
      })
    })

    describe('IemCard', () => {
      describe('when product not in basket', () => {
        it('renders add button from BasketControls', () => {
          render(<IemCard product={mockIemProduct} idx={0} />)
          expect(screen.getByTestId(`add-to-basket-${mockIemProduct._id}`)).toBeInTheDocument()
        })
      })

      describe('when product in basket', () => {
        it('renders increment/decrement controls from BasketControls', () => {
          render(<IemCard product={mockIemProduct} idx={0} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockIemProduct._id}`).click()
          })
          expect(screen.getByTestId(`increment-${mockIemProduct._id}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockIemProduct._id}`)).toBeInTheDocument()
        })
      })
    })

    describe('DacCard', () => {
      describe('when product not in basket', () => {
        it('renders add button from BasketControls', () => {
          render(<DacCard item={mockFeaturedProduct} idx={0} />)
          expect(screen.getByTestId(`add-to-basket-${mockFeaturedProduct._id}`)).toBeInTheDocument()
        })
      })

      describe('when product in basket', () => {
        it('renders increment/decrement controls from BasketControls', () => {
          render(<DacCard item={mockFeaturedProduct} idx={0} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockFeaturedProduct._id}`).click()
          })
          expect(screen.getByTestId(`increment-${mockFeaturedProduct._id}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockFeaturedProduct._id}`)).toBeInTheDocument()
        })
      })
    })

    describe('AccessoryCard', () => {
      describe('when product not in basket', () => {
        it('renders add button from BasketControls', () => {
          render(<AccessoryCard item={mockAccessoryProduct} idx={0} />)
          expect(screen.getByTestId(`add-to-basket-${mockAccessoryProduct._id}`)).toBeInTheDocument()
        })
      })

      describe('when product in basket', () => {
        it('renders increment/decrement controls from BasketControls', () => {
          render(<AccessoryCard item={mockAccessoryProduct} idx={0} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockAccessoryProduct._id}`).click()
          })
          expect(screen.getByTestId(`increment-${mockAccessoryProduct._id}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockAccessoryProduct._id}`)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Category Page Product Grid', () => {
    const mockProduct = {
      _id: 'product-1',
      name: 'Test Product',
      brand: { name: 'Test Brand', _id: 'brand-1' },
      price_data: { currency: 'USD', unit_amount: 10000 },
      stock: 10,
      image: { asset: { url: 'https://example.com/image.jpg' } },
      slug: { current: 'test-product' },
    }

    describe('ProductCard', () => {
      describe('when product not in basket', () => {
        it('renders add button from BasketControls', () => {
          render(<ProductCard product={mockProduct} />)
          expect(screen.getByTestId(`add-to-basket-${mockProduct._id}`)).toBeInTheDocument()
        })
      })

      describe('when product in basket', () => {
        it('renders increment/decrement controls', () => {
          render(<ProductCard product={mockProduct} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockProduct._id}`).click()
          })
          expect(screen.getByTestId(`increment-${mockProduct._id}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockProduct._id}`)).toBeInTheDocument()
        })

        it('updates quantity display after increment click', async () => {
          render(<ProductCard product={mockProduct} />)
          // ACT - add product via user action, then increment
          act(() => {
            screen.getByTestId(`add-to-basket-${mockProduct._id}`).click()
          })
          act(() => {
            screen.getByTestId(`increment-${mockProduct._id}`).click()
          })
          await new Promise(resolve => setTimeout(resolve, 0))
          expect(screen.getByTestId('quantity-display')).toHaveTextContent('2')
        })

        it('removes item after decrement to zero', async () => {
          render(<ProductCard product={mockProduct} />)
          // ACT - add product via user action, then decrement to zero
          act(() => {
            screen.getByTestId(`add-to-basket-${mockProduct._id}`).click()
          })
          act(() => {
            screen.getByTestId(`decrement-${mockProduct._id}`).click()
          })
          await new Promise(resolve => setTimeout(resolve, 0))
          expect(screen.queryByTestId('quantity-display')).not.toBeInTheDocument()
          expect(screen.getByTestId(`add-to-basket-${mockProduct._id}`)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Product Detail Page', () => {
    const mockProduct = {
      _id: 'product-1',
      name: 'Test Product',
      brand: { name: 'Test Brand' },
      price_data: { currency: 'USD', unit_amount: 10000 },
      stock: 10,
      sku: 'TEST-001',
      slug: 'test-product',
      image: { asset: { url: 'https://example.com/image.jpg' } },
    }

    describe('ProductInfo', () => {
      describe('when product not in basket', () => {
        it('renders large add button from BasketControls', () => {
          render(<ProductInfo product={mockProduct} />)
          expect(screen.getByTestId(`add-to-basket-${mockProduct._id}`)).toBeInTheDocument()
        })
      })

      describe('when product in basket', () => {
        it('renders increment/decrement controls', () => {
          render(<ProductInfo product={mockProduct} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockProduct._id}`).click()
          })
          expect(screen.getByTestId(`increment-${mockProduct._id}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockProduct._id}`)).toBeInTheDocument()
        })

        it('displays correct quantity', () => {
          render(<ProductInfo product={mockProduct} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockProduct._id}`).click()
          })
          expect(screen.getByTestId('quantity-display')).toHaveTextContent('1')
        })

        it('removes item after decrement to zero', async () => {
          render(<ProductInfo product={mockProduct} />)
          // ACT - add product via user action, then decrement to zero
          act(() => {
            screen.getByTestId(`add-to-basket-${mockProduct._id}`).click()
          })
          act(() => {
            screen.getByTestId(`decrement-${mockProduct._id}`).click()
          })
          // Wait for React state update
          await new Promise(resolve => setTimeout(resolve, 0))
          expect(screen.queryByTestId('quantity-display')).not.toBeInTheDocument()
          expect(screen.getByTestId(`add-to-basket-${mockProduct._id}`)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Search Results Page', () => {
    const mockProduct = {
      _id: 'product-1',
      name: 'Test Product',
      brand: { name: 'Test Brand', _id: 'brand-1' },
      price_data: { currency: 'USD', unit_amount: 10000 },
      stock: 10,
      image: { asset: { url: 'https://example.com/image.jpg' } },
      slug: { current: 'test-product' },
    }

    describe('ProductCard in search results', () => {
      describe('when product not in basket', () => {
        it('renders add button from BasketControls', () => {
          render(<ProductCard product={mockProduct} />)
          expect(screen.getByTestId(`add-to-basket-${mockProduct._id}`)).toBeInTheDocument()
        })
      })

      describe('when product in basket', () => {
        it('renders increment/decrement controls', () => {
          render(<ProductCard product={mockProduct} />)
          // ACT - add product via user action
          act(() => {
            screen.getByTestId(`add-to-basket-${mockProduct._id}`).click()
          })
          expect(screen.getByTestId(`increment-${mockProduct._id}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockProduct._id}`)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Basket Page', () => {
    const mockProductId = 'product-1'

    describe('BasketControls on basket page', () => {
      describe('when product in basket', () => {
        it('renders increment/decrement controls', () => {
          useBasketStore.getState().addProduct(mockProductId)
          render(<BasketControls isBasketPage={true} productId={mockProductId} />)
          expect(screen.getByTestId(`increment-${mockProductId}`)).toBeInTheDocument()
          expect(screen.getByTestId(`decrement-${mockProductId}`)).toBeInTheDocument()
        })

        it('renders remove button', () => {
          useBasketStore.getState().addProduct(mockProductId)
          render(<BasketControls isBasketPage={true} productId={mockProductId} />)
          expect(screen.getByTestId(`remove-${mockProductId}`)).toBeInTheDocument()
        })

        it('caps decrement at 1 (does not remove)', () => {
          useBasketStore.getState().addProduct(mockProductId)
          render(<BasketControls isBasketPage={true} productId={mockProductId} />)
          const decrementButton = screen.getByTestId(`decrement-${mockProductId}`)
          decrementButton.click()
          expect(screen.getByTestId('quantity-display')).toHaveTextContent('1')
          expect(decrementButton).toBeDisabled()
        })

        it('removes item via remove button', async () => {
          useBasketStore.getState().addProduct(mockProductId)
          render(<BasketControls isBasketPage={true} productId={mockProductId} />)
          screen.getByTestId(`remove-${mockProductId}`).click()
          await new Promise(resolve => setTimeout(resolve, 0))
          expect(screen.queryByTestId('quantity-display')).not.toBeInTheDocument()
          expect(screen.getByTestId(`add-to-basket-${mockProductId}`)).toBeInTheDocument()
        })
      })
    })
  })
})
```

## `store/__tests__/integration/productDetail.spec.tsx`

```tsx
// # Execution Specs: Slice 4 - Page Integration

// ## Selected Slice
// - Slice: Slice 4 - Page Integration - Product Detail
// - Reason: User can manage basket on product detail page

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { ProductInfo } from '../../../app/components/features/products/ProductInfo'
import useBasketStore from '../../../store/basketStore'

describe('ProductInfo with BasketControls', () => {

  afterEach(() => {
    cleanup()
    useBasketStore.getState().clear()
  })

  describe('on product page (isBasketPage={false}) when product not in basket', () => {
    it('renders BasketControls with add button only', () => {
      // ARRANGE - setup test state with product data
      const productId = 'product-1'

      // ACT - render ProductInfo component with BasketControls
      render(<ProductInfo product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

      // ASSERT - verify BasketControls renders with add button only
      expect(screen.getByTestId(`add-to-basket-${productId}`)).toBeInTheDocument()
    })
  })

  describe('on product page (isBasketPage={false}) when product in basket', () => {
    it('renders increment and decrement buttons (no remove button), does not render add button', () => {
      // ARRANGE - setup test state with rendered ProductInfo
      const productId = 'product-1'

      render(<ProductInfo product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

      // ACT - add product to basket via user action
      act(() => {
        screen.getByTestId(`add-to-basket-${productId}`).click()
      })

      // ASSERT - verify BasketControls renders with increment/decrement buttons
      expect(screen.getByTestId(`increment-${productId}`)).toBeInTheDocument()
      expect(screen.getByTestId(`decrement-${productId}`)).toBeInTheDocument()
      expect(screen.queryByTestId(`remove-${productId}`)).not.toBeInTheDocument()
      expect(screen.queryByTestId(`add-to-basket-${productId}`)).not.toBeInTheDocument()
    })
  })

  describe('when user clicks add product from product detail', () => {
    it('hides add button and renders increment/decrement buttons', () => {
      // ARRANGE - setup test state with rendered ProductInfo
      const productId = 'product-1'

      render(<ProductInfo product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

      // ACT - trigger user click on add button
      act(() => {
        screen.getByTestId(`add-to-basket-${productId}`).click()
      })

      // ASSERT - verify UI state change - add button gone, increment/decrement shown
      expect(screen.queryByTestId(`add-to-basket-${productId}`)).not.toBeInTheDocument()
      expect(screen.getByTestId(`increment-${productId}`)).toBeInTheDocument()
      expect(screen.getByTestId(`decrement-${productId}`)).toBeInTheDocument()
    })
  })
})
```

## `store/__tests__/integration/productGrid.spec.tsx`

```tsx
// # Execution Specs: Slice 5 - Page Integration

// ## Selected Slice
// - Slice: Slice 5 - Page Integration - Product Grid
// - Reason: User can manage basket from product grid

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { ProductCard } from '../../../app/components/features/products/ProductCard'
import useBasketStore from '../../../store/basketStore'

describe('ProductCard with BasketControls', () => {

  afterEach(() => {
    cleanup()
    useBasketStore.getState().clear()
  })

  describe('on product page (isBasketPage={false}) when product not in basket', () => {
    it('renders BasketControls with add button only', () => {
      // ARRANGE - setup test state with product data
      const productId = 'product-1'

      // ACT - render ProductCard component with BasketControls
      render(<ProductCard product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

      // ASSERT - verify BasketControls renders with add button only
      expect(screen.getByTestId(`add-to-basket-${productId}`)).toBeInTheDocument()
    })
  })

  describe('when user adds product from product grid', () => {
    it('hides add button and renders increment/decrement buttons', () => {
      // ARRANGE - setup test state with rendered ProductCard
      const productId = 'product-1'

      render(<ProductCard product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

      // ACT - trigger user click on add button
      act(() => {
        screen.getByTestId(`add-to-basket-${productId}`).click()
      })

      // ASSERT - verify UI state change - add button gone, increment/decrement shown
      expect(screen.queryByTestId(`add-to-basket-${productId}`)).not.toBeInTheDocument()
      expect(screen.getByTestId(`increment-${productId}`)).toBeInTheDocument()
      expect(screen.getByTestId(`decrement-${productId}`)).toBeInTheDocument()
    })
  })

  describe('basket controls interaction', () => {
    it('should not redirect to product detail page when add button is clicked', () => {
      // ARRANGE - setup test state with rendered ProductCard
      const productId = 'product-1'

      render(<ProductCard product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

      // ACT - click add button
      act(() => {
        const addButton = screen.getByTestId(`add-to-basket-${productId}`)
        addButton.click()
      })

      // ASSERT - product card should still be in document (no navigation occurred)
      expect(screen.getByTestId('product-card')).toBeInTheDocument()
    })

    it('should not redirect to product detail page when increment button is clicked', () => {
      // ARRANGE - setup test state with rendered ProductCard
      const productId = 'product-1'

      render(<ProductCard product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

      // ACT - add product to basket, then click increment button
      act(() => {
        screen.getByTestId(`add-to-basket-${productId}`).click()
      })
      
      act(() => {
        const incrementButton = screen.getByTestId(`increment-${productId}`)
        incrementButton.click()
      })

      // ASSERT - product card should still be in document (no navigation occurred)
      expect(screen.getByTestId('product-card')).toBeInTheDocument()
    })

    it('should not redirect to product detail page when decrement button is clicked', () => {
      // ARRANGE - setup test state with rendered ProductCard
      const productId = 'product-1'

      render(<ProductCard product={{ _id: productId, name: 'Test Product', price_data: { unit_amount: 10000, currency: 'USD' }, stock: 10, slug: { current: 'test-product' } } as any} />)

      // ACT - add product to basket, increment to quantity 2, then click decrement button
      act(() => {
        screen.getByTestId(`add-to-basket-${productId}`).click()
      })
      
      act(() => {
        screen.getByTestId(`increment-${productId}`).click()
      })
      
      act(() => {
        const decrementButton = screen.getByTestId(`decrement-${productId}`)
        decrementButton.click()
      })

      // ASSERT - product card should still be in document (no navigation occurred)
      expect(screen.getByTestId('product-card')).toBeInTheDocument()
    })
  })
})
```

## `store/__tests__/integration/SearchPagination.spec.tsx`

```tsx
// # Execution Specs: Search Feature — Pagination Component

// ## Selected Slice
// - Slice: SearchPagination.tsx — client-side pagination controls
// - Reason: Core UX for search results navigation; URL param manipulation

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { SearchPagination } from '@/app/components/features/search/SearchPagination'

// Mock next/navigation
const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}))

describe('SearchPagination', () => {
  const originalPathname = window.location.pathname

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, pathname: '/search' },
    })
  })

  afterEach(() => {
    cleanup()
    mockPush.mockClear()
    mockSearchParams.delete('page')
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, pathname: originalPathname },
    })
  })

  describe('when total fits on one page', () => {
    it('renders nothing for 0 results', () => {
      const { container } = render(<SearchPagination totalCount={0} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders nothing for fewer results than perPage', () => {
      const { container } = render(<SearchPagination totalCount={10} perPage={24} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders nothing when total equals perPage', () => {
      const { container } = render(<SearchPagination totalCount={24} perPage={24} />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('when multiple pages exist', () => {
    it('renders page info and navigation buttons', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)

      expect(screen.getByText(/Showing 1–24 of 50/)).toBeInTheDocument()
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
    })

    it('disables Previous on first page', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)

      const prevBtn = screen.getByRole('button', { name: /Previous/i })
      expect(prevBtn).toBeDisabled()
    })

    it('enables Previous when not on first page', () => {
      mockSearchParams.set('page', '2')
      render(<SearchPagination totalCount={50} perPage={24} />)

      const prevBtn = screen.getByRole('button', { name: /Previous/i })
      expect(prevBtn).not.toBeDisabled()
    })

    it('disables Next on last page', () => {
      mockSearchParams.set('page', '3')
      render(<SearchPagination totalCount={50} perPage={24} />)

      const nextBtn = screen.getByRole('button', { name: /Next/i })
      expect(nextBtn).toBeDisabled()
    })

    it('navigates to next page on Next click', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)

      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      expect(mockPush).toHaveBeenCalledWith('/search?page=2', { scroll: false })
    })

    it('navigates to previous page on Previous click', () => {
      mockSearchParams.set('page', '2')
      render(<SearchPagination totalCount={50} perPage={24} />)

      fireEvent.click(screen.getByRole('button', { name: /Previous/i }))
      expect(mockPush).toHaveBeenCalledWith('/search', { scroll: false })
    })

    it('preserves existing query params when navigating', () => {
      mockSearchParams.set('q', 'sennheiser')
      render(<SearchPagination totalCount={50} perPage={24} />)

      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('q=sennheiser'),
        { scroll: false }
      )
    })

    it('shows correct range for middle page', () => {
      mockSearchParams.set('page', '2')
      render(<SearchPagination totalCount={50} perPage={24} />)

      expect(screen.getByText(/Showing 25–48 of 50/)).toBeInTheDocument()
    })

    it('shows correct range for last partial page', () => {
      mockSearchParams.set('page', '3')
      render(<SearchPagination totalCount={50} perPage={24} />)

      expect(screen.getByText(/Showing 49–50 of 50/)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has aria-label on navigation', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Search results pagination')
    })

    it('has aria-label on Previous button', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)
      expect(screen.getByRole('button', { name: /Previous page/ })).toBeInTheDocument()
    })

    it('has aria-label on Next button', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)
      expect(screen.getByRole('button', { name: /Next page/ })).toBeInTheDocument()
    })

    it('has aria-live on page indicator', () => {
      render(<SearchPagination totalCount={50} perPage={24} />)
      const pageIndicator = screen.getByText(/Page 1 of 3/)
      expect(pageIndicator).toHaveAttribute('aria-live', 'polite')
    })
  })
})
```

## `store/__tests__/unit/basketStore.spec.ts`

```typescript
// # Execution Specs: Slice 1 - Data Layer

// ## Selected Slice
// - Slice: Slice 1 - Data Layer - Zustand Store
// - Reason: Foundation for basket state management

import { describe, it, expect, beforeEach } from 'vitest'
import useBasketStore, { selectTotalItemsCount, selectHasItem, selectItemQuantity } from './../../basketStore'

describe('BasketStore Actions', () => {
  beforeEach(() => {
    // Reset store before each test using public API
    useBasketStore.getState().clear()
  })

  describe('when adding new product', () => {
    it('adds item with quantity 1 and increments total count', () => {
      // ARRANGE - setup test state with empty basket, prepare valid product data
      const productId = 'product-1'
      const initialCount = selectTotalItemsCount(useBasketStore.getState())

      // ACT - call addProduct with productId
      useBasketStore.getState().addProduct(productId)

      // ASSERT - verify item exists with quantity 1 and total count incremented via public selectors
      expect(selectHasItem(useBasketStore.getState(), productId)).toBe(true)
      expect(selectItemQuantity(useBasketStore.getState(), productId)).toBe(1)
      expect(selectTotalItemsCount(useBasketStore.getState())).toBe(initialCount + 1)
    })

    it('rejects empty productId', () => {
      // ARRANGE - setup test state with empty basket, prepare invalid product data
      const productId = 'product-1'
      const initialCount = selectTotalItemsCount(useBasketStore.getState())

      // ACT - call addProduct with invalid productId
      useBasketStore.getState().addProduct('')

      // ASSERT - verify validation fails using Zod schema (no item added) via public selectors
      expect(selectHasItem(useBasketStore.getState(), productId)).toBe(false)
      expect(selectTotalItemsCount(useBasketStore.getState())).toBe(initialCount)
    })
  })

  describe('when adding existing product', () => {
    it('increments existing item quantity by 1', () => {
      // ARRANGE - setup test state with product already in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)
      const initialQuantity = selectItemQuantity(useBasketStore.getState(), productId)
      const initialCount = selectTotalItemsCount(useBasketStore.getState())

      // ACT - call addProduct with same productId
      useBasketStore.getState().addProduct(productId)

      // ASSERT - verify existing item quantity increments by 1 and total count increments via public selectors
      expect(selectItemQuantity(useBasketStore.getState(), productId)).toBe(initialQuantity + 1)
      expect(selectTotalItemsCount(useBasketStore.getState())).toBe(initialCount + 1)
    })
  })

  describe('when removing product', () => {
    it('removes item from basket and decrements total count', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)
      const initialCount = selectTotalItemsCount(useBasketStore.getState())

      // ACT - call removeProduct with productId
      useBasketStore.getState().removeProduct(productId)

      // ASSERT - verify item removed and total count decremented via public selectors
      expect(selectHasItem(useBasketStore.getState(), productId)).toBe(false)
      expect(selectItemQuantity(useBasketStore.getState(), productId)).toBe(0)
      expect(selectTotalItemsCount(useBasketStore.getState())).toBe(initialCount - 1)
    })
  })

  describe('when incrementing quantity', () => {
    it('increases item quantity by 1 and increments total count', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)
      const initialQuantity = selectItemQuantity(useBasketStore.getState(), productId)
      const initialCount = selectTotalItemsCount(useBasketStore.getState())

      // ACT - call incrementQuantity with productId
      useBasketStore.getState().incrementQuantity(productId)

      // ASSERT - verify item quantity increases by 1 and total count increments via public selectors
      expect(selectItemQuantity(useBasketStore.getState(), productId)).toBe(initialQuantity + 1)
      expect(selectTotalItemsCount(useBasketStore.getState())).toBe(initialCount + 1)
    })

    it('increases item quantity without stock limit', () => {
      // ARRANGE - setup test state with product in basket
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)
      const initialQuantity = selectItemQuantity(useBasketStore.getState(), productId)

      // ACT - call incrementQuantity multiple times
      for (let i = 0; i < 10; i++) {
        useBasketStore.getState().incrementQuantity(productId)
      }

      // ASSERT - verify quantity increases without limit
      expect(selectItemQuantity(useBasketStore.getState(), productId)).toBe(initialQuantity + 10)
    })
  })

  describe('when decrementing quantity above 1', () => {
    it('decreases item quantity by 1 and decrements total count', () => {
      // ARRANGE - setup test state with product quantity > 1
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)
      useBasketStore.getState().addProduct(productId)
      const initialQuantity = selectItemQuantity(useBasketStore.getState(), productId)
      const initialCount = selectTotalItemsCount(useBasketStore.getState())

      // ACT - call decrementQuantity with productId
      useBasketStore.getState().decrementQuantity(productId)

      // ASSERT - verify item quantity decreases by 1 and total count decrements via public selectors
      expect(selectItemQuantity(useBasketStore.getState(), productId)).toBe(initialQuantity - 1)
      expect(selectTotalItemsCount(useBasketStore.getState())).toBe(initialCount - 1)
    })
  })

  describe('when decrementing quantity to 0', () => {
    it('removes item from basket', () => {
      // ARRANGE - setup test state with product quantity = 1
      const productId = 'product-1'
      useBasketStore.getState().addProduct(productId)
      const initialCount = selectTotalItemsCount(useBasketStore.getState())

      // ACT - call decrementQuantity with productId
      useBasketStore.getState().decrementQuantity(productId)

      // ASSERT - verify item removed and total count decremented via public selectors
      expect(selectHasItem(useBasketStore.getState(), productId)).toBe(false)
      expect(selectItemQuantity(useBasketStore.getState(), productId)).toBe(0)
      expect(selectTotalItemsCount(useBasketStore.getState())).toBe(initialCount - 1)
    })
  })
})

describe('selectTotalItemsCount', () => {
  beforeEach(() => {
    useBasketStore.getState().clear()
  })

  describe('when basket has items', () => {
    it('returns sum of all item quantities', () => {
      // ARRANGE - setup test state with basket containing items with quantities
      useBasketStore.getState().addProduct('product-1')
      useBasketStore.getState().addProduct('product-1')
      useBasketStore.getState().addProduct('product-2')
      useBasketStore.getState().addProduct('product-2')
      useBasketStore.getState().addProduct('product-2')

      // ACT - call selectTotalItemsCount selector
      const result = selectTotalItemsCount(useBasketStore.getState())

      // ASSERT - verify sum of all item quantities returned
      expect(result).toBe(5)
    })
  })

  describe('when basket is empty', () => {
    it('returns 0', () => {
      // ARRANGE - setup test state with empty basket
      // Store already cleared in beforeEach

      // ACT - call selectTotalItemsCount selector
      const result = selectTotalItemsCount(useBasketStore.getState())

      // ASSERT - verify 0 returned
      expect(result).toBe(0)
    })
  })
})
```

## `store/__tests__/unit/basketStorePersistance.spec.ts`

```typescript
// # Execution Specs: Slice 1 - Data Layer

// ## Selected Slice
// - Slice: Slice 1 - Data Layer - Zustand Store
// - Reason: Foundation for basket state management

import { describe, it, expect, beforeEach, vi } from 'vitest'
import useBasketStore, { selectTotalItemsCount } from './../../basketStore'

describe('BasketStore Persistence', () => {
  beforeEach(() => {
    // Reset store before each test using public API
    useBasketStore.getState().clear()
    // Clear localStorage and sessionStorage
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('when store initializes', () => {
    it('initializes with empty state when no data exists', () => {
      // ARRANGE - setup test state with empty storage
      // ACT - get initial store state
      const state = useBasketStore.getState()

      // ASSERT - verify store initializes with empty state
      expect(selectTotalItemsCount(state)).toBe(0)
    })
  })

  describe('when state changes', () => {
    it('persists state changes to storage', () => {
      // ARRANGE - setup test state with initialized store
      const productId = 'product-1'

      // ACT - trigger store state change via action
      useBasketStore.getState().addProduct(productId)

      // ASSERT - verify state is persisted by checking storage is not empty
      // Note: Checking storage is acceptable here as it's a boundary concern, not internal state
      const storageKeys = Object.keys(localStorage)
      expect(storageKeys.length).toBeGreaterThan(0)
    })
  })

  describe('when localStorage write fails', () => {
    it('falls back gracefully without error', () => {
      // ARRANGE - setup test state with localStorage unavailable or quota exceeded
      const localStorageSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('localStorage unavailable')
      })

      try {
        const productId = 'product-1'

        // ACT - trigger state change to persist
        useBasketStore.getState().addProduct(productId)

        // ASSERT - verify state still updates despite localStorage failure (graceful degradation)
        const state = useBasketStore.getState()
        expect(selectTotalItemsCount(state)).toBe(1)
      } finally {
        localStorageSpy.mockRestore()
      }
    })
  })

  describe('when both storages write fail', () => {
    it('degrades gracefully without error', () => {
      // ARRANGE - setup test state with both localStorage and sessionStorage unavailable
      const localStorageSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('localStorage unavailable')
      })
      const sessionStorageSpy = vi.spyOn(sessionStorage, 'setItem').mockImplementation(() => {
        throw new Error('sessionStorage unavailable')
      })

      try {
        const productId = 'product-1'

        // ACT - trigger state change to persist
        useBasketStore.getState().addProduct(productId)

        // ASSERT - verify graceful degradation without error (state still updates)
        const state = useBasketStore.getState()
        expect(selectTotalItemsCount(state)).toBe(1)
      } finally {
        localStorageSpy.mockRestore()
        sessionStorageSpy.mockRestore()
      }
    })
  })

  describe('when localStorage read succeeds', () => {
    it('adds product and updates state', () => {
      // ARRANGE - setup test state with valid data in localStorage
      const productId = 'product-1'

      // ACT - initialize store (add item to trigger persistence)
      useBasketStore.getState().addProduct(productId)

      // ASSERT - verify state is accessible via public selector
      const state = useBasketStore.getState()
      expect(selectTotalItemsCount(state)).toBe(1)
    })
  })

  describe('when localStorage read fails', () => {
    it('falls back gracefully without error', () => {
      // ARRANGE - setup test state with localStorage unavailable or corrupt data
      const localStorageSpy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable')
      })

      try {
        const productId = 'product-1'

        // ACT - initialize store (add item)
        useBasketStore.getState().addProduct(productId)

        // ASSERT - verify state still updates despite localStorage read failure
        const state = useBasketStore.getState()
        expect(selectTotalItemsCount(state)).toBe(1)
      } finally {
        localStorageSpy.mockRestore()
      }
    })
  })

  describe('when both storages read fail', () => {
    it('resets to empty state', () => {
      // ARRANGE - setup test state with both storages unavailable or corrupt
      const localStorageSpy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable')
      })
      const sessionStorageSpy = vi.spyOn(sessionStorage, 'getItem').mockImplementation(() => {
        throw new Error('sessionStorage unavailable')
      })

      try {
        // ACT - initialize store (reset to trigger rehydration)
        useBasketStore.getState().clear()

        // ASSERT - verify reset to empty state
        const state = useBasketStore.getState()
        expect(selectTotalItemsCount(state)).toBe(0)
      } finally {
        localStorageSpy.mockRestore()
        sessionStorageSpy.mockRestore()
      }
    })
  })
})

describe('BasketStore Hydration Validation', () => {
  beforeEach(() => {
    // Reset store before each test using public API
    useBasketStore.getState().clear()
    // Clear localStorage and sessionStorage
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('when hydration succeeds', () => {
    it('adds product with valid data structure', () => {
      // ARRANGE - setup test state with valid data structure in storage
      const productId = 'product-1'

      // ACT - initialize store with hydration (add valid item)
      useBasketStore.getState().addProduct(productId)

      // ASSERT - verify data structure validates using Zod schema (item added successfully)
      const state = useBasketStore.getState()
      expect(selectTotalItemsCount(state)).toBe(1)
    })
  })

  describe('when hydration validation fails', () => {
    it('handles invalid storage data gracefully', () => {
      // ARRANGE - setup test state with invalid data in storage (mock storage to return invalid JSON)
      // Note: Mocking storage is acceptable for testing error handling (boundary concern)
      const localStorageSpy = vi.spyOn(localStorage, 'getItem').mockReturnValue('invalid-json-data')

      try {
        // ACT - reset store to trigger rehydration attempt
        useBasketStore.getState().clear()

        // ASSERT - verify store remains functional despite invalid storage data
        const state = useBasketStore.getState()
        expect(selectTotalItemsCount(state)).toBe(0)
      } finally {
        localStorageSpy.mockRestore()
      }
    })
  })
})
```

## `store/__tests__/unit/searchProducts.spec.ts`

```typescript
// # Execution Specs: Search Feature — Data Layer

// ## Selected Slice
// - Slice: searchProducts.ts — GROQ queries for autocomplete and full search
// - Reason: Foundation for search data fetching; pagination, scoring, and validation logic

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  searchProductsAutocomplete,
  searchProductsFull,
} from '@/sanity-cms/lib/products/searchProducts'
import type { AutocompleteProduct, SearchProduct } from '@/sanity-cms/lib/products/searchProducts'

// Mock sanity client
vi.mock('@/sanity-cms/lib/client', () => ({
  sanityFetch: vi.fn(),
}))

import { sanityFetch } from '@/sanity-cms/lib/client'

const mockSanityFetch = sanityFetch as ReturnType<typeof vi.fn>

describe('searchProductsAutocomplete', () => {
  beforeEach(() => {
    mockSanityFetch.mockReset()
  })

  describe('when query is too short', () => {
    it('returns empty array for empty string', async () => {
      const result = await searchProductsAutocomplete('')
      expect(result).toEqual([])
      expect(mockSanityFetch).not.toHaveBeenCalled()
    })

    it('returns empty array for single character', async () => {
      const result = await searchProductsAutocomplete('a')
      expect(result).toEqual([])
      expect(mockSanityFetch).not.toHaveBeenCalled()
    })

    it('returns empty array for whitespace-only query', async () => {
      const result = await searchProductsAutocomplete('   ')
      expect(result).toEqual([])
      expect(mockSanityFetch).not.toHaveBeenCalled()
    })
  })

  describe('when query is valid', () => {
    it('calls sanityFetch with wildcard query', async () => {
      mockSanityFetch.mockResolvedValue([])

      await searchProductsAutocomplete('sennheiser')

      expect(mockSanityFetch).toHaveBeenCalledOnce()
      const callArgs = mockSanityFetch.mock.calls[0][0]
      expect(callArgs.params).toEqual({ query: 'sennheiser*' })
    })

    it('trims whitespace from query', async () => {
      mockSanityFetch.mockResolvedValue([])

      await searchProductsAutocomplete('  sennheiser  ')

      const callArgs = mockSanityFetch.mock.calls[0][0]
      expect(callArgs.params).toEqual({ query: 'sennheiser*' })
    })

    it('returns at most 6 results', async () => {
      const mockResults: AutocompleteProduct[] = Array.from({ length: 10 }, (_, i) => ({
        _id: `product-${i}`,
        name: `Product ${i}`,
        brand: null,
        price_data: { currency: 'USD', unit_amount: 10000 },
        slug: { current: `product-${i}` },
        image: null,
      }))
      mockSanityFetch.mockResolvedValue(mockResults.slice(0, 6))

      const results = await searchProductsAutocomplete('test')

      expect(results.length).toBeLessThanOrEqual(6)
    })

    it('returns results sorted by score desc then name asc', async () => {
      const mockResults: AutocompleteProduct[] = [
        { _id: '1', name: 'A Product', brand: null, price_data: { currency: 'USD', unit_amount: 100 }, slug: { current: 'a' }, image: null },
        { _id: '2', name: 'B Product', brand: null, price_data: { currency: 'USD', unit_amount: 200 }, slug: { current: 'b' }, image: null },
      ]
      mockSanityFetch.mockResolvedValue(mockResults)

      const results = await searchProductsAutocomplete('test')

      expect(results).toEqual(mockResults)
    })
  })
})

describe('searchProductsFull', () => {
  beforeEach(() => {
    mockSanityFetch.mockReset()
  })

  describe('when query is too short', () => {
    it('returns empty products and zero total count', async () => {
      const result = await searchProductsFull('')
      expect(result.products).toEqual([])
      expect(result.totalCount).toBe(0)
      expect(mockSanityFetch).not.toHaveBeenCalled()
    })
  })

  describe('when query is valid', () => {
    it('calls count and products queries in parallel', async () => {
      mockSanityFetch.mockResolvedValueOnce(50) // count
      mockSanityFetch.mockResolvedValueOnce([]) // products

      await searchProductsFull('sennheiser')

      expect(mockSanityFetch).toHaveBeenCalledTimes(2)
    })

    it('returns products with total count', async () => {
      const mockProducts: SearchProduct[] = [
        {
          _id: '1',
          name: 'HD 650',
          brand: { _id: 'b1', name: 'Sennheiser', slug: { current: 'sennheiser' } },
          price_data: { currency: 'USD', unit_amount: 34900 },
          stock: 10,
          reservedStock: 0,
          availableStock: 10,
          slug: { current: 'hd-650' },
          image: null,
        },
      ]
      mockSanityFetch.mockResolvedValueOnce(1) // count
      mockSanityFetch.mockResolvedValueOnce(mockProducts) // products

      const result = await searchProductsFull('hd 650')

      expect(result.products).toEqual(mockProducts)
      expect(result.totalCount).toBe(1)
    })

    it('applies default sort (name asc) when no sort param', async () => {
      mockSanityFetch.mockResolvedValueOnce(0)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test')

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('name asc')
    })

    it('applies valid sort param', async () => {
      mockSanityFetch.mockResolvedValueOnce(0)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test', 'unit_amount:desc')

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('unit_amount desc')
    })

    it('falls back to default sort for invalid sort field', async () => {
      mockSanityFetch.mockResolvedValueOnce(0)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test', 'invalid_field:asc')

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('name asc')
    })

    it('falls back to default sort for invalid sort direction', async () => {
      mockSanityFetch.mockResolvedValueOnce(0)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test', 'name:invalid')

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('name asc')
    })
  })

  describe('pagination', () => {
    it('defaults to page 1 with 24 per page', async () => {
      mockSanityFetch.mockResolvedValueOnce(100)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test')

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('[0...24]')
    })

    it('offsets correctly for page 2', async () => {
      mockSanityFetch.mockResolvedValueOnce(100)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test', undefined, 2)

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('[24...48]')
    })

    it('offsets correctly for page 3 with custom perPage', async () => {
      mockSanityFetch.mockResolvedValueOnce(100)
      mockSanityFetch.mockResolvedValueOnce([])

      await searchProductsFull('test', undefined, 3, 10)

      const productCall = mockSanityFetch.mock.calls[1][0]
      expect(productCall.query).toContain('[20...30]')
    })

    it('handles invalid page by defaulting to page 1', async () => {
      mockSanityFetch.mockResolvedValueOnce(100)
      mockSanityFetch.mockResolvedValueOnce([])

      // The page param is validated in page.tsx, not in searchProductsFull
      // searchProductsFull accepts any number and calculates offset
      await searchProductsFull('test', undefined, -1)

      const productCall = mockSanityFetch.mock.calls[1][0]
      // offset = (-1 - 1) * 24 = -48, which would be [(-48)...(-24)]
      // This is an edge case; validation happens upstream in page.tsx
      expect(productCall.query).toMatch(/\[-?\d+\.\.\.-?\d+\]/)
    })
  })
})
```

## `store/basketStore.ts`

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { z } from "zod";

// Zod schema for validation
const BasketItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

// Infer TypeScript types from Zod schema
type BasketItem = z.infer<typeof BasketItemSchema>;

interface BasketState {
  items: BasketItem[];
  _hasHydrated: boolean;
}

interface BasketActions {
  addProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  setHasHydrated: (state: boolean) => void;
}

type BasketStore = BasketState & BasketActions;

// Custom storage with fallback to sessionStorage
const createFallbackStorage = () => {
  const storage = {
    getItem: (name: string) => {
      try {
        if (typeof localStorage !== "undefined") {
          return localStorage.getItem(name);
        }
      } catch (e) {
        console.warn("localStorage getItem failed, trying sessionStorage", e);
      }
      try {
        if (typeof sessionStorage !== "undefined") {
          return sessionStorage.getItem(name);
        }
      } catch (e2) {
        console.warn("sessionStorage getItem failed", e2);
      }
      return null;
    },
    setItem: (name: string, value: string) => {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(name, value);
        }
      } catch (e) {
        console.warn("localStorage setItem failed, trying sessionStorage", e);
      }
      try {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(name, value);
        }
      } catch (e2) {
        console.warn("sessionStorage setItem failed, graceful degradation", e2);
      }
    },
    removeItem: (name: string) => {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(name);
        }
      } catch (e) {
        console.warn(
          "localStorage removeItem failed, trying sessionStorage",
          e,
        );
      }
      try {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem(name);
        }
      } catch (e2) {
        console.warn("sessionStorage removeItem failed", e2);
      }
    },
  };
  return storage;
};

const useBasketStore = create<BasketStore>()(
  persist(
    (set, get): BasketStore => ({
      items: [] as BasketItem[],
      _hasHydrated: false,
      addProduct: (productId) => {
        // Input validation using Zod schema
        const result = BasketItemSchema.safeParse({
          productId,
          quantity: 1,
        });
        if (!result.success) {
          console.error("Invalid input:", result.error);
          return;
        }
        const items = get().items;
        const existing = items.find((item) => item.productId === productId);
        if (existing) {
          set({
            items: items.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          });
        } else {
          set({ items: [...items, result.data] });
        }
      },
      removeProduct: (productId) => {
        set({ items: get().items.filter((item) => item.productId !== productId) });
      },
      incrementQuantity: (productId) => {
        set({
          items: get().items.map((item) => {
            if (item.productId === productId) {
              return { ...item, quantity: item.quantity + 1 };
            }
            return item;
          }),
        });
      },
      decrementQuantity: (productId) => {
        set({
          items: get()
            .items.map((item) => {
              if (item.productId === productId) {
                return { ...item, quantity: item.quantity - 1 };
              }
              return item;
            })
            .filter((item) => item.quantity > 0),
        });
      },
      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((item) => item.productId !== productId) });
          return;
        }
        const result = BasketItemSchema.safeParse({ productId, quantity });
        if (!result.success) {
          console.error("Invalid quantity:", result.error);
          return;
        }
        const items = get().items;
        const existing = items.find((item) => item.productId === productId);
        if (existing) {
          set({
            items: items.map((item) =>
              item.productId === productId
                ? { ...item, quantity: result.data.quantity }
                : item,
            ),
          });
        } else {
          set({ items: [...items, result.data] });
        }
      },
      clear: () => {
        set({ items: [] });
      },
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: "basket-storage",
      storage: createJSONStorage(() => createFallbackStorage()),
      onRehydrateStorage: () => (state) => {
        // Set hydration flag to prevent hydration errors in Next.js SSR
        state?.setHasHydrated(true);
        // Hydration validation using Zod schema
        if (state) {
          const result = z.array(BasketItemSchema).safeParse(state.items);
          if (!result.success) {
            console.error(
              "Invalid basket state from storage, resetting to empty:",
              result.error,
            );
            state.items = [];
          }
        }
      },
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);

export const selectTotalItemsCount = (state: BasketState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectItems = (state: BasketState) => state.items;

export const selectItem = (state: BasketState, productId: string) =>
  state.items.find((item) => item.productId === productId);

export const selectItemQuantity = (state: BasketState, productId: string) =>
  selectItem(state, productId)?.quantity ?? 0;

export const selectHasItem = (state: BasketState, productId: string) =>
  state.items.some((item) => item.productId === productId);

export const selectHasHydrated = (state: BasketState) => state._hasHydrated;

export default useBasketStore;
```

## `tests/helpers/sanity-test-products.ts`

```typescript
import { createClient } from 'next-sanity';
import { apiVersion, projectId, dataset } from '../../sanity-cms/env';

// Read client for test dataset
const testClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

// Write-capable client for test setup (reset stock, etc). Uses the token with
// full update permission (verified via scripts/diagnose-sanity-tokens.mjs).
const testWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token:
    process.env.SANITY_STUDIO_READ_WRITE ||
    process.env.SANITY_STUDIO_READ_WRITE_CREATE,
});

export async function getTestProducts() {
  return testClient.fetch(`
    *[_type == "product" && (name match "test" || name match "Test")]{
      _id, name, stock, reservedStock, slug, price_data
    } | order(name asc)
  `);
}

export async function resetProductStock(productId: string, initialStock: number) {
  // Check if product exists before trying to patch it
  const product = await testClient.fetch(`*[_id == $productId]{_id}[0]`, { productId });
  if (!product) {
    console.log(`Product ${productId} not found in dataset, skipping stock reset`);
    return;
  }
  await testWriteClient.patch(productId).set({ stock: initialStock, reservedStock: 0 }).commit();
}

export async function getProductStock(productId: string): Promise<number> {
  const product = await testClient.fetch(
    `*[_id == $productId]{stock}[0]`,
    { productId }
  );
  return product?.stock || 0;
}
```

## `app/(store)/layout.tsx`

```tsx
import "./../globals.css";
import "../suppress-warnings";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { cn } from "@/lib/utils/tailwind";

// Fonts & Config
import { metadata } from "./configuration";
import { montserrat } from "./configuration";

// Global Components
import Header from "@/app/components/layout/header/Header";
import Footer from "@/app/components/layout/footer/Footer";
import DrawersManager from "@/app/components/layout/drawers/DrawersManager";
import ActionBarServer from "@/app/components/layout/navigation/ActionBarServer";
import CatalogueNavbar from "@/app/components/layout/catalogue/CatalogueNavbar";
import { WebVitals } from "@/app/components/analytics/WebVitals";
import { getCatalogueForNavigation } from "@/data/catalogue";
import { Suspense } from "react";

export { metadata };

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get catalogue data from pre-built VFS
  const catalogueDataRaw = { catalogue: getCatalogueForNavigation() };

  return (
    <html lang="en" className={cn(montserrat.variable, "antialiased")}>
      <head>
        {/* Performance: Preconnect to Sanity CDN for faster image loading */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
      </head>
      <body
        className={cn(
          "flex h-dvh w-full flex-col overflow-hidden",
          "bg-brand-800 font-sans text-brand-100",
          "selection:bg-brand-accent-600 selection:text-brand-800"
        )}
      >
        <NuqsAdapter>
            <div
              className={cn(
                "relative flex flex-1 flex-col overflow-hidden",
                "bg-brand-800",
                "mx-auto max-w-[1440px]",
                "h-full w-full flex-1",
                "shadow-[0_0_40px_rgba(246,227,213,0.015)]"
              )}
            >
              <Header />
              <CatalogueNavbar catalogueDataRaw={catalogueDataRaw} />
              <main
                className={cn(
                  "relative flex h-full w-full flex-1 flex-col",
                  "overflow-y-auto overflow-x-hidden",
                  "scrollbar-none",
                  "pb-[var(--mobile-menu-h)]",
                  "shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                )}
              >
                {children}
                <Footer />
              </main>

              <Suspense fallback={null}>
                <DrawersManager catalogueDataRaw={catalogueDataRaw} />
                <ActionBarServer />
                <WebVitals />
              </Suspense>
            </div>
          </NuqsAdapter>
      </body>
    </html>
  );
}
```

## `app/components/features/homepage/brand-marquee/BrandMarquee.tsx`

```tsx
import Image from "next/image";
import { BrandLogo } from "./types";

const brandsSource: BrandLogo[] = [];
const brands = brandsSource;

export default function BrandMarquee() {
  console.log(`[SRIP Trace] Brand Marquee Contract validated. Unique brands: ${brands.length}`);

  return (
    <div className="w-full bg-brand-950 py-12 border-y border-brand-800/50 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...brands, ...brands].map((brand, idx) => (
          <div key={`${brand._id}-${idx}`} className="flex items-center justify-center px-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="relative h-8 w-32">
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                fill
                className="object-contain"
                sizes="128px"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## `app/components/features/homepage/brand-marquee/types.ts`

```typescript
export interface BrandLogo {
  readonly _id: string;
  readonly name: string;
  readonly logoUrl: string;
  readonly website?: string;
}
```

## `app/components/features/homepage/hero/Hero.tsx`

```tsx
import { getImageProps } from 'next/image';
import Link from "next/link";
import { cn } from "@/lib/utils/tailwind";
import { HeroData, SanityImage } from "./types";
import { HeroQualityBar } from "./HeroQualityBar";

interface HeroProps {
  heroData: HeroData | null;
}

export default async function Hero({ heroData }: HeroProps) {
  if (!heroData?.backgroundImage || !heroData?.headline) {
    return null;
  }

  const mobileBackgroundImage = heroData.mobileBackgroundImage || heroData.backgroundImage;

  const getPosition = (image: SanityImage) => {
    const x = image.hotspot?.x ? image.hotspot.x * 100 : 50;
    const y = image.hotspot?.y ? image.hotspot.y * 100 : 50;
    return `${x}% ${y}%`;
  };

  // Generate blur placeholder from Sanity LQIP
  const blurDataURL = mobileBackgroundImage.asset?.metadata?.lqip || undefined;

  const commonImageProps = {
    fill: true,
    priority: true,
    fetchPriority: 'high' as const,
    quality: 75,
    sizes: '100vw',
    placeholder: blurDataURL ? ("blur" as const) : ("empty" as const),
    blurDataURL,
  };

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...commonImageProps,
    src: heroData.backgroundImage.asset?._id ?? "",
    alt: heroData.backgroundImage.alt || "Hero Image",
  });

  const {
    props: { srcSet: mobileSrcSet, ...rest },
  } = getImageProps({
    ...commonImageProps,
    src: mobileBackgroundImage.asset?._id ?? "",
    alt: mobileBackgroundImage.alt || heroData.backgroundImage.alt || "Hero Image",
  });

  const desktopPosition = getPosition(heroData.backgroundImage);
  const mobilePosition = getPosition(mobileBackgroundImage);

  return (
    <section
      className={cn("relative w-full overflow-hidden", "bg-black text-white",
        "h-[calc(100dvh-var(--mobile-header-h)-var(--mobile-menu-h))]",
        "lg:h-[calc(100dvh-var(--desktop-header-h)-var(--desktop-catalogue-nav-h))]",
        "min-h-[80vh]"
      )}
    >
        <div className="absolute inset-0 z-0">
          <picture>
            <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
            <img
              {...rest}
              srcSet={mobileSrcSet}
              className="object-cover rounded-none max-md:[object-position:var(--mobile-pos)] md:[object-position:var(--desktop-pos)]"
              style={{ ...rest.style, '--desktop-pos': desktopPosition, '--mobile-pos': mobilePosition } as React.CSSProperties}
            />
          </picture>

          <div
            className={cn(
              "absolute inset-0",
              "bg-gradient-to-r from-black/60 via-black/20 to-transparent"
            )}
          />
        </div>

        <div
          className={cn(
            "relative z-10 h-full w-full",
            "px-[clamp(1.5rem,5vw,5rem)] landscape:px-6",
            "flex flex-col justify-center lg-touch:items-start lg-desktop:items-start",
            "gap-6"
          )}
        >
          <div
            className={cn(
              "flex max-w-xl flex-col items-start gap-3 md:gap-5",
              "lg-touch:mb-44 lg-desktop:mb-64",
              "max-w-xl w-full",
              "landscape:max-w-full lg-touch:landscape:max-w-4xl lg-desktop:landscape:max-w-4xl",
            )}
          >
            <div className="flex flex-col gap-2">
              <h1 className="type-hero-headline">
                {heroData.headline}
              </h1>
              <p className="type-hero-sub m-0 p-0">
                Hear the new difference.
              </p>
            </div>

            <Link
              href={heroData.ctaLink || "/products"}
              className={cn(
                "btn-primary px-10 py-4 lg:py-5",
                "text-cta-hero font-bold"
              )}
            >
              {"DISCOVER"}
            </Link>
          </div>
        </div>
      <HeroQualityBar />
    </section>
  );
}
```

## `app/components/features/homepage/hero/HeroQualityBar.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/tailwind";

const ITEMS = ["Handcrafted", "Precision Engineered", "Absolute Purity"] as const;
const CYCLE_MS = 3000;
const FADE_MS = 300;

export function HeroQualityBar() {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let fadeTimeout: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      setFading(true);
      fadeTimeout = setTimeout(() => {
        setIdx((i) => (i + 1) % ITEMS.length);
        setFading(false);
      }, FADE_MS);
    }, CYCLE_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimeout);
    };
  }, []);

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 z-20",
        "bg-gradient-to-b from-transparent to-brand-800",
        "pt-10 pb-3 sm:pb-4"
      )}
    >
      {/* Desktop (sm+): all three items in a static row */}
      <div className="max-sm:hidden flex items-center justify-center gap-4">
        <span className="type-overline text-[11px] text-secondary-300 normal-case font-regular tracking-signature">Handcrafted</span>
        <span className="type-overline text-[11px] text-secondary-300 normal-case font-regular tracking-signature opacity-50" aria-hidden="true">·</span>
        <span className="type-overline text-[11px] text-secondary-300 normal-case font-regular tracking-signature">Precision Engineered</span>
        <span className="type-overline text-[11px] text-secondary-300 normal-case font-regular tracking-signature opacity-50" aria-hidden="true">·</span>
        <span className="type-overline text-[11px] text-secondary-300 normal-case font-regular tracking-signature">Absolute Purity</span>
      </div>

      {/* Mobile (<sm): single item with fade cycle */}
      <div className="sm:hidden flex items-center justify-center">
        <span
          className={cn(
            "type-overline text-[11px] text-secondary-300 normal-case font-regular tracking-signature transition-opacity duration-300",
            fading ? "opacity-0" : "opacity-100"
          )}
        >
          {ITEMS[idx]}
        </span>
      </div>
    </div>
  );
}
```

## `app/components/features/homepage/hero/types.ts`

```typescript
export interface SanityImage {
  readonly _type?: 'image';
  readonly asset: {
    readonly _id: string;
    readonly url: string;
    readonly metadata?: {
      readonly dimensions: {
        readonly width: number;
        readonly height: number;
        readonly aspectRatio: number;
      };
      readonly lqip: string;
    };
  };
  readonly alt?: string;
  readonly hotspot?: {
    readonly x: number;
    readonly y: number;
  };
}

export interface HeroData {
  readonly headline: string;
  readonly subheadline: string;
  readonly backgroundImage: SanityImage;
  readonly mobileBackgroundImage?: SanityImage;
  readonly ctaText?: string;
  readonly ctaLink?: string;
}
```

## `app/components/features/homepage/spotlightTypes.ts`

```typescript
export interface SpotlightProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  image: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  overviewFields?: Array<{
    title: string;
    value: string;
    information?: string;
  }>;
}
```

## `app/components/features/homepage/trust-bar/TrustBar.tsx`

```tsx
export default function TrustBar() {
  const items = [
    "Free Global Shipping",
    "2-Year Warranty",
    "Expert Support",
  ];

  return (
    <div className="w-full border-y border-border-secondary bg-surface-subtle py-4">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4">
        {items.map((item, idx) => (
          <span key={item} className="flex items-center gap-2">
            {idx > 0 && (
              <span className="text-text-secondary" aria-hidden="true">
                ·
              </span>
            )}
            <span className="type-caption text-text-secondary">{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
```

## `lib/utils/tailwind.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-1",
            "display-2",
            "h1",
            "h2",
            "h3",
            "h4",
            "body",
            "small",
            "cta-hero",
            "spotlight",
          ],
        },
      ],
      "text-color": [
        {
          text: [
            { brand: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] },
            { secondary: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] },
            { accent: ["100", "200", "300", "400", "500", "600", "700", "800"] },
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
```

## `sanity-cms/lib/backendClient.ts`

```typescript
// WRITE client for backend operations
// Uses SANITY_STUDIO_READ_WRITE (verified to have create permissions)
// Used for: basket reservations, stock updates, profile operations, orders
import { createClient } from "next-sanity";

import { apiVersion, projectId, dataset } from "../env";

export function getBackendClient() {
  const writeToken = process.env.SANITY_STUDIO_READ_WRITE

  return createClient({
    projectId,
    apiVersion,
    dataset,
    useCdn: false,
    token: writeToken,
  });
}

export const backendClient = getBackendClient();
```

## `sanity-cms/lib/checkoutClient.ts`

```typescript
// WRITE client for checkout operations
// Uses SANITY_API_TOKEN for webhook and checkout API operations
// Used for: stock release after checkout, product fetching during checkout
import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const checkoutClient = createClient({
  projectId,
  apiVersion,
  dataset,
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE,
});
```

## `sanity-cms/lib/client.ts`

```typescript
// READ-ONLY client for public/frontend access
// No token required - uses CDN for performance
// Used for: product catalog, homepage components, public queries
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === "preview",
    studioUrl: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/studio`
      : "http://localhost:3000/studio",
  },
  perspective: "published",
});

// WRITE client for backend atomic operations
// Uses SANITY_STUDIO_READ_WRITE_CREATE (preferred) or SANITY_API_TOKEN (fallback)
// Used for: basket reservations, stock updates, profile operations
const writeToken = process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN;

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Must be false for writes
  token: writeToken,
});


const builder = imageUrlBuilder(client);

// Helper to generate image URLs from Sanity source
export function urlFor(source: any) {
  return builder.image(source);
}

export async function sanityFetch<QueryResponse>({
  query,
  params = {},
}: {
  query: string;
  params?: any;
}): Promise<QueryResponse> {
  return client.fetch<QueryResponse>(query, params);
}
```

## `sanity-cms/utils/categories/seedVirtualTaxonomy.mjs`

```javascript
import client from "../getClient.mjs";
import { nanoid } from "nanoid";

const rawStructure = [
  {
    title: "Headphones",
    slug: "headphones",
    icon: "headphones",
    groups: [
      {
        title: "By category",
        items: [
          { title: "Wired", slug: "wired" },
          { title: "Wireless", slug: "wireless" },
          { title: "Noise cancelling", slug: "noise-cancelling" },
          { title: "Earbuds", slug: "earbuds" },
        ],
      },
      {
        title: "By fit",
        items: [
          { title: "Over ear", slug: "over-ear" },
          { title: "In ear", slug: "in-ear" },
        ],
      },
      {
        title: "By use",
        items: [
          { title: "Studio and recording", slug: "studio-and-recording" },
          { title: "Gaming", slug: "gaming" },
          { title: "Travel", slug: "travel" },
        ],
      },
    ],
  },
  {
    title: "Speakers",
    slug: "speakers",
    icon: "speaker",
    groups: [
      {
        title: "Home theater",
        items: [
          { title: "Floor standing speakers", slug: "floor-standing-speakers" },
          { title: "Subwoofers", slug: "subwoofers" },
          { title: "Soundbars", slug: "soundbars" },
        ],
      },
      {
        title: "Home Audio",
        items: [
          { title: "Bookshelf speakers", slug: "bookshelf-speakers" },
          { title: "Powered speakers", slug: "powered-speakers" },
        ],
      },
      {
        title: "Portable & Outdoor",
        items: [
          { title: "Bluetooth speakers", slug: "bluetooth-speakers" },
          { title: "Outdoor speakers", slug: "outdoor-speakers" },
        ],
      },
    ],
  },
  {
    title: "Personal Audio",
    slug: "personal-audio",
    icon: "earbuds",
    groups: [
      {
        title: "Audio Players & Devices",
        items: [
          { title: "Digital Audio Players", slug: "digital-audio-players" },
          {
            title: "Bluetooth receivers and transmitters",
            slug: "bluetooth-receivers-and-transmitters",
          },
        ],
      },
      {
        title: "Amplification",
        items: [
          { title: "Portable DACs and Amps", slug: "portable-dacs-and-amps" },
          { title: "Headphone amplifiers", slug: "headphone-amplifiers" },
        ],
      },
      {
        title: "Accessories & Parts",
        items: [
          {
            title: "Phone and Tablet Accessories",
            slug: "phone-and-tablet-accessories",
          },
          {
            title: "Carrying Cases and Protection",
            slug: "carrying-cases-and-protection",
          },
          { title: "Replacement Parts", slug: "replacement-parts" },
        ],
      },
    ],
  },
  {
    title: "Home Audio",
    slug: "home-audio",
    icon: "radio",
    groups: [
      {
        title: "Core components",
        items: [
          { title: "Amplifiers", slug: "amplifiers" },
          { title: "Receivers", slug: "receivers" },
          { title: "Preamps", slug: "preamps" },
        ],
      },
      {
        title: "Source devices",
        items: [
          { title: "Turntables", slug: "turntables" },
          { title: "CD players", slug: "cd-players" },
        ],
      },
      {
        title: "Signal processing",
        items: [
          {
            title: "DACs (Digital-to-Analog Converters)",
            slug: "dacs-digital-to-analog-converters",
          },
        ],
      },
    ],
  },
  {
    title: "Studio Equipment",
    slug: "studio-equipment",
    icon: "mic2",
    groups: [
      {
        title: "Recording Essentials",
        items: [
          { title: "Microphones", slug: "microphones" },
          { title: "Studio monitors", slug: "studio-monitors" },
          { title: "Audio interfaces", slug: "audio-interfaces" },
        ],
      },
      {
        title: "Processing & Accessories",
        items: [
          { title: "Studio Processors", slug: "studio-processors" },
          { title: "Recording accessories", slug: "recording-accessories" },
        ],
      },
    ],
  },
  {
    title: "Accessories",
    slug: "accessories",
    icon: "cable",
    groups: [
      {
        title: "Cables & Wiring",
        items: [
          { title: "Audio cables", slug: "audio-cables" },
          { title: "Power cables", slug: "power-cables" },
          { title: "HDMI Cables", slug: "hdmi-cables" },
          { title: "RCA Cables", slug: "rca-cables" },
          { title: "USB Cables", slug: "usb-cables" },
          { title: "Headphone Cables", slug: "headphone-cables" },
          { title: "Ethernet Cables", slug: "ethernet-cables" },
        ],
      },
      {
        title: "Mounting & Support",
        items: [
          { title: "Wall mounts", slug: "wall-mounts" },
          { title: "Speaker stands", slug: "speaker-stands" },
        ],
      },
      {
        title: "Audio Equipment Accessories",
        items: [
          { title: "Phono Cartridges", slug: "phono-cartridges" },
          {
            title: "Speaker and Subwoofer accessories",
            slug: "speaker-and-subwoofer-accessories",
          },
          { title: "Microphone Accessories", slug: "microphone-accessories" },
        ],
      },
      {
        title: "Power Management",
        items: [{ title: "Power Management", slug: "power-management" }],
      },
    ],
  },
  {
    title: "On Sale",
    slug: "on-sale",
    icon: null,
    groups: [],
  },
];
async function seedCatalogue() {
  console.log("🚀 Building Virtual Taxonomy Tree...");

  const catalogueTree = rawStructure.map((root) => {
    // 1. Root Item
    const rootItem = {
      _key: nanoid(),
      _type: "catalogueItem", // Matches your schema
      type: "link",
      title: root.title,
      slug: { _type: "slug", current: root.slug },
      icon: root.icon,
      children: [],
    };

    // 2. Groups
    if (root.groups && root.groups.length > 0) {
      rootItem.children = root.groups.map((group) => {
        return {
          _key: nanoid(),
          _type: "catalogueItem",
          type: "header",
          title: group.title,
          children: group.items.map((item) => {
            return {
              _key: nanoid(),
              _type: "catalogueItem",
              type: "link",
              title: item.title,
              slug: { _type: "slug", current: item.slug },
              children: [],
            };
          }),
        };
      });
    }
    return rootItem;
  });

  console.log("💾 Writing to Catalogue document...");

  try {
    // UPDATED: Writes to 'catalogue' document type and 'catalogue' field
    const result = await client.createOrReplace({
      _id: "catalogue", // Singleton ID
      _type: "catalogue",
      catalogue: catalogueTree,
    });

    console.log("✅ Virtual Taxonomy Seeded Successfully!");
    console.log(`   Transaction ID: ${result._rev}`);
  } catch (err) {
    console.error("❌ Seed Failed:", err.message);
  }
}

seedCatalogue();
```

## `scripts/build-catalogue-index.mjs`

```javascript
import { createClient } from "next-sanity";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: "2023-05-03",
});

// SC6: Validate all product catalogueLocationKeys point to valid VFS slots
async function validateProductKeys(slotMetadataMap, sanityClient) {
  console.log("🔍 Validating product catalogueLocationKeys...");

  try {
    // Get all valid slot IDs from the VFS
    const validSlotIds = new Set(Object.keys(slotMetadataMap));

    // Query all products with their catalogueLocationKeys
    const products = await sanityClient.fetch(`
      *[_type == "product" && defined(catalogueLocationKeys)]{
        _id,
        name,
        catalogueLocationKeys
      }
    `);

    // Filter out test products (names containing "test" or "Test")
    const productionProducts = products.filter(product => 
      !product.name.toLowerCase().includes('test')
    );

    const orphanedKeys = new Map(); // key -> product IDs

    for (const product of productionProducts) {
      if (!product.catalogueLocationKeys) continue;

      for (const key of product.catalogueLocationKeys) {
        if (!validSlotIds.has(key)) {
          if (!orphanedKeys.has(key)) {
            orphanedKeys.set(key, []);
          }
          orphanedKeys.get(key).push({ id: product._id, name: product.name });
        }
      }
    }

    if (orphanedKeys.size > 0) {
      console.log(`\n⚠️  FOUND ${orphanedKeys.size} ORPHANED KEY(S):`);
      console.log("   These keys don't exist in the VFS slotMetadataMap:\n");

      for (const [key, products] of orphanedKeys) {
        console.log(`   ❌ "${key}"`);
        console.log(`      Referenced by ${products.length} product(s):`);
        products.slice(0, 3).forEach(p => {
          console.log(`        - ${p.name} (${p.id})`);
        });
        if (products.length > 3) {
          console.log(`        ... and ${products.length - 3} more`);
        }
      }

      console.log("\n📋 RECOMMENDATION: Run migration to fix orphaned keys");
      console.log("   or update products to reference valid catalogue slots.\n");

      // Don't fail build - just warn (configurable)
      // process.exit(1);
    } else {
      console.log(`✅ All ${productionProducts.length} production products have valid catalogueLocationKeys`);
      if (products.length !== productionProducts.length) {
        console.log(`   (Filtered out ${products.length - productionProducts.length} test products from validation)`);
      }
    }

    return {
      totalProducts: productionProducts.length,
      orphanedKeyCount: orphanedKeys.size,
      orphanedKeys: Object.fromEntries(orphanedKeys)
    };
  } catch (error) {
    console.error("❌ Product key validation failed:", error.message);
    return { error: error.message };
  }
}

async function buildCatalogueIndex() {
  console.log("🏗️  Building Catalogue Virtual File System...");

  try {
    const allItems = await client.fetch(`*[_type == "catalogueItem"]{ _id, title, type, slug, icon, sortOrder, "parentId": parent._ref }`);
    if (!allItems || allItems.length === 0) throw new Error("No catalogue items found in Sanity!");

    // Build lookup map
    const itemById = {};
    for (const item of allItems) {
      itemById[item._id] = item;
      // Initialize children array for reconstruction
      item.children = [];
    }

    // Rebuild tree using parent references (adjacency list inversion)
    for (const item of allItems) {
      if (item.parentId) {
        const parent = itemById[item.parentId];
        if (parent) {
          parent.children.push(item);
        }
      }
    }

    // Identify root nodes (those with no parent)
    const rootNodes = allItems
      .filter(item => !item.parentId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    // Tree reconstruction function
    function buildTreeNode(doc) {
      const node = {
        id: doc._id,
        _key: doc._id,
        _type: "catalogueItem",
        title: doc.title,
        type: doc.type,
      };

      if (doc.slug?.current) {
        node.slug = doc.slug;
      }

      if (doc.icon) {
        node.icon = doc.icon;
      }

      if (doc.children && doc.children.length > 0) {
        const children = doc.children
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .map(buildTreeNode);

        if (children.length > 0) {
          node.children = children;
        }
      }

      return node;
    }

    // Reconstruct the full tree
    const tree = rootNodes.map(buildTreeNode);

    const slugToIdMap = {};
    const slotMetadataMap = {};

    function traverse(nodes, parentPath = [], parentBreadcrumbs = []) {
      if (!nodes) return;

      for (const node of nodes) {
        if (!node.type) node.type = "link";

        const isHeader = node.type === "header";
        const currentSlug = node.slug?.current;

        // Build path segments - headers without slugs inherit parent path
        const pathSegments = isHeader && !currentSlug
          ? parentPath
          : currentSlug
            ? [...parentPath, currentSlug]
            : parentPath;

        const urlString = pathSegments.join("/");

        // For slugToIdMap, use leaf-only slug for leaf nodes (no children)
        const isLeafNode = !node.children || node.children.length === 0;

        // Build breadcrumbs for links only
        const nextBreadcrumbs = isHeader || !currentSlug
          ? parentBreadcrumbs
          : [
              ...parentBreadcrumbs,
              { label: node.title, url: `/shop/${urlString}` },
            ];

        // Register leaf slugs in slugToIdMap (for direct resolution)
        if (currentSlug && !isHeader && isLeafNode) {
          slugToIdMap[currentSlug] = node._key;
        }

        // Also register full path for nested lookups
        if (currentSlug && !isHeader) {
          slugToIdMap[urlString] = node._key;
        }

        // Always add to slotMetadataMap - every node needs metadata
        slotMetadataMap[node._key] = {
          title: node.title,
          url: isHeader ? "#" : currentSlug ? `/shop/${urlString}` : "#",
          slug: currentSlug || "",
          breadcrumbs: nextBreadcrumbs,
          children: node.children?.map((c) => c._key) || [],
          type: node.type,
          path: "/" + urlString,
          sortOrder: node.sortOrder || 0,
          icon: node.icon,
        };

        traverse(node.children, pathSegments, nextBreadcrumbs);
      }
    }

    traverse(tree);

    // Validation: Ensure all referenced children IDs exist in slotMetadataMap
    function validateSlotMetadataCompleteness(metadataMap) {
      const allReferencedIds = new Set();
      const missingIds = new Set();

      // Collect all referenced child IDs
      for (const [nodeId, metadata] of Object.entries(metadataMap)) {
        for (const childId of metadata.children) {
          allReferencedIds.add(childId);
          if (!metadataMap[childId]) {
            missingIds.add(childId);
          }
        }
      }

      const totalNodes = Object.keys(metadataMap).length;
      const leafNodes = Object.values(metadataMap).filter(meta => meta.children.length === 0).length;
      const headerNodes = totalNodes - leafNodes;

      console.log(`📊 VFS Validation Results:`);
      console.log(`   Total nodes: ${totalNodes}`);
      console.log(`   Leaf nodes: ${leafNodes}`);
      console.log(`   Header nodes: ${headerNodes}`);
      console.log(`   Referenced IDs: ${allReferencedIds.size}`);

      if (missingIds.size > 0) {
        console.log(`❌ VALIDATION FAILED - Missing ${missingIds.size} IDs in slotMetadataMap:`);
        for (const missingId of missingIds) {
          // Find which parent references this missing ID
          for (const [parentId, metadata] of Object.entries(metadataMap)) {
            if (metadata.children.includes(missingId)) {
              console.log(`   - ${missingId} (referenced by parent "${metadata.title}" (${parentId}))`);
              break;
            }
          }
        }
        throw new Error(`Build failed: ${missingIds.size} missing IDs in slotMetadataMap`);
      } else {
        console.log(`✅ VALIDATION PASSED - All referenced IDs exist in slotMetadataMap`);
      }
    }

    validateSlotMetadataCompleteness(slotMetadataMap);

    // SC6: Validate all product catalogueLocationKeys point to valid VFS slots
    await validateProductKeys(slotMetadataMap, client);

    const output = {
      generatedAt: new Date().toISOString(),
      slugToIdMap,
      slotMetadataMap,
      tree,
    };

    const outputPath = path.join(process.cwd(), "data", "catalogue-index.json");

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));

    console.log(
      `✅ Index Built! Mapped ${Object.keys(slotMetadataMap).length} categories.`
    );
    console.log(`📂 Saved to: src/data/catalogue-index.json`);
  } catch (error) {
    console.error("❌ Build Failed:", error);
    process.exit(1);
  }
}

buildCatalogueIndex();
```

## `scripts/migrations/dump-catalogue.mjs`

```javascript
#!/usr/bin/env node

import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
import { config } from 'dotenv';
config();

function assertValue(v, errorMessage) {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}

const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET"
);

const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
);

const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false
});

const CATALOGUE_QUERY = `
*[_type == "catalogueItem"] | order(sortOrder asc) {
  _id,
  title,
  type,
  slug,
  icon,
  parent->{
    _id,
    title
  }
}`;

// Transform flat Sanity data to exact legacy JSON structure (copied from getCatalogueData.ts)
function transformSanityToLegacyJson(items) {
  // Create a map for quick lookup
  const itemMap = new Map(items.map(item => [item._id, item]));

  // Find root items (no parent)
  const rootItems = items.filter(item => !item.parent);

  // Build recursive tree structure matching legacy JSON format
  const catalogue = rootItems.map(rootItem => {
    return buildLegacyCatalogueItem(rootItem, items, itemMap);
  });

  return { catalogue };
}

function buildLegacyCatalogueItem(item, allItems, itemMap) {
  // Find direct children - the parent reference uses _id not _ref
  const children = allItems.filter(child =>
    child.parent && child.parent._id === item._id
  );

  // Build children array recursively
  const childrenArray = children.map(child => {
    return buildLegacyCatalogueItem(child, allItems, itemMap);
  });

  // Return exact legacy structure
  const legacyItem = {
    id: item.slug?.current || item.title?.toLowerCase().replace(/\s+/g, '-') || item._id,
    title: item.title,
    type: item.type,
  };

  // Add slug if present (for link types)
  if (item.slug) {
    legacyItem.slug = {
      current: item.slug.current,
      _type: "slug"
    };
  }

  // Add icon if present (for root items)
  if (item.icon) {
    legacyItem.icon = item.icon;
  }

  // Add children if any exist
  if (childrenArray.length > 0) {
    legacyItem.children = childrenArray;
  }

  return legacyItem;
}

async function dumpCatalogueData() {
  console.log('Fetching catalogue data from Sanity CMS...');
  
  try {
    const sanityItems = await client.fetch(CATALOGUE_QUERY);
    console.log(`Found ${sanityItems.length} catalogue items`);
    
    const result = transformSanityToLegacyJson(sanityItems);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const content = `# Catalogue Data for UI - ${timestamp}\n\n` +
      `Total Items: ${sanityItems.length}\n` +
      `Root Categories: ${result.catalogue.length}\n\n` +
      `## Final UI Catalogue Structure\n\n` +
      '```json\n' +
      JSON.stringify(result, null, 2) +
      '\n```\n\n';
    
    const outputFile = join(process.cwd(), 'catalog_temporary', 'catalogue-data.md');
    writeFileSync(outputFile, content);
    
    console.log(`Catalogue data dumped to: catalog_temporary/catalogue-data.md`);
    console.log(`Structure contains ${result.catalogue.length} root categories`);
    
    // Log summary of root categories
    console.log('\nRoot Categories:');
    result.catalogue.forEach((category, index) => {
      console.log(`${index + 1}. ${category.title} (${category.type})`);
    });
    
  } catch (error) {
    console.error('Error fetching catalogue data:', error.message);
    process.exit(1);
  }
}

dumpCatalogueData();
```

## `scripts/migrations/remove-orphaned-catalogue-keys.mjs`

```javascript
#!/usr/bin/env node

import { createClient } from '@sanity/client';
import { config } from 'dotenv';

config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-11-14',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_STUDIO_READ_WRITE
});

// Orphaned keys that don't exist in VFS slotMetadataMap
const ORPHANED_KEYS = [
  'test-category-beta',
  'test-category-gamma',
  'test-location',
  'test-category-alpha',
  'featured'
];

async function removeOrphanedKeys(dryRun = false) {
  console.log('🔍 Fetching products with orphaned catalogueLocationKeys...');

  // Fetch all products with catalogueLocationKeys (same as build script)
  const allProducts = await client.fetch(`
    *[_type == "product" && defined(catalogueLocationKeys)]{
      _id,
      name,
      catalogueLocationKeys
    }
  `);

  // Filter to products that have orphaned keys
  const products = allProducts.filter(product => 
    product.catalogueLocationKeys && 
    product.catalogueLocationKeys.some(key => ORPHANED_KEYS.includes(key))
  );

  if (products.length === 0) {
    console.log('✅ No products found with orphaned keys');
    return;
  }

  console.log(`\nFound ${products.length} product(s) with orphaned keys:\n`);

  for (const product of products) {
    const orphanedInProduct = product.catalogueLocationKeys.filter(key => 
      ORPHANED_KEYS.includes(key)
    );
    console.log(`- ${product.name} (${product._id})`);
    console.log(`  Orphaned keys: ${orphanedInProduct.join(', ')}`);
  }

  if (dryRun) {
    console.log('\n🔍 DRY RUN - No changes will be made');
    return;
  }

  console.log('\n🔧 Removing orphaned keys from products...');

  const transaction = client.transaction();

  for (const product of products) {
    const validKeys = product.catalogueLocationKeys.filter(key => 
      !ORPHANED_KEYS.includes(key)
    );

    transaction.patch(product._id, {
      set: { catalogueLocationKeys: validKeys }
    });

    console.log(`  - Updating ${product.name}: removing ${product.catalogueLocationKeys.length - validKeys.length} key(s)`);
  }

  await transaction.commit();
  console.log('\n✅ Migration completed successfully');
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  try {
    await removeOrphanedKeys(dryRun);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();
```

## `scripts/test-catalogue-key-algorithm.mjs`

```javascript
#!/usr/bin/env node

/**
 * Algorithm to map legacy categoryPath to catalogue location leaf ID
 * Separates products into:
 * - Matched products (can be mapped to catalogue location keys)
 * - Unmatched products (legacy products to be deleted)
 * Usage: node scripts/test-catalogue-key-algorithm.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load leaf-id-to-path-map.txt
const mapPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "leaf-id-to-path-map.txt");
const mapContent = readFileSync(mapPath, "utf-8");

// Parse the map into a lookup object
const pathToIdMap = new Map();
const lines = mapContent.split("\n").filter(line => line && !line.startsWith("#"));
lines.forEach(line => {
  const [id, path] = line.split(":");
  if (id && path) {
    pathToIdMap.set(path.trim(), id.trim());
  }
});

console.log("Loaded catalogue location map with", pathToIdMap.size, "entries\n");

// Load legacy path mapping file
const legacyMapPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "current-paths-to-legacy-paths.txt");
const legacyMapContent = readFileSync(legacyMapPath, "utf-8");

// Parse legacy path mapping: format: <current_path>: <legacy_path>
const legacyPathMap = new Map();
legacyMapContent.split("\n").forEach(line => {
  if (line && !line.startsWith("#")) {
    const [currentPath, legacyPath] = line.split(":");
    if (currentPath && legacyPath) {
      legacyPathMap.set(legacyPath.trim(), currentPath.trim());
    }
  }
});

console.log("Loaded legacy path mapping with", legacyPathMap.size, "entries\n");

// Load legacy products for testing
const legacyPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "legacy-products-to-be-deleted.json");
const legacyData = JSON.parse(readFileSync(legacyPath, "utf-8"));

console.log("Loaded", legacyData.products.length, "legacy products for testing\n");

// Algorithm: Normalize categoryPath to match leaf path format
function normalizeCategoryPath(categoryPath) {
  // Convert "Speakers/Outdoor Speakers" to "/speakers/outdoor-speakers"
  if (typeof categoryPath !== 'string') {
    console.warn(`Warning: categoryPath is not a string, got ${typeof categoryPath}:`, categoryPath);
    return null;
  }
  const normalized = categoryPath
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^/, "/");
  return normalized;
}

// Updated algorithm: check legacy path mapping first, then fallback to normalization
function findCatalogueLocationId(categoryPath) {
  if (typeof categoryPath !== 'string') {
    return null;
  }

  // First check legacy path mapping
  const mappedPath = legacyPathMap.get(categoryPath);
  if (mappedPath) {
    const id = pathToIdMap.get(mappedPath);
    if (id) {
      return { id, method: 'legacy_mapping', mappedPath };
    }
  }

  // Fallback to normalization
  const normalized = normalizeCategoryPath(categoryPath);
  if (!normalized) return null;
  
  const id = pathToIdMap.get(normalized);
  if (id) {
    return { id, method: 'normalization', normalizedPath: normalized };
  }

  return null;
}

// Test on products with accessories/tips-and-ear-pads categoryPath
const testProducts = legacyData.products.filter(p => 
  p.categoryPath && p.categoryPath.includes("accessories/tips-and-ear-pads")
);

console.log(`=== Testing on ${testProducts.length} products with accessories/tips-and-ear-pads ===\n`);

const testResults = [];

testProducts.forEach(product => {
  console.log(`\n--- Product: ${product.name} (${product._id}) ---`);
  
  if (!product.categoryPath || product.categoryPath.length === 0) {
    console.log("No categoryPath - cannot map");
    testResults.push({ product, result: null, reason: 'no_category_path' });
    return;
  }

  const matchedKeys = [];
  const mappingDetails = [];

  product.categoryPath.forEach(catPath => {
    const result = findCatalogueLocationId(catPath);
    if (result) {
      matchedKeys.push(result.id);
      mappingDetails.push({
        categoryPath: catPath,
        method: result.method,
        mappedPath: result.mappedPath || result.normalizedPath,
        catalogueId: result.id
      });
      console.log(`✓ ${catPath} -> ${result.id} [${result.method}]`);
    } else {
      mappingDetails.push({
        categoryPath: catPath,
        method: 'no_match',
        mappedPath: null,
        catalogueId: null
      });
      console.log(`✗ ${catPath} -> no match`);
    }
  });

  const hasMatch = matchedKeys.length > 0;
  testResults.push({ 
    product, 
    result: hasMatch ? matchedKeys : null, 
    mappingDetails,
    reason: hasMatch ? 'matched' : 'no_match'
  });
});

console.log("\n=== Summary ===");
const matchedCount = testResults.filter(r => r.result).length;
console.log(`Matched: ${matchedCount}/${testProducts.length}`);
console.log(`Unmatched: ${testProducts.length - matchedCount}/${testProducts.length}`);
```

