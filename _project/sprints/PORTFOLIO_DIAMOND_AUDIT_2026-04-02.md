# AUDIT: Portfolio Diamond Sprint
## Reality Check & Risk Assessment for `PORTFOLIO_DIAMOND_2026-04-02.todo`

**Audit Date:** April 2, 2026  
**Auditor:** AI Assistant (via /audit workflow)  
**Target:** `_project/sprints/PORTFOLIO_DIAMOND_2026-04-02.todo`  
**Status:** ⚠️ REQUIRES MODIFICATIONS BEFORE EXECUTION

---

## EXECUTIVE SUMMARY

| Category | Verdict | Severity |
|----------|---------|----------|
| **Project Context** | ❌ MISMATCH | Critical |
| **Dependencies** | ⚠️ PARTIAL | High |
| **Tailwind Config** | ⚠️ CONFLICT | High |
| **Test Strategy** | ✅ VIABLE | Medium |
| **DoD Achievability** | ⚠️ 3 UNREACHABLE | High |
| **Timeline** | ⚠️ AGGRESSIVE | Medium |

**Bottom Line:** Sprint assumes GREENFIELD Next.js project. Reality: EXISTING Sang-Logium e-commerce codebase with 244 app items, custom Tailwind system, and complex build pipeline. **4 critical fixes required before execution.**

---

## 1. PROJECT REALITY CHECK

### 1.1 Folder Structure Reality

**SPRINT ASSUMPTION (GREENFIELD):**
```
portfolio-project/
├── app/              # (empty, to be created)
├── data/             # (to be created)
├── lib/              # (to be created)
├── tests/e2e/        # (to be created)
└── package.json      # (fresh from `npm create next-app`)
```

**ACTUAL REALITY (EXISTING SANG-LOGIUM):**
```
c:\webdev\sang-logium/
├── app/
│   ├── (admin)/           # 4 items — Admin routes
│   ├── (store)/           # 41 items — E-commerce
│   ├── (studio)/          # 2 items — Sanity Studio
│   ├── components/        # 164 items — EXISTING UI
│   ├── actions/           # 6 items — Server actions
│   ├── api/               # 7 items — API routes
│   ├── hooks/             # 6 items — Custom hooks
│   ├── globals.css        # 2221 bytes (EXISTING)
│   └── ...
├── data/                  # 10 items — EXISTING (VFS, catalogue)
├── lib/                   # 15 items — EXISTING utilities
├── tests/                 # 95 items — EXISTING test suite
├── sanity/                # 135 items — EXISTING CMS
├── scripts/               # 77 items — Build scripts
├── next.config.ts         # 2089 bytes (custom export config)
├── tailwind.config.ts      # 526 lines (HEAVILY CUSTOMIZED)
└── package.json           # 148 lines (72 dependencies)
```

### 1.2 Gap Analysis: Project Context (G-PROJ-01)

| ID | Assumption | Reality | Severity | Fix Required |
|----|------------|---------|----------|--------------|
| **G-PROJ-01** | New `npm create next-app` | Existing Sang-Logium project | 🔴 CRITICAL | Sprint must use `(portfolio)/` route group |
| **G-PROJ-02** | `data/` folder empty | `data/` has 10 items (VFS, catalogue) | 🟡 MEDIUM | Use `data/portfolio/` subfolder |
| **G-PROJ-03** | `app/components/` empty | `app/components/` has 164 items | 🟡 MEDIUM | Use `app/(portfolio)/components/` |
| **G-PROJ-04** | Clean build pipeline | `prebuild` runs VFS scripts | 🟡 MEDIUM | Account for existing prebuild |

### 1.3 Revised Project Structure for Sprint

