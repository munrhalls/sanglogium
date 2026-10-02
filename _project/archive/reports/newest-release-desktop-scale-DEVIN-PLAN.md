# Newest Release — Desktop Scale-Down — Devin Execution Plan

> **Source:** `homepage-NewestRelease-desktop-oversized-handoff` (chat handoff, 2026-08-01).
> This document supersedes that handoff's "Proposed Plan" section — the decision points it
> left open have been resolved below by reading the actual source files. Follow **this**
> document task-by-task; do not re-derive the plan.

## Problem (confirmed at source)

`NewestRelease.tsx` (rendered inside `<Shelf fullBleed>` at `app/(store)/page.tsx:40-42`) is
oversized on desktop because of four independent, additive causes, all confirmed in source:

1. No width cap. `Shelf` with `fullBleed` renders `w-full` with **no** `max-w-content` (see
   `app/components/layout/general/Shelf.tsx:16`). Every other homepage section either isn't
   `fullBleed` or (like `ProductSpotlight1/2/3`) adds its own `max-w-content mx-auto` wrapper
   *inside* the component. `NewestRelease.tsx` is the only full-bleed section that never caps
   its own content — it scales without bound on wide monitors.
2. Hero-scale typography. `type-hero-headline` (`.h2` at `NewestRelease.tsx:87`) resolves to
   `clamp(3rem, 4vw + 2rem, 5.625rem)` — up to **90px** (`tailwind.config.ts:359-365,503-506`).
   It is used in exactly one other place in the whole app: `Hero.tsx`. Nothing else on the page
   is this large.
3. Oversized geometry. `min-h-[560px]` (row + image column) plus `py-24`/`px-16` text-column
   padding (`NewestRelease.tsx:27,30,75`) make the block taller than necessary for a
   "product feature," not a second hero.
4. Unbounded image request. `sizes="(max-width: 1024px) 100vw, 50vw"` with no `px` ceiling
   (`NewestRelease.tsx:50`) tells the browser to fetch/display up to 50% of the *viewport*,
   not 50% of a capped container.

## Objective

Make `NewestRelease` read as a product feature, not a second hero, on desktop — without
touching `Shelf.tsx`, `page.tsx`, or `tailwind.config.ts`, and without changing mobile/tablet
layout.

## Decisions (resolved — do not re-litigate these while executing)

| Open question from handoff | Decision | Why |
|---|---|---|
| Cap width by removing `fullBleed` from `page.tsx`, or add an inner cap? | **Inner cap inside `NewestRelease.tsx`.** Wrap the existing row in a new `max-w-content mx-auto` div. Leave `<Shelf fullBleed>` in `page.tsx` untouched. | Matches the exact pattern `ProductSpotlight1/2/3` already use (full-bleed background, capped inner content). Zero risk to `Featured`, `IemsGallery`, `Dacs`, `Accessories` — they share `Shelf`/`page.tsx`, which this plan never edits. |
| Which smaller type tokens? | `type-hero-headline` → `type-section-hed` (h1 scale, ≤51px). `type-hero-sub` → `type-section-sub` (h2 scale, same size `type-hero-sub` already used). | `type-section-hed`/`type-section-sub` are an existing paired design-system alias (see `tailwind.config.ts:380-393`), same pairing pattern as the hero tokens, no new classes needed. Color is unaffected either way — both elements already carry explicit `text-secondary-900`/`text-secondary-800` utility overrides that win over the token's own `color`. |
| How much to shrink height/padding? | `lg:min-h-[560px]` → `lg:min-h-[440px]` (both occurrences, row **and** image column, in the same task). `lg:py-24` → `lg:py-16`. `lg:px-16` → `lg:px-12`. | Brings it in line with `ProductSpotlight1`'s comparable `md:min-h-[500px]` / `p-8 lg:p-12` scale without a layout rewrite. |
| Image `sizes` fix — required or optional? | Include as its own tiny task. Not load-bearing for the visual bug (the width cap in Task 1 already bounds the rendered size), but cheap, explicitly requested, and isolating it into its own task means it can't blow up anything else if it looks wrong. | Matches "no expensive changes bundled together" per this repo's execution-plan conventions (see `homepage-DEVIN-EXECUTION-PLAN.md`). |
| Brand-name duplication (`"Weiss Weiss DAC204..."`) | **Out of scope for this plan.** Included as an optional, decision-gated Task 5 at the end. It's a content/data bug, not a sizing bug — the user's stated scope is "this section's UX" (sizing). | Keeps this plan minimal and focused; don't block the sizing fix on a content decision. |

