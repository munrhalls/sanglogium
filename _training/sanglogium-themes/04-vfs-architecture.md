# Theme 04: Virtual File System (VFS) Architecture

## SangLogium Context
The VFS is the crown jewel of SangLogium's architecture. It replaces expensive recursive database queries with O(1) path-based lookups. Category moves automatically cascade to all associated products. This is graph theory applied to e-commerce navigation.

**Critical Files:**
- `data/catalogue.ts` — VFS runtime API (resolveSlugToId, unrollDescendantKeys)
- `scripts/build-catalogue-index.mjs` — Build-time VFS generator
- `data/catalogue-index.json` — Generated VFS data structure
- `app/(store)/products/[...category]/page.tsx` — VFS consumer
- `sanity/lib/products/getProductsByVfsKeys.ts` — VFS + GROQ integration

---

## Layer 1: Foundations Examination

### Diagnostic Assessment (20 minutes)

Answer these without looking at code. Binary pass/fail.

#### VFS Core Concepts
- [ ] What problem does VFS solve that recursive queries don't?
- [ ] What is the time complexity of VFS lookups? Traditional recursive queries?
- [ ] What three data structures make up the VFS index?
- [ ] What is "path-based prefix matching"?
- [ ] Why does moving a category require zero subsequent updates?

#### Data Structures
- [ ] What does `slugToIdMap` map?
- [ ] What does `slotMetadataMap` contain?
- [ ] What is the `tree` structure for?
- [ ] How does `unrollDescendantKeys` work?
- [ ] What happens if a key in `slotMetadataMap` references children not in the map?

#### Build Process
- [ ] When does the VFS rebuild?
- [ ] What Sanity data feeds into VFS generation?
- [ ] How does the build script handle parent-child relationships?
- [ ] What validation runs during the build?
- [ ] What happens if VFS build fails during deployment?

#### GROQ Integration
- [ ] How are VFS keys used in GROQ queries?
- [ ] What GROQ operator checks array overlap?
- [ ] Why is the VFS query pattern `count(catalogueLocationKeys[@ in $keys]) > 0`?
- [ ] What are the tradeoffs of VFS vs direct parent references?

---

## Layer 1: Comprehensive Curriculum

### Module 1: The Problem VFS Solves

**Traditional Approach (The Problem):**
```typescript
// Recursive database query for category subtree
async function getProductsInCategory(categoryId: string) {
  // 1. Fetch category
  // 2. Fetch all children (1 query)
  // 3. For each child, fetch their children (N queries)
  // 4. Flatten the tree
  // 5. Query products where category in flattened list
  // Total: O(N) queries, 1-2 seconds latency
}
```

**VFS Approach (The Solution):**
```typescript
// O(1) lookup from pre-computed index
const categoryId = slugToIdMap["headphones/open-back"];
const allKeys = unrollDescendantKeys(categoryId); // O(N) but on JSON, not DB
const products = await queryWithKeys(allKeys); // Single GROQ query
// Total: Constant time navigation + 1 database query
```

**Key Insight:**
- Pre-compute the tree traversal at build time
- Store flattened descendant lists in JSON
- Query time becomes simple array lookup

---

### Module 2: VFS Data Structures Deep Dive

**Structure 1: slugToIdMap**
```typescript
{
  "headphones": "abc123",
  "headphones/open-back": "def456",
  "headphones/open-back/sennheiser": "ghi789"
}
```
- Maps URL paths to Sanity document IDs
- Enables reverse lookup: given URL, find category
- Used in `resolveSlugToId(slug: string)`

**Structure 2: slotMetadataMap**
```typescript
{
  "abc123": {
    title: "Headphones",
    url: "#", // headers don't link
    slug: "",
    breadcrumbs: [],
    children: ["def456", "jkl012"], // child IDs
    type: "header"
  },
  "def456": {
    title: "Open Back",
    url: "/shop/headphones/open-back",
    slug: "open-back",
    breadcrumbs: [
      { label: "Headphones", url: "/shop/headphones" }
    ],
    children: ["ghi789"],
    type: "link"
  }
}
```
- Contains metadata for every node in the tree
- Enables subtree traversal via `children` arrays
- Breadcrumbs pre-computed for each node

