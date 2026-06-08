# Return Page — Source Code Synopsis

## Scope
Everything that handles the post-payment redirect from Stripe, verifies payment status, creates orders, and renders the result. 7 files, ~889 lines total.

---

## 1. Stripe Return Handler — `app/api/checkout/return/route.ts` (129 lines)

**Entry point**: Stripe redirects `POST/GET` here after `confirmPayment` (return_url = `/api/checkout/return`).

**What it does:**
1. **Extracts** `payment_intent` from query params.
2. **Guards** — redirects to `/basket` if missing or if session `paymentIntentId` mismatches the URL param.
3. **Retrieves** the Payment Intent from Stripe (`retrievePaymentIntent`).
4. **Sets** `session.completedPaymentIntentId = pi.id` unconditionally.
5. **Session lifecycle** by PI status:
   - `succeeded` → clears `paymentIntentId`, `basket`, `address`, `shippingCode`, `shippingCost`; calls `createOrderFromPaymentIntent(pi)` synchronously.
   - `requires_payment_method` → clears `paymentIntentId` only (keeps basket/address/shipping for retry).
   - `canceled` → clears `paymentIntentId` only (keeps basket/address/shipping for retry).
   - `processing` → keeps everything (async confirmation may still resolve).
   - `default` → clears `paymentIntentId`, redirects to `/basket?error=unexpected_status`.
6. **Saves** session, then redirects to `/checkout/success?payment_intent=...` (with optional `&status=failed|canceled|processing`).

**Error handling on retrieve failure**: Sets `completedPaymentIntentId`, saves session, redirects to `/checkout/success?payment_intent=...&error=verification_failed`.

**Logging**: Full `logCheckoutEvent` coverage at every step.

---

## 2. Success Page — `app/checkout/success/page.tsx` (313 lines)

**Server Component** at `/checkout/success`.

**What it does:**
1. **Privacy guard** — reads `payment_intent` from `searchParams`; redirects to `/basket` if missing.
2. **Session guard** — redirects to `/basket` if `session.completedPaymentIntentId !== payment_intent`.
3. **`error=verification_failed` branch** — renders a recoverable error UI with payment reference and support links.
4. **Server-side PI re-verification** — calls `retrievePaymentIntent` in try/catch. If Stripe API fails, renders the same recoverable error UI (never throws on paid users).
5. **Status branches** (all render within `max-w-xl mx-auto`):
   - **`succeeded`** → shows confirmation header (amount, payment method hint), order details (wrapped in `<Suspense>` with skeleton), order timeline, "Continue shopping" link, support card. Payment method hint detects BLIK, P24, PayPal, Klarna, Link, card wallets (Apple Pay, Google Pay), and raw card brand+last4.
   - **`requires_payment_method`** → decline message with "Try again" + "Return to basket".
   - **`canceled`** → "Payment was canceled" with retry options.
   - **`processing`** → "Payment is processing" with refresh button.
   - **Unexpected** → fallback support reference UI.

**Payment method detection**: Reads `pi.payment_method_types[0]` and `pi.latest_charge.payment_method_details.card`.

---

## 3. Order Details — `app/checkout/success/OrderDetails.tsx` (152 lines)

**Async Server Component** fetched inside `<Suspense>` on success page.

**What it does:**
1. Calls `fetchOrderByPaymentIntentId(paymentIntentId)` against Sanity.
2. **If order not yet created** → renders fallback "Generating your order receipt…" with `fallbackTotal` and a `<RefreshButton />`.
3. **If order exists** → renders:
   - Order number + date + confirmation email
   - Item list (name, quantity, unit price, line total)
   - Pricing breakdown (subtotal, shipping with carrier/ETA, discount, tax, total)
   - Shipping address card
   - Guest upsell CTA (`/sign-up?email=...`) or "View my orders" link

---

## 4. Refresh Button — `app/checkout/success/RefreshButton.tsx` (27 lines)

**Client Component** (`"use client"`).

Calls `router.refresh()` on click. Prevents double-clicks with `isRefreshing` state. Used in processing state and order-not-yet-created fallback.

---

## 5. Order Creator — `lib/checkout/createOrderFromPaymentIntent.ts` (188 lines)

