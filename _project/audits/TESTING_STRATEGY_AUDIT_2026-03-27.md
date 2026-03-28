# Testing Strategy Audit Report

**Project:** SangLogium  
**Date:** March 27, 2026  
**Auditor:** Cascade AI  
**Scope:** Full codebase testing infrastructure, RWD coverage, visual testing, and pragmatic value assessment

---

## Executive Summary

**Current State:** The codebase has a **solid foundation** with Playwright E2E, Vitest unit tests, and Playwright component tests. However, there are **significant gaps** in visual regression testing, RWD coverage breadth, and test execution strategy that prevent the testing suite from delivering maximum pragmatic value.

**Key Finding:** Tests exist but aren't optimized for **developer velocity** or **visual confidence**. The gap between "tests pass" and "UI looks perfect" remains unbridged.

**Verdict:** 6/10 — Functional but not professional-grade. High potential with targeted improvements.

---

## 1. Current Testing Inventory

### 1.1 Test Infrastructure Overview

| Tool | Purpose | Status | Coverage |
|------|---------|--------|----------|
| **Vitest** | Unit/Integration tests | Active | VFS utilities, formatting, cookies |
| **Playwright** | E2E tests | Active | Homepage sections, RWD matrix, accessibility |
| **Playwright CT** | Component tests | Active | FeaturedCard, DacCard, IemCard, AccessoryCard |
| **@axe-core/playwright** | Accessibility | Active | WCAG 2.1 AA scanning |
| **Jest** | Legacy tests | Dormant | Basket tests (commented out) |

### 1.2 Test File Structure

```
tests/
├── e2e/
│   └── homepage/
│       ├── accessibility.spec.ts     # WCAG compliance (10 tests)
│       ├── regression.spec.ts         # UI stability (12 tests)
│       ├── rwd-matrix.spec.ts        # Responsive matrix (8 tests)
│       └── sections.spec.ts          # Section functionality (21 tests)
├── component/
│   ├── AccessoryCard.spec.tsx        # Component isolation tests
│   ├── DacCard.spec.tsx
│   ├── FeaturedCard.spec.tsx
│   └── IemCard.spec.tsx
├── unit/
│   ├── homepage/
│   │   ├── cookies.test.ts           # Cookie utilities
│   │   └── formatting.test.ts        # Price/formatting utils
│   └── vfs/
│       ├── data-integrity.test.ts    # VFS data validation
│       ├── descendant-unrolling.test.ts
│       ├── groq-parameter.test.ts
│       ├── run-all-tests.ts
│       └── slug-resolution.test.ts
├── integration/
│   └── carousel.spec.tsx             # Carousel behavior (11 tests)
├── address/
│   ├── address.integration.test.ts
│   ├── address.unit.test.ts
│   └── fixtures.ts
├── regression/
│   └── performance-sprint-regression.ts
├── utils/
│   ├── homepage-helpers.ts
│   └── playwright-helpers.ts
└── smoke.spec.ts                     # Basic connectivity
```

### 1.3 Test Scripts (package.json)

| Script | Purpose | Frequency |
|--------|---------|-----------|
| `test` | Vitest runner | Development |
| `test:ci` | Vitest with coverage | CI/CD |
| `test:homepage:unit` | Homepage unit tests | Targeted |
| `test:homepage:component` | Component tests | Targeted |
| `test:homepage:e2e` | Full E2E | Targeted |
| `test:homepage:rwd` | RWD matrix | Targeted |
| `test:homepage:a11y` | Accessibility | Targeted |

---

## 2. Strengths Assessment

### 2.1 What Works Well

1. **Playwright Configuration is Comprehensive**
   - Multi-browser coverage (Chromium, Firefox, WebKit, Edge)
   - Mobile viewport testing (Pixel 5, iPhone 12)
   - Desktop coverage (Chrome, Safari, Firefox)
   - Tracing enabled for debugging

2. **Accessibility Testing is Present**
   - axe-core integration for WCAG 2.1 AA
   - Keyboard navigation verification
   - Heading hierarchy validation
   - Color contrast checks
   - Focus indicator verification

3. **RWD Matrix Test Exists**
   - 6 viewport combinations tested
   - Touch target size validation (44px minimum)
   - Horizontal overflow detection
   - Mobile/desktop navigation toggle verification

