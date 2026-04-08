# Manual Verification Setup & Checklist
# Sprint: basket_to_checkout_handshake

## Overview
This document provides the setup instructions and checklist for manual verification of the basket to checkout handshake sprint. Manual verification is crucial for validating the state machine invariants and user experience flows that automated tests cannot fully cover.

## Manual Verification Checklist
## Sprint: basket_to_checkout_handshake

### Setup
- [ ] Run: `node scripts/scenarios/setup-simple.js happy-path`
- [ ] Run: `node scripts/scenarios/setup-simple.js price-mismatch`
- [ ] Run: `node scripts/scenarios/setup-simple.js inventory-shortage`
- [ ] Run: `node scripts/scenarios/setup-simple.js out-of-stock`
- [ ] Run: `node scripts/scenarios/setup-simple.js network-error`

---

## Scenario 1: Happy Path
**Search:** "Test Product Happy Path"

### Steps:
- [ ] Add 2x "Test Product A - Happy Path" to basket
- [ ] Add 1x "Test Product B - Happy Path" to basket
- [ ] Navigate to basket
- [ ] Verify basket shows 3 items, total $250
- [ ] Click Checkout button
- [ ] Verify state: IDLE -> PROCESSING
- [ ] Verify state: PROCESSING -> SUCCESS
- [ ] Verify redirect to Stripe
- [ ] Verify lock release API call

---

## Scenario 2: Price Mismatch
**Search:** "Test Product Price Mismatch"

### Steps:
- [ ] Add 1x "Test Product Price Mismatch" to basket
- [ ] Navigate to basket
- [ ] Click Checkout button
- [ ] Verify state: IDLE -> PROCESSING
- [ ] Verify state: PROCESSING -> ERROR_VALIDATION
- [ ] Verify error shows PRICE discrepancy
- [ ] Verify "Accept & Continue" button appears
- [ ] Click "Accept & Continue"
- [ ] Verify state: ERROR_VALIDATION -> SUCCESS
- [ ] Verify redirect to Stripe

---
  - Click Retry: generates new idempotency key (check Network tab)

#### 2.2 Validation Error - Price Mismatch
- [ ] **Trigger price validation error**
  - Modify product price in Sanity CMS (or use mock data)
  - Add item to basket at old price
  - Attempt checkout
  - Expected: ERROR_VALIDATION state with PRICE discrepancy

- [ ] **PRICE discrepancy UI verification**
  - Error banner shows "Your basket has been updated"
  - Each price-mismatched item shows old vs new price
  - "Accept & Continue" button is present
  - "Update basket" button is present

- [ ] **Accept & Continue flow**
  - Click "Accept & Continue"
  - Basket prices update in UI
  - State returns to PROCESSING with new idempotency key
  - If validation passes: proceeds to SUCCESS

#### 2.3 Validation Error - Inventory Shortage
- [ ] **Trigger inventory validation error**
  - Reduce stock in Sanity CMS below basket quantity
  - Attempt checkout
  - Expected: ERROR_VALIDATION state with INVENTORY discrepancy

- [ ] **INVENTORY discrepancy UI verification**
  - Error banner shows stock availability per item
  - Items with 0 stock show "Out of stock"
  - Items with reduced stock show available quantity
  - "Accept & Continue" button adjusts quantities accordingly

- [ ] **Accept & Continue for inventory**
  - Click "Accept & Continue"
  - Basket quantities update (or items removed if 0 stock)
  - State returns to PROCESSING

#### 2.4 Stripe Configuration Error
- [ ] **Trigger STRIPE_CONFIG error**
  - Use invalid Stripe configuration (test mode)
  - Attempt checkout
  - Expected: ERROR_VALIDATION with STRIPE_CONFIG type

- [ ] **STRIPE_CONFIG error verification**
  - NO "Accept & Continue" button visible
  - "Contact support" message shown
  - Only "Update basket" button available

### Phase 3: Edge Case Verification

#### 3.1 Cancel URL Back-Navigation
- [ ] **Test cancel URL handling**
  - Start checkout flow and reach SUCCESS state
  - Before redirect completes, navigate to: `/basket?checkout=cancelled`
  - Expected: RESET is fired, lock release API called, URL cleaned

- [ ] **Verify lock release**
  - Check Network tab for releaseInventoryLock call
  - State returns to IDLE
  - Basket becomes editable again

#### 3.2 Component Unmount During Processing
- [ ] **Test unmount during PROCESSING**
  - Start checkout, reach PROCESSING state
  - Navigate away from page (or close tab)
  - Expected: AbortController triggers, FAIL_NETWORK handled
  - No orphaned inventory locks

