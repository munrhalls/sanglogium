# VFS End-to-End Audit Report

## Executive Summary

The VFS (Virtual File System) has **CRITICAL DATA CONSISTENCY BUGS** that prevent category clicks from correctly filtering products. The `slotMetadataMap` in `catalogue-index.json` is missing intermediate header nodes, breaking the category → products integration.

---

## Complete Data Path Analysis

### 1. Navigation Click Flow

```
User clicks "Open-Back" in catalogue
    ↓
DetailSection.tsx renders <a> tag (BUG: should be <Link>)
    ↓
Full page reload to /products/headphones/open-back
    ↓
[...category]/page.tsx receives params: { category: ["headphones", "open-back"] }
```

### 2. Slug Resolution Flow

```
page.tsx: const path = ["headphones", "open-back"]
    ↓
❌ BUG: const slug = path.join("/") → "headphones/open-back"
    ↓
data/catalogue.ts: resolveSlugToId("headphones/open-back")
    ↓
Looks up in slugToIdMap["headphones/open-back"] → undefined (NOT FOUND)
    ↓
slugToIdMap only contains LEAF slugs like "open-back", "closed-back"
```

**Root Cause**: `slugToIdMap` is designed for leaf-level resolution only, but code was using full path.

### 3. VFS Key Unrolling Flow

```
const resolvedId = null (from failed slug resolution)
    ↓
const catalogueKeys = resolvedId ? unrollDescendantKeys(resolvedId) : []
    ↓
catalogueKeys = [] (empty array due to null resolvedId)
    ↓
❌ BUG: getSelectedProducts([], ...) returns ALL products instead of NONE
```

### 4. slotMetadataMap Data Consistency Bug

**Location**: `scripts/build-catalogue-index.mjs:108`

```javascript
// BUG: Only adds to slotMetadataMap if hasChildren
if (hasChildren) {
  slotMetadataMap[node._id] = {
    id: node._id,
    children: childIds,
    hasChildren: true,
  };
}
```

**Problem**: Leaf nodes (links like "Open-Back", "Closed-Back") are NEVER added to `slotMetadataMap`.

**Impact**: `unrollDescendantKeys()` looks up leaf IDs in `slotMetadataMap` that don't exist.

**Example**:
```javascript
// Header "Headphones" (has children)
slotMetadataMap["ugyeto8653n495dpf89nzoar"] = {
  children: ["o7c6baiuobsr7ni2y2vf22sh", "ekv4twh175wcse4fl4jjdxfq", ...],
  hasChildren: true
}

// Link "Open-Back" (no children) - MISSING from slotMetadataMap!
// slotMetadataMap["o7c6baiuobsr7ni2y2vf22sh"] = undefined ❌
```

### 5. Product Query Flow

```
getSelectedProducts(catalogueKeys=[], ...)
    ↓
❌ BUG: if (!catalogueKeys || catalogueKeys.length === 0) 
         → No early return, continues to build query
    ↓
const pathQuery = catalogueKeys.length > 0 
  ? ` && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0` 
  : "";  // Empty string when keys empty!
    ↓
Query becomes: *[_type == "product"] (NO FILTER!)
    ↓
Returns ALL products in database ❌
```

---

## Bug Summary

