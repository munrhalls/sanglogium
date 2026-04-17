# Manual Verification Checklist

## Manual Human Verification Points

### Before Test
1. **Sanity Stock Verification**
   - Open Sanity Studio
   - Check actual stock counts for test products
   - Verify all required fields are present (stripePriceId, name, etc.)
   - Confirm products are published and live

2. **Redis State Check**
   - Connect to Redis
   - Verify no existing reservation keys
   - Check Redis is healthy and accepting connections

3. **UI State Reset**
   - Clear browser localStorage
   - Refresh basket page
   - Verify empty basket state

### During Test - Step 1 (Create Reservation)
1. **Button State**
   - Click checkout once -> button becomes disabled
   - Try clicking again -> no duplicate request
   - Check button shows "Processing..." text

2. **Network Request**
   - Open browser dev tools
   - Verify single POST request to `/api/checkout/reserve`
   - Check request includes idempotency key
   - Verify response contains reservation token

3. **UI Response**
   - Verify reserved basket appears
   - Check product quantities match request
   - Verify "Proceed to next step" appears for full stock

### During Test - Step 2 (Stock Decrement)
1. **Stock Accuracy**
   - Manually check Sanity stock before test
   - Request more than available
   - Verify response shows only available quantities
   - Check UI shows "We've had to revise your basket" message

2. **UI Elements**
   - Verify "Approve & Proceed" button appears
   - Verify "Cancel" button appears
   - Check product list shows decremented quantities

### During Test - Step 3 (Out of Stock)
1. **Zero Stock Handling**
   - Set product stock to 0 in Sanity
   - Add to basket and checkout
   - Verify response shows 0 reserved quantity
   - Check UI shows "out of stock" message

2. **No Proceed Option**
   - Verify no "Approve" button appears
   - Check only option is to go back
   - Verify clear error message displayed

### During Test - Step 4 (Cancel and Rollback)
1. **Cancel Dialog**
   - Click cancel -> confirmation appears
   - Verify dialog text is clear
   - Test both "Keep" and "Cancel" options

2. **Stock Restoration**
   - After cancellation, check Sanity stock
   - Verify counts restored to original
   - Check Redis for reservation key deletion

3. **UI Reset**
   - Verify reserved basket cleared
   - Checkout button enabled again
   - Can start new reservation

### After Test - Data Integrity
1. **Sanity Verification**
   - All test products have correct stock
   - No orphaned reservations exist
   - All required fields present

2. **Redis Cleanup**
   - No expired reservation keys
   - Circuit breaker state normal
   - Idempotency cache clean

## Test Product Setup Requirements

### Essential Product Fields (No Missing Schema)
- `stripePriceId` (must match live Stripe prices)
- `name` (display name)
- `slug` (URL path)
- `stock` (numeric quantity)
- `price` (in cents/PLN)
- `brand` (reference to brand document)
- `imageUrl` (product image)
- `description` (product description)

### Test Product Scenarios
1. **Product A**: Stock 5, all fields complete
2. **Product B**: Stock 2, all fields complete  
3. **Product C**: Stock 0, all fields complete
4. **Product D**: Stock 1, missing imageUrl (test field validation)
5. **Product E**: Stock 3, missing stripePriceId (test incompatibility)

### Verification Checklist
- [ ] All products have valid stripePriceId
- [ ] Brand references exist and are published
- [ ] Image URLs are accessible
- [ ] Stock counts are accurate
- [ ] Prices match Stripe catalog
- [ ] No schema validation errors
- [ ] Products are published (not draft)
