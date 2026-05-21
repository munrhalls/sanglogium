# Canonical Research: Stripe Payment Intents + Payment Elements in This Codebase

> **Date:** 2026-05-21
> **Scope:** Singular objective truth of what the Stripe Payment Intents + Payment Elements integration SHOULD BE in the Sang-Logium checkout system (Next.js 18, React 18, Sanity CMS, basket reservation flow)
> **Method:** Consolidation of all research rounds, validated against canonical Stripe sources, existing project documentation, and first principles
> **Status:** Complete — all claims verified or explicitly marked unverified

---

## Executive Summary

The architecture is **correctly designed** in project documentation (`docs/checkout/payment/`). The implementation is **incomplete** (PRD DoD items unchecked) with **one P0 production bug** (`{CHECKOUT_SESSION_ID}` in `return_url`). The webhook handler is **designed but not yet implemented** (planned in Sprint 12). Fourteen **critical questions remain unanswered**, primarily around race conditions, security, and lifecycle alignment.

**One-line fix needed now:** Remove `{CHECKOUT_SESSION_ID}` from `PaymentForm.tsx:37`.

---

## Section 1: Research Scope Contract (Verified)

- **Topic:** How Stripe Payment Intents + Payment Elements should be implemented in the Sang-Logium basket-reservation-based checkout flow
- **First Principles:**
  1. Payment amount is computed server-side from Sanity CMS `price_data` — the client never dictates the amount
  2. The `clientSecret` is a capability grant; its creation must be authenticated
  3. Webhooks are the only reliable fulfillment trigger; the return page must not assume synchronous order creation
- **Fundamentals:**
  - `stripe.paymentIntents.create()` with server-side computed `amount` and `currency`
  - `@stripe/react-stripe-js` `Elements` provider initialized with `clientSecret`
  - `stripe.confirmPayment()` with a raw `return_url` (no template variables)
  - `stripe.webhooks.constructEvent()` for signature verification
- **Scope Boundary (In):** PaymentIntent creation, Payment Element rendering, payment confirmation, return page status verification, webhook handler for order creation
- **Scope Boundary (Out):** Billing address collection (PRD says out of scope, checkout plan contradicts — see Q11), saved payment methods, refunds, subscriptions
- **Target Audience:** Engineers implementing the payment slice, reviewers of PRD DoD items
- **Decay Risk:** Medium — Stripe SDK versions and API versions evolve; review by 2026-11-21

---

## Section 2: What EXISTS and is CORRECT

### 2.1 Architecture Documentation

| Document | Status | Key Correct Decisions |
|----------|--------|---------------------|
| `docs/checkout/payment/README.md` | ✅ Correct | Server-side amount computation, `automatic_payment_methods`, `metadata: { basketReservationId }`, webhook at `/api/checkout/webhook` |
| `docs/checkout/payment/1. PRD.md` | ✅ Correct (with contradiction) | 16-item DoD, scope boundaries, currency derived from `price_data` |
| `docs/checkout/payment/2. Minimal Viable Solution Design.md` | ✅ Correct | Data flow, types, endpoint contracts, stock finalization logic |
| `docs/checkout/Checkout plan.md` | ⚠️ Contradiction (see Q11) | Overall flow correct, but billing address claim contradicts PRD |
| `_project/sprints/12_webhook_handler_order_creation.md` | ✅ Correct (designed, not implemented) | Event-state flow, idempotency strategy, stock finalization transaction |

### 2.2 Implemented Code That Is Correct

```typescript
@/c:/webdev/sang-logium/app/api/checkout/payment-intent/route.ts:34-142
// Server-side amount computation from Sanity CMS price_data
// Currency consistency validation
// metadata: { basketReservationId } on PaymentIntent
```

**Verified correct:**
- `amount` is computed server-side from `product.price_data.unit_amount × quantity + shippingChoice.amount`
- `currency` is derived from `price_data.currency`, not hardcoded
- Currency consistency is validated across all items and shipping choice
- `metadata.basketReservationId` is stored on the PaymentIntent
- `automatic_payment_methods: { enabled: true }` is used

