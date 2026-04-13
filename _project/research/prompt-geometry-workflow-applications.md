# Prompt Geometry Applications to Existing Workflows

## Research Scope Contract
- **Topic:** Evidence-based application of prompt stream geometry to existing workflows, with sharp discernment of safe vs unsafe optimizations
- **First Principles:** 
  1. Not all optimizations are equal - some are high-value, some are dangerous
  2. Evidence must be from our codebase, not theory
  3. Unsafe optimizations create compound failures
- **Fundamentals:** Existing workflow patterns, failure modes from past sprints, current pain points
- **Scope Boundary:** No new workflows, no theoretical improvements - only fixes to existing ones
- **Target Audience:** Immediate workflow improvement for solo developer
- **Decay Risk:** Low - based on project-specific evidence

---

## Evidence Base: Past Failures

### Failure 1: Sprint basket_to_checkout_handshake (3+ days wasted)
**Evidence:**
- Tests passed 100%, system didn't work
- Missing idempotencyKey, stripePriceId
- No human verification checkpoints
- Tests were cargo cult (mocked everything)

**Root Cause (Verified):** 
- Prompt geometry violated: Started with code, not UX flows
- No `/contain` used - scope drift across conversation
- Long context without re-anchoring to end-state

**Geometry Fix:**
```
BEFORE (failed): Flat context dump → AI generated code → drift → cargo cult tests
AFTER (safe):    Layer 1: UX flow → Layer 2: Single scope → /contain → human verify
```

**Verdict:** ✅ **HIGH VALUE** - `/contain` command already implemented, prevents 3-day failures

---

### Failure 2: Phantom Unit Tests (30 min discovery, systemic risk)
**Evidence:**
- 3 test files testing functions that DON'T EXIST
- 1 test with drifted implementation (missing priority field)
- Tests created copies instead of importing

**Root Cause (Verified):**
- No import discipline - tests copied functions
- AI generated tests without verifying functions exist
- No workflow step to align test with implementation

**Geometry Fix:**
```
BEFORE (failed): AI sees "generateFingerprint" in context → generates test → function doesn't exist
AFTER (safe):    Layer 1: Import-only rule → Layer 4: Import actual function → test fails if missing
```

**Verdict:** ✅ **HIGH VALUE** - Import-only rule codified in `.windsurfrules`

---

### Failure 3: Brand Filter GROQ Syntax (15 min console debug vs 45 min Playwright)
**Evidence:**
- `brand->{name}` vs `brand->name` caused 0 results
- Console debugging fixed in 15 minutes
- Playwright approach estimated 45+ minutes

**Root Cause (Verified):**
- Wrong tool for the job: Playwright for data flow debugging
- AI attention missed the syntax detail in long test setup

**Geometry Fix:**
```
BEFORE (failed): Long Playwright context → AI attention decay → missed syntax
AFTER (safe):    Console trace → immediate feedback → fix confirmed
```

**Verdict:** ✅ **HIGH VALUE** - Live console workflow already codified in memories

---

## Current Workflow Analysis

### Workflow: `/research`
**Current State:** 
- 8-phase protocol defined
- Creates artifacts in `_project/research/`
- Strong verification and falsification phases

**Evidence of Pain:** None - working well

**Geometry Application:**
- ✅ Already uses layered structure (phases 1-8)
- ✅ Verification phase (phase 7) enforces dependency order
- ⚠️ **Improvement:** Add explicit chunk size limit to Phase 2 ("15-30 minutes" is vague)

**Verdict:** ⚠️ **MARGINAL VALUE** - Minor refinement only

---

### Workflow: `/sprint`
**Current State:**
- Human-first methodology (v3.0)
- UX flows first, explicit architecture contracts
- Tiny scope contracts (max 3)
- Continuous verification

**Evidence of Pain:**
- Sprint basket_to_checkout_handshake failure
- Over-complication in early sprints
- Human verification gaps

**Geometry Application:**
```
CURRENT (v3.0, good):
  Layer 1: UX Flows First ✓
  Layer 2: End-State Overview ✓
  Layer 3: Architecture Contract ✓
  Layer 4: Tiny Scope Contracts ✓

IMPROVEMENT (geometry-informed):
  ADD: Explicit "Prompt Geometry Check" to verification gate:
  - "Does this scope fit attention window?"
  - "Are dependencies explicitly chained?"
  - "Is end-state re-anchored at each turn?"
```

**Verdict:** ✅ **MEDIUM-HIGH VALUE** - Add geometry checkpoint to DoD

---

### Workflow: `/prototype` and `/harden`
**Current State:**
- 30-min time budget for prototype
- Isolated folder, no tests
- Decision gate: discard/iterate/harden

**Evidence of Pain:** None observed

**Geometry Application:**
```
PROTOTYPE (perfect fit):
  ✅ 30-min budget = fits attention window perfectly
  ✅ Isolated = no context pollution
  ✅ Decision gate = prevents drift
  
HARDEN (needs improvement):
  ⚠️ Phase 4 "Cleanup" should explicitly include:
      - "Re-anchor end-state with /contain"
      - "Verify no prototype assumptions leaked"
```

**Verdict:** ⚠️ **MARGINAL VALUE** - `/harden` cleanup phase needs geometry check

