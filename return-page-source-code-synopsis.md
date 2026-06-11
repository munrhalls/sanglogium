# Return Page — Source Code Synopsis

## Scope
Everything that handles the post-payment redirect from Stripe, verifies payment status, creates orders, and renders the result. 14 files, ~1,903 lines total.

---

## 1. Stripe Return Handler — `app/api/checkout/return/route.ts` (155 lines)

**Entry point**: Stripe redirects `GET` here after `confirmPayment` (`return_url = ${origin}/api/checkout/return`).

**What it does:**
1. **Extracts** `payment_intent` from query params.
2. **Guards** — redirects to `/basket?error=missing_intent` if param missing.
3. **Intent ownership guard** (M-1) — redirects to `/basket?error=no_active_intent` if session has no `paymentIntentId` or `completedPaymentIntentId`. Redirects to `/basket?error=intent_mismatch` if session `paymentIntentId` differs from URL param.
4. **Retrieves** the Payment Intent from Stripe (`retrievePaymentIntent` with `expand: ['latest_charge']`).
5. **On retrieve failure** — sets `session.lastPaymentIntentId = payment_intent`, saves session, redirects to `/checkout/success?payment_intent=...&error=verification_failed`.
6. **Sets** `session.lastPaymentIntentId = pi.id` for ALL statuses.
7. **Session lifecycle** by PI status:
   - `succeeded` → sets `session.completedPaymentIntentId = pi.id`, clears `paymentIntentId`, `basket`, `address`, `shippingCode`, `shippingCost`, `shippingMethodName`, `shippingCarrier`, `shippingEstimatedDays`.
   - `requires_payment_method` → clears `paymentIntentId` only (keeps basket/address/shipping for retry).
   - `canceled` → clears `paymentIntentId` only (keeps basket/address/shipping for retry).
   - `processing` → keeps everything (async confirmation may still resolve).
   - `default` → clears `paymentIntentId`, redirects to `/basket?error=unexpected_status`.
8. **Captures** session data before clearing (for synchronous order creation on succeeded path).
9. **Saves** session, then on `succeeded` calls `createOrderFromPaymentIntent(pi, capturedSessionData)` wrapped in try/catch (non-fatal).
10. **Redirects** to `/checkout/success?payment_intent=...` (with optional `&status=failed|canceled|processing`).

**Logging**: Full `logCheckoutEvent` coverage at every step with `traceId` from `session.checkoutSessionId`.

---

## 2. Success Page — `app/checkout/success/page.tsx` (338 lines)

**Server Component** at `/checkout/success`.

**What it does:**
1. **Privacy guard** — reads `payment_intent` from `searchParams`; redirects to `/basket` if missing.
2. **Session gate + Sanity fallback** (H-04):
   - Checks `session.completedPaymentIntentId === payment_intent` OR `session.lastPaymentIntentId === payment_intent`.
   - If no session claim, queries Sanity for order by `paymentIntentId`. If no order found → redirects to `/basket`.
3. **`error=verification_failed` branch** — renders recoverable error UI with payment reference and support links.
4. **Server-side PI re-verification** — calls `retrievePaymentIntent` in try/catch. On Stripe API failure, renders same recoverable error UI (never throws on paid users).
5. **Status branches**:
   - **`succeeded`** → confirmation header (amount, payment method hint from `latest_charge.payment_method_details`), `<SuccessAnalytics />` (gtag purchase event), order details in `<Suspense>` with skeleton, order timeline, "Continue shopping" / "View my orders" links, support card.
   - **`requires_payment_method`** → decline message with `last_payment_error.message` if available. "Try again" + "Return to basket".
   - **`canceled`** → "Payment was canceled" with retry options.
   - **`processing`** → "Payment is processing" with refresh button.
   - **Unexpected** → fallback support reference UI.

**Payment method detection** (M-02): Reads `latest_charge.payment_method_details.type` (not `payment_method_types[0]`). Detects BLIK, P24, PayPal, Klarna, Link, card wallets (Apple Pay, Google Pay), and raw card brand+last4.

---

## 3. Order Details — `app/checkout/success/OrderDetails.tsx` (171 lines)

**Async Server Component** fetched inside `<Suspense>` on success page.

