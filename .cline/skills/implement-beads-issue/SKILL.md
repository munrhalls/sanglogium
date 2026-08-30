---
name: implement-beads-issue
description: Implement a single beads issue end-to-end — read the spec, claim it, do the minimal change, verify with a live check, note evidence, close, and re-export. Invoke with the issue ID, e.g. /implement-beads-issue sang-logium-69m. Use whenever the user says "read beads issue <id> then implement it" or points you at a bd issue to build.
---

# /implement-beads-issue <id>

Overall risk: MEDIUM. Lean path is mandatory — source edits only, minimal diff, hand the
live check to the human on `localhost:3000`. No `next build`, no `tsc`/ts-check, no project
lint, no test suites, no `npm install`, no dev server, no browser automation, no git commit
unless the user asks. If a "no" genuinely blocks the task, stop and say so in one line.

## 1. Read the spec (never touch `.beads/` files directly)

- `bd show <id>` — the GOAL paragraph + the `Current status:` block ARE the full spec.
- Read the RELATED issues it names with `bd show` too, for shared tokens / prior work.
- Read `.clinerules` and `AGENTS.md` if not already loaded (stack, architecture, resource rules).

## 2. Retrieve lessons

- Skim `_project/AI_LESSONS.md` (L09–L11 always; plus any entry matching the issue's area).
- If the issue touches height/sizing classNames under `app/components/**`, read
  `docs/vertical-space-lg-touch.md` before editing and review the diff against it after.

## 3. Claim it

- `bd update <id> --claim` (assignee + `in_progress` — shows on the board within a second).

## 4. Plan and contain (state before coding)

- Refined scope + the exact files you will modify (allowed write scope).
- If you cannot resolve exact paths from the issue, HALT and ask — do not guess.
- Do ONLY what the GOAL + DoD require. Zero scope creep, zero unrelated cleanup.

## 5. Implement

- Smallest possible diff. Prefer `edit` over rewrite. Follow existing component patterns.
- One terminal command at a time. Never `$(...)` or backticks — write a temp `.ps1`/`.js` if needed.

## 6. Live check + evidence

- Run the DoD manually against the shared server on `localhost:3000` (curl / read the page).
  Do not start your own dev server; if 3000 is down, ask the human.
- `bd note <id> "Live check: PASS/FAIL — <evidence>"`. On FAIL: fix, re-check, no forward progress.

## 7. Close and export

- `bd close <id> --reason "<one line>"` (there is no "done" status; this moves it to `closed`).
- `bd export -o .beads/issues.jsonl` — leave `.beads/issues.jsonl` staged for the human to
  commit alongside the code change (do not commit or push unless asked).

## 8. Report

Reference the issue as `` `sang-logium-xxx` — <its title> `` (ID + title, never bare ID; see
`_project/beads-naming-convention.md`). Then: files changed, live-check evidence, export path. Stop.
