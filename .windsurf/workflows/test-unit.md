---
description: Pure function testing with zero mocks - import-only discipline for unit tests
---

# /test-unit Command Protocol

**System Directive:** You are a deterministic execution engine for unit testing pure functions and isolated business logic. One function, one claim, one assertion, one import.

**Input:** Function signature, business logic requirement, or pure computation that needs verification
**Output:** `tests/unit/[feature]/[function].test.ts` with 100% specification coverage

---

## Pre-Flight Containment Checklist

### 1. PRD LINKAGE (Non-negotiable)
- [ ] PRD section linked and quoted
- [ ] User story explicitly stated
- [ ] Acceptance criterion mapped to this function

### 2. Source Existence Verification
```bash
# BEFORE writing test, verify source file exists
ls -la src/lib/[feature]/[function].ts
# If this fails, STOP — test cannot proceed
```

### 3. Scope Containment Contract
**IN SCOPE (test verifies ONLY these):**
- Input → Output transformation
- Edge case handling
- Error conditions

**OUT OF SCOPE (test NEVER touches these):**
- Implementation details
- Internal variable states
- Helper function internals

### 4. Import-Only Discipline
```typescript
// CORRECT: Import from source
import { calculateTax } from '@/lib/tax/calculator';

// FORBIDDEN: Define in test file
function calculateTax(amount: number) { /* AI implementation */ }
```

### 5. Mock Policy (Zero Tolerance)
**NEVER mock:**
- The function being tested
- Internal modules
- Business logic
- Pure functions

**External APIs only (if any):**
- [ ] Stripe API
- [ ] External auth providers
- [ ] Third-party services

---

## Phase 1: Test Specification (10 min)

### Step 1: Define Input/Output Matrix
| Input | Expected Output | Edge Case? |
|-------|----------------|------------|
| `input1` | `output1` | No |
| `input2` | `output2` | Yes |

### Step 2: Write Import Statement
```typescript
import { [functionName] } from '@/lib/[feature]/[module]';
```

### Step 3: Draft Test Skeleton
```typescript
import { describe, it, expect } from 'vitest';
import { [functionName] } from '@/lib/[feature]/[module]';

describe('[FunctionName]', () => {
  it('[PRD criterion]: [description]', () => {
    // Arrange
    const input = [value];
    
    // Act
    const result = [functionName](input);
    
    // Assert
    expect(result).to[matcher](expected);
  });
});
```

---

## Phase 2: Implementation (15 min)

### Constraint Rules (Strictly Enforced)
- **NO** function definitions in test file
- **NO** business logic duplication
- **NO** internal state testing
- **NO** more than 1 assertion per test
- **MAX** 50 lines per test file
- **MAX** 5 test cases per function

### Test Template
```typescript
import { describe, it, expect } from 'vitest';
import { [functionName] } from '@/lib/[feature]/[module]';

describe('[PRD: Criterion Reference]', () => {
  it('[Scenario]: [expected behavior]', () => {
    expect([functionName](input)).to[matcher](expected);
  });

  it('[Edge case]: [expected behavior]', () => {
    expect([functionName](edgeInput)).to[matcher](expected);
  });
});
```

### Hallucination Detection
| Smell | Violation | Fix |
|-------|-----------|-----|
| `function` keyword in test | AI-implementation | Delete, import from source |
| `vi.mock('@/lib/[feature]')` | Mocking test target | Remove mock, use real function |
| `expect(component.internal)` | White box testing | Test public output only |
| Test file > 50 lines | Scope creep | Split or reduce scope |
| `const helper = () => {}` | Implementation in test | Move to source or remove |

---

## Phase 3: Falsification Verification (5 min)

### Step 1: Run Test (Should Pass)
```bash
npx vitest run tests/unit/[feature]/[function].test.ts --reporter=verbose
```

### Step 2: Force Failure (Must Fail)
Temporarily break the source function:
```typescript
// In source file, add:
return null; // or throw new Error('test');
```

Re-run test — **must fail**.

### Step 3: Restore and Confirm
Remove temporary break, re-run — **must pass**.

---

## Phase 4: Human Checkpoint (5 min)

### Review Checklist
- [ ] Test imports from real source file
- [ ] No function definitions in test
- [ ] Exactly 1 assertion per test
- [ ] File length ≤ 50 lines
- [ ] Runtime < 2 seconds
- [ ] PRD criterion explicitly covered
- [ ] Test fails when source breaks

### Completion Criteria
```markdown
✅ Test is complete when:
- Imports real function from source
- Has ≤ 5 test cases
- Each test has exactly 1 assertion
- File length ≤ 50 lines
- Runs in < 2 seconds
- Fails when source breaks
- Covers PRD acceptance criterion
```

---

## Verification Commands

```bash
# Run single test file
npx vitest run tests/unit/[feature]/[function].test.ts

# Run all unit tests for feature
npx vitest run tests/unit/[feature]/

# Watch mode (development)
npx vitest tests/unit/[feature]/[function].test.ts
```

---

## Output File Structure

```
tests/unit/
├── [feature]/
│   ├── [function].test.ts        # Main test file (max 50 lines)
│   └── README.md                 # Optional: input/output matrix documentation
```

---

## Example: Complete Unit Test

```typescript
// tests/unit/tax/calculateTax.test.ts
import { describe, it, expect } from 'vitest';
import { calculateTax } from '@/lib/tax/calculator';

describe('PRD: Tax calculation must be accurate to 2 decimal places', () => {
  it('calculates 20% tax on $100 correctly', () => {
    expect(calculateTax(100, 0.20)).toBe(20.00);
  });

  it('handles zero amount', () => {
    expect(calculateTax(0, 0.20)).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateTax(99.99, 0.20)).toBe(20.00);
  });
});
```

**Line count:** 17 lines ✅  
**Assertions:** 3 (1 per test) ✅  
**Imports:** From real source ✅  
**Runtime:** < 1 second ✅