**What it does:**
1. Calls `fetchOrderByPaymentIntentId(paymentIntentId)` against Sanity.
2. **If order not yet created** (webhook race) → renders fallback "Generating your order receipt…" with `fallbackTotal` and `<RefreshButton />`.
3. **If order exists** → renders:
   - Order number + date + confirmation email
   - Item list (name, quantity, unit price, line total)
   - Pricing breakdown (subtotal, shipping with carrier/ETA, estimated delivery date range, discount, tax, total)
   - Shipping address card
   - Guest upsell CTA (`/sign-up?email=...`) or "View my orders" link

---

## 4. Refresh Button — `app/checkout/success/RefreshButton.tsx` (27 lines)

**Client Component** (`"use client"`).

Calls `router.refresh()` on click. Prevents double-clicks with `isRefreshing` state. Used in processing state and order-not-yet-created fallback.

---

## 5. Success Analytics — `app/checkout/success/SuccessAnalytics.client.tsx` (30 lines)

**Client Component** (`"use client"`).

Fires `gtag('event', 'purchase', {...})` once on mount via `useEffect` + `useRef` guard. Sends `transaction_id`, `value` (cents/100), `currency: 'PLN'`. Returns `null` (no DOM output).

---

## 6. Order Creator — `lib/checkout/createOrderFromPaymentIntent.ts` (344 lines)

**Pure async function** called by return handler (synchronously before redirect) and by Stripe webhook handler.

**What it does:**
1. **Resolves order data** from session data (preferred) or PI metadata (fallback). Supports compact basket format (`productId:quantity,...`) and legacy JSON.
2. **Idempotency check** — queries Sanity for existing order by `paymentIntentId`; skips if found.
3. **Validates** email with Zod.
4. **Fetches** product names/prices from Sanity for basket items.
5. **Builds** order items with `returnStatus: 'none'`.
6. **Builds** `shippingMethod` object from metadata fields.
7. **Maps** address to `shippingAddress` shape (`name`, `line1`, `city`, `state`, `postalCode`, `country`).
8. **Computes** pricing: `subtotal` from items, `shipping` from metadata, `total = pi.amount`, `tax` from metadata VAT or recalculated at 23%, `currency = pi.currency`.
9. **Extracts** payment method details from `latest_charge` (type, card brand/last4).
10. **Generates** `orderNumber` (`ORD-{YEAR}-{PI_SUFFIX}` where suffix is last 6 chars of PI ID) and `orderId` (`order_${uuidv4}`).
11. **Creates** order document in Sanity via `backendClient.create()` with status `'processing'`.
12. **Sends** order confirmation email via `sendOrderConfirmationEmail` (non-fatal if fails).
13. **Decrements stock** with concurrency guard (C-03): pre-checks sufficient stock, patches `.dec({ stock: qty })`, post-checks no negative stock. Logs errors but does not roll back order.

**All steps are logged** via `logCheckoutEvent` with `traceId`.

---

## 7. Stripe SDK Wrapper — `lib/stripe.ts` (19 lines)

- Instantiates `Stripe` with `STRIPE_SECRET_KEY` and API version `2026-05-27.dahlia`.
- `retrievePaymentIntent(id)` calls `stripe.paymentIntents.retrieve(id, { expand: ['latest_charge'] })`.

---

## 8. Session Management — `lib/session.ts` (48 lines)

- `CheckoutSession` interface: `basket`, `address` (with optional `geocode` and `placeId`), `email`, `shippingCode`, `shippingCost`, `shippingMethodName`, `shippingCarrier`, `shippingEstimatedDays`, `paymentIntentId`, `completedPaymentIntentId`, `lastPaymentIntentId`, `checkoutSessionId`.
- `getCheckoutSession()` returns iron-session cookie (`checkout_session`, 1-hour TTL, `httpOnly`, `secure` in prod, `sameSite: "lax"`).

---

## 9. Order Query — `sanity-cms/lib/orders/getOrderByPaymentIntentId.ts` (62 lines)

- `fetchOrderByPaymentIntentId(paymentIntentId)` queries Sanity `backendClient` for order document where `_type == "order" && paymentIntentId == $paymentIntentId`.
- Returns typed `OrderForSuccessPage` (orderNumber, items, pricing, shippingAddress, shippingMethod, dates, customerEmail, isGuest, status).

---

## 10. Order Types — `sanity-cms/lib/orders/orderTypes.ts` (141 lines)

