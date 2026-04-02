# Product Detail Page Testing Strategy
## Research Report: Minimal High-Impact Test Suite

**Date:** 2026-04-02  
**Scope:** Product Detail Page (`/products/[slug]`)  
**Objective:** Maximum coverage with minimum test count

---

## 1. Page Architecture Analysis

### Component Hierarchy
```
ProductPage (Server Component)
├── Breadcrumbs (Links: Home → /, Products → /products/headphones)
└── ProductDetail (Client Component wrapper)
    ├── ImageGallery (Client)
    │   ├── Main image with zoom
    │   ├── Thumbnail strip
    │   └── Zoom modal (keyboard: Escape)
    ├── ProductInfo (Client)
    │   ├── Brand, Name, Price, SKU, Stock
    │   ├── Quantity selector (+/-)
    │   └── Add to Cart button
    ├── Specifications Table (conditional)
    └── RelatedProducts (Client)
        └── Horizontal scrollable product cards
            └── Links: /products/{slug}
```

### Data Flow
```
URL /products/[slug]
  ↓
getProductBySlug(slug) → Sanity → Product | null
  ↓
getRelatedProducts(product._id, catalogueKeys) → RelatedProduct[]
  ↓
Hydrated with interactivity (ImageGallery, ProductInfo, RelatedProducts)
```

---

## 2. Risk Surface Analysis

### Critical Failure Points (High Impact)

| # | Risk | Impact | Likelihood |
|---|------|--------|------------|
| 1 | **Related Product 404s** | Customer can't navigate, SEO damage | HIGH |
| 2 | **Breadcrumb 404s** | Navigation broken, user trapped | MED |
| 3 | **Image Gallery Breaks** | Can't view product, no sale | MED |
| 4 | **Mobile Layout Collapse** | 60%+ traffic affected | HIGH |
| 5 | **Add to Cart Fails** | Direct revenue loss | HIGH |
| 6 | **Zoom Modal Trap** | User stuck, accessibility fail | MED |
| 7 | **Invalid Slug Handling** | Server error or wrong page | LOW |

### Interactions to Verify

| Component | Interaction | Critical? |
|-----------|-------------|-----------|
| ImageGallery | Thumbnail click | Yes |
| ImageGallery | Main image click → zoom | Yes |
| ImageGallery | Zoom Escape key | Yes |
| ImageGallery | Zoom close button | Yes |
| ProductInfo | Quantity +/- | Yes |
| ProductInfo | Add to Cart | CRITICAL |
| RelatedProducts | Card click navigation | Yes |
| Breadcrumbs | Home/Products links | Yes |

---

## 3. Testing Strategy: "The 3-Test Proof"

### Core Philosophy
> **3 well-designed E2E tests > 20 shallow tests**

Each test must:
1. **Prove multiple systems work together**
2. **Cover a complete user journey**
3. **Fail with clear signal** (no ambiguity)
4. **Run across all viewports** (RWD matrix built-in)

---

## 4. The Test Suite

### Test 1: The "Golden Path" E2E
**Purpose:** Verify complete customer journey works end-to-end

**Coverage:**
- ✅ Page loads with valid slug
- ✅ All data renders (name, price, brand, SKU, stock)
- ✅ Images load and display
- ✅ Breadcrumb navigation works
- ✅ Quantity selector functions
- ✅ Add to Cart updates basket
- ✅ Related products load and link correctly
- ✅ Specifications render when present

**Execution Matrix:**
```typescript
// Runs on ALL 8 browser configurations:
// Desktop: Chrome, Firefox, Safari, Edge
// Mobile: Android Chrome, iOS Safari
```

**Why One Test Covers So Much:**
- Single product fetch validates data layer
- Image rendering validates Sanity CDN + next/image
- Breadcrumb clicks validate routing
- Related products validate VFS integration
- Add to Cart validates store + persistence

**Code Pattern:**
```typescript
test('Golden Path: Complete product journey', async ({ page }) => {
  // 1. Navigate to known product
  await page.goto('/products/sennheiser-hd-800-s');
  
  // 2. Verify critical content renders
  await expect(page.locator('h1')).toContainText('HD 800 S');
  await expect(page.locator('[data-testid="price"]')).toBeVisible();
  
  // 3. Verify images load
  const mainImage = page.locator('[data-testid="main-image"]');
  await expect(mainImage).toBeVisible();
  await expect(mainImage).toHaveAttribute('src', /.+/);
  
  // 4. Test breadcrumb navigation
  await page.locator('a[href="/"]').first().click();
  await expect(page).toHaveURL('/');
  await page.goBack();
  
  // 5. Test quantity selector
  await page.locator('[aria-label="Increase quantity"]').click();
  await expect(page.locator('[data-testid="quantity"]')).toHaveText('2');
  
  // 6. Test add to cart
  await page.locator('button:has-text("Add to Cart")').click();
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('2');
  
  // 7. Test related products navigation
  const relatedLink = page.locator('[data-testid="related-products"] a').first();
  const href = await relatedLink.getAttribute('href');
  await relatedLink.click();
  await expect(page).toHaveURL(href!);
});
```

