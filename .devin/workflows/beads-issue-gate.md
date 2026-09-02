---
description: Pre-create quality gate for .beads issues to keep every issue >8/10 and high-EV
---

# /beads-issue-gate

> **SUPERSEDED IN PART (2026-09).** The issue **goal/body format** is now fixed by
> `CLAUDE.md` → "## Beads issue goal format" and the lean-protocol memory: the goal is a
> list of end-user UX **acceptance tests** — `When I <interaction>, then <observable
> outcome>` lines a human runs in a browser on `localhost:3000` — plus a `CURRENT STATUS:`
> line, and nothing else. That model **wins** wherever this file demands a prose problem
> statement, verified `file:line` pointers, exact `tailwind.config.ts` tokens in the body,
> a `## Scope`/`## Related files` file list, or automated (Playwright/Vitest/Lighthouse)
> verification. Do **not** apply checks #2, #4, #7, #8, or the "Required Issue Anatomy"
> section as written. The parts still in force: one atomic problem (#1), specific
> falsifiable user impact (#3), out-of-scope names temptations (#5), acceptance is a
> question-free boolean contract (#6), no duplicate (#9), session-bounded ≤3 steps (#10).
> If the two genuinely can't be reconciled for a specific issue, flag it to the human.

**Run this before creating or editing any `.beads` issue.**

## Purpose

Stop bad beads issues at the source. A bead is one unit of value — one atomic, testable, high-EV slice that any competent agent can execute and verify without asking a single clarifying question.

**Lean principle: Do Nothing Unnecessary.** Every step, every acceptance criterion, every file touched must directly serve the stated value. If a step can be removed without breaking the objective, remove it. The best bead is the smallest one that delivers the value.

---

## The 10-Point Gate

All 10 must be `YES`. If any is `NO`, do **not** create the issue. Refine first.

| # | Check | Why it matters |
|---|-------|----------------|
| 1 | **One atomic problem, nothing unnecessary** — Does the issue describe exactly one defect with one root cause? If it touches more than one component with independent design decisions, split it. Can any step, file, or acceptance criterion be removed without breaking the stated value? If yes, remove it. "One vertical slice" is not enough — it must be the smallest atomic unit of work that delivers the value. | Prevents scope collapse and waste. Bundled issues are the #1 cause of agent failure; unnecessary steps are the #3 cause. |
| 2 | **Evidence is concrete and verified** — Does the problem statement cite a specific, verifiable pointer: `file:line`, a failing test name, an error message, an exact measurement, or a screenshot path? The pointer must resolve — verify the file:line exists and the code matches the claim before creating the issue. | Prevents opinion-based tickets and stale references. |
| 3 | **Value names a specific impact** — Does the value statement reference a concrete, falsifiable metric or user impact? Not just a category label ("UX", "performance"). Must name the thing at stake: conversion rate, accessibility standard (WCAG 2.5.5), checkout completion, error rate, page load time. | Prevents low-value busywork disguised as issues. "This matters for UX" fails. |
| 4 | **Scope surfaces implicit knowledge** — Does `## Scope` list the exact files AND the specific lines or props to change? Does it surface non-obvious defaults, breakpoint values, and component behaviors the agent would otherwise have to look up (e.g., "`BasketControls` defaults to 44×44 px", "`xs` = 475 px", "Tailwind is mobile-first so unprefixed classes target <475 px")? The agent must know precisely where to touch AND what it needs to know to touch correctly. | Prevents fuzzy boundaries, exploratory drift, and silent incorrect assumptions. |
| 5 | **Out of scope names temptations** — Does `## Out of scope` list the adjacent changes an agent would be tempted to make? Adjacent breakpoints, sibling components, "while I'm here" improvements. Must be specific, not "everything else." | Prevents gold-plating. This is a runtime constraint, not documentation. |
| 6 | **Acceptance is the contract** — Can every criterion in `## Acceptance` be verified by a different agent without asking a single question? Every criterion must reduce to a boolean: a number, a token match, a file:line check, a test pass/fail. No subjective adjectives. This replaces the old DoD section — acceptance criteria ARE the definition of done. | Turns sign-off into a mechanical contract. The single highest-leverage gate. |
| 7 | **Tokens named and verified** — If UI is involved, does the issue name exact tokens from `tailwind.config.ts` (e.g., `min-h-[44px]`, `text-small`, `grid-cols-1`, `xs:`)? Verify each token exists in the config before creating the issue. | Replaces hand-waving with grep-able, verifiable instructions. |
| 8 | **One verification method, automated preferred** — Is there exactly one named method? Prefer automated (Playwright, Vitest, Lighthouse) over manual. If manual, list exact viewport dimensions. Never "and/or." | Makes "done" unambiguous. Automated methods prevent human verification drift. |
| 9 | **Files exist, no duplicate** — Does every file in `## Related files` exist right now? Is the issue not already open in `.beads/issues.jsonl`? These are mechanical checks — verify with `Test-Path` and `git grep` before creating. | Avoids stale references and duplicate work. |
| 10 | **Session-bounded** — Can this be completed in ≤3 discrete steps (read → edit → verify)? 5 steps is the absolute ceiling — anything approaching it is a red flag; decompose further. Time is volatile for AI to estimate; step count is the reliable metric. Target: 5–6 minutes. Additionally: are cross-issue dependencies stated by ID? Are prerequisites listed (dev server, valid tokens, installed deps)? | Prevents context-switching overhead — the #2 cause of agent failure after scope collapse. Also prevents dependency-chain breaks and silent precondition failures. |

---

## Pass / Fail Rule

- **PASS**: All 10 are `YES` → create the issue.
- **FAIL**: Any `NO` → stop. Rewrite, split, gather evidence, or tighten scope. Do **not** append to `.beads/issues.jsonl` and do **not** run `bd create`.

---

## The "Different Agent" Test (apply to ALL sections)

For the **problem statement**, ask:

> *"Could a different agent verify this problem exists without asking me?"*

For the **scope**, ask:

> *"Could a different agent determine the exact lines to change AND understand every non-obvious default, breakpoint value, and component behavior referenced — without looking anything up?"*

For every **acceptance criterion**, ask:

> *"Could a different agent verify this is done without asking me?"*

For the **issue as a whole**, ask:

> *"Can any step, file touch, or acceptance criterion be removed without breaking the stated value?"*

If the answer is **no** to any of these, rewrite with a number, token, file:line, or exact class. If the answer to the Lean question is **yes**, remove the unnecessary piece immediately.

---

## Required Issue Anatomy

Every `.beads` issue must contain these sections, in this order:

1. **Title** — MUST follow `_project/beads-naming-convention.md`: epic = `EPIC Filters Sorting`; child of an epic = `[Filters] Price min/max <-> URL`; standalone = `Search: clamp out-of-range ?page=`. Outcome-focused, ≤ 60 chars, no raw ID / `sang-logium-` string. This is a hard gate — a non-conforming title fails check #1.
2. **Problem** — evidence-based description of the single defect with verified file:line pointers.
3. **Value** — one sentence naming the specific, falsifiable impact (metric, standard, or user outcome).
4. **Scope** — exactly what files and lines will be changed, with the target tokens/values. Surface any non-obvious defaults, breakpoint values, or component behaviors the agent needs to know.
5. **Out of scope** — adjacent changes the agent would be tempted to make, explicitly excluded.
6. **Acceptance** — measurable, boolean-checkable criteria (this IS the definition of done).
7. **Verification** — one named method, automated preferred.
8. **Related files** — verified existing files directly in the execution path.
9. **Dependencies** — if this depends on another open issue, state its ID. If none, write "None."
10. **Prerequisites** — what must be true before work starts (e.g., "dev server on port 3000", "SANITY_STUDIO_READ_WRITE token valid"). If none, write "None."

If a section is missing or vague, the issue fails the gate.

---

## Example: Bad vs Good

### ❌ Fails the gate (original IEMs issue)

> The IEMs gallery section on the homepage degrades significantly on smaller device sizes. The current two-column grid, card typography, price/basket-control row, and section header do not provide a professional UX on phones and small tablets.

- **Fails #1** — bundles grid, typography, basket controls, and header into one issue.
- **Fails #2** — no concrete file:line, measurement, or screenshot.
- **Fails #3** — "professional UX" is not a specific, falsifiable impact.
- **Fails #4/#5** — no `## Scope` or `## Out of scope` sections.
- **Fails #6** — "visually professional", "comfortable spacing", "no excessive truncation" are subjective.
- **Fails #7** — "all changes in line with design system" without naming tokens.
- **Fails #8** — "visual inspection and/or responsive Playwright/Vitest tests" is ambiguous.

### ✅ Passes the gate (decomposed example)

> **Title:** IEMs card basket-control buttons are 32×32 px on mobile — below WCAG 2.5.5
>
> **Problem:** In `IemCard.tsx:64-66` the increment/decrement buttons are forced to `w-8 h-8` (32 px) and the quantity field is `w-7`, overriding the `BasketControls` default of `h-11 w-11 min-h-[44px] min-w-[44px]` at `BasketControls.tsx:98-108`.
>
> **Value:** 32×32 px touch targets violate WCAG 2.5.5 (Target Size) and directly hurt mobile checkout conversion — users cannot reliably tap add-to-cart.
>
> **Scope:**
> - `IemCard.tsx:64-66` — remove the `w-8 h-8` and `w-7` override props so `BasketControls`' own 44×44 px defaults take effect.
>
> **Out of scope:**
> - Redesigning the IEMs gallery grid or changing column count.
> - Changing card typography, product images, or the section header.
> - Adding Playwright tests.
> - The 475 px+ breakpoint range.
>
> **Acceptance:**
> - [ ] Increment/decrement buttons in `IemCard.tsx` render at `min-h-[44px] min-w-[44px]` at every breakpoint.
> - [ ] Quantity display in `IemCard.tsx` renders at `min-h-[44px] min-w-[44px]` at every breakpoint.
> - [ ] The `+` / `−` labels remain visually centered.
> - [ ] Manual check at 375 px, 475 px, and 768 px confirms no overlap or overflow in the price row.
>
> **Verification:** Manual responsive check at 375 px, 475 px, and 768 px.
>
> **Related files:**
> - `app/components/features/homepage/iems-gallery/IemCard.tsx`
> - `app/components/features/basket/BasketControls.tsx`
>
> **Dependencies:** None.
>
> **Prerequisites:** Dev server running on `localhost:3000` to verify at listed viewports.

---

## When to Decompose

If the issue contains:

- More than one component needing independent design decisions.
- Phases or "Phase 1 / Phase 2" language.
- Multiple distinct breakpoints with different root causes.
- Acceptance criteria that apply to different files without a shared fix.
- A scope requiring more than 3 discrete steps (5 steps absolute ceiling — a red flag; split immediately). Step count is the reliable metric; time is volatile for AI estimation.
- Acceptance criteria or file touches that don't directly serve the stated value (Do Nothing Unnecessary — remove them).

Stop and write separate beads. Use `/vertical-slice-plan` or `/viable-output-cycle` if the split is not obvious.
