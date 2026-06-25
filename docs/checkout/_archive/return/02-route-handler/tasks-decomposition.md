# Return Route Handler - Tasks Decomposition

**Happy path tracer only.**

**Scope:** `app/api/checkout/return/route.ts` only. No success page or UI code.

## Tasks Graph

```
A[Create route.ts skeleton] --> B[Extract payment_intent from URL]
B --> C[Verify PI and confirm succeeded]
C --> D[Set completedPaymentIntentId]
D --> E[Clear session on success]
E --> F[Save session and redirect to success]
```

## Task Details

### Task 1: Create route.ts skeleton
- File: `app/api/checkout/return/route.ts`
- Export `async function GET(request: Request)`
- Import `redirect` from `next/navigation`, `getCheckoutSession` from `@/lib/session`, `retrievePaymentIntent` from `@/lib/stripe`

### Task 2: Extract payment_intent from URL
- `const { searchParams } = new URL(request.url)`
- `const payment_intent = searchParams.get('payment_intent')`
- Read but ignore `payment_intent_client_secret` and `redirect_status`
- Error handling (missing param, Stripe API failure) is implemented in source but out of scope for this happy-path documentation

### Task 3: Verify PI and confirm succeeded
- Call `retrievePaymentIntent(payment_intent)`
- Confirm `pi.status === 'succeeded'`
- Route Handlers do NOT bubble to `app/checkout/error.tsx` — an unhandled throw becomes a raw 500 with a successful charge on the user's card

### Task 4: Set completedPaymentIntentId
- `session.completedPaymentIntentId = pi.id`
- This is the privacy-guard key that the success page checks

### Task 5: Clear session on success
- On `succeeded`: clear `paymentIntentId`, `basket = []`, `address`, `shippingCode`, `shippingCost`
- Use `session.field = undefined` (partial-clear), NOT `session.destroy()`

### Task 6: Save session and redirect to success
- `await session.save()`
- Redirect to `/checkout/success?payment_intent=${pi.id}`
