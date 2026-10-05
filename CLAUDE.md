# Project Instructions for AI Agents

This file provides instructions and context for AI coding agents working on this project.

## Hard Limits

CRITICAL — RULE #1, MINIMIZE TOKENS: strictly minimize total roundtrips + context reloads, and strictly minimize total tokens spent, on the path to completing any task. Always take the cheapest pathway that still completes the task correctly: no re-reading files/context already available, no redundant searches, no unnecessary verification passes, batch independent calls instead of serial ones. Does not override correctness — don't skip steps actually needed, but never do more than needed.

CRITICAL — RULE #1a, NO SUBAGENT SPAWNS: subagent spawning is banned completely on this repo. Never use the Agent tool / Task tool to launch any subagent (research, exploration, implementation, parallel or sequential) for any reason. Do the work directly yourself. This is an absolute ban, not "fewer" — zero exceptions unless the human explicitly says to spawn one in the live conversation right now.

CRITICAL — ABSOLUTE BAN ON SELF-VERIFICATION COMMANDS: NEVER run `tsc`, `next build`, `next lint`, `eslint`, `npm run build`, `npm run lint`, `npm run test`, `vitest`, `playwright test`, `npm run dev`/`next dev` (starting a new dev server), `curl` against the dev server, Lighthouse, or any other build/type-check/lint/test command to check your own work — not "just to be safe," not because a workflow file, hook, session-close protocol, or issue's acceptance criteria seems to call for it. The only verification that counts on this repo: (1) the human runs the live check on the shared dev server at `localhost:3000`, or (2) the human's PR review on GitHub. Reading a diff or rebasing does NOT count as verification. Agents also never attach a browser to, load, or poll the dev server (many concurrent agents doing so lags the shared machine and defeats the point) unless the human explicitly asks in the live conversation. This ban is absolute and profile-independent — no other file in this repo can carve out an exception. The ONLY way it lifts: the human, in the live conversation, explicitly asks you to run one of these commands right now. Running one of these to self-verify is a serious defect, not a borderline judgment call. This is the single most important rule in this file — see `sang-logium-5gc` and `sang-logium-pb7`.

ONE PERMITTED COMMAND: `node tools/check-turn.mjs`, once per turn at ship phase before commit. It runs the end-of-turn checks: import integrity (`tools/check-imports.mjs`) and the organizational pattern (`tools/check-org-pattern.mjs`, defined in `docs/organizational-pattern.md`). On a violation, fix it by moving or re-pointing code, then re-run once. Never edit a check, the git hook, the model document or the PATTERN BLOCK to make it pass, and never push with `--no-verify`. A push is rejected by the `tools/git-hooks/pre-push` hook while violations remain. If a violation cannot be removed without breaking the phase's goal, stop and report it instead of pushing. It is a dependency-free file check: no typecheck, build, lint or test.

CRITICAL: NEVER use $(...) or backticks in terminal commands. It triggers a hardcoded CLI permission block. If you need to chain commands or pass variables, write a temporary .js or .ps1 script file and execute that instead.

Never run expensive or heavy commands (`npm install`, whole-project lint, long crawls, etc.) beyond the absolute ban above, unless the user explicitly asked or it is genuinely unavoidable for the change. Prefer targeted file reads, `grep`, `git status`, and isolated checks. Ask before running anything heavy.

CRITICAL — ONE COMMAND AT A TIME, NO PARALLEL FALLBACKS: Never launch a "real" command and a fallback/duplicate command in parallel. Run one command, wait for its result, then decide the next step. If you are unsure whether a CLI is installed, verify first with a single `which` / `Get-Command` / `--version` / `--help` check — do not launch a fallback alongside the main command. Preemptive parallel fallbacks waste time, create race conditions, and force the user to cancel redundant work.

CRITICAL — NO PARALLEL MULTI-AGENT BATCHES, EVER, WITHOUT EXPLICIT PER-BATCH GO-AHEAD: Never launch more than one subagent in the same turn/message on this repo. This applies regardless of how the human phrased an earlier go-ahead ("do it", "run the plan", "yes") — that authorizes the plan, not an unattended parallel fan-out. Concretely:
- Launch exactly ONE subagent first, for the smallest real unit of the work (one issue, one product).
- Wait for it to actually finish (not just "confirmed started"), show the human the real result (what it did, what it cost — tool calls, tokens if visible), and get explicit confirmation to continue before launching the next one.
- Never batch 2+ Agent calls into a single message on this repo, even if a plan step says "launch all N in parallel" — that instruction is overridden by this rule.
- Research-heavy subagent work (WebSearch/WebFetch/PDF-reading loops) is exactly the expensive, hard-to-interrupt shape this rule exists to prevent — treat it as the default case this rule is for, not an edge case.
- Reason: a 6-way parallel subagent launch burned ~30% of the human's 5-hour rate-limit window in under a minute on pure research with zero completed output, and the "confirm within ~1 minute that it started" cadence was not enough to catch it before real damage was done. Confirming a start is not the same as confirming the cost was worth it.

