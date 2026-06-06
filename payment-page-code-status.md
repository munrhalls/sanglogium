# Payment Page — Exact Code Status Report

**Date:** 2026-06-06  
**Scope:** `/checkout/payment` and every file it touches (or does not touch) in the production flow.

---

## 1. Active Production Flow

The payment page is a **4-layer flow**. Below is the exact path a user follows:

```
User navigates to /checkout/payment
    ↓
Layer 1: page.tsx (Server Component)
    ↓
Layer 2: PaymentForm.client.tsx (Client Component)
    ↓ calls POST ↓
Layer 3: /api/checkout/payment-intent-session (Route Handler)
    ↓ returns clientSecret ↓
Layer 2: Stripe <Elements> mounts → user pays
    ↓ Stripe redirects ↓
Layer 3: /api/checkout/return (Route Handler)
    ↓ redirects ↓
Layer 4: /checkout/success (Server Component)
    ↓ async ↓
Layer 5: Stripe Webhook (/api/webhooks/stripe) — fallback order creation
```

---

## 2. File-by-File Status

### ACTIVE — In the production user flow

| File | Role | What it does |
|------|------|--------------|
| `app/checkout/payment/page.tsx` | Server Component (Layer 1) | Reads iron-session. Runs funnel guards (basket, address, shippingCost, quantity sanity). Queries Sanity for live prices/stock. Computes subtotal + shipping = grandTotal. Passes data to CheckoutSummary + PaymentForm. |
| `app/checkout/payment/PaymentForm.client.tsx` | Client Component (Layer 2) | On mount, fetches clientSecret from `/api/checkout/payment-intent-session`. Wraps form in Stripe `<Elements>`. Renders ExpressCheckoutElement (Apple/Google Pay), PaymentElement (BLIK / P24 / card), mobile sticky pay bar. Calls `stripe.confirmPayment()` with return_url `/api/checkout/return`. |
| `app/checkout/payment/_components/CheckoutSummary.tsx` | Presentational | Displays order summary: product thumbnails, names, conditions (Open Box), quantities, unit prices, line totals, shipping label + estimate, VAT line, grand total, and shipping address. |
| `app/api/checkout/payment-intent-session/route.ts` | Route Handler (Layer 3) | **Called by PaymentForm.client.tsx**. Validates `grandTotal` + `metadata`. Merges full session data (basket, address, shipping, email) into Stripe metadata. Creates or updates a Stripe PaymentIntent (currency hardcoded `pln`). Stores `paymentIntentId` in iron-session. Returns `clientSecret`. |
| `app/api/checkout/return/route.ts` | Route Handler (Layer 3) | **Called by Stripe redirect**. Retrieves PI status server-side. Sets `completedPaymentIntentId` in session. On `succeeded`: clears basket/address/shipping, calls `createOrderFromPaymentIntent` synchronously, redirects to `/checkout/success`. On `requires_payment_method` / `canceled`: partial clear. On `processing`: keeps everything. |
| `app/checkout/success/page.tsx` | Server Component (Layer 4) | Privacy guard: redirects to `/basket` if no `payment_intent` param or if `completedPaymentIntentId` does not match. Verifies PI server-side with Stripe. Renders success / declined / canceled / processing / error states. Displays payment method hint (BLIK, Przelewy24, Apple Pay, card brand + last4, etc.). |
| `app/checkout/success/OrderDetails.tsx` | Async Server Component | Fetches order from Sanity by `paymentIntentId`. If not found yet (webhook lag), shows fallback with refresh button. If found, renders full receipt: order number, date, items, pricing breakdown, shipping address. |
| `app/checkout/success/RefreshButton.tsx` | Client Component | `router.refresh()` button for polling order creation. |
| `app/api/webhooks/stripe/route.ts` | Route Handler (Layer 5) | Verifies Stripe signature. On `payment_intent.succeeded`: calls `createOrderFromPaymentIntent` (fallback if return handler failed). On `payment_intent.payment_failed`: logs failure. Returns 500 on processing error so Stripe retries. |
| `lib/checkout/createOrderFromPaymentIntent.ts` | Secure Service | **Idempotency:** skips if order already exists for this PI. Parses basket/address from PI metadata. Fetches product names/prices from Sanity. Generates `orderNumber` (ORD-YYYY-NNNN format). Creates order document in Sanity. Decrements stock for each item. |
| `lib/stripe.ts` | SDK wrapper | Initializes Stripe with `STRIPE_SECRET_KEY`. Exports `retrievePaymentIntent()` helper. |
| `lib/session.ts` | Session management | `getCheckoutSession()` returns iron-session cookie with basket, address, shipping fields, `paymentIntentId`, `completedPaymentIntentId`, `checkoutSessionId` (trace ID). |
| `app/checkout/layout.tsx` | Layout | Checkout shell: Montserrat font, BrandLogo header, CheckoutProvider context, max-w-4xl centered content. |
| `app/checkout/_components/CheckoutStepper.tsx` | Presentational | Visual progress bar: Basket → Address → Shipping → Payment. |

### ORPHANED / NOT in the production flow

> **Rule:** presence of code ≠ active usage.

