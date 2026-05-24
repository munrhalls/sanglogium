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
- [ ] Server logs show session.basket (array of `{ productId, quantity }`)
- [ ] Server logs show session.address (all 5 fields: regionCode, postalCode, street, streetNumber, city)
- [ ] Server logs show session.shippingCode
- [ ] Server logs show session.shippingCost (integer in grosz)
- [ ] After first PI creation: server logs show session.paymentIntentId

## Test 4: Server Component fetches product prices from Sanity
- On payment page with valid session
- [ ] Server logs show productIds extracted from session.basket
- [ ] Server logs show Sanity response: each product has `_id`, `price_data.unit_amount`, `stock`
- [ ] Server logs show prices extracted as integers (grosz)

## Test 5: Server Component checks stock availability
- On payment page with valid session
- [ ] Server logs show stock check for each item (product.stock)
- [ ] If any item stock = 0, redirect to /basket?error=out_of_stock&id={product._id}
  *(product._id must identify the specific out-of-stock item)*

## Test 6: Server Component calculates subtotal
- On payment page with valid session
- [ ] Server logs show subtotal: Σ(price_data.unit_amount × session quantity)
- [ ] Subtotal is an integer (grosz)

## Test 7: Server Component calculates grand total
- On payment page with valid session
- [ ] Server logs show grand total: Math.round(subtotal + session.shippingCost)
- [ ] Grand total is an integer (grosz)

## Test 8: Stripe Payment Intent — idempotent create/update
- **First visit** (no paymentIntentId in session):
  - [ ] Server logs show stripe.paymentIntents.create() called
  - [ ] amount = grand total (integer), currency = 'pln'
  - [ ] Metadata shows all 5 address fields as strings (regionCode, postalCode, street, streetNumber, city)
  - [ ] Server logs show client_secret is not null
  - [ ] Server logs show client_secret extracted
  - [ ] paymentIntentId stored in session
- **Second visit** (refresh / back-forward, paymentIntentId already in session):
  - [ ] Server logs show stripe.paymentIntents.update() called — NOT create()
  - [ ] Update includes both amount AND metadata (all 5 address fields)
  - [ ] Server logs show client_secret extracted from update() response
  - [ ] Stripe Dashboard shows only ONE Payment Intent for this order attempt
- **After completed payment** (session has paymentIntentId of a succeeded PI):
  - [ ] update() throws — server logs show catch triggered
  - [ ] paymentIntentId cleared from session
  - [ ] Server logs show stripe.paymentIntents.create() called with fresh PI
  - [ ] New paymentIntentId stored in session

## Test 9: Client Component mounts Stripe Elements
- On payment page
- [ ] Page renders without errors
- [ ] If clientSecret were missing: loading placeholder shown (not a crash)
- [ ] Stripe Elements iframe loads with valid clientSecret
- [ ] PaymentElement displays (card input, Blik, Apple Pay options)

## Test 10: Payment execution — happy path
- Wait for PaymentElement to fully initialize, enter valid test card details, click Pay
- [ ] Pay button is disabled and shows loading state during processing
  *(if Pay clicked before Stripe.js loads, handler returns early — no crash)*
- [ ] Stripe confirms payment
- [ ] Browser redirects to /checkout/return

## Test 11: Payment execution — error inline display
- Enter a Stripe test decline card (e.g. 4000000000000002), click Pay
- [ ] confirmPayment() returns (does not redirect)
- [ ] Pay button re-enables after error
- [ ] Inline error message displayed (Stripe error message or fallback 'Payment failed. Please try again.')
- [ ] User is NOT redirected

## Test 12: Stripe Dashboard verification
- After successful payment
- [ ] Stripe Dashboard shows PaymentIntent with correct integer amount (grosz)
- [ ] Stripe Dashboard shows currency = pln
- [ ] Stripe Dashboard shows all 5 address metadata fields as strings
  (regionCode, postalCode, street, streetNumber, city)
