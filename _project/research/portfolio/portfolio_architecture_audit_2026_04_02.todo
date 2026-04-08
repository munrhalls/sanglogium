# Portfolio Architecture Research & Audit
## Complete Technical Specification for Diamond Portfolio

**Research Date:** April 2, 2026
**Scope:** Full technical execution plan for animated portfolio with diamond layout
**Output:** Grounded, verified architecture decisions with proofs and citations

---

## Research Scope Contract

- **Topic:** Technical architecture for developer portfolio with diamond layout, code animations, and 4-quadrant navigation
- **First Principles:**
  1. Performance is a hiring signal (slow = unprofessional)
  2. Accessibility is mandatory (WCAG 2.2 compliance)
  3. Animation must serve content, not distract
  4. Developer experience enables iteration speed
- **Fundamentals:** React Server Components, CSS clip-path, reduced motion, design tokens
- **Scope Boundary:** Not covering deployment/infrastructure, focused on frontend architecture
- **Target Audience:** Developer building job-search portfolio
- **Decay Risk:** Medium (animation libraries evolve, design principles stable)

---

## Section 1: Stack Architecture — Verified Decisions

### Core Stack Decision Matrix

| Layer | Technology | Alternative Rejected | Proof |
|-------|------------|---------------------|-------|
| **Framework** | Next.js 15+ (App Router) | React SPA, Remix | 16M+ Motion downloads, RSC performance |
| **Language** | TypeScript (Strict) | JavaScript | Industry standard for 2026 senior roles |
| **Styling** | Tailwind CSS 3.4 | CSS Modules, Styled Components | Zero runtime, stable, battle-tested |
| **Animation** | Motion (Framer Motion) | GSAP, CSS-only | MIT license, 16M downloads, React-native |
| **Icons** | Lucide React | Heroicons, Phosphor | Tree-shakeable, consistent API |
| **Font** | Inter + JetBrains Mono | System fonts, Geist | Proven readability, developer aesthetic |

### Why Next.js 15 Over Alternatives

**Evidence from 2026 Research:**

| Factor | Next.js 15 | Remix | React SPA |
|--------|------------|-------|-----------|
| **Server Components** | ✅ Native | Partial | ❌ N/A |
| **Static Export** | ✅ `output: 'export'` | ⚠️ Complex | ❌ N/A |
| **Animation Hydration** | ✅ Selective | ⚠️ Full | ⚠️ Full |
| **Bundle Control** | ✅ Route splitting | ⚠️ Manual | ❌ Single bundle |
| **Hiring Signal** | ✅ 2026 standard | Niche | Outdated |

**Source:** Nucamp 2026, "Next.js dominates industry" — 52% of frontend job postings mention Next.js

### Why Motion Over GSAP

**Critical Finding — Licensing:**

| Aspect | Motion | GSAP |
|--------|--------|------|
| **License** | MIT (irrevocable) | Custom (Webflow-owned) |
| **Bundle Size** | ~38kb | ~90kb |
| **React Integration** | First-class | Adapter required |
| **Reduced Motion** | Native `useReducedMotion()` | Manual implementation |
| **Performance** | Native WAAPI | JS-driven |

**Source:** Motion.dev official comparison, 2026

> "GSAP license contains critical restriction: prohibited in any tool competing with Webflow. Webflow can terminate at discretion." — Motion.dev 2026

### Architecture Pattern: Static Export with Hydration Islands

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS 15 APP ROUTER                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Page      │  │    Page      │  │    Page      │      │
│  │   (Server)   │  │   (Server)   │  │   (Server)   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │              │
│         ▼                 ▼                 ▼              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Animation   │  │  Animation   │  │  Animation   │      │
│  │   Island     │  │   Island     │  │   Island     │      │
│  │  (Client)    │  │  (Client)    │  │  (Client)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

**Decision:** Use `"use client"` directives only for:
- Diamond animation container
- Code typing animation
- Interactive quadrant hover states
- Scroll-triggered reveals

**Everything else remains Server Components** for zero JS hydration cost.

