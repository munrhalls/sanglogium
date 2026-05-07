# Feature: Non-Local Basket
**Perspective:** User adding items to basket from product pages across the site

## 1. Objective
I add products to my basket from any page and see my basket count update, with my items preserved when I return.

## 2. Scope Boundaries
**In Scope:**
- Add to basket buttons on product pages
- Quantity increase/decrease controls on basket items
- Remove item from basket action
- Header basket count indicator
- Basket items visible across page reloads

**Out Scope:**
- Storage mechanisms and state management
- Tab synchronization logic
- Backend syncing and network calls
- Stock validation beyond UI feedback

## 3. Definition of Done (DoD)

### Adding Items
- **[ ] DoD [1]:** I see an add to basket button on product pages
- **[ ] DoD [2]:** After clicking add to basket, I see the header count increase by 1
- **[ ] DoD [3]:** I see the product appear in my basket with quantity 1

### Managing Items
- **[ ] DoD [4]:** I can increase the quantity of items in my basket up to available stock
- **[ ] DoD [5]:** I can decrease the quantity of items in my basket
- **[ ] DoD [6]:** When I decrease quantity to 0, I see the item removed from my basket
- **[ ] DoD [7]:** After reloading any page, I see my basket items and quantities unchanged
- **[ ] DoD [8]:** After clicking the header basket indicator, I see the dedicated basket page
