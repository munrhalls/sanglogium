# Test Organization Patterns

**Date:** 2026-04-13
**Source:** Test refactoring experience
**Severity:** High
**Frequency:** Systemic (applies to all test development)

## The Problem
Large monolithic test files become difficult to maintain, understand, and navigate. Tests lack clear thematic boundaries and execution flow order.

## Root Cause
- Tests organized by file size rather than logical flow
- No clear separation between different testing concerns
- Missing thematic organization principles
- Integration tests not scoped to actual user flows

## The Fix
```typescript
// Before: Monolithic file
describe('Checkout Button to Redis Queue', () => {
  // 20+ mixed tests covering everything
})

// After: Thematic organization
// request-formation.test.ts - Button click + API request formation
// queue-operations.test.ts - Redis queue addition scenarios  
// error-handling.test.ts - Error scenarios
```

## Prevention
**MANDATORY TEST ORGANIZATION RULES:**

1. **Avoid Monolithic Files**
   - Split tests when > 15 tests or > 200 lines
   - Use thematic boundaries, not arbitrary line counts

2. **Integration Test Scope**
   - Always test real user flows: "button click -> next step"
   - Small scope: 1 action -> 2 subsequent steps maximum
   - No mocking of core functionality being tested

3. **Thematic Organization**
   - Group by domain concern (request formation, queue ops, errors)
   - Maintain execution flow order within themes
   - Each file should have a single, clear responsibility

4. **File Naming Convention**
   - Use descriptive names: `{theme}.test.ts`
   - Avoid generic names like `integration.test.ts`
   - Include context in path: `integration/checkout-button-to-redis-queue/`

## Applicability
**When to apply:**
- All integration test development
- Refactoring existing test suites
- Test file exceeds 15 tests or 200 lines
- Multiple concerns mixed in one test file

**Keywords:** ["test-organization", "thematic-testing", "integration-flows", "monolithic-tests", "test-naming"]