**Pure function** called synchronously by the return handler on `succeeded`.

**What it does:**
1. **Idempotency check** — queries Sanity for existing order by `paymentIntentId`; skips if found.
2. **Parses** `basket` and `address` from PI metadata (JSON strings).
3. **Validates** basket is non-empty array.
4. **Fetches** product names/prices from Sanity for basket items.
5. **Builds** `shippingMethod` object from metadata fields.
6. **Maps** address to `shippingAddress` shape.
7. **Computes** pricing: `subtotal` from items, `shipping` from metadata, `total = pi.amount`, `currency = pi.currency`.
8. **Extracts** payment method details (type, card brand/last4 from `latest_charge`).
9. **Generates** `orderNumber` (`ORD-{YEAR}-{SEQUENCE}`) and `orderId` (`order_${timestamp}_${random}`).
10. **Creates** order document in Sanity via `backendClient.create()`.
11. **Decrements stock** for each basket item via `backendClient.patch().dec().commit()`.

**All steps are logged** via `logCheckoutEvent`.

---

## 6. Stripe SDK Wrapper — `lib/stripe.ts` (18 lines)

- Instantiates `Stripe` with `STRIPE_SECRET_KEY` and API version `2025-10-29.clover`.
- `retrievePaymentIntent(id)` calls `stripe.paymentIntents.retrieve(id, { expand: ['latest_charge'] })`.

---

## 7. Session Management — `lib/session.ts` (47 lines)

- `CheckoutSession` interface: `basket`, `address`, `email`, `shippingCode`, `shippingCost`, `shippingMethodName`, `shippingCarrier`, `shippingEstimatedDays`, `paymentIntentId`, `completedPaymentIntentId`, `checkoutSessionId`.
- `getCheckoutSession()` returns iron-session cookie (`checkout_session`, 1-hour TTL, `httpOnly`, `secure` in prod, `sameSite: "lax"`).

---

## 8. Order Query — `sanity-cms/lib/orders/getOrderByPaymentIntentId.ts` (62 lines)

- `fetchOrderByPaymentIntentId(paymentIntentId)` queries Sanity for order document where `paymentIntentId == $paymentIntentId`.
- Returns typed `OrderForSuccessPage` (orderNumber, items, pricing, shippingAddress, shippingMethod, dates, customerEmail, isGuest).

---

## 9. Order Types — `sanity-cms/lib/orders/orderTypes.ts` (141 lines)

Canonical TypeScript interfaces for orders: `OrderItem`, `ShippingAddress`, `BillingAddress`, `ShippingMethod`, `OrderPricing`, `PaymentInfo`, `OrderMetadata`, `CreateOrderOptions`, `Order`, `CreateOrderResult`, `CreateOrderError`.

---

## Data Flow

```
PaymentForm.client.tsx
  └─ stripe.confirmPayment({ return_url: '/api/checkout/return' })
        └─ Stripe redirects ──► GET /api/checkout/return?payment_intent=pi_xxx
                                  ├─ retrievePaymentIntent(pi_xxx)
                                  ├─ createOrderFromPaymentIntent(pi) [on succeeded]
                                  ├─ update session (clear basket/address on success)
                                  └─ redirect ──► /checkout/success?payment_intent=pi_xxx
                                                        └─ SuccessPage
                                                              ├─ privacy/session guards
                                                              ├─ retrievePaymentIntent(pi_xxx) [re-verify]
                                                              ├─ render status branch
                                                              └─ <OrderDetails /> [Suspense]
                                                                    └─ fetchOrderByPaymentIntentId(pi_xxx)
```

---

## Key Design Patterns

- **Double verification**: Return handler verifies PI once; success page re-verifies server-side (defense in depth).
- **Session as gate**: `completedPaymentIntentId` must match URL param — prevents URL-guessing.
- **Idempotent order creation**: `createOrderFromPaymentIntent` skips if order already exists.
- **Never throw on paid users**: success page try/catch on `retrievePaymentIntent` renders support UI instead of 500.
- **Synchronous order creation**: Return handler creates order before redirect so success page can display it immediately.
- **Stock decrement** happens after order creation, per item, via Sanity patches.
