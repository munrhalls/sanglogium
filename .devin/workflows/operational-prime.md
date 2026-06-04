---
description: Prime every AI conversation with beads-aware context — find issue, identify active scope, enforce scope-sequential ordering
---

# /operational-prime

**Purpose:** Before ANY work begins, establish full beads context. Every conversation starts here. 

**Role:** Context-aware agent. Your job is to read the beads tracker, understand the issue's state, and enforce the work approach rules before any implementation.

---

## Step 0: Be aware of parallel workflow, respect resource usage, respect mutex rules
- DO NOT RUN ANY EXPENSIVE COMMANDS (e.g. npm run build, etc.) UNLESS ABSOLUTELY NECESSARY
- NEVER RUN the most expensive commands, e.g. npm run build etc. 
- BE AWARE: as you are working, other agents are working on other issues simultaneously, either in /read-mode or /edit-mode - therefore, respect PC resources and try to accomplish your task in resources-lean manner
- being resources-lean DOES NOT MEAN the quality of your work can be lower - it must be up to professional standard of simplicity, leanness, accuracy, system-alignment and completeness
- being resources-lean MEANS you never run the most expensive commands (npm run build, etc.) and you never run expensive commands unless absolutely unavoidable

## Step 1: Find the Beads Issue

```bash
bd ready
```

Identify the feature's canonical issue. If multiple match, ask: "Which feature?"

### If issue exists:
```bash
bd show <id>
```
- Read the issue **completely** (description + all notes)
- If `status = meta`: skip Steps 2–3 rules — meta issues have no scope structure; work directly on the research/tracking objective
- Verify structure: Critical Intelligence + SHOULD BE Scopes + DoD Items
- Identify **active scope**: first scope with any DoD item not marked PASS
- Verify: all prior scopes have ALL DoD items PASS. If not → complete prior scope first

### If NO issue exists:
**STOP. Do NOT proceed without a beads issue.**
- Run `@/add-beads-issue` to create one with three-section structure
- The new issue MUST include: Critical Intelligence (optional) + SHOULD BE Scopes + DoD Items

---

## Step 2: Work Approach Rules (NEVER broken)

### Rule 1: Scope-Sequential Ordering
- Work **ONLY** on the active scope (first incomplete scope)
- Later scopes are inactive until all DoD items for the active scope pass with evidence
- **Never** work on Scope N+1 before Scope N is done

### Rule 2: Frame Inside Issue Only
- `@/frame-decompose` output goes **INSIDE** the beads issue notes
- **NEVER** create `docs/` files during active work
- **NEVER** create `framed-objective.md` or `tasks-decomposition.md` in `docs/`
- Beads issue is the **only** canonical spec during active work

### Rule 3: One Issue Per Feature
- All scopes for one feature live in one issue
- Creating a new issue for the same feature = **VIOLATION**
- If you find a duplicate issue → **close it**, merge content into canonical issue

### Rule 4: Live Checks + Update Issue
- Every task needs a live check (manual verification, not just `/test`)
- Update the beads issue with results:
  ```bash
  bd note <id> -- "Live check [N]: [PASS/FAIL] — [evidence]"
  ```
- Evidence: logs, screenshots, curl output, manual observation
- **No progress without issue update**

### Rule 5: Single Responsibility Per Conversation
- You have **ONE job** per conversation
- **Do NOT** analyze + orchestrate + implement in one conversation
- Use the chain:
  ```
  @/system-and-root-cause-analyzer → @/beads-orchestrator → @/frame-decompose → implement
  ```

---

## Step 3: Show Full Context to User

After reading the issue, output this format:

```markdown
## Beads Context — <id>

**Feature:** [title]
**Status:** [open / in_progress / blocked / closed]
**Active Scope:** [Scope N: description]
**Prior Scopes:** [N-1 complete / X incomplete]

### Active Scope DoD
- [ ] [DoD item 1]
- [ ] [DoD item 2]

### What to Work On Next
[Implement active scope until all DoD items pass]
```

---

## Step 4: Verification Before Claiming Done

Before claiming work is complete:
- [ ] All DoD items for active scope PASS with evidence
- [ ] Beads issue updated with live check results (human check)
- [ ] No `docs/` files created during work
- [ ] No separate issues created for scopes
- [ ] `@/checks` run — 0 gaps, 0 red flags (human/agent intelligence review — does NOT trigger any command execution)

---

## Anti-Patterns

| Pattern | Why It Breaks |
|---------|---------------|
| Working on Scope N+1 before Scope N is done | No foundation, untested assumptions, wasted effort |
| Creating separate issue for same feature | Violates one-feature-one-issue; scatters context |
| Frame output in `docs/` | Spec drift; beads issue becomes stale |
| Skipping beads issue, working from prompt | No tracking, no acceptance criteria, scope drift |
| One conversation doing analysis + implementation | Scope creep, noise, no clear hand-off |
| Updating issue without live check evidence | False progress, untrustworthy status |

