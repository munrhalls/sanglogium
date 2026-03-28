# Appendices: Quick Reference Templates

---

## 1. Scope Contract Template

```markdown
### Scope Contract [N]: [Name]
**Rationale:** [Why this scope matters - the strategic reason]

**Scope:**
- [ ] [Specific deliverable with acceptance criteria]
- [ ] [Specific deliverable with acceptance criteria]

**Files at Risk:**
- `[file path]` - [what could go wrong if modified]
- `[file path]` - [what could go wrong if modified]

**Regression Tests Required:**
- [ ] [Test description for risk area A]
  - **Verification:** [exact command]
  - **Code Location:** `[file path]`
- [ ] [Test description for risk area B]
  - **Verification:** [exact command]
  - **Code Location:** `[file path]`

**Out of Scope:**
- [What is explicitly NOT included]
- [What is explicitly NOT included]

**Architecture Decisions:**
- [Decision made to prevent future scope creep]
- [Conscious YAGNI choice]
```

---

## 2. DoD (Definition of Done) Template

```markdown
#### DoD [Phase].[Number] — [Name]
**Purpose:** [What this DoD achieves - the value created]

**Layer:** [Structure/Layout/Surface/Interaction] (for UI work)
**Viewport:** [Desktop 1280px / Mobile 375px] (for UI work)

**Tasks:**
- [ ] [Specific, atomic action]
- [ ] [Specific, atomic action]
- [ ] [Specific, atomic action]

**Code Location:**
- **Read-Only Context:**
  - `[path]` - [what to learn]
  - `[path]` - [what to learn]
- **Allowed Write Scope:**
  - `[path]` - [what to change]

**Verification:**
- **Command:** `[exact PowerShell command]`
- **Expected Result:** [what success looks like]
- **Visual Check:** [for UI: what to verify visually]

**Regression Risk:**
- **Areas Affected:** [list of potentially impacted areas]
- **Mitigation:** [tests or checks to prevent regression]
- **Rollback Plan:** [how to undo if needed]
```

---

## 3. Commit Message Templates

### Template 1: Closes DoD Item
```
Difficulty: <1|2|3|5|8|13> - <A|B|C|D|E>, <Category Name> (<scope>): <action> — → closes DoD item <N> on <SprintName>
```

**Examples:**
```
Difficulty: 5 - A, Forward progress (hero): implement responsive layout — → closes DoD item 3.2 on HOMEPAGE_SPRINT
Difficulty: 3 - B, Critical bug fix (auth): resolve token expiration — → fixes CRITICAL bug blocking Auth DoD item 1
Difficulty: 8 - C, Refactor (api): extract shared fetch logic — → closes DoD items 2.1, 2.2 on API_REFACTOR
Difficulty: 2 - D, Configuration (tailwind): add custom color tokens — → closes 0 DoD items, infrastructure
Difficulty: 3 - E, Polish (carousel): optimize touch target sizing — → closes DoD item 5.1 on UX_POLISH
```

### Template 2: No DoD Impact
```
Difficulty: <1|2|3|5|8|13> - <A|B|C|D|E>, <Category> (<scope>): <action> — → closes 0 DoD items, <type>
```

**Type Examples:**
- `infrastructure` - Build, config, tooling
- `housekeeping` - Cleanup, organization
- `documentation` - Docs, comments
- `sprint planning` - .todo files, tracking
- `data maintenance` - Sync, update

---

## 4. Agent Handoff Document Template

```markdown
# Agent Handoff Document
**Date:** [YYYY-MM-DD HH:MM]
**From:** [Source Agent Type]
**To:** [Target Agent Type]
**Sprint:** [Sprint Name]
**Scope:** [Scope Contract reference]

## Work Completed
- [x] [DoD completed with brief description]
- [x] [DoD completed with brief description]

## Current State
- **Files Modified:**
  - `[path]` - [what was changed]
  - `[path]` - [what was changed]
- **Tests Status:** [pass/fail/pending]
- **Build Status:** [pass/fail]
- **Known Issues:** [none or list]
- **Blockers:** [none or list]

## Next Actions Required
1. [ ] [Explicit action with expected outcome]
2. [ ] [Explicit action with expected outcome]
3. [ ] [Explicit action with expected outcome]

## Context to Preserve
- [Critical information the next agent needs]
- [Decisions made and why]
- [Patterns to follow]
- [Anti-patterns to avoid]

## Verification Checkpoint
**Command:** `[exact command]`
**Expected Result:** [description]
**Current Status:** [pass/fail/not run]

## Notes
[Anything else relevant for the handoff]
```

---

## 5. Sprint File Template

