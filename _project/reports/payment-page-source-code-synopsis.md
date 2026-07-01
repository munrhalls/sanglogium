# Payment Page — Source Code Synopsis

**Date:** 2026-06-11  
**Scope:** `/checkout/payment` and every file it touches in the active production flow.  
**Method:** 100% code trace — every line in every active file read and summarized.

---

## 1. Technology Stack

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| Framework | Next.js | 15.5.9 | App Router, Server Components, Route Handlers |
| Runtime | React | 19.2.6 | UI library (Client Components for interactivity) |
| Language | TypeScript | 5.x | Type safety across all files |
| Styling | Tailwind CSS | 3.3.5 | Utility-first CSS |
| Session | iron-session | 8.0.4 | Encrypted HTTP-only cookies (`checkout_session`) |
| Payments | Stripe SDK | 22.2.0 | Server-side PaymentIntent create/update |
| Payments | @stripe/react-stripe-js | 5.3.0 | `<Elements>`, `<PaymentElement>`, `<ExpressCheckoutElement>` |
| Payments | @stripe/stripe-js | 8.11.0 | `loadStripe`, `confirmPayment` |
| CMS | Sanity | 3.74.1 | Product catalog (read via CDN, write via backend token) |
| CMS | groq | — | Query language for Sanity |
| Testing | Vitest | 4.1.5 | Unit & integration test runner |
| Testing | @testing-library/react | 16.3.2 | Component testing |
| Testing | jsdom | 26.1.0 | DOM environment for tests |
| Logging | Custom (`lib/dev/event-logger.ts`) | — | Structured checkout tracing |

---

## 2. Active Production Flow (Verified by Call-Site Tracing)

```
/checkout/payment (Server Component — page.tsx)
    ├─ CheckoutStepper (shared UI)
    ├─ CheckoutSummary (presentational)
    └─ PaymentForm.client (Client Component)
         ↓ POST /api/checkout/payment-intent-session
         └─ Stripe <Elements> → confirmPayment()
              ↓ redirect to /api/checkout/return
```

**Critical upstream dependencies** (enforced by funnel guards in `page.tsx`):
- `session.basket` — non-empty, valid quantities (integer ≥ 1, ≤ 10 per item)
- `session.address` — complete address object
- `session.shippingCost` — number (cents)

---

## 3. File-by-File: What The Code Actually Does

### Layer 1 — Routing & Orchestration

**`app/checkout/payment/page.tsx`** (214 lines, Server Component)

1. **Session read** — `getCheckoutSession()`, `checkoutSessionId` used as `traceId`.
2. **Funnel guards** (5 sequential checks, each logs via `logCheckoutEvent`):
   - Empty basket → `/basket`
   - Non-integer or <1 quantity → `/basket?error=invalid_basket`
   - Missing address → `/checkout/address`
   - Missing shippingCost → `/checkout/shipping`
   - Any item quantity > 10 → `/basket?error=excessive_quantity&id=...`
3. **Live Sanity query** — fetches `_id, name, price_data.unit_amount, stock, imageUrl` for all basket IDs.
   - Throws (500) on product count mismatch
   - Redirects to `/basket?error=out_of_stock&id=...` if `stock === 0`
   - Throws (500) on invalid/non-finite price
4. **Item mapping** — extracts "Open Box" condition via regex, computes `lineTotal`.
5. **Total calculation** — `subtotal = Σ(lineTotal)`, `grandTotal = Math.round(subtotal + shippingCost)`.
   - Also computes `vatAmount = grandTotal - Math.round(grandTotal / 1.23)` (Polish 23% VAT).
   - Redirects `/basket?error=invalid_total` if `grandTotal < 1`.
6. **Shipping label deduplication** — helper collapses redundant carrier/method names.
7. **Metadata build** — `regionCode, postalCode, street, streetNumber, city, email, checkoutSessionId`.
8. **Render** — `<CheckoutStepper currentStep={3} />`, two-column grid (`CheckoutSummary` + back links left, `PaymentForm` right).

### Layer 2 — Presentation & Capture

**`app/checkout/payment/PaymentForm.client.tsx`** (377 lines, `"use client"`)

**Outer component (`PaymentForm`)**:
- Props: `{ grandTotal, metadata, address, traceId }`
- State: `clientSecret`, `error`
- **Mount effect** — `initPayment(metadata)` with exponential backoff retry (H-04):
  - 3 attempts, delays `[500ms, 1000ms, 2000ms]`
  - `POST /api/checkout/payment-intent-session` with `{ grandTotal, metadata }`
