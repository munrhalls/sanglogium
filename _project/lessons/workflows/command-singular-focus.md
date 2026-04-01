# /learn: Workflow Singular Focus

## Phase 1: Raw Learning Capture

**Work Unit:** Command workflow singularization — /sprint, /implement, /test, /build
**Date:** 2026-04-01
**Duration:** ~40 minutes

---

### What Was the Error/Surprise?

**Original Problem:** Workflow responsibility ambiguity — /sprint.md was 224 lines trying to do everything (planning + execution + testing). /implement.md was only 48 lines with generic "Verification Command" — no /test integration. /test.md was 252 lines but standalone. /build.md existed but wasn't referenced consistently.

**Overlap Issues Found:**
1. Both /sprint and /implement claimed scope refinement responsibility
2. Both claimed execution responsibility (/sprint had "Build Execution", /implement had "Execution Rules")
3. /sprint had detailed /test integration (87 lines) but /implement had none
4. No clear delegation chain

**Surprise:** The "infinite loop" Playwright bug earlier was actually a symptom of this ambiguity — no clear command owned process cleanup, so zombie processes accumulated.

---

### Root Cause

**Architectural Debt:** Commands evolved organically without clear responsibility boundaries.

- /sprint started as planning but accumulated execution details
- /implement was minimal but lacked test integration
- /test was comprehensive but standalone
- No delegation protocol defined

**Secondary Cause:** Pre-flight checks were duplicated/inconsistent across workflows (user actually removed them from /debug.md per the diff I saw earlier).

---

### Time Bottlenecks

- **Investigation:** 15 min reading all 4 workflow files to understand overlap
- **Friction:** Diff deciding what to move where — /sprint had 87 lines of /test details that needed extraction
- **Wait time:** None — user provided immediate "execute with strict discipline" directive

**Efficiency Gain:** After this fix, next similar work will take 5 min (clear delegation pattern established).

---

### Prompt Quality

**Strength:** User directive "execute with strict discipline and scope" was unambiguous — immediate action.

**Weakness:** No explicit /learn trigger — had to remember to codify after execution.

**Missing:** Could have been clearer on whether to CREATE /build.md or assume it existed (it existed).

---

### Test Coverage Gap

**What should have caught this:** No test for "workflow consistency" — but that's meta. Real gap: the Playwright resource exhaustion was a symptom of no clear process ownership.

**Fix Applied:** Singular focus — each command does ONE thing:
- /sprint: planning + orchestration (delegates execution)
- /implement: atomic execution (invokes /test per DoD)
- /build: Pass/Layer construction
- /test: verification (always invoked, never standalone)

---

### Fix Applied

1. **Verified** /build.md existed (181 lines, complete)
2. **Streamlined** /sprint.md — removed 87 lines of /test execution details, replaced with delegation language
3. **Updated** /implement.md — added PHASE 2 "Execution with /Test Integration", mandatory /test per DoD, blocking rules
4. **Updated** .windsurfrules — added "Pre-Flight" universal prevention rule

**Lines Changed:**
- /sprint.md: 224 → 221 lines (removed verbose /test details, added delegation map)
- /implement.md: 48 → 136 lines (added /test integration)
- .windsurfrules: +1 rule

---

## Phase 2: Thematic Organization

**Primary Theme:** workflows — Command protocol improvements

**Secondary Themes:** None — this is purely workflow architecture

**Rationale:** The lesson is about command design patterns (singular focus, delegation chains), not about code patterns or failures.

---

## Phase 3: Codification

### Target Infrastructure

| Target | Content | Status |
|--------|---------|--------|
| `_project/lessons/workflows/command-singular-focus.md` | Full lesson | Will create |
| `.windsurfrules` | "Pre-Flight" rule | ✅ Already added |
| `INDEX.md` | Keywords: workflow, command, delegation | Will add |

### Lesson Entry

**Title:** Command Singular Focus — Delegation Pattern for Workflow Clarity

**Severity:** High
**Frequency:** Recurring — applies to all future command design

---

## Phase 4: Integration Verification

**Checklist:**
- [ ] Lesson file created in `workflows/` theme
- [ ] Keywords added to INDEX.md
- [ ] Next /sprint execution will use streamlined delegation pattern
- [ ] Next /implement execution will have /test integration

---

**Compound Effect:** Future command modifications will follow singular focus pattern — no more responsibility ambiguity.
