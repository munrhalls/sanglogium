---
description: Scan any prepared phases/tasks plan for command-execution friction — hangs, freezes, expensive/dumb commands — and mitigate every instance before execution starts
---

# /execution-friction-scan

**Singular purpose:** given a task/phase plan document (not code), find every instruction in it
that risks a hang, freeze, stuck loop, or wasteful/expensive command once an execution agent
starts following it — and fix each one in the plan text itself. This workflow produces no new
features and touches no application code; it only hardens plan documents.

**Scope boundary:** this workflow does not judge *what* the plan accomplishes (correctness of
the engineering approach) — only *how safely* it can be executed. Correctness/scope review is a
separate concern (`/gaps-scan`, `/audit`).

---

## Why this exists

Root incident (2026-07-29, homepage execution plan): a plan instructed a background build with
bash-only syntax (`> /tmp/...`, trailing `&`) on a Windows/PowerShell target, told the executor
to "open Sanity Studio" with no retry bound, and told it to inspect a file excluded by
`.codeiumignore`. None of these are logic bugs — the plan's *intent* was correct on every count —
but each one is a concrete, mechanical trigger for an agent to loop, retry, or block
indefinitely. This protocol exists to catch that class of defect systematically instead of
per-incident.

---

## The 13 Risk Patterns (scan for all of them, every time)

For each pattern: what it looks like in plan text, and the required fix if found.

