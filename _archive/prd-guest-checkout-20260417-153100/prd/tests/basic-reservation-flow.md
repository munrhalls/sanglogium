# Basic Reservation Flow Test

## Test 1: Basic Reservation Flow

### Setup
- Start with known stock counts in Sanity
- Clear any existing reservations
- Open browser to basket page

### Test Steps

**Step 1: Create Reservation**
1. Add 2 items to basket (both in stock)
2. Click checkout button
3. Verify button becomes disabled
4. Wait for response
5. Verify reservation token is returned
6. Verify reserved basket shows both items
7. Verify UI shows "proceed to next step" (full availability)

**Step 2: Stock Decrement Scenario**
1. Add 3 items to basket (only 2 in stock)
2. Click checkout button
3. Wait for response
4. Verify reserved basket shows only 2 items
5. Verify UI shows stock decrement message
6. Verify "Approve & Proceed" and "Cancel" buttons appear

**Step 3: Out of Stock Scenario**
1. Add 1 item to basket (0 in stock)
2. Click checkout button
3. Wait for response
4. Verify reserved basket shows 0 items
5. Verify UI shows "out of stock" message
6. Verify no proceed button appears

**Step 4: Cancel and Rollback**
1. Start with valid reservation
2. Click cancel button
3. Verify confirmation dialog appears
4. Confirm cancellation
5. Wait for response
6. Verify reserved basket is cleared
7. Verify stock counts restored in Sanity
8. Verify checkout button is enabled again

### Verification Points
- Check actual stock counts in Sanity before/after
- Verify Redis TTL key is created/cleaned up
- Check queue processing logs
- Verify no duplicate requests sent
- Test UI button states throughout flow

### Test Data Cleanup
- Cancel any test reservations
- Restore original stock counts
- Clear Redis keys
- Reset UI state
