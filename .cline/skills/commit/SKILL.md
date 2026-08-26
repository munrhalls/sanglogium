---
name: commit
description: Execute the git commit workflow with strict containment and autonomous execution. Run phases in order: orient (git status/diff), classify each change into one taxonomy unit (A/B/C/D/E), stage files individually (never git add . / -A / commit -a), write a formatted commit message, and push to origin main. Invoke with no argument, e.g. /commit. Use when the user asks to commit or push the current work.
---

# /commit

Execute the commit protocol defined in `.devin/workflows/commit.md`, adapted for the local Cline agent. **Overall risk: HIGH — strictness required. Critical rule: DO NOT DELETE ANY FILES.**

## 🎯 Primary Objective
Generate a precise set of git staging and commit commands, and then **autonomously execute them** using your terminal tools.

## 👁️ Phase 1: Systematic Observation & Orientation (MANDATORY FIRST STEP)
Do this BEFORE formulating any git commands.
1. **Execute Discovery:** Run `git status` (and `git diff` if needed).
2. **Perform Systematic Observation:** Output a brief, analytical mapping of the current working directory state.
3. **Orient & Group:** Explicitly outline how the staged/unstaged/untracked files group into logical, atomic units based on recent work.

## 🚫 Phase 2: Strict Constraints & Forbidden Actions (CRITICAL)
Violating any is a hard failure.
1. **NO FILE DELETION:** Never use `rm`, `git rm`, `del`, or any deletion command. However, if files are already deleted in the working directory (shown by `git status` as "deleted"), DO stage those deletions with `git add <file>` to record the state change. The ban is on deletion commands, not on staging pre-existing deletions.
2. **NO BLANKET STAGING:** Never use `git add .`, `git add -A`, or `git commit -a`. Stage files individually and precisely.
3. **NO CUSTOM ALIASES:** Do not use the `git ac` alias.

## 🗂️ Phase 3: Required Taxonomy & Formatting
**Taxonomy Categories (pick exactly ONE per commit):**
* **A** — Forward progress: Closes a DoD item on a required component
* **B** — Critical bug fix: Resolves a CRITICAL bug blocking a DoD item
* **C** — Refactor: Changes code structure without new functionality
* **D** — Configuration: Tailwind config, tsconfig, build setup, folder structure, `.todo` tracking
* **E** — Polish: Improvements to already-DoD-complete components

**Commit Message Template:**
*Option 1 (Tied to DoD):*
`Difficulty: <1-13> - <A|B|C|D|E>, <Category> (<scope/filenames>): <action> → DoD:<SprintName>-<item>`

*Option 2 (No DoD impact):*
`Difficulty: <1-13> - <A|B|C|D|E>, <Category> (<scope/filenames>): <action> → DoD:0 <infrastructure/deferred/etc>`

## 🚀 Phase 4: Final Output & AUTONOMOUS EXECUTION
After Phase 1 and orienting within Phases 2–3:
1. Output your planned commands in a formatted PowerShell block so the human can see what is about to happen. Each unit follows this syntax:
   `git add <specific/file1> <specific/file2>; git commit -m 'Difficulty: <Fib> - <TaxonomyType>, <Category> (<scope>): <action> → DoD:<SprintName-item or 0>'; git push origin main`
2. **IMMEDIATELY EXECUTE THE COMMANDS** with your terminal tool. Do not stop and wait for the human to copy-paste them.
3. Follow `AGENTS.md` resource discipline (shared server/browser, build lock for heavy work, never kill Wispr Flow).
