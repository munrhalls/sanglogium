# Project Timeline Anatomy: Deconstructed Components
## Sang-Logium: Verified Breakdown of Timeline Infrastructure

**Document Type:** Systematic Research Output  
**Date:** March 28, 2026  
**Source:** Comprehensive codebase audit and analysis

---

## Executive Summary

This document deconstructs the amorphous concept of "project timeline" into concrete, verifiable component parts. The timeline here is not a Gantt chart or calendar—it is a finite state machine where work units flow through sequenced verification layers under rigid time constraints.

---

## Component 1: Sprint Types (5 Categories)

| Type | Duration | Purpose | DoD Focus |
|------|----------|---------|-----------|
| **Feature Sprint** | 1-3 days | Deliver new functionality | Implementation + Testing (Pass 2-3) |
| **Bug Fix Sprint** | Hours to 1 day | Resolve critical issues | Root cause + Fix + Regression test |
| **Refactor Sprint** | 1-2 days | Improve code structure | Structural + zero behavior change |
| **Infrastructure Sprint** | Variable | Tooling, configuration | Setup + Documentation + Validation |
| **Polish Sprint** | Hours | Improve completed components | Visual refinement + Performance |

**Location in Codebase:** `c:\webdev\sang-logium\_handbook\04-sprints\lifecycle.md:1-56`

---

## Component 2: Scope Contract Structure

Every scope contract contains 5 mandatory sections:

### 2.1 Rationale
- Why this scope exists
- Why it matters to the project

### 2.2 Explicit Scope
```markdown
**Scope:**
- [ ] Specific deliverable 1
- [ ] Specific deliverable 2
```

### 2.3 Files at Risk
```markdown
**Files at Risk:**
- `[path/to/file]` - What could go wrong
- `[path/to/file]` - What could go wrong
```

### 2.4 Regression Tests Required
```markdown
**Regression Tests Required:**
- [ ] Test for risk area A
  - **Verification:** [exact command]
  - **Code Location:** `[path]`
```

### 2.5 Definition of Done
```markdown
**Definition of Done:**
- [ ] Measurable criteria 1
- [ ] Measurable criteria 2
```

**Key Principle:** DoDs must be binary—ticked or not, no gray area.

**Location in Codebase:** `c:\webdev\sang-logium\_handbook\04-sprints\lifecycle.md:131-178`

---

## Component 3: DoD Layer Sequencing (4 Passes)

Rigid layer order preventing rework and confusion:

| Pass | Name | Purpose | Constraints |
|------|------|---------|-------------|
| **1** | Structure | Components exist | No styling, skeleton only |
| **2** | Layout | Data flows, positioning | Spacing, responsive behavior |
| **3** | Surface | Colors, typography | No interaction logic |
| **4** | Interaction | Events, states | Final polish |

**Pattern:**
```
DoD 1.1 → DoD 1.2 → ... → DoD 1.N
   ↓
DoD 2.1 → DoD 2.2 → ... → DoD 2.N
   ↓
...
```

**Critical Discipline:** Do not proceed to Pass 2 until Pass 1 proves integration works.

**Location in Codebase:** `c:\webdev\sang-logium\_handbook\04-sprints\lifecycle.md:79-94`

---

## Component 4: Temporal Control Mechanisms

### 4.1 Appetite
- **Definition:** Time budget (NOT estimate)
- **Fixed:** Before any design work begins
- **Format:** "6-8 hours" or "1 day"
- **Purpose:** Constrain solution design to fit available time

**Example from Master Tasklist:**
```
APPETITE ALLOCATION:
- Total available: 1 day (of 6-7)
- This milestone appetite: 6-8 hours
- Hard deadline: End of Day 1
- Circuit breaker: If VFS issues block progress, hardcode category mapping
```

### 4.2 Circuit Breaker Rule
- **Trigger:** Scope contract exceeds appetite by 50%
- **Action:** Does NOT get more time—gets simplified or cut
- **Purpose:** Prevents single scope contracts from consuming entire milestones

**Example:**
```
SCOPE CONTRACT: VFS Data Integrity
APPETITE: 1 hour
CIRCUIT BREAKER: At 1.5 hours, abandon VFS and hardcode mapping

EXECUTION:
Hour 1: Attempt VFS validation
Hour 1.5: Assessment — Is VFS working?
  → YES: Continue to next scope contract
  → NO: Execute circuit breaker → hardcode mapping
```

