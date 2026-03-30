# Sprint 2: Routes + Skeleton Layer (UPDATED with Product Detail)

## Sprint Metadata

| Field | Value |
|-------|-------|
| **Sprint ID** | S2-ROUTES-SKELETON |
| **Layers** | L3 Routes + L4 Skeleton |
| **Estimated Time** | 4-6 hours |
| **Status** | READY FOR AI IMPLEMENTATION |
| **Dependencies** | Sprint 1 LOCKED — `getProductsByVfsKeys`, `getCategoryMetadata`, VFS functions working |

---

## Scope Contract

### IN SCOPE (Must Implement)

**L3 Routes — Category Pages:**
- [ ] `app/(store)/shop/[...slug]/page.tsx` — Server Component, fetches data
- [ ] `app/(store)/shop/[...slug]/loading.tsx` — Server Component, skeleton UI
- [ ] `app/(store)/shop/[...slug]/error.tsx` — Client Component, error handling

**L3 Routes — Product Detail Pages (Skeleton):**
- [ ] `app/(store)/product/[slug]/page.tsx` — Server Component, minimal skeleton layout
- [ ] `app/(store)/product/[slug]/loading.tsx` — Server Component, skeleton UI
- [ ] `app/(store)/product/[slug]/error.tsx` — Client Component, error handling

**L4 Skeleton Components:**
- [ ] `ProductGridSkeleton.tsx` — Responsive grid skeleton
- [ ] `ProductCardSkeleton.tsx` — Image + text placeholders (with link wrapper)
- [ ] `ShopHeaderSkeleton.tsx` — Title + count placeholders
- [ ] `ProductDetailSkeleton.tsx` — Product page skeleton (image + info placeholders)
- [ ] `ShopLayout.tsx` — Sidebar + main content structure
- [ ] Update skeleton cards to link to `/product/[slug]` for end-to-end verification

### OUT OF SCOPE (Explicitly Forbidden)

- ❌ ANY real data components (ProductGrid, ProductCard, ShopHeader, ProductInfo)
- ❌ ANY styling beyond structural (no colors beyond gray-200, no typography)
- ❌ ANY filters or sorting UI
- ❌ Cart functionality
- ❌ Search functionality
- ❌ Actual product images
- ❌ Shadcn/ui or external components

---

## Manual Verification Matrix

| Sprint | User Action | Expected Result | Verification Method |
|--------|-------------|-----------------|---------------------|
| **S2** | Click "Open-Back" in navigation | `/shop/headphones/open-back` loads, skeleton grid visible | Visual check + URL |
| **S2** | Click any product card | `/product/[slug]` loads, skeleton product page visible | Visual check + URL |
| **S2** | Resize browser (mobile→desktop) | Responsive columns change 2→3→4 | Visual check breakpoints |
| **S2** | Navigate to invalid slug | 404 page displays | Visual check |
| **S3** | Click "Open-Back" in navigation | `/shop/headphones/open-back` loads, **7 real products** with images | Visual check + count |
| **S3** | Click any product card | `/product/[slug]` loads, **real product data** displayed | Visual check |
| **S3** | Verify product info | Name, brand, price all visible and correct | Visual check |

---

## Files to Create

```
app/(store)/
├── shop/
│   └── [...slug]/
│       ├── page.tsx                  # L3: Category page
│       ├── loading.tsx               # L3: Category loading
│       └── error.tsx                 # L3: Category error
└── product/
    └── [slug]/
        ├── page.tsx                  # L3: Product page (skeleton)
        ├── loading.tsx               # L3: Product loading
└───────  └── error.tsx               # L3: Product error

app/components/features/products/
├── ProductGridSkeleton.tsx           # L4: Grid skeleton
├── ProductCardSkeleton.tsx           # L4: Card skeleton with link
├── ShopHeaderSkeleton.tsx            # L4: Header skeleton
├── ProductDetailSkeleton.tsx         # L4: Product page skeleton
└── __tests__/
    └── skeletons.test.tsx            # L4 tests

app/components/features/shop/
└── ShopLayout.tsx                    # L4: Layout container

tests/routes/
├── shop.routes.test.ts               # L3: Category routes
└── product.routes.test.ts            # L3: Product routes
```

---

## Test Specifications (Copy-Paste Ready)

### Test File 1: tests/routes/shop.routes.test.ts

