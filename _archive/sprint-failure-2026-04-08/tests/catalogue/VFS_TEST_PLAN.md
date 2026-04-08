# VFS & Catalogue Test Suite Plan

## Overview

Systematic Vitest-based testing suite for catalogue and VFS functionality, ensuring data integrity across the entire product resolution pipeline.

**Location**: `tests/catalogue/vfs.test.ts`
**Runner**: Vitest with TypeScript
**Data Sources**: 
- `data/catalogue-index.json` (pre-computed VFS)
- `data/catalogue.ts` (VFS functions)
- Sanity CMS (live product data via GROQ)

---

## Test Architecture

### 1. PURE FUNCTIONS TEST SUITE (No external dependencies)

#### Test Group: `catalogue-index.json Structure Validation`

| Test ID | Name | Purpose | Validation Logic |
|---------|------|---------|------------------|
| IDX-01 | Schema completeness | Verify all required fields exist | Assert `generatedAt`, `slugToIdMap`, `slotMetadataMap`, `tree` present |
| IDX-02 | Slug-to-ID bijection | Each slug maps to exactly one ID | Assert `Object.values(slugToIdMap)` has no duplicates |
| IDX-03 | Metadata map coverage | Every tree node has metadata | Assert all `_key` values in tree exist in `slotMetadataMap` |
| IDX-04 | Children reference validity | All child references resolve | Assert every child ID in `slotMetadataMap[node].children` exists as a key in `slotMetadataMap` |
| IDX-05 | Leaf node identification | Link types have no children | Assert `type: "link"` nodes have empty `children` array |
| IDX-06 | Header node structure | Header types have children | Assert `type: "header"` nodes with children have valid child references |

#### Test Group: `VFS Function Unit Tests`

| Test ID | Name | Function Under Test | Test Cases |
|---------|------|---------------------|------------|
| FNS-01 | `resolveSlugToId` - valid slug | `resolveSlugToId(slug)` | Known slug returns correct ID |
| FNS-02 | `resolveSlugToId` - invalid slug | `resolveSlugToId(slug)` | Unknown slug returns `undefined` |
| FNS-03 | `resolveSlugToId` - case sensitivity | `resolveSlugToId(slug)` | Slug matching is case-sensitive |
| FNS-04 | `unrollDescendantKeys` - leaf node | `unrollDescendantKeys(id)` | Leaf node returns array containing only itself |
| FNS-05 | `unrollDescendantKeys` - parent with 1 level | `unrollDescendantKeys(id)` | Parent returns itself + direct children |
| FNS-06 | `unrollDescendantKeys` - parent with 2 levels | `unrollDescendantKeys(id)` | Grandparent returns all descendants + itself |
| FNS-07 | `unrollDescendantKeys` - unknown ID | `unrollDescendantKeys(id)` | Unknown ID treated as leaf (returns `[id]`) |
| FNS-08 | `unrollDescendantKeys` - no duplicates | `unrollDescendantKeys(id)` | Result contains no duplicate IDs |
| FNS-09 | `getCatalogue` - validation pass | `getCatalogue()` | Valid index returns tree array |
| FNS-10 | `buildGroqKeysParam` - passthrough | `buildGroqKeysParam(keys)` | Returns input array unchanged |

---

### 2. CATALOGUE NODE RESOLUTION TEST SUITE

#### Test Group: `Node ID → Leaf Node Resolution`

**Purpose**: Verify that any catalogue node ID (parent or leaf) resolves to correct set of leaf node IDs.

| Test ID | Node Type | Test Scenario | Expected Result |
|---------|-----------|---------------|---------------|
| NODE-01 | Leaf (link) | `open-back` slot | Returns `["o7c6baiuobsr7ni2y2vf22sh"]` |
| NODE-02 | Header (1 level) | `by-design` header | Returns `["o7c6baiuobsr7ni2y2vf22sh", "yq3p9s798zszjkzm5btnebjh", "dW7bkxuW7lwltD3OAxQ9yH"]` |
| NODE-03 | Root header | `headphones` root | Returns all headphone leaf IDs (6 slots) |
| NODE-04 | Header (2 levels) | `audio-electronics` root | Returns all audio electronics leaf IDs (8 slots) |
| NODE-05 | Header (3 levels) | `accessories` root | Returns all accessories leaf IDs (8 slots) |
| NODE-06 | Cross-category parent | `amplification` header | Returns 3 leaf IDs: desktop-amps, portable-amps, bluetooth-dac-amps |