| Bug | Location | Impact | Fix Status |
|-----|----------|--------|------------|
| 1. `<a>` tag causes full reload | DetailSection.tsx | Poor UX, slow navigation | ✅ Fixed |
| 2. Slug resolution uses path | page.tsx | "NOT FOUND" for all categories | ✅ Fixed |
| 3. Empty keys returns ALL products | getSelectedProducts.ts | Wrong products displayed | ✅ Fixed |
| 4. slotMetadataMap missing leaf nodes | build-catalogue-index.mjs | Breaks subtree queries | ❌ NOT FIXED |
| 5. unrollDescendantKeys fails silently | data/catalogue.ts | Empty keys passed downstream | ❌ NOT FIXED |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CATALOGUE NAVIGATION                          │
├─────────────────────────────────────────────────────────────────┤
│ DetailSection.tsx                                               │
│  • Renders navigation links                                      │
│  • Uses <a> tag (BUG #1) → Should use <Link>                   │
│  • URLs: /products/{root}/{leaf}                                 │
└──────────────────────────────────┬──────────────────────────────┘
                                   │ Click
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              [...category]/page.tsx                            │
├─────────────────────────────────────────────────────────────────┤
│ 1. Receives path = ["headphones", "open-back"]                 │
│ 2. ❌ BUG #2: slug = path.join("/") → "headphones/open-back"   │
│     Should be: slug = path[path.length-1] → "open-back"        │
│ 3. resolveSlugToId(slug) → null (NOT FOUND)                     │
│ 4. catalogueKeys = [] (empty)                                  │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              data/catalogue.ts                                   │
├─────────────────────────────────────────────────────────────────┤
│ resolveSlugToId(slug):                                         │
│   • Looks up slugToIdMap[slug]                                 │
│   • Only leaf slugs exist in map                               │
│   • Returns undefined for "headphones/open-back"               │
│                                                                │
│ unrollDescendantKeys(id):                                      │
│   • ❌ BUG #5: Fails silently if ID not in slotMetadataMap    │
│   • Should return [id] for leaf nodes                           │
│   • Currently returns [] because lookup fails                  │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│         sanity/lib/products/getSelectedProducts.ts             │
├─────────────────────────────────────────────────────────────────┤
│ ❌ BUG #3: Empty catalogueKeys returns ALL products            │
│   • No early return for empty keys                              │
│   • Query: *[_type == "product"] (no filter)                    │
│   • Should return { products: [], totalProductsCount: 0 }        │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTS DISPLAY                              │
├─────────────────────────────────────────────────────────────────┤
│ ❌ Shows ALL products instead of category-specific products    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Test Strategy for VFS Data Integrity

### Test Layer 1: Data Integrity Tests (catalogue-index.json)

```typescript
// tests/vfs/data-integrity.test.ts

describe("VFS Data Integrity", () => {
  it("should have all tree nodes in slotMetadataMap", () => {
    // Extract all IDs from tree structure
    const treeIds = extractAllIdsFromTree(catalogueIndex.tree);
    
    // Verify each ID exists in slotMetadataMap
    treeIds.forEach(id => {
      expect(catalogueIndex.slotMetadataMap[id]).toBeDefined();
    });
  });

  it("should have valid parent-child references", () => {
    // For each node with children
    Object.values(catalogueIndex.slotMetadataMap).forEach(node => {
      if (node.hasChildren) {
        node.children.forEach(childId => {
          // Each child must exist in slotMetadataMap
          expect(catalogueIndex.slotMetadataMap[childId]).toBeDefined();
        });
      }
    });
  });

  it("should have all leaf slugs in slugToIdMap", () => {
    // All links (type: "link") must have slug mappings
    const leafNodes = getAllLeafNodes(catalogueIndex.tree);
    leafNodes.forEach(node => {
      if (node.slug?.current) {
        expect(catalogueIndex.slugToIdMap[node.slug.current]).toBe(node._id);
      }
    });
  });
});
```

### Test Layer 2: Integration Tests (Full Data Path)

```typescript
// tests/integration/vfs-data-path.test.ts

describe("VFS Data Path Integration", () => {
  it("should resolve leaf slug to catalogue ID", () => {
    const testCases = [
      { slug: "open-back", expectedId: "o7c6baiuobsr7ni2y2vf22sh" },
      { slug: "closed-back", expectedId: "ekv4twh175wcse4fl4jjdxfq" },
    ];
    
    testCases.forEach(({ slug, expectedId }) => {
      const resolvedId = resolveSlugToId(slug);
      expect(resolvedId).toBe(expectedId);
    });
  });

  it("should unroll descendant keys for leaf nodes", () => {
    const leafId = "o7c6baiuobsr7ni2y2vf22sh"; // Open-Back
    const keys = unrollDescendantKeys(leafId);
    
    // Leaf node should return itself
    expect(keys).toContain(leafId);
    expect(keys.length).toBeGreaterThanOrEqual(1);
  });

  it("should return empty products for invalid category", async () => {
    const result = await getSelectedProducts([], [], [], { page: 1, pageSize: 12 });
    
    expect(result.products).toEqual([]);
    expect(result.totalProductsCount).toBe(0);
  });

  it("should return correct products for valid category", async () => {
    // Test end-to-end: slug → keys → products
    const slug = "open-back";
    const id = resolveSlugToId(slug);
    const keys = unrollDescendantKeys(id);
    const result = await getSelectedProducts(keys, [], [], { page: 1, pageSize: 12 });
    
    expect(result.products.length).toBeGreaterThan(0);
    // All products should have matching catalogueLocationKeys
    result.products.forEach(product => {
      const hasMatchingKey = product.catalogueLocationKeys?.some(
        key => keys.includes(key)
      );
      expect(hasMatchingKey).toBe(true);
    });
  });
});
```

### Test Layer 3: E2E Tests (User Journey)

```typescript
// tests/e2e/catalogue-navigation.spec.ts

describe("Catalogue Navigation E2E", () => {
  it("should navigate from homepage to category with correct products", async ({ page }) => {
    // 1. Visit homepage
    await page.goto("/");
    
    // 2. Click catalogue item
    await page.click('[data-testid="catalogue-link-open-back"]');
    
    // 3. Verify URL
    await expect(page).toHaveURL("/products/headphones/open-back");
    
    // 4. Verify products displayed match category
    const productNames = await page.locator('[data-testid="product-name"]').allTextContents();
    
    // All products should be open-back headphones
    // (This requires semantic validation or product categorization)
    expect(productNames.length).toBeGreaterThan(0);
  });

  it("should show no products for invalid category", async ({ page }) => {
    await page.goto("/products/nonexistent/invalid");
    
    await expect(page.locator("text=No products found")).toBeVisible();
  });
});
```

### Test Layer 4: Build Script Tests

```typescript
// tests/build/catalogue-index-generation.test.ts

describe("Catalogue Index Build Script", () => {
  it("should generate valid catalogue-index.json", () => {
    const index = require("@/data/catalogue-index.json");
    
    // Schema validation
    expect(index).toHaveProperty("slugToIdMap");
    expect(index).toHaveProperty("slotMetadataMap");
    expect(index).toHaveProperty("tree");
    
    // Data consistency
    expect(Object.keys(index.slugToIdMap).length).toBeGreaterThan(0);
    expect(Object.keys(index.slotMetadataMap).length).toBeGreaterThan(0);
    expect(index.tree.length).toBeGreaterThan(0);
  });

  it("should have no orphaned IDs in slotMetadataMap", () => {
    const allTreeIds = extractAllIds(index.tree);
    const metadataIds = Object.keys(index.slotMetadataMap);
    
    // Every tree ID must be in slotMetadataMap
    allTreeIds.forEach(id => {
      expect(metadataIds).toContain(id);
    });
  });
});
```

---

## Recommended Test Setup

### 1. Test Directory Structure

```
tests/
├── unit/
│   └── vfs/
│       ├── resolveSlugToId.test.ts
│       ├── unrollDescendantKeys.test.ts
│       └── data-integrity.test.ts
├── integration/
│   ├── vfs-data-path.test.ts
│   └── product-queries.test.ts
├── e2e/
│   └── catalogue-navigation.spec.ts
├── build/
│   └── catalogue-index-generation.test.ts
└── fixtures/
    └── mock-catalogue-index.json
```

### 2. Test Commands

```json
// package.json
{
  "scripts": {
    "test:vfs": "vitest run tests/unit/vfs",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test tests/e2e",
    "test:build": "vitest run tests/build",
    "test:all": "npm run test:vfs && npm run test:integration && npm run test:e2e"
  }
}
```

### 3. CI/CD Integration

```yaml
# .github/workflows/vfs-tests.yml
name: VFS Data Integrity Tests

on:
  push:
    paths:
      - "data/catalogue-index.json"
      - "data/catalogue.ts"
      - "scripts/build-catalogue-index.mjs"

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run VFS Data Integrity Tests
        run: |
          npm ci
          npm run test:vfs
          npm run test:integration
```

---

## Critical Fixes Required

### Fix #4: Build Script (CRITICAL)

```javascript
// scripts/build-catalogue-index.mjs

// BEFORE (BUG):
if (hasChildren) {
  slotMetadataMap[node._id] = {
    id: node._id,
    children: childIds,
    hasChildren: true,
  };
}

// AFTER (FIX):
// ALL nodes must be in slotMetadataMap
slotMetadataMap[node._id] = {
  id: node._id,
  children: childIds,
  hasChildren: hasChildren,
  // Add metadata for leaf nodes
  slug: node.slug?.current,
  type: node.type, // "header" or "link"
};
```

### Fix #5: unrollDescendantKeys (CRITICAL)

```typescript
// data/catalogue.ts

export function unrollDescendantKeys(rootId: string): string[] {
  const slot = slotMetadataMap[rootId];
  
  // BUG: Returns empty array if ID not found
  // if (!slot) return []; ❌
  
  // FIX: If ID not in map, assume it's a leaf node and return itself
  if (!slot) {
    console.warn(`[VFS] ID ${rootId} not in slotMetadataMap, treating as leaf`);
    return [rootId];
  }
  
  if (!slot.hasChildren) {
    return [rootId];
  }
  
  // Recursively collect all descendant keys
  const keys = [rootId];
  for (const childId of slot.children) {
    keys.push(...unrollDescendantKeys(childId));
  }
  
  return keys;
}
```

---

## Conclusion

The VFS has **3 fixed bugs** and **2 remaining critical bugs**:

### Fixed:
1. ✅ DetailSection.tsx navigation (now uses Link)
2. ✅ page.tsx slug resolution (now uses leaf slug)
3. ✅ getSelectedProducts empty keys guard

### Remaining:
4. ❌ **CRITICAL**: build-catalogue-index.mjs missing leaf nodes in slotMetadataMap
5. ❌ **CRITICAL**: unrollDescendantKeys fails silently for IDs not in slotMetadataMap

### Recommended Action:
1. Immediately fix bugs #4 and #5
2. Implement comprehensive test suite
3. Add CI/CD pipeline for VFS data integrity
4. Document VFS architecture for team

**Risk Assessment**: Without fixes #4 and #5, subtree queries and parent category navigation will continue to fail, causing incorrect or empty product listings.
