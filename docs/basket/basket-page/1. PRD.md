# Feature: Basket Page

## Perspective
User reviewing basket items on dedicated basket page

## 1. Objective
User confirms item details, edits quantities, and proceeds to checkout.

## 2. Scope Boundaries

### In Scope
- Item display (image, title, price, quantity, item total)
- Basket sub-total and total cost
- Quantity adjustments (increase, decrease) and item removal
- Empty state
- Checkout progression

### Out Scope
- System implementation, network handling, or sync logic
- Adding products
- Checkout and payment flows

## 3. Definition of Done (DoD)

### User Sees & Edits basket items on basket page 
- [x] DoD [1]: I see my basket items, sub-total, and total cost.
- [x] DoD [2]: I can increase (up to available stock), decrease (up to 1), or remove items, which updates my totals instantly.
- [x] DoD [3]: I see a clear empty state if I have no items.
- [x] DoD [4]: If some or all items are unavailable, I see which items are not available, and which are available.
- [x] DoD [5]: After I refresh page, I see my basket data unchanged. 
