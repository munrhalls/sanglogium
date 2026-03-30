# Sprint 1: Foundation + Data Layer

## Sprint Metadata

| Field | Value |
|-------|-------|
| **Sprint ID** | S1-FOUNDATION-DATA |
| **Layers** | L1 Foundation + L2 Data |
| **Estimated Time** | 4-6 hours |
| **Status** | READY FOR AI IMPLEMENTATION |
| **Dependencies** | None — this is first sprint |

---

## Scope Contract

### IN SCOPE (Must Implement)

**L1 Foundation:**
- [ ] Fix `scripts/build-catalogue-index.mjs` to populate `slotMetadataMap` for ALL tree nodes
- [ ] Ensure `unrollDescendantKeys()` returns only valid IDs
- [ ] Create `tests/catalogue/vfs.foundation.test.ts` with 3 tests
- [ ] All VFS tests must pass

**L2 Data:**
- [ ] Create `sanity/lib/products/getProductsByVfsKeys.ts`
- [ ] Create `sanity/lib/products/getCategoryMetadata.ts`
- [ ] Create test files for both functions
- [ ] 3 manual URL verifications working

### OUT OF SCOPE (Explicitly Forbidden)

- ❌ ANY UI components
- ❌ ANY styling
- ❌ ANY Next.js pages
- ❌ ANY filters or sorting
- ❌ ANY product detail pages
- ❌ Changes to existing homepage
- ❌ Shadcn/ui or external components

---

## Files to Create/Modify

### Modify (Fix Existing)

**File:** `scripts/build-catalogue-index.mjs`
```
Current Issue: slotMetadataMap missing intermediate node IDs
Fix: Ensure all nodes from tree structure are added to slotMetadataMap
```

### Create (New Implementation)

**Test Files:**
```
tests/catalogue/vfs.foundation.test.ts    # L1 tests
tests/products/getProductsByVfsKeys.test.ts  # L2-01, L2-02
tests/products/getCategoryMetadata.test.ts    # L2-03
```

**Implementation Files:**
```
sanity/lib/products/getProductsByVfsKeys.ts      # Core product fetcher
sanity/lib/products/getCategoryMetadata.ts       # Category metadata fetcher
```

---

## Test Specifications (Copy-Paste Ready)

### Test File 1: tests/catalogue/vfs.foundation.test.ts

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import catalogueIndex from '@/data/catalogue-index.json';

/**
 * Helper: Extract all node IDs from tree structure
 */
function extractAllNodeIds(tree: any[]): string[] {
  const ids: string[] = [];

  function traverse(nodes: any[]) {
    for (const node of nodes) {
      ids.push(node.id);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }

  traverse(tree);
  return ids;
}

describe('L1 Foundation: VFS Data Integrity', () => {

  it('L1-01: All leaf slugs resolve to IDs', () => {
    const leafSlugs = ['open-back', 'closed-back', 'dac-amp-combos'];
    leafSlugs.forEach(slug => {
      const id = resolveSlugToId(slug);
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id?.length).toBeGreaterThan(0);
    });
  });

  it('L1-02: All tree node IDs exist in slotMetadataMap', () => {
    const allNodeIds = extractAllNodeIds(catalogueIndex.tree);
    expect(allNodeIds.length).toBeGreaterThan(0);

    allNodeIds.forEach(id => {
      expect(
        catalogueIndex.slotMetadataMap[id],
        `Node ID ${id} missing from slotMetadataMap`
      ).toBeDefined();
    });
  });

  it('L1-03: Descendant keys are valid slot IDs', () => {
    // Headphones root ID
    const headphonesKey = 'ugyeto8653n495dpf89nzoar';
    const descendants = unrollDescendantKeys(headphonesKey);

    expect(descendants.length).toBeGreaterThan(0);

    descendants.forEach(id => {
      expect(
        catalogueIndex.slotMetadataMap[id],
        `Descendant ID ${id} from unrollDescendantKeys() missing from slotMetadataMap`
      ).toBeDefined();
    });
  });

  it('L1-04: Known test slugs resolve correctly', () => {
    // These are our 3 test cases
    const testCases = [
      { slug: 'open-back', expectedId: 'o7c6baiuobsr7ni2y2vf22sh' },
      { slug: 'closed-back', expectedId: 'yq3p9s798zszjkzm5btnebjh' },
      { slug: 'dac-amp-combos', expectedId: 'o37u0yjphzt3qu91ewnww2yj' },
    ];

    testCases.forEach(({ slug, expectedId }) => {
      const actualId = resolveSlugToId(slug);
      expect(actualId).toBe(expectedId);
    });
  });

});
```

### Test File 2: tests/products/getProductsByVfsKeys.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { getProductsByVfsKeys } from '@/sanity/lib/products/getProductsByVfsKeys';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';

describe('L2 Data: getProductsByVfsKeys', () => {

  it('L2-01: Returns products for single leaf key', async () => {
    const key = 'o7c6baiuobsr7ni2y2vf22sh'; // open-back
    const products = await getProductsByVfsKeys([key]);

    // Should return at least 7 products per truth table
    expect(products.length).toBeGreaterThanOrEqual(7);

    // Each product should have the key in catalogueLocationKeys
    products.forEach(product => {
      expect(product.catalogueLocationKeys).toContain(key);
    });
  });

  it('L2-02: Returns products for parent category (all descendants)', async () => {
    const headphonesKey = 'ugyeto8653n495dpf89nzoar';
    const descendantKeys = unrollDescendantKeys(headphonesKey);

    // Should include all headphone subcategories
    expect(descendantKeys.length).toBeGreaterThan(1);

    const products = await getProductsByVfsKeys(descendantKeys);

    // Should return products from multiple subcategories
    expect(products.length).toBeGreaterThanOrEqual(38);

    // Each product should have at least one key from descendants
    products.forEach(product => {
      const hasValidKey = product.catalogueLocationKeys.some(
        key => descendantKeys.includes(key)
      );
      expect(hasValidKey).toBe(true);
    });
  });

  it('L2-03: Returns empty array for invalid keys', async () => {
    const products = await getProductsByVfsKeys(['invalid-key-123']);
    expect(products).toEqual([]);
  });

  it('L2-04: Returns correct product fields', async () => {
    const key = 'o7c6baiuobsr7ni2y2vf22sh';
    const products = await getProductsByVfsKeys([key]);

    if (products.length > 0) {
      const product = products[0];
      expect(product._id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.brand).toBeDefined();
      expect(product.displayPrice).toBeDefined();
      expect(product.image).toBeDefined();
      expect(product.slug).toBeDefined();
    }
  });

});
```

