# Return Page — Exact Code Status Report

## 1. Entry Point: `app/api/checkout/return/route.ts`

Stripe redirects here after payment submission. `GET` handler only.

### What it does (step-by-step):
1. **Extracts** `payment_intent` from query params.
2. **Logs** `return_handler_start` via `logCheckoutEvent`.
3. **Missing intent guard**: If no `payment_intent`, logs error and redirects to `/basket?error=missing_intent`.
4. **Retrieves PI from Stripe** via `retrievePaymentIntent(payment_intent)` with `expand: ['latest_charge']`.
   - If retrieve fails → logs error, redirects to `/checkout/success?payment_intent=…&error=verification_failed`.
5. **Sets** `session.completedPaymentIntentId = pi.id` — **always**, regardless of status.
6. **Session lifecycle** per PI status:

| PI Status | Session Action | Redirect Target |
|-----------|---------------|-----------------|
| `succeeded` | Clears `paymentIntentId`, `basket`, `address`, `shippingCode`, `shippingCost`. Then **synchronously creates order** via `createOrderFromPaymentIntent(pi)`. If order creation fails, logs error but still redirects (webhook is fallback). | `/checkout/success?payment_intent={pi.id}` |
| `requires_payment_method` | Clears only `paymentIntentId`. Keeps basket, address, shipping. | `/checkout/success?payment_intent={pi.id}&status=failed` |
| `canceled` | Clears only `paymentIntentId`. Keeps basket, address, shipping. | `/checkout/success?payment_intent={pi.id}&status=canceled` |
| `processing` | **Keeps everything** — async confirmation may still resolve. | `/checkout/success?payment_intent={pi.id}&status=processing` |
| default/unknown | Clears `paymentIntentId`, keeps rest. Redirects to `/basket?error=unexpected_status`. | `/basket?error=unexpected_status` |

7. **Saves session** via `session.save()`.
8. **Logs** `return_handler_redirect` and calls `redirect(target)`.

**Key behavior**: Order creation happens **synchronously on success** so the success page can show it immediately. Failure is non-blocking — webhook retries as fallback.

---

## 2. Success Page: `app/checkout/success/page.tsx`

Server Component. Receives `payment_intent` and optional `error`/`status` query params.

### What it does (step-by-step):
1. **Privacy guard — FIRST**: If no `payment_intent`, redirect to `/basket`.
2. **Session match guard**: If `session.completedPaymentIntentId !== payment_intent`, redirect to `/basket`.
3. **Verification-failed branch** (`error === 'verification_failed'`): Renders recoverable error UI with payment reference, "Return to basket" and "Contact support" buttons.
4. **Stripe API down branch**: If `retrievePaymentIntent` throws, renders **identical** recoverable error UI (same as verification-failed).
5. **Succeeded branch** (`pi.status === 'succeeded'`):
   - Formats amount as PLN via `toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })`.
   - Derives payment method hint from `pi.payment_method_types[0]` and `latest_charge.payment_method_details.card`:
     - `blik` → "BLIK"
     - `p24` → "Przelewy24"
     - `paypal` → "PayPal"
     - `klarna` → "Klarna"
     - `link` → "Link"
     - `card` → checks `wallet.type` for Apple Pay / Google Pay, else `{brand} ····{last4}`, else "Card"
   - Renders: green CheckCircle icon, "Payment confirmed", amount, method hint, "Secured by Stripe" lock badge.
   - Renders `<OrderDetails paymentIntentId={payment_intent} fallbackTotal={pi.amount} />` inside `<Suspense fallback={<OrderDetailsSkeleton />}>`.
   - Sidebar: "What happens next" timeline (confirmed → processing → shipped → delivered), "Continue shopping" button, "Need help?" email support card.
6. **Failed branch** (`pi.status === 'requires_payment_method'`): Renders decline message (from `last_payment_error.message` or fallback), "Try again" → `/checkout/payment`, "Return to basket".
7. **Canceled branch** (`pi.status === 'canceled'`): Renders "Payment was canceled", same CTAs as failed.
8. **Processing branch** (`pi.status === 'processing'`): Renders clock icon, "Payment is processing", explanation, PI reference code, `<RefreshButton />`.
9. **Unexpected status safety net**: Renders generic error with PI reference and "Return to basket".

---

## 3. Order Details: `app/checkout/success/OrderDetails.tsx`

Server Component. Fetches order from Sanity by `paymentIntentId`.

### What it does:
- Calls `fetchOrderByPaymentIntentId(paymentIntentId)`.
- **If no order yet**: Renders fallback card with Hourglass icon, "Generating your order receipt…", fallback total in PLN, and `<RefreshButton />`.
- **If order found**: Renders full receipt:
  - Order number (monospace, brand color)
  - Date, customer email
  - Items list: name, quantity, unit price, line subtotal
  - Pricing breakdown: subtotal, shipping (with carrier + estimated days), discount (if > 0), tax (if > 0), total
  - Shipping address block
  - **Guest CTA**: "Create an account to track your order" → `/sign-up?email={encoded}`
  - **Logged-in CTA**: "View my orders" → `/account/orders`

Helper: `formatPLN(cents)` → `(cents / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })`.

---

## 4. Refresh Button: `app/checkout/success/RefreshButton.tsx`

Client Component (`'use client'`).

- Uses `useRouter()`.
- `handleRefresh`: sets `isRefreshing = true`, calls `router.refresh()`, sets `isRefreshing = false`.
- Button label toggles between "Refresh" and "Refreshing…".
- Disabled while refreshing.

