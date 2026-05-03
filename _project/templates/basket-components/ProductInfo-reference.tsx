// Temporary reference: Good frontend patterns from ProductInfo
// Purpose: Preserve HTML structure, layout, styling for BasketControls implementation
// Source: app/components/features/products/ProductInfo.tsx

// === LARGE ADD BUTTON STRUCTURE ===
// Good pattern: large cart button with icon, proper disabled state
/*
<button
  onClick={handleAddToCart}
  disabled={product.stock === 0}
  data-testid={`add-to-basket-${product._id}`}
  className="btn-cart-large w-full flex justify-center"
>
  <ShoppingCartIcon size={24} weight="bold" />
  {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
</button>
*/

// === IN-CART STATE STRUCTURE ===
// Good pattern: check icon button showing quantity in cart
/*
<button
  disabled
  className="btn-in-basket-large w-full flex justify-center"
>
  <CheckIcon size={20} weight="bold" />
  {basketItem.quantity} in Cart
</button>
*/

// === QUANTITY CONTROLS WITH LABEL ===
// Good pattern: label + QuantitySelector component
/*
<div className="flex items-center gap-4">
  <span className="type-body text-secondary">In cart:</span>
  <QuantitySelector
    quantity={basketItem.quantity}
    min={0}
    max={product.stock}
    onIncrement={handleBasketIncrement}
    onDecrement={handleBasketDecrement}
    size="md"
  />
</div>
*/

// === KEY STYLING PATTERNS ===
// btn-cart-large - large cart button styling
// btn-in-basket-large - in-basket state styling
// w-full flex justify-center - full width, centered content
// disabled - proper disabled state handling
// data-testid - testability
// type-body text-secondary - label typography