**Validation Logic**:
```typescript
const leafIds = unrollDescendantKeys(nodeId);
// Assert: No duplicates
// Assert: All IDs are leaf nodes (type: "link" in slotMetadataMap)
// Assert: Leaf count matches expected from catalogue-truth-table.json
```

---

### 3. PRODUCT RESOLUTION TEST SUITE (Live CMS Queries)

#### Test Group: `Leaf Node → Product Resolution`

**Purpose**: Verify each catalogue leaf node returns expected products via `catalogueLocationKeys` GROQ query.

| Test ID | Leaf Node | Expected Products Source | Validation |
|---------|-----------|-------------------------|------------|
| PROD-01 | `adapters` | `catalogue-truth-table.json` | 3 products: AudioQuest Cinnamon, Forest, DragonTail |
| PROD-02 | `headphone-cables` | `catalogue-truth-table.json` | 12 products: All Meze, 64 Audio, Aune cables |
| PROD-03 | `interconnects` | `catalogue-truth-table.json` | 2 products: JL Audio, AudioQuest Pearl |
| PROD-04 | `desktop-amps` | `catalogue-truth-table.json` | 25 products: iFi, Burson, SPL, Topping amps |
| PROD-05 | `portable-amps` | `catalogue-truth-table.json` | 3 products: iFi Valkyrie, Woo WA8, AQ Cobalt |
| PROD-06 | `dac-amp-combos` | `catalogue-truth-table.json` | 25 products: iFi, Violectric, Topping combos |
| PROD-07 | `standalone-dacs` | `catalogue-truth-table.json` | 14 products: Chord, Burson, SMSL DACs |
| PROD-08 | `network-streamers` | `catalogue-truth-table.json` | 14 products: Eversolo, Matrix, Bluesound |
| PROD-09 | `usb-c-dacs` | `catalogue-truth-table.json` | 4 products: iFi hip-dac 3, Zen DAC 3, GO bar, Violectric Chronos |
| PROD-10 | `open-back` | `catalogue-truth-table.json` | 10 products: Sennheiser HD 600, 650, 800 S, etc. |
| PROD-11 | `closed-back` | `catalogue-truth-table.json` | 34 products: Focal, Sony, Audeze closed-back |
| PROD-12 | `planar-magnetic` | `catalogue-truth-table.json` | 17 products: HIFIMAN, Audeze planars |
| PROD-13 | `dynamic` | `catalogue-truth-table.json` | 47 products: Sennheiser, Focal, Meze dynamic |
| PROD-14 | `monitors-iems` | `catalogue-truth-table.json` | 42 products: Sony, Bose, Sennheiser IEMs |

**GROQ Query Pattern**:
```groq
*[_type == "product" && "LEAF_NODE_ID" in catalogueLocationKeys]{_id, name}
```

**Validation Logic**:
```typescript
const expectedProducts = truthTable.leafNodes[path].products;
const actualProducts = await sanityFetch(groqQuery);
// Assert: actualProducts.length === expectedProducts.length
// Assert: Every expected product ID exists in actualProducts
// Assert: No unexpected products (orphan detection)
```

---

### 4. PARENT NODE PRODUCT AGGREGATION TEST SUITE

#### Test Group: `Parent Node → Products Aggregation`

**Purpose**: Verify parent nodes correctly aggregate products from all descendant leaf nodes.

