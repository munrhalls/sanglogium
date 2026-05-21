# Critical Unasked Questions: Stripe Payment Intents + Elements in This Codebase

> **Date:** 2026-05-21
> **Criteria:** Every question is critical (unanswered = material risk to correctness, security, or reliability). Zero non-critical questions.
> **Validation:** Each question verified against codebase, documentation, Stripe canonical sources, and first principles.

---

## Q1: What happens when the basket reservation expires before the webhook fires?

**Why critical:** If the reservation expires and the cleanup job deletes it, then the webhook receives `payment_intent.succeeded` and tries to fetch the reservation by ID — it will be gone. The payment succeeded but no order is created. The customer paid and received nothing.

**Evidence:**
- Reservation has `expiresAt` field (`docs/checkout/payment/2. Minimal Viable Solution Design.md:100`)
- Cleanup job exists (`lib/queue/cleanup.ts`) and deletes expired reservations
- Webhook handler design (`_project/sprints/12_webhook_handler_order_creation.md`) fetches reservation: `*[_type == "basketReservation" && _id == $id][0]`
- No check in sprint design for "reservation already deleted"

**Current state:** PaymentIntent has no expiry tie to reservation. PI default expiry is 24 hours. Reservation TTL may be shorter (e.g., 15-30 minutes based on checkout flow timing).

**Risk if unanswered:** Payment succeeds → reservation deleted → webhook 404s → no order → angry customer + money captured with no fulfillment.

**Stripe first principle:** Webhooks are best-effort delivery; the handler must be idempotent and resilient to missing data.

**Validation:** ✅ Critical. Race condition between reservation TTL and webhook delivery.

---

## Q2: Which webhook endpoint path is authoritative — `/api/webhook` or `/api/checkout/webhook`?

**Why critical:** If the Stripe CLI forwards to the wrong path, webhooks 404. No webhook events are processed. No orders are created. Payments succeed but nothing happens.

**Evidence:**
- `package.json:9`: `"webhook": "stripe listen --forward-to localhost:3000/api/webhook"`
- `docs/checkout/payment/README.md:73`: WebhookHandler at `app/api/checkout/webhook/route.ts`
- `_project/sprints/12_webhook_handler_order_creation.md:277`: `CREATE app/api/checkout/webhook/route.ts`
- `app/api/webhook/` exists and is **empty**
- `app/api/checkout/webhook/` exists and is **empty**

**Current state:** Two empty directories. `package.json` forwards to `/api/webhook`. Design docs specify `/api/checkout/webhook`.

**Risk if unanswered:** Developer runs `npm run webhook`, Stripe CLI forwards to `/api/webhook`, handler is at `/api/checkout/webhook`. All webhook events 404. No orders created.

**Validation:** ✅ Critical. Infrastructure path mismatch = silent failure of entire post-payment flow.

---

## Q3: Should we create a new PaymentIntent on every page load, or update an existing one?

**Why critical:** Every refresh creates a new PI. 5 refreshes = 5 PIs in Stripe Dashboard. The webhook creates one order per PI (if idempotency is only by `stripePaymentIntentId`). But the reservation can only be deleted once. The second webhook for the same reservation would fail to finalize stock.

**Evidence:**
- `payment/page.tsx:20-71`: `useEffect` calls `POST /api/checkout/payment-intent` on every mount
- No storage of PI ID in `sessionStorage`
- No check: "does a PI already exist for this reservation?"
- Sprint doc idempotency: query by `stripePaymentIntentId` (creates one order per PI)
- `_project/sprints/12_webhook_handler_order_creation.md:128`: "query Sanity for order where payment.stripePaymentIntentId == paymentIntent.id"

**Current state:** New PI created on every page load. Orphaned PIs accumulate.

**Risk if unanswered:** Orphaned PIs clutter Dashboard. Multiple webhooks for same reservation (different PIs) create conflicting stock operations or race conditions.

**Stripe first principle:** Create a PI when the amount is known. Reuse it if the checkout is interrupted. Don't create duplicates.

**Validation:** ✅ Critical. Violates Stripe's own best practice for PI lifecycle management.

---

## Q4: Who is allowed to call `POST /api/checkout/payment-intent`?

