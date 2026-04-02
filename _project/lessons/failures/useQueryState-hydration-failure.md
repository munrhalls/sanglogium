# useQueryState Hydration Failure

**Date:** 2026-04-02
**Source:** ActiveFilters component crash
**Severity:** High
**Frequency:** Systemic (occurs with any useQueryState usage)

## The Problem
`TypeError: Cannot read properties of undefined (reading 'map')` when using `useQueryState` from nuqs during React hydration.

## Root Cause
`useQueryState` returns `undefined` initially during hydration, but component logic assumes it's always defined.

## The Fix
Always add null coalescing when using useQueryState values:
```typescript
// Before (fails)
filters.map(parseFilter)
filters.includes(filterKey)

// After (safe)
(filters || []).map(parseFilter)
(filters || []).includes(filterKey)
```

## Prevention
**MANDATORY:** When using `useQueryState` from nuqs:
1. Add null checks: `(filters || []).map(...)`
2. Or destructure with defaults: `const [filters = []] = useQueryState(...)`
3. Make async props optional: `filterGroups?: FilterGroup[]`

## Applicability
**When to apply:**
- Any component using `useQueryState` or similar async hooks
- Props that come from async server data
- Array operations on hook-return values

**Keywords:** ["useQueryState", "nuqs", "hydration", "null-check", "server-components"]
