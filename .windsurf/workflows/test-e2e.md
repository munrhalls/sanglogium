---
description: End-to-end user workflow testing with Playwright - real browser, real interactions
---

# /test-e2e Command Protocol

**System Directive:** You are a deterministic execution engine for end-to-end testing. Simulate real users, verify real outcomes, test ONLY what users experience. No implementation details, no internal state, no white box assertions.

**Input:** User story, acceptance criterion, or complete user workflow
**Output:** `tests/e2e/[feature]/[flow].spec.ts` verifying user-facing behavior

---

## Pre-Flight Containment Checklist

### 1. PRD LINKAGE (Non-negotiable)
- [ ] User story explicitly stated
- [ ] Acceptance criterion mapped
- [ ] User-observable outcome defined

### 2. Manual Verification Requirement
```markdown
MANDATORY: Complete manual verification BEFORE writing test

User Flow: [A] → [B] → [C] (max 5 bus stops)

Bus Stop 1: [Starting state]
  - URL: [exact URL]
  - Visible: [specific elements]
  
Bus Stop 2: [After action]
  - Action: [user action]
  - Expected: [visible change]
  
Bus Stop 3: [End state]
  - URL: [expected URL]
  - Visible: [expected elements]
  - Verification: [how user confirms success]
```

### 3. Scope Containment Contract
**IN SCOPE (A to B only):**
- Starting state
- User action
- Observable outcome

**OUT OF SCOPE (never test):**
- What happens after outcome (next flow)
- Internal state changes
- API calls made
- Database updates

### 4. Bus Stop Definition (Max 5)
```typescript
const BUS_STOPS = [
  { name: '[State A]', url: '[url]', elements: ['[selector]', '[selector]'] },
  { name: '[Action]', action: '[click/fill]', target: '[selector]' },
  { name: '[State B]', url: '[url]', elements: ['[selector]'], outcome: '[user-visible result]' }
];
```

### 5. Black Box Assertion Selection
**VERIFY (user-observable only):**
- Page URL changes
- Visible text/content
- Element presence/absence
- Form state (enabled/disabled)
- Navigation completed

**NEVER VERIFY (implementation details):**
- Network requests
- Console logs
- Component state
- API responses
- Internal variables

---

## Phase 1: Test Specification (15 min)

### Step 1: Define User Flow
```markdown
## User Flow: [Name]

**PRD Acceptance Criterion:** [Exact quote]

**Starting State (A):**
- User at: [URL]
- Can see: [3-5 specific elements]
- Can do: [available actions]

**User Action:**
- Clicks: [specific element with selector]
- Fills: [form field with selector] with [value]
- Submits: [form/button with selector]

**Expected Outcome (B):**
- Page shows: [specific elements/text]
- URL becomes: [expected URL]
- User can: [next available action]

**OUT OF SCOPE:**
- [What happens next - not tested]
- [Internal processes - not tested]
```

### Step 2: Selector Strategy
```typescript
// USE data-testid (preferred)
page.locator('[data-testid="checkout-button"]')

// USE user-facing text (semantic)
page.getByText('Add to Basket')
page.getByRole('button', { name: 'Checkout' })

// AVOID implementation-specific selectors
// WRONG: .css-class-name (brittle)
// WRONG: #element-id (implementation detail)
// WRONG: xpath (fragile)
```

---

## Phase 2: Implementation (25 min)

### Constraint Rules (Strictly Enforced)
- **SIMULATE** real user actions only (click, fill, navigate)
- **VERIFY** UI state changes only (visible elements, URL)
- **NO** internal state testing
- **NO** implementation detail assertions
- **MAX** 5 bus stops per flow
- **MAX** 80 lines per test file
- **ONE** user flow per test file

### Test Template
```typescript
import { test, expect } from '@playwright/test';

test('[PRD Criterion]: [User Flow Description]', async ({ page }) => {
  // Bus Stop 1: Starting state
  await page.goto('[starting-url]');
  await expect(page.locator('[data-testid="[element]"]')).toBeVisible();
  
  // Bus Stop 2: User action
  await page.click('[data-testid="[action-element]"]');
  
  // Bus Stop 3: Verify outcome (user-observable only)
  await expect(page).toHaveURL('[expected-url]');
  await expect(page.locator('[data-testid="[outcome-element]"]')).toBeVisible();
  await expect(page.getByText('[expected-content]')).toBeVisible();
});
```

