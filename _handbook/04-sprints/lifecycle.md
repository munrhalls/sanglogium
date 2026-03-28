# Sprints: Lifecycle Management

---

## 1. Sprint Types

### Type A: Feature Sprint
**Purpose:** Deliver new functionality
**Duration:** 1-3 days
**DoD Focus:** Implementation + Testing

**Characteristics:**
- Clear user-visible outcome
- Scope contracts around user flows
- Heavy on Pass 2-3 DoDs (Data, Desktop, Mobile)

### Type B: Bug Fix Sprint
**Purpose:** Resolve critical issues
**Duration:** Hours to 1 day
**DoD Focus:** Root cause + Fix + Regression test

**Characteristics:**
- Component Archaeology required
- Minimal scope
- B-category commits

### Type C: Refactor Sprint
**Purpose:** Improve code structure without behavior change
**Duration:** 1-2 days
**DoD Focus:** Structural changes + Verification of no behavior change

**Characteristics:**
- Zero user-visible change
- Test suite must pass unchanged
- Risk of regressions = high

### Type D: Infrastructure Sprint
**Purpose:** Build tooling, configuration, documentation
**Duration:** Variable
**DoD Focus:** Setup + Documentation + Validation

**Characteristics:**
- Enables future work
- Often "closes 0 DoD items"
- D-category commits

### Type E: Polish Sprint
**Purpose:** Improve already-complete components
**Duration:** Hours
**DoD Focus:** Visual refinement + Performance

**Characteristics:**
- Build on solid foundation
- Lower risk
- E-category commits

---

## 2. Sprint Lifecycle

### Phase 1: Planning

**Inputs:**
- Target state definition
- Rough scope boundaries
- Timeline constraints

**Activities:**
1. Research current codebase
2. Identify scope contracts
3. Sequence DoD layers
4. Estimate effort (Fibonacci)
5. Generate sprint file

**Output:** `[SPRINT_NAME].todo` file

**Checkpoint:** Human approval of sprint scope

### Phase 2: Execution

**Pattern:**
```
DoD 1.1 → DoD 1.2 → ... → DoD 1.N
   ↓
DoD 2.1 → DoD 2.2 → ... → DoD 2.N
   ↓
...
```

**Rules:**
- Lock each DoD before advancing
- Run regression tests between phases
- No scope expansion

**Checkpoint:** Phase transitions (human verification)

### Phase 3: Verification

**Final checks:**
- All DoDs ticked
- Build passes
- Regression tests pass
- Visual verification complete
- Documentation updated

**Checkpoint:** Sprint completion checklist

### Phase 4: Closure

**Activities:**
1. Archive sprint file to `_project-done/`
2. Update MASTER_TASKLIST.todo
3. Generate final commit(s)
4. Document learnings

---

## 3. Sprint States

| State | Meaning | Actions |
|-------|---------|---------|
| **Draft** | Created, not yet started | Refine scope, get approval |
| **Active** | In progress | Execute DoDs |
| **Blocked** | Cannot proceed | Identify blocker, escalate |
| **Paused** | Intentionally stopped | Document state, resume later |
| **Complete** | All DoDs done | Verify, close, archive |
| **Abandoned** | Will not complete | Document why, archive |

---

## 4. Scope Contract Template

```markdown
### Scope Contract [N]: [Name]
**Rationale:** [Why this scope exists and why it matters]

**Scope:**
- [ ] [Specific deliverable]
- [ ] [Specific deliverable]

**Files at Risk:**
- `[path]` - [what could go wrong]
- `[path]` - [what could go wrong]

**Regression Tests Required:**
- [ ] [Test for risk area A]
  - **Verification:** [command]
  - **Code Location:** `[path]`

**Definition of Done:**
- [ ] [Measurable criteria 1]
- [ ] [Measurable criteria 2]
```

---

## 5. DoD Template

```markdown
#### DoD [Phase].[Number] — [Name]
**Purpose:** [What this DoD achieves]

**Tasks:**
- [ ] [Specific action]
- [ ] [Specific action]

**Code Location:**
- Read: `[paths for context]`
- Write: `[paths that change]`

**Verification:**
- Command: `[exact command]`
- Expected: [what success looks like]

**Regression Risk:**
- Areas affected: [list]
- Mitigation: [tests/checks]
```

---

## 6. Sprint Planning Checklist

### Before Creating Sprint
- [ ] Target state is crystal clear
- [ ] Timeline/appetite is defined
- [ ] Dependencies are identified
- [ ] Success criteria are measurable

