# Checkout Security & Baseline Functional Specification

> **Scope:** Target state for the checkout funnel, derived *only* from `docs/checkout/security-audit.md` and `docs/checkout/security-intelligence.md`. Every item below is written so it can be proven true/false by a concrete check (code inspection, request tampering, or a live `localhost:3000` observation). Visual design, animation, micro-copy, and UX-score/polish are explicitly excluded.
> 
> **Ordering principle:** Cross-cutting findings are assigned to the funnel step where they first affect the customer or the stored state.

---

## 1. Basket

### Required security properties

1. The `checkout_session` cookie encryption must fail closed when `SESSION_SECRET` is unset; a checkout must not be possible with a hardcoded/default password.  
   *(cites `sang-logium-nft`; `security-audit.md` Pre-existing bug cross-check; `security-intelligence.md` §2 OWASP Session Management Cheat Sheet)*
2. `initCheckoutSession` must accept only a list of `{ productId, quantity }` objects and must ignore or reject any client-supplied price, currency, or extra fields.  
   *(cites `security-audit.md` §1 Basket new finding 1; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet)*
3. `initCheckoutSession` must allow-list every `productId` against the live Sanity product catalogue and must reject unknown, malformed, or non-existent IDs.  
   *(cites `security-audit.md` §1 Basket new finding 1; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet)*
4. `initCheckoutSession` must bound each `quantity` to `1` and the live `availableStock` for that product (or a documented per-item cap, whichever is lower) and must reject quantities ≤ 0, fractional, or above that bound.  
   *(cites `sang-logium-1ss`; `security-audit.md` §1 Basket new findings 1 and 3; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet)*
5. The `checkoutSessionId` / idempotency key must be generated server-side as a high-entropy value (e.g., UUID v4) and must not be predictable, client-supplied, or reused across changed basket/total parameters.  
   *(cites `security-audit.md` §1 Basket new finding 2 and §4 Payment new finding 2; `security-intelligence.md` §6 Stripe idempotency and §2 OWASP Session Management)*
6. The basket step must not emit unguarded `console.log` / `error` / `warn` messages containing basket contents, product IDs, or quantities in production.  
   *(cites `sang-logium-v9d`; `security-audit.md` §1 Basket / `app/actions/checkout/index.ts`)*

### Rudimentary functional baseline

- **Happy path:** An in-stock product in the basket → clicking **Checkout** creates a session containing the exact `{ productId, quantity }` set and redirects to `/checkout/address`.
- **Failure path — out of stock:** An out-of-stock item in the basket must disable the **Checkout** button and show a clear message; if stock drops to zero between the basket and `initCheckoutSession`, the action must redirect back to `/basket`.
- **Failure path — tampered request:** A manually crafted `initCheckoutSession` request carrying an unknown `productId`, a negative/zero/fractional quantity, a quantity above live stock, or an extra price field must be rejected with a clear error and must not create a session.
- **Failure path — double submit / race:** A double-click or slow connection on **Checkout** must create exactly one checkout session and one `checkoutSessionId`, never duplicate sessions or duplicated basket lines.
- *(cites `security-audit.md` §1 Basket DEFERRED list; `security-intelligence.md` §7.1 Basket baseline expectation)*

**Gating questions handled in this step:** S1.A1 is resolved by property 2 and by the payment step's server-side price re-derivation; S1.A2–A4 are resolved by properties 3–5 and the baseline; S1.D1 is resolved by property 5 and the double-submit baseline; S1.A5 (pre-purchase summary) and the S1.F and S1.G groups are deferred as visual/trust/UX-polish items, which are out of scope for this spec.

---

## 2. Address

### Required security properties

1. `saveAddress` / `submitShippingAction` must apply a strict server-side Zod/allow-list to every address field (type, length, allowed characters, required/optional) and must reject values outside that schema.  
   *(cites `security-audit.md` §2 Address new finding 2; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet)*
