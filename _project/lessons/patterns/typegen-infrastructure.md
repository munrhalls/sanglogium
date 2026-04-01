# Lesson: Typegen Infrastructure Underutilization

**Date:** 2026-04-01
**Source:** Research/Audit — Product Discovery Data Architecture
**Severity:** High
**Frequency:** Systemic
**Theme:** patterns

## The Problem

Project has `npm run typegen` configured and functional, but codebase uses manual TypeScript interfaces that drift from actual Sanity schema. This creates:
- Type safety gaps (`image: any`)
- Runtime errors from schema mismatches
- Developer friction (no autocomplete)
- Maintenance burden (manual updates)

### Evidence from Audit
```typescript
// @/sanity/lib/products/getProductsByVfsKeys.ts:15-28
export interface Product {
  _id: string;
  name: string;
  brand: { _id: string; name: string };  // ❌ MANUAL
  displayPrice: number;
  image: any;  // ❌ ANY - No type safety
  slug: { current: string };
  catalogueLocationKeys: string[];
}

// Meanwhile @/sanity.types.ts exists with generated types!
// But not used in data layer
```

## Root Cause

1. Generated types not integrated into data fetching layer
2. Manual interfaces created before typegen was configured
3. No enforcement mechanism (CI doesn't catch drift)
4. Developer habit: hand-writing types

## The Fix

### Immediate (5 minutes)
```typescript
// Replace manual interface with generated type
import { Product as SanityProduct } from '@/sanity.types';

// Use Pick for subset views
export type ProductListItem = Pick<
  SanityProduct,
  '_id' | 'name' | 'displayPrice' | 'slug' | 'catalogueLocationKeys'
> & {
  brand: { _id: string; name: string } | null;
  image: { asset: { _ref: string } } | null;
};
```

### Structural (30 minutes)
Add to `package.json` scripts:
```json
{
  "typegen": "sanity typegen generate",
  "typecheck": "tsc --noEmit",
  "prebuild": "npm run typegen && npm run typecheck"
}
```

Add to CI:
```yaml
- name: Type Safety Check
  run: |
    npm run typegen
    npm run typecheck
    # Fails if generated types out of sync
```

## Prevention

**Rule:** If `sanity typegen` exists in project, NEVER manually define interfaces for Sanity documents.

**Checklist for data layer work:**
- [ ] Run `npm run typegen` before modifying queries
- [ ] Import generated types, extend via Pick/Omit
- [ ] Add null checks where schema allows optionality
- [ ] Verify no `any` types in data interfaces

## Applicability

**When to apply:**
- Any Sanity + TypeScript project with typegen configured
- Starting new data fetching layer
- Refactoring existing interfaces

**Keywords:** ["typegen", "sanity", "typescript", "type-safety", "generated-types"]

## Related Lessons

- [../failures/groq-schema-assumption.md](../failures/groq-schema-assumption.md) — Schema assumption failures
- [../patterns/vfs-catalog-architecture.md](../patterns/vfs-catalog-architecture.md) — Type-safe VFS patterns