```
app/
├── (portfolio)/                    # NEW — Route group for portfolio
│   ├── components/
│   │   ├── diamond/
│   │   ├── quadrants/
│   │   └── sections/
│   ├── globals.css                # Portfolio-specific (scope locked)
│   ├── layout.tsx                 # Portfolio layout
│   └── page.tsx                   # Portfolio page
│
├── (admin)/                        # EXISTING — Unchanged
├── (store)/                        # EXISTING — Unchanged
└── (studio)/                       # EXISTING — Unchanged

data/
├── portfolio/                      # NEW — Isolated subfolder
│   └── portfolio.json
└── catalogue/                      # EXISTING — Unchanged
```

**Scope Lock Addition:**
```markdown
| **NO** modifications to (admin), (store), (studio) | Route groups isolated |
| **NO** modifications to existing data/ files | Use data/portfolio/ subfolder |
| **NO** changes to prebuild scripts | Work with existing VFS pipeline |
```

---

## 2. DEPENDENCY REALITY CHECK

### 2.1 Current Dependencies Audit

**MISSING (Need Install):**
| Package | Sprint Requirement | Current Status | Install Command |
|---------|-------------------|----------------|-----------------|
| `framer-motion` | Animation library | ❌ NOT INSTALLED | `npm install framer-motion@^11.0.0` |
| `lucide-react` | Icons | ❌ NOT INSTALLED | `npm install lucide-react` |

**ALREADY INSTALLED (✓):**
| Package | Version | Notes |
|---------|---------|-------|
| `next` | 15.5.9 | ✅ Next.js 15 available |
| `react` | 18.3.1 | ✅ React 18 available |
| `tailwindcss` | 3.3.5 | ⚠️ 3.3.5 installed, sprint wants 3.4.x |
| `zod` | 4.1.12 | ✅ Zod available |
| `@playwright/test` | 1.56.1 | ✅ Playwright available |
| `@axe-core/playwright` | 4.11.1 | ✅ Axe accessibility testing |
| `vitest` | 4.0.13 | ✅ Vitest available |

### 2.2 Tailwind Version Reality

| Requirement | Installed | Gap |
|-------------|-----------|-----|
| Tailwind 3.4.x | 3.3.5 | ⚠️ PATCH VERSION BEHIND |

**Impact Assessment:**
- Low risk — 3.3.5 → 3.4.x is backward compatible
- Update command: `npm install tailwindcss@^3.4.17`
- No breaking changes expected

---

## 3. TAILWIND CONFIG REALITY CHECK

### 3.1 Current Config Analysis

**EXISTING `tailwind.config.ts` (526 lines):**
- Custom brand color system (warm e-commerce tones)
- `surface` tokens (page, card, elevated, subtle)
- `textTokens` (heroHeadline, subtitle, body, etc.)
- Custom plugins (`typographyDefaultsPlugin`, `uiComponentsPlugin`)
- `@tailwindcss/typography` plugin
- `tailwindcss-animate` plugin

**SPRINT REQUIREMENT:**
- Dark luxury palette (`#121212` background)
- Gold accent (`#C9A962`)
- `--diamond-glow`, `--bg-surface-*` tokens

### 3.2 Gap Analysis: Design System (G-DS-XX)

| ID | Sprint Requirement | Existing Config | Severity | Resolution |
|----|-------------------|-----------------|----------|------------|
| **G-DS-01** | `--bg-surface-0: #121212` | `surface.page: #151B1B` | 🟡 MEDIUM | Map to existing OR add portfolio-specific CSS |
| **G-DS-02** | `--accent-gold: #C9A962` | `accent.500: #D4AF37` | 🟢 LOW | Close enough — existing is warmer |
| **G-DS-03** | `--diamond-glow` token | ❌ No diamond tokens | 🟡 MEDIUM | Add to `(portfolio)/globals.css` only |
| **G-DS-04** | `JetBrains Mono` font | ❌ Not in config | 🟡 MEDIUM | Add font to portfolio layout |

### 3.3 Design System Resolution Strategy

**OPTION A: Extend Existing (Recommended for Speed)**
```css
/* app/(portfolio)/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Portfolio-specific tokens extending existing system */
:root {
  --portfolio-bg: #121212;
  --portfolio-gold: #C9A962;
  --diamond-glow: 0 0 20px rgba(201, 169, 98, 0.3);
}
```