| Test ID | Parent Node | Descendant Leaves | Expected Product Count | Validation |
|---------|-------------|-------------------|------------------------|------------|
| PAGG-01 | `by-design` | open-back, closed-back, semi-open | 10 + 34 + 2 = 46 | Sum of descendant leaf products |
| PAGG-02 | `by-driver` | planar-magnetic, dynamic, electrostatic | 17 + 47 + 0 = 64 | Sum of descendant leaf products |
| PAGG-03 | `in-ear-monitors` | monitors-iems | 42 | Direct child = same as leaf |
| PAGG-04 | `headphones` | All 6 headphone leaves | 46 + 64 + 42 = 152 | Full category aggregation |
| PAGG-05 | `amplification` | desktop-amps, portable-amps, bluetooth-dac-amps | 25 + 3 + 2 = 30 | Electronics sub-category |
| PAGG-06 | `digital-sources` | standalone-dacs, dac-amp-combos, usb-c-dacs, daps, streamers | 14 + 25 + 4 + 0 + 14 = 57 | Multiple leaf aggregation |
| PAGG-07 | `audio-electronics` | All 8 electronics leaves | 30 + 57 = 87 | Full electronics aggregation |
| PAGG-08 | `connectivity` | headphone-cables, interconnects, adapters | 12 + 2 + 3 = 17 | Accessories sub-category |
| PAGG-09 | `fit-comfort` | earpads, eartips, care-cleaning | 0 + 0 + 0 = 0 | Empty category (edge case) |
| PAGG-10 | `storage` | headphone-stands, carrying-cases | 2 + 0 = 2 | Mixed populated/empty |
| PAGG-11 | `accessories` | All 8 accessories leaves | 17 + 0 + 2 = 19 | Full accessories aggregation |

**Test Logic**:
```typescript
// Step 1: Get all leaf node IDs from parent
const leafIds = unrollDescendantKeys(parentId).filter(id => isLeafNode(id));

// Step 2: Build GROQ with all leaf IDs
const query = groq`*[_type == "product" && count(catalogueLocationKeys[@ in ${JSON.stringify(leafIds)}]) > 0]{_id}`;

// Step 3: Fetch products
const aggregatedProducts = await sanityFetch(query);

// Step 4: Validate count equals sum of individual leaf queries
const individualCounts = await Promise.all(
  leafIds.map(id => sanityFetch(groq`*[_type == "product" && "${id}" in catalogueLocationKeys]{_id}`))
);
const expectedCount = individualCounts.reduce((sum, products) => sum + products.length, 0);

// Assert: aggregatedProducts.length === expectedCount
// Assert: No duplicates in aggregatedProducts
// Assert: Product union correctly handled (products in multiple leaves appear once)
```

---

### 5. PRE-COMPUTED INDEX VALIDATION TEST SUITE

#### Test Group: `catalogue-index.json Consistency`

**Purpose**: Verify pre-computed `catalogue-index.json` correctly represents catalogue structure.

| Test ID | Test Name | Validation |
|---------|-----------|------------|
| PRE-01 | `slugToIdMap` ↔ `tree` alignment | Every slug in `tree` leaf nodes exists in `slugToIdMap` with matching ID |
| PRE-02 | `slotMetadataMap` ↔ `tree` alignment | Every `_key` in tree exists in `slotMetadataMap` |
| PRE-03 | `slotMetadataMap.children` ↔ `tree.children` alignment | Child arrays match between metadata and tree |
| PRE-04 | Leaf count consistency | Number of `type: "link"` nodes equals `slugToIdMap` entry count |
| PRE-05 | Generated date freshness | `generatedAt` is within 7 days of test run |
| PRE-06 | Root category completeness | `tree` contains exactly: Headphones, Audio Electronics, Accessories |
| PRE-07 | No orphaned metadata | Every key in `slotMetadataMap` exists in `tree` |
| PRE-08 | No circular references | `unrollDescendantKeys` terminates for all node IDs |

---

### 6. END-TO-END RESOLUTION TEST SUITE

#### Test Group: `URL Path → Products Pipeline`

**Purpose**: Full integration test from user-facing URL to resolved products.