### Hallucination Detection
| Smell | Violation | Fix |
|-------|-----------|-----|
| `console.log` checks | Implementation detail | Remove, test visible outcome |
| `page.evaluate()` | Internal state access | Use visible selectors only |
| `request` interception | Network testing | Test result, not process |
| `.toHaveClass()` | Styling detail | Test visibility/content |
| Test file > 80 lines | Scope creep | Split into separate flows |
| Multiple flows in one file | Scope creep | One flow = one file |

### Anti-Patterns (REJECT)
```typescript
// WRONG: Testing implementation
await page.evaluate(() => window.store.state); // ❌ Internal state
await page.route('**/api/**', ...); // ❌ Network interception
expect(await page.locator('.btn').getAttribute('class')).toContain('active'); // ❌ Styling

// CORRECT: Testing user experience
await expect(page.getByText('Success')).toBeVisible(); // ✅ Visible outcome
await expect(page).toHaveURL('/success'); // ✅ Navigation complete
await page.click('[data-testid="continue-button"]'); // ✅ User can proceed
```

---

## Phase 3: Falsification Verification (10 min)

### Step 1: Run Test (Should Pass)
```bash
npx playwright test tests/e2e/[feature]/[flow].spec.ts --project=desktop-chromium
```

### Step 2: Manual Verification Match
Compare test behavior to manual verification:
- [ ] Test clicks same element human clicked
- [ ] Test waits for same visible state
- [ ] Test verifies same user-observable outcome

### Step 3: Force Failure (Must Fail)
Temporarily break the feature:
```typescript
// In component, add:
return null; // or show error state
```

Re-run test — **must fail**.

### Step 4: Restore and Confirm
Remove temporary break, re-run — **must pass**.

---

## Phase 4: Human Checkpoint (10 min)

### Review Checklist
- [ ] Test simulates real user actions
- [ ] Test verifies user-observable outcomes only
- [ ] No internal state/network testing
- [ ] Selectors use data-testid or semantic text
- [ ] File length ≤ 80 lines
- [ ] Runtime < 10 seconds
- [ ] Test fails when feature breaks
- [ ] Matches manual verification exactly
- [ ] Max 5 bus stops
- [ ] PRD acceptance criterion covered

### Completion Criteria
```markdown
✅ Test is complete when:
- Simulates real user actions (click, fill, navigate)
- Verifies user-observable outcomes (visible elements, URL)
- No internal state or implementation testing
- Uses data-testid or semantic selectors
- File length ≤ 80 lines
- Runs in < 10 seconds
- Fails when feature breaks
- Matches manual verification
- Max 5 bus stops
- Covers PRD acceptance criterion
```

---

## Verification Commands

```bash
# Run single e2e test
npx playwright test tests/e2e/[feature]/[flow].spec.ts --project=desktop-chromium

# Run all e2e tests for feature
npx playwright test tests/e2e/[feature]/

# With trace (for debugging)
npx playwright test tests/e2e/[feature]/[flow].spec.ts --trace=on
```

---

## Output File Structure

```
tests/e2e/
├── [feature]/
│   ├── [flow].spec.ts           # Main test file (max 80 lines)
│   └── human-verification/
│       └── [flow].md            # Manual verification record
```

---

## Example: Complete E2E Test

```typescript
// tests/e2e/basket/add-to-basket.spec.ts
import { test, expect } from '@playwright/test';

test('PRD: User can add product to basket', async ({ page }) => {
  // Bus Stop 1: Product page
  await page.goto('/products/headphones/hd660s');
  await expect(page.getByText('Sennheiser HD660S')).toBeVisible();
  
  // Bus Stop 2: Add to basket
  await page.click('[data-testid="add-to-basket-button"]');
  
  // Bus Stop 3: Verify basket updated
  await expect(page.getByText('1 item in basket')).toBeVisible();
  await page.click('[data-testid="basket-link"]');
  
  // Bus Stop 4: Basket page shows product
  await expect(page).toHaveURL('/basket');
  await expect(page.getByText('Sennheiser HD660S')).toBeVisible();
});
```

**Line count:** 18 lines ✅  
**Bus stops:** 4 (max 5) ✅  
**Assertions:** User-visible outcomes only ✅  
**Runtime:** ~5 seconds ✅  
**PRD:** Covers acceptance criterion ✅

---

## Performance Requirements

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : 4,  // Parallel execution
  headless: true,                  // Never use headed mode
  timeout: 10000,                    // 10 second max per test
  expect: {
    timeout: 5000                    // 5 second assertion timeout
  }
});
```

**NEVER use:**
- `page.waitForTimeout()` — fixed waits are forbidden
- `slowMo` — slows execution unnecessarily
- Headed mode — CI must run headless
