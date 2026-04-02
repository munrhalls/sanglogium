# Audit: Breadcrumbs & Product Hierarchy Architecture

## Audit Scope
- **Feature**: Product hierarchy navigation with full breadcrumb support
- **Target State**: Home → Products → Category → Sub-Category → Product navigation
- **Focus Area**: VFS architecture, route structure, breadcrumb generation
- **Date:** 2026-04-02

---

## 1. End-State Delineation

### Target URL Structure
```
/                                    # Home
/products                            # All products (paginated)
/products/headphones                 # Category: all headphones
/products/headphones/open-back      # Sub-category: open-back headphones
/product/sennheiser-hd-560s         # Product detail
```

### Target Breadcrumb Structure
```
Home → Products → headphones → open-back → Sennheiser HD 560S
```

### Target Architecture
```
VFS Functions → Route Handlers → Page Components → Breadcrumb Component
```

---

## 2. Spatial Architecture

### Navigation Flow Groups
| Group | Entry | Actions | Exit |
|-------|-------|---------|------|
| Browse All | `/products` | View all products, filter, paginate | Category page |
| Browse Category | `/products/[category]` | View category products | Sub-category page |
| Browse Sub-Category | `/products/[category]/[sub]` | View sub-category products | Product detail |
| Product Detail | `/product/[slug]` | View product, add to cart | Cart/Checkout |

### Component Hierarchy
```
App Layout
├── Header (existing)
├── CatalogueNavbar (existing)
├── Main Content
│   ├── ProductsPage (NEW - all products)
│   ├── CategoryPage (NEW - category products)
│   ├── SubCategoryPage (NEW - sub-category products)
│   └── ProductPage (existing - needs breadcrumb fix)
└── Footer (existing)
```

---

## 3. Gap Analysis (Current vs Target)

| ID | Component | Current State | Target State | Severity |
|----|-----------|---------------|--------------|----------|
| G1 | **Products Route** | ❌ `/products` doesn't exist | ✅ Shows all products paginated | CRITICAL |
| G2 | **Category Routes** | ❌ `/products/[category]` doesn't exist | ✅ Shows category products | CRITICAL |
| G3 | **Sub-Category Routes** | ❌ `/products/[category]/[sub]` doesn't exist | ✅ Shows sub-category products | CRITICAL |
| G4 | **Breadcrumb Logic** | ❌ Hard-coded: Home → Products → Product | ✅ Dynamic: full hierarchy | HIGH |
| G5 | **VFS Root Query** | ❌ No function for all catalogue IDs | ✅ `getAllCatalogueIds()` | HIGH |
| G6 | **Breadcrumb Generator** | ❌ No path generation function | ✅ `getBreadcrumbPath()` | HIGH |
| G7 | **VFS Data Integrity** | ❌ Broken subtree queries | ✅ Fixed slotMetadataMap | CRITICAL |

---

## 4. VFS Architecture Requirements

### Missing Functions

| Function | Purpose | Current Status | Implementation |
|----------|---------|----------------|----------------|
| `getAllCatalogueIds()` | Get all catalogue IDs for `/products` | ❌ Missing | ✅ Simple - extract all keys |
| `getSubtreeIdsBySlug()` | Get subtree IDs for category pages | ❌ Missing | ✅ Medium - slug → ID → unroll |
| `getBreadcrumbPath()` | Generate full breadcrumb path | ❌ Missing | ❌ Complex - tree walking |
| `findNodePath()` | Walk tree to find parent path | ❌ Missing | ❌ Complex - recursive |

### Existing Functions (Usable)
| Function | Status | Notes |
|----------|--------|-------|
| `getCatalogue()` | ✅ Working | Tree structure access |
| `resolveSlugToId()` | ✅ Working | Slug → ID mapping |
| `unrollDescendantKeys()` | ⚠️ Broken | Depends on slotMetadataMap |
| `getProductsByVfsKeys()` | ✅ Working | Product queries by IDs |

---

## 5. Route Structure Analysis

### Current Routes
```
✅ /                           # Homepage
✅ /product/[slug]             # Product detail
❌ /products                   # MISSING
❌ /products/[category]        # MISSING  
❌ /products/[category]/[sub]  # MISSING
```

### Required Routes
```
app/(store)/products/page.tsx              # NEW - all products
app/(store)/products/[category]/page.tsx    # NEW - category view
app/(store)/products/[category]/[sub]/page.tsx  # NEW - sub-category view
app/(store)/product/[slug]/page.tsx        # EXISTING - breadcrumb fix needed
```

---

## 6. Data Flow Analysis

### Target Data Flow for `/products/headphones`
```
1. Route: /products/headphones
2. Extract: category = "headphones"
3. VFS: getSubtreeIdsBySlug("headphones")
4. Query: getProductsByVfsKeys({ keys: subtreeIds })
5. Render: CategoryPage component
6. Breadcrumbs: getBreadcrumbPath() for navigation
```

