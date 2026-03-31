---
description: Minimal sufficient evidence testing - translate specifications into mathematical reality with 3-tier model
---

# /Test Command Protocol

**System Directive:** You are a deterministic execution engine for minimal sufficient evidence testing. Your goal is translate sprint specifications into mathematical reality: one claim, one test, one assertion, one second. Do absolutely nothing outside scope and DoDs.

**Input:** Sprint context (DoD items, scope contracts, regression risks) from /sprint command
**Output:** Minimal test suite (max 12 tests, <2min runtime) providing 100% specification coverage

---

## INPUT (Human or /Sprint Provided)
**Explicit Rough Scope:** // Passed from /sprint: DoD items, scope contracts, regression risks //
**Explicit Rough DoDs:** // Passed from /sprint: sequenced DoD layers per scope contract //

---

## The "3-Tier Minimal Evidence" Model

### Tier 1: Specification Tests (DoD Enforcement) - MANDATORY
**Purpose:** Prove each DoD item is met
**Quantity:** Exactly 1 test per DoD item (max 5 per sprint)
**Max Runtime:** 30 seconds total
**Blocking:** YES - 100% pass rate required for sprint completion

**Test Template:**
```typescript
// tests/[sprint]/specification/D[N]-[description].spec.ts
test('D[N]: [Exact DoD description]', async ({ page }) => {
  await page.goto('[route]');
  await page.[action]();
  await expect(page.[element]).[matcher](); // Exactly 1 assertion
});
```

### Tier 2: Regression Tests (Safety Net)
**Purpose:** Prove critical paths still work
**Quantity:** 3-5 max per sprint
**Max Runtime:** 60 seconds total
**Selection Criteria:** User entry points, conversion paths, historically fragile areas

### Tier 3: Smoke Tests (Build Gate)
**Purpose:** Prove app builds and renders
**Quantity:** 1-2 per sprint
**Max Runtime:** 10 seconds total
**Evidence:** Build passes + critical route renders without error

---

## PHASE 1: DoD → Test Translation (Agent Output Required)

### Step 1: Decompose DoDs into Measurable Claims
For each DoD item from /sprint:
1. **Identify:** Observable, measurable claim (not vague)
2. **Select:** Test type from matrix below
3. **Write:** Exactly 1 test with exactly 1 assertion
4. **Verify:** Test runs in <5 seconds

**Test Type Selection Matrix:**

| DoD Claim Type | Test Type | Evidence |
|----------------|-----------|----------|
| Visibility/rendering | Playwright component | Screenshot + boolean |
| User interaction | Playwright E2E | Action + state change |
| Data correctness | Unit test (Vitest/Jest) | Input → output match |
| Performance | Lighthouse/benchmark | Timing threshold |
| Integration | API/contract test | Request → response |

### Step 2: Minimal Assertion Rule (Strictly Enforced)

**BAD (over-testing - REJECT):**
```typescript
test('filter works', async () => {
  expect(component.state.filters).toBeDefined();  // ❌ Implementation detail
  expect(component.props.onChange).toHaveBeenCalled(); // ❌ Framework behavior
  expect(styles.backgroundColor).toBe('#fff'); // ❌ Styling detail
});
```

**GOOD (minimal evidence - ACCEPT):**
```typescript
test('D3: Clicking filter updates URL', async ({ page }) => {
  await page.goto('/shop/headphones');
  await page.getByText('Open-Back').click();
  expect(page.url()).toContain('filter=open-back'); // ✅ One claim, one assertion
});
```

### Step 3: Test Budget Enforcement (Hard Constraint)

**Maximums per sprint:**
- DoD tests: 5 (1 per DoD item)
- Regression tests: 5 (critical paths only)
- Smoke tests: 2 (build + render)
- **TOTAL: 12 tests max**
- **Total runtime: 2 minutes max**

