# Post-Homepage Product Discovery — Implementation Phases & Test Specification

## Architecture: 6 Sequential Layers

**Principle:** Each layer is locked before next begins. Tests define the layer; implementation satisfies tests.

| Layer | Focus | DoD | Est. Time |
|-------|-------|-----|-----------|
| **L1: Foundation** | VFS data integrity | All tests pass | 2-4h |
| **L2: Data** | GROQ functions | 3 URLs return correct products | 2-3h |
| **L3: Routes** | Next.js pages | Pages exist, handle 404s | 2h |
| **L4: Skeleton** | Structural UI | Responsive, zero styling | 4-6h |
| **L5: Integration** | Data → UI | Real data renders | 3-4h |
| **L6: Features** | Filters, sort, detail | Full functionality | 8-12h |

---

## Layer 1: Foundation — VFS Data Integrity

### Purpose
Ensure `catalogue-index.json` is internally consistent and all referenced IDs exist.

### Current State
- `slotMetadataMap` missing intermediate header node IDs
- `unrollDescendantKeys()` returns IDs not in map
- 63 VFS tests exist but some may fail

### DoD
- [ ] All 63 VFS tests pass
- [ ] Manual verification: `data/catalogue-index.json` contains all tree node IDs in `slotMetadataMap`
- [ ] 3 test slugs resolve correctly:
  - `open-back` → `o7c6baiuobsr7ni2y2vf22sh` (leaf)
  - `headphones` → parent ID with children
  - `closed-back` → `yq3p9s798zszjkzm5btnebjh` (leaf)

### Test Specifications

**Test L1-01: slugToIdMap Completeness**
```typescript
// tests/catalogue/vfs.foundation.test.ts
it('L1-01: All leaf slugs resolve to IDs', () => {
  const leafSlugs = ['open-back', 'closed-back', 'dac-amp-combos'];
  leafSlugs.forEach(slug => {
    expect(resolveSlugToId(slug)).toBeDefined();
  });
});
```

**Test L1-02: slotMetadataMap Completeness**
```typescript
it('L1-02: All tree node IDs exist in slotMetadataMap', () => {
  const allNodeIds = extractAllNodeIds(catalogueIndex.tree);
  allNodeIds.forEach(id => {
    expect(catalogueIndex.slotMetadataMap[id]).toBeDefined();
  });
});
```

**Test L1-03: unrollDescendantKeys Validity**
```typescript
it('L1-03: Descendant keys are valid slot IDs', () => {
  const nodeId = 'ugyeto8653n495dpf89nzoar'; // Headphones root
  const descendants = unrollDescendantKeys(nodeId);
  descendants.forEach(id => {
    expect(catalogueIndex.slotMetadataMap[id]).toBeDefined();
  });
});
```

### Verification Command
```bash
npx vitest run tests/catalogue/vfs.foundation.test.ts --reporter=verbose
```

### Implementation Notes
- Fix build script: `scripts/build-catalogue-index.mjs`
- Ensure tree traversal populates `slotMetadataMap` for ALL nodes
- Validation step: cross-reference tree IDs against map keys

---

## Layer 2: Data — GROQ Functions

### Purpose
Create server functions that fetch products by VFS keys.

### DoD
- [ ] `getProductsByVfsKeys(keys: string[])` returns products with matching `catalogueLocationKeys`
- [ ] `getCategoryMetadata(key: string)` returns category name, description, breadcrumb
- [ ] 3 manual URL tests return correct counts:
  - `GET /api/internal/test/open-back` → 7 products
  - `GET /api/internal/test/closed-back` → 31 products
  - `GET /api/internal/test/dac-amp-combos` → 22 products

### Test Specifications

**Test L2-01: getProductsByVfsKeys Basic**
```typescript
// tests/products/getProductsByVfsKeys.test.ts
it('L2-01: Returns products for single leaf key', async () => {
  const key = 'o7c6baiuobsr7ni2y2vf22sh'; // open-back
  const products = await getProductsByVfsKeys([key]);
  expect(products.length).toBeGreaterThanOrEqual(7);
  products.forEach(p => {
    expect(p.catalogueLocationKeys).toContain(key);
  });
});
```

