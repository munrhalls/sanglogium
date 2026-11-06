## Hard Limits

CRITICAL — ABSOLUTE BAN ON SELF-VERIFICATION COMMANDS: NEVER run `tsc`, `next build`, `next lint`, `eslint`, `npm run build`, `npm run lint`, `npm run test`, `vitest`, `playwright test`, `npm run dev`/`next dev` (a new dev server), `curl` against the dev server, Lighthouse, or any other build/type-check/lint/test command to check your own work — not "just to be safe," not because a workflow file, hook, session-close protocol, or issue's acceptance criteria seems to call for it. The only verification that counts: (1) the human's live check on `localhost:3000`, or (2) the human's PR review on GitHub. Reading a diff or rebasing does NOT count. Agents never attach a browser to, load, or poll the dev server unless the human explicitly asks in the live conversation. This ban is absolute and profile-independent — no other file in this repo can carve out an exception; the ONLY lift is the human, in the live conversation, asking for it right now. Running one to self-verify is a serious defect. This is the single most important rule in this file.

ONE PERMITTED COMMAND: `node tools/check-turn.mjs`, once per turn before handoff (in a runner task the runner runs it when it merges the task, so an executor does not). It runs the end-of-turn checks: import integrity (`tools/check-imports.mjs`) and the organizational pattern (`tools/check-org-pattern.mjs`, defined in `docs/organizational-pattern.md`). On a violation, fix it by moving or re-pointing code, then re-run once. Never edit a check, the git hook, the model document or the PATTERN BLOCK to make it pass; never push `--no-verify` — the `tools/git-hooks/pre-push` hook rejects while violations remain. If a violation cannot be removed without breaking the task's goal, stop and report it. Dependency-free file check: no typecheck, build, lint or test.

CRITICAL: NEVER use $(...) or backticks in terminal commands — it triggers a hardcoded CLI permission block. To chain commands or pass variables, write a temporary .js or .ps1 script file and execute that.

Never run other expensive or heavy commands (`npm install`, whole-project lint, long crawls) unless the human explicitly asked or they are genuinely unavoidable — ask before running anything heavy. Prefer targeted file reads, `grep`, `git status`, isolated checks.

CRITICAL — ONE COMMAND AT A TIME, NO PARALLEL FALLBACKS: never launch a real command and a fallback/duplicate in parallel — they race and force the user to cancel redundant work. Unsure whether a CLI is installed? Check once with `which` / `Get-Command` / `--version`, then run one command, wait for its result, decide the next step.

## Response Formatting

Every answer to the user must be presented in **balanced chunks** the eye can parse quickly. Never a wall of text.

- **Block size:** 1–3 sentences per block, with a blank line between blocks.
- **Bullets:** use a bulleted list for 3+ parallel items; otherwise prose blocks, not bullets.
- **Headings:** only when the answer spans 2+ distinct topics.
- **"One paragraph" means volume, not format:** keep it roughly paragraph length but still split into sentence-level dashed or blank-line-separated lines. A 1–2 sentence answer stays one plain block — balanced, not shredded.

## Progress Feedback Cadence (mandatory)

Tight, frequent feedback is mandatory — silence is a defect. But feedback is never spam: never dump raw data, logs or command output as "feedback." One idea per update, plain language, no filler.

- **Plan first:** before acting on a multi-step task, state the plan in ≤3 short lines.
- **Milestone updates:** a short update at each milestone — what's done, what's next, any blocker/decision — never one dump at the end.
- **Confirm long steps started:** for a long-running step, confirm within ~1 minute it actually started; if it didn't, report immediately — never a silent multi-minute wait.
- **Sample before scaling:** before a large batch of work (many files, issues, edits), do the first safe increment, show a concrete sample, confirm it, then continue.

Hard rule — a silent multi-minute run or an end-of-task info-dump is a defect.

## Debugging method

