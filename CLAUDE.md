# Project Instructions for AI Agents

This file provides instructions and context for AI coding agents working on this project.

## Hard Limits

CRITICAL: NEVER use $(...) or backticks in terminal commands. It triggers a hardcoded CLI permission block. If you need to chain commands or pass variables, write a temporary .js or .ps1 script file and execute that instead.

Never run expensive or heavy commands (`npm install`, `npm run build`, `npm run ts-check`/tsc, test suites, dev servers, whole-project lint, Lighthouse runs, long crawls, etc.) unless the user explicitly asked or it is genuinely unavoidable for the change. Prefer targeted file reads, `grep`, `git status`, and isolated checks. Ask before running anything heavy.

CRITICAL — ONE COMMAND AT A TIME, NO PARALLEL FALLBACKS: Never launch a "real" command and a fallback/duplicate command in parallel. Run one command, wait for its result, then decide the next step. If you are unsure whether a CLI is installed, verify first with a single `which` / `Get-Command` / `--version` / `--help` check — do not launch a fallback alongside the main command. Preemptive parallel fallbacks waste time, create race conditions, and force the user to cancel redundant work.

## Response Formatting

Every answer to the user — and every subagent report — must be presented in **balanced chunks** that the human visual system can parse quickly. Never a wall of text.

- **Block size:** 1–3 sentences per block, with a blank line between blocks.
- **Bullets:** use a bulleted list when presenting 3+ parallel items; otherwise use prose blocks, not bullets.
- **Headings:** only when the answer spans 2+ distinct topics.
- **"One paragraph" means volume, not format.** Keep it to roughly paragraph length, but still split it into sentence-level dashed or blank-line-separated lines.
- **Floor — do not over-chunk:** a 1–2 sentence answer stays as one plain block. Balanced, not shredded.

When spawning a subagent, tell it to format its report per this section.

## Debugging method

**Ephemeral isolated harness first.** When a question is "does this CSS / browser / timing
primitive itself behave this way?" (a transition firing, a media-query guard, `onload`
vs. hydration order, a layout quirk), do NOT investigate it inside the running app where
framework timing confounds every reading. Write a throwaway single-file `.html` — no
build, no deps — that reproduces only the mechanism, log `performance.now()` events, open
it in the real browser, read the answer. Minutes to build, clean yes/no, runs on the
actual test machine. Keep it next to the relevant audit/issue notes, delete it when the
issue closes. See `_project/AI_LESSONS.md` L05 (and L04 for its counterpart: don't watch
timing bugs happen via browser automation).

## Inspecting the live UI

Default to text: page text, DOM, computed styles, ARIA, console, current URL. Take
screenshots only when visual rendering itself is the question (spacing, overlap, layout
regressions, mobile bands). Screenshots cost far more than text snapshots.

## Lessons store

`_project/AI_LESSONS.md` — concrete traps that already cost real time on this repo.
Worth a look before non-trivial work in an area it may cover. Add to it **only** when a
mistake cost >15 min or a wrong turn and you can write a specific trigger. Keep it lean.
(`_project/HUMAN_LESSONS.md` is the human-facing counterpart.)

**L09–L11 are cross-cutting, not area-specific — read them before any debugging task:**
measure before you build (L09), repo artifacts are evidence not authority (L10),
never fake an arrival/reveal animation the real event should drive (L11).

## Issue Risk Protocol

`_project/ISSUE-RISK-PROTOCOL.md` — the pre-flight before implementing any beads issue.
When the human says **"run the risk protocol"**, **"risk-assess `<issue>`"**, or **"risk
protocol"**, they mean exactly that document: produce a two-part assessment (A: outcome
risks — scope creep, boundary crossing, hallucination, mix-ups, false positives, quality
drop; B: execution risks — the lean-path mandate) and append it to the issue's beads NOTES.

**Part B is a standing rule for every implementation task on this repo, protocol invoked or
not:** edit source only, hand the live check to the human on `localhost:3000`. No
`next build`, no `tsc`/ts-check, no project lint, no test runs, no agent-run dev server, no
browser automation for verification, no `npm install` unless the issue calls for it, no
git (no branch/commit/push), minimal diff. If a "no" genuinely blocks the task, stop and
say so in one line — don't work around it.

## Beads issue naming

**MANDATORY — read `_project/beads-naming-convention.md` before any `bd create` or title edit.**
The beads ID (`sang-logium-agq`) is a random handle and stays that way; the **title** carries
all human readability and MUST be structured:

- Epic: `EPIC Filters Sorting` (the literal word `EPIC` + 2–4 Title-Case area words).
- Child of an epic: `[Filters] Price min/max <-> URL` (bracket tag = epic keyword, then the slice).
- Standalone: `Search: clamp out-of-range ?page=` (`Area:` prefix, then the slice).
- Describe the outcome, not the file. ≤ 60 chars. Never put a raw ID or `sang-logium-` in a title.

Always reference an issue as `` `sang-logium-agq` — EPIC Filters Sorting `` (ID + title), never the bare ID.

## Beads issue goal format — MANDATORY, NOT OPT-IN

Every beads issue's goal is expressed as **end-user UX acceptance tests**, never a prose
problem/task description. This is the default for every issue — the human must never have
to ask for it.

The body contains exactly:

1. **ACCEPTANCE TESTS** — a list of `When I <interaction>, then <observable outcome>`
   lines, each one something a human can do and see in a browser on the dev server at
   `localhost:3000`. No file paths, no `file:line`, no class/token names, no "set X to Y",
   no framework or implementation detail — purely what the end user experiences. Every
   line is the human's words verbatim or a direct when/then translation of their stated
   goal. Zero agent-invented speculation.
2. **CURRENT STATUS:** — one plain factual line ("not started" if unspecified).

For epic children the human may also have co-designed `SINGLE RESPONSIBILITY:`, a
`RISK ASSESSMENT` block (Outcome risks + Execution risks, each with a `Mitigation:`),
`Expected footprint`, `OUT OF SCOPE`, `SEQUENCE` — still no speculation.

Never store the human's problem statement verbatim as the goal — a bug-report paragraph
("the price ceiling is $0–$1000 but products run to $5,995") is NOT an acceptance test;
translate it to `When I…, then…` lines first. Never add prose descriptions, "next steps",
process notes, or `file:line` pointers to the goal.

These tests imply the execution model: the implementing agent edits source only, then
hands the `localhost:3000` live check to the human (Issue Risk Protocol Part B).

After creating: show the issue, give the human `bd show <id>`, then stop.

> Note: `.devin/workflows/beads-issue-gate.md` historically demanded verified `file:line`,
> exact tokens, and automated (Playwright) verification. That contradicts this model. This
> section wins; flag the conflict to the human rather than following the gate's anatomy.

## Build & Test

_Add your build and test commands here_

```bash
# Example:
# npm install
# npm test
```

## Architecture Overview

_Last reviewed 2026-08-01 against the live repo. Stack/pattern-level only — for implementation detail, read the actual files; this is not a substitute for that. Full tech stack list lives in `README.md` (kept there to avoid two copies drifting apart) — Next.js 15 App Router, React 19, Sanity v3, Stripe, Better Auth, Zustand, TypeScript/Zod, Playwright + Vitest._

**Top-level route/folder map** (`app/`): route groups `(store)` (public storefront), `(admin)`, `(studio)` (Sanity Studio), `(test)`; plus `checkout/`, `actions/` (server actions), `api/` (route handlers), `components/`, `lib/`, `hooks/`. Sanity queries live under `sanity-cms/` — never in `app/`.

**Catalogue pattern:** product catalogue uses a "Build-Time VFS" pattern (see `data/catalogue.ts`, `catalogue-code-record.md`) — headless CMS data pre-materialized at build time for sub-second navigation, rather than live-queried per request. Relevant when touching catalogue/product-listing performance or data-freshness questions.

**Workflow note:** this repo runs an AI-assisted pipeline — Claude does planning/task breakdown, Devin executes implementation (see `orchestration-plan.md`, `_project/devin-cloud-optimization-plan.md`).

**UX reference docs — read before exploring, not after:**
- Desktop layout looks cramped/short on vertical room → `docs/vertical-space-lg-touch.md` (the `lg-touch` breakpoint, the no-inheritance gotcha, the h-full-vs-aspect-ratio ownership gotcha, proven fixes) before touching spacing.
- Touching homepage data fetching or section composition → `docs/homepage-structure.md` (which section owns what data/state) before re-deriving it.

**Mandatory review gate:** any edit to a className touching height/sizing (`h-full`, `min-h-`, `max-h-`, `aspect-`) under `app/components/**` must be reviewed against the diff before the task is considered done — run it even if not asked to "review." This is not optional and does not depend on remembering the lesson below; it's a mechanical check for the `h-full` vs. explicit-height ownership pattern documented in `docs/vertical-space-lg-touch.md`, precisely because reading the doc once was not sufficient to prevent a real regression on the product-spotlight components.

## Conventions & Patterns

_Add your project-specific conventions here_


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
