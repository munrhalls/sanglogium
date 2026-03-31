# PLP Design System Alignment Sprint

> **Scope**: Category / PLP page (desktop + mobile). Footer is out of scope.
> **Objective**: Align PLP components to design system tokens and homepage editorial-luxury persona.
> **Source**: `_project/sprints/01_audit_ratings_and_gaps.md`

---

## Pre-Sprint: Regression Containment

### Files At Risk of Regression
| File | Risk | Containment |
|------|------|-------------|
| `tailwind.config.ts` | Token additions may affect other pages | Add tokens only, never modify existing |
| `app/components/features/products/ProductCard.tsx` | Card changes may break homepage cards | Verify homepage product sections unchanged |
| `app/components/ui/Price.tsx` | Price styling shared across site | Scope changes to PLP context only |
| `app/(store)/products/[...slug]/page.tsx` | Server component data flow | No structural changes to data fetching |

### Regression Test Suite (Execute Before & After Sprint)
```bash
# Visual regression baseline
npx playwright test tests/smoke.spec.ts

# Component tests
npx vitest run tests/component/

# Catalogue data integrity
npx vitest run tests/catalogue/
```

### Scope Lock Rules
1. **NO** modifications to `globals.css`
2. **NO** changes to homepage components
3. **NO** structural changes to data fetching
4. **ALL** styling via scoped Tailwind utility classes
5. **ALL** new tokens added to `tailwind.config.ts` (never inline)

---

## Scope Contract 1: Design System Token Extensions

**Gap Coverage**: G-14 (Dark-Surface Shadows)

### Target State
- Dark-surface shadow variants added to `tailwind.config.ts`
- Shadows visible on dark backgrounds

### DoD
- [ ] Add `cardDark` shadow token: `0 4px 20px rgba(255,255,255,0.03), 0 0 0 1px rgba(255,255,255,0.05)`
- [ ] Add `cardHoverDark` shadow token: `0 8px 30px rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.08)`
- [ ] Verify existing shadow tokens unchanged
- [ ] Run regression tests

### Verification
```bash
npx vitest run tests/component/
```

---

## Scope Contract 2: ShopHeader — Editorial Treatment

**Gap Coverage**: G-01 (Page Header), G-20 (Result Count Display)

### Target State
- Overline + section-header-anchor pattern
- Result count styled as `type-metadata`

### Component: `ShopHeader.tsx`

### Pass 1 — Skeleton (Structure Only)
- [ ] Add overline element above title
- [ ] Add horizontal rule element after title
- [ ] Semantic HTML structure complete

### Pass 2 — Data Pass
- [ ] Overline displays category context (e.g., "HEADPHONES")
- [ ] Title displays category name
- [ ] Count displays as metadata

### Pass 3 — Build Pass

#### Desktop (1280px)
**Layer 1 — Structure**: Semantic HTML skeleton
- [ ] `<header>` wrapper
- [ ] `<span>` for overline
- [ ] `<h1>` for title
- [ ] `<span>` for count

**Layer 2 — Layout**: Flex/grid/spacing
- [ ] Flex column layout
- [ ] Gap spacing between elements
- [ ] Proper margin-bottom

**Layer 3 — Surface**: Colors/typography
- [ ] Overline: `type-overline` (accent gold, uppercase, tracked)
- [ ] Title: `type-section-hed`
- [ ] Count: `type-metadata`
- [ ] Section-header-anchor rule applied

**Layer 4 — Interaction**: None required

#### Mobile (375px)
- [ ] Same structure, responsive type scale
- [ ] Verify overline readable at mobile size

### Verification
```bash
npx playwright test --grep "ShopHeader"
```

---

## Scope Contract 3: ProductCard — Image Container

**Gap Coverage**: G-03 (Image Container), G-06 (Hover State)

### Target State
- Defined aspect-ratio slot with `surface.productImage` background
- Hover affordance with shadow lift and border highlight

### Component: `ProductCard.tsx`, `ProductImage.tsx`

### Pass 3 — Build Pass

#### Desktop (1280px)
**Layer 1 — Structure**
- [ ] Wrapper `<article>` element
- [ ] Image container `<div>` with fixed aspect ratio

