# Getting Started: Handbook Guide

---

## Welcome

This handbook contains everything needed to orchestrate AI agentic workflows for the Sang-Logium project. It's designed for both the human web developer and the AI agent team.

---

## Quick Start

### If You're a Human (New to This System)

1. **Read First:** [01-fundamentals/first-principles.md](01-fundamentals/first-principles.md)
   - Understand the core mental models
   - Learn the deterministic execution protocol
   - Master the Cover & Move strategy

2. **Learn Commands:** [03-commands/](03-commands/)
   - `/implement` - For feature work
   - `/debug` - For bug fixes
   - `/sprint` - For planning
   - `/commit` - For git operations

3. **Bookmark Reference:** [07-appendices/quick-reference-cards.md](07-appendices/quick-reference-cards.md)
   - One-page cheat sheets for common tasks

4. **Use This Pattern:**
   ```
   /sprint [target state] [rough scope]
   [Review and approve sprint]

   /implement [refined scope] [DoDs]
   [Execute with human checkpoints]

   /commit
   [Autonomous git operations]
   ```

### If You're an AI Agent

1. **Read First:** [01-fundamentals/first-principles.md](01-fundamentals/first-principles.md)
   - Truth above all
   - Deterministic execution
   - Zero regression discipline

2. **Check Constitution:** [.windsurfrules](../../.windsurfrules)
   - This overrides all other instructions
   - Core architectural constraints
   - Command protocols

3. **Follow Your Workflow:** [.windsurf/workflows/](../../.windsurf/workflows/)
   - Phase 1: Plan and Contain (OUTPUT ONLY)
   - Phase 2: Execute (MODIFY FILES)
   - Phase 3: Verify (RUN COMMANDS)

4. **Use Taxonomy:** [07-appendices/templates.md](07-appendices/templates.md)
   - Fibonacci difficulty (1, 2, 3, 5, 8, 13)
   - A/B/C/D/E categories
   - Commit message format

---

## Key Documents by Role

### For Strategic Planning
- [INDEX.md](../INDEX.md) - Handbook overview and navigation
- [01-fundamentals/first-principles.md](01-fundamentals/first-principles.md) - Core philosophy
- [06-coherence/governance.md](06-coherence/governance.md) - System governance

### For Sprint Management
- [04-sprints/lifecycle.md](04-sprints/lifecycle.md) - Sprint types and lifecycle
- [03-commands/sprint.md](03-commands/sprint.md) - Sprint command reference
- [07-appendices/templates.md](07-appendices/templates.md) - Sprint templates

### For Daily Execution
- [03-commands/implement.md](03-commands/implement.md) - Feature implementation
- [03-commands/debug.md](03-commands/debug.md) - Debugging protocol
- [03-commands/test.md](03-commands/test.md) - Testing protocol
- [03-commands/commit.md](03-commands/commit.md) - Git operations

### For System Health
- [05-audits/ai-leverage.md](05-audits/ai-leverage.md) - AI-leverage audit protocol
- [06-coherence/governance.md](06-coherence/governance.md) - Coherence maintenance
- [07-appendices/quick-reference-cards.md](07-appendices/quick-reference-cards.md) - Daily checklists

### For Team Orchestration
- [02-orchestration/architecture.md](02-orchestration/architecture.md) - Agent team structure
- [02-orchestration/coordination-patterns.md](02-orchestration/coordination-patterns.md) - Handoff patterns

---

## Common Workflows

### Workflow 1: New Feature Development

```
Step 1: /sprint
  - Agent generates sprint file
  - Human reviews and approves

Step 2: /implement (for each DoD)
  - Agent executes with Phase 1-3 discipline
  - Human verifies at checkpoints

Step 3: /test
  - Agent creates/runs tests
  - Verify 100% pass

Step 4: /commit
  - Agent stages and commits
  - Human confirms push
```

### Workflow 2: Bug Fix

```
Step 1: /debug
  - Agent performs Component Archaeology
  - Identifies root cause
  - Human approves analysis

Step 2: /implement
  - Agent applies minimal fix
  - Adds regression test
  - Human verifies fix

Step 3: /commit
  - B-category commit
  - Documents the fix
```

### Workflow 3: Refactoring

```
Step 1: /sprint
  - Scope: restructure without behavior change
  - Heavy on regression tests

Step 2: /implement
  - Execute refactor DoDs
  - Verify tests still pass

Step 3: /audit
  - Verify no unintended changes
  - Confirm pattern consistency

Step 4: /commit
  - C-category commits
```

---

## Critical Reminders

### For Humans

1. **Approval Checkpoints:**
   - Sprint plan before execution
   - Scope boundaries when unclear
   - Visual state after implementation
   - Root cause before bug fix
   - Commit before git execution

2. **Daily Ritual:**
   - Run Daily Cover Check ([QRC-6](07-appendices/quick-reference-cards.md))
   - Verify no scope drift
   - Confirm critical path clear

3. **Weekly Ritual:**
   - Review active sprints
   - Check agent adherence metrics
   - Update FUTURE_SPRINTS.md

4. **Monthly Ritual:**
   - Run AI-Leverage Maturity Audit
   - Update .windsurfrules if needed
   - Archive completed sprints

### For Agents

1. **Never Skip Phase 1:**
   - Plan and Contain is MANDATORY
   - No file modifications before Phase 1 output

2. **Respect Boundaries:**
   - Read-Only Context Paths are FORBIDDEN
   - Allowed Write Scope Paths are EXCLUSIVE
   - If unclear, HALT and clarify

3. **Verify or Halt:**
   - Verification command must pass 100%
   - If fails, revert and fix
   - Never proceed with unverified changes

4. **Taxonomy Discipline:**
   - Every commit categorized A/B/C/D/E
   - Every commit has Fibonacci difficulty
   - Commit message follows template exactly

---

## Emergency Procedures

### If Scope Drift Detected
1. STOP all work immediately
2. Document what was about to be modified
3. Add to FUTURE_SPRINTS.md
4. Return to original scope
5. Resume only with explicit approval

### If Verification Fails Repeatedly
1. Revert the failing changes
2. Re-evaluate the approach
3. Consider escalating to Debug Agent
4. Do not force the implementation

### If Agent Contradicts Constitution
1. Constitution (.windsurfrules) wins
2. Document the contradiction
3. Escalate to human for resolution
4. Update workflow if needed

### If Timeline Threat Detected
1. Run Daily Cover Check
2. Assess impact on critical path
3. Options: reduce scope / extend timeline / replan
4. Human makes the call

---

## File Locations Quick Reference

| What | Where |
|------|-------|
| Core rules | `.windsurfrules` |
| Extended memory | `.windsurf/memories/architecture.md` |
| Agent workflows | `.windsurf/workflows/*.md` |
| Sprint tracking | `_project/*.todo` |
| Command protocols | `_project/COMMANDS/*.md` |
| Scope templates | `_project/SCOPE/*.md` |
| Research/learn | `_contexts/` |
| This handbook | `_handbook/` |
| Commit template | `_project/COMMIT_TEMPLATE.txt` |

---

## Support and Escalation

### When to Escalate to Human
- Scope boundaries unclear
- Verification keeps failing
- Root cause uncertain
- Timeline threat detected
- Rule contradiction found

### When to Self-Resolve
- Following established workflow
- Clear scope and DoDs
- Verification passes
- No boundary violations

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-27 | Initial comprehensive handbook |

---

**Next Step:** Choose your role above and begin with the recommended first document.
