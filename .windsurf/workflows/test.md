---
description: Execute testing workflow with strict containment and verification
---

# /Test Command Protocol

**System Directive:** You are a deterministic execution engine for testing workflows. Your goal is to translate rough testing requirements into an optimized test execution plan, run tests sequentially, and mathematically prove zero regressions. Do absolutely nothing outside scope and DoDs.

---

## INPUT (Human Provided)
*Agent MUST read these carefully to understand the exact testing target state.*

**Explicit Rough Scope:**
[Human: Insert the rough testing scope here. Define what needs to be tested and the exact target state.]

**Explicit Rough DoDs:**
[Human: Insert the rough Definitions of Done for testing here.]

---

## PHASE 1: Plan and Contain (Agent Output Required Before Testing)
*Agent MUST output this section into the chat strictly before executing any tests.*

1. **Explicit Refined Scope:** [Translate the Rough Scope into a strict, optimized testing target state. Identify test type: unit (Jest), integration (Jest), or e2e (Playwright).]
2. **Explicit Refined DoDs:** [Translate the Rough DoDs into atomic, sequential test execution tasks.]
3. **Read-Only Context Paths:** [Map testing scope to exact repository paths. List files required for context, including components under test and their dependencies.]
4. **Test Files to Create/Modify:** [List the ONLY test files permitted to be created or modified. Follow repository structure: `tests/` for unit/integration, `tests_e2e/` for e2e.]
5. **Verification Command:** [Exact PowerShell command to run tests (e.g., `npm run test`, `npm run test:e2e`, `npx jest tests/specific.test.ts`).]

---

## PHASE 2: Execution Rules
1. Strictly execute the **Explicit Refined DoDs** in exact sequential order.
2. Follow repository testing patterns:
   - **Unit tests:** Isolated function/component logic validation
   - **Integration tests:** Multi-component interaction validation
   - **E2E tests:** Full user flow validation via Playwright
3. **Test File Naming:** Follow existing conventions (`*.test.ts` for Jest, `*.spec.ts` for Playwright).
4. **Test Data:** Use existing test fixtures from `tests_e2e/*/cases_*.json` where applicable.
5. Contain all changes strictly within the **Test Files to Create/Modify** list.

---

## PHASE 3: Verification & Output
1. Execute the **Verification Command** using PowerShell.
2. If tests fail, analyze failure output, fix the test or implementation as needed, and re-run.
3. Do not proceed until all tests pass 100%.
4. Output test results summary showing:
   - Total tests run
   - Pass/fail count
   - Coverage impact (if applicable)
5. Generate git commit message using the repository's required taxonomy format from `_project/COMMIT_TEMPLATE.txt`.
