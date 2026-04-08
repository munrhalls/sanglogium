# AUDIT: Portfolio Diamond Sprint
## Critical Assumptions Check & Reality Validation

**Audit Date:** April 2, 2026  
**Auditor:** AI Assistant  
**Target:** `PORTFOLIO_DIAMOND_2026-04-02.todo` and `PORTFOLIO_DIAMOND_2026-04-02_REVISED.todo`  
**Status:** 🔴 CRITICAL FINDINGS — REQUIRES MAJOR REVISION

---

## EXECUTIVE SUMMARY

| Finding | Severity | Impact |
|---------|----------|--------|
| **CRITICAL ASSUMPTION WRONG** — Project location | 🔴 BLOCKING | Sprint assumes wrong project structure entirely |
| **Framer Motion bundle concerns** | 🟡 HIGH | 34kb full bundle, but 4.6kb achievable with lazy loading |
| **Missing design system coherence plan** | 🟡 HIGH | No clear token architecture like Sang-Logium's |
| **Test strategy underspecified** | 🟡 MEDIUM | No file names, no coverage requirements |
| **Build progression unclear** | 🟡 MEDIUM | No recovery patterns, no blast radius containment |

**Verdict:** Sprint plan is **NOT EXECUTABLE** in current form. Requires complete rewrite as standalone project.

---

## 1. CRITICAL FINDING: Project Location Assumption

### The Red Flag

**ORIGINAL SPRINT ASSUMPTION (Both versions):**
```
app/
├── (portfolio)/          # Route group in existing project
├── (admin)/              # Existing
├── (store)/              # Existing
└── (studio)/             # Existing
```

**REALITY:** This assumes portfolio is built **within** `C:/webdev/sang-logium/`

### Why This Is Wrong

| Problem | Impact |
|---------|--------|
| Portfolio pollutes e-commerce codebase | Future maintenance nightmares |
| Build pipeline conflicts | `prebuild` scripts run for portfolio unnecessarily |
| Hiring signal diluted | Employers see mixed-purpose codebase |
| Deployment complexity | Can't deploy portfolio independently |
| Test isolation broken | Portfolio tests mixed with store tests |

### The Correct Architecture

```
C:/webdev/
├── sang-logium/          # EXISTING — untouched e-commerce
└── portfolio/            # NEW — standalone project
    ├── app/
    ├── components/
    ├── lib/
    ├── tests/
    ├── tailwind.config.ts
    ├── next.config.ts
    └── package.json      # Fresh dependencies
```

### Required Changes

| Aspect | Wrong (Current Sprint) | Right (Reality) |
|--------|------------------------|-----------------|
| **Location** | `sang-logium/app/(portfolio)/` | `C:/webdev/portfolio/` |
| **Dependencies** | Shared with e-commerce | Fresh `package.json` |
| **Tailwind config** | Extends existing | Clean, purpose-built |
| **Build** | `npm run prebuild` + existing | `npm run build` only |
| **Tests** | Mixed with store tests | Isolated test suite |

---

## 2. Assumption: Framer Motion Performance

### The Claim

Original sprint: "Use Motion for animations" (implied throughout)

### Reality Check

| Import | Bundle Size | Performance Tier |
|--------|-------------|------------------|
| Full `motion` component | 34kb | S-Tier (WAAPI) |
| `m` + `LazyMotion` | 4.6kb | S-Tier |
| `useAnimate` mini | 2.3kb | S-Tier |
| `useAnimate` hybrid | 17kb | S-Tier + features |
| CSS `steps()` typing | 0kb | S-Tier |
| CSS `transform` hover | 0kb | S-Tier |

**Source:** Motion.dev 2026

### The Problem

- **34kb** for full Motion is **not acceptable** for a simple portfolio
- Sprint doesn't specify **which** Motion import to use
- No justification for JS animation over CSS where CSS suffices

### The Fix

**CSS-First Strategy:**
```css
/* Code typing — CSS only, zero JS */
.typing-animation {
  animation: typing 3s steps(40) forwards;
}

/* Hover states — CSS only, zero JS */
.quadrant:hover {
  transform: scale(1.02);
  transition: transform 0.3s ease;
}
```

**Motion Where Needed:**
```typescript
// Entrance animations only
import { useAnimate } from "framer-motion/dom/mini" // 2.3kb

// Or lazy-loaded
import { m, LazyMotion } from "framer-motion" // 4.6kb initial
```

---

## 3. Assumption: Design System Coherence

### The Claim

Original sprint: "Design system with CSS variables" (brief mention)

### Reality Check