```typescript
import { describe, it, expect, vi } from 'vitest';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('L3 Routes: Shop Category Pages', () => {

  it('L3-01: Route structure accepts slug arrays', async () => {
    const { default: CategoryPage } = await import('@/app/(store)/shop/[...slug]/page');
    const params = Promise.resolve({ slug: ['headphones', 'open-back'] });
    await expect(CategoryPage({ params })).resolves.toBeDefined();
  });

  it('L3-02: Single slug route works', async () => {
    const { default: CategoryPage } = await import('@/app/(store)/shop/[...slug]/page');
    const params = Promise.resolve({ slug: ['open-back'] });
    await expect(CategoryPage({ params })).resolves.toBeDefined();
  });

  it('L3-03: Deep nested slug route works', async () => {
    const { default: CategoryPage } = await import('@/app/(store)/shop/[...slug]/page');
    const params = Promise.resolve({ slug: ['headphones', 'by-design', 'open-back'] });
    await expect(CategoryPage({ params })).resolves.toBeDefined();
  });

  it('L3-04: Page returns ShopLayout with children', async () => {
    const { default: CategoryPage } = await import('@/app/(store)/shop/[...slug]/page');
    const params = Promise.resolve({ slug: ['open-back'] });
    const result = await CategoryPage({ params });
    expect(result).toBeDefined();
    expect(result.type).toBeDefined();
  });

});
```

### Test File 2: tests/routes/product.routes.test.ts

```typescript
import { describe, it, expect, vi } from 'vitest';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('L3 Routes: Product Detail Pages', () => {

  it('L3-05: Product page accepts slug parameter', async () => {
    const { default: ProductPage } = await import('@/app/(store)/product/[slug]/page');
    const params = Promise.resolve({ slug: 'sennheiser-hd800s' });
    await expect(ProductPage({ params })).resolves.toBeDefined();
  });

  it('L3-06: Product page renders skeleton layout', async () => {
    const { default: ProductPage } = await import('@/app/(store)/product/[slug]/page');
    const params = Promise.resolve({ slug: 'sennheiser-hd800s' });
    const result = await ProductPage({ params });
    expect(result).toBeDefined();
    expect(result.type).toBeDefined();
  });

  it('L3-07: Invalid product slug returns 404', async () => {
    const { notFound } = await import('next/navigation');
    const { default: ProductPage } = await import('@/app/(store)/product/[slug]/page');
    
    // Mock notFound to throw so we can catch it
    vi.mocked(notFound).mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });
    
    const params = Promise.resolve({ slug: 'invalid-product-slug' });
    await expect(ProductPage({ params })).rejects.toThrow('NEXT_NOT_FOUND');
  });

});
```

### Test File 3: app/components/features/products/__tests__/skeletons.test.tsx

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductGridSkeleton } from '../ProductGridSkeleton';
import { ProductCardSkeleton } from '../ProductCardSkeleton';
import { ShopHeaderSkeleton } from '../ShopHeaderSkeleton';
import { ProductDetailSkeleton } from '../ProductDetailSkeleton';

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
      expect(grid.className).toMatch(/grid-cols-2|grid-cols-1/);
    });
  });

  describe('ProductCardSkeleton', () => {
    it('L4-04: Has image placeholder with correct aspect ratio', () => {
      render(<ProductCardSkeleton />);
      const image = screen.getByTestId('skeleton-image');
      expect(image).toBeInTheDocument();
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

    it('L4-09: Card links to product detail page', () => {
      render(<ProductCardSkeleton href="/product/sennheiser-hd800s" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/product/sennheiser-hd800s');
    });
  });

  describe('ShopHeaderSkeleton', () => {
    it('L4-10: Has title placeholder', () => {
      render(<ShopHeaderSkeleton />);
      expect(screen.getByTestId('skeleton-header-title')).toBeInTheDocument();
    });

    it('L4-11: Has count placeholder', () => {
      render(<ShopHeaderSkeleton />);
      expect(screen.getByTestId('skeleton-header-count')).toBeInTheDocument();
    });
  });

  describe('ProductDetailSkeleton', () => {
    it('L4-12: Has image gallery placeholder', () => {
      render(<ProductDetailSkeleton />);
      expect(screen.getByTestId('skeleton-detail-image')).toBeInTheDocument();
    });

    it('L4-13: Has product info placeholder', () => {
      render(<ProductDetailSkeleton />);
      expect(screen.getByTestId('skeleton-detail-info')).toBeInTheDocument();
    });

    it('L4-14: Has description placeholder', () => {
      render(<ProductDetailSkeleton />);
      expect(screen.getByTestId('skeleton-detail-description')).toBeInTheDocument();
    });
  });

});
```

---

## Implementation Specifications (For AI)

### Implementation 1: app/(store)/shop/[...slug]/page.tsx

```typescript
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getProductsByVfsKeys, getCategoryMetadata } from '@/sanity/lib/products';
import { ShopLayout } from '@/app/components/features/shop/ShopLayout';
import { ShopHeaderSkeleton } from '@/app/components/features/products/ShopHeaderSkeleton';
import { ProductGridSkeleton } from '@/app/components/features/products/ProductGridSkeleton';

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const leafSlug = slug[slug.length - 1];
  const nodeId = resolveSlugToId(leafSlug);

  if (!nodeId) {
    notFound();
  }

  const descendantKeys = unrollDescendantKeys(nodeId);
  const products = await getProductsByVfsKeys(descendantKeys);
  const metadata = await getCategoryMetadata(nodeId);

  // SPRINT 2: Render skeletons with product slugs for links
  return (
    <ShopLayout>
      <ShopHeaderSkeleton />
      <ProductGridSkeleton 
        count={products.length} 
        productSlugs={products.map(p => p.slug.current)}
      />
    </ShopLayout>
  );
}

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

