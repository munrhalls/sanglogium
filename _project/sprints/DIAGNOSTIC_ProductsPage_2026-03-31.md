# Diagnostic Sprint: Products Page — Product Card Images
> Date: 2026-03-31
> Bugs diagnosed: 1
> Status: COMPLETE

---

## Step 0: System-First Verification

### 0.1 Design System Contract Check
| Check | Status | Finding |
|-------|--------|---------|
| Color tokens | ✓ | `surface-productImage` exists for placeholder backgrounds |
| Image domains | ✓ | `cdn.sanity.io` configured in `next.config.ts:17` |
| Image component | ✓ | `next/image` properly used with remotePatterns |

### 0.2 Data Source & Schema Contract Check

**Schema Verification** (`sanity/schemaTypes/productType.ts`):

| Field | Schema Type | Query Access | Valid? | Issue |
|-------|-------------|--------------|--------|-------|
| `image` | `image` (asset) | `image { asset { _ref } }` | ✓ | Correct |
| `brand` | `string` | `brand { _id, name }` | ❌ **CRITICAL** | Query uses ref syntax on string field |
| `slug` | `slug` | `slug { current }` | ✓ | Correct |
| `displayPrice` | `number` | direct | ✓ | Correct |

**Query-Schema Contract Mismatch Found:**
- **File:** `sanity/lib/products/getProductsByVfsKeys.ts:68-71`
- **Query:** `brand { _id, name }` (object traversal)
- **Schema:** `brand: { type: "string" }` (line 37, productType.ts)
- **Impact:** Brand will return `null` or malformed data

### 0.3 Global Configuration Check
| Check | Status | Finding |
|-------|--------|---------|
| Sanity client | ✓ | `useCdn: true`, `perspective: "published"` |
| Image URL builder | ✓ | `urlFor()` in `sanity/lib/image.ts:9-11` correct |
| VFS data integrity | ⚠️ | Known issues per VFS audit (not blocking images) |

### System-First Findings
| Check | Status | Finding | Risk Level |
|-------|--------|---------|------------|
| Design System | ✓ | No image-related token gaps | Low |
| Schema-Query Contract | ❌ | Brand field type mismatch | **HIGH** |
| Image Configuration | ✓ | All correctly configured | Low |

---

## Step 1: Bug Inventory

| ID | Symptom | Component | Severity |
|----|---------|-----------|----------|
| B-01 | Product images not rendering on products page | `ProductImage.tsx` | **High** |
| B-02 | Brand name not showing on product cards | `ProductCard.tsx` | Medium |

**Note:** B-02 is a **symptom** of the same root cause affecting B-01 (data structure mismatch).

---

## Step 2: Per-Bug Root Cause Analysis

### B-01: Product Images Not Rendering

**Code Path Traced:**
```
CategoryPage (RSC) 
  → getProductsByVfsKeys() [sanity/lib/products/getProductsByVfsKeys.ts:36]
    → sanityFetch() with GROQ query [lines 64-84]
      → Returns Product[] with image: { asset: { _ref } }
  → CategoryPageClient [CategoryPageClient.tsx:37]
    → ProductGrid [ProductGrid.tsx:19]
      → ProductCard [ProductCard.tsx:19]
        → ProductImage [ProductImage.tsx:15]
          → urlFor(image).width(400).height(300).url() [line 34]
            → next/image with src [line 39]
```

**Root Cause Analysis:**

The GROQ query correctly fetches image data:
```groq
image {
  asset {
    _ref
  }
}
```

The ProductImage component correctly processes it:
```typescript
const assetRef = image?.asset?._ref || image?.asset?._id;
const imageUrl = urlFor(imageSource).width(400).height(300).url();
```

**However, there is a schema-query mismatch in the SAME query that may cause the entire query to fail or return malformed data:**