**Layer 2 — Layout**
- [ ] `aspect-[4/3]` on image container
- [ ] Consistent internal padding (`p-4`)
- [ ] `space-y-3` between image and text

**Layer 3 — Surface**
- [ ] Image container: `bg-surface-productImage` background
- [ ] Card border: `border border-border-secondary`
- [ ] Card background: transparent (per `card-product` token)

**Layer 4 — Interaction**
- [ ] Hover: `shadow-cardDark` → `shadow-cardHoverDark`
- [ ] Hover: `translateY(-2px)` lift
- [ ] Hover: border color transition to `border-brand-400`
- [ ] Transition: `transition-all duration-300`

#### Mobile (375px)
- [ ] Same structure, touch-friendly tap target
- [ ] No hover states (pointer-coarse)

### Verification
```bash
npx playwright test --grep "ProductCard"
```

---

## Scope Contract 4: ProductCard — Typography

**Gap Coverage**: G-04 (Typography Differentiation)

### Target State
- Name uses `type-card-title`
- Price uses `type-price` with clear visual differentiation
- Brand uses `type-caption`

### Component: `ProductCard.tsx`, `Price.tsx`

### Pass 3 — Build Pass

#### Desktop (1280px)
**Layer 3 — Surface**
- [ ] Brand: `type-caption` (12px, secondary color)
- [ ] Name: `type-card-title` (semibold, headline color)
- [ ] Price: `type-price` (semibold, priceTag color, larger than name)

### Verification
Visual inspection at 1280px and 375px

---

## Scope Contract 5: FilterSidebar — Visual Separation

**Gap Coverage**: G-07 (Visual Separation), G-08 (Width), G-09 (Checkbox Style)

### Target State
- Sidebar uses `surface.elevated` background
- Border-right separator
- Width increased to 240px minimum
- Custom styled checkboxes

### Component: `FilterSidebar.tsx`, `ShopLayout.tsx`

### Pass 3 — Build Pass

#### Desktop (1280px)
**Layer 2 — Layout**
- [ ] Width: `w-60` (240px) minimum in `ShopLayout.tsx`

**Layer 3 — Surface**
- [ ] Background: `bg-surface-elevated`
- [ ] Border-right: `border-r border-border-secondary`
- [ ] Filter labels: `type-overline` (uppercase, tracked, medium weight)

**Layer 4 — Interaction**
- [ ] Custom checkbox: `appearance-none` + custom styling
- [ ] Checkbox checked state: `accent-500` fill
- [ ] Checkbox focus: visible outline

### Verification
```bash
npx playwright test --grep "FilterSidebar"
```

---

## Scope Contract 6: SortDropdown — System Styling

**Gap Coverage**: G-11 (Sort Dropdown Style)

### Target State
- Uses `input-select` component class from design system
- Consistent border-radius with system (2-4px)

### Component: `SortDropdown.tsx`

### Pass 3 — Build Pass

#### Desktop (1280px)
**Layer 3 — Surface**
- [ ] Apply `input-select` class OR equivalent utility classes
- [ ] Border-radius: `rounded-md` (3px)
- [ ] Background: `bg-surface-elevated`
- [ ] Border: `border-border-primary`

**Layer 4 — Interaction**
- [ ] Focus: visible outline per system
- [ ] Hover: border color change

### Verification
Visual inspection

---

## Scope Contract 7: ActiveFilters — Chip Styling

**Gap Coverage**: G-10 (Chip Style), G-15 (Border Radius)

### Target State
- Chips use system border-radius (2-4px, not 12-16px)
- Active state uses accent gold highlight
- Clear all link differentiated

### Component: `ActiveFilters.tsx`

### Pass 3 — Build Pass

#### Desktop (1280px)
**Layer 3 — Surface**
- [ ] Border-radius: `rounded-sm` (2px)
- [ ] Border: `border-accent-500` for active state
- [ ] Text: `text-accent-500` for chip label
- [ ] Clear all: `text-accent-500 hover:text-accent-400`

**Layer 4 — Interaction**
- [ ] Hover: background subtle change
- [ ] Remove button: visible on hover

