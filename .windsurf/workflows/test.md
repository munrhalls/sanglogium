# /test [FEATURE_OR_COMPONENT]

**Input:** Feature or component to test (e.g., "basket checkout flow", "product search")
**Output:** Minimal, high-value tests that verify actual user behavior without bloat or implementation coupling

---

## Philosophy

> **Tests exist to provide confidence that application works when users use it.**

This workflow produces minimal, high-value tests by focusing on:
- **Use case coverage** over code coverage
- **Behavior verification** over implementation verification
- **Integration tests** over isolated unit tests
- **Essential scenarios** over exhaustive edge cases

**Anti-patterns to avoid:**
- Test bloat and cargo-cult testing
- Unnecessary or redundant test cases
- Development slowdown from false/nonsense tests
- Ill-conceived, unprofessional test patterns
- White box testing that couples to implementation details

---

## Execution Protocol

### Phase 1: Scope Definition (2 minutes)
**Goal:** Identify what actually needs testing based on user value.

**Questions to answer:**
1. What user behavior does this feature support?
2. What are the critical use cases (happy path, key edge cases)?
   **Note:** Edge case tests only after happy path tests pass and are marked ✓ in beads issue.
3. What would break if this fails in production?
4. What is already tested by integration/contract tests?

**Output:** Test scope contract
```markdown
## Test Scope
- **Feature:** [feature name]
- **Critical Use Cases:** [2-3 most important user scenarios]
- **Already Covered:** [what existing tests already verify]
- **Out of Scope:** [what explicitly NOT to test]
```

---

### Phase 2: Test Selection (3 minutes)
**Goal:** Choose minimal test types that provide maximum confidence.

**Decision Tree:**
1. **Is this a pure algorithm/function?**
   - Yes → Unit test with simple inputs
   - No → Go to step 2

2. **Does this involve component integration or external deps?**
   - Yes → Integration test with real dependencies (minimal mocking)
   - No → Go to step 3

3. **Is this a critical user flow?**
   - Yes → E2E test for happy path
   - No → Integration test for key scenarios

**Rule of Thumb:**
- 70% integration tests
- 20% unit tests (for pure logic)
- 10% E2E tests (for critical flows)

**Stop Criteria:**
- Stop when critical use cases are covered
- Stop when additional tests provide diminishing confidence
- Stop when tests would verify implementation details

---

### Phase 3: Test Writing (5-10 minutes per test)
**Goal:** Write minimally passing tests that verify behavior.

**Test Structure: Arrange-Act-Assert**
```typescript
// Arrange: Setup minimal state
const input = simplestValueNeeded();

// Act: Execute the behavior
const result = systemUnderTest(input);

// Assert: Verify expected behavior
expect(result).toEqual(expectedOutput);
```

**Naming Convention:** `Method_Scenario_ExpectedBehavior`
```typescript
test('addToBasket_validItem_addsToBasket', () => { ... });
test('addToBasket_outOfStock_returnsError', () => { ... });
test('checkout_emptyBasket_returnsValidationError', () => { ... });
```

**Principles:**
1. **Minimally passing:** Use simplest input that verifies the behavior
2. **Behavior-focused:** Test what the system does, not how it does it
3. **No magic strings:** Use named constants for test values
4. **Avoid implementation details:** Don't test internal state, private methods, or component structure

**Example:**
```typescript
// ❌ BAD - Tests implementation
test('basketState_itemCount_increments', () => {
  expect(basket.items.length).toBe(1); // Coupled to internal structure
});

// ✅ GOOD - Tests behavior
test('addToBasket_validItem_basketContainsItem', () => {
  addToBasket(product);
  expect(basket.contains(product)).toBe(true); // User-facing behavior
});
```

---

### Phase 4: Anti-Pattern Check (1 minute per test)
**Goal:** Ensure test doesn't introduce maintenance burden.

**Checklist:**
- [ ] Does this test verify user behavior or implementation details?
- [ ] Would this test break if I refactored the code without changing behavior?
- [ ] Is this test duplicating coverage from another test?
- [ ] Is this test using the simplest input needed?
- [ ] Is this test name descriptive of the use case?

**If any answer is NO:** Refactor or delete the test.

---

### Phase 5: Integration with /implement (Definition of Done)
**Goal:** Verify each DoD item with appropriate test coverage.