| Test ID | URL Path | Slug | Node ID | Descendant IDs | Expected Products |
|---------|----------|------|---------|----------------|-------------------|
| E2E-01 | `/products/headphones/open-back` | `open-back` | `o7c6baiuobsr7ni2y2vf22sh` | 1 leaf | 10 products |
| E2E-02 | `/products/headphones` | `headphones` | `ugyeto8653n495dpf89nzoar` | 6 leaves | 152 products |
| E2E-03 | `/products/audio-electronics/amplification` | `amplification` (needs slug mapping) | `hqb22ca5czb252r0r7l1xmet` | 3 leaves | 30 products |
| E2E-04 | `/products/audio-electronics` | `audio-electronics` | `ti2wufd15h51jxtq855ogbfa` | 8 leaves | 87 products |
| E2E-05 | `/products/accessories/connectivity/adapters` | `adapters` | `jdxde1qpftseepekaivzpl8c` | 1 leaf | 3 products |
| E2E-06 | `/products/accessories` | `accessories` | `j9ozs17mc0b1nv2gqn2rvmg1` | 8 leaves | 19 products |

**Test Flow**:
```typescript
const slug = extractSlugFromUrl(url);
const nodeId = resolveSlugToId(slug);
const descendantIds = unrollDescendantKeys(nodeId);
const leafIds = descendantIds.filter(isLeafNode);
const products = await sanityFetch(buildGroqQuery(leafIds));
// Assert: products.length matches expected
// Assert: All returned products have valid catalogueLocationKeys
```

---

## Test Data Sources

### Source of Truth Files

| File | Purpose | Loading Method |
|------|---------|----------------|
| `data/catalogue-index.json` | Pre-computed VFS | `fs.readFileSync` → JSON.parse |
| `data/catalogue.ts` | VFS functions | ES module import |
| `_temporary/catalogue-mapping/catalogue-truth-table.json` | Expected product mappings | `fs.readFileSync` → JSON.parse |
| Sanity CMS | Live product data | `sanityFetch()` with GROQ |

### Test Fixtures (Static)

```typescript
// tests/catalogue/fixtures/expected-products.ts
export const expectedLeafNodeProducts: Record<string, string[]> = {
  "jdxde1qpftseepekaivzpl8c": ["Y7l1IhzX2fnyiano58Gmxj", "Y7l1IhzX2fnyiano58GsCK", "moXlkADK7m1DHgGwWxMnjQ"],
  "vnrj2n32p172vcje1tt3s4ls": [/* 12 cable product IDs */],
  // ... all leaf nodes
};

export const expectedParentNodeAggregation: Record<string, { leaves: string[]; totalCount: number }> = {
  "ekv4twh175wcse4fl4jjdxfq": { 
    leaves: ["o7c6baiuobsr7ni2y2vf22sh", "yq3p9s798zszjkzm5btnebjh", "dW7bkxuW7lwltD3OAxQ9yH"],
    totalCount: 46
  },
  // ... all parent nodes
};
```

---

## Implementation Structure

### File: `tests/catalogue/vfs.test.ts`

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { 
  resolveSlugToId, 
  unrollDescendantKeys, 
  getCatalogue,
  buildGroqKeysParam 
} from "../../data/catalogue";
import { sanityFetch } from "../../sanity/lib/client";
import groq from "groq";

// Load test fixtures
const catalogueIndex = JSON.parse(readFileSync(join(process.cwd(), "data/catalogue-index.json"), "utf-8"));
const truthTable = JSON.parse(readFileSync(join(process.cwd(), "_temporary/catalogue-mapping/catalogue-truth-table.json"), "utf-8"));

