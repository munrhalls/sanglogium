# Failures: Cover and Move - Pre-Requirement Verification Gap

**Date:** 2026-04-20
**Source:** Debug session - Sanity 401 error in /api/shipping route
**Severity:** Critical
**Frequency:** Systemic (occurred in this session, likely recurring)

## The Problem
We lacked cover in debugging the Sanity 401 error. Failed to verify pre-requirements before investigating symptoms. Spent tens of prompt attempts in ineffective rabbit holes because we didn't trace the path flow stops:

1. **Wrong root cause:** Initially investigated Google Maps API 401 error
2. **Missing verification:** Didn't check token values in test vs API environments
3. **No path flow trace:** Didn't verify test setup → token loading → API call chain
4. **Rabbit hole:** Multiple iterations adding logging incrementally instead of systematic verification

## Root Cause
- API route used `SANITY_STUDIO_READ_WRITE_CREATE` (81 chars, session-based, expired)
- Test used `SANITY_STUDIO_READ_WRITE` (180 chars, permanent token)
- We didn't verify pre-requirement: what token values are loaded in each environment
- We didn't trace the path flow: test setup → token loading → API call
- Jumped to symptom investigation (Google Maps) instead of verifying pre-requirements

## The Fix
```typescript
// app/api/shipping/route.ts
// Changed token priority to match test environment
const writeToken = process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN;
```

Added logging to both environments to compare token values:
```typescript
console.log('SHIPPING ROUTE: writeToken loaded:', writeToken ? 'YES' : 'NO');
console.log('SHIPPING ROUTE: writeToken length:', writeToken?.length);
console.log('SHIPPING ROUTE: writeToken first 10 chars:', writeToken?.substring(0, 10));
```

## Prevention

**MANDATORY Pre-Flight Verification Checklist for Debugging:**
Before investigating any error, verify:

1. **Pre-Requirement Verification:**
   - What are the input values in each environment?
   - What environment variables are loaded?
   - What configuration differs between environments?
   - What are the actual values (not just whether they're "loaded")?

2. **Path Flow Trace:**
   - Trace the complete flow: test setup → data preparation → API call → response
   - Verify each step's ground truth before moving to next
   - Don't assume values match between environments

3. **Simplest Possible First:**
   - Log actual values before investigating complex symptoms
   - Compare values across environments first
   - Only investigate symptoms after pre-requirements verified

**Debugging Protocol:**
```
Step 1: Verify pre-requirements (environment variables, config, input values)
Step 2: Trace path flow (complete chain from setup to failure)
Step 3: Log actual values in all environments
Step 4: Compare values across environments
Step 5: Only then investigate symptoms
```

## Applicability

**When to apply:**
- Any debugging session involving API routes
- Any error where test passes but production fails (or vice versa)
- Any environment-specific behavior differences
- Any authentication/authorization errors

**Keywords:** ["cover-and-move", "pre-requirement-verification", "path-flow-trace", "environment-differences", "debugging-protocol"]