### Implementation 2: app/(store)/product/[slug]/page.tsx

```typescript
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/sanity/lib/products';
import { ProductDetailSkeleton } from '@/app/components/features/products/ProductDetailSkeleton';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  // Verify product exists
  const product = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }

  // SPRINT 2: Render skeleton (SPRINT 3 will add real components)
  return <ProductDetailSkeleton productName={product.name} />;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: `${product.name} — Sang Logium`,
    description: product.description?.substring(0, 160) || `Buy ${product.name}`,
  };
}
```

### Implementation 3: app/(store)/product/[slug]/loading.tsx

```typescript
import { ProductDetailSkeleton } from '@/app/components/features/products/ProductDetailSkeleton';

export default function ProductLoading() {
  return <ProductDetailSkeleton />;
}
```

### Implementation 4: app/(store)/product/[slug]/error.tsx

```typescript
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

### Implementation 5: ProductDetailSkeleton.tsx

```typescript
interface ProductDetailSkeletonProps {
  productName?: string;
}

export function ProductDetailSkeleton({ productName }: ProductDetailSkeletonProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image gallery skeleton */}
        <div className="lg:w-1/2" data-testid="skeleton-detail-image">
          <div className="aspect-square bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Product info skeleton */}
        <div className="lg:w-1/2 space-y-4" data-testid="skeleton-detail-info">
          {/* Brand */}
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          
          {/* Title */}
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
          
          {/* Price */}
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
          
          {/* Add to cart button */}
          <div className="h-12 bg-gray-200 rounded w-full animate-pulse" />
          
          {/* Description */}
          <div className="space-y-2" data-testid="skeleton-detail-description">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Implementation 6: Updated ProductCardSkeleton with Link

```typescript
import Link from 'next/link';

interface ProductCardSkeletonProps {
  href?: string;
}

export function ProductCardSkeleton({ href }: ProductCardSkeletonProps) {
  const content = (
    <div
      data-testid="product-card-skeleton"
      className="space-y-3 animate-pulse"
    >
      <div
        data-testid="skeleton-image"
        className="aspect-[4/3] bg-gray-200 rounded"
      />
      <div
        data-testid="skeleton-brand"
        className="h-4 bg-gray-200 rounded w-1/3"
      />
      <div
        data-testid="skeleton-title"
        className="h-5 bg-gray-200 rounded w-full"
      />
      <div
        data-testid="skeleton-price"
        className="h-5 bg-gray-200 rounded w-1/4"
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
```

### Implementation 7: Updated ProductGridSkeleton with Links

```typescript
import { cn } from "@/lib/utils/tailwind";
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface ProductGridSkeletonProps {
  count?: number;
  productSlugs?: string[];
  className?: string;
}

export function ProductGridSkeleton({ 
  count = 12, 
  productSlugs = [],
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
        <ProductCardSkeleton 
          key={i} 
          href={productSlugs[i] ? `/product/${productSlugs[i]}` : undefined}
        />
      ))}
    </div>
  );
}
```

### Implementation 8: getProductBySlug.ts (Required for product page)

```typescript
import { sanityFetch } from '@/sanity/lib/client';
import groq from 'groq';

export interface Product {
  _id: string;
  name: string;
  brand: { _id: string; name: string };
  displayPrice: number;
  image: any;
  slug: { current: string };
  description?: string;
  catalogueLocationKeys: string[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await sanityFetch({
    query: groq`*[_type == "product" && slug.current == $slug] {
      _id,
      name,
      brand {
        _id,
        name
      },
      displayPrice,
      image,
      slug {
        current
      },
      description,
      catalogueLocationKeys
    }`,
    params: { slug }
  });
  
  return products[0] || null;
}
```

