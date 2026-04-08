# Product Discovery UI — Professional Design Audit & Specifications

**Date:** 2026-04-01
**Scope:** Post-homepage product discovery UI (Category/PLP page)
**Benchmark:** Professional e-commerce standard (Baymard top-tier, luxury dark-theme stores)
**Design System Reference:** `tailwind.config.ts` global tokens + Homepage implementation

---

## Part 1: Global Design System Summary

### Identity
- **Personality:** Dark luxury audiophile store — editorial, minimal, premium
- **Font:** Montserrat (sans-serif) — geometric, clean, modern
- **Color palette:** Dark backgrounds (brand-700 `#151B1B`, brand-800 `#0D0F0F`), warm cream text (brand-200 `#FAEEE6`, brand-400 `#F6E3D5`), gold accents (accent-500 `#D4AF37`)
- **Surface system:** `surface.page` (dark), `surface.card` (slightly lighter dark), `surface.elevated` (mid-dark), `surface.productImage` (cream/warm `brand-200`)
- **Border radii:** Intentionally tight — `lg: 4px`, `md: 3px`, `sm: 2px` — sharp, editorial feel
- **Shadows:** Subtle card shadows on dark (`cardDark`, `cardHoverDark`) — light glow approach
- **Typography tokens:** Full hierarchy from `display-1` (hero) through `h1`-`h4`, `body`, `action`, `small` with defined letter-spacing and line-height

### Design System Component Tokens (from `addComponents`)
| Token | Purpose | Key Properties |
|-------|---------|---------------|
| `.card-product` | Light-bg product cards (homepage) | transparent bg, `border-secondary`, `shadow-card`, hover: shadow+translateY |
| `.card-product-dark` | Dark-theme product cards (PLP) | transparent bg, `border-secondary`, `shadow-cardDark`, hover: border-brand-400+glow |
| `.btn-cart` | Add-to-cart button | brand-400 bg, brand-700 text, sm radius, inline-flex, gap-2 |
| `.btn-primary` | Primary CTA | brand-400 bg, bold, md radius, shadow-button |
| `.btn-secondary` | Secondary/outlined | transparent, brand-200 border, md radius |
| `.btn-ghost` | Ghost/editorial CTA | transparent, underline, editorial tracking |
| `.input-select` | Select dropdown | elevated bg, border-primary, md radius, custom chevron |
| `.type-overline` | Section label | small, editorial tracking, uppercase, accent color |
| `.type-card-title` | Card product name | body size, semibold, body color |
| `.type-price` | Price display | h4 size, semibold, priceTag color |
| `.type-metadata` | Secondary info | h4 size, medium, secondary color |
| `.section-header-anchor` | Section header with gold dash | flex, gap-3, `::before` 32px gold line |

### Homepage Design Patterns (Reference Standard)
From `Featured.tsx` — the canonical product card implementation:
- **Card:** Uses `.card-product` with manual hover shadow/translate
- **Image area:** `aspect-[4/3]`, `bg-surface-productImage`, `p-6` internal padding
- **Brand badge:** Absolute top-left, `text-small font-bold uppercase tracking-editorial text-brand-900`
- **Product name:** `type-body font-medium line-clamp-2`
- **Price + Cart row:** `flex items-center justify-between` — price left, cart button right
- **Price:** `type-price` → `$` prefix
- **Cart button:** `btn-cart` with ShoppingCart icon + "Add" text
- **Image:** `object-contain mix-blend-multiply`, hover scale-110 transition
- **Layout:** Cards in carousel, equal height via flex column

---

## Part 2: Research — PLP Best Practices (Verified Sources)

### Research Scope Contract
- **Topic:** E-commerce Product Listing Page (PLP) design — visual design + UX
- **First Principles:** Visual hierarchy drives scanning efficiency; filter/sort reduces cognitive load; card consistency builds trust
- **Sources:** Baymard Institute 2025 PLP benchmark, Baymard 2026 Product Page UX, Convertcart PLP analysis, Webflow PLP guide
- **Decay Risk:** Low (foundational UX patterns)

