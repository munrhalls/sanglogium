# Sprint 3: Integration Layer

## Sprint Metadata

| Field | Value |
|-------|-------|
| **Sprint ID** | S3-INTEGRATION |
| **Layer** | L5 Integration |
| **Estimated Time** | 3-4 hours |
| **Status** | READY FOR AI IMPLEMENTATION |
| **Dependencies** | Sprint 2 LOCKED — Routes work, skeletons render |

---

## Scope Contract

### IN SCOPE (Must Implement)

**Data → UI Connection:**
- [ ] `ProductGrid.tsx` — Real component, renders ProductCards with actual product data
- [ ] `ProductCard.tsx` — Real component: image, brand, name, price, link to product detail
- [ ] `ShopHeader.tsx` — Real component: category name, product count
- [ ] Update `page.tsx` — Replace skeletons with real components

**Image Integration:**
- [ ] `ProductImage.tsx` — Client Component with Sanity image URL builder
- [ ] Images load from Sanity CDN with proper aspect ratio
- [ ] Hover states (optional but simple)

**End-to-End Verification:**
- [ ] `/shop/headphones/open-back` displays 7 real products with real data
- [ ] `/shop/headphones/closed-back` displays 31 real products with real data
- [ ] Product cards link to `/product/[slug]` (pages exist from Sprint 2)
- [ ] Product detail page displays real product data (image, name, brand, price, description)

### OUT OF SCOPE (Explicitly Forbidden)

- ❌ Filters UI (Sprint 4)
- ❌ Sort dropdown (Sprint 4)
- ❌ Cart functionality
- ❌ Search functionality
- ❌ Animations beyond simple hover
- ❌ Pagination (infinite scroll or pages)

---

## Files to Create/Modify

```
app/(store)/
├── shop/
│   └── [...slug]/
│       └── page.tsx                # MODIFY: Replace skeletons with real components
└── product/
    └── [slug]/
        └── page.tsx                # MODIFY: Replace skeleton with real components

app/components/features/products/
├── ProductGrid.tsx                 # NEW: Real data grid
├── ProductCard.tsx                 # NEW: Real product card
├── ProductImage.tsx                # NEW: Image component (Client)
├── ShopHeader.tsx                  # NEW: Real header
├── ProductDetail.tsx               # NEW: Real product detail page component
├── ProductInfo.tsx                 # NEW: Product info section
├── ImageGallery.tsx                # NEW: Image gallery
├── index.ts                        # NEW: Barrel export
└── __tests__/
    └── integration.test.tsx      # NEW: Component tests

app/components/ui/
├── Price.tsx                       # NEW: Price formatter (Client)
└── Badge.tsx                       # NEW: Design system badge
```

---

## Test Specifications (Copy-Paste Ready)

### Test File: `app/components/features/products/__tests__/integration.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductGrid } from '../ProductGrid';
import { ProductCard } from '../ProductCard';
import { ShopHeader } from '../ShopHeader';
import { ProductImage } from '../ProductImage';
import { Price } from '@/app/components/ui/Price';

// Mock product factory
function generateMockProduct(overrides = {}) {
  return {
    _id: 'product-123',
    name: 'HD 800S',
    brand: { _id: 'brand-1', name: 'Sennheiser' },
    displayPrice: 1699,
    image: { asset: { _ref: 'image-abc' } },
    slug: { current: 'sennheiser-hd800s' },
    catalogueLocationKeys: ['key-1'],
    ...overrides,
  };
}