### Test File 3: tests/products/getCategoryMetadata.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { getCategoryMetadata } from '@/sanity/lib/products/getCategoryMetadata';

describe('L2 Data: getCategoryMetadata', () => {

  it('L2-05: Returns metadata for open-back category', async () => {
    const metadata = await getCategoryMetadata('o7c6baiuobsr7ni2y2vf22sh');

    expect(metadata).toBeDefined();
    expect(metadata.name).toBe('Open-Back');
    expect(metadata.slug).toBe('open-back');
    expect(metadata.parentId).toBeDefined();
    expect(metadata.type).toBe('link');
  });

  it('L2-06: Returns metadata with breadcrumb path', async () => {
    const metadata = await getCategoryMetadata('o7c6baiuobsr7ni2y2vf22sh');

    expect(metadata.breadcrumb).toBeDefined();
    expect(metadata.breadcrumb.length).toBeGreaterThan(0);
    expect(metadata.breadcrumb[0].label).toBe('Headphones');
  });

  it('L2-07: Returns null for invalid category key', async () => {
    const metadata = await getCategoryMetadata('invalid-key-123');
    expect(metadata).toBeNull();
  });

});
```

---

## Implementation Specifications (For AI)

### Implementation 1: scripts/build-catalogue-index.mjs (FIX)

**Problem:** `slotMetadataMap` only contains leaf nodes, missing intermediate headers.

**Solution:** After building the tree, traverse it and ensure EVERY node ID is in `slotMetadataMap`.

```javascript
// At end of build script, before writing JSON:

function validateAndPopulateMetadataMap(tree, metadataMap) {
  const allNodeIds = new Set();

  function traverse(node) {
    allNodeIds.add(node.id);
    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  tree.forEach(traverse);

  // Ensure every ID from tree is in metadata map
  allNodeIds.forEach(id => {
    if (!metadataMap[id]) {
      // Create minimal metadata entry from tree node
      const node = findNodeById(tree, id);
      metadataMap[id] = {
        id: node.id,
        title: node.title,
        type: node.type,
        path: node.path,
        slug: node.slug,
        sortOrder: node.sortOrder,
        icon: node.icon,
      };
    }
  });

  return metadataMap;
}
```

---

### Implementation 2: sanity/lib/products/getProductsByVfsKeys.ts

**Requirements:**
- Accept array of slot IDs
- Return products where `catalogueLocationKeys` contains ANY of the provided IDs
- Use Sanity GROQ
- Cache with React `cache()`

```typescript
import { sanityFetch } from '@/sanity/lib/client';
import { cache } from 'react';
import groq from 'groq';

export interface Product {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
  };
  displayPrice: number;
  image: any;
  slug: {
    current: string;
  };
  catalogueLocationKeys: string[];
}

