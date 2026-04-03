---
description: Execute implementation following the SWE 1.5 Protocol - Phase 0 to 3
---

# /Implement Command Protocol for SWE 1.5


**System Directive:** You are a deterministic execution engine operating in Windsurf. Your goal is to translate rough human intent into an optimized workflow, execute it sequentially, and mathematically prove zero regressions. Do absolutely nothing outside scope and DoDs. Do not change any unrelated code in any way whatsoever. Do not improve anything outside the scope. Do not solve for any future architecture requirements or improvements. Purely and only, stay 100% within scope and ensure your work causes 0 regressions or unrelated change

## INPUT (Human Provided)
**Explicit Rough Scope:** [Your scope here. Be specific about what you want to accomplish.]
**Explicit Rough DoDs:** [Your DoDs here. Define the exact target state to be reached.]

---

## PHASE 0: Pre-Work Lessons Retrieval (MANDATORY)

Before ANY planning or coding, query `_project/lessons/INDEX.md` for relevant keywords:

1. **Extract keywords** from Rough Scope:
   - Technology stack (e.g., "sanity", "nextjs", "groq")
   - Component patterns (e.g., "server-components", "data-fetching")
   - Domain concepts (e.g., "vfs", "catalogue", "filters")

2. **Query INDEX.md** for matching keywords

3. **Load lessons by severity:**
   - Critical severity: MUST read before proceeding
   - High severity: MUST read before proceeding
   - Medium/Low: Read if time permits

4. **Apply prevention rules** as active constraints for this implementation

**Failure to retrieve lessons = workflow violation.**

---

## PHASE 1: Plan and Contain (Agent Output Required Before Coding)

### Pre-Flight Checklist
*Execute before every sprint to prevent false correlation investigations*

1. **Branch Check:** Verify on correct branch (`git status`)
2. **Baseline Build:** Run `npm run build` and document result
   - If build fails: Document pre-existing failures before sprint work
   - If build passes: Proceed with confidence
3. **Scope Lock:** Confirm no other sprint work in progress

*Historical Evidence: `auto-lessons.md:79-126` — 15 min wasted on false correlation*

---

1. **Explicit Refined Scope:** [Translate the Rough Scope into a strict, optimized technical target state. Optimize the "how" but strictly adhere 100% to the "what".]
2. **Explicit Refined DoDs:** [Translate the Rough DoDs into atomic, sequential, mechanical tasks required to reach the Refined Scope.]
3. **Read-Only Context Paths:** [Map human scope to exact repository paths. List files required for context, including Sanity Studio schemas. Modifying these is forbidden.]
4. **Allowed Write Scope Paths:** [Map human scope to exact repository paths. List the ONLY files permitted to be modified. If exact paths cannot be confidently resolved from the Rough Scope, HALT and request paths from the user via terminal/chat.]
5. **Verification Command:** [Exact PowerShell command to run post-execution to mathematically prove 0 regressions (e.g., `npm run build`, `npm run lint`).]

---

## PHASE 2: Execution with /Test Integration

### Per DoD Execution Sequence

**For EACH DoD item in Explicit Refined DoDs:**

1. **Execute DoD**
   - Implement the specific DoD item
   - If UI component: invoke `/build [COMPONENT] [PASS] [LAYER] [BREAKPOINT]` for atomic execution
   - Contain changes strictly within Allowed Write Scope Paths

2. **Invoke /test (MANDATORY — 100% BLOCKING)**
   ```
   INVOKE: /test with:
   - DoD item as specification
   - Single test, single assertion
   - Max 5 seconds runtime

   OUTPUT: Evidence dashboard from /test
   ```

   **Verdict Handling:**
   - ✅ **PASS:** Proceed to next DoD
   - ❌ **FAIL:** Fix implementation, re-run /test until PASS
   - **NO FORWARD PROGRESS** on test failure

3. **Verification Gate**
   ```bash
   npm run build
   ```
   - Must pass 100%
   - If fails: revert, fix, re-verify

4. **Proceed to Next DoD**
   - Only after /test PASS + build PASS

---

### Execution Rules

1. Strictly execute DoDs in exact sequential order.
2. **MANDATORY /test per DoD** — No exceptions.
3. Contain changes strictly within Allowed Write Scope Paths.
4. **Styling Constraint:** No global CSS. Scoped Tailwind only.
5. **UI Components:** Use `/build` for Pass/Layer atomicity.

---

## PHASE 3: Final Verification & Output

### Step 1: Full /test Suite
```
INVOKE: /test for complete scope
OUTPUT: Final evidence dashboard
BLOCKING: 100% specification pass rate required
```

### Step 2: Build Gate
```bash
npm run build
```
**Blocking:** Must pass 100%

### Step 3: Visual Verification
**PAUSE** and prompt human for visual approval of UI/DOM state.

### Step 4: Commit
Generate commit message per `_project/COMMIT_TEMPLATE.txt`.

---

## Constraint Rules

- **NO** DoD without /test invocation
- **NO** progress on test failure
- **NO** file modifications outside Allowed Write Scope Paths
- **NO** global CSS changes
- **YES** atomic Pass/Layer via /build
- **YES** 1 test per DoD (mathematical 1:1)
- **YES** 100% specification pass rate for completion
