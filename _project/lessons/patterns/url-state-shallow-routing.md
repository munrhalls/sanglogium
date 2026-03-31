# Pattern: URL State Management for High-Frequency Interactions

**Date:** 2026-03-31
**Source:** PLP filter performance optimization
**Severity:** Medium
**Frequency:** Recurring — applies to any interactive URL-driven state

## The Problem
Using `router.push()` for URL state updates in Next.js App Router causes:
1. Server Component re-execution
2. Database re-fetching
3. Full page re-render
4. 200-500ms+ lag on every interaction

**Symptom:** Filter checkbox clicks feel sluggish, dropdowns lag, toggle switches unresponsive.

## Root Cause
Next.js App Router treats `router.push()` as navigation — it re-runs Server Components. For high-frequency interactions (filters, sorts, pagination), this is architectural overkill.

## The Fix

### Use nuqs with Shallow Routing

```typescript
'use client'
import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs'

export function useFilterState() {
  const [filters, setFilters] = useQueryState(
    'f',
    parseAsArrayOf(parseAsString)
      .withOptions({
        shallow: true,        // ← KEY: No server roundtrip
        throttleMs: 50,       // ← Browser rate-limit protection
        clearOnDefault: true, // ← Clean URLs when empty
      })
      .withDefault([])
  )

  const toggleFilter = (field: string, value: string) => {
    const key = `${field}:${value}`
    setFilters(prev => 
      prev.includes(key)
        ? prev.filter(f => f !== key)
        : [...prev, key]
    )
    // Returns immediately — URL updates in background
  }

  return { filters, toggleFilter }
}
```

### Key Configuration

| Option | Purpose | When to Change |
|--------|---------|----------------|
| `shallow: true` | Client-only URL update | **Default for filters** — never hits server |
| `shallow: false` | Trigger server re-render | Sort changes that need fresh data |
| `throttleMs: 50` | Browser History API protection | Increase if rapid-fire updates fail |
| `startTransition` | Non-blocking UI with loading state | Use with `shallow: false` only |

## Prevention

### Decision Matrix

| Interaction Type | Use nuqs? | Shallow? | Notes |
|------------------|-----------|----------|-------|
| Checkbox filters | ✅ Yes | `true` | Instant feedback, client-side filtering |
| Sort dropdown | ✅ Yes | `false` | Needs fresh server data |
| Pagination | ✅ Yes | `true` | Can prefetch, shallow acceptable |
| Search input | ✅ Yes | `true` | Debounce + throttle recommended |
| Form submission | ❌ No | N/A | Use `router.push()` for full navigation |

### Code Review Checklist

When reviewing interactive components:
- [ ] Are high-frequency interactions using `shallow: true`?
- [ ] Is `router.push()` only used for intentional navigation?
- [ ] Are URL params type-safe with nuqs parsers?
- [ ] Is throttleMs appropriate for interaction frequency?

## Applicability

**When to apply:**
- Any component that updates URL state more than once per second
- Filter sidebars, mobile filter drawers, active filter chips
- Sort controls, view toggles, pagination
- Any UI where user expects immediate visual feedback

**When NOT to apply:**
- Form submissions (intentional navigation)
- Page-to-page navigation
- Actions requiring server validation before UI update

**Keywords:** ["nuqs", "shallow-routing", "url-state", "performance", "filter-ui", "router-push"]

## Related Lessons

- See `_project/lessons/patterns/nextjs-client-state.md` — When to keep state in React vs URL
- See `_project/lessons/failures/router-push-performance.md` — Performance impact of router navigation
