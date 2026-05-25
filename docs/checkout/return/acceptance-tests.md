# Acceptance Tests - Return Flow

**Happy path tracer only. Manual verification on dev server.**

*Important*: session refers to iron-session, the checkout session.

*Return-flow naming — used consistently below*:
- `/api/checkout/return` = Route Handler (`app/api/checkout/return/route.ts`). Stripe's `return_url` target. Verifies PI server-side, manages session lifecycle, redirects to `/checkout/success`.
- `/checkout/success` = Server Component (`app/checkout/success/page.tsx`). Privacy-guarded display surface.
- The path `/checkout/return` does **not** exist; never use it.

*PII in dev logs*: tests below assert that the server logs `payment_intent` and address fields. These assertions are **dev-only**. Before shipping, gate verbose logs behind `process.env.NODE_ENV !== 'production'`. PaymentIntent IDs and address fields are PII.

*Session injection for manual tests*: the same dev-only seed route used by the payment scope (`app/(test)/checkout-seed/route.ts?scenario=<name>&secret=<CHECKOUT_SEED_SECRET>`, two-gate-protected) is reused here for tests that need a specific session state — specifically Test 5 (success page direct-navigation privacy guard) and Test 7 (webhook-lag scenario without disabling the real webhook).

*Order persistence is webhook-driven*: the success page only reads orders. Test 6 is the cross-scope reachability check paired with payment Test 14. If the webhook is missing or broken, Test 6 fails and orders are never written.

---

## Test 0: Stripe Dashboard preconditions (run ONCE before any other test)
- Same as payment Test 0 (Card + Blik enabled for PLN; webhook endpoint registered with `payment_intent.succeeded`; `STRIPE_WEBHOOK_SECRET` in `.env.local`). Both scopes share the same Dashboard preconditions.

---

## Route Handler tests (`/api/checkout/return`)

### Test 1: Missing `payment_intent` query param
- Navigate directly to `/api/checkout/return` (no query string).
- [ ] Redirects to `/basket?error=missing_intent`.
- [ ] Session is unchanged (still contains whatever was there).

### Test 2: Stripe redirect lands on the Route Handler
- Complete a payment via Stripe test card.
- [ ] Browser URL during the redirect window is `/api/checkout/return?payment_intent=pi_xxx&payment_intent_client_secret=pi_xxx_secret_xxx&redirect_status=succeeded`.
- [ ] Server logs show `payment_intent` extracted from `searchParams`.
- [ ] Server logs confirm that `payment_intent_client_secret` and `redirect_status` are NOT used for any decision (they are read but ignored).

### Test 3: Server-side PI verification with try/catch
- On Route Handler with a valid `payment_intent`:
  - [ ] Server logs show `stripe.paymentIntents.retrieve()` called.
  - [ ] Server logs show retrieved `status` and `amount`.
- Stripe API down simulation (e.g. set `STRIPE_SECRET_KEY` to an invalid value temporarily):
  - [ ] Route Handler does NOT return a raw 500 page.
  - [ ] Redirects to `/checkout/success?payment_intent=<id>&error=verification_failed`.
  - [ ] User sees a recoverable error state, not a Next.js generic error page.
  - [ ] **Restore the env var after this test.**

### Test 4: Status-driven session lifecycle (canonical contract)
Run each row by completing the matching payment scenario:

| Scenario | Stripe test setup | Expected session AFTER Route Handler runs | Expected redirect |
|---|---|---|---|
| 4.a `succeeded` | Valid card `4242 4242 4242 4242` | `completedPaymentIntentId` set; `basket`, `address`, `shippingCode`, `shippingCost`, `paymentIntentId` all cleared | `/checkout/success?payment_intent=...` |
| 4.b `requires_payment_method` (failed) | Decline card `4000 0000 0000 0002` | ONLY `paymentIntentId` cleared. `basket`, `address`, `shippingCode`, `shippingCost` PRESERVED | `/checkout/success?payment_intent=...&status=failed` |
| 4.c `canceled` | Cancel during Stripe redirect flow | ONLY `paymentIntentId` cleared. Upstream fields PRESERVED | `/checkout/success?payment_intent=...&status=canceled` |
| 4.d `processing` | Async-confirmation card `4000 0000 0000 0077` (or use seed route) | `completedPaymentIntentId` set. Upstream fields PRESERVED | `/checkout/success?payment_intent=...&status=processing` |