describe('L5 Integration: Product Components', () => {

  describe('Price', () => {
    it('L5-01: Formats price correctly', () => {
      render(<Price value={1699} currency="USD" />);
      expect(screen.getByText('$1,699.00')).toBeInTheDocument();
    });

    it('L5-02: Uses default USD currency', () => {
      render(<Price value={299} />);
      expect(screen.getByText('$299.00')).toBeInTheDocument();
    });
  });

  describe('ProductCard', () => {
    it('L5-03: Renders product name', () => {
      const product = generateMockProduct({ name: 'HD 800S' });
      render(<ProductCard product={product} />);
      expect(screen.getByText('HD 800S')).toBeInTheDocument();
    });

    it('L5-04: Renders brand name', () => {
      const product = generateMockProduct({ brand: { name: 'Sennheiser' } });
      render(<ProductCard product={product} />);
      expect(screen.getByText('Sennheiser')).toBeInTheDocument();
    });

    it('L5-05: Renders formatted price', () => {
      const product = generateMockProduct({ displayPrice: 1699 });
      render(<ProductCard product={product} />);
      expect(screen.getByText('$1,699.00')).toBeInTheDocument();
    });

    it('L5-06: Links to product detail page', () => {
      const product = generateMockProduct({ slug: { current: 'sennheiser-hd800s' } });
      render(<ProductCard product={product} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/product/sennheiser-hd800s');
    });

    it('L5-07: Renders product image', () => {
      const product = generateMockProduct();
      render(<ProductCard product={product} />);
      expect(screen.getByTestId('product-image')).toBeInTheDocument();
    });
  });

  describe('ProductGrid', () => {
    it('L5-08: Renders correct number of products', () => {
      const products = [
        generateMockProduct({ _id: '1', name: 'Product 1' }),
        generateMockProduct({ _id: '2', name: 'Product 2' }),
        generateMockProduct({ _id: '3', name: 'Product 3' }),
      ];
      render(<ProductGrid products={products} />);
      expect(screen.getAllByTestId('product-card')).toHaveLength(3);
    });

    it('L5-09: Renders empty state when no products', () => {
      render(<ProductGrid products={[]} />);
      expect(screen.getByTestId('empty-products')).toBeInTheDocument();
    });

    it('L5-10: Uses responsive grid layout', () => {
      const products = generateMockProducts(4);
      render(<ProductGrid products={products} />);
      const grid = screen.getByTestId('product-grid');
      expect(grid.className).toContain('grid');
    });
  });

  describe('ShopHeader', () => {
    it('L5-11: Displays category name', () => {
      render(<ShopHeader title="Open-Back" productCount={7} />);
      expect(screen.getByText('Open-Back')).toBeInTheDocument();
    });

    it('L5-12: Displays product count', () => {
      render(<ShopHeader title="Open-Back" productCount={7} />);
      expect(screen.getByText('7 products')).toBeInTheDocument();
    });

    it('L5-13: Handles singular/plural', () => {
      render(<ShopHeader title="Open-Back" productCount={1} />);
      expect(screen.getByText('1 product')).toBeInTheDocument();
    });
  });

  describe('ProductImage', () => {
    it('L5-14: Renders image with correct dimensions', () => {
      render(<ProductImage image={{ asset: { _ref: 'image-abc' } }} alt="Product" />);
      const img = screen.getByTestId('product-image');
      expect(img).toBeInTheDocument();
    });
  });

});

function generateMockProducts(count: number) {
  return Array.from({ length: count }, (_, i) =>
    generateMockProduct({ _id: `product-${i}`, name: `Product ${i}` })
  );
}
```

### Test File: `tests/integration/e2e-data-flow.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getProductsByVfsKeys } from '@/sanity/lib/products/getProductsByVfsKeys';