### During Sprint Creation
- [ ] All scope contracts have rationale
- [ ] All DoDs are atomic and sequential
- [ ] Regression tests identified for each risk area
- [ ] Design system compliance checks included
- [ ] Effort estimated using Fibonacci
- [ ] Execution order is logical

### After Sprint Creation
- [ ] Human review and approval obtained
- [ ] Sprint file placed in correct location
- [ ] MASTER_TASKLIST updated
- [ ] Related sprints cross-referenced

---

## 7. Sprint Execution Checklist

### At Start of Each Phase
- [ ] Previous phase fully locked
- [ ] Regression tests from Phase 0 pass
- [ ] Context loaded (files, documentation)
- [ ] Scope boundaries reaffirmed

### During DoD Execution
- [ ] Single DoD at a time
- [ ] Allowed Write Scope Paths respected
- [ ] Verification command run after each DoD
- [ ] Visual verification for UI changes

### At Phase Transitions
- [ ] All DoDs in phase ticked
- [ ] Verification commands all pass
- [ ] Human checkpoint cleared
- [ ] Progress documented

### At Sprint Completion
- [ ] All DoDs complete
- [ ] All verification passed
- [ ] Build succeeds
- [ ] Regression suite passes
- [ ] Documentation complete
- [ ] Commits generated
- [ ] Sprint archived

---

## 8. Common Sprint Anti-Patterns

### Anti-Pattern 1: The Monolith Sprint
**Problem:** One sprint tries to do everything
**Symptom:** 50+ DoDs, spans multiple weeks
**Fix:** Split into focused sprints (Feature, Refactor, Polish)

### Anti-Pattern 2: The Vague DoD
**Problem:** DoD says "make it work"
**Symptom:** Unclear when complete, endless tweaking
**Fix:** DoDs must be binary: ticked or not, no gray area

### Anti-Pattern 3: The Missing Phase 0
**Problem:** No regression tests defined
**Symptom:** Breaking things that used to work
**Fix:** Always start with Phase 0 regression tests

### Anti-Pattern 4: The Scope Creep
**Problem:** New "nice-to-haves" added mid-sprint
**Symptom:** Sprint never completes, timeline slips
**Fix:** FUTURE_SPRINTS.md for deferred ideas

### Anti-Pattern 5: The Layer Mixing
**Problem:** Mixing skeleton, data, and styling work
**Symptom:** Rework, confusion, inconsistent state
**Fix:** Strict layer sequencing (Pass 1 → 2 → 3)

---

## 9. Sprint Interdependencies

### Dependency Types

**Hard Dependency:**
- Sprint B cannot start until Sprint A completes
- Example: VFS implementation → Navigation migration

**Soft Dependency:**
- Sprint B benefits from Sprint A but can proceed
- Example: Design system → Component builds

**Parallelizable:**
- Sprints can run simultaneously
- Example: Hero component + Footer component

### Dependency Documentation

```markdown
## Dependencies

**Blocked By:**
- [Sprint Name] — [reason]

**Blocks:**
- [Sprint Name] — [reason]

**Parallel With:**
- [Sprint Name] — [coordination notes]
```

---

## 10. Sprint Recovery

### When Sprint is Behind

1. **Assess:** How far behind? Why?
2. **Options:**
   - Reduce scope (cut non-critical DoDs)
   - Extend timeline (if acceptable)
   - Add resources (parallel DoDs)
   - Abandon and replan
3. **Decide:** Human makes call
4. **Execute:** Update sprint file, communicate

### When Sprint is Blocked

1. **Identify blocker:** Technical? Dependency? Knowledge?
2. **Escalate:** To appropriate agent or human
3. **Workaround:** Is there an alternative path?
4. **Document:** Record blocker and resolution

### When Sprint Needs Abandonment

1. **Document:** Why being abandoned
2. **Capture:** What was learned
3. **Archive:** Move to `_project-done/` with ABANDONED prefix
4. **Replan:** Create new sprint with adjusted scope

---

## 11. Sprint Metrics

### Efficiency Metrics

| Metric | How to Track | Target |
|--------|--------------|--------|
| DoD completion rate | Completed / Planned | >90% |
| On-time completion | On time / Total | >70% |
| Scope adherence | No-expansion sprints / Total | >95% |
| Regression rate | Sprints with regressions / Total | <10% |

### Quality Metrics

| Metric | How to Track | Target |
|--------|--------------|--------|
| Verification pass rate | First-try passes / Total | >80% |
| Visual revision rate | Revisions required / Total | <20% |
| Post-sprint bugs | Bugs found / Sprint | <1 per sprint |

---

**Next:** [05-audits/codebase.md](../05-audits/codebase.md) - Audit protocols
