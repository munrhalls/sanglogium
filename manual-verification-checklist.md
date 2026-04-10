# Manual Verification Checklist - Scope Contract 1
## Date: 2026-04-10

### Pre-conditions:
- [x] Build passes
- [x] Dev server running on http://localhost:3001
- [ ] Basket has at least one item

### Verification Steps:

#### Step 1: Navigate to Basket Page
- URL: http://localhost:3001/basket
- Expected: Basket page loads with items
- Actual: _______________

#### Step 2: Check Initial State
- Expected: Checkout button is enabled (no "Basket Issues" message)
- Expected: Panel shows IDLE state (data-testid="panel-idle")
- Actual: _______________

#### Step 3: Click Checkout Button
- Action: Click the "Checkout" button
- Expected: Button becomes disabled with "Processing..." text
- Expected: Console logs "Checkout button clicked"
- Expected: Console logs "Idempotency key: checkout_..."
- Actual: _______________

#### Step 4: Verify Navigation
- Expected: After 1-2 seconds, navigates to /checkout/address
- Expected: URL changes to http://localhost:3001/checkout/address
- Actual: _______________

#### Step 5: Check FSM State
- Expected: FSM state resets to 'idle' for address slice
- Expected: Idempotency key is preserved in context
- Actual: _______________

### Test Results:
- [ ] Pass: Checkout button generates idempotency key
- [ ] Pass: Button disables during processing
- [ ] Pass: Navigation to address page successful
- [ ] Pass: FSM state transitions correctly

### Issues Found:
- _________________________________________________
- _________________________________________________

### Overall Result:
- [ ] PASS - All verification steps successful
- [ ] FAIL - Issues identified

### Notes:
- Manual verification performed by: _______________
- Browser used: _______________
- Time: _______________
