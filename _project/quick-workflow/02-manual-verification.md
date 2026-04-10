# Manual Verification Plan - Checkout Reservation

## Basic Stock Reservation Test

### Setup
1. Open browser to product page
2. Add 2 units of test-item-1 to basket
3. Go to basket page
4. Open new tab: `http://localhost:3000/api/stock-check?product=test-item-1`
5. Note: Stock should show 10

### Test Steps
1. **Click checkout button**
   - Basket shows "Processing..."
   - Stock check shows: 8 (10 - 2 reserved)

2. **Wait 15 seconds**
   - Timer on phone: 15 seconds
   - Stock check shows: 10 (reservation expired)

3. **Repeat to verify**
   - Click checkout again
   - Stock check shows: 8
   - Wait 15 seconds
   - Stock check shows: 10

### Success Criteria
- Stock decreases immediately on checkout click
- Stock returns after 15 seconds
- No errors in browser console
- Basket returns to editable state

## Tools Needed
- Browser with product page
- Stock check endpoint (simple API)
- Timer (phone stopwatch)

## That's It

No complex setup. Just browser and stock check.
