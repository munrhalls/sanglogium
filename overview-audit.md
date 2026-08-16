# Sang Logium — Quick E-Commerce Product Audit

**Scope:** Overview + critical pathways (catalogue, basket, checkout, payments, order/inventory, auth, security, testing, performance, ops). Based on static code analysis of `main` @ `7be389f1`. Live at `sanglogium.com`. ~506 tracked TS/TSX files, solo-maintained 18+ months.

---

## Overview

**Stack (verified in `package.json`):** Next.js 15 App Router · React 19 · TS · Sanity CMS (source of truth for products/orders) · Stripe Payment Intents + Embedded Elements · better-auth (Turso/libsql) · iron-session (encrypted checkout cookie) · Resend · Zustand/Zod/RHF · Sentry · Pino · Playwright + Vitest.

**Architecture snapshot:** Route groups `(store) / (admin) / (studio) / (test)`; server actions in `app/actions`; route handlers in `app/api`; checkout state in an encrypted 1-hour iron-session cookie; catalogue served via a build-time "VFS" index (`data/catalogue-index.json`) with runtime validation; orders created from Stripe PIs (dual path: synchronous return-handler + async webhook).

**Overall product readiness: ~6/10.** The payment/checkout core is genuinely well-engineered (server-authoritative pricing, idempotency, funnel guards, correlation tracing). The product is held back by an inventory race-risk, security gaps, no CI, weak performance evidence, and a messy repo.

---

## Critical Pathway Findings

