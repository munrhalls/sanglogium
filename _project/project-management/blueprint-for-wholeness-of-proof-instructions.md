# INSTRUCTIONS — BLUEPRINT FOR WHOLENESS OF PROOF

A blueprint is a terse list: each DoD item paired with one tiny, concrete,
human-readable proof means. The list is only trustworthy because of what
happened before it was written.

## THE PRINCIPLE

Terseness is earned, not performed. A one-line proof ("count A == count B") is
only trustworthy when it was distilled from wholeness — exhaustive exploration
of the environment, exact scope boundaries, dependency order fully mapped,
every failure mode seen. The same-looking line written without that work is
fragmentation dressed as simplicity: tidy checks covering a fraction of
reality.

Two works. Do not confuse them.

## SCOPE — UNDERSTANDING GLOBAL, OUTPUT LOCAL

Work 1 comprehends the **whole feature** — its full environment, dependency
order, boundaries, failure space — every run. The DoD documents and every
blueprint are slices cut from that one pool of wholeness; a blueprint that
only understands its own slice is fragmentation and misses cross-slice
dependencies.

Work 2 is bounded: a blueprint covers exactly one DoD document — its items,
in its order. When the DoD is a series, blueprint N presumes the proofs of
blueprints 1..N−1 hold — earlier items are ground, not work. Never reach into
later documents; never merge documents; never re-prove what an earlier
blueprint already proves.

## WORK 1 — WHOLENESS (exhaustive, silent)

Before writing anything, understand completely. This work is mandatory and
persists as `wholeness.md` in the feature folder — a flat bullet list of
facts only, each pass a minimal update with zero waste characters to the
truest current state of understanding and done status.

- Read the real surface — the actual files, queries, data, definitions.
  Never from memory, never assumed.
- Map the true dependency order — what must hold before what.
- Fix exact scope boundaries — what is in, what is out, and why.
- See every failure mode each DoD item could hide — for every item, answer:
  what does wrong look like here?
- Decompose packed items — does an item secretly presume something no earlier
  item proves? Split it until every assumption traces upward to an earlier
  item or to nothing.
- Know what the feature must be for the end user — solid, professional,
  no nonsense — and which proof would actually demonstrate that.

Work 1 instruments — read for understanding; nothing from them is transcribed
into the artifact:

- `packed-proof-points.md` — how a claim that looks atomic hides unproven
  prerequisites, and how to decompose packed dependencies.
- `why-blueprint-for-wholeness-of-proof.md` — the failure history behind the
  rules; what goes wrong when wholeness is skipped.

## WORK 2 — THE ARTIFACT (tiny)

For each DoD item, in the DoD's own order, write the item verbatim plus its
proof means: the smallest concrete check a human can read in one glance and
know done-from-wrong — a count comparison, a list that must be empty, a value
that must equal X, an ID set that must match.

One means per item. If a means needs a paragraph, the item is not understood
yet — return to Work 1.

## RULES

- Zero misses: every DoD item has a means. An item with no stateable means:
  write it as one plain short line in the file and tell the human — never
  pad it.
- Zero extras: no matrices, no taxonomies, no machinery, no narration.
  The document is a two-line intro, then the items, each with one read line
  and one pass line. A real gap is one plain short line. No dismissals,
  limitations or justification — a human-review proof needs no defence.
  Nothing else.
- Independence: the expected answer comes from a source other than the thing
  being checked (e.g. the product's own declared field vs the query that
  fetched it). A means that consults only the system under test can only
  self-agree — that is no proof. Satisfy this in your reasoning; never write
  about it in the artifact.
- Honest gate: each means either fails because the behavior is not built yet,
  or passes with a stated reason it already holds. A means that can only
  pass is no check; a means that fails on its own machinery is rewritten.
- Binary: every means gives done or wrong. No "mostly", no judgment calls.
- Realizable: each means must translate directly into a runnable artifact —
  a query, a printed list, a count — with no machinery invented between
  the means and its execution.

## ABORT

If you cannot state a means without a judgment call — an expected result you
cannot pin, a boundary you cannot delineate — stop and name the exact gap.
A gap in the blueprint is a defect; never fill it by guessing. Write it as
one plain short line in the file and say it in chat.

