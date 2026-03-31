# workflows: Velocity-Aware Sprint Planning

**Date:** 2026-03-31  
**Source:** `/commits-diagnostics` execution and analysis  
**Severity:** High  
**Frequency:** Systemic

---

## The Problem

Commit analysis revealed **inverted velocity ratio**: 1:1.5 real:illusory (target: 3:1).  
- **D-type (planning/config):** 34% of commits (target: <20%)  
- **Illusory velocity:** 61% of work (target: <40%)  
- **Zero DoD commits:** 48% (target: <20%)  
- **Cleanup spiral:** 14% of commits (target: <5%)

The workflow pipeline (Research → Audit → Sprint) was generating **more overhead than delivery**.

---

## Root Cause

**Serial decision gates, not parallel execution flow.**

Each sprint required:  
1. Research phase (15-30 min)  
2. Audit phase (15-30 min)  
3. Sprint planning (30-60 min)  
4. Execution review (ongoing)

**Cognitive bottleneck:** Human (not AI) became the throughput limiter.  
Multiple parallel agent windows created context-switching overhead without actual parallelization benefits.

---

## The Fix

**Compressed context → Tight sprint doc → Single execution window → Fast review**

1. **Pre-compress all research** into load-bearing facts only
2. **Sprint doc = ONE self-contained scope** with verifiable DoD
3. **Single agent window per scope** (no parallelization on coupled tasks)
4. **Review checklist = 5 minutes max** (pass/fail, not iterative)

---

## Prevention

### Sprint Doc Constraints
- [ ] Scope fits in one sentence
- [ ] DoD verifiable in under 5 minutes
- [ ] No dependencies on other active scopes
- [ ] File paths verified to exist
- [ ] Design tokens extracted from live components

### Velocity Gates (Before Any Sprint)
```bash
/commits-diagnostics --quick
# Check: D-type < 20% this week?
# Check: Real:Illusory ratio > 2:1?
# Check: Cleanup commits < 5%?
```

### Execution Discipline
- **Batch decisions** to planning phase only
- **No re-planning during execution**
- **Review only, no iteration** — reject and re-run with corrected sprint if needed
- **Track actual clock time** per phase

---

## Applicability

**When to apply:**
- Starting any new feature work
- Velocity feels slow despite AI assistance
- Multiple agent windows open simultaneously
- Sprints expanding beyond 60 minutes

**Keywords:** `["velocity", "sprint", "workflow", "optimization", "commits", "diagnostics", "cognitive-load", "throughput"]`

---

## Core Ground Factor

**Signal density of Opus input ÷ time cost to produce it**

| Approach | Signal Density | Time Cost | Efficiency |
|----------|----------------|-----------|------------|
| Raw research dump | Low | High | Poor |
| Compressed context | High | Low | Optimal |
| Multi-window chaos | Fragmented | Very High | Broken |

**Key insight:** Justin Sung's GRINDE model — compress all inputs to load-bearing facts before expensive model invocation.

---

## Causal Factors (from CORE_FACTORS.md)

**Critical for velocity:**
1. Intent clarity (one-sentence scope)
2. Codebase ground truth (real file paths, real GROQ)
3. Design system ground truth (verified tokens from live components)
4. Research quality (load-bearing facts only)
5. Compress accuracy (no hallucinated tokens)
6. Opus input density (compressed context)
7. Sprint doc quality (verifiable DoD, sealed boundaries)
8. Review speed (under 5 minutes, binary decision)
9. Scope size (single component, no context overflow)
10. Sequence integrity (data before UI, structure before surface)

**Failure modes to avoid:**
- Redo loops (executor drifts, re-runs take too long)
- Cognitive load (re-planning during execution)
- Token cost (Opus called multiple times per feature)
- Pipeline instability (cascading failures, mental state dependencies)