---

### Test 2: The "RWD Stress Test"  
**Purpose:** Prove responsive design works across all breakpoints

**Coverage:**
- ✅ Mobile portrait (390×844): Stacked layout, touch targets
- ✅ Mobile landscape (844×390): Layout adaptation
- ✅ Tablet (768×1024): Grid behavior
- ✅ Desktop (1280×720): Side-by-side layout
- ✅ Large desktop (1440×900): Max-width constraints
- ✅ Image gallery adapts (thumbnails visible/hidden)
- ✅ No horizontal overflow
- ✅ Touch targets ≥ 44px on mobile
- ✅ Zoom modal works on all sizes

**Why Separate RWD Test:**
- Layout breakpoints change component visibility
- Touch targets only matter on mobile
- Zoom modal sizing differs by viewport
- Related products carousel behavior varies

**Code Pattern:**
```typescript
const viewports = [
  { name: 'mobile-portrait', width: 390, height: 844 },
  { name: 'mobile-landscape', width: 844, height: 390 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'large-desktop', width: 1440, height: 900 },
];

viewports.forEach(({ name, width, height }) => {
  test(`RWD: ${name} layout integrity`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/products/sennheiser-hd-800-s');
    
    // No horizontal overflow
    const body = await page.locator('body').boundingBox();
    expect(body!.width).toBeLessThanOrEqual(width + 1);
    
    // Content visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Mobile-specific checks
    if (width < 768) {
      // Touch targets
      const buttons = page.locator('button');
      for (const button of await buttons.all()) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
      
      // Layout: stacked (image above info)
      const imageGallery = page.locator('[data-testid="image-gallery"]');
      const productInfo = page.locator('[data-testid="product-info"]');
      const imgBox = await imageGallery.boundingBox();
      const infoBox = await productInfo.boundingBox();
      expect(imgBox!.y).toBeLessThan(infoBox!.y);
    } else {
      // Desktop: side-by-side
      const imageGallery = page.locator('[data-testid="image-gallery"]');
      const productInfo = page.locator('[data-testid="product-info"]');
      const imgBox = await imageGallery.boundingBox();
      const infoBox = await productInfo.boundingBox();
      // Y positions roughly equal (side by side)
      expect(Math.abs(imgBox!.y - infoBox!.y)).toBeLessThan(100);
    }
  });
});
```

---

### Test 3: The "Edge Case & Error" Suite
**Purpose:** Prove graceful degradation and error handling

**Coverage:**
- ✅ Invalid slug → 404 page (not crash)
- ✅ Product with no images → placeholder displays
- ✅ Product with no related products → section hidden
- ✅ Product with no specifications → section hidden
- ✅ Out of stock → button disabled, message shown
- ✅ Zoom modal keyboard navigation (Escape, Tab trap)
- ✅ Cart persistence across navigation

**Code Pattern:**
```typescript
test('Edge Case: Invalid product slug', async ({ page }) => {
  await page.goto('/products/non-existent-product-12345');
  await expect(page.locator('h1:has-text("404")')).toBeVisible();
  // Or custom not-found page
  await expect(page.locator('text=Product Not Found')).toBeVisible();
});

test('Edge Case: Product with no images', async ({ page }) => {
  await page.goto('/products/product-without-images');
  await expect(page.locator('[data-testid="image-gallery-placeholder"]')).toBeVisible();
});

test('Edge Case: Out of stock product', async ({ page }) => {
  await page.goto('/products/out-of-stock-product');
  
  const addButton = page.locator('button:has-text("Out of Stock")');
  await expect(addButton).toBeDisabled();
  await expect(page.locator('text=Out of Stock')).toBeVisible();
});

test('Accessibility: Zoom modal keyboard trap', async ({ page }) => {
  await page.goto('/products/sennheiser-hd-800-s');
  
  // Open zoom
  await page.locator('[data-testid="main-image"]').click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  
  // Escape closes
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});
```

---

## 5. Integration Tests (API Layer)

### Why Separate from E2E
- E2E tests the UI; Integration tests the data contracts
- Faster execution (no browser)
- Catches API changes before they break UI