```markdown
# [SPRINT_NAME].todo
# [One-line description]
# Reference: [related documents]
# Created: [YYYY-MM-DD]

---

## 🎯 Sprint Objective
**[Clear, specific statement of what will be achieved]**

**Current State:** [Where we are now - honest assessment]
**Target State:** [Where we will be when complete]

---

## 🧪 Test-First Mandate
**This sprint MUST begin with tests that define expected behavior and MUST end with tests that verify implementation. Test execution results determine sprint completion status.**

---

## 📋 Scope Contracts

### Scope Contract 1: [Name]
**Rationale:** [Why this matters]

**Scope:**
- [ ] [Deliverable]

**Files at Risk:**
- `[path]` - [risk]

**Regression Tests Required:**
- [ ] [Test]
  - **Verification:** [command]

---

## 🏗️ Sequenced DoD Layers

### Phase 0: Pre-Flight Regression Tests (MUST RUN FIRST)
#### DoD 0.1 — [Name]
- [ ] [Action]
- **Verification:** [command]

### Phase 1: Skeleton Pass
#### DoD 1.1 — [Name]
- [ ] [Action]
- **Code Location:** `[path]`
- **Verification:** [command]

### Phase 2: Data Pass
[DoDs...]

### Phase 3: Desktop Build (1280px)
[Layer 1-4 DoDs...]

### Phase 4: Mobile Build (375px)
[Layer 1-4 DoDs...]

### Phase 5: Final Regression
[DoDs...]

---

## 📊 Test Matrix

| Test Category | Count | Location | Status |
|---------------|-------|----------|--------|
| [Category] | [N] | `[path]` | ⬜ |

---

## 📅 Estimated Effort

| Phase | Difficulty | Est. Time |
|-------|-----------|-----------|
| [Phase] | [1-13] | [time] |
| **Total** | **[sum]** | **[sum]** |

---

## ✅ Sprint Completion Checklist

- [ ] All Phase 0 regression tests pass
- [ ] All DoDs complete
- [ ] Build succeeds
- [ ] No regressions

---

## 🚀 Execution Order

1. [Step 1]
2. [Step 2]
...
```

---

## 6. Architecture Decision Record Template

```markdown
## ADR-[N]: [Title]
**Date:** [YYYY-MM-DD]
**Status:** [Proposed | Accepted | Deprecated | Superseded by ADR-[N]]

### Context
[What is the issue that we're seeing that is motivating this decision or change?]

### Decision
[What is the change that we're proposing or have agreed to implement?]

### Consequences
**Positive:**
- [Benefit 1]
- [Benefit 2]

**Negative:**
- [Drawback 1]
- [Drawback 2]

### Rationale
[Why this decision was made - the reasoning]

### Alternatives Considered
- [Alternative 1] - [why rejected]
- [Alternative 2] - [why rejected]
```

---

## 7. Coherence Violation Report Template

```markdown
## Coherence Violation #[N]
**Date:** [YYYY-MM-DD]
**Type:** [Scope | Truth | Rule | Temporal | Cross-Agent]
**Severity:** [Critical | High | Medium | Low]

### What Happened
[Clear description of the incoherence]

### Root Cause
[Analysis of why it happened]

### Impact
[What was affected by this violation]

### Resolution
[How it was or will be fixed]

### Prevention
[Steps to prevent recurrence]
- [ ] [Action item]
- [ ] [Action item]
```

---

## 8. Daily Cover Check Template

```markdown
## Daily Cover Check - [YYYY-MM-DD]

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
- [ ] Did I verify previous scope is still working?
- [ ] Did I run regression tests?
- [ ] Is the critical path still clear?

### Notes
[Observations, blockers, decisions]
```

---

## 9. Agent Naming Convention Quick Reference

| Prefix | Meaning | Example |
|--------|---------|---------|
| D## | Debug session | D01_VFS_Debug |
| I## | Implementation | I02_Cart_Implement |
| T## | Testing | T03_API_Testing |
| A## | Audit/Review | A04_Code_Audit |
| R## | Research | R05_VFS_Research |
| F## | Fix/Bugfix | F06_Login_Fix |
| S## | Sprint planning | S07_Q2_Planning |

**Status Suffixes:**
- `_Active` - Currently working
- `_Blocked` - Waiting on dependency
- `_Review` - Needs review
- `_Done` - Completed

**Full Example:** `D01_VFS_Debug_Active`

---

## 10. Fibonacci Difficulty Quick Reference

| Value | Meaning | Use When |
|-------|---------|----------|
| **1** | Trivial | Typo fix, comment update, simple config |
| **2** | Easy | Single file change, well-understood pattern |
| **3** | Relatively Easy | Small component, clear requirements |
| **5** | Medium | Multi-file change, some complexity |
| **8** | Difficult | Complex feature, new pattern, uncertainty |
| **13** | Very Difficult | Large scope, high risk, novel approach |

---

## 11. Taxonomy Category Quick Reference

| Category | Use When | Commit Message Prefix |
|----------|----------|----------------------|
| **A** | Closing DoD item | Forward progress |
| **B** | Fixing critical bug | Critical bug fix |
| **C** | Restructuring code | Refactor |
| **D** | Config/tooling/tracking | Configuration |
| **E** | Improving complete work | Polish |

---

**Next:** [quick-reference-cards.md](quick-reference-cards.md) - One-page reference cards
