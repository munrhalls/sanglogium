# Sprint A: Payment Intent Backend

## PHASE 0: Pre-Work Lessons Retrieval

**Status:** No `_project/lessons/INDEX.md` exists. No pre-work lessons to load.

**Verified System Understanding (from docs + implementation audit):**

| Source | Finding |
|--------|---------|
| `docs/basket/basket-page` | Basket page done. Prices from CMS via `price_data.unit_amount` (cents). Checkout button passes `PureBasketItems` to checkout handler. |
| `docs/checkout/address slice` | NOT finished. Google API → PATCH `/api/basket-reservations/[id]` with `shippingAddress` → redirect to `/checkout/shipping`. |
| `docs/checkout/shipping` | NOT finished. Shippo API → display options → PATCH `/api/basket-reservations/[id]` with `shippingChoice` → redirect to `/checkout/payment`. |
| `app/api/checkout-queue/route.ts` | Working. Creates Sanity `basketReservation` doc with `verifiedPrice` (cents), saves `basketReservationId` to sessionStorage. |
| `app/api/basket-reservations/[id]/route.ts` | Working. GET + PATCH (supports `shippingAddress` and `shippingChoice`). |
| `sanity-cms/schemaTypes/basketReservationType.ts` | Has: `basketReservation[]` (`_id`, `quantity`, `verifiedPrice`), `createdAt`, `expiresAt`, `shippingAddress`, `shippingChoice`. |
| `lib/stripe.ts` | Stripe instance (KEEP). `getVerifiedPrice` uses `stripePriceId` (DELETE — we don't use PIM). |
| `lib/stripe-promise.ts` | `loadStripe` at module scope (KEEP — correct pattern). |
| `app/api/checkout/route.ts` | Creates Stripe Checkout Session with `stripePriceId` (DELETE — wrong approach, uses PIM + Checkout Session). |
| `app/api/webhook/route.ts` | Handles `checkout.session.completed` (DELETE — Checkout Session based, irrelevant). |
| `app/api/webhooks/stripe/route.ts` | Handles `payment_intent.*` events (KEEP file, will be refactored in Sprint C). |
| `app/(store)/checkout/payment/page.tsx` | Empty stub — returns `<div>page</div>`. |

**Critical Architectural Constraints:**
- CMS is sole source of truth for prices. NO `stripePriceId`. NO Stripe PIM for products.
- `verifiedPrice` in Sanity is in **cents** (from `price_data.unit_amount`).
- `shippingChoice.amount` unit needs verification — Shippo returns standard currency units, may need conversion to cents.
- Checkout flow: basket → address → shipping → **payment** (this sprint's downstream consumer).

---

## PHASE 1: UX Flows First

### Step 1: Define All User Interactions

**Current State (what exists today):**
1. Payment page is an empty stub (`app/(store)/checkout/payment/page.tsx` returns `<div>page</div>`)
2. Legacy `POST /api/checkout` creates a Stripe Checkout Session (wrong approach — uses `stripePriceId`, PIM-dependent)
3. No way to create a PaymentIntent for use with embedded React Stripe Elements

**Target State (what Sprint A delivers):**
1. Developer/tester calls `POST /api/create-payment-intent` with `{ basketReservationId: "..." }`
2. System fetches the reservation from Sanity, verifies it exists and hasn't expired
3. System computes total amount from `verifiedPrice * quantity` (items) + `shippingChoice.amount` (shipping)
4. System creates a Stripe PaymentIntent with the computed amount and currency
5. System returns `{ clientSecret: "pi_xxx_secret_yyy" }`
6. On error: system returns clear, non-leaking error messages with appropriate HTTP status codes

### Step 2: End-State Overview

A single, focused API endpoint creates a Stripe PaymentIntent from a verified basket reservation. It reads prices exclusively from Sanity CMS (the source of truth), computes the total including shipping, and returns a client secret ready for consumption by Stripe's React Elements `PaymentElement`. The endpoint is callable in isolation via curl or Playwright, with no frontend dependency. All legacy Checkout Session code is removed.

---

## PHASE 2: Architecture Contract

### Event → State → Side Effect → Result Event

```
CREATE_PAYMENT_INTENT { basketReservationId }
  → state: fetching reservation
  → side effect: GET basketReservation from Sanity
  → result: RESERVATION_FOUND { items, shippingChoice, expiresAt, currency }
    OR RESERVATION_NOT_FOUND
    OR RESERVATION_EXPIRED

RESERVATION_FOUND
  → state: computing amount
  → side effect: sum(verifiedPrice * quantity) + shippingChoice.amount → totalCents
  → result: AMOUNT_COMPUTED { totalCents, currency }
    OR MISSING_SHIPPING_CHOICE

AMOUNT_COMPUTED
  → state: creating payment intent
  → side effect: stripe.paymentIntents.create({ amount, currency, metadata })
  → result: PAYMENT_INTENT_CREATED { clientSecret, paymentIntentId }
    OR STRIPE_ERROR
```

### Three Readable Contracts

**1. Events + Payloads**
```ts
type PaymentIntentEvent =
  | { type: 'CREATE_PAYMENT_INTENT'; payload: { basketReservationId: string } }
  | { type: 'RESERVATION_FOUND'; payload: ReservationData }
  | { type: 'RESERVATION_NOT_FOUND'; payload: { basketReservationId: string } }
  | { type: 'RESERVATION_EXPIRED'; payload: { expiresAt: string } }
  | { type: 'AMOUNT_COMPUTED'; payload: { totalCents: number; currency: string } }
  | { type: 'MISSING_SHIPPING_CHOICE' }
  | { type: 'PAYMENT_INTENT_CREATED'; payload: { clientSecret: string; paymentIntentId: string } }
  | { type: 'STRIPE_ERROR'; payload: { message: string } }
```

**2. Transition Table**
```
idle          → CREATE_PAYMENT_INTENT   → fetching
fetching      → RESERVATION_FOUND       → computing
fetching      → RESERVATION_NOT_FOUND   → error (404)
fetching      → RESERVATION_EXPIRED     → error (410)
computing     → AMOUNT_COMPUTED         → creating
computing     → MISSING_SHIPPING_CHOICE → error (400)
creating      → PAYMENT_INTENT_CREATED  → success (200)
creating      → STRIPE_ERROR            → error (500)
```

**3. Context Shape**
```ts
type PaymentIntentContext = {
  status: 'idle' | 'fetching' | 'computing' | 'creating' | 'error' | 'success'
  basketReservationId: string
  reservation: ReservationData | null
  totalCents: number | null
  currency: string | null
  clientSecret: string | null
  paymentIntentId: string | null
  error: string | null
}
```

### Simplicity Guardrail
No state machine library. The endpoint is a single `POST` handler function with sequential async steps. Each step returns early on failure. No classes, no abstractions beyond a plain async function.

---

## PHASE 3: Tiny Scope Contracts

---

### Scope Contract 1: Delete Legacy Stripe Checkout Session Code

**UX Slice**
- No user-facing change — legacy code is either unreachable or wrong-path
- Removes confusion for future developers

**Architecture Slice**
- Delete `app/api/checkout/route.ts` — creates Stripe Checkout Session with `stripePriceId`, wrong approach
- Delete `app/api/webhook/route.ts` — handles `checkout.session.completed`, irrelevant for PaymentIntent flow
- Remove `getVerifiedPrice` from `lib/stripe.ts` — uses `stripePriceId`, PIM-dependent
- Keep `lib/stripe.ts` Stripe instance (still needed for PaymentIntent creation)
- Keep `lib/stripe-promise.ts` (needed for frontend in Sprint B)
- Keep `app/api/webhooks/stripe/route.ts` (handles `payment_intent.*` events, refactored in Sprint C)

**Human Verification Checklist (<5 minutes)**
- [ ] `grep_search` for `checkout.session` across codebase — confirm only `app/api/webhooks/stripe/route.ts` references remain
- [ ] `grep_search` for `stripePriceId` across codebase — confirm zero references
- [ ] `grep_search` for `getVerifiedPrice` across codebase — confirm zero references
- [ ] Build succeeds: `npx tsc --noEmit`

**Minimal Tests**
- None needed — dead code removal

---

### Scope Contract 2: Create POST /api/create-payment-intent

**UX Slice**
- No direct user-facing change (backend endpoint)
- Enables Sprint B (Stripe Elements UI) to fetch a client secret

**Architecture Slice**
- New file: `app/api/create-payment-intent/route.ts`
- `POST` handler:
  1. Parse `{ basketReservationId }` from request body — return 400 if missing
  2. Fetch reservation from Sanity via `getBackendClient()` — return 404 if not found
  3. Check `expiresAt` — return 410 if expired
  4. Verify `shippingChoice` exists — return 400 if missing
  5. Compute `totalCents`: sum of `item.verifiedPrice * item.quantity` for all items, plus `shippingChoice.amount` (converted to cents if needed — **verify unit during implementation**)
  6. Determine `currency` from first item's `price_data.currency` (all items share same currency)
  7. Call `stripe.paymentIntents.create({ amount: totalCents, currency, automatic_payment_methods: { enabled: true }, metadata: { basketReservationId } })`
  8. Return `{ clientSecret: paymentIntent.client_secret }` with 200
- Uses existing `stripe` instance from `lib/stripe.ts`
- Uses existing `getBackendClient()` from `sanity-cms/lib/backendClient`

**Stripe API Reference (verified):**
- `stripe.paymentIntents.create({ amount, currency, automatic_payment_methods: { enabled: true } })` — amount in smallest currency unit (cents), currency lowercase 3-letter ISO
- Returns `{ client_secret, id, status }`
- `automatic_payment_methods: { enabled: true }` enables PaymentElement to render all available methods
- Reference: https://docs.stripe.com/api/payment_intents/create

**Human Verification Checklist (<5 minutes)**
- [ ] `curl -X POST http://localhost:3000/api/create-payment-intent -H 'Content-Type: application/json' -d '{"basketReservationId":"REAL_ID"}'` → returns 200 with `clientSecret`
- [ ] Verify `clientSecret` starts with `pi_` and contains `_secret_`
- [ ] `curl` with missing body → returns 400
- [ ] `curl` with non-existent ID → returns 404
- [ ] `curl` with expired reservation → returns 410
- [ ] `curl` with reservation missing `shippingChoice` → returns 400
- [ ] Check Stripe Dashboard → PaymentIntent exists with correct amount

**Minimal Tests**
- Test: valid reservation → returns clientSecret (200)
- Test: missing basketReservationId → returns 400
- Test: non-existent reservation → returns 404
- Test: expired reservation → returns 410
- Test: missing shippingChoice → returns 400

---

### Scope Contract 3: Integration Test

**UX Slice**
- No user-facing change
- Provides specification and regression safety

**Architecture Slice**
- New file: `tests/payment/integration/create-payment-intent.test.ts`
- Uses real Stripe (test mode), real Sanity
- Happy path:
  1. Create a basket reservation via Sanity write client (with items, shippingChoice, future expiresAt)
  2. Call `POST /api/create-payment-intent` with the reservation ID
  3. Assert 200 + `clientSecret` in response
  4. Verify PaymentIntent exists in Stripe with correct amount
- Edge cases:
  1. Expired reservation → 410
  2. Missing shippingChoice → 400
  3. Non-existent ID → 404

**Human Verification Checklist (<5 minutes)**
- [ ] Run test: `npx vitest run tests/payment/integration/create-payment-intent.test.ts`
- [ ] All tests pass

**Minimal Tests**
- This IS the test. One integration test file covering happy path + key edge cases.

---

## PHASE 4: Continuous Verification

### Per Scope Contract Workflow
1. Implement scope contract
2. Run human verification checklist IMMEDIATELY
3. Run minimal tests (if any)
4. Confirm: "Is this the simplest possible way?"
5. Only then: move to next scope contract

### Verification Order
Scope 1 (delete legacy) → Scope 2 (create endpoint) → Scope 3 (integration test)

Scope 1 must complete first (removes confusion). Scope 2 is the core deliverable. Scope 3 validates the whole chain.

---

## PHASE 5: Final Human Check

### End-to-End Verification
After all scope contracts:
- [ ] `curl -X POST http://localhost:3000/api/create-payment-intent -H 'Content-Type: application/json' -d '{"basketReservationId":"REAL_ID"}'` → returns 200 with valid `clientSecret`
- [ ] Stripe Dashboard shows PaymentIntent with correct amount and metadata
- [ ] No `stripePriceId` references remain in codebase
- [ ] No `getVerifiedPrice` references remain
- [ ] No `checkout.session` creation code remains (only webhook handler kept for Sprint C)
- [ ] Run integration test: `npx vitest run tests/payment/integration/create-payment-intent.test.ts` → all pass
- [ ] Build succeeds: `npx tsc --noEmit`

---

## PHASE 6: Simplicity Guardrails

- **No new abstractions** — single `POST` handler function, no classes, no services, no factories
- **No new dependencies** — uses existing `stripe` instance, existing `getBackendClient()`
- **No state machine library** — sequential async steps with early returns
- **Single endpoint, single responsibility** — creates PaymentIntent, nothing else
- **Delete, don't fix** — legacy Checkout Session code is wrong-path, delete it
- **CMS is sole price source** — no Stripe Price ID lookups, no PIM

---

## PHASE 7: Scope Lock Rules

- **NO** changes outside scope contracts
- **NO** adding complexity without necessity
- **NO** skipping human verification
- **NO** tests that don't serve human confidence
- **NO** frontend work (that's Sprint B)

---

## PHASE 8: Post-Sprint /learn

**Trigger:** After final human check

**Action:** Execute `/learn` protocol
- Did deleting legacy code prevent confusion?
- Did the single-endpoint approach keep things simple?
- Did computing totals from Sanity data work correctly?
- Was the `shippingChoice.amount` unit clear or did it need conversion?
- Were simplicity guardrails effective?

---

## Appendix: Files Affected

| Action | File | Reason |
|--------|------|--------|
| DELETE | `app/api/checkout/route.ts` | Legacy Checkout Session — wrong approach |
| DELETE | `app/api/webhook/route.ts` | Legacy Checkout Session webhook — irrelevant |
| MODIFY | `lib/stripe.ts` | Remove `getVerifiedPrice`, keep Stripe instance |
| CREATE | `app/api/create-payment-intent/route.ts` | New PaymentIntent endpoint |
| CREATE | `tests/payment/integration/create-payment-intent.test.ts` | Integration test |
| KEEP | `lib/stripe-promise.ts` | Needed for Sprint B (frontend) |
| KEEP | `app/api/webhooks/stripe/route.ts` | Refactored in Sprint C |

## Appendix: Downstream Dependencies (Sprint B)

Sprint B will consume `POST /api/create-payment-intent`:
1. Payment page mounts → reads `basketReservationId` from sessionStorage
2. Calls `POST /api/create-payment-intent` → gets `clientSecret`
3. Passes `clientSecret` to `<Elements stripe={stripePromise} options={{ clientSecret }}>`
4. Renders `<PaymentElement />` inside the form
5. On submit: calls `stripe.confirmPayment()` with `redirect: 'if_required'`