```typescript
// getProductsByVfsKeys.ts lines 64-84
return sanityFetch({
  query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}] ${orderClause} {
    _id,
    name,
    brand {           // <-- OBJECT TRAVERSAL on STRING field
      _id,
      name
    },
    displayPrice,
    image {           // <-- This is correct
      asset {
        _ref
      }
    },
    slug {
      current
    },
    catalogueLocationKeys
  }`,
  params: { keys }
});
```

**File:Line:** `sanity/lib/products/getProductsByVfsKeys.ts:68-71`

**Evidence Collection:**
- [ ] Console error: **NEED VERIFICATION** — Add `console.log(products)` after fetch
- [ ] Network status: 200 (query executes)
- [ ] Query response structure: **NEED VERIFICATION** — Check if `image` field exists
- [ ] Schema match: **MISMATCH FOUND** — Brand uses ref syntax on string field

**Query-Schema Contract:**
- ❌ **MISMATCH:** Query uses `brand { _id, name }` but schema defines `brand` as `type: "string"`
- This causes Sanity to return `null` for brand, and may affect the entire query response structure

**Dependency Analysis:**
- Depends on: Sanity query returning correct data structure
- Blocks: Product card rendering, brand display

---

### B-02: Brand Name Not Showing (SYMPTOM of B-01)

**Symptom:** Brand name badge missing from product cards  
**Root Cause:** Same as B-01 — brand field query-schema mismatch

**File:Line:** `sanity/lib/products/getProductsByVfsKeys.ts:68-71`

**Evidence:**
- Test mock uses `brand: { _id: 'brand-1', name: 'Sennheiser' }` (object)
- Schema defines `brand: { type: "string" }` (string)
- Query fetches `brand { _id, name }` (expects object)

This is a **confirmed contract violation**.

---

## Step 3: Cross-Bug Analysis

## Cross-Bug Dependency Matrix

| Bug | Root Cause File | Is Primary? | Is Symptom Of | Blocks |
|-----|-----------------|-------------|---------------|--------|
| B-01 | `getProductsByVfsKeys.ts:68-71` | **Yes** | — | B-02 |
| B-02 | `getProductsByVfsKeys.ts:68-71` | No | B-01 | — |

**Analysis:**
Both bugs stem from the **same root cause**: The GROQ query at lines 68-71 treats `brand` as a reference/object field when the schema defines it as a string. This causes:
1. Brand data to be `null` (B-02)
2. Potentially malformed query responses affecting the entire product object, including image data (B-01)

---

## Step 4: Fix Sequencing

## Recommended Fix Order

1. **B-01** — Fix GROQ query brand field access — **PRIMARY**
   - Fixes: B-02 (symptom)
   - Change: `brand { _id, name }` → `brand` (direct string access)
   - Risk: Low

---

## Step 5: Risk Assessment

## Risk Matrix: What Breaks If We Fix This?

| Bug | Fix Location | Files Touched | Regression Risk | Design System Impact |
|-----|--------------|---------------|-----------------|----------------------|
| B-01 | `getProductsByVfsKeys.ts` | 1 | **Low** | None |

**Impact Analysis:**
- **ProductCard.tsx** — Needs to handle `brand` as string instead of object
- **CategoryPageClient.tsx** — Line 65: `product.brand?.name` needs to change to `product.brand`
- **Test mocks** — Tests use object brand structure, need updating

**Files requiring updates:**
1. `sanity/lib/products/getProductsByVfsKeys.ts` — Fix query
2. `app/components/features/products/ProductCard.tsx` — Handle string brand
3. `app/(store)/products/[...slug]/CategoryPageClient.tsx` — Handle string brand
4. `tests/products/getProductsByVfsKeys.test.ts` — Update test assertions
5. `app/components/features/products/__tests__/integration.test.tsx` — Update mock data

---

## Step 6: Test Requirements

## Missing Test Coverage

| Bug | Test Type | Test Location | What It Checks |
|-----|-----------|---------------|----------------|
| B-01 | Integration | `tests/products/query-schema-contract.test.ts` | GROQ field access matches schema type |
| B-01 | Unit | `sanity/lib/products/getProductsByVfsKeys.test.ts` | Brand returns string, not object |

**Verification Commands:**
```bash
# Run existing tests to see current failures
npm test -- tests/products/getProductsByVfsKeys.test.ts

# Check if brand data is null in actual query
node -e "
const { getProductsByVfsKeys } = require('./sanity/lib/products/getProductsByVfsKeys');
getProductsByVfsKeys({ keys: ['o7c6baiuobsr7ni2y2vf22sh'] })
  .then(products => console.log('Brand sample:', products[0]?.brand))
  .catch(console.error);
"
```

---

## Summary

### Primary Root Cause
**File:** `sanity/lib/products/getProductsByVfsKeys.ts:68-71`  
**Issue:** Query uses `brand { _id, name }` (reference traversal) but schema defines `brand` as `type: "string"`  
**Fix:** Change query to fetch `brand` directly (as string), update all consumers

### Secondary Issue
ProductImage.tsx and image configuration are **correctly implemented**. The image issue is likely a **symptom** of the query-schema contract violation causing malformed responses.

### Verification Required
1. Add `console.log(products[0])` to verify actual query response structure
2. Confirm brand field returns `null` or wrong structure
3. Confirm fixing brand query resolves image rendering

### Estimated Fix Effort
- **2-3 files** need brand handling updates
- **2-3 test files** need mock data updates
- **1 query fix** in getProductsByVfsKeys.ts

---

## Fix Implementation Sketch

```typescript
// getProductsByVfsKeys.ts - Change from:
brand {
  _id,
  name
}

// To:
brand
```

```typescript
// ProductCard.tsx - Change from:
product.brand?.name

// To:
product.brand
```

```typescript
// CategoryPageClient.tsx - Change from:
product.brand?.name === filter.value

// To:
product.brand === filter.value
```
