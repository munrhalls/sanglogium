# Pattern: Type Safety via Generated Types

**Date:** 2026-04-01
**Source:** PDDA-SPRINT-1
**Severity:** High
**Frequency:** Recurring

## The Problem
Manual TypeScript interfaces drift from Sanity schema, causing type mismatches. In PDDA-SPRINT-1, brand field was `string` in types but `reference` in schema, causing GROQ query failures.

## Root Cause
1. `sanity.types.ts` not regenerated after schema changes
2. Manual `Product` interfaces in multiple files (`ProductCard.tsx`, `ProductGrid.tsx`, `CategoryPageClient.tsx`)
3. GROQ reference syntax (`->`) used without verifying field type

## The Fix
```typescript
// ❌ Before: Manual interface (prone to drift)
interface Product {
  _id: string;
  name: string;
  brand: string | null;  // Wrong! Schema has reference
}

// ✅ After: Pick from generated types
import type { Product as SanityProduct } from '@/sanity.types';

export type Product = Pick<SanityProduct, '_id' | 'name' | 'brand' | 'displayPrice'> & {
  slug: { current: string };  // Only add non-generated fields
};
```

## Prevention
1. **ALWAYS** run `npm run typegen` before type-related work
2. Use `Pick<SanityProduct, ...>` for component prop types
3. Verify `sanity.types.ts` reflects expected schema
4. For GROQ: check field type before using `->` reference syntax

## Applicability
**When to apply:**
- Any Sanity schema type usage in components
- Product, Category, Brand, or any CMS-driven types
- Before creating new component prop interfaces

**Keywords:** ["typegen", "sanity", "typescript", "schema", "generated-types"]
