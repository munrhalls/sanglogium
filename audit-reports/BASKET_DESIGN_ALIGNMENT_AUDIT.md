# Basket Page Audit Report
## Sang Logium E-Commerce Platform

**Date:** March 31, 2026  
**Auditor:** AI Assistant  
**Scope:** Basket page alignment with homepage design system, UX best practices, and core e-commerce fundamentals

---

## Executive Summary

The current basket implementation has **significant design system misalignments** and **missing UX features** that create a disjointed user experience. While the functional foundation (Zustand state management, quantity controls, checkout flow) is solid, the visual presentation breaks from the established luxury audio brand aesthetic defined on the homepage.

### Overall Grade: **C+ (Requires Improvement)**

---

## 1. Design System Alignment Analysis

### 1.1 Color Palette Violations

| Design System Token | Homepage Usage | Basket Page Usage | Status |
|---------------------|----------------|-------------------|--------|
| `bg-brand-800` | Page background (`@layout.tsx:39`) | `bg-slate-100` (`@page.tsx:8`) | **VIOLATION** |
| `bg-brand-900` | Featured section (`@Featured.tsx:78`) | `bg-white` (BasketSummary, Basket) | **VIOLATION** |
| `surface.card` | Product cards (`@tailwind.config.ts:61`) | `bg-white` / `bg-gray-50` | **VIOLATION** |
| `text.headline` | Section headers (`brand[400]`) | `text-gray-900` | **VIOLATION** |
| `text.body` | Body text (`brand[200]`) | `text-gray-700/500` | **VIOLATION** |
| `border.secondary` | Card borders (`secondary[700]`) | `border-gray-200` | **VIOLATION** |

**Critical Finding:** The basket page uses a **light-mode aesthetic** (`bg-slate-100`, `bg-white`, Tailwind gray palette) while the entire storefront uses a **dark luxury theme** (`bg-brand-800/900`, warm cream accents). This creates a jarring context switch.

### 1.2 Typography System Gaps

**Homepage Pattern (from `@Hero.tsx:79-91`):**
```tsx
<h1 className="text-cap type-hero-headline uppercase">{heroData.headline}</h1>
<p className="text-cap type-hero-sub">{heroData.subheadline}</p>
```

**Basket Page (from `@Basket.tsx:11-17`):**
```tsx
<div className="hidden grid-cols-[3fr_1fr_1fr_auto] border-b border-gray-200 bg-gray-50 p-5 text-sm font-semibold text-gray-700 lg:grid">
```

**Missing Typography Classes:**
- `type-section-hed` - Not used for "Your Basket" title
- `type-section-sub` - Not used for section subtitles
- `type-body` - Uses arbitrary `text-lg font-medium` instead
- `type-price` - Uses arbitrary `$` formatting
- `text-cap` / `text-ex` - Text box trimming not applied

### 1.3 Component Pattern Misalignment

**Homepage Card Pattern (`@Featured.tsx:36-71`):**
- Uses `card-product` class with hover effects
- `bg-surface-productImage` for image containers
- `type-price` for pricing
- `btn-cart` for cart actions
- Warm cream accent colors (`brand-400`)

**Basket Card Pattern (`@Basket.tsx:24-41`):**
- Uses arbitrary `bg-gray-100` for placeholder
- Uses `ShoppingCartIcon` from Heroicons (gray) instead of `ShoppingCart` from Phosphor (brand color)
- No hover effects matching `interactive-card` class
- No price styling consistency

### 1.4 Layout System Gaps

**Homepage Pattern:**
- Uses `Shelf` component with `max-w-content` (1280px)
- Consistent `py-20` section padding
- `fullBleed` option for immersive sections

**Basket Page:**
- Uses arbitrary `max-w-7xl mx-auto my-8 px-4 pb-16 pt-8`
- No `Shelf` component usage
- Inconsistent vertical spacing

---

## 2. E-Commerce UX Best Practices Analysis

### 2.1 Shopping Cart UX Standards (per Zoho Academy, Baymard Institute)

