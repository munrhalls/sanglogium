# /Implement Command Protocol for SWE 1.5

**System Directive:** You are a deterministic execution engine operating in Windsurf. Your goal is to translate rough human intent into an optimized workflow, execute it sequentially, and mathematically prove zero regressions. Do absolutely nothing outside scope and DoDs. Do not change any unrelated code in any way whatsoever. Do not improve anything outside the scope. Do not solve for any future architecture requirements or improvements. Purely and only, stay 100% within scope and ensure your work causes 0 regressions or unrelated change

## INPUT (Human Provided)
**Explicit Rough Scope:** [Your scope here. Be specific about what you want to accomplish.]
**Explicit Rough DoDs:** [Your DoDs here. Define the exact target state to be reached.]

---

## PHASE 0: Pre-Work — Beads Issue + Lessons Retrieval (MANDATORY)

Before ANY planning or coding:

1. **Read beads tracker** — Run `bd ready`, identify the feature's canonical issue
   - If issue exists: Read it completely (`bd show <id>`). Use existing framing.
   - If no issue exists: STOP. Create beads issue first via `@/add-beads-issue`.

2. **Query `_project/lessons/INDEX.md`** for relevant keywords:
   - Technology stack (e.g., "sanity", "nextjs", "groq")
   - Component patterns (e.g., "server-components", "data-fetching")
   - Domain concepts (e.g., "vfs", "catalogue", "filters")

3. **Load lessons by severity:**
   - Critical severity: MUST read before proceeding
   - High severity: MUST read before proceeding
   - Medium/Low: Read if time permits

4. **Apply prevention rules** as active constraints for this implementation

**Failure to retrieve lessons OR read beads issue = workflow violation.**

---

## PHASE 1: Plan and Contain (Agent Output Required Before Coding)

### Pre-Flight Checklist
*Execute before every sprint to prevent false correlation investigations*

1. **Branch Check:** Verify on correct branch (`git status`)
2. **Scope Lock:** Confirm no other sprint work in progress
3. **Resource Check:** Confirm no other agent is running `npm run build` or heavy CPU tasks (prevents resource starvation)

*Historical Evidence: `auto-lessons.md:79-126` — 15 min wasted on false correlation*

---

1. **Explicit Refined Scope:** [Translate the Rough Scope into a strict, optimized technical target state. Optimize the "how" but strictly adhere 100% to the "what".]
2. **Explicit Refined DoDs:** [Translate the Rough DoDs into atomic, sequential, mechanical tasks required to reach the Refined Scope.]
3. **Read-Only Context Paths:** [Map human scope to exact repository paths. List files required for context, including Sanity Studio schemas. Modifying these is forbidden.]
4. **Allowed Write Scope Paths:** [Map human scope to exact repository paths. List the ONLY files permitted to be modified. If exact paths cannot be confidently resolved from the Rough Scope, HALT and request paths from the user via terminal/chat.]
5. **Verification Command:** [Exact PowerShell command to run post-execution to mathematically prove 0 regressions. Prefer lightweight: `npx tsc --noEmit` or `npm run lint`. Save `npm run build` for CI or when no other agents are active.]

---

## PHASE 2: Execution with /Test Integration

### Per DoD Execution Sequence

**For EACH DoD item in Explicit Refined DoDs:**

1. **Execute DoD**
   - Implement the specific DoD item
   - If UI component: invoke `/build [COMPONENT] [PASS] [LAYER] [BREAKPOINT]` for atomic execution
   - Contain changes strictly within Allowed Write Scope Paths

2. **Run Live Check + Update Beads Issue (MANDATORY)**
   - Run the DoD item manually (live check, not just /test)
   - Capture evidence: logs, screenshots, curl output
   - **Update the beads issue** with result: `bd note <id> -- "Live check [N]: [PASS/FAIL] — [evidence]"`

   **Verdict Handling:**
   - ✅ **PASS:** Proceed to next DoD
   - ❌ **FAIL:** Fix implementation, re-run live check, update issue until PASS
   - **NO FORWARD PROGRESS** on live check failure

3. **Verification Gate**
   ```bash
   npx tsc --noEmit
   ```
   - Fast type-only check; catches most regressions without heavy build
   - If fails: revert, fix, re-verify
   - **Heavy build (`npm run build`) only when no concurrent agents to avoid lag**

4. **Proceed to Next DoD**
   - Only after live check PASS + typecheck PASS + beads issue updated

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

### Step 2: Lightweight Verification Gate
```bash
npx tsc --noEmit
```
- Fast type-only check; catches most regressions
- **Advisory:** Run `npm run build` manually when no other agents are active, or let CI catch build errors

### Step 3: Visual Verification
**PAUSE** and prompt human for visual approval of UI/DOM state.

### Step 4: Hand Off
Implementation complete. Do NOT commit or push from this workflow.
Git commit and push are handled by a separate `@/commit` agent in a dedicated conversation.

---

## Constraint Rules

- **NO** DoD without /test invocation
- **NO** progress on test failure
- **NO** file modifications outside Allowed Write Scope Paths
- **NO** global CSS changes
- **YES** atomic Pass/Layer via /build
- **YES** 1 test per DoD (mathematical 1:1)
- **YES** 100% specification pass rate for completion
