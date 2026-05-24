# Acceptance Tests - Payment Page

**Happy path tracer only. Manual verification on dev server.**

*Important*: session refers to iron-session, the checkout session

## Test 1: Payment page guard redirects to shipping if session missing
- Clear session, navigate to /checkout/payment
- [ ] Redirects to /checkout/shipping

## Test 2: Payment page guard redirects to address if shippingCost missing
- Session has address but no shippingCost, navigate to /checkout/payment
- [ ] Redirects to /checkout/shipping

## Test 3: Server Component reads session correctly
- Navigate to /checkout/payment with valid session (basket, address, shippingCode, shippingCost)
- [ ] Server logs show session.basket
- [ ] Server logs show session.address
- [ ] Server logs show session.shippingCode
- [ ] Server logs show session.shippingCost (in cents)

## Test 4: Server Component fetches product prices from Sanity
- On payment page with valid session
- [ ] Server logs show basket IDs read from session
- [ ] Server logs show product documents fetched from Sanity
- [ ] Server logs show prices extracted

## Test 5: Server Component checks stock availability
- On payment page with valid session
- [ ] Server logs show stock check for each item
- [ ] If any item stock = 0, redirect to /basket?error=out_of_stock

## Test 6: Server Component calculates subtotal
- On payment page with valid session
- [ ] Server logs show subtotal calculation: Σ(Sanity Price × Session Quantity)

## Test 7: Server Component calculates grand total
- On payment page with valid session
- [ ] Server logs show grand total: subtotal + session.shippingCost

## Test 8: Stripe Payment Intent created
- On payment page with valid session
- [ ] Server logs show stripe.paymentIntents.create() called
- [ ] Server logs show grand total passed to Stripe
- [ ] Server logs show address metadata passed to Stripe
- [ ] Server logs show client_secret extracted

## Test 9: Client Component mounts Stripe Elements
- On payment page
- [ ] Page renders without errors
- [ ] Stripe Elements iframe loads
- [ ] PaymentElement displays (card input, Blik, Apple Pay options)

## Test 10: Payment execution works
- Enter valid test card details, click Pay
- [ ] Stripe confirms payment
- [ ] Browser redirects to /checkout/return

## Test 11: Stripe Dashboard verification
- After payment
- [ ] Stripe Dashboard shows PaymentIntent with correct amount
- [ ] Stripe Dashboard shows address metadata
