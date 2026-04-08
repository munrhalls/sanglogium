# Manual Verification Quick Reference
# Sprint: basket_to_checkout_handshake

## Setup Checklist
- [ ] Dev server running: http://localhost:3000
- [ ] Browser DevTools open (F12)
- [ ] Console tab visible
- [ ] Network tab visible (filter: validateBasket, releaseInventoryLock)
- [ ] Test data ready (2-3 products in basket)

## Critical State Machine Invariants to Verify

### 1. IDLE State
- [ ] Checkout button enabled
- [ ] All basket controls interactive
- [ ] No error messages
- [ ] URL clean (no ?checkout=cancelled)

### 2. IDLE -> PROCESSING
- [ ] Click Checkout button
- [ ] Button becomes disabled immediately
- [ ] "Processing..." text appears
- [ ] All basket controls disabled
- [ ] Network tab: validateBasket called with Stripe-Idempotency-Key header

### 3. PROCESSING State
- [ ] 10-second timeout active
- [ ] idempotencyKey present in context
- [ ] Only FAIL_NETWORK, FAIL_VALIDATION, or PASS_VALIDATION can exit

### 4. PROCESSING -> SUCCESS (Happy Path)
- [ ] State transitions to SUCCESS
- [ ] "Redirecting to payment..." message
- [ ] window.location.assign called (check Console)
- [ ] Stripe URL is valid
- [ ] 5-second watchdog timer starts

### 5. SUCCESS State
- [ ] 5s watchdog active
- [ ] stripeUrl not null
- [ ] No buttons visible
- [ ] Lock release ready for RESET

### 6. SUCCESS -> ERROR_NETWORK (Watchdog)
- [ ] Wait 5+ seconds
- [ ] State transitions to ERROR_NETWORK
- [ ] "Connection failed" message
- [ ] Retry button appears

### 7. ERROR_NETWORK State
- [ ] idempotencyKey is null
- [ ] Only START_VALIDATION (retry) or RESET can exit
- [ ] Retry generates fresh idempotency key

### 8. Price Validation Error
- [ ] Change product price in Sanity
- [ ] Attempt checkout
- [ ] ERROR_VALIDATION state reached
- [ ] PRICE discrepancy banner shows old vs new prices
- [ ] "Accept & Continue" button present
- [ ] "Update basket" button present

### 9. Accept & Continue (Price)
- [ ] Click "Accept & Continue"
- [ ] Basket prices update in UI
- [ ] State returns to PROCESSING
- [ ] Fresh idempotency key generated

### 10. Inventory Validation Error
- [ ] Reduce stock in Sanity below basket quantity
- [ ] Attempt checkout
- [ ] ERROR_VALIDATION with INVENTORY type
- [ ] Available quantities shown
- [ ] Items with 0 stock removed

### 11. Stripe Config Error
- [ ] Invalid Stripe config
- [ ] ERROR_VALIDATION with STRIPE_CONFIG
- [ ] NO "Accept & Continue" button
- [ ] "Contact support" message

### 12. Cancel URL Handler
- [ ] Navigate to /basket?checkout=cancelled
- [ ] If in SUCCESS state: RESET fired
- [ ] Lock release API called
- [ ] URL cleaned
- [ ] State returns to IDLE

### 13. Component Unmount During Processing
- [ ] Start checkout (PROCESSING)
- [ ] Navigate away/close tab
- [ ] AbortController triggers FAIL_NETWORK
- [ ] No orphaned locks

## Test Data Scenarios

### Happy Path
```
Basket: 2 items
- Product A: $100, stock 10, qty 2
- Product B: $50, stock 5, qty 1
Expected: SUCCESS -> Stripe redirect
```

### Price Mismatch
```
Basket: Product A at $100
Sanity: Product A at $120
Expected: ERROR_VALIDATION PRICE
```

### Inventory Shortage
```
Basket: Product B qty 3
Sanity: Product B stock 2
Expected: ERROR_VALIDATION INVENTORY
```

## Browser DevTools Commands
```javascript
// Monitor state (if exposed)
window.checkoutState

// Monitor events (if exposed)
window.checkoutEvents

// Check network requests
// Filter: validateBasket, releaseInventoryLock
// Check headers: Stripe-Idempotency-Key
```

## Evidence Collection
- Screenshots of each state
- Console logs showing transitions
- Network tab screenshots
- Store in: screenshots/manual-verification-[date]/

## Sign-off
All automated tests: PASSED
Manual verification: [ ]
State machine invariants: [ ]
No orphaned locks: [ ]

Sprint ready to lock: [YES/NO]