**Test L2-02: getProductsByVfsKeys Parent Key**
```typescript
it('L2-02: Returns products for parent category (all descendants)', async () => {
  const headphonesKey = 'ugyeto8653n495dpf89nzoar';
  const descendantKeys = unrollDescendantKeys(headphonesKey);
  const products = await getProductsByVfsKeys(descendantKeys);
  expect(products.length).toBeGreaterThanOrEqual(38); // sum of all headphone categories
});
```

**Test L2-03: getCategoryMetadata**
```typescript
it('L2-03: Returns category metadata', async () => {
  const metadata = await getCategoryMetadata('o7c6baiuobsr7ni2y2vf22sh');
  expect(metadata.name).toBe('Open-Back');
  expect(metadata.slug).toBe('open-back');
  expect(metadata.parentId).toBeDefined();
});
```

### Files to Create
```
sanity/lib/products/
├── getProductsByVfsKeys.ts      # L2-01, L2-02
├── getCategoryMetadata.ts       # L2-03
└── __tests__/
    ├── getProductsByVfsKeys.test.ts
    └── getCategoryMetadata.test.ts
```

### GROQ Template
```groq
*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] {
  _id, name, brand, displayPrice, image, slug, catalogueLocationKeys
}
```

---

## Layer 3: Routes — Next.js Pages

### Purpose
Create page routes that handle URLs, fetch data, and render layouts.

### DoD
- [ ] `app/(store)/shop/[...slug]/page.tsx` exists and handles slug arrays
- [ ] Invalid slugs return 404 with `notFound()`
- [ ] Valid slugs fetch products and pass to layout
- [ ] `loading.tsx` shows skeleton during data fetch
- [ ] `error.tsx` catches and displays errors

### Test Specifications

**Test L3-01: Route Existence**
```typescript
// tests/routes/shop.routes.test.ts
it('L3-01: /shop/headphones/open-back returns 200', async () => {
  const response = await fetch('/shop/headphones/open-back');
  expect(response.status).toBe(200);
});
```

**Test L3-02: Invalid Slug 404**
```typescript
it('L3-02: /shop/invalid-slug returns 404', async () => {
  const response = await fetch('/shop/invalid-slug');
  expect(response.status).toBe(404);
});
```

**Test L3-03: Data Passing**
```typescript
it('L3-03: Page passes products to layout component', async () => {
  // Render page with mock params
  const { container } = render(
    await CategoryPage({ params: { slug: ['headphones', 'open-back'] } })
  );
  expect(container.querySelector('[data-testid="product-grid"]')).toBeInTheDocument();
});
```

### Files to Create
```
app/(store)/shop/[...slug]/
├── page.tsx              # Server Component — data fetch + layout composition
├── loading.tsx           # Server Component — ProductGridSkeleton
└── error.tsx             # Client Component — error UI with retry
```

### Page Implementation Spec
```typescript
// page.tsx
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
  
  return (
    <ShopLayout>
      <ShopHeader title={metadata.name} productCount={products.length} />
      <ProductGrid products={products} />
    </ShopLayout>
  );
}
```

---

## Layer 4: Skeleton — Structural UI

### Purpose
Build structural components with ZERO styling. Responsive layouts only.

### DoD
- [ ] `ProductGridSkeleton` renders at all breakpoints
- [ ] `ProductCardSkeleton` matches ProductCard dimensions
- [ ] `ShopHeaderSkeleton` shows title + count placeholders
- [ ] `ShopLayout` provides sidebar + main content structure
- [ ] All skeletons use only structural Tailwind (border, padding, grid, no colors)

### Test Specifications

**Test L4-01: ProductGridSkeleton Responsive**
```typescript
// tests/components/skeletons.test.tsx
it('L4-01: Renders 2 columns on mobile', () => {
  render(<ProductGridSkeleton count={4} />);
  const grid = screen.getByTestId('product-grid-skeleton');
  expect(grid).toHaveClass('grid-cols-2');
});

it('L4-02: Renders 4 columns on desktop', () => {
  // Mock viewport width
  render(<ProductGridSkeleton count={4} />);
  const grid = screen.getByTestId('product-grid-skeleton');
  expect(grid).toHaveClass('lg:grid-cols-4');
});
```

