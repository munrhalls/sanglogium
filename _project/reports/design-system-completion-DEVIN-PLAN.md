# Design System Completion — Minimal-Change Execution Plan (Claude Design / Devin)

> **How to use this document (for John):** this whole file is the prompt. Open a new Claude Code
> (or Devin) session in this repo and paste this file's contents as the first message, or point
> the agent at it directly: *"Read and execute `_project/reports/design-system-completion-DEVIN-PLAN.md`
> in full, in order."* It requires `docs/design-system.md` to exist (it does) and assumes local
> repo access. Nothing in Tasks 1–3 requires network access beyond the repo itself.

> **Source:** design-system audit, 2026-08-06 (`docs/design-system.md`). That document is the
> reference; this document is the executable task list derived from it. Read `docs/design-system.md`
> in full before Task 1 — everything below assumes it.

---

## Prime directive — read this twice before touching any file

**This is a completion pass, not a redesign.** Every color, type size, spacing value, radius,
shadow, and component class this app should ever need already exists in `tailwind.config.ts`.
Use them. Do **not**:

- invent a new hex value, a new `clamp()` size, a new spacing number, a new border-radius, or a
  new shadow;
- hand-roll a new one-off `className` string for something a `.btn-*`/`.card-*`/`.type-*`/
  `.input-*` class already covers;
- change page composition, section order, or anything listed as "already professional" in
  `docs/design-system.md`;
- touch colors, type scale, spacing scale, radii, shadows, or breakpoints in `tailwind.config.ts`
  itself, except exactly where Task 2 explicitly allows adding one new button-class entry.

If a fix seems to genuinely require any of the above, **stop and write up a proposal instead of
implementing your own guess** — append it to the "Proposals — needs a human design decision"
section at the bottom of this file rather than shipping it.

Run the flaw-vs-taste test from `docs/design-system.md` before every change:

1. Dead/undefined token or class → bug, fix it.
2. Realistic data (long/short/missing) breaks proportion or leaves unbounded empty space →
   structural flaw, fix using patterns already present in the same file/codebase.
3. Duplicates an existing component class → consolidate to it.
4. Would need a genuinely new token to fix "properly" → stop, propose, don't implement.
5. Wouldn't look like it belongs next to the homepage hero or product grid → stop, propose.

---

## Architecture guardrails (do not break these)

- The app is a fixed-viewport shell (`html`/`body` `h-dvh overflow-hidden`, `<main>` is the only
  scroll container). Never introduce document-level scroll or remove `overflow-hidden` from
  `html`/`body`/`app/(store)/layout.tsx`.
- `lg-touch` and `lg-desktop` do not inherit from each other or from `lg:`. Any responsive change
  that must hold on both screen heights needs both variants written explicitly. Read
  `docs/vertical-space-lg-touch.md` before writing either.
- Any className edit touching height/sizing (`h-full`, `min-h-`, `max-h-`, `aspect-`) under
  `app/components/**` must be checked with the `sang-logium-review` skill against the diff before
  that task is considered done (CLAUDE.md mandatory gate — mechanical, not optional).
- No `npm install`, `npm run build`, `tsc`/type-check, lint, or dev-server boot as a per-task
  check. Use editor/language-server diagnostics on the touched file only. Real verification (if
  any) happens once, in the Verification section at the end — never interleaved per task.

## Circuit breaker

If any single step fails or hangs twice in a row, stop retrying it. Report exactly what happened
and move to the next task rather than attempting a third variation.

## Per-task loop

1. Read the task fully before editing.
2. Make only the change described — nothing else, even if you notice something else worth fixing
   (add it to the Proposals section instead).
3. Check editor diagnostics on the touched file.
4. Mark the task done, move to the next.

---

## Task 1 — Fix broken semantic-token classes (mechanical, do first)

**Files and lines** (from `docs/design-system.md`, Gap 2 — re-grep each file first, line numbers
may have drifted):

| File | Bare class → correct class |
|---|---|
| `app/(store)/product/[slug]/page.tsx:36,42` | `text-secondary` → `text-text-secondary` **and** `hover:text-primary` → `hover:text-text-primary` (both tokens, same two lines) |
| `app/(store)/product/[slug]/page.tsx:47` | `text-primary` → `text-text-primary` |
| `app/components/features/products/ProductDetail.tsx:39,40,42,52` | `text-secondary` → `text-text-secondary` |
| `app/components/features/products/ProductDetail.tsx:49,50` | `text-primary` → `text-text-primary` |
| `app/components/features/products/ProductInfo.tsx:34,108,118,140` | `text-secondary` → `text-text-secondary` |
| `app/components/features/products/ProductInfo.tsx:37,101,121` | `text-primary` → `text-text-primary` |
| `app/components/features/products/ProductInfo.tsx:82` | `text-headline` → `text-text-headline` |
| `app/components/features/products/ProductCard.tsx:62` | `text-primary` → `text-text-primary` |
| `app/components/features/products/ImageGallery.tsx:127` | `text-body` → `text-text-body`, `hover:text-primary` → `hover:text-text-primary` |
| `app/components/features/products/EmptyResults.tsx:10` | `text-secondary` → `text-text-secondary` |
| `app/components/features/products/ProductGrid.tsx:16` | `text-secondary` → `text-text-secondary` |