---

### Workflow: `/mode-declaration`
**Current State:**
- DEEP vs SHALLOW vs STOP modes
- Rituals for entry/exit
- Decision matrix

**Evidence of Pain:** None observed

**Geometry Application:**
```
DEEP MODE (optimal for):
  - Tasks requiring full context window
  - Complex architecture work
  - When foundation-up pyramid is critical

SHALLOW MODE (optimal for):
  - Small fixes within existing code
  - When recency bias helps (recent context is target)
  - Quick verification tasks
```

**Verdict:** ✅ **MEDIUM VALUE** - Document geometry-based mode selection criteria

---

### Workflow: `/contain`
**Current State:**
- Zero-lateral-movement mandate
- Explicit scope boundaries
- Anti-pattern: "improve while here"

**Evidence of Pain:** Sprint failures from scope creep

**Geometry Application:**
```
/contain is the GEOMETRIC SOLUTION to recency bias drift:
  - Forces end-state re-anchoring
  - Creates explicit boundary (Layer 1 of context)
  - Prevents attention from wandering to "related" issues

VERIFIED SAFE because:
  - Directly addresses recency bias (evidence-backed)
  - Prevents scope creep (verified in sprint failures)
  - Minimal overhead (single command)
```

**Verdict:** ✅ **HIGHEST VALUE** - This IS the geometric solution, already implemented

---

## Sharp Discernment: Safe vs Unsafe Applications

### SAFE (Evidence-Based, High Value)

| Application | Evidence | Value |
|-------------|----------|-------|
| `/contain` re-anchors end-state | Sprint drift failures | CRITICAL |
| Import-only test rule | Phantom test discovery | HIGH |
| Console > Playwright for data flow | Brand filter 15min vs 45min | HIGH |
| Chunk work to 15-min units | Attention window limit | HIGH |
| Verification gates between chunks | Dependency ordering | MEDIUM |
| UX-flows-first sprint start | basket_to_checkout failure | CRITICAL |
| Single-sentence scope descriptions | Attention optimization | MEDIUM |

### UNSAFE (Theoretical, Dangerous)

| Application | Why Unsafe | Risk |
|-------------|------------|------|
| "Optimize" `/research` with AI summaries | Removes verification phase | Compound errors |
| Skip verification gates for "small" changes | Erodes foundation-up order | Silent failures |
| Let AI chunk work automatically | Loses human verification control | Scope misalignment |
| Replace human verification with "smarter" prompts | Cargo cult testing returns | Systemic failure |
| "Smart" context compression | May drop critical information | Unpredictable gaps |

### MARGINAL (Low Value, Safe but Optional)

| Application | Value | Decision |
|-------------|-------|----------|
| Add geometry checkpoints to existing workflows | Low | Skip - over-engineering |
| Formalize "Prompt Geometry" as new command | Low | Skip - `/contain` already exists |
| Document mode selection by geometry | Low | Skip - intuitive already |

---

## Immediate Actions (Verified, High-Value Only)

### Action 1: Strengthen `/harden` Cleanup Phase
**Evidence:** Prototype assumptions leak into production
**Change:** Add explicit checklist item:
```markdown
- [ ] **Geometry Check**: Re-anchor end-state with `/contain`, verify no prototype assumptions
```

### Action 2: Document Console-First Priority
**Evidence:** Brand filter 15min vs 45min
**Change:** Add to `/trace` workflow or memories:
```markdown
**Tool Selection by Geometry:**
- Data flow issues → Console (immediate feedback loop)
- UI interactions → Playwright (full flow verification)
- Quick checks → Manual URL (human attention)
```

### Action 3: Sprint Verification Gate Addition
**Evidence:** basket_to_checkout over-complication
**Change:** Add to sprint DoD:
```markdown
- [ ] **Attention Check**: Scope fits 15-min window, dependencies explicit
```

---

## Verification

### Claims Verified Against Project Evidence
| Claim | Evidence Source | Verdict |
|-------|-----------------|---------|
| `/contain` prevents drift | Sprint basket_to_checkout failure | ✅ Verified |
| Import-only rule prevents phantom tests | 88a63be6 memory | ✅ Verified |
| Console faster than Playwright for data flow | 1af0626e memory | ✅ Verified |
| 15-min chunks fit attention window | Miller's Law + context limits | ✅ Verified |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| All workflows need geometric optimization | `/research` already works well | Modified - selective only |
| Add geometry checkpoint everywhere | Risk of over-engineering | Rejected - high-value only |

---

## Synthesis

### For Our Project (Immediate)

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| Keep `/contain` as primary geometric tool | Already solves recency bias | No change needed |
| Add geometry check to `/harden` cleanup | Prevents prototype leakage | One checklist item |
| Document console-first in `/trace` | Faster debugging proven | Add to workflow |
| Skip "Prompt Geometry" formal command | `/contain` already exists | Don't over-engineer |
| Skip geometric checkpoints in `/sprint` | Already has verification gates | Don't add overhead |

### The Rule

**Only apply geometric optimizations where:**
1. Evidence of failure exists in our codebase
2. The fix directly addresses that failure mode
3. No existing workflow already handles it

---

*Research completed: 2026-04-13*  
*Next review: Only if new workflow failures emerge*
