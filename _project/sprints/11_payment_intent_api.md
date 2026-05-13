# Sprint: PaymentIntent API Endpoint (Chunk 1)

## PHASE 0: Pre-Work Lessons Retrieval

**Status:** No `_project/lessons/INDEX.md` exists. No pre-work lessons to load.

**Verified System Understanding (from implementation audit):**

| Source | Finding |
|--------|---------|
| `lib/queue/processor.ts` | Creates `basketReservation` doc with `basketReservation[]` (`_id`, `quantity`, `verifiedPrice` in cents), `createdAt`, `expiresAt`. Saves `basketReservationId` to sessionStorage. |
| `app/api/basket-reservations/[id]/route.ts` | GET + PATCH. Supports `shippingAddress` and `shippingChoice` fields. |
| `sanity-cms/schemaTypes/basketReservationType.ts` | Reservation has: `basketReservation[]` (`_id`, `quantity`, `verifiedPrice`), `shippingAddress`, `shippingChoice` (`provider`, `serviceLevel`, `rateId`, `amount`, `currency`, `estimatedDays`). |
| `sanity-cms/schemaTypes/productType.ts` | Products have `price_data` object: `{ currency: string, unit_amount: number }` — both in smallest currency unit (cents). |
| `sanity-cms/lib/backendClient.ts` | `getBackendClient()` uses `SANITY_STUDIO_READ_WRITE` token — verified to have create/read/write/delete permissions. |
| `app/api/checkout/` | Empty directory — legacy Checkout Session code already deleted. |
| `app/api/webhook/` | Empty directory — legacy webhook code already deleted. |
| `lib/stripe.ts` | Does NOT exist — must be created. |
| `app/(store)/checkout/payment/page.tsx` | Placeholder stub (`<div>page</div>`) — will be replaced in Chunk 2. |
| `app/(store)/checkout/shipping/page.tsx` | Redirects to `/checkout/payment` after saving `shippingChoice`. `shippingChoice.amount` is in cents (Shippo returns cents, displayed as `/ 100`). |

**Critical Architectural Constraints:**
- Sanity CMS is the sole source of truth for product pricing. NO `stripePriceId`. NO Stripe PIM.
- `price_data.unit_amount` is in cents (integer, smallest currency unit).
- `shippingChoice.amount` is in cents (verified from shipping page display logic).
- The API fetches **current** `price_data` from Sanity products — not `verifiedPrice` from the reservation. This is server-side price verification.
- Currency is derived from product `price_data.currency`, not hardcoded.

---

## PHASE 1: UX Flows First

### Step 1: Define All User Interactions

**Current State (what exists today):**
1. Payment page is an empty stub — no payment functionality exists
2. No way to create a Stripe PaymentIntent for the checkout flow
3. No server-side Stripe client initialization

**Target State (what this sprint delivers):**
1. Developer/tester calls `POST /api/checkout/payment-intent` with `{ basketReservationId: "..." }`
2. System fetches the reservation from Sanity, verifies it exists and has required fields
3. System fetches current `price_data` for each product in the basket from Sanity
4. System computes total: `Σ(product.price_data.unit_amount × quantity) + shippingChoice.amount`
5. System validates currency consistency across all items and shipping choice
6. System creates a Stripe PaymentIntent with the computed amount, currency, and metadata
7. System returns `{ clientSecret: "pi_xxx_secret_yyy" }`
8. On error: system returns classified errors (VALIDATION, COMPUTATION, STRIPE) with appropriate HTTP status codes

### Step 2: End-State Overview

A single, focused API endpoint creates a Stripe PaymentIntent from a verified basket reservation. It reads current product prices exclusively from Sanity CMS (the source of truth), computes the total including shipping, validates currency consistency, and returns a client secret ready for consumption by Stripe's React Payment Element. The endpoint is callable in isolation via curl, with no frontend dependency. All amounts are computed server-side — the client never dictates the payment amount.

---

## PHASE 2: Architecture Contract

### Event → State → Side Effect → Result Event

