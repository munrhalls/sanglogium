# Stale Docs Audit — Removed Infra (Upstash Redis / BullMQ)

Date: 2026-09-30. Branch: stale-docs-audit. Read-only sweep; no code changes in Phase 1.

## Needs human decision (code/config — agents never delete these)

Remaining `git grep -i upstash|bullmq` hits and other dead infra residue that require a human (package.json edits, code deletions, test/config changes):

| File | Line | Why it remains |
|---|---|---|
| `package.json` | `"@upstash/redis": "^1.37.0"` dep; `test:checkout*` scripts → nonexistent `tests/checkout/guest-checkout-inventory-reservation/` + `tests/checkout/quick-test.test.ts` | Dead dep + dead scripts — human to uninstall/retarget |
| `package.json` | `pino`, `pino-pretty` deps | Declared, zero imports — unused deps, human to uninstall (or wire Pino if it was intended) |
| `lib/dev/redis-test.ts` | whole file | Dead code (no importers); last `@upstash/redis` consumer — human to delete |
| `lib/dev/integrity-monitor.ts` | whole file | Dead code (no importers); self-aware Redis stubs — human to delete |
| `lib/dev/logger.ts` | whole file | Dead code (no importers); app uses `event-logger.ts` — human to delete |
| `playwright.checkout.config.ts` | :11 comment "(shared Redis/Sanity)" | Comment only — human to fix comment / decide if config still needed |
| `vitest.integration.config.ts` | `RESERVATION_TTL_SEC`, glob of missing dir | Dead config — human to fix |
| `tests/config.ts` | `RESERVATION_EXPIRY_MS` | No consumer — human to remove |
| `tests/checkout/e2e/shipping-visual-tracer.test.ts` | creates `basketReservation` docs | Dead-path test — human to delete/retarget |
| `app/api/shipping/rates/route.ts` | reads `basketReservation` docs | Orphaned route (UI uses `/api/basket/shipping-rates`) — human to delete |
| `sanity-cms/lib/client.ts`, `backendClient.ts` | "Used for: basket reservations" comments | Stale comments on live files — human to fix |
| `docs/auth/data-functionality-should-be-intelligence-update{,-2}.md` | Upstash-as-rate-limiter-storage suggestions | KEEP verdicts (proposal, not false claim) — human may optionally annotate |
| `research/LOGGING_PATTERNS_2026.md` | body still describes Redis-based design | Banner added marking premise stale; body left for human to delete or rewrite |
| `docs/devin-carousel-arrow-visual-refinement-tasks.md`, `docs/devin-carousel-controls-ux-tasks.md`, `docs/devin-iem-ux-tasks.md` | — | Finished one-off task briefs — DELETE-doc candidates, left for human call |
| `flash-window-problem.md` | — | Resolved Windows diagnostic, one-off — DELETE-doc candidate, human call |



## (a) Ground-truth stack

Source: `package.json`, `instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `vercel.json`, `git grep process.env` over `app lib actions sanity-cms`.

### Runtime services actually wired in code

| Service | Evidence | Status |
|---|---|---|
| Sentry (`@sentry/nextjs` ^10.65.0) | `instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` — `Sentry.init` + `captureRequestError` | LIVE |
| Vercel Speed Insights (`@vercel/speed-insights` ^2.0.0) | imported in `app/(store)/layout.tsx`, `app/checkout/layout.tsx` | LIVE |
| Pino (`pino` ^10.3.1 + `pino-pretty`) | in `dependencies`, but `git grep -l "pino" -- app lib instrumentation*` → **zero imports**. Real logger is hand-rolled `lib/dev/logger.ts` (LOG_LEVEL-gated console wrapper) | DEP ONLY — not used |
| Upstash Redis (`@upstash/redis` ^1.37.0) | in `dependencies`; only import site is orphaned `lib/dev/redis-test.ts` (nothing imports it) | REMOVED — dep + dead file left behind |
| BullMQ / ioredis | no dependency, no import anywhere | REMOVED |

### Env vars actually read by code

`ADDRESS_VERIFY_MODE, AUTOCOMPLETE, BETTER_AUTH_SECRET(S), BETTER_AUTH_URL, CHECKOUT_JWT_SECRET, CHECKOUT_SEED_SECRET, DATABASE_URL (+TURSO_AUTH_TOKEN), GOOGLE_ADDRESS_VALIDATION_API_KEY, GOOGLE_CLIENT_ID/SECRET, LOG_LEVEL, NEXT_PUBLIC_BASE_URL, NEXT_PUBLIC_DISABLE_WEB_VITALS, NEXT_PUBLIC_GA_MEASUREMENT_ID, NEXT_PUBLIC_SANITY_*, NEXT_PUBLIC_SENTRY_DSN, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_VERCEL_ENV, NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE, RESEND_*, SANITY_API_*, SANITY_STUDIO_*, SENDER_ADDRESS_*, SESSION_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, TERYT_*, TEST_PRODUCT_ID`.

- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`: referenced only by dead `lib/dev/redis-test.ts` and stale docs — no live consumer.
- `RESERVATION_TTL_SEC`: only in `vitest.integration.config.ts` env block and `docs/checkout-queue/PRODUCTION.md` — no code reads it.
- `RESERVATION_EXPIRY_MS`: only in `tests/config.ts` — no code reads it.

