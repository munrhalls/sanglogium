# Checkout Security & Baseline Effectiveness Audit

> **Scope:** Audit-only, read-and-report. No source code under `app/`, `lib/`, `sanity-cms/`, `components/`, `middleware.ts`, `next.config.*`, or `package.json` was modified.  
> **Evidence rules applied:**
> - Non-browser security properties are evidenced with a concrete `file:line` citation plus reasoning.
> - User-observable behaviours are **not** guessed at from the code; items that need the dev server are collected in the dedicated "DEFERRED — needs live dev server" section at the end.
> **Standards used:** `docs/checkout/security-intelligence.md` and `docs/checkout/CHECKOUT-SYNOPSIS.md`.  
> **Date:** 2026-09-14.

---

## Pre-existing checkout bug cross-check

| ID | Title | Status | Evidence (file:line) |
|---|---|---|---|
| `sang-logium-nft` | [Checkout] Hardcoded iron-session fallback password | **confirmed-still-open** | `lib/session.ts:38` — `password: process.env.SESSION_SECRET || "fallback-secret-change-in-production"`. No throw/guard if `SESSION_SECRET` is missing. |
| `sang-logium-1ss` | [Checkout] Payment flow allows overselling | **confirmed-still-open** | `app/checkout/payment/page.tsx:77-81` only rejects `product.stock === 0`, never `item.quantity > product.stock`; `app/api/checkout/payment-intent-session/route.ts:47-51` fetches price only and never reads/validates stock; `lib/checkout/createOrderFromPaymentIntent.ts:299-318` pre-fetches stock in a non-atomic read-then-decrement and `322-336` only logs negative stock after the order is already created. |
| `sang-logium-q3r` | [Checkout] Order confirmation email has no recipient | **confirmed-still-open** | `app/actions/checkout/index.ts:189-194` defines `saveEmailToSession` but grep shows it is never called; `app/checkout/address/AddressForm.tsx` has no `email` input; `lib/checkout/createOrderFromPaymentIntent.ts:76` falls back to `''`; `lib/checkout/createOrderFromPaymentIntent.ts:281-291` calls `sendOrderConfirmationEmail({ to: customerEmail, ... })` with an empty catch. |
| `sang-logium-6wu` | [Checkout] Payment page uses Sanity CDN for price/stock | **confirmed-still-open** | `app/checkout/payment/page.tsx:4` imports the public `client` from `@/sanity-cms/lib/client`; `sanity-cms/lib/client.ts:8-12` sets `useCdn: true`; `app/checkout/payment/page.tsx:60-63` uses that client to fetch products/prices/stock shown to the customer. The PI route re-derives from `backendClient`, but the page UI and metadata the customer sees are CDN-backed. |
| `sang-logium-9vd` | [Checkout] GA4 purchase event sends empty items | **confirmed-still-open** | `app/checkout/success/SuccessAnalytics.client.tsx:20-25` fires `gtag("event", "purchase", { transaction_id, value, currency: "USD", items: [] })`; `app/checkout/success/page.tsx:172` still passes only `transactionId={pi.id}` and `value={pi.amount}`, so no items, tax, shipping, or order number reach the analytics component. |
| `sang-logium-v9d` | [Checkout] Production console logs leak checkout PII | **confirmed-still-open** | Several checkout pages and actions emit `console.log` / `console.error` without a `process.env.NODE_ENV !== "production"` guard: `app/checkout/address/page.tsx:11,18,19`; `app/checkout/address/AddressForm.tsx:88,97,99,110`; `app/checkout/shipping/page.tsx:14,20,31,34,45,59,60,78`; `app/actions/checkout/index.ts:41,59,60,89,99,124,129,136`. (Additional unguarded log sites discovered in this audit are listed below.) |

These six issues are **referenced, not restated as new findings**, in the step sections below.

---

## 1. Basket

### Security / baseline status

The basket lives in a Zustand store persisted to `localStorage` (`store/basketStore.ts:90-197`). It is hydrated by `BasketManager.tsx` and only copied into the encrypted `iron-session` cookie when the user clicks **Checkout** and `initCheckoutSession` runs (`app/components/features/checkout/reservation/CheckoutButton.tsx:49-59` → `app/actions/checkout/index.ts:9-31`).