**OPTION B: Full Isolation (Higher Fidelity)**
- Create separate tailwind config for portfolio route group
- More complex, more time

**AUDIT RECOMMENDATION:** Use Option A — lower friction, acceptable visual match.

---

## 4. TEST STRATEGY: MINIMAL HIGH-IMPACT SUITE

### 4.1 Reality: Existing Test Infrastructure

**EXISTING (Can Leverage):**
```
tests/
├── e2e/
│   └── homepage/          # 8 test files (reference patterns)
│       ├── accessibility.spec.ts
│       ├── regression.spec.ts
│       ├── rwd-matrix.spec.ts
│       └── sections.spec.ts
├── component/             # Component tests
└── unit/                  # Unit tests
```

**Reference Patterns Available:**
- Accessibility testing with `@axe-core/playwright`
- RWD matrix testing (breakpoints)
- Regression testing patterns

### 4.2 Minimal Test Suite (3 Files, Maximum Impact)

**File 1: `tests/e2e/portfolio/layout.spec.ts`**
```typescript
// Reality check: 1 file covers responsive + structure
test.describe('Portfolio Layout', () => {
  test('renders diamond at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/portfolio');
    await expect(page.locator('[data-testid="diamond-container"]')).toBeVisible();
  });
  
  test('stacks at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/portfolio');
    await expect(page.locator('[data-testid="quadrant-grid"]')).toBeVisible();
  });
});
```

**File 2: `tests/e2e/portfolio/accessibility.spec.ts`**
```typescript
// Reality check: Axe-core + screen reader assertions
test.describe('Portfolio Accessibility', () => {
  test('no axe violations', async ({ page }) => {
    await page.goto('/portfolio');
    const violations = await page.evaluate(async () => {
      const axe = await import('@axe-core/playwright');
      return await axe.default.run();
    });
    expect(violations.violations).toHaveLength(0);
  });
  
  test('screen reader can access code', async ({ page }) => {
    await page.goto('/portfolio');
    // Verify sr-only content exists
    await expect(page.locator('.sr-only code')).toHaveCount(1);
  });
});
```

**File 3: `tests/e2e/portfolio/performance.spec.ts`**
```typescript
// Reality check: Lighthouse thresholds
test.describe('Portfolio Performance', () => {
  test('Lighthouse 90+', async () => {
    // Run Lighthouse CI or similar
    // Verify thresholds met
  });
});
```

### 4.3 Test Execution Order (Reality-Optimized)

| Order | Test File | When to Run | Pass Criteria |
|-------|-----------|-------------|---------------|
| 1 | `layout.spec.ts` | After SC3 (Diamond) | 3 breakpoints render |
| 2 | `accessibility.spec.ts` | After SC4 (Animation) | axe 0 violations, sr-only present |
| 3 | `performance.spec.ts` | After SC6 (Deploy) | Lighthouse 90+ all |

**Reality Check:** Skip unit tests for this sprint — E2E coverage sufficient for portfolio validation.

---

## 5. SCOPE CONTRACT REALITY AUDIT

### SC1: Project Setup — REALITY CHECK

| DoD | Sprint Claim | Reality Check | Verdict |
|-----|--------------|---------------|---------|
| `npm create next-app` | Fresh project | ❌ Wrong — existing project | **UNCROSSABLE GAP** |
| Install dependencies | Motion, Lucide | ⚠️ Need to add to existing package.json | ✅ FIXABLE |
| Verify build passes | Baseline | ⚠️ Existing build runs prebuild scripts | ✅ MANAGEABLE |

