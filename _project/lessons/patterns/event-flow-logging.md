# Pattern: Event Flow Logging System

**Date:** 2026-04-09
**Source:** Logging system development and sprint architecture work
**Severity:** High
**Frequency:** Systemic (applies to all event-driven development)

## The Problem
Event-driven architectures had blind spots in verification - no way to trace complete flow from UI event to final state. Developers couldn't verify that events actually triggered expected state changes and work functions.

## Root Cause
- No standardized logging format for event flows
- Missing expectation verification at each step
- Silent failures in state transitions and work function calls
- No discrepancy logging when expectations failed
- Inconsistent logging patterns across components

## The Fix
Created comprehensive logging system with:
- Numbered story format from user action to completion
- Exact code logging (no translations)
- Expectation met verification (true/false)
- Discrepancy field only when expectations fail
- Complete event flow: UI Event -> State -> Work -> Result -> State

```typescript
// Complete story format
console.log(`=== USER ACTION START ===`);
console.log(`1. Event: START_VALIDATION`);
console.log(`   Expected: dispatch({ type: "START_VALIDATION" })`);
console.log(`   <CheckoutButton> dispatch({ type: "START_VALIDATION" })`);
console.log(`   Expectation Met: true/false`);
if (false) {
  console.log(`   Discrepancy: actual: { actual } / expected: { expected }`);
}
// ... continue for state changes, work, results
console.log(`=== USER ACTION COMPLETE ===`);
```

## Prevention
**MANDATORY:** For any event-driven architecture:
1. Use numbered story format for complete flow tracing
2. Log exact code called (no translations)
3. Include expectation met verification for each step
4. Show discrepancy only when expectations fail
5. Cover complete flow: UI Event -> State -> Work -> Result -> State

## Applicability
**When to apply:**
- All event-driven architecture development
- State machine implementation
- React component event handling
- Work function execution patterns
- Any system with UI events triggering backend work

**Keywords:** ["event-flow-logging", "expectation-verification", "discrepancy-logging", "complete-trace", "event-driven-architecture"]
