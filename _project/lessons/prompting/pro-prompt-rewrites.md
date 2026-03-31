# AI Leverage Maximizer Prompt Rewrites

## Scenario 1: Starting Sprint 1 (Foundation Data)

**Your Prompt:**
> "Create Sprint 1 specification document with 4-layer methodology, comprehensive test specifications per phase, scope contracts, and copy-paste ready test specs for VFS data integrity"

**Pro Rewrite:**
```
Create tests/catalogue/vfs.foundation.test.ts with 4 tests:
- L1-01: All leaf slugs resolve to IDs
- L1-02: All tree node IDs exist in slotMetadataMap  
- L1-03: Descendant keys are valid slot IDs
- L1-04: Known test slugs resolve correctly

Run immediately. Report failures.
```

**Difference:** 500-line markdown → 6 lines. Same coverage.

---

## Scenario 2: Locking L1 Foundation

**Your Prompt:**
> "L1-01: Purple debug border box appears with 'L1: Structure Pass' heading... L1 locked"

**Pro Rewrite:**
```
npx vitest run tests/catalogue/vfs.foundation.test.ts
```

**Difference:** Screenshot verification → binary pass/fail.

---

## Scenario 3: Sprint 2 (Routes + Data)

**Your Prompt:**
> "Create Sprint 2 spec with routes layer, skeleton layer, test specifications for each, DoD items, and E2E matrix"

**Pro Rewrite:**
```
Create app/(store)/shop/[...slug]/page.tsx:
- Resolve slug to ID via resolveSlugToId()
- Fetch products via getProductsByVfsKeys()
- Return <pre>{JSON.stringify(products)}</pre>

Verify: /shop/headphones/open-back returns 7 products.
```

**Difference:** 587-line spec → 5 lines. Manual URL check replaces test matrix.

---

## Scenario 4: Sprint 3 (Skeleton UI)

**Your Prompt:**
> "Create Sprint 3 spec with ProductGrid, ProductCard, ShopHeader, ProductImage components. Include test specs, integration matrix, skeleton requirements..."

**Pro Rewrite:**
```
Create ProductCard.tsx skeleton:
- Debug border only (border-2 border-purple-500)
- Props: {name, brand, displayPrice, image}
- L1 structure: article > link > image + info

Preview at /shop/headphones. Say "L1 locked" when renders.
```

**Difference:** 638-line spec → 6 lines. Visual lock replaces test specs.

---

## Scenario 5: Layout Refactor (Recent Screenshot Request)

**Your Prompt:**
> "The only thing i want you to get from that screenshot is how the layout is organized... write the small test file, and then the header of the small test file write score controls and DODs..."

**Pro Rewrite:**
```
Refactor app/(store)/products/[...slug]/page.tsx:
- Move ShopHeader outside ShopLayout (full-width above fold)
- Keep FilterSidebar in ShopLayout sidebar prop
- Preview at /shop/headphones/open-back
```

**Difference:** 47 words of ceremony → 4 lines of action. Visual check replaces test suite.

---

## Scenario 6: Focus Ring Fix

**Your Prompt:**
> "SortDropdown — accent-500 focus ring. delete focus ring entirely, should show no ring on focus"

**Pro Rewrite:**
```
Remove focus ring from SortDropdown.tsx. 
Verify: Tab to dropdown, no ring appears.
```

**Difference:** Class name hunting → direct instruction + visual check.

---

## The Pattern Summary

| Anti-Pattern (You) | Pro Pattern |
|-------------------|-------------|
| "Create comprehensive spec" | "Create [FILE]. Run tests." |
| "L1 locked" (screenshot) | `npx vitest run` (binary) |
| "Copy-paste ready test templates" | Tests execute immediately |
| "Scope and DoD header" | Test name IS the spec |
| "Update barrel exports" | Just run the refactor |
| 500-line sprint docs | 0 sprint docs |

---

## The Meta-Prompt You Should Use

If you want all future prompts rewritten in real-time:

```
For every request I make, rewrite it as a pro AI-leverage maximizer would write it:
- Delete all ceremony (DoD, scope headers, "comprehensive")
- Replace visual locks with `npm run build` or `npx vitest run`
- Replace test specs with actual test execution
- Single file per request
- Explicit paths, no discovery
```

Then paste your verbose prompt. I'll return the minimal version before executing.