**Ephemeral isolated harness first.** When a question is "does this CSS / browser / timing
primitive itself behave this way?" (a transition firing, a media-query guard, `onload`
vs. hydration order, a layout quirk), do NOT investigate it inside the running app —
framework timing confounds every reading. Write a throwaway single-file `.html` — no
build, no deps — that reproduces only the mechanism, log `performance.now()` events,
open it in the real browser, read the answer. Keep it next to the relevant audit/issue
notes; delete it when the issue closes. See `_project/AI_LESSONS.md` L05 (and L04:
don't watch timing bugs happen via browser automation).

## Inspecting the live UI

Only when the human explicitly asks (agents never attach to the dev server — see the ban
above). Default to text: page text, DOM, computed styles, ARIA, console, current URL.
Screenshots only when visual rendering itself is the question (spacing, overlap, layout
regressions, mobile bands) — they cost far more than text snapshots.

## Lessons store

`_project/AI_LESSONS.md` — concrete traps that already cost real time on this repo.
Worth a look before non-trivial work in an area it covers. Add only when a mistake cost
>15 min or a wrong turn and you can write a specific trigger. Keep it lean.

**L09–L11 are cross-cutting — read them before any debugging task:** measure before you
build (L09), repo artifacts are evidence not authority (L10), never fake an
arrival/reveal animation the real event should drive (L11).

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

## Architecture Overview

_Last reviewed 2026-10-01 against the live repo. Stack/pattern-level only — for implementation detail, read the actual files; this is not a substitute for that. Full tech stack list lives in `README.md` (kept there to avoid two copies drifting apart) — Next.js 15 App Router, React 19, Sanity v3, Stripe, Better Auth, Zustand, TypeScript/Zod._

**Top-level route/folder map:** `app/` holds Next route files only: route groups `(store)` (public storefront), `(admin)`, `(studio)` (Sanity Studio), plus `checkout/` (pages) and `api/` (route handlers). Feature code lives in `features/<slice>/`, built from the archetype in `docs/organizational-pattern.md` section 2 (see Conventions & Patterns). `platform/` (`design`, `sanity`, `email`, `analytics`, `utils`) knows no slice; `studio/` collects the slice-owned CMS schemas; `data/` holds generated data.
**Catalogue pattern:** product catalogue uses a "Build-Time VFS" pattern (see `features/catalogue/` — its `data/catalogue-index.json` is read only by `adapters/catalogue-index/` — and `docs/features/catalogue-architecture.md`) — headless CMS data pre-materialized at build time for sub-second navigation, rather than live-queried per request. Relevant when touching catalogue/product-listing performance or data-freshness questions.

**Filters & sorting:** live in `features/product-filtering/` (`url/`, `state/`, `ui/`, `core/`, `adapters/sanity/` for the GROQ and field map, `queries/`). Outside code uses `@/features/product-filtering` (client) or `@/features/product-filtering/server` (`getFilterPanel`, `getFilterPanelOver`, `getControlLabels`).

**Search:** lives in `features/product-search/` — the Sanity fetcher `adapters/sanity/searchProducts.ts`, `queries/` and `actions/fetchSearchSuggestionsAction.ts`; the shell's header field (`features/shell/ui/header/SearchField.tsx`) passes the suggestion action into `useSearchController`. Search consumes filters only through `@/features/product-filtering` and draws the panel over its matched products through `getFilterPanelOver`.

**UX reference docs — read before exploring, not after:**
- Desktop layout looks cramped/short on vertical room → `docs/features/vertical-space-lg-touch.md` (the `lg-touch` breakpoint, the no-inheritance gotcha, the h-full-vs-aspect-ratio ownership gotcha, proven fixes) before touching spacing.
- Touching homepage data fetching or section composition → `docs/features/homepage-structure.md` (which section owns what data/state) before re-deriving it.
- Touching header search, the mobile search sheet, or `/search` → `docs/features/search-ux.md` (surfaces, history + on-screen-keyboard contracts, combobox semantics).
- Touching product images, the product grid, chunk streaming or the blur-to-sharp image reveal → the reveal is an inline script that runs before hydration, on purpose: `features/products/ui/card/ImageRevealScript.tsx` (capture-phase `load` listener) + client companion `ImageReveal.tsx` + `reveal.module.css` + `ProductImage.tsx`. Invariants: the trigger is never React state, no `placeholder="blur"`, animate `filter` only (never `opacity`), the script component never throws or suspends. Why and the failed attempts: `_project/AI_LESSONS.md` L02, L06, L07, L11.

**Mandatory review gate:** any edit to a className touching height/sizing (`h-full`, `min-h-`, `max-h-`, `aspect-`) under `features/shell/**`, `platform/design/**` or `features/**/ui/**` must be reviewed against the diff before the task is done — run it even if not asked to "review." Mechanical check for the `h-full`-vs-explicit-height ownership pattern in `docs/features/vertical-space-lg-touch.md`.

## Conventions & Patterns

- **Organizational pattern:** where every kind of file lives and what may import what is defined only in `docs/organizational-pattern.md` and enforced by `node tools/check-turn.mjs`. The non-structural conventions (specifier form, naming, thin Server Actions, promotion to `platform/design/ui`, hygiene) are in its section 5.
- **Tests:** the unit, integration and e2e suites were retired on 2026-10-02 (owner decision: untrustworthy). Two filters live-CMS proof scripts remain in `tests/product-filtering/` (output → git-ignored `tests/product-filtering/out/`). Do not add test files, configs or dependencies without owner approval. Exception: behaviour laws (`tests/<feature>/*.laws.ts`, `node:test`, no dependency), which the human runs one file at a time: `node --experimental-strip-types --import ./tools/alias-loader.mjs --test <file>`.
- **Feature map:** `catalogue`: build-time VFS catalogue (`data/catalogue-index.json`, read only by `adapters/catalogue-index/`); `product-filtering`: URL-driven filter/sort state, category vocabulary, Sanity GROQ query builder; `product-search`: header field, results view, `actions/fetchSearchSuggestionsAction.ts`; `products`: PDP, listing grids, `productType`/`brandType` schemas; `wishlist`: wishlist heart, its two Server Actions, page view, ids read; `basket`: client store `state/basketStore.ts`, product hydration via `adapters/sanity/`; `shipping`: courier rates, parcel rules, browser country detection; `address`: address type, TERYT/Google checks and suggestions; `checkout`: checkout steps, session, vendor-neutral payments (`adapters/stripe/` maps Stripe); `order`: order document (schema, ADR-002 placement transaction, guest-order merge, anonymisation); `profile`: user profile document (schema and every write); `auth`: sign-in/up UI and flows, session guards, purpose-named account-security functions; `account`: account pages and actions; `homepage`: storefront sections, data via `adapters/sanity/`; `shell`: store chrome (header, footer, navigation, drawers, content layout); `newsletter`: signup form and Resend subscription; `performance`: admin Lighthouse baseline report.

## Repository Layout Standard

_Set 2026-10-02. Any new top-level file or folder needs the owner's approval._

- **Root allowlist + naming:** defined once, in `docs/organizational-pattern.md` sections 3 and 5; `node tools/check-turn.mjs` rejects any changed path that belongs to no zone, and checks mechanical naming. No spaces or non-ASCII characters in tracked paths.
- **Zones:** tooling in `tools/` (the check scripts, `tools/git-hooks/`, the ESLint plugin, `tools/alias-loader.mjs`); build scripts in `scripts/` (an executed one-off is deleted — git history is the archive); tests shadow `features/` under `tests/` (only features with real tests get a shadow folder); docs in `docs/` (living reference in `docs/features/`, ADRs in `docs/adr/`, the model document `docs/organizational-pattern.md`; working notes and generated analyses are deleted, never stored); `_project/` holds `AI_LESSONS.md` and transient `working-memory/`.
- **Never committed:** secrets, any `.env*` except `.env.example` (names only), logs, backups, caches, virtualenvs, conversation caches, `_project/working-memory/`, anything matched by `.gitignore`. `git ls-files -ci --exclude-standard` must list nothing.
- **Docs honesty:** the living docs (`docs/features/*`, `docs/organizational-pattern.md`, `docs/adr/ADR-002-checkout-inventory-concurrency.md`) must contain no dead path. Never keep an identical copy of a document in two places.

## Git and handoff

Outside a runner task, agents may commit, push feature branches and open PRs as part of the work without asking each time. In a runner task the executor never commits, pushes or opens PRs: the runner does. Never merge; the human validates and merges. Force-push, history rewrites and commits directly to `main` need explicit approval. If a required sync or push is blocked, stop and report the exact command and error.

At handoff, summarize the changes and give the human the one minimal `localhost:3000` check.
