# Cover and Move Application Pattern

**Date:** 2026-04-18  
**Source:** Queue skeleton development conversation trace  
**Severity:** Critical  
**Frequency:** Universal (applies to all implementation work)

## The Problem
Making multiple changes in one step without verification creates unverified ground, makes failure isolation impossible, and leads to wasted time when things break.

## Root Cause
- Making multiple changes in one step
- Not verifying intermediate steps
- Assuming later steps will work
- Not having rollback plan for each step
- Building on unverified ground

## The Fix

**Correct Pattern (from Sanity logging implementation):**
```markdown
Step 1: Add separate CMS trace infrastructure
- Add SANITY_TRACE_LIST_KEY to constants.ts
- Create separate traceSanity function that writes to SANITY_TRACE_LIST_KEY
- Keeps queue logs and CMS logs completely separate
- No interference with existing queue trace system

Step 2: Modify query to fetch stock data
- Change query from `*[_type=="product"][0]{_id}` to `*[_type=="product"][0]{_id, stock, reservedStock}`
- Allows logging before/after stock values
- Verify this doesn't break existing tests

Step 3: Add before/after logging around Sanity call
- Before call: log product id, current stock, current reservedStock
- After call: log product id, updated stock, updated reservedStock, full response
- Use separate CMS trace key
- Preserves existing queue trace flow

Step 4: Create CMS trace API endpoint
- Create `/api/checkout-queue/sanity-trace` endpoint
- Fetches from SANITY_TRACE_LIST_KEY
- Returns CMS trace entries only
- Parallel to existing trace endpoint

Step 5: Add UI display for CMS logs
- Add separate "Sanity CMS Logs" section below queue logs
- Fetch from CMS trace endpoint
- Display before/after stock values and response data
- Filtered by current session requestIds
```

**Why This Pattern Works:**
- Each step is independently verifiable
- No step depends on unverified ground
- Ground is set before moving forward
- Failure is isolated to one step
- Rollback is simple (revert one file)

## Cover and Move Checklist

**Before Each Step:**
- [ ] Does this step verify what the next step needs?
- [ ] Is the ground for the next step actually set?
- [ ] Can I prove the next step will work before running it?
- [ ] Is the solution simplest possible (no over-engineering)?

**After Each Step:**
- [ ] Verify the step works independently
- [ ] Document what was verified
- [ ] Know how to rollback if needed
- [ ] Only then move to next step

## Anti-Patterns to Avoid

**❌ WRONG:**
- Making multiple changes in one step
- Not verifying intermediate steps
- Assuming later steps will work
- Not having rollback plan

**✅ CORRECT:**
- One change per step
- Verify each step before moving
- Have rollback plan for each step
- Build on verified ground

## Prevention

**MANDATORY:** All implementation work must:
1. Break into smallest possible steps (one change per step)
2. Verify each step independently before moving forward
3. Have rollback plan for each step
4. Build only on verified ground (no assumptions)
5. Document verification after each step

## Applicability

**When to apply:**
- All implementation work
- All feature development
- All bug fixes
- All refactoring

**Keywords:** ["cover-and-move", "incremental-verification", "smallest-steps", "verified-ground", "failure-isolation"]
