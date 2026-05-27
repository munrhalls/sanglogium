# Return Flow Documentation

**Happy path tracer only.**

The return flow handles Stripe's redirect after a successful `confirmPayment`, verifies the PaymentIntent, clears the checkout session, and displays the order confirmation.

## Vertical Slices (Event Order)

| Slice | Folder | What it covers |
|---|---|---|
| Foundation | `01-foundation/` | `retrievePaymentIntent` helper, Sanity order schema, order fetch helper |
| Route Handler | `02-route-handler/` | `/api/checkout/return` — PI verification, session clear on success, redirect |
| Success Page | `03-success-page/` | `/checkout/success` — privacy guard, confirmation, order details |
| Order Details | `04-order-details/` | Async `OrderDetails.tsx` + `RefreshButton.tsx` inside Suspense |
| Integration | `05-integration/` | End-to-end happy path verification, contract alignment, legacy cleanup |

## Architecture

```
Stripe redirect → /api/checkout/return (Route Handler)
  → verify PI → set completedPaymentIntentId → clear session → redirect /checkout/success

User arrives at → /checkout/success (Server Component)
  → privacy guard → verify PI status === succeeded → render confirmation + <OrderDetails /> in <Suspense>
```

## Out of Scope (owned by other docs)

- **Payment page** (`/checkout/payment`) → `docs/checkout/payment/`
- **Webhook handler** (`app/api/webhooks/stripe/route.ts`) → separate documentation (not yet implemented; order creation depends on it)
- **Failed / canceled / processing states** → implemented in source but out of scope for this happy-path documentation

## Key Contracts

| Contract | Value | Where asserted |
|---|---|---|
| `return_url` | `${origin}/api/checkout/return` | `docs/checkout/payment/03-client-form/`, `docs/checkout/return/02-route-handler/` |
| Privacy guard key | `session.completedPaymentIntentId` | `docs/checkout/return/02-route-handler/`, `docs/checkout/return/03-success-page/` |
| Sanity order field | `paymentIntentId` (camelCase) | `docs/checkout/return/01-foundation/`, `docs/checkout/payment/` |
| Currency | integer grosz | all slices |

## Canonical Files

- `app/api/checkout/return/route.ts` — Route Handler
- `app/(store)/checkout/success/page.tsx` — Success page Server Component
- `app/(store)/checkout/success/OrderDetails.tsx` — Async order fetcher
- `app/(store)/checkout/success/RefreshButton.tsx` — Client refresh control
- `lib/stripe.ts` — `retrievePaymentIntent` helper
- `sanity-cms/lib/orders/getOrderByPaymentIntentId.ts` — Sanity order fetcher

## Known Gaps

- **Order creation webhook** (`app/api/webhooks/stripe/route.ts`) is not yet implemented. The success page reads orders from Sanity if they exist, or shows a lag state with refresh if the webhook has not yet created the order.
- **Legacy return page** (`app/(store)/checkout/return/page.tsx`) still exists using the old Stripe Checkout `session_id` architecture and should be removed.