```typescript
@/c:/webdev/sang-logium/lib/stripe.ts:1-12
// Stripe client initialized with secret key and API version
```

**Note:** `apiVersion: '2025-10-29.clover'` is the configured string. Compatibility with `stripe` package `^19.1.0` is **unverified** (see Q7).

### 2.3 Test Coverage That Exists

| Test | Coverage | Status |
|------|----------|--------|
| `tests/checkout/payment/payment-form.test.tsx` | Renders PaymentElement, null on no clientSecret | ✅ Passes |
| `tests/checkout/integration/payment-intent.test.ts` | PI creation happy path, validation errors | ✅ Passes |

**Missing tests:** Error display, 3D Secure, return page, webhook handler, idempotency.

---

## Section 3: What EXISTS but is BROKEN

### 3.1 P0 — Production Breaking

**`{CHECKOUT_SESSION_ID}` in `return_url`**

```typescript
@/c:/webdev/sang-logium/app/(store)/checkout/payment/_components/PaymentForm.tsx:37
return_url: `${window.location.origin}/checkout/return?payment_intent={CHECKOUT_SESSION_ID}`,
```

**Why it breaks:** `{CHECKOUT_SESSION_ID}` is a **Checkout Sessions** template variable. For Payment Intents, Stripe appends its own `payment_intent` and `payment_intent_client_secret` query parameters to the raw URL provided. The result: the return page receives `payment_intent={CHECKOUT_SESSION_ID}` (literal string) instead of the actual PaymentIntent ID.

**Verified by:**
- Stripe docs (`docs.stripe.com/payments/existing-customers?platform=web&ui=elements`): "When Stripe redirects the customer to the return_url, we provide the following URL query parameters: `payment_intent` ... `payment_intent_client_secret`"
- Stripe docs (`docs.stripe.com/payments/existing-customers?platform=web&ui=embedded-form`): `{CHECKOUT_SESSION_ID}` documented only for Checkout Sessions
- `stripe-samples/accept-a-payment/payment-element/client/react-cra/src/CheckoutForm.jsx`: `return_url: \`${window.location.origin}/completion\`` — no template variables, no query params

**Correct form:**
```typescript
return_url: `${window.location.origin}/checkout/return`
```

Stripe will append `?payment_intent=pi_xxx&payment_intent_client_secret=pi_xxx_secret_xxx` automatically.

### 3.2 P1 — High

| Issue | Location | Why It Matters | Correct Behavior |
|-------|----------|----------------|------------------|
| Return page uses `session_id` | `return/page.tsx:28` | Payment Intents append `payment_intent`, not `session_id` | `searchParams.get("payment_intent_client_secret")` then `stripe.retrievePaymentIntent(clientSecret)` |
| No idempotency key on PI creation | `route.ts:137` | Duplicate PIs on retry/reload | Pass `idempotencyKey: reservation._id` as second argument to `stripe.paymentIntents.create()` |
| No card decline error display | `PaymentForm.tsx:41-44` | PRD DoD [5] requires visible error message on decline | Render `error.message` in UI below the PaymentElement |

**Note:** The return page is a skeleton with `// TODO` comments. These are **incomplete implementation**, not surprise bugs.

---

## Section 4: What DOES NOT EXIST YET (Planned Work)

| Item | Design Status | Implementation Status | Reference |
|------|---------------|----------------------|-----------|
| Webhook handler (`app/api/checkout/webhook/route.ts`) | ✅ Designed in sprint 12 | ❌ Not implemented | `_project/sprints/12_webhook_handler_order_creation.md` |
| Return page `stripe.retrievePaymentIntent` verification | ⚠️ PRD DoD [8] | ❌ Skeleton only | `app/(store)/checkout/return/page.tsx` |
| `elements.submit()` pre-validation | Enhancement | ❌ Not implemented | `@stripe/react-stripe-js` README recommends it |
| Error type taxonomy in UI | PRD DoD [5] | ❌ Only `console.error` | `PaymentForm.tsx:41-44` |

