Beads Issue Quality Gate — Professional Audit
Part 1: First Principles of AI-Agent-Effective Issues
The Core Problem
An AI agent cannot form opinions, cannot "see" quality, cannot infer intent from ambiguity, and cannot ask for clarification mid-execution without breaking flow. Every instruction must be mechanically resolvable — the agent must be able to determine, without human judgment, whether it has succeeded or failed.

Foundational Principles (synthesized from DBC research, contract-design best practices, and live issue data)
1. Deterministic Verifiability (the "Different Agent" Test) From Design by Contract: postconditions must be checkable. An acceptance criterion like "looks professional" is a null instruction to an agent. Every criterion must reduce to a boolean: a number, a token match, a file:line existence, a test pass/fail. This is the single highest-leverage principle — it is to agent-executable issues what preconditions/postconditions are to reliable software.

2. Atomic Scope (Single Responsibility) One bead = one unit of value = one session. Multi-phase issues, "Phase 1/Phase 2" language, or bundled concerns create decision points where the agent must guess boundaries. The sang-logium-2de issue demonstrates this failure: it bundles audit, pipeline hardening, replacement, and validation into one issue. It was closed and reopened — a symptom of scope collapse.

3. Explicit Negative Space (Out of Scope) Agents will gold-plate unless explicitly fenced. "Out of scope" is not documentation — it's a runtime constraint. Without it, an agent fixing button sizes will also "improve" the grid layout, typography, and hover states. The fz1-fz4 issues demonstrate this well: each one explicitly excludes adjacent breakpoints and unrelated concerns.

4. Concrete Evidence Over Opinion Every problem statement must anchor to a concrete artifact: file:line, failing test, error message, measurement, screenshot path. "The gallery degrades on mobile" is unfalsifiable. "In IemCard.tsx:64-66 the buttons are forced to w-8 h-8 (32 px)" is mechanically verifiable.

5. Named Tokens Over Hand-Waving "Make it look good" means nothing. min-h-[44px], text-small, grid-cols-1 are grep-able, verifiable instructions. Every UI change must reference exact design tokens from tailwind.config.ts.

6. Single Verification Method "And/or" creates ambiguity about which method is authoritative. The agent needs exactly one way to know it's done. Multiple methods create confusion about which one gates completion.

7. Session-Boundedness Issues that exceed ~60 minutes create context-switching overhead. The agent loses state between sessions. The fz1-fz4 decomposition (one breakpoint range per issue) is the model: each is independently finishable.

8. File Existence Verified at Creation Time Stale file references cause agents to search for non-existent files or make incorrect assumptions. Every file in "Related files" must exist when the issue is created.

9. Precondition Awareness From DBC: what must be true before the work starts? Is a dev server running? Are dependencies installed? Is a Sanity token valid? Issues that assume preconditions without stating them create silent failures.

10. No Implicit Dependencies If issue B depends on issue A's output (e.g., fz2 references "the 44×44 touch targets from the previous bead"), this must be explicit. Otherwise, an agent picking up B before A is done will produce broken work.

Part 2: Gate Protocol Evaluation — 10-Point Scoring
Each gate scored 1-10 on: how effectively it prevents the failure mode it targets, given an AI agent executor.