## Architecture guardrails (do not break these)

- Touch **only** `app/components/features/homepage/newest-release/NewestRelease.tsx`. No task
  in this plan requires editing `Shelf.tsx`, `page.tsx`, or `tailwind.config.ts` — if you find
  yourself wanting to, stop and re-read the Decisions table above.
- Do not touch `IemsGallery`, `Dacs`, `Accessories`, or `Featured` — they are unaffected by
  construction (this plan never edits their shared wrapper), but don't "fix" them opportunistically
  either.
- Keep the Sanity image pattern as-is: `src={image?.asset?._id}` (raw asset ref, not `.url`) —
  this is intentional in this codebase (custom loader), not a bug.
- Mobile (`<lg`) classes (`flex-col-reverse`, `min-h-[400px]`, `min-h-[280px]`, `py-12`,
  `px-8`) are not touched by any task below. Only `lg:`-prefixed classes and the new wrapper
  change.

## Circuit Breaker

If any single verification step fails or hangs twice in a row, stop retrying it. Report exactly
what happened and wait for human input rather than trying a third variation.

## Per-Task Loop

1. Read the task fully before editing.
2. Make only the change described in that task — nothing else, even if you notice something
   else worth fixing (file a separate note instead).
3. Check editor/language-server diagnostics on `NewestRelease.tsx` after the edit (no fresh
   `tsc`/build per task — see `CLAUDE.md` hard limits on expensive commands; expensive whole-project
   commands are forbidden as a per-task check).
4. If the dev server is already running, confirm the homepage still renders (no crash, no
   blank section).
5. Mark the task done, move to the next one in order.

---

## Task 1 — Add the width cap

**File:** `app/components/features/homepage/newest-release/NewestRelease.tsx`

Find:
```tsx
    <article className="w-full overflow-hidden">
      <div className="flex flex-col-reverse lg:flex-row lg:items-stretch min-h-[400px] lg:min-h-[560px]">
```

Replace with:
```tsx
    <article className="w-full overflow-hidden">
      <div className="max-w-content mx-auto">
        <div className="flex flex-col-reverse lg:flex-row lg:items-stretch min-h-[400px] lg:min-h-[560px]">
```

(Leave `lg:min-h-[560px]` as-is for this task — that value changes in Task 3, not here. This
task only adds the new wrapper div.)

Then find the article's closing tags near the end of the file:
```tsx
        </div>

      </div>

    </article>
```

Replace with (one extra closing `</div>` for the new wrapper):
```tsx
        </div>

      </div>
      </div>

    </article>
```

**Verify:** at viewport widths ≥1280px, the two-tone background (image half + text half)
should now stop at a centered ~1280px band instead of spanning the full viewport edge-to-edge.
At 1024–1280px (most laptops), the change should be visually unnoticeable, since the cap only
engages above 1280px. Mobile/tablet (`<1024px`) must look identical to before — this task only
adds wrapper `div`s, it doesn't change any responsive class.

---

## Task 2 — Downgrade typography

**File:** same file.

Find:
```tsx
                  <h2 className="type-hero-headline text-secondary-900">
                    {promoTitle || product.name}
                  </h2>
                  <p className="type-hero-sub text-secondary-800">
                    {promoSubtitle || ""}
                  </p>
```

Replace with:
```tsx
                  <h2 className="type-section-hed text-secondary-900">
                    {promoTitle || product.name}
                  </h2>
                  <p className="type-section-sub text-secondary-800">
                    {promoSubtitle || ""}
                  </p>
```

**Verify:** the headline should visibly shrink (was up to ~90px, now up to ~51px). The
subheadline's size should look unchanged (it was already h2-scale and stays h2-scale — only
its token name changed). Text color must look unchanged (both elements keep their explicit
`text-secondary-900` / `text-secondary-800` classes).

---

## Task 3 — Reduce height and padding

**File:** same file.