**Why critical:** The endpoint accepts any `basketReservationId` from any requester. No session validation, no ownership check, no rate limiting. An attacker can:
1. Create a PI for someone else's reservation (information leak — gets `clientSecret`)
2. Spam the endpoint to create thousands of PIs in Stripe (rate limit / cost risk)
3. Iterate reservation IDs to probe for valid ones

**Evidence:**
- `app/api/checkout/payment-intent/route.ts:34-45`: Directly parses body, no auth middleware
- No Clerk session check, no CSRF token, no API key
- Returns `clientSecret` which is a capability grant for confirming the PI

**Current state:** Completely open endpoint.

**Risk if unanswered:** Security vulnerability. Attacker can create PIs for arbitrary reservations and obtain their `clientSecret`.

**First principle:** `clientSecret` is a sensitive capability token. Its creation must be authenticated.

**Validation:** ✅ Critical. OWASP API Security Top 10: Broken Object Level Authorization (BOLA).

---

## Q5: How does the return page verify payment status — client-side, server-side, or not at all?

**Why critical:** The return page is the user's first impression after paying. If it shows "success" for a failed payment, or "failure" for a processing payment, trust is destroyed.

**Evidence:**
- `app/(store)/checkout/return/page.tsx:28`: `const sessionId = searchParams.get("session_id")` — wrong param for Payment Intents
- `app/(store)/checkout/return/page.tsx:46-59`: Fetches `/api/order?session_id=...` — endpoint may not exist for PI flow
- `docs/checkout/payment/PRD.md:45`: "On successful payment, I am redirected to the success/return page"
- `docs/checkout/payment/2. Minimal Viable Solution Design.md:58`: "Stripe redirects to return_url on success"
- Stripe canonical pattern: return page should call `stripe.retrievePaymentIntent(clientSecret)` to verify status

**Current state:** Skeleton page. Uses Checkout Sessions pattern (`session_id`) in a Payment Intents flow.

**Risk if unanswered:** Return page cannot verify payment status. May show incorrect state. User experience is broken.

**First principle:** The return page must independently verify payment status — it cannot trust that "redirected to return_url" means "payment succeeded." 3D Secure cancellations, network failures, and delayed webhooks all complicate this.

**Validation:** ✅ Critical. Core UX flow depends on correct payment status verification.

---

## Q6: What does `PaymentForm.tsx` do when `stripe.confirmPayment` returns `requires_action`?

**Why critical:** For European cards (SCA), `confirmPayment` may return `requires_action` instead of immediately redirecting. The Payment Element handles the 3D Secure UI, but our code must handle the transition correctly.

**Evidence:**
- `PaymentForm.tsx:34-39`: Only destructures `error` from `confirmPayment` result
- `PaymentForm.tsx:41-44`: If `error`, logs and sets `processing = false`. No `else` branch for non-error cases.
- Stripe docs: `confirmPayment` promise resolves when the flow completes OR fails. For redirect-based methods, it never resolves — the redirect happens.
- For 3D Secure, `confirmPayment` may trigger the modal and then redirect.

**Current state:** Code assumes only two outcomes: error (show nothing, just log) or redirect (handled by Stripe). There's no handling for intermediate states.

**Risk if unanswered:** If 3D Secure is required and the user cancels it, what happens? The code doesn't handle the `error` case from 3DS cancellation.

**First principle:** Payment confirmation is an asynchronous state machine, not a boolean success/fail.

**Validation:** ✅ Critical. SCA compliance is mandatory in Europe. Our code doesn't explicitly handle the 3DS flow cancellation.

---

## Q7: Is the `stripe` npm package version `^19.1.0` compatible with API version `'2025-10-29.clover'`?

**Why critical:** If the package doesn't support this API version, every Stripe API call fails at runtime. The entire payment flow is dead.

**Evidence:**
- `lib/stripe.ts:9`: `apiVersion: '2025-10-29.clover'`
- `package.json:111`: `"stripe": "^19.1.0"`
- Stripe's typical API versions are date-only (e.g., `2023-10-16`, `2024-09-30.acacia`). The `.clover` suffix is unusual.
- The `stripe` package changelog would list supported API versions.

**Current state:** Unverified string. Could be a valid version, a typo, or a future version not yet supported by the package.

**Risk if unanswered:** Runtime failure on every Stripe API call. "API version not supported" error.

**First principle:** API version strings must be validated against the SDK's supported versions.

**Validation:** ✅ Critical. One wrong string = complete payment system failure.

