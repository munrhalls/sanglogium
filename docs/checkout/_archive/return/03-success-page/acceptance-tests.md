# Success Page - Acceptance Tests

**Happy path tracer only.**

**Simplest possible checks. Run on dev server.**

## Test 1: Privacy guard passes after Route Handler
- Complete a real payment with test card `4242 4242 4242 4242`, land on `/checkout/success`
- [ ] `session.completedPaymentIntentId` matches the `payment_intent` query param
- [ ] Privacy guard allows the request through

## Test 2: Succeeded branch
- Complete a real payment, land on `/checkout/success`
- [ ] Page displays amount in PLN
- [ ] Payment method hint shows (BLIK or card)
- [ ] Suspense fallback "Fetching order details…" shows briefly
- [ ] No `setTimeout` or artificial delay

## Test 3: Order details render
- After webhook has created the order (or when testing with pre-seeded order)
- [ ] Order ID, item list, grand total, shipping address, and order date are displayed
- [ ] Total matches Stripe PI amount
- [ ] Link to `/basket` is present

## Test 4: Refresh is idempotent
- Land on `/checkout/success` after successful payment. Press F5.
- [ ] Page re-renders with same confirmation content
- [ ] No duplicate side effects
