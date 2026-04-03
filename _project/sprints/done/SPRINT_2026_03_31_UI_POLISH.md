# Sprint: Product Discovery UI Polish — SPRINT_2026_03_31_UI_POLISH

> **Target:** Fix 5 P1 (High Priority) design system and UX gaps from audit  
> **Scope:** Design system compliance, PDP features, homepage architecture  
> **Design System:** Strict adherence to `tailwind.config.ts` — NO new tokens  
> **Created:** 2026-03-31  
> **Status:** READY FOR EXECUTION  
> **Depends On:** SPRINT_2026_03_31_PLP_FIXES (bugs must be fixed first)

---

## Pre-Sprint Regression Containment

### Files at Risk of Regression

| File | Risk Level | Current Role | Protection Strategy |
|------|------------|--------------|---------------------|
| `ProductCard.tsx` | **CRITICAL** | Used on homepage + PLP | Verify homepage after ANY edit |
| `ProductGrid.tsx` | HIGH | Shared grid component | Test empty state on both contexts |
| `tailwind.config.ts` | **CRITICAL** | Global design system | READ-ONLY — existing tokens only |
| `globals.css` | HIGH | Global styles | NO MODIFICATIONS allowed |
| `ImageGallery.tsx` | MEDIUM | PDP only | Isolated from PLP components |
| `ProductDetail.tsx` | MEDIUM | PDP layout | Verify no PLP side effects |

### Scope Lock Rules (VIOLATION = SPRINT FAILURE)

1. **NO** modifications to `globals.css`
2. **NO** new Tailwind config tokens — use EXISTING only
3. **NO** changes to active sprint files (SPRINT_2026_03_31_PLP_FIXES.md)
4. **NO** GROQ query changes without performance verification
5. **NO** breaking changes to URL parameter structure
6. **ALL** design system changes must reference `tailwind.config.ts` tokens

### Cross-Cut Risk Analysis

```
ProductCard Risk Detail:
├── Used in: Homepage featured section + PLP ProductGrid
├── Gap G-04 fix: Changes empty state styling
├── Gap G-05 fix: Adds lazy loading logic
└── Mitigation: 
    1. Verify homepage featured section renders correctly
    2. Check ProductCard hover states work in both contexts
    3. Validate image aspect ratios consistent

ProductGrid Risk Detail:
├── Gap G-04: Changes empty state from text-gray-600 to text-secondary
├── Gap G-16: Affects both PLP and any other product grids
└── Mitigation:
    1. Search all ProductGrid usages before changing
    2. Verify empty state renders correctly in all contexts
```

---

## Scope Contracts

### SC1: Design System Compliance — Empty State (G-04, G-16)

**Gap:** `ProductGrid` empty state uses `text-gray-600` instead of design system token  
**Current:** Hardcoded Tailwind gray color  
**Target:** Use `text-secondary` + `type-body` per design system  

#### DoD (Definition of Done)

**Pass 1 — Skeleton:**
- [ ] Empty state renders semantic structure: `div > p` with data-testid
- [ ] No styling classes (debug border only)

**Pass 2 — Data:**
- [ ] Empty state displays when `products.length === 0`
- [ ] Message text passed as prop or constant (not hardcoded in JSX)

**Pass 3 — Build:**

*Desktop (1280px):*
- [ ] **Layer 1 (Structure):** `div[role="status"] > p` semantic nesting
- [ ] **Layer 2 (Layout):** `py-12` vertical spacing, `text-center` alignment
- [ ] **Layer 3 (Surface):** `type-body text-secondary` (NOT `text-gray-600`)
- [ ] **Layer 4 (Interaction):** No interaction required for empty state
- [ ] **Lock:** Empty state matches design system token reference

*Mobile (375px):*
- [ ] **Layer 2:** Same layout, appropriate padding `px-4`
- [ ] **Layer 3:** Typography scales correctly on mobile
- [ ] **Lock:** Mobile empty state visually consistent

**Verification:**
```bash
npm run build
# Test: Navigate to category with 0 products → Empty state uses text-secondary
# Verify: No hardcoded gray colors in ProductGrid.tsx
```

**Regression Test:**
```bash
# Verify homepage featured section unchanged
npx playwright test --grep "homepage"
```

---

### SC2: Image Gallery Zoom — PDP Enhancement (G-09)

**Gap:** `ImageGallery` has no zoom/lightbox functionality  
**Current:** Click thumbnail swaps main image only  
**Target:** Click main image opens zoom/lightbox modal  

#### DoD (Definition of Done)

**Pass 1 — Skeleton:**
- [ ] Modal structure exists: `dialog` or `div[role="dialog"]`
- [ ] Main image has click handler (console.log placeholder)
- [ ] Modal renders with `img` inside (no styling)