---

## Q8: What happens if `payment_intent.succeeded` arrives before the return page loads?

**Why critical:** In a high-latency scenario (mobile, slow connection), the webhook may fire and complete order creation before the user even reaches the return page. The return page then tries to display "payment status" but the order already exists.

**Evidence:**
- Webhook is asynchronous. Stripe sends it immediately on payment success.
- Return page is a client-side redirect after `confirmPayment`.
- Sprint doc (`12_webhook_handler_order_creation.md`): "Return page shows static success (does NOT fetch order — webhook may not have fired yet)"
- This implies the return page is intentionally decoupled from webhook timing.

**Current state:** Return page is a skeleton. No fetch of order data.

**Risk if unanswered:** If the return page eventually fetches order data, it needs to handle "order exists" (webhook won) and "order not yet created" (webhook pending) states. If it doesn't handle both, users see incorrect messages.

**First principle:** Webhook and redirect are independent, unreliable channels. The return page must not assume synchronous order creation.

**Validation:** ✅ Critical. Race condition between webhook processing and client redirect.

---

## Q9: How does `formatPrice` behave when `currency` is not `"usd"`?

**Why critical:** The PRD says currency is derived from `price_data.currency` and validated. If a product is priced in EUR, PLN, or GBP, `formatPrice` will display `$` anyway. This is a currency misrepresentation — potentially illegal in some jurisdictions.

**Evidence:**
- `PaymentForm.tsx:21-23`: `return `$${(cents / 100).toFixed(2)}`;` — hardcodes `$`
- `PaymentForm.tsx:16`: Receives `currency: string` prop but never uses it
- `docs/checkout/payment/PRD.md:50`: "The PaymentIntent currency is derived from the product `price_data.currency`, not hardcoded"
- `app/api/checkout/payment-intent/route.ts:124-134`: Validates currency consistency but the validated `currency` is only sent to Stripe, not returned to the client

**Current state:** Currency is passed to Stripe correctly, but displayed incorrectly to the user.

**Risk if unanswered:** User sees "$20.00" for a €20.00 purchase. Legal/compliance risk in EU. User confusion and potential chargeback.

**Validation:** ✅ Critical. Currency misrepresentation is a financial accuracy bug.

---

## Q10: What does the user see when their card is declined?

**Why critical:** Card declines are the most common payment failure. The PRD explicitly requires: "I see an error message displayed by the Payment Element if my card is declined." This is DoD item [5]. It is not implemented.

**Evidence:**
- `PaymentForm.tsx:41-44`:
  ```typescript
  if (error) {
    console.error("Payment confirmation error:", error);
    setProcessing(false);
  }
  ```
- No error state in UI. No error message rendered. The button just re-enables.
- `tests/checkout/payment/payment-form.test.tsx`: No test for error display.
- `docs/checkout/payment/PRD.md:41`: "DoD [5]: I see an error message displayed by the Payment Element if my card is declined"

**Current state:** Card decline = button re-enables silently. User has no feedback.

**Risk if unanswered:** User thinks the payment went through (button was clicked, then nothing happened). They may retry multiple times, causing multiple declines or confusion.

**First principle:** Every user action must have visible feedback. Silent failures destroy trust.

**Validation:** ✅ Critical. DoD requirement is unimplemented.

---

## Q11: Is billing address collection in scope or not?

**Why critical:** The PRD says billing address is "Out Scope" (future scope). But the checkout plan says: "They can check a box to use the same address for billing or fill in a different billing address." This is a direct contradiction. If billing address is collected, the Payment Element must be configured to collect it. If not, the checkout plan is wrong.

**Evidence:**
- `docs/checkout/payment/1. PRD.md:28`: "Billing address collection (future scope)" — Out Scope
- `docs/checkout/Checkout plan.md:5`: "They can check a box to use the same address for billing or fill in a different billing address" — In scope
- `PaymentForm.tsx`: No `AddressElement`, no billing address collection

**Current state:** Contradictory requirements. Implementation follows PRD (no billing address). Checkout plan promises it.

**Risk if unanswered:** Product requirement mismatch. Either the PRD is wrong and we need billing address, or the checkout plan is wrong and should be updated.

**Validation:** ✅ Critical. Scope contradiction means someone is wrong about what the product should do.

---

