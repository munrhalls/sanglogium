# Manual Verification Summary

## What's Been Created

### 1. **Main Documentation** (`tests/manual/reservation-system.md`)
- 6 comprehensive test scenarios
- Step-by-step verification instructions
- Expected outcomes for each scenario

### 2. **Setup Scripts**
- `setup-test-products.js` - Creates test products (10 stock each)
- `cleanup-test-products.js` - Removes test products
- `check-reservations.js` - Shows current reservation status

### 3. **Helper Tools**
- `browser-helper.js` - JavaScript snippet for browser console
- Shows live stock/reservation status while testing

## Test Scenarios Covered

1. **Basic Reservation & Expiration**
   - Stock reserved on checkout
   - Stock released after 15 seconds

2. **Back Button Abandonment**
   - Reservation persists when going back
   - No double reservation on retry

3. **Tab Close & Reopen**
   - Reservation persists across tab sessions
   - Basket items remain available

4. **Multiple Rapid Checkouts**
   - No double reservations on rapid clicks
   - Single reservation maintained

5. **Multiple Products**
   - Independent reservations per product
   - Proper stock tracking for each

6. **Background Job Cleanup**
   - Manual verification of cleanup script
   - Stock release confirmation

## Quick Usage

```bash
# 1. Setup
node tests/manual/setup-test-products.js

# 2. Run scenarios from reservation-system.md

# 3. Check status anytime
node tests/manual/check-reservations.js

# 4. Cleanup
node tests/manual/cleanup-test-products.js
```

## Synchronization with Automated Tests

The manual verification complements the automated E2E tests:
- Automated tests verify logic and edge cases
- Manual tests verify real user experience
- Both use same test products and reservation system
- Consistent 15-second expiration time (production)

## Notes

- Test products use IDs: `test-item-1`, `test-item-2`
- URLs: http://localhost:3000/product/test-item-1
- Reservation expiration: 15 seconds
- Background job: `scripts/clean-expired-reservations.mjs`