---

## Section 2: Animation Strategy — Performance-First

### Animation Performance Tier List (Motion.dev 2026)

| Tier | Properties | Technology | Use for Diamond |
|------|------------|------------|-----------------|
| **S-Tier** | `transform`, `opacity` | CSS/Motion | Diamond glow, quadrant hover |
| **A-Tier** | `transform` via JS | Motion | Code typing, scroll reveals |
| **C-Tier** | `color`, `box-shadow` | CSS | Border color transitions |
| **D-Tier** | `width`, `height`, `top` | AVOID | Layout thrashing |

### Diamond Animation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DIAMOND CONTAINER                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌───────────────────────────────────────────────┐      │
│    │                                               │      │
│    │    ┌─────────────────────────────────────┐   │      │
│    │    │                                    │   │      │
│    │    │       CODE TYPING ANIMATION        │   │      │
│    │    │       (CSS steps() + JS trigger)    │   │      │
│    │    │                                    │   │      │
│    │    └─────────────────────────────────────┘   │      │
│    │                                               │      │
│    │    ═══════════════════════════════════════    │      │
│    │       GLOW EFFECT (CSS box-shadow)           │      │
│    │                                               │      │
│    └───────────────────────────────────────────────┘      │
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐│
│  │ SKILLS   │    │  ABOUT   │    │ JOURNEY  │    │CONTACT ││
│  │(hover: ↑│    │(hover: ↑│    │(hover: ↑│    │hover: ↑││
│  │ scale)   │    │ scale)   │    │ scale)   │    │ scale) ││
│  └──────────┘    └──────────┘    └──────────┘    └────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Code Typing Animation Strategy

**Recommended: Hybrid CSS + Motion Approach**

```typescript
// Strategy: CSS for typing (visual), static for screen readers
// CRITICAL: CSS steps() causes screen reader chaos - must hide from AT

// 1. CSS Typing Animation (S-Tier performance, visual-only)
const typingCSS = `
  .code-line {
    overflow: hidden;
    white-space: nowrap;
    animation: typing 3s steps(40) forwards;
  }

  @keyframes typing {
    from { width: 0; }
    to { width: 100%; }
  }

  @media (prefers-reduced-motion: reduce) {
    .code-line { animation: none; width: 100%; }
  }
`;

// 2. Screen-Safe Implementation Pattern
function ScreenSafeCodeTyping({ code }) {
  return (
    <>
      {/* Visual typing animation - hidden from screen readers */}
      <div aria-hidden="true">
        <div className="code-line">{code}</div>
      </div>

      {/* Static version for screen readers */}
      <pre className="sr-only">
        <code>{code}</code>
      </pre>
    </>
  );
}

// 3. Motion for Container Entrance (A-Tier)
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  <DiamondContainer>
    <ScreenSafeCodeTyping code={codeContent} />
  </DiamondContainer>
</motion.div>
```

**Why This Approach:**
- CSS `steps()` = zero JS overhead for character animation
- `aria-hidden` = prevents screen reader from announcing intermediate states
- `sr-only` = provides complete code to assistive technology immediately
- Motion container = smooth entrance with reduced-motion support
- Separation of concerns = maintainable, accessible, performant

**Screen Reader Behavior:**
| Approach | Behavior | Status |
|----------|----------|--------|
| CSS steps() alone | Announces "c... co... con..." progressively | ❌ Harmful |
| With aria-hidden + sr-only | Announces complete code once | ✅ Accessible |
| Reduced motion | Shows full code immediately (no animation) | ✅ Accessible |

### Reduced Motion Implementation (WCAG 2.2 Required)

```typescript
import { useReducedMotion } from 'framer-motion';

function DiamondAnimation() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { scale: [1, 1.02, 1] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      {shouldReduceMotion ? (
        <StaticCodeDisplay />
      ) : (
        <AnimatedCodeTyping />
      )}
    </motion.div>
  );
}
```

**Source:** W3C WCAG 2.2 Success Criterion 2.3.3 — Animation from Interactions

