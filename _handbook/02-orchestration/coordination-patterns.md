# Orchestration: Coordination Patterns & Handoffs

---

## 1. Agent Handoff Patterns

### 1.1 Sequential Handoff (Most Common)

```
Sprint Agent → Implement Agent → Test Agent → Commit Agent
    (Plan)         (Build)        (Verify)       (Record)
```

**Trigger Conditions:**
- New feature work starts
- Bug fix workflow initiated
- Refactoring scope defined

**Handoff Deliverables:**
- Explicit Refined Scope document
- Allowed Write Scope Paths list
- Verification Command specification

### 1.2 Debug → Implement Handoff

```
Debug Agent identifies root cause → Implement Agent applies minimal fix
```

**Critical Rule:** Debug Agent does NOT implement fixes. Analysis only.

**Handoff Requirements:**
- Root Cause Hypothesis documented
- Relevant Components list
- Allowed Write Scope Paths (minimal)
- Regression test specification

### 1.3 Parallel Coordination (Advanced)

```
         ┌→ Implement Agent (Component A)
Sprint ──┼→ Implement Agent (Component B)
         └→ Test Agent (Test suite preparation)

         All converge → Integration verification
```

**Use Case:** Multiple independent components in same sprint
**Risk:** Integration failures at convergence point
**Mitigation:** Clear interface contracts defined upfront

---

## 2. Context Preservation Protocols

### 2.1 The Handoff Document Template

When passing work between agents, use:

```markdown
# Agent Handoff Document

## Source Agent
[Agent type] at [timestamp]

## Work Completed
- [Item 1]
- [Item 2]

## Current State
- Files modified: [list]
- Tests status: [pass/fail/pending]
- Blockers: [none/list]

## Next Actions Required
1. [Explicit action]
2. [Explicit action]

## Context to Preserve
- [Critical information agent 2 needs]
- [Decisions made by agent 1]

## Verification Checkpoint
Command: [exact command]
Expected result: [description]
```

### 2.2 Context Window Management

**Problem:** Long conversations lose context window efficiency

**Solutions:**
1. **Summarize and Restart:** For work >20 turns, summarize and start fresh agent
2. **Reference, Don't Repeat:** Link to documents instead of quoting
3. **State Files:** Write progress to disk, load in new agent session

**Pattern:**
```
Turn 1-15: Initial work
Turn 16:    Write progress.txt with key decisions
Turn 17-30: Continue
Turn 31:    Update progress.txt
...
New agent:  Load progress.txt, continue
```

---

## 3. Human-in-the-Loop Checkpoints

### 3.1 Mandatory Human Approval Points

| Checkpoint | When | Why |
|------------|------|-----|
| Sprint Plan | Before any DoD work | Strategic alignment |
| Scope Boundaries | When paths unclear | Prevent drift |
| Visual State | After implementation | UI/UX correctness |
| Root Cause | Before bug fix | Correct fix target |
| Commit | Before git execution | Final review |

### 3.2 Automated → Human Handoff Protocol

When automated agent reaches human checkpoint:

1. **Pause:** Agent stops all work
2. **Summarize:** Clear bullet points of current state
3. **Present Options:** What can happen next
4. **Request Explicit Signal:** Human must provide clear direction
5. **Resume:** Agent continues with human instruction

**Template:**
```
[HUMAN CHECKPOINT REACHED]

Current State:
• [3-5 bullet points]

Awaiting Your Decision:
Option A: [description]
Option B: [description]
Option C: [description]

Please respond with your choice and any additional instructions.
```

---

## 4. Conflict Resolution

### 4.1 When Agents Disagree

**Scenario:** Debug Agent says root cause is X, but human suspects Y

**Resolution Protocol:**
1. Debug Agent presents evidence for X
2. Human presents evidence for Y
3. Both analyze together via Component Archaeology
4. Root cause determined by evidence, not authority
5. Document decision and rationale

### 4.2 When Scope is Ambiguous

**Scenario:** Agent unsure if file is in scope

**Resolution:**
1. Agent HALTS
2. Presents: "I need clarification on scope"
3. Lists: File in question, proposed action, risk assessment
4. Human provides yes/no + any adjustments
5. Agent proceeds with clarified scope

### 4.3 When Verification Fails

**Scenario:** Agent implementation doesn't pass verification

**Resolution:**
1. Agent attempts fix (1-2 iterations)
2. If still failing, agent HALTS
3. Presents: Failure analysis, attempted fixes, remaining issues
4. Human decides: continue debug, escalate, or adjust scope
5. Document learning for future similar cases

---

## 5. Session Management Patterns

### 5.1 Single-Session Workflow

**Use Case:** Small scope, <2 hours estimated

**Pattern:**
- One agent session from start to finish
- Human checkpoints within same session
- Commit at end

