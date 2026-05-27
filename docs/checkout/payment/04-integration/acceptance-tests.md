# Payment Integration - Acceptance Tests

**End-to-end verification. Run on dev server.**

## Test 1: Full happy path
- Add item to basket → address → shipping → payment
- [ ] Payment page loads with correct order summary
- [ ] Stripe Elements mounts
- [ ] Pay with `4242 4242 4242 4242` succeeds
- [ ] Redirects to `/api/checkout/return` then `/checkout/success`

## Test 2: Funnel guard matrix
| Session State | Expected Redirect |
|---|---|
| Empty basket | `/basket` |
| Basket + qty: 0 | `/basket?error=invalid_basket` |
| Basket only (no address) | `/checkout/address` |
| Basket + address, no shippingCost | `/checkout/shipping` |
| Basket + address + shippingCost: 0 | Payment page renders |

- [ ] All rows verified

## Test 3: Stale-PI invariant
- Complete to payment page
- Edit address → save → cascade clears shippingCost
- Access `/checkout/payment` → redirected to shipping
- Re-select shipping → back to payment
- [ ] Server logs show `payment_intent_update` (not create)
- [ ] Stripe Dashboard shows same PI id, updated amount

## Test 4: Session cascade
- Edit address
- [ ] `shippingCost` cleared
- [ ] `paymentIntentId` preserved
- Edit basket
- [ ] `shippingCost` cleared
- [ ] `paymentIntentId` preserved

## Test 5: Cross-scope contract — return_url
- Open `app/(store)/checkout/payment/PaymentForm.client.tsx`
- [ ] `return_url` is `${window.location.origin}/api/checkout/return`
- Open `docs/checkout/return/README.md`
- [ ] Route Handler path is `/api/checkout/return`

## Test 6: Cross-scope contract — field names
- Open `lib/session.ts`
- [ ] `paymentIntentId` is camelCase
- Open `docs/checkout/return/01-foundation/tasks-decomposition.md`
- [ ] Order GROQ uses `paymentIntentId` (camelCase)

## Test 7: Cross-scope contract — currency
- Stripe Dashboard → PaymentIntent
- [ ] `amount` is integer grosz
- [ ] `currency` is `pln`

## Test 8: Scope boundary — return flow NOT in payment code
- Open `app/(store)/checkout/payment/page.tsx`
- [ ] No redirect to `/checkout/success`
- [ ] No session clearing logic
- Open `app/(store)/checkout/payment/PaymentForm.client.tsx`
- [ ] No `router.push('/checkout/success')`
- [ ] No order creation logic