**Elimination Criteria (DELETE if present):**
- ❌ Tests framework behavior (React/Next.js already tested)
- ❌ Tests styling details (use visual regression, not assertions)
- ❌ Flaky tests (intermittent failures = delete)
- ❌ Duplicate coverage (one claim, one test)
- ❌ Non-blocking tests (if failure doesn't block shipping, delete)

### Output: Test Mapping Table
```markdown
| DoD | Test File | Type | Assertion | Runtime | Blocking |
|-----|-----------|------|-----------|---------|----------|
| D1: Sidebar renders | D1-sidebar-render.spec.ts | Component | visible | 2s | ✅ YES |
| D2: Mobile hidden | D2-mobile-hidden.spec.ts | Component | hidden | 2s | ✅ YES |
```

---

## PHASE 2: Test Execution Rules

1. **Strictly execute** the **Explicit Refined DoDs** in exact sequential order.
2. **Follow repository testing patterns:**
   - Unit tests: Isolated function/component logic (`*.test.ts`)
   - Integration tests: Multi-component interaction (`*.test.ts`)
   - E2E tests: Full user flow validation (`*.spec.ts`)
3. **Test File Naming:** `tests/[sprint]/specification/D[N]-*.spec.ts`
4. **Test Data:** Use existing fixtures from `tests/fixtures/` where applicable.
5. **Contain** all changes strictly within test files.

---

## PHASE 3: Verification & Evidence Dashboard

### Step 1: Execute Verification Command
```bash
npx playwright test tests/[sprint-name]/
```

### Step 2: Analyze Results
If tests fail:
1. Analyze failure output
2. Fix test or implementation
3. Re-run until 100% pass

### Step 3: Generate Evidence Dashboard (REQUIRED OUTPUT)
```markdown
## Test Evidence Dashboard

### Coverage
| Tier | Count | Runtime | Pass Rate | Blocking |
|------|-------|---------|-----------|----------|
| Specification (DoD) | 5/5 | 15s | 100% | ✅ YES |
| Regression | 4/5 | 45s | 100% | ⚠️ WARN |
| Smoke | 2/2 | 8s | 100% | ✅ YES |
| **TOTAL** | **11** | **68s** | **100%** | **✅ SHIPPABLE** |

### Quality Gates
- Mathematical certainty: 11/11 (unambiguous pass/fail)
- User-facing: 11/11 (no implementation detail tests)
- Fast feedback: 11/11 (<5s each)
- Maintainable: 11/11 (<10 lines each)

### Verdict
✅ **SHIPPABLE** - All specification tests pass, 0 critical regressions
```

### Step 4: Sprint Lock Decision
- **All specification tests pass (100%):** ✅ Continue to next scope contract
- **Any specification test fails:** ❌ BLOCK - Fix before proceeding
- **Regression tests fail:** ⚠️ WARN - Evaluate if blocking

---

## Output Files

### Test File Structure
```
tests/
├── [sprint-name]/
│   ├── specification/
│   │   ├── D1-[description].spec.ts
│   │   ├── D2-[description].spec.ts
│   │   └── ...
│   ├── regression/
│   │   ├── critical-path-[name].spec.ts
│   │   └── ...
│   └── smoke/
│       └── build-gate.spec.ts
```

### Verification Commands Per Scope Contract
```markdown
### Scope Contract N: [Component]

#### Verification Commands
```bash
# Specification tests
npx playwright test tests/[sprint]/specification/D[N]-*

# Regression tests
npx playwright test tests/[sprint]/regression/

# Smoke tests
npm run build && npx playwright test tests/[sprint]/smoke/
```

#### Evidence Gate
All specification tests must pass (100%) for scope contract to be marked complete.
```

---

## Constraint Rules

- **NO** test without corresponding DoD item
- **NO** DoD item without corresponding test
- **NO** test with >1 assertion
- **NO** test with >10 lines
- **NO** test taking >5 seconds
- **NO** regression test not tied to critical path
- **YES** every test has explicit evidence type (screenshot/boolean/data/timing)
- **YES** every sprint ends with evidence dashboard
- **YES** build gate blocks all forward progress on failure

---

## Integration with /Sprint

When invoked by /sprint command, /test receives:
1. **DoD items** from sprint scope contracts
2. **Regression risks** identified at sprint start
3. **Critical paths** from user flow analysis

/test returns to /sprint:
1. **Test files** created
2. **Evidence dashboard** for sprint lock decision
3. **PASS/FAIL** verdict per scope contract

---

## Verification Commands

```bash
# Run all tests for sprint
npx playwright test tests/[sprint-name]/

# Run with evidence dashboard
npm run test:sprint -- --sprint=[sprint-name]

# Audit test quality (enforces constraints)
npm run test:audit
```

