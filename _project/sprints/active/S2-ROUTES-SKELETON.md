# Sprint 2: Routes + Skeleton Layer

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

**L3 Routes:**
- [ ] Create `app/(store)/shop/[...slug]/page.tsx` — Server Component, fetches data
- [ ] Create `app/(store)/shop/[...slug]/loading.tsx` — Server Component, skeleton UI
- [ ] Create `app/(store)/shop/[...slug]/error.tsx` — Client Component, error handling
- [ ] Route handles slug arrays: `/shop/headphones/open-back`
- [ ] Invalid slugs return 404 via `notFound()`
- [ ] Valid slugs fetch products and pass to layout

**L4 Skeleton:**
- [ ] `ProductGridSkeleton.tsx` — Responsive grid skeleton (uses existing Grid component pattern)
- [ ] `ProductCardSkeleton.tsx` — Image + text placeholders
- [ ] `ShopHeaderSkeleton.tsx` — Title + count placeholders
- [ ] `ShopLayout.tsx` — Sidebar + main content structure (sidebar can be placeholder for now)
- [ ] All skeletons use structural Tailwind only (grid, padding, aspect-ratio, animate-pulse)

### OUT OF SCOPE (Explicitly Forbidden)

- ❌ ANY real data components (ProductGrid, ProductCard, ShopHeader)
- ❌ ANY styling beyond structural (no colors beyond gray-200, no typography)
- ❌ ANY filters or sorting UI
- ❌ Product detail pages
- ❌ Search functionality
- ❌ Actual product images
- ❌ Cart functionality
- ❌ Shadcn/ui or external components

---

## Files to Create

```
app/(store)/
└── shop/
    └── [...slug]/
        ├── page.tsx                  # L3: Server Component — data fetch + layout
        ├── loading.tsx               # L3: Server Component — ProductGridSkeleton
        └── error.tsx                 # L3: Client Component — error UI

app/components/features/products/
├── ProductGridSkeleton.tsx           # L4: Grid of skeleton cards
├── ProductCardSkeleton.tsx           # L4: Single skeleton card
├── ShopHeaderSkeleton.tsx            # L4: Header skeleton
└── __tests__/
    └── skeletons.test.tsx            # L4 tests

app/components/features/shop/
└── ShopLayout.tsx                    # L4: Layout container

tests/routes/
└── shop.routes.test.ts               # L3 tests
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
    // Import the page component
    const { default: CategoryPage } = await import('@/app/(store)/shop/[...slug]/page');
    
    // Should not throw for valid slug array
    const params = { slug: ['headphones', 'open-back'] };
    await expect(CategoryPage({ params })).resolves.toBeDefined();
  });

  it('L3-02: Single slug route works', async () => {
    const { default: CategoryPage } = await import('@/app/(store)/shop/[...slug]/page');
    
    const params = { slug: ['open-back'] };
    await expect(CategoryPage({ params })).resolves.toBeDefined();
  });

  it('L3-03: Deep nested slug route works', async () => {
    const { default: CategoryPage } = await import('@/app/(store)/shop/[...slug]/page');
    
    const params = { slug: ['headphones', 'by-design', 'open-back'] };
    await expect(CategoryPage({ params })).resolves.toBeDefined();
  });

  it('L3-04: Page returns ShopLayout with children', async () => {
    const { default: CategoryPage } = await import('@/app/(store)/shop/[...slug]/page');
    
    const params = { slug: ['open-back'] };
    const result = await CategoryPage({ params });
    
    // Result should be a React element (JSX structure)
    expect(result).toBeDefined();
    expect(result.type).toBeDefined(); // Should be ShopLayout component
  });

});
```

### Test File 2: app/components/features/products/__tests__/skeletons.test.tsx

```typescript
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

---

## Implementation Specifications (For AI)

### Implementation 1: app/(store)/shop/[...slug]/page.tsx

**Requirements:**
- Server Component (no "use client")
- Accepts `{ params: { slug: string[] } }`
- Uses Sprint 1 functions: `resolveSlugToId`, `unrollDescendantKeys`, `getProductsByVfsKeys`, `getCategoryMetadata`
- Returns 404 for invalid slugs
- Returns ShopLayout with ShopHeaderSkeleton + ProductGridSkeleton (NO real data yet — that's Sprint 3)

```typescript
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getProductsByVfsKeys, getCategoryMetadata } from '@/sanity/lib/products';
import { ShopLayout } from '@/app/components/features/shop/ShopLayout';
import { ShopHeaderSkeleton } from '@/app/components/features/products/ShopHeaderSkeleton';
import { ProductGridSkeleton } from '@/app/components/features/products/ProductGridSkeleton';

