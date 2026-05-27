# Order Details - Acceptance Tests

**Happy path tracer only.**

**Simplest possible checks. Run on dev server.**

## Test 1: Webhook lag — null order
- Temporarily disable webhook endpoint in Stripe Dashboard (or rely on natural ordering)
- Complete a payment, land on `/checkout/success`
- [ ] Page renders instantly with Stripe confirmation
- [ ] "Payment successful — generating your invoice…" displayed
- [ ] Fallback amount from Stripe PI shown in PLN
- [ ] `<RefreshButton />` visible

## Test 2: Refresh button
- On lag state (Test 1):
  - [ ] Click refresh re-runs Server Component fetch (no full page reload)
  - [ ] URL does not change
  - [ ] Only `RefreshButton.tsx` carries `'use client'` directive in success scope

## Test 3: Order renders after webhook lands
- Re-enable webhook (if disabled for Test 1) or wait for natural delivery
- Click refresh
- [ ] Full order details render
- [ ] Order ID, items, total, shipping address, order date all displayed
- [ ] Total matches Stripe PI amount

## Test 4: Order fields match schema
- [ ] `order._id` displayed
- [ ] `order.items` rendered as name × quantity with line total
- [ ] `order.pricing.total` formatted as PLN
- [ ] `order.shippingAddress` rendered (name, line1, postalCode, city, state, country)
- [ ] `order.dates.orderedAt` formatted as date
- [ ] Link to `/basket` present

## Test 5: No artificial delay
- Read `app/(store)/checkout/success/page.tsx`
- [ ] No `await new Promise(setTimeout)` anywhere
- [ ] Suspense is the only lag-handling mechanism
