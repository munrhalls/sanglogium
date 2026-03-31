# Sprint: Product Card Hybrid Redesign (Editorial + Grid)

**Sprint ID:** S6-PRODUCT-CARD-HYBRID
**Status:** READY
**Estimated Duration:** 2-3 hours
**Dependencies:** None — pure UI component refactor

---

## Executive Summary

The **ProductCard** (`app/components/features/products/ProductCard.tsx`) currently follows a dense grid approach that lacks the editorial polish of the **FeaturedCard** (`app/components/features/homepage/featured/Featured.tsx`). 

**The gap:** ProductCard is functional but underwhelming — no cart CTA, weak visual hierarchy, inconsistent image treatment.

This sprint creates a **hybrid design** that keeps the grid density (for products page context) while adopting:
- ✅ Editorial image treatment (`object-contain` + `mix-blend-multiply`)
- ✅ Brand badge absolute-positioned on image
- ✅ Cart CTA button with icon
- ✅ Stronger hover effects (`-translate-y-1`)
- ✅ Improved vertical rhythm with `flex-grow` layout

---

## Scope Contract

### Current State vs Target State

| Element | Current State (ProductCard) | Target State (Hybrid) |
|---------|----------------------------|------------------------|
| **Image treatment** | `object-cover` + `rounded` | `object-contain` + `mix-blend-multiply` |
| **Brand display** | Below image as caption | Absolute on image (top-left) |
| **CTA** | None (link only) | Cart button with icon + "Add" text |
| **Hover effect** | `-translate-y-0.5` | `-translate-y-1` |
| **Card structure** | Border + padding | `card-product` class + flex column |
| **Price/button layout** | Stacked | Horizontal with `mt-auto` |

### IN SCOPE

1. **ProductCard.tsx refactor** — Hybrid design implementation
2. **ProductImage.tsx** — Verify/adjust for `object-contain` support
3. **Design system compliance** — Use `card-product`, `btn-cart`, `type-*` tokens
4. **Responsive behavior** — Desktop (1280px) → Mobile (375px)

### OUT OF SCOPE (Explicitly Forbidden)

- ❌ No changes to `ProductGrid.tsx` — grid structure is correct
- ❌ No changes to `Price.tsx` — component is complete
- ❌ No changes to product data structure or API
- ❌ No new animations beyond existing transitions
- ❌ No changes to FeaturedCard — it's the reference, not the target
- ❌ No cart functionality — button is UI-only (existing behavior)

---

## Regression Risk Analysis

### Files at Risk

| File | Risk Level | Risk Description | Mitigation |
|------|------------|------------------|------------|
| `ProductCard.tsx` | **HIGH** | Complete component rewrite | Component test coverage; verify all props still accepted |
| `ProductImage.tsx` | **MEDIUM** | May need `className` prop pass-through | Verify existing usages not broken |
| `ProductGrid.tsx` | **LOW** | Grid gap/spacing assumptions | Visual regression — card heights must still align |
| `CategoryPageClient.tsx` | **LOW** | Product prop interface | Verify prop mapping unchanged |

### Regression Test Requirements

```typescript
// tests/regression/product-card-redesign.test.ts

describe('S6 Regression: Product Card Hybrid Redesign', () => {

  // R1: Product data interface unchanged
  it('R1: ProductCard accepts same props as before', () => {
    const product = {
      _id: 'test-id',
      name: 'Test Product',
      brand: { _id: 'brand-id', name: 'TestBrand' },
      displayPrice: 299.99,
      image: { asset: { _ref: 'image-ref' } },
      slug: { current: 'test-product' }
    };
    
    render(<ProductCard product={product} />);
    expect(screen.getByTestId('product-card')).toBeInTheDocument();
  });

  // R2: Navigation still works
  it('R2: Card links to product detail page', () => {
    render(<ProductCard product={mockProduct} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/test-product');
  });

  // R3: Image renders with alt text
  it('R3: Product image has accessible alt text', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByAltText('Test Product')).toBeInTheDocument();
  });

  // R4: Brand name displays
  it('R4: Brand name is visible to users', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('TestBrand')).toBeVisible();
  });

  // R5: Price displays
  it('R5: Price is formatted and visible', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('$300')).toBeVisible(); // formatted
  });

  // R6: Cart button exists (new feature, not regression)
  it('R6: Cart button is present and accessible', () => {
    render(<ProductCard product={mockProduct} />);
    const button = screen.getByRole('button', { name: /add/i });
    expect(button).toBeVisible();
    expect(button).toHaveAttribute('aria-label', 'Add Test Product to cart');
  });
});
```

