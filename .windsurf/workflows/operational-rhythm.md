---
description: "SAFETY NET ONLY — Full 6-phase chain for stuck features (2+ failed attempts). Default mode: agent implements directly from beads issue."
---

# /operational-rhythm

## ⚠️ SAFETY NET ONLY — Do NOT use for normal work

**This workflow is a debugger, not a default.** Use it only when:
- A feature has 2+ failed attempts in its beads issue
- Root cause is unclear after multiple agent sessions
- Scope drift or analysis paralysis detected

**Default mode (90% of work):** Agent reads beads issue → implements → runs live check → updates issue. No heavy chain needed.

---

## When to Use This Workflow

Trigger: Beads issue notes show 2+ failed attempts. User or beads-orchestrator escalates to safety net.

Then and ONLY then:

```
Beads issue (stuck, 2+ failures)
    ↓
@/logging — capture trace, get evidence
    ↓
@/system-and-root-cause-analyzer — identify root cause
    ↓
@/beads-orchestrator — re-prioritize, output guidance
    ↓
Executive agent claims issue + runs @/frame-decompose INSIDE issue
    ↓
Implementation + live checks
    ↓
Feedback → update beads issue /frame-decompose
    ↓
Acceptance tests pass? → close issue
         ↓ no
    Back to @/system-and-root-cause-analyzer
```

**NOT the default path.** Default: agent reads issue, implements, checks, updates issue.

---

## Phase 1: Discovery

**Trigger:** Something is wrong or missing.
- Runtime error in browser
- Test failure
- Code review finding
- User report

**CRITICAL RULE — No pre-formed diagnoses:**
The user MUST report symptoms only, never theories. Wrong format: "Fix Server Component → Route Handler communication." Right format: "Cookie error at page.tsx:124 when loading /checkout/payment. Logs: [attach trace]."

If the user supplies a diagnosis ("the problem is X"), the agent MUST ignore it and analyze from evidence.

**Action:**
1. If checkout flow: run `@[/logging]` to capture trace
2. Gather evidence: logs, traces, curl output, screenshots
3. **Validate input quality:** Ask — did the user provide raw evidence (error message, trace ID, file:line) or a theoretical solution? If only theory, stop. Demand evidence.
4. Verify: Does the evidence support the user's theory? If not, discard the theory.

---

## Phase 2: Analysis

**Agent:** `@[/system-and-root-cause-analyzer]`

**Input:** Evidence from Phase 1
**Job:**
- Read spec (docs/ or beads issue)
- Read source (implementation)
- Read logs (runtime behavior)
- Compare all three
- Identify root-cause discrepancy

**Output:** Root-Cause Analysis report (6 sections, 1 page)

**Does NOT:** write code, fix bugs, create issues

---

## Phase 3: Orchestration

**Agent:** `@[/beads-orchestrator]`

**Input:** Root-cause report from Phase 2
**Job:**
- Create or update beads issue
- Set priority (P0/P1/P2)
- Recommend next issue to work on
- Output copy-pasteable guidance for dev agent

**Output:** Beads issue + dev agent guidance

**Does NOT:** write code, fix bugs, analyze logs

**Critical rule:** `@[/frame-decompose]` ALWAYS runs inside the beads issue, NEVER in docs/ during active work.

---

## Phase 4: Framing

**Agent:** `@[/frame-decompose]`

**Location:** INSIDE the active beads issue (notes/comments)
**Scope depends on issue type:**
- **Bug (docs/*.md exist as historical context):** Narrow — fix root cause only. Read docs/ for background only. Beads issue notes are the ONLY canonical spec during active work. Never modify docs/ during active work.
- **New feature (no docs/*.md):** Full — complete feature decomposition.

**CRITICAL:** The beads issue is the single source of truth. docs/ may contain stale specs. Always trust beads issue notes over docs/.

**Output:** Objective + tasks + acceptance tests, stored in beads issue

**Does NOT:** write code, create files

---

## Phase 5: Implementation

**Agent:** Executive / Dev Agent

**Input:** Beads issue with `/frame-decompose` output
**Job:**
- Implement the fix/feature
- Run live checks
- Update beads issue with progress
- If blocked: loop back to Phase 2 with new evidence

**Does NOT:** reframe in docs/, skip `/frame-decompose`

---

## Phase 6: Verification

**Trigger:** Implementation complete
**Action:**
- Run acceptance tests from beads issue `/frame-decompose`
- Run `@[/logging]` if checkout flow
- Verify against intended outcome

**Pass:** Close beads issue (`bd close <id>`)
**Fail:** Update beads issue with new evidence, loop to Phase 2

---

## Anti-Patterns

| Pattern | Why It Breaks |
|---------|---------------|
| One agent doing analysis + orchestration + implementation | Scope creep, noise, no clear hand-off |
| Creating new docs/ files for every bug | File proliferation, spec corruption |
| Skipping `/frame-decompose` because "it's just a small fix" | No acceptance criteria, no verification, scope drift |
| `/frame-decompose` output in docs/ during active work | Overwrites canonical specs, creates drift |
| Analyzer creating issues directly | No orchestrator review, priority may be wrong |
| **User pre-diagnosing in the prompt** | Agents implement wrong fix; confirmation bias; wasted attempts |
| One conversation touching multiple beads issues | Context loss, no tracking, work scattered across issues |
| Agent working without reading the beads issue first | Redoing work, missing context, wrong implementation |
| **Agent working on edge cases before happy path is complete** | Core flow broken, no foundation, wasted effort on unvalidated scenarios |
| **Separate issue for edge case of existing feature** | Violates "one feature = one issue = two paths"; scatters context; creates drift |
| **Creating edge case issues instead of adding to parent** | Tracker bloat, context loss, no single source of truth |

---

## Memory Reference

<!-- Orchestration chain details: bd85973e-60f8-43b6-8f54-0298fba3572a -->
