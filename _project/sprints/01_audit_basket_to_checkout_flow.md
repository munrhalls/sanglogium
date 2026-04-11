# Audit: Basket to Checkout Flow

## 1. End-State Delineation

### Desktop (1280px)
```
[BASKET PAGE - max-w-content, mx-auto, px-8]
  [BASKET CONTENT - full width]
    [BasketItem[] - grid cols-[3fr_1fr_1fr_1fr]]
      [Product Info + Image]
      [Price]
      [Quantity Controls]
      [Total]
  [BASKET SUMMARY - w-80, shrink-0]
    [CheckoutPanel - button state machine]
      [IDLE: Checkout button]
      [PROCESSING: Disabled with spinner]
      [ERROR: Retry button + message]
    [Summary Calculations]
    [Continue Shopping]

[CHECKOUT/ADDRESS PAGE - max-w-content, mx-auto, px-8]
  [AddressForm - full width]
    [Address Fields]
    [Submit Button]

[CHECKOUT/PAYMENT PAGE - max-w-2xl, mx-auto, px-8]
  [Stripe Elements - full width]
    [Card Input]
    [Pay Button]
```

### Mobile (375px)
```
[BASKET PAGE - full width]
  [BASKET CONTENT - stacked]
    [BasketItem[] - single column]
      [Product Info + Image]
      [Price + Qty controls]
      [Remove button]
  [BASKET SUMMARY - full width, bottom section]
    [CheckoutPanel - full width button]
    [Summary Calculations]
    [Continue Shopping]

[CHECKOUT/ADDRESS PAGE - full width, px-4]
  [AddressForm - stacked fields]
  [Submit Button - full width]

[CHECKOUT/PAYMENT PAGE - full width, px-4]
  [Stripe Elements - stacked]
  [Pay Button - full width]
```

### Design System Tokens Required
| Token | Current | Target | Gap ID |
|-------|---------|--------|--------|
| `btn-primary` | exists | Apply to checkout button | G-01 |
| `type-caption` | exists | Use for button labels | G-02 |
| `bg-red-50` | exists | Error state styling | G-03 |

---

## 2. Spatial Architecture

### User Flow Groups
| Group | Entry | Actions | Exit |
|-------|-------|---------|------|
| Basket Review | Basket page | Adjust quantities, remove items | Click checkout |
| Address Entry | /checkout/address | Fill form, submit | Navigate to payment |
| Payment | /checkout/payment | Enter card, pay | Success/redirect |

### Component Hierarchy
```
BasketPage
  BasketPage (effects only)
  Basket
    BasketItem[]
      BasketControls
      QuantitySelector
  BasketSummary
    CheckoutPanel
      [IDLE|PROCESSING|COMPLETE] states
  CheckoutButton (archived)

CheckoutFlow
  usePreCheckout
    PreCheckoutMachine (FSM)
      States: idle | processing | complete
  useCheckoutFlow
  useCheckoutMachine
    States: idle | processing | complete

AddressPage
  AddressForm
    [Server action integration]

PaymentPage
  StripePaymentForm
    Stripe Elements
```

---

## 3. Gap Analysis (G-XX)

| ID | Component | Current | Target | Severity |
|----|-----------|---------|--------|----------|
| G-01 | Checkout Initiation | Multiple checkout components (CheckoutPanel, CheckoutButton, usePreCheckout) | Single unified checkout trigger | High |
| G-02 | Idempotency Key Flow | Generated in useCheckoutFlow, stored in sessionStorage | Generated in PreCheckoutMachine, passed via URL params | High |
| G-03 | Address Page Parameters | Expects sessionId + idempotencyKey in URL | Flow passes only sessionId, idempotencyKey in FSM context | High |
| G-04 | Payment Intent Creation | validateBasket creates Stripe Checkout session | Should create PaymentIntent per UX slice for Elements integration | Critical |
| G-05 | Stock Reservation Logic | Sanity transaction with reservedStock field | Redis Lua script with compensation pattern | Critical |
| G-06 | Error Handling | Basic error messages in components | FSM-based error states with user-friendly messages | Medium |
| G-07 | Webhook Handlers | Missing Stripe webhook handlers | /api/webhooks/stripe for payment_intent events | Critical |
| G-08 | Guest Session Management | Cookie-based session creation | JWT-based guest authentication | Medium |
| G-09 | Basket Locking | isBasketLocked hardcoded to false | Dynamic locking during checkout processing | Medium |
| G-10 | React 18 StrictMode | No Stripe Elements protection | useMemo options, conditional render, module-scope promise | High |

---

## 4. RWD Strategy

| Component | Desktop (1280px) | Mobile (375px) | Implementation |
|-----------|------------------|----------------|----------------|
| Basket Grid | 4 columns (3fr_1fr_1fr_1fr) | Single column | `grid-cols-1 lg:grid-cols-[3fr_1fr_1fr_1fr]` |
| Basket Summary | Fixed width (w-80) | Full width | `lg:w-80 lg:shrink-0` |
| Checkout Button | Inline with summary | Full width | `lg:w-auto lg:px-6 w-full` |
| Address Form | Two columns | Single column | `lg:grid-cols-2 grid-cols-1` |
| Payment Form | Max-w-2xl | Full width | `lg:max-w-2xl w-full` |

---

## 5. Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `BasketSummary.tsx` | Checkout flow changes | Verify basket totals unchanged |
| `BasketControls.tsx` | Dynamic locking | Test quantity adjustments during checkout |
| `validateBasket.ts` | Complete rewrite needed | Archive current implementation |
| `usePreCheckout.ts` | FSM changes | Verify idempotency key generation |
| `checkoutMachine.ts` | State machine refactor | Test all state transitions |

---

## 6. Verification Commands

```bash
# Pre-sprint regression
npm run build

# Component verification
npx playwright test --grep "basket"

# Checkout flow verification
npx playwright test --grep "checkout"

# Manual verification flow
# 1. Add items to basket
# 2. Click checkout button
# 3. Verify navigation to /checkout/address
# 4. Fill address form
# 5. Submit and verify navigation to /checkout/payment
# 6. Verify Stripe Elements load
# 7. Test payment flow (mock)
```