24 bare-class tokens total across 7 files — re-grep each file before editing in case line numbers
have drifted since this plan was written.

For each: change only the bare class token to its `text-text-*` equivalent. Do not touch any
other part of the className string (ordering, other utilities, `type-*` classes stay as-is).

**DoD:** every bare `text-primary`/`text-secondary`/`text-caption`/`text-headline`/`text-body` in
the 7 files above now reads `text-text-*`. No other className content changed. No file outside
this list touched.

---

## Task 2 — Consolidate the homepage NewestRelease one-off CTA

**File:** `app/components/features/homepage/newest-release/NewestRelease.tsx:106`

**Current:**
```tsx
className="self-start px-8 py-3 uppercase tracking-editorial text-center border border-accent-600 bg-accent-600 text-secondary-900 rounded-md transition-all duration-200 hover:bg-transparent hover:text-secondary-900"
```

**Decision (resolved — do not re-litigate):** reuse `.btn-primary`. It already provides a solid
button with a dark-on-light hover-safe treatment and is the system's actual "primary action"
class; the hand-rolled version was duplicating it with a gold fill and a broken hover state.
Do not add a new `.btn-accent` class for this — one call site is not a repeated pattern (flaw-vs-taste
test item 3: only promote to a new named class at 2+ repeats).

**Replace with:**
```tsx
className="btn-primary self-start px-8 py-3 uppercase tracking-editorial text-center"
```

Keep `self-start`/`px-8`/`py-3`/`uppercase`/`tracking-editorial`/`text-center` (layout/positioning
utilities not owned by `.btn-primary`); drop every color/border/hover utility — `.btn-primary`
supplies all of that, including a working hover and focus-visible state.

**DoD:** button renders with `.btn-primary`'s cream fill and dark text, hover state is legible
(no transparent-background-plus-dark-text combination remains anywhere in this file). No other
line in `NewestRelease.tsx` touched. `tailwind.config.ts` not touched.

---

## Task 3 — Product Detail Page: give the info column a floor

**File:** `app/components/features/products/ProductInfo.tsx`

**Problem (see `docs/design-system.md` Gap 1):** when `overviewFields` yields zero quick-scan
groups (empty, or every entry classified narrative), the info column renders nothing between the
buy box and the `border-y` divider, leaving unbounded empty space beside the image column.

**Before editing:** confirm the shape of `product.specifications` against
`sanity-cms/lib/products/getProductBySlug` (used already in `ProductDetail.tsx:47` as
`spec.title`/`spec.value`/`spec.information` — verify `information` is optional before relying on
its absence).

**Change 1 — compute whether the quick-scan area would otherwise be empty.**

Near the existing derived values (around line 74–76):
```tsx
  const overviewFields = product.overviewFields || [];
  const quickFields = overviewFields.filter((field) => wordCount(field.value) < NARRATIVE_FIELD_MIN_WORDS);
  const narrativeFields = overviewFields.filter((field) => wordCount(field.value) >= NARRATIVE_FIELD_MIN_WORDS);
  const quickGroups = groupFieldsByTitle(quickFields);
```
Add directly below:
```tsx
  const specsFallback = quickFields.length === 0 ? (product.specifications || []).slice(0, 4) : [];
```

**Change 2 — render the fallback using the exact pattern already used for single-entry quick
groups two lines below** (around line 128–136 in the current file — the
`quickGroups.some/filter/.map` block rendering `OverviewField`). Insert a sibling block, same
container (`space-y-4 py-4 lg-touch:py-2 lg:mt-2 border-y border-border-secondary`), so it appears
even when `overviewFields.length === 0` entirely — this means the outer
`{overviewFields.length > 0 && (...)}` guard (line 113) must become
`{(overviewFields.length > 0 || specsFallback.length > 0) && (...)}` so the panel still renders
for products with no overview fields at all, not just thin ones.