interface CategoryPageProps {
  params: { slug: string[] };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Last segment is the leaf category
  const leafSlug = params.slug[params.slug.length - 1];
  
  // Resolve slug to VFS node ID
  const nodeId = resolveSlugToId(leafSlug);
  
  if (!nodeId) {
    notFound();
  }
  
  // Fetch data (Sprint 1 functions)
  const descendantKeys = unrollDescendantKeys(nodeId);
  const products = await getProductsByVfsKeys(descendantKeys);
  const metadata = await getCategoryMetadata(nodeId);
  
  // Sprint 2: Render skeletons (Sprint 3 will add real components)
  return (
    <ShopLayout>
      <ShopHeaderSkeleton />
      <ProductGridSkeleton count={products.length} />
    </ShopLayout>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const leafSlug = params.slug[params.slug.length - 1];
  const nodeId = resolveSlugToId(leafSlug);
  
  if (!nodeId) {
    return { title: 'Category Not Found' };
  }
  
  const metadata = await getCategoryMetadata(nodeId);
  
  return {
    title: `${metadata.name} — Sang Logium`,
    description: `Browse ${metadata.name} headphones and audio equipment`,
  };
}
```

---

### Implementation 2: app/(store)/shop/[...slug]/loading.tsx

**Requirements:**
- Server Component
- Renders skeleton during data fetch
- Same structure as page.tsx but with skeletons

```typescript
import { ShopLayout } from '@/app/components/features/shop/ShopLayout';
import { ShopHeaderSkeleton } from '@/app/components/features/products/ShopHeaderSkeleton';
import { ProductGridSkeleton } from '@/app/components/features/products/ProductGridSkeleton';

// Default skeleton count while loading
const DEFAULT_SKELETON_COUNT = 12;

export default function CategoryLoading() {
  return (
    <ShopLayout>
      <ShopHeaderSkeleton />
      <ProductGridSkeleton count={DEFAULT_SKELETON_COUNT} />
    </ShopLayout>
  );
}
```

---

### Implementation 3: app/(store)/shop/[...slug]/error.tsx

**Requirements:**
- Client Component ("use client" required)
- Displays error UI with retry button
- Uses Next.js error.tsx convention

```typescript
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

---

### Implementation 4: app/components/features/products/ProductGridSkeleton.tsx

**Requirements:**
- Uses existing Grid component pattern from `app/components/layout/grid/Grid.tsx`
- Responsive: 2 cols mobile, 4 cols desktop
- Renders N skeleton cards

```typescript
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
        "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
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

---

### Implementation 5: app/components/features/products/ProductCardSkeleton.tsx

**Requirements:**
- Aspect ratio 4/3 for image placeholder
- Brand (small), Title (larger), Price (medium) placeholders
- Uses animate-pulse for loading effect
- Structural Tailwind only

```typescript
export function ProductCardSkeleton() {
  return (
    <div 
      data-testid="product-card-skeleton"
      className="space-y-3 animate-pulse"
    >
      {/* Image placeholder */}
      <div 
        data-testid="skeleton-image"
        className="aspect-[4/3] bg-gray-200 rounded"
      />
      
      {/* Brand placeholder */}
      <div 
        data-testid="skeleton-brand"
        className="h-4 bg-gray-200 rounded w-1/3"
      />
      
      {/* Title placeholder */}
      <div 
        data-testid="skeleton-title"
        className="h-5 bg-gray-200 rounded w-full"
      />
      
      {/* Price placeholder */}
      <div 
        data-testid="skeleton-price"
        className="h-5 bg-gray-200 rounded w-1/4"
      />
    </div>
  );
}
```

---

### Implementation 6: app/components/features/products/ShopHeaderSkeleton.tsx

**Requirements:**
- Title placeholder (larger)
- Product count placeholder (smaller)
- Minimal structure

```typescript
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

---

### Implementation 7: app/components/features/shop/ShopLayout.tsx

**Requirements:**
- Simple two-column layout (sidebar + main)
- Sidebar is placeholder for future filters (can be empty div)
- Main content area takes remaining space
- Responsive: sidebar hidden on mobile, shown on lg+

```typescript
import { cn } from "@/lib/utils/tailwind";

interface ShopLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ShopLayout({ children, className }: ShopLayoutProps) {
  return (
    <div className={cn("container mx-auto px-4 py-6", className)}>
      <div className="flex gap-8">
        {/* Sidebar — placeholder for filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          {/* Future: FilterSidebar will go here */}
          <div className="h-96 bg-gray-100 rounded" aria-label="Filters placeholder" />
        </aside>
        
        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## DoD Checklist

### Pre-Implementation
- [ ] Sprint 1 is LOCKED (all tests passing)
- [ ] Run existing tests to confirm baseline: `npx vitest run tests/products/getProductsByVfsKeys.test.ts`

### Implementation Phase
- [ ] Create route directory structure: `app/(store)/shop/[...slug]/`
- [ ] Create all 3 route files (page.tsx, loading.tsx, error.tsx)
- [ ] Create all 4 skeleton components
- [ ] Create ShopLayout
- [ ] Create test files (2 files)

### Verification Phase — Automated Tests
- [ ] Run L3 tests: `npx vitest run tests/routes/shop.routes.test.ts`
  - [ ] L3-01: PASS — Route accepts slug arrays
  - [ ] L3-02: PASS — Single slug route works
  - [ ] L3-03: PASS — Deep nested route works
  - [ ] L3-04: PASS — Page returns ShopLayout
- [ ] Run L4 tests: `npx vitest run app/components/features/products/__tests__/skeletons.test.tsx`
  - [ ] L4-01: PASS — Grid renders correct count
  - [ ] L4-02: PASS — Grid uses layout classes
  - [ ] L4-03: PASS — Responsive classes present
  - [ ] L4-04: PASS — Image placeholder with aspect ratio
  - [ ] L4-05: PASS — Brand placeholder
  - [ ] L4-06: PASS — Title placeholder
  - [ ] L4-07: PASS — Price placeholder
  - [ ] L4-08: PASS — Animate pulse present
  - [ ] L4-09: PASS — Header title placeholder
  - [ ] L4-10: PASS — Header count placeholder

### Manual Verification (User Sign-off)
- [ ] Navigate to `/shop/headphones/open-back` — skeleton grid visible
- [ ] Navigate to `/shop/headphones/closed-back` — skeleton grid visible (different count)
- [ ] Navigate to `/shop/invalid-category` — 404 page displayed
- [ ] Resize browser — responsive columns change (2→3→4)
- [ ] Check network tab — products API calls succeed
- [ ] Verify loading state — skeletons appear before data (throttle network to test)

### Lockdown
- [ ] All automated tests passing (10 tests total)
- [ ] Manual verification completed
- [ ] No styling beyond structural (visual inspection)
- [ ] User sign-off comment in this file: `LOCKED [date] — User: [name]`

---

## AI Implementation Prompt

```
Implement Sprint 2: Routes + Skeleton Layer

Context:
- Next.js 15 with App Router
- Server Components default
- Sprint 1 provides: getProductsByVfsKeys, getCategoryMetadata, resolveSlugToId, unrollDescendantKeys
- Existing Grid component at app/components/layout/grid/Grid.tsx

Your Task:
1. Create 3 route files in app/(store)/shop/[...slug]/ (page.tsx, loading.tsx, error.tsx)
2. Create 4 skeleton components (ProductGridSkeleton, ProductCardSkeleton, ShopHeaderSkeleton, ShopLayout)
3. Create 2 test files with 10 total tests
4. Ensure all tests pass

Constraints:
- NO real data components (ProductGrid, ProductCard, ShopHeader) — use skeletons only
- NO styling beyond structural Tailwind (grid, padding, aspect-ratio, animate-pulse)
- NO colors beyond gray-200 for skeletons
- Server Components only (except error.tsx which needs "use client")
- Use existing Grid component patterns from app/components/layout/grid/Grid.tsx

Deliverables:
- Created: app/(store)/shop/[...slug]/page.tsx
- Created: app/(store)/shop/[...slug]/loading.tsx
- Created: app/(store)/shop/[...slug]/error.tsx
- Created: app/components/features/products/ProductGridSkeleton.tsx
- Created: app/components/features/products/ProductCardSkeleton.tsx
- Created: app/components/features/products/ShopHeaderSkeleton.tsx
- Created: app/components/features/shop/ShopLayout.tsx
- Created: tests/routes/shop.routes.test.ts
- Created: app/components/features/products/__tests__/skeletons.test.tsx

Run tests and provide output showing all 10 tests pass.
```

---

## Next Sprint Trigger

**Sprint 3 is UNLOCKED when:**
1. This sprint reaches LOCKED status (all DoD items checked)
2. User verifies manual test cases (3 URLs, responsive behavior)
3. User comments sign-off in this file

**Sprint 3 Scope:** L5 Integration — Real ProductGrid, ProductCard, ShopHeader with actual data and images
