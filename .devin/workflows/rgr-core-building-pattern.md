

Goal: implement tests using red-green-refactor cycle for specific slice
Criteria: 0 unnecessary verbiage, 0 unnecessary characters

location: /tests<feature name>/<appropriate unit/integration/e2e folder>

Before writing execution spects, write entries in RGR-core-building-pattern.todo in the /docs/<feature name>/implementation/RGR-core-building-pattern.todo; file should already exist - if not, make it.

# Critical SEQUENCE: 
1. Unit tests - data layer. 
2. Integration tests - view layer.
3. e2e tests - across all layers.

# Red-Green-Refactor: [Slice Name]

## For each test in this slice:
1. Pick first failing test. 
2. Gather relevant intelligence in professional manner to know what professional, robust, well-checked solution should look like. Know that your code build sequence must apply /core-building-pattern, outlined at the end of this file in order to be systematic.
3. Plan writing code. Make simplest possible, professional, robust plan.
4. Scan the plan for gaps, red flags, omissions, false assumptions, false positives, end to end. 
Keep scanning, finding, and fixing  gaps, red flags, omissions, false assumptions, false positives, end to end, until the solution is professionally robust, simplest possible, reliable.   
5. Execute to plan to write minimal, simple, robust, professional code to pass it (if UI component: apply relevant segments from the Core Building Pattern /core-building-pattern) 
6. Verify test passes in professional manner.
7. Scan for gaps, red flags, omissions, false assumptions, false positives, end to end. Keep scanning, finding, and fixing  gaps, red flags, omissions, false assumptions, false positives, end to end, until the solution is professionally robust, simplest possible, reliable.
8. Evaluate: does code need refactor?
9. If yes: refactor, verify tests still pass
10. If no: move to next test

## Repeat Until All Tests in This Slice Pass
Continue until all tests for this slice pass.
This slice is complete.

## ...



/core-building-pattern

# Core building pattern 

Adhere with strict discipline: keep everything robust, coherent, simplest possible, professional. If anything complicates or is vague, please stop immediately and ask for clarification.

# Core Building Pattern: Three Passes & Four Layers

## ⚠️ IMPORTANT: All Component Names Are Examples

**All component names used in this document (Hero, ProductGrid, Footer, ProductCard, etc.) are ILLUSTRATIVE EXAMPLES ONLY.**

- These are NOT required components
- These do NOT need to exist in your project
- These are NOT mandatory naming conventions
- Replace all example names with your actual component names when applying this pattern

This pattern applies to ANY component in ANY project. The specific names used are for demonstration purposes only.

---

## Purpose

This document is the single source of truth for component build sequencing in sang-logium. Any agent building UI components must follow this pattern to maintain global coherence and prevent local-optimization/global-destruction.

**When to reference this document:**
- Writing sprint scope contracts
- Prompting AI for component builds
- Reviewing component completeness
- Debugging sequencing violations

---

## The Three Passes (Page-Level)

A multi-component page is built in exactly three passes, in order, across all components simultaneously.

### Pass 1 — Skeleton Pass
**What:** Every component renders its name as text with debug borders. No styling. No data.
**Time:** Under 30 minutes for 9 components.
**Purpose:** Confirm page composition is correct before any investment in styling.
**Rule:** No component goes deeper than text + debug border.

**EXAMPLE output:**
```tsx
// [ComponentA].tsx
export function [ComponentA]() {
  return <div className="border-2 border-red-500">[ComponentA]</div>
}

// [ComponentB].tsx
export function [ComponentB]() {
  return <div className="border-2 border-blue-500">[ComponentB]</div>
}
```

**Lock condition:** Page scrolls top-to-bottom, all components present, borders visible.

---

### Pass 2 — Data Pass
**What:** Each component receives real Sanity data. Content renders. No styling beyond structural layout.
**Time:** 30-60 minutes for 9 components (if schemas exist).
**Purpose:** Confirm data flows correctly before visual work. Catch data-layer bugs in cheapest state.
**Rule:** No colors, no typography, no borders, no polish.

**EXAMPLE output:**
```tsx
// [YourComponent].tsx — Pass 2
export function [YourComponent]({ [data] }: { [data]: [DataType] }) {
  return (
    <div>
      <div>{[data].field1}</div>
      <div>{[data].field2}</div>
      <div>{[data].field3}</div>
    </div>
  )
}
```

**Lock condition:** All components display real data, no lorem ipsum remains.

---

