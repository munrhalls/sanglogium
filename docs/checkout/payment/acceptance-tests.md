# Acceptance Tests - Payment Page

**Happy path tracer only. Manual verification on dev server.**

*Important*: session refers to iron-session, the checkout session

## Test 1: Payment page guard redirects to address if session missing
- Clear session, navigate to /checkout/payment
- [ ] Redirects to /checkout/address
  *(address is checked first — no session means no address)*

## Test 2: Payment page guard redirects to shipping if shippingCost missing
- Session has address but no shippingCost, navigate to /checkout/payment
- [ ] Redirects to /checkout/shipping

## Test 3: Server Component reads session correctly
- Navigate to /checkout/payment with valid session (basket, address, shippingCode, shippingCost)
- [ ] Server logs show session.basket
- [ ] Server logs show session.address
- [ ] Server logs show session.shippingCode
- [ ] Server logs show session.shippingCost (in grosz)

## Test 4: Server Component fetches product prices from Sanity
- On payment page with valid session
- [ ] Server logs show basket IDs read from session
- [ ] Server logs show product documents fetched from Sanity
- [ ] Server logs show prices extracted

## Test 5: Server Component checks stock availability
- On payment page with valid session
- [ ] Server logs show stock check for each item
- [ ] If any item stock = 0, redirect to /basket?error=out_of_stock&id={productId}
  *(productId must identify the specific out-of-stock item)*

## Test 6: Server Component calculates subtotal
- On payment page with valid session
- [ ] Server logs show subtotal calculation: Σ(Sanity Price × Session Quantity)

## Test 7: Server Component calculates grand total
- On payment page with valid session
- [ ] Server logs show grand total: subtotal + session.shippingCost

## Test 8: Stripe Payment Intent — idempotent create/update
- **First visit** (no paymentIntentId in session):
  - [ ] Server logs show stripe.paymentIntents.create() called
  - [ ] amount = grand total, currency = 'pln'
  - [ ] address metadata passed as flattened string fields (city, street, postalCode — NOT as object)
  - [ ] Server logs show client_secret extracted
  - [ ] paymentIntentId stored in session
- **Second visit** (refresh / back-forward, paymentIntentId already in session):
  - [ ] Server logs show stripe.paymentIntents.update() called — NOT create()
  - [ ] Stripe Dashboard shows only ONE Payment Intent for this order attempt

## Test 9: Client Component mounts Stripe Elements
- On payment page
- [ ] Page renders without errors
- [ ] Stripe Elements iframe loads
- [ ] PaymentElement displays (card input, Blik, Apple Pay options)

## Test 10: Payment execution — happy path
- Enter valid test card details, click Pay
- [ ] Pay button is disabled and shows loading state during processing
- [ ] Stripe confirms payment
- [ ] Browser redirects to /checkout/return

## Test 11: Payment execution — card error inline display
- Enter a Stripe test decline card (e.g. 4000000000000002), click Pay
- [ ] Pay button re-enables after error
- [ ] Inline error message displayed (stripe error message visible to user)
- [ ] User is NOT redirected

## Test 12: Stripe Dashboard verification
- After successful payment
- [ ] Stripe Dashboard shows PaymentIntent with correct amount in grosz
- [ ] Stripe Dashboard shows address metadata (flattened string fields)
