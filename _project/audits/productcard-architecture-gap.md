# Audit: ProductCard Architecture Gap

**Date:** 2026-04-02  
**Component:** `ProductCard.tsx`  
**Severity:** HIGH — Architecture violation (mixing Server/Client concerns)

---

## Executive Summary

ProductCard is **inappropriately mixing display and interactivity concerns**. It contains a cart button with an `onClick` handler, forcing the entire card to be a Client Component when it should be a pure display (Server) Component.

### The Problem
| Aspect | Current State | Target State |
|--------|---------------|--------------|
| **Component Type** | Client Component (with "use client") | Server Component (pure display) |
| **Responsibility** | Display + Cart interaction | Display only |
| **Architecture** | Mixed concerns | Separated concerns |

---

## Gap Analysis (G-XX)

### G-01: Cart Button Mixed Into Display Component
**Location:** `ProductCard.tsx` lines 50-61  
**Current:**
```tsx
<button
  className="btn-cart"
  aria-label={`Add ${product.name} to cart`}
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    // Cart functionality to be implemented
  }}
>
  <ShoppingCart size={18} weight="regular" />
  <span className="text-cap font-bold">Add</span>
</button>
```

**Issues:**
1. `onClick` handler forces `"use client"` directive
2. Handler is empty (cart not implemented) - dead code
3. Mixes display (Server) and interactivity (Client) concerns
4. Entire ProductCard tree becomes Client Component unnecessarily

**Target State:**
- ProductCard is pure display (Server Component)
- Cart button extracted to separate Client Component (when implemented)

---

### G-02: Architectural Inconsistency
**Evidence:** Homepage `Featured.tsx` has its own `FeaturedCard` that:
- Does NOT use ProductCard
- Has similar cart button (lines 60-67) but WITHOUT onClick
- Can remain Server Component

This inconsistency shows ProductCard's cart button is architecturally misplaced.

---

### G-03: Component Boundary Violation
**Chain:**
```
SearchPage (Server)
  → SearchResults (Server) 
    → ProductGrid (Server)
      → ProductCard (FORCED Client by onClick) ← VIOLATION
```

The error we encountered:
```
⨯ Error: Event handlers cannot be passed to Client Component props.
```

This error exists BECAUSE ProductCard tries to be Client inside a Server chain, when it should be Server throughout.

---

## RWD Strategy

| Component | Desktop | Mobile | Implementation |
|-----------|---------|--------|----------------|
| ProductCard | Grid item | Grid item | Server Component |
| CartButton | Inside card | Inside card | Separate Client Component (future) |

---

## Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `ProductCard.tsx` | Removing onClick changes behavior | Verify no cart functionality expected yet |
| `ProductGrid.tsx` | Uses ProductCard | No changes needed |
| `SearchResults.tsx` | Uses ProductGrid | No changes needed |
| Homepage components | May reference ProductCard | Check for usage |

---

## Verification Commands

```bash
# Pre-fix: Verify current state causes Server/Client error
npm run build  # Build passes but runtime error occurs

# Post-fix: Verify pure display component works
npm run build  # Build passes
# Manual: Visit /search?q=test - no console errors
```

---

## Decision Matrix

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **A. Remove cart button** | Pure Server Component; no dead code | Loses "Add to cart" UI placeholder | ✅ **RECOMMENDED** |
| **B. Extract AddToCartButton** | Clean separation; proper architecture | More complex; cart not implemented yet | Good for future |
| **C. Keep "use client"** | Quick fix; maintains UI | Wrong architecture; unnecessary client JS | ❌ Not recommended |

---

## Root Cause

The ProductCard was given a cart button with an empty `onClick` handler as a "placeholder for future cart functionality." This:
1. Forces the component to be Client-side
2. Adds unnecessary JavaScript to the bundle
3. Violates the principle: **Display components should be Server Components**
4. Causes the Server/Client boundary error we encountered

**The Fix:** Remove the cart button until cart functionality is actually implemented. ProductCard should be a pure display component.

---

## Audit Verdict

**CRITICAL ARCHITECTURE GAP:** ProductCard violates Server/Client Component boundaries by mixing display and interactivity concerns.

**Recommended Action:** Remove the cart button (with empty onClick) to restore ProductCard as a pure Server Component.

---

*Audit Complete — Ready for /implement phase*
