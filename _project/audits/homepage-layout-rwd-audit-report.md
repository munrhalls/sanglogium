# Homepage Layout & RWD Audit Report

**Project:** Sang Logium  
**Date:** March 28, 2026  
**Auditor:** Cascade AI  
**Scope:** Complete homepage layout audit across all breakpoints and orientations  

---

## Executive Summary

This audit examines the responsive behavior of all 9 homepage sections across 8 breakpoints (260px to 1440px+) in both portrait and landscape orientations. The design system uses a **fluid typography** approach via `clamp()` and a **breakpoint-specific carousel** system with orientation-aware logic.

**Overall Grade: B-** - Solid foundation with notable edge-case issues at extreme viewports and inconsistent responsive patterns across sections.

---

## Design System Foundation

### Breakpoints (from tailwind.config.ts)
| Name | Width | Notes |
|------|-------|-------|
| `xs` | 475px | - |
| `sm` | 640px | Tailwind default |
| `md` | 768px | Major layout shift point |
| `lg` | 1024px | Desktop threshold |
| `xl` | 1280px | - |
| `2xl` | 1536px | - |
| `3xl` | 1920px | Ultra-wide |
| `lg-touch` | 1024px+ / h≤850px | Touch devices |
| `lg-desktop` | 1024px+ / h≥851px | Desktop monitors |

### Typography Scale (Fluid via clamp())
| Token | Min Size | Max Size | Line Height |
|-------|----------|----------|-------------|
| `display-1` | 3rem | 5.625rem | 1.1 |
| `display-2` | 2.25rem | 4.25rem | 1.12 |
| `h1` | 1.6875rem | 3.1875rem | 1.2 |
| `h2` | 1.25rem | 2.375rem | 1.25 |
| `h3` | 1.125rem | 1.8125rem | 1.2 |
| `h4` | 1rem | 1.375rem | 1.2 |

### Spacing System
- Grid gaps: `gap-4` (1rem) → `md:gap-6` (1.5rem) → `lg:gap-8` (2rem)
- Section padding: `px-4` (mobile) → `md:px-8` (tablet+)
- Shelf vertical spacing: `py-20` (5rem)

---

## Section-by-Section Analysis

### 1. Hero Section
**File:** `@/app/components/features/homepage/hero/Hero.tsx`

**Layout Strategy:**
- Full viewport height: `h-[calc(100dvh-var(--mobile-header-h)-var(--mobile-menu-h))]`
- CSS Grid with single column (mobile) → Flexbox positioning (desktop)
- Text content: `max-w-xl` with responsive margin-bottom

**Breakpoints Analysis:**

| Breakpoint | Portrait | Landscape |
|------------|----------|-----------|
| **260-475px** | ✅ Text scales via clamp(), hero fills viewport | ⚠️ **RED FLAG**: Text may collide with viewport edge at extreme aspect ratios |
| **640px (sm)** | ✅ Hero text remains readable | ⚠️ Headline may feel small relative to viewport |
| **768px (md)** | ✅ Picture element swaps to desktop image | ✅ Layout stable |
| **1024px (lg)** | ✅ lg-desktop breakpoint activates proper mb-64 | ✅ Full desktop layout |
| **1280px+** | ✅ Typography reaches max clamp() size | ✅ Optimal presentation |

**Issues Identified:**

🔴 **CRITICAL (Landscape < 640px):** Hero uses `landscape:max-w-full` but lacks `landscape:px-` padding overrides. At 480px landscape, text may touch viewport edges.

🔴 **CRITICAL:** The `lg-touch:mb-44 lg-desktop:mb-64` classes only apply margin-bottom to the text container, but the button has `mt-2` with no responsive adjustment, creating visual imbalance on short viewports.

🟡 **MINOR:** No `xs` breakpoint consideration for typography - the jump from mobile to sm may be abrupt.

---

### 2. Featured Section (Carousel)
**File:** `@/app/components/features/homepage/featured/Featured.tsx`

**Layout Strategy:**
- CSS Grid: `grid-cols-1 md:grid-cols-[1fr_auto]`
- Header and controls share row on desktop
- Carousel slides below
- Cards use `aspect-[4/3]` images

**Carousel Breakpoint Map:**
```javascript
{
  xl: 3,           // 1280px+
  lgDesktop: 3,    // 1024px+ (tall)
  mdLandscape: 2,  // 768px+ landscape
  mdPortrait: 2,   // 768px+ portrait
  smLandscape: 2,  // 640px+ landscape
  smPortrait: 1,   // 640px+ portrait
  mobileLandscape: 1,
  mobilePortrait: 1
}
```

**Breakpoints Analysis:**

