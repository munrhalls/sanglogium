# Manual Verification Evidence
# Date: 2026-04-07T05:20:56.228Z
# Sprint: basket_to_checkout_handshake

## Environment
- Dev server URL: http://localhost:3000
- Sanity Studio: http://localhost:3000/studio
- Browser: Chrome [version]
- User: [logged in/out]

## Test Scenarios Completed

### 1. Happy Path (IDLE -> SUCCESS)
- [ ] Basket loads in IDLE state
- [ ] Checkout button enabled
- [ ] Click checkout -> PROCESSING
- [ ] Processing state shows spinner
- [ ] SUCCESS state reached
- [ ] Redirect to Stripe initiated
- [ ] Network tab: validateBasket called with idempotency key
- Evidence: [screenshot/console logs]

### 2. Network Error (PROCESSING -> ERROR_NETWORK)
- [ ] Network failure simulated
- [ ] 10s timeout triggered
- [ ] ERROR_NETWORK state shown
- [ ] Retry button present
- [ ] Retry generates new idempotency key
- Evidence: [screenshot/console logs]

### 3. Price Validation Error
- [ ] Price mismatch in Sanity vs basket
- [ ] ERROR_VALIDATION state reached
- [ ] PRICE discrepancy banner shown
- [ ] Old vs new prices displayed
- [ ] Accept & Continue button present
- [ ] Accept updates basket prices
- [ ] Re-processing with new prices succeeds
- Evidence: [screenshot/console logs]

### 4. Inventory Shortage Error
- [ ] Stock insufficient in Sanity
- [ ] ERROR_VALIDATION state reached
- [ ] INVENTORY discrepancy banner shown
- [ ] Available quantities displayed
- [ ] Accept & Continue updates quantities
- [ ] Re-processing with updated quantities succeeds
- Evidence: [screenshot/console logs]

### 5. Out of Stock Error
- [ ] Zero stock in Sanity
- [ ] Item removed from basket
- [ ] ERROR_VALIDATION state reached
- [ ] Out of stock message shown
- Evidence: [screenshot/console logs]

### 6. Stripe Configuration Error
- [ ] Invalid Stripe config
- [ ] ERROR_VALIDATION with STRIPE_CONFIG
- [ ] No Accept & Continue button
- [ ] Contact support message shown
- Evidence: [screenshot/console logs]

### 7. Cancel URL Handler
- [ ] Navigate to /basket?checkout=cancelled
- [ ] RESET event fired
- [ ] Lock release API called
- [ ] URL cleaned
- [ ] State returns to IDLE
- Evidence: [screenshot/console logs]

### 8. Component Unmount During Processing
- [ ] Start checkout (PROCESSING state)
- [ ] Navigate away/close tab
- [ ] AbortController triggers
- [ ] No orphaned locks
- Evidence: [console logs]

## State Machine Invariants Verified
- [ ] IDLE -> only START_VALIDATION exits
- [ ] PROCESSING -> always has 10s timer + idempotency key
- [ ] SUCCESS -> always has 5s watchdog + stripeUrl
- [ ] ERROR_NETWORK -> idempotencyKey is null
- [ ] ERROR_VALIDATION -> discrepancy is not null
- [ ] All transitions follow spec

## Final Sign-off
All automated tests: [PASSED/FAILED]
Manual verification: [COMPLETED/PENDING]
State machine invariants: [VERIFIED/PENDING]
No orphaned locks: [VERIFIED/PENDING]

Sprint can be locked: [YES/NO]

Notes:
[Additional observations or issues found]
