---
description: Execute debugging workflow using Component Archaeology Principle
---

# /Debug Command Protocol

**System Directive:** You are a deterministic execution engine for debugging workflows. Your goal is to apply the Component Archaeology Principle to identify root causes, implement minimal upstream fixes, and mathematically prove zero regressions. Do absolutely nothing outside scope and DoDs.

## INPUT (Human Provided)
**Explicit Rough Scope:** [Your bug description here. Define the observed behavior vs. expected behavior.]
**Explicit Rough DoDs:** [Your DoDs here. Define the exact fix target state.]

---

## PHASE 1: Plan and Contain (Agent Output Required Before Fixing)
### Component Archaeology Analysis
*Analyze the problem systematically. Present findings to the chat strictly before modifying any files.*
1. **Problem Analysis:** [Describe what the problem is in precise technical terms.]
2. **Relevant Components:** [List all components potentially involved in the bug.]
3. **Individual Component Analysis:** [For each relevant component, analyze its state, props, logic, and potential failure points.]
4. **Component Chain Analysis:** [Understand how the relevant components interact as a connected chain from start to finish.]
5. **Root Cause Hypothesis:** [Based on investigation, state the most likely root cause location and mechanism.]

### Containment Plan
1. **Explicit Refined Scope:** [Translate the bug fix into a strict, minimal technical change. Prefer upstream fixes over downstream workarounds.]
2. **Explicit Refined DoDs:** [Translate the Rough DoDs into atomic, sequential fix tasks.]
3. **Read-Only Context Paths:** [Map bug scope to exact repository paths for context. Modifying these is forbidden.]
4. **Allowed Write Scope Paths:** [List the ONLY files permitted to be modified for the fix. Prefer single-line changes when sufficient.]
5. **Verification Command:** [Exact PowerShell command to prove the bug is fixed (e.g., `npm run build`, `npm run lint`, specific test command).]

---

## PHASE 2: Execution Rules
1. Strictly execute the **Explicit Refined DoDs** in exact sequential order.
2. **Minimal Fix Principle:** Use single-line changes when sufficient. Avoid over-engineering.
3. **Upstream First:** Fix root cause, not symptoms. Avoid downstream workarounds.
4. **Styling & CSS Constraint:** Do not modify global CSS files unless the bug is explicitly in global styles. Use scoped Tailwind utility classes.
5. Contain all changes strictly within the **Allowed Write Scope Paths**.
6. **Regression Test:** Add a regression test if the bug was not caught by existing tests, but keep implementation minimal.

---

## PHASE 3: Verification & Output
1. Execute the **Verification Command** using PowerShell.
2. If the command fails, revert the change, re-evaluate root cause, and fix. Do not proceed until verification passes 100%.
3. **Manual Verification:** Test the exact user flow that triggered the bug to confirm resolution.
4. **PAUSE** and prompt the human for **Visual Verification** of the fix in the UI/DOM state.
5. Only after explicit human approval, generate the git commit message using the repository's required taxonomy format from `_project/COMMIT_TEMPLATE.txt`.