| Breakpoint | Portrait | Landscape |
|------------|----------|-----------|
| **260-475px** | ⚠️ 1 card visible, adequate | ⚠️ **RED FLAG**: 1 card at 320px landscape wastes 60%+ viewport width |
| **640px (sm)** | ⚠️ 1 card at 640px portrait leaves excessive margins | ✅ 2 cards in landscape |
| **768px (md)** | ✅ 2 cards appropriate | ✅ 2 cards |
| **1024px (lg)** | ✅ 3 cards optimal | ✅ 3 cards |

**Issues Identified:**

🔴 **CRITICAL:** The carousel lacks an `xs` or `480px` breakpoint in the map. At 480px-639px portrait, showing only 1 card leaves ~200px+ of whitespace on each side.

🔴 **CRITICAL:** Carousel controls (`CarouselPrevious`, `CarouselNext`, `CarouselDots`) use hardcoded `md:pr-16` which may misalign at certain breakpoints.

🟡 **MINOR:** Cards use `aspect-[4/3]` but the `FeaturedCard` has `h-full` with flex column - potential for inconsistent card heights if product names vary in length.

---

### 3. ProductSpotlight1, ProductSpotlight2, ProductSpotlight3
**Files:** 
- `@/app/components/features/homepage/product-spotlight-1/ProductSpotlight1.tsx`
- `@/app/components/features/homepage/product-spotlight-2/ProductSpotlight2.tsx`
- `@/app/components/features/homepage/product-spotlight-3/ProductSpotlight3.tsx`

**Layout Strategy:**
- Two-column grid: `grid-cols-1 lg:grid-cols-2`
- Image side + Content side (reversed in PS2 via `order-*`)
- Min-height: `min-h-[500px] lg:min-h-[600px]`
- Internal carousel for product images

**Breakpoints Analysis:**

| Breakpoint | Portrait | Landscape |
|------------|----------|-----------|
| **260-768px** | ⚠️ Single column, image stacks above content | ⚠️ **RED FLAG**: At 640px-1023px landscape, `min-h-[500px]` may cause overflow |
| **1024px (lg)** | ✅ Two-column layout activates | ✅ Optimal two-column |
| **1280px+** | ✅ Increased gap to `lg:gap-12` | ✅ Comfortable spacing |

**Issues Identified:**

🔴 **CRITICAL (Landscape 768px-1023px):** The `min-h-[500px]` constraint doesn't account for landscape orientation on tablets. At 900px wide × 600px tall (common tablet landscape), the 500px minimum height plus padding may exceed viewport, causing section overflow or unexpected scroll behavior.

🔴 **CRITICAL:** No `md` breakpoint for the grid - the jump from mobile (stacked) to desktop (two-column) at 1024px is abrupt. At 900px-1023px portrait tablets, the single-column layout feels stretched.

🟡 **MINOR:** ProductSpotlight2 uses `order-1 lg:order-2` pattern but ProductSpotlight3 reverts to same-side layout, creating inconsistent visual rhythm.

🟡 **MINOR:** Spotlight3 uses mask-image CSS which has limited browser support (no Firefox support without prefix).

---

### 4. IEMs Gallery (PRIORITY SECTION)
**File:** `@/app/components/features/homepage/iems-gallery/IemsGallery.tsx`

**Layout Strategy:**
- Fixed 4-column grid via `Grid` component: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Cards are native grid items (not carousel)
- Gap progression: `gap-4 md:gap-6 lg:gap-8`

**Breakpoints Analysis:**

| Breakpoint | Portrait | Landscape |
|------------|----------|-----------|
| **260-475px** | ⚠️ 2 columns at 260px = ~130px per column | ⚠️ **RED FLAG**: Cards may be too narrow |
| **640px (sm)** | ⚠️ Still 2 columns | ⚠️ 2 columns in landscape adequate |
| **768px (md)** | ✅ 3 columns | ✅ 3 columns |
| **1024px (lg)** | ✅ 4 columns | ✅ 4 columns |

**Issues Identified:**

🔴 **CRITICAL (260px-320px):** At 260px viewport with 2 columns, each column is ~130px minus gap. The `IemCard` has:
- Image at 60% width → ~78px
- Brand badge absolute positioned
- Product name with `line-clamp-2`
- Price + "Add" button side-by-side

At this width, the "Add" button text may wrap or the price/button layout may break.

🔴 **CRITICAL:** The `IemCard` image uses `w-[60%] h-[60%]` which may appear too small relative to the card at certain breakpoints. The card has generous padding (`pt-12 pb-4`) that doesn't scale down proportionally.

🟡 **MINOR:** No `xs` breakpoint to switch to single column for very narrow viewports (260px-374px).

🟡 **MINOR:** `IemsGalleryHeader` uses `md:col-start-1 md:row-start-1` but the parent isn't a grid - these classes have no effect. The header is inside a flex column container.

---

