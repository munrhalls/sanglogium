# Search Consistency Pattern

**Date:** 2026-04-02
**Source:** Search UI Enhancement Sprint
**Severity:** High
**Frequency:** Systemic

## The Problem
Autocomplete and full search returned different results for the same query, confusing users and breaking search experience.

## Root Cause
Two search functions with different field coverage - autocomplete missing overview fields search.

## The Fix
```typescript
// Added to autocomplete GROQ query:
specifications[].value match $query ||
overviewFields[].value match $query
```

## Prevention
**MANDATORY:** When implementing search functionality, maintain identical field coverage across all search endpoints (autocomplete, full search, API endpoints).

## Applicability
**When to apply:**
- Any search implementation with multiple endpoints
- API design with autocomplete vs full search variants
- Feature parity requirements across UI components

**Keywords:** ["search-consistency", "autocomplete", "field-coverage", "api-parity"]