### Crons / background processes / queues

- `vercel.json`: only `buildCommand`, `installCommand`, `git.deploymentEnabled:false` — **no `crons` key**.
- No `/api/cleanup/*` route, no `lib/queue/`, no worker entry points, no `app/api/checkout-queue/`.
- Nothing creates `basketReservation` documents (no `basketReservationType.ts` in `sanity-cms/schemaTypes/`). Residue: orphaned reader `app/api/shipping/rates/route.ts` (UI calls `/api/basket/shipping-rates` instead), `reservedStock` product field still read by basket UI (`stock - reservedStock` display math).

## (b) Findings

| File | Claim (quote) | Code evidence | Verdict | Action |
|---|---|---|---|---|
| `README.md:33` | "Infrastructure: Upstash Redis (inventory reservation) · BullMQ (background jobs) · Sentry · Vercel Speed Insights · Pino" | No `@upstash/redis`/`bullmq` import except dead `lib/dev/redis-test.ts`; `pino` has zero imports | STALE (Sentry + Speed Insights TRUE; Pino dep-only) | CORRECT |
| `package.json:67` | `"@upstash/redis": "^1.37.0"` dependency | Only consumer is orphaned `lib/dev/redis-test.ts` | STALE dep | DELETE (dep + dead file — separate cleanup decision) |
| `package.json` scripts | `test:checkout*` → `tests/checkout/guest-checkout-inventory-reservation/`, `tests/checkout/quick-test.test.ts` | Both paths do not exist (`ls` fails) | STALE scripts | CORRECT/DELETE (Phase 2+) |
| `playwright.checkout.config.ts:11` | "Single worker for checkout tests (shared Redis/Sanity)" | No Redis anywhere | STALE comment | CORRECT |
| `lib/dev/redis-test.ts` | Whole file: `import { Redis } from '@upstash/redis'` dev connection test | `git grep` — no importer; orphaned | STALE dead code | DELETE (flagged; not deleted in Phase 1) |
| `lib/dev/integrity-monitor.ts:14-24` | "Check Redis hash integrity… Stubbed — Redis removed." | Functions are stubs returning true; accurate comments | DEV-ONLY, self-aware | KEEP (or delete file in later cleanup) |
| `lib/dev/event-logger.ts:2` | "No Redis, no disk writes" | matches code | TRUE | KEEP |
| `docs/checkout-queue/README.md` | Entire doc: `lib/queue/redis.ts`, `app/api/checkout-queue/route.ts`, "Redis (Upstash) - Queue storage" | `ls lib/queue app/api/checkout-queue` → not found | STALE | DELETE |
| `docs/checkout-queue/MAJOR ADR.md` | "Atomic FIFO Processing with Redis", "Redis SET NX", "Adds Redis dependency" | No queue infra exists | STALE (historical ADR) | DELETE or mark superseded |
| `docs/checkout-queue/PRODUCTION.md` | `UPSTASH_REDIS_REST_*` env vars, cron cleanup `/api/cleanup/expired-reservations`, "Runtime: nodejs (required for Redis)" | No env consumer, no cleanup route, vercel.json has no crons | STALE | DELETE |
| `docs/checkout-queue/TECHNICAL DIAGRAM.md` | Redis RPUSH/LPOP queue diagrams, cleanup job | No such infra | STALE | DELETE |
| `docs/checkout-queue/reservation-ttl/README.md` | `lib/queue/cleanup.ts`, `backgroundCleanupJob`, expired-reservation cleanup | `lib/queue/` does not exist | STALE | DELETE |
| `docs/checkout/ADR-002-checkout-inventory-concurrency.md` | Describes removing "Redis FIFO queue and Node.js spin loop" (accurate history) BUT proposes "Soft Reservation via Redis TTL" (`soft-reserve:{productId}`) | `git grep soft-reserve` → no implementation; reservation flow never landed | PARTIAL — removal narrative true, proposed Redis feature never built | CORRECT (annotate proposal as not implemented) or DELETE |
| `docs/hosting/Q & A.md:15,96-97` | "Upstash Redis (minimal usage in dev tools only)"; lists `UPSTASH_REDIS_REST_URL/TOKEN` env vars | Only consumer is dead dev file; env vars unused | STALE | CORRECT |
| `docs/auth/data-functionality-should-be-intelligence-update.md:250,314` & `-update-2.md:196,260` | Propose Upstash/Redis secondary storage for Better Auth rate limiter | Better Auth in-memory limiter is real (`lib/auth.ts`); Upstash is only a proposal | PARTIAL — proposal, not claim of existing infra | KEEP (optional annotation) |
| `docs/auth/userprofile-atomicity-spec-updated.md:86` | "Introduces Redis/queue dependency" as a trade-off warning | Accurate caution, no claim of existing infra | TRUE | KEEP |
| `docs/auth/userprofile-atomicity-spec.md:224,264` | Proposes "Vercel cron job" for cleanup | Proposal only; vercel.json has no crons | PARTIAL (unimplemented proposal) | KEEP |
| `app/checkout/Checkout plan.md:1-6` | "triggers a queue that runs an atomic reservation operation… saves a checkout reservation document in Sanity" | No queue; `CheckoutButton.tsx` + `actions/checkout/index.ts` contain no queue/reservation code | STALE | CORRECT/DELETE |
| `tests/checkout/test-data/integration-test-spec.md` | Requires `sanity/schemaTypes/basketReservationType.ts`, `scripts/create-test-basket-reservation.mjs` | Neither exists | STALE | DELETE |
| `vitest.integration.config.ts:23-39` | `RESERVATION_TTL_SEC`, test glob `tests/checkout/guest-checkout-inventory-reservation/**` | Directory does not exist | STALE config | CORRECT (Phase 2+, code file) |
| `tests/checkout/e2e/shipping-visual-tracer.test.ts:40-51` | Creates `_type: 'basketReservation'` docs directly | Schema type absent; reservation flow removed — dead-path test | STALE | Flag (code, later phase) |
| `app/api/shipping/rates/route.ts:56-94` | Fetches `basketReservation` doc by `basketReservationId` | Orphaned — UI calls `/api/basket/shipping-rates` | DEV-ONLY residue / dead code | Flag (code, later phase) |
| `sanity-cms/lib/backendClient.ts:3`, `sanity-cms/lib/client.ts:24` | "Used for: basket reservations…" | Clients are real; comment lists removed use-case | PARTIAL (stale comment) | CORRECT (minor) |
| `research/LOGGING_PATTERNS_2026.md` | Assumes "existing Redis infrastructure", recommends Redis log backend (`ioredis` line 568) | No Redis infra | STALE premise | CORRECT or mark superseded (P2) |
| `research/_ARCHIVED_shipping-page-polish-rates-examination-2026-05-14.md` | Describes basketReservation shipping flow | Archived historical research; flow removed | STALE but archived | KEEP (historical, clearly archived) |
| `.devin/research/aaa-pattern-research.md:45` | "Located in our codebase: tests/checkout-queue/integration/happy-path/sequential-fifo.test.ts" | `tests/checkout-queue/` does not exist | STALE | CORRECT (P2) |
| `_project/checkout-gating-questions/00-rubric-and-slice-map.md:97`, `04-settlement-order-stock.md:49` | "No server-side reservation, no queue." / "No reservation earlier in" | Matches reality | TRUE | KEEP |
| `_project/reports/product-photography-fill-ratio-DEVIN-PLAN.md`, `_project/vibe-coding-field-manual.md` | Hits are the substring "redis" inside "rediscover(ed)" | False positives | N/A | KEEP |
| `_project/AI_LESSONS.md:22,151`, `orchestration-diagrams/diagrams.md:178`, `docs/kanban-cline-cli-guide.md`, `lib/filter-sort/__tests__/acc-subset-proof.mjs:406`, `_project/filters/*.cjs`, `sanity-cms/utils/migrations/*.mjs` | "queue"/"worker" in unrelated senses (animation queues, facet pipeline, migration rate-limit delays) | Unrelated to removed infra | TRUE/N/A | KEEP |
| `docs/checkout/payment/data-functionality-should-be-intelligence.md:150-152`, `implementation-intelligence.md:9,48,61` | Correctly document basketReservation flow as "deprecated … not used by the current iron-session flow" | Accurate | TRUE | KEEP |
| `docs/checkout/CHECKOUT-SYNOPSIS.md:101`, `docs/checkout/security-audit.md:31` | Reference `components/features/checkout/reservation/CheckoutButton.tsx` | File exists; only the folder name is vestigial | TRUE (minor naming residue) | KEEP |
| `docs/auth/*` rate-limit lines (gap-analysis, missing-features, sign-in audits, user-account doc) | Better Auth in-memory rate limits | `lib/auth.ts` real | TRUE | KEEP |
| `docs/basket/shipping-cost/*` | ipapi.co rate-limiting notes | Unrelated external API | TRUE | KEEP |

