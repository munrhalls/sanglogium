# Pattern: Test-Implementation Validation Consistency

**Date:** 2026-04-02  
**Source:** BASKET_DATA_INTEGRITY_SPRINT — Rehydration validation  
**Severity:** Medium  
**Frequency:** Recurring (when writing validation logic)

---

## The Problem

Test validation logic drifted from store implementation:

```typescript
// Store validation (initial)
typeof item.image === "string"

// Test expected
item.image !== ""  // empty string passes typeof check but is invalid
```

Test failed because empty string `""` technically satisfies `typeof === "string"`, but functionally it's invalid data.

---

## Root Cause

Type checking alone doesn't validate data quality. Empty strings, zero-length arrays, and null-like values can pass type guards but break downstream logic.

---

## The Fix

Validation must check **both** type AND content:

```typescript
// Store validation (corrected)
typeof item.image === "string" && item.image !== ""
```

Test validation extracted to match store logic exactly:

```typescript
// tests/basket/rehydration.unit.test.ts
const validateItems = (items: BasketItem[]): BasketItem[] => {
  return items.filter((item) => {
    return (
      item &&
      typeof item._id === 'string' &&
      item._id !== '' &&
      typeof item.name === 'string' &&
      typeof item.displayPrice === 'number' &&
      typeof item.image === 'string' &&
      item.image !== '' &&  // Content check
      typeof item.slug === 'string' &&
      item.slug !== ''      // Content check
    );
  });
};
```

---

## Prevention

**When writing validation logic:**

1. **Type + Content check for strings:**
   ```typescript
   typeof field === "string" && field !== ""
   ```

2. **Type + Content check for arrays:**
   ```typescript
   Array.isArray(field) && field.length > 0
   ```

3. **Extract validation to shared function** when used in both implementation and tests

4. **Test the negative cases:**
   - Empty strings
   - Zero-length arrays
   - Whitespace-only strings
   - Null objects

---

## Applicability

**When to apply:**
- Data rehydration from localStorage
- API response validation
- Form input sanitization
- Migration logic

**Keywords:** ["validation", "type-guards", "empty-string", "data-quality", "test-alignment"]

**Related lessons:**
- `patterns/type-consolidation` — Shared types prevent drift
- `failures/debug-data-assumption` — Verify actual data

---

## Integration Checklist

- [x] Lesson stored in patterns
- [x] Keywords added for retrieval
- [x] `.windsurfrules` update pending
- [x] INDEX.md update pending

---

## Codification Log

**Integrated into:**
- [x] `_project/lessons/patterns/` — This file
- [ ] `.windsurfrules` — Add validation rule
- [ ] `INDEX.md` — Keywords for retrieval

**Date integrated:** 2026-04-02