## THE PIPELINE — FROM INTENT TO MERGE

A mission folder holds `dod.md` and `blueprint.md`. Nothing else accumulates —
proofs are executions, not stored files.

**Open the mission PR fully loaded.** Its body is the blueprint rendered as
**proof tracer bullets** — one checklist item per DoD claim, each carrying
everything needed to fire it: the DoD claim (the intent), the prepared check
(the means made runnable — the actual script, query, or printed list, not a
description of one), and the pass condition. Every bullet's check is
prepared **before** the PR opens; the human's work is purely verification,
never preparation. The PR is the single workspace: the next unticked bullet
is always the next thing to do, and the checklist's state at any moment is
exactly how much of the mission is proven.

**Make verification one click.** Every bullet carries a direct GitHub link to
whatever the human must read (the script on the PR branch, and the commit that
changed it) and the exact command to run. The linked code is pushed before the
PR body points at it — a link to unpushed code shows the old version.

**Prerequisites found mid-verification go into the PR.** When a bullet turns out
to presume something unproven (a check that cannot fail, data that must be
cleaned first), add numbered prerequisite bullets (`0.1`, `0.2`, …) ahead of the
bullets they unblock, in dependency order, in the same loaded format, and update
the PR body. Keep them lean; do not renumber the DoD's own items.

Firing one bullet, in dependency order, is two human acts:

1. **Aim check** — the human reads the prepared check whole before it runs;
   it must be readable in one glance, test what the claim states, zero
   hallucination, zero extras. An unreadable check is a defect.
2. **Fire** — the human runs it or sees it run; the outcome is compared
   against the stated pass condition. Tick the bullet with the result noted —
   and move to the next unticked bullet.

When the last item is ticked, merge. The merge means: every claim of the DoD
was proven to the human's own eyes, in dependency order.

## RELATION TO THE CAMPAIGN METHOD

The repo's campaign methodology
(`_project/00-MOST-IMPORTANT-lean-tracer-bullet-methodology.md`) governs
**building** a feature: objective → milestones → proofs-before-code →
campaign PR. This pipeline governs **proving** a feature: DoD → blueprint →
mission PR of proof tracer bullets. They are complementary halves, not
competitors — the campaign builds it, the mission proves it. Where both
apply, the mission PR is the workspace for verification; campaign tooling
(worktrees, runner) stays on the build side.

"Tracer bullet" already means a thin end-to-end build path in the campaign
doc; a **proof tracer bullet** here means one loaded check — claim +
prepared means + pass condition — fired by the human in the mission PR.

Opening a mission PR is part of this pipeline and is pre-authorized — it
needs no separate go-ahead. Merging is always the human's.

## CHECK SCRIPTS READ AS BLACK-BOX CHAINS

A check script must be verifiable by pure logic on first read — the human
verifies the wiring between steps, not the mechanics inside them.

- The script is a sequence of segments, each a black box. Every segment
  header is the same block, in this exact shape:
  ```
  // ════════════════════════════════════════════════════════════
  // ■ STEP N — <NAME IN CAPS>
  // ════════════════════════════════════════════════════════════
  //   IN   :  <what goes in>
  //   OUT  :  <what comes out>
  //   WHY  :  <why the output can be trusted by logic alone>
  // ════════════════════════════════════════════════════════════
  ```
- Output of step N feeds step N+1 visibly — no hidden coupling.
- Printed output labels match what the steps claim to produce.
- Mechanics inside a box get commented only where the stated contract needs it.

## PRINTED OUTPUT IS BUILT FOR THE EYE

Whatever a human reads — printouts, check output, read checks — is made to
be taken in at a glance, without reading:

- One distinct marker per level, so the eye tells the levels apart before
  reading: slice = full-width `█` banner; group = `┏━┓` box; control =
  a type symbol (`▣` options list, `◐` yes/no, `↔` range); option = `○`.
- Names of slices, groups and controls in CAPS.
- Options one per line, in a short column — never one long `|` line.
- No line past about 80 characters.
- Gaps carry the structure: 8 blank lines between slices, 1 between groups.
- Applies to every agent composing a read check for a human, Claude and
  Devin alike.
