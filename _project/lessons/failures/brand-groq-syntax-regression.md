# Brand Reference GROQ Syntax Regression

**Date:** 2026-04-02
**Source:** Brand filter debug session
**Severity:** Critical
**Frequency:** Systemic (occurs during Sanity reference field usage)

## The Problem
Brand filter `brand:Audeze` returned 0 results despite brand existing in data. Filter was constructed with incorrect GROQ dereferencing syntax.

## Root Cause
Filter construction used `brand->{name}` instead of `brand->name` in GROQ query. The curly brace syntax is incorrect for dereferencing Sanity references.

## The Fix
```typescript
// Before (incorrect)
const clause = `&& lower(brand->{name}) == lower("${value}")`;

// After (correct)
const clause = `&& lower(brand->name) == lower("${value}")`;
```

## Prevention
**MANDATORY:** Sanity reference dereferencing syntax:
- Use `brand->name` NOT `brand->{name}`
- Use `brand->{_id, name, slug}` for object projections
- Always test reference queries with simple equality before adding complexity

## Applicability
**When to apply:**
- All GROQ queries involving Sanity reference fields
- Filter construction for reference-based filtering
- Any Sanity schema migration from primitive to reference types

**Keywords:** ["sanity-groq", "reference-dereferencing", "brand-filter", "groq-syntax", "query-debugging"]