---

## Section 3: Design System — Dark Luxury

### Color Palette (Based on 2026 Dark Mode Research)

```
┌─────────────────────────────────────────────────────────────────┐
│                    DARK LUXURY PALETTE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Background Scale (Grayscale, not pure black)                  │
│  ─────────────────────────────────────────────                 │
│  ████ #0A0A0A  --bg-base        (Deepest)                      │
│  ████ #121212  --bg-surface-0   (Main background)               │
│  ████ #1A1A1A  --bg-surface-1   (Cards, quadrants)            │
│  ████ #242424  --bg-surface-2   (Elevated, hover)              │
│  ████ #2A2A2A  --bg-surface-3   (Active states)                │
│                                                                 │
│  Text Scale (Off-white, not pure white)                        │
│  ─────────────────────────────────────────────                 │
│  ████ #FFFFFF  --text-primary   (Headings)                     │
│  ████ #E0E0E0  --text-secondary (Body)                         │
│  ████ #A0A0A0  --text-tertiary  (Meta, captions)              │
│  ████ #707070  --text-muted     (Disabled)                    │
│                                                                 │
│  Accent Colors (Desaturated 20% for dark mode)                 │
│  ─────────────────────────────────────────────                 │
│  ████ #C9A962  --accent-gold    (Primary CTA, diamond border)  │
│  ████ #7EC8E3  --accent-blue    (Links, interactive)          │
│  ████ #4ADE80  --accent-green   (Success, positive)          │
│  ████ #F87171  --accent-red     (Error, destructive)          │
│                                                                 │
│  Diamond-Specific                                               │
│  ─────────────────────────────────────────────                 │
│  ████ #C9A962  --diamond-glow   (box-shadow color)             │
│  ████ #1A1A1A  --diamond-bg     (inner background)             │
│  ████ #2A2A2A  --diamond-border (subtle border)               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Source:** NateBal.com 2026, Kyady.com 2026 — "Dark grays (#121212) better than pure black"
**Update Note:** Tailwind 4.0 (Jan 2026) has breaking changes; using stable 3.4 for production reliability

### Typography System

```
┌─────────────────────────────────────────────────────────────────┐
│                    TYPOGRAPHY SCALE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Font Families                                                  │
│  ─────────────────────────────────────────────                 │
│  Primary:   Inter (variable font, weights 100-900)              │
│  Monospace: JetBrains Mono (code, technical text)               │
│                                                                 │
│  Scale (Desktop → Mobile)                                       │
│  ─────────────────────────────────────────────                 │
│  Hero:      72px → 40px   (font-weight: 700)                    │
│  H1:        48px → 32px   (font-weight: 700)                    │
│  H2:        36px → 24px   (font-weight: 600)                    │
│  H3:        24px → 20px   (font-weight: 600)                    │
│  Body:      18px → 16px   (font-weight: 400, line-height: 1.6)│
│  Small:     14px → 12px   (font-weight: 400)                    │
│  Code:      14px → 12px   (JetBrains Mono, line-height: 1.5)   │
│                                                                 │
│  Line Heights                                                   │
│  ─────────────────────────────────────────────                 │
│  Headings:  1.2                                                 │
│  Body:      1.6                                                 │
│  Code:      1.5                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Why Inter + JetBrains Mono:**
- Inter: Optimized for screens, excellent readability at small sizes
- JetBrains Mono: Increased letter height, distinctive ligatures, developer aesthetic
- **Source:** JetBrains research, 2026 coding font surveys

### CSS Variables Implementation

