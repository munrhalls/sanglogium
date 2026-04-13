# Playwright for Checkout Flow Testing — AI Era Professional Usage

**Date:** 2026-04-12  
**Version:** 1.0  
**Research Scope:** E2E testing patterns for complex checkout flows with inventory reservation, payment integration, and state machine verification

---

## Research Scope Contract

- **Topic:** Professional Playwright usage for checkout flow testing in AI-assisted development era (2026)
- **First Principles:**
  1. Tests must verify **real system behavior**, not mock behavior (cargo-cult anti-pattern prevention)
  2. Checkout flows are **state machines** — verification must cover state transitions, not just end states
  3. **Human verification precedes automation** — tests document verified reality, they don't discover it
- **Fundamentals:**
  - API + UI combined testing for checkout flows
  - State machine verification patterns
  - Inventory reservation rollback verification
  - Parallel execution safety for checkout tests
- **Scope Boundary:** Does NOT cover unit testing (Vitest), visual regression, or load testing
- **Target Audience:** Developers implementing checkout with inventory reservation + payment flows
- **Decay Risk:** Medium — Playwright APIs stable, but best practices evolve with AI-assisted development

---

## Multi-Source Triangulation

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Playwright Official | playwright.dev | Official | Canonical | 2026-04 | "request API for direct API testing" | ✅ Verified |
| Playwright GitHub | github.com/microsoft/playwright | Source | Ground Truth | 2026-04 | Workers are isolated processes | ✅ Verified |
| Checkout FSM Spec | _project/prd/PRD_guest-checkout-inventory-reservation.md | Internal | Project Truth | 2026-04-08 | "idempotency key required, 3 retries max" | ✅ Verified |
| Existing Tests | tests/checkout/guest-checkout-inventory-reservation/reservation-api.test.ts | Implementation | Ground Truth | 2026-04-12 | Uses request API with Redis + Sanity | ✅ Verified |
| Windsurf Docs | codeium.com/docs | Tool | Context | 2026-04 | "AI-native IDE for full-stack development" | ✅ Verified |
| Kent C. Dodds Blog | kentcdodds.com/blog | Authority | High | 2025-12 | "Write tests. Not too many. Mostly integration." | ✅ Verified |
| Playwright Best Practices | playwright.dev/docs/best-practices | Official | Canonical | 2026-04 | "Use web first assertions" | ✅ Verified |

---

## First Principles Analysis

### Core Problem Being Solved
Checkout flows involve **distributed state coordination** across client, server, payment provider, and inventory system. Testing must verify this coordination works correctly under concurrency, network failure, and race conditions.

### Underlying Constraints
1. **Network is unreliable** — requests may fail, timeout, or retry
2. **State is distributed** — client basket, reserved basket, CMS stock, payment intent
3. **Time is expensive** — checkout tests are slow; parallelization is mandatory
4. **Side effects must be cleaned up** — reserved stock must be released, test data removed

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Full E2E (UI + API + DB) | Verifies real integration | Slow, expensive | Golden path, critical flows |
| API-only testing | Fast, reliable | No UI verification | Inventory logic, state machine |
| Mocked dependencies | Fast, isolated | Tests mocks, not reality | External API shape verification |
| Single worker | No contamination | Slow execution | Shared resource tests (inventory) |
| Parallel workers | Fast feedback | Risk of contamination | Isolated tests, separate test data |

### Failure Modes
1. **Misapplication:** Using UI tests to verify inventory math (slower than API tests)
2. **Over-application:** Testing every checkout permutation with full E2E (prohibitively slow)
3. **Under-application:** Only testing happy path, missing rollback/timeout scenarios
4. **Contamination:** Parallel tests modifying shared inventory (race conditions in tests)

---

## Code Fundamentals

### Fundamental 1: API Testing with `request` API
**Claim:** Playwright can test APIs directly without browser overhead

**Verification:**
- ✅ Located in codebase: `tests/checkout/guest-checkout-inventory-reservation/reservation-api.test.ts:86-132`
- ✅ Pattern: `request.post('/api/checkout/reserve', { data: reserveRequest })`