### 5.2 Multi-Session Workflow

**Use Case:** Large scope, >2 hours or spanning days

**Pattern:**
```
Session 1: Sprint Agent creates plan → Save to scope-contract.md
Session 2: Implement Agent loads contract → DoDs 1-3
Session 3: Implement Agent continues → DoDs 4-6
Session 4: Test Agent → Verification
Session 5: Commit Agent → Finalization
```

**State Preservation:**
- Write `progress-[scope].md` at end of each session
- Include: completed DoDs, current issues, next DoD to start
- Load this file at start of next session

### 5.3 Emergency Session Interruption

**When session crashes or is interrupted:**

1. Check `git status` for uncommitted changes
2. Review last modified files
3. Check for any `progress-*.md` files
4. Resume with new agent, loading all context
5. First action: verify current state matches expectations

---

## 6. Cross-Agent Learning

### 6.1 Pattern Documentation

When agent discovers effective pattern:

1. Document in `_contexts/sops/prompting/`
2. Name: `[pattern-type]-[brief-description].md`
3. Include: Context, Problem, Solution, Result

### 6.2 Anti-Pattern Documentation

When agent encounters failure mode:

1. Document in `_contexts/sops/prompting/`
2. Name: `anti-pattern-[description].md`
3. Include: What happened, Why it failed, How to avoid

### 6.3 Agent Feedback Loop

After each completed scope:

1. What worked well in this agent configuration?
2. What context was missing?
3. What verification caught issues?
4. What slipped through?
5. Update workflows based on findings

---

## 7. Priority Escalation

### 7.1 Priority Levels

| Level | Name | Response Time | Examples |
|-------|------|---------------|----------|
| P0 | Critical | Immediate | Production down, data loss |
| P1 | High | Same session | Blocking bug, security issue |
| P2 | Medium | Next session | Feature completion, optimization |
| P3 | Low | Next sprint | Documentation, polish |

### 7.2 Escalation Path

```
Implement Agent encounters blocking issue
           ↓
    Can it be worked around?
         ↙        ↘
       Yes        No
        ↓          ↓
   Document    Escalate to
   workaround  Debug Agent +
               Human
```

---

## 8. Tool Integration Patterns

### 8.1 Windsurf Cascade Integration

**Current Implementation:**
- Slash commands trigger workflows
- Human provides rough scope/DoDs
- Agent executes deterministic protocol
- Human verifies at checkpoints

**Optimal Usage:**
- Keep conversations focused (one scope per agent tab)
- Use naming convention: `[TYPE][##]_[SCOPE]_[STATUS]`
- Restart agent for truly new scope (prevents context pollution)

### 8.2 MCP (Model Context Protocol) Integration

**Current State:** Basic static resources
**Target State:** Full retrieval service

**Required Capabilities:**
```typescript
// Current gaps to implement
{
  list_subsystems(): string[];
  get_files_for_subsystem(key: string): string[];
  find_relevant_context(task: string): ContextDocument[];
}
```

### 8.3 Mission Control Integration

**Pattern:**
1. Create task in Mission Control for each active scope
2. Agent updates status as work progresses
3. Dashboard provides global visibility
4. Cost tracking per agent session

---

## 9. Coordination Anti-Patterns

### 9.1 The Overlapping Agents Problem

**Anti-Pattern:** Multiple agents working on same files simultaneously

**Symptoms:**
- Git conflicts on every commit
- Files modified by "someone else"
- Lost work

**Prevention:**
- Clear Allowed Write Scope Paths per agent
- Sequential execution, not parallel
- Git status check before any writes

### 9.2 The Context Pollution Problem

**Anti-Pattern:** One agent session for multiple unrelated scopes

**Symptoms:**
- Agent references wrong scope
- Confused about current task
- Implements wrong feature

**Prevention:**
- New agent tab per scope
- Clear scope statement at start
- Restart agent for new scope

### 9.3 The Silent Failure Problem

**Anti-Pattern:** Agent fails but doesn't halt

**Symptoms:**
- Build passes but doesn't work
- "I'll fix it later"
- Accumulated technical debt

**Prevention:**
- Verification commands that must pass
- Explicit HALT on failure
- Human checkpoint before proceeding

---

## 10. The Coordination Checklist

- [ ] Agent naming convention applied
- [ ] Scope boundaries explicitly defined
- [ ] Handoff documents used for multi-session work
- [ ] Human checkpoints identified before starting
- [ ] State preservation plan documented
- [ ] Conflict resolution protocol understood
- [ ] Priority escalation path clear
- [ ] No overlapping write scopes
- [ ] Verification commands tested
- [ ] Progress tracking file created for long work

---

**Next:** [03-commands/implement.md](../03-commands/implement.md) - Complete command reference