### 4.3 Scope Hammer
- **Definition:** Discipline of cutting scope when time runs low
- **Execution Order:**
  1. Cut features entirely (remove whole contracts, not parts)
  2. Simplify implementations (working over elegant)
  3. Defer edge cases (80% case now, 20% later)
  4. Hardcode over generalize

### 4.4 Kill List
- **Definition:** Pre-written priority cuts for time pressure
- **Rule:** Written when calm, executed when stressed
- **Format:** Ordered list from least to most critical to cut

**Example:**
```
KILL LIST (execute in order if time < 2 hours remaining):
1. Cut: Animation polish (hover transitions)
2. Cut: Custom scrollbar styling
3. Cut: Fine-grained breakpoint tuning
4. Cut: Skeleton loading states
5. CIRCUIT BREAKER: If still behind, cut mobile-specific layout
```

**Location in Codebase:** `c:\webdev\sang-logium\_contexts\deliberate-practice\learning\cover-against-timeline-failure-curriculum.md:115-291`

---

## Component 5: Velocity Tracking System

### 5.1 Scope Contract Time Log
Track actual vs estimated per contract:

```markdown
| Contract | Est. | Actual | Velocity | Notes |
|----------|------|--------|----------|-------|
| VFS Data Integrity | 1h | 1.5h | 0.67 | Build script issues |
| Slug Resolution | 1h | 0.5h | 2.0 | Already worked |
| **TOTAL** | **7h** | **6.25h** | **1.12** | **Under budget** |
```

### 5.2 Velocity Ratio Interpretation
| Ratio | Meaning | Action |
|-------|---------|--------|
| > 1.0 | Overestimated (conservative) | Safe |
| 0.7-1.0 | Normal variance | Normal |
| < 0.7 | Significantly underestimated | Danger—revise estimates +50% |

### 5.3 Daily Safety Margin Calculation
```
Projected time at current velocity: 21 hours
Days remaining: 5
Hours available: ~40
SAFETY MARGIN: 19 hours (48%)
```

**Emergency Protocol:** If safety margin drops below 10%:
1. Cut all SHOULD items from remaining milestones
2. Cut one entire milestone (lowest priority)
3. Re-evaluate circuit breakers for stricter thresholds

### 5.4 Git Commit Velocity Indicators

**Healthy Pattern:**
```
14:00 - [test] Add VFS data integrity tests
14:45 - [test] Verify slug resolution
15:30 - [feat] Implement descendant key unrolling
16:15 - [test] Validate GROQ query execution
17:00 - [feat] Wire category page to VFS query
```

**Unhealthy Pattern:**
```
14:00 - [wip] Start VFS integration
16:00 - [wip] Debugging VFS issues
18:00 - [wip] Still debugging, found another bug
20:00 - [wip] Trying different approach
```

**The 2-Hour Rule:** If any scope contract has no commit in 2 hours, execute circuit breaker or ask for help.

**Location in Codebase:** `c:\webdev\sang-logium\_contexts\deliberate-practice\learning\cover-against-timeline-failure-curriculum.md:295-391`

---

## Component 6: Regression Defense (4 Layers)

### 6.1 Regression Pre-Flight
Before any scope contract, identify what could break:

```markdown
SCOPE CONTRACT: VFS GROQ Integration
REGRESSION PRE-FLIGHT:

COMPONENTS AT RISK:
- [ ] Existing product pages (non-VFS)
- [ ] Filter/sort functionality
- [ ] Navigation rendering
- [ ] "All Products" page

REGRESSION TESTS REQUIRED:
- [ ] Run: npm run build
- [ ] Run: npx playwright test smoke.spec.ts
- [ ] Manual: Verify navigation still renders
```

### 6.2 Zero-Blast-Radius Discipline
- **Rule:** Scoped changes only—no global CSS modifications
- **Assessment:** Compare global approach (risk: all buttons) vs scoped approach (risk: one component)
- **Verdict:** Scoped approach only. Design system change = separate scope contract.

### 6.3 The 5-File Rule
- **Trigger:** Scope contract touches >5 files
- **Action:** Stop and verify
- **Questions:** Is scope too large? Are there unintended changes?

### 6.4 Post-Change Verification
- **Timing:** Immediately after scope contract, not at milestone end
- **Requirement:** No contract is "done" until regression tests pass