**Test L4-03: ProductCardSkeleton Structure**
```typescript
it('L4-03: Card skeleton has image + text placeholders', () => {
  render(<ProductCardSkeleton />);
  expect(screen.getByTestId('skeleton-image')).toBeInTheDocument();
  expect(screen.getByTestId('skeleton-title')).toBeInTheDocument();
  expect(screen.getByTestId('skeleton-price')).toBeInTheDocument();
});
```

### Files to Create
```
app/components/features/products/
├── ProductGridSkeleton.tsx     # Responsive grid of skeleton cards
├── ProductCardSkeleton.tsx     # Image + title + price placeholders
├── ShopHeaderSkeleton.tsx      # Title + count placeholders
└── __tests__/
    └── skeletons.test.tsx

app/components/features/shop/
└── ShopLayout.tsx              # Sidebar + main structure
```

### Skeleton Spec
```typescript
// ProductCardSkeleton.tsx
export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] bg-gray-200 rounded animate-pulse" data-testid="skeleton-image" />
      <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" data-testid="skeleton-brand" />
      <div className="h-5 bg-gray-200 rounded w-full animate-pulse" data-testid="skeleton-title" />
      <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse" data-testid="skeleton-price" />
    </div>
  );
}
```

---

## Layer 5: Integration — Data + UI

### Purpose
Connect skeleton components to real data. Full data flow end-to-end.

### DoD
- [ ] `ProductGrid` renders real products in skeleton structure
- [ ] `ProductCard` displays product image, name, brand, price
- [ ] `ShopHeader` shows category name and product count
- [ ] `/shop/headphones/open-back` displays 7 real products
- [ ] `/shop/headphones/closed-back` displays 31 real products
- [ ] Product images load from Sanity CDN

### Test Specifications

**Test L5-01: ProductGrid Integration**
```typescript
// tests/components/integration.test.tsx
it('L5-01: Renders real products from props', () => {
  const mockProducts = generateMockProducts(3);
  render(<ProductGrid products={mockProducts} />);
  expect(screen.getAllByTestId('product-card')).toHaveLength(3);
});
```

**Test L5-02: ProductCard Content**
```typescript
it('L5-02: Displays correct product information', () => {
  const product = generateMockProduct({ name: 'HD 800S', brand: 'Sennheiser', price: 1699 });
  render(<ProductCard product={product} />);
  expect(screen.getByText('HD 800S')).toBeInTheDocument();
  expect(screen.getByText('Sennheiser')).toBeInTheDocument();
  expect(screen.getByText('$1,699')).toBeInTheDocument();
});
```

**Test L5-03: End-to-End Data Flow**
```typescript
it('L5-03: E2E: /shop/open-back returns correct product count', async () => {
  // This is an integration test hitting real data
  const nodeId = resolveSlugToId('open-back');
  const keys = unrollDescendantKeys(nodeId);
  const products = await getProductsByVfsKeys(keys);
  expect(products.length).toBeGreaterThanOrEqual(7);
});
```

### Files to Create
```
app/components/features/products/
├── ProductGrid.tsx             # Real data version
├── ProductCard.tsx             # Real data version
├── ShopHeader.tsx              # Real data version
└── __tests__/
    └── integration.test.tsx

app/components/ui/
├── Price.tsx                   # Animated price (Client Component)
└── Badge.tsx                   # Custom design system badge
```

### Price Component Spec (Client)
```typescript
// Price.tsx
"use client";

interface PriceProps {
  value: number;
  currency?: string;
}

export function Price({ value, currency = 'USD' }: PriceProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value);
  
  // Animation handled by CSS or framer-motion
  return <span className="font-semibold">{formatted}</span>;
}
```

---

## Layer 6: Features — Filters, Sort, Detail

### Purpose
Add filtering, sorting, and product detail pages.

### Sub-Layers (Sequential)

#### L6A: Sorting (Simplest)
**DoD:**
- [ ] `SortDropdown` component updates URL with `?s=field:direction`
- [ ] Page re-fetches with sort parameters
- [ ] Sort options: Price, Name, Newest

**Test:** URL `?s=displayPrice:asc` shows lowest price first

#### L6B: Filtering
**DoD:**
- [ ] `FilterSidebar` renders filters from CMS config
- [ ] Checkboxes update URL with encoded filter state
- [ ] Page re-fetches with filter parameters
- [ ] Active filters shown as removable pills

**Test:** URL `?f=driverType:Dynamic` shows only dynamic driver headphones