**`sang-logium-1ss` (overselling) is already relevant here, but the real gap is downstream.** The basket page itself caps displayed quantity to `availableStock` on the client (`BasketManager.tsx:91-119`), but `initCheckoutSession` does not re-validate product IDs or quantities against Sanity on the server before writing `session.basket` (`app/actions/checkout/index.ts:18-19`). A malicious or stale client can therefore push arbitrary `{productId, quantity}` pairs into the encrypted session.

### New / additional findings

1. **No server-side allow-listing of product IDs at checkout hand-off.** `initCheckoutSession` writes the client-provided `items` array directly into `session.basket` (`app/actions/checkout/index.ts:18-19`) with only TypeScript shape protection; the server does not confirm the `productId`s exist or that the quantities are within live stock. This violates the OWASP allow-list principle raised in `security-intelligence.md` §4.
2. **`checkoutSessionId` / trace id is generated on the client and has low entropy.** `CheckoutButton.tsx:25-27` produces `chk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`; the same generator is duplicated in `lib/dev/event-logger.ts:74-77`. `initCheckoutSession` accepts and trusts this client value as the canonical idempotency key for Stripe (`app/actions/checkout/index.ts:13-15` → `app/api/checkout/payment-intent-session/route.ts:138`). The value is not a UUID, is predictable from the source, and is reused across the whole checkout attempt.
3. **Client-side quantity cap can be bypassed.** `BasketManager.tsx:91-119` caps `quantity` to `availableStock` for display, but `store/basketStore.ts:144-166` `setQuantity` accepts any positive integer the client passes. Because `initCheckoutSession` does not re-validate, a request crafted from a tampered store can carry quantities well above the page cap.

### DEFERRED — basket step (needs live dev server)

- Verify that adding an out-of-stock item to the basket disables the **Checkout** button and shows the correct message.
- Verify that the basket persists into `/checkout/address` after clicking **Checkout**.
- Verify that `initCheckoutSession` rejects a manually crafted request containing an unknown `productId` or quantity `> 10`.
- Verify that editing quantities on `/basket` immediately recaps to `availableStock` and updates the displayed total.

---

## 2. Address

### Existing bug status

- **`sang-logium-q3r` — confirmed still open.** `app/checkout/address/AddressForm.tsx` still has only `firstName, lastName, phone, regionCode, postalCode, street, streetNumber, city` in its form state and inputs; no `email` field is present, and `saveEmailToSession` (`app/actions/checkout/index.ts:189-194`) is still dead code.
- **`sang-logium-v9d` — confirmed still open.** The address page and form still log `session.basket`, `session.address`, and the full `addressData` payload without an environment guard: `app/checkout/address/page.tsx:18-19`, `app/checkout/address/AddressForm.tsx:88-93`.

### New / additional findings

1. **Address validation can be bypassed via the human escape hatch.** `app/checkout/address/AddressForm.tsx:259-269` renders a "Continue with entered address" button (visible after a validation error) which sets `skipValidationRef.current = true`; `app/actions/address/address.ts:70-72` then returns the raw user input as `ACCEPT`. This is a deliberate UX safety valve, but it means the funnel can complete with an unvalidated address.
2. **Server-side address input is not allow-listed / bounded.** `saveAddress` (`app/actions/checkout/index.ts:33-111`) passes the raw `Address` shape to `submitShippingAction` but does not apply its own Zod allow-list before saving to session. With `skipValidation`, any strings the client sends for `postalCode`, `street`, etc. are stored (`app/actions/checkout/index.ts:83-88`).
3. **`regionCode` is not re-validated server-side to the allowed set.** `AddressForm.tsx:48-50` sanitises `initialAddress.regionCode` against the `REGIONS` array client-side, but `submitShippingAction` does not reject a non-`PL` region submitted by a non-browser client; for non-PL it simply `acceptAsEntered()` (`app/actions/address/address.ts:79-83`).
4. **Additional unguarded PII logging in the address validator.** `app/actions/address/address.ts:31,36,46` emit `console.warn` / `console.log` containing the address street, city, and TERYT status without any `NODE_ENV` guard.
5. **`logCheckoutEvent` can leak address fragments in production logs.** `app/actions/checkout/index.ts:53` logs `address: { city, postalCode }` and `app/checkout/payment/page.tsx:25` logs `hasAddress`. The `lib/dev/event-logger.ts:35-49` logger is gated by `LOG_LEVEL` (defaults to `warn`), so **error-level** checkout events are emitted in production and include the `data` payload verbatim as JSON. This is a structured-log counterpart to the unguarded `console.log`s.

### DEFERRED — address step (needs live dev server)