**Sang-Logium's Design System (Reference):**
```typescript
// tailwind.config.ts — 526 lines, comprehensive
colors: {
  brand: { 50-900 },
  secondary: { 50-900 },
  accent: { 100-800 },
  surface: { page, card, elevated, subtle },
  text: { primary, secondary, caption, heroHeadline, ... }
}
fontSize: {
  "display-1": ["clamp(...)", { lineHeight, letterSpacing }],
  h1, h2, h3, h4, body, action, small
}
plugins: [
  typographyDefaultsPlugin,
  uiComponentsPlugin // .btn-primary, .card-base, etc.
]
```

### The Problem

Sprint has **no equivalent specification**:
- No color token architecture
- No typography scale with `clamp()`
- No semantic surface/text tokens
- No component primitive definitions
- No design token checklist

### The Fix

**Portfolio Design System Required:**
```typescript
// tailwind.config.ts
colors: {
  background: {
    base: "#121212",
    surface: "#1A1A1A",
    elevated: "#242424",
  },
  gold: {
    400: "#D4AF37",
    500: "#C9A962",
    glow: "rgba(201, 169, 98, 0.3)"
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#E0E0E0",
    muted: "#9E9E9E"
  }
}
fontSize: {
  hero: ["clamp(2.5rem, 5vw + 1rem, 4rem)", { lineHeight: "1.1" }],
  h1, h2, body, code
}
```

---

## 4. Assumption: Test Strategy

### The Claim

Original sprint mentions:
- `tests/e2e/diamond-layout.spec.ts`
- `tests/e2e/accessibility.spec.ts`
- `tests/e2e/performance.spec.ts`

### Reality Check

**What's Missing:**
- No test file structure defined
- No coverage requirements
- No test data strategy
- No CI integration
- No failure criteria

### The Fix

**Minimal 3-File Test Suite:**

**File 1: `tests/layout.spec.ts`**
```typescript
test.describe("Layout", () => {
  test("desktop shows diamond", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(page.locator("[data-testid='diamond']")).toBeVisible();
  });
  
  test("mobile stacks quadrants", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");
    await expect(page.locator("[data-testid='quadrant-grid']")).toBeVisible();
  });
});
```

**File 2: `tests/accessibility.spec.ts`**
```typescript
test.describe("Accessibility", () => {
  test("no axe violations", async ({ page }) => {
    await page.goto("/");
    const violations = await page.evaluate(async () => {
      const axe = await import("@axe-core/playwright");
      return await axe.default.run();
    });
    expect(violations.violations).toHaveLength(0);
  });
  
  test("screen reader can access code", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".sr-only code")).toHaveCount(1);
  });
});
```

**File 3: `tests/performance.spec.ts`**
```typescript
test.describe("Performance", () => {
  test("Lighthouse meets thresholds", async () => {
    // Lighthouse 85+ Performance, 95+ Accessibility
  });
});
```

---

## 5. Assumption: Build Progression & Recovery

### The Claim

Original sprint: "Pass 1 → Pass 2 → Pass 3" mentioned but not specified

### Reality Check

**What's Missing:**
- No clear checkpoint definitions
- No blast radius containment
- No rollback strategy
- No build gate criteria
- No recovery patterns

### The Fix

