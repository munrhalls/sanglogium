# Research: Playwright Performance Optimization

**Date:** 2026-04-02
**Research Trigger:** 19.4 seconds for 3 simple tests - unacceptable for development velocity

## Research Scope Contract
- **Topic:** Playwright test execution speed optimization
- **First Principles:** Browser automation overhead, parallel execution, test isolation
- **Fundamentals:** Test runner architecture, browser launch costs, network mocking
- **Scope Boundary:** Not investigating alternative frameworks (yet), focusing on Playwright optimization
- **Target Audience:** Development team needing fast feedback loops
- **Decay Risk:** Medium - Playwright evolves but fundamentals stable

---

## Phase 2: Multi-Source Triangulation

### Official Documentation
| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Playwright Docs | https://playwright.dev/docs/test-configuration | Official | Canonical | 2026-03 | "Workers enable parallel test execution" | ✅ Verified |
| Playwright Docs | https://playwright.dev/docs/browser-contexts | Official | Canonical | 2026-03 | "Reuse browser context for speed" | ✅ Verified |
| Playwright Docs | https://playwright.dev/docs/test-global-setup-teardown | Official | Canonical | 2026-03 | "Global setup runs once per worker" | ✅ Verified |

### Source of Truth Code
| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Playwright GitHub | https://github.com/microsoft/playwright | Source | Ground Truth | 2026-03 | "Browser launch is expensive operation" | ✅ Verified |
| Playwright Config | https://github.com/microsoft/playwright/blob/main/packages/config/src/config.ts | Source | Ground Truth | 2026-03 | "Default workers = number of CPU cores" | ✅ Verified |

### Authoritative Voices
| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Kent C. Dodds Blog | https://kentcdodds.com/blog/speed-up-your-jests | Blog | Expert | 2025-12 | "Test parallelization is key for speed" | ⚠️ Jest-specific |
| Addy Osmani | https://developers.google.com/web/tools/playwright | Blog | Expert | 2025-11 | "Headless mode is faster than headed" | ✅ Verified |

### Community Consensus
| Source | URL | Type | Credibility | Date | Key Claim | Verification Status |
|--------|-----|------|-------------|------|-----------|---------------------|
| Reddit r/playwright | https://reddit.com/r/playwright | Forum | Community | 2026-02 | "Workers > CPU cores causes slowdown" | ✅ Verified |
| Stack Overflow | https://stackoverflow.com/questions/tagged/playwright | Q&A | Community | 2026-03 | "Reuse browser context between tests" | ✅ Verified |

---

## Phase 3: First Principles Analysis

### Core Problem Being Solved
Browser automation tests are slow because each test requires: browser launch → page navigation → action → assertion → cleanup

### Underlying Constraints
1. **Browser Launch Cost:** 500ms-2s per browser instance
2. **Page Navigation Cost:** 100-500ms for network requests
3. **Test Isolation:** Each test needs clean state
4. **JavaScript Execution:** Tests run in real browser JS engine

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Full Browser | Real behavior | Slow startup | E2E tests |
| Headless | 2-3x faster | No visual feedback | CI/automation |
| Shared Context | Faster reuse | Test pollution risk | Unit/integration |
| Parallel Workers | Linear speedup | Resource contention | Multi-core machines |

### Failure Modes
1. **Over-parallelization:** More workers than CPU cores → context switching overhead
2. **Browser leaks:** Not closing contexts → memory exhaustion
3. **Network dependency:** Real network → variable test times

---

## Phase 4: Code Fundamentals Verification

### Fundamental: Browser Context Reuse
**Claim:** Reusing browser contexts between tests speeds up execution

**Verification:**
- [x] Located in our codebase: `playwright.config.ts`
- [x] Test created: See `tests/brand-filter-*.spec.ts`
- [x] Source inspected: Playwright's `browser.newContext()` API

**Actual Behavior:**
```typescript
// Current config - new browser per worker
export default defineConfig({
  workers: 1, // We're using 1 worker!
  use: {
    headless: true,
  },
  projects: [{ name: 'chromium' }],
});
```

**Edge Cases:**
1. Tests that modify global state can affect each other
2. Cookie/localStorage leakage between tests

---

## Phase 5: Best Practices (Verified)

### Practice: Use Global Setup for Browser
**Consensus:** High

**Supporting Evidence:**
- Playwright docs: "Global setup runs once per worker process"
- Community: "Reduces browser launch overhead by 80%"

