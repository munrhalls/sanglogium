# Audit: Post-Homepage Product Discovery UI

**Audit Date:** 2026-03-31  
**Auditor:** Cascade Analysis Engine  
**Scope:** Product Listing Pages (PLP), Product Detail Pages (PDP), Filters, Sorts  
**Target:** `/sprint` consumption — structured for orchestrated execution

---

## 1. End-State Delineation

### System Context

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           POST-HOMEPAGE DISCOVERY                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                        CATEGORY PAGE (PLP)                         │     │
│  │  ┌─────────────────────────────────────────────────────────────┐  │     │
│  │  │  [NAV HEADER — full width, fixed]                            │  │     │
│  │  └─────────────────────────────────────────────────────────────┘  │     │
│  │                                                                  │     │
│  │  ┌─────────────────────────────────────────────────────────────┐  │     │
│  │  │  container mx-auto px-4                                      │  │     │
│  │  │  ┌─────────────────────────────────────────────────────┐   │  │     │
│  │  │  │ [BREADCRUMBS — type-caption]                        │   │  │     │
│  │  │  │ Home / Headphones / Open-Back                        │   │  │     │
│  │  │  └─────────────────────────────────────────────────────┘   │  │     │
│  │  │  ┌─────────────────────────────────────────────────────┐   │  │     │
│  │  │  │ [SHOP HEADER — type-overline + type-section-hed]    │   │  │     │
│  │  │  │ HEADPHONES · OPEN-BACK                              │   │  │     │
│  │  │  │ Open-Back Headphones                                │   │  │     │
│  │  │  └─────────────────────────────────────────────────────┘   │  │     │
│  │  └─────────────────────────────────────────────────────────────┘  │     │
│  │                                                                  │     │
│  │  ┌─────────────────────────────────────────────────────────────┐  │     │
│  │  │  container mx-auto px-4 py-6                               │  │     │
│  │  │  ┌──────────┐  ┌──────────────────────────────────────────┐ │  │     │
│  │  │  │ SIDEBAR  │  │ MAIN CONTENT                             │ │  │     │
│  │  │  │ w-60     │  │ flex-1                                   │ │  │     │
│  │  │  │ shrink-0 │  │                                          │ │  │     │
│  │  │  ├──────────┤  │  ┌────────────────────────────────────┐ │ │  │     │
│  │  │  │ FILTERS  │  │  │ CONTROLS BAR                       │ │ │  │     │
│  │  │  │          │  │  │ [Sort ▼]              7 products     │ │ │  │     │
│  │  │  │ Driver   │  │  └────────────────────────────────────┘ │ │  │     │
│  │  │  │ Type     │  │                                          │ │  │     │
│  │  │  │ [✓] Planar│  │  ┌────────────────────────────────────┐ │ │  │     │
│  │  │  │ [ ] Dyna-│  │  │ ACTIVE FILTERS                     │ │ │  │     │
│  │  │  │ mic      │  │  │ [Planar] [×]                       │ │ │  │     │
│  │  │  │          │  │  └────────────────────────────────────┘ │ │  │     │
│  │  │  │ Price    │  │                                          │ │  │     │
│  │  │  │ Range    │  │  ┌────────────────────────────────────┐ │ │  │     │
│  │  │  └──────────┘  │  │ PRODUCT GRID                       │ │ │  │     │
│  │  │                │  │                                    │ │ │  │     │
│  │  │  sticky        │  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │ │ │  │     │
│  │  │  top-header-h  │  │  │CARD│ │CARD│ │CARD│ │CARD│      │ │ │  │     │
│  │  │                │  │  └────┘ └────┘ └────┘ └────┘      │ │ │  │     │
│  │  │                │  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │ │ │  │     │
│  │  │                │  │  │CARD│ │CARD│ │CARD│ │CARD│      │ │ │  │     │
│  │  │                │  │  └────┘ └────┘ └────┘ └────┘      │ │ │  │     │
│  │  │                │  └────────────────────────────────────┘ │ │  │     │
│  │  │                │                                          │ │  │     │
│  │  │                └──────────────────────────────────────────┘ │  │     │
│  │  └─────────────────────────────────────────────────────────────┘  │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                     PRODUCT DETAIL PAGE (PDP)                      │     │
│  │  ┌─────────────────────────────────────────────────────────────┐   │     │
│  │  │  container mx-auto px-4 py-6                               │   │     │
│  │  │  ┌─────────────────────────────────────────────────────┐   │   │     │
│  │  │  │ [BREADCRUMBS — type-caption]                        │   │   │     │
│  │  │  │ Home / Products / HD 800S                           │   │   │     │
│  │  │  └─────────────────────────────────────────────────────┘   │   │     │
│  │  │                                                          │   │     │
│  │  │  ┌─────────────────────────┬──────────────────────────┐ │   │     │
│  │  │  │                         │                          │ │   │     │
│  │  │  │   IMAGE GALLERY         │    PRODUCT INFO          │ │   │     │
│  │  │  │   lg:w-1/2              │    lg:w-1/2              │ │   │     │
│  │  │  │                         │                          │ │   │     │
│  │  │  │   ┌─────────────────┐   │    Brand: Sennheiser     │ │   │     │
│  │  │  │   │                 │   │    HD 800S               │ │   │     │
│  │  │  │   │   [MAIN IMAGE]  │   │    $1,699                │ │   │     │
│  │  │  │   │   aspect-square │   │                          │ │   │     │
│  │  │  │   │                 │   │    [Add to Cart]         │ │   │     │
│  │  │  │   └─────────────────┘   │                          │ │   │     │
│  │  │  │                         │    [Description]           │ │   │     │
│  │  │  │   ┌─┬─┬─┬─┐             │                          │ │   │     │
│  │  │  │   │ │ │ │ │ thumbnails  │    [Specifications]        │ │   │     │
│  │  │  │   └─┴─┴─┴─┘             │                          │ │   │     │
│  │  │  └─────────────────────────┴──────────────────────────┘ │   │     │
│  │  │                                                          │   │     │
│  │  │  ┌─────────────────────────────────────────────────────┐ │   │     │
│  │  │  │ [SPECIFICATIONS TABLE — type-section-sub]          │ │   │     │
│  │  │  └─────────────────────────────────────────────────────┘ │   │     │
│  │  └───────────────────────────────────────────────────────────┘   │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Spatial Architecture