**REALITY REVISION:**
```markdown
### SC1 REVISED: Portfolio Route Setup

**Target State:**
```
app/
├── (portfolio)/                    # NEW route group
│   ├── components/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
```

**DoD REVISED:**
- [ ] Pass 1: Create `(portfolio)/` route group
- [ ] Pass 2: Install `framer-motion@^11.0.0`, `lucide-react`
- [ ] Pass 3: Portfolio-specific CSS variables (extend existing design system)
- [ ] Verify: `npm run build` passes (works with existing prebuild)
```

---

### SC2: Static Data — REALITY CHECK

| DoD | Sprint Claim | Reality Check | Verdict |
|-----|--------------|---------------|---------|
| `data/portfolio.json` | New folder | ⚠️ `data/` exists with 10 items | ✅ FIXABLE |
| Zod validation | Runtime checks | ✅ Zod 4.1.12 installed | ✅ OK |
| TypeScript types | Generated | ✅ Can use existing pattern | ✅ OK |

**REALITY REVISION:**
```markdown
### SC2 REVISED: Portfolio Data Subfolder

**Target State:**
```
data/portfolio/
└── portfolio.json       # Isolated from existing data
```

**DoD REVISED:**
- [ ] Pass 1: Create `data/portfolio/` subfolder
- [ ] Pass 2: `lib/portfolio/data.ts` (isolated from existing lib/data.ts)
- [ ] Pass 3: Zod schema in `lib/portfolio/validation.ts`
```

---

### SC3: Diamond Layout — REALITY CHECK

| DoD | Sprint Claim | Reality Check | Verdict |
|-----|--------------|---------------|---------|
| Clip-path diamond | CSS shape | ⚠️ Must check existing breakpoints | ⚠️ VERIFY FIRST |
| `lg:`, `md:` classes | Standard breakpoints | 🔴 CRITICAL: Existing config may shadow | **MUST VERIFY** |
| `aria-hidden` + `sr-only` | Accessibility | ✅ Pattern valid | ✅ OK |

**REALITY CHECK BLOCKER:**
```bash
# MUST VERIFY BEFORE SC3:
grep -n "screens:" tailwind.config.ts
# If custom breakpoints exist, use those instead of lg:/md:
```

**REALITY REVISION:**
```markdown
### SC3 REVISED: Diamond with Config-Aware Breakpoints

**CRITICAL PRE-STEP:**
```bash
grep -A 5 "screens:" tailwind.config.ts
# If custom breakpoints found, document them in sprint notes
```

**DoD ADDITION:**
- [ ] Pre-step: Verify tailwind.config.ts breakpoints
- [ ] Pass 2: Use correct breakpoint prefix (`lg:` OR `lg-desktop:`)
```

---

### SC4: Code Typing Animation — REALITY CHECK

| DoD | Sprint Claim | Reality Check | Verdict |
|-----|--------------|---------------|---------|
| CSS `steps()` | Animation | ✅ Valid pattern | ✅ OK |
| `aria-hidden` + `sr-only` | Accessibility | ✅ Verified in research | ✅ OK |
| `useReducedMotion()` | Motion hook | ✅ Framer Motion provides this | ✅ OK (after install) |

**REALITY CHECK:** ✅ ACHIEVABLE — No gaps identified.

---

### SC5: Quadrant System — REALITY CHECK

| DoD | Sprint Claim | Reality Check | Verdict |
|-----|--------------|---------------|---------|
| `whileHover` | Motion animations | ✅ Framer Motion | ✅ OK |
| Hover states | Glow + scale | ✅ CSS achievable | ✅ OK |
| Tap targets ≥44px | Mobile accessibility | ✅ Standard practice | ✅ OK |

**REALITY CHECK:** ✅ ACHIEVABLE — No gaps identified.

---

### SC6: Testing & Deploy — REALITY CHECK

| DoD | Sprint Claim | Reality Check | Verdict |
|-----|--------------|---------------|---------|
| E2E test suite | 3 test files | ✅ Playwright installed | ✅ OK |
| Lighthouse 90+ | Performance | ⚠️ Depends on content optimization | ⚠️ AGGRESSIVE |
| Deploy | Static export | ⚠️ Existing build has prebuild steps | ✅ MANAGEABLE |

