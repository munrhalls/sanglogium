# Project Status: Sang Logium

**Last Updated:** 2026-03-31

## VFS (Virtual File System) - CATALOGUE

**STATUS: FUNCTIONAL** ✅
- 23 nodes (10 headers, 13 leaves)
- Build validation: ACTIVE (throws on missing IDs)
- Tests: 5/5 passing (`tests/catalogue/build.validation.test.ts`)

**Key Files:**
- `data/catalogue-index.json` - Pre-computed VFS (generated 2026-03-31)
- `data/catalogue.ts` - Runtime API: `resolveSlugToId()`, `unrollDescendantKeys()`
- `scripts/build-catalogue-index.mjs` - Build pipeline with validation
- `sanity/lib/products/getProductsByVfsKeys.ts` - GROQ: `count(@ in $keys)`

**Architecture:**
```
URL /shop/open-back
  → resolveSlugToId() → "o7c6bai..."
  → unrollDescendantKeys() → [leaf IDs]
  → GROQ: count(catalogueLocationKeys[@ in $keys]) > 0
  → Products[]
```

**Verifications:**
- All tree nodes exist in `slotMetadataMap` ✅
- All child references valid ✅
- Bidirectional slug mappings (leaf + path) ✅

---

## Test Suite Status

| Suite | Tests | Status |
|-------|-------|--------|
| `build.validation.test.ts` | 5 | ✅ PASS |
| `vfs.minimal.test.ts` | 6 | ⏳ PENDING |
| `vfs.foundation.test.ts` | 4 | ⏳ PENDING |

**Run:** `npx vitest run tests/catalogue/build.validation.test.ts`

---

## Active Sprints (2026-03-31)

### SPRINT_2026_03_31_PLP_FIXES.md
**Status:** READY FOR EXECUTION
**Scope:** 5 critical bugs (images, filters, sorting, PDP error)
**Sequencing:** SC3 (Filter Logic) → SC1 (Images) → SC2 (Performance) → SC4 (Sort) → SC5 (PDP)
**Key Risks:** `ProductCard.tsx` (homepage + PLP shared), `tailwind.config.ts` (read-only)

**Bugs:**
- B-01: Product images not rendering
- B-02: Filter lag (5-10s)
- B-03: Filter returns 0 products
- B-04: Sorting non-functional
- B-05: PDP "Something went wrong"

---

### SPRINT_2026_03_31_UI_POLISH.md
**Status:** READY FOR EXECUTION
**Depends On:** PLP_FIXES completion
**Scope:** 5 P1 design system gaps
**Sequencing:** SC5 (Checkbox) → SC1 (Empty State) → SC2 (Image Zoom) → SC3 (Related Products) → SC4 (Homepage VFS)

**Gaps:**
- G-04/G-16: Empty state design system compliance
- G-09: PDP image gallery zoom
- G-11: Related products carousel
- G-13: Homepage VFS migration
- G-06: Checkbox component extraction

---

### SPRINT_2026_03_31_AI_LEVERAGE_INFRASTRUCTURE.md
**Status:** Active
See full file: `_project/sprints/active/SPRINT_2026_03_31_AI_LEVERAGE_INFRASTRUCTURE.md`

---

## Critical Path

1. **Execute PLP_FIXES first** (blocking UI_POLISH)
2. **Verify no homepage regression** after ProductCard changes
3. **Build validation required** after each sprint: `npm run build`
4. **Test command:** `npx vitest run tests/catalogue/build.validation.test.ts`


---

## Key Patterns

**VFS Query Pattern:**
```typescript
const keys = unrollDescendantKeys(categoryId); // O(k)
const products = await getProductsByVfsKeys({ keys }); // Single GROQ
```

**Build Validation:**
```javascript
// scripts/build-catalogue-index.mjs:141-182
// Throws if any child ID missing from slotMetadataMap
```

---

## Dependencies

- **Sanity CMS:** Product data source
- **VFS:** Pre-computed at build time (daily cron)
- **Next.js 15:** App Router, Server Components

---

## Notes for AI Agents

1. **VFS is NOT broken** - March 2026 "critical flaws" memory is outdated
2. **Build validation protects integrity** - cannot generate invalid index
3. **Use existing test patterns** - `vfs.minimal.test.ts` as template
4. **GROQ pattern is standard** - `count(@ in $keys)` for array intersection
5. **Catalogue has 3 roots:** Headphones, Audio Electronics, Accessories