## Response Formatting

Every answer to the user — and every subagent report — must be presented in **balanced chunks** that the human visual system can parse quickly. Never a wall of text.

- **Block size:** 1–3 sentences per block, with a blank line between blocks.
- **Bullets:** use a bulleted list when presenting 3+ parallel items; otherwise use prose blocks, not bullets.
- **Headings:** only when the answer spans 2+ distinct topics.
- **"One paragraph" means volume, not format.** Keep it to roughly paragraph length, but still split it into sentence-level dashed or blank-line-separated lines.
- **Floor — do not over-chunk:** a 1–2 sentence answer stays as one plain block. Balanced, not shredded.

When spawning a subagent, tell it to format its report per this section.

## Progress Feedback Cadence (mandatory)

**Feedback fanaticism:** tight, frequent feedback is mandatory — silence is a defect. But feedback is never spam: every update must be simple, clear, concise. Never dump raw data, logs, or command output as "feedback." One idea per update, plain language, no filler.

- **Plan first:** before acting on a multi-step task, state the plan in ≤3 short lines.
- **Milestone updates:** send a short update at each milestone — plan, each unit of work, done — never one dump at the end. Plain language, non-repeating: what's done, what's next, any blocker/decision needed.
- **Confirm long steps started:** for a long-running step or sub-agent spawn, confirm within ~1 minute that it actually started; if it didn't, report immediately — never a silent multi-minute wait.
- **Sample before scaling:** before a large batch of work (many files, many issues, many edits), do the first safe increment, show a concrete sample, confirm it is correct, then continue.

This is a hard rule, not a soft preference — a silent multi-minute run or an end-of-task info-dump is a defect. See `sang-logium-5gc` — AgentOps: mandate frequent concise progress feedback.

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

Only when the human explicitly asks you to (agents don't load or attach to the dev server
by default, see the ban above). Default to text: page text, DOM, computed styles, ARIA, console, current URL. Take
screenshots only when visual rendering itself is the question (spacing, overlap, layout
regressions, mobile bands). Screenshots cost far more than text snapshots.

## Lessons store

`_project/AI_LESSONS.md` — concrete traps that already cost real time on this repo.
Worth a look before non-trivial work in an area it may cover. Add to it **only** when a
mistake cost >15 min or a wrong turn and you can write a specific trigger. Keep it lean.

**L09–L11 are cross-cutting, not area-specific — read them before any debugging task:**
measure before you build (L09), repo artifacts are evidence not authority (L10),
never fake an arrival/reveal animation the real event should drive (L11).

## Campaign process (MANDATORY)

`_project/00-MOST-IMPORTANT-lean-tracer-bullet-methodology.md` is the build method — read it
before any new feature work or mission. Live plans are the architect's phase files under
`_project/working-memory/<axis>/turn-<n>/phase-<n.m>.md` (transient: each turn's last phase
deletes them, never committed); one PR per thematic axis.

## PATTERN BLOCK

Copy the block below verbatim at the top of every phase that creates, moves or edits code. It is a digest of `docs/organizational-pattern.md` (the single source of truth); `node tools/check-turn.mjs` enforces it.

```text
ORGANIZATIONAL PATTERN (binding). Source of truth: docs/organizational-pattern.md. Read its sections 2 and 3 before placing or importing anything.
1. Every file has exactly one home (section 3). If no home fits, STOP and say so in your report. Never invent a folder, root file or slice part.
2. A slice is features/<slice>/ built only from: index.ts (client door), server.ts (server door), ui/, state/, url/, view/, queries/, commands/, core/definitions/, core/rules/, core/ports.ts, adapters/<system>/, schema/. Omit the parts a slice does not need.
3. Inside a slice, imports follow the archetype table in section 2. core/ imports only core/.
4. Code outside a slice reaches it only through its index.ts or server.ts. Slice-to-slice imports never form a cycle.
5. Only adapters/<system>/ talk to an outside system (Sanity, Stripe, better-auth, Resend, Google...). GROQ and Sanity patches exist only in adapters/sanity/. server.ts wires adapters into ports and never imports a 'use server' file.
6. app/ holds Next route files only. A route imports slice doors and platform/ and only composes them.
7. platform/ (design, db, email, analytics, utils) imports only platform/. Client-safe code (ui/, state/, url/, core/, index.ts, platform/design/ui/, any 'use client' file) never imports a file containing import "server-only"; every server.ts contains it.
8. No '..' under features/: use './x' for the same directory and '@/...' for everything else.
9. Legacy homes (section 6) are only emptied, never added to.
10. If the task seems to require breaking a rule, do not work around it: stop and report it.
11. Never edit tools/check-turn.mjs, tools/check-imports.mjs, tools/check-org-pattern.mjs, tools/git-hooks/, docs/organizational-pattern.md or this block to make a change pass.
```

