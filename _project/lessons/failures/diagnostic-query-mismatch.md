# failures: Diagnostic Query vs Schema Mismatch

**Date:** 2026-03-31  
**Source:** PLP Diagnostic Sprint (B-03: Filtering returns 0 products)  
**Severity:** High  
**Frequency:** Recurring  
**Status:** Active

---

## The Problem

Diagnostic sprint identified VFS data corruption (`slotMetadataMap` incomplete) as root cause of empty product results. User fixed VFS, rebuilt, products loaded but **filters still returned 0 products**. Diagnostic traced code path but failed to identify the actual bug.

**Time spent:** ~25 minutes on VFS analysis, 0 minutes on query verification.

## Root Cause

Diagnostic traced code path to `getProductsByVfsKeys.ts` but **failed to verify GROQ filter clause against actual Sanity schema**:

```typescript
// Diagnostic ASSUMED this was correct:
if (field === 'brand') {
  return `&& brand->name == "${value}"`;  // Reference syntax
}
return `&& ${field} == "${value}"`;        // Direct match (for tags field that doesn't exist)

// ACTUAL schema from productType.ts:
brand: string  // Not a reference!
// No 'tags' field exists
// Filterable data lives in overviewFields[] and specifications[] arrays
```

**Critical error:** Data flow tracing ≠ Query correctness verification.

## The Fix

```typescript
// Fixed filter logic:
if (field === 'brand') {
  return `&& brand == "${value}"`;  // String match, not reference
}
// Other filters check overviewFields[] / specifications[]
return `&& (count(overviewFields[@.title == "${field}" && @.value == "${value}"]) > 0 || count(specifications[@.title == "${field}" && @.value == "${value}"]) > 0)`;
```

## Prevention

**Add to /diagnostic-sprint protocol Step 2.2:**

```markdown
### 2.2 Verify Query Against Schema (5 min)

For data fetching bugs:
1. Read the GROQ/SQL query construction
2. Read the Sanity schema (productType.ts, etc.)
3. Verify every field access matches schema type:
   - Reference syntax (->) only for reference types
   - Direct match for string/number/boolean
   - Array traversal for nested data
4. Check field EXISTS in schema (not assumed)
```

**Critical distinction:** Data flow tracing ≠ Query correctness verification.

## Applicability

**When to apply this lesson:**
- Running diagnostic sprints on data fetching issues
- Debugging GROQ/SQL query problems
- Schema has been recently modified
- Multiple potential root causes exist

**Keywords for retrieval:**
- "diagnostic"
- "query"
- "schema"
- "groq"
- "verification"
- "data-flow"
- "tracing"

**Related lessons:**
- [groq-reference-syntax.md](groq-reference-syntax.md) — Reference syntax verification
- [debug-data-assumption.md](debug-data-assumption.md) — Data verification before fixes

---

## Codification Log

**Integrated into:**
- [x] `_project/lessons/failures/` — This file
- [x] INDEX.md — Keywords added
- [ ] `/diagnostic-sprint` workflow — Add schema-query validation step

**Date integrated:** 2026-03-31