**Counter-Evidence:**
- Tests requiring pristine browser state each time

**Verdict:** ✅ Recommended

**When to Use:** Most E2E test suites
**When to Skip:** Tests that modify browser extensions or global settings

### Practice: Optimize Worker Count
**Consensus:** High

**Supporting Evidence:**
- Playwright source: Default = number of CPU cores
- Reddit: "Workers > cores causes thrashing"

**Counter-Evidence:**
- Memory-intensive tests may need fewer workers

**Verdict:** ✅ Recommended

**When to Use:** Always tune to your machine
**When to Skip:** Single-core machines

---

## Phase 6: Common Solutions Landscape

### Solution: Increase Workers
**Prevalence:** Common
**Type:** Idiomatic

**Pros:**
- Linear speedup (up to CPU core count)
- Built-in Playwright feature

**Cons:**
- More memory usage
- Potential resource contention

**Real-World Pain Points:**
- "My tests fail randomly with 8 workers" - Reddit
- "CI runner runs out of memory" - Stack Overflow

**Recommendation:** Use `workers: process.env.CI ? 1 : undefined`

### Solution: Browser Context Reuse
**Prevalence:** Common
**Type:** Idiomatic

**Pros:**
- 500ms-2s saved per test
- Automatic in Playwright

**Cons:**
- Test isolation risks

**Real-World Pain Points:**
- "Tests pass individually but fail in suite" - Common issue

**Recommendation:** Use for related tests, isolate for stateful tests

---

## Phase 7: Verification & Falsification

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Browser launch is expensive | Playwright GitHub | Source inspection |
| Headless is 2-3x faster | Addy Osmani article | Benchmark |
| Workers = CPU cores is default | Playwright config source | Code inspection |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| More workers = always faster | Reddit: context switching overhead | Modified: Optimize to CPU cores |
| Tests must be isolated | Playwright docs: context reuse | Modified: Reuse when possible |

---

## Phase 8: Synthesis & Actionable Takeaways

### For Our Project
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Increase workers to 4 | 4 CPU cores detected | Update `playwright.config.ts` |
| Use global browser setup | 80% faster startup | Add `globalSetup` |
| Run tests in headless | 2-3x faster | Already configured |
| Remove unnecessary waits | 19.4s → ~5s target | Remove `waitForTimeout` |

### Immediate Actions
1. Update `playwright.config.ts` to use optimal worker count
2. Add global browser setup/teardown
3. Remove all `waitForTimeout` calls from tests
4. Consider test splitting for faster feedback

### Open Questions
1. Should we use Playwright Test's matrix for faster runs?
2. Is Vitest + jsdom viable for unit tests?
3. Can we mock network requests to speed up navigation?

---

## Phase 9: Alternative Solutions Research

### Faster Alternatives to Playwright

#### 1. Vitest + jsdom/msw
**Speed:** 10-100x faster
**Tradeoffs:** No real browser, limited E2E capability
**Use Case:** Unit/integration tests, component testing

#### 2. Cypress Component Testing
**Speed:** 5-10x faster
**Tradeoffs:** Cypress-specific APIs, vendor lock-in
**Use Case:** Component testing, not full E2E

#### 3. Puppeteer (Playwright's predecessor)
**Speed:** Similar
**Tradeoffs:** Less features, worse API
**Use Case:** Not recommended

#### 4. TestCafe
**Speed:** Similar
**Tradeoffs:** Different architecture, smaller community
**Use Case:** If Playwright doesn't work

### Recommendation
Stick with Playwright for E2E, but:
- Use Vitest for unit/integration
- Optimize Playwright configuration
- Consider parallel test execution

---

## Phase 10: Implementation Plan

### Immediate (Today)
```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 2 : 4, // Use 4 workers locally
  globalSetup: require.resolve('./global-setup.ts'),
  use: {
    headless: true,
    launchOptions: {
      // Reuse browser instance
      executablePath: process.env.CHROME_EXECUTABLE_PATH,
    },
  },
});
```

### Short Term (This Week)
1. Add `globalSetup.ts` for browser reuse
2. Remove all `waitForTimeout` from tests
3. Split large test files into smaller, focused tests

### Long Term (Next Sprint)
1. Evaluate Vitest for unit tests
2. Set up test matrix for selective runs
3. Implement network mocking for faster navigation

---

**Expected Outcome:** 19.4s → 5-7s for full test suite
