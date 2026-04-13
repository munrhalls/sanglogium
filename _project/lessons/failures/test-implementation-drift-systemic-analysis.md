# Test Implementation Drift - Systemic Analysis

**Date:** 2026-04-13
**Source:** Root cause analysis of phantom coverage in Token State Machine Logic.test.ts
**Severity:** Critical
**Frequency:** Systemic (occurs when tests written without implementation)

## The Problem
Token State Machine Logic.test.ts was testing its own implementation instead of importing from source, creating phantom coverage and false confidence. The test passed while verifying nothing real.

## Root Cause
1. **Temporal Blindness**: Test written before implementation existed
2. **No Import Discipline**: Created test-local functions instead of importing
3. **Lesson System Gap**: /retrieve-lessons only prevents, doesn't detect existing violations
4. **False Confidence**: System presented lessons as if being followed

## The Fix
```typescript
// WRONG (in test):
const transition = (from: TokenState, to: TokenState): boolean => {
  // Test-local implementation
}

// RIGHT:
import { isValidTransition } from '@/lib/checkout/reservation/state-machine'
// Test the actual function
```

## Prevention
**MANDATORY RULES:**
1. **NO TEST IS BETTER THAN A LYING TEST** - Never create test-local implementations
2. **Test-First Allowed**: Write test as if implementation exists, import from non-existent source
3. **ZERO MOCKS**: Never mock or recreate functions in tests
4. **Import-Only Discipline**: All unit tests must import from source files

## Applicability
**When to apply:**
- All unit test writing
- Test-first development (RGR)
- When implementation doesn't exist yet

**Keywords:** ["test-drift", "phantom-coverage", "import-only", "test-first", "no-mocks", "false-confidence"]
