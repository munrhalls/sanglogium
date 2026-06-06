# Payment Page — Gap Analysis (Spec vs. Code)

**Date:** 2026-06-06  
**Method:** Line-by-line comparison of provided "Should-Be Spec" against every file in the active production flow.

---

## Executive Summary

**7 gaps found.** 3 are **critical** (security/reliability). 2 are **test coverage** gaps. 2 are **code hygiene** gaps (orphaned routes).

No contradictions found in the spec itself — it is internally coherent.

---

## Gap 1 — CRITICAL: Route handler trusts client's `grandTotal`

**Spec rule:**
> "The client cannot supply or influence the amount charged. `grandTotal` passed from the Server Component to the Client Component is used only for display; the route handler re-derives it from session data before creating the PI."

**What the code does:**
`app/api/checkout/payment-intent-session/route.ts:9` reads `grandTotal` from the request body and passes it directly to `stripe.paymentIntents.create({ amount: grandTotal, ... })` at lines 62 and 66. It never computes the total from `session.basket` + Sanity prices + `session.shippingCost`.

**Impact:** A malicious client can POST any `grandTotal` (e.g., 1 cent) and the route handler will create a PaymentIntent for that amount.

**Gap close:**
The route handler must:
1. Read `session.basket` and `session.shippingCost`
2. Query Sanity for live `price_data.unit_amount` by basket product IDs
3. Compute `subtotal = sum(price * quantity)`
4. Compute `grandTotal = subtotal + session.shippingCost`
5. Validate `grandTotal > 0` and `Number.isInteger(grandTotal)`
6. Use the computed value for PI creation — ignore the client's `grandTotal`

---

## Gap 2 — CRITICAL: Missing Stripe idempotency key

**Spec rule:**
> "Idempotency key on PI creation must be `checkoutSessionId`. Without it, retries (e.g. from network failures) can create duplicate PaymentIntents for the same checkout session."

**What the code does:**
`app/api/checkout/payment-intent-session/route.ts:62` and `:66` call `stripe.paymentIntents.create(...)` with no second options argument. The idempotency key is never passed.

`app/api/checkout/payment-intent/session/route.ts:39` and `:48` have the same gap.

**Impact:** Network retries or user refreshes can spawn multiple PaymentIntents for the same checkout, leaving orphaned PIs in Stripe.

**Gap close:**
Pass `{ idempotencyKey: session.checkoutSessionId || 'fallback-' + Date.now() }` as the second argument to `stripe.paymentIntents.create()`. Also pass it on `.update()` for safety.

---

## Gap 3 — CRITICAL: `grandTotal` validation is too weak

**Spec rule:**
> "Validate `grandTotal` is a positive integer"  
> "Minimum `grandTotal`: 1 PLN cent"

**What the code does:**
`app/api/checkout/payment-intent-session/route.ts:14` only checks `!grandTotal || typeof grandTotal !== 'number'`. A value of `-500`, `12.34`, or `0` would pass this check.

`app/api/checkout/payment-intent/session/route.ts:13` has the same weak validation.

**Impact:** Non-integer or non-positive amounts can reach Stripe, causing API errors or worse.

**Gap close:**
Add explicit validation:
```ts
if (!Number.isInteger(grandTotal) || grandTotal < 1) {
  return NextResponse.json({ error: 'grandTotal must be a positive integer' }, { status: 400 })
}
```

---

## Gap 4 — TEST: Unit test imports from non-existent path

**What the code does:**
`tests/checkout/payment/payment-form.test.tsx:5` imports from `@/app/(store)/checkout/payment/_components/PaymentForm`. That path does not exist.

The actual component is at `app/checkout/payment/PaymentForm.client.tsx` with a completely different API:
- Test expects props: `clientSecret`, `totalAmount`, `currency`
- Actual component: fetches its own `clientSecret`, receives `grandTotal`, `metadata`, `address`, `traceId`

**Impact:** Test is un-runnable. No unit test coverage for the active payment form.

