# Search UI Test Suite — Critical Self-Audit & Rating

**Date:** 2026-04-02  
**Auditor:** Self-critique using /research + /audit workflows  
**Subject:** `_project/research/search-ui-test-suite-report.md`  
**Reference Standard:** `_project/audits/products-page-testing_2026-04-02.md`

---

## Executive Rating: 5/10

**Verdict:** **ACCEPTABLE FOUNDATION with CRITICAL GAPS.** The report demonstrates good research discipline and counter-evidence application, but falls short of professional testing audit standards in scope precision, test definition specificity, and coverage completeness.

---

## Part 1: /research Workflow Assessment

### ✅ What Passed Research Standards

| Criteria | Status | Evidence |
|----------|--------|----------|
| Counter-evidence included | ✅ | "Counter-Evidence" section challenges each major claim |
| First principles extraction | ✅ | Core problem defined: "intent-to-navigation pipeline" |
| Source triangulation | ⚠️ | Baymard cited but no URLs; Sanity docs referenced but not verified |
| Falsification attempts | ✅ | Challenge sections for 4 common assumptions |
| Scope boundaries | ✅ | "Quick view" identified as non-existent |

### ❌ Research Failures

| Failure | Severity | Why It Matters |
|---------|----------|----------------|
| No canonical source URLs | Medium | Cannot verify Baymard claims without links |
| GROQ behavior not verified with test | High | Claims `match` operator behavior without proving it |
| No framework source inspection | Medium | Next.js App Router search params behavior unverified |
| Knowledge decay not assessed | Low | No review dates for recommendations |

---

## Part 2: /audit Workflow Assessment — Against PLP Audit Standard

### Comparison Matrix

| Element | PLP Audit (Reference) | Search Report | Gap |
|---------|----------------------|---------------|-----|
| **Gap IDs** | G-01 through G-10, traceable | No systematic gap IDs | ❌ Missing |
| **Severity Levels** | Critical/High/Medium/Low | 🔴🟡🟢 emoji only | ⚠️ Informal |
| **Component Hierarchy** | Full tree diagram | Basic list only | ⚠️ Incomplete |
| **Spatial Architecture** | User flow groups mapped | Not included | ❌ Missing |
| **RWD Strategy Table** | Viewport × Component matrix | Mentioned, no table | ⚠️ Incomplete |
| **Files at Risk** | 5 files listed with mitigations | Not included | ❌ Missing |
| **Verification Commands** | Exact bash commands | Generic examples only | ⚠️ Incomplete |
| **Prioritization (P0/P1/P2)** | Explicit | "Immediate/Short-term" | ⚠️ Inconsistent |
| **Test Count Precision** | "5-7 new tests" range | "16 tests" exact | ✅ Good |
| **data-testid Audit** | Comprehensive | Not mentioned | ❌ Missing |

### Gap Analysis (Applied to Search Report)

#### G-S01: No data-testid Audit (CRITICAL)
**Issue:** Report doesn't verify if selectors exist for tests to target.

**Counter-evidence stress test:**
> What if `aria-label="Search products"` doesn't exist in the actual component?

**Verification:** Check `SearchField.tsx` lines 196-206:
```tsx
<input
  ref={mobileInputRef}
  type="text"
  placeholder="Search products..."
  aria-label="Search products"  ✅ EXISTS
```

**Verdict:** Selectors exist BUT report should have verified this. **Gap confirmed.**

#### G-S02: No Spatial Architecture Mapping (HIGH)
**Issue:** No visual flow of how search overlays interact with page content.

**Why this matters:**
- Mobile search overlay has `z-[60]` (line 168 in SearchField.tsx)
- Header is sticky with its own z-index
- Click-outside detection uses `mousedown` (line 110) — could conflict with other overlays

**Professional standard:** PLP audit shows spatial thinking prevents integration bugs.

#### G-S03: Missing Cross-Browser Strategy (MEDIUM)
**Issue:** Claims "Mobile Safari + Desktop Chrome covers 95%" without evidence.

**Counter-evidence:**
- Firefox handles `AbortController` differently in some versions
- Safari has known issues with `aria-activedescendant` updates
- Report dismisses cross-browser without proving the claim

#### G-S04: No Performance Threshold Definition (MEDIUM)
**Issue:** "< 30s total" is arbitrary, not derived from constraints.

**Professional standard:** PLP audit derives test count from actual gap analysis, not round numbers.