describe('L5 E2E: Data Flow Verification', () => {

  it('L5-E2E-01: /shop/open-back returns 7+ products', async () => {
    const nodeId = resolveSlugToId('open-back');
    const keys = unrollDescendantKeys(nodeId);
    const products = await getProductsByVfsKeys(keys);

    expect(products.length).toBeGreaterThanOrEqual(7);

    // Verify product structure
    products.forEach(p => {
      expect(p._id).toBeDefined();
      expect(p.name).toBeDefined();
      expect(p.brand).toBeDefined();
      expect(p.displayPrice).toBeGreaterThan(0);
    });
  });

  it('L5-E2E-02: /shop/closed-back returns 31+ products', async () => {
    const nodeId = resolveSlugToId('closed-back');
    const keys = unrollDescendantKeys(nodeId);
    const products = await getProductsByVfsKeys(keys);

    expect(products.length).toBeGreaterThanOrEqual(31);
  });

  it('L5-E2E-03: Products have required fields for cards', async () => {
    const nodeId = resolveSlugToId('open-back');
    const keys = unrollDescendantKeys(nodeId);
    const products = await getProductsByVfsKeys(keys);

    if (products.length > 0) {
      const p = products[0];
      expect(p._id).toBeDefined();
      expect(p.name).toBeDefined();
      expect(p.brand?._id).toBeDefined();
      expect(p.brand?.name).toBeDefined();
      expect(p.displayPrice).toBeDefined();
      expect(p.slug?.current).toBeDefined();
    }
  });

});
```

---

## Implementation Specifications (For AI)

### Implementation 1: app/components/ui/Price.tsx

```typescript
"use client";

interface PriceProps {
  value: number;
  currency?: string;
}

export function Price({ value, currency = 'USD' }: PriceProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  return <span className="font-semibold tabular-nums">{formatted}</span>;
}
```

### Implementation 2: app/components/features/products/ProductImage.tsx

```typescript
"use client";

import Image from 'next/image';
import { urlForImage } from '@/sanity/lib/imageUrl';

interface ProductImageProps {
  image: any;
  alt: string;
  className?: string;
}

export function ProductImage({ image, alt, className }: ProductImageProps) {
  if (!image?.asset?._ref) {
    return (
      <div className={`bg-gray-200 rounded ${className}`} data-testid="product-image-placeholder">
        <span className="sr-only">No image</span>
      </div>
    );
  }

  const imageUrl = urlForImage(image).width(400).height(300).url();

  return (
    <div className={`relative aspect-[4/3] ${className}`} data-testid="product-image">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover rounded"
      />
    </div>
  );
}
```

### Implementation 3: app/components/features/products/ProductCard.tsx

```typescript
import Link from 'next/link';
import { ProductImage } from './ProductImage';
import { Price } from '@/app/components/ui/Price';

interface Product {
  _id: string;
  name: string;
  brand: { _id: string; name: string };
  displayPrice: number;
  image: any;
  slug: { current: string };
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/product/${product.slug.current}`}
      className="group block space-y-3"
      data-testid="product-card"
    >
      <ProductImage
        image={product.image}
        alt={product.name}
        className="group-hover:opacity-90 transition-opacity"
      />

      <div className="space-y-1">
        <p className="text-sm text-gray-600">{product.brand.name}</p>
        <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
        <Price value={product.displayPrice} />
      </div>
    </Link>
  );
}
```

### Implementation 4: app/components/features/products/ProductGrid.tsx

```typescript
import { cn } from "@/lib/utils/tailwind";
import { ProductCard } from './ProductCard';

interface Product {
  _id: string;
  name: string;
  brand: { _id: string; name: string };
  displayPrice: number;
  image: any;
  slug: { current: string };
}

interface ProductGridProps {
  products: Product[];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center" data-testid="empty-products">
        <p className="text-gray-600">No products found in this category.</p>
      </div>
    );
  }

  return (
    <div
      data-testid="product-grid"
      className={cn(
        "grid gap-4 md:gap-6 lg:gap-8",
        "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
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

### Implementation 5: app/components/features/products/ShopHeader.tsx

```typescript
interface ShopHeaderProps {
  title: string;
  productCount: number;
}

export function ShopHeader({ title, productCount }: ShopHeaderProps) {
  const countLabel = productCount === 1 ? 'product' : 'products';

  return (
    <div className="mb-6" data-testid="shop-header">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-600 mt-1">
        {productCount} {countLabel}
      </p>
    </div>
  );
}
```

### Implementation 6: app/components/features/products/index.ts (Barrel Export)

```typescript
export { ProductGrid } from './ProductGrid';
export { ProductCard } from './ProductCard';
export { ProductImage } from './ProductImage';
export { ShopHeader } from './ShopHeader';
export { ProductGridSkeleton } from './ProductGridSkeleton';
export { ProductCardSkeleton } from './ProductCardSkeleton';
export { ShopHeaderSkeleton } from './ShopHeaderSkeleton';
```

### Implementation 7: MODIFY app/(store)/shop/[...slug]/page.tsx

```typescript
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getProductsByVfsKeys, getCategoryMetadata } from '@/sanity/lib/products';
import { ShopLayout } from '@/app/components/features/shop/ShopLayout';
import { ShopHeader, ProductGrid } from '@/app/components/features/products';