**Location in Codebase:** `c:\webdev\sang-logium\_contexts\deliberate-practice\learning\cover-against-timeline-failure-curriculum.md:395-478`

---

## Component 7: Timeline Threat Detection (6 Pillars)

### Pillar 1: Scope Fortification
| Threat | Trigger | Response |
|--------|---------|----------|
| "While I'm here" | Finding yourself modifying files outside scope | STOP. Document in FUTURE_SPRINTS.md. Return. |
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
| 1 (Must Support) | Chrome/Safari latest 2 versions, iOS latest 2 | Launch blocker |
| 2 (Should Support) | Firefox latest, Chrome mobile, Samsung Internet | Fix if time permits |
| 3 (Best Effort) | Android 8+, iOS 12+, IE11 | Document and defer |

### Pillar 4: Design System Adherence
**Visual Polish Checklist:**
- [ ] No hardcoded colors (AST parsing)
- [ ] No arbitrary Tailwind values
- [ ] Typography uses type-* classes exclusively
- [ ] Spacing uses design tokens
- [ ] Border radius uses token scale
- [ ] All images have proper aspect ratios
- [ ] Hover/focus states defined

### Pillar 5: Critical Path Management
**Current Critical Path (from audit):**
```
VFS Data Integrity (COMPLETE)
→ Navigation Migration (COMPLETE)
→ Filter/Sort Legacy Cleanup (IN PROGRESS)
→ Product Page Critical Path Testing
→ Cross-Browser Verification
→ Launch
```

**Rule:** Never work on a milestone until all its dependencies are complete.

### Pillar 6: Threat Detection Dashboard
**Daily Cover Check:**
```markdown
## Daily Timeline Defense Check

### Scope Threats
- [ ] Did I modify files outside today's scope?
- [ ] Did I fix anything "while I was there"?
- [ ] Did scope expand beyond sprint contract?

### Quality Threats
- [ ] Did I commit code without tests?
- [ ] Did I skip visual verification?
- [ ] Did I test only on primary browser?

### Timeline Threats
- [ ] Did any task take >50% longer than estimated?
- [ ] Did I discover new blockers?

### Coverage Verification
- [ ] Did I verify previous scope still works?
- [ ] Did I run regression tests?
```

**Location in Codebase:** `c:\webdev\sang-logium\_project\laws of combat\cover\TIMELINE_COVERAGE_STRATEGY.md:36-378`

---

## Component 8: Physical Timeline Artifacts

### 8.1 Sprint Files (63 total)
- **Active:** `c:\webdev\sang-logium\_project\*.todo`
- **Archived:** `c:\webdev\sang-logium\_project-done\*.todo`
- **Naming:** `[FEATURE]_[TYPE]_SPRINT.todo`

### 8.2 Master Tasklist
**Location:** `c:\webdev\sang-logium\_project\_MASTER_TASKLIST.todo`

**Format:**
```
28 03 2026
9:28
[ ] catalogue item -> products
[ ] homepage performance
    ✔ add regression tests @done(26-03-27 18:45)
    [ ] get auto-screenshot capability

by 12:00 [hard deadline]

[ ] MVP
by 14:00 [hard deadline]
```

### 8.3 Audit Reports
**Examples:**
- `c:\webdev\sang-logium\SPRINT_EXECUTION_AUDIT.md` - Grade: B+
- `c:\webdev\sang-logium\_project\VFS_IMPLEMENTATION_AUDIT_REPORT.md`
- `c:\webdev\sang-logium\audit-reports\PERFORMANCE_AUDIT_2026-03-28.md`

**Grading Scale:**
- A = Excellent
- B+ = Good/Very Good
- B = Acceptable with issues
- C = Requires revision

### 8.4 Daily Log
**Location:** `c:\webdev\sang-logium\_project\DAILY_LOG.md`

**Format:**
```
28 03 2026
9:28
[ ] task 1
    ✔ subtask complete @done(11:30)
[ ] task 2
```

---

## Component 9: Sprint State Machine

```
┌─────────┐     ┌─────────┐     ┌────────────────┐
│  Draft  │────→│ Active  │←────│    Paused      │
│(Created)│     │(In Prog)│     │(Intentionally) │
└─────────┘     └────┬────┘     └────────────────┘
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
   ┌─────────┐  ┌─────────┐  ┌───────────┐
   │ Blocked │  │ Complete│  │ Abandoned │
   │(Cannot  │  │(All DoDs│  │ (Will not │
   │ proceed)│  │  done)  │  │ complete) │
   └────┬────┘  └────┬────┘  └───────────┘
        │            │
        └────────────┘
                   ↓
            ┌──────────┐
            │ Archived │
            │(Moved to │
            │_project-d│
            │ one/)     │
            └──────────┘
```

