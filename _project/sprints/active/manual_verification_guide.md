# Manual Verification Guide
## Sprint: basket_to_checkout_handshake

### Quick Start

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:** http://localhost:3000/basket

3. **Open DevTools:** F12, go to Console tab

4. **Load test helpers:**
   ```javascript
   // Load UI test helpers
   fetch('/ui-test-helpers.js').then(r=>r.text()).then(eval)

   // Load mock for validateBasket responses
   fetch('/test-mock.js').then(r=>r.text()).then(eval)
   ```

### Test Scenarios

#### 1. Happy Path
```bash
node scripts/manual-test-scenarios.js happy-path
```
Then in browser console:
```javascript
uiTestHelpers.setupHappyPath()
// This will navigate you to /products/headphones/closed-back
// Add 2-3 products from the UI
// Go to /basket
// Click checkout
```

#### 2. Price Mismatch
```bash
node scripts/manual-test-scenarios.js price-mismatch
```
Then in browser console:
```javascript
testHelpers.setupPriceMismatch()
// Click checkout button
```

#### 3. Inventory Shortage
```bash
node scripts/manual-test-scenarios.js inventory-shortage
```
Then in browser console:
```javascript
testHelpers.setupInventoryShortage()
// Click checkout button
```

#### 4. Network Error
```bash
node scripts/manual-test-scenarios.js network-error
```
Then in browser console:
```javascript
testHelpers.addProductA()
// Click checkout button, wait 10+ seconds
```

#### 5. Out of Stock
```bash
node scripts/manual-test-scenarios.js out-of-stock
```
Then in browser console:
```javascript
testHelpers.setupOutOfStock()
// Click checkout button
```

#### 6. Cancel URL Handler
```bash
node scripts/manual-test-scenarios.js cancel-url
```
First complete happy path, then:
```javascript
// Navigate to: http://localhost:3000/basket?checkout=cancelled
```

### What to Verify

For each scenario, check:
- [ ] State transitions in console logs
- [ ] UI updates match expected state
- [ ] Error messages are correct
- [ ] Network calls have correct headers
- [ ] Idempotency keys are generated
- [ ] Lock release fires on SUCCESS -> RESET

### Console Log Pattern

You should see logs like:
```
State: IDLE
MOCK: validateBasket called with key: 1234abcd-...
State: PROCESSING
State: SUCCESS (or ERROR_...)
```

### Evidence Collection

Take screenshots of:
- Each state (IDLE, PROCESSING, ERROR_VALIDATION, etc.)
- Console logs showing transitions
- Network tab with API calls

Store in: `screenshots/manual-verification-[date]/`

### Complete Checklist

- [ ] Happy Path: IDLE -> PROCESSING -> SUCCESS
- [ ] Price Error: ERROR_VALIDATION with PRICE
- [ ] Inventory Error: ERROR_VALIDATION with INVENTORY
- [ ] Network Error: 10s timeout -> ERROR_NETWORK
- [ ] Out of Stock: Item removed automatically
- [ ] Cancel URL: ?checkout=cancelled -> RESET
- [ ] Lock release: SUCCESS -> RESET fires API
- [ ] Fresh idempotency keys on retry

### Done?

All automated tests: PASSED
Manual verification: COMPLETE
Sprint ready to lock: YES