2. `regionCode` must be re-validated server-side against the allowed region set and a non-allowed region must be rejected, even if the client sends a different value.  
   *(cites `security-audit.md` §2 Address new finding 3; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet)*
3. The server must not honour a client-side `skipValidation` flag; the "Continue with entered address" escape hatch must be a server-originated decision and the raw input must still pass the field allow-list before being saved.  
   *(cites `security-audit.md` §2 Address new finding 1; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet)*
4. The address form must reject empty or whitespace-only required fields with a field-level message before any save.  
   *(cites `security-audit.md` §2 Address new finding 2; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet; gating S1.C2 / S1.C4)*
5. The address form must reject a malformed Polish postal code (anything other than the documented `NN-NNN` format) with a specific message.  
   *(cites `security-audit.md` §2 Address new finding 2; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet; gating S1.C3)*
6. The address step must not emit unguarded `console.log` / `warn` / `error` containing address fragments in production, and `logCheckoutEvent` must not emit error-level address data in production.  
   *(cites `sang-logium-v9d`; `security-audit.md` §2 Address new findings 4 and 5)*
7. Re-saving an address must clear all downstream shipping fields (`shippingCode`, `shippingCost`, `shippingMethodName`, `shippingCarrier`, `shippingEstimatedDays`) so a stale rate cannot be carried forward.  
   *(cites `security-audit.md` §2 Address cascade invalidation; `security-intelligence.md` §7.3 Shipping baseline expectation; gating S1.E1 / S6.G3)*

### Rudimentary functional baseline

- **Happy path:** A genuine, deliverable Polish address is accepted on the first submit, normalized by Google Address Validation, saved, and the customer proceeds to `/checkout/shipping`.
- **Failure path — invalid/undeliverable address:** The API rejects the address with a specific message naming the failing component; the form offers a "Continue with entered address" escape hatch that still preserves and (allow-listed) saves the raw input.
- **Failure path — checker slow or down:** A slow, hanging, or unreachable Google Address Validation API must not strand the customer; the step must show a clear message and a working retry/escape hatch.
- **Failure path — back/forward and un-saved edits:** Navigating back from `/checkout/shipping` and returning to the address step must retain all entered values, including edits that were not successfully saved before leaving.
- **Failure path — missing email:** The address step must collect and validate a customer email and store it in `session.email`; an empty or missing email must block proceeding to `/checkout/shipping`, so the confirmation email and order have a real recipient.  
  *(cites `sang-logium-q3r`; `security-audit.md` §2 Address existing bug status; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet)*
- *(cites `security-audit.md` §2 Address DEFERRED list; `security-intelligence.md` §7.2 Address baseline expectation)*

**Gating questions handled in this step:** S1.B1–B5, C2–C4, D2, and E1 are resolved by the lists above; S1.D1 is partially resolved by the basket idempotency property and the address form state. S1.C1 (markup in address fields is inert) is explicitly **deferred** because neither the audit nor the intelligence deliverable traces to an output-encoding/XSS finding or standard for address data; it must be re-opened only when a concrete citation is available. The S1.F and S1.G groups are deferred as visual/micro-copy/trust items, which are out of scope.

---

## 3. Shipping

### Required security properties

1. Product/parcel data used to calculate shipping must be fetched with the Sanity backend client, not the public CDN client, so dimensions, weight, and `reservedStock` are not stale.  
   *(cites `sang-logium-6wu`; `security-audit.md` §3 Shipping new finding 1; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet)*
2. The package calculator must guard against unrealistic quantities and weights (e.g., a per-item and total maximum) and must not emit unguarded `console.warn` in production.  
   *(cites `sang-logium-v9d`; `security-audit.md` §3 Shipping new finding 2)*
3. The shipping option and price saved by `saveShippingAction` must be validated server-side against the live AlleKurier response for the current basket and address; a client-submitted option ID, `shippingCode`, or `priceInCents` outside that allow-listed set must be rejected.  
   *(cites `security-audit.md` §3 Shipping new finding 4 and §3 new finding 1; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet and §7.3 Shipping baseline expectation; gating S2.A1 / S2.A2)*
