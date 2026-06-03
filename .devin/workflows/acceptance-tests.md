create acceptance-tests.md
in it, only put simplest possible but complete acceptance tests 
these are NOT vitest/programmatic tests - they are purely simple, human verification, on dev server live check + logs
write simplest possible 

- what is tested
[] ...simple test 

# EXAMPLE
# Acceptance Tests - Basket Page Transition

**Happy path tracer only. Manual verification on dev server.** // IMPORTANT: that's because user specified that its happy path only 

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
