# THE LOOP — how a feature goes from intent to merged

Each stage has IN (what it needs), OUT (what it produces), TRUST (why you can believe it).

## 0. WHOLENESS (before anything is written)
Exhaustive, silent understanding of the whole thing — its real files, data,
queries, exact scope boundaries, dependency order, every failure mode.
Its state is tracked in `missions/<feature>/wholeness.md`: terse claims about
what must be true of the real thing, grouped by theme — no prose, no plan, no
checks. Each pass is a minimal update with zero waste characters, bringing the
file to the truest current state of understanding and done status. It is the
ground every later stage stands on, and the anchor each DoD item and check must
trace back to.

## 1. INTENT
IN:  a vague goal ("filters should feel professional").
OUT: a bar — "9+/10, defensible under any audit" — not a task list.
TRUST: a fixed bar stops "done" from drifting while you build.

## 2. DoD CHUNK
IN:  the bar, built only from the wholeness (step 0) — never from assumption,
     memory, or what sounds plausible.
OUT: 3–5 binary claims in a `dod.md` — each true/false, checkable by a human
     who does not trust the author.
TRUST: small enough to hold in your head; each item names one verifiable fact.
     One chunk = one kind of verification act. If items need different acts
     (eyeball judgement vs. cross-slice diff vs. data query), they are
     different chunks — however related the topic feels.

## 3. BLUEPRINT
IN:  one dod.md, plus the same wholeness.
OUT: each DoD item paired with ONE proof means — the simplest concrete check
     that demonstrates it. Terseness is earned by the wholeness work, not performed.
TRUST: every assumption a check stands on traces to an earlier proven item or is
     itself a check. Packed assumptions are the failure mode.

## 4. PR AS WORKSPACE
IN:  the blueprint, implemented checks (scripts in tests/).
OUT: PR body = the DoD list as checkbox tracer bullets. Each bullet is a PAIR:
     READ the check (linked, black-box IN/OUT/WHY step headers, output built for the eye) +
     RUN the check (exact command, per slice) + PASS criterion.
TRUST: the human ticks each box with their own eyes, in order.
     The PR is not a report of done work — it is where verification happens.

## 5. THE WORK INSIDE THE PR
IN:  unticked boxes.
OUT: ticked boxes — plus reality: checks FIND defects (dirty data, bugs).
     Each defect spawns a sub-item (e.g. 1.1.a): fix, re-run, confirm counts.
TRUST: a proof that found and cleaned 10 bad products proved more than
     a proof that found nothing.

## 6. MERGE
IN:  every box ticked, in order.
OUT: merge. Then the next DoD chunk starts at step 2.
TRUST: nothing merged that human eyes didn't see pass.

## THE TWO FAILURE MODES

- **Disconnection** — any DoD or check that does not trace back to the
  wholeness is a broken link. Broken links compound: the chain stops adding
  up, and the whole proof becomes bullshit that certifies nothing.
- **Bloat** — anything unnecessary (an extra item, an extra check, an extra
  layer) also compounds: it piles up until the list is unworkable and
  bullshit in the opposite direction.

Every item must be BOTH: traced to the wholeness, and necessary. Either
failure alone kills the loop.

A complete observed run of this loop: `examples/mission-01-membership.md`.
