---
description: Execute Red-Green-Refactor cycle for a single vertical slice with frozen context and mechanical per-test stepping
---

# /rgr-step — Mechanical RGR Orchestrator

**Purpose:** Eliminate per-test overhead by freezing slice context once, then mechanically stepping through execution specs without re-gathering intelligence.

**Input:**
- `--slice`: Slice name from Vertical Slice Plan (e.g., "Slice 3: BasketButton")
- `--path`: Feature documentation path (e.g., "docs/basket/non-local-basket")
- `--type`: Test type (unit/integration/e2e, default: integration)

**Output:** Component/page implemented with all tests in slice passing.

---

## Execution Steps

### Step 1: Freeze Context (ONCE per slice — do NOT repeat)

Call `/context` with the appropriate parameters:
```
/context --type=[type] --focus=[component name from slice] --path=[path]
```

**After /context returns:** You now have ALL the context needed for this slice. Do NOT re-read Technical Solution Design, PRD, or HTML Structure for the remainder of this workflow unless explicitly told to.

---

### Step 2: Locate Execution Specs

Find the execution spec file for this slice in `[path]/__tests__/[type]/`:
- Use Glob to find `*.spec.tsx` or `*.test.tsx` files
- Match by slice number or component name in filename

If not found, ask: "Execution specs not found for slice [slice]. Where are the specs?"

---

### Step 3: Create RGR Todo (if not exists)

Read the spec file and extract all `it()` blocks. Create a todo list:
```markdown
# RGR Todo: [slice]

- [ ] [test 1 description]
- [ ] [test 2 description]
- [ ] ...
```

Save to `[path]/implementation/RGR-[slice-slug].todo` if not exists.

---

### Step 4: Mechanical RGR Loop

For EACH unchecked test in the todo, execute exactly this sequence:

#### 4.1 — Pick Next Test
Select the first unchecked test from the todo.

#### 4.2 — RED Phase (MANDATORY — never skip)
1. Read ONLY the current test implementation from the spec file
2. Run the test: `npx vitest run [spec-file-path]` (or appropriate test runner)
3. **Confirm test FAILS.** If it passes unexpectedly, HALT and report: "Test passes without implementation — possible false positive."

#### 4.3 — GREEN Phase
**Context constraint:** Use ONLY the frozen context from Step 1 + the failing test. Do NOT re-read PRD, Technical Solution Design, or HTML Structure.

1. Identify what component/function needs to exist for this test to pass
2. Write MINIMAL code to make this ONE test pass
3. If UI component: apply relevant segments from `/core-building-pattern` (Pass/Layer/Breakpoint as appropriate)
4. Run the test again: confirm it PASSES

#### 4.4 — Refactor Phase (10 seconds max)
1. Look at the code you just wrote
2. Ask: "Is this the simplest possible way?"
3. If yes: move on
4. If no: refactor, re-run test, confirm still passes

#### 4.5 — Checkpoint
1. Mark test done in todo
2. Run ALL tests in the slice so far: confirm no regressions
3. Proceed to next unchecked test

---

### Step 5: Slice Completion

When ALL tests in the todo are checked:
1. Run full slice test suite
2. Confirm 100% pass
3. Report: "Slice [slice] complete. [N] tests passing."

---

## Constraints

- **NO re-gathering context after Step 1.** The frozen context is sufficient.
- **NO reading PRD/Design docs during GREEN phase.** Only the failing test + frozen context.
- **NO implementing multiple tests ahead.** One test at a time.
- **NO skipping RED phase.** Every test must fail first.
- **NO refactoring beyond 10 seconds unless tests fail.** Speed over perfection during GREEN.
- **YES running the full slice suite after each test.** Catch regressions immediately.
- **YES asking human if ambiguous.** Better to pause than guess.

---

## Example Usage

**Command:**
```
/rgr-step --slice="Slice 3: BasketButton" --path=docs/basket/non-local-basket --type=integration
```

**Execution:**
1. Calls `/context --type=integration --focus=BasketButton --path=docs/basket/non-local-basket`
2. Finds `basketButton.spec.tsx` in `docs/basket/non-local-basket/__tests__/integration/`
3. Creates `RGR-slice-3-basketbutton.todo` if needed
4. Runs test 1 → fails → implements minimal code → passes → checks todo
5. Runs test 2 → fails → implements minimal addition → passes → checks todo
6. Runs test 3 → fails → implements minimal addition → passes → checks todo
7. Reports slice complete

---

## Integration Map

| Phase | Uses | Why |
|-------|------|-----|
| Context freeze | `/context` workflow | Selective, <2000 tokens |
| Build discipline | `/core-building-pattern` | UI components need Pass/Layer sequencing |
| RGR discipline | `/rgr-core-building-pattern` | Reference for manual verification |
| Test conventions | `tests/AGENTS.md` | Auto-injected test conventions per directory |

---

## Why This Works

**Before /rgr-step:**
- Per-test overhead: gather intelligence (2 min) + plan (1 min) + scan gaps (2 min) = **5 min per test**
- 8 tests × 5 min = **40 min overhead** for a slice

**After /rgr-step:**
- Context freeze: 1 min (once)
- Per-test overhead: run test + implement + verify = **1-2 min per test**
- 8 tests × 1.5 min = **12 min total** for a slice
- **Net savings: ~70% of RGR time**

---

**Last Updated:** 2026-05-05
