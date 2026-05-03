// Temporary reference: Good frontend patterns from AddToCartButton
// Purpose: Preserve HTML structure, layout, styling for BasketControls implementation
// Source: app/components/ui/AddToCartButton.tsx

// === BUTTON STRUCTURE (Add button) ===
// Good pattern: button with icon, label, proper aria labels
/*
<button
  onClick={handleAdd}
  className={`btn-cart transition-all active:scale-95 ${className}`}
  aria-label={`Add ${name} to cart`}
>
  <ShoppingCartIcon size={18} weight="regular" />
  {shortLabel ? (
    <>
      <span className={`hidden md:block ${labelClassName}`}>{label}</span>
      <span className={`md:hidden ${labelClassName}`}>{shortLabel}</span>
    </>
  ) : (
    <span className={labelClassName}>{label}</span>
  )}
</button>
*/

// === QUANTITY CONTROLS STRUCTURE (Increment/Decrement) ===
// Good pattern: flex container with buttons and quantity display
// Already exists in AddToCartButton as commented code (lines 82-111)
/*
<div
  className="flex items-center gap-1"
  onClick={stop}
  role="group"
  aria-label={`${name} quantity controls`}
>
  <button
    onClick={handleDecrement}
    className="btn-secondary w-8 h-8 flex items-center justify-center text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    aria-label="Decrease quantity"
  >
    −
  </button>
  <span
    className="w-7 text-center type-body text-primary tabular-nums"
    role="status"
    aria-live="polite"
  >
    {item.quantity}
  </span>
  <button
    onClick={handleIncrement}
    disabled={item.quantity >= (stock ?? 99)}
    className="btn-secondary w-8 h-8 flex items-center justify-center text-sm disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    aria-label="Increase quantity"
  >
    +
  </button>
</div>
*/

// === KEY STYLING PATTERNS ===
// btn-cart class - existing cart button styling
// btn-secondary class - existing secondary button styling
// transition-all active:scale-95 - interaction feedback
// w-8 h-8 - consistent button sizing
// flex items-center gap-1 - proper spacing
// focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 - accessibility
// disabled:opacity-50 - disabled state
// type-body text-primary tabular-nums - typography