4. The shipping step must have CSRF protection beyond `SameSite=Lax`: `saveShippingAction` and any shipping-related API route must validate `Origin`, `Sec-Fetch-Site`, or a synchronizer token before mutating state.  
   *(cites `security-audit.md` §3 Shipping new finding 4 and Cross-cutting CSRF / request integrity; `security-intelligence.md` §3 OWASP CSRF Prevention Cheat Sheet)*
5. The shipping step must not log basket IDs, product counts, package dimensions, or carrier rates in production.  
   *(cites `sang-logium-v9d`; `security-audit.md` §3 Shipping existing bug status)*
6. Carrier API credentials must be sent only to the documented `allekurier.pl` endpoint over TLS and must not be logged or returned to the client.  
   *(cites `security-audit.md` §3 Shipping new finding 3; `security-intelligence.md` §7.3 Shipping baseline expectation)*

### Rudimentary functional baseline

- **Happy path:** A valid address → `/checkout/shipping` loads → at least one AlleKurier option is returned → selecting an option and continuing stores the correct carrier, service, price (cents), and estimated days and redirects to `/checkout/payment`.
- **Failure path — carrier down/unreachable:** When the carrier is down, slow, or returns a malformed response, the page must show a clear, distinguishable error message and a retry that actually re-requests options, with no blank rows showing `undefined`, `$0`, or missing fields.
- **Failure path — no service for postcode:** A valid remote postcode with genuinely no courier service must be distinguishable from a lookup failure and must explain what to do next.
- **Failure path — address change:** Returning to `/checkout/address` and re-saving a different address must clear the previous shipping option and force re-selection before payment can be reached.
- *(cites `security-audit.md` §3 Shipping DEFERRED list; `security-intelligence.md` §7.3 Shipping baseline expectation; gating S2.B1–B4, C1–C2, D1–D2, E1–E2)*

**Gating questions handled in this step:** S2.A1–A3 are resolved by property 3; S2.B1–B4, C1–C2, D1–D2, and E1–E2 are resolved by the baseline; S2.F (visual layout) and S2.G (bilingual/estimate wording) groups are deferred as visual/micro-copy/trust items, which are out of scope. S2.G2 (missing estimate wording) is noted as a UX-trust micro-copy item and is not included in this security spec.

---

## 4. Payment

### Required security properties

1. The payment page must fetch product prices and stock from the Sanity backend client, not the public CDN client.  
   *(cites `sang-logium-6wu`; `security-audit.md` §4 Payment existing bug status and §1; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet)*
2. The payment-intent route must re-derive `grandTotal`, subtotal, VAT, and shipping cost from live Sanity product prices and the validated session shipping cost; it must reject any client-supplied total, product ID, quantity, or price.  
   *(cites `sang-logium-1ss`; `security-audit.md` §1 Basket and §4 Payment; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet and §7.4 Payment baseline expectation; gating S3.A1 / S3.A2)*
3. The payment step must enforce a server-side stock and quantity check (including a documented per-item maximum) before creating or updating a PaymentIntent; an item with `quantity > availableStock` or above the cap must be rejected.  
   *(cites `sang-logium-1ss`; `security-audit.md` §1 Basket and §4 Payment; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet; gating S3.D3 / S6.A3)*
4. The PaymentIntent idempotency key must be a server-generated, high-entropy value and must not be reused across payment attempts with different basket or total parameters.  
   *(cites `security-audit.md` §4 Payment new finding 2; `security-intelligence.md` §6 Stripe idempotency; gating S3.E3)*
5. The payment-intent route and the return handler must validate the request's origin (`Origin` header, `Sec-Fetch-Site`, or a CSRF synchronizer token) before mutating the session or PaymentIntent.  
   *(cites `security-audit.md` §4 Payment new finding 1 and Cross-cutting CSRF / request integrity; `security-intelligence.md` §3 OWASP CSRF Prevention Cheat Sheet; gating S3.C1 / S6.C1)*
