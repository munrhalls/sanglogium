# Audit: /Sprint vs /Implement vs /Test — Singular Focus Analysis

**Date:** 2026-04-01  
**Auditor:** Cascade AI  
**Target:** Eliminate overlap, clarify distinct responsibilities, streamline command protocol

---

## Current State Analysis

### Three Workflow Files

| Workflow | Lines | Purpose | Current Overlap |
|----------|-------|---------|-----------------|
| `/sprint.md` | 224 | Sprint planning with scope contracts + DoD sequencing | Contains /test integration, /build invocation, /learn post-script |
| `/implement.md` | 48 | Deterministic execution of rough scope | Pre-flight checklist, refined scope, verification — BUT no /test or /build integration |
| `/test.md` | 252 | Minimal sufficient evidence testing | 3-tier model, evidence dashboard — standalone but invoked by /sprint |

### Problem: Responsibility Ambiguity

**Overlap Issues Found:**

1. **Both /sprint and /implement handle scope refinement**
   - `/sprint`: "systematically research... prepare professionally informed sprint .todo file"
   - `/implement`: "Explicit Refined Scope... Translate the Rough Scope into strict technical target"

2. **Both claim execution responsibility**
   - `/sprint`: "Build Execution... invoke `/build [COMPONENT]`"
   - `/implement`: "PHASE 2: Execution Rules... Strictly execute"

3. **Three different pre-flight patterns**
   - `/sprint`: "PRE-SPRINT LESSONS RETRIEVAL"
   - `/implement`: "Pre-Flight Checklist (branch, baseline build)"
   - User removed this from `/debug` (per diff)

4. **Testing integrated in /sprint but not /implement**
   - `/sprint`: MANDATORY /TEST INTEGRATION STEP (100% UNSKIPPABLE)
   - `/implement`: "Verification Command" — no mention of /test protocol

---

## Singular Focus Delineation

### Proposed Clear Separation

```
┌─────────────────────────────────────────────────────────────┐
│  /SPRINT — Planning & Orchestration (Strategy)              │
│  ├─ Input: Target state, audit gaps                       │
│  ├─ Output: .todo file with scope contracts, DoDs         │
│  ├─ Triggers: /test (for baseline), /build (for contracts)│
│  └─ Scope: WHAT to build, WHEN to verify                  │
├─────────────────────────────────────────────────────────────┤
│  /IMPLEMENT — Atomic Execution (Tactics)                   │
│  ├─ Input: Single scope contract from sprint               │
│  ├─ Output: Implemented component/feature                 │
│  ├─ Triggers: /build per Pass/Layer, /test per DoD        │
│  └─ Scope: HOW to build ONE thing, step-by-step           │
├─────────────────────────────────────────────────────────────┤
│  /TEST — Evidence & Verification (Quality Gate)            │
│  ├─ Input: DoD items from sprint or implement             │
│  ├─ Output: Evidence dashboard, PASS/FAIL verdict        │
│  ├─ Triggered by: /sprint, /implement, standalone         │
│  └─ Scope: PROVE it works, mathematical certainty         │
└─────────────────────────────────────────────────────────────┘
```

### Decision Matrix: Which Command?

| Situation | Use | Why |
|-----------|-----|-----|
| Starting new feature work | `/sprint` | Needs planning, scope contracts, DoD sequencing |
| Executing single scope contract | `/implement` | Atomic execution, one component at a time |
| Writing tests for DoD | `/test` | Evidence generation, verification |
| Building UI component (Pass 3) | `/build` | Atomic Pass/Layer execution per core-building-pattern |
| Hotfix / small change | `/implement` | No planning needed, just execute |
| Debug session | `/debug` | Root cause analysis, component archaeology |

---

## Gap Analysis (G-XX)

| ID | Issue | Current | Target | Severity |
|----|-------|---------|--------|----------|
| G-01 | /sprint scope creep | 224 lines, includes /test, /build, /learn | 120 lines, delegates to sub-commands | High |
| G-02 | /implement lacks /test integration | Only "Verification Command" — generic | Explicit `/test` invocation per DoD | Critical |
| G-03 | Missing /build command definition | Referenced in /sprint and /implement, no workflow file | Create `/build.md` workflow | High |
| G-04 | /test standalone vs invoked | Not clear when to use standalone | Clarify: always invoked, never standalone | Medium |
| G-05 | Pre-flight inconsistency | Different checks in different workflows | Single pre-flight protocol | Medium |