interface CategoryPageProps {
  params: { slug: string[] };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const leafSlug = params.slug[params.slug.length - 1];
  const nodeId = resolveSlugToId(leafSlug);

  if (!nodeId) {
    notFound();
  }

  const descendantKeys = unrollDescendantKeys(nodeId);
  const products = await getProductsByVfsKeys(descendantKeys);
  const metadata = await getCategoryMetadata(nodeId);

  // SPRINT 3: Real components replace skeletons
  return (
    <ShopLayout>
      <ShopHeader title={metadata.name} productCount={products.length} />
      <ProductGrid products={products} />
    </ShopLayout>
  );
}

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

## DoD Checklist

### Pre-Implementation
- [ ] Sprint 2 is LOCKED (routes render skeletons, 10 tests passing)
- [ ] Manual verification: `/shop/open-back` shows skeleton grid

### Implementation Phase
- [ ] Create `Price.tsx`
- [ ] Create `ProductImage.tsx`
- [ ] Create `ProductCard.tsx`
- [ ] Create `ProductGrid.tsx`
- [ ] Create `ShopHeader.tsx`
- [ ] Create `ProductDetail.tsx` — Real product detail component
- [ ] Create `ProductInfo.tsx` — Product info section
- [ ] Create `ImageGallery.tsx` — Image gallery component
- [ ] Create barrel export `index.ts`
- [ ] Modify `shop/[...slug]/page.tsx` to use real components
- [ ] Modify `product/[slug]/page.tsx` to use real components
- [ ] Create test files (2 files)

### Verification Phase — Automated Tests
- [ ] Run component tests: `npx vitest run app/components/features/products/__tests__/integration.test.tsx`
  - [ ] L5-01: PASS — Price formatting
  - [ ] L5-02: PASS — Default currency
  - [ ] L5-03: PASS — Product name renders
  - [ ] L5-04: PASS — Brand name renders
  - [ ] L5-05: PASS — Price renders
  - [ ] L5-06: PASS — Link to product detail
  - [ ] L5-07: PASS — Image renders
  - [ ] L5-08: PASS — Grid renders correct count
  - [ ] L5-09: PASS — Empty state
  - [ ] L5-10: PASS — Responsive grid
  - [ ] L5-11: PASS — Header title
  - [ ] L5-12: PASS — Header count
  - [ ] L5-13: PASS — Singular/plural
  - [ ] L5-14: PASS — Image dimensions
- [ ] Run E2E tests: `npx vitest run tests/integration/e2e-data-flow.test.ts`
  - [ ] L5-E2E-01: PASS — Open-back returns 7+ products
  - [ ] L5-E2E-02: PASS — Closed-back returns 31+ products
  - [ ] L5-E2E-03: PASS — Products have required fields

### Manual Verification — End-to-End Journey (CRITICAL)

#### Category Page Verification
- [ ] **Journey S3-01:** Navigate to `/shop/headphones/open-back` — see **7 real products** with actual data
  - Verify: Product names are real (not placeholders)
  - Verify: Brand names display
  - Verify: Prices display in $X,XXX format
  - Verify: Images load from Sanity CDN (check Network tab for image requests)