6. The payment origin must satisfy the PCI DSS v4.0.1 script-attack criterion: either a documented Stripe-provided assurance that the integration is protected, or a merchant-side `Content-Security-Policy`, subresource integrity / nonces for third-party scripts, and no uncontrolled inline scripts on the payment page.  
   *(cites `security-audit.md` §4 Payment new finding 4 and Cross-cutting PCI / script security; `security-intelligence.md` §1 PCI-DSS SAQ A — script-attack susceptibility)*
7. The payment page, `PaymentForm.client.tsx`, the payment-intent route, and `/api/trace` must not log PII, payment metadata, Stripe errors, or raw client JSON in production.  
   *(cites `sang-logium-v9d`; `security-audit.md` §4 Payment new findings 5 and 6 and Cross-cutting logging / PII; gating S3.C2)*
8. The checkout cookie must be `Secure` in production, `HttpOnly`, and `SameSite=Lax`; it must be invalidated or removed after a completed payment so the same session cannot be replayed for a new checkout.  
   *(cites `sang-logium-nft`; `security-audit.md` Cross-cutting session / cookie configuration and §5 Order confirmation new finding 4; `security-intelligence.md` §2 OWASP Session Management Cheat Sheet; gating S3.C1 / S6.A2)*
9. The payment flow must capture a validated customer email and pass it to Stripe as `receipt_email` and to the order as `customerEmail`; an empty or missing email must block order creation.  
   *(cites `sang-logium-q3r`; `security-audit.md` §2 Address existing bug status and §4 Payment new finding 3; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet)*
10. The `checkout_session` cookie must fail safe (redirect to `/basket`) when corrupted, expired, or from another environment.  
   *(cites `security-audit.md` Cross-cutting session / cookie configuration; `security-intelligence.md` §2 OWASP Session Management Cheat Sheet; gating S6.C2 / S6.D1–D2)*
11. The payment flow must use `PLN` consistently and must not silently switch the displayed or charged currency to another value.  
   *(cites `sang-logium-9vd`; `security-audit.md` §5 Order confirmation new finding 3; `security-intelligence.md` §7.4 Payment baseline expectation; gating S3.A3 / S6.I3)*

### Rudimentary functional baseline

- **Happy path:** A session with basket, address, and shipping cost → `/checkout/payment` shows the correct summary (items, shipping, VAT, total in PLN) and Stripe Elements → customer confirms → redirect to `/api/checkout/return` → on `succeeded`, `/checkout/success` is shown.
- **Failure path — declined / cancelled / processing card:** A declined payment shows a "Payment was declined" UI with a working "Try again" link and keeps basket, address, and shipping intact; a cancelled or processing payment shows the correct branch UI and recovery CTA.
- **Failure path — missing prerequisites:** Opening `/checkout/payment` directly with an empty basket, missing address, or missing shipping option must redirect to the earliest missing step cleanly.
- **Failure path — product change mid-checkout:** A product deleted, unpriced, or out of stock between `/checkout/shipping` and `/checkout/payment` must show a clear message rather than a wrong charge or a crash.
- **Failure path — basket changed in another tab:** Reloading `/checkout/payment` after the basket changed in another tab must show a total that matches the current session basket and live prices, never a stale or forged amount.
- *(cites `security-audit.md` §4 Payment DEFERRED list; `security-intelligence.md` §7.4 Payment baseline expectation; gating S3.B1–B3, D1–D2, E1–E4)*

**Gating questions handled in this step:** S3.A1 is resolved by property 2; S3.A2 by property 2 and 11; S3.A3 by properties 2 and 11; S3.B1 by the retry baseline; S3.B2–B3 by properties 1 and 3 and the baseline; S3.C1 by properties 5, 8, and 10; S3.C2 by properties 6 and 7; S3.D1 by property 2; S3.D2 by property 2; S3.D3 by property 3; S3.E1 by the missing-prerequisites baseline; S3.E2 by the happy-path baseline; S3.E3 by property 4; S3.E4 by the declined/cancelled/processing baseline. The S3.F (visual) and S3.G (billing address / security claims / instalment wording) groups are deferred as visual/micro-copy/trust items, which are out of scope.