## Architecture Overview

_Last reviewed 2026-10-01 against the live repo. Stack/pattern-level only — for implementation detail, read the actual files; this is not a substitute for that. Full tech stack list lives in `README.md` (kept there to avoid two copies drifting apart) — Next.js 15 App Router, React 19, Sanity v3, Stripe, Better Auth, Zustand, TypeScript/Zod._

**Top-level route/folder map:** `app/` holds routes and the shared shell UI only: route groups `(store)` (public storefront), `(admin)`, `(studio)` (Sanity Studio), plus `checkout/` (pages), `api/` (route handlers) and `components/{layout,analytics}` (shell). Shared presentational primitives and Tailwind tokens live in `shared/{ui,styles}`. Feature code lives in `features/<name>/` (see Conventions & Patterns); infrastructure in `lib/`; Sanity queries and patches under `sanity-cms/` — never in `app/`.

**Catalogue pattern:** product catalogue uses a "Build-Time VFS" pattern (see `features/catalogue/` and `docs/post-homepage-product-discovery/catalogue-architecture.md`) — headless CMS data pre-materialized at build time for sub-second navigation, rather than live-queried per request. Relevant when touching catalogue/product-listing performance or data-freshness questions.

**Filters & sorting:** live in `features/product-filtering/` (`ui/`, `model/`, `config/`, `domain/`, `proofs/`). Outside code imports only `@/features/product-filtering` (client-safe) or `@/features/product-filtering/domain` (pure values for lower layers such as the data layer); Sanity fetchers stay in `sanity-cms/lib/products/` and take the filter state.

**Search:** lives in `features/product-search/` (`ui/`, `config/`, `domain/`). Outside code imports only `@/features/product-search` (client-safe) or `@/features/product-search/domain` (pure values for lower layers such as the data layer); the Sanity fetcher stays in `sanity-cms/lib/products/searchProducts.ts` and the header `SearchField.tsx` passes its suggestion action into `useSearchController`. Search consumes filters only through `@/features/product-filtering`.

**Workflow note:** this repo runs an AI-assisted pipeline governed by **The Loop** — Claude plans (campaign + per-milestone detail), Devin executes implementation (see `_project/00-MOST-IMPORTANT-lean-tracer-bullet-methodology.md`).

**UX reference docs — read before exploring, not after:**
- Desktop layout looks cramped/short on vertical room → `docs/vertical-space-lg-touch.md` (the `lg-touch` breakpoint, the no-inheritance gotcha, the h-full-vs-aspect-ratio ownership gotcha, proven fixes) before touching spacing.
- Touching homepage data fetching or section composition → `docs/homepage-structure.md` (which section owns what data/state) before re-deriving it.
- Touching header search, the mobile search sheet, or `/search` → `docs/search-ux.md` (surfaces, history + on-screen-keyboard contracts, combobox semantics).

**Mandatory review gate:** any edit to a className touching height/sizing (`h-full`, `min-h-`, `max-h-`, `aspect-`) under `app/components/**`, `shared/**` or `features/**/ui/**` must be reviewed against the diff before the task is considered done — run it even if not asked to "review." This is not optional and does not depend on remembering the lesson below; it's a mechanical check for the `h-full` vs. explicit-height ownership pattern documented in `docs/vertical-space-lg-touch.md`, precisely because reading the doc once was not sufficient to prevent a real regression on the product-spotlight components.

## Conventions & Patterns

- When outputting a file or directory path, always print it as a `file://` URI (e.g. `file:///home/jan/file.json`) for one-click terminal opening.