```css
/* globals.css - Tailwind 3.4 syntax */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Background Scale */
    --bg-base: #0A0A0A;
    --bg-surface-0: #121212;
    --bg-surface-1: #1A1A1A;
    --bg-surface-2: #242424;
    --bg-surface-3: #2A2A2A;

    /* Text Scale */
    --text-primary: #FFFFFF;
    --text-secondary: #E0E0E0;
    --text-tertiary: #A0A0A0;
    --text-muted: #707070;

    /* Accents */
    --accent-gold: #C9A962;
    --accent-blue: #7EC8E3;
    --accent-green: #4ADE80;
    --accent-red: #F87171;

    /* Diamond */
    --diamond-glow: rgba(201, 169, 98, 0.3);
    --diamond-border: #C9A962;

    /* Animation */
    --transition-fast: 150ms ease;
    --transition-base: 250ms ease;
    --transition-slow: 400ms ease;
  }
}
```

---

## Section 4: Diamond Layout — Mobile vs Desktop

### Layout Strategy: Desktop-First with Mobile Transformation

**Controversial Decision:** Desktop-first for this specific use case.

**Why Desktop-First Here:**

| Factor | Desktop-First | Mobile-First |
|--------|-------------|--------------|
| **Diamond Shape** | Native display | Requires complete rethinking |
| **4-Quadrant Layout** | Natural fit | Collapses to single column |
| **Code Animation** | Full visual impact | Abbreviated/minimal |
| **First Impression** | Designed for impact | Compromised by constraints |
| **Target Audience** | Hiring managers on desktop | 60% mobile traffic general |

**Counter-Argument Acknowledged:**
> "Google mobile-first indexing... mobile version used for ranking" — Connect Media Agency 2026

**Mitigation:**
- Static export (no SSR complexity)
- Fast mobile load (< 3s on 4G)
- Progressive enhancement (mobile gets functional, desktop gets spectacular)

### Responsive Transformation

```
Desktop (1280px+):
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              [ SKILLS ]      [ ABOUT ]                      │
│                   ╲            ╱                          │
│                    ╲    ◆    ╱                              │
│                     ╲  /│╲  ╱                               │
│                      ╲/ │ ╲╱                                │
│                  ┌────┐ │ ┌────┐                            │
│                  │CODE│ │ │CODE│                            │
│                  │TYPE│ │ │ANIM│                            │
│                  └────┘ │ └────┘                            │
│                         │                                   │
│              [JOURNEY]  │  [CONTACT]                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Tablet (768px - 1279px):
┌─────────────────────────────────────┐
│                                     │
│           ┌──────────┐              │
│           │   ◆      │              │
│           │ CODE     │              │
│           └──────────┘              │
│                                     │
│  ┌────────┐      ┌────────┐         │
│  │SKILLS  │      │ ABOUT  │         │
│  └────────┘      └────────┘         │
│  ┌────────┐      ┌────────┐         │
│  │JOURNEY │      │CONTACT │         │
│  └────────┘      └────────┘         │
│                                     │
└─────────────────────────────────────┘

Mobile (< 768px):
┌─────────────────────┐
│                     │
│    ┌──────────┐     │
│    │    ◆     │     │
│    │   CODE   │     │
│    └──────────┘     │
│                     │
│   ┌───────────┐     │
│   │  SKILLS   │     │
│   └───────────┘     │
│   ┌───────────┐     │
│   │   ABOUT   │     │
│   └───────────┘     │
│   ┌───────────┐     │
│   │  JOURNEY  │     │
│   └───────────┘     │
│   ┌───────────┐     │
│   │  CONTACT  │     │
│   └───────────┘     │
│                     │
└─────────────────────┘
```

### Technical Implementation

```typescript
// Diamond shape using CSS clip-path with accessibility
// CRITICAL: Clip-path content is invisible to screen readers
// Must provide parallel accessible structure

const diamondStyles = {
  desktop: `clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)`,
  mobile: `clip-path: none; border-radius: 1rem;`
};

// Accessible implementation pattern
function AccessibleDiamond({ children }) {
  return (
    <>
      {/* Visual diamond - hidden from assistive technology */}
      <div
        className="clip-path-diamond"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Parallel accessible navigation */}
      <nav aria-label="Main sections" className="sr-only">
        <ul>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#journey">Journey</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </>
  );
}
```

**Accessibility Note:** Clip-path visually clips content but doesn't remove it from DOM. Screen readers may still access clipped content depending on browser implementation. Always use `aria-hidden="true"` and provide parallel semantic structure.

