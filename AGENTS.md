# AGENTS.md -- Resource Discipline Rules (sang-logium)

Every agent working in this repo MUST follow these rules. They exist so multiple agents can work on one 16 GB laptop without it lagging. **Wispr Flow (voice input) is mandatory -- never kill or disable it.**

## Issue tracker = beads (`bd` CLI)

Issues are tracked in **beads**. IDs look like `sang-logium-69m`. The `.beads/` folder is a
Dolt DB plus a generated `issues.jsonl` export -- **never grep, read, or edit files inside
`.beads/`**; use the `bd` CLI for everything.

- `bd show <id>` -- read an issue   ·   `bd ready` -- list open unblocked issues
- `bd update <id> --claim` -- take it   ·   `bd note <id> "…"` -- add an evidence note
- `bd close <id>` -- finish (there is no "done" status; `open -> in_progress -> closed`)
- After any `bd` write: `bd export -o .beads/issues.jsonl`, commit it with the code change

To implement an issue end-to-end, follow `.cline/skills/implement-beads-issue/SKILL.md`
(or `/implement-beads-issue <id>` in Cline).

**Titles are MANDATORY-structured** -- see `_project/beads-naming-convention.md`. The ID is a
random handle; the title carries readability. Epic = `EPIC Filters Sorting`; child of an epic
= `[Filters] Price min/max <-> URL`; standalone = `Search: clamp out-of-range ?page=`. Never
put a raw ID in a title. Reference an issue as `` `sang-logium-agq` -- EPIC Filters Sorting ``
(ID + title), never the bare ID.

**Issue goal format is MANDATORY, not opt-in.** Every issue's goal is written as end-user
UX acceptance tests -- a list of `When I <interaction>, then <observable outcome>` lines a
human runs in a browser on `localhost:3000` -- plus a `CURRENT STATUS:` line. No prose
problem/task descriptions, no `file:line`, no tokens, no implementation detail in the goal.
Never store a bug-report paragraph verbatim as the goal; translate it to when/then lines.
(If `.devin/workflows/beads-issue-gate.md`'s heavier anatomy is cited, it conflicts with
this -- this rule wins; flag it to the human.)

For **Cline**, `.clinerules` + this file are the authoritative rule set. Do not pull in
`CLAUDE.md`, `.devin/`, or `.windsurf/` unless a task points to a specific file in them.

## Non-negotiable

1. **One shared dev server** at `http://localhost:3000`. NEVER run `npm run dev` yourself if port 3000 is already listening. Check first: `Test-NetConnection localhost -Port 3000`. If none, ask the human or use `scripts/agent-ops/services.ps1`.
2. **One shared browser**: Chrome CDP on port 9222. Reuse it. Never launch a second Chrome for automation.
3. **Heavy work needs the build token**: run `scripts/agent-ops/build-lock.ps1 acquire -Owner <your-name>` BEFORE `next build`, full Playwright suites, full vitest runs, or full `tsc`. Release when done (`release`). Never hold it while idling.
4. **Never run two CPU-heavy tools at the same time** (build + playwright + vitest concurrently is forbidden). Wait for the lock.
5. **No `npm install` without asking** -- it thrashes the near-full disk and CPU. Use `npm ci --no-audit --no-fund` only if approved.
6. **Prefer `next build` + `next start` verification** over `next dev` hot-reload when possible. For quick checks, curl the shared server.
7. **End sessions cleanly**: no leftover watch processes (`tsc --watch`, browsers). If you started it, you stop it.

## Context economy (do more with less)

- Use search tools (`rg` / codebase search) FIRST; read each file ONCE; never dump entire large files to the terminal.
- Batch file reads together. Skip re-reading unchanged files.
- Scratch files go to a temp dir, NEVER the repo root. Do not leave probe-*.mjs / out-*.txt / screenshots lying around.
- If free RAM is tight, run `scripts/agent-ops/resource-health.ps1` and share the snapshot before starting heavy work.

## Never do

- Kill/disable Wispr Flow (voice input -- mandatory).
- Start a second `next dev`, second CDP browser, or run build + tests concurrently.
- `git clean -xdf`, `npm cache clean`, or delete `.next` while a server runs.
- Leave background browsers running at session end.
- Hold the build lock while not actively running a heavy task.
