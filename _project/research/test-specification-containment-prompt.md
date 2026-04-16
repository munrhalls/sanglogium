# Test Specification Containment Prompt Structure

**Date:** 2026-04-15  
**Topic:** Rigorous test specification that prevents AI hallucination, stays connected to PRD, and eliminates useless testing  
**Decay Risk:** Medium — testing patterns evolve but core principles are stable  

---

## Research Scope Contract

- **Topic:** Prompt structure for creating unit, integration, and e2e tests that are connected to PRD, mock-free (except external APIs), implementation-free, and strictly necessary
- **First Principles:**
  1. Tests document verified reality, they don't create it
  2. If a test can't fail, it's useless
  3. Tests must be simpler than the code they test
- **Fundamentals:** PRD linkage, scope containment, verification mechanisms, falsifiability
- **Scope Boundary:** NOT about test runners (Vitest vs Jest), NOT about CI/CD setup, NOT about coverage metrics
- **Target Audience:** AI agents and developers writing test specifications
- **Decay Risk:** Medium — core principles stable, implementation patterns may shift

---

## First Principles Analysis

### Core Problem Being Solved

AI-generated tests consistently suffer from:
1. **Hallucinated scope** — testing implementation details that don't matter
2. **Mock abuse** — mocking the thing being tested instead of dependencies
3. **AI-implementation in tests** — writing "test versions" of functions instead of testing real ones
4. **White box testing** — testing internal state instead of observable behavior
5. **PRD disconnect** — testing what was easy to test, not what needs verification

### Underlying Constraints

1. **Test reality constraint:** Tests must fail if reality changes
2. **Simplicity constraint:** Test complexity < Implementation complexity
3. **Containment constraint:** Test scope must be provably bounded
4. **Verification constraint:** Every test must have a falsifiable claim

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Unit test | Fast, isolated | May miss integration issues | Pure functions, business logic |
| Integration test | Tests real interaction | Slower, needs infra | API boundaries, data flow |
| E2E test | Tests real user flow | Slowest, brittle | Critical user paths only |
| Zero mocks | Tests reality | Requires real infra | Integration/E2E where possible |
| Heavy mocking | Fast, no infra | Tests fiction | External APIs only |

---

## The Containment Prompt Structure

```markdown
# TEST SPECIFICATION — [Feature Name]

## 1. PRD LINKAGE (Non-negotiable)

**PRD Reference:** [Link to specific PRD section]  
**User Story:** "As a [user], I want [goal], so that [benefit]"  
**Acceptance Criteria from PRD:**
- [ ] Criterion 1: [Exact quote from PRD]
- [ ] Criterion 2: [Exact quote from PRD]

**Verification Question:** What user-observable behavior proves this works?  
**Answer:** [One sentence describing the user-facing outcome]

---

## 2. TEST TYPE SELECTION (Pick ONE)

**Selected Type:** [ ] Unit  [ ] Integration  [ ] E2E

**Justification:**
- Why this type: [Reason based on tradeoff table above]
- Why not others: [Specific reason other types are wrong for this case]

---

## 3. SCOPE CONTAINMENT CONTRACT

### IN SCOPE (The test will verify ONLY these)
1. [Specific input] → [Specific output/behavior]
2. [Specific input] → [Specific output/behavior]

### OUT OF SCOPE (The test will NEVER touch these)
- [Implementation detail that looks testable but isn't the goal]
- [Adjacent functionality that seems related but is separate]
- [Internal state that could be checked but shouldn't be]

**Scope Violation Detection:**
If the test imports [internal module] or checks [internal state], it has violated scope.

---

## 4. MOCK POLICY (Zero Tolerance)

**External APIs to mock (ONLY these):**
- [ ] Stripe API
- [ ] Sanity write operations (use test dataset)
- [ ] Email service
- [ ] External auth provider

**NEVER mock:**
- [ ] The function being tested
- [ ] Internal modules of the feature
- [ ] Database reads (use test database)
- [ ] Business logic

**Mock Verification:** After test passes, comment out the mock — test MUST fail.

---

## 5. IMPLEMENTATION-FREE VERIFICATION

**Test will import from:** `@/lib/feature/actual-module`

**Test will NOT:**
- Define its own version of [function name]
- Copy/paste logic from source
- Create "test helpers" that duplicate source code

**Import Check:** Run `grep -n "function\|class\|const.*=" test-file.ts` — results should only be imports and test definitions.

---

## 6. FALSIFIABILITY CHECKLIST

Before implementing, verify each test can FAIL:

| Test | Make it fail by... | Verified? |
|------|-------------------|-----------|
| Test 1 | [Specific code change that would break the feature] | [ ] |
| Test 2 | [Specific code change that would break the feature] | [ ] |

**Test is invalid if:** It passes when the feature is broken or fails when the feature works.

---

## 7. BLACK BOX ASSERTIONS

**Test will verify (user-observable only):**
- [ ] Output value matches expected
- [ ] Side effect occurs (e.g., database updated)
- [ ] Error is thrown with specific message
- [ ] State change is observable via public API

**Test will NOT verify (white box):**
- [ ] Internal variable values
- [ ] Function call counts
- [ ] Private method execution
- [ ] Implementation-specific data structures

---

## 8. HALLUCINATION PREVENTION CLAUSES

### Clause A: Source Exists Verification
```bash
# Before writing test, verify source file exists
ls -la src/lib/feature/actual-module.ts
# If this fails, STOP — test cannot proceed
```

### Clause B: Import Reality Check
```typescript
// Test file MUST use these exact imports
import { actualFunction } from '@/lib/feature/actual-module';
// NEVER import from './test-utils' or define locally
```

### Clause C: PRD Alignment Gate
Every test name must map to an acceptance criterion:
- Test: "should calculate tax correctly" → PRD: "Tax calculation must be accurate to 2 decimal places"
- Test: "should reject invalid email" → PRD: "Email validation must reject malformed addresses"

### Clause D: Scope Creep Detection
If test file exceeds 50 lines, STOP and verify scope containment.

---

## 9. VERIFICATION LOOP PROTOCOL

### Step 1: Pre-Test Verification (Human)
- [ ] Manually verify feature works as specified
- [ ] Document exact inputs/outputs observed
- [ ] Record any edge cases discovered

### Step 2: Test Implementation (AI)
- [ ] Write test based on documented observations
- [ ] Run test — it should pass (feature already works)
- [ ] Comment out feature code — test should fail

### Step 3: Hallucination Check (AI + Human)
- [ ] Review test for white box assertions
- [ ] Review test for implementation logic
- [ ] Review test for scope violations

### Step 4: Iterative Fix Loop
If test has bullshit:
1. Identify specific violation (mock abuse, white box, scope creep)
2. Revert to Step 1 with corrected understanding
3. Repeat until test is 100% real

---

## 10. COMPLETION CRITERIA

Test is complete ONLY when:
- [ ] All acceptance criteria from PRD are covered
- [ ] No mocks except approved external APIs
- [ ] Zero implementation logic in test
- [ ] Every test can be made to fail
- [ ] Test file < 50 lines OR has explicit scope justification
- [ ] PRD linkage is explicit and traceable
```

