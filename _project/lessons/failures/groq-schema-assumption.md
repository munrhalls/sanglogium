# GROQ Schema Assumption Failure

**Date:** 2026-03-31
**Source:** PLP Critical Bug Fixes Sprint (SC3)
**Severity:** Critical
**Frequency:** Recurring

## The Problem
Wrote GROQ filter query based on assumptions about schema structure without verifying actual Sanity schema. First fix attempt failed completely:

```typescript
// ASSUMED (wrong):
`&& brand->name == "${value}"`   // brand is reference?
`&& "${value}" in tags`           // tags array exists?

// ACTUAL schema:
brand: { type: "string" }        // Plain string, not reference
// No 'tags' field exists         // Filterable data in overviewFields[]/specifications[]
```

**Silent failure:** GROQ returns empty results instead of error. Build passes. Bug invisible until runtime verification.

## Root Cause
Skipped schema verification step before writing query. Assumed field types based on:
- Variable naming (`brand` sounded like reference)
- Pattern memory (other projects use tags array)
- Didn't read `sanity/schemaTypes/productType.ts`

## The Fix
```typescript
// 1. Read schema file first
// productType.ts: brand is string, no tags field

// 2. Write query matching actual structure:
if (field === 'brand') {
  return `&& brand == "${value}"`;  // Direct string match
}
return `&& (count(overviewFields[@.title == "${field}" && @.value == "${value}"]) > 0 || count(specifications[@.title == "${field}" && @.value == "${value}"]) > 0)`;
```

## Prevention
**Rule:** Before writing any GROQ query:
1. Open `sanity/schemaTypes/[type].ts`
2. Verify field types (reference vs string vs array vs object)
3. Only use `->` syntax for actual reference types
4. Verify array field names exist
5. Test query with actual data before committing

## Applicability
**When to apply:**
- Writing GROQ queries for any content type
- Debugging "0 results" when data exists
- Modifying existing queries

**Keywords:** ["groq", "sanity", "schema", "assumption", "reference", "query", "filter"]

## Time Cost
- **Fix duration:** 2 minutes (reading schema + code change)
- **Investigation waste:** 15 minutes (tracing code without checking schema)
- **Ratio:** 7.5:1 — Prevention is 7x cheaper than fix-after-failure

## Related
- [groq-reference-syntax.md](groq-reference-syntax.md) — Similar issue with reference syntax
- [diagnostic-query-mismatch.md](diagnostic-query-mismatch.md) — General query-schema mismatch pattern