| Best Practice | Implementation Status | Gap Analysis |
|---------------|----------------------|--------------|
| **Product Images** | **MISSING** | Uses placeholder `ShoppingCart` icon instead of actual product images |
| **Product Details** | **PARTIAL** | Name and price shown, but missing brand, SKU, variant details |
| **Editable Quantities** | **IMPLEMENTED** | `BasketControls.tsx` has + / - controls with stock validation |
| **Remove Functionality** | **IMPLEMENTED** | X button present, functional |
| **Persistent Cart** | **IMPLEMENTED** | Zustand + persist middleware saves to localStorage |
| **Price Transparency** | **PARTIAL** | Subtotal, shipping, total shown; tax not itemized |
| **Continue Shopping CTA** | **IMPLEMENTED** | Present in `BasketSummary.tsx:49-56` |
| **Checkout CTA** | **IMPLEMENTED** | Present but styling inconsistent |
| **Trust Signals** | **MISSING** | Payment method icons are placeholder divs (`bg-gray-200`) |
| **Progress Indicator** | **MISSING** | No checkout progress/stepper visible |
| **Save for Later** | **MISSING** | No wishlist/save functionality |
| **Stock Indicators** | **PARTIAL** | Stock checked in logic, not displayed to user |
| **Free Shipping Threshold** | **MISSING** | No dynamic shipping calculator or threshold messaging |

### 2.2 Critical UX Gaps

**1. Product Image Absence (HIGH PRIORITY)**
```tsx
// Current (@Basket.tsx:25-27)
<div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-sm bg-gray-100">
  <ShoppingCart className="text-gray-400" size={40} />
</div>
```
The basket stores `image` field in `BasketItem` type but doesn't render it. This violates the #1 cart UX principle: users need visual confirmation of cart contents.

**2. Trust Signal Placeholders (MEDIUM PRIORITY)**
```tsx
// @BasketSummary.tsx:62-65
<div className="flex items-center gap-2">
  <div className="h-6 w-10 rounded bg-gray-200"></div> {/* Placeholder! */}
  <div className="h-6 w-10 rounded bg-gray-200"></div>
  <div className="h-6 w-10 rounded bg-gray-200"></div>
  <div className="h-6 w-10 rounded bg-gray-200"></div>
</div>
```

**3. Missing Cart Persistence Feedback (LOW PRIORITY)**
No visual indication that cart items persist across sessions.

---

## 3. Technical Architecture Assessment

### 3.1 State Management: **EXEMPLARY**

**Strengths:**
- Clean Zustand store with `persist` middleware
- Proper TypeScript interfaces (`BasketItem`)
- Stock validation on add/update
- Hydration handling with `_hasHydrated` flag
- Atomic operations (addItem, removeItem, updateQuantity)

**File:** `@store/store.ts:1-96`

### 3.2 Component Architecture: **ADEQUATE**

**Strengths:**
- Separation of concerns (`Basket`, `BasketSummary`, `BasketClientWrapper`)
- Client/server boundary properly handled
- Suspense with fallback loader

**Weaknesses:**
- `SegmentTitle` component is essentially empty (`@segment-title/SegmentTitle.tsx:1-20`)
- No reusable `Card` component applied
- Inline styling instead of design system classes

### 3.3 Checkout Integration: **FUNCTIONAL**

- Redirects to `/checkout/shipping` properly
- Checkout layout fetches user address from Sanity
- Stripe integration prepared (mentioned in trust signals)

---

## 4. Accessibility Audit

| Criterion | Status | Notes |
|-----------|--------|-------|
| ARIA Labels | **PASS** | `aria-label` present on buttons |
| Keyboard Navigation | **PARTIAL** | Buttons are native, but no focus indicators styled |
| Color Contrast | **UNKNOWN** | Needs testing with actual brand colors |
| Screen Reader | **PARTIAL** | Product images lack alt text (using icons) |
| Reduced Motion | **MISSING** | No `prefers-reduced-motion` handling |

---

## 5. Mobile Responsiveness

**Strengths:**
- Responsive grid (`lg:grid-cols-[3fr_1fr_1fr_auto]`)
- Mobile-first quantity controls
- Sticky summary on desktop (`sticky top-4`)

**Gaps:**
- No mobile-optimized product card layout
- "Continue Shopping" button hidden on mobile (`hidden lg:block`)
- No swipe-to-remove gesture support

---

## 6. Recommendations by Priority

### 6.1 Critical (P0) - Fix Immediately