**Structure 3: tree**
```typescript
[
  {
    _key: "abc123",
    _type: "catalogueItem",
    title: "Headphones",
    type: "header",
    children: [
      {
        _key: "def456",
        title: "Open Back",
        type: "link",
        slug: { current: "open-back" },
        children: [...]
      }
    ]
  }
]
```
- Recursive structure for UI rendering
- Mirrors Sanity's hierarchical data
- Used for navigation menu rendering

---

### Module 3: Algorithm Implementation

**unrollDescendantKeys (The Core Algorithm):**
```typescript
export const unrollDescendantKeys = (nodeId: string): string[] => {
  const data = catalogueIndex as CatalogueIndexData;
  const slotMetadataMap = data.slotMetadataMap;

  if (!slotMetadataMap[nodeId]) {
    return [];
  }

  const result = new Set<string>();
  const stack = [nodeId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    if (result.has(currentId)) continue;

    result.add(currentId);
    const children = slotMetadataMap[currentId]?.children || [];
    stack.push(...children);
  }

  return Array.from(result);
};
```

**Key Characteristics:**
- Iterative (not recursive) to avoid stack overflow
- DFS traversal using stack
- Returns Set as Array (all unique descendants)
- Handles cycles gracefully (via Set check)

**Complexity Analysis:**
- Time: O(N) where N = number of descendants
- Space: O(N) for the stack and result set
- Note: N is small (tree depth < 5, width < 20)

---

### Module 4: Build Script Architecture

**Build Process Flow:**
```mermaid
1. Fetch all catalogue items from Sanity
2. Build adjacency list (parent -> children)
3. Identify root nodes (no parent)
4. Reconstruct tree via DFS
5. Traverse tree to populate:
   - slugToIdMap (path -> ID)
   - slotMetadataMap (ID -> metadata)
6. Validate: all children exist in slotMetadataMap
7. Write to catalogue-index.json
```

**Validation Logic:**
```typescript
function validateSlotMetadataCompleteness(metadataMap) {
  const missingIds = new Set();
  
  for (const [nodeId, metadata] of Object.entries(metadataMap)) {
    for (const childId of metadata.children) {
      if (!metadataMap[childId]) {
        missingIds.add(childId);
      }
    }
  }
  
  if (missingIds.size > 0) {
    throw new Error(`Build failed: ${missingIds.size} missing IDs`);
  }
}
```

**Critical Bug Prevention:**
- Build fails if data is inconsistent
- Missing children break subtree queries
- Validation runs before deployment

---

## Layer 2: Integration Examination

### Integration Challenge 1: VFS + GROQ Product Query

**Scenario:** Build a complete category page using VFS

**Requirements:**
1. Accept category path from URL (`/products/headphones/open-back`)
2. Use VFS to resolve path to ID
3. Unroll all descendant keys (category + subcategories)
4. Query products matching any of those keys
5. Return products with proper typing

**Function Signature:**
```typescript
async function getProductsByCategoryPath(
  path: string[]
): Promise<Product[]> {
  // Your implementation
}
```

**Test Cases:**
- Path: `['headphones']` → Should include all headphones
- Path: `['headphones', 'open-back']` → Should include only open-back headphones
- Path: `['invalid-category']` → Should return empty array gracefully

**Verification:**
- [ ] Correctly resolves all test paths
- [ ] Returns products from all descendant categories
- [ ] Handles invalid paths gracefully
- [ ] Single GROQ query (no N+1)

---

### Integration Challenge 2: VFS Consistency Validation

**Scenario:** Build runtime validation for VFS integrity

**Requirements:**
1. Load catalogue-index.json
2. Verify all referenced children exist
3. Verify all slugs in slugToIdMap point to valid metadata
4. Check for orphaned nodes (in metadata but not in tree)
5. Report any inconsistencies with specific details

