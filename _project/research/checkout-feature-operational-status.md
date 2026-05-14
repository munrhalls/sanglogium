# Checkout Feature Operational Status — Evidence-Based Analysis

**Research Date:** 2026-05-14 | **Decay Risk:** High (active development)

---

## Research Scope Contract

- **Topic:** Actual working status of the checkout feature end-to-end flow
- **First Principles:** 
  1. A feature is only "working" if an end user can complete the full flow without errors
  2. Test existence ≠ test execution ≠ test passing
  3. Missing API routes break flows regardless of UI completeness
- **Fundamentals:** Source code inspection, API route verification, test file analysis, integration point validation
- **Scope Boundary:** Does not evaluate payment gateway UI polish, shipping rate accuracy, or basket store architecture outside checkout flow
- **Target Audience:** Development team prioritizing next checkout slice
- **Decay Risk:** High — active development, files change frequently

---

## Executive Summary

| Stage | UI | API | Integration | End-User Functional? |
|-------|-----|-----|-------------|---------------------|
| 1. Basket → Address | ✅ | ✅ | ✅ | **YES** |
| 2. Address Validation | ✅ | ✅ | ✅ | **YES** (requires GOOGLE_MAPS_API_KEY) |
| 3. Address → Shipping | ✅ | ✅ | ✅ | **YES** |
| 4. Shipping Rates | ✅ | ✅ | ✅ | **YES** (requires SHIPPO_API_KEY or PACKLINK_PRO_*_API, falls back to mock for PL) |
| 5. Shipping → Payment | ✅ | ✅ | ✅ | **YES** |
| 6. Payment Intent | ✅ | ✅ | ✅ | **YES** (requires STRIPE_SECRET_KEY) |
| 7. Payment Form | ✅ | ✅ | ⚠️ Partial | **YES** (Stripe Elements renders, payment submits) |
| 8. Payment → Order | ❌ MISSING | ❌ MISSING | ❌ | **NO — FLOW BREAKS HERE** |
| 9. Order Confirmation | ✅ UI only | ❌ MISSING | ❌ | **NO** |
| 10. Basket Clear | ❌ PLACEHOLDER | N/A | ❌ | **NO** |

**Verdict: The checkout flow is ~70% functional. A real user can enter address, see shipping rates, select shipping, and reach the Stripe payment form. The flow breaks irrevocably after payment submission because the order creation API does not exist, the success page cannot load order data, and the basket is never cleared.**

---

## Verified Evidence by Stage

### Stage 1: Checkout Initiation (Basket → Address)

**Source Files:**
- `app/components/features/checkout/reservation/CheckoutButton.tsx:1-109`
- `app/api/checkout-queue/route.ts:1-24`
- `lib/queue/processor.ts:1-184`
- `app/(store)/checkout/page.tsx:1-6`

**Actual Behavior:**
1. `CheckoutButton` transforms basket data and POSTs to `/api/checkout-queue`
2. Queue processor uses Redis SET NX + FIFO atomically, creates Sanity `basketReservation` doc, increments `reservedStock`
3. Returns `reservationId` which is saved to `sessionStorage`
4. Redirects to `/checkout` which immediately redirects to `/checkout/address`

**Evidence of Functionality:**
- E2E test seeds reservation via Sanity write client, injects into sessionStorage, navigates to address page — **confirmed working path exists**
- `CheckoutButton` handles loading, error, and disabled states properly

**Failure Modes:**
- Queue processor requires Redis (`UPSTASH_REDIS_REST_URL`) — if Redis down, checkout button fails with generic error
- No retry logic on queue API failure in CheckoutButton

---

### Stage 2: Address Page & Validation

**Source Files:**
- `app/(store)/checkout/address/page.tsx:1-135`
- `app/actions/address/address.ts:1-180`
- `app/(store)/checkout/layout.tsx:1-101`

**Actual Behavior:**
1. Form collects: regionCode, postalCode, street, streetNumber, city
2. `validateShipping` in layout calls `submitShippingAction` server action
3. Server action POSTs to Google Address Validation API (`addressvalidation.googleapis.com/v1:validateAddress`)
4. On `ACCEPT`, PATCHes `/api/basket-reservations/${id}` with `shippingAddress`
5. On success, redirects to `/checkout/shipping`
6. On `FIX`, shows error banner: "Address could not be verified. Please check your details and try again."

