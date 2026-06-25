# Return Flow Foundation - Tasks Decomposition

**Happy path tracer only.**

**Scope:** Service Infrastructure only. Zero endpoint or UI logic.

## Tasks Graph

```
A[Verify retrievePaymentIntent in lib/stripe.ts] --> B[Verify Sanity order schema]
B --> C[Verify order fetch helper]
```

## Task Details

### Task 1: Verify `retrievePaymentIntent`
- Open `lib/stripe.ts`
- Confirm `retrievePaymentIntent(paymentIntentId: string)` exists
- Confirm it calls `stripe.paymentIntents.retrieve(paymentIntentId)`
- Confirm it returns the full `Stripe.PaymentIntent` object
- Confirm it lets Stripe SDK errors throw (callers wrap in their own `try/catch`)

### Task 2: Verify Sanity order schema
- Open Sanity Studio or `sanity-cms/schemaTypes/` to locate the order document type
- Confirm these fields exist with correct types:
  - `_type`: `"order"`
  - `paymentIntentId`: string (camelCase, NOT snake_case)
  - `items`: array of `{ productId, name, quantity, subtotal }`
  - `pricing.total`: integer (grosz)
  - `shippingAddress`: `{ name, line1, city, state, postalCode, country }`
  - `dates.orderedAt`: ISO datetime string
- If any field is missing or named differently, update the GROQ query in Task 3 AND the success page

### Task 3: Verify order fetch helper
- Open `sanity-cms/lib/orders/getOrderByPaymentIntentId.ts`
- Confirm it runs:
  ```
  *[_type == "order" && paymentIntentId == $paymentIntentId][0]{ ... }
  ```
- Confirm it returns `OrderForSuccessPage | null`
- Confirm it uses the anonymous read client (no token needed for reads)
