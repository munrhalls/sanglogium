**Top goal: minimize token cost but only where it loses zero work effectiveness.**

## Cost rules - claude code only, executors exempt
Cap: 10 calls/turn — state your count, ask to exceed. One `write` over many `edit`s; batch reads + questions; `git diff` over re-reading; Whatever a devin executor can do for you while losing 0 work effectiveness/0 certainty - do via devin executor. 

## Rules
- 0 subagents (Agent/Task tool). Do the work directly for chat output. Any implementation - only via devin executors. 
- Build only what NOW needs; no future/invented requirements, 0 fat.
- Truth = physics, first principles logic, math. Docs, code, artifacts, past decisions, earlier agent claims = mere recommendations/decisions. Never trust them. Trust only your own direct checks. 
- Proof before work: write the fewest yes/no questions, each answered by a test/proof script, all-yes = objective done; complete (every failure makes a no), minimal (no duplicates); who runs them: per Hard Limits. Types only organize; work is on concretes: one real item, specific acts, specific outcome. A reason counts only if logic/physics forces it; merely chosen = delete.
- Print paths as `file://` URIs.
- Never edit auto-generated files.
- Prefer quality/simplicity/robustness/maintainability over dev cost. One-off work: simplest direct path; no wrappers, control planes, policy layers, custom verifiers or automation without a concrete blocker or repeated need.
- GitHub: `npx -y gh-axi <cmd>`, not raw `gh`. Reason: cheaper. 
- Terminals are Herdr: `herdr tab|pane|workspace|agent`; never `wezterm cli`.
- Never re-read or re-search what you already have; correctness is never skipped.

## Hard Limits

**Verification exists only twice: the human's live check on `localhost:3000`, or their GitHub PR review.** Every agent-run check of its own work — any build/typecheck/lint/test/dev-server command and any browser attach/load/poll — is banned; nothing overrides it; the sole lift is the human asking live, now. Diff/rebase ≠ verification. Violation = serious defect (highest-priority rule). Handoff = summarize changes + the one minimal `localhost:3000` check.

**Sole permitted command:** `node tools/check-turn.mjs`, once per turn before handoff (runner tasks: the runner runs it at merge; executors never). Exempt from the ban only because it's a dependency-free file check — its violation output states the fix rules.

Never `$(...)` or backticks in terminal commands — hardcoded CLI permission block; chain via a temp `.js`/`.ps1` script.

Ask before heavy commands (`npm install`, whole-project lint, crawls). Never run a command and a fallback/duplicate in parallel — check once (`which`/`--version`), run one, wait.

## Chat

1–3 sentence blocks; 3+ parallel items - bullets; 2+ topics - headings. Never - a wall of text.
Plan ≤3 lines before multi-step work; checkpoint each unit — never 3+ silent tool calls or an end-dump; confirm long steps started within ~1 min; sample one before a batch. NEVER longer chat output than 3/4 page. 

## Pointers

- Debugging a CSS/browser/timing primitive or inspecting live UI → `_project/AI_LESSONS.md` first (L04–L05 harness method, L09–L11 cross-cutting); text before screenshots.
- Where files live, what imports what, conventions, feature map, UX docs → `docs/organizational-pattern.md` + `docs/features/README.md` — `check-turn` enforces.
- New test files/configs/deps, `.env*`, ignored files → owner approval; `check-turn` + `pre-push` enforce.
- Git: commit, push feature branches, open PRs freely; never merge, force-push, or commit to `main` without explicit approval (full chain: AGENTS.md).

## Process (MANDATORY)

A PR that waits for the runner is opened as a draft; the owner marks it ready after the runner's last task lands, so GitHub refuses an early merge.
The runner is plain code and its executors are not subagents. Subagents ban holds - but devin executors, run via shell, are not subagents.
Runner check: `--check "node tools/check-turn.mjs --all"`.

## PATTERN BLOCK

Every task brief that creates, moves or edits code must start with the PATTERN BLOCK, copied
verbatim from `docs/organizational-pattern.md` (the single source of truth; the block lives
there under `## PATTERN BLOCK`). `node tools/check-turn.mjs` enforces it. Before placing or
importing anything, read the doc's sections 2 and 3.