Inside that panel, before the `narrativeFields` details block, add:
```tsx
{specsFallback.length > 0 && (
  <div className="grid grid-cols-2 gap-4">
    {specsFallback.map((spec, i) => (
      <div key={i}>
        <p className="type-caption uppercase text-text-secondary">{spec.title}</p>
        <p className="type-body text-text-primary">{spec.value}</p>
      </div>
    ))}
  </div>
)}
```
(Uses the corrected `text-text-secondary`/`text-text-primary` classes from Task 1 — run Task 1
before Task 3 on this file.)

**Change 3 — bound residual whitespace.** The panel already carries `border-y
border-border-secondary`; leave it as the container even in the fallback-only case — do not add a
new border/shadow treatment. If, after Change 1–2, real products still leave visible empty space
below the panel (check against a product with genuinely no specifications and no overview
fields, if one exists in the catalogue), wrap the whole `ProductInfo` root `<div>` (line 79) in
`.card-base` instead of leaving it bare — this is the one class-level layout change this task
permits, and only conditionally. Prefer Changes 1–2 alone if they resolve it.

**DoD:** on `/product/xduoo-xd-05-bal-balanced-dac-amp` (or any product with no quick overview
fields) at 1440×800 and 1440×960, the info column now shows up to 4 spec rows where it previously
showed nothing, and the visual gap beside the image is materially smaller. No change to the image
column, `ImageGallery.tsx`, or the grid split in `ProductDetail.tsx:19`. Run `sang-logium-review`
against the diff before marking this task done (CLAUDE.md gate — this task's `.card-base`
contingency in Change 3 is the kind of edit it exists to catch, even though it doesn't touch
`h-full`/`aspect-*` directly).

---

## Phase 2 — systematic pass over the rest of the site

Tasks 1–3 close every gap confirmed in `docs/design-system.md` as of 2026-08-06. They do not
cover the whole app — this phase is the repeatable procedure for the rest of it. Do not invent
fixes ahead of running this procedure on a given page; do not skip pages by assuming they're fine.

**Customer-facing route inventory** (from `app/(store)/**`): home, `/products` +
`/products/[...slug]` (category), `/product/[slug]` (done above), `/basket`, `/checkout/*`
(address, payment, shipping, success, return), `/account/*`, `/about-us`, `/brand`, `/contact`,
`/faq`, `/privacy-policy`, `/returns-policy`, `/shipping-policy`, `/sign-in`, `/sign-up`,
`/forgot-password`, `/reset-password`, `/verify-email`, `/search`.

**Out of scope for this pass:** `(admin)` (`/manager`, `/packer`) and `(studio)` — internal
tooling and third-party CMS UI, not the storefront this plan covers. Skip unless the human
explicitly asks for them.

For each remaining route:

1. Screenshot at three viewports: mobile (390×844), laptop/`lg-touch` (1366×768 or similar
   ≤850h), desktop/`lg-desktop` (1440×960 or similar ≥851h).
2. Read the component source for that route.
3. Run the flaw-vs-taste test (above) on every visual element. Log each finding as either
   **bug-tier** (test items 1–3) or **redesign-tier** (test items 4–5) before changing anything.
4. Implement bug-tier fixes only, using the same discipline as Tasks 1–3: existing tokens/classes
   only, smallest diff that closes the gap, no opportunistic scope creep.
5. Do not implement redesign-tier findings. Append them to "Proposals" below with route, evidence
   (screenshot description + file:line), and why it fails the test at item 4 or 5.
6. Run `sang-logium-review` on any height/sizing className diff per the architecture guardrails.

When the full route list has been walked, write one summary file,
`_project/reports/design-system-pass-<date>.md`, listing: fixed (bug-tier, with file:line),
proposed-not-implemented (redesign-tier, needs a human decision), and confirmed-already-professional
(no change needed) — one line each, no prose padding.

---

## Verification (once, at the end — not interleaved per task)

- Re-read the diff for Tasks 1–3 in full against this document's DoD lines.
- Confirm `tailwind.config.ts` is untouched (Task 2's decision was to reuse `.btn-primary`, not
  add a class — verify no new entry was added).
- Confirm no file outside the ones named in Tasks 1–3 was touched, plus whatever Phase 2 touched
  per its own logged findings.
- Run `sang-logium-review` once against the full combined diff.
- If a dev server is already running, load the homepage, `/products`, and the xDuoo product page
  once each and confirm no crash/blank render. Do not start a dev server solely for this — check
  only if one is already up.

## Proposals — needs a human design decision

*(Empty at authoring time. Anything landing on flaw-vs-taste test items 4–5 gets appended here by
whoever runs Phase 2, not implemented.)*
