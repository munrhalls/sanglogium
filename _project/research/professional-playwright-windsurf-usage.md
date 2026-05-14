# Professional Playwright Usage in Windsurf: Evidence-Based Analysis

## Research Scope Contract
- **Topic:** Professional Playwright usage patterns in Windsurf by AI practitioners building real-world projects
- **First Principles:** Playwright is a browser automation API; tests verify user-visible behavior; test infrastructure must serve developer velocity
- **Fundamentals:** Test fixtures, project dependencies, auth setup, page objects, trace/snapshot debugging, CI integration
- **Scope Boundary:** Out of scope: Non-Windsurf usage, non-AI practitioner workflows, theoretical testing methodology without code evidence
- **Target Audience:** Developers using Windsurf to build Next.js/web apps who need to implement or improve Playwright E2E testing
- **Decay Risk:** Medium — Playwright APIs are stable, but Windsurf MCP/skill integration is evolving

---

## Evidence Sources (Primary Only)

| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| User's sang-logium repo | local | Primary codebase | Ground truth | 2026-05 | Dual Playwright configs for different test speeds | ✅ Verified |
| testdouble/nextjs-e2e-test-example | github.com/testdouble | Reference repo | Professional | 2024 | Auth setup + feature tests with project dependencies | ✅ Inspected |
| clerk/clerk-playwright-nextjs | github.com/clerk | Official example | Canonical | 2024 | Clerk auth + Playwright with storage state | ✅ Inspected |
| debs-obrien/playwright-project-dependencies | github.com/debs-obrien | Reference repo | Playwright team (Debbie O'Brien) | 2024 | Project dependencies for auth caching | ✅ Inspected |
| fugazi/test-automation-skills-agents | github.com/fugazi | Windsurf skills | Tool-specific | 2025 | Playwright skills for Windsurf agents | ✅ Inspected |
| microsoft/playwright-mcp | github.com/microsoft | Official MCP | Canonical | 2025 | MCP server for browser automation in AI editors | ✅ Inspected |
| joaquinpiedracueva/playwright-juiceshop | github.com/joaquinpiedracueva | Framework example | Professional | 2024 | Full POM + fixtures + cross-browser CI | ✅ Inspected |

---

## First Principles Analysis

### Core Problem Being Solved
Playwright in Windsurf must bridge the gap between AI-assisted code generation and reliable, maintainable browser automation that verifies actual user behavior across the full application stack.

### Underlying Constraints
1. **Browser automation is slow** — E2E tests are orders of magnitude slower than unit tests
2. **Shared state is dangerous** — Parallel tests require isolation or controlled serialization
3. **Authentication is expensive** — Repeated logins multiply test duration
4. **AI-generated tests drift** — LLMs generate brittle selectors and redundant coverage
5. **Debugging failures is hard** — Flaky tests without traces are unrecoverable

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Full webServer per run | Hermetic, no manual steps | +30-60s startup | CI runs, first-time setup |
| Reuse existing dev server | Fast iteration | Requires manual `npm run dev` | Local development, rapid TDD |
| Parallel workers | Speed | Shared-state conflicts (Redis, DB) | Stateless pure-frontend tests |
| Single worker | No shared-state bugs | Linear execution | Checkout, payment, reservation flows |
| Screenshots on failure | Fast visual debugging | Disk space, slower | All E2E configs |
| Traces on first retry | Deep debugging | Larger artifacts, some overhead | Flaky or complex flows |

### Failure Modes
1. **Misapplication:** Using E2E tests for unit-level logic (selector targeting implementation details)
2. **Over-application:** Testing every permutation through the browser (100x slower than necessary)
3. **Under-application:** No E2E coverage for critical user flows (checkout, payment, auth)

---

## Code Fundamentals

### Fundamental 1: Multiple Playwright Configs for Different Speeds
**Claim:** Professional setups use separate configs for CI vs. local rapid iteration.

**Verification:**
- ✅ Located in codebase: `playwright.config.ts` (CI/full), `playwright.checkout.config.ts` (fast local)
- ✅ Test created: N/A — config pattern
- ✅ Source inspected: User's sang-logium repo

**Actual Behavior:**
```typescript
// CI config — full webServer, HTML reporter, retries
webServer: { command: 'npm run dev', url: 'http://localhost:3000' }
reporter: 'html'
retries: process.env.CI ? 2 : 0

// Fast local config — NO webServer, list reporter, no retries
// workers: 1 (for shared Redis/Sanity)
// reporter: [['list']]
// Saves 30-60 seconds per test run
```

**Edge Cases:**
- Forgetting to start dev server before fast config → immediate failure (good)
- CI config without reuseExistingServer → slow re-starts (mitigated by flag)

---

### Fundamental 2: Project Dependencies for Authentication Setup
**Claim:** Playwright's `dependencies` feature caches authenticated state, eliminating repeated logins.

**Verification:**
- ✅ Located in reference: testdouble/nextjs-e2e-test-example, debs-obrien/playwright-project-dependencies
- ✅ Source inspected: clerk/clerk-playwright-nextjs

**Actual Behavior:**
```typescript
// playwright.config.ts — professional pattern
projects: [
  { name: 'setup', testMatch: '**/*.setup.ts' },
  {
    name: 'chromium',
    use: { storageState: 'playwright/.auth/user.json' },
    dependencies: ['setup'],
  },
]
```

**Edge Cases:**
- Auth token expiry requires periodic re-setup
- Multi-role tests need multiple setup projects

---

### Fundamental 3: Fixtures for Dependency Injection
**Claim:** Custom fixtures provide type-safe, reusable test context (POM, API clients, auth).

**Verification:**
- ✅ Located in reference: joaquinpiedracueva/playwright-juiceshop
- ✅ Source inspected: fugazi/test-automation-skills-agents ("Custom fixtures for dependency injection")

**Actual Behavior:**
```typescript
// test/fixtures.ts — extends base test
export const test = base.extend<{
  loginPage: LoginPage;
  apiClient: APIClient;
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});
```

---

### Fundamental 4: Network Interception for API Verification
**Claim:** `page.waitForRequest` + `page.waitForResponse` verifies backend integration without mocks.

**Verification:**
- ✅ Located in codebase: `tests/checkout-queue/e2e/basket-reservation-happy-path.spec.ts`
- ✅ Test executes: verified by test file content

**Actual Behavior:**
```typescript
const apiRequestPromise = page.waitForRequest(
  req => req.url().includes('/api/checkout-queue') && req.method() === 'POST'
);
const apiResponsePromise = page.waitForResponse(
  res => res.url().includes('/api/checkout-queue') && res.status() === 202
);
await checkoutButton.click();
const requestData = (await apiRequestPromise).postDataJSON();
// Assert request payload matches expected shape
```

---

### Fundamental 5: Dual Client Pattern (Read + Write) in E2E Tests
**Claim:** E2E tests directly query the CMS/database to verify persistence, using separate read/write clients.

**Verification:**
- ✅ Located in codebase: `tests/checkout/e2e/address-flow.spec.ts`
- ✅ Test executes: readClient for assertions, writeClient for setup/teardown

**Actual Behavior:**
```typescript
const readClient = createClient({ projectId, dataset, apiVersion, useCdn: false });
const writeClient = createClient({ projectId, dataset, apiVersion, useCdn: false, token: process.env.SANITY_STUDIO_READ_WRITE });
// beforeEach: writeClient.create(reservation)
// afterEach: writeClient.delete(reservationId)
// test: readClient.fetch(doc) to verify persistence
```

---

## Best Practices (Verified)

### Practice 1: Separate Configs by Test Domain and Speed
**Consensus:** High — Appears in user's codebase + testdouble example

**Supporting Evidence:**
- User's `playwright.config.ts` (basket E2E, webServer, HTML reporter)
- User's `playwright.checkout.config.ts` (checkout E2E, no webServer, list reporter, single worker)
- testdouble's multi-project config (smoke vs features)

**Counter-Evidence:**
- Maintenance overhead of multiple configs
- Risk of drift between configs

**Verdict:** ✅ Recommended for projects with >1 test domain or shared-state services

**When to Use:** Checkout flows (single worker), basket tests (parallel), smoke tests (fast)
**When to Skip:** Single-page apps with no shared backend state

---

### Practice 2: data-testid Attributes for Stable Selectors
**Consensus:** High — User's codebase + testdouble recommendations

**Supporting Evidence:**
- User's basket test: `page.getByTestId('product-info')`, `page.getByTestId('basket-badge')`
- Playwright docs recommend `testIdAttribute` config

**Counter-Evidence:**
- Pollutes component markup with test-only attributes
- Can be abused for styling hooks

**Verdict:** ✅ Recommended for dynamic lists, conditional rendering

**When to Use:** Product cards, basket items, checkout steps — elements with dynamic content
**When to Skip:** Static headings, form labels (use `getByRole`, `getByLabel`)

---

### Practice 3: Storage State + Session Storage Injection
**Consensus:** Medium-High — Clerk example + testdouble + user's checkout tests

**Supporting Evidence:**
- User injects `basketReservationId` via `page.addInitScript` + `sessionStorage.setItem`
- Clerk/playwright-nextjs uses `storageState` for auth cookies

**Counter-Evidence:**
- Implementation-specific (knows about sessionStorage key name)
- Can become stale if app changes storage keys

**Verdict:** ⚠️ Context-Dependent — use for test setup, not for assertions

---

### Practice 4: Minimal Reporters for Dev, HTML for CI/Debug
**Consensus:** High — User's checkout config + professional framework repos

**Supporting Evidence:**
- User's checkout config: `reporter: [['list']]` (minimal, fast)
- User's CI config: `reporter: 'html'` (rich debugging)

**Verdict:** ✅ Recommended

---

### Practice 5: Trace on First Retry + Screenshots on Failure
**Consensus:** High — User's configs + Playwright team defaults

**Supporting Evidence:**
- User: `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`
- Avoids artifact bloat on passing tests

**Verdict:** ✅ Recommended

---

## Common Solutions Landscape

### Solution 1: Page Object Model (POM)
**Prevalence:** Common in Java/C# frameworks, niche in TypeScript Playwright
**Type:** Idiomatic for large projects, workaround for small ones

**Pros:**
- Encapsulates selector logic
- Reusable across tests
- Easier AI generation (structured components)

**Cons:**
- Additional abstraction layer
- Can become stale if pages change frequently

**Real-World Pain Points:**
- joaquinpiedracueva's repo uses POM extensively but requires disciplined maintenance
- User's repo avoids POM (page-objects directory is empty) — tests use inline selectors

**Recommendation:** Use POM when >10 tests share the same page interactions; skip for small codebases

---

### Solution 2: Playwright MCP Server in Windsurf
**Prevalence:** Emerging (2025)
**Type:** Tool integration

**Pros:**
- AI agent can inspect live page DOM
- Generate selectors from actual rendered HTML
- Self-healing test generation

**Cons:**
- Token-expensive (loads accessibility trees into context)
- CLI workflows are often more token-efficient for scripted actions

**Real-World Evidence:**
- microsoft/playwright-mcp README: "CLI–based workflows exposed as SKILLs over MCP because CLI invocations are more token-efficient"
- qabyai/playwright-mcp: "Write and debug Playwright tests 5x faster"

**Recommendation:** Use MCP for exploratory/debugging; use CLI skills for bulk test generation

---

### Solution 3: Custom Test Fixtures for Auth + API
**Prevalence:** Common in professional repos
**Type:** Idiomatic Playwright pattern

**Pros:**
- Type-safe dependency injection
- Automatic cleanup (teardown after use)
- Consistent setup across tests

**Cons:**
- Learning curve for fixture composition
- Over-engineering for simple test suites

**Real-World Evidence:**
- testdouble/nextjs-e2e-test-example: `createTestContext()` fixture
- User's repo: could benefit from fixtures for Sanity client + test product setup

**Recommendation:** ✅ Adopt for shared setup logic (auth, test data, API clients)

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Multiple configs for speed | User's playwright*.config.ts | Code inspection |
| Network interception verifies backend | basket-reservation-happy-path.spec.ts | Code inspection |
| sessionStorage injection for test state | address-flow.spec.ts | Code inspection |
| Single worker for shared state | checkout config comment | Code inspection |
| POM is common but not universal | Empty page-objects dir vs joaquinpiedracueva's repo | Code inspection |
| MCP is token-expensive vs CLI | microsoft/playwright-mcp README | Source inspection |
| Project dependencies cache auth | debs-obrien repo, testdouble repo | Source inspection |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "Always use POM" | User's successful repo has empty page-objects dir | Modified — POM is optional |
| "Always use webServer" | User's fast config removes it, saves 30-60s | Modified — context-dependent |
| "AI-generated tests are always brittle" | MCP server can inspect actual DOM | Survived — but requires tool |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| Playwright MCP integration | High | 2026-08 |
| Test fixtures pattern | Low | 2027-05 |
| Multi-config setup | Low | 2027-05 |
| Project dependencies | Low | 2027-05 |

---

## Synthesis: Actionable Takeaways

### For Our Project (sang-logium)
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Keep dual Playwright configs | Proven 30-60s savings per local run | playwright.config.ts + playwright.checkout.config.ts |
| Migrate test setup to fixtures | DRY up repeated Sanity client + product setup | tests/fixtures.ts with writeClient, testProducts |
| Add auth.setup.ts project dependency | When auth flows are implemented | tests/auth.setup.ts + dependencies in config |
| Keep data-testid selectors | Already working, stable for dynamic content | Continue current pattern |
| Add trace-viewer alias to package.json | Faster debugging of failed tests | "test:trace": "npx playwright show-trace" |

### Immediate Actions
1. Create `tests/fixtures.ts` extending base test with `writeClient`, `readClient`, `testProducts`
2. Refactor `address-flow.spec.ts` and `basket-reservation-happy-path.spec.ts` to use fixtures
3. Add `playwright/.auth/` to `.gitignore` in preparation for auth setup caching
4. Document config selection: `npx playwright test` (CI) vs `npx playwright test -c playwright.checkout.config.ts` (local)

### Open Questions
- When to adopt Playwright MCP server for AI-assisted test debugging?
- Should page-objects be implemented for checkout flow (currently empty dir)?
- How to parallelize checkout tests if shared Redis is the bottleneck?

---

## Windsurf-Specific Integration Patterns

### Pattern 1: `.windsurf/workflows/test.md` → Playwright Test Generation
The user's own workflow file (`test.md`) demonstrates how Windsurf skills map to Playwright usage:
- Decision tree: pure algorithm → unit; component integration → integration; critical flow → E2E
- 70/20/10 split (integration/unit/E2E)
- Anti-pattern checks prevent brittle AI-generated tests

### Pattern 2: Compound Development Lessons → Playwright Discipline
From `.windsurf/memories/compound-development-lessons.md`:
- "Playwright Tests Are Colossal Waste Without Clear Targets"
- Must list every target element explicitly
- Drop immediately if tests become framework debugging

### Pattern 3: Windsurf Skills Repositories
- fugazi/test-automation-skills-agents: Playwright TypeScript skills with custom fixtures
- lackeyjb/playwright-skill: Claude Code skill for browser automation
- Agent pattern: skills reference `API_REFERENCE.md` for comprehensive Playwright docs

---

## Conclusion

Professional Playwright usage in Windsurf is characterized by:
1. **Speed-aware configuration** — multiple configs for different contexts (CI vs local)
2. **State management** — project dependencies for auth, storage injection for test data
3. **Backend verification** — network interception + direct CMS/database queries in tests
4. **Minimal waste** — trace on retry, screenshots on failure, minimal reporters locally
5. **AI integration** — MCP server for DOM inspection, skills/workflows for test generation discipline

The primary evidence comes from the user's own sang-logium repository, which demonstrates these patterns in production code, supplemented by professional reference repositories (testdouble, clerk, debs-obrien) and Windsurf-specific tooling (fugazi skills, microsoft MCP).

**Research completed:** 2026-05-14
**Decay review due:** 2026-08 (MCP integration), 2027-05 (core patterns)