---

## Section 5: The 14 Critical Unanswered Questions

Each question is critical because answering it would materially change implementation, reveal a genuine risk, or prevent a silent failure.

| # | Question | Domain | Material Risk if Unanswered |
|---|----------|--------|----------------------------|
| 1 | Reservation expires before webhook fires? | Race condition | Customer pays, no order created |
| 2 | Webhook path: `/api/webhook` or `/api/checkout/webhook`? | Infrastructure | All webhooks 404, no orders |
| 3 | New PI on every page load or update existing? | Architecture | Orphaned PIs, conflicting webhooks |
| 4 | Who is allowed to call `POST /api/checkout/payment-intent`? | Security | Unauthenticated PI creation (BOLA vulnerability) |
| 5 | How does return page verify payment status? | UX/Trust | Wrong status shown to user |
| 6 | What does `confirmPayment` do on `requires_action`? | Compliance | European 3D Secure payments fail silently |
| 7 | Is `stripe` package `^19.1.0` compatible with API version `'2025-10-29.clover'`? | Runtime | Complete payment system failure |
| 8 | Webhook arrives before return page loads? | Race condition | UI shows wrong state |
| 9 | `formatPrice` hardcodes `$` for non-USD? | Financial/Legal | Currency misrepresentation |
| 10 | What does user see on card decline? | UX/DoD | No feedback — user confusion |
| 11 | Billing address: PRD says "out of scope", checkout plan says "in scope" | Scope | Product requirement contradiction |
| 12 | Abandoned PI + reservation expiry? | Inventory | Stock accounting inconsistency |
| 13 | Webhook retry = duplicate order? | Idempotency | Duplicate financial records |
| 14 | Missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` validation? | Runtime | Payment page crash |

**Full analysis of each question:** See `_project/research/stripe-payment-intents-elements-CRITICAL-QUESTIONS_2026-05-21.md`

---

## Section 6: First Principles Analysis

### Core Problem Being Solved

Accept payment for a reserved basket of items where: (a) the amount is computed from Sanity CMS prices, (b) the stock is reserved temporarily, and (c) the order must be created atomically upon payment success.

### Underlying Constraints

1. **HTTP is stateless** — The reservation ID must survive page transitions (`sessionStorage` is the chosen mechanism)
2. **Payment confirmation is asynchronous** — `confirmPayment` may redirect, trigger 3D Secure, or fail immediately. The return page and webhook are independent channels.
3. **Webhook delivery is best-effort** — Stripe retries on non-200. The handler must be idempotent and return 200 even if the reservation is gone.
4. **Stock is a finite resource** — `reservedStock` must be converted to `stock` deduction exactly once, or the inventory is corrupt.

### Inherent Tradeoffs

| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Create PI on every payment page load | Simple, no PI state management | Orphaned PIs, multiple webhooks possible | Prototype only |
| Store PI ID in `sessionStorage` and update | Fewer orphaned PIs, aligns with reservation | More complex state management | Production (recommended) |
| Return page fetches order from Sanity | Shows real order data | Fails if webhook hasn't fired yet | Only if webhook delay is acceptable |
| Return page uses `retrievePaymentIntent` only | Always accurate payment status | No order details until webhook fires | Recommended for this flow |
| Webhook creates order synchronously | Order exists immediately on redirect | Handler must be fast (Stripe timeout) | Required for reliability |

### Failure Modes

1. **Misapplication:** Using Checkout Sessions patterns (`{CHECKOUT_SESSION_ID}`, `session_id`) in a Payment Intents flow
2. **Over-application:** Creating a new PI on every interaction instead of reusing
3. **Under-application:** Not validating the publishable key at runtime, causing silent failures

---

## Section 7: What the Implementation Should Be (Canonical)

### 7.1 `app/(store)/checkout/payment/_components/PaymentForm.tsx`

**Changes required:**

1. **Fix `return_url`** — Remove `{CHECKOUT_SESSION_ID}` template variable:
   ```typescript
   return_url: `${window.location.origin}/checkout/return`
   ```

2. **Add `elements.submit()` pre-validation** (optional but recommended):
   ```typescript
   const { error: submitError } = await elements.submit();
   if (submitError) {
     setErrorMessage(submitError.message);
     setProcessing(false);
     return;
   }
   ```

3. **Add error display to UI** (required by PRD DoD [5]):
   ```typescript
   if (error) {
     setErrorMessage(error.message);
     setProcessing(false);
   }
   ```

4. **Fix `formatPrice`** to use `currency` prop (required by PRD DoD [10]):
   ```typescript
   const formatPrice = (cents: number, currency: string) => {
     return new Intl.NumberFormat('en-US', {
       style: 'currency',
       currency: currency.toUpperCase(),
     }).format(cents / 100);
   };
   ```

### 7.2 `app/(store)/checkout/return/page.tsx`

**What it should do (canonical Stripe pattern, verified from `stripe-samples/accept-a-payment/payment-element/client/react-cra/src/Completion.jsx`):**

1. Extract `payment_intent_client_secret` from URL query params
2. Call `stripe.retrievePaymentIntent(clientSecret)`
3. Inspect `paymentIntent.status`:
   - `succeeded` → Show success message
   - `processing` → Show "Payment is processing" (for bank transfers)
   - `requires_payment_method` → Show "Payment failed, return to checkout"
   - `canceled` → Show "Payment canceled"
4. Do NOT fetch order data from Sanity — the webhook may not have fired yet
5. If order data is needed, poll or show "We'll email you when your order is ready"

### 7.3 `app/api/checkout/payment-intent/route.ts`

**Changes required:**

1. **Add idempotency key** (required by Stripe best practices):
   ```typescript
   const paymentIntent = await stripe.paymentIntents.create(
     { amount, currency, automatic_payment_methods: { enabled: true }, metadata: { basketReservationId } },
     { idempotencyKey: basketReservationId }
   );
   ```

2. **Add reservation expiry check** — Before creating PI, verify `reservation.expiresAt > now()`:
   ```typescript
   if (new Date(reservation.expiresAt) < new Date()) {
     return NextResponse.json({ error: 'Reservation expired', errorClass: 'VALIDATION' }, { status: 410 });
   }
   ```

3. **Add authentication** — Verify the requester owns the reservation (Clerk session or similar).

4. **Return `paymentIntentId`** to the client (for potential PI reuse on refresh):
   ```typescript
   return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
   ```

### 7.4 `app/api/checkout/webhook/route.ts`

**What it should do (based on sprint 12 design and Stripe canonical patterns):**

1. Read raw body: `const rawBody = await request.text()`
2. Get signature: `request.headers.get('stripe-signature')`
3. Verify: `stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)` → 400 if invalid
4. Filter: `if (event.type !== 'payment_intent.succeeded') return new Response(null, { status: 200 })`
5. Extract: `const paymentIntent = event.data.object`
6. Idempotency check: Query Sanity for order where `payment.stripePaymentIntentId == paymentIntent.id` → if found, return 200
7. Extract `basketReservationId` from `paymentIntent.metadata`
8. Fetch reservation from Sanity
9. If reservation not found: log error, return 200 (Stripe will not retry a 200; the payment succeeded but we cannot fulfill — manual intervention needed)
10. Create order document in Sanity
11. Finalize stock: Sanity transaction — `stock -= reservedStock`, `reservedStock = 0`
12. Delete reservation
13. Return 200

**Note:** Step 8 (reservation not found) is the answer to Q1. If the reservation expired and was cleaned up before the webhook fires, we log the error and return 200. The payment is captured but the order cannot be auto-fulfilled. This requires manual reconciliation.

### 7.5 `package.json` webhook script

**Fix path mismatch:**
```json
"webhook": "stripe listen --forward-to localhost:3000/api/checkout/webhook"
```

Or move the handler to `app/api/webhook/route.ts` to match the existing script.

---

## Section 8: Scope Contradiction (Billing Address)

| Document | Claim | Status |
|----------|-------|--------|
| `docs/checkout/payment/1. PRD.md:28` | "Billing address collection (future scope)" — Out of Scope | PRD authority for payment slice |
| `docs/checkout/Checkout plan.md:5` | "They can check a box to use the same address for billing or fill in a different billing address" — In Scope | Checkout plan authority for overall flow |

**Resolution:** The PRD is the authoritative document for the payment slice. The checkout plan contains an aspirational description that was not refined into the payment slice scope. **Billing address collection is OUT of scope for the payment slice** until the PRD is amended.

**If billing address IS required later:** Use Stripe's `AddressElement` with `options={{ mode: 'billing' }}` inside the `Elements` provider.

---

## Section 9: Validation & Falsification Log

### Claims Verified

| Claim | Evidence | Method |
|-------|----------|--------|
| `{CHECKOUT_SESSION_ID}` is a Checkout Sessions-only variable | `docs.stripe.com/payments/existing-customers?platform=web&ui=embedded-form` | Official docs |
| Payment Intents append `payment_intent` and `payment_intent_client_secret` to `return_url` | `docs.stripe.com/payments/existing-customers?platform=web&ui=elements` | Official docs |
| `stripe-samples` uses plain `return_url` without template variables | `stripe-samples/accept-a-payment/payment-element/client/react-cra/src/CheckoutForm.jsx` | Source code |
| `stripe-samples` return page uses `retrievePaymentIntent` | `stripe-samples/accept-a-payment/payment-element/client/react-cra/src/Completion.jsx` | Source code |
| Webhook handler should verify signature with `constructEvent` | `stripe-samples/accept-a-payment/payment-element/server/node/server.js` | Source code |
| Idempotency keys prevent duplicate PIs | `docs.stripe.com/payments/payment-intents` (Best Practices) | Official docs |
| `elements.submit()` is recommended for pre-validation | `@stripe/react-stripe-js` README minimal example | Source code |
| `formatPrice` hardcodes `$` | `app/(store)/checkout/payment/_components/PaymentForm.tsx:21-23` | Direct file read |
| Webhook endpoint path mismatch | `package.json:9` vs `docs/checkout/payment/README.md:73` | Direct file read |
| Return page is a skeleton with TODOs | `app/(store)/checkout/return/page.tsx` (comments throughout) | Direct file read |

### Falsification Attempts

| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "All 6 findings are critical bugs" | Return page has TODOs, webhook has sprint doc | **Modified** — some are known incomplete, not bugs |
| "`elements.submit()` is in `stripe-samples` CheckoutForm" | File read shows it's NOT there | **Abandoned** — source is `@stripe/react-stripe-js` README |
| "Research should contain full implementation code" | Research = analysis, not implementation | **Abandoned** — appendix code should not exist in research |

### Knowledge Decay Assessment

| Section | Risk | Review Date |
|---------|------|-------------|
| Stripe SDK versions (`^19.1.0`, `^5.3.0`, `^8.11.0`) | Medium | 2026-11-21 |
| API version string (`2025-10-29.clover`) | High | Immediate — verify compatibility |
| `automatic_payment_methods` behavior | Low | Stable API |
| Webhook event types (`payment_intent.succeeded`) | Low | Stable API |

---

## Section 10: Synthesis — Actionable Takeaways

### Immediate Actions (Do Now)

| Action | File | Rationale | Effort |
|--------|------|-----------|--------|
| Fix `return_url` | `PaymentForm.tsx:37` | P0 bug — breaks return page redirect | 1 line |
| Fix webhook path | `package.json:9` or move handler | Infrastructure mismatch — all webhooks 404 | 1 line or 1 file move |
| Add `idempotencyKey` | `route.ts:137` | Prevents duplicate PIs on retry | 1 line |
| Add error display | `PaymentForm.tsx` | PRD DoD [5] — user needs feedback on decline | ~5 lines |
| Fix `formatPrice` | `PaymentForm.tsx:21-23` | PRD DoD [10] — currency must be accurate | ~3 lines |
| Validate `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `PaymentForm.tsx:8` | Runtime crash prevention | ~3 lines |

