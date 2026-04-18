---
description: Execute debugging workflow using Component Archaeology Principle
---

# /Debug Command Protocol

**System Directive:** You are a deterministic execution engine for debugging workflows. Your goal is to apply the Component Archaeology Principle to identify root causes, implement minimal upstream fixes, and mathematically prove zero regressions. Do absolutely nothing outside scope and DoDs.

## INPUT (Human Provided)
**Explicit Rough Scope:** // provided in chat //
**Explicit Rough DoDs:** // provided in chat //

---

## PHASE 1: Plan and Contain (Agent Output Required Before Fixing)
### Component Archaeology Analysis
*Analyze the problem systematically. Present findings to the chat strictly before modifying any files.*
1. **Problem Analysis:** [Describe what the problem is in precise technical terms.]
2. **Relevant Components:** [List all components potentially involved in the bug.]
3. **Individual Component Analysis:** [For each relevant component, analyze its state, props, logic, and potential failure points.]
4. **Component Chain Analysis:** [Understand how the relevant components interact as a connected chain from start to finish.]

### Data Verification Gate (MANDATORY)
*Before hypothesizing, observe actual runtime data. Build passing ≠ bug fixed.*
- **Method:** Add `console.log()` at data injection point or render data JSON temporarily to DOM
- **Verify:** What does the actual API/database response contain?
- **Verify:** Is the data structure what you assume it is?
- **Rule:** No root cause hypothesis until actual data is observed

5. **Root Cause Hypothesis:** [Based on **verified** data, state the most likely root cause location and mechanism.]

### Containment Plan
1. **Explicit Refined Scope:** [Translate the bug fix into a strict, minimal technical change. Prefer upstream fixes over downstream workarounds.]
2. **Explicit Refined DoDs:** [Translate the Rough DoDs into atomic, sequential fix tasks.]
3. **Read-Only Context Paths:** [Map bug scope to exact repository paths for context. Modifying these is forbidden.]
4. **Allowed Write Scope Paths:** [List the ONLY files permitted to be modified for the fix. Prefer single-line changes when sufficient.]
5. **Verification Command:** [Exact PowerShell command to prove the bug is fixed (e.g., `npm run build`, `npm run lint`, specific test command).]

---

## PHASE 2: Execution Rules
1. Strictly execute the **Explicit Refined DoDs** in exact sequential order.
2. **Cover and Move:** Each step must verify ground is set for the next step before proceeding. Never hand back work until the chain is verified.
3. **Simple Principle:** Keep everything simplest possible. Single-line fixes when sufficient. Minimal abstractions. If >5 min to explain, too complex.
4. **Minimal Fix Principle:** Use single-line changes when sufficient. Avoid over-engineering.
5. **Upstream First:** Fix root cause, not symptoms. Avoid downstream workarounds.
6. **Styling & CSS Constraint:** Do not modify global CSS files unless the bug is explicitly in global styles. Use scoped Tailwind utility classes.
7. Contain all changes strictly within the **Allowed Write Scope Paths**.
8. **Regression Test:** Add a regression test if the bug was not caught by existing tests, but keep implementation minimal.

---

## PHASE 3: Verification & Output
1. Execute the **Verification Command** using PowerShell.
2. If the command fails, revert the change, re-evaluate root cause, and fix. Do not proceed until verification passes 100%.
3. **Manual Verification:** Test the exact user flow that triggered the bug to confirm resolution.
4. **PAUSE** and prompt the human for **Visual Verification** of the fix in the UI/DOM state.
5. Only after explicit human approval, generate the git commit message using the repository's required taxonomy format from `_project/COMMIT_TEMPLATE.txt`.