- **Error state** — "Payment Error" card with "Try Again" (reload) and "Go Back" (`/checkout/shipping`) buttons.
- **Loading state** — 6 pulse skeleton bars + "Preparing secure payment…"
- **Ready state** — `<Elements stripe={stripePromise} options={{ clientSecret, defaultValues: { billingDetails: { email: metadata.email } } }}>`
  - Conditionally renders `<PaymentMethodMessagingElement>` when `grandTotal >= 5000` (Klarna, PLN)
  - Renders `<PaymentFormInner>`

**Inner component (`PaymentFormInner`)**:
- `useStripe()`, `useElements()`
- **`handlePay`**:
  1. Sets loading, clears error
  2. POSTs trace `/api/trace` (`payment_submit_start`)
  3. `elements.submit()` — on error, logs (`payment_submit_error`) and returns
  4. Builds `billing_details.address` from prop (country hardcoded `"PL"`)
  5. POSTs trace (`payment_confirm_call`)
  6. `stripe.confirmPayment({ elements, confirmParams: { return_url, payment_method_data: { billing_details } } })`
  7. On error: logs (`payment_confirm_error`); only sets UI error if `type === 'api_error'`
- **Render**:
  - `<ExpressCheckoutElement>` (Apple/Google Pay, height 44, black theme, maxColumns 4) with `onConfirm` that now passes `billing_details` (H-03)
  - Divider: "Or choose another payment method"
  - `<PaymentElement options={{ paymentMethodOrder: ['blik', 'p24', 'card'], fields: { billingDetails: { address: "never" } } }} />`
  - Error banner (red border)
  - Security badge: "Secure payment encrypted by Stripe"
  - Desktop pay button: `btn-cart-large`, hidden on mobile
  - **Mobile sticky pay bar**: fixed bottom, `z-50`, `bg-brand-700`, shadow

**`app/checkout/payment/_components/CheckoutSummary.tsx`** (158 lines, Server Component)

- Props now include `vatAmount: number` (no longer hardcoded `0`).
- Format helper: `formatPLN(cents)` → `pl-PL`, `PLN`, `currency` style.
- Shipping address block with pin icon ("Deliver to").
- Item list with thumbnails (`next/image`, `fill`, `sizes="48px"`), condition badges, name + quantity, line total.
- Summary lines: Subtotal, Shipping label + delivery estimate, VAT (included) using live `vatAmount`, Total (`text-brand-400`).

### Layer 3 — Mutation & Session Gateway

**`app/api/checkout/payment-intent-session/route.ts`** (184 lines, `POST`)

1. **Body parse** — `{ grandTotal?: number, metadata?: Record<string, string> }`
2. **Validation**:
   - `grandTotal` must be positive integer (sanity check only — **never used for charge amount**)
   - `metadata` required and object
3. **Session read** — guards: empty basket → 400; missing `shippingCost` → 400
4. **Authoritative total re-derivation** from live Sanity data:
   - Fetches `price_data.unit_amount` via `getBackendClient()`
   - Product mismatch → 400; invalid price → 400
   - `computedGrandTotal = Math.round(subtotal + shippingCost)`
5. **Metadata enrichment**:
   - Client metadata + session data (`basket` as compact `productId:qty` string, `address` as lean JSON stripped of Google Places enrichment, `shippingCode`, `shippingCost`, `shippingMethodName`, `shippingCarrier`, `shippingEstimatedDays`, `email`, `checkoutSessionId`, `vat`)
   - Oversize guard: rejects if any metadata value > 500 chars
6. **Stripe PaymentIntent**:
   - Idempotency key: `session.checkoutSessionId` (M-03: rejects if missing)
   - If `session.paymentIntentId` exists → `update` (amount + metadata); on failure clears ID and falls back to `create`
   - Else → `create` with `{ amount: computedGrandTotal, currency: 'pln', automatic_payment_methods: { enabled: true }, metadata: enrichedMetadata }`
7. **Response** — `{ clientSecret }` or 500 if missing
8. **Session save** — persists `paymentIntentId`; warns if cookie size > 3000 bytes

### Layer 4 — Secure Service Infrastructure

**`lib/stripe.ts`** (19 lines)

- Initializes `Stripe` with `STRIPE_SECRET_KEY`
- **API version:** `'2026-05-27.dahlia'`
- Exports `stripe` instance + `retrievePaymentIntent(id)` helper (expands `latest_charge`)