### Ignored: data/third-party

`sanity*/backups/*.json`, `_project/filters/*.json`, `LICENSE.txt`, `.claude/skills/vercel-react-best-practices/**`, binary assets matching "worker" (filenames like `*-earbuds-*`, screenshots), `_project/agent-logs/*.log`, `_project/cms-patch-supervisor*.log`, `docs/**.png`, `public/**`.

## (c) Priority order

- **P0 — agent-loaded surfaces:** `README.md:33` (fix in Phase 2), `CLAUDE.md`, `AGENTS.md` (both clean of removed-infra claims — verified), `.claude/skills/**` (ignored third-party), `package.json` (dep + stale scripts — agents read it for ground truth), `playwright.checkout.config.ts` comment.
- **P1 — docs describing removed features:** all of `docs/checkout-queue/**`, `app/checkout/Checkout plan.md`, `docs/checkout/ADR-002-checkout-inventory-concurrency.md` (proposal half), `docs/hosting/Q & A.md`, `tests/checkout/test-data/integration-test-spec.md`, `vitest.integration.config.ts`, `tests/checkout/e2e/shipping-visual-tracer.test.ts`, `app/api/shipping/rates/route.ts`, `lib/dev/redis-test.ts`, `sanity-cms/lib/*` comments.
- **P2 — historical reports & research:** `research/LOGGING_PATTERNS_2026.md`, `research/_ARCHIVED_*`, `.devin/research/aaa-pattern-research.md`, `_project/` reports.