### Component Hierarchy (System-First View)

```
Root Layout (app/(store)/layout.tsx)
├── StoreProvider (Zustand)
├── Header (fixed, full-width)
│   └── Navigation, Search, Cart
│
└── Page Content (Server Component)
    └── products/[...slug]/page.tsx (CategoryPage)
        ├── Breadcrumbs (Server)
        ├── ShopHeader (Server)
        │   ├── overline: type-overline text-accent-500 section-header-anchor
        │   └── title: type-section-hed
        │
        ├── ShopLayout (Server)
        │   ├── FilterSidebar (Client — "use client")
        │   │   ├── bg-surface-elevated
        │   │   ├── border-border-secondary
        │   │   └── sticky top-desktop-header-h
        │   │
        │   └── CategoryPageClient (Client — "use client")
        │       ├── MobileControlsBar (drawer trigger)
        │       ├── MobileFilterDrawer (state controlled)
        │       ├── SortDropdown (Client)
        │       ├── ActiveFilters (Client)
        │       └── ProductGrid (Server-rendered via props)
        │           └── ProductCard[]
        │               ├── card-product-dark
        │               ├── aspect-[4/3] bg-surface-productImage
        │               └── btn-cart
```

### Data Flow Architecture

```
[VFS Layer]
    ├── catalogue-index.json (build-time generated)
    ├── resolveSlugToId() → O(1) lookup
    └── unrollDescendantKeys() → recursive tree walk

[Data Layer]
    ├── getProductsByVfsKeys() → GROQ query
    ├── getCategoryMetadata() → name, description
    └── getFiltersForCategoryPath() → filter config

[Page Layer — Server Component]
    ├── fetch: category metadata
    ├── fetch: products (parallel)
    └── fetch: filter config (parallel)
        └── Promise.all([metadata, products, filters])

[Client Layer — State Management]
    ├── URL parameters → source of truth
    ├── FilterSidebar → router.push(newUrl)
    └── SortDropdown → router.push(newUrl)

[Sanity CMS Layer]
    ├── product schema: catalogueLocationKeys[]
    ├── GROQ: *[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0]
    └── categoryFilters schema: per-category filter config
```

---

## 3. Gap Analysis (G-XX)