### Verification
Visual inspection

---

## Scope Contract 8: Controls Bar — Anchoring

**Gap Coverage**: G-12 (Controls Bar Anchoring)

### Target State
- Sort + chips row has visual anchor
- Separator line or background differentiation

### Component: `CategoryPageClient.tsx`

### Pass 3 — Build Pass

#### Desktop (1280px)
**Layer 2 — Layout**
- [ ] Flex row with items-center
- [ ] Proper gap between sort and filters

**Layer 3 — Surface**
- [ ] Bottom border: `border-b border-border-secondary`
- [ ] Padding-bottom for breathing room

### Verification
Visual inspection

---

## Scope Contract 9: MobileControlsBar — System Alignment

**Gap Coverage**: G-16 (Mobile Filter UX), G-18 (Controls Row)

### Target State
- Clear visual separation between filter trigger and count
- System-aligned border-radius on filter button

### Component: `MobileControlsBar.tsx`

### Pass 3 — Build Pass

#### Mobile (375px)
**Layer 2 — Layout**
- [ ] Clear separation: filter button | count | sort

**Layer 3 — Surface**
- [ ] Filter button: `rounded-sm` (2px, not pill)
- [ ] Count: `type-metadata` styling

**Layer 4 — Interaction**
- [ ] Filter button: hover/active states

### Verification
```bash
npx playwright test --grep "MobileControlsBar"
```

---

## Scope Contract 10: Accent Gold Integration

**Gap Coverage**: G-13 (Accent Absence), G-19 (Personality Continuity)

### Target State
- Accent gold (#D4AF37) used for:
  - Overlines
  - Active filter highlights
  - Hover states on interactive elements

### Components: All PLP components

### Pass 3 — Build Pass

**Layer 3 — Surface**
- [ ] ShopHeader overline: `text-accent-500`
- [ ] Active filter chips: `border-accent-500`
- [ ] Price: verify using `text-priceTag` (secondary-300)

**Layer 4 — Interaction**
- [ ] Card hover: subtle gold border accent
- [ ] Filter checkbox checked: `accent-accent-500`
- [ ] Links: `hover:text-accent-500`

### Verification
Visual comparison with homepage accent usage

---

## Post-Sprint: Regression Verification

### Execute Full Test Suite
```bash
# Smoke tests
npx playwright test tests/smoke.spec.ts

# Component tests
npx vitest run tests/component/

# Catalogue integrity
npx vitest run tests/catalogue/
```

### Manual Verification Checklist
- [ ] Homepage unchanged (visual comparison)
- [ ] PDP (Product Detail Page) unchanged
- [ ] Basket page unchanged
- [ ] Navigation unchanged
- [ ] Footer unchanged (out of scope)

### Design System Coherence Check
- [ ] All new classes use `tailwind.config.ts` tokens
- [ ] No inline styles added
- [ ] No arbitrary values (e.g., `text-[#D4AF37]`)
- [ ] Border-radius consistent (2-4px throughout)

---

## Execution Order

1. **Scope Contract 1**: Token extensions (foundation)
2. **Scope Contract 2**: ShopHeader (page entry point)
3. **Scope Contract 3**: ProductCard image container
4. **Scope Contract 4**: ProductCard typography
5. **Scope Contract 5**: FilterSidebar
6. **Scope Contract 6**: SortDropdown
7. **Scope Contract 7**: ActiveFilters chips
8. **Scope Contract 8**: Controls bar anchoring
9. **Scope Contract 9**: MobileControlsBar
10. **Scope Contract 10**: Accent gold integration (final polish)

---

## Out of Scope (Deferred)

| Gap | Reason |
|-----|--------|
| G-02 (Breadcrumb) | Requires navigation architecture changes |
| G-05 (Add-to-cart button) | Requires cart integration work |
| G-17 (Mobile single column) | Lower priority, functional as-is |

---

## Success Criteria

- All 10 scope contracts completed with DoD items checked
- Regression tests pass before and after
- No modifications outside PLP components
- Design system coherence maintained
- Visual parity with homepage editorial language achieved