**Pass 2 — Data:**
- [ ] Modal receives same image data as main gallery
- [ ] Current selected index passed to modal
- [ ] Close handler implemented (ESC key + click outside)

**Pass 3 — Build:**

*Desktop (1280px):*
- [ ] **Layer 1 (Structure):** 
  - Main image: `button > figure > img` (clickable)
  - Modal: `div[role="dialog"][aria-modal="true"] > div > img`
- [ ] **Layer 2 (Layout):**
  - Modal: fixed inset-0, flex center, z-50
  - Image: max-w-[90vw] max-h-[90vh], object-contain
- [ ] **Layer 3 (Surface):**
  - Modal backdrop: `bg-black/80`
  - Close button: `bg-surface-elevated` with icon
  - Cursor: `cursor-zoom-in` on main image
- [ ] **Layer 4 (Interaction):**
  - Open: fade-in 200ms ease-out
  - Close: fade-out 150ms ease-in
  - ESC key closes modal
  - Click outside closes modal
- [ ] **Lock:** Desktop zoom modal opens/closes smoothly

*Mobile (375px):*
- [ ] **Layer 2:** Modal full-screen, image centered
- [ ] **Layer 3:** Touch-friendly close button (min 44x44)
- [ ] **Layer 4:** Swipe to close gesture (optional but recommended)
- [ ] **Lock:** Mobile zoom works with touch

**Verification:**
```bash
npm run build
# Test: Click product image on PDP → Zoom modal opens
# Test: ESC or click outside → Modal closes
```

**Build Commands:**
```
/build ImageGallery 3 1 1280px  # Structure
/build ImageGallery 3 2 1280px  # Layout
/build ImageGallery 3 3 1280px  # Surface
/build ImageGallery 3 4 1280px  # Interaction
/build ImageGallery 3 2 375px   # Mobile layout
/build ImageGallery 3 3 375px     # Mobile surface
```

---

### SC3: Related Products Carousel — PDP Enhancement (G-11)

**Gap:** `ProductDetail` has no related products section  
**Current:** Static product info + specs only  
**Target:** "You May Also Like" carousel at bottom of PDP  

#### DoD (Definition of Done)

**Pass 1 — Skeleton:**
- [ ] RelatedProducts section exists in ProductDetail
- [ ] Section renders semantic: `section > h2 + div[carousel]`
- [ ] Placeholder product cards render (debug border only)

**Pass 2 — Data:**
- [ ] GROQ query fetches related products by:
  - Same category (catalogueLocationKeys overlap)
  - Same brand (if available)
  - Exclude current product
- [ ] Limit to 4-6 products
- [ ] Data passed to ProductGrid or custom carousel

**Pass 3 — Build:**

*Desktop (1280px):*
- [ ] **Layer 1 (Structure):**
  - Section: `section[aria-labelledby="related-heading"]`
  - Heading: `h2#related-heading.type-section-sub`
  - Carousel: `div > article[]` horizontal scroll
- [ ] **Layer 2 (Layout):**
  - Section: `mt-12 pt-8 border-t border-border-secondary`
  - Carousel: `flex gap-4 overflow-x-auto pb-4`
  - Cards: `w-56 flex-shrink-0` (smaller than PLP cards)
- [ ] **Layer 3 (Surface):**
  - Cards: reuse `card-product-dark` (consistent with PLP)
  - Images: `aspect-[4/3]` with `bg-surface-productImage`
  - Typography: `type-card-title`, `type-price`
- [ ] **Layer 4 (Interaction):**
  - Cards: same hover lift as PLP
  - Horizontal scroll: smooth scroll behavior
  - Scroll snap optional: `snap-x snap-mandatory`
- [ ] **Lock:** Related products render horizontally, 4-6 visible

*Mobile (375px):*
- [ ] **Layer 2:** Cards `w-40` (smaller on mobile)
- [ ] **Layer 3:** Typography scales down
- [ ] **Layer 4:** Touch scroll, no hover states
- [ ] **Lock:** Mobile carousel scrollable with touch

**Verification:**
```bash
npm run build
# Test: Navigate to PDP → "You May Also Like" section visible
# Test: Click related product → Navigates to that PDP
```

**Data Query Pattern:**
```groq
*[_type == "product" 
  && _id != $currentId
  && count(catalogueLocationKeys[@ in $currentKeys]) > 0
] | order(displayPrice asc) [0...6] {
  _id, name, brand->{name}, displayPrice, image, slug
}
```

---

### SC4: Homepage VFS Migration — Architecture (G-13)