---

## 5. Order Creation: `lib/checkout/createOrderFromPaymentIntent.ts`

### What it does (step-by-step):
1. **Idempotency check**: Queries Sanity for existing order with same `paymentIntentId`. If found, logs and returns early.
2. **Reads metadata from PI**: `basket`, `address`, `shippingCode`, `shippingCost`, `shippingMethodName`, `shippingCarrier`, `shippingEstimatedDays`, `email`.
3. **Parses JSON** `basket` and `address`. Throws if empty basket or parse fails.
4. **Fetches product names/prices from Sanity** via `backendClient.fetch` using `*[_type == "product" && _id in $ids]`.
5. **Builds order items** directly from basket with live Sanity prices.
6. **Builds shippingMethod** from metadata.
7. **Maps address** to `shippingAddress` shape: `{ name, line1, city, state, postalCode, country }`.
8. **Computes pricing**: subtotal from items, shipping from metadata, total = `pi.amount`, currency = `pi.currency.toUpperCase()`.
9. **Extracts payment method details**: `payment_method_types[0]`, card brand/last4 from `latest_charge`.
10. **Generates identifiers**:
    - `orderNumber`: `ORD-{year}-{count+1, 4 digits}`
    - `orderId`: `order_{timestamp}_{random}`
11. **Creates order document in Sanity** via `backendClient.create()`.
12. **Decrements stock** for each basket item via `backendClient.patch(productId).dec({ stock: quantity }).commit()`.
13. Logs every step via `logCheckoutEvent`.

**Guest hardcoded**: `isGuest: true` (no auth system integration yet).

---

## 6. Supporting Infrastructure

### `lib/stripe.ts`
- Exports `stripe` client instance with API version `2025-10-29.clover`.
- `retrievePaymentIntent(id)` calls `stripe.paymentIntents.retrieve(id, { expand: ['latest_charge'] })`.

### `lib/session.ts`
- `getCheckoutSession()` returns iron-session with cookie `checkout_session`, maxAge 1 hour, httpOnly, lax, secure in production.
- Session shape: `basket`, `address`, `email`, `shippingCode`, `shippingCost`, `shippingMethodName`, `shippingCarrier`, `shippingEstimatedDays`, `paymentIntentId`, `completedPaymentIntentId`, `checkoutSessionId`.

### `lib/dev/event-logger.ts`
- Console-only logging gated by `LOG_LEVEL` env var (default `warn`).
- `logCheckoutEvent` wraps `logEvent` with checkout-specific slice names.

### `sanity-cms/lib/orders/getOrderByPaymentIntentId.ts`
- `fetchOrderByPaymentIntentId` queries Sanity read-client (CDN-enabled, no token) for order by `paymentIntentId`.
- Returns `OrderForSuccessPage` or `null`.

### `app/api/webhooks/stripe/route.ts`
- Stripe webhook handler (`POST`).
- Verifies signature via `stripe.webhooks.constructEvent`.
- On `payment_intent.succeeded`: calls `createOrderFromPaymentIntent(pi)` — **same function** as return handler.
- On `payment_intent.payment_failed`: logs failure.
- Returns 500 on order processing error so Stripe retries.
- This is the **fallback** if return-handler order creation fails or webhook fires first.

### `app/checkout/payment/PaymentForm.client.tsx`
- Client component for Stripe Payment Element.
- `stripe.confirmPayment` uses `return_url: ${window.location.origin}/api/checkout/return`.
- ExpressCheckoutElement also uses same `return_url`.
- This is the **trigger** that sends the user to the return handler.

### `middleware.ts`
- **No checkout-specific logic**. Only `/account/*` auth protection. Checkout routes are unguarded by middleware.

---

## 7. Data Flow Summary

```
[PaymentForm.client.tsx]
  stripe.confirmPayment({ return_url: /api/checkout/return })
            ↓
[Stripe handles payment]
            ↓
[app/api/checkout/return/route.ts]  ← GET
  • Verify PI status with Stripe
  • Mutate session (clear per status)
  • If succeeded: createOrderFromPaymentIntent(pi)
  • Save session
  • redirect(/checkout/success?payment_intent=…&status=…)
            ↓
[app/checkout/success/page.tsx]  ← Server Component
  • Privacy guards (payment_intent + session match)
  • Verify PI status again server-side
  • Render branch based on status:
    - succeeded → OrderDetails + confirmation UI
    - failed/canceled → error + retry CTAs
    - processing → wait + refresh
  • OrderDetails fetches from Sanity (may be null initially)
            ↓
[Sanity] order document created + stock decremented

Fallback path (webhook):
[Stripe webhook] → [app/api/webhooks/stripe/route.ts]
  → createOrderFromPaymentIntent(pi) → [Sanity]
```

---

## 8. Key Design Decisions

- **Double verification**: Return handler verifies PI, then success page verifies again server-side.
- **Session privacy guard**: Success page checks `session.completedPaymentIntentId` before any Stripe call — prevents URL-guessing attacks.
- **Synchronous order creation in return handler** for immediate UX. Webhook is fallback for reliability.
- **Stock decrement happens at order creation time**, not at payment intent creation.
- **Guest-only orders**: `isGuest: true` hardcoded. No auth-linked order history.
- **No persistent event log**: `event-logger.ts` is console-only, gated by `LOG_LEVEL`.