Find (image column):
```tsx
        <div className="w-full lg:w-1/2 min-h-[280px] lg:min-h-[560px] bg-brand-700 relative overflow-hidden border border-border-secondary">
```
Replace with:
```tsx
        <div className="w-full lg:w-1/2 min-h-[280px] lg:min-h-[440px] bg-brand-700 relative overflow-hidden border border-border-secondary">
```

Find (the row div from Task 1 — same line, just the `lg:min-h` value changes now):
```tsx
        <div className="flex flex-col-reverse lg:flex-row lg:items-stretch min-h-[400px] lg:min-h-[560px]">
```
Replace with:
```tsx
        <div className="flex flex-col-reverse lg:flex-row lg:items-stretch min-h-[400px] lg:min-h-[440px]">
```

Find (text column padding):
```tsx
          <div className="w-full py-12 lg:py-24 px-8 lg:px-16">
```
Replace with:
```tsx
          <div className="w-full py-12 lg:py-16 px-8 lg:px-12">
```

**Do both `min-h-[560px]` → `min-h-[440px]` replacements in this one task** — the row and the
image column must move together or `items-stretch` will just be constrained by whichever one
you forgot to change.

**Verify:** section is visibly shorter on desktop (≥1024px). Image column and text column
still appear equal height (this is `items-stretch` doing its job — don't add any explicit
height class to fix it). Mobile (`min-h-[400px]`, `min-h-[280px]`, `py-12`, `px-8`) unchanged.

---

## Task 4 — Bound the image request size

**File:** same file.

Find:
```tsx
                    sizes="(max-width: 1024px) 100vw, 50vw"
```
Replace with:
```tsx
                    sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 640px"
```

**Verify:** no new console warnings from `next/image`. Visually the image should look
unchanged (Task 1's width cap already bounds its rendered size; this only changes which
source-image candidate the browser requests on very wide screens).

---

## Task 5 — Brand-name duplication — WAIT FOR HUMAN DECISION FIRST, out of scope by default

Do not start unless explicitly asked to. This is a content-correctness bug
(`"Weiss Weiss DAC204 Desktop DAC"`), not part of the sizing objective this plan covers.

**If asked to fix it in code:** find, at line ~81-83:
```tsx
                  <span className="type-metadata text-accent-600">
                    {product.brand.name} {product.name}
                  </span>
```
Replace with:
```tsx
                  <span className="type-metadata text-accent-600">
                    {product.name.toLowerCase().startsWith(product.brand.name.toLowerCase())
                      ? product.name
                      : `${product.brand.name} ${product.name}`}
                  </span>
```
**Verify:** "Weiss DAC204 Desktop DAC" renders once, not twice. Check one other product (if any
other has been used as `newestRelease` before) still shows `"<Brand> <Name>"` correctly when
the name doesn't already start with the brand.

**If asked to fix it in the CMS instead:** no code change — skip this task entirely and note
in your report that the fix should happen in the Sanity `newestRelease.promoTitle` /
product-name field instead.

---

## Final Gate — run once, after Task 4 (and Task 5 if done)

1. If a dev server isn't already running, start one non-blocking (background process).
2. Visually check the homepage at 375px, 768px, 1024px, 1280px, 1440px, 1920px. Confirm:
   - `NewestRelease` reads as a compact product feature, not a second hero, at 1280px+.
   - `Featured`, `IemsGallery`, `Dacs`, `Accessories` (the other `Shelf fullBleed` sections)
     look exactly as they did before this plan — spot check, since this plan never touches
     their shared code path.
   - Mobile/tablet `NewestRelease` layout (image-over-text, `flex-col-reverse`) is unchanged.
3. Run once, in the background, logging to a file (do not pipe through `head`/`grep` and wait
   on a blocking foreground call — see `CLAUDE.md` and
   `homepage-DEVIN-EXECUTION-PLAN.md` for why):
   ```bash
   npm run lint > newest-release-plan-lint.log 2>&1 &
   npx tsc --noEmit > newest-release-plan-tsc.log 2>&1 &
   ```
   Check both logs when done. Both should be clean (only this one file changed, and only
   Tailwind class strings + one conditional expression).
4. Report: which tasks completed, whether Task 5 was done or skipped, lint/tsc results, and
   screenshots or a description of the six breakpoints if a browser preview was available.