---

## 3-Pass Implementation Architecture

### Pass 1 — Skeleton Pass (Structure Only)

**Goal:** Verify semantic HTML structure, no styling classes.

**DoD:**
- [ ] `article` wrapper with `data-testid="product-card"`
- [ ] `a` link wrapper with correct `href`
- [ ] `figure` for image container
- [ ] `img` with `alt` attribute
- [ ] `span` for brand badge (absolute positioned)
- [ ] `div` for content area
- [ ] `h3` for product name
- [ ] `p` for price
- [ ] `button` for cart CTA

**Verification:**
```bash
npm run test:unit -- --testNamePattern="S6 Regression"
```

---

### Pass 2 — Data Pass (Real Data, No Styling)

**Goal:** Verify all props flow correctly, real product data renders.

**DoD:**
- [ ] `product.name` renders in `h3`
- [ ] `product.brand.name` renders in brand badge
- [ ] `product.displayPrice` passed to `Price` component
- [ ] `product.image` passed to `ProductImage`
- [ ] `product.slug.current` used in `href`
- [ ] `button` has proper `aria-label` with product name

**Verification:**
```bash
npm run test:component -- ProductCard.spec.tsx
```

---

### Pass 3 — Build Pass (Component-by-Component, Full Scope)

**Sequencing Rule:** Desktop (1280px) first, then Mobile (375px).

**Component:** `ProductCard.tsx` — single component sprint

#### Layer 1 — Structure (No Classes)

**DoD Desktop:**
- [ ] Semantic HTML skeleton complete
- [ ] Proper heading hierarchy (`h3`)
- [ ] Interactive elements accessible (link, button)
- [ ] No visual styling classes

**DoD Mobile (375px):**
- [ ] Same structure, no layout assumptions

**Verification:**
```bash
npx playwright test --project=chromium --viewport-size="1280,720"
npx playwright test --project=chromium --viewport-size="375,667"
```

#### Layer 2 — Layout (Flex/Grid/Spacing Only)

**DoD Desktop:**
- [ ] `card-product` class applied (contains base layout)
- [ ] `flex flex-col gap-4` for card content
- [ ] `aspect-[4/3]` on figure
- [ ] `relative` on figure for brand badge positioning
- [ ] `absolute left-4 top-4` on brand span
- [ ] `flex-grow` on content div for vertical stretch
- [ ] `mt-auto flex items-center justify-between` on price/button row

**DoD Mobile (375px):**
- [ ] Same layout, smaller padding if needed (`p-4` vs `p-6`)
- [ ] Touch-friendly button sizing (min 44px)

**Verification:**
```bash
npx playwright test tests/component/ProductCard.spec.tsx
```

#### Layer 3 — Surface (Colors, Typography, Imagery)

**DoD Desktop:**
- [ ] `bg-surface-productImage` on figure
- [ ] `text-small font-bold uppercase tracking-editorial text-brand-900` on brand span
- [ ] `type-body font-medium line-clamp-2` on product name
- [ ] `type-price` on price
- [ ] `btn-cart` class on button
- [ ] `object-contain mix-blend-multiply` on image via ProductImage

**DoD Mobile (375px):**
- [ ] Same typography scale
- [ ] Brand badge readable at small size
- [ ] Button remains tappable

**Design System Compliance Check:**
```bash
# Verify tokens exist
grep -n "btn-cart" tailwind.config.ts
grep -n "surface-productImage" tailwind.config.ts
grep -n "type-price" tailwind.config.ts
```

#### Layer 4 — Interaction (Hover, Transitions)

**DoD Desktop:**
- [ ] `group` class on article for hover context
- [ ] `group-hover:shadow-cardHover group-hover:-translate-y-1` on article
- [ ] `transition-all duration-300` on article
- [ ] `group-hover:scale-110` on image
- [ ] `transition-transform duration-700` on image
- [ ] Button: `active:scale-95` for press feedback
- [ ] Button hover: uses `btn-cart` built-in hover

**DoD Mobile (375px):**
- [ ] Hover effects gracefully degrade (no hover on touch)
- [ ] Active states work on touch
- [ ] `pointer-fine:` prefixes for hover-only effects

