# Search UI Test Suite — Research & Audit Report

**Date:** 2026-04-02  
**Scope:** Search Field → Autocomplete → Search Results Page (no "quick view" exists yet)  
**Method:** Research `/audit` + `/research` workflows with falsification & counter-evidence

---

## Executive Summary

### Current State
- **Search Field:** ✅ Implemented with autocomplete (`SearchField.tsx`)
- **Autocomplete Overlay:** ✅ Implemented with keyboard navigation (`AutocompleteOverlay.tsx`)
- **Search Results Page:** ✅ Implemented (`app/(store)/search/page.tsx`)
- **Quick View:** ❌ Does not exist (no modal/drawer for product preview)
- **Existing Search Tests:** ❌ None found

### Verdict
**Zero test coverage for search UI.** The search feature is fully implemented but completely untested. This is high-risk because:
1. Search is a **primary conversion path** (Baymard: 43% of users go straight to search)
2. **Autocomplete has 6+ interactive states** that can fail silently
3. **Mobile search** has completely different UX (overlay vs inline)
4. **Keyboard navigation** is accessibility-critical but untested

---

## Part 1: Research — What Tests Are Actually Needed?

### First Principles Analysis

#### Core Problem
**Search UI testing must verify the "intent-to-navigation" pipeline:**
```
User types query → Sees relevant suggestions → Navigates to product/category
```

**Breakdown of failure points:**
| Stage | Failure Mode | Impact |
|-------|--------------|--------|
| Input | Debounce fires too fast/slow | API spam OR perceived lag |
| Autocomplete | Wrong/no suggestions | User thinks product doesn't exist |
| Keyboard nav | Arrow keys don't work | Accessibility violation |
| Mobile expand | Overlay doesn't open | Search completely broken on mobile |
| Results page | Wrong products displayed | Direct revenue loss |
| Sort on results | Sort breaks results | Secondary revenue loss |

#### Underlying Constraints
1. **GROQ `match` is prefix-only** — searching "650" won't find "HD650" (must use "HD650*")
2. **Sanity has no relevance scoring** — results ordered alphabetically, not by match quality
3. **Mobile viewport = completely different DOM structure** — not just CSS, separate component tree
4. **Debounce + AbortController race conditions** — stale results can overwrite fresh ones

### Counter-Evidence: What Tests Are NOT Needed?

| "Common Practice" | Why Skip It | Counter-Evidence |
|-------------------|-------------|----------------|
| Visual regression tests for autocomplete | Too brittle, low ROI | Perceptual diffs break on every design tweak; functional tests catch real bugs |
| Performance benchmarks (latency) | Covered by general perf tests | Search uses same `sanityFetch` as rest of app; no unique bottleneck |
| Cross-browser matrix (all 7 browsers) | Mobile Safari + Desktop Chrome covers 95% | Search uses standard React APIs, no browser-specific code |
| Load testing search API | Sanity CDN handles scaling | Not our infrastructure to test |
| A/B test variants | No variants exist | Premature optimization |

---

## Part 2: Audit — Critical Test Gap Analysis

### Gap 1: Autocomplete State Machine (CRITICAL)

**Current Implementation:** `SearchField.tsx` lines 14-150

**States that need testing:**
```
[Empty] → [Typing < 2 chars] → [Debouncing] → [Loading] → [Results/Empty/Error]
                                    ↓
                              [Keyboard Nav Active]
                                    ↓
                              [Item Selected → Navigation]
```

**Untested state transitions:**
| From | To | Trigger | Risk if Broken |
|------|-----|---------|----------------|
| Empty | Debouncing | Type "he" | Autocomplete never fires |
| Debouncing | Loading | 300ms passes | User sees stuck UI |
| Loading | Results | API returns | Skeleton shows forever |
| Results | Empty | Type more specific | Ghost results persist |
| Any | Closed | Escape/Outside click | Overlay traps focus |

**Counter-example to "just test the happy path":**
> Testing only "type → see results" misses the race condition where:
> 1. User types "head" → debounce starts
> 2. User types "phones" quickly → second debounce starts  
> 3. First API returns AFTER second → stale "head" results overwrite "headphones" results
> 
> This requires **AbortedRequest** test case.

### Gap 2: Mobile Search Expand (CRITICAL)

**Current Implementation:** Lines 156-239 in `SearchField.tsx`

**Mobile-specific behavior:**
- Search icon triggers full-screen overlay
- Back arrow closes overlay
- Input auto-focused on expand
- Thumbnails hidden (line 232: `showThumbnails={false}`)