### Gap Classification Legend
- **P0 (Critical):** Blocks core functionality, user-facing bug
- **P1 (High):** Missing feature, poor UX, design system violation
- **P2 (Medium):** Enhancement, optimization opportunity
- **P3 (Low):** Nice-to-have, future consideration

### Data Layer Gaps

| ID | Component | Current | Target | Severity | Notes |
|----|-----------|---------|--------|----------|-------|
| G-01 | `CategoryPage` | Sequential awaits | `Promise.all()` parallel fetch | P2 | Best practice per Next.js 15 docs |
| G-02 | `getProductsByVfsKeys` | No pagination | Add `[$start...$end]` slicing | P2 | Performance at scale |
| G-03 | Search | No full-text search | GROQ `[name, description] match $term` | P2 | User expectation |

### UI Layer Gaps — PLP

| ID | Component | Current | Target | Severity | Notes |
|----|-----------|---------|--------|----------|-------|
| G-04 | `ProductGrid` | `text-gray-600` on empty | Use `text-secondary` token | P1 | Design system violation |
| G-05 | `ProductCard` | No lazy loading image | Add `loading="lazy"` priority logic | P2 | Performance |
| G-06 | `FilterSidebar` | Checkboxes inline SVG | Extract to `Checkbox` component | P2 | Reusability |
| G-07 | `ShopHeader` | `mb-8` arbitrary | Use `spacing.8` token (2rem) | P3 | Token consistency |
| G-08 | Mobile Filter | Drawer animates | Verify 60fps on low-end | P2 | Performance check |

### UI Layer Gaps — PDP

| ID | Component | Current | Target | Severity | Notes |
|----|-----------|---------|--------|----------|-------|
| G-09 | `ImageGallery` | No zoom | Add pinch/zoom or lightbox | P1 | Core PDP feature |
| G-10 | `ImageGallery` | Thumbnails scroll | Add horizontal scroll snap | P2 | UX polish |
| G-11 | `ProductDetail` | No related products | Add `RelatedProducts` carousel | P1 | Cross-sell opportunity |
| G-12 | `ProductDetail` | Static spec table | Collapsible sections mobile | P2 | Mobile UX |

### Architecture Gaps

| ID | Component | Current | Target | Severity | Notes |
|----|-----------|---------|--------|----------|-------|
| G-13 | Homepage | `homepageData` singleton | VFS-resolved queries | P1 | Legacy pattern, needs migration |
| G-14 | Error Handling | Generic 404 | Category-specific empty states | P2 | Better UX |
| G-15 | Loading States | `loading.tsx` only | Granular Suspense boundaries | P3 | Streaming optimization |

### Design System Gaps

| ID | Token/Pattern | Current | Target | Severity | Notes |
|----|---------------|---------|--------|----------|-------|
| G-16 | Empty state | Hardcoded gray | `text-secondary` + `type-body` | P1 | Token compliance |
| G-17 | Focus states | Default browser | Custom focus-visible rings | P2 | Accessibility |
| G-18 | Active filters | Inline style | Extract to `Badge` component | P2 | Reusability |

---

## 4. RWD Strategy

### Breakpoint Definitions (Per `tailwind.config.ts`)

```typescript
screens: {
  "xs": "475px",           // Small phones
  "sm": "640px",           // Phones
  "md": "768px",           // Tablets
  "lg": "1024px",          // Desktop
  "xl": "1280px",          // Large desktop (target)
  "2xl": "1536px",         // Extra large
}
```

### Component RWD Behavior

| Component | Desktop (1280px+) | Tablet (768-1023px) | Mobile (<768px) |
|-----------|-------------------|---------------------|-----------------|
| **ProductGrid** | 4 columns `lg:grid-cols-4` | 3 columns `md:grid-cols-3` | 1-2 columns `grid-cols-1 xs:grid-cols-2` |
| **FilterSidebar** | Fixed left `w-60 sticky` | Hidden `hidden lg:block` | Drawer overlay `MobileFilterDrawer` |
| **ShopHeader** | Full width `mb-8` | Same | Same, reduced `mb-6` |
| **ControlsBar** | Row `lg:flex-row` | Row | Stacked `flex-col` |
| **ProductCard** | Full card visible | Same | Reduced padding, larger tap targets |
| **ImageGallery** | 50/50 split `lg:w-1/2` | Stacked | Stacked, full width |
| **PDP Layout** | Side-by-side `lg:flex-row` | Stacked `flex-col` | Stacked, scroll thumb below |