---

## 5. Order confirmation

### Required security properties

1. The success page must verify that the PaymentIntent belongs to the current checkout session; it must not display another customer's order when given a leaked `payment_intent` ID.  
   *(cites `security-audit.md` §5 Order confirmation new finding 2; `security-intelligence.md` §7.5 Order confirmation baseline expectation; gating S4.A3 / S5.A1–A2)*
2. The success page must derive the displayed status and amount from Stripe's PaymentIntent status and captured amount, not from client query parameters or the session alone.  
   *(cites `security-audit.md` §5 Order confirmation new findings 2 and 3; `security-intelligence.md` §7.5 Order confirmation baseline expectation; gating S5.A3 / S5.B1–B6)*
3. The return handler and the Stripe webhook must verify the `payment_intent` against the session's `paymentIntentId`, `completedPaymentIntentId`, or `lastPaymentIntentId` before creating an order, and the webhook must verify the `Stripe-Signature` using the raw request body.  
   *(cites `security-audit.md` Cross-cutting Webhook security and §5 Order confirmation new finding 1; `security-intelligence.md` §5 Stripe webhook signature verification)*
4. Order creation must be idempotent by PaymentIntent ID; concurrent return-handler and webhook calls for the same payment must produce exactly one order.  
   *(cites `sang-logium-1ss`; `security-audit.md` §5 Order confirmation new finding 1 and §3.6; `security-intelligence.md` §6 Stripe idempotency; gating S4.B1–B3 / S5.C5)*
5. Stock must be reserved or decremented atomically, and the order must not be created for unavailable stock; if an oversell occurs, it must be flagged on the order for the owner, not only logged.  
   *(cites `sang-logium-1ss`; `security-audit.md` §1, §4, and §5 Order confirmation; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet and §7.5 Order confirmation baseline expectation; gating S4.C1–C4)*
6. Product IDs and quantities must be allow-listed/validated against live Sanity before order creation in both the synchronous return-handler path and the asynchronous webhook path.  
   *(cites `sang-logium-1ss`; `security-audit.md` Cross-cutting Input allow-listing and §5 Order confirmation new finding 1; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet)*
7. The confirmation email must only be sent to a validated, non-empty `customerEmail`; the success UI must not display "Confirmation sent to:" when no email was captured or the send failed.  
   *(cites `sang-logium-q3r`; `security-audit.md` §2 Address and §4 Payment and §5 Order confirmation; `security-intelligence.md` §7.5 Order confirmation baseline expectation; gating S4.F2 / S5.F1)*
8. The GA4 `purchase` event must fire exactly once per completed order, must include the real line items, tax, and shipping, and must use `PLN` currency; it must not leak customer PII.  
   *(cites `sang-logium-9vd`; `security-audit.md` §5 Order confirmation new finding 3; `security-intelligence.md` §7.5 Order confirmation baseline expectation; gating S5.D1–D3)*
9. The checkout session cookie must be invalidated or removed after a completed payment, and the same `checkoutSessionId` must not be reusable for another order.  
   *(cites `security-audit.md` §5 Order confirmation new finding 4; `security-intelligence.md` §2 OWASP Session Management Cheat Sheet; gating S6.A2 / S6.D1–D2)*
10. Order documents, confirmation emails, event logs, and the success page must not contain raw card numbers, CVV, expiry, or Stripe customer IDs; only brand + last4 or wallet name may be shown.  
   *(cites `security-intelligence.md` §1 PCI-DSS SAQ A; `security-audit.md` Cross-cutting PCI / script security; gating S4.F1 / S5.A4)*