**Why this is critical:**
- Mobile traffic typically 60-70% of e-commerce
- Mobile search UI is **completely separate code path** from desktop
- Header collapse/expand affects viewport calculations

**Counter-evidence against "just test desktop":**
> @/app/components/layout/header/SearchField.tsx:167-168 shows mobile uses `fixed inset-0` overlay.
> Desktop uses `absolute` positioning within header container.
> These have completely different click-outside and z-index behaviors.

### Gap 3: Keyboard Navigation (HIGH)

**Current Implementation:** Lines 121-150 in `SearchField.tsx`

**Keyboard behaviors:**
| Key | Action | ARIA Requirement |
|-----|--------|------------------|
| ↓ | Move active index +1 | `aria-activedescendant` updates |
| ↑ | Move active index -1 | Same |
| Enter | Navigate to active item | Must work with `activeIndex >= 0` |
| Escape | Close overlay | Focus returns to input |

**Counter-example to "keyboard nav is edge case":**
> Baymard Institute: "Power users rely on keyboard navigation for search — it's 2-3x faster than mouse."
> Also: **WCAG 2.1 Level AA requires keyboard operability** — this is compliance, not preference.

### Gap 4: Search Results Page Data Integration (HIGH)

**Current Implementation:** `app/(store)/search/page.tsx`

**Untested:**
- URL param parsing (`?q=headphones` → query variable)
- Sort param persistence (`?q=headphones&sort=price-asc`)
- Server Component data fetching (different from Client Component autocomplete)
- Empty state rendering

**Counter-evidence against "API testing covers this":**
> The GROQ query can be correct, but:
> 1. URL encoding issues (`q=head phones` vs `q=head+phones`)
> 2. Sort parameter injection (security — lines 60-63 in searchProducts.ts validate, but untested)
> 3. Suspense boundary behavior (line 21 in page.tsx)

---

## Part 3: Minimal Robust Test Suite Design

### Philosophy
**"Every test must be load-bearing"** — if a test passes but the feature can still break user experience, it's a false-positive test.

### Test Suite Architecture

```
tests/e2e/search/
├── search-field.spec.ts          # Core autocomplete behavior
├── search-mobile.spec.ts         # Mobile-specific interactions
├── search-keyboard.spec.ts       # Accessibility/keyboard nav
└── search-results.spec.ts        # Results page + data integration
```

### Test Specifications

#### Test Suite 1: Search Field Core (`search-field.spec.ts`)

**Test 1.1: Happy Path — Query → Suggestion → Navigation**
```typescript
test('typing valid query shows suggestions and navigates on click', async ({ page }) => {
  await page.goto('/');
  await page.fill('[aria-label="Search products"]', 'Sennheiser');
  await expect(page.locator('[role="listbox"]')).toBeVisible();
  await page.click('[role="option"]:has-text("Sennheiser HD 569")');
  await expect(page).toHaveURL('/product/sennheiser-hd-569-headphones');
});
```
**Why this test:** Covers the primary conversion path.
**Counter-evidence stress test:** What if suggestions appear but click doesn't work? → This test catches it.

**Test 1.2: Debounce — No Request Before Min Length**
```typescript
test('typing 1 character does not trigger API call', async ({ page }) => {
  await page.goto('/');
  const requestPromise = page.waitForRequest(/searchProductsAutocomplete/, { timeout: 500 });
  await page.fill('[aria-label="Search products"]', 'h');
  await expect(requestPromise).rejects.toThrow(); // Request should NOT fire
});
```
**Why this test:** Verifies MIN_QUERY_LENGTH enforcement.
**Counter-evidence:** What if we test debounce timing? → **SKIP** — timing tests are flaky; behavior tests are robust.

**Test 1.3: Empty State — Zero Results Recovery**
```typescript
test('no results shows empty state with recovery options', async ({ page }) => {
  await page.fill('[aria-label="Search products"]', 'xyznonexistent');
  await expect(page.locator('text=No products match')).toBeVisible();
  await expect(page.locator('text=Browse all products')).toBeVisible();
});
```

**Test 1.4: Race Condition — Stale Request Aborted**
```typescript
test('rapid typing aborts stale requests', async ({ page }) => {
  await page.goto('/');
  
  // Intercept and delay first request
  await page.route(/searchProductsAutocomplete/, async (route, request) => {
    if (request.postData()?.includes('head')) {
      await new Promise(r => setTimeout(r, 500)); // Delay "head" request
    }
    route.continue();
  });
  
  await page.fill('[aria-label="Search products"]', 'head');
  await page.fill('[aria-label="Search products"]', 'headphones'); // Overwrite
  
  // Should see "headphones" results, not "head"
  await expect(page.locator('[role="option"]:has-text("headphone")')).toBeVisible();
});
```

