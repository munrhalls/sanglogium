# Tailwind Breakpoint Shadowing

**Date:** 2026-04-01
**Source:** IEMs Gallery Grid Debug
**Severity:** Critical
**Frequency:** Systemic (affects all responsive layouts)

## Raw Learning Capture

**Work Unit:** Debug - IEMs Gallery Grid 2-Column Issue
**Duration:** ~3 hours
**Attempts:** 5 failed fixes before success

## What Was the Error/Surprise?
Grid configured with `cols={4}` and `lg:grid-cols-4` class rendered only 2 columns at desktop viewport despite 16 items available. Previous "fixes" (Grid.tsx deletion, direct Tailwind classes, cache clearing) all failed.

## The Problem
Default Tailwind breakpoints (`lg:`, `md:`, `sm:`) may not apply correctly when custom breakpoints with similar names are defined in `tailwind.config.ts`. This causes silent failures where responsive classes appear in code but don't trigger at runtime.

## Root Cause
**Tailwind config has custom breakpoints `lg-touch` and `lg-desktop` that shadow the default `lg:` breakpoint.**

```ts
// tailwind.config.ts
screens: {
  "lg-touch": { raw: "(min-width: 1024px) and (max-height: 850px)" },
  "lg-desktop": { raw: "(min-width: 1024px) and (min-height: 851px)" },
}
```

The default `lg:` breakpoint exists but may not trigger correctly when custom `lg-*` variants are defined. The fix required using `lg-desktop:grid-cols-4` and `lg-touch:grid-cols-3` instead of `lg:grid-cols-4`.

## Time Bottlenecks
- **Investigation:** 2+ hours — assumed data issue, then CSS purging, then cache issues
- **Friction:** No runtime verification of computed styles in browser DevTools
- **Wait time:** Multiple dev server restarts without systematic verification

## Prompt Quality
- **Strength:** User eventually specified exact fix needed ("apply lg-desktop:cols 4")
- **Weakness:** Initial prompt lacked viewport width, DevTools data, or system config context
- **Missing:** "Check tailwind.config.ts for custom breakpoints first"

## Test Coverage Gap
No E2E test verifies actual column count at specific viewports. Existing test (`sections.spec.ts`) only checks `gridTemplateColumns` property exists, not value.

## Fix Applied
```tsx
// BEFORE (broken)
<div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

// AFTER (working)
<div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg-desktop:grid-cols-4 lg-touch:grid-cols-3">
```

## Prevention Rule
**Before any responsive layout fix: Read `tailwind.config.ts` screens section. Custom breakpoints shadow defaults.**