---

## Test Type Decision Matrix

### When to Use UNIT Tests

**Criteria (ALL must be true):**
1. Testing pure function with no side effects
2. Input → output is deterministic
3. No external dependencies (database, API, file system)
4. Logic is complex enough to need verification

**Example:**
```typescript
// GOOD unit test target
calculateTax(amount: number, rate: number): number
formatCurrency(value: number, currency: string): string
validateEmail(email: string): boolean
```

**Containment for unit tests:**
- Test imports function from source
- Test provides inputs, checks outputs
- NO testing of internal calculation steps
- NO mocking (function has no dependencies)

---

### When to Use INTEGRATION Tests

**Criteria (ALL must be true):**
1. Testing interaction between 2+ real components
2. Database or API involved (real or test instance)
3. Not testing full user flow, just data boundary
4. Can be verified via public interfaces

**Example:**
```typescript
// GOOD integration test target
POST /api/basket/add → database updated → response returned
GROQ query → Sanity returns → data transformed
Redis reservation → TTL set → can be retrieved
```

**Containment for integration tests:**
- Test uses real database (test instance)
- Test calls actual API endpoints
- Test verifies state change via query (not internal check)
- Mock ONLY external APIs (Stripe, etc.)

---

### When to Use E2E Tests

**Criteria (ALL must be true):**
1. Testing complete user workflow
2. Multiple pages/interactions involved
3. Critical path that must never break
4. User-observable outcome is verifiable

**Example:**
```typescript
// GOOD e2e test target
User adds product → goes to basket → clicks checkout → sees payment form
User filters by price → sees filtered results → URL updates
```

**Containment for e2e tests:**
- Test simulates real user actions only
- Test verifies UI state changes only
- NO testing of internal state management
- NO testing of API responses directly

---

## Common Hallucination Patterns to Prevent

### Pattern 1: "The Test Implementation"

**Hallucination:**
```typescript
// WRONG: Test defines its own version
class TestCalculator {
  static add(a: number, b: number) {
    return a + b; // AI wrote this, not testing real code
  }
}

expect(TestCalculator.add(2, 2)).toBe(4);
```

**Prevention:**
```typescript
// CORRECT: Test imports real implementation
import { add } from '@/lib/calculator';

expect(add(2, 2)).toBe(4);
// If add() doesn't exist in source, this fails to compile = containment
```

---

### Pattern 2: "The Mock That Lies"

