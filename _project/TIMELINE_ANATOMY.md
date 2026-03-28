# Project Timeline Anatomy
## Systematic Deconstruction of Timeline Components

**Location:** `_project/`  
**Classification:** Core System Documentation  
**Date:** March 28, 2026

---

## Overview

This document deconstructs the project's timeline infrastructure into **10 verified, concrete components**. The timeline is not a Gantt chart—it is a finite state machine where work units flow through sequenced verification layers under rigid temporal constraints.

---

## Component 1: Sprint Types (5 Categories)

| Type | Duration | Purpose | DoD Focus |
|------|----------|---------|-----------|
| **Feature Sprint** | 1–3 days | Deliver new functionality | Implementation + Testing (Pass 2–3) |
| **Bug Fix Sprint** | Hours–1 day | Resolve critical issues | Root cause + Fix + Regression test |
| **Refactor Sprint** | 1–2 days | Improve code structure | Structural + zero behavior change |
| **Infrastructure Sprint** | Variable | Tooling, configuration | Setup + Documentation + Validation |
| **Polish Sprint** | Hours | Improve completed components | Visual refinement + Performance |

**Source:** `_handbook/04-sprints/lifecycle.md:1–56`

---

## Component 2: Scope Contract Structure

Every contract contains 5 mandatory sections:

### 2.1 Rationale
Why this scope exists and why it matters.

### 2.2 Explicit Scope
```markdown
**Scope:**
- [ ] Specific deliverable 1
- [ ] Specific deliverable 2
```

### 2.3 Files at Risk
```markdown
**Files at Risk:**
- `[path]` — What could go wrong
- `[path]` — What could go wrong
```

### 2.4 Regression Tests Required
```markdown
**Regression Tests Required:**
- [ ] Test for risk area A
  - **Verification:** `exact command`
  - **Code Location:** `[path]`
```

### 2.5 Definition of Done
```markdown
**Definition of Done:**
- [ ] Measurable criteria 1
- [ ] Measurable criteria 2
```

> **Key Principle:** DoDs must be binary—ticked or not, no gray area.

**Source:** `_handbook/04-sprints/lifecycle.md:131–178`

---

## Component 3: DoD Layer Sequencing (4 Passes)

Rigid layer order prevents rework:

| Pass | Name | Purpose |
|------|------|---------|
| **1** | Structure | Components exist (skeleton only, no styling) |
| **2** | Layout | Data flows, positioning, spacing, responsive behavior |
| **3** | Surface | Colors, typography (no interaction logic) |
| **4** | Interaction | Events, states, animations (final polish) |

**Pattern:**
```
DoD 1.1 → DoD 1.2 → ... → DoD 1.N
   ↓
DoD 2.1 → DoD 2.2 → ... → DoD 2.N
   ↓
...
```

> **Critical Discipline:** Do not proceed to Pass 2 until Pass 1 proves integration works.

**Source:** `_handbook/04-sprints/lifecycle.md:79–94`

---

## Component 4: Temporal Control Mechanisms

### 4.1 Appetite
- **Definition:** Time budget (NOT estimate), fixed before design
- **Format:** "6–8 hours" or "1 day"
- **Purpose:** Constrain solution design to fit available time

**Example:**
```markdown
APPETITE ALLOCATION:
- Total available: 1 day (of 6–7)
- This milestone appetite: 6–8 hours
- Hard deadline: End of Day 1
- Circuit breaker: If VFS blocks, hardcode mapping
```

### 4.2 Circuit Breaker
- **Trigger:** Scope contract exceeds appetite by 50%
- **Action:** Does NOT get more time—gets simplified or cut
- **Purpose:** Prevents single contracts from consuming entire milestones

**Example:**
```
Hour 1: Attempt VFS validation
Hour 1.5: Assessment
  → YES: Continue
  → NO: Execute circuit breaker → hardcode mapping
```

### 4.3 Scope Hammer
Execution order when time runs low:
1. Cut features entirely (remove whole contracts)
2. Simplify implementations (working over elegant)
3. Defer edge cases (80% case now, 20% later)
4. Hardcode over generalize

### 4.4 Kill List
Pre-written priority cuts for time pressure:
```markdown
KILL LIST (execute if time < 2 hours remaining):
1. Cut: Animation polish
2. Cut: Custom scrollbar styling
3. Cut: Fine-grained breakpoint tuning
4. CIRCUIT BREAKER: Cut mobile-specific layout
```

> **Rule:** Written when calm, executed when stressed.

