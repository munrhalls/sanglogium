---
allowed-tools: Bash(git add:*), Bash(git reset:*), Bash(git status:*), Bash(git commit:*), Bash(git log:*), Bash(git rev-parse:*), Bash(git branch:*), Bash(git -C:*)
description: One git commit under a hard token budget; keeps the DoD taxonomy (bounded, single-shot)
---

## Cost contract (read once)
- **Budget: <=2 tool calls and 300 output tokens for the whole command.** One shot, then stop.
- **Forbidden:** reading files (including `.devin/workflows/*`), full-patch `git diff`,
  `git diff --cached`, `git show`, per-file diffs, listing dirs, token accounting.
- The bounded facts below are the *whole* picture. Do not re-run or expand them.

## Bounded facts (already computed)
- Root: !`git rev-parse --show-toplevel 2>/dev/null || echo NOT_A_REPO`
- Branch: !`git branch --show-current 2>/dev/null`
- Tracked (cap 20): !`git status --porcelain=v1 --untracked-files=no 2>/dev/null | head -20`
- Untracked count: !`git status --porcelain=v1 --untracked-files=all 2>/dev/null | grep -c '^??'`
- Change stat (cap 25, excludes untracked): !`git diff --stat HEAD 2>/dev/null | tail -25`
- Recent style: !`git log --oneline -5 --no-decorate 2>/dev/null`

## Task
1. If Root is `NOT_A_REPO`, reply `not a git repo: <cwd>` and stop. Never search other dirs/repos.
2. Write **one** subject in the existing style; if recent commits use the taxonomy, keep it:
   `Difficulty: <1-13> - <A|B|C|D|E>, <Category> (<scope>): <action> -> DoD:<SprintName-item>`
   (**A** progress, **B** critical fix, **C** refactor, **D** config, **E** polish;
   fallback `-> DoD:0 <infra/deferred>`). Use the stat counts above — do not read the code.
3. Make **exactly one** tool call (chained = one turn), substituting root + subject. No deletion
   commands, no per-file staging, no push, and never stage generated dumps (`backups/`, `*.db`,
   build/dataset output) even if `.gitignore` misses them:
   ```
   git -C <root> add -A && git -C <root> reset -q -- '*backups*' '*.db' '*.db-wal' '*.db-shm' && git -C <root> commit -q -m "<subject>" && git -C <root> log -1 --format='%h %s'
   ```
4. Reply with **only** that `%h %s` line. No summary, no diff dump, no commentary.
