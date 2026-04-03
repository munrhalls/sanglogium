---
description: Systematic test fixing workflow - run tests, isolate failures, verify quality, and fix one by one
---

# /Fix-Tests Command Protocol

**Purpose:** Systematically resolve failing tests without introducing regressions or wasting cycles on badly written tests.

---

## Execution Protocol

### Phase 1: Baseline Verification
1. **Run test suite once** using `npm test` or `npx vitest run --reporter=verbose`.
2. **Catalog failures:** Store only the failing test names/IDs.
3. **Exit** if no tests are failing.

### Phase 2: Isolated Fixing (One by One)
For EACH failing test in the catalog:

1. **Pick the 1st failing test** and run it in isolation:
   ```bash
   npx vitest run -t "test name"
   ```
2. **Quality Check (MANDATORY):**
   - Verify the test is well-written before attempting a fix.
   - Test expectations must match logical component behavior.
   - Test must clearly define what "prevention/validation" means.
   - Test should not have ambiguous or contradictory expectations.
   - **If test is badly written:** HALT, explain to the human why it's bad, and skip it. DO NOT fix implementation for a bad test.

3. **Fix Implementation:**
   - Address ONLY the root cause for that specific test.
   - Do not fix multiple tests simultaneously.
   - Do not perform unrelated refactoring.

4. **Verify Fix:**
   - Run ONLY that test in isolation again.
   - **Maximum 2 attempts:** If the test still fails after 2 fix attempts, STOP and inform the human immediately.

5. **Iterate:**
   - Proceed to the next failing test only after the current one PASSES (or is rejected).

---

## Final Verification
1. Run the **entire test suite** to ensure no regressions were introduced.
2. Verify all previously failing tests are now passing or documented as rejected.

---

## Constraint Rules
- **NO** fixing multiple tests at once.
- **NO** running the full suite during the fixing phase (only isolation).
- **NO** more than 2 attempts per test.
- **MANDATORY** quality check before every fix.
- **HALT** on badly written tests.
