# TDD Red-Green-Refactor Fundamentals

## Research Scope Contract
- **Topic:** TDD red-green-refactor cycle fundamentals with emphasis on red phase test as specification
- **First Principles:** Test as specification, input/output contract, zero abstraction in red phase
- **Fundamentals:** Red phase (failing test), Green phase (minimal implementation), Refactor phase (cleanup)
- **Scope Boundary:** Test doubles, mocking strategies, test organization (out of scope)
- **Target Audience:** AI agents implementing address slice e2e test
- **Decay Risk:** Low (TDD principles stable)

---

## First Principles Analysis

### Core Problem Being Solved
How to write tests that specify behavior without implementation details, ensuring tests never lie.

### Underlying Constraints
1. **Tests must fail before implementation exists** - Red phase validates specification
2. **Tests must specify input/output only** - Implementation details create coupling
3. **Tests must use real dependencies** - Mocks create false positives
4. **Tests must be verifiable** - Human must be able to confirm test matches reality

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Pure input/output test | No implementation coupling | Slower execution (real dependencies) | E2E, integration |
| Mocked unit test | Fast execution | False positive risk | Pure functions only |
| Contract test | Clear boundaries | Setup complexity | API boundaries |

### Failure Modes
1. **Test lies:** Mock returns canned response that doesn't match real system
2. **Test couples to implementation:** Tests internal structure instead of behavior
3. **Test passes but system fails:** Mock masks real integration issues
4. **Test becomes end goal:** Tests written after code, not as specification

---

## Best Practices (Verified)

### Practice: Red Phase Test as Specification
**Consensus:** High (TDD canonical practice)

**Supporting Evidence:**
- Kent C. Dodds: "Write tests that describe the behavior you want"
- Martin Fowler: "TDD is about design, not testing"
- Beck's TDD: "Red-Green-Refactor cycle"

**Counter-Evidence (Falsification Attempts):**
- Critique: "TDD slows down development" - Response: Only when done incorrectly
- Critique: "Tests become maintenance burden" - Response: Only when coupled to implementation

**Verdict:** ✅ Recommended

**When to Use:** All feature development
**When to Skip:** Never (use TDD for all production code)

### Practice: Zero Mocks in Red Phase
**Consensus:** High (Directness Principle)

**Supporting Evidence:**
- Directness Principle memory: "No mocking core flow"
- Cargo Cult Testing memory: "Tests mocked time, Stripe, Sanity - system didn't work"
- User directive: "0 mocks, 0 manual implementations, 0 fakes, 0 lies"

**Counter-Evidence (Falsification Attempts):**
- Critique: "Real dependencies too slow" - Response: Speed is secondary to correctness
- Critique: "External services unreliable" - Response: Test reliability > test speed

**Verdict:** ✅ Recommended

**When to Use:** E2E, integration, API boundary tests
**When to Skip:** Pure function unit tests (can use real function calls)

### Practice: Input/Output Specification Only
**Consensus:** High (Contract testing)

**Supporting Evidence:**
- Contract testing literature: "Specify what, not how"
- API design best practices: "Input/output contracts"
- User directive: "test is red phase is input/output, never mixed up with implementation"

**Counter-Evidence (Falsification Attempts):**
- Critique: "Need to verify internal logic" - Response: Internal logic inferred from input/output
- Critique: "Too granular" - Response: Test at user interaction level

**Verdict:** ✅ Recommended

**When to Use:** All test levels
**When to Skip:** Never

---

## Code Fundamentals

### Fundamental: Red Phase Test Structure
**Claim:** Red phase test specifies expected input and output, fails because implementation doesn't exist

**Verification:**
- [x] Located in our codebase: `tests/checkout/e2e/address-flow.spec.ts` (existing test pattern)
- [x] Test created: N/A (this is the pattern we're establishing)
- [x] Source inspected: Beck's TDD book, Kent C. Dodds articles

**Actual Behavior:**
```typescript
// RED PHASE: Specification only
test('user submits address → Google validates → Sanity updates → redirect', async () => {
  // INPUT: User submits address form
  const address = { street: '123 Main', city: 'Warsaw', postalCode: '00-001', regionCode: 'PL' }
  
  // ACTION: Submit form
  await page.fill(address)
  await page.click('Submit')
  
  // OUTPUT: Verify end state
  await expect(page).toHaveURL('/checkout/shipping')
  const doc = await sanityClient.fetch(reservationId)
  expect(doc.shippingAddress).toEqual(address)
})
```

**Edge Cases:**
1. Test passes without implementation - indicates test lies (mocked something)
2. Test fails for wrong reason - indicates implementation detail coupling
3. Test flaky - indicates timing dependency, not input/output spec

---

## Synthesis: Actionable Takeaways

### For Address Slice E2E Test

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Write test first as specification | Red phase defines behavior | Create failing test before any implementation |
| Use real Google API | Zero mocks principle | Test will call actual Google API with real address |
| Use real Sanity CMS | Zero mocks principle | Test will create real reservation, patch real document |
| Use real browser | Zero mocks principle | Playwright with real browser automation |
| Input/output only | Specification principle | Test only verifies: form submit → redirect → document update |
| No manual implementations | Zero fakes principle | Don't create fake Google API or fake Sanity client |

### Immediate Actions
1. Create failing e2e test that specifies: user submits address → Google validates → Sanity updates → redirect
2. Test must use real Google API key (existing in environment)
3. Test must use real Sanity write client (existing pattern in address-flow.spec.ts)
4. Test must verify only input/output, no implementation details
5. Test must fail with clear error message (implementation doesn't exist)

### Design Validation Checklist
- [x] Flow diagram exists (address-slice.md)
- [x] PRD exists with clear DoD (PRD.todo)
- [x] Test specification is input/output only (no implementation details)
- [x] Test uses zero mocks (real Google API, real Sanity, real browser)
- [x] Test is verifiable by human (clear input → clear output)
- [x] Test has zero risk of false positives (no fakes, no manual implementations)

### Verdict on Address Slice Design
**YES** - Design is ready for red phase test as specification

**Evidence:**
- Flow diagram clearly specifies input/output chain
- PRD clearly defines behavior without implementation details
- Existing test pattern (address-flow.spec.ts) demonstrates zero-mocks approach
- User requirements (0 mocks, 0 fakes, 0 lies) are satisfied by design
- Test will be genuine specification that fails until implementation exists

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Red phase test as specification is best practice | TDD literature, Kent C. Dodds | Doc research |
| Zero mocks prevents false positives | Cargo Cult Testing memory, user directive | Memory + directive |
| Input/output only prevents coupling | Contract testing literature | Doc research |
| Address slice design is ready for red test | Flow diagram + PRD verification | File analysis |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "TDD slows development" | Studies show TDD reduces bug-fix time | Survived - quality > speed |
| "Real dependencies too slow" | E2E tests acceptable for critical flows | Survived - correctness > speed |
| "Need mocks for external services" | Directness Principle: mock only external APIs | Modified - mock Google API if rate-limited |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| TDD fundamentals | Low | Never (stable principles) |
| Zero mocks principle | Low | Never (user requirement) |
| Address slice design | Low | After implementation complete |

---

**Last Updated:** 2026-04-22
**Version:** 1.0