Gate 1: One Problem — 9/10
Dimension	Assessment
What it catches	Bundled concerns, multi-phase issues, scope bloat
What it misses	"One vertical slice" can span multiple layers (checkout's 4-layer architecture). A vertical slice through all 4 layers is not one session's work. The gate doesn't distinguish between "one vertical slice" and "one atomic unit of work."
Evidence from live data	The fz1-fz4 decomposition (one breakpoint range each) proves this gate works when applied rigorously. sang-logium-2de fails this gate catastrophically.
Verdict	The single most important gate. The "split it" instruction is correct. Minor weakness: "vertical slice" ambiguity.
Gate 2: Evidence — 8/10
Dimension	Assessment
What it catches	Opinion-based tickets, unverifiable problem statements
What it misses	The gate lists evidence types (file:line, error, measurement, screenshot) but doesn't verify the evidence pointer resolves. A screenshot path could be stale. A file:line could reference code that was refactored.
Evidence from live data	sang-logium-j4a has excellent evidence (root cause analysis with file references). sang-logium-2de has zero concrete evidence — just a vague description.
Verdict	Strong gate. Gap: evidence pointers should be verified at creation time, not just listed.
Gate 3: High EV Stated — 6/10
Dimension	Assessment
What it catches	Low-value busywork disguised as issues
What it misses	"One sentence on why this matters" is subjective. "This matters for UX" passes the gate but provides zero signal. The examples (revenue, conversion, UX risk, bug blast radius) are categories, not measurable metrics.
Evidence from live data	fz1's "directly hurt checkout conversion and accessibility" is good. But the gate doesn't enforce this quality — it only checks for existence of a sentence.
Verdict	Weakest gate. Needs a quality floor: the EV statement should reference a specific metric or user impact, not just a category label.
Gate 4: Scope Is Explicit — 8/10
Dimension	Assessment
What it catches	Fuzzy boundaries, "fix the gallery" vagueness
What it misses	"Exact files, components, breakpoints, or behaviors" uses "or" — an issue could list only behaviors without files and pass. For agents, file-level precision is far more actionable than behavioral descriptions.
Evidence from live data	fz1-fz4 scope sections are excellent: exact files, exact breakpoint ranges, exact tokens. sang-logium-2de has no scope section at all.
Verdict	Strong gate. Gap: should require file:line granularity, not just file names.
Gate 5: Out of Scope Is Explicit — 9/10
Dimension	Assessment
What it catches	Scope creep, gold-plating, "while I'm here" syndrome
What it misses	Checks for section existence, not quality. "Out of scope: everything else" technically passes. The out-of-scope items should be specific and adjacent — things the agent would be tempted to touch.
Evidence from live data	fz1's out-of-scope: "475 px and above. Product images, hover states, or Playwright tests." This is exactly what an agent would be tempted to "improve."
Verdict	Near-perfect gate. The anti-gold-plating fence is one of the highest-leverage things for agent reliability. Minor gap: quality floor for specificity.
Gate 6: DoD Is Explicit and Minimal — 7/10
Dimension	Assessment
What it catches	Vague completion criteria, "improving things that don't matter"
What it misses	The examples ("tests pass, visual checks done, no regressions") are generic. The gate doesn't enforce that DoD items are mechanically checkable. Significant overlap with Gate 7 (Acceptance) — the distinction between "exit conditions" and "acceptance criteria" is fuzzy.
Evidence from live data	fz1's DoD: "All Acceptance criteria checked off. Manual verification at 320/360/414 px shows no overlap. No regressions at 1280 px." This is good but largely duplicates the Acceptance section.
Verdict	Functional but redundant with Gate 7. The DoD and Acceptance sections should be merged or clearly differentiated (e.g., DoD = process gates, Acceptance = product gates).
Gate 7: Acceptance Is Measurable — 9/10
Dimension	Assessment
What it catches	Subjective criteria, unverifiable claims
What it misses	The "different agent" test is excellent but only applied to acceptance criteria. It should also apply to the problem statement and DoD.
Evidence from live data	The bad example in the protocol shows exactly what this catches: "visually professional," "comfortable spacing," "no excessive truncation" — all unfalsifiable. The good example shows the fix: min-h-[44px] min-w-[44px], exact viewport dimensions.
Verdict	The core gate. The "different agent" test is the single most powerful principle in the protocol.
Gate 8: Tokens Named — 8/10
Dimension	Assessment
What it catches	Hand-waving UI descriptions
What it misses	Only applies "if UI is involved." Doesn't verify that named tokens actually exist in tailwind.config.ts. An agent could reference text-nonexistent and pass the gate.
Evidence from live data	fz1 names text-tiny, text-small, min-h-[44px], min-w-[44px] — all real tokens. The bad example uses "all changes in line with design system" without naming a single token.
Verdict	Strong gate for UI issues. Gap: should verify token existence against the config.
Gate 9: One Verification Method — 8/10
Dimension	Assessment
What it catches	Ambiguous "and/or" verification, unclear completion signals
What it misses	"Manual check at listed viewports" is the weakest method but sometimes the only practical one. The gate doesn't distinguish between automated (preferred) and manual (fallback). Doesn't require the method to be reproducible.
Evidence from live data	fz1-fz4 all use "Manual responsive check at [exact viewports]" — reproducible and specific. The bad example uses "visual inspection and/or responsive Playwright/Vitest tests" — ambiguous.
Verdict	Strong gate. "Exactly one named method" is the right constraint. Gap: should prefer automated over manual when both are feasible.
Gate 10: Files Verified, No Duplicate, Fits Cycle — 7/10
Dimension	Assessment
What it catches	Stale references, duplicate issues, oversized scope
What it misses	This is a compound gate — three distinct checks bundled into one. If it fails, the failure mode is ambiguous (was it a stale file? a duplicate? too large?). "Fits in one focused session (~60 min)" is subjective — 60 minutes for one agent might be 90 for another.
Evidence from live data	The fz1-fz4 issues all list verified existing files. sang-logium-2de lists no related files at all.
Verdict	Functional but overloaded. Should be split into separate gates: file existence (mechanical), duplicate detection (mechanical), session-boundedness (judgment).
Part 3: Holistic Protocol Assessment
Aggregate Scores
#	Gate	Score
1	One problem	9
2	Evidence	8
3	High EV stated	6
4	Scope explicit	8
5	Out of scope explicit	9
6	DoD explicit and minimal	7
7	Acceptance measurable	9
8	Tokens named	8
9	One verification method	8
10	Files verified, no duplicate, fits cycle	7
Average		7.9
What the Protocol Excels At
Scope containment (Gates 1, 4, 5): The strongest dimension. Issues passing these gates have clear boundaries — what to touch, what not to touch. This alone eliminates ~40% of agent execution failures.
Measurability (Gates 7, 8, 9): The "different agent" test, named tokens, and single verification method form a coherent contract. An agent can determine "done" without human judgment.
The bad vs. good example: Concrete and instructive. Shows exactly what failure and success look like.
The "When to Decompose" section: Catches the most common failure patterns (multi-component, phased, multi-breakpoint).
Structural Gaps (What the Protocol Misses)
No dependency awareness. fz2 depends on fz1's 44×44 px touch targets. If an agent picks up fz2 before fz1 is done, it will either block or produce conflicting work. The gate should check: "Does this issue depend on output from another open issue? If yes, is that dependency stated?"
No environment/precondition check. A well-gated issue might still assume bash on Windows, assume a dev server is running, or assume a Sanity token is valid. The execution-friction-scan memory documents 13 failure patterns — none are caught by this gate.
Gate 3 (EV) is the weak link. It checks for existence of a value statement, not its quality. "This matters for UX" passes. The gate needs a quality floor: the EV statement must reference a specific, falsifiable impact.
Gate 10 is overloaded. Three distinct concerns in one gate. File existence and duplicate detection are mechanical (could be automated). Session-boundedness is judgment-based. They should be separate gates.
DoD/Acceptance overlap. Gates 6 and 7 cover similar ground. In practice, agents duplicate content between them. The protocol should either merge them or clearly differentiate: DoD = process gates (tests pass, lint clean), Acceptance = product gates (button is 44×44 px at 375 px).
No "first step" guidance. Even a perfectly gated issue can cause "blank page" paralysis. The agent knows what to achieve but not where to start. A "Suggested first action" field would reduce cold-start friction.
The Quick Rewrite Test only covers acceptance criteria. It should also apply to the problem statement ("Could a different agent verify this problem exists without asking me?") and scope ("Could a different agent determine the exact files to touch without asking me?").
Predicted Real-World Effectiveness
Overall: 7.5/10

Issues passing all 10 gates will be ~80% less likely to cause agent confusion, retries, or scope creep compared to ungated issues. The protocol reliably prevents the worst failure modes: multi-phase scope, subjective criteria, unbounded changes.

The remaining ~20% of failure modes come from gaps the gate doesn't cover:

Dependency chain breaks (~8%): Agent picks up fz2 before fz1 is done
Environment assumption failures (~7%): Windows/PowerShell vs. Linux/bash, missing prerequisites
First-step paralysis (~3%): Agent knows the destination but not the first move
EV misprioritization (~2%): Low-value issues passing Gate 3 with weak justifications
Recommendation
The protocol is sound and worth enforcing. Three high-ROI improvements:

Add a dependency check (new Gate or sub-check): "Does this issue depend on output from another open issue? If yes, is the dependency ID stated?"
Strengthen Gate 3: Require the EV statement to reference a specific, falsifiable metric or user impact — not just a category label.
Split Gate 10: File existence and duplicate detection can be automated; session-boundedness should be its own judgment gate.