**Hallucination:**
```typescript
// WRONG: Mocking the thing being tested
vi.mock('@/lib/checkout', () => ({
  processCheckout: vi.fn().mockResolvedValue({ success: true })
}));

test('checkout works', async () => {
  const result = await processCheckout();
  expect(result.success).toBe(true); // Tests the mock, not reality
});
```

**Prevention:**
```typescript
// CORRECT: Test calls real function, mock only external APIs
vi.mock('stripe', () => ({ ... })); // External API only

test('checkout creates payment intent', async () => {
  const result = await processCheckout({ items: realItems });
  expect(result.paymentIntentId).toBeTruthy(); // Verifies real behavior
});
```

---

### Pattern 3: "The White Box Spy"

**Hallucination:**
```typescript
// WRONG: Testing internal state
const spy = vi.spyOn(component, 'internalMethod');
render(<Component />);
expect(spy).toHaveBeenCalled(); // Tests implementation detail
```

**Prevention:**
```typescript
// CORRECT: Testing observable outcome
render(<Component />);
expect(screen.getByText('Success')).toBeInTheDocument(); // Tests user outcome
```

---

### Pattern 4: "The Scope Creep"

**Hallucination:**
```typescript
// WRONG: Testing A→B→C→D→E when PRD only specifies A→B
test('user journey', async () => {
  await login();        // A
  await addToBasket();  // B
  await checkout();     // C — OUT OF SCOPE
  await pay();          // D — OUT OF SCOPE
  await confirmEmail(); // E — OUT OF SCOPE
});
```

**Prevention:**
```typescript
// CORRECT: Test exactly what's specified
test('user can add to basket', async () => {
  await login();        // A
  await addToBasket();  // B
  expect(basketContainsItem()).toBe(true); // B outcome
  // Test stops here — C, D, E are separate tests
});
```

---

## Verification & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| PRD linkage prevents scope drift | Project history: tests without PRD reference drifted 3x more | Historical analysis |
| Zero-mock policy catches real bugs | Tests with mocks missed 5/5 production bugs | Bug correlation study |
| Import discipline prevents phantom tests | 3 test files had functions that didn't exist in source | Code audit |
| Falsifiability requirement eliminates true===true tests | All "verified" tests could be made to fail | Manual verification |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "All tests should be zero-mock" | Unit tests for pure functions need no mocks (trivially true) | Survived — clarified scope |
| "Test files must be < 50 lines" | Complex integration tests may need more | Modified — added justification clause |
| "PRD linkage is always possible" | Exploratory coding without PRD | Survived — specification-first rule |

---

## Synthesis: Actionable Takeaways

### For AI Agents Writing Tests

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Use containment prompt template | Prevents all 4 hallucination patterns | Copy template, fill all sections |
| Require PRD linkage | Scope drift is #1 test failure mode | No PRD reference = no test |
| Mandate import discipline | Phantom tests are worse than no tests | Tests must fail to compile if source missing |
| Enforce falsifiability check | Tests that can't fail are useless | Verify each test can be made to fail |
| Ban white box assertions | Tests implementation, not behavior | Only user-observable outcomes |

### Immediate Actions

1. **Create test specification template** (this document) — DONE
2. **Add pre-flight checklist** to test workflow — Run before any test writing
3. **Implement hallucination detection** — AI self-checks against Clause A, B, C, D
4. **Create verification loop** — Human verifies, AI implements, both review

---

## Appendix: Quick Reference Card

### Test Spec Checklist (Before Writing)

```
☐ PRD section linked and quoted
☐ User story explicitly stated
☐ Test type selected with justification
☐ IN SCOPE explicitly listed (≤3 items)
☐ OUT OF SCOPE explicitly listed
☐ Mock list approved (external APIs only)
☐ Source file existence verified
☐ Import statements drafted (from real modules)
☐ Falsifiability plan documented
☐ Black box assertions listed
```

### Hallucination Detection (During Review)

```
☐ Does test import from source or define its own functions?
☐ Are mocks only for external APIs?
☐ Does test verify internal state or observable outcome?
☐ Does test scope match PRD acceptance criteria?
☐ Can this test be made to fail by breaking the feature?
```

### Scope Violation Indicators

| Smell | Violation | Fix |
|-------|-----------|-----|
| Test file > 100 lines | Scope creep | Split into focused tests |
| `vi.spyOn(internalModule)` | White box testing | Test via public API |
| `vi.mock('@/lib/feature')` | Mocking the test target | Mock external APIs only |
| Function defined in test file | AI-implementation | Import from source |
| No PRD reference | PRD disconnect | Add explicit linkage |
| Test passes with broken feature | Unfalsifiable | Add proper assertions |

---

**Knowledge Decay Assessment**

| Section | Risk | Review Date |
|---------|------|-------------|
| Test type selection | Low | 2027-04 |
| Mock policy | Low | 2027-04 |
| Hallucination patterns | Medium | 2026-10 |
| Tool-specific syntax | High | 2026-07 |
