# Project Instructions for AI Agents

This file provides instructions and context for AI coding agents working on this project.

## Hard Limits

CRITICAL: NEVER use $(...) or backticks in terminal commands. It triggers a hardcoded CLI permission block. If you need to chain commands or pass variables, write a temporary .js or .ps1 script file and execute that instead.

Never run expensive or heavy commands (`npm install`, `npm run build`, `npm run ts-check`/tsc, test suites, dev servers, whole-project lint, Lighthouse runs, long crawls, etc.) unless the user explicitly asked or it is genuinely unavoidable for the change. Prefer targeted file reads, `grep`, `git status`, and isolated checks. Ask before running anything heavy.

CRITICAL — ONE COMMAND AT A TIME, NO PARALLEL FALLBACKS: Never launch a "real" command and a fallback/duplicate command in parallel. Run one command, wait for its result, then decide the next step. If you are unsure whether a CLI is installed, verify first with a single `which` / `Get-Command` / `--version` / `--help` check — do not launch a fallback alongside the main command. Preemptive parallel fallbacks waste time, create race conditions, and force the user to cancel redundant work.

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