### Verified Best Practices

| # | Practice | Source | Consensus |
|---|----------|--------|-----------|
| 1 | Display applied filters in a visible overview | Baymard (80% fail) | High |
| 2 | Provide 4 essential sort types: Price, Rating, Best Selling, Newest | Baymard (69% don't) | High |
| 3 | Allow combining multiple filter values of same type | Baymard (14% don't) | High |
| 4 | 5 essential filter types: Price, Rating, Color, Size, Brand | Baymard (51% don't) | High |
| 5 | Product count visible near sort/filter controls | Universal | High |
| 6 | Card visual hierarchy: Image > Name > Price > CTA | Universal | High |
| 7 | Consistent card heights with image aspect ratio lock | Universal | High |
| 8 | Sidebar filters on desktop, bottom-sheet/drawer on mobile | Baymard | High |
| 9 | Breadcrumb navigation for category context | Universal | High |
| 10 | Responsive grid: 2-col mobile → 3-4 col desktop | Universal | High |
| 11 | Skeleton loading states for progressive disclosure | Modern standard | High |
| 12 | Hover states on cards for interactivity feedback | Universal | High |

### Design-Specific Best Practices (Luxury/Dark Theme)

| # | Practice | Rationale |
|---|----------|-----------|
| 1 | Generous white space between grid items and sections | Luxury = breathing room |
| 2 | Consistent border-radius across all interactive elements | System coherence |
| 3 | Subtle, consistent shadow language (not mixed paradigms) | Visual hierarchy |
| 4 | Typography hierarchy maximum 3 levels per card | Clarity |
| 5 | Color temperature consistency (warm on dark) | Brand personality |
| 6 | Image backgrounds must match across all product surfaces | Visual continuity |
| 7 | Interactive states (hover, focus, active) on all clickable elements | Professional polish |
| 8 | Sidebar visually distinct but harmonious with main content | Layout balance |

---

## Part 3: Component-by-Component Audit

### 3.1 Page Layout (`page.tsx`)

**Current implementation:**
```
container mx-auto px-4 pb-6 h-[calc(100vh-var(--desktop-header-h))]
  └─ flex gap-8 h-full overflow-hidden
       ├─ aside: hidden lg:block w-60 shrink-0 pt-6 h-full overflow-y-auto
       └─ main: flex-1 min-w-0 h-full overflow-y-auto
```

**Issues:**
- ✅ Sidebar/main split is correct pattern
- ⚠️ `h-[calc(100vh-var(--desktop-header-h))]` with `overflow-hidden` creates a custom scroll container — this breaks native browser scroll, disables scroll-to-top, and creates UX friction
- ⚠️ `px-4` is too tight for luxury aesthetic — homepage sections use wider padding
- ⚠️ No `max-w-content` constraint — content can stretch infinitely on ultrawide
- ⚠️ `pb-6` is meager bottom padding for a full-page layout

### 3.2 Filter Sidebar (`FilterSidebar.tsx`)

**Current implementation:**
- Uses `.bg-surface-elevated`, `border-border-secondary`, `rounded-sm`, `p-6`, `space-y-6`
- Section labels use `.type-overline text-accent-500 section-header-anchor`
- Custom `Checkbox` component with proper brand-400 checked state
- `PriceRangeSlider` and `StockMinimumSlider` with gold gradient tracks
- `ClockCounterClockwise` icon for clear/reset per filter

**Issues:**
- ✅ Correct use of design system tokens (surface, border, type-overline, section-header-anchor)
- ✅ Good semantic structure (fieldset/legend)
- ✅ Gold accent sliders match brand identity
- ⚠️ `hidden lg:block` in BOTH `page.tsx` aside AND `FilterSidebar` — double-hiding is redundant
- ⚠️ `sticky top-[var(--desktop-header-h)]` in `FilterSidebar` conflicts with parent `h-full overflow-y-auto` — sticky won't work inside overflow container
- ⚠️ "Filters" heading uses `text-caption` (gray) — inconsistent with gold accent labels below it
- ⚠️ No "Clear All" button at sidebar level (only individual resets)

### 3.3 Product Card (`ProductCard.tsx`) vs Homepage Card (`FeaturedCard`)

| Aspect | Homepage `FeaturedCard` | PLP `ProductCard` | Gap |
|--------|------------------------|-------------------|-----|
| Card class | `.card-product` | `.card-product-dark` | ✅ Intentional (dark variant) |
| Image container | `aspect-[4/3] bg-surface-productImage p-6` | `aspect-[4/3] bg-surface-productImage` | ⚠️ PLP missing `p-6` internal padding |
| Image rendering | `object-contain mix-blend-multiply` + hover scale | `object-contain` (via ProductImage) | ⚠️ PLP missing `mix-blend-multiply` and hover scale |
| Brand badge | `text-small font-bold uppercase tracking-editorial text-brand-900` | `type-caption text-brand-900` | ⚠️ Inconsistent: homepage uses manual styles, PLP uses token |
| Product name | `type-body font-medium line-clamp-2` | `type-card-title line-clamp-2 mb-1` | ⚠️ Different tokens — `type-body font-medium` vs `type-card-title` (semibold) |
| Price | `type-price` in flex row with button | `type-price text-priceTag mb-3` | ⚠️ PLP has redundant `text-priceTag` (already in token), different layout |
| Cart button | `btn-cart` in flex row right-aligned | `btn-cart w-full justify-center mt-auto` | ❌ **Major divergence** — PLP button is full-width block, homepage is compact inline |
| Price+CTA layout | `flex items-center justify-between` (side-by-side) | Stacked vertically (price above, full-width button below) | ❌ **Major divergence** — different information architecture |
| Link wrapping | `<a>` wraps entire card | `<Link>` wraps entire card including button | ⚠️ Button inside link — click propagation issue (handled with stopPropagation but not ideal) |
| Image component | Direct `<Image>` with `urlFor()` | `<ProductImage>` wrapper with `fill` + 85% container | ⚠️ Different image strategies — homepage direct, PLP wrapper with sizing constraint |

### 3.4 Product Grid (`ProductGrid.tsx`)

**Current:** `grid gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`

**Issues:**
- ⚠️ `lg:grid-cols-4` — but the grid sits in `flex-1` next to a 240px sidebar. 4 columns in remaining ~1000px space means each card is ~230px wide — too narrow for the card content
- ⚠️ `gap-6` (24px) is the only spacing — adequate but tight for luxury
- ✅ Correct responsive breakpoint progression

### 3.5 Product Image (`ProductImage.tsx`)

**Issues:**
- ❌ `console.log('Loader URL:', url)` — debug logging left in production code
- ⚠️ `w-[85%] h-[85%]` arbitrary sizing — different from homepage's fill approach
- ⚠️ No `mix-blend-multiply` — images on cream bg will show white corners from JPEGs
- ⚠️ No hover transform/scale animation (homepage has `group-hover:scale-110`)
- ⚠️ `rounded` class on image is unnecessary with `overflow-hidden` on parent

### 3.6 Sort & Controls

**SortDropdown:** Uses `.input-select` token — ✅ correct
**MobileControlsBar:** Uses `.btn-secondary` for filter button — ✅ correct
**ActiveFilters:** Good chip pattern with `bg-surface-elevated border-brand-400 rounded-sm` — ✅ mostly correct

**Issues:**
- ⚠️ `SortDropdown` uses `window.location.href` for sort changes — full page reload instead of client-side navigation
- ⚠️ Sort label "Sort by" uses `type-caption text-secondary-500` — very small and low contrast
- ⚠️ Active filter chips use `rounded-sm` (2px) — should match system `rounded-lg` (4px) for consistency

### 3.7 Mobile Filter Drawer (`MobileFilterDrawer.tsx`)

**Issues:**
- ✅ Good bottom-sheet pattern with backdrop overlay
- ✅ Focus trap and Escape key handler — excellent a11y
- ✅ Sticky footer with "Show Results" `.btn-primary`
- ⚠️ `rounded-t-sm` (2px) on drawer — should be more generous for mobile bottom sheet
- ⚠️ Checkbox implementation duplicated between sidebar and drawer (not using shared `Checkbox` component in drawer)
- ⚠️ No drag-to-dismiss gesture (minor, not blocking)

### 3.8 Breadcrumbs (`CategoryBreadcrumbs.tsx`)

- ✅ Correct semantic `<nav aria-label="Breadcrumb">` with `<ol>`
- ✅ Uses `type-caption` tokens consistently
- ✅ Hover states with `transition-colors`
- ⚠️ Separator `/` could be a chevron `›` for more professional look (minor)

### 3.9 Skeletons

**`ProductCardSkeleton`:**
- ❌ Uses `bg-gray-200` — off-system color on dark background (should use `bg-secondary-800` or `bg-surface-elevated`)
- ❌ Missing card structure — no border, no card-product-dark wrapper

**`FiltersSkeleton` (old):**
- ❌ Uses `bg-gray-700` — off-system color

---

## Part 4: Design Ratings

### Rating Methodology
Each dimension rated 1-10 against professional e-commerce standard. Evidence cited per rating.

| # | Dimension | Rating | Evidence |
|---|-----------|--------|----------|
| 1 | **Overall Design** | 5/10 | Strong foundation (dark luxury identity, gold accents, good token system) undermined by inconsistencies between homepage and PLP card implementations, off-system colors in filters/skeletons, and unrefined details |
| 2 | **Visual Hierarchy** | 5/10 | Card hierarchy (image→name→price→CTA) is correct in structure but weakened by full-width CTA button dominating the card, inconsistent name token weight vs homepage, and small sort/count text |
| 3 | **White Space** | 4/10 | `px-4` page padding too tight, `gap-6` grid gap adequate but not generous, `pb-6` bottom padding insufficient, filter sidebar `p-6` is good, but overall density is too high for luxury positioning |
| 4 | **Border Radiuses** | 6/10 | System defines tight radii (2-4px) consistently, and most components use tokens correctly. Active filter chips use `rounded-sm` while cards use `rounded-lg` — minor inconsistency. Mobile drawer `rounded-t-sm` too sharp |
| 5 | **Shadows** | 6/10 | `.card-product-dark` uses `shadow-cardDark` correctly with hover state. Sidebar, drawer use no shadows (relying on border). Inline styles on sliders bypass shadow system. Overall: functional but not leveraged for depth |
| 6 | **Layout** | 6/10 | Sidebar+main split is correct. But `h-[calc(100vh)]` custom scroll container is problematic. 4-col grid too dense with sidebar. No max-width constraint. Mobile bottom-sheet is well-structured |
| 7 | **Symmetry & Positioning** | 5/10 | Sort row alignment is clean. But card content layout differs between homepage (price+CTA inline) and PLP (stacked). Active filters float without clear spatial relationship to controls. Brand badge positioning consistent |
| 8 | **Typography** | 6/10 | Good token system with proper hierarchy. But PLP card uses `type-card-title` (semibold) while homepage uses `type-body font-medium` — different visual weight. Filter headings mix `text-caption` and `text-accent-500`. Sort label too small |
| 9 | **Color Theory** | 7/10 | Excellent dark+warm+gold palette. Cream product image backgrounds create proper contrast. Gold accents used consistently for interactive elements. Off-system colors (`gray-200`, `gray-700`, `blue-600`, `text-black`) in filter components break the palette |
| 10 | **Web Personality Coherence** | 5/10 | Homepage establishes editorial luxury (fractal backgrounds, gold accents, breathing room). PLP feels denser, more utilitarian — full-width CTA buttons, tight grid, missing `mix-blend-multiply`, no image hover animations. The two pages feel like different design eras |
| 11 | **Professional Standard** | 5/10 | Solid architectural foundation (streaming, Suspense, nuqs, proper a11y). But visual polish gaps (debug logs, off-system colors, skeleton colors, full-page reload on sort) prevent professional finish |
| 12 | **System Coherence** | 4/10 | Two parallel filter systems exist (`app/components/ui/filters/` old + `app/components/features/filters/` new). ProductCard diverges from FeaturedCard. ProductImage differs from homepage image approach. Checkbox duplicated in MobileFilterDrawer |
| 13 | **Holistic Cross-Referenced** | 5/10 | The design system tokens in tailwind.config.ts are excellent and well-thought-out. Homepage implements them beautifully. PLP partially implements them but with enough divergences, off-system values, and missing refinements that the overall product discovery experience feels like a draft rather than a finished product |

### Aggregate Score: **5.3 / 10**

---

## Part 5: Gap Analysis

### Critical Gaps (Must Fix)

| # | Gap | Current State | Target State | Components Affected |
|---|-----|--------------|--------------|-------------------|
| G1 | **Card layout divergence from homepage** | PLP: stacked price/full-width CTA | Homepage pattern: price + compact CTA inline in flex row | `ProductCard.tsx` |
| G2 | **Missing `mix-blend-multiply` on product images** | White JPEG corners visible on cream background | Seamless blending like homepage | `ProductImage.tsx` |
| G3 | **Debug console.log in production** | `console.log('Loader URL:', url)` in image loader | Remove entirely | `ProductImage.tsx` |
| G4 | **Off-system colors in skeletons** | `bg-gray-200`, `bg-gray-700` | Use `bg-secondary-800` / `bg-surface-elevated` | `ProductCardSkeleton.tsx`, `FiltersSkeleton.tsx` |
| G5 | **Off-system colors in old filter components** | `text-black`, `bg-slate-400`, `border-gray-300`, `text-blue-600` | Use design system tokens | `RangeFilter.tsx`, `FilterItem.tsx`, `Filters.tsx` (legacy — but if used anywhere) |
| G6 | **Image hover animation missing** | No scale transform on PLP card images | `group-hover:scale-110 transition-transform duration-700` like homepage | `ProductCard.tsx`, `ProductImage.tsx` |
| G7 | **Grid too dense with sidebar** | `lg:grid-cols-4` in ~1000px space = ~230px cards | `lg:grid-cols-3` for sidebar layout (3 cards at ~310px each) | `ProductGrid.tsx` or `CategoryPageClient.tsx` |

### Major Gaps (Should Fix)

| # | Gap | Current State | Target State | Components Affected |
|---|-----|--------------|--------------|-------------------|
| G8 | **Custom scroll container** | `h-[calc(100vh-var(--desktop-header-h))]` + `overflow-hidden` | Natural document scroll with sticky sidebar | `page.tsx` |
| G9 | **Page padding too tight** | `px-4` | `px-4 md:px-8 lg:px-12` or `max-w-content mx-auto` with generous padding | `page.tsx` |
| G10 | **Full-page reload on sort** | `window.location.href = newUrl` | Client-side navigation with `router.push()` or nuqs | `SortDropdown.tsx` |
| G11 | **ProductImage sizing approach** | `w-[85%] h-[85%]` arbitrary container | Match homepage: image fills container with `p-6` padding on parent, `object-contain` | `ProductImage.tsx`, `ProductCard.tsx` |
| G12 | **Duplicated checkbox in MobileFilterDrawer** | Full checkbox markup duplicated | Use shared `Checkbox` component from `ui/Checkbox.tsx` | `MobileFilterDrawer.tsx` |
| G13 | **Product name typography inconsistency** | PLP: `type-card-title` (semibold) | Align with homepage: `type-body font-medium` OR update both to same token | `ProductCard.tsx` |
| G14 | **Active filter chip radius** | `rounded-sm` (2px) | `rounded-lg` (4px) to match card system | `ActiveFilters.tsx` |
| G15 | **"Filters" heading inconsistency** | `type-overline text-caption` (gray) | `type-overline text-accent-500` to match other filter section labels | `FilterSidebar.tsx` |

### Minor Gaps (Polish)

| # | Gap | Current State | Target State | Components Affected |
|---|-----|--------------|--------------|-------------------|
| G16 | **Redundant double-hide on sidebar** | `hidden lg:block` on both `<aside>` in page.tsx AND in `FilterSidebar.tsx` | Remove from one location (keep in page.tsx layout) | `FilterSidebar.tsx` |
| G17 | **Sticky conflicts with overflow parent** | `sticky top-[...]` inside `overflow-y-auto` parent | Remove sticky from FilterSidebar (parent already scrolls) | `FilterSidebar.tsx` |
| G18 | **White space below page** | `pb-6` | `pb-12` or `pb-16` for breathing room | `page.tsx` |
| G19 | **Mobile drawer top radius** | `rounded-t-sm` (2px) | `rounded-t-lg` (4px) or larger for modern bottom-sheet feel | `MobileFilterDrawer.tsx` |
| G20 | **Breadcrumb separator** | `/` text character | `›` or chevron SVG for more polished look | `CategoryBreadcrumbs.tsx` |
| G21 | **Transition on old filter spinner** | `bg-white/50` overlay, `border-blue-700` spinner | Use system colors: `bg-surface-page/50`, `border-accent-500` | `Filters.tsx` (legacy) |
| G22 | **No max-width constraint on page** | Content stretches on ultrawide | Add `max-w-content` or `max-w-[1440px]` | `page.tsx` |

---

## Part 6: Sequenced Change Specifications

### Execution Sequence

Changes are ordered by: dependency chain → visual impact → risk level.

---

### SC1: ProductImage — Clean Up & Align with Homepage

**Files:** `ProductImage.tsx`
**Gap Coverage:** G2, G3, G6 (partial), G11

**Current state:**
```tsx
// Debug log in production
console.log('Loader URL:', url);
// Arbitrary sizing
<div className="relative w-[85%] h-[85%] bg-surface-productImage">
// Missing mix-blend-multiply
<Image className="object-contain rounded" />
```

**Target state:**
```tsx
// No console.log
// Container uses full space (parent handles padding)
<div className="relative w-full h-full">
// Add mix-blend-multiply for seamless cream background blending
<Image className="object-contain mix-blend-multiply" />
```

**Changes:**
1. Remove `console.log('Loader URL:', url);`
2. Change `w-[85%] h-[85%] bg-surface-productImage` → `w-full h-full`
3. Change image className `object-contain rounded` → `object-contain mix-blend-multiply`
4. Remove redundant `bg-surface-productImage` from wrapper (parent figure has it)

---

### SC2: ProductCard — Align with Homepage Card Pattern

**Files:** `ProductCard.tsx`
**Gap Coverage:** G1, G6, G11, G13

**Current state:**
```tsx
<figure className="aspect-[4/3] relative flex w-full items-center justify-center overflow-hidden bg-surface-productImage">
  ...
</figure>
<div className="flex flex-col flex-grow p-4">
  <h3 className="type-card-title line-clamp-2 mb-1">{product.name}</h3>
  <p className="type-price text-priceTag mb-3">${product.displayPrice}</p>
  <button className="btn-cart w-full justify-center mt-auto">
```

**Target state (aligned with homepage FeaturedCard):**
```tsx
<figure className="aspect-[4/3] relative flex w-full items-center justify-center overflow-hidden bg-surface-productImage p-6">
  <span className="absolute left-4 top-4 type-caption text-brand-900 z-10">
    {product.brand?.name}
  </span>
  <ProductImage ... className="transition-transform duration-700 group-hover:scale-110" />
</figure>
<div className="flex flex-col flex-grow gap-3 p-4">
  <h3 className="type-body font-medium line-clamp-2">{product.name}</h3>
  <div className="mt-auto flex items-center justify-between pt-2">
    <p className="type-price">${product.displayPrice}</p>
    <button className="btn-cart">
      <ShoppingCart size={18} weight="regular" />
      <span className="text-cap font-bold">Add</span>
    </button>
  </div>
</div>
```

**Changes:**
1. Add `p-6` to figure for internal image padding (match homepage)
2. Move brand badge OUTSIDE the Link or keep inside figure (already there — verify positioning)
3. Change `type-card-title` → `type-body font-medium` for product name (match homepage)
4. Remove redundant `text-priceTag` from price (already in `.type-price` token)
5. Replace stacked price+full-width button with `flex items-center justify-between` row
6. Remove `w-full justify-center` from cart button — make it compact inline
7. Add `transition-transform duration-700 group-hover:scale-110` to ProductImage
8. Adjust gap structure: `gap-3` on content div, `mt-auto` on price/CTA row

---

### SC3: ProductGrid — Fix Column Count

**Files:** `ProductGrid.tsx`
**Gap Coverage:** G7

**Current state:**
```tsx
"grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
```

**Target state:**
```tsx
"grid-cols-1 xs:grid-cols-2 lg:grid-cols-3"
```

**Rationale:** With 240px sidebar + 32px gap, the main content area on a 1280px screen is ~1008px. 3 columns = ~320px per card (comfortable). 4 columns = ~230px (too cramped for luxury).

**Changes:**
1. Remove `md:grid-cols-3` — keep 2-col until lg breakpoint
2. Change `lg:grid-cols-4` → `lg:grid-cols-3`
3. Consider `gap-8` instead of `gap-6` for more breathing room

---

### SC4: Page Layout — Fix Scroll & Spacing

**Files:** `(store)/products/[...slug]/page.tsx`
**Gap Coverage:** G8, G9, G18, G22

**Current state:**
```tsx
<div className="container mx-auto px-4 pb-6 h-[calc(100vh-var(--desktop-header-h))]">
  <div className="flex gap-8 h-full overflow-hidden">
    <aside className="hidden lg:block w-60 shrink-0 pt-6 h-full overflow-y-auto scrollbar-none">
    <main className="flex-1 min-w-0 h-full overflow-y-auto scrollbar-none">
```

**Target state:**
```tsx
<div className="mx-auto max-w-content px-4 md:px-8 pb-12">
  <div className="flex gap-8">
    <aside className="hidden lg:block w-60 shrink-0 sticky top-[var(--desktop-header-h)] h-[calc(100vh-var(--desktop-header-h))] overflow-y-auto scrollbar-none pt-6">
    <main className="flex-1 min-w-0 pt-6">
```

**Changes:**
1. Remove `h-[calc(100vh-var(--desktop-header-h))]` from outer container — use natural document scroll
2. Remove `overflow-hidden` from flex container
3. Remove `h-full overflow-y-auto` from main — let page scroll naturally
4. Move sticky+height+overflow to sidebar only — sidebar sticks while main scrolls
5. Add `max-w-content` (1280px) for ultrawide constraint
6. Change `px-4` → `px-4 md:px-8` for responsive padding
7. Change `pb-6` → `pb-12` for better bottom spacing

---

### SC5: FilterSidebar — Clean Up Redundancies

**Files:** `FilterSidebar.tsx`
**Gap Coverage:** G15, G16, G17

**Changes:**
1. Remove `hidden lg:block` from FilterSidebar (page.tsx handles visibility)
2. Remove `sticky top-[var(--desktop-header-h)]` (page.tsx aside handles sticky)
3. Change "Filters" heading from `type-overline text-caption` → `type-overline text-accent-500` (match other filter labels)

---

### SC6: ActiveFilters — Chip Radius Fix

**Files:** `ActiveFilters.tsx`
**Gap Coverage:** G14

**Changes:**
1. Change `rounded-sm` → `rounded-lg` on filter chip buttons (match system 4px)

---

### SC7: Skeletons — Use System Colors

**Files:** `ProductCardSkeleton.tsx`
**Gap Coverage:** G4

**Current state:** `bg-gray-200`
**Target state:** `bg-secondary-800` (dark theme appropriate)

**Changes:**
1. Replace all `bg-gray-200` → `bg-secondary-800`
2. Add `card-product-dark` wrapper to match real card structure
3. Add proper aspect-ratio placeholder

---

### SC8: SortDropdown — Client-Side Navigation

**Files:** `SortDropdown.tsx`
**Gap Coverage:** G10

**Changes:**
1. Replace `window.location.href = newUrl` with `router.push(newUrl, { scroll: false })` or nuqs-based sort state
2. Import `useRouter` from `next/navigation`

---

### SC9: MobileFilterDrawer — Use Shared Checkbox & Polish

**Files:** `MobileFilterDrawer.tsx`
**Gap Coverage:** G12, G19

**Changes:**
1. Import and use `Checkbox` from `@/app/components/ui/Checkbox` instead of inline checkbox markup
2. Change `rounded-t-sm` → `rounded-t-lg` on drawer container

---

### SC10: CategoryPageClient — Inner Layout Cleanup

**Files:** `CategoryPageClient.tsx`
**Gap Coverage:** Layout alignment with new scroll model

**Current state:** `<main className="flex-1 min-w-0">` (nested main inside page.tsx main)

**Changes:**
1. Change outer `<main>` to `<div>` (cannot nest `<main>` inside `<main>` from page.tsx)
2. Verify sort bar border-bottom alignment with new spacing

---

## Part 7: Verification Checklist

After all changes, verify:

- [ ] `npm run build` passes
- [ ] Desktop: 3-column grid with sidebar, natural page scroll
- [ ] Desktop: Card matches homepage pattern (price+CTA inline, mix-blend-multiply, hover scale)
- [ ] Desktop: Filter sidebar sticky, scrolls independently
- [ ] Desktop: Sort changes without full page reload
- [ ] Mobile: Bottom-sheet drawer opens/closes properly
- [ ] Mobile: Cards display 1→2 column responsive
- [ ] Mobile: Active filter chips visible and removable
- [ ] No `console.log` in production
- [ ] No off-system colors (search for `gray-`, `blue-`, `slate-`, `text-black`)
- [ ] All skeletons use dark system colors
- [ ] Border radii consistent across chips, cards, drawer
- [ ] Typography tokens consistent between homepage and PLP cards

---

## Part 8: Expected Post-Implementation Ratings

| Dimension | Current | Target | Delta |
|-----------|---------|--------|-------|
| Design | 5 | 9 | +4 |
| Visual Hierarchy | 5 | 9 | +4 |
| White Space | 4 | 8 | +4 |
| Border Radiuses | 6 | 9 | +3 |
| Shadows | 6 | 8 | +2 |
| Layout | 6 | 9 | +3 |
| Symmetry & Positioning | 5 | 9 | +4 |
| Typography | 6 | 9 | +3 |
| Color Theory | 7 | 9 | +2 |
| Web Personality Coherence | 5 | 9 | +4 |
| Professional Standard | 5 | 9 | +4 |
| System Coherence | 4 | 9 | +5 |
| Holistic | 5 | 9 | +4 |
| **Aggregate** | **5.3** | **8.9** | **+3.6** |