### Pass 3 — Build Pass
**What:** One component at a time, build to full DoD (desktop + mobile, styled, interactive).
**Time:** Per component, based on scope complexity.
**Purpose:** Full visual build with full page context.
**Rule:** Build desktop (1280px) → lock → build mobile (375px) → lock → next component.

**RWD sequencing within Pass 3:**
1. Component desktop DoD (1280px)
2. Component mobile DoD (375px)
3. Commit
4. Next component

**Never:** Build all 9 desktop, then circle back for mobile. This doubles regressions.

---

## The Four Layers (Component-Level)

Within Pass 3 (Build Pass), each component is built in exactly four layers, in order.

```
Layer 1 — Structure:    Semantic HTML/JSX skeleton. No classes. No logic.
Layer 2 — Layout:       Tailwind flex/grid/spacing/sizing only.
                        No colors. No typography. No borders.
Layer 3 — Surface:      Colors, typography, brand tokens, imagery.
Layer 4 — Interaction:  Hover states, transitions, animations.
```

Each layer must render correctly before the next layer begins. This aligns with browser rendering sequence: DOM → Layout → Paint → Composite.

---

### Layer 1 — Structure
**What:** Semantic HTML/JSX skeleton. Tags, nesting, component boundaries.
**Produces:** The DOM. Boxes. Labels. Nothing visual.
**Does NOT include:** Any Tailwind class. Any TypeScript. Any state. Any data.

**EXAMPLE prompt:**
```
CONTEXT: Empty [YourComponent].tsx in Next.js 15 project.
TARGET: Generate JSX skeleton for [component description].
LAYER: Layer 1 (Structure only).
CONSTRAINTS:
- No Tailwind classes of any kind
- No TypeScript interfaces or types
- No useState, useEffect, or React hooks
- No props — component takes no arguments yet
- Placeholder text content only
```

**Lock condition:** Semantic tags correct, nesting logical, structure renders as boxes.

---

### Layer 2 — Layout
**What:** Tailwind classes for positioning, sizing, spacing, flex, grid, overflow.
**Produces:** Components in correct spatial relationships.
**Does NOT include:** Colors, typography weights, border-radius, shadows.

**Allowed classes:**
- `flex`, `grid`, `block`, `inline`, `hidden`
- `gap-*`, `p-*`, `m-*`, `px-*`, `py-*`
- `w-*`, `h-*`, `min-w-*`, `max-w-*`, `min-h-*`, `max-h-*`
- `flex-*`, `grid-cols-*`, `grid-rows-*`, `col-span-*`, `row-span-*`
- `justify-*`, `items-*`, `content-*`
- `overflow-*`, `position`, `inset-*`, `top-*`, `left-*`, etc.

**Forbidden classes:**
- `bg-*`, `text-*` (color), `border-*` (color), `fill-*`, `stroke-*`
- `font-*`, `text-*` (size), `tracking-*`, `leading-*`
- `rounded-*`, `shadow-*`, `ring-*`, `outline-*`
- `transition-*`, `duration-*`, `ease-*`, `animate-*`, `hover:*`, `focus:*`

**EXAMPLE prompt:**
```
CONTEXT: [YourComponent].tsx has this structure: [paste JSX].
TARGET: Add Tailwind layout classes for responsive [layout type].
LAYER: Layer 2 (Layout only).
CONSTRAINTS:
- No colors (no bg-, text-color, border-color classes)
- No typography (no font-, text-size, font-weight)
- No border-radius, shadows, or decorative properties
- No animations or transitions
- Only: flex, grid, gap, padding, margin, width, height, overflow classes
- Preserve all existing JSX structure
```

**Lock condition:** Component positioned correctly at both 1280px and 375px.

---

### Layer 3 — Surface
**What:** Colors, typography, brand tokens, imagery, borders, shadows.
**Produces:** The visual appearance.
**Does NOT include:** Transitions, hover states, animations.

**Allowed:**
- All `bg-*`, `text-*`, `border-*` color classes
- All typography: `font-sans`, `text-xl`, `font-bold`, `tracking-tight`
- All decorative: `rounded-*`, `shadow-*`
- Sanity image URLs via `urlFor()`

**Forbidden:**
- `transition-*`, `duration-*`, `ease-*`, `animate-*`
- `hover:*`, `focus:*`, `active:*`, `group-hover:*`
- Any transform or animation classes

**Lock condition:** Visual design matches spec at both breakpoints, colors/tokens correct.

---

