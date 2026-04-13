# Test-Local Implementations Anti-Pattern

**Date:** 2026-04-13
**Source:** Phantom coverage in Token State Machine Logic.test.ts
**Severity:** Critical
**Frequency**: Systemic (tempting when implementation doesn't exist)

## The Problem
Creating functions, classes, or logic inside test files instead of importing from source code.

## Root Cause
1. Implementation doesn't exist yet
2. Developer wants test to pass
3. Creates test-local version of function
4. Test passes but verifies nothing real

## The Fix
```typescript
// ANTI-PATTERN:
describe('Test', () => {
  const transition = (from: TokenState, to: TokenState): boolean => {
    // Test-local implementation - WRONG!
  }
})

// CORRECT:
import { isValidTransition } from '@/lib/checkout/reservation/state-machine'
describe('Test', () => {
  // Test will fail until implementation exists - THAT'S OK
})
```

## Prevention
**ABSOLUTE PROHIBITION:**
- Never define functions in tests that exist in implementation
- Never create classes in tests
- Never mock pure functions
- 0 test is better than lying test

**Test-First Exception:**
- Allowed to write test before implementation
- Must import from non-existent source
- Test will fail until implementation exists
- NEVER create test-local version

## Applicability
**When to apply:**
- All unit testing
- Test-first development (RGR)
- When implementation missing

**Keywords:** ["test-local", "anti-pattern", "phantom-coverage", "test-first", "no-mocks"]
