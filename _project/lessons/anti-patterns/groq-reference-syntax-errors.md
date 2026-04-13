# GROQ Reference Dereferencing Syntax Errors

**Date:** 2026-04-13
**Source**: AtomicReservationManager query failures
**Severity**: Critical
**Frequency**: Systemic (occurs during Sanity reference field usage)

## The Problem
GROQ query returned 0 results for products with brand references despite data existing. Query failed due to incorrect dereferencing syntax.

## Root Cause
Used curly brace syntax `{}` instead of direct dereferencing `->` for Sanity reference fields.

```typescript
// INCORRECT - Curly braces
brand->{ _id, name, slug }

// CORRECT - Direct dereferencing
brand->{_id, name, slug}
```

## The Fix
```typescript
// AtomicReservationManager.ts - CORRECT
const sanityProducts = await client.fetch(`
  *[_type == "product" && _id in $ids]{
    _id, name, stock, reservedStock,
    "image": image.asset->url,
    brand->{_id, name, slug}  // CORRECT: No curly braces
  }
`, { ids: productIds })
```

## Prevention
**MANDATORY GROQ REFERENCE SYNTAX:**

1. **Single Field Reference**
   ```typescript
   // CORRECT
   brand->name
   category->title
   
   // INCORRECT
   brand->{name}
   category->{title}
   ```

2. **Object Projection**
   ```typescript
   // CORRECT
   brand->{_id, name, slug}
   category->{_id, title, slug}
   
   // INCORRECT
   brand->{ _id, name, slug }
   category->{ _id, title, slug }
   ```

3. **Nested References**
   ```typescript
   // CORRECT
   brand->category->name
   
   // INCORRECT
   brand->{category}->{name}
   ```

4. **Testing Pattern**
   ```typescript
   // Always test reference queries with simple equality first
   *[_type == "product" && brand->name == "Audeze"]
   
   // Then add projections
   *[_type == "product" && brand->name == "Audeze"]{
     brand->{_id, name, slug}
   }
   ```

5. **Common Mistakes**
   - Adding spaces inside `{}`: `brand->{ name }` (wrong)
   - Using `{}` for single fields: `brand->{name}` (wrong)
   - Mixing syntaxes: `brand->name && brand->{slug}` (confusing)

## Applicability
**When to apply:**
- All GROQ queries involving Sanity reference fields
- Filter construction for reference-based filtering
- Any Sanity schema migration from primitive to reference types
- Debugging queries that return empty results

**Keywords:** ["groq", "sanity", "reference-dereferencing", "query-syntax", "brand-filter", "debugging"]