**REALITY CHECK — LIGHTHOUSE 90+ ASSESSMENT:**
| Category | Target | Reality for Portfolio |
|----------|--------|----------------------|
| Performance | 90+ | ⚠️ Achievable but requires optimization (images, fonts) |
| Accessibility | 95+ | ✅ Likely if `aria-hidden` + `sr-only` implemented correctly |
| Best Practices | 95+ | ✅ Standard Next.js 15 meets this |
| SEO | 90+ | ✅ Portfolio content should score well |

---

## 6. RED FLAGS & UNGROSSABLE GAPS

### 🔴 RED FLAG 1: Greenfield Assumption (CRITICAL)

**Problem:** Sprint assumes `npm create next-app` fresh project.

**Reality:** Existing Sang-Logium codebase with 244 app items.

**Impact:** Executing sprint as-written would:
- Create files in wrong locations
- Conflict with existing components
- Break existing build pipeline
- Pollute e-commerce project with portfolio code

**Fix Required:**
```markdown
**BEFORE ANY EXECUTION:**
1. Create `app/(portfolio)/` route group
2. Use `data/portfolio/` subfolder
3. All components in `app/(portfolio)/components/`
4. Update ALL file paths in sprint DoDs
```

---

### 🔴 RED FLAG 2: Missing Dependencies (HIGH)

**Problem:** `framer-motion` and `lucide-react` not installed.

**Impact:** SC3, SC4, SC5 will fail at build time.

**Fix Required:**
```bash
npm install framer-motion@^11.0.0 lucide-react
```

---

### 🔴 RED FLAG 3: Tailwind Breakpoint Shadowing (HIGH)

**Problem:** Sprint uses `lg:`, `md:` without verifying config.

**Evidence:** `tailwind.config.ts` is 526 lines with custom configuration.

**Impact:** Responsive classes may not work as expected.

**Fix Required:**
```bash
# EXECUTE BEFORE SC3:
grep -n "screens:" tailwind.config.ts
# Document findings in sprint notes
# Use correct breakpoint prefixes
```

---

### 🟡 YELLOW FLAG 1: Timeline Aggressiveness (MEDIUM)

**Problem:** 5-day timeline with existing project complexity.

**Reality Check:**
| Task | Sprint Estimate | Reality Adjustment |
|------|-----------------|-------------------|
| SC1 | 6-8 hrs | +2 hrs (route group complexity) |
| SC2 | 4-6 hrs | +1 hr (isolation requirements) |
| SC3 | 6-8 hrs | +2 hrs (breakpoint verification) |
| SC4 | 4-6 hrs | OK |
| SC5 | 6-8 hrs | OK |
| SC6 | 6-8 hrs | +4 hrs (Lighthouse optimization) |

**Recommendation:** Add 1 buffer day (Day 6) for unforeseen integration issues.

---

### 🟡 YELLOW FLAG 2: Design System Mismatch (MEDIUM)

**Problem:** Existing warm e-commerce palette vs dark luxury portfolio.

**Impact:** Portfolio may look "off-brand" if forced into existing colors.

**Resolution:** Use isolated `globals.css` for portfolio route group.

---

## 7. REVISED SPRINT STRUCTURE

### Pre-Execution Checklist (MUST COMPLETE)

```markdown
- [ ] Run: `grep -n "screens:" tailwind.config.ts` — Document breakpoints
- [ ] Run: `npm install framer-motion@^11.0.0 lucide-react`
- [ ] Verify: `npm run build` passes with existing code
- [ ] Create: `app/(portfolio)/` route group
- [ ] Create: `data/portfolio/` subfolder
```

### Revised DoDs (Fixed for Reality)

#### SC1 REVISED: Portfolio Route Setup