| File | Why it exists | Why it is NOT in the flow |
|------|---------------|---------------------------|
| `app/api/checkout/payment-intent/route.ts` | Creates PaymentIntent from `basketReservationId` | The UI calls `/api/checkout/payment-intent-session`, which uses iron-session data directly. **This route is only called by integration tests.** |
| `app/api/checkout/payment-intent/session/route.ts` | Simpler version of `payment-intent-session` route, no logging | **Never imported or called by UI.** The active route is `payment-intent-session` (with logging + richer error handling). |
| `tests/checkout/payment/payment-form.test.tsx` | Unit test for PaymentForm | **Broken / stale.** Imports from `@/app/(store)/checkout/payment/_components/PaymentForm` which does **not exist**. The actual component is at `app/checkout/payment/PaymentForm.client.tsx` with a different API (no `clientSecret` prop — it fetches its own). |
| `tests/checkout/integration/payment-intent.test.ts` | Integration test | Tests the **orphaned** `payment-intent` route (basketReservation-based). Does not test the active `payment-intent-session` route. |

---

## 3. Exact Funnel Guards (Layer 1)

`app/checkout/payment/page.tsx` performs these checks in order:

1. **Empty basket** → redirect `/basket`
2. **Invalid quantity** (non-integer or < 1) → redirect `/basket?error=invalid_basket`
3. **No address** → redirect `/checkout/address`
4. **No shippingCost** → redirect `/checkout/shipping`
5. **Excessive quantity** (> 10 per item) → redirect `/basket?error=excessive_quantity&id=...`
6. **Sanity product mismatch** (basket IDs not all found) → **throws** (500)
7. **Invalid price** (`unit_amount` not finite) → **throws** (500)
8. **Out of stock** (`stock === 0`) → redirect `/basket?error=out_of_stock&id=...`
9. **Invalid total** (`grandTotal < 1`) → redirect `/basket?error=invalid_total`

After all guards pass, the page queries Sanity for product names, prices, stock, and image URLs, then renders.

---

## 4. Exact Payment Form Behavior (Layer 2)

`PaymentForm.client.tsx`:

1. **Mount** → POST to `/api/checkout/payment-intent-session` with `grandTotal` + `metadata`
2. **Loading state** → skeleton pulses until `clientSecret` arrives
3. **Error state** → shows "Payment Error" card with "Try Again" + "Go Back" buttons
4. **Success** → wraps in `<Elements stripe={stripePromise} clientSecret={...}>`
5. **Renders:**
   - `ExpressCheckoutElement` (Apple Pay / Google Pay) — black buttons, height 44
   - Divider text: "Or choose another payment method"
   - `PaymentElement` with `paymentMethodOrder: ['blik', 'p24', 'card']` and billing address hidden
   - Security badge (lock icon + "Secure payment encrypted by Stripe")
   - Pay button: `btn-cart-large w-full py-4` — **desktop only**
   - Mobile sticky bar (fixed bottom) — **primary CTA on mobile**
   - Payment method badges: Visa · Mastercard · BLIK
   - Klarna messaging element (if `grandTotal >= 5000`)

6. **Pay action** → `elements.submit()` → on success → `stripe.confirmPayment({ return_url: '/api/checkout/return', payment_method_data: { billing_details } })`
7. **Error handling** → only custom error for `api_error` type; card/validation errors shown natively by Stripe

---

## 5. Exact Return Handler Behavior (Layer 3)

`app/api/checkout/return/route.ts`:

| PI Status | Session Action | Redirect Target |
|-----------|---------------|-----------------|
| `succeeded` | Clear basket, address, shipping, paymentIntentId. Create order sync. | `/checkout/success?payment_intent=...` |
| `requires_payment_method` | Clear only `paymentIntentId`. Keep basket/address/shipping. | `/checkout/success?payment_intent=...&status=failed` |
| `canceled` | Clear only `paymentIntentId`. Keep basket/address/shipping. | `/checkout/success?payment_intent=...&status=canceled` |
| `processing` | Keep everything. | `/checkout/success?payment_intent=...&status=processing` |
| unknown | Clear `paymentIntentId`. Redirect `/basket?error=unexpected_status` | — |

Always sets `completedPaymentIntentId` before any redirect.

---

## 6. Exact Order Creation Behavior

`lib/checkout/createOrderFromPaymentIntent.ts`:

1. **Idempotency:** queries Sanity for existing order by `paymentIntentId`. If found, returns immediately.
2. **Metadata parsing:** extracts `basket`, `address`, `shippingCode`, `shippingCost`, `shippingMethodName`, `shippingCarrier`, `shippingEstimatedDays`, `email` from PI metadata.
3. **Sanity query:** fetches product names and prices by IDs.
4. **Order number:** counts orders this year, formats as `ORD-YYYY-NNNN`.
5. **Document shape:** `_type: 'order'`, `status: 'processing'`, `isGuest: true`, `dates.orderedAt` + `dates.paidAt`, `payment.method` (blik/p24/card/etc.), `payment.brand`, `payment.last4` if card.
6. **Stock:** decrements `stock` field for each basket item via `patch().dec()`.

---

## 7. Key Red Flags

1. **Stale unit test:** `tests/checkout/payment/payment-form.test.tsx` imports from a non-existent path and tests an old component API.
2. **Orphaned route:** `app/api/checkout/payment-intent/route.ts` is fully implemented with validation but never called by the UI — only by integration tests.
3. **Duplicate route:** `app/api/checkout/payment-intent/session/route.ts` is a near-duplicate of `payment-intent-session` but without logging. It is also orphaned.
4. **Order creation dual path:** Both the return handler (sync) and the webhook (async) call `createOrderFromPaymentIntent`. Idempotency guards against duplicates, but this is a dual-entry design.
5. **Hardcoded PLN:** `PaymentForm.client.tsx` and both payment-intent routes hardcode `currency: 'pln'`.
6. **Console logs in production:** Both `page.tsx` and `PaymentForm.client.tsx` contain live audit console.log blocks that print on every load regardless of environment.