**Gap:** Homepage uses legacy `homepageData` singleton instead of VFS  
**Current:** `getHomepageData()` fetches singleton with hardcoded categories  
**Target:** VFS-resolved queries for dynamic category discovery  

#### DoD (Definition of Done)

**Pass 1 — Skeleton:**
- [ ] Homepage sections use generic "FeaturedSection" component
- [ ] No hardcoded category references in page.tsx
- [ ] Section order configurable via data

**Pass 2 — Data:**
- [ ] Sanity schema extended or VFS lookup for featured categories
- [ ] `getFeaturedCategories()` returns VFS-resolved categories
- [ ] Each category: name, slug, product count, sample products
- [ ] Homepage fetches 3-4 featured categories via VFS

**Pass 3 — Build:**

*Desktop (1280px):*
- [ ] **Layer 1 (Structure):**
  - Sections: `section > header + ProductGrid`
  - Header: overline + title + "View All" link
- [ ] **Layer 2 (Layout):**
  - Container: `container mx-auto px-4 py-12`
  - Grid: same as PLP `grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- [ ] **Layer 3 (Surface):**
  - Reuse ALL existing design tokens
  - ProductCard: unchanged (same component)
- [ ] **Layer 4 (Interaction):**
  - "View All" link navigates to category PLP
  - ProductCard: same hover behavior
- [ ] **Lock:** Homepage renders categories dynamically from VFS

*Mobile (375px):*
- [ ] **Layer 2:** Same responsive grid as PLP
- [ ] **Lock:** Mobile homepage matches PLP mobile behavior

**Verification:**
```bash
npm run build
# Test: Homepage loads with featured categories
# Test: Add category in Sanity → Appears on homepage after rebuild
# Verify: No "homepageData" singleton references remain
```

**Scope Note:** This is architecture-level change. If data migration required, split into separate data sprint.

---

### SC5: Checkbox Component Extraction — Reusability (G-06)

**Gap:** `FilterSidebar` has inline checkbox SVG and logic  
**Current:** Checkbox implemented inline in FilterSidebar  
**Target:** Reusable `Checkbox` component in `app/components/ui/checkbox.tsx`

#### DoD (Definition of Done)

**Pass 1 — Skeleton:**
- [ ] Checkbox component file created
- [ ] Component accepts: `checked`, `onChange`, `label`, `name`, `value`
- [ ] Semantic: `label > input[type="checkbox"] + visual-indicator`

**Pass 2 — Data:**
- [ ] Checkbox state controlled via props
- [ ] onChange fires with correct value
- [ ] Label text renders correctly

**Pass 3 — Build:**

*Desktop (1280px):*
- [ ] **Layer 1 (Structure):**
  - Label wraps input for click target
  - Input: `sr-only` (screen reader only)
  - Visual checkbox: div with border
- [ ] **Layer 2 (Layout):**
  - Container: `flex items-center gap-3`
  - Checkbox: `w-4 h-4`
  - Label: `type-body`
- [ ] **Layer 3 (Surface):**
  - Unchecked: `border-border-primary bg-transparent`
  - Checked: `bg-brand-400 border-brand-400`
  - Checkmark: SVG icon from design system
  - Hover: `group-hover:border-brand-400`
- [ ] **Layer 4 (Interaction):**
  - Transition: `transition-all duration-150`
  - Focus: `focus-visible:ring-2 focus-visible:ring-brand-400`
- [ ] **Lock:** Checkbox visually matches current FilterSidebar

*Mobile (375px):*
- [ ] **Layer 2:** Touch target min 44px (use padding if needed)
- [ ] **Lock:** Mobile checkbox easy to tap

**Verification:**
```bash
npm run build
# Test: FilterSidebar uses Checkbox component
# Test: Check/uncheck works correctly
# Verify: No visual regression in filter sidebar
```

**Refactor Pattern:**
```typescript
// BEFORE (inline in FilterSidebar):
<label className="flex items-center gap-3">
  <input type="checkbox" className="sr-only" />
  <div className="w-4 h-4 border...">{isChecked && <svg>...</svg>}</div>
</label>

// AFTER (using Checkbox component):
<Checkbox 
  name={group.field}
  value={option.value}
  checked={isChecked}
  onChange={() => handleToggle(group.field, option.value)}
  label={option.label}
