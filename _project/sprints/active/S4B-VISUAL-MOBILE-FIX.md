# Sprint 4B: Visual Hierarchy & Mobile Filter Drawer

## Scope Contract

### Problem Statement
Current implementation has visual hierarchy issues and mobile layout inefficiency:
- a. Filter sidebar lacks visual differentiation from product area
- b. Category title uses wrong color (blue-ish instead of brand headline)
- c. Product card titles use wrong typography
- d. Sort dropdown has dissonant focus outline
- e. Mobile: Filters/Sort/ActiveFilters stack vertically consuming 4/5 screen height

### Target State

**Desktop (1280px+):**
- Sidebar has subtle visual differentiation (elevated surface or border treatment)
- Category title uses `text-headline` (brand-400)
- Product titles use `text-headline`
- Sort dropdown focus outline uses brand colors

**Mobile (375px):**
- Horizontal control bar: "Filters" button (left) + Sort dropdown (right) + Result count
- Filters render in **slide-out drawer** from left (overlay + animation)
- Active filters show below control bar as horizontal scrollable pills
- Products visible immediately without scrolling past controls

### Out of Scope
- Filter logic/URL updates (Layer 4 handles this)
- Data fetching changes
- Desktop sidebar behavior changes

---

## Implementation Plan

### Phase 1: Visual Hierarchy Fixes (All Viewports)

#### V1. FilterSidebar Differentiation
**File:** `app/components/features/filters/FilterSidebar.tsx`
**Change:** Add subtle background differentiation
```
Current: bg-transparent
Target: bg-surface-subtle (brand-800) with border-secondary-700
```

#### V2. ShopHeader Title Color
**File:** `app/components/features/products/ShopHeader.tsx`
**Change:** Update typography classes
```
Current: text-2xl font-bold text-gray-900
Target: text-h1 font-semibold text-headline
```

#### V3. ProductCard Title Color  
**File:** `app/components/features/products/ProductCard.tsx`
**Change:** Update title classes
```
Current: font-medium text-gray-900
Target: text-body font-medium text-headline
```

#### V4. SortDropdown Focus Outline
**File:** `app/components/features/filters/SortDropdown.tsx`
**Change:** Update focus-visible styles
```
Current: focus-visible:outline-2 focus-visible:outline-brand-600
Target: focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page
```

### Phase 2: Mobile Layout Redesign

#### M1. Mobile Filter Drawer Component
**New File:** `app/components/features/filters/MobileFilterDrawer.tsx`
**Structure:**
```tsx
interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterGroup[];
}

// Full-screen overlay with slide-in panel from left
// Backdrop: bg-black/50
// Panel: w-[300px] bg-surface-card
// Animation: translate-x-[-100%] to translate-x-0 (300ms ease-out)
```

#### M2. Mobile Controls Bar
**New File:** `app/components/features/filters/MobileControlsBar.tsx`
**Structure:**
```tsx
interface MobileControlsBarProps {
  productCount: number;
  onOpenFilters: () => void;
  currentSort: string;
}

// Horizontal layout: [Filters button] [Result count] [Sort dropdown]
// Only visible on mobile (lg:hidden)
```

#### M3. ActiveFilters Mobile Variant
**File:** `app/components/features/filters/ActiveFilters.tsx`
**Change:** Add horizontal scroll on mobile
```
Add: overflow-x-auto whitespace-nowrap scrollbar-hide
```

#### M4. Page Integration
**File:** `app/(store)/products/[...slug]/page.tsx`
**Changes:**
- Add state management for drawer open/close
- Render MobileControlsBar (mobile only)
- Render MobileFilterDrawer (mobile only)
- Hide desktop sidebar on mobile
- Position ActiveFilters appropriately

---

## Test Specifications

### Visual Tests (Manual)

**V-TEST-01: Sidebar Differentiation**
- Navigate to category page
- Verify sidebar has distinct background from product area
- Check: bg-surface-subtle (slightly lighter than page bg)

**V-TEST-02: Typography Hierarchy**
- Check category title: `text-h1 text-headline` (cream/off-white)
- Check product titles: `text-body text-headline`
- Verify no blue-ish colors in text

**V-TEST-03: Sort Dropdown Focus**
- Click sort dropdown
- Verify focus ring is accent-500 (gold)
- Verify ring offset matches page background

### Mobile Tests (Manual)

**M-TEST-01: Control Bar Visibility**
- Resize to 375px
- Verify horizontal bar with Filters button + count + sort
- Verify stacked layout replaced

**M-TEST-02: Filter Drawer Open**
- Tap "Filters" button
- Verify drawer slides in from left
- Verify backdrop overlay appears
- Verify body scroll locked

**M-TEST-03: Filter Drawer Close**
- Tap backdrop
- Verify drawer slides out
- Verify backdrop disappears
- Verify body scroll restored

**M-TEST-04: Filter Selection**
- Open drawer
- Check filter checkbox
- Verify drawer closes (optional - can stay open)
- Verify products update

**M-TEST-05: Active Filters Scroll**
- Apply 4+ filters
- Verify pills horizontally scrollable
- Verify no vertical expansion

**M-TEST-06: Product Visibility**
- Load page at 375px
- Verify at least 1 product row visible without scrolling
- Control bar should not exceed ~25% viewport height

---

## Definition of Done

- [ ] V1: Sidebar has bg-surface-subtle
- [ ] V2: ShopHeader uses text-headline
- [ ] V3: ProductCard uses text-headline
- [ ] V4: SortDropdown focus uses accent-500 ring
- [ ] M1: MobileFilterDrawer created with slide animation
- [ ] M2: MobileControlsBar created with horizontal layout
- [ ] M3: ActiveFilters horizontal scroll on mobile
- [ ] M4: Page renders mobile layout correctly
- [ ] All 6 mobile tests pass
- [ ] All 3 visual tests pass
- [ ] 0 visual regressions on desktop

---

## File Checklist

```
Modify:
  app/components/features/filters/FilterSidebar.tsx
  app/components/features/filters/SortDropdown.tsx
  app/components/features/filters/ActiveFilters.tsx
  app/components/features/products/ShopHeader.tsx
  app/components/features/products/ProductCard.tsx
  app/(store)/products/[...slug]/page.tsx

Create:
  app/components/features/filters/MobileFilterDrawer.tsx
  app/components/features/filters/MobileControlsBar.tsx

Add exports to:
  app/components/features/filters/index.ts
```

---

## AI Execution Protocol

**Phase 1 first** (all viewport fixes):
1. Fix FilterSidebar background
2. Fix ShopHeader typography
3. Fix ProductCard typography  
4. Fix SortDropdown focus ring

**Then Phase 2** (mobile-specific):
5. Create MobileFilterDrawer
6. Create MobileControlsBar
7. Update ActiveFilters for mobile scroll
8. Integrate in page

User verifies each phase before proceeding.

---

*Ready for execution. Begin Phase 1?*
