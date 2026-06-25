# Payment Page Documentation

The payment page is the final step of the checkout funnel before Stripe handles the transaction.

## Vertical Slices (Event Order)

| Slice | Folder | What it covers |
|---|---|---|
| Foundation | `01-foundation/` | Session types, Stripe env, Dashboard config, error boundary, checkout-seed test helper |
| Server Component | `02-server-component/` | Funnel guards, Sanity reality check, calculation, idempotent PI via `initPaymentAction` |
| Client Form | `03-client-form/` | Stripe Elements, email capture, order summary, PaymentElement, `confirmPayment` |
| Integration | `04-integration/` | End-to-end verification, stale-PI invariant, session cascade, cross-scope contract alignment |

## Out of Scope (owned by other docs)

- **Return flow** (`/api/checkout/return` Route Handler + `/checkout/success` page) → `docs/checkout/return/`
- **Webhook handler** (`app/api/webhooks/stripe/route.ts`) → not yet documented; see return-flow spec for requirements
- **Order persistence** → webhook handler scope

## Architecture

```
User → /checkout/payment (Server Component)
  → funnel guards → Sanity query → calculation
  → pass grandTotal + metadata as props to PaymentForm.client.tsx
  → PaymentForm.client.tsx mounts, fetches /api/checkout/payment-intent-session
  → Route Handler calls initPaymentAction (valid cookie context)
  → returns clientSecret to Client Component
  → Stripe Elements mount → confirmPayment → /api/checkout/return
```

## Key Contracts

| Contract | Value | Where asserted |
|---|---|---|
| `return_url` | `${origin}/api/checkout/return` | `03-client-form/` + `docs/checkout/return/` |
| Currency | integer grosz | all slices + `docs/checkout/return/` |
| `paymentIntentId` field | camelCase | `lib/session.ts` + `docs/checkout/return/` |

## Canonical Files

- `app/(store)/checkout/payment/page.tsx` — Server Component
- `app/(store)/checkout/payment/PaymentForm.client.tsx` — Client Component
- `app/actions/checkout/index.ts` — `initPaymentAction` Server Action
- `lib/session.ts` — iron-session types
- `lib/stripe.ts` — Stripe SDK instance
