# Basket Component Reference Patterns

This document extracts GOOD frontend patterns from legacy basket implementation for reference when building new basket components using core-building-pattern.

## BasketControls - Quantity and Remove Button

**Structure:**
- Wrapper div with flex layout
- QuantitySelector component
- Remove button with X icon

**Layout (Layer 2):**
- `flex items-center gap-3` - horizontal layout with gap
- Remove button: `w-8 h-8 flex items-center justify-center` - centered icon

**Surface (Layer 3):**
- Remove button colors: `text-secondary-500`, `hover:text-error-500`, `hover:bg-error-500/10`
- Disabled state: `pointer-events-none opacity-50`
- Border radius: `rounded-sm`

**Interaction (Layer 4):**
- Remove button: `transition-colors duration-200`, `hover:text-error-500`, `hover:bg-error-500/10`
- Focus states: `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500`
- ARIA attributes: `aria-disabled`, `aria-label`, `data-testid`

## BasketItemsTable - Product List Table

**Structure:**
- Header row (desktop only)
- Item rows with 4 columns: Product, Price, Qty, Total
- Each item row contains: Product image, name, link, price, quantity controls, total

**Layout (Layer 2):**
- Grid layout: `grid grid-cols-1 lg-desktop:grid-cols-[3fr_1fr_1fr_1fr] lg-touch:grid-cols-[3fr_1fr_1fr_1fr]`
- Item row: `grid grid-cols-1 gap-5` (mobile), `grid-cols-[3fr_1fr_1fr_1fr]` (desktop)
- Product column: `flex items-center gap-5`
- Image container: `h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm`
- Price/Qty/Total columns: `hidden lg-desktop:flex lg-touch:flex items-center justify-center` (price/qty), `justify-end` (total)

**Surface (Layer 3):**
- Borders: `border-b border-border-secondary`
- Padding: `px-6 py-3` (header), `p-5` (items)
- Typography: `type-caption uppercase tracking-editorial text-secondary-500` (headers)
- Link hover: `hover:text-brand-100 transition-colors`
- Image background: `bg-surface-productImage`

**Interaction (Layer 4):**
- Item row: `transition-all duration-200 hover:bg-secondary-900/50`
- Remove animation: `opacity-0 max-h-0 overflow-hidden py-0 px-5 border-b-0` with custom transition

## BasketSummary - Summary Panel

**Structure:**
- Header (h2)
- Status messages (empty basket, invalid quantities)
- Summary rows (subtotal, shipping, tax, total)
- Checkout button
- Continue shopping button

**Layout (Layer 2):**
- Header: `border-b border-secondary pb-4 mb-6`
- Status messages: `mb-4 p-3`
- Summary rows: `space-y-4` (vertical spacing)
- Total section: `border-t border-secondary pt-4`
- Buttons: `mt-3 py-3 w-full` (full width)

**Surface (Layer 3):**
- Status messages: `bg-gray-50 border border-gray-200 rounded-lg` (empty), `bg-red-50 border border-red-200 rounded-lg` (error)
- Typography: `type-section-sub` (headers), `type-body` (body), `type-caption text-caption mt-1` (subtext)
- Colors: `text-secondary-400` (labels), `text-green-600` (free shipping)
- Button: `btn-secondary` (continue shopping)

**Interaction (Layer 4):**
- Button: `hover:` states (defined in btn-secondary class)

## EmptyBasket - Empty State

**Structure:**
- Centered container
- Shopping cart icon
- Heading (h2)
- Description paragraph
- Browse products button

**Layout (Layer 2):**
- Container: `card-base flex flex-col items-center justify-center p-8 lg-desktop:p-12 lg-touch:p-12`
- Icon: `mb-6` (margin bottom)
- Text: `max-w-md text-center` (constrained width, centered)
- Button: `flex items-center gap-2 py-3 px-6`

**Surface (Layer 3):**
- Icon: `text-secondary-600`
- Typography: `type-section-sub` (heading), `type-body text-body` (description)
- Button: `btn-primary`

**Interaction (Layer 4):**
- Button: `hover:` states (defined in btn-primary class)

## Responsive Breakpoints Used

- Mobile: default
- Desktop: `lg-desktop`, `lg-touch`
- Pattern: Hide mobile-only content with `lg-desktop:hidden lg-touch:hidden`
- Pattern: Show desktop-only content with `hidden lg-desktop:flex lg-touch:flex`

## Notes

These patterns are reference material for core-building-pattern implementation. When building new basket components:
- Start with Layer 1 (Structure) - semantic HTML skeleton
- Add Layer 2 (Layout) - flex/grid/spacing/sizing only
- Add Layer 3 (Surface) - colors, typography, brand tokens
- Add Layer 4 (Interaction) - hover states, transitions
- Follow desktop-first approach: 1280px → lock → 375px → lock