### Layer 4 — Interaction
**What:** Hover states, focus states, transitions, animations, touch handling.
**Produces:** Dynamic behavior on user input.
**Comes last:** Always. Animations applied to wrong surface need revision.

**Allowed:**
- `transition-*`, `duration-*`, `ease-*`
- `hover:*`, `focus:*`, `active:*`, `group-hover:*`
- `translate-*`, `scale-*`, `rotate-*`, `transform`
- `animate-*`, `motion-*`

**Lock condition:** All interactive states work, animations smooth, no jank.

---

## The Complete Build Sequence

For a page with 3 components (EXAMPLE — [ComponentA], [ComponentB], [ComponentC]):

**Pass 1 — Skeleton (all components):**
- [ComponentA]: Text only + border
- [ComponentB]: Text only + border
- [ComponentC]: Text only + border
- Lock: Page scrolls, all present

**Pass 2 — Data (all components):**
- [ComponentA]: Real data, no styling
- [ComponentB]: Real data, no styling
- [ComponentC]: Real data, no styling
- Lock: All real data visible

**Pass 3 — Build (one component at a time):**

*Component 1: [ComponentA]*
- Layer 1: Structure (already exists from Pass 1)
- Layer 2: Layout (1280px) → Lock
- Layer 2: Layout (375px) → Lock
- Layer 3: Surface (1280px) → Lock
- Layer 3: Surface (375px) → Lock
- Layer 4: Interaction (1280px) → Lock
- Layer 4: Interaction (375px) → Lock
- Commit

*Component 2: [ComponentB]*
- Layer 1: Structure (already exists)
- Layer 2: Layout (1280px) → Lock
- Layer 2: Layout (375px) → Lock
- Layer 3: Surface (1280px) → Lock
- Layer 3: Surface (375px) → Lock
- Layer 4: Interaction (1280px) → Lock
- Layer 4: Interaction (375px) → Lock
- Commit

*Component 3: [ComponentC]*
- Same pattern

**Final verification:** `npx tsc --noEmit` passing (lightweight typecheck). Run `npm run build` manually when no concurrent agents are active.

---

## Violation Consequences

**Mixing Passes:**
- Building [ComponentA] fully (Pass 3) while [ComponentB] has no data (Pass 2 not done)
- Result: Visual decisions in vacuum, rework when context exists

**Mixing Layers:**
- Adding colors (Layer 3) before layout (Layer 2) is correct
- Result: Beautifully colored component with wrong spacing = wasted work

**Skipping Desktop → Mobile sequencing:**
- Building all 9 components desktop, then all 9 mobile
- Result: Mobile bugs in half-built visual system, context-switching penalties

**Real example — sang-logium failure:**
The 17-day carousel failure was a sequencing violation. Pass 1 and 2 were not separated from Pass 3. Deep work on Featured and carousel happened while ProductSpotlights had no real data. Full page composition never established before deep visual work began.

---

## Prompt Engineering Integration

When prompting AI for component builds, always specify:

1. **Which Pass** (1, 2, or 3)
2. **Which Layer** (1, 2, 3, or 4) — if Pass 3
3. **Which breakpoint** (1280px or 375px) — if Pass 3
4. **Explicit constraints** — what NOT to include

**Template:**
```
CONTEXT: [file path, current state]
TARGET: [specific output, named layer]
PASS: [1, 2, or 3]
LAYER: [1, 2, 3, or 4 — if Pass 3]
BREAKPOINT: [1280px or 375px — if Pass 3]
CONSTRAINTS:
- [Explicit forbiddens]
- [Minimum 3 constraints]
```

---

## Quick Reference Tables

### Pass Summary
| Pass | Scope | Duration | Lock Condition |
|------|-------|----------|----------------|
| 1 — Skeleton | All components | <30 min | All present with borders |
| 2 — Data | All components | 30-60 min | All real data visible |
| 3 — Build | One component | Per component | Desktop + mobile complete |

### Layer Summary
| Layer | Focus | Forbidden |
|-------|-------|-----------|
| 1 — Structure | Semantic HTML | Classes, logic, types |
| 2 — Layout | Position, sizing | Colors, typography, decoration |
| 3 — Surface | Colors, imagery, typography | Transitions, animations |
| 4 — Interaction | Hover, animations | — |

### RWD Within Pass 3
| Step | Action | Lock |
|------|--------|------|
| 1 | Desktop (1280px) | Desktop DoD |
| 2 | Mobile (375px) | Mobile DoD |
| 3 | Commit | Component locked |

---
=