- Verify that submitting the address form with an invalid Polish postcode/street/city combination is rejected, shows an error, and offers the "Continue with entered address" escape hatch.
- Verify that the escape-hatch path accepts the address and proceeds to `/checkout/shipping`.
- Verify that changing the address from the shipping page returns the user to `/checkout/address` and clears shipping.
- Verify that no email field appears in the address form.
- Verify that `console.log` statements do not run in the browser console in production (this is a build/runtime observation).

---

## 3. Shipping

### Existing bug status

- **`sang-logium-v9d` — confirmed still open.** `app/checkout/shipping/page.tsx` still logs basket IDs, product counts, package dimensions, and AlleKurier rates without a `NODE_ENV` guard at lines `14,20,31,34,45,59,60,78`.
- **`sang-logium-1ss` — confirmed still open (downstream relevance).** The shipping page does not read or validate stock; it only fetches parcel data and calls the courier API.

### New / additional findings

1. **Shipping page fetches product/parcel data through the public CDN client.** `app/checkout/shipping/page.tsx:33` calls `getProductsByIds(basketIds)`, which uses `sanityFetch` from `sanity-cms/lib/client.ts` (`sanity-cms/lib/products/getProductsByIds.ts:1-2,10-11`). `sanity-cms/lib/client.ts:8-12` has `useCdn: true`, so parcel dimensions, weight, and `reservedStock` can be stale. This is the same CDN class of issue as `sang-logium-6wu`, just on the shipping step.
2. **Package calculator has no server-side stock/quantity guard and uses unguarded `console.warn`.** `lib/shipping/parcel-calculator.ts:57-84` multiplies quantities by parcel dimensions without checking whether the quantity is realistic or within live stock, and emits `console.warn` at lines `76,88,161,173` in production.
3. **AlleKurier credentials are passed in form-data on every request.** `lib/shipping/allekurier-rates.ts:115-117` puts `User[email]` and `User[password]` into `URLSearchParams` and POSTs them to `allekurier.pl/api_v1/service_list`. This is how the API expects credentials, but the route does not have request-signature or token-level protection; it relies entirely on TLS and the environment variables being correct.
4. **Shipping selection is not CSRF-protected beyond `SameSite=Lax`.** `saveShippingAction` is a Server Action (`app/actions/checkout/index.ts:113-187`) and `ShippingPageClient.tsx:61-67` calls it from the client. There is no synchroniser token, Fetch Metadata check, or Origin verification.

### DEFERRED — shipping step (needs live dev server)

- Verify that valid Polish postcodes return at least one AlleKurier shipping option and that selecting it advances to `/checkout/payment`.
- Verify that changing the address invalidates the shipping selection and forces re-selection.
- Verify that the shipping rate displayed matches the value later shown on the payment page.
- Verify that the radio group is keyboard/screen-reader accessible and the selected option is visually highlighted.

---

## 4. Payment

### Existing bug status

- **`sang-logium-nft` — confirmed still open.** `lib/session.ts:38` still falls back to a hardcoded password for the checkout iron-session.
- **`sang-logium-1ss` — confirmed still open.** Payment page stock gate remains incomplete (`app/checkout/payment/page.tsx:77-81` only checks `stock === 0`), and the payment-intent route does not read stock (`app/api/checkout/payment-intent-session/route.ts:47-51`). The order-creation stock decrement is still non-atomic (`lib/checkout/createOrderFromPaymentIntent.ts:299-318` and `322-336`).
- **`sang-logium-6wu` — confirmed still open.** Payment page still imports and uses the public CDN client (`app/checkout/payment/page.tsx:4,60-63`; `sanity-cms/lib/client.ts:8-12`).
- **`sang-logium-q3r` — confirmed still open.** `app/checkout/payment/page.tsx:169` sets `email: session.email ?? ""` in Stripe metadata; because `session.email` is never set, `customerEmail` in order creation is `''` and the confirmation email is sent to an empty address.
- **`sang-logium-v9d` — confirmed still open.** Payment page and `PaymentForm.client.tsx` use `process.env.NODE_ENV !== 'production'` guards for their `console.log` blocks (`app/checkout/payment/page.tsx:130-132,139-161` and `app/checkout/payment/PaymentForm.client.tsx:97-106,114-116`), but the payment-intent route still logs unguarded on error at `app/api/checkout/payment-intent-session/route.ts:177` (`console.error('Error creating payment intent:', error)`).

