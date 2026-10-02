# Hero Headline — Desktop Typography Scale-Down — Devin Execution Plan

> **Source:** Chat handoff, 2026-08-01 (screenshot of homepage hero at a wide desktop
> viewport — headline spans nearly the full viewport width). This document is the
> **only** one meant to be executed task-by-task. Do not re-derive the plan — follow it.

## Problem (confirmed at source)

`Hero.tsx` (`app/components/features/homepage/hero/Hero.tsx:100-105`) renders the headline
and subheadline with two design-system utility classes whose font sizes are pure CSS
`clamp()` curves that run continuously from mobile all the way through desktop, with no
breakpoint gate:

- `type-hero-headline` → the `display-1` token (`tailwind.config.ts:360,504`):
  `clamp(3rem, 4vw + 2rem, 5.625rem)` — 48px → **90px**.
- `type-hero-sub` → the `h2` token (`tailwind.config.ts:367,516`):
  `clamp(1.25rem, 1.69vw + 0.854rem, 2.375rem)` — 20px → 38px.

The headline's curve hits its 90px ceiling at ~1450px viewport width and stays flat there
for every wider screen — 1536px, 1920px, 2560px, ultra-wide, all render the identical 90px.
In practice this means the headline is at (or within a few px of) its maximum on **every
real desktop monitor**, which is why it reads as oversized/"billboard" rather than a
refined hero headline at typical desktop sizes. This is confirmed by direct calculation
from the token source, not guesswork.

## Objective

Bring the hero headline and subheadline down to a professional desktop size, fluidly
correct across the whole desktop range (1024px through ultra-wide) — with **zero** change
to how the hero renders below 1024px (mobile and tablet stay pixel-identical), and with
**zero** change to any other typographic property (weight, letter-spacing, line-height,
color) or any other component.

## Decisions (resolved — do not re-litigate these while executing)

| Open question | Decision | Why |
|---|---|---|
| Edit the shared `display-1`/`h2` tokens in `tailwind.config.ts`? | **No.** Leave `tailwind.config.ts` untouched. | `display-1` is effectively single-consumer (only `Hero.tsx` uses it in production), but `h2` is **shared** with `type-section-sub` (used elsewhere, e.g. `NewestRelease.tsx` per `newest-release-desktop-scale-DEVIN-PLAN.md`). Editing either shared token risks resizing text in places that were never part of this objective. Zero risk instead: override inside `Hero.tsx` only. |
| How to make it "desktop-only" if `clamp()` alone runs across all widths? | Add a **`lg:`-prefixed Tailwind arbitrary-value class** (`lg:text-[clamp(...)]`) directly on the `<h1>` and `<p>` in `Hero.tsx`, layered on top of the existing `type-hero-headline` / `type-hero-sub` classes. Below 1024px, nothing changes — the original class's own `clamp()` still applies untouched. | `Hero.tsx` already uses `lg:` (1024px) as its own desktop cutoff everywhere else in this exact file (`lg:h-[calc(...)]`, `lg:justify-start`, `lg:pt-[22vh]` — see lines 60-89). No new breakpoint concept introduced. `lg-touch:` / `lg-desktop:` also exist in this file, but they always carry the *same* value in both cases here (see lines 88, 96) — i.e. together they're equivalent to plain `lg:`, so there's no reason to duplicate the override across both. |
| Will a plain Tailwind utility class actually beat the `type-hero-headline` component class? | Yes, safely. | `type-hero-headline`/`type-hero-sub` are registered via `addComponents` (`tailwind.config.ts:99-369`), which places them in Tailwind's **components** layer. Ordinary utility classes (including arbitrary-value ones like `text-[...]`) are always injected in the **utilities** layer, which comes after components in the generated stylesheet. At equal selector specificity, later wins — so the new class reliably overrides just `font-size`, nothing else. |
| Does overriding `font-size` change weight/letter-spacing/line-height/color? | No. | Tailwind's `text-[value]` arbitrary class sets only the `font-size` property (no `/lineheight` shorthand is used here). `font-weight`, `letter-spacing`, `line-height`, and `color` keep coming from the original `.type-hero-headline` / `.type-hero-sub` component-class rules, untouched. This matches the stated scope exactly: size only. |
| What about the CTA button text (`text-cta-hero`, `Hero.tsx:112`)? | **Out of scope — do not touch.** | Its own dedicated clamp (`18px → 28px`, `tailwind.config.ts:532-535`) is already restrained and proportionate; it isn't part of the reported problem. Touching it adds risk for no requested benefit. |
| Exact clamp values to use? | Headline: `clamp(2.75rem,1.5vw_+_2rem,4.5rem)` (~44px floor, ~72px ceiling, ceiling reached ~2667px viewport). Subheadline: `clamp(1.125rem,0.4vw_+_1rem,1.5rem)` (~18px floor, ~24px ceiling). | Cuts the headline ceiling from 90px to 72px and keeps it fluidly scaling (not flat) across the entire practical desktop range instead of maxing out by 1450px. Subheadline shrinks proportionally so it stays a clearly secondary element next to the smaller headline. These are starting values — see Task 2/3 verification for the visual-adjustment tolerance. |
| Underscores inside `clamp(...)`? | Yes: `1.5vw_+_2rem`, not `1.5vw + 2rem`. | Tailwind arbitrary-value class names cannot contain literal whitespace; Tailwind converts `_` back to a space when it generates the CSS. Real CSS `clamp()`/`calc()` requires whitespace around a binary `+`/`-`, so the underscore is required here for the value to parse as valid CSS at all (not just a Tailwind naming nicety) — do not remove it to "clean up" the class. |