---

## DoD Checklist

### Pre-Implementation
- [ ] Sprint 1 is LOCKED (VFS + data functions working)
- [ ] Run existing tests to confirm baseline

### Implementation Phase
- [ ] Create product detail route files (3 files)
- [ ] Create `getProductBySlug.ts`
- [ ] Update skeleton components with links
- [ ] Create `ProductDetailSkeleton.tsx`
- [ ] Create all test files (3 files)

### Verification Phase — Automated Tests
- [ ] Run L3 tests: `npx vitest run tests/routes/shop.routes.test.ts`
  - [ ] L3-01: PASS
  - [ ] L3-02: PASS
  - [ ] L3-03: PASS
  - [ ] L3-04: PASS
- [ ] Run L3 tests: `npx vitest run tests/routes/product.routes.test.ts`
  - [ ] L3-05: PASS
  - [ ] L3-06: PASS
  - [ ] L3-07: PASS
- [ ] Run L4 tests: `npx vitest run app/components/features/products/__tests__/skeletons.test.tsx`
  - [ ] L4-01 through L4-14: PASS

### Manual Verification — End-to-End Journey (CRITICAL)
- [ ] **Journey Test 1:** Click "Open-Back" in navigation → `/shop/headphones/open-back` loads with skeleton grid
- [ ] **Journey Test 2:** Click any skeleton product card → `/product/[slug]` loads with skeleton product page
- [ ] **Journey Test 3:** Browser back button → returns to category page
- [ ] **Journey Test 4:** Resize browser → grid columns change responsively (2→3→4)
- [ ] **Journey Test 5:** Navigate to `/shop/invalid-slug` → 404 page displays
- [ ] **Journey Test 6:** Navigate to `/product/invalid-slug` → 404 page displays
- [ ] **Journey Test 7:** Direct URL to `/shop/headphones/open-back` → works without navigation click
- [ ] **Journey Test 8:** Direct URL to `/product/sennheiser-hd800s` → works without navigation click

### Lockdown
- [ ] All 17 automated tests passing
- [ ] All 8 manual journey tests completed
- [ ] User sign-off comment: `LOCKED [date] — User: [name]`

---

## AI Implementation Prompt

```
Implement Sprint 2: Routes + Skeleton Layer (UPDATED)

Context:
- Next.js 15 with App Router
- Server Components default
- Sprint 1 provides: getProductsByVfsKeys, getCategoryMetadata, resolveSlugToId, unrollDescendantKeys

Your Task:
1. Create 6 route files (3 for category, 3 for product detail)
2. Create getProductBySlug.ts
3. Create 4 skeleton components (with links for end-to-end verification)
4. Create ProductDetailSkeleton.tsx
5. Create 3 test files with 17 total tests
6. Ensure all tests pass

CRITICAL: Skeleton cards must link to /product/[slug] so user can click through end-to-end.

Constraints:
- NO real data components
- NO styling beyond structural (gray-200, grid, padding)
- Server Components only (except error.tsx)
- Product cards must be clickable links to product detail

Deliverables:
- Created: app/(store)/shop/[...slug]/page.tsx
- Created: app/(store)/shop/[...slug]/loading.tsx
- Created: app/(store)/shop/[...slug]/error.tsx
- Created: app/(store)/product/[slug]/page.tsx
- Created: app/(store)/product/[slug]/loading.tsx
- Created: app/(store)/product/[slug]/error.tsx
- Created: sanity/lib/products/getProductBySlug.ts
- Created: app/components/features/products/ProductGridSkeleton.tsx (with links)
- Created: app/components/features/products/ProductCardSkeleton.tsx (with Link)
- Created: app/components/features/products/ProductDetailSkeleton.tsx
- Modified: app/components/features/products/ShopHeaderSkeleton.tsx (if needed)
- Created: tests/routes/shop.routes.test.ts
- Created: tests/routes/product.routes.test.ts
- Created: app/components/features/products/__tests__/skeletons.test.tsx

Run tests and provide output showing all 17 tests pass.
```

---

## Next Sprint Trigger

**Sprint 3 is UNLOCKED when:**
1. This sprint reaches LOCKED status (all DoD items checked)
2. User completes all 8 manual journey tests
3. User comments sign-off in this file

**Sprint 3 Scope:** L5 Integration — Replace skeletons with real ProductCard, ProductGrid, ShopHeader, ProductDetail components with real data and images.
