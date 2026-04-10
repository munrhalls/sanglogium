# Optimal Development Rhythm Protocol

**Date:** 2026-04-09
**Source:** Synthesized from velocity lessons and human-first methodology
**Severity:** Critical
**Frequency:** Universal (applies to all development work)

---

## Core Principle

**Outpace or be outpaced** - maintain optimal rhythm between acceleration and verification.  
The ground factor: **Signal density ÷ cycle time**. Maximize throughput without sacrificing quality.

---

## Acceleration Protocols

### When to Accelerate

**Trigger Conditions:**
- [x] Clear user flow with verified bus stops
- [x] Data integrity confirmed (live console verified)
- [x] Scope fits in one sentence
- [x] No dependencies on other active work
- [x] Build baseline passing

**Acceleration Techniques:**

1. **Vertical Slice Execution**
   - Complete one user flow end-to-end
   - Ship immediately, verify, then next
   - Avoid layer-by-layer waterfall

2. **15-Minute Waterfall Pattern**
   - Rapid spec: 15 minutes max
   - Immediate execution
   - No multi-phase planning

3. **Signal Density Optimization**
   - Compress context to load-bearing facts only
   - Single agent window per scope
   - Batch decisions to planning phase

4. **Parallel Tool Execution**
   - Maximize independent tool calls
   - Reduce sequential dependencies
   - Eliminate wait time

### Acceleration Guardrails

- **Never skip data verification**
- **Never compromise on bus stop tracing**
- **Never exceed 60-minute scope duration**
- **Never start without baseline build verification**

---

## Pacing Protocols

### When to Slow Down

**Mandatory Slow Points:**
- [x] Schema changes (Sanity, database)
- [x] Architecture modifications
- [x] Integration points (APIs, external services)
- [x] Security implications
- [x] Performance critical paths

**Pacing Techniques:**

1. **Human Verification First**
   - Manual browser verification before tests
   - Document exact user interaction flow
   - Note all expectations and bus stops

2. **Continuous Verification**
   - Verify after each scope contract
   - No end-only verification
   - <5 minute verification checkpoints

3. **Directness Principle**
   - Live console debugging for data flow
   - Manual URL testing for routing
   - No mocking core functionality

4. **Build-Time Discipline**
   - Build runs BANNED during regular work
   - Use dev server for verification
   - Reserve builds for sprint completion only

### Pacing Verification

```bash
# Pre-flight checks (mandatory)
npm run dev          # Verify baseline
/commits-diagnostics # Check velocity health
```

---

## Decision Matrix

| Context | Accelerate | Pace | Rationale |
|---------|------------|------|-----------|
| **Clear user flow, verified data** | X | | High signal density, low risk |
| **Schema migration** | | X | High impact, requires verification |
| **UI component alignment** | X | | Visual work, fast feedback |
| **API integration** | | X | External dependency, verify contract |
| **Bug fix on critical path** | X | | User impact priority |
| **Architecture decision** | | X | Foundation affects all future work |
| **Performance optimization** | | X | Measurement required, verify impact |
| **Feature with new dependencies** | | X | Risk assessment needed |

---

## Rhythm Anti-Patterns

### 1. **Planning Paralysis**
- **Symptom**: 31 sprint files, 646-line contracts
- **Impact**: Inverted velocity ratio (1:1.5)
- **Fix**: 15-minute waterfall, single-sentence scope

### 2. **Verification Deferral**
- **Symptom**: Build gate at sprint end only
- **Impact**: 3-day waste cycles, basic errors slip through
- **Fix**: Continuous verification, human checkpoints

### 3. **Context Switching Thrash**
- **Symptom**: Multiple parallel agent windows
- **Impact**: 90 min output in 12 hours
- **Fix**: Single window per scope, batch decisions

### 4. **Cargo Cult Testing**
- **Symptom**: 100% test pass but system doesn't work
- **Impact**: False confidence, hidden failures
- **Fix**: Tests document verified behavior, no mocking core

### 5. **Build Time Destruction**
- **Symptom**: Routine builds during development
- **Impact**: Destroys coding time, prevents flow
- **Fix**: Dev server only, builds for completion only

---

## Implementation Workflow

### Phase 1: Rhythm Assessment (2 minutes)
```bash
# Quick health check
/commits-diagnostics --quick
# Verify: D-type < 20%? Real:Illusory > 2:1? Cleanup < 5%?
```

### Phase 2: Scope Triage (3 minutes)
- [ ] Is scope one sentence clear?
- [ ] Are data flows verified?
- [ ] Is baseline build passing?
- [ ] Any schema/architecture changes?

**Decision**: Accelerate or Pace based on matrix

### Phase 3: Execution Discipline
- **Accelerate**: Vertical slices, 15-min specs, parallel tools
- **Pace**: Human verification, continuous checkpoints, direct observation

### Phase 4: Rhythm Review (5 minutes)
- Signal density achieved?
- Cycle time optimal?
- Quality maintained?
- Velocity healthy?

---

## Velocity Health Indicators

### Green Lights (Accelerate)
- Real:Illusory ratio > 2:1
- D-type commits < 20%
- Cleanup commits < 5%
- Single-sentence scopes
- <5 minute verification cycles

### Yellow Lights (Pace)
- Schema changes required
- New dependencies needed
- Architecture decisions pending
- Integration points involved

### Red Lights (Stop)
- Build failing
- Data integrity issues
- Velocity inverted (>1:1.5)
- Context switching detected

---

## Core Rules Summary

1. **Signal Density First**: Compress context, eliminate waste
2. **Rhythm Assessment**: Check velocity health before starting
3. **Context-Based Decision**: Use matrix, don't guess
4. **Continuous Verification**: <5 minute checkpoints
5. **Build Discipline**: Dev server only, builds for completion
6. **Anti-Pattern Prevention**: Recognize and avoid thrash patterns

---

## Keywords: ["rhythm", "pace", "acceleration", "velocity", "tempo", "signal-density", "cycle-time", "throughput"]
