# Research: Standalone Portfolio Architecture
## Diamond Portfolio — Separate Project Analysis

**Research Date:** April 2, 2026  
**Topic:** Complete architecture for standalone portfolio (not within Sang-Logium)  
**Scope:** Framer Motion vs alternatives, design system coherence, test strategy, build progression  
**Output:** Grounded technical decisions with verified data

---

## Research Scope Contract

- **Topic:** Technical architecture for standalone developer portfolio in separate project folder
- **First Principles:**
  1. Portfolio is a marketing site, not an application — optimize for first impression
  2. Animation must not block main thread (smooth 60fps+ required)
  3. Design system must be coherent and maintainable (like Sang-Logium's system)
  4. Recovery from failures must be fast (build gates, clear checkpoints)
- **Fundamentals:** Next.js 15 static export, CSS-first animation where possible, robust Tailwind system
- **Scope Boundary:** Not covering deployment infrastructure (Netlify/Vercel docs sufficient)
- **Target Audience:** Developer building job-search portfolio
- **Decay Risk:** Medium (Tailwind 4.0 migration in progress, but 3.x stable)

---

## Section 1: Animation Strategy — Framer Motion vs Native CSS

### First Principles Analysis

**Core Problem:** Need smooth animations (hover states, entrance effects, code typing) without jank or accessibility violations.

**Constraint:** Animation must run at 60fps+ even during main thread work.

**Tradeoff:** CSS animations = zero JS overhead but limited control. JS animations = full control but bundle/CPU cost.

### Framer Motion (Motion) Analysis

**Bundle Size Reality:**
| Import | Size | Use Case |
|--------|------|----------|
| `useAnimate` mini | 2.3kb | Simple hardware-accelerated animations |
| `useAnimate` hybrid | 17kb | Complex sequences, motion values |
| `motion` + `m` + `LazyMotion` | 4.6kb initial | Declarative component animations |
| Full `motion` | 34kb | Everything (not tree-shakeable due to props API) |
| GSAP | 23kb | Alternative (closed source, Webflow-owned) |

**Source:** Motion.dev official docs, 2026

**Performance Characteristics:**
- ✅ Uses WAAPI (Web Animations API) for hardware acceleration
- ✅ Animations run on GPU, separate from JavaScript main thread
- ✅ Deferred keyframe resolution (2.5x faster than GSAP for unknown values)
- ✅ Scroll animations are hardware-accelerated (better sync than GSAP)

**Verdict for Small Portfolio:**
| Factor | Assessment |
|--------|------------|
| Bundle | ✅ 4.6kb with LazyMotion is acceptable for portfolio |
| Performance | ✅ WAAPI-based, smooth 60fps+ |
| React Integration | ✅ First-class hooks and components |
| Reduced Motion | ✅ Native `useReducedMotion()` hook |
| Accessibility | ⚠️ Must combine with CSS for screen-reader-safe typing |

### Recommendation: Hybrid CSS + Motion Approach

**For Code Typing Animation:**
- CSS `steps()` for the visual typing effect (zero JS overhead)
- `aria-hidden` on animated element (prevents screen reader chaos)
- `sr-only` parallel element with complete code (accessible version)
- This pattern = accessible + performant

**For Hover/Entrance Animations:**
- Motion `useAnimate` (2.3kb mini) for simple hover states
- Or CSS transitions for simple cases (no JS needed)
- Motion only where complex orchestration required

---

## Section 2: Design System — Coherence Requirements

### Sang-Logium Reference System (for comparison)

**Color Architecture:**
```typescript
// tailwind.config.ts
brand: { 50-900 }      // Warm e-commerce palette
secondary: { 50-900 }  // Grays
accent: { 100-800 }    // Gold/yellow
surface: { page, card, elevated, subtle }  // Semantic surfaces
text: { primary, secondary, caption, heroHeadline, ... }  // Semantic text
```

**Typography Architecture:**
```typescript
fontFamily: { sans: ["var(--font-montserrat)"] }
fontSize: {
  "display-1": ["clamp(3rem, 4vw + 2rem, 5.625rem)", ...],
  h1, h2, h3, h4, body, action, small, // Semantic scale
}
fontWeight: { light, regular, medium, semibold, bold }
letterSpacing: { editorial, signature }
```

**Component Architecture:**
- Custom plugins define `.btn-primary`, `.card-base`, `.input-base`
- All styling via Tailwind utilities + custom components
- No arbitrary values — everything tokenized

### Portfolio Design System Requirements

**Must Have (Coherence Criteria):**
1. **Semantic color tokens** — not raw hex values in components
2. **Typography scale** — clamp-based fluid typography
3. **Component primitives** — reusable button/card/input patterns
4. **Single source of truth** — one config file drives all styling

**Proposed Portfolio System:**
```typescript
// tailwind.config.ts
const darkLuxury = {
  background: {
    base: "#121212",      // Main background
    surface: "#1A1A1A",   // Card backgrounds
    elevated: "#242424",  // Hover states
  },
  gold: {
    400: "#D4AF37",  // Primary accent
    500: "#C9A962",  // Hover accent
    glow: "rgba(201, 169, 98, 0.3)",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#E0E0E0",
    muted: "#9E9E9E",
  }
};

// Typography
fontSize: {
  hero: ["clamp(2.5rem, 5vw + 1rem, 4rem)", { lineHeight: "1.1" }],
  h1: ["clamp(2rem, 4vw + 0.5rem, 3rem)", { lineHeight: "1.2" }],
  body: ["1rem", { lineHeight: "1.6" }],
  code: ["0.875rem", { lineHeight: "1.5", fontFamily: "JetBrains Mono" }],
}
```

### Design System Checklist for Sprint

- [ ] CSS variables for all colors (no hardcoded hex in components)
- [ ] Fluid typography with `clamp()`
- [ ] Semantic text tokens (primary, secondary, muted)
- [ ] Semantic surface tokens (base, surface, elevated)
- [ ] Single accent color (gold) with hover states
- [ ] Custom component classes in Tailwind plugin

---

## Section 3: Test Strategy — Minimal High-Impact Suite

### Test Philosophy for Portfolio

**Core Principle:** E2E tests provide maximum coverage with minimum files. Unit tests for pure functions only.

**Portfolio-Specific Risks:**
1. **Responsive layout breaks** — diamond shape at different breakpoints
2. **Accessibility failures** — screen reader can't access code
3. **Animation jank** — frame drops during entrance animations
4. **Build failures** — static export issues

### Minimal Test Suite (3 Files)

**File 1: `tests/layout.spec.ts`**
```typescript
// Responsiveness coverage
[