---

## Singular Focus Update Required

### Update 1: Streamline /sprint to Planning Only

**Remove from /sprint:**
- Detailed /test integration steps (lines 38-145)
- /build invocation details (keep reference only)
- /learn post-script (move to universal rule)

**Keep in /sprint:**
- OODA loop (observe, orient, decide, act)
- Scope contract generation
- DoD sequencing (Pass 1/2/3, Layer 1-4)
- "Invoke /test for baseline" — but delegate to /test.md

### Update 2: Add /test Integration to /implement

**Add to /implement:**
```markdown
## PHASE 2: Execution with /Test Integration

### Per DoD Execution
1. Implement DoD item per Explicit Refined Scope
2. **Invoke `/test`** with:
   - DoD item as specification
   - Single test, single assertion
   - Max 5 seconds
3. **Blocking:** If /test fails, fix before next DoD
4. Proceed to next DoD only after /test evidence dashboard shows PASS

### Final Verification
- Invoke `/test` for full scope contract
- Generate evidence dashboard
- PAUSE for human visual verification
```

### Update 3: Create /build Workflow

**New file:** `.windsurf/workflows/build.md`

```markdown
# /Build Command Protocol

**Purpose:** Atomic Pass/Layer execution per core-building-pattern

## Input
- COMPONENT: Name from scope contract
- PASS: 1 (Skeleton), 2 (Data), or 3 (Build)
- LAYER: 1 (Structure), 2 (Layout), 3 (Surface), 4 (Interaction) — Pass 3 only
- BREAKPOINT: desktop (1280px) or mobile (375px) — Pass 3 only

## Execution
1. Read `@/_project/core-building-pattern.md`
2. Execute exactly one Pass/Layer combination
3. No mixing Passes, no skipping Layers

## Output
- Implemented code for that specific Pass/Layer
- Verification: `npm run build` passes
- Evidence: Ready for /test invocation
```

### Update 4: Unify Pre-Flight

**Remove from all workflows:**
- Individual pre-flight sections

**Reference universal rule:**
```markdown
**Pre-Flight:** Execute universal pre-flight checklist per `.windsurfrules`
- Branch check, baseline build, scope lock
```

---

## RWD Strategy (Workflow Scaling)

| Work Unit | Commands | Sequence |
|-----------|----------|----------|
| **Small (hotfix)** | `/implement` → `/test` | Atomic, no planning needed |
| **Medium (component)** | `/sprint` (1 contract) → `/implement` → `/test` | Plan → Execute → Verify |
| **Large (feature)** | `/sprint` (multiple contracts) → `/implement` (per contract) → `/test` (per DoD) → `/learn` | Full orchestration |
| **Emergency (debug)** | `/debug` | Root cause only, no planning |

---

## Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `sprint.md` | Removing /test details may break existing sprint flow | Verify /test.md has all required details |
| `implement.md` | Adding /test integration changes execution flow | Test with small scope first |
| New `build.md` | Missing file referenced everywhere | Create immediately |

---

## Verification Commands

```bash
# Test streamlined /sprint
# (Verify it generates .todo without executing tests itself)

# Test /implement with /test integration
# (Verify it blocks on test failure)

# Test /build workflow exists
ls .windsurf/workflows/build.md

# Verify no regressions in command references
grep -r "/sprint\|/implement\|/test\|/build" .windsurf/workflows/
```

---

## Recommended Action Priority

1. **Create `/build.md`** — Referenced everywhere but missing
2. **Streamline `/sprint.md`** — Remove execution details, keep planning
3. **Update `/implement.md`** — Add explicit /test integration
4. **Update `.windsurfrules`** — Add universal pre-flight reference

---

*Audit Complete*  
*Singular Focus: Each command does ONE thing — /sprint plans, /implement executes, /test verifies, /build constructs*