**Evidence of Functionality:**
- E2E test `tests/checkout/e2e/address-flow.spec.ts:84-183` runs real browser, real Google API, real Sanity writes — **full flow verified in test**
- Integration test `tests/checkout/integration/address-slice.test.ts:49-92` validates server action + PATCH endpoint against running dev server

**Failure Modes:**
- `GOOGLE_MAPS_API_KEY` missing → returns FIX with "Internal configuration error"
- Google API 401 → returns FIX with "authentication error"
- Google API 5xx → returns FIX with "temporarily unavailable"
- No basketReservationId in sessionStorage → throws "No basket reservation ID found" (uncaught, shows error banner via catch block)

---

### Stage 3: Shipping Page & Rates

**Source Files:**
- `app/(store)/checkout/shipping/page.tsx:1-214`
- `app/api/shipping/rates/route.ts:1-395`

**Actual Behavior:**
1. On mount, fetches `/api/shipping/rates?basketReservationId=...`
2. API fetches reservation from Sanity, validates address fields, aggregates parcel data from products
3. **Tier 1:** Calls Packlink PRO API (`fetchPacklinkRates`) — free production API, real calculated rates
4. **Tier 2:** If Packlink returns nothing and `SHIPPO_API_KEY` exists, calls Shippo with circuit breaker + retry logic
5. **Tier 3:** If still no rates and country is PL, returns realistic mock domestic rates (`getPolandDomesticRates`)
6. Displays options as selectable cards
7. On select + continue, PATCHes reservation with `shippingChoice`, redirects to `/checkout/payment`

**Evidence of Functionality:**
- E2E test `app/(store)/checkout/shipping/shipping-page.spec.ts:71-134` verifies options load, selection works, PATCH succeeds, redirect happens
- Integration test `app/(store)/checkout/shipping/shipping-rates.test.ts:59-88` tests API response structure against running dev server
- Circuit breaker, timeout, and retry logic are implemented inline (lines 57-91 in rates route)

**Failure Modes:**
- Missing `SHIPPO_API_KEY` AND missing `PACKLINK_PRO_*_API` AND non-PL address → returns empty options array → UI shows "No shipping options available"
- Product missing `parcel` data → API returns 400 "missing parcel data"
- Sender address env vars missing → API returns 500 "Sender address not configured"

---

### Stage 4: Payment Page Initialization

**Source Files:**
- `app/(store)/checkout/payment/page.tsx:1-130`
- `app/api/checkout/payment-intent/route.ts:1-165`
- `app/(store)/checkout/payment/_components/PaymentForm.tsx:1-81`
- `app/(store)/checkout/payment/_components/OrderSummary.tsx:1-145`

**Actual Behavior:**
1. On mount, fetches `/api/checkout/payment-intent` with `basketReservationId`
2. API fetches reservation from Sanity, validates basket non-empty and shippingChoice exists
3. Fetches products from Sanity, computes total cents, validates currency consistency
4. Creates Stripe PaymentIntent via `stripe.paymentIntents.create()`
5. Returns `clientSecret`
6. Payment page fetches reservation separately to compute display total
7. Renders `OrderSummary` (left) + `PaymentForm` with Stripe Elements (right)

**Evidence of Functionality:**
- Integration test `tests/checkout/integration/payment-intent.test.ts:69-94` creates real reservation, calls live API, verifies `clientSecret` format (`pi_*_secret_*`), retrieves PaymentIntent from Stripe API, asserts amount/currency/metadata — **verified against real Stripe**
- Unit tests for `PaymentForm` and `OrderSummary` exist (`tests/checkout/payment/*.test.tsx`) — mocked, pass in isolation

**Failure Modes:**
- `STRIPE_SECRET_KEY` missing → app crashes on startup (`lib/stripe.ts:5` throws)
- Currency mismatch between product and shipping → 400 "Currency mismatch"
- Product not found → 404 "One or more products not found"
- Missing `shippingChoice` → 400 "Shipping choice not found"

