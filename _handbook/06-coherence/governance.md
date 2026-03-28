# Coherence: System Governance

---

## Purpose

Maintain global system coherence, truth, and integrity across all agentic operations.

**Primary Principle:** Truth above all — truthfulness, validity, true value, usefulness, and global coherence.

---

## The Coherence Model

### What is Coherence?

Coherence means:
1. **Internal consistency** — No contradictions between rules, workflows, and execution
2. **Truth alignment** — Work reflects reality, not wishful thinking
3. **Scope integrity** — Boundaries are respected, no hidden work
4. **Temporal continuity** — Past decisions inform present, don't contradict
5. **Cross-agent alignment** — All agents operate from shared truth

### Coherence Threats

| Threat | Symptom | Detection |
|--------|---------|-----------|
| Rule contradiction | Agent follows one rule, breaks another | Audit cross-references |
| Scope drift | Work happens outside sprint boundaries | Git diff analysis |
| Truth decay | "It should work" vs "It works" | Verification failure |
| Temporal inconsistency | New work undoes old decisions | Regression tests |
| Agent divergence | Different agents have different "truths" | Compare outputs |

---

## Governance Mechanisms

### Mechanism 1: The Windsurf Rules Constitution

**Location:** `.windsurfrules`

**Purpose:** Immutable constraints that override all other instructions

**Contents:**
- Core architectural constraints
- Technology-specific rules
- Workflow principles
- Command protocols

**Governance Rule:**
```
If any instruction contradicts .windsurfrules,
.windsurfrules wins.
Document the conflict.
Escalate if unclear.
```

### Mechanism 2: Deterministic Execution

**Principle:** All work follows pre-defined phases

**Enforcement:**
- Phase 1 (Plan) must complete before Phase 2 (Execute)
- Verification must pass before commit
- Human checkpoints must clear before advancing

**Coherence Check:**
```
Is the agent improvising? → NOT COHERENT
Is the agent following protocol? → COHERENT
```

### Mechanism 3: Scope Containment

**Principle:** Work stays within explicitly defined boundaries

**Enforcement:**
- Allowed Write Scope Paths are the only permitted modifications
- Read-Only Context Paths are forbidden to modify
- If scope unclear, HALT and clarify

**Coherence Check:**
```
Are files outside scope being modified? → NOT COHERENT
Is scope respected absolutely? → COHERENT
```

### Mechanism 4: Verification Gates

**Principle:** Mathematical proof before advancement

**Enforcement:**
- Verification command must pass 100%
- Visual verification by human required
- No "should be fine" shortcuts

**Coherence Check:**
```
Did verification pass? → COHERENT
Was verification skipped? → NOT COHERENT
```

### Mechanism 5: Commit Taxonomy

**Principle:** All work is categorized and tracked

**Enforcement:**
- Every commit uses A/B/C/D/E taxonomy
- Fibonacci difficulty is assigned
- Impact (DoD closure) is recorded

**Coherence Check:**
```
Is commit history a clear record of work? → COHERENT
Are commits inconsistent or vague? → NOT COHERENT
```

---

## Coherence Maintenance Rituals

### Daily: Cover Check

```markdown
## Daily Coherence Check

### Scope Integrity
- [ ] No files modified outside today's scope
- [ ] No "while I was there" fixes
- [ ] No scope expansion without explicit approval

### Truth Preservation
- [ ] All verification commands pass
- [ ] Visual verification completed
- [ ] No assumed working states

### Cross-Check
- [ ] Previous scope still working (regression test)
- [ ] No new warnings or errors
- [ ] Design system compliance maintained
```

### Weekly: Sprint Review

```markdown
## Weekly Coherence Review

### Sprint Integrity
- [ ] Active sprint on track
- [ ] No unplanned work intruding
- [ ] Dependencies respected

### Agent Performance
- [ ] Agents following protocols
- [ ] No improvisation detected
- [ ] Human checkpoints effective

### System Health
- [ ] Build passes consistently
- [ ] Tests passing
- [ ] Documentation current
```

### Monthly: Architecture Review