| # | Pattern | Text signal to grep for | Required fix |
|---|---|---|---|
| 1 | **Repeated expensive whole-project command** (build/typecheck/lint run more than once, or per-task/per-file) | `npm run build`, `npm run typecheck`, `tsc --noEmit`, `next build`, `npm run lint` appearing more than once in the doc | Collapse to exactly one occurrence, at a single named "Final Gate"-style checkpoint, run in the background |
| 2 | **Shell-syntax assumed, not verified** (bash-only or PowerShell-only syntax presented as the only option) | `/tmp/`, trailing ` &` at end of a command line, `2>&1`, `Start-Process`, backtick line-continuation | Add an explicit "identify your shell first" step; give both a bash and a PowerShell form for every backgrounding/redirection command; never use `/tmp` — use a repo-relative path |
| 3 | **Buffered-output pipe trap** (piping a live long-running command through a line-limiter, expecting it to shorten the wait) | `\| head`, `\| tail -f`, `\| Select-Object -First`, `\| grep` directly after a build/dev-server command | Redirect to a log file first; peek the file non-blockingly afterward (`tail -n`, `Get-Content -Tail`) — never pipe the live process |
| 4 | **Blocking foreground long-running process** (a command that never returns, run without backgrounding, presented as a single step in a linear task list) | `npm run dev` (no `&`/background flag nearby), `npm start` as a bare instruction | Explicitly mark as background/non-blocking; add a check for "is one already running" before starting a new one |
| 5 | **Unbounded retry / no circuit breaker** (a step depends on something flaky — network, GUI, external API, login — with no stated retry limit) | "open [Studio/dashboard/browser]", "wait until", "keep trying", "retry until it works", any live third-party UI mentioned with no bound | Add: try once (or a small fixed N), then stop and report — never loop indefinitely on the same flaky step |
| 6 | **Blocked/inaccessible file assumed readable** (plan tells the agent to open/read a path that tooling config excludes) | any file path under a `.gitignore`/`.codeiumignore`/`.cursorignore`-listed directory referenced as "read this file" | Check ignore files first; if blocked, inline the already-verified fact/signature instead of pointing at the file |
| 7 | **No file-lock/claim protocol in a multi-agent repo** (plan edits files with no mention of the repo's own concurrency-safety mechanism, when one exists) | absence of any claim/lock/mutex step alongside file-edit instructions, in a repo that has one (e.g. `scripts/mutex.cjs`, `.beads` claim workflow) | Add claim-before-edit / release-after-edit steps using the repo's existing mechanism |
| 8 | **Unverified precondition presented as fact** ("already running", "already exists", "already installed" stated without a check) | "already running", "already exists", "no need to" + an assumption | Add a one-line, cheap check before relying on the assumption; state the fallback if the check fails |
| 9 | **Recursive/whole-tree search instead of a scoped one** (`grep -r` / full-directory search offered as the example command in a repo with a faster scoped tool available) | `grep -r`, `find / `, `Get-ChildItem -Recurse` at repo root, without `git grep` / indexed search mentioned as the alternative | Replace the example command with the repo's fastest scoped equivalent (`git grep`, IDE search tool, etc.) |
| 10 | **Decision gate with no stop condition** (a task says "wait for human decision" but doesn't say what the agent should do with its turn in the meantime) | "WAIT FOR HUMAN DECISION" / "gated" language with no accompanying "in the meantime, do X or stop here" | Add explicit instruction: stop this task, move to an independent task, or end the session — never idle-poll for an answer |
| 11 | **Cross-OS path/tool assumption** (Unix-only paths, tools, or line endings presented as universal) | `/tmp`, `/dev/null`, `~/`, `.sh` invoked directly, `chmod` | Use a repo-relative path and note the OS-specific equivalent tool/command |
| 12 | **Silent value propagation instead of fail-fast** (a lookup/transform that can return `null`/`undefined`/empty is wired straight into the next step with no guard) | "returns `... \| undefined`", "may be empty", a resolved value used immediately after without a check mentioned | Add an explicit guard: if the value is missing, stop and report which input caused it — don't let it propagate silently into a debugging rabbit hole later |
| 13 | **Plan's assumed starting state is stale** (in a multi-agent repo, the file/artifact the plan's first task targets may already have been changed/moved/finished by another agent since the plan was written) | any task whose first move is "open `<file>`" or "run `<command>` against `<file>`" with no existence/content check first | Before executing Task 1 of any plan, verify the target file(s) still exist and still roughly match what the plan describes; if not, re-map the plan's remaining tasks against current reality before continuing — don't apply stale instructions blindly. Sub-case: if a task says "source data from `<generated artifact, e.g. typegen output>`" and that artifact turns out missing/stale, check whether an earlier, already-completed step already produced an equivalent (e.g. hand-centralized types from a relocation task) before reaching for an expensive regeneration command to manufacture it from scratch |

---

## Procedure

1. **Read the whole plan once**, start to finish, before editing anything.
2. **Lexical pass:** `grep_search` the plan document for the "text signal" column of all 13
   patterns above, in one pass. This is a cheap, local, instant operation — never a reason to
   touch the actual codebase or run anything expensive. Pattern 13 additionally requires one
   cheap existence-check (`find_by_name`/`read_file`) on the plan's first-touched file(s) before
   Task 1 begins — this is the one pattern that needs a real check, not just a text scan.
3. **Context-check each hit:** for every match, confirm whether it's already correctly guarded
   (e.g. pattern 1's `npm run build` might already be the single, correctly-gated Final Gate —
   that's not a defect, don't "fix" what's already correct).
4. **Fix only real, unmitigated hits** — apply the "Required fix" from the table, minimally, in
   place. Do not rewrite unrelated sections.
5. **Cross-reference the repo's own guardrails** (this repo's `.windsurf/rules/parallel-guardrails.md`
   / `AGENTS.md` / any `respect-cpu-resources` workflow) — if the plan contradicts an existing
   rule, the existing rule wins; align the plan to it.
6. **Re-read the fixed plan once**, end to end, checking specifically for:
   - Zero remaining unguarded matches from step 2.
   - No new ambiguity introduced by the fixes themselves (e.g. giving two syntax options without
     saying how to choose between them is itself a new gap — pattern 2's fix must include a
     "how you know which one to use" step).
7. **Report a before/after table**: pattern # → where found → what changed. If a pattern had zero
   hits, say so explicitly (don't silently omit it — that's how false negatives hide).

---

## Binary Success Criteria (DoD)

- All 13 patterns explicitly checked against the plan — YES/NO per pattern, no omissions.
- Every real hit has a concrete fix applied in the plan text (not a suggestion left for later) —
  YES/NO.
- No pattern's fix introduces a new ambiguity (checked in step 6) — YES/NO.
- Zero shell commands were actually executed against the target codebase to perform this scan
  (it is a text-scan of a document, not a code investigation) — YES/NO.
- Before/after table produced — YES/NO.

If any answer is NO, the scan is incomplete — continue, don't stop early.