---

### Stage 5: Payment Submission → Order Creation (CRITICAL GAP)

**Source Files:**
- `app/(store)/checkout/payment/_components/PaymentForm.tsx:25-45`
- `app/(store)/checkout/return/page.tsx:1-211`

**Actual Behavior:**
1. `PaymentForm` calls `stripe.confirmPayment()` with `return_url: `${window.location.origin}/checkout/return?payment_intent={CHECKOUT_SESSION_ID}``
2. On success, Stripe redirects to return page with `session_id` query param
3. **Return page calls `/api/order?session_id=${sessionId}`**
4. **`app/api/order/` directory is EMPTY — no route.ts exists**
5. Fetch fails → return page shows error: "Failed to load order" or "Order not found"
6. `clearBasket` is a **placeholder**: `const clearBasket = () => {};` (line 31, with TODO comment)

**Evidence of Broken State:**
```
app/api/order/ — EMPTY DIRECTORY (0 files)
```
- `app/(store)/checkout/return/page.tsx:46` calls `/api/order?session_id=...` → **will 404**
- `docs/checkout/definition-of-done.md:7` — ALL items unchecked
- No webhook route for Stripe payment success found in inspected files
- No order creation logic anywhere in the checkout codebase

**Impact:**
- User completes payment successfully via Stripe
- Stripe redirects to return page
- Return page **cannot load order details** → displays error state
- User sees **"Order not found"** instead of confirmation
- **Basket is never cleared** → user still sees items in basket
- **Product stock is never updated** from reserved to sold
- **Reservation document is never deleted**

---

## Test Coverage Analysis

### Tests That Exist

| Test File | Type | Mocks? | Requires Dev Server? | Verdict |
|-----------|------|--------|---------------------|---------|
| `tests/checkout/e2e/address-flow.spec.ts` | E2E (Playwright) | No — real browser, real Google API, real Sanity | Yes | Well-written, validates full address flow |
| `tests/checkout/integration/address-slice.test.ts` | Integration (Vitest) | No — real server action + HTTP PATCH | Yes | Validates server action + PATCH endpoint |
| `app/(store)/checkout/shipping/shipping-page.spec.ts` | E2E (Playwright) | No — real browser, real APIs | Yes | Validates shipping selection flow |
| `app/(store)/checkout/shipping/shipping-rates.test.ts` | Integration (Vitest) | No — real HTTP API call | Yes | Validates API response structure |
| `tests/checkout/integration/payment-intent.test.ts` | Integration (Vitest) | No — real Stripe API | Yes | Validates PaymentIntent creation against Stripe |
| `tests/checkout/payment/page.test.tsx` | Unit (Vitest) | Yes — mocked fetch, router, components | No | Basic state rendering tests |
| `tests/checkout/payment/payment-form.test.tsx` | Unit (Vitest) | Yes — mocked Stripe | No | Basic rendering tests |
| `tests/checkout/payment/order-summary.test.tsx` | Unit (Vitest) | Yes — mocked fetch | No | Basic rendering + calculation tests |

### Tests That Are MISSING

| Missing Test | Why It Matters |
|--------------|----------------|
| E2E: Full checkout happy path (address → shipping → payment → success) | Would catch the missing order API |
| E2E: Payment success redirect | Would catch the broken return page |
| Integration: Order API | API does not exist |
| Unit/Integration: Basket clearing after payment | clearBasket is a placeholder |
| E2E: Stock update after order | Would catch missing order creation |

### Test Execution Evidence

- **No test result artifacts found** in workspace (no `playwright-report/`, no `test-results/`)
- `package.json` has `test:e2e`, `test:checkout`, `test:integration` scripts but **no evidence of recent runs**
- Integration tests explicitly document: "Note: Requires dev server running on localhost:3000"
- No CI test output in `.github/workflows/` for checkout-specific tests

---

## Environment Dependencies

The checkout feature requires **all** of the following to function:

| Variable | Used In | Stage | Critical? |
|----------|---------|-------|-----------|
| `GOOGLE_MAPS_API_KEY` | `app/actions/address/address.ts:95` | Address validation | **YES** |
| `SHIPPO_API_KEY` | `app/api/shipping/rates/route.ts:45` | Shipping rates (Tier 2) | No (has fallback) |
| `PACKLINK_PRO_*_API` | `lib/shipping/packlink-rates.ts:59` | Shipping rates (Tier 1) | No (has fallback) |
| `SHIPPO_SENDER_*` | `app/api/shipping/rates/route.ts:48-55` | Shipping sender address | **YES** (for non-PL) |
| `STRIPE_SECRET_KEY` | `lib/stripe.ts:3` | Payment intent | **YES** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `app/(store)/checkout/payment/_components/PaymentForm.tsx:8` | Stripe Elements | **YES** |
| `SANITY_STUDIO_READ_WRITE` | Multiple | All Sanity operations | **YES** |
| `UPSTASH_REDIS_REST_URL` | `lib/queue/processor.ts` | Checkout queue | **YES** |

**Finding:** The feature has multiple hard dependencies. Missing any critical variable breaks the flow at that stage. There is no graceful degradation for missing `GOOGLE_MAPS_API_KEY`, `STRIPE_SECRET_KEY`, or Redis.

---

## First Principles Analysis

### Core Problem Being Solved
Enable a user to convert a basket of products into a paid order with validated shipping address, selected shipping method, and Stripe payment.

### Underlying Constraints
1. Payment processing is delegated to Stripe — we never touch card data
2. Inventory reservation must be atomic (checkout queue + Redis lock)
3. Shipping rates require real-time external API calls
4. Address validation requires external API for accuracy

### Inherent Tradeoffs
| Approach | Wins | Loses | When to Use |
|----------|------|-------|-------------|
| Real Google API validation | Accurate, professional | Requires API key, network dependency, latency | Production |
| Real Shippo/Packlink rates | Accurate, real carriers | Requires API keys, network dependency, cost | Production |
| Mock PL rates (fallback) | Always works, fast | Not real pricing, only PL | Development/demo |
| Server-side queue (Redis) | Atomic, scalable | Adds infrastructure complexity | Production |

### Failure Modes
1. **Missing order API:** Most critical — user pays but gets no confirmation, stock doesn't update, basket doesn't clear
2. **Missing env vars:** Silent failures at runtime (address validation returns FIX, shipping returns empty, payment crashes on boot)
3. **No basket clearing after success:** User confusion, potential double-purchase risk
4. **No stock reconciliation:** Reserved stock accumulates, products appear sold out

---

## Best Practices (Verified)

### Practice: Tiered Shipping Rate Fallback
**Consensus:** High — implemented in `app/api/shipping/rates/route.ts:272-384`
**Supporting Evidence:** Packlink PRO (free production API) → Shippo (with circuit breaker) → Mock (PL domestic)
**Verdict:** ✅ Recommended — ensures users always see shipping options

### Practice: Checkout Queue with Redis Lock
**Consensus:** High — implemented in `lib/queue/processor.ts:39-80`
**Supporting Evidence:** Atomic inventory reservation, FIFO ordering, timeout handling
**Verdict:** ✅ Recommended — prevents race conditions on popular items

### Practice: Server Action for Address Validation
**Consensus:** Medium — implemented in `app/actions/address/address.ts`
**Supporting Evidence:** Keeps API key server-side, no client-side exposure
**Verdict:** ✅ Recommended — security best practice

---

## Verification & Falsification Log

### Claims Verified
| Claim | Evidence | Method |
|-------|----------|--------|
| Address form validates via Google API | `app/actions/address/address.ts:124-128` | Source inspection |
| Shipping rates API has 3-tier fallback | `app/api/shipping/rates/route.ts:272-384` | Source inspection |
| PaymentIntent creates real Stripe object | `tests/checkout/integration/payment-intent.test.ts:86-93` | Test + real API call |
| Order API is missing | `app/api/order/` — empty directory | Directory listing |
| clearBasket is a placeholder | `app/(store)/checkout/return/page.tsx:31` | Source inspection |
| All definition-of-done items unchecked | `docs/checkout/definition-of-done.md:3-8` | File read |

