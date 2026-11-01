---
paths:
  - "features/checkout/**"
  - "tests/checkout/**"
---

# Checkout system: four themes (binding on all checkout work)

Goal: a checkout system that is conclusively proven for security and end-to-end function across happy paths, edge cases and failure handling, at the highest possible total simplicity.

1. **Should-be beats is.** What the checkout should be has absolute precedence over what exists. Existing code, docs and past decisions are evidence, never authority.

2. **Proof tells the truth, separate from the build.** Proof always comes before the implementation and is a separate piece of work. A proof is built to report the truth with zero flakiness, never built to pass. A proof that can be flaky is not a proof.

3. **Build order step context.** Every piece of work is one build order step. That step is upstream of everything downstream. Whatever already exists downstream is subject to change and is mostly irrelevant to the current step. Downstream follows later, in its own step.

4. **Question everything.** Ask of every point: why is it necessary, by physics or first-principles logic? A point that is not forced (a mere recommendation, a habit, a past choice) is deleted, because an unnecessary thing spawns more unnecessary things and the complexity grows without end. So: no scope creep, and nothing downstream of the current step enters its scope.

## Executor block (the architect copies this verbatim at the top of every checkout task file)

Do exactly what this task says and add nothing. If the task leaves a choice open or contradicts itself, stop and report it; never decide it. A proof is built to tell the truth, not to pass: report its result as it is, and never change a proof to make it pass.