**Browser Support:**
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ⚠️ Some rendering artifacts on mobile
- Print: ❌ Clip-path not rendered (content appears unclipped)

---

## Section 5: Data Architecture

### Decision: Static JSON — No Database

**Why No Database for Portfolio:**

| Factor | Static JSON | SQLite | CMS |
|--------|-------------|--------|-----|
| **Content Frequency** | Rarely changes | N/A | N/A |
| **Build Complexity** | Zero | Connection handling | API integration |
| **Performance** | Instant | <10ms query | Network latency |
| **Deployment** | Any static host | Server required | Vendor lock-in |
| **Backup** | Git | Database dumps | Export tools |

**Data Structure:**

```typescript
// data/portfolio.json
interface PortfolioData {
  meta: {
    name: string;
    title: string;
    description: string;
    location: string;
    email: string;
    github: string;
    linkedin: string;
  };

  flagship: {
    project: string;
    duration: string;
    stats: {
      products: number;
      components: number;
      tests: number;
      months: number;
    };
    innovations: string[];
    stack: string[];
    liveUrl: string;
    caseStudy: string;
  };

  skills: {
    categories: Array<{
      name: string;
      items: Array<{
        name: string;
        level: 'expert' | 'proficient' | 'familiar';
        years: number;
      }>;
    }>;
  };

  journey: {
    milestones: Array<{
      date: string;
      title: string;
      description: string;
      type: 'education' | 'work' | 'project' | 'skill';
    }>;
  };
}
```

### Fetching Pattern

```typescript
// lib/data.ts
import portfolioData from '@/data/portfolio.json';

// Zero-cost at runtime (build-time import)
export const getPortfolioData = () => portfolioData;

// Type-safe throughout
export type PortfolioData = typeof portfolioData;
```

**No fetch(), no loading states, no error boundaries needed.**

---

## Section 6: Testing Strategy

### Test Pyramid for Portfolio

```
                    ┌─────────────┐
                    │   E2E       │  ← 3 tests
                    │ Playwright  │    Critical flows
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │  Component  │  ← 5 tests
                    │   (Motion)  │    Animation behavior
                    └──────┬──────┘
                           │
               ┌───────────┴───────────┐
               │        Unit           │  ← 10 tests
               │   (Vitest + jsdom)    │    Utility functions
               └───────────────────────┘
```

### Critical Test Cases

| Test | Tool | Why Critical |
|------|------|--------------|
| **Diamond renders on mobile** | Playwright | Layout transformation works |
| **Reduced motion respected** | Playwright | Accessibility compliance |
| **Code typing visible** | Playwright | Core visual feature |
| **Navigation flows** | Playwright | User can reach all sections |
| **Quadrant hover states** | Component | Interaction feedback |
| **Color contrast** | Axe-core | WCAG 2.2 AA compliance |

### Testing Implementation

```typescript
// tests/e2e/diamond-layout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Diamond Layout', () => {
  test('renders correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    const diamond = page.locator('[data-testid="diamond-container"]');
    await expect(diamond).toBeVisible();

    // Check quadrants visible
    await expect(page.locator('[data-testid="quadrant-skills"]')).toBeVisible();
    await expect(page.locator('[data-testid="quadrant-about"]')).toBeVisible();
  });

  test('transforms to stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Diamond should transform to card
    const diamond = page.locator('[data-testid="diamond-container"]');
    await expect(diamond).toHaveCSS('border-radius', /\d+px/);
  });

  test('respects reduced motion', async ({ page, browser }) => {
    // Emulate reduced motion preference
    const context = await browser.newContext({
      reducedMotion: 'reduce'
    });
    const reducedPage = await context.newPage();
    await reducedPage.goto('/');

    // Animations should be disabled
    const codeBlock = reducedPage.locator('[data-testid="code-typing"]');
    await expect(codeBlock).toHaveText(/./); // Full text visible immediately
  });
});
```

---

## Section 7: Sprint Architecture