**Source:** `_contexts/deliberate-practice/learning/cover-against-timeline-failure-curriculum.md:115–291`

---

## Component 5: Velocity Tracking System

### 5.1 Scope Contract Time Log

| Contract | Est. | Actual | Velocity | Notes |
|----------|------|--------|----------|-------|
| VFS Data Integrity | 1h | 1.5h | 0.67 | Build script issues |
| Slug Resolution | 1h | 0.5h | 2.0 | Already worked |
| **TOTAL** | **7h** | **6.25h** | **1.12** | **Under budget** |

### 5.2 Velocity Ratio Interpretation

| Ratio | Meaning | Action |
|-------|---------|--------|
| > 1.0 | Overestimated (conservative) | Safe |
| 0.7–1.0 | Normal variance | Normal |
| < 0.7 | Significantly underestimated | Revise estimates +50% |

### 5.3 Daily Safety Margin
```
Projected time at current velocity: 21 hours
Days remaining: 5
Hours available: ~40
SAFETY MARGIN: 19 hours (48%)
```

> **Emergency Protocol:** If safety margin drops below 10%:
> 1. Cut all SHOULD items
> 2. Cut one entire milestone
> 3. Re-evaluate circuit breakers

### 5.4 The 2-Hour Rule
If any scope contract has no commit in 2 hours, execute circuit breaker or ask for help.

**Source:** `_contexts/deliberate-practice/learning/cover-against-timeline-failure-curriculum.md:295–391`

---

## Component 6: Regression Defense (4 Layers)

### 6.1 Regression Pre-Flight
Before any scope contract:
```markdown
COMPONENTS AT RISK:
- [ ] Existing product pages
- [ ] Filter/sort functionality
- [ ] Navigation rendering

REGRESSION TESTS REQUIRED:
- [ ] Run: npm run build
- [ ] Run: npx playwright test smoke.spec.ts
```

### 6.2 Zero-Blast-Radius Discipline
- **Rule:** Scoped changes only—no global CSS modifications
- **Assessment:** Global approach (risk: all buttons) vs scoped approach (risk: one component)

### 6.3 The 5-File Rule
- **Trigger:** Scope contract touches >5 files
- **Action:** Stop and verify scope size or unintended changes

### 6.4 Post-Change Verification
- **Timing:** Immediately after scope contract
- **Rule:** No contract is "done" until regression tests pass

**Source:** `_contexts/deliberate-practice/learning/cover-against-timeline-failure-curriculum.md:395–478`

---

## Component 7: Timeline Threat Detection (6 Pillars)

### Pillar 1: Scope Fortification
| Threat | Trigger | Response |
|--------|---------|----------|
| "While I'm here" | Modifying files outside scope | STOP. Document in FUTURE_SPRINTS.md. Return. |
| One-off | Can't be reused in 3+ places | Defer to dedicated scope |
| Premature optimization | "This might be slow someday" | Don't optimize without measurement |

### Pillar 2: Verification Depth
**Tier 1 (Revenue-Critical):**
1. Product catalog → Product detail → Add to cart
2. Cart → Checkout → Payment → Order confirmation
3. Search → Results → Product detail
4. Navigation → Category → Filter → Sort → Product selection

**Tier 2 (UX-Critical):**
1. Homepage → Hero interaction → Featured product navigation
2. Mobile navigation drawer → Category selection
3. Account creation → Login → Order history
4. Basket management → Quantity update → Removal

### Pillar 3: Cross-Device Reality Matrix
| Tier | Devices | Policy |
|------|---------|--------|
| 1 (Must Support) | Chrome/Safari latest 2, iOS latest 2 | Launch blocker |
| 2 (Should Support) | Firefox, Chrome mobile, Samsung Internet | Fix if time permits |
| 3 (Best Effort) | Android 8+, iOS 12+ | Document and defer |

### Pillar 4: Design System Adherence
- [ ] No hardcoded colors (AST parsing)
- [ ] No arbitrary Tailwind values
- [ ] Typography uses type-* classes exclusively
- [ ] Spacing uses design tokens
- [ ] Hover/focus states defined

### Pillar 5: Critical Path Management
**Current Critical Path:**
```
VFS Data Integrity (COMPLETE)
→ Navigation Migration (COMPLETE)
→ Filter/Sort Legacy Cleanup (IN PROGRESS)
→ Product Page Critical Path Testing
→ Cross-Browser Verification
→ Launch
```