## README line-by-line

| Line | Claim | Evidence | Result |
|---|---|---|---|
| 3-4 | "Production e-commerce platform… solo over 18+ months" | Editorial claim, not code-verifiable | TRUE (kept) |
| 6 | Live URL `https://www.sanglogium.com` | External link — not verified (no network) | UNVERIFIED (kept — user's own domain) |
| 10 | Custom checkout flow with Stripe Payment Intents | `stripe` dep; `app/api/checkout/payment-intent-session/route.ts`; `app/checkout/` | TRUE |
| 11 | Custom auth via Better Auth | `better-auth` dep; `lib/auth.ts`; `app/api/auth/[...all]/route.ts` | TRUE |
| 12 | Catalogue of 500+ products, admin/marketing panels | `data/` dirs + `sanity-cms/` studio | TRUE (count not re-counted) |
| 13 | Data pipeline: Playwright, Sanity CMS, image processing | `playwright*` configs, `sanity-cms/utils/` migrations, `sharp` dep | TRUE |
| 14-15 | AI-assisted workflow (Claude plans, Devin executes) | matches `CLAUDE.md` "The Loop" | TRUE |
| 19 | Next.js 15 App Router, React 19, TypeScript | `next ^15.5.9`, `react ^19.2.6`, `typescript` in deps | TRUE |
| 21 | Sanity v3, Turso/libsql auth DB | `sanity ^3.74.1`, `@libsql/client`, `TURSO_AUTH_TOKEN` env | TRUE |
| 23 | Stripe Payment Intents, Embedded Elements | `stripe`, `@stripe/react-stripe-js` deps | TRUE |
| 25 | Better Auth Kysely adapter, iron-session | `@better-auth/kysely-adapter`, `iron-session` deps; `lib/session.ts`, `actions/checkout/index.ts` | TRUE |
| 27 | Resend email | `resend` dep; `lib/email.ts`; `app/api/newsletter/subscribe/route.ts` | TRUE |
| 29 | AlleKurier & Packlink | `lib/shipping/allekurier-rates.ts`, `lib/shipping/packlink-rates.ts` | TRUE |
| 31 | Zustand · React Hook Form · Zod | all three in deps | TRUE |
| 33 | Infrastructure: Upstash Redis, BullMQ, Sentry, Speed Insights, Pino | `@upstash/redis` imported only by dead `lib/dev/redis-test.ts`; no `bullmq`/`ioredis`; `pino` zero imports; `@sentry/nextjs` wired in `instrumentation*.ts`/`sentry.*.config.ts`; `@vercel/speed-insights` imported in `app/(store)/layout.tsx`, `app/checkout/layout.tsx` | **STALE → CORRECTED** to "Sentry · Vercel Speed Insights" |
| 35 | Google Maps Address Validation | `@googlemaps/addressvalidation` dep; `GOOGLE_ADDRESS_VALIDATION_API_KEY` env | TRUE |
| 37 | Tailwind CSS | `tailwindcss` dep | TRUE |
| 39 | Playwright + Vitest | both in devDeps | TRUE |
| 41-43 | Screenshots placeholder | no links, no claims | TRUE (no dead links) |

No relative links in README → no dead-link risk.

**AGENTS.md / CLAUDE.md:** grepped for `upstash|bullmq|redis|reservation|queue` — only hit is `CLAUDE.md:24` "rate-limit window" (unrelated). No changes needed.

**Note:** `pino`/`pino-pretty` remain in `package.json` dependencies and `@upstash/redis` too — declared but unused (Pino) / dead-file-only (Upstash). Flagged for a later cleanup phase; not removed here to keep this diff docs-only.

## Docs and leftovers verdicts (Phase 3)

### Task 1 — named docs

| File | What it claims | Code evidence | Verdict | Reason |
|---|---|---|---|---|
| `docs/checkout-queue/README.md` | Live atomic FIFO queue: `lib/queue/{types,redis,health}.ts`, `app/api/checkout-queue/route.ts`, "Redis (Upstash) - Queue storage" | `ls lib/queue` / `app/api/checkout-queue` → not found | DELETE-doc | Describes removed subsystem as current |
| `docs/checkout-queue/MAJOR ADR.md` | "Atomic FIFO Processing with Redis", "Redis SET NX" lock, `requestId` dedup | No queue/Redis code exists | DELETE-doc | ADR for a removed design; historical at best, misleading today |
| `docs/checkout-queue/PRODUCTION.md` | Prod checklist for checkout-queue; `UPSTASH_REDIS_REST_URL/TOKEN`, `RESERVATION_TTL_SEC`, cron `/api/cleanup/expired-reservations`, "Runtime: nodejs (required for Redis)" | No env consumer (`git grep UPSTASH_REDIS` → only dead dev file + this doc); no cleanup route; no crons in `vercel.json` | DELETE-doc | Checklist for a subsystem that no longer exists |
| `docs/checkout-queue/TECHNICAL DIAGRAM.md` | Redis RPUSH/LPOP/LINDEX queue diagrams, TTL cleanup job | Same — no queue code | DELETE-doc | Diagrams of removed design |
| `docs/checkout-queue/reservation-ttl/README.md` | `lib/queue/cleanup.ts`, `backgroundCleanupJob()`, expiry flow; links `_project/checkout-queue/reservation-ttl/*.md` | `lib/queue/` absent; linked `_project/checkout-queue/` dir absent (dead links) | DELETE-doc | Removed subsystem + dead links |
| `docs/checkout/ADR-002-checkout-inventory-concurrency.md` | Status "Accepted" 2026-05-21: remove Redis queue (true) + Pattern 2 "Soft Reservation via Redis TTL" `soft-reserve:{productId}:{sessionId}` | `git grep soft-reserve` in app/lib → nothing; no Redis client; `reservedStock` only read for display (`app/api/basket/products/route.ts:26`) | CORRECT | Removal half is true history; "Accepted" status + Redis proposal never implemented — annotate as superseded/not-implemented, or delete |
| `docs/hosting/Q & A.md` | "Upstash Redis (minimal usage in dev tools only) - Fully compatible" (line 15); env list includes `UPSTASH_REDIS_REST_URL/TOKEN` (lines 96-97) | Only consumer is dead `lib/dev/redis-test.ts` | CORRECT | Migration Q&A otherwise historical-but-harmless; remove the Upstash lines or delete doc as one-off |
| `docs/auth/data-functionality-should-be-intelligence-update.md` | Line 250/314: suggests "secondary storage (Redis / Upstash)" for Better Auth rate limiter | Better Auth in-memory limiter is live (`lib/auth.ts`); Upstash is proposal-only | KEEP | Proposal language, not a false claim of existing infra; optional note |
| `docs/auth/data-functionality-should-be-intelligence-update-2.md` | Same suggestion (lines 196, 260) | Same | KEEP | Same |
| `docs/auth/userprofile-atomicity-spec-updated.md` | Spec marked "Supersedes: userprofile-atomicity-spec.md"; userProfile atomicity via hooks | Implemented — `databaseHooks` in `lib/auth.ts:151-251` creates/deletes userProfile | KEEP | Spec accurately describes implemented design |
| `research/LOGGING_PATTERNS_2026.md` | Assumes "existing Redis infrastructure" (lines 24, 52, 374, 495, 507, 528-540, 568); recommends `lib/frontend-logger.ts` + `app/api/logs/[traceId]/route.ts` | No Redis; neither recommended file exists (`ls` fails); what exists: `lib/dev/event-logger.ts` (live), `lib/dev/logger.ts` (dead), `app/api/trace/route.ts` | CORRECT | Research doc built on a false premise; mark superseded or annotate Redis assumption as removed |

### Task 2 — markdown sweep flags

Sweep: `git ls-files "*.md"` filtered to docs/, research/, orchestration-diagrams/, root-level, _project/, .devin/, .claude/ — then `git grep` for tokens of removed infra (`lib/queue`, `api/checkout-queue`, `api/cleanup`, `basketReservation`, `shippo`, `upstash`, `bullmq`, `pino`, `tests/checkout-queue`, `guest-checkout-inventory-reservation`, `PaymentPageClient`, `frontend-logger`, `api/logs`, `soft-reserve`) and `ls`/`git grep` verification per hit.

| File | False / dead reference | Verified by | Verdict |
|---|---|---|---|
| `app/checkout/Checkout plan.md` | "triggers a queue that runs an atomic reservation operation, saves a checkout reservation document in Sanity" | `CheckoutButton.tsx` + `actions/checkout/index.ts` contain no queue/reservation code; no `basketReservationType` schema | DELETE-doc (stale design brief) |
| `tests/checkout/test-data/integration-test-spec.md` | Requires `sanity/schemaTypes/basketReservationType.ts` + `scripts/create-test-basket-reservation.mjs` | Both paths absent (`ls` fails) | DELETE-doc |
| `docs/checkout/payment/ux-visual-should-be-intelligence.md` | References `PaymentPageClient.tsx` error state as current (lines 17, 253) | `git grep PaymentPageClient -- app` → nothing; file deleted | CORRECT (component gone; doc describes dead UI) |
| `docs/checkout/payment/data-functionality-should-be-intelligence.md:150-152` | Lists PaymentPageClient/`basketReservationId` as "deprecated … orphaned Flow B artifacts" | They are fully deleted, not merely deprecated | KEEP (accurate in spirit — marks flow as not current) |
| `docs/checkout/payment/implementation-intelligence.md:9,48,61` | Same deprecation framing | Same | KEEP |
| `.devin/research/aaa-pattern-research.md:45` | "Located in our codebase: tests/checkout-queue/integration/happy-path/sequential-fifo.test.ts" | `tests/checkout-queue/` does not exist | CORRECT (one line) |
| `orchestration-diagrams/diagrams.md` | "Read alongside `_project/orchestration-plan.md`" | That file does not exist — dead link | CORRECT |
| `docs/kanban-cline-cli-guide.md` | Describes `.beads/` tracker + `bd` CLI + board on localhost:3333 | `git ls-files | grep bead` → 0; `.beads/` absent | DELETE-doc (one-off guide for removed tooling) |
| `docs/devin-carousel-arrow-visual-refinement-tasks.md`, `docs/devin-carousel-controls-ux-tasks.md`, `docs/devin-iem-ux-tasks.md` | Finished one-off task briefs; referenced dirs (`featured/`, `dacs/`, `iems-gallery/`, `layout/carousel/`) all exist but the tasks are done | `ls` confirms paths | DELETE-doc candidate (completed briefs — human call) |
| `flash-window-problem.md` (root) | Resolved Windows 11 `agent-ops-resmon` diagnostic | N/A — one-off resolved issue, repo now developed on Linux | DELETE-doc candidate |
| `_project/devin-cloud-optimization-plan.md` | Workflow planning doc, no stale infra refs | read header | KEEP (P2, historical) |
| `docs/logging/*` (3 files) | Describe `latest-checkout-trace.json` fs-based checkout tracing | Trace infra exists in evolved form (`app/api/trace/route.ts`, `event-logger.ts`); exact file sink unverified | KEEP (details may differ; not removed-infra) |
| `research/_ARCHIVED_*.md` (4 files) | Describe Shippo/basketReservation-era shipping flow | Archived prefix; historical | KEEP (explicitly archived) |
| `_project/checkout-gating-questions/*` | Explicitly note "No server-side reservation, no queue" | Matches code | KEEP |
| `docs/auth/devin-tasks/*.md` | Task briefs for auth features | spot-checked `07-guest-to-account-order-merge.md` — no removed-infra refs found | KEEP (review only if auth work resumes) |
| `skills-lock.json` | Lock file for 3 skills | All 3 skills present under `.claude/skills/` | KEEP |

Not flagged (verified clean of removed-infra references): `docs/performance/*`, `docs/diagrams/*`, `docs/design-system.md`, `docs/homepage-structure.md`, `docs/search-ux.md`, `docs/vertical-space-lg-touch.md`, `docs/testing/*`, `docs/basket/**` (shipping-cost rate-limit lines refer to external ipapi.co, unrelated), `sanity-cms/utils/migrations/**` READMEs, `tests/AGENTS.md`, `tests/Tests*Convention.md`, all `data/**/*.md` product records, `.claude/skills/**` (third-party), `.devin/memories/*`, `.devin/research/TEST_*` and `contract-design-*` (generic testing guidance).

### Task 3 — leftover code/config classification

| File | Redis/queue reference | Importers? | Classification |
|---|---|---|---|
| `lib/dev/redis-test.ts` | `import { Redis } from '@upstash/redis'` + reads `UPSTASH_REDIS_REST_*` env | none (`git grep` → 0) | **DEAD CODE — FLAG FOR HUMAN** (delete file + dep) |
| `lib/dev/integrity-monitor.ts` | Docstrings: "Check Redis hash integrity … Stubbed — Redis removed" | none | **DEAD CODE (self-aware stubs) — FLAG FOR HUMAN** (delete file) |
| `lib/dev/logger.ts` | none (Redis-free console wrapper) | none | **DEAD CODE — FLAG FOR HUMAN** (unused; app actually uses `event-logger.ts`) |
| `lib/dev/event-logger.ts` | line 2 comment: "No Redis, no disk writes" | `actions/checkout/index.ts`, `api/checkout/*`, `api/trace`, `api/webhooks/stripe`, `checkout/*/page.tsx`, `lib/checkout/createOrderFromPaymentIntent.ts` | **LIVE — comment accurate — KEEP** |
| `playwright.checkout.config.ts:11` | comment "Single worker … (shared Redis/Sanity)" | n/a (comment) | **COMMENT ONLY — FLAG FOR HUMAN** (fix comment; config itself may still gate `test:checkout:quick` scripts) |
| `package.json` deps | `@upstash/redis`, `pino`, `pino-pretty` | `@upstash/redis` → only dead `redis-test.ts`; `pino*` → zero imports | **DEAD DEPS — FLAG FOR HUMAN** (uninstall) |
| `package.json` scripts | `test:checkout`, `test:checkout:all`, `test:checkout:quick`, `test:checkout:fast` → `tests/checkout/guest-checkout-inventory-reservation/`, `tests/checkout/quick-test.test.ts` | both paths absent | **DEAD SCRIPTS — FLAG FOR HUMAN** (remove or retarget) |
| `vitest.integration.config.ts` | `RESERVATION_TTL_SEC` env + glob `tests/checkout/guest-checkout-inventory-reservation/**` | dir absent | **DEAD CONFIG — FLAG FOR HUMAN** |
| `tests/checkout/e2e/shipping-visual-tracer.test.ts` | creates `_type:'basketReservation'` docs via writeClient | schema type absent | **DEAD-PATH TEST — FLAG FOR HUMAN** |
| `app/api/shipping/rates/route.ts` | fetches `basketReservation` doc by id; requires `basketReservationId` | UI calls `/api/basket/shipping-rates` instead; no caller found | **ORPHANED ROUTE — FLAG FOR HUMAN** |
| `tests/config.ts:4` | `RESERVATION_EXPIRY_MS` | no consumer reads the field | **DEAD CONFIG — FLAG FOR HUMAN** |
| `sanity-cms/lib/{client,backendClient}.ts` comments | "Used for: basket reservations" | clients live; comments stale | **COMMENT ONLY — FLAG FOR HUMAN** (minor) |

### Priority order (updated)

- **P0 (agent-visible, fix first):** `README.md` ✅ done · `AGENTS.md`/`CLAUDE.md` (verified clean) · `package.json` dead deps+scripts · `lib/dev/redis-test.ts`, `lib/dev/integrity-monitor.ts`, `lib/dev/logger.ts`, `app/api/shipping/rates/route.ts`, `vitest.integration.config.ts`, `tests/checkout/e2e/shipping-visual-tracer.test.ts`, `tests/config.ts`, `playwright.checkout.config.ts` comment, `sanity-cms/lib/*` comments — all FLAG FOR HUMAN (code).
- **P1 (docs describing removed features):** all of `docs/checkout-queue/**` (5 files) · `app/checkout/Checkout plan.md` · `docs/checkout/ADR-002` (annotate/decide) · `docs/hosting/Q & A.md` · `tests/checkout/test-data/integration-test-spec.md` · `docs/checkout/payment/ux-visual-should-be-intelligence.md` · `docs/kanban-cline-cli-guide.md` · `orchestration-diagrams/diagrams.md` (dead link) · `flash-window-problem.md` · `docs/devin-*-tasks.md` (3 finished briefs).
- **P2 (historical/research, low risk):** `research/LOGGING_PATTERNS_2026.md` (false Redis premise) · `research/_ARCHIVED_*` (keep, archived) · `.devin/research/aaa-pattern-research.md` (one stale line) · `_project/devin-cloud-optimization-plan.md`, `_project/reports/*` (historical).

## Result (Phase 4)

**Deleted (`git rm`):**
- `docs/checkout-queue/README.md`, `MAJOR ADR.md`, `PRODUCTION.md`, `TECHNICAL DIAGRAM.md`, `reservation-ttl/README.md` — entire folder documented removed queue/Redis infra
- `app/checkout/Checkout plan.md` — described a reservation-document flow that was never the current implementation
- `tests/checkout/test-data/integration-test-spec.md` — spec for files that don't exist
- `docs/kanban-cline-cli-guide.md` — guide for `.beads`/`bd` tooling absent from the repo

**Corrected (docs only):**
- `README.md:33` — removed "Upstash Redis (inventory reservation)" and "BullMQ (background jobs)" (no such code); also removed "Pino (structured logging)" (dep declared, zero imports — real logger is `lib/dev/event-logger.ts`)
- `docs/hosting/Q & A.md` — removed Upstash-compat line and `UPSTASH_REDIS_REST_*` env entries; also removed `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`/`CLERK_SECRET_KEY` and the "Clerk - No changes needed" line (Clerk not in code — found during the same correction)
- `docs/checkout/ADR-002-checkout-inventory-concurrency.md` — Status changed to Superseded with a note that the Redis soft-reservation half was never implemented
- `docs/checkout/payment/ux-visual-should-be-intelligence.md` — two `PaymentPageClient.tsx` references annotated as deleted component
- `orchestration-diagrams/diagrams.md` — removed dead link to nonexistent `_project/orchestration-plan.md`
- `.devin/research/aaa-pattern-research.md` — stale `tests/checkout-queue/...` path replaced with a note that it was deleted
- `research/LOGGING_PATTERNS_2026.md` — stale-premise banner added at top

**Flagged (not touched — code/config/human call):** see "Needs human decision" table above.

**Dead-link check:** after deletions, `git grep` for `checkout-queue`, `Checkout plan`, `integration-test-spec`, `kanban-cline-cli` across the repo returns only `.devin/research/aaa-pattern-research.md` (now corrected) and this report — no inbound dead links introduced.

**Remaining `upstash|bullmq` hits** (all expected, all in "Needs human decision"): `lib/dev/redis-test.ts`, `package.json` (dep), `docs/auth/data-functionality-should-be-intelligence-update{,-2}.md` (KEEP proposals), `research/LOGGING_PATTERNS_2026.md` (bannered historical).