### Mobile-Specific Behaviors

```
Mobile (< 768px)
├── FilterSidebar → transforms to MobileFilterDrawer
├── SortDropdown → moves to MobileControlsBar
├── ProductCount → moves to MobileControlsBar
└── ProductGrid → 2 columns (xs:grid-cols-2)

Tablet (768-1024px)
├── FilterSidebar → hidden (no room)
├── ControlsBar → row layout
└── ProductGrid → 3 columns

Desktop (1024px+)
├── FilterSidebar → visible sticky left
├── ControlsBar → row with sort left
└── ProductGrid → 4 columns
```

---

## 5. Files at Risk of Regression

| File | Risk Level | Risk Description | Mitigation Strategy |
|------|------------|------------------|---------------------|
| `ProductCard.tsx` | **HIGH** | Used on homepage AND PLP | Verify homepage styling unchanged after edits |
| `tailwind.config.ts` | **HIGH** | Global design system | Add-only policy; never modify existing tokens |
| `page.tsx` (PLP) | **MEDIUM** | Core data fetching path | Add tests before modifying GROQ queries |
| `FilterSidebar.tsx` | **MEDIUM** | URL state management | Test filter persistence across navigation |
| `ShopLayout.tsx` | **LOW** | Shared layout wrapper | Visual regression test on all shop pages |

### Cross-Cut Analysis

**ProductCard Risk Detail:**
```
Current: card-product-dark used on homepage featured section
Gap G-05: Adding lazy loading affects both contexts
Mitigation: 
  1. Test homepage featured section after ProductCard edits
  2. Verify hover states work in both contexts
  3. Check image aspect ratios consistent
```

**Tailwind Config Risk Detail:**
```
Current: bg-surface-productImage used in ProductCard + ImageGallery
Gap G-16: Empty state color change
Mitigation:
  1. Search all usages before adding new tokens
  2. Use @apply sparingly to prevent cascade issues
  3. Verify build passes after any config change
```

---

## 6. Research vs Implementation Comparison

### Verified Alignments (Best Practices Matched)

| Research Finding | Implementation Status | Evidence |
|------------------|----------------------|----------|
| Parallel data fetching | ✅ **ALIGNED** | `CategoryPage` fetches products + metadata |
| RSC-first architecture | ✅ **ALIGNED** | Pages are Server Components, interactive parts use `"use client"` |
| URL state management | ✅ **ALIGNED** | Filters/sorts use `?f=` and `?sort=` parameters |
| VFS category resolution | ✅ **ALIGNED** | `resolveSlugToId()` + `unrollDescendantKeys()` pattern |
| GROQ array intersection | ✅ **ALIGNED** | `count(catalogueLocationKeys[@ in $keys]) > 0` |
| Responsive grid | ✅ **ALIGNED** | `grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` |
| Mobile-first approach | ✅ **ALIGNED** | Base styles mobile, breakpoints scale up |

### Implementation Gaps vs Research

| Research Finding | Current Implementation | Gap ID |
|------------------|------------------------|--------|
| `Promise.all()` for parallel fetching | Uses but could optimize | G-01 |
| Granular Suspense boundaries | `loading.tsx` only at page level | G-15 |
| Image zoom on PDP | Not implemented | G-09 |
| Related products carousel | Not implemented | G-11 |
| Full-text search | Not implemented | G-03 |
| Pagination | Not implemented | G-02 |

---

## 7. Verification Commands

### Pre-Sprint Regression

```bash
# Build validation
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### Component Verification

```bash
# Product discovery E2E
npx playwright test --grep "product"

