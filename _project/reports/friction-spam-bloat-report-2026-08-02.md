# Friction / Spam / Bloat Report — 2026-08-02

## What happened

A simple, single-file visual tweak (reposition/resize the featured-section carousel arrows on mobile) was escalated into a long, high-overhead planning and research phase that produced no code and wasted several minutes.

The actual code change is a few Tailwind className strings and one or two prop values in `app/components/features/homepage/featured/Featured.tsx`. It should take seconds, but the session immediately detoured into reading two prior task plans, searching the whole repo for "carousel" and "featured", running `bd prime` / `bd ready` / `bd search`, and invoking the `objective-realization` skill, which then demands a full 7-phase plan and a one-paragraph human summary before any implementation.

## Root causes / triggers

1. **Skill auto-activation without a complexity check**

   The `objective-realization` skill was triggered automatically because the user's request was worded as an "objective." That skill hard-codes a "plan first, no code, wait for approval" workflow. It does not have an escape hatch for tiny, already-approved UI edits. Once invoked, it consumed the first part of the session with mandatory read-only intelligence gathering and gap scanning.

2. **The skill instructions conflicted with the user's command**

   The user said "make it so" and provided a screenshot — a clear directive to implement. The skill's critical rule says "Stop after this summary and wait for user approval before any agent executes the plan." The model should have recognized that "make it so" *is* approval and either skipped the skill or treated it as a fast path, but it did not.

3. **Project process overhead was applied unconditionally**

   `AGENTS.md` / `CLAUDE.md` require beads tracking, `bd prime`, mutex claims, and parallel-guardrail checks. These are important for multi-agent work, but they were triggered for a trivial, single-file, no-logic CSS change. There was no fast-path exception for low-risk, low-blast-radius edits.

4. **Historical planning docs encouraged over-reading**

   Two large markdown plans (`docs/devin-carousel-arrow-visual-refinement-tasks.md` and `docs/devin-carousel-controls-ux-tasks.md`) were read instead of just looking at the one file that matters (`Featured.tsx`) and the one shared primitive (`CarouselControls.tsx`). The previous plans are useful, but they are not the source of truth for a quick class change.

5. **No early user-intent check**

   At no point did the model ask "Is this a quick fix or do you want a full plan?" A one-line clarification would have revealed the user wanted immediate execution and prevented the entire detour.

## What made it worse

- Multiple parallel `bd` searches and file reads produced a wall of output that was irrelevant to the fix.
- The `devin-carousel-controls-ux-tasks.md` and `devin-carousel-arrow-visual-refinement-tasks.md` files are long; reading them added delay and context bloat.
- The model attempted to start creating a beads issue, running more searches, and going through the full workflow instead of editing.
- The user had to explicitly abort the task.

## Recommendations

1. **Add a fast-path guard before invoking planning skills.** If the objective is a single-file visual/CSS change with a screenshot and the user says "make it so," skip `objective-realization` and just edit.

2. **Make skill invocation conditional on complexity or user preference.** Don't auto-invoke long-planning skills for trivial tasks. A simple heuristic: "If the change is purely presentational, affects one component, and the user explicitly approved, do not run objective-realization."

3. **Treat explicit approval commands as approval.** Commands like "make it so," "fix it now," "do it," or "ship it" should override any "wait for human summary" rule inside a skill.

4. **De-scope mandatory beads/mutex workflow for tiny no-logic edits.** For one-file Tailwind tweaks, a single mutex claim and a quick post-edit note may be enough; the full `bd create` / `bd ready` / search dance is overkill and should be skippable when the user clearly wants speed.

5. **Read the smallest possible surface area first.** For a carousel arrow issue, the first reads should be the consuming file and the controls primitive, not historical task plans and whole-repo greps.

6. **Ask one fast clarification when intent is ambiguous.** "Full plan or 10-second fix?" saves more time than it costs.

## Conclusion

The bloat was not caused by a single bad tool call; it was caused by a stack of mandatory skills, project rules, and planning docs all firing at once on a task that did not need any of them. The fix is to make the automation respect task size and explicit user approval, and to keep the shortest path for the smallest changes.
