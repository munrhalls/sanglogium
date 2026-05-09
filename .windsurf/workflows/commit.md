---
description: Execute git commit workflow with strict containment and autonomous execution
---

# /Commit Command Protocol

## SYSTEM OVERRIDE & TASK HANDOFF: Git Commit Generation & AUTONOMOUS EXECUTION
**Target Agent:** SWE-1.5 (Local Repository Access)
**Risk Level:** HIGH STRICTNESS REQUIRED
**Critical rule:** DO NOT DELETE ANY FILES

## 🎯 Primary Objective
You are tasked with generating a highly structured, precise set of git staging and commit commands. Before generating any commands, you must establish complete situational awareness. **Crucially, you must then autonomously execute these commands using your terminal tools.**

---

## 👁️ Phase 1: Systematic Observation & Orientation (MANDATORY FIRST STEP)
You must execute this phase BEFORE formulating any git commands.
1. **Execute Discovery:** Run `git status` (and `git diff` if needed).
2. **Perform Systematic Observation:** Output a brief, analytical mapping of the current working directory state.
3. **Orient & Group:** Explicitly outline how the unstaged/untracked files group into logical, atomic units based on recent work. Map them below.

---

## 🚫 Phase 2: Strict Constraints & Forbidden Actions (CRITICAL)
Read these constraints carefully. Violating any of these is a hard failure of your execution constraints.
1. **NO FILE DELETION:** You are STRICTLY FORBIDDEN from using `rm`, `git rm`, `del`, or any other file deletion commands. You MUST NOT actively delete files. However, if files are already deleted in the working directory (shown by git status as "deleted"), you SHOULD stage those deletions using `git add <file>` to record the state change. The prohibition is on deletion commands, not on staging pre-existing deletions.
2. **NO BLANKET STAGING:** You are STRICTLY FORBIDDEN from using `git add .`, `git add -A`, or `git commit -a`. Files must be staged individually and precisely.
3. **NO CUSTOM ALIASES:** Do not use the `git ac` alias.

---

## 🗂️ Phase 3: Required Taxonomy & Formatting
**Taxonomy Categories (Must pick exactly one per commit):**
* **A** — Forward progress: Closes a DoD item on a required component
* **B** — Critical bug fix: Resolves a CRITICAL bug blocking a DoD item
* **C** — Refactor: Changes code structure without new functionality
* **D** — Configuration: Tailwind config, tsconfig, build setup, folder structure, `.todo` tracking
* **E** — Polish: Improvements to already-DoD-complete components

**Commit Message Template Options:**
*Option 1 (Tied to DoD):*
`Difficulty: <1-13> - <A|B|C|D|E>, <Category> (<scope/filenames>): <action> → DoD:<SprintName>-<item>`

*Option 2 (No DoD impact):*
`Difficulty: <1-13> - <A|B|C|D|E>, <Category> (<scope/filenames>): <action> → DoD:0 <infrastructure/deferred/etc>`

---

## 🚀 Phase 4: Final Output & AUTONOMOUS EXECUTION
After completing Phase 1 and orienting yourself within the constraints of Phases 2 and 3:
1. Output your planned commands in a formatted PowerShell code block so the user can see what is about to happen. Each unit must follow this syntax:
   `git add <specific/file1> <specific/file2>; git commit -m 'Difficulty: <Fib> - <TaxonomyType>, <Category> (<scope>): <action> → DoD:<SprintName-item or 0>'; git push origin main`
2. **IMMEDIATELY EXECUTE THE COMMANDS.** You must use your terminal/execution tool to run the formulated `git add`, `git commit`, and `git push origin main` commands directly in the local repository. Do not stop and wait for the user to copy-paste them.