### Next Sprint (Planned Work)

| Action | File | Rationale | Reference |
|--------|------|-----------|-----------|
| Implement webhook handler | `app/api/checkout/webhook/route.ts` | Order creation, stock finalization | Sprint 12 design doc |
| Implement return page | `app/(store)/checkout/return/page.tsx` | Payment status verification | PRD DoD [8] |
| Add reservation expiry check | `route.ts` | Prevents creating PI for expired reservation | Q1, Q12 |
| Add auth to PI creation endpoint | `route.ts` | Prevents unauthorized PI creation | Q4 |
| Add `paymentIntentId` to response | `route.ts` | Enables PI reuse on refresh | Q3 |

### Decisions Required (Not Yet Made)

| Decision | Options | Rationale |
|----------|---------|-----------|
| Billing address | Out of scope (PRD) vs In scope (checkout plan) | Reconcile PRD and checkout plan |
| PI lifecycle | Create new on every load vs Store PI ID in `sessionStorage` | Stripe best practice says reuse |
| Return page UX | Show payment status only vs Poll for order | Webhook timing is unpredictable |
| Stock reconciliation | Auto vs Manual when reservation is gone before webhook | Q1 requires a policy |

---

## Section 11: Honest Assessment of Research Quality

### What This Research Got Right

1. Every claim verified against canonical sources (Stripe docs, source code, our codebase)
2. The single P0 bug (`{CHECKOUT_SESSION_ID}`) was correctly identified
3. The validation round caught a source misattribution (`elements.submit()`)
4. The gap analysis found 16 additional topics
5. No hallucinated APIs or functions