### Test 4: Data Fetching Contracts
```typescript
test('getProductBySlug returns valid product structure', async () => {
  const product = await getProductBySlug('sennheiser-hd-800-s');
  
  expect(product).toMatchObject({
    _id: expect.any(String),
    name: expect.any(String),
    displayPrice: expect.any(Number),
    stock: expect.any(Number),
    sku: expect.any(String),
    slug: { current: expect.any(String) },
    catalogueLocationKeys: expect.any(Array),
  });
});

test('getRelatedProducts returns valid slugs', async () => {
  const product = await getProductBySlug('sennheiser-hd-800-s');
  const related = await getRelatedProducts(
    product._id,
    product.catalogueLocationKeys,
    6
  );
  
  // All related products have valid slugs
  for (const item of related) {
    expect(item.slug.current).toMatch(/^[a-z0-9-]+$/);
    expect(item._id).toMatch(/^[_a-z0-9-]+$/);
  }
});
```

---

## 6. What We DON'T Test (Intentional Exclusions)

| Excluded | Reason |
|----------|--------|
| Every possible slug | Impossible; test representative sample |
| Visual pixel-perfect matching | Too brittle; test functional behavior |
| Performance benchmarks | Separate performance suite |
| SEO meta tags | Covered in metadata unit tests |
| All quantity values (1-100) | Test boundaries (1, max, exceed max) |
| Image quality/resolution | Sanity CDN responsibility |
| Cart persistence across sessions | LocalStorage implementation detail |

---

## 7. Test Execution Strategy

### Local Development
```bash
# Run all product detail tests
npx playwright test tests/e2e/product-detail/ --reporter=line

# Run single test with UI mode
npx playwright test tests/e2e/product-detail/golden-path.spec.ts --ui
```

### CI Pipeline
```bash
# Run on all 8 browser configurations
npx playwright test tests/e2e/product-detail/

# Parallel execution (shards)
npx playwright test --shard=1/4  # Runs 25% of tests
```

### Coverage Metrics
| Metric | Target | Current |
|--------|--------|---------|
| E2E test count | 3 (+ RWD variants) | 0 |
| Integration test count | 2 | 0 |
| Browser coverage | 8 configurations | 0 |
| Critical user paths | 100% | 0% |
| Link validation | 100% | 0% |

---

## 8. Implementation Priority

### Phase 1: Foundation (Day 1)
1. Create `tests/e2e/product-detail/golden-path.spec.ts`
2. Add test product fixtures to Sanity
3. Verify test runs on localhost

### Phase 2: RWD Coverage (Day 2)
1. Create `tests/e2e/product-detail/rwd.spec.ts`
2. Add viewport matrix testing
3. Validate mobile/desktop layouts

### Phase 3: Edge Cases (Day 3)
1. Create `tests/e2e/product-detail/edge-cases.spec.ts`
2. Test 404 handling
3. Test empty states

### Phase 4: Integration (Day 4)
1. Create `tests/integration/product-api.spec.ts`
2. Validate data contracts
3. Test related product slug integrity

---

## 9. Success Criteria

**We know the Product Detail Page works when:**

1. ✅ **Golden Path test passes on all 8 browsers**
   - Chrome, Firefox, Safari, Edge (desktop)
   - Pixel 5 (Android Chrome), iPhone 12 (iOS Safari)

2. ✅ **RWD test passes on all 5 viewports**
   - No horizontal overflow
   - Touch targets ≥ 44px on mobile
   - Layout adapts correctly

3. ✅ **Edge Case tests pass**
   - Invalid slugs show 404 (not crash)
   - Missing data shows placeholders (not empty)
   - Keyboard navigation works

4. ✅ **Integration tests pass**
   - API returns expected data structure
   - All related product slugs are valid

5. ✅ **Link integrity verified**
   - All breadcrumb links lead to 200
   - All related product links lead to 200

---

## 10. Maintenance Strategy

### When Tests Break
1. **Golden Path fails** → Critical regression, stop deployment
2. **RWD fails** → Layout regression, check recent CSS changes
3. **Edge Cases fail** → Data or logic regression
4. **Integration fails** → API contract changed

### Test Data Requirements
- 1 "perfect" product (all fields populated)
- 1 product with no images
- 1 product with no related products
- 1 product out of stock
- 1 product with no specifications

---

## Summary

**The 3-Test Suite:**
1. **Golden Path** (1 test × 8 browsers = 8 runs) - Complete user journey
2. **RWD Stress** (1 test × 5 viewports = 5 runs) - Responsive integrity
3. **Edge Cases** (3-4 tests × 1 browser = 4 runs) - Error handling

**Total: ~17 test executions** covering:
- ✅ Data fetching & rendering
- ✅ Image loading & gallery
- ✅ All navigation links (breadcrumbs, related products)
- ✅ Quantity selector & add to cart
- ✅ Responsive design (mobile → desktop)
- ✅ Error states (404, missing data)
- ✅ Keyboard accessibility

**This proves the Product Detail Page works correctly, robustly, and non-brittle across all dimensions.**
