## Hard Limits

**Verification exists only twice: the human's live check on `localhost:3000`, or their GitHub PR review.** Every agent-run check of its own work — any build/typecheck/lint/test/dev-server command and any browser attach/load/poll — is banned; nothing overrides it; the sole lift is the human asking live, now. Diff/rebase ≠ verification. Violation = serious defect (highest-priority rule). Handoff = summarize changes + the one minimal `localhost:3000` check.

**Sole permitted command:** `node tools/check-turn.mjs`, once per turn before handoff (runner tasks: the runner runs it at merge; executors never). Exempt from the ban only because it's a dependency-free file check — its violation output states the fix rules.

Never `$(...)` or backticks in terminal commands — hardcoded CLI permission block; chain via a temp `.js`/`.ps1` script.

Ask before heavy commands (`npm install`, whole-project lint, crawls). Never run a command and a fallback/duplicate in parallel — check once (`which`/`--version`), run one, wait.

## Output and cadence

1–3 sentence blocks, blank lines between; bullets for 3+ parallel items; headings only across 2+ topics. Never a wall of text.

Plan ≤3 lines before multi-step work; checkpoint each unit — never 3+ silent tool calls or an end-dump; confirm long steps started within ~1 min; sample one before a batch. NEVER longer chat output than 3/4 page. 

## Pointers

- Debugging a CSS/browser/timing primitive or inspecting live UI → `_project/AI_LESSONS.md` first (L04–L05 harness method, L09–L11 cross-cutting); text before screenshots.
- Where files live, what imports what, conventions, feature map, UX docs → `docs/organizational-pattern.md` + `docs/features/README.md` — `check-turn` enforces.
- New test files/configs/deps, `.env*`, ignored files → owner approval; `check-turn` + `pre-push` enforce.
- Git: commit, push feature branches, open PRs freely; never merge, force-push, or commit to `main` without explicit approval (full chain: AGENTS.md).

## Process (MANDATORY)

PR checkboxes -> `/architect` -> runner -> human verify, all on the PR's own branch. The owner pastes a PR's unchecked
boxes to the architect, which writes one task file per executor into `_project/working-memory/` (gitignored, never
committed), named `<wave><letter>-<name>.md`: tasks of the same wave run in parallel, waves run in order. From a checkout
of the PR's branch the owner runs `node ~/work/global/workflow/run.mjs <PR> --check "node tools/check-turn.mjs --all"`
(add `--dry` first to check the plan). The runner is plain code and its executors are not subagents. Subagents ban holds - but devin executors, run via shell, are not subagents. Executors run on free unlimited tokens: the token-minimization rules in this file do not apply to them — they may re-read and re-check freely for correctness, bounded only by wall-clock and the 45-minute task timeout. Default to executor-first: anything a free-meter executor can do — file reading, iterate/check/fix loops, script writing — goes in a task brief; the paid conversation keeps only decisions, plan, judgment and verification. For each task the runner cuts a branch from the PR branch, runs a fresh executor on
it (executors never commit, push or branch), merges it back into the PR branch when there is no conflict and the check
passes, pushes, and adds a `human verify` checkbox under the matching box in the PR body. The owner verifies, then merges
the PR into `main`.
A PR that waits for the runner is opened as a draft; the owner marks it ready after the runner's last task lands, so GitHub refuses an early merge.

## PATTERN BLOCK

Every task brief that creates, moves or edits code must start with the PATTERN BLOCK, copied
verbatim from `docs/organizational-pattern.md` (the single source of truth; the block lives
there under `## PATTERN BLOCK`). `node tools/check-turn.mjs` enforces it. Before placing or
importing anything, read the doc's sections 2 and 3.