```
CREATE_PAYMENT_INTENT { basketReservationId }
  → state: validating request
  → side effect: parse body, check basketReservationId present
  → result: REQUEST_VALID
    OR VALIDATION_ERROR (missing basketReservationId)

REQUEST_VALID
  → state: fetching reservation
  → side effect: Sanity GET basketReservation by _id
  → result: RESERVATION_FOUND { items, shippingChoice, shippingAddress }
    OR VALIDATION_ERROR (reservation not found)
    OR VALIDATION_ERROR (missing shippingChoice)

RESERVATION_FOUND
  → state: fetching prices
  → side effect: Sanity GET products by _ids, extract price_data
  → result: PRICES_FETCHED { products with price_data }
    OR VALIDATION_ERROR (product not found)

PRICES_FETCHED
  → state: computing amount
  → side effect: Σ(price_data.unit_amount × quantity) + shippingChoice.amount → totalCents
  → result: AMOUNT_COMPUTED { totalCents, currency }
    OR COMPUTATION_ERROR (currency mismatch)
    OR COMPUTATION_ERROR (total <= 0)

AMOUNT_COMPUTED
  → state: creating payment intent
  → side effect: stripe.paymentIntents.create({ amount, currency, automatic_payment_methods, metadata })
  → result: PAYMENT_INTENT_CREATED { clientSecret, paymentIntentId }
    OR STRIPE_ERROR (Stripe API error)
```

### Three Readable Contracts

**1. Events + Payloads**
```ts
type PaymentIntentEvent =
  | { type: 'CREATE_PAYMENT_INTENT'; payload: { basketReservationId: string } }
  | { type: 'REQUEST_VALID'; payload: { basketReservationId: string } }
  | { type: 'VALIDATION_ERROR'; payload: { error: string; errorClass: 'VALIDATION' } }
  | { type: 'RESERVATION_FOUND'; payload: ReservationData }
  | { type: 'PRICES_FETCHED'; payload: { products: ProductPriceData[] } }
  | { type: 'AMOUNT_COMPUTED'; payload: { totalCents: number; currency: string } }
  | { type: 'COMPUTATION_ERROR'; payload: { error: string; errorClass: 'COMPUTATION' } }
  | { type: 'PAYMENT_INTENT_CREATED'; payload: { clientSecret: string; paymentIntentId: string } }
  | { type: 'STRIPE_ERROR'; payload: { error: string; errorClass: 'STRIPE' } }
```

**2. Transition Table**
```
idle        → CREATE_PAYMENT_INTENT   → validating
validating  → REQUEST_VALID           → fetching_reservation
validating  → VALIDATION_ERROR        → error (400)
fetching    → RESERVATION_FOUND       → fetching_prices
fetching    → VALIDATION_ERROR        → error (404/400)
fetching_p  → PRICES_FETCHED          → computing
fetching_p  → VALIDATION_ERROR        → error (404)
computing   → AMOUNT_COMPUTED         → creating
computing   → COMPUTATION_ERROR       → error (400)
creating    → PAYMENT_INTENT_CREATED  → success (200)
creating    → STRIPE_ERROR            → error (500)
```

**3. Context Shape**
```ts
type PaymentIntentContext = {
  status: 'idle' | 'validating' | 'fetching_reservation' | 'fetching_prices' | 'computing' | 'creating' | 'error' | 'success'
  basketReservationId: string
  reservation: ReservationData | null
  products: ProductPriceData[] | null
  totalCents: number | null
  currency: string | null
  clientSecret: string | null
  paymentIntentId: string | null
  error: { message: string; errorClass: 'VALIDATION' | 'COMPUTATION' | 'STRIPE' } | null
}
```

### Simplicity Guardrail
No state machine library. No classes. No services. The endpoint is a single `POST` handler function with sequential async steps. Each step returns early on failure. The Stripe client is a module-level singleton in `lib/stripe.ts`.

---

## PHASE 3: Tiny Scope Contracts

---

### Scope Contract 1: Create Stripe Server Client (`lib/stripe.ts`)

**UX Slice**
- No user-facing change — infrastructure setup
- Enables all subsequent Stripe API calls

**Architecture Slice**
- New file: `lib/stripe.ts`
- Initialize Stripe instance with `STRIPE_SECRET_KEY` from environment
- Export as singleton — same pattern as `sanity-cms/lib/backendClient.ts`
- TypeScript: typed with Stripe's SDK types
- No `stripePriceId` references. No `getVerifiedPrice`. No PIM-related code.