### Target Data Flow for Product Breadcrumbs
```
1. Route: /product/sennheiser-hd-560s
2. Extract: slug = "sennheiser-hd-560s"
3. VFS: getBreadcrumbPath("sennheiser-hd-560s")
4. Render: Breadcrumb component
5. Result: Home → Products → headphones → open-back → Product
```

---

## 7. Critical Dependencies

### VFS Data Integrity (BLOCKING)
- **Issue**: `slotMetadataMap` missing intermediate nodes
- **Impact**: Subtree queries return invalid IDs
- **Fix Required**: Build script consistency fix
- **Status**: CRITICAL - must fix before implementation

### Tree Walking Complexity
- **Issue**: No parent references in VFS structure
- **Impact**: Breadcrumb generation requires full tree traversal
- **Solution**: Implement recursive tree walker
- **Status**: HIGH - complex but solvable

---

## 8. Implementation Strategy

### Phase 1: Fix VFS Foundation
1. Fix `slotMetadataMap` generation in build script
2. Add validation for tree consistency
3. Test subtree queries work correctly

### Phase 2: Add VFS Functions
1. `getAllCatalogueIds()` - Simple extraction
2. `getSubtreeIdsBySlug()` - Slug resolution + unroll
3. `getBreadcrumbPath()` - Tree walking implementation

### Phase 3: Add Routes
1. `/products` page with all products
2. `/products/[category]` page with category products  
3. `/products/[category]/[sub]` page with sub-category products

### Phase 4: Fix Breadcrumbs
1. Update product page breadcrumb logic
2. Add breadcrumb component to new pages
3. Test full hierarchy navigation

---

## 9. Risk Assessment

### High Risk
- **VFS Data Corruption**: Current audit shows broken functionality
- **Tree Walking Performance**: Complex recursive operations on large trees
- **Slug Resolution Edge Cases**: Missing slugs, duplicate slugs

### Medium Risk
- **Cache Invalidation**: New functions need proper cache invalidation
- **Route Conflicts**: Dynamic routes might conflict with existing routes

### Low Risk
- **Function Implementation**: Straightforward extensions of existing patterns
- **Component Creation**: Standard React/Next.js components

---

## 10. Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `data/catalogue.ts` | VFS changes break existing functions | Add comprehensive tests |
| `data/catalogue/cache.ts` | New cache functions needed | Follow existing patterns |
| `app/(store)/product/[slug]/page.tsx` | Breadcrumb logic changes | Preserve existing SEO |
| `sanity/lib/products/getProductsByVfsKeys.ts` | Dependency on VFS functions | Test with real data |

---

## 11. Verification Commands

### VFS Function Tests
```bash
# Test new VFS functions
npm run test:vfs-functions

# Test catalogue data integrity  
npm run test:catalogue-integrity
```

### Route Tests
```bash
# Test new routes exist
npx playwright test tests/routes/products.spec.ts

# Test breadcrumb accuracy
npx playwright test tests/components/breadcrumbs.spec.ts
```

### Integration Tests
```bash
# Full navigation flow
npx playwright test tests/e2e/product-hierarchy.spec.ts

# Performance tests
npm run test:performance -- vfs-queries
```

---

## 12. Success Criteria

| Criteria | Target | Verification |
|----------|--------|--------------|
| Products Page | Shows all products paginated | Manual + automated test |
| Category Pages | Show correct category products | VFS query verification |
| Breadcrumbs | Full hierarchy on all pages | Visual + automated test |
| VFS Functions | All new functions work | Unit tests |
| Performance | Queries under 100ms | Performance benchmark |

---

## 13. Final Audit Results

### Overall Audit Score: C+ (Critical Issues Present)

| Area | Score | Status |
|------|-------|--------|
| Architecture | B- | Good foundation, missing pieces |
| Data Integrity | F | Critical VFS issues blocking |
| Route Structure | D | Missing 3 critical routes |
| Breadcrumb Logic | F | Hard-coded, not dynamic |
| Implementation Feasibility | B+ | Solvable once VFS fixed |

### Summary
The architecture has a **solid foundation** but is **blocked by critical VFS data integrity issues**. The missing routes and breadcrumb logic are straightforward to implement, but **cannot work until the VFS subtree queries are fixed**.

### Recommendation
**PHASED APPROACH REQUIRED**:
1. **Phase 1 (CRITICAL)**: Fix VFS data integrity issues
2. **Phase 2 (HIGH)**: Implement missing VFS functions  
3. **Phase 3 (MEDIUM)**: Add missing routes
4. **Phase 4 (LOW)**: Fix breadcrumb logic

**Do not proceed with implementation until VFS issues are resolved.** The foundation must be solid before building on top of it.

---

## Audit Timestamp
**Audited:** 2026-04-02
**Auditor:** Architecture Audit System
**Status:** BLOCKED - Critical VFS Issues Must Be Fixed First