---

## Part 3: Scope Creep Analysis

### Potential Scope Creeps Identified

| # | Item | Status | Justification |
|---|------|--------|---------------|
| 1 | Race condition test (Test 1.4) | ⚠️ BORDERLINE | Complex to implement, adds 20% test time for edge case |
| 2 | Sort persistence test (Test 4.2) | ✅ LEGITIMATE | Core user journey, prevents regression |
| 3 | "Quick view" mention | ❌ SCOPE CREEP | Feature doesn't exist, wastes reader attention |
| 4 | Visual regression dismissal | ✅ LEGITIMATE | Correctly scoped out with counter-evidence |
| 5 | GROQ testing scope | ✅ LEGITIMATE | Correctly identified as covered by E2E |

### Scope Creep Verdict
**Score: 8/10** — Only 1 minor scope creep (race condition test complexity) and 1 documentation issue (quick view). Overall well-scoped.

---

## Part 4: False Positive Test Risk Analysis

### Tests At Risk of False Positives

| Test | Risk | Why | Mitigation Needed |
|------|------|-----|-------------------|
| 1.2: No request before 2 chars | **HIGH** | `waitForRequest` timeout 500ms may flake | Use request interception counting instead |
| 1.4: Race condition | **HIGH** | Route delay + timing sensitive | Add retry logic, mock at network layer |
| 2.2: Mobile auto-focus | **MEDIUM** | Focus may not be immediate after click | Wait for `input:focus` CSS class |
| 3.2: Enter to select | **MEDIUM** | Requires exact keyboard focus state | Add `expect` for `aria-selected` first |
| 4.2: Sort persistence | **LOW** | Price parsing fragile | Use `data-testid="price"` not text content |

### False Positive Prevention
**Current report:** Mentions flakiness concerns but doesn't provide specific mitigations.  
**PLP standard:** Shows specific verification commands and selector strategies.

---

## Part 5: Badly Defined Tests

### Test Definition Issues

#### Test 1.2: Debounce Test — VAGUE ASSERTION
**Current definition:**
```typescript
await expect(requestPromise).rejects.toThrow(); // Request should NOT fire
```

**Problem:** `rejects.toThrow()` on timeout is implementation-dependent. Some Playwright versions throw different error types.

**Professional definition:**
```typescript
let requestCount = 0;
await page.route(/searchProductsAutocomplete/, () => { requestCount++; });
await page.fill('[aria-label="Search products"]', 'h');
await page.waitForTimeout(400); // Slightly over debounce
expect(requestCount).toBe(0); // Explicit count verification
```

#### Test 1.4: Race Condition — UNDER-SPECIFIED
**Current definition:** 20 lines of code, complex routing logic.

**Missing:**
- What if "headphones" API returns before delayed "head" API?
- What if both requests fail?
- No cleanup of route handler

**Professional definition needed:**
- Use `page.route` with request tagging
- Explicit assertion on visible text, not just "no error"
- Guaranteed cleanup in `test.afterEach`

#### Test 3.1: Arrow Key Navigation — MISSING STATE SETUP
**Current definition:** Assumes autocomplete is open and populated.

**Missing:**
- What if API takes >1s? Test needs explicit wait.
- What if no products match "HD"? Test needs known test data.

#### Test 4.2: Sort Persistence — FRAGILE SELECTOR
**Current definition:**
```typescript
const prices = await page.locator('[data-testid="price"]').allTextContents();
```

**Problem:** Assumes `data-testid="price"` exists.  
**Verification:** Check `ProductCard.tsx` — uses `type-price` class, no testid on price element!

**Counter-evidence from actual code:**
```tsx
// ProductCard.tsx lines 45-46
<p className="type-price">
  ${product.displayPrice.toLocaleString()}
</p>
```

**This test would FAIL immediately due to missing selector.**

---

## Part 6: Missed Critical Journey Paths

### CRITICAL: Search-to-PDP Navigation Not Tested

**Missing Journey:**
```
Search Field → Type Query → Click Suggestion → Product Detail Page
                                           ↓
                                    Verify BREADCRUMB has search reference
                                    Verify "Back to search" capability
```

**Why this is critical:**
- Baymard: "Users expect to return to search results after viewing product"
- Current SearchField closes overlay and navigates (line 62-65), but:
  - No test verifies PDP actually loads
  - No test verifies search query is preserved in browser history
  - No test verifies breadcrumb shows "Search" → Product