### New / additional findings

1. **No CSRF / origin protection on the payment-intent creation route.** `app/api/checkout/payment-intent-session/route.ts:9-183` is a `POST` route that mutates the Stripe PaymentIntent and the session. It relies on the encrypted cookie (`SameSite: lax`) but does not validate `Sec-Fetch-Site`, `Origin`, or a CSRF token. This matches the gap identified in `security-intelligence.md` §3.
2. **Idempotency key is client-provided and reused, and not a UUID.** `app/api/checkout/payment-intent-session/route.ts:138` sets `idempotencyKey = session.checkoutSessionId` and reuses it on `update` and `create` (lines `142,147,152`). `session.checkoutSessionId` is the low-entropy client value from `CheckoutButton.tsx:25-27`/`lib/dev/event-logger.ts:74-77`. If the customer changes the basket or shipping after a failed payment, the same key is used with different PI parameters; Stripe will reject because the key now maps to different params.
3. **Customer billing email passed to Stripe Elements is empty.** `PaymentForm.client.tsx:353` passes `defaultValues: { billingDetails: { email: metadata.email } }`. Since `metadata.email` is empty, the Stripe form will not pre-fill a billing email and the PaymentIntent is created with `receipt_email` unset, feeding `sang-logium-q3r`.
4. **PCI DSS v4.0.1 script-attack criterion is not demonstrably met.** `next.config.ts:66-102` sets `X-Frame-Options`, `X-Content-Type-Options`, etc., but **does not set a `Content-Security-Policy` header**. `app/checkout/layout.tsx:21` loads `<GoogleAnalytics />`, and `app/components/analytics/GoogleAnalytics.tsx:14-20` injects an external `googletagmanager.com` script and an inline `gtag` initialisation `<Script>` with no `integrity` or `nonce`. Stripe Elements itself is loaded inside controlled iframes, but the merchant origin has no CSP/`strict-dynamic`/`nonce` to prevent a malicious injected script from interacting with the payment page DOM. This is the exact gap flagged in `security-intelligence.md` §1.
5. **`app/api/trace/route.ts:19` unconditionally logs client-supplied data.** The payment form POSTs trace events (e.g., `payment_submit_start`, `payment_confirm_call`) with `data` that may contain errors; the trace route does `console.log(... JSON.stringify(data))` with no `NODE_ENV` guard, meaning production can receive arbitrary client data in logs.
6. **Payment page audit log block is dev-only, but the `console.log` call at `app/checkout/payment/page.tsx:131` still prints subtotal/grandTotal.** It is wrapped in `process.env.NODE_ENV !== "production"`, so it is *not* a production leak, but it confirms the pattern of logging totals in dev.

### DEFERRED — payment step (needs live dev server)

- Verify that the payment page displays the correct order total, shipping cost, and VAT line.
- Verify that Stripe Elements (BLIK, P24, card, Apple Pay/Google Pay) render without console errors in test mode.
- Verify a test-card payment succeeds and redirects to `/checkout/success`.
- Verify a declined card shows the "Payment was declined" UI and offers "Try again".
- Verify that changing the basket quantity on a separate tab and returning to `/checkout/payment` does not display a stale total (CDN consistency check).
- Verify the `checkout_session` cookie is `Secure`, `HttpOnly`, and `SameSite=Lax` in the browser dev tools.

---

## 5. Order confirmation

### Existing bug status

- **`sang-logium-9vd` — confirmed still open.** `app/checkout/success/SuccessAnalytics.client.tsx:20-25` still fires `gtag("event", "purchase", { ... currency: "USD", items: [] })`; `app/checkout/success/page.tsx:172` still passes only `transactionId` and `value`.
- **`sang-logium-q3r` — confirmed still open (downstream effect).** `app/checkout/success/OrderDetails.tsx:44-48` conditionally renders "Confirmation sent to: …" only when `order.customerEmail` is truthy; because `customerEmail` is empty, the UI silently hides the missing email.
- **`sang-logium-1ss` — confirmed still open (downstream effect).** `lib/checkout/createOrderFromPaymentIntent.ts:299-318` and `322-336` still perform a non-atomic stock decrement and only log negative stock, so the order can be created for stock that does not exist.

### New / additional findings

