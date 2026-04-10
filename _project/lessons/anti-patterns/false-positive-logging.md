# Anti-Pattern: False Positive Logging

**Date:** 2026-04-09
**Source:** Logging system false positive bug fix
**Severity:** Critical
**Frequency:** Systemic (occurs when logging is hardcoded)

## The Problem
Logging system reported "Expectation Met: true" everywhere while actual values were undefined or failing. This created false confidence and broke the verification system entirely.

## Root Cause
Hardcoded "Expectation Met: true" strings instead of actual verification logic. The logging system was designed to verify expectations but was lying about the results.

```typescript
// ANTI-PATTERN: False positive logging
console.log(`4. Result: PASS_VALIDATION`);
console.log(`   Expected: dispatch({ type: "PASS_VALIDATION", payload: { stripeUrl: url } })`);
console.log(`   Stripe: ${result.stripeUrl}`); // Could be undefined!
console.log(`   Expectation Met: true`); // HARDCODED - ALWAYS TRUE!
```

## The Fix
Created robust verification system that performs actual comparison:

```typescript
// PATTERN: Real verification
export function logExpectationWithValue<T>(
  stepNumber: number,
  stepType: string,
  stepName: string,
  expected: string,
  actual: T,
  component: string
): void {
  const actualString = String(actual);
  const expectationMet = actual !== undefined && actual !== null && actualString !== 'undefined';
  
  console.log(`${stepNumber}. ${stepType}: ${stepName}`);
  console.log(`   Expected: ${expected}`);
  console.log(`   <${component}> ${actualString}`);
  console.log(`   Expectation Met: ${expectationMet}`);
  
  if (!expectationMet) {
    console.log(`   Discrepancy: actual: ${actualString} / expected: valid ${expected}`);
  }
}
```

## Prevention
**MANDATORY:** Never hardcode verification results in logging systems.

1. **Always perform actual comparison** - Compare expected vs actual values
2. **Verify value existence** - Check for undefined/null before claiming success
3. **Log discrepancies only when false** - Discrepancy field appears only on failures
4. **Use verification functions** - Create reusable verification helpers
5. **Test logging system** - Verify logging reports false when expectations fail

## Applicability
**When to apply:**
- All logging systems with expectation verification
- Debugging tools that report success/failure
- Any system that claims "verified" or "validated"
- Test result reporting systems

**Keywords:** ["false-positive-logging", "verification-honesty", "logging-integrity", "expectation-verification", "discrepancy-logging"]
