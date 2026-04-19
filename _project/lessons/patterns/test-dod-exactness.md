# Test DoD Exactness Pattern

**Date:** 2026-04-18  
**Source:** Queue skeleton development conversation trace  
**Severity:** Critical  
**Frequency:** Universal (applies to all test DoD specifications)

## The Problem
Vague test specifications in PRD .todo files make success criteria subjective, prevent reproducible verification, and fail to explain business value.

## Root Cause
- Test written as "test queue processing" without flow description
- No preconditions specified (setup, start conditions)
- Success criteria vague ("verify it works")
- No connection to business value
- No explanation of what bugs this catches

## The Fix

**Correct Pattern:**
```markdown
✔ Test (Integration): Sequential FIFO processing @done(timestamp)
    ✔ Trace: 9 curl requests → queue processor → verify sequential logs @done(timestamp)
    ✔ Setup: Queue processor running, Redis connected @done(timestamp)
    ✔ Start conditions: Upstash connected, queue processor active @done(timestamp)
    ✔ Assertion: Logs show "Processing 1 → Complete 1 → Processing 2 → Complete 2 → ... → Processing 9 → Complete 9" @done(timestamp)
    ✔ Justification: Verifies core queue behavior prevents race conditions @done(timestamp)
    ✔ Real feedback: Detects parallel processing bugs, validates atomic operations @done(timestamp)
```

**Key Elements:**
- **Trace:** Shows the flow to test (request → response path)
- **Setup:** Preconditions - what must exist before test
- **Start conditions:** State requirements - what state must be in
- **Assertion:** Exact expected outcome - objective success criteria
- **Justification:** Business value - why this test matters
- **Real feedback:** Detection mechanism - what bugs this catches

## Why This Works
- Test is self-contained (no external assumptions)
- Preconditions are explicit (anyone can reproduce)
- Success criteria are objective (no interpretation needed)
- Business value is clear (why we're doing this)
- Feedback mechanism is defined (what we're catching)

## Anti-Patterns to Avoid

**❌ WRONG:**
```markdown
[ ] Test queue processing
[ ] Verify it works
[ ] Check for bugs
```

**✅ CORRECT:**
```markdown
✔ Test (Integration): Sequential FIFO processing
✔ Trace: 9 curl requests → queue processor → verify sequential logs
✔ Setup: Queue processor running, Redis connected
✔ Start conditions: Upstash connected, queue processor active
✔ Assertion: Logs show exact sequence "Processing 1 → Complete 1 → ..."
✔ Justification: Verifies core queue behavior prevents race conditions
✔ Real feedback: Detects parallel processing bugs, validates atomic operations
```

## Prevention

**MANDATORY:** All test DoD items must include:
1. **Trace** - Flow to test (request → response path)
2. **Setup** - Preconditions (what must exist)
3. **Start conditions** - State requirements (what state must be in)
4. **Assertion** - Exact expected outcome (objective success criteria)
5. **Justification** - Business value (why this matters)
6. **Real feedback** - Detection mechanism (what bugs this catches)

## Applicability

**When to apply:**
- All test specifications in PRD .todo files
- All sprint test DoD items
- All verification test definitions

**Keywords:** ["test-dod", "test-exactness", "objective-success-criteria", "test-preconditions", "business-value-connection"]