### HIGH: Search Query Persistence in URL

**Missing Test:**
```typescript
test('search query persists in URL for sharing', async ({ page }) => {
  await page.goto('/search?q=hd650');
  const url = page.url();
  expect(url).toContain('q=hd650'); // Works
  
  // Missing: User modifies search, URL updates
  await page.fill('[aria-label="Search products"]', 'sennheiser');
  await page.keyboard.press('Enter');
  expect(page.url()).toContain('q=sennheiser'); // Live URL sync
});
```

**Why this matters:** Search results page should allow in-page search modification. Currently untested.

### HIGH: No Results → Category Suggestion Click

**Missing Journey:**
```
Empty search results → Click "Try Instead: Headphones" 
                     → Navigate to /products/headphones
                     → Verify products load
```

**Code reference:** `SearchEmpty.tsx` — shows recovery options but no test verifies they work.

### MEDIUM: Mobile Keyboard Dismissal

**Missing Test:**
```typescript
test('mobile search overlay closes when clicking result', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.click('[aria-label="Open search"]');
  await page.fill('[aria-label="Search products"]', 'sennheiser');
  await page.click('[role="option"]:first-child');
  
  // Missing: Verify mobile overlay is dismissed (not just navigated)
  // Missing: Verify body scroll is restored
});
```

### MEDIUM: Search from Non-Homepage Pages

**Missing Context:**
- All tests assume starting from `/`
- What about search from `/products/headphones`?
- What about search from PDP?
- Header search is persistent — tests should verify on multiple page types.

---

## Part 7: Missed End-to-End Critical Areas

### E2E Gap 1: No Accessibility Scan Integration

**PLP Standard:** `tests/e2e/homepage/accessibility.spec.ts` — comprehensive axe-core scan.

**Search Report Gap:** No mention of accessibility testing for:
- `aria-expanded` state changes (lines 201-203 in SearchField.tsx)
- `aria-activedescendant` updates during keyboard nav
- Focus trap in mobile overlay
- Screen reader announcements for result count

**Required Test:**
```typescript
test('search autocomplete meets WCAG 2.1 AA', async ({ page }) => {
  await injectAxe(page);
  await page.fill('[aria-label="Search products"]', 'hd');
  await page.waitForSelector('[role="listbox"]');
  await checkA11y(page, '[role="listbox"]', {
    rules: { 'aria-required-attr': { enabled: true } }
  });
});
```

### E2E Gap 2: No Error State Testing

**Missing:** What happens when Sanity API fails?

**Current Code:** `searchProducts.ts` lines 33-47 — no error handling shown.

**Required Test:**
```typescript
test('API error shows user-friendly message', async ({ page }) => {
  await page.route(/searchProductsAutocomplete/, route => route.abort('failed'));
  await page.fill('[aria-label="Search products"]', 'hd');
  await expect(page.locator('text=Unable to search')).toBeVisible();
});
```

### E2E Gap 3: No Loading State Boundaries

**Missing:** Tests for loading → results transition edge cases.

**Current Code:** Lines 77-90 in SearchField.tsx — loading state managed but untested.

**Required Tests:**
- Loading skeleton visible while API in flight
- Results replace skeleton (no ghost skeleton)
- Rapid typing during loading — new request cancels old

### E2E Gap 4: No Session Persistence

**Missing:** Does search query persist across page refresh?

**Expected behavior:**
```typescript
test('search query persists after page refresh', async ({ page }) => {
  await page.goto('/search?q=sennheiser');
  await page.reload();
  await expect(page.locator('[aria-label="Search products"]')).toHaveValue('sennheiser');
});
```

**Code check:** SearchField.tsx line 17 — `initialQuery` from `searchParams` ✅ implemented, untested.

### E2E Gap 5: No Cross-Page Search Integration

**Missing:** Header search on pages other than home.

**Required Test:**
```typescript
test('search works from product detail page', async ({ page }) => {
  await page.goto('/product/sennheiser-hd-569-headphones');
  await page.fill('[aria-label="Search products"]', 'hd650');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/search?q=hd650');
});
```

---

## Part 8: Final Rating Breakdown (1-10 Scale)

### Category Scoring