**Gap close:**
Delete or rewrite the test to target `app/checkout/payment/PaymentForm.client.tsx` with its actual props and behavior (mocking fetch, Stripe Elements, and `useStripe`/`useElements`).

---

## Gap 5 — TEST: Integration tests target orphaned route

**What the code does:**
`tests/checkout/integration/payment-intent.test.ts` tests `POST /api/checkout/payment-intent` — the basketReservation-based route. The active production route is `/api/checkout/payment-intent-session`.

**Impact:** The route handler that real users hit has zero automated test coverage.

**Gap close:**
Write integration tests for `/api/checkout/payment-intent-session` covering:
- Happy path: valid session → returns `clientSecret`
- Missing `grandTotal` → 400
- Missing `metadata` → 400
- Update vs. create logic (when `session.paymentIntentId` exists)
- PI metadata enrichment verification

---

## Gap 6 — HYGIENE: Orphaned route handlers exist

**What the code does:**
- `app/api/checkout/payment-intent/route.ts` — fully implemented, never called by UI. Only called by integration tests (Gap 5).
- `app/api/checkout/payment-intent/session/route.ts` — near-duplicate of active route, without logging. Never called.

**Impact:** Dead code increases maintenance surface, confuses developers, and may be accidentally wired up in future changes.

**Gap close:**
Delete both orphaned routes and their integration tests. If the basketReservation-based flow is needed later, it can be retrieved from git history.

---

## Gap 7 — HYGIENE: Unconditional console audit logs

**Spec rule:**
> "Console logs in production must not contain payment data."

**What the code does:**
`app/checkout/payment/page.tsx:138-158` prints a 15-line "LIVE AUDIT CHECK" block on every page load in **all environments** (no `NODE_ENV` guard). `PaymentForm.client.tsx:55-61` does the same on mount.

These logs do not contain sensitive payment data (no `clientSecret`, no PI IDs), but they are noisy in production and do contain basket contents and address city.

**Impact:** Log noise in production; minor privacy concern (basket contents in logs).

**Gap close:**
Wrap the audit log blocks in `if (process.env.NODE_ENV !== 'production')` — or remove them entirely if they were temporary debugging aids.

---

## Spec Coherence Check — PASS

The "Should-Be Spec" is internally consistent:

| Check | Result |
|-------|--------|
| Rule 1 (server-side total) ↔ Rule 7 (PLN currency) | Coherent — both require server computation in PLN cents |
| Rule 2 (self-contained metadata) ↔ `createOrderFromPaymentIntent` | Coherent — metadata carries basket, address, shipping, email |
| Rule 3 (idempotency key) ↔ Rule 5 (update-vs-create) | Coherent — idempotency prevents duplicates when update fails and create fallback runs |
| Rule 4 (clientSecret sensitivity) ↔ integration contracts | Coherent — clientSecret only lives in `<Elements>` context, never logged |
| Rule 6 (last integrity checkpoint) ↔ funnel guards | Coherent — 9 guards listed, all present in code |
| Rule 8 (tax included) ↔ grand total computation | Coherent — no tax added to total, VAT displayed as included |
| Rule 9 (no payment data in logs) ↔ audit logs | Coherent — audit logs don't contain PI data, but are noisy |
| Session fields read ↔ Session fields written | Coherent — `paymentIntentId` is the only write, and it enables update logic |

**No contradictions. No false assumptions. No over-complications detected in the spec.**

---

## Priority Order

1. **Gap 1** — Route handler must re-derive `grandTotal` (security)
2. **Gap 2** — Add idempotency key (reliability)
3. **Gap 3** — Strengthen `grandTotal` validation (defense in depth)
4. **Gap 6** — Delete orphaned routes (reduce maintenance surface)
5. **Gap 4** — Fix unit test (regression prevention)
6. **Gap 5** — Add integration tests for active route (regression prevention)
7. **Gap 7** — Clean up audit logs (production hygiene)
