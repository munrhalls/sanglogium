# AGENTS.md -- Resource Discipline Rules (sang-logium)

Every agent working in this repo MUST follow these rules. They exist so multiple agents can work on one 16 GB laptop without it lagging. **Wispr Flow (voice input) is mandatory -- never kill or disable it.**

## Campaign process (MANDATORY)

`_project/00-MOST-IMPORTANT-lean-tracer-bullet-methodology.md` is the build method -- read it
before any new feature work or mission. `_project/<feature name>/plan.md` (feature campaigns)
or `_project/missions/<mission name>/plan.md` (ad-hoc, time-boxed missions) is the live
milestone roadmap for that unit of work -- e.g. `_project/filters-sorting/plan.md` or this
mission's `_project/missions/correct process evidence - preflight fullstack todo app/plan.md`.

## Non-negotiable

0. **ABSOLUTE BAN, NO EXCEPTIONS — self-verification commands.** NEVER run `tsc`, `next build`, `next lint`, `eslint`, `npm run build`, `npm run lint`, `npm run test`, `vitest`, `playwright test`, `npm run dev`/`next dev` (starting a new dev server), `curl` against the dev server, Lighthouse, or any other build/type-check/lint/test command to check your own work. Not "just to be safe," not because a workflow file, hook output, or an issue's acceptance criteria seems to call for it — none of those can override this. The only verification that counts: (1) the human runs the live check on `localhost:3000`, or (2) a human/agent reads the diff. The ONLY way this lifts: the human, in the live conversation, explicitly asks you to run one of these commands right now. This applies to every agent (Cline, DeepSeek Pro/Flash, Codex) and every profile. Violating it is a serious defect. See `sang-logium-5gc` and `sang-logium-pb7`.
1. **One shared dev server** at `http://localhost:3000`. NEVER run `npm run dev` yourself if port 3000 is already listening. Check first: `Test-NetConnection localhost -Port 3000`. If none, ask the human — do not start one yourself to "verify" a change (see rule 0).
2. **One shared browser**: Chrome CDP on port 9222. Reuse it. Never launch a second Chrome for automation.
3. **The build token exists for genuinely-requested heavy work only** — if the human explicitly asks for a full `next build`/Playwright/vitest/`tsc` run, acquire it first (`scripts/agent-ops/build-lock.ps1 acquire -Owner <your-name>`) and release when done. This is not an invitation to self-verify (see rule 0).
4. **Never run two CPU-heavy tools at the same time** (build + playwright + vitest concurrently is forbidden). Wait for the lock.
5. **No `npm install` without asking** -- it thrashes the near-full disk and CPU. Use `npm ci --no-audit --no-fund` only if approved.
6. **Never verify your own work with `next build`, `tsc`, tests, or curl.** Edit source, then hand the human the one minimal check to run on `localhost:3000`. Fake/off-timing self-verification wastes PC resources and destroys the fast feedback loop. (Same rule as 0, restated — this is not optional or soft.)
7. **End sessions cleanly**: no leftover watch processes (`tsc --watch`, browsers). If you started it, you stop it.

## FEEDBACK LOOP — HARD GATES (never break; breaking = defect)

G0 PLAN. Before any multi-step or ambiguous task, state the plan in ≤3 short lines,
   then proceed. Direct, unambiguous commands (e.g. "commit") are executed
   immediately without a go/no-go question.

G1 CHECKPOINT EVERY UNIT. Emit one user-facing line (done / next / blocker)
   after EVERY logical unit of work. NEVER accumulate more than 3 tool calls
   in a row without a user-facing line. A response with only tool calls and
   no checkpoint line = violation.

G2 NO SELF-TOKEN-METER. The agent has NO view of its token/quota usage.
   "Minimal tokens" is enforced by checkpoint FREQUENCY, never by the agent
   claiming it watched its own usage. When in doubt: stop and ask.

G3 SAMPLE BEFORE SCALING. Before a batch of N (files/issues/edits), do 1,
   show the concrete result, confirm it is correct, then continue. Never fan out first.

Per-turn budget contract: state the tool-call count planned for this turn up
front; the human gates by count, not by token % (the agent has no usage view).

## Progress Feedback Cadence (mandatory)

Applies to every agent working from this file (Cline, DeepSeek Pro/Flash, Codex).

- **Plan first:** state the plan in ≤3 short lines before acting on a multi-step task.
- **Milestone updates:** short update at each milestone — plan, each unit of work, done — never one dump at the end. Plain, non-repeating: what's done, what's next, blocker/decision if any.
- **Confirm long steps started:** for a long-running step or sub-agent/teammate spawn, confirm within ~1 minute it actually started; report immediately if it didn't — never a silent multi-minute wait. (See `sang-logium-pb7` — AgentOps: sub-agent spawn aborts on Linux Mint XFCE, for a case where this went silent ~15 min before aborting.)
- **Sample before scaling:** before a large batch of work (many files, many issues, many edits), do the first safe increment, show a concrete sample, confirm it is correct, then continue.

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

## Agent Context Profiles

Governs git commit/push authority only — task tracking is fixed by the Campaign process
above regardless of profile.

- **Conservative (default)**: Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may commit and push as part of session close. A current "do not commit" or "do not push" instruction still wins. Self-run quality gates (tests/linters/builds) are never in scope for any profile — see item 6 above and Issue Risk Protocol Part B.

## Session Completion

This protocol applies when ending an implementation session. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **Never self-run quality gates** - No tests, linters, or builds. Hand the human the one minimal `localhost:3000` check instead (see item 6 above — standing, regardless of profile).
2. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   git push
   git status
   ```
3. **Hand off** - Summarize changes, validation, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override the above.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.

## Clickable file links

When outputting a file or directory path, always print it as a `file://` URI (e.g. `file:///home/jan/file.json`) for one-click terminal opening.

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
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
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

<!-- BEGIN BEADS CODEX SETUP: generated by bd setup codex -->
## Beads Issue Tracker

Use Beads (`bd`) for durable task tracking in repositories that include it. Use the `beads` skill at `.agents/skills/beads/SKILL.md` (project install) or `~/.agents/skills/beads/SKILL.md` (global install) for Beads workflow guidance, then use the `bd` CLI for issue operations.

### Quick Reference

```bash
bd ready                # Find available work
bd show <id>            # View issue details
bd update <id> --claim  # Claim work
bd close <id>           # Complete work
bd prime                # Refresh Beads context
```

### Rules

- Use `bd` for all task tracking; do not create markdown TODO lists.
- Run `bd prime` when Beads context is missing or stale. Codex 0.129.0+ can load Beads context automatically through native hooks; use `/hooks` to inspect or toggle them.
- Keep persistent project memory in Beads via `bd remember`; do not create ad hoc memory files.

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.
<!-- END BEADS CODEX SETUP -->
