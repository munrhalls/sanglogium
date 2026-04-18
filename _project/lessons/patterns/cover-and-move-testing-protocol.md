# Cover and Move + Simple Protocol

**Date:** 2026-04-18
**Source:** Sequential FIFO test debugging session
**Severity:** Critical
**Frequency:** Universal (applies to all development, not just testing)

## The Problem
Integration tests failed repeatedly because each step didn't verify the ground was set for the next step:
- Test runner couldn't connect to Redis (environment issue)
- Fetch API not available in Node.js (runtime issue)
- Wrong event names filtered (mismatch with implementation)
- No state clearing between runs (pollution)
- API endpoints not verified before use (assumption)

Each fix addressed one symptom without verifying the entire chain was sound. Solutions were over-complicated when simple fixes would suffice.

## Root Cause
1. Missing systematic verification that "step N covers for step N+1"
2. Over-engineering solutions instead of keeping everything simplest possible
3. Assumptions about infrastructure without verification

## The Fix

**Cover and Move Protocol:**

1. **Pre-flight verification:** Before any work, verify all dependencies
   - Dev server reachable
   - API endpoints respond
   - Event names match implementation
   - State clearing works

2. **Step-by-step chain verification:**
   ```
   Step 1: Verify dev server → sets ground for Step 2
   Step 2: Verify API endpoints → sets ground for Step 3
   Step 3: Verify event names → sets ground for Step 4
   Step 4: Verify state clearing → sets ground for Step 5
   Step 5: Send requests → sets ground for Step 6
   Step 6: Read trace → verify results
   ```

3. **Never hand back until chain verified:** Each fix must be verified to not break the next step before moving on.

**Simple Principle:**

1. **Single-line fixes when sufficient:** Don't over-engineer
2. **Minimal API endpoints:** Only what's needed for the test
3. **Direct verification:** Use existing infrastructure, don't create abstractions
4. **No unnecessary complexity:** If it takes >5 min to explain, it's too complex

**Example from this session:**
- Created simple trace API endpoint (5 lines) → verified it returns data
- Created simple clear-trace API endpoint (5 lines) → verified it clears state
- Updated event names in test (1 line) → verified they match processor logs
- Only then did test run truthfully

## Prevention

**MANDATORY:** For any development work, verify the chain:
1. All external dependencies reachable
2. All API endpoints functional (if needed)
3. All event/data structures match implementation
4. State management works (if needed)
5. Keep solution as simple as possible
6. Only then proceed to actual work

**Cover and Move Checklist:**
- [ ] Does step N verify what step N+1 needs?
- [ ] Is the ground for step N+1 actually set?
- [ ] Can I prove step N+1 will work before running it?
- [ ] Is the solution simplest possible (no over-engineering)?

**Simple Checklist:**
- [ ] Can this be done in 1 line instead of 10?
- [ ] Am I creating unnecessary abstractions?
- [ ] Can I use existing infrastructure instead of creating new?
- [ ] Would this take >5 minutes to explain?

## Applicability

**When to apply:**
- All integration test setup
- All E2E test infrastructure
- Any development work with external dependencies
- Multi-step verification flows
- Workflow design and execution
- Sprint planning and execution

**Keywords:** ["cover-and-move", "simple", "integration-testing", "test-setup", "pre-flight", "chain-verification", "minimal", "over-engineering"]