#### L6C: Product Detail
**DoD:**
- [ ] `/product/[slug]` page exists
- [ ] Displays image gallery, product info, description, specs
- [ ] "Add to Cart" button (functional or placeholder)
- [ ] Related products carousel

**Test:** `/product/sennheiser-hd800s` shows correct product details

### Test Specifications

**Test L6A-01: Sort Dropdown**
```typescript
it('L6A-01: Sort dropdown updates URL', () => {
  render(<SortDropdown />);
  fireEvent.click(screen.getByText('Price: Low to High'));
  expect(window.location.search).toContain('s=displayPrice:asc');
});
```

**Test L6B-01: Filter Sidebar**
```typescript
it('L6B-01: Checkbox filter updates URL', () => {
  render(<FilterSidebar config={mockFilterConfig} />);
  fireEvent.click(screen.getByLabelText('Dynamic'));
  expect(window.location.search).toContain('f=driverType:Dynamic');
});
```

**Test L6C-01: Product Detail Page**
```typescript
it('L6C-01: Product page displays correct data', async () => {
  const { container } = render(
    await ProductPage({ params: { slug: 'sennheiser-hd800s' } })
  );
  expect(screen.getByText('HD 800S')).toBeInTheDocument();
  expect(container.querySelector('[data-testid="image-gallery"]')).toBeInTheDocument();
});
```

### Files to Create
```
app/
├── (store)/
│   ├── shop/[...slug]/
│   │   └── page.tsx              # Update to accept searchParams
│   └── product/[slug]/
│       ├── page.tsx              # L6C
│       ├── loading.tsx
│       └── error.tsx
└── components/
    └── features/
        ├── filters/
        │   ├── FilterSidebar.tsx       # L6B
        │   ├── SortDropdown.tsx        # L6A
        │   ├── ActiveFilters.tsx       # L6B
        │   └── __tests__/
        └── product-detail/
            ├── ProductDetailLayout.tsx   # L6C
            ├── ImageGallery.tsx          # L6C
            ├── ProductInfo.tsx           # L6C
            └── __tests__/
```

---

## Verification Matrix

| Layer | Automated Tests | Manual Verification | Sign-off |
|-------|-----------------|---------------------|----------|
| L1 Foundation | 3 test files | VFS JSON inspection | User |
| L2 Data | 2 test files | 3 URL product counts | User |
| L3 Routes | 3 test files | Click through navigation | User |
| L4 Skeleton | 3 test files | Visual breakpoint check | User |
| L5 Integration | 3 test files | Product data accuracy | User |
| L6A Sort | 1 test file | Sort functionality | User |
| L6B Filter | 2 test files | Filter + URL state | User |
| L6C Detail | 2 test files | Product page complete | User |

---

## Sprint Organization

### Sprint 1: Foundation + Data (Layers 1-2)
- **Scope:** L1 Foundation + L2 Data
- **DoD:** 5 test files passing + 3 manual URL verifications
- **Est. Time:** 4-6 hours

### Sprint 2: Routes + Skeleton (Layers 3-4)
- **Scope:** L3 Routes + L4 Skeleton
- **DoD:** Pages exist, skeletons render, 6 test files passing
- **Est. Time:** 4-6 hours

### Sprint 3: Integration (Layer 5)
- **Scope:** L5 Integration
- **DoD:** Real data displays, images load, 3 test files passing
- **Est. Time:** 3-4 hours

### Sprint 4: Features (Layer 6A-C)
- **Scope:** Sort, Filter, Product Detail
- **DoD:** Full functionality, 5 test files passing
- **Est. Time:** 8-12 hours

---

## AI Implementation Protocol

**Per Layer:**
1. **You** verify previous layer is LOCKED (tests passing, manual check done)
2. **You** write layer test specifications (copy from this doc)
3. **AI** implements layer code to satisfy tests
4. **You** run tests, verify manually
5. **You** mark layer LOCKED
6. Proceed to next layer

**AI Context:**
- Feed AI: This doc + previous layer test file + previous layer implementation
- Explicit prompt: "Implement Layer X to satisfy these tests. No styling. No features beyond spec."
- Review output line-by-line before accepting

**Rejection Criteria:**
- Any client component without explicit "use client"
- Any useState/useEffect in Server Components
- Any features beyond current layer scope
- Any styling beyond structural Tailwind
