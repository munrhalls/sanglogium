# Test Implementation Drift - Critical Protocol Violation

**Date:** 2026-04-13
**Source:** Unit test coverage audit for guest checkout reservation
**Severity:** Critical
**Frequency:** Systemic (occurs when tests are written without import discipline)

## The Problem
Three unit test files were testing functions that don't exist in the implementation, creating phantom coverage and false confidence. One test had drifted from the actual implementation, missing a critical field.

## Root Cause
1. **No import discipline** - Tests copied functions instead of importing from source
2. **No verification step** - No workflow to verify test functions actually exist
3. **No build-time validation** - TypeScript allows phantom tests because they're self-contained
4. **No pre-flight checks** - No protocol to align test suite with implementation

## The Fix
```typescript
// WRONG (in test file):
class FingerprintUtils {
  static generateFingerprint(request: QueueRequest): string {
    return JSON.stringify({
      type: request.type,
      payload: request.payload // MISSING priority!
    })
  }
}

// RIGHT (should be):
import { FIFOQueue } from '@/lib/checkout/reservation/fifo-queue'
// Test the actual method, not a copy
```

## Prevention
**MANDATORY:** Unit tests MUST import functions from source files. No copying, no recreating, no "test doubles" for pure functions.

### Protocol Steps:
1. **Import-Only Rule** - All unit tests must import the actual function being tested
2. **Pre-Flight Verification** - Check imports resolve before running tests
3. **Build-Time Guard** - Add rule to .windsurfrules enforcing import-only
4. **Audit Command** - Create /audit-tests to detect phantom implementations

## Applicability
**When to apply:**
- All unit test writing
- All test refactoring
- All new pure function implementations

**Keywords:** ["test-drift", "import-only", "phantom-tests", "test-verification", "unit-testing"]
