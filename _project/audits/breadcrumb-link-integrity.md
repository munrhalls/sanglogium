# Audit: Breadcrumb Link Integrity

## 1. End-State Delineation

### Current State (Broken)
```
ProductPage (/products/[slug])
├── Breadcrumb nav
│   ├── Home (/) ✅ Works
│   ├── Products (/products/headphones) ❌ 404
│   └── Product Name (current)
```

### Target State
```
ProductPage (/products/[slug])
├── Breadcrumb nav
│   ├── Home (/) ✅ Works
│   ├── Products (/products) OR (/products/valid-category) ✅ 200
│   └── Product Name (current)
```

---

## 2. Gap Analysis (G-XX)

| ID | Location | Current | Target | Severity |
|----|----------|---------|--------|----------|
| G-01 | `product/[slug]/page.tsx:39` | Hardcoded `/products/headphones` | Dynamic category path from product | **Critical** |
| G-02 | VFS slugToIdMap | Headers have no slug mapping | Either add mapping or use leaf paths | **Critical** |
| G-03 | Breadcrumb test | No HTTP validation for Products link | Test validates all breadcrumb segments | **High** |

---

## 3. Root Cause Analysis

**Why `/products/headphones` 404s:**
1. VFS `slugToIdMap` only maps **leaf nodes** (e.g., "open-back", "closed-back")
2. Header nodes like "headphones" have **no slug mapping** (by design — not directly navigable)
3. Breadcrumb hardcodes `/products/headphones` assuming it exists
4. `resolveSlugToId('headphones')` returns `null` → 404

**Why test fails to find locator:**
1. PDP itself 404s because `sennheiser-hd-569-headphones` product isn't rendering
2. Dev server cache issues (ENOENT errors seen earlier)

---

## 4. Files at Risk

| File | Risk | Mitigation |
|------|------|------------|
| `product/[slug]/page.tsx` | Breadcrumb logic change | Keep Link component, update href only |
| `tests/utils/product-detail-helpers.ts` | TEST_PRODUCT may need update | Use product with valid category path |
| Category page routing | May need to handle header routes | Consider redirect or dedicated page |

---

## 5. RWD Strategy

No RWD impact — breadcrumb structure same across breakpoints.

---

## 6. Verification Commands

```bash
# Test breadcrumb link
npx playwright test tests/e2e/product-detail/link-integrity.spec.ts --grep "breadcrumb Products"

# Validate VFS slug resolution
node -e "const {resolveSlugToId} = require('./data/catalogue/cache'); console.log('headphones:', resolveSlugToId('headphones'));"
```

---

## 7. Prioritized Fixes

### P0: Fix Breadcrumb Link (PDP Scope)
**Options:**
1. **Dynamic**: Use product's actual `categoryPath` to build breadcrumb
2. **Static**: Change to `/products` (if that route exists)
3. **Remove**: Remove Products segment, keep only Home → Product

### P1: Fix Test Infrastructure
- Ensure dev server stable (clear .next cache)
- Use product slug that renders correctly

### P2: VFS Enhancement (Future)
- Add header node slug mappings
- OR create redirect from `/products/headphones` to `/products` or first child

---

## 8. Decision Required

**Question for user:** Should breadcrumb "Products" link to:
- A) `/products` (main shop page) — Simple, always works
- B) Product's actual category (e.g., `/products/headphones/open-back`) — Accurate but longer
- C) Remove Products segment entirely — Minimalist

**Default recommendation:** Option A (`/products`) — simplest, always valid.