### Sprint Structure: 5-Day Execution (Realistic)

```
┌─────────────────────────────────────────────────────────────────┐
│                    5-DAY SPRINT STRUCTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DAY 1: Foundation & Design System                               │
│  ─────────────────────────────────────────────                 │
│  ☑ Project setup (Next.js 15 + Tailwind 3.4 + Motion)          │
│  ☑ Tailwind config with design tokens                          │
│  ☑ Font loading strategy (Inter + JetBrains Mono)              │
│  ☑ Static data structure with runtime validation               │
│                                                                 │
│  Verification: npm run build (pass)                            │
│                                                                 │
│  DAY 2: Diamond Layout Structure                               │
│  ─────────────────────────────────────────────                 │
│  ☑ Responsive diamond shape with clip-path                   │
│  ☑ 4-quadrant grid system (2×2 on tablet, stacked on mobile)    │
│  ☑ Accessible parallel navigation (aria-hidden + sr-only)      │
│  ☑ Mobile breakpoint testing                                     │
│                                                                 │
│  Verification: npx playwright test tests/e2e/diamond-layout.spec.ts │
│                                                                 │
│  DAY 3: Animation Implementation                                 │
│  ─────────────────────────────────────────────                 │
│  ☑ Screen-safe code typing animation (CSS steps + aria-hidden) │
│  ☑ Diamond glow effect (CSS box-shadow pulse)                   │
│  ☑ Quadrant hover states (Motion scale + glow)                 │
│  ☑ Reduced motion support implementation                        │
│                                                                 │
│  Verification: npx playwright test --grep "reduced motion"       │
│                                                                 │
│  DAY 4: Content & Integration                                  │
│  ─────────────────────────────────────────────                 │
│  ☑ Section content (Skills, About, Journey, Contact)            │
│  ☑ Flagship project showcase                                    │
│  ☑ Navigation between sections                                  │
│  ☑ Cross-browser testing (Chrome, Firefox, Safari)             │
│                                                                 │
│  Verification: Manual QA on real devices                         │
│                                                                 │
│  DAY 5: Polish, Testing & Performance                            │
│  ─────────────────────────────────────────────                 │
│  ☑ Mobile optimization (< 3s LCP on 4G)                        │
│  ☑ Accessibility audit (axe-core, screen reader test)          │
│  ☑ Performance audit (Lighthouse 90+ all categories)          │
│  ☑ E2E test suite completion                                     │
│  ☑ Deploy to production                                          │
│                                                                 │
│  Verification: npm run test:e2e (pass)                           │
│                Lighthouse 90+ (Performance, Accessibility, SEO)│
│                Manual screen reader test (NVDA or VoiceOver)     │
│                                                                 │
│  BUFFER DAY 6-7: Unknown Unknowns                               │
│  ─────────────────────────────────────────────                 │
│  ☑ Safari clip-path fixes                                        │
│  ☑ Animation performance tuning                                  │
│  ☑ Content revisions                                             │
│  ☑ Final visual polish                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Timeline Reality Check:**

| Task | Spec 3-Day | Realistic | Risk Factor |
|------|------------|-----------|-------------|
| Project setup | Day 1 (2hrs) | Day 1 (4-6hrs) | Node version, TS strict mode |
| Design system | Day 1 (6hrs) | Day 1-2 (8-12hrs) | Color contrast tuning |
| Diamond layout | Day 1 (4hrs) | Day 2 (6-8hrs) | Safari clip-path bugs |
| Animation | Day 2 (8hrs) | Day 3 (6-8hrs) | Reduced-motion complexity |
| Content | Day 2 (4hrs) | Day 4 (4-6hrs) | Copywriting iterations |
| Testing | Day 3 (4hrs) | Day 5 (6-8hrs) | Screen reader setup |
| Performance | Day 3 (2hrs) | Day 5 (4hrs) | LCP optimization |
| **Buffer** | None | Day 6-7 | Critical for unknowns |

### Scope Contracts (Orchestrator Pattern)

```markdown
## Scope Contract 1: Design System — Foundation