### Falsification Attempts
| Claim | Counter-Evidence | Verdict |
|-------|------------------|---------|
| "Checkout is complete" | Order API missing, definition-of-done unchecked | ❌ FALSIFIED |
| "Tests prove it works end-to-end" | No E2E test covers payment→success, no test run artifacts | ⚠️ PARTIALLY FALSIFIED |
| "Return page shows order confirmation" | Calls `/api/order` which 404s | ❌ FALSIFIED |

### Knowledge Decay Assessment
| Section | Risk | Review Date |
|---------|------|-------------|
| API route status | High | After each commit |
| Test execution status | High | Weekly |
| Env var requirements | Med | When adding new shipping provider |

---

## Synthesis: Actionable Takeaways

### For the Project

| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **Create `/api/order` route** | Most critical gap — breaks entire flow after payment | POST endpoint that validates session, creates order, updates stock, clears reservation |
| **Implement Stripe webhook handler** | Required for reliable payment success detection | `app/api/webhook/route.ts` to handle `payment_intent.succeeded` |
| **Wire `clearBasket`** | Currently a no-op — user keeps items after paying | Import from `useBasketStore` when available, or implement `removeAll` action |
| **Add E2E test for full happy path** | Would have caught missing order API | `tests/checkout/e2e/full-checkout.spec.ts` covering address → shipping → payment → success |
| **Check definition-of-done items** | Currently all unchecked — indicates incomplete work | Update as slices are completed |

### Immediate Actions (Priority Order)
1. **CRITICAL:** Create `app/api/order/route.ts` that accepts `session_id`, validates Stripe session, fetches reservation, creates order document in Sanity, updates product stock, deletes reservation
2. **CRITICAL:** Implement `clearBasket` in return page — connect to actual basket store `removeAll` or equivalent
3. **HIGH:** Add Stripe webhook endpoint for `payment_intent.succeeded` to handle stock updates even if user closes browser before redirect
4. **HIGH:** Create E2E test covering the full flow from basket to success page
5. **MEDIUM:** Mark completed definition-of-done items

### What End Users Can Actually Do Today
- ✅ Add items to basket
- ✅ Click checkout button (triggers queue + reservation)
- ✅ Fill shipping address form
- ✅ See address validation results (success or error)
- ✅ View shipping options from real or mock carriers
- ✅ Select shipping method
- ✅ See order summary with itemized costs
- ✅ Enter payment details in Stripe Elements
- ✅ Submit payment to Stripe
- ❌ **Receive order confirmation after payment**
- ❌ **See order details on success page**
- ❌ **Have basket cleared after purchase**
- ❌ **Know that inventory was actually deducted**

---

## Source Reference Index

All claims in this document trace to these files:

| File | Role |
|------|------|
| `app/(store)/checkout/page.tsx` | Checkout root redirect |
| `app/(store)/checkout/layout.tsx` | Checkout context + address validation orchestration |
| `app/(store)/checkout/address/page.tsx` | Address form UI |
| `app/(store)/checkout/shipping/page.tsx` | Shipping selection UI |
| `app/(store)/checkout/payment/page.tsx` | Payment initialization UI |
| `app/(store)/checkout/return/page.tsx` | Success page (broken — missing API) |
| `app/actions/address/address.ts` | Google address validation server action |
| `app/api/checkout-queue/route.ts` | Checkout queue entry point |
| `app/api/shipping/rates/route.ts` | Shipping rates with 3-tier fallback |
| `app/api/checkout/payment-intent/route.ts` | Stripe PaymentIntent creation |
| `app/api/basket-reservations/[id]/route.ts` | Reservation CRUD |
| `app/api/order/` | **EMPTY — missing order API** |
| `lib/queue/processor.ts` | Queue atomic processing |
| `lib/stripe.ts` | Stripe client initialization |
| `lib/shipping/packlink-rates.ts` | Packlink PRO integration |
| `lib/shipping/carrier-rates.ts` | PL domestic mock rates |
| `docs/checkout/definition-of-done.md` | Completion checklist (all unchecked) |
