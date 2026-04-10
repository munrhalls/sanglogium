# UX Flows - Checkout Reservation System

## Primary User Flow

1. **User adds item to basket**
   - Item appears in basket UI
   - Stock shows available quantity

2. **User clicks checkout**
   - Basket becomes locked
   - Stock quantity decreases (e.g., 10 -> 8)
   - Processing indicator shows

3. **System validates and reserves**
   - Checks prices match current prices
   - Reserves stock for 15 seconds
   - Creates Stripe session

4. **User goes to Stripe**
   - Redirected to Stripe payment page
   - Stock remains reserved

5. **Payment completes OR fails**
   - If success: Order confirmed, stock permanently reduced
   - If fails/cancelled: Stock reservation released (8 -> 10)

## Edge Cases (Handle later)

- Price changed between basket and checkout
- Stock sold out during checkout
- Network timeout during validation
- User closes browser during checkout

## That's It

Nothing else. Just the user interaction flow.