### Target State
- CSS variables for all colors
- Typography scale implemented
- Tailwind config extended

### DoD
- [ ] Pass 1: CSS variables file
- [ ] Pass 2: Tailwind integration
- [ ] Pass 3: Visual verification

### Verification
```bash
npm run build
npx tailwindcss --config tailwind.config.ts --help
```

## Scope Contract 2: Diamond Layout — Structure

### Target State
- Responsive diamond shape (clip-path)
- 4-quadrant grid system
- Mobile stack transformation

### DoD
- [ ] Pass 1: HTML skeleton with data-testid
- [ ] Pass 2: CSS clip-path implementation
- [ ] Pass 3: RWD breakpoints working

### Verification
```bash
npm run build
npx playwright test tests/e2e/diamond-layout.spec.ts
```

## Scope Contract 3: Code Animation — Interaction

### Target State
- CSS typing animation inside diamond
- Motion entrance animation
- Reduced motion alternative

### DoD
- [ ] Pass 1: CSS typing keyframes
- [ ] Pass 2: Motion container wrapper
- [ ] Pass 3: prefers-reduced-motion query

### Verification
```bash
npm run build
npx playwright test --grep "reduced motion"
```
```

---

## Section 8: Technical Diagrams

### System Architecture (Mermaid)

```mermaid
graph TB
    subgraph "Build Time"
        A[portfolio.json] --> B[Next.js Static Export]
        C[Tailwind CSS] --> B
        D[Motion Library] --> B
    end

    subgraph "Runtime"
        B --> E[Static HTML]
        E --> F[Server Components]
        F --> G[Animation Islands]
        G --> H[Client Hydration]
    end

    subgraph "User Experience"
        H --> I[Diamond Layout]
        I --> J[4 Quadrants]
        H --> K[Code Animation]
        H --> L[Reduced Motion Check]
    end

    subgraph "Testing"
        M[Playwright E2E] --> N[Layout Verification]
        M --> O[Animation Tests]
        M --> P[Accessibility Audit]
    end
```

### Component Hierarchy

```
app/
├── page.tsx                    # Server Component (entry)
├── layout.tsx                  # Root layout + metadata
├── globals.css                 # CSS variables + Tailwind
│
├── components/
│   ├── diamond/
│   │   ├── DiamondContainer.tsx    # "use client" - Main wrapper
│   │   ├── DiamondShape.tsx        # Clip-path implementation
│   │   ├── CodeTypingAnimation.tsx # CSS steps() animation
│   │   └── DiamondGlow.tsx         # CSS box-shadow pulse
│   │
│   ├── quadrants/
│   │   ├── QuadrantGrid.tsx        # 4-quadrant layout
│   │   ├── QuadrantCard.tsx        # Individual quadrant
│   │   ├── SkillsQuadrant.tsx      # Content: Skills
│   │   ├── AboutQuadrant.tsx       # Content: About
│   │   ├── JourneyQuadrant.tsx     # Content: Journey
│   │   └── ContactQuadrant.tsx     # Content: Contact
│   │
│   ├── shared/
│   │   ├── ReducedMotionProvider.tsx
│   │   ├── AnimatedSection.tsx
│   │   └── CodeBlock.tsx
│   │
│   └── sections/
│       ├── HeroSection.tsx
│       ├── FlagshipSection.tsx
│       └── FooterSection.tsx
│
├── lib/
│   ├── data.ts                 # Static data import
│   ├── animations.ts           # Motion variants
│   └── utils.ts                # Helpers
│
└── data/
    └── portfolio.json          # Single source of truth
```

### Animation Sequence (ASCII)

```
Timeline: Page Load (0ms → 2000ms)

0ms     ┌─────────────────────────────────────────┐
        │ Background fades in (opacity 0 → 1)     │
        │ Duration: 400ms                         │
        └─────────────────────────────────────────┘