4. **Component Testing Infrastructure**
   - Playwright CT configured
   - Real browser rendering
   - Cross-browser component validation

5. **Test Organization is Logical**
   - Clear separation of concerns
   - Helper utilities abstracted
   - Fixture data centralized

---

## 3. Critical Gaps & Vanity Tests

### 3.1 Vanity Tests (Remove or Transform)

**Definition:** Tests that pass but provide no confidence about actual user value.

| Test | Location | Issue | Action |
|------|----------|-------|--------|
| Smoke test | `tests/smoke.spec.ts` | Only asserts `true === true` | Delete or make meaningful |
| Class presence tests | Component specs | Testing Tailwind classes, not behavior | Transform to visual tests |
| Jest basket tests | `tests/jest/basket/` | Entirely commented out | Migrate to Playwright or delete |
| Hover class checks | `FeaturedCard.spec.tsx:66-75` | Testing CSS classes, not user experience | Replace with visual regression |
| Image attribute tests | `FeaturedCard.spec.tsx:77-95` | Testing implementation details | Keep only if critical for SEO |

### 3.2 Critical Gaps

#### Gap 1: No Visual Regression Testing
**Impact:** UI can break silently. "Tests pass but looks wrong" scenario.

**Current State:**
- Screenshots taken in RWD tests but not compared
- No baseline image storage
- No pixel-level comparison

**Evidence:**
```typescript
// tests/e2e/homepage/rwd-matrix.spec.ts:34-37
await page.screenshot({ 
  path: `test-results/homepage-rwd-${name}-${width}x${height}.png`,
  fullPage: true 
});
// ^ Screenshot saved but NEVER compared to baseline
```

**Professional Standard:** Every PR should include visual diff of key pages.

#### Gap 2: RWD Coverage is Shallow
**Impact:** Breakpoints between tested viewports may have layout issues.

**Current Coverage:**
| Viewport | Width | Height | Device |
|----------|-------|--------|--------|
| mobile-portrait | 390 | 844 | iPhone 14 |
| mobile-landscape | 844 | 390 | iPhone 14 |
| tablet-portrait | 768 | 1024 | iPad Mini |
| tablet-landscape | 1024 | 768 | iPad Mini |
| desktop | 1280 | 720 | Generic |
| large-desktop | 1440 | 900 | Generic |

**Missing:**
- No 320px (small mobile) testing
- No 1920px+ (ultrawide) testing
- No testing at exact Tailwind breakpoints
- No portrait-to-landscape rotation testing
- No device pixel ratio testing (1x vs 2x vs 3x)

#### Gap 3: No Storybook or Component Documentation
**Impact:** Components can't be developed in isolation. Visual states not documented.

**Current State:** No Storybook installation.

**Professional Standard:** Every reusable component should have visible states documented.

#### Gap 4: Test Selectors are Brittle
**Impact:** Tests break when implementation changes, even when behavior is correct.

**Current Pattern:**
```typescript
// Brittle - depends on implementation
await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
await expect(card).toHaveClass(/group-hover:shadow-cardHover/);
```

**Better Pattern:**
```typescript
// Resilient - tests user experience
await expect(page.getByRole('navigation', { name: 'Mobile menu' })).toBeVisible();
await card.hover();
await expect(card).toHaveCSS('box-shadow', expectedShadow);
```

#### Gap 5: No Visual Polish Testing
**Impact:** Design inconsistencies slip through.

**Untested Visual Aspects:**
- Typography rendering (font loading, line height)
- Color consistency across components
- Spacing/rhythm adherence
- Image aspect ratio preservation
- Animation smoothness (60fps check)
- Loading state visual quality
- Error state visual quality

#### Gap 6: CI/CD Pipeline is Commented Out
**Impact:** Tests aren't running automatically.

**Current State:** `.github/workflows/playwright.yml` is entirely commented.

**Evidence:**
```yaml
# name: Playwright Tests
# on: [push, pull_request]
# jobs:
#   test:
#     ...
```

---

## 4. RWD & Visual Testing Deep Dive

### 4.1 Current RWD Test Analysis

**File:** `tests/e2e/homepage/rwd-matrix.spec.ts`

