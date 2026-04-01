# Research & Audit: Homepage Items Grid Layout Layer

**Date:** 2026-04-01  
**Scope:** IemsGallery Grid Component (`app/components/layout/grid/Grid.tsx`)  
**Research Type:** Layout Layer Best Practices + Root Cause Analysis  

---

## 1. Executive Summary

### Critical Finding: Grid Column Mapping Bug
The `Grid` component has a **broken column mapping** that causes `cols={3}` to render 2 columns and creates unexpected responsive behavior for `cols={4}`.

### Why 4 Columns Displays as 2
The `cols={4}` mapping uses a mobile-first progressive enhancement:
- `< 475px`: 1 column
- `475px - 767px`: **2 columns** ← User sees this range
- `768px - 1023px`: 3 columns
- `≥ 1024px`: 4 columns

On typical tablets (768px-1023px), users see 3 columns; only at desktop (`lg` breakpoint ≥1024px) do they see the expected 4 columns.

### Why Layout Looks "Off"
| Issue | Location | Impact |
|-------|----------|--------|
| Missing container padding | `IemsGallery.tsx:22` | Grid flush against viewport edges |
| Inconsistent card padding | `IemCard.tsx:12` | `p-0` → `xs:p-6` creates visual jump |
| Uneven gap-to-card ratio | `Grid.tsx:18` | Large gaps (`lg:gap-8`) with no card padding looks unbalanced |

---

## 2. Layout Layer Best Practices (Research)

### 2.1 CSS Grid Responsive Patterns

**Pattern A: Mobile-First Progressive Enhancement (Current)**
```css
grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
```
- ✅ Follows Tailwind's mobile-first philosophy
- ✅ Each breakpoint adds columns
- ⚠️ Requires understanding of when columns appear

**Pattern B: Desktop-First with Max Columns**
```css
grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
```
- ✅ Predictable at desktop
- ⚠️ Requires explicit override at mobile

**Pattern C: Container Query-Based (Modern)**
```css
@container (min-width: 600px) { grid-cols: 2 }
@container (min-width: 900px) { grid-cols: 3 }
```
- ✅ Container-relative, not viewport-relative
- ⚠️ Requires `container-type: inline-size` on parent

### 2.2 Gap-to-Padding Relationship

| Screen Size | Gap | Card Padding | Container Padding | Ratio |
|-------------|-----|--------------|-------------------|-------|
| Mobile | 16px (gap-4) | 0px | 16px | Balanced |
| Tablet | 24px (gap-6) | 24px (p-6) | 24px | Balanced |
| Desktop | 32px (gap-8) | 24px (p-6) | 32px | Balanced |

**Key Principle:** Gap + card padding should approximate container padding for visual rhythm.

### 2.3 Container Padding Requirements

Per best practices (Tailwind UI, Radix Primitives, shadcn/ui):
- **Minimum horizontal padding:** `16px` (mobile) → `24px` (tablet) → `32px` (desktop)
- **Consistent spacing scale:** Container padding ≥ gap between items
- **Edge breathing room:** Content should never touch viewport edges

---

## 3. Current Implementation Audit

### 3.1 Grid Component (`app/components/layout/grid/Grid.tsx`)

```tsx
const columnMap = {
  2: "grid-cols-2 lg:grid-cols-2",
  3: "grid-cols-2 md:grid-cols-2",   // ❌ BUG: Never renders 3 columns!
  4: "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};
```

**Issue G-01: Critical Column Mapping Error**
- **Current:** `cols={3}` → `"grid-cols-2 md:grid-cols-2"`
- **Expected:** `cols={3}` → `"grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"`
- **Impact:** Any component requesting 3 columns receives 2

**Issue G-02: Unexpected Column Count for cols={4}**
- **Breakpoint Mapping:**
  | Viewport | Columns | User Expectation |
  |----------|---------|------------------|
  | < 475px | 1 | Reasonable |
  | 475-767px | **2** | Likely expects 4 |
  | 768-1023px | 3 | Likely expects 4 |
  | ≥ 1024px | 4 | Matches expectation |

- **Root Cause:** `lg:grid-cols-4` requires 1024px+ viewport

### 3.2 IemsGallery Container (`app/components/features/homepage/iems-gallery/IemsGallery.tsx`)

```tsx
<div className="mx-auto max-w-content">  // ❌ No horizontal padding
  <div className="flex flex-col gap-4">
    <Grid cols={4}>
```

**Issue G-03: Missing Container Padding**
- **Current:** `max-w-content` without `px-*`
- **Required:** `px-4 md:px-6 lg:px-8` (per design system spacing scale)
- **Impact:** Grid items touch viewport edges at all breakpoints