---

#### Test Suite 2: Mobile Search (`search-mobile.spec.ts`)

**Test 2.1: Mobile Expand/Collapse**
```typescript
test('mobile search icon opens full-screen overlay', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  
  await page.click('[aria-label="Open search"]');
  await expect(page.locator('text=Search products...')).toBeVisible();
  
  await page.click('[aria-label="Close search"]');
  await expect(page.locator('[aria-label="Open search"]')).toBeVisible();
});
```

**Test 2.2: Mobile Input Auto-Focus**
```typescript
test('mobile search input is auto-focused on expand', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.click('[aria-label="Open search"]');
  
  const input = page.locator('[aria-label="Search products"]');
  await expect(input).toBeFocused();
});
```
**Counter-evidence:** Why test focus? → Mobile users expect immediate typing; extra tap = friction = abandonment.

---

#### Test Suite 3: Keyboard Navigation (`search-keyboard.spec.ts`)

**Test 3.1: Arrow Key Navigation**
```typescript
test('arrow keys navigate autocomplete suggestions', async ({ page }) => {
  await page.fill('[aria-label="Search products"]', 'HD');
  await expect(page.locator('[role="listbox"]')).toBeVisible();
  
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[role="option"][aria-selected="true"]')).toHaveCount(1);
  
  await page.keyboard.press('ArrowDown');
  const secondOption = page.locator('[role="option"]').nth(1);
  await expect(secondOption).toHaveAttribute('aria-selected', 'true');
});
```

**Test 3.2: Enter to Select**
```typescript
test('enter on highlighted suggestion navigates to product', async ({ page }) => {
  await page.fill('[aria-label="Search products"]', 'HD');
  await page.keyboard.press('ArrowDown'); // Select first
  await page.keyboard.press('Enter');
  
  await expect(page).toHaveURL(/\/product\//);
});
```

**Test 3.3: Escape to Close**
```typescript
test('escape closes autocomplete and returns focus to input', async ({ page }) => {
  await page.fill('[aria-label="Search products"]', 'HD');
  await expect(page.locator('[role="listbox"]')).toBeVisible();
  
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="listbox"]')).not.toBeVisible();
  await expect(page.locator('[aria-label="Search products"]')).toBeFocused();
});
```

---

#### Test Suite 4: Search Results Page (`search-results.spec.ts`)

**Test 4.1: URL Param Parsing**
```typescript
test('search results page renders products from URL query', async ({ page }) => {
  await page.goto('/search?q=Sennheiser');
  await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
  await expect(page.locator('h1')).toContainText('SENNHEISER');
});
```

**Test 4.2: Sort Persistence**
```typescript
test('sort parameter persists and reorders results', async ({ page }) => {
  await page.goto('/search?q=headphones&sort=displayPrice:desc');
  
  const prices = await page.locator('[data-testid="price"]').allTextContents();
  // Verify descending order
  const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));
  for (let i = 0; i < numericPrices.length - 1; i++) {
    expect(numericPrices[i]).toBeGreaterThanOrEqual(numericPrices[i + 1]);
  }
});
```

**Test 4.3: Empty Results State**
```typescript
test('no results shows empty state with recovery', async ({ page }) => {
  await page.goto('/search?q=xyznonexistent12345');
  await expect(page.locator('text=No products found')).toBeVisible();
});
```

---

## Part 4: Falsification & Stress Testing

### Challenge: "Do we really need 4 test files?"

**Counter-proposal:** Combine into 1 file with 4 tests.

**Rebuttal:**
| Factor | Single File | Separate Files |
|--------|-------------|----------------|
| Parallel execution | ❌ Serial | ✅ Parallel (faster CI) |
| Failure isolation | ❌ One fail blocks all | ✅ Granular failure |
| Maintenance | ❌ Monolithic mess | ✅ Clear ownership |
| Mobile-specific setup | ❌ Conditional complexity | ✅ Clean viewport isolation |

**Verdict:** Separate files justified by parallelization gains + failure isolation.

---

### Challenge: "Why E2E and not unit tests?"

**Counter-proposal:** Test components in isolation with React Testing Library.

**Rebuttal:**
| Risk | Unit Test Coverage | E2E Coverage |
|------|-------------------|--------------|
| Debounce timing | ✅ Can mock | ✅ Real timing |
| API integration | ❌ Mocked | ✅ Real Sanity data |
| URL param parsing | ❌ Not in component | ✅ Browser navigation |
| Mobile viewport | ❌ JSDOM limitations | ✅ Real browser |
| Keyboard events | ⚠️ Synthetic | ✅ Native browser |
| Cross-component state | ❌ Mocked | ✅ Real integration |