export const getProductsByVfsKeys = cache(async (keys: string[]): Promise<Product[]> => {
  if (!keys.length) {
    return [];
  }

  return sanityFetch({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] {
      _id,
      name,
      brand {
        _id,
        name
      },
      displayPrice,
      image,
      slug {
        current
      },
      catalogueLocationKeys
    }`,
    params: { keys }
  });
});
```

---

### Implementation 3: sanity/lib/products/getCategoryMetadata.ts

**Requirements:**
- Accept single slot ID
- Return category name, slug, parent ID, breadcrumb
- Use VFS data (not CMS query — this is fast lookup)

```typescript
import { cache } from 'react';
import catalogueIndex from '@/data/catalogue-index.json';

export interface CategoryMetadata {
  id: string;
  name: string;
  slug: string | null;
  type: 'header' | 'link';
  parentId: string | null;
  breadcrumb: Array<{ label: string; href: string }>;
}

export const getCategoryMetadata = cache(async (key: string): Promise<CategoryMetadata | null> => {
  const metadata = catalogueIndex.slotMetadataMap[key];

  if (!metadata) {
    return null;
  }

  // Build breadcrumb from path
  const breadcrumb = buildBreadcrumbFromPath(metadata.path);

  // Find parent ID from tree structure
  const parentId = findParentId(key, catalogueIndex.tree);

  return {
    id: metadata.id,
    name: metadata.title,
    slug: metadata.slug,
    type: metadata.type,
    parentId,
    breadcrumb,
  };
});

function buildBreadcrumbFromPath(path: string): Array<{ label: string; href: string }> {
  // Parse path like "/headphones/by-design/open-back"
  // Return breadcrumb segments
  const segments = path.split('/').filter(Boolean);
  return segments.map((segment, index) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
    href: '/shop/' + segments.slice(0, index + 1).join('/'),
  }));
}

function findParentId(nodeId: string, tree: any[]): string | null {
  // Traverse tree to find parent of nodeId
  for (const node of tree) {
    if (node.children?.some((child: any) => child.id === nodeId)) {
      return node.id;
    }
    if (node.children) {
      const found = findParentId(nodeId, node.children);
      if (found) return found;
    }
  }
  return null;
}
```

---

## DoD Checklist

### Pre-Implementation
- [ ] Run existing VFS tests: `npx vitest run tests/catalogue/vfs.test.ts`
- [ ] Note current test failures
- [ ] Document baseline

### Implementation Phase
- [ ] Fix `build-catalogue-index.mjs` to populate all node IDs
- [ ] Regenerate `catalogue-index.json`
- [ ] Create test files (3 files)
- [ ] Create implementation files (2 files)

### Verification Phase
- [ ] Run L1 tests: `npx vitest run tests/catalogue/vfs.foundation.test.ts`
  - [ ] L1-01: PASS
  - [ ] L1-02: PASS
  - [ ] L1-03: PASS
  - [ ] L1-04: PASS
- [ ] Run L2 tests: `npx vitest run tests/products/getProductsByVfsKeys.test.ts`
  - [ ] L2-01: PASS (7+ products for open-back)
  - [ ] L2-02: PASS (38+ products for headphones)
  - [ ] L2-03: PASS (empty array for invalid)
  - [ ] L2-04: PASS (correct fields)
- [ ] Run L2 tests: `npx vitest run tests/products/getCategoryMetadata.test.ts`
  - [ ] L2-05: PASS
  - [ ] L2-06: PASS
  - [ ] L2-07: PASS

### Manual Verification (User Sign-off)
- [ ] `resolveSlugToId('open-back')` returns `o7c6baiuobsr7ni2y2vf22sh`
- [ ] `resolveSlugToId('closed-back')` returns `yq3p9s798zszjkzm5btnebjh`
- [ ] `resolveSlugToId('dac-amp-combos')` returns `o37u0yjphzt3qu91ewnww2yj`
- [ ] `getProductsByVfsKeys(['o7c6baiuobsr7ni2y2vf22sh'])` returns 7+ products
- [ ] `getProductsByVfsKeys(['yq3p9s798zszjkzm5btnebjh'])` returns 31+ products
- [ ] `getCategoryMetadata('o7c6baiuobsr7ni2y2vf22sh')` returns correct name

### Lockdown
- [ ] All automated tests passing
- [ ] Manual verification completed
- [ ] User sign-off comment in this file: `LOCKED [date] — User: [name]`

---

## AI Implementation Prompt

```
Implement Sprint 1: Foundation + Data Layer

Context:
- Next.js 15 with App Router
- Server Components default
- Sanity CMS for data
- VFS (Virtual File System) pre-built catalogue index

Your Task:
1. Fix scripts/build-catalogue-index.mjs to ensure all tree node IDs are in slotMetadataMap
2. Create 3 test files per specifications provided
3. Create 2 implementation files per specifications provided
4. Ensure all tests pass

Constraints:
- NO UI components
- NO styling
- NO pages
- Server Components only (except where noted)
- Use groq for Sanity queries
- Use React cache() for data functions

Deliverables:
- Modified: scripts/build-catalogue-index.mjs
- Created: tests/catalogue/vfs.foundation.test.ts
- Created: tests/products/getProductsByVfsKeys.test.ts
- Created: tests/products/getCategoryMetadata.test.ts
- Created: sanity/lib/products/getProductsByVfsKeys.ts
- Created: sanity/lib/products/getCategoryMetadata.ts

Run tests and provide output showing all tests pass.
```

---

## Next Sprint Trigger

**Sprint 2 is UNLOCKED when:**
1. This sprint reaches LOCKED status (all DoD items checked)
2. User verifies manual test cases
3. User comments sign-off in this file

**Sprint 2 Scope:** L3 Routes + L4 Skeleton (Next.js pages + UI structure)