### 5. NewestRelease Section
**File:** `@/app/components/features/homepage/newest-release/NewestRelease.tsx`

**Layout Strategy:**
- Same as ProductSpotlight: two-column grid at `lg`
- No `min-height` constraint (unlike spotlights)
- Carousel for product gallery images

**Breakpoints Analysis:**

| Breakpoint | Portrait | Landscape |
|------------|----------|-----------|
| **< 1024px** | ⚠️ Same issues as ProductSpotlight sections | ⚠️ Same landscape tablet issues |
| **1024px+** | ✅ Proper two-column | ✅ Proper two-column |

**Issues Identified:**

🔴 **CRITICAL:** Missing `min-height` creates potential for layout shift if content is short. The adjacent spotlight sections have `min-h-[500px]`, creating height inconsistency across the page.

🟡 **MINOR:** Button uses `btn-secondary` but inconsistent with ProductSpotlight3's `btn-secondary text-accent-500` (which has color override).

---

### 6. DACs Section (Carousel)
**File:** `@/app/components/features/homepage/dacs/Dacs.tsx`

**Layout Strategy:**
- Carousel with custom breakpoint map
- Cards: `aspect-[4/3]` images with product info below

**Carousel Breakpoint Map:**
```javascript
{
  xl: 2,
  lgDesktop: 2,
  mdLandscape: 2,
  mdPortrait: 2,
  smLandscape: 2,
  smPortrait: 2,
  mobileLandscape: 1,
  mobilePortrait: 1
}
```

**Breakpoints Analysis:**

| Breakpoint | Portrait | Landscape |
|------------|----------|-----------|
| **260-639px** | ⚠️ 1 card visible | ⚠️ **RED FLAG**: 1 card at 480px landscape wastes space |
| **640px+** | ✅ 2 cards | ✅ 2 cards |
| **1280px+** | ✅ 2 cards | ✅ 2 cards |

**Issues Identified:**

🔴 **CRITICAL:** The DAC carousel shows only 2 cards at 1280px+ when 3 could fit comfortably. The `max-w-content` (1280px) constraint limits the carousel width.

🔴 **CRITICAL:** Same carousel control alignment issue as Featured - `md:pr-16` hardcoded padding.

🟡 **MINOR:** No differentiation between `mdPortrait` and `lgDesktop` - tablets and desktops show same card count despite different available widths.

---

### 7. Accessories Section
**File:** `@/app/components/features/homepage/accessories/Accessories.tsx`

**Layout Strategy:**
- Two `CategorySection` components (Cables, Pads)
- Each category is an independent carousel
- Cards: `aspect-[4/3]` with consistent card structure

**Carousel Breakpoint Map:**
```javascript
{
  xl: 4,
  lgDesktop: 4,
  mdLandscape: 4,
  mdPortrait: 3,
  smLandscape: 3,
  smPortrait: 2,
  mobileLandscape: 1,
  mobilePortrait: 1
}
```

**Breakpoints Analysis:**

| Breakpoint | Portrait | Landscape |
|------------|----------|-----------|
| **260-475px** | ⚠️ 1 card | ⚠️ **RED FLAG**: 1 card wastes space |
| **640px (sm)** | ⚠️ 2 cards adequate | ✅ 3 cards |
| **768px (md)** | ✅ 3 cards | ✅ 4 cards |
| **1024px+** | ✅ 4 cards | ✅ 4 cards |

**Issues Identified:**

🔴 **CRITICAL (Mobile landscape 480px-639px):** Showing only 1 card leaves ~180px+ whitespace on each side. The breakpoint map should show 2 cards at this range.

🔴 **CRITICAL:** `AccessoryCard` has `h-[5.5rem]` fixed height for the title+price zone. This may cause text overflow at certain breakpoints or with longer product names.

🟡 **MINOR:** Button text changes: "Add" (mobile) vs "Add to Cart" (md+), but no transition consideration for `sm` breakpoint.

---

## Cross-Sectional Issues

### Grid Gap Inconsistency
| Section | Mobile Gap | Tablet Gap | Desktop Gap |
|---------|------------|------------|-------------|
| IEMs Gallery | 1rem | 1.5rem | 2rem |
| Featured | N/A (carousel) | N/A | N/A |
| DACs | N/A (carousel) | N/A | N/A |
| Accessories | N/A (carousel) | N/A | N/A |

**Issue:** Only IEMs Gallery uses a true responsive grid. Carousel sections don't benefit from the spacing system consistently.

### Carousel Control Alignment
All carousel sections use this pattern:
```jsx
<div className="flex items-center ... md:col-start-2 md:row-start-1 md:justify-self-end md:pr-16">
```

**Issue:** The `md:pr-16` (4rem) padding is arbitrary and doesn't scale with viewport. At 768px exactly, this may push controls too far left.

