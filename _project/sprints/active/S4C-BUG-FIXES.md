# Sprint 4C: Critical Bug Fixes

## Scope Contract

Fix 4 critical issues identified during Sprint 4B verification:

### Issues
1. **SortDropdown focus ring visible** — should show NO ring on focus
2. **FilterSidebar bg-surface-subtle not visible** — no visual differentiation from page background
3. **FilterSidebar appears twice** — duplicated in ShopLayout sidebar slot AND CategoryPageClient
4. **Barrel exports in index.ts** — tree shaking issues with Next.js 15, convert to normal imports

### Out of Scope
- No new features
- No visual redesign
- No mobile drawer behavior changes
- No data layer modifications

---

## Definition of Done

- [ ] SortDropdown: Clicking dropdown shows zero focus ring/outline
- [ ] FilterSidebar: Has visible background differentiation from page
- [ ] FilterSidebar: Renders exactly once on desktop
- [ ] All imports use direct paths, no barrel exports from filters/index.ts
- [ ] Build passes with zero errors
- [ ] All 4 tests below pass

---

## Test Specifications (Failing → Passing)

### TEST-01: SortDropdown Focus Ring Absent
**File:** `app/components/features/filters/SortDropdown.tsx`
**Test:** 
```tsx
// Click the sort dropdown
const select = screen.getByTestId('sort-dropdown').querySelector('select');
select?.focus();
// ASSERT: No focus ring visible (no outline, no ring classes applied)
expect(select).not.toHaveClass(/focus-visible:ring/);
expect(select).not.toHaveClass(/focus:outline/);
```
**Expected:** Clean select element with no visual change on focus

---

### TEST-02: FilterSidebar Background Visible
**File:** `app/components/features/filters/FilterSidebar.tsx`
**Test:**
```tsx
const sidebar = screen.getByTestId('filter-sidebar');
// ASSERT: Background color is different from page background
const styles = window.getComputedStyle(sidebar);
expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
expect(styles.backgroundColor).not.toBe('rgb(13, 15, 15)'); // Not same as page bg
```
**Expected:** Sidebar has distinct background (surface-card or similar visible token)

---

### TEST-03: FilterSidebar Renders Once
**File:** `app/(store)/products/[...slug]/page.tsx` + `CategoryPageClient.tsx`
**Test:**
```tsx
render(<CategoryPage />);
const sidebars = screen.getAllByTestId('filter-sidebar');
// ASSERT: Exactly one FilterSidebar in DOM
expect(sidebars).toHaveLength(1);
```
**Expected:** Only one sidebar visible, no duplicates from ShopLayout + ClientComponent

---

### TEST-04: No Barrel Export Imports
**Files:** All files importing from filters
**Test:**
```tsx
// Search codebase for barrel imports
const barrelImports = grep("from '@/app/components/features/filters'");
// ASSERT: Zero barrel imports found
expect(barrelImports.length).toBe(0);

// Search for direct imports
const directImports = grep("from '@/app/components/features/filters/FilterSidebar'");
// ASSERT: Direct imports exist
expect(directImports.length).toBeGreaterThan(0);
```
**Expected:** All imports use direct component paths, no index.ts barrel pattern

---

## Implementation Checklist

```
File Changes Required:

app/components/features/filters/SortDropdown.tsx
  - Remove focus-visible:ring-2 and related classes
  - Add focus:outline-none

app/components/features/filters/FilterSidebar.tsx
  - Change bg-surface-subtle → bg-surface-card or similar visible token
  - OR add border treatment for differentiation

app/(store)/products/[...slug]/page.tsx
  - Remove sidebar prop from ShopLayout OR
  - Remove FilterSidebar from CategoryPageClient

app/(store)/products/[...slug]/CategoryPageClient.tsx
  - Remove FilterSidebar import (if deduplicating here)

app/components/features/filters/index.ts
  - DELETE FILE (or leave empty, convert all imports)

All importing files:
  - Convert: from '@/app/components/features/filters'
  - To: from '@/app/components/features/filters/ComponentName'
```

---

## Execution Order

1. **Fix imports first** — convert barrel to direct paths
2. **Fix duplication** — remove duplicate sidebar render
3. **Fix SortDropdown** — remove focus ring
4. **Fix FilterSidebar bg** — make visible

Execute in order, test after each step.
