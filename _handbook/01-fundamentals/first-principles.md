# Fundamentals: First Principles & Mental Models

---

## 1. The Core Constraint: Truth Above All

**Primary Principle:** The absolute priority is truth — truthfulness, validity, true value, usefulness, and global coherence.

This means:
- No pleasant fictions about progress
- No optimistic estimates without evidence
- No scope expansion disguised as "improvements"
- No premature optimization without measurement
- No agentic work that doesn't directly advance project truth

---

## 2. The Three-Tier Context Architecture

Per 2026 best practices, professional AI-leverage employs a three-tier architecture:

### Tier 1: Project Constitution (Hot Memory)
**Purpose:** Core rules, orchestration, checklists
**Update Frequency:** Every session
**Location:** `.windsurf/memories/architecture.md`, `.windsurfrules`
**Size:** ~660 lines

**Current Implementation:**
- ✅ `.windsurfrules` (57 lines) - Core architectural constraints
- ✅ `.windsurf/memories/architecture.md` (187 lines) - Extended architectural memory

### Tier 2: Specialized Agents (Warm Memory)
**Purpose:** Domain-expert personas per task type
**Update Frequency:** Per task type
**Location:** `.windsurf/workflows/*.md`
**Size:** 115-1,233 lines each

**Current Implementation:**
- ✅ `/implement` - Deterministic execution protocol (42 lines)
- ✅ `/debug` - Component archaeology protocol (57 lines)
- ✅ `/test` - Testing verification protocol (54 lines)
- ✅ `/commit` - Autonomous commit execution (44 lines)
- ✅ `/sprint` - Sprint generation workflow (29 lines)
- ⚠️ `/audit` - Empty (needs population)
- ⚠️ `/research` - Empty (needs population)
- ⚠️ `/scripts` - Empty (needs population)

### Tier 3: Knowledge Base (Cold Memory)
**Purpose:** Subsystem documentation, retrieved on demand
**Update Frequency:** Per subsystem
**Location:** `_project/`, `_contexts/`, documentation
**Size:** ~16,250 lines total

**Current Implementation:**
- ✅ Sprint documentation (`_project/*.todo` files)
- ✅ Command protocols (`_project/COMMANDS/*.md`)
- ✅ Research findings (`_contexts/`)
- ⚠️ Missing: MCP retrieval integration

---

## 3. The Deterministic Execution Protocol

All agentic work follows strict phases:

### Phase 1: Plan and Contain (MANDATORY)
**Agent MUST output this section before modifying ANY files.**

1. **Explicit Refined Scope:** Translate rough scope into strict technical target
2. **Explicit Refined DoDs:** Atomic, sequential, mechanical tasks
3. **Read-Only Context Paths:** Files for context only (modification forbidden)
4. **Allowed Write Scope Paths:** ONLY files permitted to be modified
5. **Verification Command:** Exact command to prove zero regressions

### Phase 2: Execution Rules
1. Strictly execute DoDs in exact sequential order
2. Contain all changes within Allowed Write Scope Paths
3. Styling & CSS: Use scoped Tailwind only (no global CSS modifications)
4. Zero risk to unrelated components

### Phase 3: Verification & Output
1. Execute Verification Command using PowerShell
2. If fails: revert, re-evaluate, fix (do not proceed until 100% pass)
3. **PAUSE** for human Visual Verification of UI/DOM state
4. Generate commit message using taxonomy from `COMMIT_TEMPLATE.txt`

---

## 4. The Component Archaeology Principle

**Debugging Workflow (Mandatory for all bug fixes):**

1. **Analyze what the problem is** - Precise technical description
2. **Determine relevant components** - List all potentially involved
3. **Individual component analysis** - Check state, props, logic per component
4. **Component chain analysis** - Understand interactions as connected chain
5. **Investigate BEFORE proposing solutions** - Analyze reality first
6. **Solve as asked** - Do not jump to un-asked optimizations

**Rule:** Prefer minimal upstream fixes over downstream workarounds.

---

## 5. Scope Contract Discipline

A Scope Contract defines:
- **In Scope:** What will be delivered
- **Out of Scope:** What will NOT be delivered
- **Forbidden Scope:** What must never be touched
- **Architecture Decisions:** Conscious YAGNI choices recorded

**The Architecture Decisions section** records what you consciously decided NOT to abstract and why. This prevents future-you from reopening decisions mid-build.

---

## 6. Definition of Done (DoD) Layers

**For Frontend UI Work (Layer Sequencing):**

```
Pass 1 — Skeleton Pass (all components, no styling):
Pass 2 — Data Pass (all components, real data, no styling):
Pass 3 — Build Pass (one component at a time, full scope):
    1. Build component to DoD at desktop (1280px). Lock desktop DoD items.
    2. Immediately build same component to DoD at mobile (375px). Lock mobile DoD items.
```