### What This Research Got Wrong

1. **Premature "bug" labeling** — Did not check for TODOs or existing sprint docs before calling incomplete features "bugs"
2. **Scope creep** — Included 150+ lines of implementation code in a research document
3. **Failed to check project context first** — Did not read `_project/sprints/`, `docs/checkout/`, or `.beads/` before producing findings
4. **No severity assessment** — Treated all findings as "critical"
5. **Answered generic Stripe questions** — Not context-specific questions about our checkout flow

### The Single Worst Mistake

Research that doesn't read existing project state first is not research — it's documentation of the author's assumptions. The webhook architecture was already designed in Sprint 12. The return page was already known to be a skeleton. These were not "discoveries."

---

## Appendix: File References

| File | Role | Status |
|------|------|--------|
| `app/(store)/checkout/payment/_components/PaymentForm.tsx` | Payment form | ⚠️ P0 bug, missing error display |
| `app/(store)/checkout/payment/page.tsx` | Payment page parent | ✅ Works, but creates new PI on every load |
| `app/(store)/checkout/return/page.tsx` | Return page | ⚠️ Skeleton, known incomplete |
| `app/api/checkout/payment-intent/route.ts` | PI creation API | ✅ Mostly correct, needs idempotency + auth |
| `app/api/checkout/webhook/route.ts` | Webhook handler | ❌ Planned, not implemented |
| `app/api/webhook/` | Empty directory | ⚠️ Path mismatch with `package.json` |
| `lib/stripe.ts` | Stripe client | ✅ Correct initialization |
| `docs/checkout/payment/1. PRD.md` | PRD | ✅ Correct, with billing address contradiction |
| `docs/checkout/payment/2. Minimal Viable Solution Design.md` | Technical design | ✅ Correct |
| `docs/checkout/payment/README.md` | Architecture overview | ✅ Correct |
| `docs/checkout/Checkout plan.md` | Overall flow | ⚠️ Contradicts PRD on billing address |
| `_project/sprints/12_webhook_handler_order_creation.md` | Sprint design | ✅ Correct (designed, not implemented) |
| `tests/checkout/payment/payment-form.test.tsx` | Unit tests | ✅ Passes, limited coverage |
| `tests/checkout/integration/payment-intent.test.ts` | Integration tests | ✅ Passes, happy path only |
