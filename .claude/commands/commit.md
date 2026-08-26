---
description: Execute the git commit workflow with strict containment and autonomous execution. Run commit protocol phases: orient, classify, stage precisely, commit with taxonomy tag, push to origin main.
---

# /commit

Run the commit protocol from `.devin/workflows/commit.md` (strict containment, autonomous execution).

## Phase 1 — Orient (MANDATORY FIRST)
Run `git status`, `git diff`, and `git diff --cached` (stat). Map the working tree: staged additions/deletions, unstaged modifications, untracked files. Group them into logical atomic units based on recent work.

## Phase 2 — Strict Constraints & Forbidden Actions
1. **NO FILE DELETION** — never run `rm`, `git rm`, `del`, etc. If files are already deleted in the working dir (shown by `git status` as "deleted"), stage those deletions with `git add <file>` to record the change. The ban is on *deletion commands*, not on staging pre-existing deletions.
2. **NO BLANKET STAGING** — never use `git add .`, `git add -A`, or `git commit -a`. Stage files individually and precisely.
3. **NO CUSTOM ALIASES** — do not use `git ac`.

## Phase 3 — Taxonomy & Formatting
Pick **exactly one** category per commit unit:
- **A** — Forward progress: closes a DoD item on a required component
- **B** — Critical bug fix: resolves a CRITICAL bug blocking a DoD item
- **C** — Refactor: changes code structure without new functionality
- **D** — Configuration: build setup, `.todo` tracking, folder structure, skills/registry
- **E** — Polish: improvements to already-DoD-complete components

Commit message template (tied to DoD):
`Difficulty: <1-13> - <A|B|C|D|E>, <Category> (<scope/filenames>): <action> → DoD:<SprintName>-<item>`

Fallback (no DoD impact): `... → DoD:0 <infrastructure/deferred/etc>`

## Phase 4 — Output & AUTONOMOUS EXECUTION
For each atomic unit, output the planned commands in a PowerShell block, then **immediately execute**:
`git add <specific/file1> <specific/file2>; git commit -m 'Difficulty: <Fib> - <TaxonomyType>, <Category> (<scope>): <action> → DoD:<SprintName-item or 0>'; git push origin main`

Follow `AGENTS.md` resource discipline (shared server/browser, build lock for heavy work, never kill Wispr Flow, one shared dev server on :3000). End each session cleanly — no leftover watch processes.