11. The success page must not treat a client-supplied `error` query parameter as authoritative over Stripe's actual PaymentIntent status.  
   *(cites `security-audit.md` §5 Order confirmation new finding 2; `security-intelligence.md` §4 OWASP Input Validation Cheat Sheet; gating S5.A3)*
12. The human-facing order number must be unique per PaymentIntent and order; two different payments must not share the same order number.  
   *(cites `security-audit.md` §3.6 / §5 Order confirmation; `security-intelligence.md` §7.5 Order confirmation baseline expectation; gating S4.B5)*

### Rudimentary functional baseline

- **Happy path:** After a `succeeded` PaymentIntent, the return handler creates the order, decrements stock, sends the confirmation email (when configured), and redirects to `/checkout/success` showing the order number, items, total (PLN), shipping address, estimated delivery, and payment method.
- **Failure path — declined / cancelled / processing / verification-failed:** Each PaymentIntent status must render a distinct, deliberate screen with the correct CTA; "Try again" from a declined screen returns to `/checkout/payment` with basket, address, and shipping still present.
- **Failure path — order not yet written:** A refresh of `/checkout/success?payment_intent=...` before the webhook has written the order must show a working "Refresh" affordance and resolve to the order once available, without creating duplicates.
- **Failure path — cookie cleared refresh:** Refreshing the success page after the checkout cookie is cleared must still show the correct order for that `payment_intent`, and must not show another customer's order.
- **Failure path — order write failure after charge:** If order creation fails after a successful payment, the page must still confirm the payment, show the amount, and provide a support reference, not dump the customer back at `/basket` with no context.
- *(cites `security-audit.md` §5 Order confirmation DEFERRED list; `security-intelligence.md` §7.5 Order confirmation baseline expectation; gating S4.A1–A2, B1–B4, C1–C6, D1–D3, E1–E4)*

**Gating questions handled in this step:** S4.A1–A3 are resolved by properties 3, 1, and 5; S4.B1–B5 by properties 4 and 12 and the baseline; S4.C1–C4 by properties 5 and 6; S4.D1–D3 by properties 2 and 5; S4.E1–E4 by the baseline; S4.F1 by property 10, S4.F2 by property 7, S4.F3 by the happy-path baseline. S4.G (guest order linking), S4.F3/F4/F5/F6 (support links and copy), and S5.E (visual) / S5.F2–F6 (copy/trust) groups are deferred as out-of-scope UX/trust/polish items. S5.C4 (Back button after confirmed order) and S6.F1–F2 (back/forward preservation) are deferred as navigation-robustness items not traced to a concrete audit or intelligence finding in this spec.

---

## Cross-cutting items not assigned to a single step

For traceability, the following cross-cutting findings are folded into the steps above:

| Finding | Handled in |
|---|---|
| `sang-logium-nft` hardcoded `SESSION_SECRET` fallback | Basket (property 1) and Payment (property 8) |
| `sang-logium-1ss` overselling / non-atomic stock | Basket (property 4), Payment (property 3), Order confirmation (properties 5 and 6) |
| `sang-logium-q3r` missing customer email | Address (baseline and property 7), Payment (property 9), Order confirmation (property 7) |
| `sang-logium-6wu` public CDN for price/stock | Shipping (property 1) and Payment (property 1) |
| `sang-logium-9vd` empty GA4 purchase / logging | Payment (property 11) and Order confirmation (property 8) |
| `sang-logium-v9d` unguarded `console.log` / PII | Basket, Address, Shipping, Payment (relevant properties) |
| No CSRF / origin protection | Shipping (property 4) and Payment (property 5) |
| No CSP / SRI / nonce for payment origin | Payment (property 6) |
| Low-entropy `checkoutSessionId` reused as idempotency key | Basket (property 5) and Payment (property 4) |
| Session cookie not invalidated after checkout | Payment (property 8) and Order confirmation (property 9) |

No item in this spec is included without a citation to `security-audit.md`, `security-intelligence.md`, or one of the six pre-existing bug IDs. Visual, animation, micro-copy, and UX-polish items are excluded throughout.