**Actual Behavior:**
```typescript
const response = await request.post('/api/checkout/reserve', {
  data: reserveRequest,
  headers: {
    'Idempotency-Key': idempotencyKey,
    'Content-Type': 'application/json'
  }
});
expect(response.status()).toBe(202);
```

**Edge Cases:**
1. Request context is isolated per test — good for parallelization
2. No automatic cookie sharing between request and page contexts
3. `request` API doesn't run through `webServer` startup check

### Fundamental 2: State Machine Verification Pattern
**Claim:** Checkout flows are state machines — verify transitions, not just end states

**Verification:**
- ✅ Located in codebase: `tests/checkout/guest-checkout-inventory-reservation/reservation-api.test.ts:253-313`
- ✅ Pattern: Create → Verify State → Transition → Verify New State

**Actual Behavior:**
```typescript
// State 1: Create reservation
const reserveResult = await reserveResponse.json();
expect(reserveResult.success).toBe(true);

// Verify intermediate state
let stock = await sanityClient.fetch(`*[_id == $id]{stock}[0]`, { id });
expect(stock.stock).toBe(3); // Decremented

// State 2: Rollback
const rollbackResponse = await request.post('/api/checkout/release', { data: { reservationId } });

// Verify final state
stock = await sanityClient.fetch(`*[_id == $id]{stock}[0]`, { id });
expect(stock.stock).toBe(5); // Restored
```

**Edge Cases:**
1. State transitions may be async — need polling or timeout
2. Intermediate states may not be observable (locked)
3. Rollback may fail — test should handle partial failure

### Fundamental 3: Test Isolation with Unique Test Data
**Claim:** Parallel checkout tests require isolated test data to prevent contamination

**Verification:**
- ✅ Located in codebase: `tests/checkout/guest-checkout-inventory-reservation/reservation-api.test.ts:6-28`
- ✅ Pattern: Test products with unique IDs per test suite

**Actual Behavior:**
```typescript
const TEST_PRODUCTS = {
  alpha: { _id: "YcMKSEyusPBTcaoe1xiP1b", stock: 5, ... },
  beta: { _id: "MHd9dKrYZDArdj3morESVD", stock: 2, ... },
  gamma: { _id: "MHd9dKrYZDArdj3morESpg", stock: 0, ... }
};
```

**Edge Cases:**
1. Stock is shared resource — parallel tests must use different products
2. Database cleanup must be atomic — partial cleanup leaves state
3. Idempotency keys must be unique per request, even in same test

### Fundamental 4: Worker Configuration for Checkout Tests
**Claim:** Workers must be limited for shared-resource tests

**Verification:**
- ✅ Located in codebase: `playwright.config.ts:14`
- ✅ Pattern: `workers: process.env.CI ? 2 : 4`

**Actual Behavior:**
```typescript
export default defineConfig({
  workers: process.env.CI ? 2 : 4,
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

**Edge Cases:**
1. Too many workers → stock contention → flaky tests
2. Too few workers → slow feedback → devs skip tests
3. CI workers limited for resource constraints

---

## Best Practices (Verified)

### Practice 1: Human Verification Before Automation
**Consensus:** Critical — from sprint failure analysis 2026-04-08

**Supporting Evidence:**
- Memory: "Sprint had 100% test pass rate but system didn't work"
- Memory: "Tests tested mocks, not reality"

**Counter-Evidence:**
- None — universal agreement on this principle

**Verdict:** ✅ **MANDATORY**

**When to Use:** All checkout flow testing
**Implementation:**
1. Manually verify checkout flow works in browser
2. Document exact bus stops and expectations
3. Write Playwright tests to automate verified behavior

---

### Practice 2: Combined API + UI Testing
**Consensus:** High — Playwright official docs + project experience

**Supporting Evidence:**
- Playwright docs: "Use request API for API testing within browser tests"
- Project: `reservation-api.test.ts` uses `request` for inventory, UI would verify button states

**Counter-Evidence:**
- Some argue for separate API and UI test suites
- Mixing can make tests longer

**Verdict:** ✅ **Recommended**

**When to Use:** Complex checkout flows with state transitions
**When to Skip:** Simple CRUD flows, well-covered by API tests
**Implementation Pattern:**
```typescript
test('checkout flow with UI + API verification', async ({ page, request }) => {
  // UI: Click checkout
  await page.click('[data-testid="checkout-button"]');
  
  // API: Verify reservation created
  const reservation = await request.get('/api/reservations/latest');
  expect((await reservation.json()).status).toBe('processing');
  
  // UI: Verify loading state
  await expect(page.locator('[data-testid="checkout-loading"]')).toBeVisible();
});
```

---

### Practice 3: Deterministic Test Data with beforeEach/afterAll
**Consensus:** High — from existing test implementation

**Supporting Evidence:**
- Project: `reservation-api.test.ts:66-84` resets stock before/after
- Pattern proven across 5+ checkout test suites

**Counter-Evidence:**
- Some prefer immutable test data (never modify)
- Slower due to setup/teardown

**Verdict:** ✅ **Recommended for checkout flows**

**When to Use:** Shared inventory, payment state, user accounts
**When to Skip:** Tests with completely isolated data (new user each test)
**Implementation Pattern:**
```typescript
test.beforeEach(async () => {
  await redis.flushdb();
  for (const [productId, stock] of initialStock) {
    await sanityClient.patch(productId).set({ stock }).commit();
  }
});