#### 3.3 Browser Back Navigation
- [ ] **Test back navigation from Stripe**
  - Complete checkout to reach Stripe
  - Use browser back button
  - Should land on `/basket?checkout=cancelled`
  - Cancel handler should fire

### Phase 4: State Machine Invariant Verification

#### 4.1 Critical Invariants (use Console logging)
Add temporary console.log to verify these invariants:

```javascript
// In usePreCheckout hook
console.log('State transition:', prevState, '->', newState, 'Context:', context);
```

- [ ] **IDLE invariant**
  - Only START_VALIDATION event can leave IDLE
  - Context is fully reset (all null)

- [ ] **PROCESSING invariant**
  - 10s timer is always active
  - idempotencyKey is never null
  - Only FAIL_NETWORK, FAIL_VALIDATION, or PASS_VALIDATION can exit

- [ ] **SUCCESS invariant**
  - 5s watchdog timer is active
  - stripeUrl is not null
  - RESET triggers fire-and-forget lock release

- [ ] **ERROR_NETWORK invariant**
  - idempotencyKey is null
  - Only START_VALIDATION (retry) or RESET can exit

- [ ] **ERROR_VALIDATION invariant**
  - discrepancy is not null
  - Only RESET or acceptAndContinue (with mutation success) can exit

#### 4.2 Idempotency Key Verification
- [ ] **Fresh key generation**
  - Each START_VALIDATION generates new UUID
  - Check Network tab: each validateBasket call has different key
  - Keys are UUIDv4 format (length 36, hyphens)

#### 4.3 Lock Release Verification
- [ ] **Fire-and-forget lock release**
  - RESET from SUCCESS calls releaseInventoryLock
  - Call is NOT awaited (fire-and-forget)
  - State transition completes regardless of API response

## Test Data Scenarios

### Scenario 1: Happy Path
```
Basket: 2 items
- Item A: $100, stock 10, quantity 2
- Item B: $50, stock 5, quantity 1
Expected: SUCCESS -> Stripe redirect
```

### Scenario 2: Price Mismatch
```
Basket: Item A at $100 (old price)
Sanity: Item A at $120 (new price)
Expected: ERROR_VALIDATION PRICE
```

### Scenario 3: Inventory Shortage
```
Basket: Item B quantity 3
Sanity: Item B stock 2
Expected: ERROR_VALIDATION INVENTORY
```

### Scenario 4: Out of Stock
```
Basket: Item C quantity 1
Sanity: Item C stock 0
Expected: ERROR_VALIDATION INVENTORY (item removed)
```

## Debug Tools & Commands

### Console Commands for Verification
```javascript
// Check current state (expose hook to window)
window.checkoutState = { state, context };

// Force state transition (for testing only)
window.forceCheckoutEvent = { type: "RESET" };

// Monitor all events
console.log('All checkout events:', events);
```

### Network Tab Filters
- Filter by `validateBasket` to see validation requests
- Filter by `releaseInventoryLock` to see lock releases
- Check request headers for `Stripe-Idempotency-Key`

### Browser DevTools Settings
- Disable cache (for testing)
- Preserve log during navigation
- Set network throttling as needed

## Common Issues & Solutions

### Issue: State doesn't transition
- Check: Console for JavaScript errors
- Verify: All required dependencies are imported
- Ensure: Server action boundaries are correct

### Issue: Lock not released
- Verify: releaseInventoryLock API is being called
- Check: Network tab for the request
- Ensure: idempotencyKey is not null when calling

### Issue: Redirect doesn't happen
- Verify: stripeUrl is not null in SUCCESS state
- Check: window.location.assign is called
- Ensure: Pop-up blockers are disabled

### Issue: Retry doesn't work
- Verify: New idempotency key is generated
- Check: START_VALIDATION event is dispatched
- Ensure: ERROR_NETWORK state is correctly set

## Sign-off Criteria

The sprint can be locked when:

1. **All automated tests pass** (as per sprint criteria)
2. **Manual verification completed** for:
   - Happy path (IDLE -> SUCCESS)
   - All error states (NETWORK, VALIDATION types)
   - Edge cases (cancel, unmount, back navigation)
3. **State machine invariants verified** via console logging
4. **No orphaned locks** in any scenario
5. **UI behaves correctly** in all states (desktop + mobile)

## Evidence Collection

During manual verification, collect:
- Screenshots of each state
- Console logs showing state transitions
- Network tab screenshots showing API calls
- Video of critical flows (optional but recommended)

Store evidence in: `screenshots/manual-verification-[date]/`
