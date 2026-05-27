# Payment Foundation - Acceptance Tests

**Simplest possible checks. Run on dev server.**

## Test 1: Session types
- Open `lib/session.ts`
- [ ] `paymentIntentId?: string` is present
- [ ] `completedPaymentIntentId?: string` is present

## Test 2: Stripe env vars
- Open `.env.local`
- [ ] `STRIPE_SECRET_KEY` is present and non-empty
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is present and non-empty

## Test 3: Stripe Dashboard preconditions
- Stripe Dashboard → Settings → Payment methods → PLN
- [ ] Card is enabled
- [ ] Blik is enabled

## Test 4: Error boundary renders
- Temporarily add `throw new Error('test')` in `app/(store)/checkout/payment/page.tsx`
- Load `/checkout/payment`
- [ ] Checkout error boundary renders (not global Next.js 500 page)
- Remove the temporary throw

## Test 5: Checkout-seed route exists
- Start dev server
- [ ] `GET /checkout-seed?scenario=missing-address&secret=$CHECKOUT_SEED_SECRET` returns 302 redirect to `/checkout/payment`
- [ ] `GET /checkout-seed?scenario=missing-address` (no secret) returns 403

## Test 6: Checkout-seed scenarios work
- For each scenario, hit the seed route then verify session state:
  - [ ] `shipping-zero` → `shippingCost === 0` in session
  - [ ] `invalid-product-id` → basket contains a known-bad productId
  - [ ] `zero-quantity` → basket contains an item with `quantity: 0`
  - [ ] `grand-total-zero` → basket has zero-priced items + `shippingCost: 0`