```ts
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required')
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-03-31.basil',
  typescript: true,
})
```

**Human Verification Checklist (<5 minutes)**
- [ ] File exists at `lib/stripe.ts`
- [ ] `grep_search` for `stripePriceId` in `lib/stripe.ts` — zero matches
- [ ] `grep_search` for `getVerifiedPrice` in `lib/stripe.ts` — zero matches
- [ ] Build succeeds: `npx tsc --noEmit`

**Minimal Tests**
- None needed — pure configuration, verified by build

---

### Scope Contract 2: Create POST /api/checkout/payment-intent

**UX Slice**
- No direct user-facing change (backend endpoint)
- Enables Chunk 2 (Stripe Elements UI) to fetch a client secret
- Developer can test: `curl -X POST .../api/checkout/payment-intent -d '{"basketReservationId":"..."}'` → receives `{ clientSecret }`

**Architecture Slice**
- New file: `app/api/checkout/payment-intent/route.ts`
- `POST` handler — sequential async steps with early returns:

```
1. Parse { basketReservationId } from request body
   → 400 VALIDATION if missing or not a string

2. Fetch reservation from Sanity via getBackendClient()
   → 404 VALIDATION if not found
   → 400 VALIDATION if basketReservation[] is empty
   → 400 VALIDATION if shippingChoice is missing

3. Extract product IDs from reservation.basketReservation[]._id
   Fetch products from Sanity: *[_id in $ids]{ _id, price_data }
   → 404 VALIDATION if any product not found

4. Compute totalCents:
   For each item: find matching product, compute product.price_data.unit_amount × item.quantity
   Sum all item totals + shippingChoice.amount
   → 400 COMPUTATION if total <= 0

5. Validate currency consistency:
   Collect currency from all product.price_data.currency + shippingChoice.currency
   All must be identical (case-insensitive compare)
   → 400 COMPUTATION if mismatch

6. Call stripe.paymentIntents.create({
     amount: totalCents,
     currency: currency.toLowerCase(),
     automatic_payment_methods: { enabled: true },
     metadata: { basketReservationId }
   })
   → 500 STRIPE if Stripe API errors

7. Return 200 { clientSecret: paymentIntent.client_secret }
```

- Uses `stripe` from `lib/stripe.ts`
- Uses `getBackendClient()` from `sanity-cms/lib/backendClient`
- Runtime: `nodejs` (required for Stripe SDK)
- Response format on error: `{ error: string, errorClass: 'VALIDATION' | 'COMPUTATION' | 'STRIPE' }`

**Stripe API Reference (verified):**
- `stripe.paymentIntents.create({ amount, currency, automatic_payment_methods: { enabled: true }, metadata })`
- `amount` — integer, smallest currency unit (cents)
- `currency` — lowercase 3-letter ISO 4217
- `automatic_payment_methods: { enabled: true }` — enables PaymentElement to render all available methods
- Returns `{ client_secret, id, status }`
- Reference: https://docs.stripe.com/api/payment_intents/create

**Human Verification Checklist (<5 minutes)**
- [ ] `curl -X POST http://localhost:3000/api/checkout/payment-intent -H 'Content-Type: application/json' -d '{"basketReservationId":"REAL_ID"}'` → 200 with `clientSecret`
- [ ] `clientSecret` starts with `pi_` and contains `_secret_`
- [ ] `curl` with `{}` → 400 VALIDATION "basketReservationId is required"
- [ ] `curl` with non-existent ID → 404 VALIDATION "Reservation not found"
- [ ] `curl` with reservation missing `shippingChoice` → 400 VALIDATION "Shipping choice not found"
- [ ] Check Stripe Dashboard → PaymentIntent exists with correct amount in metadata
- [ ] Verify PaymentIntent metadata contains `basketReservationId`

**Minimal Tests**
- Test: valid reservation → returns clientSecret (200)
- Test: missing basketReservationId → returns 400 VALIDATION
- Test: non-existent reservation → returns 404 VALIDATION
- Test: missing shippingChoice → returns 400 VALIDATION
- Test: currency mismatch → returns 400 COMPUTATION

---

### Scope Contract 3: Integration Test

