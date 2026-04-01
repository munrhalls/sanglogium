# Raw Learning Capture — Opus-Powered Sprint Quality

**Work Unit:** SPRINT_2026_04_01_PLP_DESIGN_ALIGNMENT
**Date:** 2026-04-01
**Duration:** ~45 minutes (10 SCs, all passed first try)
**Model:** Opus 4.6 vs Sonnet 3.7 (executor comparison)

---

## What Was Different?

The Opus-generated sprint specification achieved **100% first-try pass rate** across 10 scope contracts with zero deviation, zero backtracking, and zero "I need to see the file first" delays. This is not typical — non-Opus specs usually require 2-3 iterations of clarification.

## Root Cause: Opus Specification Quality Factors

### 1. Explicit Gap Coverage Mapping
- Every SC (Scope Contract) explicitly references audit gaps (G1, G2, G3...)
- No ambiguity about WHY a change exists
- Traceability from audit finding → specification → implementation

### 2. Line-Number Precision
- Specifications included exact line numbers: "Lines 61-76"
- Exact class names: `rounded-sm` → `rounded-lg`
- Exact file paths with verification markers

### 3. Constraint-First Architecture
- Scope lock rules listed FIRST (what NOT to touch)
- Anti-patterns section: "NO bare `lg:` breakpoint classes"
- Forbidden actions clearly enumerated

### 4. Verifiable DoDs
- Each SC has explicit Definition of Done
- Build gate specified: `npm run build`
- No subjective "looks good" criteria

### 5. Layer-Based Sequencing
- Pass 1: Skeleton (semantic HTML)
- Pass 2: Data (real data integration)  
- Pass 3: Build (desktop → mobile, Layer 1→4)
- Structure → Layout → Surface → Interaction

### 6. Functional Grouping
- Group A: Page Layout (foundation)
- Group B: Product Display (core UX)
- Group C: Filter & Controls (functional system)
- Group D: Polish (finishing)

## Time Bottlenecks Avoided

| Typical Non-Opus | Opus-Powered |
|-----------------|--------------|
| "Which file?" clarification | Exact path provided |
| "What class should I use?" | Exact token specified |
| "Is this in scope?" debate | Scope lock pre-defined |
| Backtracking from wrong approach | Constraint prevents it |
| Missing build gate failures | Gate embedded in DoD |

## Prompt Quality Analysis

### What Opus Did That Made It Work

**Input:** Compressed audit findings (not raw dump)
- Opus received: Load-bearing facts only (~1000 tokens)
- Not: Full prose audit report (5000+ tokens)

**Output Structure:**
1. Pre-sprint regression containment table
2. Scope lock rules (hard constraints)
3. 10 Scope Contracts with Gap Coverage
4. Pass 1/2/3 sequencing per contract
5. Layer 1-4 build order
6. Verification commands per contract

**Critical Quality Markers:**
- **Specificity:** Every change has before/after state
- **Completeness:** No gaps left to "figure out during implementation"
- **Verifiability:** Every DoD has objective pass/fail criteria
- **Sequencing:** Execution order is explicit, not implied

## What Should Be Codified

### For Sprint Generation (Opus Phase)
1. ALWAYS use compressed input (< 1000 tokens of load-bearing facts)
2. MUST include Gap Coverage mapping per SC
3. MUST list Scope Lock Rules first (negative constraints)
4. MUST specify exact file paths and line numbers
5. MUST include anti-patterns section

### For Sprint Execution (Executor Phase)
1. Build gate after EVERY SC (not just at end)
2. No file modifications without reading first (even with line numbers)
3. Follow explicit Pass 1/2/3 sequence
4. Respect layer order: Structure → Layout → Surface → Interaction

## Fix Applied (System-Level)

Create reusable Opus sprint template that captures these quality factors as mandatory fields.

## Applicability

**When to apply:**
- Any multi-component UI sprint
- Design system alignment work
- Audit remediation sprints
- Feature work with >3 components

**Keywords:** ["opus", "sprint-spec", "scope-contract", "gap-coverage", "layer-sequencing", "constraint-first"]
