# failures: GROQ Reference Syntax on Non-Reference Fields

**Date:** 2026-03-31  
**Source:** S7-BASKET-DESIGN-ALIGNMENT, PLP Filter Fix  
**Severity:** Critical  
**Frequency:** Recurring  
**Status:** Active

---

## The Problem

Brand filter used `brand->name` (reference traversal syntax) in GROQ query, but schema defines `brand` as plain string field. Query compiled without error but always returned 0 products. Silent failure.

## Root Cause

**Schema drift:** Query was written when brand might have been a reference type. Schema changed to string, but query was never updated.

**Silent failure mode:** GROQ doesn't error on invalid reference traversal — it simply returns empty result. This makes debugging difficult because there's no error message.

**No type checking:** No static analysis exists to catch `brand->name` on a string field.

## The Fix

```typescript
// Before (broken - reference syntax on string field):
if (field === 'brand') {
  return `&& brand->name == "${value}"`;  // ❌ Returns empty
}

// After (working - direct string match):
if (field === 'brand') {
  return `&& brand == "${value}"`;         // ✓ Correct
}
```

## Prevention

**Rule:** Before using reference syntax (`->`) in GROQ:

1. **Always verify field type in schema** — Open `sanity/schemaTypes/productType.ts` and confirm the field is actually a reference type
2. **Use direct access for primitives** — String, number, boolean fields use direct access: `field == "value"`
3. **Use reference syntax only for references** — Reference types use traversal: `field->name == "value"`
4. **Test filters with real data** — Don't rely on query compilation alone

**Pre-Work Checklist for GROQ:**
- [ ] Schema file opened and field types verified
- [ ] Reference syntax only applied to reference fields
- [ ] Test query with actual data before deploying

## Applicability

**When to apply this lesson:**
- Writing or modifying Sanity GROQ queries
- Using reference traversal syntax (`->`)
- Working with filter logic or conditional queries
- Schema has been recently modified

**Keywords for retrieval:**
- "groq"
- "sanity"
- "reference"
- "schema"
- "filter"
- "brand"
- "->"

**Related lessons:**
- [diagnostic-query-mismatch.md](diagnostic-query-mismatch.md) — Schema-to-query validation
- [debug-data-assumption.md](debug-data-assumption.md) — Verify data before code changes

---

## Codification Log

**Integrated into:**
- [x] `_project/lessons/failures/` — This file
- [x] Memory system — Keywords added
- [ ] Workflow update — Add to `/implement` or `/debug` schema-check step

**Date integrated:** 2026-03-31
