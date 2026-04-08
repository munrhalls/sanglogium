# Manual Verification - Reservation System
## Lock Release Mechanism

### Overview
This manual verification tests the reservation system and lock release mechanism. It complements the automated tests by providing a hands-on way to verify the system works correctly in real browser scenarios.

### Quick Setup (One-time)

1. **Create test products:**
   ```bash
   node tests/manual/setup-test-products.js
   ```

2. **Optional: Add browser helper:**
   - Copy contents of `tests/manual/browser-helper.js`
   - Paste in browser console on product pages
   - Shows live stock/reservation status in top-right corner

### Test Scenarios

---

## Scenario 1: Basic Reservation & Expiration
**Goal:** Verify stock is reserved and released after expiration

### Steps:
1. Navigate to: http://localhost:3000/product/test-item-1
2. Add 2x "Test Product 1" to basket
3. Navigate to basket
4. **Verify:** Stock shows 10, Reserved shows 0
5. Click Checkout button
6. **Verify:** Stock shows 8, Reserved shows 2
7. Wait 15 seconds (reservation expiration time)
8. Refresh basket page
9. **Verify:** Stock shows 10, Reserved shows 0
10. **Verify:** Can add the same items again

---

## Scenario 2: Back Button Abandonment
**Goal:** Verify reservation persists when user goes back

### Steps:
1. Navigate to: http://localhost:3000/product/test-item-1
2. Add 2x "Test Product 1" to basket
3. Navigate to basket
4. Click Checkout button
5. **Verify:** Stock shows 8, Reserved shows 2
6. Click browser back button
7. **Verify:** Stock still shows 8, Reserved still shows 2
8. Navigate back to basket
9. Click Checkout again
10. **Verify:** No additional reservation (still 2 reserved)
11. Wait 15 seconds
12. **Verify:** Stock returns to 10, Reserved returns to 0

---

## Scenario 3: Tab Close & Reopen
**Goal:** Verify reservation persists across tab sessions

### Steps:
1. Navigate to: http://localhost:3000/product/test-item-1
2. Add 2x "Test Product 1" to basket
3. Navigate to basket
4. Click Checkout button
5. **Verify:** Stock shows 8, Reserved shows 2
6. Close the browser tab
7. Open new tab
8. Navigate to: http://localhost:3000/basket
9. **Verify:** Items still in basket
10. **Verify:** Stock still shows 8, Reserved still shows 2
11. Wait 15 seconds
12. **Verify:** Stock returns to 10, Reserved returns to 0

---

## Scenario 4: Multiple Rapid Checkouts
**Goal:** Verify no double reservations on retry

### Steps:
1. Navigate to: http://localhost:3000/product/test-item-1
2. Add 2x "Test Product 1" to basket
3. Navigate to basket
4. Click Checkout button
5. **Verify:** Stock shows 8, Reserved shows 2
6. Rapidly click Checkout 3 more times (within 2 seconds)
7. **Verify:** Stock still shows 8, Reserved still shows 2 (no double counting)
8. Wait 15 seconds
9. **Verify:** Stock returns to 10, Reserved returns to 0

---

## Scenario 5: Multiple Products
**Goal:** Verify independent reservations for different products

### Steps:
1. Navigate to: http://localhost:3000/product/test-item-1
2. Add 2x "Test Product 1" to basket
3. Navigate to: http://localhost:3000/product/test-item-2
4. Add 1x "Test Product 2" to basket
5. Navigate to basket
6. **Verify:** Both items in basket
7. Click Checkout button
8. **Verify:**
   - Test Product 1: Stock 8, Reserved 2
   - Test Product 2: Stock 9, Reserved 1
9. Wait 15 seconds
10. **Verify:**
   - Test Product 1: Stock 10, Reserved 0
   - Test Product 2: Stock 10, Reserved 0

---

## Scenario 6: Background Job Cleanup
**Goal:** Verify background job cleans expired reservations

### Steps:
1. Navigate to: http://localhost:3000/product/test-item-1
2. Add 2x "Test Product 1" to basket
3. Navigate to basket
4. Click Checkout button
5. **Verify:** Stock shows 8, Reserved shows 2
6. Wait 15 seconds
7. Run background job manually:
   ```bash
   node scripts/clean-expired-reservations.mjs
   ```
8. **Verify:** Stock shows 10, Reserved shows 0

---

## Cleanup (After Testing)
```bash
node tests/manual/cleanup-test-products.js
```

### Verification:
- All test products deleted from Sanity
- No leftover reservations
- System ready for next test session