Canonical TypeScript interfaces for orders: `OrderItem`, `ShippingAddress`, `BillingAddress`, `ShippingMethod`, `OrderPricing`, `PaymentInfo`, `OrderMetadata`, `CreateOrderOptions`, `Order`, `CreateOrderResult`, `CreateOrderError`.

---

## 11. Email Service — `lib/email.ts` (132 lines, relevant: `sendOrderConfirmationEmail`)

- Uses Resend SDK (falls back to console.log in dev if `RESEND_API_KEY` missing).
- `sendOrderConfirmationEmail({ to, orderNumber, items, total, shippingAddress })` sends HTML email with order table, total, and shipping address.

---

## 12. Event Logger — `lib/dev/event-logger.ts` (79 lines)

- `logCheckoutEvent` / `logEvent`: console-only, gated by `LOG_LEVEL` env var.
- Slices: `basket-address`, `address-submit`, `payment-init`, `payment-submit`, `webhook`, `order-create`, `success-page`.
- `generateCheckoutSessionId()` / `generateTraceId()`: `chk_` / `tr_` prefixed IDs with timestamp + random suffix.

---

## 13. Stripe Webhook — `app/api/webhooks/stripe/route.ts` (91 lines)

**Entry point**: Stripe POSTs webhook events to `/api/webhooks/stripe`.

**What it does:**
1. **Signature verification** — reads raw body, verifies `stripe-signature` header against `STRIPE_WEBHOOK_SECRET`.
2. **`payment_intent.succeeded`** → calls `createOrderFromPaymentIntent(pi)` (without session data — metadata fallback path). Returns 500 on error so Stripe retries.
3. **`payment_intent.payment_failed`** / **`payment_intent.canceled`** → logs failure reason, returns 200.
4. **All other events** → returns 200 (acknowledged).

---

## Data Flow

```
PaymentForm.client.tsx
  └─ stripe.confirmPayment({ return_url: `${origin}/api/checkout/return` })
        └─ Stripe redirects ──► GET /api/checkout/return?payment_intent=pi_xxx
                                  ├─ retrievePaymentIntent(pi_xxx)
                                  ├─ createOrderFromPaymentIntent(pi, sessionData) [on succeeded, sync before redirect]
                                  ├─ update session (clear basket/address on success, keep on failure)
                                  └─ redirect ──► /checkout/success?payment_intent=pi_xxx
                                                        └─ SuccessPage
                                                              ├─ privacy guard (payment_intent param required)
                                                              ├─ session gate (completedPaymentIntentId or lastPaymentIntentId match)
                                                              ├─ sanity fallback (query order by PI if no session claim)
                                                              ├─ retrievePaymentIntent(pi_xxx) [re-verify, never throw]
                                                              ├─ render status branch
                                                              ├─ <SuccessAnalytics /> [on succeeded]
                                                              └─ <OrderDetails /> [Suspense]
                                                                    └─ fetchOrderByPaymentIntentId(pi_xxx)

Stripe Webhook (async, authoritative)
  └─ POST /api/webhooks/stripe
        └─ payment_intent.succeeded
              └─ createOrderFromPaymentIntent(pi) [metadata fallback, idempotent]
```

---

## Key Design Patterns

- **Double verification**: Return handler verifies PI once; success page re-verifies server-side (defense in depth).
- **Dual gate** (H-04): Session gate (`completedPaymentIntentId` / `lastPaymentIntentId`) PLUS Sanity order fallback. Prevents URL-guessing and supports cross-device scenarios.
- **Idempotent order creation**: `createOrderFromPaymentIntent` skips if order already exists (handles race between return handler and webhook).
- **Never throw on paid users**: success page try/catch on `retrievePaymentIntent` renders support UI instead of 500.
- **Synchronous + asynchronous order creation**: Return handler creates order before redirect; webhook is authoritative fallback.
- **Session data preferred over metadata**: `resolveOrderData` uses session data if available (avoids metadata parsing), falls back to PI metadata for webhook path.
- **Stock decrement with guard**: Pre-check stock, patch decrement, post-check negative stock. Errors logged but order stands (flagged for manual review).
- **Compact metadata format**: Basket stored as `productId:quantity,...` in PI metadata (with 450-char safety limit) to fit Stripe metadata constraints.