| Category | Score | Max | Weight | Weighted |
|----------|-------|-----|--------|----------|
| **Scope Precision** | 8 | 10 | 15% | 1.2 |
| **Counter-Evidence Quality** | 8 | 10 | 15% | 1.2 |
| **Test Definition Specificity** | 4 | 10 | 20% | 0.8 |
| **Critical Path Coverage** | 5 | 10 | 25% | 1.25 |
| **E2E Area Completeness** | 4 | 10 | 20% | 0.8 |
| **Professional Audit Standards** | 5 | 10 | 5% | 0.25 |
| **TOTAL** | — | — | **100%** | **5.5/10** |

### Score Justification

#### Scope Precision: 8/10
- Well-scoped with clear boundaries
- Correctly identified "quick view" as out of scope
- Minor issue: race condition test borders on over-engineering

#### Counter-Evidence Quality: 8/10
- Good falsification sections
- Challenges common assumptions
- Weakness: no source URLs for verification

#### Test Definition Specificity: 4/10
- **MAJOR ISSUE:** Test 4.2 uses non-existent `data-testid="price"` selector
- Several tests under-specified (race condition, keyboard nav)
- No explicit wait strategies defined
- Missing test data requirements

#### Critical Path Coverage: 5/10
- Happy path covered ✅
- Missing: search-to-PDP navigation verification
- Missing: URL persistence across refresh
- Missing: cross-page search functionality
- Missing: empty state → category recovery

#### E2E Area Completeness: 4/10
- No accessibility integration tests
- No error state handling
- No loading state boundary tests
- No session persistence verification
- Missing mobile-specific gesture tests (swipe to close?)

#### Professional Audit Standards: 5/10
- No gap ID system (G-01 style)
- No data-testid audit
- No spatial architecture mapping
- No files-at-risk analysis
- No exact verification commands

---

## Part 9: Corrected Test Suite Specification

### Revised File Structure (Professional Standard)

```
tests/e2e/search/
├── README.md                       # Test philosophy + troubleshooting
├── search-field.spec.ts            # 4 tests (removed race condition)
├── search-mobile.spec.ts           # 4 tests (added keyboard dismiss)
├── search-keyboard.spec.ts         # 4 tests (added a11y scan)
├── search-results.spec.ts          # 5 tests (added URL persistence)
├── search-errors.spec.ts           # NEW: 3 tests (API error states)
└── search-cross-page.spec.ts       # NEW: 3 tests (search from PDP/PLP)
```

**Total: 23 tests** (was 16, +7 for gaps)

### Critical Fixes Required

| Test ID | Fix | Priority |
|---------|-----|----------|
| 4.2 | Change selector to `type-price` class or add data-testid | P0 |
| 1.2 | Use request counting, not rejection assertion | P0 |
| 1.4 | Simplify or remove — race condition test is flaky | P1 |
| NEW | Add search-to-PDP navigation verification | P0 |
| NEW | Add accessibility scan test | P0 |
| NEW | Add API error handling test | P1 |

---

## Part 10: Summary & Recommendations

### What The Report Does Well
1. **Strong research foundation** — First principles clearly articulated
2. **Honest scope assessment** — Correctly identified "quick view" as non-existent
3. **Good counter-evidence** — Challenges 4 common assumptions
4. **Reasonable test count** — 16 tests is achievable, not overwhelming

### Critical Deficiencies
1. **Test definitions contain bugs** — Test 4.2 would fail immediately
2. **Missing 7 critical user journeys** — Search-to-PDP, persistence, errors
3. **No accessibility integration** — WCAG compliance untested
4. **No data-testid verification** — Selectors assumed but not checked
5. **Not audit-standard format** — Missing gap IDs, severity matrix, spatial mapping

### To Reach 8/10 Professional Standard

**Required additions:**
1. Add data-testid audit section (verify all selectors exist)
2. Add 7 missing E2E critical journeys
3. Add accessibility integration test
4. Fix test 4.2 selector bug
5. Add spatial architecture diagram
6. Add gap ID system (G-S01, G-S02, etc.)
7. Add exact verification commands

**Estimated additional work:** 2-3 hours

---

## Final Verdict

**Current Rating: 5/10** — Acceptable foundation, not production-ready specification.

**With recommended fixes: 8/10** — Professional-grade test suite specification.

**Blockers for implementation:**
- ❌ Test 4.2 uses non-existent selector
- ❌ Race condition test (1.4) needs simplification or removal
- ❌ Missing P0 critical journeys (search-to-PDP, a11y)

**Safe to implement after:** Fix selector bugs, add missing P0 journeys.

---

**End of Critical Self-Audit**
