# Payment Server Component - Acceptance Tests

**Simplest possible checks. Run on dev server. Use checkout-seed for edge cases.**

## Test 1: Guard — empty basket
- Clear session, navigate to `/checkout/payment`
- [ ] Redirects to `/basket` (no Sanity call, no Stripe call)

## Test 2: Guard — invalid quantity
- Seed `zero-quantity` scenario, navigate to `/checkout/payment`
- [ ] Redirects to `/basket?error=invalid_basket`
- [ ] No Sanity query in server logs

## Test 3: Guard — missing address
- Seed `missing-address` scenario, navigate to `/checkout/payment`
- [ ] Redirects to `/checkout/address`

## Test 4: Guard — missing shippingCost
- Session has basket + address, `shippingCost === undefined`
- [ ] Redirects to `/checkout/shipping`

## Test 5: Guard — free shipping accepted
- Seed `shipping-zero` scenario, navigate to `/checkout/payment`
- [ ] Does NOT redirect
- [ ] Page renders

## Test 6: Sanity query runs
- Valid session, load `/checkout/payment`
- [ ] Server logs show productIds extracted from basket
- [ ] Server logs show Sanity response with `_id`, `price_data.unit_amount`, `stock`

## Test 7: Data integrity — count mismatch
- Seed `invalid-product-id` scenario, load `/checkout/payment`
- [ ] Throws `Product mismatch — basket contains unknown product IDs`
- [ ] `error.tsx` renders (not global 500)

## Test 8: Price validity — null unit_amount
- In Sanity Studio, temporarily clear `price_data.unit_amount` on a test product
- Add it to basket, navigate to `/checkout/payment`
- [ ] Throws `Product <id> has invalid price`
- [ ] `error.tsx` renders
- [ ] Restore the price field after test

## Test 9: Stock check — out of stock
- In Sanity Studio, set a test product stock to 0
- Add it to basket, navigate to `/checkout/payment`
- [ ] Redirects to `/basket?error=out_of_stock&id=<productId>`
- [ ] Restore stock after test

## Test 10: Calculation
- Valid session, load `/checkout/payment`
- [ ] Server logs show subtotal = Σ(price * qty)
- [ ] Server logs show grandTotal = subtotal + shippingCost
- [ ] Both are integers

## Test 11: grandTotal < 1 redirect
- Seed `grand-total-zero` scenario, load `/checkout/payment`
- [ ] Redirects to `/basket?error=invalid_total`
- [ ] No Stripe call is made

## Test 12: initPaymentAction called
- Valid session, load `/checkout/payment`
- [ ] Server logs show `payment_intent_create` or `payment_intent_update`
- [ ] `clientSecret` is returned and passed to Client Component
- [ ] `session.paymentIntentId` is persisted

## Test 13: Idempotent PI — first visit
- Clear `session.paymentIntentId`, load `/checkout/payment`
- [ ] Server logs show `payment_intent_create`

## Test 14: Idempotent PI — refresh
- With `session.paymentIntentId` set, refresh `/checkout/payment`
- [ ] Server logs show `payment_intent_update` (not create)
- [ ] Stripe Dashboard shows only one PI for this session