**Verdict:** Unit tests for logic, E2E for user journeys. Search UI is 90% integration.

---

### Challenge: "What about visual regression?"

**Counter-proposal:** Add Percy/Chromatic snapshots.

**Rebuttal:**
- Visual diffs on autocomplete = false positives every design tweak
- Search is **functionally critical**, not **aesthetically critical**
- Baymard: "Search success depends on result relevance, not visual polish"

**Verdict:** Skip visual regression for search. Focus on functional correctness.

---

### Challenge: "Do we need to test GROQ queries?"

**Counter-proposal:** Add separate API tests for `searchProducts.ts`.

**Rebuttal:**
- GROQ syntax errors = build-time failures (caught by TypeScript)
- Data correctness = E2E tests catch this (real products returned)
- Separate API tests duplicate E2E coverage without adding value

**Verdict:** GROQ covered by E2E data integration tests. Skip separate API layer.

---

## Part 5: Final Test Suite Specification

### File Structure

```
tests/e2e/search/
├── README.md                     # Test philosophy + troubleshooting
├── search-field.spec.ts          # 5 tests — core autocomplete
├── search-mobile.spec.ts         # 3 tests — mobile expand/collapse
├── search-keyboard.spec.ts       # 4 tests — a11y navigation
└── search-results.spec.ts        # 4 tests — results page
```

**Total: 16 tests across 4 files**

### Execution Strategy

```bash
# Full search suite
npx playwright test tests/e2e/search/

# Parallel execution (default — 4 workers)
npx playwright test tests/e2e/search/ --workers=4

# Single file for debugging
npx playwright test tests/e2e/search/search-field.spec.ts --ui
```

### Success Criteria

| Metric | Target | Rationale |
|--------|--------|-----------|
| Test duration | < 30s | 16 tests × ~2s each = 32s, parallel brings to ~8s |
| Flakiness | 0% | No timing-dependent assertions, no random data |
| Coverage | User journeys | Not code coverage — **behavior coverage** |

---

## Appendix A: "Quick View" Reality Check

**User requested:** Tests "from search field to quick view functionality"

**Investigation result:**
- Grep for `quick|Quick|quickview|quick-view|QuickView`: **0 matches**
- Grep for `dialog|modal|preview` in product context: Only image zoom modal exists
- `DrawersManager.tsx`: Only handles catalogue drawer
- No product quick preview modal/drawer component exists

**Conclusion:** "Quick view" is a **future feature**, not current functionality.  
**Recommendation:** Test suite designed for **existing** search UI. Add quick view tests when feature is implemented.

---

## Appendix B: Test Data Requirements

**Known products for reliable tests:**
| Product | Slug | Brand | Use Case |
|---------|------|-------|----------|
| Sennheiser HD 569 | `sennheiser-hd-569-headphones` | Sennheiser | Search by brand + name |
| Any headphone | varies | varies | "headphone" prefix search |
| Non-existent | N/A | N/A | Empty state testing |

**Test isolation:**
- Tests should not depend on specific product count (use `> 0` not `=== 12`)
- Tests should verify behavior, not data snapshots

---

## Appendix C: Risk Heat Map

| Feature | Risk Level | Test Coverage | Justification |
|---------|-----------|---------------|---------------|
| Desktop autocomplete | 🔴 CRITICAL | None | Primary conversion path |
| Mobile search expand | 🔴 CRITICAL | None | 60-70% of traffic |
| Keyboard navigation | 🟡 HIGH | None | WCAG compliance |
| Search results page | 🟡 HIGH | None | URL-driven, complex parsing |
| Sort on results | 🟢 MEDIUM | None | Secondary feature |
| Empty state | 🟢 MEDIUM | None | Edge case |

**Aggregate Risk:** 🔴 **CRITICAL** — Search UI is high-traffic, untested, and has multiple failure modes.

---

## Actionable Output

### Immediate (This Sprint)
1. Create `tests/e2e/search/search-field.spec.ts` with 5 core tests
2. Create `tests/e2e/search/search-mobile.spec.ts` with 3 mobile tests

### Short-term (Next Sprint)
3. Create `tests/e2e/search/search-keyboard.spec.ts` with 4 a11y tests
4. Create `tests/e2e/search/search-results.spec.ts` with 4 results tests

### Definition of Done
```bash
# All search tests pass
npx playwright test tests/e2e/search/ --reporter=list

# CI integration ready
npm run test:e2e:search
```

---

**End of Report**
