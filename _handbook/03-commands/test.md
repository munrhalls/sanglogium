# Command Reference: /Test

---

## Purpose

Test execution and verification with strict containment.

**Agent Role:** Test Automation Engineer

---

## Input (Human Required)

### Explicit Rough Scope
```
[What needs to be tested and the exact target state]
```

### Explicit Rough DoDs
```
[Definitions of Done for testing: what confirms testing is complete?]
```

---

## Phase 1: Plan and Contain (MANDATORY)

### 1.1 Explicit Refined Scope
Translate Rough Scope into strict testing target state.

**Identify Test Type:**
- **Unit:** Isolated function/component logic (Jest/Vitest)
- **Integration:** Multi-component interaction (Jest)
- **E2E:** Full user flow (Playwright)

### 1.2 Explicit Refined DoDs
Atomic, sequential test execution tasks.

**Format:**
```
DoD 1.1 — [Test Category]
- [ ] [Specific test to run/create]
- [ ] [Expected result]
Verification: [exact command]
```

### 1.3 Read-Only Context Paths
Files for context only:
- Components under test
- Their dependencies
- Existing test patterns

### 1.4 Test Files to Create/Modify
List ONLY test files permitted to change:
```
- tests/unit/[name].test.ts
- tests/integration/[name].test.ts
- tests_e2e/[name].spec.ts
```

**Follow repository structure:**
- `tests/` for unit/integration
- `tests_e2e/` for e2e

### 1.5 Verification Command
Exact command to run tests:
```
npm run test
npm run test:e2e
npx jest tests/specific.test.ts
npx playwright test tests_e2e/specific.spec.ts
```

---

## Phase 2: Execution Rules

### 2.1 Sequential Execution
Execute DoDs in exact order.

### 2.2 Repository Testing Patterns

**Unit Tests:**
- Isolated function/component logic
- No external dependencies
- Fast execution

**Integration Tests:**
- Multi-component interactions
- Data fetching patterns
- API contract validation

**E2E Tests:**
- Full user flows
- Playwright browser automation
- Critical path coverage

### 2.3 Test File Naming
```
*.test.ts    → Jest/Vitest unit/integration
*.spec.ts    → Playwright E2E
```

### 2.4 Test Data
- Use existing fixtures from `tests_e2e/*/cases_*.json`
- Create minimal test data
- Clean up after tests

### 2.5 Scope Containment
Modify ONLY test files in Test Files to Create/Modify list.

---

## Phase 3: Verification & Output

### 3.1 Execute Verification Command
```powershell
[Command from Phase 1.5]
```

### 3.2 Failure Analysis
If tests fail:
1. Analyze failure output
2. Fix test OR fix implementation
3. Re-run until all pass
4. Do NOT proceed until 100% pass

### 3.3 Test Results Summary
Output format:
```
[Test Results Summary]

Total tests run: [N]
Passed: [N] ✅
Failed: [N] ❌
Coverage impact: [+%] (if applicable)

Test categories:
- Unit: [N] passed
- Integration: [N] passed
- E2E: [N] passed
```

### 3.4 Commit Generation
Use appropriate category:
- A (if testing closes DoD item)
- D (if adding testing infrastructure)

---

## Test Creation Patterns

### Unit Test Pattern
```typescript
// tests/unit/[component].test.ts
describe('[Component]', () => {
  it('[behavior]', () => {
    // Arrange
    const props = { ... };

    // Act
    const result = functionUnderTest(props);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Integration Test Pattern
```typescript
// tests/integration/[flow].test.ts
describe('[Feature] Integration', () => {
  it('fetches and renders data correctly', async () => {
    // Act
    const result = await fetchData();

    // Assert
    expect(result).toMatchSchema(expectedSchema);
  });
});
```

### E2E Test Pattern
```typescript
// tests_e2e/[flow].spec.ts
test('[user flow]', async ({ page }) => {
  // Navigate
  await page.goto('/path');

  // Interact
  await page.click('[data-testid="button"]');

  // Assert
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
});
```

---

## Quick Reference Card

```
/test [testing scope] [target state]

Phase 1: Plan (DEFINE)
  - Identify test type
  - List test files
  - Define verification command

Phase 2: Execute (RUN/CREATE)
  - Create missing tests
  - Run all tests
  - Fix failures

Phase 3: Verify (REPORT)
  - 100% pass required
  - Output summary
  - Generate commit
```

---

**Related:** [implement.md](implement.md) | [debug.md](debug.md)
