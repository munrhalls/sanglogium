# Payment Foundation - Tasks Decomposition

**Scope:** Ground-layer prerequisites only. Zero payment UI or PI logic.

## Tasks Graph

```
A[Verify session types] --> B[Verify Stripe env vars]
B --> C[Verify Stripe Dashboard config]
C --> D[Verify error.tsx exists]
```

## Task Details

### Task 1: Verify session types
- Open `lib/session.ts`
- Confirm `CheckoutSession` has:
  - `paymentIntentId?: string`
  - `completedPaymentIntentId?: string`
- If missing, add both fields

### Task 2: Verify Stripe env vars
- Verify `.env.local` contains:
  - `STRIPE_SECRET_KEY` (server-side, used by `lib/stripe.ts`)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client-side, used by `loadStripe`)
- Both must be non-empty strings

### Task 3: Verify Stripe Dashboard config
- Open Stripe Dashboard → Settings → Payment methods → Currency PLN
- Confirm Card is enabled
- Confirm Blik is enabled
- Without enabled methods, `PaymentElement` renders an empty form with no client error

### Task 4: Verify error boundary
- Confirm `app/(store)/checkout/error.tsx` exists
- Confirm it is a Client Component (`'use client'`)
- Confirm it renders a recoverable error UI with a link back to `/basket`
- Test: temporarily throw in `app/(store)/checkout/payment/page.tsx`, load page, confirm error boundary renders (not global 500)