### Pillar 6: Daily Cover Check
```markdown
## Daily Timeline Defense Check

### Scope Threats
- [ ] Did I modify files outside today's scope?
- [ ] Did I fix anything "while I was there"?
- [ ] Did scope expand beyond sprint contract?

### Quality Threats
- [ ] Did I commit code without tests?
- [ ] Did I skip visual verification?

### Timeline Threats
- [ ] Did any task take >50% longer than estimated?
- [ ] Did I discover new blockers?
```

**Source:** `_project/laws of combat/cover/TIMELINE_COVERAGE_STRATEGY.md:36–378`

---

## Component 8: Physical Timeline Artifacts

| Artifact | Location | Purpose |
|----------|----------|---------|
| **Sprint Files** | `sprints/*.todo` + `_archive/*.todo` | Work unit definitions |
| **Master Tasklist** | `master-tasklist.todo` | Daily commitments + deadlines |
| **Daily Log** | `DAILY_LOG.md` | Timestamped progress |
| **Audit Reports** | `audits/*AUDIT*.md` | Grade-based assessments |
| **Handbook** | `_handbook/**/*.md` | Process documentation |
| **Curriculum** | `_contexts/deliberate-practice/**/*.md` | Skill building |

---

## Component 9: Sprint State Machine

```
Draft → Active → [Blocked/Paused] → Complete → Archived
                ↓
            Abandoned
```

| State | Meaning | Next Action |
|-------|---------|-------------|
| Draft | Created, not started | Refine scope, get approval |
| Active | In progress | Execute DoDs |
| Blocked | Cannot proceed | Identify blocker, escalate |
| Paused | Intentionally stopped | Document state, resume later |
| Complete | All DoDs done | Verify, close, archive |
| Abandoned | Will not complete | Document why, archive |

**Source:** `_handbook/04-sprints/lifecycle.md:118–127`

---

## Component 10: Kill Switch Protocol

### Kill Conditions (execute fallback when ANY occur)
1. Velocity drops below 0.5 for two consecutive contracts
2. Blockers exceed 2 hours without resolution
3. Regression count exceeds 3 in single contract
4. Time remaining < 20% with < 50% scope complete

### Pre-Written Fallbacks (required before starting)
```markdown
MILESTONE: Catalog → Products

PRIMARY APPROACH: Full VFS integration
FALLBACK APPROACH: Hardcoded category mapping
FALLBACK TRIGGER: VFS integration > 4 hours
FALLBACK QUALITY: Functional but manual updates required
```

> **Why pre-written:** Stress impairs judgment. Decision made when calm.

**Source:** `_contexts/deliberate-practice/learning/cover-against-timeline-failure-curriculum.md:657–699`

---

## Component Relationships

```
┌─────────────┐    ┌─────────────────┐    ┌────────────┐
│   Appetite  │───→│ Circuit Breaker │───→│  Kill List │
│Time Budget  │    │  (50% Overrun)   │    │(Priority   │
└─────────────┘    └─────────────────┘    │   Cuts)    │
                                            └─────┬──────┘
                                                  │
                           ┌──────────────────────┘
                           ↓
                    ┌───────────────┐
                    │  Kill Switch  │
                    │(Emergency Stop)│
                    └───────────────┘

┌────────────────┐    ┌─────────────┐    ┌────────────┐
│ Scope Contract │───→│ DoD Layers  │───→│ Regression │
│  (Work Unit)   │    │ (4 Passes)  │    │   Tests    │
└────────────────┘    └─────────────┘    └────────────┘

┌──────────────────┐    ┌──────────────┐    ┌───────────┐
│ Velocity Tracking│───→│  Daily Cover │───→│  Sprint   │
│    (Time Log)    │    │    Check     │    │   Audit   │
└──────────────────┘    └──────────────┘    └───────────┘
```

---

## Summary

The timeline transforms amorphous "project progress" into:

| Element | Implementation |
|---------|----------------|
| **Input** | Scope contracts (defined work units) |
| **Process** | Sequenced DoD layers with quality gating |
| **Constraints** | Appetite, circuit breakers, kill switches |
| **Feedback** | Velocity tracking, daily cover checks, audits |
| **Defense** | Regression containment, threat detection |
| **Output** | Completed, verified, archived sprints |

The timeline is a **finite state machine** with explicit transition conditions and defensive checkpoints at every phase.

---

*Document generated from systematic codebase research*  
*Verified against: `_handbook/`, `_project/`, `_contexts/`, audit reports*
