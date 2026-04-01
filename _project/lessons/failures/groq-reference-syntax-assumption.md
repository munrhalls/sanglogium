# Failure: GROQ Reference Syntax on Non-Reference Fields

**Date:** 2026-04-01
**Source:** PDDA-SPRINT-1
**Severity:** Critical
**Frequency:** One-time (but high impact if repeated)

## The Error
GROQ query used `brand->name` (reference expansion) on a field that was still `string` type in generated types. Query failed silently or returned unexpected results.

## Root Cause
Assumed brand was reference type without checking `sanity.types.ts`. Schema had been updated to reference, but types were stale.

## The Fix
```typescript
// ❌ Before: Wrong syntax for string field
const filterClause = `brand == "${value}"`;

// ✅ After: Correct reference dereference
const filterClause = `brand->name == "${value}"`;
```

## Prevention Rule
**Before using `->` in GROQ:**
1. Verify field is `reference` type in `sanity.types.ts`
2. Regenerate types: `npm run typegen`
3. Check field definition shows `{ _ref: string; _type: "reference"; }`

## Verification
```bash
# Check field type before reference syntax
grep -A 5 "brand\?:" sanity.types.ts
# Should show: { _ref: string; _type: "reference"; }
```

## Applicability
**When to apply:**
- Writing GROQ queries with `->` syntax
- Filtering by reference fields (brand, category, etc.)
- Projecting reference field data

**Keywords:** ["groq", "reference", "sanity", "query", "type-check"]
