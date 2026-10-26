# AGENTS.md -- Resource Discipline Rules (sang-logium)

Every agent working in this repo MUST follow these rules. They exist so multiple agents can work on one 16 GB laptop without it lagging. **Wispr Flow (voice input) is mandatory -- never kill or disable it.**

## Process (MANDATORY)

PR checkboxes -> `/architect` -> runner -> human verify, all on the PR's own branch. The owner pastes a PR's unchecked
boxes to the architect, which writes one task file per executor into `_project/working-memory/` (gitignored, never
committed), named `<wave><letter>-<name>.md`: tasks of the same wave run in parallel, waves run in order. From a checkout
of the PR's branch the owner runs `node ~/work/global/workflow/run.mjs <PR> --check "node tools/check-turn.mjs --all"`
(add `--dry` first to check the plan). For each task the runner cuts a branch from the PR branch, runs a fresh executor on
it (executors never commit, push or branch), merges it back into the PR branch when there is no conflict and the check
passes, pushes, and adds a `human verify` checkbox under the matching box in the PR body. The owner verifies, then merges
the PR into `main`.

## Non-negotiable

0. **ABSOLUTE BAN, NO EXCEPTIONS — self-verification commands.** NEVER run `tsc`, `next build`, `next lint`, `eslint`, `npm run build`, `npm run lint`, `npm run test`, `vitest`, `playwright test`, `npm run dev`/`next dev` (starting a new dev server), `curl` against the dev server, Lighthouse, or any other build/type-check/lint/test command to check your own work. Not "just to be safe," not because a workflow file, hook output, or an issue's acceptance criteria seems to call for it — none of those can override this. The only verification that counts: (1) the human runs the live check on `localhost:3000`, or (2) the human's PR review on GitHub. Reading a diff or rebasing does NOT count as verification. Agents also never attach a browser to, load, or poll the dev server (many concurrent agents doing so lags the shared machine and defeats the point) unless the human explicitly asks in the live conversation. The ONLY way this lifts: the human, in the live conversation, explicitly asks you to run one of these commands right now. This applies to every agent (Cline, DeepSeek Pro/Flash, Codex) and every profile. Violating it is a serious defect.
1. **One shared dev server** at `http://localhost:3000`. NEVER run `npm run dev` yourself if port 3000 is already listening. Check first: `Test-NetConnection localhost -Port 3000`. If none, ask the human — do not start one yourself to "verify" a change (see rule 0).
2. **One shared browser**: Chrome CDP on port 9222. Reuse it. Never launch a second Chrome for automation.
3. **Heavy work only on explicit request** — if the human explicitly asks for a full `next build` / `tsc` run, run it once, alone, and report; this is not an invitation to self-verify (see rule 0).
4. **Never run two CPU-heavy tools at the same time** (build + playwright + vitest concurrently is forbidden).
5. **No `npm install` without asking** -- it thrashes the near-full disk and CPU. Use `npm ci --no-audit --no-fund` only if approved.
6. **Never verify your own work with `next build`, `tsc`, tests, or curl.** Edit source, then hand the human the one minimal check to run on `localhost:3000`. Fake/off-timing self-verification wastes PC resources and destroys the fast feedback loop. (Same rule as 0, restated — this is not optional or soft.) ONE PERMITTED COMMAND: `node tools/check-turn.mjs`, once per turn before handoff (in a runner task the runner runs it when it merges the task, so an executor does not). It runs the end-of-turn checks: import integrity (`tools/check-imports.mjs`) and the organizational pattern (`tools/check-org-pattern.mjs`, defined in `docs/organizational-pattern.md`). On a violation, fix it by moving or re-pointing code, then re-run once. Never edit a check, the git hook, the model document or the PATTERN BLOCK in CLAUDE.md to make it pass, and never push with `--no-verify`. A push is rejected by the `tools/git-hooks/pre-push` hook while violations remain. If a violation cannot be removed without breaking the task's goal, stop and report it instead of pushing. It is a dependency-free file check: no typecheck, build, lint or test.
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
- **Confirm long steps started:** for a long-running step or sub-agent/teammate spawn, confirm within ~1 minute it actually started; report immediately if it didn't — never a silent multi-minute wait.
- **Sample before scaling:** before a large batch of work (many files, many issues, many edits), do the first safe increment, show a concrete sample, confirm it is correct, then continue.

Hard rule, not a soft preference — a violation is a detectable defect.

## Context economy (do more with less)

- Use search tools (`rg` / codebase search) FIRST; read each file ONCE; never dump entire large files to the terminal.
- Batch file reads together. Skip re-reading unchanged files.
- Scratch files go to a temp dir, NEVER the repo root. Do not leave probe-*.mjs / out-*.txt / screenshots lying around.

## Never do

- Kill/disable Wispr Flow (voice input -- mandatory).
- Start a second `next dev`, second CDP browser, or run build + tests concurrently.
- `git clean -xdf`, `npm cache clean`, or delete `.next` while a server runs.
- Leave background browsers running at session end.
- Hold the build lock while not actively running a heavy task.

## Git and handoff

Outside a runner task, agents may commit, push feature branches and open PRs as part of the work without asking each time. In a runner task the executor never commits, pushes or opens PRs: the runner does. Never merge; the human validates and merges. Force-push, history rewrites and commits directly to `main` need explicit approval. If a required sync or push is blocked, stop and report the exact command and error.

At handoff, summarize the changes and give the human the one minimal `localhost:3000` check.

## Clickable file links

When outputting a file or directory path, always print it as a `file://` URI (e.g. `file:///home/jan/file.json`) for one-click terminal opening.