**`lib/session.ts`** (48 lines)

- `CheckoutSession` interface: `basket`, `address`, `email`, `shippingCode`, `shippingCost`, `shippingMethodName`, `shippingCarrier`, `shippingEstimatedDays`, `paymentIntentId`, `completedPaymentIntentId`, `lastPaymentIntentId`, `checkoutSessionId`
- `getCheckoutSession()` — iron-session with `cookieName: "checkout_session"`, `secure` in prod, `httpOnly`, `sameSite: "lax"`, `maxAge: 3600`

**`lib/checkout/createOrderFromPaymentIntent.ts`** (188 lines)

- Idempotency guard (queries Sanity by PI ID)
- Extracts metadata (`basket`, `address`, shipping, email, etc.)
- Builds order items, shipping method/address
- Computes pricing (`subtotal, shipping, tax: 0, total: pi.amount`)
- Generates `orderNumber = ORD-{year}-{count+1}` and `orderId`
- Creates order in Sanity via `backendClient.create()`
- Decrements stock via `backendClient.patch().dec().commit()`
- Logging at every step

---

## 4. Tests (Active)

| File | Lines | Tests |
|------|-------|-------|
| `tests/checkout/payment/payment-form.test.tsx` | 114 | 7 tests: skeleton, Elements render, API error, payload shape, Klarna messaging, retry success (2nd attempt), retry exhausted (3rd attempt) |
| `tests/checkout/payment/order-summary.test.tsx` | 219 | 10 tests: PLN format, deduped shipping label, carrier-only label, missing label fallback, product name fallback, shipping address, VAT line, delivery estimate, Open Box badge, product image |
| `tests/checkout/integration/payment-intent-session.test.ts` | 246 | 9 tests: create PI, reject non-integer grandTotal, reject negative, reject empty basket, reject missing shipping, reject product mismatch, update existing PI, fallback create on update failure, reject missing checkoutSessionId |

---

## 5. Data Flow: Authoritative Total

```
Client (PaymentForm)                    Server (Route Handler)
─────────────────────────────────────────────────────────────────
POST { grandTotal, metadata }
        →
                                        1. Validate body
                                        2. Read iron-session
                                        3. Re-derive total from Sanity:
                                           Σ(price × qty) + shippingCost
                                        4. Create/update Stripe PI
                                        5. Save session.paymentIntentId
                                        6. Return { clientSecret }
        ←
Receives clientSecret → renders Elements
User clicks Pay → stripe.confirmPayment()
        → redirect to /api/checkout/return
```

**Security note**: Client `grandTotal` is ignored for charge calculation. Server computes amount from live Sanity data.

---

## 6. Session State Lifecycle (Return Handler)

| PI Status | `paymentIntentId` | `basket` | `address` | `shippingCost` | Action |
|-----------|------------------|----------|-----------|----------------|--------|
| `succeeded` | cleared | cleared | cleared | cleared | Create order, redirect success |
| `requires_payment_method` | cleared | kept | kept | kept | Redirect failed status |
| `canceled` | cleared | kept | kept | kept | Redirect canceled status |
| `processing` | kept | kept | kept | kept | Redirect processing status |
| unknown | cleared | kept | kept | kept | Redirect basket error |

`completedPaymentIntentId` is set on ALL paths (success page privacy guard).

---

## 7. Key Architecture Alignment

- **4-Layer Architecture**: ✓ All 4 layers present and correctly assigned
- **Vertical Slicing**: ✓ Payment slice is complete across all layers
- **Session Cascade Validation**: ✓ 5 guards enforce basket → address → shipping prerequisites
- **iron-session**: ✓ Encrypted HTTP-only cookie, 4KB max, no client-side sensitive state
- **Stripe Payment Intents**: ✓ `automatic_payment_methods: { enabled: true }`, PLN currency
- **Idempotency**: ✓ `checkoutSessionId` as Stripe idempotency key; order creation skips duplicates
- **Funnel Guards**: ✓ Server-side only; no client bypass possible
- **Audit Logging**: ✓ `logCheckoutEvent` + dev-only `console.log` blocks at every step

---

## 8. Changes Since 2026-06-09 Synopsis

No functional changes. Line counts increased slightly due to dev-only live audit `console.log` blocks (FIX #1–#16 verification) in `page.tsx` and `PaymentForm.client.tsx`. All behavior, guards, and data flows remain identical to the 2026-06-09 state.