1. **The webhook order-creation path uses the same non-atomic stock logic and metadata-parsed basket.** `app/api/webhooks/stripe/route.ts:18-19` calls `createOrderFromPaymentIntent(pi)` without a server session; it relies on the compact basket string in `pi.metadata.basket` (`lib/checkout/createOrderFromPaymentIntent.ts:82-108`). The parser does not validate that each `productId` exists or that `quantity` is within live stock before building the order. This extends `sang-logium-1ss` to the asynchronous path.
2. **The success page fallback can in theory show any order by PI ID.** `app/checkout/success/page.tsx:60-69` does a `fetchOrderByPaymentIntentId(payment_intent)` when the session does not have a claim. The order query is not scoped to a user because the checkout can be guest; the page then renders `OrderDetails` for whatever order is returned. This is acceptable for guest refresh but should be reviewed for order-lookup disclosure in a multi-user/guest scenario.
3. **Order confirmation GA4 event now uses `USD` instead of `PLN`.** The original bug evidence recorded `currency: "PLN"`; the current code at `app/checkout/success/SuccessAnalytics.client.tsx:23` has `currency: "USD"`. The items array is still empty, but the currency has also drifted from the store's pricing currency.
4. **The session cookie is not invalidated after checkout.** `app/api/checkout/return/route.ts:82-91` clears basket/address/shipping and sets `completedPaymentIntentId`, but `lib/session.ts` `maxAge` is 1 hour and the cookie itself is not destroyed. The same `checkoutSessionId` trace id persists, so session fixation across multiple orders is possible.

### DEFERRED — order confirmation step (needs live dev server)

- Verify the success page shows the correct order number, items, total, shipping address, and estimated delivery after a test payment.
- Verify a direct refresh of `/checkout/success?payment_intent=pi_...` still shows the order when the checkout cookie is gone.
- Verify the failed, canceled, and processing branches render the correct UI and CTAs.
- Verify the GA4 `purchase` event payload in the browser network tab / `dataLayer` includes items, tax, shipping, and uses `PLN`.
- Verify that no order-confirmation email is received when `RESEND_API_KEY` is unset (dev fallback) and that the UI does not falsely claim one was sent.

---

## Cross-cutting security baseline gaps

These issues do not belong to a single funnel step but affect the whole checkout.

### Session / cookie configuration
- **Hardcoded fallback password** — `lib/session.ts:38`.
- **No absolute-vs-idle timeout distinction; 1-hour `maxAge` is the only control** — `lib/session.ts:44`.
- **Cookie is not cleared or `checkoutSessionId` rotated on funnel transitions** — `app/api/checkout/return/route.ts:82-91` clears data but not the cookie; `CheckoutButton.tsx:25-27`/`lib/dev/event-logger.ts:74-77` show the trace id is generated once at basket and never rotated.
- **`HttpOnly`, `Secure` in prod, and `SameSite: lax` are set correctly** — `lib/session.ts:41-43`. This is the only session item that is clearly OK.

### CSRF / request integrity
- **No synchroniser token, Fetch Metadata, or Origin validation on state-changing routes** — `app/api/checkout/payment-intent-session/route.ts` and `app/api/checkout/return/route.ts`.
- **Server Actions rely on Next.js defaults and `SameSite=Lax`** — `app/actions/checkout/index.ts` (saveAddress, saveShippingAction, initCheckoutSession). No additional CSRF signal is implemented.

### Webhook security
- **Stripe webhook signature verification is implemented correctly** — `app/api/webhooks/stripe/route.ts:31-55` checks `STRIPE_WEBHOOK_SECRET`, reads `request.text()` raw, and calls `stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)`. It returns `400` on failure and `200` after successful verification.
- **Caveat:** the webhook returns `500` when `STRIPE_WEBHOOK_SECRET` is not configured instead of `400`, but this is an operational issue, not a verification gap.

### Input allow-listing
- **Product IDs are not allow-listed before being written to the checkout session or the order** — `app/actions/checkout/index.ts:18-19`, `lib/checkout/createOrderFromPaymentIntent.ts:104-108`.
- **Basket compact string parsing in `createOrderFromPaymentIntent.ts:104-108` does not anchor/validate the format beyond `rawBasket.includes(':')` and does not reject `NaN` quantities or unknown product IDs** before the order is built.

