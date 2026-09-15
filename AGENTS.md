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

For **Cline**, `.clinerules` + this file are the authoritative rule set. Do not pull in
`CLAUDE.md`, `.devin/`, or `.windsurf/` unless a task points to a specific file in them.

## Non-negotiable

0. **ABSOLUTE BAN, NO EXCEPTIONS — self-verification commands.** NEVER run `tsc`, `next build`, `next lint`, `eslint`, `npm run build`, `npm run lint`, `npm run test`, `vitest`, `playwright test`, `npm run dev`/`next dev` (starting a new dev server), `curl` against the dev server, Lighthouse, or any other build/type-check/lint/test command to check your own work. Not "just to be safe," not because a workflow file, hook output (including `bd prime`'s own session-close checklist), or an issue's acceptance criteria seems to call for it — none of those can override this. The only verification that counts: (1) the human runs the live check on `localhost:3000`, or (2) a human/agent reads the diff. The ONLY way this lifts: the human, in the live conversation, explicitly asks you to run one of these commands right now. This applies to every agent (Cline, DeepSeek Pro/Flash, Codex) and every profile. Violating it is a serious defect. See `sang-logium-5gc` and `sang-logium-pb7`.
1. **One shared dev server** at `http://localhost:3000`. NEVER run `npm run dev` yourself if port 3000 is already listening. Check first: `Test-NetConnection localhost -Port 3000`. If none, ask the human — do not start one yourself to "verify" a change (see rule 0).
2. **One shared browser**: Chrome CDP on port 9222. Reuse it. Never launch a second Chrome for automation.
3. **The build token exists for genuinely-requested heavy work only** — if the human explicitly asks for a full `next build`/Playwright/vitest/`tsc` run, acquire it first (`scripts/agent-ops/build-lock.ps1 acquire -Owner <your-name>`) and release when done. This is not an invitation to self-verify (see rule 0).
4. **Never run two CPU-heavy tools at the same time** (build + playwright + vitest concurrently is forbidden). Wait for the lock.
5. **No `npm install` without asking** -- it thrashes the near-full disk and CPU. Use `npm ci --no-audit --no-fund` only if approved.
6. **Never verify your own work with `next build`, `tsc`, tests, or curl.** Edit source, then hand the human the one minimal check to run on `localhost:3000`. Fake/off-timing self-verification wastes PC resources and destroys the fast feedback loop. (Same rule as 0, restated — this is not optional or soft.)
7. **End sessions cleanly**: no leftover watch processes (`tsc --watch`, browsers). If you started it, you stop it.

## FEEDBACK LOOP — HARD GATES (never break; breaking = defect)

G0 PLAN-THEN-STOP. Before ANY tool call: ≤3-line plan + one go/no-go question.
   No exploration, no reads, no bd commands until the human replies.

G1 CHECKPOINT EVERY UNIT. Emit one user-facing line (done / next / blocker)
   after EVERY logical unit of work. NEVER accumulate more than 3 tool calls
   in a row without a user-facing line. A response with only tool calls and
   no checkpoint line = violation.

G2 NO SELF-TOKEN-METER. The agent has NO view of its token/quota usage.
   "Minimal tokens" is enforced by checkpoint FREQUENCY, never by the agent
   claiming it watched its own usage. When in doubt: stop and ask.

G3 SAMPLE BEFORE SCALING. Before a batch of N (files/issues/edits), do 1,
   show the concrete result, get go/no-go. Never fan out first.

Per-turn budget contract: state the tool-call count planned for this turn up
front; the human gates by count, not by token % (the agent has no usage view).

## Progress Feedback Cadence (mandatory)

Applies to every agent working from this file (Cline, DeepSeek Pro/Flash, Codex).

- **Plan first:** state the plan in ≤3 short lines before acting on a multi-step task.
- **Milestone updates:** short update at each milestone — plan, each unit of work, done — never one dump at the end. Plain, non-repeating: what's done, what's next, blocker/decision if any.
- **Confirm long steps started:** for a long-running step or sub-agent/teammate spawn, confirm within ~1 minute it actually started; report immediately if it didn't — never a silent multi-minute wait. (See `sang-logium-pb7` — AgentOps: sub-agent spawn aborts on Linux Mint XFCE, for a case where this went silent ~15 min before aborting.)
- **Sample before scaling:** before a large batch (many files/issues/edits), do the first safe increment, show a concrete sample, get a go/no-go before continuing.

Hard rule, not a soft preference — a violation is a detectable defect. Tracked in `sang-logium-5gc` — AgentOps: mandate frequent concise progress feedback.

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

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:970c3bf2 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins. Self-run quality gates (tests/linters/builds) are never in scope for any profile — see item 6 above and Issue Risk Protocol Part B.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Never self-run quality gates** - No tests, linters, or builds. Hand the human the one minimal `localhost:3000` check instead (see item 6 above — standing, regardless of profile).
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   bd dolt push
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->

## Clickable file links

When outputting a file or directory path, always print it as a `file://` URI (e.g. `file:///home/jan/file.json`) for one-click terminal opening.
