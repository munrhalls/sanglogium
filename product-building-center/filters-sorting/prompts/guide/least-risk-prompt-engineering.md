# Least-risk prompt engineering — mandatory shape for any prompt batch in this folder

Applies to anyone (human or agent) authoring a new `N_actor-name.md` prompt batch. Four rules. No exceptions without a stated reason.

## 1. Orientation prompt comes first, always

The first prompt in every batch must make the executing agent read, before writing any code:
- The relevant chapter(s) of `../../north-star-story.md` for the actor(s) this batch touches.
- That actor's own `srp-tracer-bullets-building-guide.md` — specifically the bullets this batch covers.
- That actor's `build-status.md` (source of truth over the guide's file map — a fresh session must never assume progress from the plan alone).

Require a short comprehension-check reply (what's the actor's one job, what's the deletion test, confirm the lean-execution rule below) before any code. This exists to stop an agent from solving a bullet "locally correctly" in a way that quietly breaks the actor-boundary contract or the overall URL-driven UX goal — a fix that looks right in isolation but violates system coherence is the single most expensive failure mode here, and it's cheap to prevent with a five-minute read.

## 2. One tracer bullet per prompt, hard stop after each

Every bullet gets its own prompt, in this shape, no merging two bullets into one pass even if it looks faster:
1. Build ONLY this bullet. Name its exact files.
2. Report (one paragraph): files touched, confirm nothing outside scope changed, confirm no cross-actor import.
3. Stop. Do not proceed to the next bullet. Wait for explicit human yes/no.
4. Only after a yes: run the deletion test (remove this bullet's files, confirm nothing else breaks, restore), report, stop again.

"The code looks right to me" is never a substitute for the human's literal yes. Skipping ahead because the next bullet "obviously follows" is exactly the failure this rule exists to block.

## 3. Lean execution guardrails, stated explicitly in every build prompt

Every single build prompt (not just the batch header) must say, plainly:
- Do not run tsc, lint, build, or test suites.
- Do not restart the dev server.
- The only verification is a human glance at the running page — or, when no human is present, a direct fetch/DOM/network check against the already-running dev server (never a rebuild) with the concrete evidence shown in the report.
- Exception, and only this one: bullet(s) that are real functional/race-condition logic (debounce, cancellation, data mutation) get an actual smoke test in a live browser tab against the running server — still no tsc/lint/build/test suite, just a real interaction instead of a glance. Say explicitly in the prompt when a bullet qualifies for this exception; default assumption is glance-only.

Any command that costs real minutes and can't change the outcome of a five-second look is fat, not diligence — cutting it is the entire point of tracer-bullet building.

## 4. SRP boundaries enforced explicitly, not left implicit

Every build prompt must state, in the prompt itself:
- The exact file(s) in scope for this bullet — nothing else may be touched.
- The exact, narrow wiring point allowed in any shared file (e.g. "the one 240px grid line in page.tsx," "one `<Component />` line") — never "wire it in" left open-ended.
- What must never be imported (the other actor's files, product-grid code from filters code or vice versa).
- The report must explicitly confirm scope was held, not just describe what was built — silence on scope is not confirmation.

## Why this order of priority

Orientation-first prevents wrong-direction work (the most expensive kind — a correctly-built bullet that shouldn't have been built that way). One-bullet-per-prompt with a hard stop prevents chained mistakes compounding before anyone looks. Lean guardrails prevent burning real time on checks that can't catch anything a glance wouldn't. Explicit SRP scope prevents the slow, hard-to-detect failure mode this whole discipline exists to avoid: a leaked dependency that only surfaces later, when pulling one block out breaks another.