**UX Slice**
- No user-facing change
- Provides specification and regression safety for the endpoint

**Architecture Slice**
- New file: `tests/checkout/integration/payment-intent.test.ts`
- Uses real Stripe (test mode), real Sanity
- Happy path:
  1. Create a basket reservation via `getBackendClient()` with items, `shippingChoice` (valid amount + currency), future `expiresAt`
  2. Call `POST /api/checkout/payment-intent` with the reservation ID
  3. Assert 200 + `clientSecret` in response
  4. Verify PaymentIntent exists in Stripe with correct amount
  5. Cleanup: delete test reservation
- Edge cases:
  1. Missing `basketReservationId` → 400 VALIDATION
  2. Non-existent ID → 404 VALIDATION
  3. Missing `shippingChoice` → 400 VALIDATION
  4. Currency mismatch between items and shipping → 400 COMPUTATION

**Human Verification Checklist (<5 minutes)**
- [ ] Run test: `npx vitest run tests/checkout/integration/payment-intent.test.ts`
- [ ] All tests pass
- [ ] No test data left in Sanity after test run

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
Scope 1 (Stripe client) → Scope 2 (endpoint) → Scope 3 (integration test)

Scope 1 must complete first (endpoint imports it). Scope 2 is the core deliverable. Scope 3 validates the whole chain.

---

## PHASE 5: Final Human Check

### End-to-End Verification
After all scope contracts:
- [ ] `curl -X POST http://localhost:3000/api/checkout/payment-intent -H 'Content-Type: application/json' -d '{"basketReservationId":"REAL_ID"}'` → 200 with valid `clientSecret`
- [ ] Stripe Dashboard shows PaymentIntent with correct amount and `basketReservationId` in metadata
- [ ] All error paths return correct status codes and `errorClass`
- [ ] Run integration test: `npx vitest run tests/checkout/integration/payment-intent.test.ts` → all pass
- [ ] Build succeeds: `npx tsc --noEmit`
- [ ] No `stripePriceId` references in new code
- [ ] No `getVerifiedPrice` references in new code

---

## PHASE 6: Simplicity Guardrails

- **No new abstractions** — single `POST` handler function, no classes, no services, no factories
- **No new dependencies** — uses existing `stripe` package, existing `getBackendClient()`
- **No state machine library** — sequential async steps with early returns
- **Single endpoint, single responsibility** — creates PaymentIntent, nothing else
- **CMS is sole price source** — fetches `price_data` from Sanity products, never uses `verifiedPrice` from reservation for amount computation
- **Server-side amount computation** — client never dictates the amount
- **Error classification** — every error has an `errorClass`: VALIDATION, COMPUTATION, or STRIPE

---

## PHASE 7: Scope Lock Rules

- **NO** changes outside scope contracts
- **NO** adding complexity without necessity
- **NO** skipping human verification
- **NO** tests that don't serve human confidence
- **NO** frontend work (that's Chunk 2)
- **NO** webhook work (that's Chunk 3)
- **NO** touching existing reservation or shipping code

---

## PHASE 8: Post-Sprint /learn

**Trigger:** After final human check

**Action:** Execute `/learn` protocol
- Did the single-endpoint approach keep things simple?
- Did computing totals from Sanity `price_data` work correctly?
- Was currency validation effective?
- Did error classification help with debugging?
- Were simplicity guardrails effective?

---

## Appendix: Files Affected

| Action | File | Reason |
|--------|------|--------|
| CREATE | `lib/stripe.ts` | Stripe server client singleton |
| CREATE | `app/api/checkout/payment-intent/route.ts` | PaymentIntent creation endpoint |
| CREATE | `tests/checkout/integration/payment-intent.test.ts` | Integration test |

## Appendix: Downstream Dependencies (Chunk 2)

Chunk 2 will consume `POST /api/checkout/payment-intent`:
1. Payment page mounts → reads `basketReservationId` from sessionStorage
2. Calls `POST /api/checkout/payment-intent` → gets `clientSecret`
3. Passes `clientSecret` to `<Elements stripe={stripePromise} options={{ clientSecret }}>`
4. Renders `<PaymentElement />` inside the form
5. On submit: calls `stripe.confirmPayment({ elements, confirmParams: { return_url } })`
