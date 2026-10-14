# Appendix — Packed Proof Points: failure modes and how the protocol prevents them

Work 1 instrument — read for understanding during the silent mapping; nothing
from this file is transcribed into the blueprint artifact.

Referenced from blueprint-for-wholeness-of-proof-instructions.md → Work 1.

This appendix exists because the packed-proof-point rule is the easiest instruction to nod at and the hardest to
actually execute. The two failure modes below are real — both slipped through while drafting the filters & sorting
blueprint, and both were caught only by human intuition, not by the instructions. That is the defect this appendix
exists to close.

## The reasoning that leads to packing

Blueprint-building surfaces unknown-unknowns as candidate proof points. Each candidate *feels* atomic when it is
written — "compare the result against the expected set" reads like one act. The packing is invisible because the
assumed machinery is invisible: the check names what it asserts, never what it presumes. So the failure is not in the
assertion — it is in the ground the assertion silently stands on.

The protocol exists to make the ground visible: name what the check presumes, prove each presumption or make it a
check, and order so nothing rests on unproven ground.

## Failure mode 1 — missed prerequisites entirely

**What happened:** the blueprint asserted "the query returns the correct subset" as a data proof. That check silently
assumed two data-level facts that were never proven:

- **Slice purity** — zero non-belonging products per catalog slice (and zero missing). If a slice contains products
  from another slice, every "correct subset" claim built on it is corrupted at the ground.
- **Per-slice product-to-option alignment** — every product in a slice is actually filterable and sortable by that
  slice's declared options: the fields filters read exist and carry valid values on every product; the fields sorts
  read exist and are correctly typed; and every offered option is a value products can actually have.

**Why it is a failure:** a "correct subset" proof running on impure or misaligned data proves nothing — it can pass
while the catalogue is corrupt, or fail and report the wrong layer.

**Correct operation of the protocol:** surfacing assumptions on the subset check produces the two dependencies;
each becomes its own check; both are ordered *before* any subset-correctness proof — slice purity first (membership
is the ground for alignment), then alignment, then subset correctness.

## Failure mode 2 — the packed oracle

**What happened:** "compare the returned subset vs. the expected subset" hid the question **expected by what?**
Every single-filter and every pair × sort combination needs an expected set — thousands of them. The naive
resolution, "precompute all the lists," was itself packed and intractable: it assumed a source of truth that (a) if
hand-written is unverifiable at that volume, and (b) if computed by the system under test can only ever self-agree —
the exact false-positive machine the check criteria exist to ban.

**Why it is a failure:** an oracle derived from the system under test proves nothing; a hand-written oracle at
thousands of entries cannot itself pass the "obviously correct on sight" criterion.

**Correct operation of the protocol:** the oracle is decomposed as its own subproblem — *generate* expected sets per
combination from an independent mechanism (e.g., a dead-simple second implementation: load all products, apply plain
predicates) instead of *storing* them. Then the recursion applies: that independent mechanism is itself a check
candidate, packed-tested in turn — it must be simple enough that its read-check is trivial, because it is the ground
every data proof above it stands on.

## How to run the protocol correctly

For every candidate check, before admitting it:

1. **Atomize** — one check proves one thing. If it asserts several things at once, split it first.
2. **Surface assumptions** — write down what the check takes for granted: data correctness, an oracle, a contract,
   a prior state, a helper that "obviously works".
3. **Decompose** — every assumption that is not itself a check in the blueprint becomes its own check. Then apply
   step 2 to *those* checks: prerequisites can themselves be packed (as the oracle's lists-of-expected-sets was).
4. **Order bottom-up** — dependencies before dependents, so any failure localizes to its own layer and can never be
   a broken dependency in disguise.

**Exit condition (binary):** every check's assumptions trace to an earlier check in the ordered list — or to nothing.
A check floating on unproven ground means the blueprint is incomplete, full stop.

**The telltale sign you're skipping it:** a check whose correctness requires a phrase like "assuming the data is…",
"given that X works…", or "we can compute the expected…". Every "assuming" is a packed point.
