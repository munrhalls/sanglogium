# Audit: Product Detail Page Testing

## 1. End-State Delineation

### Desktop (1280px)
```
[BROWSER TAB — optimized title, no truncation]
[PAGE CONTENT — max-w-content, mx-auto, px-8]
  [BREADCRUMBS — full width, text-secondary]
  [MAIN CONTENT — lg:flex-row, gap-12]
    [IMAGE GALLERY — flex: 0 0 42%, aspect-square]
      [MAIN IMAGE — zoom modal on click]
      [THUMBNAIL STRIP — horizontal scroll]
    [PRODUCT INFO — flex: 0 0 58%]
      [BRAND NAME — type-overline, text-accent-500]
      [PRODUCT NAME — type-section-hed, text-headline]
      [PRICE — type-price, text-priceTag]
      [STOCK STATUS — color-coded, text-success-500]
      [QUANTITY SELECTOR — input-field, w-20]
      [ADD TO CART — btn-primary, w-full]
      [OVERVIEW SPECS — 2-column grid]
      [FULL SPECS — accordion-style table]
  [RELATED PRODUCTS — carousel, card-product-dark]
```

### Mobile (375px)
```
[SAME AREAS — stacked, full width]
  [IMAGE GALLERY — full width, aspect-square]
  [PRODUCT INFO — px-6, space-y-6]
    [STICKY ADD TO CART — fixed bottom, bg-surface-elevated]
```

### Design System Tokens Required
| Token | Current | Target | Gap ID |
|-------|---------|--------|--------|
| `btn-add-to-cart` | missing | add to tailwind.config.ts | G-01 |
| `urgency-indicator` | missing | add to tailwind.config.ts | G-02 |

---

## 2. Spatial Architecture

### User Flow Groups
| Group | Entry | Actions | Exit |
|-------|-------|---------|------|
| Product Discovery | PLP/Search | View details, Check specs, Add to cart | Checkout/Continue |
| Product Navigation | Any product | Click breadcrumbs, Related products | Other product pages |

### Component Hierarchy
```
ProductPage
├── Breadcrumbs (ol, flex items-center)
├── ProductDetail (lg:flex-row)
│   ├── ImageGallery (flex: 0 0 42%)
│   │   ├── MainImage (aspect-square, zoom modal)
│   │   └── ThumbnailStrip (flex gap-2)
│   └── ProductInfo (flex: 0 0 58%)
│       ├── BrandName (type-overline)
│       ├── ProductName (type-section-hed)
│       ├── Price (type-price)
│       ├── StockStatus (color-coded)
│       ├── QuantitySelector (input-field)
│       ├── AddToCart (btn-primary)
│       ├── OverviewFields (grid-cols-2)
│       └── Specifications (table)
└── RelatedProducts (carousel)
    └── ProductCard[]
```

---

## 3. Gap Analysis (G-XX)

| ID | Component | Current | Target | Severity |
|----|-----------|---------|--------|----------|
| G-01 | AddToCart | btn-primary | btn-add-to-cart (enhanced) | Medium |
| G-02 | StockStatus | Simple text | urgency-indicator (pulse) | Low |
| G-03 | MobileCTA | Standard button | Fixed sticky bottom | High |
| G-04 | TitleOptimization | Manual truncation | generateOptimizedTitle | High |

---

## 4. Testing Strategy

| Test Type | Number | Coverage | Execution Time |
|-----------|--------|----------|-----------------|
| Critical Path E2E | 3 | 80% | 15 seconds |
| Responsive Visual | 1 | 15% | 10 seconds |
| Edge Case Data | 2 | 5% | 5 seconds |
| **Total** | **6** | **100%** | **30 seconds** |

---

## 5. Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `getProductBySlug.ts` | Brand data structure changes | Verify all products load correctly |
| `ProductInfo.tsx` | Add to cart logic changes | Test cart functionality |
| `ImageGallery.tsx` | Zoom modal changes | Test image interactions |
| `page.tsx` | Metadata generation changes | Test page titles |

---

## 6. Verification Commands

```bash
# Pre-sprint regression
npm run build

# Critical path tests
npx playwright test tests/e2e/product-detail.spec.ts

# Responsive tests
npx playwright test --project=mobile --project=desktop

# Visual regression
npx playwright test --update-snapshots
```

---

## 7. Required Tests - The Minimal 6

### Test 1: Page Load & Data Integrity
**Why**: Prevents 404s, ensures core data displays
**Covers**: Product loading, brand display, price, stock status

### Test 2: Add to Cart Functionality  
**Why**: Protects revenue, ensures conversion works
**Covers**: Button state, cart updates, stock management

### Test 3: Navigation & Link Integrity
**Why**: Prevents broken user journeys
**Covers**: Breadcrumbs, related products, image gallery

### Test 4: Responsive Design
**Why**: 70% of traffic is mobile
**Covers**: Mobile layout, tablet, desktop, sticky CTA

### Test 5: Edge Case Data
**Why**: Handles problematic data gracefully
**Covers**: Null brands, out of stock, no images, long names

### Test 6: Invalid Routes
**Why**: Graceful error handling
**Covers**: 404 pages, malformed URLs, special characters

---

## 8. Success Criteria

### When Product Detail Page is "Correct"
- ✅ All 6 tests pass consistently
- ✅ No 404s from any product link
- ✅ Add to cart works for all scenarios
- ✅ Responsive design works on 3 viewports
- ✅ Edge cases handled without crashes
- ✅ Page titles display fully in browser tabs

### Proof of Correctness
- **Automated**: Tests run on every PR
- **Comprehensive**: 100% critical path coverage
- **Robust**: Handles all edge cases
- **Fast**: 30-second execution
- **Maintainable**: Only 6 tests to update

---

## Constraint Rules
- **NO** testing implementation details
- **NO** more than 6 tests total
- **ALL** tests must prove business value
- **EACH** test must cover multiple failure modes
- **SUCCESS** measured by business outcomes, not code coverage
