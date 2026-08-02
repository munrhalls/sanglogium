# Project Instructions for AI Agents

This file provides instructions and context for AI coding agents working on this project.

## Hard Limits

Never run expensive or heavy commands (`npm install`, `npm run build`, `npm run ts-check`/tsc, test suites, dev servers, whole-project lint, Lighthouse runs, long crawls, etc.) unless the user explicitly asked or it is genuinely unavoidable for the change. Prefer targeted file reads, `grep`, `git status`, and isolated checks. Ask before running anything heavy.

## Build & Test

_Add your build and test commands here_

```bash
# Example:
# npm install
# npm test
```

## Architecture Overview

_Last reviewed 2026-08-01 against the live repo. Stack/pattern-level only — for implementation detail, read the actual files; this is not a substitute for that. Full tech stack list lives in `README.md` (kept there to avoid two copies drifting apart) — Next.js 15 App Router, React 19, Sanity v3, Stripe, Better Auth, Zustand, TypeScript/Zod, Playwright + Vitest._

**Top-level route/folder map** (`app/`): route groups `(store)` (public storefront), `(admin)`, `(studio)` (Sanity Studio), `(test)`; plus `checkout/`, `actions/` (server actions), `api/` (route handlers), `components/`, `lib/`, `hooks/`. Sanity queries live under `sanity-cms/` — never in `app/` (enforced check in the `sang-logium-review` skill).

**Catalogue pattern:** product catalogue uses a "Build-Time VFS" pattern (see `data/catalogue.ts`, `catalogue-code-record.md`) — headless CMS data pre-materialized at build time for sub-second navigation, rather than live-queried per request. Relevant when touching catalogue/product-listing performance or data-freshness questions.

**Workflow note:** this repo runs an AI-assisted pipeline — Claude does planning/task breakdown, Devin executes implementation (see `orchestration-plan.md`, `_project/devin-cloud-optimization-plan.md`).

## Conventions & Patterns

_Add your project-specific conventions here_