/>
```

---

## Sprint Sequencing (Dependency Order)

```
Execution Order:
1. SC5 (Checkbox) — Component extraction first (enables SC1, SC3)
2. SC1 (Empty State) — Design system compliance (blocks SC3)
3. SC2 (Image Zoom) — Isolated PDP feature
4. SC3 (Related Products) — Depends on ProductCard/Grid
5. SC4 (Homepage VFS) — Architecture, most complex, do last
```

**Dependency Chain:**
- SC5 → SC1 (Checkbox used in filter UI)
- SC1 → SC3 (ProductGrid changes affect related products)
- SC2 independent
- SC4 independent (architecture layer)

---

## Build Execution Commands

Per scope contract, invoke `/build` for Pass 3 DoDs:

```bash
# SC5: Checkbox Component
/build Checkbox 3 1 1280px
/build Checkbox 3 2 1280px
/build Checkbox 3 3 1280px
/build Checkbox 3 4 1280px
/build Checkbox 3 1 375px  # Mobile structure
/build Checkbox 3 2 375px  # Mobile layout

# SC1: Empty State
/build ProductGrid 3 3 1280px  # Layer 3 only (structure exists)
/build ProductGrid 3 3 375px    # Mobile surface

# SC2: Image Zoom
/build ImageGallery 3 1 1280px
/build ImageGallery 3 2 1280px
/build ImageGallery 3 3 1280px
/build ImageGallery 3 4 1280px
/build ImageGallery 3 1 375px
/build ImageGallery 3 2 375px
/build ImageGallery 3 3 375px

# SC3: Related Products
/build RelatedProducts 3 1 1280px
/build RelatedProducts 3 2 1280px
/build RelatedProducts 3 3 1280px
/build RelatedProducts 3 4 1280px
/build RelatedProducts 3 2 375px
/build RelatedProducts 3 3 375px
```

---

## /Test Integration Points

### Pre-Sprint Baseline

```bash
# Capture current state before any changes
/test scope:"UI Polish pre-sprint" baseline:true
```

**Expected:** Document current visual state of ProductGrid empty state, ImageGallery, etc.

### Per Scope Contract

```bash
# After SC5 complete:
/test scope:"SC5 Checkbox Component" dod:"Pass 1-3 DoDs"

# After SC1 complete:
/test scope:"SC1 Empty State" dod:"Pass 1-3 DoDs"

# After SC2 complete:
/test scope:"SC2 Image Zoom" dod:"Pass 1-3 DoDs"

# After SC3 complete:
/test scope:"SC3 Related Products" dod:"Pass 1-3 DoDs"

# After SC4 complete:
/test scope:"SC4 Homepage VFS" dod:"Pass 1-3 DoDs"
```

### Post-Sprint Final

```bash
/test scope:"Full UI Polish sprint" final:true
npm run build
```

---

## Test Evidence Log

### Pre-Sprint Baseline

| Date | /test Invocation | Tests | Pass Rate | Verdict |
|------|------------------|-------|-----------|---------|
| | | | | |

### Per Scope Contract

| Scope Contract | /test Date | DoD Tests | Pass Rate | Verdict |
|----------------|------------|-----------|-----------|---------|
| SC5: Checkbox | | | | |
| SC1: Empty State | | | | |
| SC2: Image Zoom | | | | |
| SC3: Related Products | | | | |
| SC4: Homepage VFS | | | | |

### Post-Sprint Final

| Date | /test Invocation | Total Tests | Pass Rate | Sprint Verdict |
|------|------------------|-------------|-----------|----------------|
| | | | | |

---

## Critical Implementation Notes

1. **Homepage Verification:** After ANY ProductCard or ProductGrid change, verify homepage featured section renders correctly.

2. **Design System Lock:** Use only existing tokens from `tailwind.config.ts`. If token missing, use closest match — do NOT add new tokens.

3. **SC4 Complexity:** Homepage VFS migration is architecture-level. If Sanity data changes required, halt and create separate data migration sprint.

4. **SC2 Modal Pattern:** Use native `<dialog>` element if browser support acceptable, otherwise `div[role="dialog"]` with focus trap.

5. **SC3 Query Performance:** Related products GROQ must use same index as PLP queries. Test with `explain()` if slow.

---

## Sprint Lock Criteria

✅ **SPRINT COMPLETE WHEN:**
- All 5 scope contracts have 100% DoD pass rate
- `/test` evidence dashboard shows 100% specification tests
- `npm run build` passes
- Homepage renders correctly (no regression)
- PLP → PDP → Related Products flow works end-to-end

❌ **BLOCKING CONDITIONS:**
- Any DoD item incomplete
- Any test failing
- Build error
- Homepage regression detected
- Design system token violation

---

## Output Location

**Save completed sprint to:** `_project/sprints/active/SPRINT_2026_03_31_UI_POLISH.md`

**Archive completed work to:** `_project/sprints/done/` after sprint lock.

---

**Ready for execution. Begin with SC5 (Checkbox extraction) — enables clean implementation of SC1 and SC3.**