**Verification:**
```bash
npx playwright test --ui
# Manual: Hover over card at 1280px, verify lift + shadow
# Manual: Hover over image, verify scale
# Manual: Tap card at 375px, verify no sticky hover state
```

---

## Implementation Notes

### ProductImage.tsx Adjustments

Current `ProductImage.tsx` uses `object-cover`. For hybrid design:

```typescript
// Add className prop support to ProductImage
interface ProductImageProps {
  image: any;
  alt: string;
  className?: string;
  priority?: boolean;
  objectContain?: boolean; // NEW: for editorial treatment
}
```

If `objectContain={true}`, apply `object-contain mix-blend-multiply` instead of `object-cover`.

**Risk Mitigation:** Default behavior unchanged (`object-cover`), new prop opt-in.

### Cart Button Behavior

The cart button in FeaturedCard is UI-only (no actual cart functionality). Maintain this:
- Button renders visually
- `aria-label` for accessibility
- No `onClick` handler needed (matches existing pattern)
- Future sprint will wire cart functionality

### Responsive Breakpoints

| Breakpoint | Card Padding | Image Aspect | Brand Size | Notes |
|------------|--------------|--------------|------------|-------|
| 1280px+ | `p-6` | 4/3 | `text-small` | Full desktop experience |
| 768px-1279px | `p-5` | 4/3 | `text-small` | Tablet — slight reduction |
| 375px-767px | `p-4` | 4/3 | `text-xs` | Mobile — compact but tappable |

---

## Final Verification Checklist

### Pre-Implementation
- [ ] Regression tests written and failing (as expected)
- [ ] FeaturedCard design reviewed and documented above
- [ ] Design system tokens verified in `tailwind.config.ts`

### Post-Implementation
- [ ] All regression tests passing
- [ ] Component tests passing
- [ ] Visual verification at 1280px — cards align in grid, hover effects work
- [ ] Visual verification at 375px — touch-friendly, no layout breaks
- [ ] No console errors
- [ ] No accessibility warnings (axe-core)

### Regression Sign-Off
- [ ] ProductGrid still renders 4 columns at 1280px
- [ ] ProductGrid still renders 1 column at 375px
- [ ] Category page loads without errors
- [ ] No changes to other components (Price, ProductImage default behavior)

---

## Appendix: Reference Implementations

### FeaturedCard Pattern (from `Featured.tsx:36-72`)

```tsx
<a href={`/products/${product.slug}`} className="block group">
  <article className="card-product flex h-full flex-col gap-4 group-hover:shadow-cardHover group-hover:-translate-y-1 transition-all duration-300">
    <figure className="aspect-[4/3] relative flex w-full items-center justify-center overflow-hidden bg-surface-productImage p-6">
      <span className="absolute left-4 top-4 text-small font-bold uppercase tracking-editorial text-brand-900 z-10">
        {product.brand}
      </span>
      <Image
        src={urlFor(product.image).width(450).auto('format').quality(75).url()}
        alt={product.name}
        width={450}
        height={450}
        className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
      />
    </figure>

    <div className="flex flex-col flex-grow gap-3">
      <h3 className="type-body font-medium line-clamp-2">
        {product.name}
      </h3>
      <div className="mt-auto flex items-center justify-between pt-2">
        <p className="type-price">${product.displayPrice}</p>
        <button className="btn-cart transition-all active:scale-95" aria-label={`Add ${product.name} to cart`}>
          <ShoppingCart size={18} weight="regular" />
          <span className="text-cap font-bold">Add</span>
        </button>
      </div>
    </div>
  </article>
</a>
```

### Current ProductCard Pattern (from `ProductCard.tsx:19-44`)

```tsx
<article className="group border border-border-secondary bg-transparent p-4 shadow-cardDark transition-all duration-300 pointer-fine:hover:shadow-cardHoverDark pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:border-brand-400">
  <Link href={`/product/${product.slug.current}`} className="block space-y-3">
    <ProductImage image={product.image} alt={product.name} />
    <div className="space-y-1">
      {product.brand?.name && (
        <p className="type-caption text-secondary-500">{product.brand.name}</p>
      )}
      <h3 className="type-card-title line-clamp-2">{product.name}</h3>
      <Price value={product.displayPrice} />
    </div>
  </Link>
</article>
```

---

**Sprint Ready:** TRUE
**Estimated Completion:** 2-3 hours
**Risk Level:** MEDIUM (single component, well-defined scope)