### Logging / PII
- **Unguarded `console.log/error/warn` in checkout and related actions** — listed under `sang-logium-v9d` and the additional findings above.
- **`logCheckoutEvent` / `logEvent` is a structured logger that will emit `data` payloads in production for error-level events** — `lib/dev/event-logger.ts:35-49`. Because the default `LOG_LEVEL` is `warn`, any checkout event logged with `outcome: 'error'` will print its `data` object to stdout. Several checkout pages log baskets, addresses, shipping payloads, and Stripe errors with `outcome: 'error'`.
- **The unconditional trace logger at `app/api/trace/route.ts:19` logs arbitrary client JSON** with no `NODE_ENV` or `LOG_LEVEL` guard.

### PCI / script security
- **No `Content-Security-Policy` header and no SRI/nonce for third-party scripts** — `next.config.ts:66-102` and `app/components/analytics/GoogleAnalytics.tsx:14-20`. This leaves the merchant payment origin without a documented control to satisfy PCI DSS v4.0.1 SAQ A script-attack criterion.

---

## DEFERRED — needs live dev server

The dev server at `localhost:3000` was not running and was not started. The following items can only be verified by a human running the app with **Stripe test mode only** and no real payment details.

### Basket
1. Add an in-stock product and an out-of-stock product to `/basket`; confirm the out-of-stock item is marked and checkout is disabled.
2. Change a quantity above `availableStock`; confirm it is capped and the total updates.
3. Click **Checkout** and confirm the basket arrives intact on `/checkout/address`.
4. Manually POST to `initCheckoutSession` with an unknown `productId`; confirm it is rejected.

### Address
5. Submit an invalid Polish address; confirm the error banner and the "Continue with entered address" escape hatch.
6. Use the escape hatch; confirm the raw address is saved and `/checkout/shipping` loads.
7. Confirm there is no email field in the address form.
8. Change the address after reaching shipping; confirm shipping is cleared.

### Shipping
9. Submit a valid Polish address; confirm at least one AlleKurier option appears.
10. Select a shipping option; confirm `/checkout/payment` loads and the shipping cost matches.
11. Change the address and return; confirm shipping options are recalculated.

### Payment
12. Confirm the payment page total matches the basket + shipping + VAT.
13. Confirm Stripe Elements renders (BLIK, P24, card forms, Apple/Google Pay if available).
14. Complete a test payment and confirm redirect to `/checkout/success`.
15. Use a Stripe test decline card; confirm the "Payment was declined" UI and the "Try again" link.
16. Verify the `checkout_session` cookie is `HttpOnly`, `Secure`, and `SameSite=Lax`.

### Order confirmation
17. Confirm the success page shows the correct order number, items, prices, shipping address, and estimated delivery.
18. Refresh `/checkout/success?payment_intent=...` with the cookie cleared; confirm the order still appears.
19. Confirm the failed/canceled/processing branches show the correct message and CTA.
20. Inspect `dataLayer`/GA4 network calls; confirm the `purchase` event includes items, tax, shipping, and uses currency `PLN`.
21. Verify that no order-confirmation email is sent in dev (Resend fallback) and that the UI does not claim one was sent.

---

## Summary

- **Six pre-existing bugs:** all remain **confirmed-still-open** in the current source. None are already fixed or superseded.
- **Additional security / baseline gaps found:**
  - Hardcoded `SESSION_SECRET` fallback (`lib/session.ts:38`).
  - No CSP / SRI / nonce for the checkout origin (`next.config.ts`, `GoogleAnalytics.tsx`, `app/checkout/layout.tsx`).
  - Low-entropy client-generated `checkoutSessionId` reused as Stripe idempotency key (`CheckoutButton.tsx`, `lib/dev/event-logger.ts`, `payment-intent-session/route.ts`).
  - No server-side product-ID / quantity allow-listing at `initCheckoutSession`; basket compact string not strictly parsed (`app/actions/checkout/index.ts`, `createOrderFromPaymentIntent.ts`).
  - Non-atomic stock logic extends into the webhook path (`createOrderFromPaymentIntent.ts`).
  - No CSRF token / Origin / Fetch Metadata checks on state-changing routes (`payment-intent-session/route.ts`, `return/route.ts`, `app/actions/checkout/index.ts`).
  - Structured and unguarded logging can leak checkout PII in production (`lib/dev/event-logger.ts`, `app/api/trace/route.ts`, plus the `console.log` sites in `sang-logium-v9d`).
  - Shipping step also uses the public Sanity CDN for parcel data (`sanity-cms/lib/products/getProductsByIds.ts` via `sanityFetch`).
- **21 user-observable checks are deferred** to the live dev server (`localhost:3000`, Stripe test mode).

**Deliverable:** `docs/checkout/security-audit.md`.
