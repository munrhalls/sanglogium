3 "Golden" Questions to ensure the user isn't hurt:

Exchange: Did money actually leave the user and reach us?

Fulfillment: Did we create a persistent record of that order immediately?

Feedback: Did the user get confirmation (or a specific error message) so they don't panic-click and pay twice?

Pre-Payment (Accuracy):

Inventory: Is the item actually in stock right now (server-side check), or did they buy a "ghost" item?

Totals: Is the math (Subtotal + Shipping + Tax - Discount) identical on Client and Server?

Payment (The Danger Zone): 3. Idempotency: If the user clicks "Pay" twice (or network lags), do we accidentally charge them twice? 4. Validation: Do we catch "Invalid Card" / "Expired" errors and show them clearly, or does the app crash/hang?

Post-Payment (Closure): 5. Persistence: If the user closes the tab the second payment succeeds, is the order saved in the DB? 6. State Reset: Is the cart emptied locally so they don't think they still need to buy it?

3. Integration Tests (The Logic & Math)
   Focus: Speed, Math, State Management. Mock the external world.

These tests should run in your /(store)/checkout/**tests** or similar integration folder.

Test A: The "Cart Calculator" (Crucial)

Input: Cart with 2 items, 1 discount code, standard shipping.

Assertion: finalTotal equals exactly $105.50.

Why: Prevents "price drift" between what user sees and what they pay.

Test B: Form Validation State

Input: User enters invalid email or misses ZIP code.

Assertion: "Pay" button remains disabled OR clicking it reveals specific error text.

Why: UX frustration prevention.

Test C: The "Graceful Fail" (Mocked API)

Input: Mock the Payment API to return 500 Server Error.

Assertion: App displays "Payment Service Unavailable" (does not crash to white screen).

Why: Handling the Sad Path.

4. E2E Tests (The Critical User Journey)
   Focus: The "Happy Path" and Critical Connectors. Use Playwright/Cypress.

Do not test every validation error here. Test the flow.

Test A: The "Guest Checkout" (The Standard Flow)

Add item to cart -> Go to Checkout.

Fill Guest Address -> Fill Fake Credit Card (Stripe Test Mode).

Click Pay.

Wait for URL change to /order-confirmation.

Verify "Thank you for your order" text exists.

Test B: The "Out of Stock" Intercept

Add item -> Wait 1 second (Simulate API setting stock to 0).

Go to Checkout.

Verify User is blocked/alerted "Item no longer available" before payment.