```markdown
## Monthly Architecture Coherence

### Constitution Check
- [ ] .windsurfrules still accurate
- [ ] No contradictions accumulated
- [ ] New patterns documented

### Workflow Audit
- [ ] All workflows functional
- [ ] Empty slots filled or removed
- [ ] Protocols effective

### Knowledge Base
- [ ] Tier 3 documentation organized
- [ ] MCP retrieval working (if implemented)
- [ ] Cross-references valid
```

---

## Conflict Resolution

### When Coherence is Broken

**Detection:**
- Verification fails unexpectedly
- Agent contradicts previous agent
- Rule conflicts with rule
- Scope expands uncontrollably

**Resolution Protocol:**

1. **STOP**
   - Halt all work immediately
   - Do not proceed with incoherent state

2. **DOCUMENT**
   - Record what was detected
   - Capture the contradiction
   - Note the context

3. **ANALYZE**
   - Which rule/principle was violated?
   - Why was it violated?
   - What is the source of truth?

4. **RESOLVE**
   - Apply hierarchy: Constitution > Workflow > Instruction
   - Fix the root cause (not symptom)
   - Update documentation if needed

5. **VERIFY**
   - Run verification command
   - Confirm coherence restored
   - Resume work

### Hierarchy of Truth

```
1. .windsurfrules (Constitution)
   ↓
2. Workflow files (Protocols)
   ↓
3. Sprint contracts (Scope)
   ↓
4. Human instruction (Direction)
   ↓
5. Agent inference (Execution)
```

**Rule:** Lower levels cannot override higher levels.

---

## Truth Preservation

### Truth vs Fiction

| Truth | Fiction |
|-------|---------|
| "Build passes" (verified) | "It should build" (unverified) |
| "Test fails at line 42" | "I think the test is broken" |
| "3 of 5 DoDs complete" | "Almost done" |
| "No regressions detected" | "Probably no regressions" |

### Truth Enforcement

**In Planning:**
- DoDs are binary (ticked or not)
- Estimates use Fibonacci (not "a few hours")
- Scope has explicit boundaries

**In Execution:**
- Verification commands provide proof
- Visual verification confirms UI state
- Git diff shows exactly what changed

**In Review:**
- Commits describe actual changes
- Audit confirms what was claimed
- Metrics reflect reality

---

## Global Coherence Dashboard

### System Health Indicators

| Indicator | Healthy | Warning | Critical |
|-----------|---------|---------|----------|
| Build status | Passes | Flaky | Failing |
| Test pass rate | >90% | 80-90% | <80% |
| Agent adherence | >95% | 80-95% | <80% |
| Scope drift | None | <10% | >10% |
| Verification skip | None | Occasional | Frequent |

### Current Status (Example)

```
┌─────────────────────────────────────────┐
│      SYSTEM COHERENCE DASHBOARD         │
├─────────────────────────────────────────┤
│ Build Status        │ ✅ PASSING        │
│ Test Pass Rate      │ ⚠️  85%           │
│ Agent Adherence     │ ✅ 97%            │
│ Scope Drift (7d)    │ ✅ None           │
│ Verification Skip   │ ❌ 3 instances    │
├─────────────────────────────────────────┤
│ OVERALL COHERENCE   │ 🟡 MONITOR        │
└─────────────────────────────────────────┘
```

---

## Coherence Violations Log

**Template:**
```markdown
## Coherence Violation #[N]
**Date:** [YYYY-MM-DD]
**Type:** [Scope/Truth/Rule/Temporal]

**What Happened:**
[Description]

**Root Cause:**
[Why it happened]

**Resolution:**
[How it was fixed]

**Prevention:**
[How to prevent recurrence]
```

---

## The Coherence Pledge

**For Human:**
```
I will:
- Define clear, verifiable scope
- Respect my own boundaries (NOT TO-DO list)
- Verify before approving
- Maintain the Constitution
- Question incoherence immediately
```

**For Agents:**
```
I will:
- Follow protocols exactly
- HALT on ambiguity
- Verify before claiming
- Respect scope absolutely
- Escalate contradictions
```

---

**Next:** [07-appendices/templates.md](../07-appendices/templates.md) - Reference templates
