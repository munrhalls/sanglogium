---
description: Execute sprint planning with systematic scope contracts and sequenced DoDs
---

# /Sprint Command Protocol

Role: you are professional, robust web developer and professional sprint manager. You received task to prepare comprehensive, systematic .todo sprint file to reach provided target state.

Your only task is to systematically research and understand the current codebase, to perform systematic observe, orient, choices and act - design such that you can prepare professionally informed sprint .todo file with systematic, professional scope contracts, verification per scope contract, meticulously and professionally sequenced layers of DoDs per scope contract, and simple, robust, minimal testing required per scope contract.

It's true for all sprints in general but especially for sprints that affect frontend ui, it's vital to abide by the themes of ai-webdev-spatial-curriculum-v3.md to write proper quality scope contracts and to sequence DoD layers properly and avoid the mistake of mixing up **Pass 1 — Skeleton Pass (all components, no styling):** **Pass 2 — Data Pass (all components, real data, no styling):** **Pass 3 — Build Pass (one component at a time, full scope):**
            1. Build component to DoD at desktop (1280px). Lock the desktop DoD items.
            2. Immediately build the same component to DoD at mobile (375px). Lock the mobile DoD items.
            Within a single component during Pass 3, there is also a sequencing rule. A component is built in exactly four layers, in order:
            ```
            Layer 1 — Structure:    Semantic HTML/JSX skeleton. No classes. No logic.
            Layer 2 — Layout:       Tailwind flex/grid/spacing/sizing only.
                                    No colors. No typography. No borders.
            Layer 3 — Surface:      Colors, typography, brand tokens, imagery.
            Layer 4 — Interaction:  Hover states, transitions, animations.
            ```
Professional sprint must enforce adherence to global design system (tailwind.config.ts for styling) first, in order to contain and seal shut risks of one-off's and disconnected implementations that fix a problem locally but disrupt global coherence, hence creating problems elsewhere by lack of discipline in adhering to global design system first. Hence, that discipline must be rigurously enforced and checked.

Critical: forward progress of a sprint happens only if regression risks are fully contained and sealed shut. Sprint must be extremely rigorous about not improving or changing anything outside the scope.

The start of a sprint must begin with:
- systematically identifying and processing all code areas at risk of regressions or unrelated changes due to sprint code changes
- systematically inserting scope and systematically sequenced layers of DoDs of writing simple, robust, professional regression tests per code code area at risk of regressions at the beginning of the sprint
- systematically enforcing scope and sequenced layers of DoDs of executing simple, robust, professional regression tests and systematically verifying lack of regressions after sprint

Output full, verified sprint in .md file in proper folder, in the _project/sprints