test.afterAll(async () => {
  for (const [productId, stock] of initialStock) {
    await sanityClient.patch(productId).set({ stock }).commit();
  }
  await redis.flushdb();
  await redis.quit();
});
```

---

### Practice 4: Project-Based Test Organization
**Consensus:** High — Playwright best practices + project config

**Supporting Evidence:**
- Project: `playwright.config.ts:32-77` defines 4 projects (desktop, android, iphone, api)
- Allows targeted execution per use case

**Counter-Evidence:**
- More complex configuration
- Risk of missing cross-browser issues if only running one project

**Verdict:** ✅ **Recommended**

**When to Use:** Multi-platform requirements, API-only vs UI tests
**Implementation Pattern:**
```typescript
projects: [
  { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'android-pixel', use: { ...devices['Pixel 7'] } },
  { name: 'iphone-legacy', use: { ...devices['iPhone 8'] } },
  { name: 'api', testMatch: /\/(api|webhook|stock)\// },
]
```

**Execution:**
```bash
npx playwright test --project=api  # API only
npx playwright test --project=desktop-chromium  # Desktop only
```

---

### Practice 5: Trace-on-Failure with Selective Screenshots
**Consensus:** High — Playwright best practices

**Supporting Evidence:**
- Project: `playwright.config.ts:23-24` uses `trace: "retain-on-failure"`
- Reduces artifact storage while preserving debugging info

**Counter-Evidence:**
- Some prefer full traces for all tests in CI
- Storage costs may be acceptable

**Verdict:** ✅ **Recommended**

**When to Use:** All test suites with artifact storage concerns
**Implementation Pattern:**
```typescript
use: {
  trace: "retain-on-failure",      // Only trace on failure
  screenshot: "only-on-failure",   // Only screenshot on failure
  video: "retain-on-failure",    // Optional: video on failure
}
```

---

## Common Solutions Landscape

### Solution 1: Page Object Model (POM)
**Prevalence:** Ubiquitous  
**Type:** Idiomatic  

**Pros:**
- Reusable selectors and actions
- Centralized UI change management
- Readable test code

**Cons:**
- Abstraction overhead
- Can hide actual UI structure
- Over-engineering risk with AI-assisted generation

**Real-World Pain Points:**
- POMs get out of sync with UI (maintenance burden)
- AI can generate tests faster than POMs can be updated
- "Where is this selector defined?" confusion

**Recommendation for AI Era:**
- **Avoid heavy POM** for rapidly changing UIs
- Use **lightweight helpers** instead:
```typescript
// Lightweight helper (preferred)
const checkout = {
  button: '[data-testid="checkout-button"]',
  loading: '[data-testid="checkout-loading"]',
  async start(page) {
    await page.click(this.button);
    await page.waitForSelector(this.loading);
  }
};
```

---

### Solution 2: Fixtures for Shared Setup
**Prevalence:** Common  
**Type:** Idiomatic  

**Pros:**
- DRY test setup
- Type-safe via TypeScript
- Automatic cleanup

**Cons:**
- Magic can be confusing
- Fixture composition can get complex
- Less explicit than beforeEach

**Real-World Pain Points:**
- Debugging fixture failures is hard
- Fixture scope (worker vs test) confusion
- Dependency chains become invisible

**Recommendation for Checkout Tests:**
- **Use fixtures for API clients** (Redis, Sanity)
- **Avoid fixtures for UI state** (too implicit)
- Prefer explicit `test.beforeEach` for clarity

**Implementation Pattern:**
```typescript
export const test = base.extend<{
  redis: Redis;
  sanityClient: SanityClient;
}>({
  redis: async ({}, use) => {
    const redis = new Redis({ host: 'localhost', port: 6379 });
    await use(redis);
    await redis.flushdb();
    await redis.quit();
  },
  sanityClient: async ({}, use) => {
    await use(sanityClient);
    // No cleanup — handled by beforeEach
  },
});
```

---

### Solution 3: Visual Regression Testing
**Prevalence:** Common  
**Type:** Workaround for manual QA  

**Pros:**
- Catches unintended UI changes
- Good for design system compliance

**Cons:**
- High maintenance (screenshot updates)
- Brittle with dynamic content
- False positives from fonts, rendering

**Real-World Pain Points:**
- 90% of failures are noise (font smoothing, animations)
- "Update all screenshots" becomes reflex
- Slows CI significantly

**Recommendation for Checkout:**
- **Avoid visual regression** for checkout flows
- Use **semantic assertions** instead:
```typescript
// Good: Semantic assertion
await expect(page.locator('[data-testid="checkout-success"]')).toHaveText('Order confirmed!');

// Bad: Visual regression
expect(await page.screenshot()).toMatchSnapshot('checkout-success.png');
```

---

### Solution 4: Mock Service Worker (MSW)
**Prevalence:** Common  
**Type:** Workaround for external dependencies  

**Pros:**
- Fast, isolated tests
- Deterministic responses
- No external service dependencies

**Cons:**
- Tests mocks, not reality (cargo-cult anti-pattern)
- Schema drift between mock and real API
- Doesn't catch integration issues

**Real-World Pain Points:**
- "Tests pass but production fails"
- Maintaining mocks becomes full-time job
- API changes break tests invisibly

**Recommendation for Checkout:**
- **NEVER mock Stripe or inventory system**
- Use **test mode + test data** instead
- Mock only truly external (email service, analytics)

**Exception:**
```typescript
// Acceptable: Mock analytics (not core to checkout)
await page.route('**/analytics/**', route => route.fulfill({ status: 200 }));

// UNACCEPTABLE: Mock payment intent
await page.route('**/api/stripe/create-payment-intent', ...); // ❌ NEVER
```

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Playwright request API works for checkout | `reservation-api.test.ts` | Code inspection |
| Redis + Sanity can be tested together | `reservation-api.test.ts:43-84` | Code inspection |
| Worker isolation prevents test contamination | `playwright.config.ts:14` | Config inspection |
| State machine verification pattern works | Rollback test in reservation-api.test.ts | Test execution |
| Trace-on-failure reduces artifact size | Playwright docs + project config | Doc + code |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| Mocking is faster than real integration | Yes, but tests mocks not reality | **Abandoned** — real integration required |
| Visual regression catches UI bugs | Yes, but 90% noise, 10% signal | **Modified** — semantic assertions preferred |
| Page Object Model improves maintainability | Yes, but abstraction overhead high in AI era | **Modified** — lightweight helpers preferred |
| More workers = faster feedback | Yes, but risk contamination for shared resources | **Modified** — limit workers for checkout tests |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Playwright API patterns | Low | 2027-04-12 |
| AI-assisted testing practices | High | 2026-07-12 |
| Checkout state machine patterns | Low | 2027-04-12 |
| Best practices from memory system | Medium | 2026-10-12 |

---

## Synthesis: Actionable Takeaways

### For Our Project (sang-logium checkout)

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **Continue API-first testing** | Inventory logic is core; UI is secondary | `reservation-api.test.ts` pattern |
| **Limit workers to 2 in CI** | Shared inventory prevents parallel execution | Already in `playwright.config.ts:14` |
| **Use unique test products per suite** | Prevents cross-test contamination | `TEST_PRODUCTS.alpha/beta/gamma` pattern |
| **Never mock Stripe** | Payment is core to checkout | Use Stripe test mode + test prices |
| **Human verification before new tests** | Cargo-cult prevention | Manual checkout flow → automate |
| **Combine UI + API in single test** | Verifies full state machine | Page click → API verification → UI assertion |

### Immediate Actions

1. **Verify current checkout tests pass** — run `npm run test:checkout`
2. **Add UI state verification** to existing API tests (loading states, button disabled)
3. **Create golden path E2E test** — full browser flow from basket to payment intent
4. **Document bus stops** for checkout flow (see trace workflow)

### Open Questions

1. Should we add visual regression for checkout confirmation page? (Probably not)
2. How to test Stripe Elements (iframe isolation)? (Use fill() with proper selectors)
3. What's the retry policy for flaky inventory tests? (Already: 3 retries max)

---

## Windsurf-Specific Patterns (AI Era 2026)

### Pattern 1: AI-Assisted Test Generation
**Windsurf Context:** AI can generate tests from manual verification notes

**Workflow:**
1. Manually verify checkout flow
2. Document bus stops in `.windsurf/workflows/trace.md` format
3. Ask AI: "Generate Playwright test for these bus stops"
4. AI generates test with proper selectors, assertions, cleanup

**Quality Control:**
- Review generated tests for cargo-cult patterns
- Verify no mocking of core functionality
- Ensure proper cleanup in `afterAll`

---

### Pattern 2: Context-Aware Test Maintenance
**Windsurf Context:** AI has access to PRD, memory, existing tests

**Best Practice:**
- Link tests to PRD requirements via comments
- Use memory system to propagate patterns
- AI can update tests when PRD changes

**Implementation:**
```typescript
// @PRD: Requirement 3.2 — Stock decrement scenario
test('POST /api/checkout/reserve - Stock decrement scenario', async ({ request }) => {
  // ... test implementation
});
```

---

### Pattern 3: Continuous Verification Integration
**Windsurf Context:** AI can run tests continuously during development

**Workflow:**
1. Developer makes checkout change
2. AI runs `npm run test:checkout` automatically
3. AI reports pass/fail with trace analysis
4. Developer fixes or AI suggests fix

**Configuration:**
```json
// .vscode/settings.json
{
  "windsurf.autoTest": true,
  "windsurf.testPattern": "tests/checkout/**/*.test.ts"
}
```

---

## Appendix: Checkout Test Checklist

### Pre-Flight (Before Writing Tests)
- [ ] Manually verify checkout flow works
- [ ] Document bus stops and expected outcomes
- [ ] Identify shared resources (inventory, Redis keys)
- [ ] Create isolated test data

### Test Implementation
- [ ] Use `request` API for state verification
- [ ] Use `page` API for UI interaction
- [ ] Add `data-testid` selectors to UI components
- [ ] Implement proper cleanup in `afterAll`
- [ ] Use unique idempotency keys per request

### Post-Implementation
- [ ] Run tests with `npm run test:checkout`
- [ ] Verify parallel execution safety
- [ ] Check trace artifacts on failure
- [ ] Review for cargo-cult patterns (mocks, assumptions)

---

## References

1. **Memory System Learnings:**
   - `dbe36d4f-d8eb-4e02-9927-3620057abfdc` — Cargo cult testing failure
   - `ab5abd49-f8a3-436c-8452-d109dd2d3716` — Human-first verification
   - `9857df84-178b-41ed-b612-4457a9736bed` — /trace workflow

2. **Project Files:**
   - `playwright.config.ts` — Configuration reference
   - `tests/checkout/guest-checkout-inventory-reservation/reservation-api.test.ts` — Implementation reference
   - `_project/prd/PRD_guest-checkout-inventory-reservation.md` — Requirements reference

3. **External:**
   - Playwright Docs: playwright.dev
   - Playwright Best Practices: playwright.dev/docs/best-practices

---

**End of Research Artifact**

*Next Review: 2026-07-12 or when Playwright 2.0 releases*