**Validation Report Format:**
```typescript
interface ValidationReport {
  valid: boolean;
  totalNodes: number;
  missingChildren: Array<{ parentId: string; missingChildId: string }>;
  orphanedNodes: string[];
  slugToIdConsistency: boolean;
}
```

**Success Criteria:**
- [ ] Detects missing child references
- [ ] Detects orphaned metadata entries
- [ ] Verifies slugToIdMap integrity
- [ ] Provides actionable error messages

---

## Layer 3: Systems Examination

### Systems Challenge: Category Move Without Updates

**Scenario:** "Headphones" category moves from root to under "Audio Equipment"

**Before:**
```
Root
├── Headphones
│   ├── Open Back
│   └── Closed Back
└── Audio Equipment
```

**After:**
```
Root
└── Audio Equipment
    └── Headphones
        ├── Open Back
        └── Closed Back
```

**Task:**
1. Explain why product queries continue to work without updates
2. Trace the path changes for a specific product
3. Verify the O(1) lookup claim holds
4. Document why this is superior to parent reference approach

**Key Insight:**
Products store `catalogueLocationKeys` array:
```typescript
// Before move
["headphones", "headphones/open-back", "headphones/open-back/sennheiser"]

// After move (product unchanged!)
["headphones", "headphones/open-back", "headphones/open-back/sennheiser"]
```

The VFS rebuild updates paths, but product keys remain valid because they're IDs, not paths.

---

## Stress Test Scenarios

### Scenario 1: VFS Data Corruption

**Given:**
- VFS build somehow created inconsistent data
- `slotMetadataMap["abc123"].children` includes `"xyz789"`
- `"xyz789"` does not exist in `slotMetadataMap`

**Symptom:**
```typescript
const keys = unrollDescendantKeys("abc123");
// Throws or returns incomplete data
```

**Debug & Fix:**
1. Identify root cause (build script bug)
2. Implement runtime fallback
3. Add monitoring for this condition
4. Fix build script validation

---

### Scenario 2: Performance Regression

**Symptom:** Category page loading slowly despite VFS

**Investigation:**
1. VFS lookup is fast (verified)
2. GROQ query is slow (found!)
3. Query: `*[_type == "product" && catalogueLocationKeys[@ in $keys]]`
4. Products have 500+ items, each with 3-5 keys

**Optimization:**
- Add index on `catalogueLocationKeys` field
- Consider denormalizing hot paths
- Cache query results at edge

---

## Quick Reference: VFS API

| Function | Purpose | Complexity |
|----------|---------|------------|
| `resolveSlugToId(slug)` | URL path → Sanity ID | O(1) |
| `unrollDescendantKeys(id)` | Get all descendant IDs | O(N) |
| `getCatalogue()` | Get tree for UI | O(1) |
| `validateCatalogueIndex(data)` | Runtime validation | O(N) |

---

## VFS vs Alternatives

| Approach | Query Complexity | Move Complexity | Implementation |
|----------|-----------------|-----------------|----------------|
| VFS | O(1) + 1 DB query | O(0) | Complex build, simple runtime |
| Parent References | O(N) queries | O(N) updates | Simple, slow |
| Materialized Paths | O(1) index | O(N) updates | Medium complexity |
| Closure Table | O(1) join | O(N) updates | Complex schema |

**VFS wins on:** Query speed AND zero-update moves

---

## Completion Checklist

- [ ] Can explain why VFS uses O(1) lookups
- [ ] Can trace VFS build process from Sanity to JSON
- [ ] Can implement `unrollDescendantKeys` algorithm
- [ ] Can debug VFS consistency issues
- [ ] Can integrate VFS with GROQ queries
- [ ] Can explain why category moves require zero updates
- [ ] Can evaluate alternatives (materialized paths, closure table)

---

*Next: Theme 05 — Finite State Machines (Order Management)*
