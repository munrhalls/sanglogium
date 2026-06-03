---
description: Prime every AI conversation with beads-aware context — find issue, establish two-path framework, enforce happy-path-first ordering
---

# /operational-prime

**Purpose:** Before ANY work begins, establish full beads context. Every conversation starts here.

**Role:** Context-aware agent. Your job is to read the beads tracker, understand the issue's state, and enforce the work approach rules before any implementation.

---

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
- If `status = meta`: skip Steps 2–3 rules — meta issues (research, testing, cross-cutting) have no happy-path structure; work directly on the research/tracking objective
- Verify two-path structure: Happy Path + Edge Cases Path
- Check lock state: 🔒 (locked) or 🔓 (unlocked)
- Determine: work on happy path OR edge cases

### If NO issue exists:
**STOP. Do NOT proceed without a beads issue.**
- Run `@/add-beads-issue` to create one with two-path structure
- The new issue MUST include: Happy Path (tasks + acceptance) + Edge Cases Path (🔒 LOCKED placeholder)

---

## Step 2: Work Approach Rules (NEVER broken)

### Rule 1: Happy-Path-First Ordering
- If happy path live checks are NOT all passing → work **ONLY** on happy path
- Edge cases path is **LOCKED** until happy path is complete
- **Never** work on edge cases before happy path passes with evidence

### Rule 2: Frame Inside Issue Only
- `@/frame-decompose` output goes **INSIDE** the beads issue notes
- **NEVER** create `docs/` files during active work
- **NEVER** create `framed-objective.md` or `tasks-decomposition.md` in `docs/`
- Beads issue is the **only** canonical spec during active work

### Rule 3: No Separate Issues for Edge Cases
- Edge cases go into the parent issue's **Edge Cases Path**
- Creating a new issue for an edge case = **VIOLATION**
- If you find an edge case issue → **close it**, add to parent

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
**Happy Path:** [in_progress / complete / not_started]
**Edge Cases:** [🔒 LOCKED / 🔓 UNLOCKED]

### Happy Path Progress
[Current tasks + which are done]

### Live Checks
- [ ] [Check 1]
- [ ] [Check 2]

### What to Work On Next
[Recommended next task based on happy-path-first rule]
```

---

## Step 4: Verification Before Claiming Done

Before claiming work is complete:
- [ ] All happy path acceptance checks pass with evidence
- [ ] Beads issue updated with live check results
- [ ] No `docs/` files created during work
- [ ] No separate issues created for edge cases
- [ ] Typecheck passes: `npx tsc --noEmit`
- [ ] `@/checks` run — 0 gaps, 0 red flags
- [ ] **Advisory:** Run `npm run build` manually when no other agents are active; CI catches build errors

---

## Anti-Patterns

| Pattern | Why It Breaks |
|---------|---------------|
| Working on edge cases before happy path | Core flow broken, no foundation, wasted effort |
| Creating separate issue for edge case | Violates one-feature-one-issue; scatters context |
| Frame output in `docs/` | Spec drift; beads issue becomes stale |
| Skipping beads issue, working from prompt | No tracking, no acceptance criteria, scope drift |
| One conversation doing analysis + implementation | Scope creep, noise, no clear hand-off |
| Updating issue without live check evidence | False progress, untrustworthy status |