# Specific component tests
npx playwright test --grep "ProductCard"
npx playwright test --grep "FilterSidebar"
```

### Data Layer Verification

```bash
# VFS integrity tests
npx tsx tests/unit/vfs/data-integrity.test.ts
npx tsx tests/unit/vfs/slug-resolution.test.ts
npx tsx tests/unit/vfs/descendant-unrolling.test.ts
```

### Manual Verification Checklist

```markdown
- [ ] Navigate to `/products/headphones` → products load
- [ ] Navigate to `/products/open-back` → filtered products load
- [ ] Click filter checkbox → URL updates with `?f=...`
- [ ] Select sort option → URL updates with `?sort=...`
- [ ] Refresh page with filters → state persists
- [ ] Mobile: tap Filters button → drawer opens
- [ ] Mobile: select filter → drawer closes, grid updates
- [ ] PDP: `/product/slug` → product details render
- [ ] PDP: click thumbnail → main image updates
- [ ] PDP: specifications table → renders correctly
```

---

## 8. Sprint Mapping

### Recommended Sprint Organization

**Sprint 1: Foundation & Data (G-01, G-02, G-13)**
- P2 optimizations: Parallel fetching, pagination
- P1 migration: Homepage VFS adoption

**Sprint 2: PLP Polish (G-04, G-06, G-08, G-16, G-18)**
- P1 fixes: Design system compliance
- P2 improvements: Component extraction, performance

**Sprint 3: PDP Enhancements (G-09, G-10, G-11, G-12)**
- P1 features: Image zoom, related products
- P2 polish: Thumbnail scroll, collapsible specs

**Sprint 4: Search & Discovery (G-03, G-14, G-15)**
- P2 features: Full-text search, error states
- P3 optimizations: Granular Suspense

### Scope Lock Rules

```
1. NO changes to globals.css
2. NO changes to homepage layout structure
3. NO changes to tailwind.config.ts existing tokens (add-only)
4. NO modification of Sanity schema without migration plan
5. ALL GROQ changes must include performance testing
```

---

## 9. Appendices

### A. File Reference Index

| File Path | Role | Current Status | Risk |
|-----------|------|----------------|------|
| `app/(store)/products/[...slug]/page.tsx` | PLP Server Component | ✅ Functional | Medium |
| `app/(store)/products/[...slug]/CategoryPageClient.tsx` | PLP Client Wrapper | ✅ Functional | Low |
| `app/(store)/product/[slug]/page.tsx` | PDP Server Component | ✅ Functional | Medium |
| `app/components/features/products/ProductCard.tsx` | Product Card | ✅ Functional | **HIGH** |
| `app/components/features/products/ProductGrid.tsx` | Product Grid | ✅ Functional | Low |
| `app/components/features/products/ShopHeader.tsx` | Shop Header | ✅ Functional | Low |
| `app/components/features/filters/FilterSidebar.tsx` | Filter Sidebar | ✅ Functional | Medium |
| `app/components/features/filters/SortDropdown.tsx` | Sort Dropdown | ✅ Functional | Low |
| `app/components/features/shop/ShopLayout.tsx` | Shop Layout | ✅ Functional | Low |
| `app/components/features/products/ImageGallery.tsx` | PDP Gallery | ⚠️ Missing zoom | Medium |
| `app/components/features/products/ProductDetail.tsx` | PDP Layout | ⚠️ Missing related | Medium |
| `data/catalogue.ts` | VFS Accessors | ✅ Functional | Low |
| `tailwind.config.ts` | Design System | ✅ Complete | **HIGH** |

### B. GROQ Query Reference

**Current (Verified Working):**
```groq
*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0]
| order(@$orderField @orderDirection)
{
  _id, name, brand->{name}, displayPrice, image, slug
}
```

**Target (With Pagination):**
```groq
*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0]
| order(@$orderField @orderDirection)
[$start...$end]
{
  _id, name, brand->{name}, displayPrice, image, slug
}
```

### C. Design Token Quick Reference

```
SURFACE:
- bg-surface-card           → Product cards
- bg-surface-elevated       → Filter sidebar
- bg-surface-productImage   → Image containers
- border-border-primary     → Input borders
- border-border-secondary   → Card borders

TYPOGRAPHY:
- type-section-hed          → Page titles
- type-section-sub        → Section headers
- type-card-title         → Product names
- type-price              → Prices
- type-metadata           → Product counts
- type-overline           → Category labels
- type-body               → Descriptions
- type-caption            → Breadcrumbs

COMPONENTS:
- card-product-dark       → Product card wrapper
- btn-cart                → Add to cart button
- input-select            → Sort dropdown
- section-header-anchor   → Labels with decorative line
```

---

**END OF AUDIT REPORT**

**Next Step:** Convert G-XX gaps into `/sprint` scope contracts with DoDs mapped to `/build` Pass/Layer sequences.
