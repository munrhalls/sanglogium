# Payment Client Form - Acceptance Tests

**Simplest possible checks. Run on dev server.**

## Test 1: Elements mount
- Navigate to `/checkout/payment` with valid session
- [ ] Stripe Elements iframe loads
- [ ] PaymentElement displays (card input, Blik options)
- [ ] No console errors from Stripe

## Test 2: Email field
- [ ] Email input is visible and focused
- [ ] HTML5 validation rejects invalid email (e.g. "not-an-email")
- [ ] Valid email is accepted

## Test 3: Order summary
- [ ] Product names/quantities/prices match basket
- [ ] Subtotal is correct
- [ ] Shipping cost matches session
- [ ] Grand total = subtotal + shipping
- [ ] Summary renders above the Pay button

## Test 4: Billing address suppressed
- [ ] PaymentElement does NOT render its own address inputs
- [ ] User types address only once (at `/checkout/address`)

## Test 5: Pay button states
- [ ] Pay button is disabled before Stripe.js loads
- [ ] Pay button is enabled after Stripe.js loads
- [ ] Pay button shows spinner during submission
- [ ] Pay button re-enables after error

## Test 6: Payment execution — happy path
- Enter Stripe test card `4242 4242 4242 4242`, any future date, any CVC
- Click Pay
- [ ] `elements.submit()` succeeds (no validation error)
- [ ] Browser redirects to `/api/checkout/return` (Route Handler)
- [ ] URL contains `payment_intent` query param

## Test 7: Payment execution — declined card
- Enter Stripe test decline card `4000 0000 0000 0002`
- Click Pay
- [ ] Inline error message appears (not redirect)
- [ ] Error message is human-readable
- [ ] Pay button re-enables

## Test 8: confirmPayment billing_details
- After a successful test payment, open Stripe Dashboard
- Find the PaymentIntent
- [ ] `billing_details.address.line1` equals `${street} ${streetNumber}`
- [ ] `billing_details.address.postal_code` equals `postalCode`
- [ ] `billing_details.address.city` equals `city`
- [ ] `billing_details.address.state` equals `regionCode`
- [ ] `billing_details.address.country` equals `PL`

## Test 9: Return URL
- Check Stripe Dashboard for the PaymentIntent
- [ ] `return_url` is `${origin}/api/checkout/return`
- [ ] NOT `/checkout/return` (that path does not exist)