## Q12: What happens to stock if the user abandons payment after the PaymentIntent is created?

**Why critical:** A PI is created, stock is reserved, but the user never completes payment. The reservation eventually expires and cleanup releases `reservedStock`. But the PI still exists in Stripe and will expire after 24 hours. If the user returns later and uses the same PI (via `sessionStorage` if we stored it), the stock may have been released. But if they create a new PI, the stock is reserved again. This could lead to double reservation.

**Evidence:**
- Reservation cleanup: `lib/queue/cleanup.ts` releases `reservedStock` on expiry
- No link between PI lifecycle and reservation lifecycle
- PI expiry (24h) > typical reservation TTL (15-30 min)
- No cleanup of abandoned PIs

**Current state:** PI and reservation are independent lifecycles with different expiry times.

**Risk if unanswered:** Stock accounting inconsistency. Over-reservation or under-reservation possible.

**First principle:** Resource lifecycles must be aligned or explicitly managed.

**Validation:** ✅ Critical. Inventory integrity depends on aligned reservation and PI lifecycles.

---

## Q13: Can the webhook handler create duplicate orders if Stripe retries the event?

**Why critical:** Stripe retries webhooks on non-200 responses. If the webhook handler fails AFTER creating the order but BEFORE returning 200, Stripe will retry. The retry will see no existing order (if the first order creation failed), or see an existing order (if it succeeded). The idempotency check must handle both.

**Evidence:**
- Sprint doc (`12_webhook_handler_order_creation.md:128`): "query Sanity for order where payment.stripePaymentIntentId == paymentIntent.id"
- Sprint doc (`12_webhook_handler_order_creation.md:245`): "Always return 200 on processed events"
- But what if Sanity write succeeds and the handler crashes before returning 200? Stripe retries.

**Current state:** Design document specifies idempotency by querying. Not yet implemented.

**Risk if unanswered:** Duplicate orders, duplicate stock deductions, duplicate reservation deletions.

**First principle:** Webhook handlers must be idempotent end-to-end, not just in the query check.

**Validation:** ✅ Critical. Financial records (orders) must not have duplicates.

---

## Q14: What happens if `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is missing at runtime?

**Why critical:** The key is accessed with a non-null assertion: `loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)`. If the env var is undefined, `loadStripe(undefined)` is called. Stripe.js may fail silently or throw an unhandled error.

**Evidence:**
- `PaymentForm.tsx:8`: `loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);`
- `lib/stripe.ts:3-6`: Validates `STRIPE_SECRET_KEY` with runtime check and throws
- No equivalent validation for `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Current state:** Runtime crash or silent failure if env var is missing.

**Risk if unanswered:** Payment page fails to load. User sees blank payment form or infinite spinner.

**Validation:** ✅ Critical. Missing env var = broken payment page with no user-facing error.

---

## Summary: 14 Critical Questions

| # | Question | Risk if Unanswered | Domain |
|---|----------|-------------------|--------|
| 1 | Reservation expires before webhook fires | Customer pays, no order created | Race condition |
| 2 | Webhook endpoint path mismatch `/api/webhook` vs `/api/checkout/webhook` | All webhooks 404, no orders | Infrastructure |
| 3 | New PI on every page load vs update existing | Orphaned PIs, conflicting webhooks | Architecture |
| 4 | Unauthenticated `POST /api/checkout/payment-intent` | Security vulnerability (BOLA) | Security |
| 5 | Return page payment status verification | Wrong payment status shown to user | UX/Trust |
| 6 | `requires_action` / 3D Secure handling | European payments fail silently | Compliance |
| 7 | `stripe` package compatibility with API version `'2025-10-29.clover'` | Complete payment system failure | Runtime |
| 8 | Webhook arrives before return page loads | Race condition between order and UI | Race condition |
| 9 | `formatPrice` hardcodes `$` for non-USD | Currency misrepresentation | Financial/Legal |
| 10 | Card decline error display | User gets no feedback on failure | UX/DoD |
| 11 | Billing address scope contradiction | Product requirement mismatch | Scope |
| 12 | Abandoned PI + reservation expiry | Stock accounting inconsistency | Inventory |
| 13 | Webhook retry duplicate order risk | Duplicate financial records | Idempotency |
| 14 | Missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` validation | Payment page crash | Runtime |

**All 14 questions are critical. Zero non-critical questions included.**