**Pass/Layer System (from Sang-Logium's proven pattern):**

**Pass 1: Skeleton**
- Semantic HTML only
- Debug borders (`border-2 border-red-500`)
- No styling, no logic
- Build must pass

**Pass 2: Data**
- Content integration
- No styling yet
- Build must pass

**Pass 3: Layers (per component)**
- Layer 1: Structure (verified)
- Layer 2: Layout (positioning)
- Layer 3: Surface (colors, typography)
- Layer 4: Interaction (animations, hover)
- Build must pass after each layer

**Recovery Patterns:**
```bash
# Build gate
npm run build
# If fails → stop, fix, rebuild

# Git checkpoints
git add .
git commit -m "PASS 1: Diamond skeleton complete"

# Recovery
git reset --hard HEAD~1  # Back to last known good
```

---

## 6. Additional Assumptions Audit

| Assumption | Status | Fix Required |
|------------|--------|--------------|
| Next.js 15 + Tailwind 3.4 | ✅ Valid | None |
| TypeScript strict | ⚠️ Unspecified | Add `tsconfig.json` requirement |
| Static export | ✅ Valid | Specify `output: 'export'` |
| Zod validation | ✅ Valid | Keep for runtime safety |
| Lucide icons | ✅ Valid | Specify installation |
| Dark mode | ⚠️ Unspecified | Add explicit requirement |
| Font loading | ⚠️ Unspecified | Specify Inter + JetBrains Mono |
| Reduced motion | ✅ Mentioned | Specify `useReducedMotion()` pattern |
| Lighthouse 90+ | ⚠️ Aggressive | Modify to 85+ Performance, 95+ A11y |
| 5-day timeline | ⚠️ Aggressive | Add Day 6 buffer |

---

## 7. Scope Contracts Audit

### SC1: Project Setup

| Aspect | Current | Required |
|--------|---------|----------|
| Command | `npm create next-app` | `npx create-next-app@latest portfolio ...` |
| Location | Implied sang-logium/ | Explicit `C:/webdev/portfolio/` |
| Dependencies | Listed but not installed | Explicit install commands |
| Verification | `npm run build` | Must pass with fresh deps |

### SC2: Static Data

| Aspect | Current | Required |
|--------|---------|----------|
| Location | `data/portfolio/` | `portfolio/data/` (correct in standalone) |
| Validation | Zod mentioned | Explicit schema definition |
| Types | "Exported" | `z.infer<typeof Schema>` pattern |

### SC3: Diamond Layout

| Aspect | Current | Required |
|--------|---------|----------|
| Clip-path | CSS mentioned | Explicit polygon values |
| Breakpoints | "Verified" | Desktop 1280px, tablet 768px, mobile 375px |
| Accessibility | "aria-hidden + sr-only" | Explicit implementation pattern |

### SC4: Code Typing

| Aspect | Current | Required |
|--------|---------|----------|
| Animation | "CSS steps()" | Explicit keyframes definition |
| Accessibility | "Screen-safe" | `aria-hidden` + `sr-only` code pattern |
| Reduced motion | Mentioned | Explicit `prefers-reduced-motion` media query |

### SC5: Quadrant System

| Aspect | Current | Required |
|--------|---------|----------|
| Hover | "Motion scale + glow" | CSS `transform: scale()` preferred |
| Tap targets | "≥44px" | Explicit `min-height: 44px` |
| Keyboard nav | Mentioned | Explicit `tabIndex` + focus states |

### SC6: Testing & Deploy

| Aspect | Current | Required |
|--------|---------|----------|
| Test files | Names listed | Full file content specification |
| Lighthouse | "90+ all" | "85+ Performance, 95+ Accessibility" |
| Deploy | "Netlify/Vercel" | Explicit `output: 'export'` config |

---

## 8. Revised Sprint Structure

### Pre-Execution (Mandatory)

```bash
# 1. Create standalone project
cd C:/webdev
npx create-next-app@latest portfolio \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

# 2. Navigate
cd portfolio

# 3. Install dependencies
npm install framer-motion lucide-react clsx tailwind-merge
npm install --save-dev @playwright/test @axe-core/playwright

# 4. Verify baseline
npm run build
```

### Execution Order

| Day | Scope Contracts | Build Gates |
|-----|-----------------|-------------|
| 1 | SC1: Project setup, design system | After Tailwind config, after fonts |
| 2 | SC2: Data layer | After Zod schemas, after types |
| 3 | SC3: Diamond layout (Pass 1-3) | After skeleton, after clip-path, after RWD |
| 4 | SC4: Typing animation + SC5: Quadrants | After CSS anim, after accessibility test |
| 5 | SC6: Testing, flagship, deploy | After all 3 test files, after Lighthouse |
| 6 | Buffer: Polish, unknown unknowns | — |

---

## 9. VERDICT & ACTION ITEMS

### Critical (Must Fix Before Execution)

- [ ] **Rewrite sprint as standalone project** in `C:/webdev/portfolio/`
- [ ] **Remove all references to `(portfolio)` route group**
- [ ] **Specify CSS-first animation** (not Motion-first)
- [ ] **Define complete design system** (colors, typography, tokens)
- [ ] **Write 3 test files** with actual content

### High Priority (Should Fix)

- [ ] **Specify Motion 4.6kb lazy loading** (not 34kb full)
- [ ] **Adjust Lighthouse targets** (85+ Performance realistic)
- [ ] **Add Day 6 buffer** for unknown unknowns
- [ ] **Specify font loading** (Inter + JetBrains Mono)

### Medium Priority (Nice to Have)

- [ ] **Add dark mode toggle** specification
- [ ] **Add SEO meta tags** specification
- [ ] **Add sitemap generation** specification

---

## 10. CONCLUSION

**The sprint plan is fundamentally flawed** in its most basic assumption: project location. This invalidates all downstream planning.

**Recommendation:** 
1. Discard current sprint documents
2. Create new standalone project sprint
3. Apply all fixes from this audit
4. Re-verify with user before execution

**The good news:** Once fixed, the portfolio is a straightforward project. The diamond layout, code typing, and quadrant system are all achievable with CSS-first + minimal Motion approach.

---

**END OF AUDIT**

*This audit applied rigorous reality checking to all assumptions in the sprint plan. All findings grounded in actual technical constraints and user requirements.*