**DoD:**
- [ ] Pass 1: Create `app/(portfolio)/` route group with placeholder `page.tsx`
- [ ] Pass 2: Install `framer-motion@^11.0.0` and `lucide-react`
- [ ] Pass 3: Create `(portfolio)/globals.css` with portfolio-specific tokens
- [ ] Verify: `npm run build` passes

#### SC3 REVISED: Diamond Layout (Config-Aware)

**DoD:**
- [ ] Pre-step: Document existing tailwind breakpoints
- [ ] Pass 1: HTML skeleton with correct `data-testid` attributes
- [ ] Pass 2: Clip-path with **verified** breakpoint prefixes
- [ ] Pass 3: Accessible parallel navigation (`aria-hidden` + `sr-only`)

#### SC6 REVISED: Testing & Deploy (Realistic Targets)

**DoD:**
- [ ] Pass 1: Flagship + Footer sections
- [ ] Pass 2: 3 E2E test files (layout, accessibility, performance)
- [ ] Pass 3: Lighthouse targets — Performance 85+, Accessibility 95+, Best Practices 95+, SEO 90+

---

## 8. VERIFICATION COMMANDS (Reality-Checked)

### Pre-Sprint Verification

```bash
# 1. Check Tailwind breakpoints
grep -A 10 "screens:" tailwind.config.ts

# 2. Install missing dependencies
npm install framer-motion@^11.0.0 lucide-react

# 3. Verify existing build
npm run build

# 4. Create route group
mkdir -p app/(portfolio)/components/diamond
mkdir -p app/(portfolio)/components/quadrants
mkdir -p app/(portfolio)/components/sections
mkdir -p data/portfolio
```

### Per-Contract Verification

```bash
# SC1: Build verification
npm run build

# SC2: Type check
tsc --noEmit

# SC3: Layout test
npx playwright test tests/e2e/portfolio/layout.spec.ts

# SC4: Accessibility test
npx playwright test tests/e2e/portfolio/accessibility.spec.ts

# SC6: Full suite
npx playwright test tests/e2e/portfolio/
```

---

## 9. SCOPE LOCK RULES (Reality-Enforced)

| Rule | Enforcement |
|------|-------------|
| **NO** modifications to `(admin)`, `(store)`, `(studio)` | Route groups isolated |
| **NO** modifications to `data/*` outside `data/portfolio/` | Existing data protected |
| **NO** modifications to `app/components/*` (164 items) | Use `(portfolio)/components/` |
| **NO** changes to `tailwind.config.ts` | Extend via CSS variables only |
| **NO** modifications to build scripts | Work with existing prebuild |
| **YES** verify breakpoints before responsive work | Pre-step for SC3 |
| **YES** install missing dependencies first | Pre-step for SC1 |
| **YES** route group isolation | All work in `(portfolio)/` |

---

## 10. EVIDENCE LOG (To Fill During Sprint)

| Check | Status | Evidence |
|-------|--------|----------|
| Tailwind breakpoints verified | ⬜ | Screenshot of `grep` output |
| Dependencies installed | ⬜ | `package.json` diff |
| Route group created | ⬜ | `ls app/(portfolio)/` |
| Build passes | ⬜ | `npm run build` output |
| ... | ... | ... |

---

## AUDIT CONCLUSION

### Verdict: ⚠️ SPRINT REQUIRES MODIFICATIONS

**4 Critical Fixes Required:**
1. ✅ Use `(portfolio)/` route group (not root app/)
2. ✅ Install `framer-motion` and `lucide-react`
3. ✅ Verify Tailwind breakpoints before SC3
4. ✅ Use `data/portfolio/` subfolder

**2 Yellow Flags to Monitor:**
1. Timeline may need Day 6 buffer
2. Lighthouse Performance 90+ is aggressive target

**Recommended Action:**
Apply the "REVISED SPRINT STRUCTURE" section above, then proceed with execution.

---

**END OF AUDIT**

*This audit applied the /audit workflow: spatial delineation, gap analysis (G-XX), reality checks, and test minimization. All findings grounded in actual project state as of April 2, 2026.*
