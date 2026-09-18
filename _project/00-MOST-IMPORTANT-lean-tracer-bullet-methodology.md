> **This is the most important process document in this project.** Read it before
> starting any new feature, before deriving acceptance tests, before touching code.
> Part 1 is the campaign structure — how a feature-level objective becomes tracked,
> sequenced work. Part 2 is how each milestone actually gets built once handed off
> for execution.

# Campaign & Milestone Execution Methodology

Distilled from the filters-and-sorting build, refined 2026-09-18. Not tied to that
feature — use this for the next one too.

## Part 1 — The campaign (planning window)

0. **State the objective as a bar, not a task** — e.g. "professional 9+/10, defensible
   under any audit," not "improve the filters."

1. **Conversation → acceptance tests.** Translate the objective into plain
   "when I `<do X>`, I see `<Y>`" statements — pure observable behavior, no
   implementation detail, no speculation beyond what was actually said.

2. **plan.md — milestones only.** Once the acceptance tests exist, write `plan.md`:
   an ordered roadmap of milestones toward the objective. Nothing else goes in it —
   no per-milestone detail, no task trees, no proofs. Pure campaign map.

3. **Per milestone, in order:**
   - **3a. Plan the milestone in full**, here, in conversation: solve it, deconstruct
     it, break it into a task tree. Name the actors involved and give each exactly
     one job; define the single thing they're allowed to share (a URL, a shared
     prop, one event) and forbid everything else from crossing that line. Expect
     several passes — a clean split rarely survives the first draft. If a piece of
     the task tree stops satisfying one of the acceptance tests, that's the signal
     the split is wrong; go back to the acceptance tests, not just the tree.
   - **3b. Write the milestone's proof(s)/tests before any code** — the verification
     criteria that define done. Use "proof" over "test" when a code test doesn't fit
     but a directly-checked artifact does. These need to hold to a real bar — strict
     enough that passing one but being wrong later would be embarrassing, not a
     rubber stamp. A milestone-wide **deletion test** (Part 2, step 5) is one valid
     proof type.
   - **3c. Create exactly one beads issue** for this milestone — the only point in
     the whole campaign a beads issue gets created. One milestone, one issue, never
     more, never less. (This issue is now the single source of milestone status —
     no separate status file.)
   - **3d. Handoff.** Task tree + proofs go to a separate execution window/agent,
     which builds the entire milestone end-to-end per Part 2. This planning window
     does not write implementation code.
   - **3e. Verify, solo.** Read the git diff, check anything live that needs it, run
     the proofs yourself (including the deletion test), fix whatever's needed until
     the milestone is fully green.
   - **3f. Evaluate + refactor.** Once green, bring it back to the planning window.
   - **3g. Next milestone** — back to 3a.

## Part 2 — Milestone execution (the execution window)

Applies once a milestone's task tree + proofs have been handed off. The agent runs
the whole milestone end-to-end in **one continuous pass — it does not stop mid-build
to wait for a human check.** Stopping mid-flight for verification is expensive (agent
idle time) and unnecessary — the human's real check happens once, at the end, per 3e.

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
   human's live check, and that happens once, at the end (3e) — never mid-build.

5. **One deletion test, at the very end, not per-slice.** Once the entire milestone
   is built, the falsifiable SRP check runs once, against the whole thing: for each
   actor/boundary the milestone introduced, would the other side still work if this
   piece were deleted (and vice versa)? This is one of the milestone's proofs (3b),
   checked by the human at 3e — not a mid-build pause point, and not run after every
   small step.

6. **Finish the milestone, then stop.** Once every slice is built and the continuous
   SRP self-check passes end-to-end, the agent is done — it hands back for human
   verification (3e). It does not wait for a deletion-test result mid-build, and
   does not pause between slices for a glance-check.

## What breaks this if you skip it

- Starting execution from a task tree that skipped the acceptance-tests step
  (Part 1.1) — there's nothing real to check the split against.
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
- More than one beads issue per milestone (Part 1.3c) — administrative cost stops
  being worth it past exactly one.