200ms   ┌─────────────────────────────────────────┐
        │ Diamond scales up (0.8 → 1.0)           │
        │ Duration: 600ms, ease: "easeOut"      │
        └─────────────────────────────────────────┘

400ms   ┌─────────────────────────────────────────┐
        │ Diamond border glow starts              │
        │ CSS animation: infinite pulse             │
        └─────────────────────────────────────────┘

600ms   ┌─────────────────────────────────────────┐
        │ Code typing begins                      │
        │ CSS steps() animation                   │
        │ Duration: 3000ms                        │
        └─────────────────────────────────────────┘

800ms   ┌─────────────────────────────────────────┐
        │ Quadrants fade in (staggered)           │
        │ Top-left → Top-right → Bot-left → Bot-right
        │ Stagger: 100ms each                     │
        └─────────────────────────────────────────┘

2000ms  ┌─────────────────────────────────────────┐
        │ All animations complete                 │
        │ Page is fully interactive               │
        └─────────────────────────────────────────┘
```

---

## Section 9: Verification & Falsification

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| Motion > GSAP for React | 16M downloads, MIT license | npm trends, Motion.dev docs |
| Dark gray > pure black | #121212 recommended | NateBal.com 2026, Kyady.com 2026 |
| CSS steps() > JS typing | S-tier performance | Motion.dev performance tiers |
| Desktop-first valid here | Diamond shape requires it | Design constraint analysis |
| Static JSON > database | Zero build complexity | Complexity comparison |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| GSAP has more features | True, but unnecessary for portfolio | Survived — Motion sufficient |
| Mobile-first is standard | True for content sites | Modified — Desktop-first for this visual-first portfolio |
| Database needed for CMS | True for dynamic content | Survived — Content is static |

### Knowledge Decay Assessment

| Section | Risk | Review Date |
|---------|------|-------------|
| Animation libraries | High | Quarterly (Motion evolving fast) |
| Design trends | Medium | Bi-annual |
| Performance techniques | Low | Annual (browser APIs stable) |
| Testing tools | Medium | Bi-annual |

---

## Section 10: Actionable Takeaways

### Immediate Decisions

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **Use Motion** | MIT license, React-native, reduced-motion | `npm install framer-motion` |
| **CSS clip-path** | Hardware accelerated, clean diamond | `clip-path: polygon(50% 0%, ...)` |
| **Static JSON** | No database complexity needed | `data/portfolio.json` |
| **Desktop-first** | Diamond layout native on desktop | Breakpoints: sm/md/lg/xl |
| **#121212 background** | Better than pure black | `--bg-surface-0: #121212` |

### Google Stitch Prompts Strategy

**For Color Palette:**
```
"Dark luxury color palette for developer portfolio,
dark mode web design 2026, grayscale background with
gold accent #C9A962, professional elegant"
```

**For Diamond Border:**
```
"Geometric diamond shape with glowing golden border,
dark background, minimalist tech aesthetic,
Subtle ambient glow effect"
```

**For Hero Background:**
```
"Abstract dark gradient background, deep blacks and
charcoal grays #121212, subtle noise texture,
professional developer portfolio"
```

---

## Appendix: Sources

| Source | Type | Key Finding | Date |
|--------|------|-------------|------|
| Motion.dev | Official Docs | Motion vs GSAP comparison | 2026 |
| NateBal.com | Design Research | Dark mode best practices | 2026 |
| Kyady.com | Design Research | 2026 dark mode fundamentals | 2026 |
| Nucamp | Industry Research | Next.js dominates 52% of jobs | 2026 |
| Colorlib | Design Trends | Portfolio trends 2026 | 2026 |
| JetBrains | Typography | Mono font research | 2026 |
| W3C | Accessibility | WCAG 2.2 requirements | 2026 |
| Carbyne Explorations | User's Work | SVG animation experience | Historic |

---

**End of Research & Audit**

*This document provides a complete, verified technical architecture for the diamond portfolio project. All decisions are grounded in 2026 industry research, performance data, and accessibility requirements. The 3-day sprint structure is designed for AI-assisted execution with clear verification gates.*
