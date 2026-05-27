# Payment Integration - Tasks Decomposition

**Scope:** End-to-end verification and cross-scope contract alignment only. No new implementation.

## Tasks Graph

```
A[Test full happy path] --> B[Test funnel guards]
B --> C[Test stale-PI invariant]
C --> D[Test session cascade]
D --> E[Align cross-scope contracts]
```

## Task Details

### Task 1: Test full happy path
- Complete flow manually: add item to basket → `/checkout/address` → `/checkout/shipping` → `/checkout/payment`
- [ ] Payment page loads with order summary and PaymentElement
- [ ] Pay with test card succeeds
- [ ] Browser lands at `/api/checkout/return` then `/checkout/success`

### Task 2: Test funnel guards
- For each guard, use checkout-seed or manual session manipulation:
  - Empty basket → `/basket`
  - Zero quantity → `/basket?error=invalid_basket`
  - Missing address → `/checkout/address`
  - Missing shippingCost → `/checkout/shipping`
  - Free shipping (`shippingCost: 0`) → page renders (no redirect)

### Task 3: Test stale-PI invariant
- Complete flow to payment page (PI created)
- Navigate back to address, edit a field, save (cascade clears `shippingCost`)
- Try to access `/checkout/payment` → redirected to `/checkout/shipping`
- Re-select shipping → land on `/checkout/payment`
- [ ] `stripe.paymentIntents.update()` is called (same `paymentIntentId`)
- [ ] Updated PI in Stripe Dashboard reflects new amount/metadata

### Task 4: Test session cascade
- Edit address on address page
- [ ] `shippingCost` is cleared from session
- [ ] `paymentIntentId` is NOT cleared
- Edit basket on basket page
- [ ] `shippingCost` is cleared from session
- [ ] `paymentIntentId` is NOT cleared

### Task 5: Align cross-scope contracts
- Verify `return_url` in Client Component matches the Route Handler path:
  - Payment form: `${window.location.origin}/api/checkout/return`
  - Return flow spec (`docs/checkout/return/`): same path
- Verify `paymentIntentId` field name matches:
  - Payment spec: `session.paymentIntentId`
  - Return spec: `session.paymentIntentId`
  - Webhook spec: `paymentIntentId` (camelCase)
- Verify currency unit:
  - Payment spec: integer grosz
  - Return spec: integer grosz
  - Sanity: `price_data.unit_amount` is grosz
