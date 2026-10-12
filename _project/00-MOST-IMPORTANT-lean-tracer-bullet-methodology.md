> **Scope:** this document governs the **build** side — how a milestone gets
> executed once defined (Part 2 discipline: salvage, vertical slices, SRP
> self-check, no self-verification, finish then hand back). For intent,
> Definition of Done, proof means and verification,
> `_project/project-management/blueprint-for-wholeness-of-proof-instructions.md`
> is the source of truth and takes precedence wherever the two disagree — in
> particular: status/evidence lives in the mission PR checklist of proof
> tracer bullets, not in `plan.md`; proofs are prepared checks fired by the
> human per item, not artifacts written before code.
> Part 1 is the campaign structure — how a feature-level objective becomes tracked,
> sequenced work. Part 2 is how each milestone actually gets built once handed off
> for execution.

# Campaign & Milestone Execution Methodology

Distilled from the filters-and-sorting build, refined 2026-09-18. Not tied to that
feature — use this for the next one too.

## Part 1 — The campaign (planning window)

0. **State the objective as a bar, not a task** — e.g. "professional 9+/10, defensible
   under any audit," not "improve the filters."

   Intent, done-definition, proof means and verification belong to the proof
   pipeline — `dod.md` / `blueprint.md` / mission-PR bullets per the blueprint
   instructions. This document does not define them.

1. **Per milestone, in order:**
   - **1a. Plan the milestone in full**, here, in conversation: solve it, deconstruct
     it, break it into a task tree. Name the actors involved and give each exactly
     one job; define the single thing they're allowed to share (a URL, a shared
     prop, one event) and forbid everything else from crossing that line. Expect
     several passes — a clean split rarely survives the first draft.
   - **1b. Handoff.** The task tree goes to a separate execution window/agent,
     which builds the entire milestone end-to-end per Part 2. This planning window
     does not write implementation code.
   - **1c. Verify, solo.** Read the git diff, check anything live that needs it,
     fix whatever's needed until the milestone is done.
   - **1d. Evaluate + refactor.** Once done, bring it back to the planning window.
   - **1e. Next milestone** — back to 1a.

## Part 2 — Milestone execution (the execution window)

Applies once a milestone's task tree has been handed off. The agent runs
the whole milestone end-to-end in **one continuous pass — it does not stop mid-build
to wait for a human check.** Stopping mid-flight for verification is expensive (agent
idle time) and unnecessary — the human's real check happens once, at the end, per 1c.

1. **Salvage before rebuilding.** If a prior/legacy implementation exists, keep
   what's already correct (styling, spacing, design-system alignment) separate from
   what's tangled, instead of discarding wholesale.

2. **Build as real vertical slices.** Each piece of work lives in its exact final
   file location — not a scratch file, not a placeholder. Small, one at a time,
   foundation up. This is an internal structuring discipline, not an external pause
   point.

3. **Self-check SRP continuously, without stopping.** While building, keep verifying
   the actor/module split from the task tree still holds — no piece doing more than
   its one job, no hidden dependency crossing a boundary that's supposed to be
   clean. This is a running self-review, not a gate — it never blocks or pauses the
   build.

4. **No build/lint/test/tsc, ever, as self-verification.** Same standing rule as
   everywhere else in this project. The only verification that counts is the
   human's live check, and that happens once, at the end (1c) — never mid-build.

5. **One deletion test, at the very end, not per-slice.** Once the entire milestone
   is built, the falsifiable SRP check runs once, against the whole thing: for each
   actor/boundary the milestone introduced, would the other side still work if this
   piece were deleted (and vice versa)? Checked by the human at 1c — not a mid-build pause point, and not run after every
   small step.

6. **Finish the milestone, then stop.** Once every slice is built and the continuous
   SRP self-check passes end-to-end, the agent is done — it hands back for human
   verification (1c). It does not wait for a deletion-test result mid-build, and
   does not pause between slices for a glance-check.

## What breaks this if you skip it

- Starting execution from a task tree that skipped the planning passes
  (Part 1.1a) — an unvetted split hands the executor a broken decomposition.
- Rebuilding visuals from scratch instead of salvaging what already works
  (Part 2.1) — throws away correct work fused to the logic being replaced.
- Running tsc/build/lint/tests at any point as "verification" (Part 2.4) — the one
  rule that's absolute everywhere in this project.
- Pausing mid-milestone for a human glance or a deletion test — this is what
  tracer-bullet-v1 did that's now explicitly wrong for this project. It stalls the
  agent for no signal a single end-of-milestone check doesn't already give.
- Skipping the continuous SRP self-check because nothing's forcing a stop for it —
  the whole point of removing the pause is that the check still has to happen, just
  without blocking.
