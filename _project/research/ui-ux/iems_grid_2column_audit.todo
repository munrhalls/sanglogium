# Research & Audit: IEMs Gallery 2-Column Display Issue

**Date:** 2026-04-01  
**Topic:** Why Grid `cols={4}` renders 2 columns at desktop width  
**Research Scope:** Tailwind grid breakpoints, actual data count, CSS cascade

---

## Research Scope Contract

- **Topic:** Grid component renders 2 columns when 4 columns configured at desktop
- **First Principles:** CSS Grid template columns, Tailwind breakpoint cascade, data-driven rendering
- **Fundamentals:** Tailwind `grid-cols-*` classes, responsive prefix behavior (`xs:`, `md:`, `lg:`)
- **Scope Boundary:** NOT investigating card styling, NOT changing data structure
- **Target Audience:** Developer implementing grid layout fixes
- **Decay Risk:** Low — CSS Grid behavior is stable

---

## Visual Evidence Analysis

### Screenshot Observation
- **Viewport:** Desktop width (full navigation visible, >1024px expected)
- **Actual Display:** 2 columns side-by-side
- **Expected Display:** 4 columns
- **Cards Shown:** 2 items (Bose, Bowers & Wilkins)
- **Card Width:** ~50% each (filling container)

### Key Question
**Is this a CSS issue (grid forced to 2 cols) or a data issue (only 2 items in CMS)?**

With CSS Grid `grid-template-columns: repeat(4, 1fr)` and 2 items:
- Items occupy column positions 1 and 2
- Columns 3 and 4 remain empty but reserved
- Each item = 25% width

With CSS Grid `grid-template-columns: repeat(2, 1fr)` and 2 items:
- Items fill both columns
- Each item = 50% width

**Screenshot cards appear ~50% width → suggests 2-column grid, not 4-column with empty slots.**

---

## Implementation Audit

### Grid Component (Current State)
```tsx
// app/components/layout/grid/Grid.tsx
const columnMap = {
  2: "grid-cols-1 xs:grid-cols-2",
  3: "grid-cols-1 xs:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",  // ← Fixed mapping
};
```

**Status:** Mapping appears correct after previous fix.

### Tailwind Config Investigation

```ts
// tailwind.config.ts - screens section
extend: {
  screens: {
    "xs": "475px",        // Custom (defined)
    "3xl": "1920px",      // Custom (defined)
    "lg-touch": { raw: "..." },      // Custom
    "lg-desktop": { raw: "..." },    // Custom
    // sm, md, lg, xl, 2xl NOT explicitly defined
  },
```

**Finding:** Default Tailwind breakpoints (sm:640px, md:768px, lg:1024px, xl:1280px) are NOT overridden in config.

Since they're in `extend`, defaults should merge. But need to verify `lg:grid-cols-4` is actually applying.

### Data Source Audit

```ts
// homepageBatch.ts - GROQ query for IEMs
"iemsGallery": iemsGallery[]->{
  _id, name, brand, displayPrice, "slug": slug.current, ...
}
```

```ts
// getIemProducts.ts - same query
const IEMS_QUERY = `*[_type == "homepageData"][0].iemsGallery[]->{...}`;
```

**Critical Finding:** IEMs come from `homepageData` document's `iemsGallery` field. If CMS only has 2 IEMs configured, grid physically cannot show 4 columns with content.

---

## Hypothesis Testing

### Hypothesis 1: CSS Not Applying lg:grid-cols-4
**Test:** Check if Tailwind generates `lg:grid-cols-4` class correctly  
**Evidence:** Other components use same pattern successfully:
- `ProductGrid.tsx`: `"grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"`
- `ProductGridSkeleton.tsx`: Same pattern

**Verdict:** CSS class pattern is valid and used elsewhere.

### Hypothesis 2: Only 2 IEMs in CMS Data
**Test:** Check if data query returns only 2 items  
**Evidence:** Screenshot shows exactly 2 cards (Bose, Bowers & Wilkins)  
**Likelihood:** HIGH — If CMS only has 2 IEMs in `homepageData.iemsGallery`, only 2 render.

### Hypothesis 3: Container Width Constrains Grid
**Test:** Check if `max-w-content` (1280px) allows 4 columns with gaps  
**Math:** 
- Container: 1280px - padding
- 4 columns with `lg:gap-8` (32px gaps):
  - 3 gaps × 32px = 96px
  - Available: ~1200px - 96px = ~1104px
  - Per column: ~276px minimum

**Verdict:** Physically possible. Cards in screenshot appear wider than 276px.

---

## Root Cause Determination

### Most Likely: Data Quantity (Only 2 IEMs in CMS)

**Evidence:**
1. Screenshot shows exactly 2 products
2. No placeholder/empty slots visible for columns 3-4
3. Cards fill ~50% width each (consistent with 2-item, 2-visible-column layout)
4. Grid CSS pattern is correct and used successfully elsewhere

**Alternative: CSS Not Applied**
1. Possible if `lg` breakpoint not triggering
2. Would require viewport <1024px, but screenshot shows desktop nav
3. Less likely given visual evidence

---

## Verification Required

### Test 1: Verify Data Count
```typescript
// Add debug logging to IemsGallery.tsx
console.log('IEMs count:', iemsData.length);
```

**Expected:** If count = 2, confirms data issue. If count ≥ 4, CSS issue.

### Test 2: Browser DevTools Inspection
```javascript
// In browser console at desktop viewport
const grid = document.querySelector('article[class*="bg-brand-900"] .grid');
console.log(getComputedStyle(grid).gridTemplateColumns);
```

**Expected:** 
- If data issue: `"repeat(4, 1fr)"` but only 2 child elements
- If CSS issue: `"repeat(2, 1fr)"` or `"repeat(3, 1fr)"`

---

## Recommended Actions

### Immediate Verification
1. **Check CMS:** How many IEMs are configured in `homepageData.iemsGallery`?
2. **Add logging:** Confirm `iemsData.length` at runtime
3. **DevTools check:** Verify computed `grid-template-columns`

### If Data Issue (Only 2 IEMs)
- **Option A:** Add more IEMs to CMS (marketing decision)
- **Option B:** Adjust grid to show 2 columns at desktop for this section only
- **Option C:** Show placeholder/empty states for unfilled columns

### If CSS Issue
- Verify Tailwind config isn't blocking `lg:` breakpoints
- Check for conflicting CSS in IemCard or container
- Ensure `lg:grid-cols-4` class is in generated CSS bundle

---

## Synthesis: Actionable Takeaways

| Scenario | Evidence Needed | Action |
|----------|----------------|--------|
| CMS has 2 IEMs | `iemsData.length === 2` | Add more products OR accept 2-col layout |
| CSS not applying | `gridTemplateColumns !== repeat(4)` | Debug Tailwind config/build |
| Visual expectation mismatch | User wants 2 items in 4-col layout | Use `col-span` or adjust design |

**Next Step:** Verify data count before any code changes. Build passing ≠ correct rendering. Need runtime verification.

---

*Research completed. Awaiting data verification to confirm root cause.*