**State Definitions:**
| State | Meaning | Next Action |
|-------|---------|-------------|
| Draft | Created, not yet started | Refine scope, get approval |
| Active | In progress | Execute DoDs |
| Blocked | Cannot proceed | Identify blocker, escalate |
| Paused | Intentionally stopped | Document state, resume later |
| Complete | All DoDs done | Verify, close, archive |
| Abandoned | Will not complete | Document why, archive |

**Location in Codebase:** `c:\webdev\sang-logium\_handbook\04-sprints\lifecycle.md:118-127`

---

## Component 10: Kill Switch Protocol

### 10.1 Kill Conditions
Execute fallback when ANY of these occur:

1. **Velocity drops below 0.5** for two consecutive scope contracts
2. **Blockers exceed 2 hours** without resolution
3. **Regression count exceeds 3** in a single scope contract
4. **Time remaining < 20%** of original estimate with < 50% scope complete

### 10.2 Pre-Written Fallbacks
**Required for each milestone before starting:**

```markdown
MILESTONE 1: Catalog → Products

PRIMARY APPROACH: Full VFS integration
FALLBACK APPROACH: Hardcoded category mapping
FALLBACK TRIGGER: VFS integration > 4 hours
FALLBACK QUALITY: Functional but manual updates required
```

### 10.3 Why Pre-Written
- Stress impairs judgment
- Decision made when calm
- Removes judgment from emergency

**Location in Codebase:** `c:\webdev\sang-logium\_contexts\deliberate-practice\learning\cover-against-timeline-failure-curriculum.md:657-699`

---

## Key Component Relationships

```
┌──────────────┐     ┌────────────────┐     ┌─────────────┐
│   Appetite   │────→│ Circuit Breaker │────→│  Kill List  │
│(Time Budget) │     │  (50% Overrun)  │     │(Priority Cuts)│
└──────────────┘     └────────────────┘     └──────┬──────┘
                                                   │
                        ┌──────────────────────────┘
                        ↓
                ┌───────────────┐
                │  Kill Switch  │
                │(Emergency Stop)│
                └───────────────┘

┌─────────────────┐     ┌─────────────┐     ┌──────────────┐
│  Scope Contract │────→│ DoD Layers  │────→│  Regression  │
│  (Work Unit)    │     │(4 Passes)   │     │    Tests     │
└─────────────────┘     └─────────────┘     └──────────────┘

┌──────────────────┐     ┌─────────────────┐     ┌─────────────┐
│ Velocity Tracking │────→│ Daily Cover     │────→│ Sprint      │
│   (Time Log)      │     │    Check         │     │   Audit     │
└──────────────────┘     └─────────────────┘     └─────────────┘
```

---

## Physical Artifacts = Timeline Persistence Layer

| Artifact Type | Location | Purpose |
|---------------|----------|---------|
| **63 Sprint Files** | `_project/*.todo` + `_project-done/*.todo` | Work unit definitions |
| **Master Tasklist** | `_project/_MASTER_TASKLIST.todo` | Daily commitments + deadlines |
| **Daily Log** | `_project/DAILY_LOG.md` | Minimal timestamped progress |
| **Audit Reports** | `_project/*AUDIT*.md` | Grade-based assessments |
| **Handbook** | `_handbook/**/*.md` | Process documentation |
| **Curriculum** | `_contexts/deliberate-practice/**/*.md` | Skill building |

---

## Summary: The Timeline is a Finite State Machine

**Input:** Scope contracts (defined work units)  
**Process:** Sequenced DoD layers with quality gating  
**Constraints:** Appetite, circuit breakers, kill switches  
**Feedback:** Velocity tracking, daily cover checks, sprint audits  
**Defense:** Regression containment, threat detection  
**Output:** Completed, verified, archived sprints

The timeline transforms amorphous "project progress" into discrete, verifiable states with explicit transition conditions and defensive checkpoints at every phase.

---

*Document generated from systematic codebase research*  
*Verified against: `_handbook/`, `_project/`, `_contexts/`, audit reports*