### Button Pattern Inconsistency
| Section | Button Style | Text |
|---------|--------------|------|
| IEMs | `btn-cart` | "Add" |
| Featured | `btn-cart` | "Add" |
| DACs | `btn-cart` | "Add" |
| Accessories | `btn-cart` | "Add"/"Add to Cart" (responsive) |

**Issue:** Only Accessories has responsive button text, creating inconsistency.

---

## Red Flag Summary

### 🔴 Critical Issues (Must Fix)

1. **Hero Landscape < 640px:** Missing horizontal padding for landscape mobile
2. **Hero lg-touch:** Button margin doesn't account for short viewports
3. **Featured 480-639px:** 1 carousel card leaves excessive whitespace
4. **ProductSpotlight min-height:** 500px min-height causes overflow on tablet landscape
5. **ProductSpotlight grid gap:** No `md` breakpoint - abrupt jump at 1024px
6. **IEMs 260-320px:** 2-column grid too narrow, card elements may collide
7. **IEMs Header:** Grid positioning classes on non-grid parent (no effect)
8. **NewestRelease:** Missing min-height causes section height inconsistency
9. **DACs 1280px+:** Only 2 cards shown when 3 could fit
10. **Accessories mobile landscape:** 1 card wastes ~60% viewport width
11. **AccessoryCard:** Fixed 5.5rem height risks text overflow

### 🟡 Minor Issues (Should Fix)

1. **Typography:** No `xs` breakpoint consideration
2. **Spotlight3:** Mask-image CSS has limited browser support
3. **Carousel padding:** Hardcoded `md:pr-16` arbitrary value
4. **Button text:** Inconsistent responsive behavior across sections
5. **Card aspect ratios:** Mixed use of `aspect-[4/3]` and custom sizing

---

## Zero-Flag State Recommendations

To achieve a professional, zero-red-flag homepage:

### Immediate Actions

1. **Add xs breakpoint handling:**
   ```css
   /* For IEMs, Featured, DACs, Accessories */
   xs: 475px breakpoint for single-column layouts
   ```

2. **Fix Hero landscape padding:**
   ```tsx
   // Add to Hero.tsx
   "landscape:px-6 landscape:sm:px-[clamp(1.5rem,5vw,5rem)]"
   ```

3. **Add md breakpoint for ProductSpotlights:**
   ```tsx
   // Change from lg:grid-cols-2 to:
   "md:grid-cols-2" // or appropriate intermediate layout
   ```

4. **Fix IEMs Header:**
   ```tsx
   // Remove invalid grid classes or make parent a grid
   ```

### Short-term Improvements

1. **Implement progressive carousel breakpoints:**
   - Add `xsPortrait` and `xsLandscape` to breakpoint maps
   - Show 2 cards at 480px+ landscape

2. **Standardize card heights:**
   - Use `min-height` instead of fixed `h-[5.5rem]`
   - Implement consistent aspect ratios

3. **Add section height consistency:**
   - Apply `min-h` to NewestRelease
   - Or remove from ProductSpotlights for consistency

### Long-term Architecture

1. **Unified carousel breakpoint system:**
   - Create shared breakpoint maps
   - Implement viewport-utilization calculations

2. **Landscape-first responsive design:**
   - Add landscape media queries for all sections
   - Test tablet orientations explicitly

---

## Appendix: File References

### Core Components
- `tailwind.config.ts` - Design system configuration
- `app/(store)/page.tsx` - Homepage composition
- `app/components/layout/grid/Grid.tsx` - Grid wrapper
- `app/components/layout/general/Shelf.tsx` - Section wrapper

### Section Components
- `app/components/features/homepage/hero/Hero.tsx`
- `app/components/features/homepage/featured/Featured.tsx`
- `app/components/features/homepage/product-spotlight-1/ProductSpotlight1.tsx`
- `app/components/features/homepage/product-spotlight-2/ProductSpotlight2.tsx`
- `app/components/features/homepage/product-spotlight-3/ProductSpotlight3.tsx`
- `app/components/features/homepage/iems-gallery/IemsGallery.tsx`
- `app/components/features/homepage/iems-gallery/IemCard.tsx`
- `app/components/features/homepage/newest-release/NewestRelease.tsx`
- `app/components/features/homepage/dacs/Dacs.tsx`
- `app/components/features/homepage/accessories/Accessories.tsx`
- `app/components/features/homepage/accessories/CategorySection.tsx`
- `app/components/features/homepage/accessories/AccessoryCard.tsx`

### Carousel System
- `app/components/layout/carousel/CarouselRoot.tsx`
- `app/components/layout/carousel/CarouselContext.tsx`
- `app/components/layout/carousel/CarouselTrack.tsx`
- `app/components/layout/carousel/CarouselControls.tsx`

---

**End of Report**