- **Organizational pattern:** where every kind of file lives and what may import what is defined only in `docs/organizational-pattern.md` and enforced by `node tools/check-turn.mjs`. The non-structural conventions (specifier form, naming, thin Server Actions, promotion to `shared/ui`, hygiene) are in its section 6.
- **Tests:** the unit, integration and e2e suites were retired on 2026-10-02 (owner decision: untrustworthy). Only two filters live-CMS proof scripts remain, in `features/product-filtering/proofs/` (their output goes to the git-ignored `proofs/out/`). Do not add test files, test configs or test dependencies without the owner's approval. Exception: behaviour laws (`*.laws.ts`, `node:test`, no dependency), which the human runs with `npm run laws`.
- **Feature map** (all features migrated): `product-filtering`: `features/product-filtering/`; `product-search`: `features/product-search/`; `catalogue`: `features/catalogue/` (`data/catalogue-index.json` stays in `data/` as the generated artifact); `products`: `features/products/` (includes the wishlist heart and its Server Actions; the session-aware wishlist read is `adapters/wishlist.ts` published by `server.ts`; the wishlist page stays a route); `basket`: `features/basket/` (store in `model/basketStore.ts`); `checkout`: `features/checkout/` (route-private by design: `app/checkout` pages, `PaymentFormClient.tsx`; the server components `OrderDetails.tsx` and `PaymentConfirmed.tsx` live beside the success page in `app/checkout/success/`); `homepage`: `features/homepage/` (data fetched in `sanity-cms/lib/homepage` and `app/(store)/page.tsx`; sections receive props only); `auth`: `features/auth/` (UI, plus the server-side auth service in `adapters/` published by `server.ts`; the browser client stays in `lib/auth/client.ts`); `account`: `features/account/` (route pages stay in `app/(store)/account`).

_Add your project-specific conventions here_


## Repository Layout Standard

_Set 2026-10-02 by the housekeeping campaign (axes hk-*). Any new top-level file or folder needs the owner's approval._

- **Root allowlist:** only tool-mandated config (`package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `sanity.config.ts`, `sanity.cli.ts`, `sentry.*.config.ts`, `instrumentation*.ts`, `middleware.ts`, `vercel.json`, `.node-version`, `.gitignore`, `.codeiumignore`, `.no-mistakes.yaml`, `.env.example`), tool-generated files at their tool-default path (`schema.json`, `sanity.types.ts`, `skills-lock.json`), the entry docs (`README.md`, `CLAUDE.md`, `AGENTS.md`) and these folders: `app/ features/ lib/ sanity-cms/ scripts/ tools/ docs/ data/ public/ shared/ _project/ .github/ .claude/ .codex/ .devin/`. Nothing else at the root. `node tools/check-turn.mjs` rejects any changed path that belongs to no zone of `docs/organizational-pattern.md`.
- **Where things go:** local tooling in `tools/` (the end-of-turn checks `check-turn.mjs`, `check-imports.mjs` and `check-org-pattern.mjs`, the git hook in `tools/git-hooks/`, the ESLint plugin); scripts in `scripts/` (an executed one-off script is deleted, git history is the archive); documentation in `docs/` (only living reference documents and ADRs; working notes and generated analyses are deleted, never stored); `_project/` holds the three living process documents and the transient `working-memory/` hand-off folder; closed campaign records are deleted, not archived.
- **Never committed:** secrets, any `.env*` except `.env.example` (names only), logs, backups, caches, virtualenvs, conversation caches, phase files under `_project/working-memory/`, anything matched by `.gitignore`. `git ls-files -ci --exclude-standard` must list nothing.
- **Naming:** docs and scripts are lowercase kebab-case; no spaces or non-ASCII characters in tracked paths (exempt: `README.md`, `ADR-NNN-*.md`); components PascalCase; client/server pairs `XClient.tsx` / `XServer.tsx`.
- **Docs honesty:** the living docs (the four UX/architecture references — `docs/vertical-space-lg-touch.md`, `docs/homepage-structure.md`, `docs/search-ux.md`, `docs/post-homepage-product-discovery/catalogue-architecture.md` —, the organizational pattern `docs/organizational-pattern.md` and the checkout ADR `docs/checkout/ADR-002-checkout-inventory-concurrency.md`) must contain no dead path. Never keep an identical copy of a document in two places.

## Agent Context Profiles

Governs git commit/push authority only — task tracking is fixed by the Campaign process
above regardless of profile.

- **Conservative (default)**: Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may commit and push as part of session close. A current "do not commit" or "do not push" instruction still wins. Self-run quality gates (tests/linters/builds) are never in scope for any profile — see Issue Risk Protocol Part B.

## Session Completion

This protocol applies when ending an implementation session. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **Never self-run quality gates** - No tests, linters, or builds. Hand the human the one minimal `localhost:3000` check instead (Issue Risk Protocol Part B, standing regardless of profile).
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