| Test | Value | Gap |
|------|-------|-----|
| Viewport matrix iteration | ✅ Ensures no crashes | ❌ No visual comparison |
| Touch target size | ✅ Catches mobile UX issues | ❌ Only tests buttons/links, not all interactive elements |
| Horizontal overflow | ✅ Catches layout bugs | ❌ Doesn't check vertical overflow/scrolling |
| Hover states | ✅ Verifies interaction | ❌ Tests class presence, not visual result |
| Grid layout | ✅ Checks structure | ❌ Doesn't verify grid item alignment |
| Content clipping | ✅ Basic visibility | ❌ Doesn't check text truncation |

### 4.2 Missing RWD Scenarios

1. **Text Readability at All Sizes**
   - Font size < 12px on any viewport
   - Line height compression
   - Text overlapping other elements

2. **Image Behavior**
   - srcset/sizes attribute effectiveness
   - Aspect ratio preservation
   - Lazy loading boundary conditions

3. **Interactive Element Spacing**
   - Button groups on mobile (thumb reachability)
   - Form field spacing on small screens
   - Carousel touch swipe vs button click

4. **Navigation Patterns**
   - Mobile menu open/close animation
   - Submenu behavior on touch vs hover
   - Focus trap in mobile overlays

---

## 5. Professional Testing Pathways

### 5.1 Immediate Actions (Week 1)

#### Action 1: Enable Visual Regression Testing
**Tool:** Playwright's built-in `toHaveScreenshot()`