- [ ] **Journey S3-02:** Navigate to `/shop/headphones/closed-back` — see **31+ real products** with actual data
- [ ] **Journey S3-03:** Resize browser mobile→tablet→desktop — grid columns change **2→3→4**
- [ ] **Journey S3-04:** Empty state test — verify graceful handling if category has 0 products

#### Product Detail Page Verification
- [ ] **Journey S3-05:** Click any product card from `/shop/headphones/open-back` — navigate to `/product/[slug]`
  - Verify: URL changes to `/product/sennheiser-hd800s` (or similar real slug)
  - Verify: Page loads without 404
  - Verify: **Real product image** displays
  - Verify: **Real product name** displays (not skeleton)
  - Verify: **Real brand name** displays
  - Verify: **Real price** displays
  - Verify: **Product description** displays (if available in CMS)
- [ ] **Journey S3-06:** Navigate directly to `/product/sennheiser-hd800s` (or any real product slug) — works without clicking from category
- [ ] **Journey S3-07:** Navigate to `/product/invalid-slug` — 404 page displays correctly
- [ ] **Journey S3-08:** Browser back button from product detail → returns to category page with scroll position maintained (or acceptable behavior)

#### Data Accuracy Verification
- [ ] **Journey S3-09:** Spot-check 3 products — verify data matches Sanity CMS
  - Compare product name, brand, price against CMS
- [ ] **Journey S3-10:** Verify image aspect ratios — should be consistent 4:3 or square
- [ ] **Journey S3-11:** Verify image quality — not pixelated, proper Sanity CDN sizing

### Lockdown
- [ ] All 17 automated tests passing
- [ ] All 11 manual journey tests completed
- [ ] Product images loading correctly from Sanity CDN
- [ ] Product detail pages display real data
- [ ] User sign-off comment: `LOCKED [date] — User: [name]`

---

## AI Implementation Prompt

```
Implement Sprint 3: Integration Layer

Context:
- Next.js 15 with App Router
- Server Components default
- Sprint 2 provides: Working routes, skeletons, layout
- Sprint 1 provides: getProductsByVfsKeys, getCategoryMetadata, VFS functions
- Sanity image URL builder exists at @/sanity/lib/imageUrl

Your Task:
1. Create 7 real components (ProductGrid, ProductCard, ProductImage, ShopHeader, ProductDetail, ProductInfo, ImageGallery)
2. Create 1 UI component (Price)
3. Modify shop page.tsx to use real components instead of skeletons
4. Modify product page.tsx to use real components instead of skeletons
5. Create test files with 17 total tests
6. Ensure all tests pass

Constraints:
- NO filters or sorting (Sprint 4)
- NO cart functionality
- Minimal styling (follow existing patterns)
- ProductImage is Client Component (needs "use client")
- Price is Client Component (needs "use client")
- All other components are Server Components

Deliverables:
- Created: app/components/ui/Price.tsx
- Created: app/components/features/products/ProductImage.tsx
- Created: app/components/features/products/ProductCard.tsx
- Created: app/components/features/products/ProductGrid.tsx
- Created: app/components/features/products/ShopHeader.tsx
- Created: app/components/features/products/ProductDetail.tsx
- Created: app/components/features/products/ProductInfo.tsx
- Created: app/components/features/products/ImageGallery.tsx
- Created: app/components/features/products/index.ts
- Created: app/components/features/products/__tests__/integration.test.tsx
- Created: tests/integration/e2e-data-flow.test.ts
- Modified: app/(store)/shop/[...slug]/page.tsx
- Modified: app/(store)/product/[slug]/page.tsx

Run tests and provide output showing all 17 tests pass.
```

---

## Next Sprint Trigger

**Sprint 4 is UNLOCKED when:**
1. This sprint reaches LOCKED status (all DoD items checked)
2. User verifies all 11 manual journey tests completed
3. User comments sign-off in this file: `LOCKED [date] — User: [name]`

**Sprint 4 Scope:** L6 Features — Sort dropdown, Filter sidebar, Related products carousel
