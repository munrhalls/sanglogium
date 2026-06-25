# Return Route Handler - Acceptance Tests

**Happy path tracer only.**

**Simplest possible checks. Run on dev server.**

## Test 1: Stripe redirect URL format
- Complete a payment via Stripe test card `4242 4242 4242 4242`
- [ ] Browser URL during redirect: `/api/checkout/return?payment_intent=pi_xxx&payment_intent_client_secret=xxx&redirect_status=succeeded`
- [ ] `payment_intent` is extracted from `searchParams`
- [ ] `payment_intent_client_secret` and `redirect_status` are read but ignored

## Test 2: PI verification on succeeded
- [ ] `retrievePaymentIntent()` is called with the extracted `payment_intent`
- [ ] Retrieved `status` is `'succeeded'`

## Test 3: Session lifecycle on succeeded
- Complete payment with card `4242 4242 4242 4242`
- [ ] `session.completedPaymentIntentId` is set to the PI id
- [ ] `session.paymentIntentId` is cleared
- [ ] `session.basket` is cleared
- [ ] `session.address` is cleared
- [ ] `session.shippingCode` is cleared
- [ ] `session.shippingCost` is cleared
- [ ] No call to `session.destroy()` anywhere (use partial clear only)

## Test 4: Redirect to success page
- After successful payment
- [ ] Redirect target is `/checkout/success?payment_intent=pi_xxx`
- [ ] No `status` query param on the happy path
