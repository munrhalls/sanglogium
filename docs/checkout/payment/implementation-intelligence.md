# Payment — Implementation Intelligence

## Source Code Map

| File | Purpose | Status |
|------|---------|--------|
| `app/(store)/checkout/payment/page.tsx` | Server Component: funnel guards, Sanity query, grand total calculation, renders OrderSummary | OrderSummary NOT IMPLEMENTED (June 2026) |
| `app/(store)/checkout/payment/PaymentForm.client.tsx` | Client Component: email input, Stripe PaymentElement, confirmPayment | DONE |
| `app/(store)/checkout/payment/PaymentPageClient.tsx` | Legacy client wrapper (orphaned Flow B artifact) | DEPRECATED — reads sessionStorage.basketReservationId |
| `app/api/checkout/payment-intent-session/route.ts` | Route Handler: PI create/update with metadata, saves session.paymentIntentId | DONE |
| `app/actions/checkout/index.ts` | `initPaymentAction`, `saveEmailToSession` | DONE |
| `lib/checkout/createOrderFromPaymentIntent.ts` | Synchronous order creation utility | DONE |
| `lib/session.ts` | iron-session types | DONE |
| `app/checkout/success/page.tsx` | Success page with order details | DONE |

## Frame — Order Summary Display (May 29, 2026)

**Objective:** Render an order summary on the payment page that displays itemized basket items with Sanity product names, quantities, and line totals, plus shipping cost and grand total in PLN, positioned before the Stripe PaymentElement.

**Tasks:**
1. `app/(store)/checkout/payment/page.tsx` — Extend Sanity GROQ query to include `name` field (currently only fetches `_id`, `price_data.unit_amount`, `stock`)
2. `app/(store)/checkout/payment/page.tsx` — Build a server-rendered OrderSummary (inline or local Server Component). Receives: `basket` (from session), `products` (from Sanity query), `subtotal`, `shippingCost`, `grandTotal`, `shippingCode`. Renders: item lines, shipping line, grand total line
3. `app/(store)/checkout/payment/page.tsx` — Update JSX layout: OrderSummary left column, PaymentForm right column, responsive grid

## Frame — Visual Design Alignment (June 3, 2026)

**Objective:** Align payment page visual design to the UX intelligence spec, closing all P0–P2 gaps with design-system-correct tokens, spacing, and responsive behaviour.

**Tasks:**
1. `app/(store)/checkout/payment/page.tsx` — Add 4-node visual progress stepper (Basket → Address → Shipping → Payment, Payment active); fix desktop two-column grid alignment to `items-start`; reposition Klarna messaging element above payment form card
2. `app/(store)/checkout/payment/CheckoutSummary.tsx` — Implement OrderSummary per UX spec: add `surface.subtle` tinted Deliver-to block with pin icon and `font-medium` name line; fix product name wrapping with `word-break: break-word`; de-emphasise VAT row to `.type-caption text-text-caption`; override total value to `.type-section-sub text-brand-400`; correct all typography tokens (`.type-overline` for column headers, `.type-card-title` for product names)
3. `app/(store)/checkout/payment/PaymentPageClient.tsx` — Replace off-brand error colours (`bg-red-50`, `text-red-800`, `bg-blue-600`) with design-system tokens (`.card-base`, `.btn-cart-large`, `.btn-secondary`); replace bare "Loading payment form…" text with pulse skeleton inside `.card-base`; fix back-navigation links to `min-h-[44px]` flex items-center touch targets
4. `app/(store)/checkout/payment/PaymentForm.client.tsx` — Add mobile-only sticky Pay CTA bar (`fixed bottom-0 left-0 w-full z-50` with `surface.page` bg and top shadow); hide form-card Pay button on mobile (`lg:block hidden`); reserve bottom padding `pb-28` in form card so sticky bar never occludes content; update Pay button label to include grand total (e.g. `Pay · 714,59 zł`)

**Acceptance:**
- Visual inspection (desktop): 4-node progress stepper renders with Payment active; two-column grid is top-aligned (`items-start`); Klarna element sits between summary and form cards
- Visual inspection (mobile): sticky Pay bar fixed at bottom; form-card Pay button hidden; back-nav links meet 44px touch target; progress stepper shows circles only
- Visual inspection (both): Order Summary shows tinted Deliver-to block with pin icon; product names wrap without truncation; VAT row is `.type-caption` (de-emphasised); total row uses `text-brand-400`; error state uses design-system tokens (no `red-50`/`blue-600`)
- Live check: Complete a test-card payment end-to-end; verify no visual regressions in Stripe PaymentElement, ExpressCheckout, or security badge; verify order created and stock decremented

## Edge Cases (LOCKED until Scope 1+2 pass)

| Concern | What | Source Code Status |
|---------|------|-------------------|
| Stripe idempotency keys | Prevent duplicate PaymentIntents on network retry | `initPaymentAction` calls `stripe.paymentIntents.create()` without idempotency key |
| Cascade invalidation | Clear `session.paymentIntentId` when basket/address/shipping changes | Not yet implemented |
| Payment failure / retry UX | Declined cards, 3D Secure, expired cards | Not yet implemented |
| Basket reservation flow cleanup | Remove deprecated Flow B artifacts (PaymentPageClient.tsx, `payment/_components/*`) | Orphaned code reads `sessionStorage.basketReservationId` |

## Deleted Issues Merged Into This Issue

The following issues were closed as violations of the one-feature-one-issue rule:

1. **sang-logium-cdy** — "Add email capture and OrderSummary to payment page"
   - Email capture → moved to address page issue
   - OrderSummary display → merged into Scope 1

2. **sang-logium-80l** — "Security: Add Stripe idempotency keys to PaymentIntent create"
   - Merged into edge cases

3. **sang-logium-ayz** — "Deprecate basket reservation flow artifacts"
   - Merged into edge cases

## Live Check Evidence

### Scope 1 — Core Payment Flow (All PASS)

**Trace ID:** `chk_1779895061263_48mzeyp`

```
[RETURN HANDLER] PI retrieved -- status: succeeded amount: 101071
[ORDER CREATE] Order ORD-2026-0014 created for PI pi_3TbjDhEQ2a2vW56g1Fhd5EXo
[ORDER CREATE] Stock decremented for 1 items
[RETURN HANDLER] Session cleared -> redirect to /checkout/success
GET /api/checkout/return?payment_intent=... 307 in 7090ms
```

| Check | Result |
|-------|--------|
| Payment page loads, Stripe renders | PASS |
| Test card accepted, redirect to success | PASS |
| Session validation works (redirects if missing address/shipping) | PASS |
| Order created synchronously in return handler | PASS |
| Stock decremented after successful payment | PASS |
| Out-of-stock product redirects to basket with error | PASS |
