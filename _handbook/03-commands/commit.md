# Command Reference: /Commit

---

## Purpose

Autonomous git staging and commit execution with systematic observation.

**Agent Role:** Git Operations Specialist
**Risk Level:** HIGH STRICTNESS REQUIRED

**CRITICAL RULE:** DO NOT DELETE ANY FILES

---

## System Directive

**SYSTEM OVERRIDE & TASK HANDOFF: Git Commit Generation & AUTONOMOUS EXECUTION**

You MUST:
1. Establish complete situational awareness BEFORE generating commands
2. Autonomously execute commands using terminal tools
3. Never output conversational text around commands

---

## Phase 1: Systematic Observation & Orientation (MANDATORY)

**Execute BEFORE formulating ANY git commands.**

### 1.1 Execute Discovery
```powershell
git status
git diff
```

### 1.2 Perform Systematic Observation
Output brief analytical mapping:
```
[Repository State Analysis]

Modified files: [N]
Untracked files: [N]
Deleted files: [N]

Logical groupings identified:
- Group A: [files] → [category]
- Group B: [files] → [category]
```

### 1.3 Orient & Group
Explicitly outline how files group into atomic units based on recent work.

**Map to Taxonomy Categories:**
- A — Forward progress
- B — Critical bug fix
- C — Refactor
- D — Configuration
- E — Polish

---

## Phase 2: Strict Constraints & Forbidden Actions (CRITICAL)

**Read carefully. Violating any is HARD FAILURE.**

### 2.1 NO FILE DELETION
```
❌ rm, git rm, del, remove-item
✅ Only add and modify
```

**Even if file appears obsolete or deleted in diff:**
- Do NOT include removal commands
- Let human handle deletions separately

### 2.2 NO BLANKET STAGING
```
❌ git add .
❌ git add -A
❌ git commit -a
```

**Files MUST be staged individually and precisely.**

### 2.3 NO CUSTOM ALIASES
```
❌ git ac 'message'
✅ git add [file]; git commit -m 'message'
```

### 2.4 NO MIXED CONCERNS
```
❌ One commit with files from different taxonomy categories
✅ Separate commits per category
```

---

## Phase 3: Required Taxonomy & Formatting

### 3.1 Fibonacci Difficulty Scale
```
1  2  3  5  8  13
↑  ↑  ↑  ↑  ↑  ↑
trivial → easy → medium → difficult → very difficult
```

### 3.2 Taxonomy Categories (Pick Exactly One Per Commit)

| Category | Meaning | Use When |
|----------|---------|----------|
| **A** | Forward progress | Closes DoD item on required component |
| **B** | Critical bug fix | Resolves CRITICAL bug blocking DoD item |
| **C** | Refactor | Changes code structure without new functionality |
| **D** | Configuration | Config files, build setup, folder structure, .todo tracking |
| **E** | Polish | Improvements to already-DoD-complete components |

### 3.3 Commit Message Templates

**Option 1 (Tied to DoD):**
```
Difficulty: <1-13> - <A|B|C|D|E>, <Category> (<scope>): <action> — → closes DoD item [N] on [SprintName]
```

**Option 2 (No DoD impact):**
```
Difficulty: <1-13> - <A|B|C|D|E>, <Category> (<scope>): <action> — → closes 0 DoD items, <type>
```

### 3.4 Examples

```
Difficulty: 5 - A, Forward progress (hero): lock typography sprint — → closes all DoD items on TypographySprint
Difficulty: 8 - B, Critical bug fix (hero): resolve image hotspot crash — → fixes CRITICAL bug blocking Hero DoD item 2
Difficulty: 2 - D, Configuration (tailwind): add frozen comment — → closes 0 DoD items, infrastructure
Difficulty: 3 - E, Polish (carousel): optimize touch targets — → closes 0 DoD items, polish
```

---

## Phase 4: Final Output & Autonomous Execution

### 4.1 Planned Commands Output

Format as PowerShell code block:
```powershell
git add <specific/file1> <specific/file2>;
git commit -m 'Difficulty: <Fib> - <TaxonomyType>, <Category> (<scope>): <action> — → <impact>'
```

### 4.2 Immediate Execution

**MUST use terminal/execution tool to run commands directly.**

Do NOT wait for user to copy-paste.

**Execution sequence:**
1. Stage first file group
2. Commit first group
3. Stage second file group
4. Commit second group
5. Continue until all files committed

### 4.3 Execution Confirmation

After all commits:
```
[COMMIT EXECUTION COMPLETE]

Commits made: [N]
1. [hash] [message]
2. [hash] [message]
...

Repository state: clean / [remaining files]
```

---

## Common Patterns

### Single File, Single DoD
```powershell
git add app/components/hero.tsx;
git commit -m 'Difficulty: 5 - A, Forward progress (hero): implement responsive hero section — → closes DoD item 3.2 on HOMEPAGE_SPRINT'
```

### Multiple Files, Same Category
```powershell
git add app/components/hero.tsx app/components/hero.test.ts;
git commit -m 'Difficulty: 5 - A, Forward progress (hero): implement hero with tests — → closes DoD item 3.2 on HOMEPAGE_SPRINT'
```

### Infrastructure Changes
```powershell
git add _project/VFS_REFACTOR.todo;
git commit -m 'Difficulty: 2 - D, Sprint Tracking (VFS_REFACTOR.todo): update progress on catalogue migration — → closes 0 DoD items, sprint planning'
```

### Separate Categories = Separate Commits
```powershell
# First commit - feature
git add app/components/button.tsx;
git commit -m 'Difficulty: 3 - A, Forward progress (button): add secondary variant — → closes DoD item 2.1 on UI_SPRINT'

# Second commit - config
git add tailwind.config.ts;
git commit -m 'Difficulty: 2 - D, Configuration (tailwind): add secondary button color tokens — → closes 0 DoD items, design-system'
```

---

## Error Handling

### Uncommitted Changes from Previous Work
```
WARNING: Repository has uncommitted changes from previous session.

Files: [list]

Options:
A) Include in current commit (if related)
B) Commit separately first
C) Stash and address later

Please advise.
```

### Large Number of Files
```
OBSERVATION: [N] files modified across [M] categories.

Proposed grouping:
Group 1 (A - Forward progress): [files]
Group 2 (D - Configuration): [files]
Group 3 (C - Refactor): [files]

Proceed with this grouping? (yes/no/adjust)
```

### Commit Fails
```
COMMIT FAILED: [error message]

Attempting recovery...
[Recovery steps]

Status: [resolved/needs human intervention]
```

---

## Quick Reference Card

```
/commit

Phase 1: Observe (DISCOVER)
  - git status
  - git diff
  - Group files by category

Phase 2: Constrain (PLAN)
  - Identify A/B/C/D/E categories
  - Select difficulty (1-13)
  - Format messages

Phase 3: Format (PREPARE)
  - PowerShell commands
  - One category per commit
  - No deletions

Phase 4: Execute (AUTONOMOUS)
  - Run git add commands
  - Run git commit commands
  - Confirm completion
```

---

**CRITICAL REMINDER:**
**FOR AGENT NOTE: DO NOT COMMIT YOURSELF.**
Only human web dev commits. Output copy paste commit message only.

Wait for explicit human "execute" command before running git commands.

---

**Related:** [implement.md](implement.md) | [INDEX.md](../INDEX.md)