For each row:
- [ ] Browser cookie inspector confirms the expected session state above.
- [ ] Browser URL after redirect matches the expected target.
- [ ] On 4.b and 4.c specifically: navigating to `/checkout/payment` after lands on the payment page (basket + address + shipping intact — the user can retry payment in one click). This is the load-bearing UX justification for not clearing on non-success.

### Test 4.5: `session.destroy()` is NOT used
- Read `app/api/checkout/return/route.ts`.
- [ ] No call to `session.destroy()` anywhere. The Route Handler uses partial-clear (`session.x = undefined; await session.save()`). Partial-clear preserves the cookie shell so the next request still has a writable session; `destroy()` would delete the cookie entirely and is unnecessary.

---

## Success page tests (`/checkout/success`)

### Test 5: Privacy guard — direct navigation is rejected
- **Setup**: clear all cookies. Hit `/checkout/success?payment_intent=pi_FAKE_ID_NOT_IN_SESSION` directly (no Route Handler).
- [ ] Redirects to `/basket`.
- [ ] No Stripe API call is made (no PI retrieval for an unauthorized request).
- **Setup variant**: hit `/checkout-seed?scenario=succeeded-pi&secret=$CHECKOUT_SEED_SECRET` to seed a `paymentIntentId`. Without going through the Route Handler, `completedPaymentIntentId` is NOT set. Then visit `/checkout/success?payment_intent=<the_seeded_id>`.
- [ ] Still redirects to `/basket` — the guard checks `session.completedPaymentIntentId`, which is set ONLY by the Route Handler.
- *(This is the privacy bug fix: PI ids leaked via referer / browser history / link sharing cannot be used to render another user's order.)*

### Test 6: Success page — happy path with order details (cross-scope reachability)
- Complete a real payment via the full flow.
- After landing on `/checkout/success`:
  - [ ] Page loads instantly (NO server-side `setTimeout` delay).
  - [ ] Page displays Stripe-derived confirmation: amount (formatted PLN), payment method (last4 / Blik / etc).
  - [ ] Suspense fallback `Fetching order details…` shows briefly.
  - [ ] When the webhook completes, `<OrderDetails />` renders without a full page reload (Suspense streams it in).
  - [ ] Order document fields displayed: `_id`, item list (product, quantity, line price), total (grosz → PLN), shipping address (5 fields: regionCode, postalCode, street, streetNumber, city), `orderDate`.
  - [ ] Link to `/basket` for next checkout is present.
- [ ] Sanity order document was queried by field name `paymentIntentId` (cross-checked vs payment Test 14 — both must use the same camelCase field name).
- [ ] If `<OrderDetails />` returns `null`, Test 7 lag-state applies. If it never resolves, the webhook is broken (see Test 0 preconditions).

### Test 6.5: Webhook handles new session fields
- Complete a payment with address including firstName, lastName, phone, and email on payment page
- [ ] Webhook creates order document with address.firstName, address.lastName, address.phone fields populated
- [ ] Webhook creates order document with email field populated from session.email
- [ ] Order document in Sanity contains all new fields: firstName, lastName, phone, email
- [ ] Verify webhook idempotency: if webhook redelivered, no duplicate fields or duplicate stock decrements

### Test 7: Webhook lag — success page renders before order document exists
- **Option A (real)**: in Stripe Dashboard → Developers → Webhooks, temporarily disable the endpoint. Complete a payment. The Route Handler still runs (Stripe redirect is independent of webhook delivery), so the user lands on `/checkout/success` but Sanity has no order yet.
- **Option B (faster)**: leave the webhook enabled and rely on the natural ordering window (Stripe redirect typically arrives ~100–1000ms before the webhook fires).
- On `/checkout/success`:
  - [ ] Page renders instantly with Stripe payment confirmation (amount, status).
  - [ ] `<OrderDetails />` renders: "Payment successful — generating your invoice…" + fallback amount from Stripe + a refresh button.
  - [ ] Refresh button is the only `'use client'` code on this page (verify by file inspection: only `RefreshButton.tsx` carries the directive).
  - [ ] Clicking refresh re-runs the Server Component fetch (via `router.refresh()`) without a full page reload.
- After the webhook lands (re-enable Option A; or wait for Option B):
  - [ ] Refresh button click renders full order details.

### Test 8: Failed payment displays correctly with retry path
- Use Stripe decline card `4000 0000 0000 0002`. Land on `/checkout/success?payment_intent=...&status=failed`.
- [ ] Privacy guard passes — the Route Handler set `session.completedPaymentIntentId = pi.id` even on `requires_payment_method` (per the canonical lifecycle table; uniform-across-statuses is intentional so the retry display branch can render).
- [ ] Page displays Stripe error message via `pi.last_payment_error?.message ?? 'Payment was declined.'` with `role="alert"`.
- [ ] Retry link points at `/checkout/payment`.
- [ ] Navigating to `/checkout/payment` lands on the payment page (basket + address + shipping data still in session); user can retry without re-entering the funnel.

### Test 9: Cancelled payment displays correctly with retry path
- Cancel during Stripe redirect flow. Land on `/checkout/success?payment_intent=...&status=canceled`.
- [ ] `role="alert"` region renders "Payment was canceled."
- [ ] Retry link points at `/checkout/payment`.
- [ ] Basket + address + shipping data still in session (verify cookie).
- [ ] Navigating to `/checkout/payment` works without redirecting through earlier funnel steps.

### Test 10: Processing payment displays correctly
- Use the async-confirmation flow (e.g. Stripe test card that triggers async-flow) or seed via `/checkout-seed?scenario=processing-pi&secret=$CHECKOUT_SEED_SECRET`.
- [ ] `role="alert"` region renders "Payment is processing. We'll email a confirmation when settled."
- [ ] Refresh button present (same `<RefreshButton />` as Test 7).
- [ ] Basket + address + shipping data still in session (the `processing` row of the lifecycle table preserves them).

### Test 11: Verification-failed displays correctly with support reference
- Trigger via Test 3 setup (Stripe API down).
- [ ] Page renders the verification-failed state with `role="alert"`.
- [ ] Display includes the literal `payment_intent` ID for the user to give to support.
- [ ] Links to `/basket` and to a support page are present.
- [ ] No Sanity query attempted on this branch.

### Test 12: Refresh on success page is idempotent
- Complete a payment, land on `/checkout/success`. Press F5.
- [ ] Page re-renders with the same content.
- [ ] No duplicate Stripe call side effects (retrieve is idempotent; this is the asserted Stripe contract).
- [ ] No duplicate Sanity writes (the success page never writes; the webhook writes, and the webhook is itself idempotent by `paymentIntentId`).
- [ ] If Stripe redelivered the webhook event, only ONE order document exists (cross-asserted in payment Test 14).

### Test 13: Next checkout cycle creates a fresh session
- After a successful payment (Test 6), navigate to `/basket` and add a new item.
- [ ] Basket initialisation overwrites `session.completedPaymentIntentId` (or it expires on cookie maxAge).
- [ ] New session has fresh basket data and no `paymentIntentId`.
- [ ] Starting a new flow lands cleanly on each step.

---

## Cross-scope contracts asserted by these tests

| Contract | Pinned value | Co-asserted in |
|---|---|---|
| Stripe `return_url` | `${origin}/api/checkout/return` | payment Test 10, payment Task 11 |
| Privacy-guard key | `session.completedPaymentIntentId` (set on every status) | this scope framed-objective + tasks-decomposition lifecycle table; payment framed-objective lifecycle table |
| Sanity order field | `paymentIntentId` (camelCase) | payment Test 14, this scope Test 6, this scope Task 1.2 schema verification |
| Currency unit | integer grosz throughout | every doc |
| Webhook signature | `STRIPE_WEBHOOK_SECRET` verified before processing | payment Test 0, payment Task 15 |
| Webhook idempotency | find-or-create order by `paymentIntentId` | payment Test 14, payment Task 15, this scope Test 12 |

Any test failure that would be resolved by drifting one of these values is a contract violation, not a test bug. Fix the implementation, never the contract.
