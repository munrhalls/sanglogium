SCOPE: 
- html structure
- layout
- styling 
- rwd (mobile <---> desktop)
 
OUT OF SCOPE: 
- anything else  


"""
# Basket Page — Design Spec
**Project:** sang-logium  
**Scope:** Visual design only (mobile + desktop). No logic changes.  
**Stack:** Next.js 15 / React 19 / Tailwind 3  
**Date:** 2026-06-03

---

## 0. Verified Ground Truth

Extracted directly from source. All token names below map 1-to-1 to tailwind.config.ts.

### Color tokens (resolved hex)
| Token | Hex | Role |
|---|---|---|
| brand-900 | #070808 | page background (bg-brand-900) |
| brand-800 | #0D0F0F | surface.subtle |
| brand-700 | #151B1B | surface.page |
| secondary-900 | #1A1A19 | surface.card |
| secondary-800 | #2E2E2D | surface.elevated |
| secondary-700 | #4A4948 | border.secondary |
| secondary-300 | #E5E4E2 | border.primary, text.priceTag, text.subtitle |
| secondary-500 | #9A9997 | text.caption |
| brand-400 | #F6E3D5 | text.primary, text.heroHeadline, text.headline, CTA bg |
| brand-200 | #FAEEE6 | surface.productImage, text.body |
| brand-500 | #E8C9B5 | btn-primary hover |
| brand-600 | #C9A18A | focus ring |
| error-500 | #EF4444 | destructive / remove hover |

### Typography utility classes (from plugin)
| Class | Size | Weight | Color |
|---|---|---|---|
| .type-section-hed | h1 clamp | 600 | text.headline = brand-400 |
| .type-section-sub | h2 clamp | 500 | text.subtitle = secondary-300 |
| .type-card-title | 16px | 600 | text.body = brand-200 |
| .type-body | 16px | 400 | text.body = brand-200 |
| .type-metadata | h4 clamp | 500 | text.secondary = secondary-400 |
| .type-price | h4 clamp | 600 | text.priceTag = secondary-300 |
| .type-overline | 12px | 500 uppercase | text.overline = accent-500 |
| .type-caption | 12px | 400 | text.body = brand-200 |
| .type-section-caption | 12px | 300 | text.caption = secondary-500 |

### Component classes (from plugin)
| Class | Description |
|---|---|
| .card-base | bg-secondary-900, p-6, rounded-lg, shadow, border-secondary-700 |
| .card-product-dark | transparent bg, rounded-lg, dark shadow+border, hover lift+border glow |
| .btn-primary | bg-brand-400, text-brand-700, bold, hover darker |
| .btn-cart-large | same as primary but actionLarge font size |
| .btn-secondary | transparent, border-brand-200, text-brand-100 |
| .btn-ghost | transparent, no border, text-brand-400, uppercase, underline |
| .input-base | bg-secondary-800, border-secondary-300, body font, focus ring brand-600 |
| .section-header-anchor | flex row + ::before 32px brand-400 line |

### Breakpoints in use
| Name | Condition |
|---|---|
| xs | min-width: 475px |
| md | min-width: 768px |
| lg-touch | min-width: 1024px AND max-height: 850px |
| lg-desktop | min-width: 1024px AND min-height: 851px |

**Note:** lg-touch and lg-desktop are the project's canonical "desktop" breakpoints. Mobile = everything below 1024px.

### Shelf layout wrapper
Shelf gives the page: w-full py-20 outer + mx-auto px-4 md:px-8 max-w-content(1280px) inner. This is fixed; do not change it.

---

## 1. Page Architecture

### 1A. States
Three states must be spec'd — each is a complete layout swap:

| State | Trigger | Layout |
|---|---|---|
| **Loading** | !_hasHydrated \|\| isLoading | BasketSkeleton |
| **Empty** | basket.length === 0 | EmptyBasket |
| **Populated** | items present | Two-column grid |

### 1B. Populated layout — column grid
``
Mobile (<1024px):     1 column, stacked
  [Item list]
  [Basket Summary]

Desktop (lg-touch / lg-desktop):  3-column grid
  [Item list — col-span-2]  [Basket Summary — col-span-1]
``

**Grid class:** grid grid-cols-1 gap-8 lg-touch:grid-cols-3 lg-desktop:grid-cols-3  
This is already correct in the codebase; it is confirmed and locked.

---

## 2. Page Header

**Component:** SegmentTitle — already correct, no change.  
Renders: orbit logo · YOUR BASKET (.type-section-hed uppercase .section-header-anchor) · orbit logo  
Spacing below: mb-12 ✓

---

## 3. Item List Panel

### 3A. Panel wrapper
``
className="card-base overflow-hidden"
``
Background: secondary-900. Border: 1px secondary-700. Padding: removed from wrapper (padding is per-row).

### 3B. Column header row (desktop only)
Shown only on lg-touch and lg-desktop. Hidden on mobile.

``
Layout: grid grid-cols-[3fr_1fr_1fr_1fr]
Padding: px-6 py-3
Border: border-b border-border-secondary
``

| Column | Text | Alignment | Class |
|---|---|---|---|
| Product | PRODUCT | left | .type-overline |
| Price | PRICE | center | .type-overline |
| Quantity | QUANTITY | center | .type-overline |
| Total | TOTAL | right | .type-overline |

.type-overline = 12px / 500 weight / uppercase / letter-spacing editorial / accent-500 color  
This replaces the current .type-caption uppercase tracking-editorial text-text-caption (wrong color — caption is grey; overline is gold accent, which anchors the list with intentional contrast).

### 3C. Item row — Desktop (lg-touch / lg-desktop)

``
Layout: grid grid-cols-[3fr_1fr_1fr_1fr] items-center
Padding: px-6 py-5
Gap: gap-5
Border: border-b border-border-secondary/60
Hover: bg-surface-elevated (transition-colors duration-150)
`

**Column 1 — Product:**
`
flex flex-row items-center gap-4
``
- **Image container:** h-20 w-20 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative  
  Background brand-200 (cream) ensures dark headphones pop. object-contain. 96px rendered.
- **Name:** .type-card-title (16px / 600 / brand-200)  
  Max 2 lines, line-clamp-2 overflow-hidden. Prevents layout break on long titles.

**Column 2 — Unit Price:**
``
flex items-center justify-center
``
<Price value={displayPrice} /> → .type-price (h4 clamp / 600 / secondary-300)

**Column 3 — Quantity:**
``
flex items-center justify-center
`
See §5 for BasketControls spec.

**Column 4 — Line Total:**
`
flex items-center justify-end
``
<Price value={displayPrice * quantity} /> → .type-price 

### 3D. Item row — Mobile (< 1024px)

Mobile row uses a **two-zone layout**, not a single-column stacked layout.

``
Layout: flex flex-col gap-0
Border: border-b border-border-secondary/60
Padding: p-4
Hover: bg-surface-elevated
`

**Zone A — Info strip (full width, flex row):**
`
flex flex-row items-start gap-3 py-3
``
- **Image:** h-16 w-16 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative (object-contain)
- **Text block:** flex flex-col gap-1 flex-1 min-w-0 
  - Name: .type-card-title line-clamp-2 — capped at 2 lines, prevents overflow
  - Unit price: .type-metadata (secondary-400) — "Unit: $X" label before price, smaller and muted

**Zone B — Controls strip (full width, flex row, space-between):**
``
flex flex-row items-center justify-between py-3 border-t border-border-secondary/30
``
- Left: BasketControls (see §5)
- Right: Line total .type-price — the most prominent number, right-aligned

**Rationale:** This separates the touch-action zone (Zone B, bottom of row, thumb-reachable) from the info zone (Zone A, top). Line total is immediately beside the controls so quantity change and total update are visually co-located.

---

## 4. Basket Summary Panel

### 4A. Panel wrapper
``
className="card-product-dark sticky bottom-0 z-10 lg-touch:bottom-auto lg-touch:top-4 lg-desktop:bottom-auto lg-desktop:top-4"
``
card-product-dark = transparent bg, dark shadow+border, hover lift. More visually elevated than card-base — correct for the CTA panel.

**Note on sticky:** On mobile the summary sticks to the bottom. On desktop it sticks to top-4 within the scrolling page. This is correct existing behavior; confirm it is preserved.

### 4B. Summary heading
``
<h2 className="type-section-sub border-b border-border-primary pb-4 mb-6">
  Basket Summary
</h2>
``
.type-section-sub = h2 clamp / 500 / secondary-300. No change from current.

### 4C. Line items
``
<div className="space-y-3">
`

Each line:
`
flex justify-between items-baseline
``
- Label: .type-section-caption (12px / 300 / secondary-500) — muted, recessive
- Value: .type-price tabular-nums — prominent

Lines:
1. Subtotal (N item/items) / <Price value={subtotal} variant="summary" /> 
2. Shipping / <Price value={shippingCost} variant="summary" /> or Calculating... in .type-section-caption 
3. Tax / <Price value={0} variant="summary" /> 

### 4D. Total line
``
border-t border-border-primary pt-4 mt-1
flex justify-between items-baseline
``
- Label: .type-section-sub — same weight as heading, heavier than line labels
- Value: type-section-sub tabular-nums colored brand-400 (override .type-price color here) — the total is the most important number on the panel; it earns the headline cream color
- Sub-label: Including VAT in .type-section-caption mt-1 

### 4E. Checkout button
``
<CheckoutButton basketData={basketData} />
``
Internal class on the button: btn-cart-large w-full mt-6 py-4 justify-center 

btn-cart-large = bg-brand-400 text-brand-700 bold, actionLarge font, hover brand-500. Full-width, centered label. This is the visual lead domino — largest, most saturated element on the panel.

### 4F. Continue Shopping link
``
<Link className="btn-secondary block text-center mt-3 py-3 w-full">
  ← Continue Shopping
</Link>
`
No change. Secondary styling provides correct visual hierarchy below the primary CTA.

---

## 5. BasketControls (Quantity Stepper)

### 5A. Wrapper
`
flex items-center gap-1
``

### 5B. Decrement button (-)
``
className="h-10 w-10 flex items-center justify-center 
           bg-surface-elevated border border-border-secondary rounded-sm 
           text-text-secondary hover:border-brand-400 hover:text-text-primary 
           transition-colors duration-150
           disabled:opacity-30 disabled:cursor-not-allowed"
``
Min touch target: 40×40px (satisfies 44px guideline when combined with gap). Text: − (minus sign, not hyphen).

### 5C. Quantity display
``
<span className="w-10 text-center type-card-title tabular-nums select-none">
  {quantity}
</span>
``
Fixed width w-10 prevents layout shift when number changes (1 → 10 → 100).

### 5D. Increment button (+)
Same classes as decrement. Text: +.

### 5E. Delete button (basket page only)
``
className="ml-2 h-10 w-10 flex items-center justify-center 
           text-text-caption hover:text-error-500 
           transition-colors duration-150 rounded-sm"
``
<TrashIcon size={18} />. ml-2 provides visual separation from the stepper group.

### 5F. Stepper group visual spec
The -, quantity, + form a tight bordered group:
``
[−][  3  ][+]
`
Each element has its own border; they sit flush without gap between them for the "single control" illusion:
`
<div className="flex items-center">
  <button className="h-10 w-10 ... rounded-l-sm border-r-0"> − </button>
  <span   className="h-10 w-10 ... border-x-0 flex items-center justify-center"> 3 </span>
  <button className="h-10 w-10 ... rounded-r-sm border-l-0"> + </button>
</div>
<button className="ml-3 h-10 w-10 ..."> <TrashIcon /> </button>
``
Border details:  
- All three share border border-border-secondary bg-surface-elevated  
- Left button: rounded-l-sm border-r-0  
- Center span: no border-radius, border-l-0 border-r-0 (border still renders via adjacent)  
- Right button: rounded-r-sm border-l-0  
- Hover on any: border-border-primary (brighter) for the whole trio via group or individual

---

## 6. Empty Basket State

``
flex flex-col items-center justify-center gap-6
py-16 lg-desktop:py-24 lg-touch:py-24
``

- Icon: <ShoppingCartIcon size={64} className="text-text-caption opacity-40" /> 
- Heading: .type-section-sub text-center — "Your basket is empty"
- Body: .type-body text-center max-w-md text-text-caption — supporting copy
- CTA: <Link href="/" className="btn-primary flex items-center gap-2 py-3 px-8 mt-2">Browse Headphones</Link> 

The card-base wrapper stays. No other changes.

---

## 7. Loading Skeleton State

The existing BasketSkeleton is functionally correct. One visual fix:

Replace bg-surface-elevated with bg-secondary-800/60 on skeleton blocks to ensure sufficient contrast against card-base background (secondary-900). Current values are too close in luminance — the shimmer is nearly invisible.

All animate-pulse / spacing / grid structure: unchanged.

---

## 8. Error State

``
<div className="card-base p-6 flex items-center gap-4">
  <span className="text-error-500 flex-shrink-0">
    <WarningCircleIcon size={24} />
  </span>
  <p className="type-body text-error-500">{error.message}</p>
</div>
``
Add icon for scannability. No structural change.

---

## 9. Typography Corrections (delta from current code)

| Location | Current | Correct | Reason |
|---|---|---|---|
| Column headers | .type-caption uppercase tracking-editorial text-text-caption | .type-overline | Overline is accent-500 (gold) — intentional anchor. Caption is grey — invisible against dark. |
| Product name | .type-body text-text-caption | .type-card-title | Card title is 600 weight, body is 400. Product names need emphasis. text-text-caption is wrong — it makes the name grey/muted, the opposite of desired. |
| Mobile total label | type-price with "Total:" prefix text | type-price for value only; "Total:" in .type-section-caption | Label and value should not share the same class. |
| Summary total value | .type-section-sub (500) | .type-section-sub text-brand-400 | The grand total earns the cream headline color, not the subtitle grey. |

---

## 10. Spacing & Sizing Constants

| Element | Value |
|---|---|
| Item row padding (desktop) | px-6 py-5 |
| Item row padding (mobile) | p-4 |
| Item row gap (desktop) | gap-5 |
| Image size (desktop) | h-20 w-20 (80×80px) |
| Image size (mobile) | h-16 w-16 (64×64px) |
| Stepper button size | h-10 w-10 (40×40px) |
| Summary panel top offset (desktop sticky) | top-4 |
| Column header padding | px-6 py-3 |
| Summary space-y | space-y-3 |
| Checkout btn padding | py-4 (taller than py-3 used on Continue Shopping) |

---

## 11. Accessibility Checklist

| Item | Spec |
|---|---|
| Decrement disabled state | disabled attr when quantity <= 1 on basket page ✓ (already implemented) |
| All interactive elements | min 40×40px touch target ✓ |
| Image alt text | alt={name} ✓ |
| Loading skeleton | aria-busy="true" aria-label="Loading basket" ✓ |
| Error message | role="alert" ✓ on checkout error |
| Checkout button | data-testid="checkout-button" ✓; aria-disabled on disabled ✓ |
| Quantity display | data-testid="quantity-display" ✓ |
| Focus rings | focus-visible outlines via plugin on all buttons ✓ |
| Remove button | Add aria-label={Remove ${name} from basket} — currently missing |

---

## 12. Full Component × Class Mapping

### BasketManager.tsx 
No class changes. Grid and column layout confirmed correct.

### BasketItem.tsx 

**Desktop row wrapper:**
``tsx
className="hidden lg-desktop:grid lg-touch:grid grid-cols-[3fr_1fr_1fr_1fr] items-center px-6 py-5 gap-5 border-b border-border-secondary/60 hover:bg-surface-elevated transition-colors duration-150"
`

**Mobile row wrapper:**
`tsx
className="lg-desktop:hidden lg-touch:hidden flex flex-col border-b border-border-secondary/60 px-4 hover:bg-surface-elevated transition-colors duration-150"
`

**Image container (desktop):**
`tsx
className="h-20 w-20 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative border border-border-secondary"
`

**Image container (mobile):**
`tsx
className="h-16 w-16 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative border border-border-secondary"
`

**Product name:**
`tsx
className="type-card-title line-clamp-2"
`

**Mobile Zone A:**
`tsx
className="flex flex-row items-start gap-3 py-3"
`

**Mobile Zone B:**
`tsx
className="flex flex-row items-center justify-between py-3 border-t border-border-secondary/30"
``

### BasketControls.tsx 

**Stepper wrapper:**
``tsx
className="flex items-center"
`

**Decrement:**
`tsx
className="h-10 w-10 flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-l-sm border-r-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
`

**Quantity span:**
`tsx
className="h-10 w-10 flex items-center justify-center bg-surface-elevated border-y border-border-secondary type-card-title tabular-nums select-none"
`

**Increment:**
`tsx
className="h-10 w-10 flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-r-sm border-l-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150"
`

**Delete:**
``tsx
className="ml-3 h-10 w-10 flex items-center justify-center text-text-caption hover:text-error-500 transition-colors duration-150 rounded-sm"
aria-label={Remove ${name} from basket}
```

### BasketSummary.tsx 

**Panel wrapper (in BasketManager):**
``tsx
className="card-product-dark sticky bottom-0 z-10 lg-touch:bottom-auto lg-touch:top-4 lg-desktop:bottom-auto lg-desktop:top-4 p-6"
`

**Heading:**
`tsx
className="type-section-sub border-b border-border-primary pb-4 mb-6"
`

**Line labels:**
`tsx
className="type-section-caption"
`

**Total label:**
`tsx
className="type-section-sub"
`

**Total value — add override:**
`tsx
className="type-section-sub tabular-nums text-brand-400"
`

**Checkout button wrapper adds:**
`tsx
className="btn-cart-large w-full mt-6 py-4 justify-center"
``

### BasketSkeleton.tsx 

**Skeleton block color fix:**
``tsx
// Replace: bg-surface-elevated
// With:    bg-secondary-800/60
``

### Column headers (in BasketManager.tsx)

``tsx
// Replace: type-caption uppercase tracking-editorial text-text-caption
// With:    type-overline
``

---

## 13. What Does NOT Change

- Shelf wrapper — no change  
- SegmentTitle — no change  
- Grid column proportions (3fr_1fr_1fr_1fr) — confirmed correct  
- BasketManager grid (grid-cols-3, col-span-2 / col-span-1) — confirmed correct  
- Sticky summary behavior — confirmed correct  
- CheckoutButton internal logic — no change  
- EmptyBasket overall structure — only icon opacity + CTA label  
- All data-testid attributes — must be preserved exactly  
- All Zustand store interactions — no change  
- Shipping fetch / SWR logic — no change  

---

## 14. Gap & Red Flag Audit

| Item | Status |
|---|---|
| Long product names on mobile | ✅ Fixed — line-clamp-2 min-w-0 prevents layout break |
| Quantity input for large numbers | ✅ Fixed — fixed-width w-10 span; stepper border-group design makes tapping clear; for very large quantities the existing +/− is correct (no <input type="number"> needed — Gemini's suggestion adds complexity with no UX gain for typical quantities; high-volume B2C is not the use case here) |
| Empty basket state | ✅ Spec'd in §6 |
| Skeleton invisible shimmer | ✅ Fixed in §7 |
| Typography: name shown in caption grey | ✅ Fixed — .type-card-title |
| Column headers in grey instead of accent | ✅ Fixed — .type-overline |
| Total value same colour as subtitle | ✅ Fixed — text-brand-400 override on total |
| aria-label missing on remove button | ✅ Added in §12 |
| Summary panel background doesn't elevate | ✅ Fixed — card-product-dark instead of card-base |
| Gemini suggestion: invoice row-not-card | Already the design; card-base on the list wrapper with row borders inside is correct |
| Gemini suggestion: editable <input> for quantity | ❌ Rejected — over-complicates controls for high-end single-item purchases; stepper is correct UX |
| Mobile: price + controls on separate rows | ✅ Two-zone layout in §3D solves this cleanly |
| Desktop sticky vs mobile sticky confusion | ✅ Confirmed: mobile sticks bottom-0, desktop sticks top-4 — both correct |
"""