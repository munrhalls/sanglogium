# Audit: Guest Checkout Inventory Reservation

## 1. End-State Delineation

### Desktop (1280px)
```
[BASKET PAGE CONTENT]
  [EXISTING BASKET ITEMS]
  [CHECKOUT BUTTON] - idle state
  [RESERVED BASKET VIEW] - replaces checkout button on click
    [STATE 1: FULL] - "Proceed to Next Step" + Cancel
    [STATE 2: DECREMENTED] - "Approve & Proceed" + Cancel + warning message
    [STATE 3: EMPTY] - Cancel only + out of stock message
    [STATE 4: ERROR] - Retry + Cancel + error message
    [STATE 5: LOADING] - Spinner only
```

### Mobile (375px)
```
[SAME STATES - stacked layout, full-width buttons]
```

### Design System Tokens Required
| Token | Current | Target | Gap ID |
|-------|---------|--------|--------|
| No new design tokens required - uses existing Tailwind utilities | N/A | N/A | None |

---

## 2. Spatial Architecture

### User Flow Groups
| Group | Entry | Actions | Exit |
|-------|-------|---------|------|
| Reserve Basket | Click checkout | Send to queue, wait for response | View reserved state |
| Cancel Reservation | Click cancel | Send rollback to queue | Return to basket |
| Retry on Error | Click retry | Clear error, re-reserve | View reserved state |

### Component Hierarchy
```
BasketPage
  ReservedBasketView
    CheckoutButton (idle state)
    ReservedBasket (active states)
      ProductList
        ReservedProduct[]
      ActionButtons
        ProceedButton
        ApproveButton
        CancelButton
        RetryButton
    ExpiryTimer
```

---

## 3. Gap Analysis (G-XX)

| ID | Component | Current | Target | Severity |
|----|-----------|---------|--------|----------|
| G-01 | Two-Phase Stock | Direct Sanity patch only | Redis WATCH/MULTI first, then Sanity | Critical |
| G-02 | Circuit Breaker | Implemented in FIFO queue | Working as specified | Implemented |
| G-03 | Idempotency | 24hr storage with fingerprint validation | Working as specified | Implemented |
| G-04 | Priority Queue | FIFO with priority support | Payment realize before regular | Implemented |
| G-05 | Stripe Webhook | Handler exists for checkout.session.completed | Needs reservation token pass-through | Partial |
| G-06 | UI Deduplication | EventDeduplicator component | 1-second debounce, request queue | Implemented |
| G-07 | TTL Auto-Rollback | 10-minute TTL in Redis | Automatic rollback on expiry | Implemented |
| G-08 | Concurrent Operation Guard | Token state machine | One active operation per token | Implemented |

---

## 4. RWD Strategy

| Component | Desktop (1280px) | Mobile (375px) | Implementation |
|-----------|------------------|----------------|----------------|
| ReservedBasketView | Max-w-lg, mx-auto | Full width | Responsive container |
| ActionButtons | Horizontal flex | Stacked vertical | flex-col lg:flex-row |
| ProductList | 2-column grid | 1 column | grid-cols-1 lg:grid-cols-2 |

---

## 5. Files at Risk of Regression

| File | Risk | Mitigation |
|------|------|------------|
| `app/api/checkout/reserve/route.ts` | Stock update logic critical | Verify two-phase pattern |
| `lib/checkout/reservation/fifo-queue.ts` | Core queue logic | Comprehensive test coverage |
| `store/checkout/reservedBasketSlice.ts` | State persistence | Verify localStorage behavior |
| `app/api/webhooks/stripe/route.ts` | Payment integration | Test webhook payload |

---

## 6. Verification Commands

```bash
# Pre-sprint regression
npm run build

# Component verification
npx playwright test tests/checkout/guest-checkout-inventory-reservation/

# Stock integrity verification
node scripts/verify-reservation-stock.mjs
```

---

## 7. Critical Implementation Details

### Stock Fields Implementation
- `stock`: Total inventory (never decremented during reservation)
- `reservedStock`: Currently reserved items
- `availableStock`: Computed as `stock - reservedStock`

### Operations
- **Reservation**: Increment `reservedStock` only
- **Realization** (payment): Decrement both `stock` and `reservedStock`
- **Rollback/Timeout**: Decrement `reservedStock` only

### Missing Critical Requirement
Two-phase stock update pattern with Redis WATCH/MULTI is NOT implemented. Current implementation patches Sanity directly without Redis locking, which violates PRD requirement line 87-88.
