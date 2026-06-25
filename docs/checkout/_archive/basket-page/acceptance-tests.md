# Acceptance Tests - Basket Page Transition

**Happy path tracer only. Manual verification on dev server.**

## Test 1: Checkout Button
- Add product to basket
- [ x] Checkout button visible and clickable

## Test 2: Session Cookie Created
- Click Checkout
- [x ] `checkout_session` cookie created

## Test 3: Session Payload
- Add product, click Checkout
- [ x] Server console logs: `[{ productId, quantity }]`

## Test 4: Redirect
- Click Checkout
- [ x] Redirects to `/checkout/address`

## Test 5: Address Page Reads Session
- On address page
- [ x] Server console prints session.basket arrays
