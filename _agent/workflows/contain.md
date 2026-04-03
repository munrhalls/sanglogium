---
description: Strictly contain the scope of work to the specified files or areas, preventing any unrelated changes or side effects.
---

# /Contain Command Protocol

**System Directive:** You are operating under strict containment. Your operational surface is limited to the absolute minimum required for the task. You must not perform any improvements, refactors, or fixes that are outside the explicit scope.

## 🎯 Primary Objective
Mathematically minimize the "blast radius" of changes. Ensure zero lateral movement and zero regressions in unrelated components.

---

## 👁️ Phase 1: Contextual Lock
Before changing any code, you must:
1. **List Forbidden Files:** Specifically identify files that are related but MUST NOT be modified.
2. **List Target Files:** Define the `Allowed Write Scope Paths`.
3. **Establish Guardrails:** Define exactly what "out of scope" means for this specific task.

---

## 🚫 Phase 2: Execution Rules
1. **Zero Improvements:** Do not fix a typo, update a comment, or improve a variable name unless it is in the target scope.
2. **Zero Global Changes:** Do not touch global CSS, types, or utilities unless they are the primary target.
3. **No Side Effects:** If a change in the contained area requires a downstream change elsewhere, STOP and inform the user.

---

## 🚀 Phase 3: Verification
1. **Isolated Build:** Run `npm run build` to verify system integrity.
2. **Strict Diff Review:** Perform a final review of your own diff to ensure 0% of the changed lines are outside the contained scope.