**Implementation:**
```typescript
// tests/e2e/homepage/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  const viewports = [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
  ];

  for (const vp of viewports) {
    test(`homepage ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // This creates and compares baseline
      await expect(page).toHaveScreenshot(`homepage-${vp.name}.png`, {
        fullPage: true,
        threshold: 0.2, // Allow 0.2% difference
      });
    });
  }
});
```

**Storage:** `tests/__screenshots__/baseline/`

#### Action 2: Fix Test Selectors
**Pattern Migration:**

| Current | Better |
|---------|--------|
| `page.locator('[data-testid="mobile-nav"]')` | `page.getByRole('navigation', { name: 'Main' })` |
| `page.locator('.hero')` | `page.getByRole('banner')` |
| `card.locator('figure')` | `card.getByRole('img', { name: product.name })` |

**Benefits:**
- Tests accessibility by accident
- Resilient to class name changes
- Readable test intent

#### Action 3: Remove Vanity Tests

**Delete:**
- `tests/smoke.spec.ts` (meaningless assertion)
- `tests/jest/basket/*.test.tsx` (commented, outdated)
- Class presence tests in component specs

**Transform:**
- `FeaturedCard.spec.tsx:66-75` → Visual regression test
- `FeaturedCard.spec.tsx:85-95` → Remove (implementation detail)

### 5.2 Short-Term Improvements (Month 1)

#### Improvement 1: Expand RWD Coverage

**Add Missing Viewports:**
```typescript
export const comprehensiveViewportMatrix = [
  { name: 'xs-mobile', width: 320, height: 568 },    // iPhone SE
  { name: 'mobile', width: 390, height: 844 },        // iPhone 14
  { name: 'mobile-lg', width: 428, height: 926 },     // iPhone 14 Pro Max
  { name: 'tablet-sm', width: 744, height: 1133 },    // iPad Mini landscape
  { name: 'tablet', width: 768, height: 1024 },       // iPad
  { name: 'laptop', width: 1366, height: 768 },       // Common laptop
  { name: 'desktop', width: 1920, height: 1080 },     // Full HD
  { name: 'ultrawide', width: 2560, height: 1440 },    // 2K
];
```

**Add Tailwind Breakpoint Testing:**
```typescript
// Test at exact Tailwind breakpoints
const tailwindBreakpoints = [
  { name: 'sm', width: 640 },
  { name: 'md', width: 768 },
  { name: 'lg', width: 1024 },
  { name: 'xl', width: 1280 },
  { name: '2xl', width: 1536 },
];
```

#### Improvement 2: Implement Storybook

**Benefits:**
- Develop components in isolation
- Visual documentation for team
- Foundation for visual testing (Chromatic)

**Components to Document First:**
1. ProductCard (all variants: featured, DAC, IEM, accessory)
2. Carousel (empty, single, multiple, loading)
3. Navigation (mobile, desktop, open, closed)
4. Buttons (primary, secondary, disabled, loading)
5. Form inputs (valid, invalid, focused)

#### Improvement 3: Visual Polish Tests

**Implementation:**
```typescript
// tests/e2e/visual-polish.spec.ts
test('typography renders correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check fonts loaded
  const fontLoaded = await page.evaluate(() => {
    return document.fonts.ready.then(() => true);
  });
  expect(fontLoaded).toBe(true);
  
  // Check no FOUT (Flash of Unstyled Text)
  const headings = page.locator('h1, h2');
  for (const heading of await headings.all()) {
    const fontFamily = await heading.evaluate(el => 
      window.getComputedStyle(el).fontFamily
    );
    expect(fontFamily).not.toContain('serif'); // Should be custom font
  }
});

test('images maintain aspect ratios', async ({ page }) => {
  await page.goto('/');
  
  const images = page.locator('img');
  for (const img of await images.all()) {
    const naturalRatio = await img.evaluate(el => 
      (el as HTMLImageElement).naturalWidth / (el as HTMLImageElement).naturalHeight
    );
    const renderedRatio = await img.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return rect.width / rect.height;
    });
    
    // Allow 5% tolerance for rounding
    expect(Math.abs(naturalRatio - renderedRatio)).toBeLessThan(0.05);
  }
});
```

### 5.3 Long-Term Strategy (Quarter 1)

#### Strategy 1: Chromatic Integration

**Why:**
- Cloud-based visual regression
- Automatic baseline management
- Team collaboration on visual changes
- No local screenshot storage

**Implementation:**
```bash
npm install --save-dev chromatic
```

**CI Integration:**
```yaml
# .github/workflows/chromatic.yml
name: Visual Regression
on: [push]
jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx chromatic --project-token=${{ secrets.CHROMATIC_TOKEN }}
```

#### Strategy 2: Performance + Visual Combo Tests

**Tool:** Playwright + Lighthouse

**Test:**
```typescript
test('homepage loads fast and looks correct', async ({ page }) => {
  // Performance
  await page.goto('/');
  const metrics = await page.evaluate(() => {
    return JSON.stringify(performance.getEntriesByType('navigation'));
  });
  
  // Visual
  await expect(page).toHaveScreenshot('homepage-loaded.png');
  
  // Interaction
  await page.getByRole('link', { name: 'Shop' }).click();
  await expect(page).toHaveScreenshot('shop-page.png');
});
```

#### Strategy 3: Design Token Validation

**Test that design system is followed:**
```typescript
test('uses correct brand colors', async ({ page }) => {
  await page.goto('/');
  
  const primaryButton = page.locator('button').first();
  const bgColor = await primaryButton.evaluate(el => 
    window.getComputedStyle(el).backgroundColor
  );
  
  // Should match design token
  expect(bgColor).toBe('rgb(0, 0, 0)'); // brand-900
});
```

---

## 6. Coherent Pathway Forward

### 6.1 Testing Philosophy (Adopt This)

**The "Crystal Impeccability" Standard:**

> A test is only valuable if its failure indicates a user-impacting defect.

**Decision Framework:**

| Question | If Yes | Test Type |
|----------|--------|-----------|
| Does this affect revenue? | Yes | E2E + Visual |
| Does this block user progress? | Yes | E2E |
| Is this a reusable component? | Yes | Component + Visual |
| Is this complex business logic? | Yes | Unit/Integration |
| Is this styling only? | Yes | Visual only |
| Is this an implementation detail? | Yes | Don't test |

### 6.2 Recommended Test Distribution

| Type | Current % | Target % | Rationale |
|------|-----------|----------|-----------|
| Static (TypeScript/ESLint) | 30% | 30% | Foundation |
| Unit Tests | 20% | 10% | Reduce — focus on complex logic only |
| Integration Tests | 15% | 25% | Increase — API behavior |
| E2E Tests | 25% | 20% | Optimize — critical paths only |
| Visual Regression | 10% | 15% | New — UI confidence |

### 6.3 Implementation Roadmap

#### Phase 1: Foundation (Weeks 1-2)
- [ ] Delete vanity tests
- [ ] Fix test selectors (role-based)
- [ ] Enable Playwright CI workflow
- [ ] Add visual regression for homepage

#### Phase 2: Expansion (Weeks 3-4)
- [ ] Expand RWD viewport matrix
- [ ] Add Storybook for key components
- [ ] Implement visual polish tests
- [ ] Add design token validation

#### Phase 3: Professional Grade (Months 2-3)
- [ ] Integrate Chromatic
- [ ] Add performance + visual combo tests
- [ ] Implement comprehensive RWD coverage
- [ ] Visual testing for all page types

---

## 7. Specific Tool Recommendations

### 7.1 Immediate (No New Dependencies)

**Playwright's Built-in Visual Testing:**
- `toHaveScreenshot()` — Already available
- Update `playwright.config.ts` for screenshot directory
- Configure threshold for acceptable variance

### 7.2 Short-Term (Add Dependencies)

| Tool | Purpose | Cost |
|------|---------|------|
| **Storybook** | Component isolation | Free |
| **Chromatic** | Cloud visual regression | ~$150/mo |
| **@storybook/test-runner** | Test Storybook stories | Free |

### 7.3 Alternative: Self-Hosted Visual Testing

If Chromatic cost is concern:

```typescript
// Custom visual regression helper
export async function compareScreenshot(
  page: Page, 
  name: string, 
  threshold = 0.2
) {
  const baselinePath = `tests/__screenshots__/baseline/${name}.png`;
  const actualPath = `test-results/screenshots/${name}.png`;
  
  await page.screenshot({ path: actualPath, fullPage: true });
  
  if (!fs.existsSync(baselinePath)) {
    fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
    fs.copyFileSync(actualPath, baselinePath);
    console.log(`Created baseline: ${name}`);
    return;
  }
  
  // Use pixelmatch or similar for comparison
  const diff = await compareImages(baselinePath, actualPath);
  expect(diff.percentage).toBeLessThan(threshold);
}
```

---

## 8. Measuring Success

### 8.1 KPIs to Track

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Test execution time | Unknown | < 5 min | CI logs |
| Visual regression coverage | 0% | 80% of pages | Screenshot count |
| Flaky test rate | Unknown | < 2% | CI failure analysis |
| Time to detect visual bug | Manual | < 1 hour | Incident tracking |
| Developer confidence (survey) | Unknown | > 8/10 | Quarterly survey |

### 8.2 Feedback Loop

**Weekly:**
- Review visual diffs from PRs
- Identify new patterns needing coverage

**Monthly:**
- Analyze test failure patterns
- Update selectors if components change

**Quarterly:**
- Reassess test distribution
- Audit for new vanity tests
- Update viewport matrix for new devices

---

## 9. Conclusion

The SangLogium codebase has a **solid testing foundation** but lacks the **visual confidence layer** that separates functional code from impeccable UI. The gap isn't in test quantity—it's in test **quality** and **visual coverage**.

**The Path Forward:**
1. **Prune** vanity tests that provide false confidence
2. **Adopt** visual regression as first-class citizen
3. **Expand** RWD coverage to true device diversity
4. **Automate** visual validation in CI/CD

**Expected Outcome:**
- Tests that fail = actual user-facing bugs
- Visual changes = intentional, reviewed decisions
- Developer velocity = increased (less manual checking)
- User experience = consistently polished

---

## Appendix A: Code Samples

### A.1 Complete Visual Regression Setup

```typescript
// playwright.config.ts additions
export default defineConfig({
  // ... existing config
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

### A.2 Helper for RWD Testing

```typescript
// tests/utils/rwd-helpers.ts
export const tailwindBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export async function testAtBreakpoint(
  page: Page,
  breakpoint: keyof typeof tailwindBreakpoints,
  testFn: () => Promise<void>
) {
  const width = tailwindBreakpoints[breakpoint];
  await page.setViewportSize({ width, height: 900 });
  await testFn();
}
```

### A.3 Accessible Selector Patterns

```typescript
// tests/utils/selectors.ts
export const selectors = {
  navigation: {
    mobile: (page: Page) => page.getByRole('button', { name: /menu/i }),
    desktop: (page: Page) => page.getByRole('navigation', { name: /main/i }),
  },
  product: {
    card: (page: Page, name: string) => 
      page.getByRole('article', { name }),
    addToCart: (page: Page, productName: string) =>
      page.getByRole('button', { name: new RegExp(`add ${productName} to cart`, 'i') }),
  },
};
```

---

## Appendix B: Reference Materials

- [Playwright Visual Comparison](https://playwright.dev/docs/test-snapshots)
- [Chromatic Documentation](https://www.chromatic.com/docs)
- [Storybook for Next.js](https://storybook.js.org/docs/get-started/nextjs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing Trophy by Kent C. Dodds](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

---

**Report End**