## Architecture guardrails (do not break these)

- Touch **only** `app/components/features/homepage/hero/Hero.tsx`. No task below requires
  editing `tailwind.config.ts`, `NewestRelease.tsx`, or any other file — if you find yourself
  wanting to, stop and re-read the Decisions table above.
- Do not touch the CTA `<Link>` or its `text-cta-hero` class.
- Do not touch anything below the `lg:` (1024px) breakpoint — no `max-lg:`, no bare/base
  classes, no mobile-specific logic.
- Do not remove or reorder the existing `type-hero-headline` / `type-hero-sub` classes —
  the new classes are additive, appended alongside them.

## Circuit Breaker

If any single verification step fails or hangs twice in a row, stop retrying it. Report
exactly what happened and wait for human input rather than trying a third variation.

## Per-Task Loop

1. Read the task fully before editing.
2. Make only the change described in that task.
3. Check editor/language-server diagnostics on `Hero.tsx` after the edit (no fresh
   `tsc`/build per task — see `CLAUDE.md` hard limits on expensive commands).
4. If a dev server is already running, confirm the homepage hero still renders (no crash,
   no blank section, text still visible/legible).
5. Mark the task done, move to the next one in order.

---

## Task 1 — Shrink the headline (desktop only)

**File:** `app/components/features/homepage/hero/Hero.tsx`

Find (around line 100):
```tsx
              <h1 className="type-hero-headline">
                {heroData.headline}
              </h1>
```

Replace with:
```tsx
              <h1 className="type-hero-headline lg:text-[clamp(2.75rem,1.5vw_+_2rem,4.5rem)]">
                {heroData.headline}
              </h1>
```

**Verify:** at viewport widths ≥1024px, the headline should visibly shrink (was flat 90px
above ~1450px, now fluidly ~46px–72px across the desktop range, capped at 72px). Below
1024px, resize the window through mobile/tablet widths and confirm the headline looks
exactly as it did before this change — it must still be governed entirely by the
untouched `type-hero-headline` base clamp there.

---

## Task 2 — Shrink the subheadline (desktop only)

**File:** same file.

Find (around line 103):
```tsx
              <p className="type-hero-sub m-0 p-0">
                {heroData.subheadline || "Hear the difference."}
              </p>
```

Replace with:
```tsx
              <p className="type-hero-sub m-0 p-0 lg:text-[clamp(1.125rem,0.4vw_+_1rem,1.5rem)]">
                {heroData.subheadline || "Hear the difference."}
              </p>
```

**Verify:** at ≥1024px, the subheadline should look modestly smaller and clearly secondary
to the (now smaller) headline — roughly a 2.3×–3× size ratio between them is the target;
it doesn't need to be exact. Below 1024px, unchanged, same as Task 1's check.

---

## Task 3 — Visual tuning pass (only if Tasks 1–2 look off)

This task is **conditional** — only do this if, after Tasks 1 and 2, a visual check at
1280px/1440px/1920px shows the headline still reads as clearly oversized, or now reads as
too small/timid for a hero. If Tasks 1–2 already look right, skip this task entirely and
say so in your report.

If adjustment is needed, only change the **middle number** (the `vw` coefficient and/or
rem offset) in the `clamp()` — never the min or max ends — and stay within these bounds:
- Headline max: do not exceed `4.5rem` (72px) and do not go below `3.5rem` (56px).
- Headline min: keep at or near `2.75rem` (44px) — this is what keeps the 1024px starting
  point from feeling like a sudden drop from what's just below the breakpoint.
- Subheadline: keep the ratio to the headline roughly in the 2.3×–3× range described in
  Task 2.

Do not touch anything below 1024px as part of this tuning task, regardless of what looks
better — mobile/tablet must remain byte-for-byte the same classes as before Task 1.

---

## Final Gate — run once, after Task 2 (and Task 3 if done)

1. If a dev server isn't already running, start one non-blocking (background process).
2. Visually check the homepage hero at these widths and confirm:
   - **Desktop (must have changed, smoothly, no flat-oversized plateau):** 1024px, 1280px,
     1440px, 1536px, 1920px, 2560px, 3440px. Headline reads as a confident but restrained
     hero headline at every one of these — never spanning almost the full viewport width,
     never so small it looks like a subhead.
   - **Mobile/tablet (must be pixel-identical to before this plan):** 375px, 428px, 768px,
     820px, 1023px (just under the `lg:` cutoff).
   - The CTA button ("DISCOVER"/"EXPLORE") and its size are unchanged.
   - Text color, weight, and letter-spacing on both headline and subheadline look
     unchanged from before this plan (only size moved).
3. Optional, background, non-blocking (skip if it would take more than a couple of
   minutes to start — this is a two-class-string change with no logic/type changes, so
   editor diagnostics from step 3's per-task loop are already sufficient signal):
   ```bash
   npm run lint > hero-typography-plan-lint.log 2>&1 &
   ```
4. Report: which tasks completed, whether Task 3 was needed, and a description (or
   screenshots, if a browser preview was available) of the hero at the desktop and
   mobile/tablet widths listed above.

---

## Order Summary

```
Task 1 (headline) → Task 2 (subheadline) → Task 3 (conditional tuning, only if needed) →
  Final Gate (visual check across all listed widths, optional lint)
```