**Within a Single Component (Four Layers in Order):**
```
Layer 1 — Structure:    Semantic HTML/JSX skeleton. No classes. No logic.
Layer 2 — Layout:       Tailwind flex/grid/spacing/sizing only.
                        No colors. No typography. No borders.
Layer 3 — Surface:      Colors, typography, brand tokens, imagery.
Layer 4 — Interaction:  Hover states, transitions, animations.
```

---

## 7. Commit Taxonomy & Fibonacci Difficulty

**Fibonacci Scale:** 1, 2, 3, 5, 8, 13

| Value | Meaning |
|-------|---------|
| 1 | Trivially easy and small |
| 2 | Easy |
| 3 | Relatively easy |
| 5 | Medium difficulty |
| 8 | Difficult |
| 13 | Very difficult and large scope |

**Taxonomy Categories (Must pick exactly one):**

| Category | Meaning | Example |
|----------|---------|---------|
| **A** | Forward progress | Closes DoD item on required component |
| **B** | Critical bug fix | Resolves CRITICAL bug blocking DoD item |
| **C** | Refactor | Changes code structure without new functionality |
| **D** | Configuration | Tailwind config, tsconfig, build setup, folder structure |
| **E** | Polish | Improvements to already-DoD-complete components |

**Commit Message Template:**
```
Difficulty: <1-13> - <A|B|C|D|E>, <Category> (<scope>): <action> — → closes DoD item [N] on [SprintName]
Difficulty: <1-13> - <A|B|C|D|E>, <Category> (<scope>): <action> — → closes 0 DoD items, <type>
```

---

## 8. The Cover & Move Protocol

**Applied to Software Development:**

### What "Cover" Means:
1. Scope has explicit boundaries and trigger conditions
2. Every critical path has enumerated test contracts
3. Browser/device support is pre-defined and bounded
4. Design system compliance is automated
5. Daily threat detection is ritualized
6. Definition of Done is explicit and verified

### What "Move" Means:
1. Advance only when coverage is verified
2. Move from cleanup → integration → testing → launch
3. Each move follows the Priority Connection sequence
4. Never advance leaving untested pathways behind

---

## 9. Appetite-Based Shaping (Not Estimation)

**Principle:** Before asking "how long will this take?" ask "how much time do I want to spend?" Then design a solution that fits within that appetite.

**Appetite is a budget, not a prediction.**

**Shaping Questions:**
- What is the maximum time appetite for this deliverable?
- What core elements must exist?
- What elements are explicitly ruled out?
- What is the circuit breaker if deadline approaches?

---

## 10. The "NOT TO-DO" Triggers

Your existing NOT TO-DO list lacks enforcement triggers. Operationalize with:

| Prohibition | Trigger Condition | Enforcement |
|-------------|-------------------|-------------|
| Avoid one-off's | Before any "quick addition" | Check: exists elsewhere? reusable? increases test surface? |
| Premature optimization | When considering optimization | Check: measured bottleneck? security? data integrity? |
| Premature abstraction | When considering abstraction | Check: needed in 3+ places? can be deferred? |
| Tackling many priorities | When scope expands | Check: >3 active priorities? |
| Availability fixes | When "while I'm here" appears | Check: <15 min? no new tests needed? |

---

## 11. Timeline Threat Detection

**Daily Cover Check Questions:**

### Scope Threats
- [ ] Did I modify any files outside today's scope?
- [ ] Did I fix anything "while I was there"?
- [ ] Did scope expand beyond the sprint contract?

### Quality Threats
- [ ] Did I commit code without tests?
- [ ] Did I skip visual verification?
- [ ] Did I test only on my primary browser?

### Timeline Threats
- [ ] Did any task take >50% longer than estimated?
- [ ] Did I discover new blockers?
- [ ] Am I waiting on external dependencies?

### Coverage Verification
- [ ] Did I verify previous scope still works?
- [ ] Did I run regression tests?
- [ ] Is the critical path still clear?

---

## 12. The Four-Pass Component Build Sequence

**For Professional UI Development:**

| Pass | Focus | Output | Verification |
|------|-------|--------|--------------|
| **Pass 1** | Skeleton | All components render without errors | Build passes |
| **Pass 2** | Data | Real data flows through all components | Data matches expected |
| **Pass 3** | Desktop | Full styling at 1280px | Visual regression baseline |
| **Pass 4** | Mobile | Full styling at 375px | Touch targets, readability |

**Critical Rule:** Each pass locks before advancing. No mixing passes.

---

## Summary: The Mental Models

1. **Truth First:** Validity > Speed > Convenience
2. **Cover Then Move:** Defense before offense
3. **Deterministic:** Pre-defined > Improvised
4. **Contained:** Scoped > Open-ended
5. **Verified:** Tested > Assumed
6. **Layered:** Sequential > Parallel (within scope)
7. **Appetite-Driven:** Budget > Estimate
8. **Threat-Aware:** Detection > Reaction

---

**Next:** [02-orchestration/architecture.md](02-orchestration/architecture.md) - Agent team architecture and coordination patterns
