# Human Verification Patterns

**Date:** 2026-04-13
**Source:** Test organization and verification experience
**Severity:** High
**Frequency:** Universal (applies to all integration testing)

## The Problem
Human verification guides are disconnected from tests, making them hard to find and use. Developers write tests but lack clear manual verification procedures that align with test organization.

## Root Cause
- Human verification guides stored separately from tests
- No thematic alignment between tests and verification procedures
- Missing scoped verification that matches test boundaries
- Verification documents become stale and unused

## The Fix
```typescript
// Structure: integration/{flow}/
//   - {theme}.test.ts          // Automated tests
//   - human-verification/
//     - {theme}.md             // Manual verification guide

tests/checkout/guest-checkout-inventory-reservation/integration/
  checkout-button-to-redis-queue/
    request-formation.test.ts
    queue-operations.test.ts
    error-handling.test.ts
    human-verification/
      request-formation.md
      queue-operations.md
      error-handling.md
```

## Prevention
**MANDATORY HUMAN VERIFICATION PATTERNS:**

1. **Co-locate with Tests**
   - Human verification folder inside integration test directory
   - Same thematic organization as test files
   - One verification file per test theme

2. **Mirror Test Structure**
   - request-formation.test.ts -> human-verification/request-formation.md
   - queue-operations.test.ts -> human-verification/queue-operations.md
   - error-handling.test.ts -> human-verification/error-handling.md

3. **Scope Alignment**
   - Verification scope matches test scope exactly
   - IN SCOPE/OUT OF SCOPE sections in each verification file
   - Bus stops limited to test boundaries

4. **Bus Stop Organization**
   - Each verification file contains relevant bus stops only
   - Clear flow from start to end of scope
   - Expected results for each bus stop

5. **Integration Path Structure**
   ```
   tests/{feature}/integration/{user-flow}/
     {theme}.test.ts              // Automated test
     human-verification/
       {theme}.md                 // Manual verification guide
   ```

## Applicability
**When to apply:**
- All integration test creation
- Manual verification guide writing
- Test organization refactoring
- Feature development with integration tests

**Keywords:** ["human-verification", "test-alignment", "verification-guides", "bus-stops", "manual-testing", "integration-verification"]
