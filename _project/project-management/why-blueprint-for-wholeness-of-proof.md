# Why — the reasoning behind blueprint-for-wholeness-of-proof-instructions.md

Work 1 instrument — read for understanding during the silent mapping; nothing
from this file is transcribed into the blueprint artifact.

This file holds the motivations under each rule in the instructions document. The instructions say *what* to do;
this file says *why it exists*. Read it before editing the instructions — every rule in that document is a scar from
a real failure, and deleting a rule you don't understand reintroduces the failure it was built to prevent.

## Why this document exists at all

Professional wholeness cannot be proven against a moving target. "The feature is good" is not checkable — it means
something different every time it's examined, and it drifts during execution. The only trustworthy definition of
done is a fixed list where every item is verifiable by a human *without trusting the author*. The instructions exist
to produce exactly that list, per feature, and nothing else.

## Why binary

Any item that can be "mostly true" can't be a completion criterion — it reintroduces the judgment the list exists
to remove. True or false, observable, no interpretation. If a proposed check can't be stated that way, it isn't a
check yet.

## Why mechanical

Whoever owns sign-off must be able to verify every item themselves, cheaply — a documented recipe and a stated
expected result. If running a check requires knowing the codebase, verification quietly reverts to trusting the
implementer, and the list stops being a contract.

## Why read-before-run

A script whose PASS cannot be audited is worse than no script: it manufactures confidence that may be false. The
read stage exists because the most dangerous failure in the whole system is a *false positive* — a check that
declares success while the behavior is broken. If a human can't see in one read what the check proves and how,
there is no way to distinguish a real proof from a convincing-looking one. Run second, and the output must name
what it proved, so the run visibly delivers what the read promised.

## Why fail-first (the Gate)

A proof that passes before the thing it proves exists is a false positive *by definition*. Running every check once
pre-implementation — expecting each to fail, on its behavior assertion — is the cheapest possible verification that
the checks actually test behavior and not their own harness.

## Why packed-proof discipline

Checks rest on ground. When ground is assumed rather than proven, the check proves nothing — this is how "compare
against the expected set" shipped as a plan while nobody had defined where expected sets come from. Both concrete
failures this rule was built from are in the appendix
(`_project/project-management/packed-proof-points.md`). The rule — atomize, surface assumptions, decompose
recursively, order bottom-up — exists so detection doesn't depend on someone's intuition catching it.

## Why damage-ranked areas for live checks

Live checks are the most expensive instrument and the least automatable, so their coverage must be chosen
deliberately. Frequency-ranking requires guessing user behavior; damage-ranking doesn't — it derives from what a
failure corrupts (state/URL > wrong data > dead UI > cosmetic). Ordering areas bottom-up by dependency makes a
failure point at its real layer instead of smearing across a broken dependency.

## Why event space, not user journeys

A "journey" is one happy-path story. Users emit *event streams* — arbitrary actions, arbitrary order, arbitrary
repetition. The proof obligation is containment: whatever the user emits, they land in a handled state. Framing it
as events × states × (once vs. repeated) is what makes "every possibility" enumerable instead of aspirational.

## The honesty mechanisms are not decorations

- **Abort rule** — an AI forced to guess an expected result or a boundary must stop and report. Invented judgment
  inside a blueprint defeats the document's entire purpose: fixing "should be" in advance.
- **The honest caveat** — "0 leaks" cannot be proven; unknown unknowns exist. It is a target audited toward
  procedurally, never a certified claim. Stating this openly is what keeps the rest of the claims trustworthy.

## What this document is not

Not a test plan. Not a feature spec. Not a QA checklist. It is the contract layer between human intent and
executors (human or AI): it defines "done" so that done is a fact, not an opinion.
