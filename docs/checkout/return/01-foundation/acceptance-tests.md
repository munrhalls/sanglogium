# Return Flow Foundation - Acceptance Tests

**Happy path tracer only.**

**Simplest possible checks.**

## Test 1: retrievePaymentIntent exists
- Open `lib/stripe.ts`
- [ ] `retrievePaymentIntent` is exported
- [ ] Signature: `(paymentIntentId: string) => Promise<Stripe.PaymentIntent>`

## Test 2: retrievePaymentIntent works
- In a dev script or test:
  ```ts
  const pi = await retrievePaymentIntent('pi_test_xxx') // use a real test PI
  ```
- [ ] Returns a PaymentIntent object with `status`, `amount`, `currency`

## Test 3: Sanity order schema
- Open Sanity Studio → order document type
- [ ] `paymentIntentId` field exists (camelCase string)
- [ ] `items` field exists (array)
- [ ] `pricing.total` exists (number, integer grosz)
- [ ] `shippingAddress` exists (object)
- [ ] `dates.orderedAt` exists (datetime)

## Test 4: Order fetch helper
- Call `fetchOrderByPaymentIntentId('pi_test_xxx')` with a known test order
- [ ] Returns the order document when it exists
- [ ] Returns `null` when no order matches
