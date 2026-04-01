# Pattern: Type Consolidation for Data Layer

**Date:** 2026-04-01  
**Source:** PDDA-SPRINT-1  
**Severity:** High  
**Frequency:** Recurring  
**Status:** Active

---

## The Problem

Multiple local type definitions for the same entity (`Product`) across components caused:
- TypeScript assignment errors: "Two different types with this name exist, but they are unrelated"
- Maintenance burden when schema changes
- Confusion about which type is authoritative

**Example error:**
```
Type 'Product[]' is not assignable to type 'Product[]'. 
Two different types with this name exist, but they are unrelated.
```

---

## Root Cause

Each component defined its own `Product` interface:
- `CategoryPageClient.tsx`: Local type with Pick<SanityProduct, ...>
- `ProductCard.tsx`: Manual interface with `brand: string | null`
- `ProductGrid.tsx`: Manual interface with `image: any`

No single source of truth for the Product type.

---

## The Fix

Export Product type from data layer (where data is fetched):

```typescript
// sanity/lib/products/getProductsByVfsKeys.ts
export type Product = Pick<SanityProduct, '_id' | 'name' | 'displayPrice' | 'image' | 'catalogueLocationKeys'> & {
  brand: string | null;
  slug: { current: string };
};
```

All components import from single source:
```typescript
// In consuming components
import type { Product } from '@/sanity/lib/products/getProductsByVfsKeys';
```

---

## Prevention

**Rule:** Define shared types at the data layer (where data is fetched), never locally in components.

**Enforcement:**
1. Data fetching functions export their return types
2. Components import types from data layer
3. Never redefine entity types in component files

---

## Applicability

**When to apply:**
- Any entity type used across multiple components
- Sanity-generated types being adapted for UI
- Any type that represents API/CMS data

**Keywords:**
- "type consolidation"
- "shared types"
- "data layer types"
- "sanity typegen"
- "entity types"

**Related lessons:**
- `patterns/server-first-fetching` — Data layer architecture
- `failures/groq-schema-assumption` — Type safety with GROQ

---

## Codification Log

**Integrated into:**
- [x] `.windsurfrules` — "Export shared types from data layer"
- [x] Memory system — Keywords for auto-retrieval
- [ ] Test suite — Type consistency check (pending)

**Date integrated:** 2026-04-01
