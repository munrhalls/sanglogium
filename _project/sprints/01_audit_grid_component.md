# Audit: Grid Component Abstraction

## 1. End-State Delineation

### Current Architecture (Problem State)
```
app/components/layout/grid/Grid.tsx
├── Props: cols?: 2 | 3 | 4
├── columnMap: dynamic object lookup
│   ├── 2: "grid-cols-2 lg:grid-cols-2"
│   ├── 3: "grid-cols-2 md:grid-cols-2"  [BUG: never renders 3 cols]
│   └── 4: "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
└── Problem: Dynamic construction evades Tailwind purge
```

### Target Architecture (Direct Classes)
```
IemsGallery.tsx (and other consumers)
├── Direct Tailwind classes on div
├── No abstraction layer
└── Tailwind statically analyzes classes → no purge
```

---

## 2. Spatial Architecture

### Component Hierarchy (Current)
```
IemsGallery
├── Grid (cols={4})          [ABSTRACTION LAYER]
│   ├── columnMap lookup      [DYNAMIC - causes purge issue]
│   └── div.grid              [RENDER TARGET]
└── IemCard[]
```

### Component Hierarchy (Target)
```
IemsGallery
├── div.grid                  [DIRECT - no purge issue]
│   └── "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
└── IemCard[]
```

---

## 3. Gap Analysis (G-XX)

| ID | Component | Current | Target | Severity |
|----|-----------|---------|--------|----------|
| G-01 | Grid.tsx | Dynamic `columnMap[cols]` | Delete component | **Critical** |
| G-02 | Grid.tsx line 12 | `cols={3}` maps to `md:grid-cols-2` | Fix to `md:grid-cols-3` OR delete | **High** |
| G-03 | tailwind.config.ts | Missing `grid-cols-*` in safelist | Delete after Grid removal | Medium |
| G-04 | IemsGallery.tsx | Uses Grid abstraction | Inline Tailwind classes | Medium |

---

## 4. Why Dynamic Construction Exists (Historical Analysis)

### Original Intent (Hypothesized)
```typescript
// Intent: Centralized grid configuration
// Theory: Single source of truth for grid columns
// Reality: Only 1 consumer, adds complexity, breaks purge
```

### Actual Usage Analysis
```bash
$ grep -r "from.*grid/Grid" app/
app/components/features/homepage/iems-gallery/IemsGallery.tsx:1
# Result: ONLY 1 file imports Grid component
```

### Comparison: ProductGrid.tsx
```tsx
// app/components/features/products/ProductGrid.tsx:31-34
className={cn(
  "grid gap-6",
  "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",  // DIRECT
  className
)}
```

**Conclusion:** `ProductGrid.tsx` demonstrates the correct pattern - direct Tailwind classes without abstraction.

---

## 5. RWD Strategy

| Component | Desktop (1280px+) | Tablet (768px) | Mobile (<475px) |
|-----------|-------------------|----------------|-----------------|
| Current Grid | `lg:grid-cols-4` (purged) | `md:grid-cols-3` (purged) | `grid-cols-1` |
| Target Direct | `lg:grid-cols-4` ✓ | `md:grid-cols-3` ✓ | `grid-cols-1` ✓ |

---

## 6. Root Cause: Why Grid Abstraction Fails

### Tailwind Purge Mechanism
```
1. Tailwind scans source files for class strings
2. Dynamic construction: columnMap[4] → "lg:grid-cols-4"
3. Purge sees "columnMap[4]", not "lg:grid-cols-4"
4. Result: "lg:grid-cols-4" not in generated CSS
5. Grid falls back to 2 columns (from other components)
```

### Evidence: ProductGrid Works
- Same classes: `grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Different pattern: Hardcoded string (not dynamic)
- Result: Classes present in CSS bundle

---

## 7. Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `IemsGallery.tsx` | Grid removal requires inlining classes | Direct replacement, no logic change |
| `tailwind.config.ts` | Safelist modification | Add classes, verify build |
| `ProductGrid.tsx` | Reference pattern | Copy its pattern exactly |

---

## 8. Recommendation: DELETE Grid Component

### Why Deletion > Fix
| Factor | Fix (Add Safelist) | Delete (Inline Classes) |
|--------|-------------------|-------------------------|
| Lines of code | +5 (safelist) | -26 (Grid.tsx) |
| Complexity | Maintains abstraction | Removes abstraction |
| Tailwind compliance | Workaround | Native pattern |
| Consumer changes | 0 | 1 (IemsGallery.tsx) |
| Future maintenance | Must maintain safelist | Standard Tailwind |

### Implementation Plan
1. **Delete** `app/components/layout/grid/Grid.tsx`
2. **Modify** `IemsGallery.tsx` - inline the grid classes
3. **Verify** build passes
4. **Verify** runtime renders 4 columns at desktop

---

## 9. Verification Commands

```bash
# Pre-sprint regression
npm run build

# Verify CSS contains grid classes
npm run build 2>&1 | Select-String -Pattern "grid-cols-4"

# Component verification
npx playwright test --grep "IEM"
```

---

## 10. Synthesis

**The Grid component is an unnecessary abstraction that breaks Tailwind's static analysis.**

- **Single consumer:** Only `IemsGallery.tsx` uses it
- **Better alternative:** `ProductGrid.tsx` shows direct class approach works
- **Bug present:** `cols={3}` mapping is incorrect (`md:grid-cols-2`)
- **Root cause:** Dynamic `columnMap[cols]` evades Tailwind purge

**Recommended Action:** Delete `Grid.tsx` and inline classes in `IemsGallery.tsx` following `ProductGrid.tsx` pattern.

---

*Audit complete. Ready for sprint specification.*
