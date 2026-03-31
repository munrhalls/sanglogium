# workflows: Rigid Phase Gates vs Continuous Execution

**Date:** 2026-03-31  
**Source:** S9-TTFB-OPTIMIZATION Sprint  
**Severity:** Medium  
**Frequency:** Recurring (when user wants autonomous execution)  
**Status:** Active

---

## The Problem

`/implement` protocol (Phase 3) requires: verification → PAUSE → visual check → commit generation. This rigid gating conflicted with user intent to execute full sprint without interruption.

**Issues encountered:**
1. User had to explicitly override protocol with "proceed with all subsequent phases without asking for permission"
2. Sprint-specified branch `perf/S9-ttfb-batched-queries` was never created — implementation landed directly on `main`
3. Protocol friction added unnecessary communication overhead (~2 minutes explaining why stopping)

**Root causes:**
- Protocol assumed human wants to verify at each gate; user wanted autonomous execution
- No automation for branch creation/management
- No enforcement of branch workflow before code changes
- Commit generation step was completely bypassed due to override

## The Pattern

**Two execution modes needed:**

| Mode | Use When | Behavior |
|------|----------|----------|
| **gate** (default) | New/uncertain work, complex changes | Pause at each verification point for human approval |
| **continuous** | Trusted pattern, clear scope | Execute all DoDs, pause only on verification failures |

## Pre-Flight Checklist Solution

Add to `/implement` Phase 1:

```markdown
## Pre-Flight Verification (Before Any Code Changes)

- [ ] Branch check: `git branch --show-current` matches sprint spec
- [ ] If mismatch: `git checkout -b [sprint-branch]` before any writes
- [ ] Verify build passes on clean state (detect pre-existing failures)
- [ ] Execution mode confirmed: [gate | continuous]
```

## Execution Mode Flag

Add to `/implement` input:

```markdown
**Execution Mode:** [gate | continuous]
- gate: Pause at each verification point (default, conservative)
- continuous: Execute all DoDs, pause only on verification failures
```

## Prevention

**For workflow designers:**
- Always provide execution mode choice
- Pre-flight checks must happen before any file changes
- Branch creation should be automated, not manual
- Don't assume human-in-the-loop at every gate

**For users:**
- Specify `continuous` mode when you want full autonomy
- Verify pre-flight checklist executed before implementation starts

## Applicability

**When to apply this lesson:**
- Designing slash command workflows
- When user wants autonomous agent execution
- Branch management in sprint workflows
- Any workflow with phase gates

**Keywords for retrieval:**
- "workflow"
- "implement"
- "phase-gate"
- "continuous"
- "branch"
- "autonomy"
- "execution-mode"

**Related lessons:**
- [pre-existing-infrastructure-errors.md](../failures/pre-existing-infrastructure-errors.md) — Build verification

---

## Codification Log

**Integrated into:**
- [x] `_project/lessons/workflows/` — This file
- [x] INDEX.md — Keywords added
- [ ] `.windsurf/workflows/implement.md` — Add pre-flight checklist and execution mode

**Date integrated:** 2026-03-31