describe("VFS & Catalogue Test Suite", () => {
  
  describe("1. catalogue-index.json Structure Validation", () => {
    // IDX-01 through IDX-08
  });
  
  describe("2. VFS Function Unit Tests", () => {
    // FNS-01 through FNS-10
  });
  
  describe("3. Node ID → Leaf Node Resolution", () => {
    // NODE-01 through NODE-06
  });
  
  describe("4. Leaf Node → Product Resolution", () => {
    // PROD-01 through PROD-14
  });
  
  describe("5. Parent Node → Products Aggregation", () => {
    // PAGG-01 through PAGG-11
  });
  
  describe("6. catalogue-index.json Consistency", () => {
    // PRE-01 through PRE-08
  });
  
  describe("7. E2E URL Path → Products Pipeline", () => {
    // E2E-01 through E2E-06
  });
  
});
```

---

## Validation of Plan

### Logic Validation Per Test Requirement

| User Requirement | Plan Coverage | Validation |
|------------------|---------------|------------|
| "Each catalogue node ID returns proper subtree of nodes → leaf node IDs" | Tests NODE-01 to NODE-06 | ✅ `unrollDescendantKeys` tested for all node types with verified expected outputs |
| "Each catalogue leaf node ID returns proper set of expected product IDs via GROQ" | Tests PROD-01 to PROD-14 | ✅ Direct GROQ queries with `catalogueLocationKeys` matching against `catalogue-truth-table.json` |
| "Each catalogue parent node ID → leaf node IDs → resolves to proper set of expected products" | Tests PAGG-01 to PAGG-11 | ✅ Parent unrolling + aggregation validation against sum of individual leaf queries |
| "catalogue-index.json for pre-computed catalogue resolution → proper products per leaf node ID" | Tests PRE-01 to PRE-08, PROD suite | ✅ Validates JSON structure + product resolution via index-derived queries |
| "catalogue-index.json for pre-computed catalogue resolution → proper products per parent node ID" | Tests PRE suite + PAGG suite | ✅ Validates index structure supports correct parent→descendant resolution |

### Data Flow Coverage

```
User Click → Slug → Node ID → Descendant IDs → Leaf IDs → GROQ → Products
     │          │       │           │            │         │        │
     │          │       │           │            │         │        └─ ✅ PROD suite validates
     │          │       │           │            │         └─ ✅ E2E suite validates
     │          │       │           │            └─ ✅ NODE suite validates
     │          │       │           └─ ✅ NODE suite validates
     │          │       └─ ✅ FNS suite validates
     │          └─ ✅ FNS suite validates
     └─ ✅ E2E suite validates
```

### Edge Cases Covered

| Edge Case | Test Coverage |
|-----------|---------------|
| Empty categories (no products) | PAGG-09 (fit-comfort) |
| Leaf nodes (no children) | FNS-04, NODE-01 |
| Multi-level hierarchies (2-3 levels) | NODE-02 through NODE-05 |
| Products in multiple categories | PAGG suite union logic |
| Unknown/invalid IDs | FNS-07 |
| Circular reference prevention | PRE-08 |
| Orphaned metadata detection | PRE-07 |
| Missing slug mappings | FNS-02 |

---

## Execution Commands

```bash
# Run full VFS test suite
npx vitest run tests/catalogue/vfs.test.ts

# Run with verbose output
npx vitest run tests/catalogue/vfs.test.ts --reporter=verbose

# Run specific test group
npx vitest run tests/catalogue/vfs.test.ts -t "Leaf Node → Product Resolution"

# Watch mode during development
npx vitest tests/catalogue/vfs.test.ts --watch

# Run without CMS queries (pure function tests only)
npx vitest run tests/catalogue/vfs.test.ts -t "VFS Function Unit Tests"
```

---

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test coverage | 100% of VFS functions | All exported functions from `data/catalogue.ts` tested |
| Assertion count | 200+ assertions | Each test has ≥2 specific assertions |
| CMS query tests | All leaf nodes (25) | Every leaf node has verified product resolution |
| Parent aggregation | All parent nodes (11) | Every parent node has verified product aggregation |
| Execution time | <30 seconds | Full suite completes within timeout |
| Failure rate | 0% | All tests pass against current data |

---

## Maintenance Notes

### When to Update Tests

1. **Catalogue structure changes** → Update `expectedLeafNodeProducts` fixture
2. **New leaf nodes added** → Add corresponding PROD-XX test
3. **New parent headers added** → Add corresponding PAGG-XX test
4. **Product reassignments** → Update `catalogue-truth-table.json` and regenerate fixtures
5. **VFS function changes** → Update FNS test group

### Test Data Refresh Script

```typescript
// scripts/refresh-vfs-test-fixtures.ts
// Generates expected-products.ts from catalogue-truth-table.json
```

---

*Plan Version: 1.0*
*Prepared: 2026-03-30*
*Status: Ready for Implementation*