### 3.3 IemCard Component (`app/components/features/homepage/iems-gallery/IemCard.tsx`)

```tsx
<article className="card-product p-0 xs:p-6 ...">  // ❌ Padding jumps from 0 to 24px
```

**Issue G-04: Discontinuous Padding Scale**
- **Current:** `p-0` → `xs:p-6` (0px → 24px jump at 475px)
- **Required:** Smooth progression: `p-4 xs:p-5 md:p-6`
- **Impact:** Visual "pop" when crossing 475px breakpoint

---

## 4. Gap Analysis (G-XX)

| ID | Component | Issue | Current | Target | Severity |
|----|-----------|-------|---------|--------|----------|
| G-01 | Grid.tsx | Column mapping bug for cols=3 | Renders 2 cols | Renders 3 cols | **Critical** |
| G-02 | Grid.tsx | cols=4 only shows 4 at ≥1024px | 2-3 cols at tablet | Consistent 4 cols expected | High |
| G-03 | IemsGallery.tsx | Missing container padding | Flush edges | `px-4 md:px-6 lg:px-8` | Medium |
| G-04 | IemCard.tsx | Padding jump | `p-0 xs:p-6` | `p-4 xs:p-5 md:p-6` | Medium |

---

## 5. Layout Layer Correction

### 5.1 Fix Grid Column Mapping

```tsx
// Grid.tsx - CORRECTED
const columnMap = {
  2: "grid-cols-1 xs:grid-cols-2",           // 1→2 columns
  3: "grid-cols-1 xs:grid-cols-2 md:grid-cols-3",  // 1→2→3 columns
  4: "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",  // 1→2→3→4 columns
};
```

**Alternative if 4 columns required at tablet:**
```tsx
4: "grid-cols-2 md:grid-cols-4"  // 2→4 columns (skip 3)
```

### 5.2 Add Container Padding

```tsx
// IemsGallery.tsx - CORRECTED
<div className="mx-auto max-w-content px-4 md:px-6 lg:px-8">
```

### 5.3 Smooth Card Padding

```tsx
// IemCard.tsx - CORRECTED
<article className="card-product p-4 xs:p-5 md:p-6 ...">
```

---

## 6. RWD Strategy Alignment

### Breakpoint Reality Check

| Breakpoint | Value | Current cols=4 | Expected cols=4 |
|------------|-------|----------------|-----------------|
| Default | < 475px | 1 | 1 ✅ |
| xs | 475px+ | 2 | 2 ✅ |
| sm | 640px+ | 2 | 2 or 3? |
| md | 768px+ | 3 | 3 or 4? |
| lg | 1024px+ | **4** | **4** |
| xl | 1280px+ | 4 | 4 |

**Recommendation:** If users expect 4 columns on tablets (768px+), change mapping to:
```tsx
4: "grid-cols-1 xs:grid-cols-2 md:grid-cols-4"  // 1→2→4
```

---

## 7. Verification Checklist

- [ ] Grid.tsx columnMap corrected for cols=3
- [ ] Grid.tsx columnMap aligned with design expectations for cols=4
- [ ] IemsGallery.tsx has `px-4 md:px-6 lg:px-8`
- [ ] IemCard.tsx has progressive padding `p-4 xs:p-5 md:p-6`
- [ ] Build passes: `npm run build`
- [ ] Visual check at 375px, 768px, 1024px, 1440px

---

## 8. Files Modified

| File | Changes |
|------|---------|
| `app/components/layout/grid/Grid.tsx` | Fix columnMap for cols 2,3,4 |
| `app/components/features/homepage/iems-gallery/IemsGallery.tsx` | Add container padding |
| `app/components/features/homepage/iems-gallery/IemCard.tsx` | Smooth padding progression |

---

## 9. Synthesis

### Root Causes of "Looks Off"

1. **Structural:** Missing container padding creates edge-clipping
2. **Rhythmic:** Discontinuous card padding creates visual "pop"
3. **Expectational:** 4 columns only appear at ≥1024px (not tablets)

### Immediate Actions

1. **Fix G-01 (Critical):** Correct `columnMap[3]` to render 3 columns
2. **Clarify G-02:** Determine if 4 columns expected at tablet (768px+)
3. **Apply G-03:** Add container padding for visual breathing room
4. **Smooth G-04:** Progressive card padding for seamless breakpoints

### Build Pattern Compliance

Per `/build` workflow Layer 2 rules:
- ✅ Layout uses only flex/grid/gap/padding/margin/width
- ✅ No colors mixed in layout layer
- ✅ No typography mixed in layout layer
- ⚠️ Layer 2 (Layout) corrections required before Layer 3/4 work

---

*Report generated via /research + /audit workflow synthesis*