### 1. Catalogue & Browsing — **7/10**
**Strengths:** Build-time VFS pattern gives sub-second navigation; runtime validation (`data/catalogue.ts`); type-safe filter contract (`lib/catalogue/filterParams.ts`); canonical URLs + `noindex` for faceted queries; per-product SEO metadata + OG/Twitter; brand pages; related products.
**Weaknesses:** Catalogue tree is build-time — stale until `prebuild` re-runs; category product lists still hit Sanity live per request; no edge-caching of product queries (cache headers exist but Sanity fetch isn't `unstable_cache`-wrapped).

### 2. Basket — **6.5/10**
**Strengths:** Zod-validated persistence with hydration guard and storage-failure fallback (`store/basketStore.ts`); CMS price/stock sync via SWR (`BasketManager.tsx`); quantity capped at `availableStock`; debounced shipping-rate estimation.
**Weaknesses:** Client-only localStorage cart — no cross-device or signed-in server cart; `availableStock = stock − reservedStock` uses a **static CMS field** (not a live reservation), so it can drift; shipping estimate silently swallows errors (`catch` → no fallback rate).

### 3. Checkout Funnel & Session — **7/10**
**Strengths:** Funnel guards at every step with correct redirects and cascade invalidation (address change clears shipping, `app/actions/checkout/index.ts`); quantity sanity (max 10/item); Google Address Validation with strict granularity acceptance; 1h encrypted httpOnly SameSite=Lax session; trace IDs woven through structured event logs.
**Weaknesses (real):**
- **Hardcoded session-secret fallback** — `lib/session.ts:38` uses `"fallback-secret-change-in-production"` if `SESSION_SECRET` is unset. If it ever deploys without the env var, checkout cookies are forgeable.
- 4KB cookie limit is only **warned** (`payment-intent-session` logs at >3KB), not handled; large baskets can silently exceed it.
- Heavy debug `console.log` in the critical path (`app/checkout/payment/page.tsx` has **22**).
- Strict validation (`hasInferredComponents → reject`) can false-reject legitimate addresses; no retry heuristics.


### 4. Payment (Stripe) — **8/10** ⭐ best-rated
**Strengths:** Server **re-derives** `grandTotal` from live Sanity prices and session shipping — client total is only sanity-checked (`payment-intent-session/route.ts`); stable idempotency key = `checkoutSessionId`; PI update-or-create fallback; metadata size guards; server-computed VAT; success page privacy gate with Sanity-order fallback (H-04); terminal-state handling on return.
**Weaknesses:** No rate limiting / anti-abuse on PI creation; no explicit `amount` reconciliation against **PI amount** in the webhook path (order `total` uses `pi.amount` — correct — but metadata basket/address are parsed from untrusted-length-checked strings without a schema).

### 5. Order Creation & Inventory — **5/10** ⚠️ biggest risk
**Strengths:** Idempotent (skips if order exists for PI); collision-free order numbers (`ORD-{year}-{pi suffix}`); dual creation paths with graceful email failure; pre/post stock checks with negative-stock logging.
**Weaknesses (real):**
- **The atomic reservation system was removed** (commit `9b53a08d`, "Remove basket-reservations and checkout-queue API routes"; `lib/queue`, `lib/dev/integrity-monitor.ts` now no-op). README/docs still claim "Upstash Redis (inventory reservation)".
- Stock decrement is **check-then-act, non-atomic** (`createOrderFromPaymentIntent.ts:299-336`): two concurrent orders for the last unit both pass the pre-check → both decrement → **oversell window**. Post-check only logs; it doesn't roll back or block.
- `reservedStock` is display-only; nothing holds inventory during the payment step, so two customers can pay for the same last unit.
- `payment_intent.canceled` is only logged — nothing reconciles released inventory (moot without reservations, but dead logic remains).

### 6. Auth & Account — **7/10**
**Strengths:** better-auth with 2FA (encrypted backup codes), required email verification, 8–128 char passwords, session rotation + cookie cache, guest-order → account merge on email verification (`mergeGuestOrdersByEmail`), order anonymization on account deletion, `revokeSessionsOnPasswordReset`.
**Weaknesses:** Rate limiter is **in-memory** → per-Vercel-instance only (documented, accepted); middleware only checks cookie presence (session validity enforced server-side later); `userProfile` creation is non-atomic (healed via `ensureUserProfile()` — acknowledged in code comments).

### 7. Security Posture — **5.5/10**
**Strengths:** Security headers (nosniff, frame-deny, referrer-policy), `poweredByHeader: false`, no-store on checkout/order/webhook APIs, DOM purifier in email paths, Sentry, encrypted cookies.
**Weaknesses (real):**
- **No CSP header** anywhere (`next.config.ts`) — notable for a Stripe payment page.
- **`/api/revalidate` is unauthenticated** — anyone can POST and purge the catalogue cache (DoS vector). No Sanity webhook signature check.
- Hardcoded session-secret fallback (see #3).
- No rate limiting on checkout actions / PI creation / newsletter (zod-validated but floodable).
- No HSTS in app config (depends on Vercel platform default).

### 8. Testing & CI — **4.5/10**
**Strengths:** Decent spread — basket unit/integration/component tests, catalogue filter/pagination/seo units, checkout payment-intent-session integration, address-flow e2e, homepage a11y (axe) + RWD + sections, performance specs.
**Weaknesses (real):**
- **No CI: `.github/workflows` is empty** — nothing runs lint/typecheck/tests on push or PR.
- Last recorded Playwright run state is **"failed"** (`test-results/.last-run.json`).
- **The most critical code has zero tests**: `createOrderFromPaymentIntent` (order creation, stock decrement, idempotency) and the Stripe webhook route have no unit/integration coverage.
- `tests/checkout/guest-checkout-inventory-reservation/` referenced in `package.json` scripts **no longer exists** (removed with the reservation system) — broken scripts.
- Coverage not enforced anywhere.

### 9. Performance & CWV — **5/10**
**Strengths:** Custom Sanity image loader with AVIF/WebP, sized device/image sets, 1-yr image cache; `optimizeCss`/`inlineCss`; bundle analyzer; preconnect to `cdn.sanity.io`; homepage ISR (`revalidate=3600`); Speed Insights + RUM.
**Weaknesses:** Last captured Lighthouse evidence (`.lighthouseci/assertion-results.json`) shows **performance 0.35, LCP ≈ 12s, a11y 0.88** — failing configured thresholds. Date unknown (could be dev-mode), but the configured gates are failing and should be re-verified in production.

### 10. Observability — **6/10**
**Strengths:** Sentry (traces 0.1), Pino, checkout event logger with correlation IDs, web-vitals RUM endpoint, Speed Insights.
**Weaknesses:** Checkout logging is console-based (`lib/dev/event-logger.ts`) — whether it lands in a real aggregator is unclear; dead routes (`app/api/cleanup/expired-reservations/`, `app/api/dev/`, `app/api/update-test-prices/`) still exist as empty dirs.

### 11. Codebase Health & Process — **5/10**
**Strengths:** Clean folder layering, conventional commits with difficulty tags, strict `tsc`, eslint/prettier, type-heavy design, good defensive coding culture (zod everywhere, idempotency patterns, guard rails).
**Weaknesses:** **76 untracked temp files** at repo root (`.tmp_wss_headphones.html` ~1MB, `fixing-botched-product-images/`, output dumps, `package.json.cache-poisoned`); stale docs (README claims BullMQ — **not in `package.json`**; reservation docs describe removed system); debug `console.log` in production paths; `.env.example` not tracked (gitignored).

---

## Scorecard (1–10)

| # | Area | Score | One-line verdict |
|---|------|:-----:|------------------|
| 1 | **Payment & money correctness** (Stripe) | **8** | Server-authoritative pricing, idempotency, VAT, dual-path order creation — solid. |
| 2 | **Checkout funnel & session integrity** | **7** | Guards, cascade invalidation, encrypted session — undone by fallback secret + cookie limits. |
| 3 | **Auth & account** | **7** | 2FA, verification, guest-order merge, GDPR-aware deletion. |
| 4 | **Catalogue & browsing UX** | **7** | Fast VFS navigation, strong SEO plumbing. |
| 5 | **Basket** | **6.5** | Defensive and tested client-side, but no server cart / cross-device. |
| 6 | **Observability** | **6** | Good correlation tracing; console-bound logs, dead routes. |
| 7 | **Codebase health & maintainability** | **5** | Clean core, messy root, stale docs. |
| 8 | **Security posture** | **5.5** | No CSP, open revalidate, fallback secret, thin rate limiting. |
| 9 | **Order fulfillment & inventory integrity** | **5** | **Oversell race window; reservation system removed.** |
| 10 | **Performance / Core Web Vitals** | **5** | Good image pipeline; Lighthouse evidence failing badly. |
| 11 | **Testing & CI** | **4.5** | Good spread but **no CI**, last run failed, critical paths untested. |

---

## Top Priorities (in order)

1. **Restore atomic inventory control** — either re-add a lightweight reservation (Redis + TTL, as the docs already describe) or make stock decrement transactional at the Sanity level. The current check-then-act race can oversell the last unit of a product.
2. **Close the security gaps** — add CSP; protect `/api/revalidate` (secret + signature verification); fail fast if `SESSION_SECRET` is unset (remove the fallback); rate-limit PI creation and checkout actions.
3. **Add CI + tests for the money path** — GitHub Action running `ts-check`, `lint`, `vitest`, `playwright`; unit tests for `createOrderFromPaymentIntent` idempotency/stock logic and the webhook handler.
4. **Re-verify performance in production** — re-run Lighthouse; if LCP is genuinely ~12s, address it (Sanity query batching, streaming, layout/CSS).
5. **Repo hygiene** — delete/commit 76 untracked temp artifacts, align README/docs with reality (BullMQ, reservation system), remove dead routes and debug logs.

---

**Limitations of this audit:** static analysis only — no live production/staging testing, no test execution (per project rules against heavy commands), and no access to Stripe/Sanity dashboards or production logs. The Lighthouse figures are from an undated local run and should be re-verified.