1. **Apply Design System Colors**
   - Change page background to `bg-brand-800`
   - Change card backgrounds to `surface.card` (`#1A1A19`)
   - Update text to `text.headline` (`brand[400]` warm cream)
   - Update borders to `border.secondary` (`secondary[700]`)

2. **Add Product Images**
   ```tsx
   // Implement actual image rendering
   <Image 
     src={item.image} 
     alt={item.name}
     width={96}
     height={96}
     className="object-contain"
   />
   ```

3. **Fix SegmentTitle Component**
   - Currently renders empty divs
   - Implement proper title with logo orbit decoration

### 6.2 High (P1) - Next Sprint

4. **Implement Trust Signals**
   - Replace placeholder divs with actual payment icons (Visa, Mastercard, Stripe)
   - Add security badges (SSL, secure checkout)

5. **Add Typography System Classes**
   - Apply `type-section-hed` to "Your Basket" title
   - Apply `type-price` to all price displays
   - Apply `type-body` to product names

6. **Add Free Shipping Progress**
   - Calculate progress toward free shipping threshold
   - Display dynamic messaging (e.g., "Add $23.01 more for free shipping")

### 6.3 Medium (P2) - Backlog

7. **Add Save for Later / Wishlist**
8. **Add Stock Visibility**
   - Show "Only 3 left in stock" messaging
9. **Add Product Variant Details**
   - Color, size, SKU information
10. **Implement Cart Recovery**
    - Email reminder for abandoned carts

### 6.4 Low (P3) - Polish

11. **Add Micro-interactions**
    - `interactive-card` hover effects
    - Quantity change animations
12. **Add Empty State Enhancement**
    - Featured product recommendations
    - Personalized suggestions

---

## 7. Implementation Example

### Before (Current):
```tsx
<div className="mx-auto my-8 max-w-7xl bg-slate-100 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
  <div className="mb-8">
    <SegmentTitle title="Your Basket" />
  </div>
```

### After (Design System Aligned):
```tsx
<Shelf>
  <div className="mb-8">
    <h1 className="type-section-hed uppercase section-header-anchor">
      Your Basket
    </h1>
  </div>
  <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
    <div className="lg:col-span-2">
      <div className="card-base overflow-hidden">
        {/* Basket items with surface.card background */}
      </div>
    </div>
    <div className="lg:col-span-1">
      <div className="card-base sticky top-4">
        {/* Summary with proper typography */}
      </div>
    </div>
  </div>
</Shelf>
```

---

## 8. Conclusion

The basket page represents a **functional but visually disconnected** part of the Sang Logium experience. The underlying architecture (Zustand state, checkout flow) is sound, but the presentation layer requires significant alignment work to match the luxury audio brand aesthetic established on the homepage.

**Estimated Effort to Align:**
- **P0 (Critical):** 4-6 hours
- **P1 (High):** 8-12 hours
- **P2 (Medium):** 16-20 hours
- **Total to Full Alignment:** 2-3 dev days

**Risk if Not Addressed:**
- Increased cart abandonment due to trust/visual disconnect
- Brand perception inconsistency
- Lower conversion rates on cart-to-checkout funnel

---

## Appendix: Design System Reference

### Color Tokens (from `@tailwind.config.ts:6-80`)
- **Brand:** Warm cream palette (50: `#FEFCFB` → 900: `#070808`)
- **Surface Card:** `#1A1A19` (near-black)
- **Text Headline:** `brand[400]` `#F6E3D5`
- **Text Body:** `brand[200]` `#FAEEE6`
- **Accent:** Gold `#D4AF37`

### Typography Tokens
- **Display-1:** Hero headlines, `clamp(3rem, 4vw + 2rem, 5.625rem)`
- **H1:** Section headers, `clamp(1.6875rem, 2.25vw + 1.16rem, 3.1875rem)`
- **Body:** 16px/24px, `brand[200]` color
- **Price:** H4 sizing, semibold, `secondary[300]`

### Component Classes
- `card-base`: Background, padding, border-radius, shadow
- `card-product`: Transparent bg, hover lift effect
- `btn-primary`: Primary CTA styling
- `btn-cart`: Cart-specific button with icon
- `interactive-card`: Hover scale/border effects

---

**End of Report**