**For each DoD item:**
1. Identify the user behavior the item enables
2. Select test type based on decision tree (Phase 2)
3. Write minimally passing test (Phase 3)
4. Verify no anti-patterns (Phase 4)
5. Run test to confirm it passes

**Verification Command:**
```bash
# Lightweight: typecheck only (no heavy build)
npx tsc --noEmit

# Test suites (run individually to avoid resource starvation):
npm run test:unit
npm run test:integration
npm run test:e2e
```

**DoD Item Verification Template:**
```markdown
### DoD Item: [item description]
- **User Behavior:** [what user can do]
- **Test Type:** [unit/integration/e2e]
- **Test File:** [path to test]
- **Test Coverage:** [which use cases verified]
- **Verification:** ✅ PASS / ❌ FAIL
```

---

## Quality Gates

### Before Committing Tests
- [ ] All tests pass
- [ ] No test names contain implementation details
- [ ] No tests mock more than necessary
- [ ] Test coverage focused on critical paths (not chasing 100%)
- [ ] Each test has clear, descriptive name following convention

### Coverage Guidelines
- **Target:** 70% coverage of critical paths
- **Avoid:** Testing trivial code (getters, simple wrappers)
- **Avoid:** Testing framework/library code
- **Focus:** Code that handles business logic and user interactions

---

## Common Pitfalls

### Pitfall: Testing Implementation Details
**Symptom:** Tests break when refactoring without behavior change
**Fix:** Test behavior instead. If internal state matters, expose via API.

### Pitfall: Over-Mocking
**Symptom:** Tests pass but production fails due to integration issues
**Fix:** Use real dependencies in integration tests. Mock only external services (email, payment).

### Pitfall: Cargo-Cult Testing
**Symptom:** Writing tests because "tests are good" without understanding value
**Fix:** Start with question: "What user behavior does this test verify that gives me confidence?"

### Pitfall: Chasing 100% Coverage
**Symptom:** Spending time testing trivial code to hit metric
**Fix:** Stop at 70% coverage of critical paths. Diminishing returns beyond.

---

## Integration Points

### With /implement Workflow
The /test workflow is invoked by /implement for each Definition of Done item:
```
/implement → [for each DoD item] → /test → verification → continue
```

### With /verify Workflow
/test produces test artifacts that /verify can execute:
```bash
# /verify runs (lightweight; avoid heavy build during concurrent agents):
npm run test
npx tsc --noEmit
```

### With Existing Test Infrastructure
- Unit tests: `vitest.config.mts`
- Integration tests: `vitest.integration.config.ts`
- E2E tests: `playwright.config.ts`

---

## Example Usage

### Scenario: Testing basket checkout flow

**Phase 1: Scope**
```markdown
## Test Scope
- Feature: Basket checkout flow
- Critical Use Cases: 
  1. Valid items → successful checkout
  2. Out of stock item → error
  3. Empty basket → validation error
- Already Covered: Item addition (existing integration tests)
- Out of Scope: Payment processing (external service, mocked)
```

**Phase 2: Selection**
- Checkout involves component integration → Integration test
- Happy path is critical → Add E2E test for full flow

**Phase 3: Writing**
```typescript
// Integration test
test('checkout_validItems_createsOrder', () => {
  // Arrange
  const basket = createBasketWithItems([product1, product2]);
  
  // Act
  const order = checkout(basket);
  
  // Assert
  expect(order.id).toBeDefined();
  expect(order.items).toEqual([product1, product2]);
});

// E2E test
test('checkoutFlow_userAddsItemsAndChecksOut_orderCreated', async () => {
  await page.goto('/basket');
  await page.click('[data-testid="checkout-button"]');
  await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
});
```

**Phase 4: Anti-Pattern Check**
- ✅ Verifies user behavior (order creation)
- ✅ Won't break on refactoring (tests behavior, not internal state)
- ✅ No duplication
- ✅ Simple input
- ✅ Descriptive name

**Phase 5: DoD Verification**
```markdown
### DoD Item: Users can checkout with items in basket
- User Behavior: User can complete checkout and receive order confirmation
- Test Type: Integration + E2E
- Test File: tests/checkout/integration/checkout.spec.ts
- Test Coverage: Valid items checkout, empty basket validation
- Verification: ✅ PASS
```

---

## References
- Research artifact: `_project/research/minimal-testing-workflow.md`
- Kent C. Dodds: "Write tests. Not too many. Mostly integration."
- Microsoft: "Unit testing best practices"
- Codepipes: "Software Testing Anti-patterns"
