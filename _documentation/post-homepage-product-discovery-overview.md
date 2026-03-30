# Post-Homepage Product Discovery — Overview

## What This Is

Product discovery beyond the homepage: category pages, search results, and product detail views that users navigate to via the catalogue.

**Current state:** Navigation works but links lead to 404s.  
**Target state:** Click any category → see correct products.

---

## Scope Delineation

### IN SCOPE (This Initiative)
- Category listing pages (`/shop/[...slug]`)
- Product grid with correct items per category
- Basic navigation: click category → see products

### OUT OF SCOPE (Future Work)
- Search functionality
- Filters and faceting
- Product detail pages
- Pagination
- Sorting
- Related products

---

## The Data Flow

```
User clicks "Open-Back" in navigation
         ↓
Navigate to /shop/headphones/open-back
         ↓
Server Component parses URL → extracts slug "open-back"
         ↓
resolveSlugToId("open-back") → "o7c6baiuobsr7ni2y2vf22sh"
         ↓
unrollDescendantKeys(nodeId) → ["o7c6baiuobsr7ni2y2vf22sh"]
         ↓
getProductsByVfsKeys(["o7c6..."]) → GROQ query
         ↓
Sanity returns products with matching catalogueLocationKeys
         ↓
Render ProductGrid with products
```

---

## Current State Assessment

| Component | Status | Notes |
|-----------|--------|-------|
| VFS pre-built index | ✅ Working | `data/catalogue-index.json` validated by 63 tests |
| `resolveSlugToId()` | ✅ Working | Maps slugs to slot IDs |
| `unrollDescendantKeys()` | ✅ Working | Returns descendant IDs |
| Navigation rendering | ✅ Working | Links generate but 404 |
| `getProductsByVfsKeys()` | ❌ **MISSING** | Core function does not exist |
| Category pages | ❌ **MISSING** | No `/shop/[...slug]/page.tsx` |
| Product grid component | ❌ **MISSING** | No UI exists |

---

## Target State (Definition of Done)

1. **URL `/shop/headphones/open-back` returns 7 products**
2. **URL `/shop/headphones/closed-back` returns 31 products**
3. **URL `/shop/audio-electronics/dac-amp-combos` returns 22 products**
4. **Navigation links no longer 404**
5. **Visual coherence with homepage established**

---

## The 5-Phase Approach

| Phase | Purpose | Deliverable |
|-------|---------|-------------|
| **0. Foundation** | Verify foundation works | Tests pass, 3 URLs documented |
| **1. Data Contract** | Make data flow end-to-end | JSON-only page returns correct products |
| **2. Skeleton UI** | Build structural components | Responsive grid, zero styling |
| **3. Data Integration** | Connect data to skeleton | Real products render in grid |
| **4. Design Coherence** | Apply homepage patterns | Visual consistency achieved |

Each phase LOCKED before next begins.

---

## Key Files (Pre-Existing)

| File | Purpose |
|------|---------|
| `data/catalogue-index.json` | VFS index with slot IDs and tree |
| `data/catalogue.ts` | VFS functions: `resolveSlugToId`, `unrollDescendantKeys` |
| `sanity/schemaTypes/productType.ts` | Product schema with `catalogueLocationKeys` |
| `tests/catalogue/vfs.test.ts` | 63 tests validating VFS |

---

## Files to Create (Missing)

| File | Purpose |
|------|---------|
| `sanity/lib/products/getProductsByVfsKeys.ts` | Fetch products by slot IDs |
| `app/(store)/shop/[...slug]/page.tsx` | Category listing page |
| `app/components/features/products/ProductGrid.tsx` | Product grid presentation |
| `app/components/features/products/ProductCard.tsx` | Individual product card |

---

## Verification Checkpoints

1. **Foundation verified:** `npx vitest run tests/catalogue/vfs.test.ts` passes
2. **Data contract verified:** 3 manual URL tests return correct counts
3. **Skeleton verified:** Renders at mobile/tablet/desktop
4. **Integration verified:** All Phase 1 URLs render with real data
5. **Design verified:** Screenshots match homepage patterns

---

## Related Documentation

- `catalogue-architecture.md` — How catalogue connects to product discovery
- `_handbook/04-systems/catalogue-vfs.md` — VFS system deep dive (to be created)
- `audit-reports/FRONTEND_VFS_CONSUMPTION_AUDIT.md` — Current state audit
