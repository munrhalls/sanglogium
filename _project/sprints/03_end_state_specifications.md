# Sang Logium — End-State Specifications
## Post-Homepage Products Discovery UI (PLP / Category Page)

> Goal: professional, simple, robust product listing page that fully implements the existing design system, maintains homepage editorial-luxury personality, and delivers best-practice e-commerce discovery UX on both desktop and mobile.

---

## 1. Page Layout — Desktop

### Overall Grid
```
[ NAV HEADER — full width, from global layout ]

[ PAGE CONTENT — max-w-content (1280px), mx-auto, px-8 ]
  [ BREADCRUMB ROW ]
  [ PAGE HEADER BLOCK ]
  
  [ CONTROLS BAR — sort + result count ]
  [ ACTIVE FILTERS ROW ]

  [ BODY ROW ]
    [ SIDEBAR — 240px fixed, flex-shrink-0 ]
    [ PRODUCT GRID — flex-1, min-w-0 ]

[ FOOTER — out of scope ]
```

### Spacing Rhythm
- Page content top padding: `pt-10` (below nav)
- Breadcrumb → Page header: `mb-6`
- Page header → Controls bar: `mb-8`
- Controls bar → Active filters: `mb-4`
- Active filters → Body row: `mb-8`
- Sidebar ↔ Grid column gap: `gap-8` (32px)
- Grid row gap: `gap-6` (24px)
- Grid column gap: `gap-6` (24px)

---

## 2. Breadcrumb

### Markup Pattern
```
Home  /  Headphones  /  Open-Back
```

### Styles
- Container: `flex items-center gap-2 mb-6`
- Each segment except last: `.type-caption` colour `text.secondary`, hover `text.primary`, underline on hover
- Separator `/`: `text.caption` colour, `select-none`
- Current page: `.type-caption` colour `text.primary`, `font-medium`, no link
- No icons required

---

## 3. Page Header Block

### Structure
```
[OVERLINE]  HEADPHONES · OPEN-BACK
[H1]        Open-Back
```

### Styles
- Container: `flex flex-col gap-2 mb-8`, left-aligned
- Overline: `.type-overline` + `.section-header-anchor` (32px `brand.400` rule via `::before`)  
  - Color: `accent.500` (#D4AF37)
  - Text: category path in caps, e.g. "HEADPHONES · OPEN-BACK"
- H1: `.type-section-hed` (h1 scale, clamp, `text.headline` colour, semibold)
- Result count: `.type-metadata` colour `text.secondary`, displayed in controls bar (not under title)

---

## 4. Controls Bar

### Layout
```
[ Sort: Featured ▾ ]          [ 6 products ]
```
- `flex items-center justify-between`
- `border-b border-border-secondary pb-4 mb-4`

### Sort Dropdown
- Class: `.input-select`
- Width: `w-44` (176px)
- Options: Featured, Price: Low to High, Price: High to Low, Newest
- `rounded-sm`

### Result Count
- Class: `.type-metadata`
- Colour: `text.secondary`
- Right-aligned in flex row

---

## 5. Active Filters Row

### When empty: hidden (no empty row)
### When populated:
```
[ Brand: Sennheiser × ]  [ Driver: Dynamic × ]  [ Clear all ]
```

### Chip Styles
- `inline-flex items-center gap-1.5`
- Background: `surface.elevated` (#2E2E2D)
- Border: `1px solid brand.400` (#F6E3D5)
- `rounded-sm` (2px)
- `px-3 py-1`
- Label: `.type-caption` colour `text.primary` (`brand.400`)
- `×` dismiss: `text.caption` colour, hover `text.primary`, `cursor-pointer`
- `transition-colors duration-150`

### Clear All
- `btn-ghost` style but smaller: `text-small` size, `accent.500` colour, underline, no uppercase transform
- Positioned at end of chip row
- Hover: `brand.100`

---

## 6. Filter Sidebar

### Container
- Width: `240px`, `flex-shrink-0`
- Background: `surface.elevated` (#2E2E2D)
- Border: `border border-border-secondary` + `rounded-sm`
- Padding: `p-6`
- `self-start sticky top-[var(--desktop-header-h)]` (sticks on scroll)

### Header "FILTERS"
- `.type-overline` — uppercase, tracked, `text.caption` colour

### Section Labels (e.g. "BRAND", "DRIVER TYPE")
- `.type-overline` — `accent.500` colour
- `mt-6 mb-3` spacing
- `section-header-anchor` — 32px `brand.400` rule via `::before`

### Filter Items
- `flex flex-col gap-2`
- Each item: `flex items-center gap-3`

### Custom Checkbox
- Size: 14×14 px
- Unchecked:
  - Border: `1px solid border.primary` (#E5E4E2)
  - Background: transparent
  - `rounded-sm`
- Checked:
  - Background: `brand.400` (#F6E3D5)
  - Border: `brand.400`
  - Checkmark: SVG `brand.700` (#151B1B) colour
- Hover (unchecked): border → `brand.400`, `transition-colors duration-150`
- Focus: `ring-2 ring-brand-600 ring-offset-1 ring-offset-surface-elevated`

### Label (beside checkbox)
- `.type-body` (16px, `text.body` colour)
- Hover: `text.primary`
- `cursor-pointer`

### Sidebar Scroll
- `overflow-y-auto` if content exceeds viewport; `max-h` tied to viewport minus header.

---

## 7. Product Grid

### Desktop
- `grid grid-cols-2 gap-6`
- On `xl`: optionally `grid-cols-3`

### Mobile
- `grid grid-cols-1 gap-4`

---

## 8. Product Card

### Container
- Class: `.card-product` + dark shadow override
- Shadow: `cardDark` token (to be added: `0 0 0 1px rgba(246,227,213,0.06), 0 4px 20px rgba(0,0,0,0.4)`)
- Border: `1px solid border.secondary`
- Background: transparent (image bg provides warmth)
- `rounded-sm`
- `overflow-hidden`
- Hover:
  - Shadow: `cardDarkHover` (`0 0 0 1px rgba(246,227,213,0.14), 0 8px 32px rgba(0,0,0,0.6)`)
  - Border: `brand.400`
  - `translateY(-2px)`
  - `transition-all duration-300 ease-out`

### Image Container
- `aspect-[4/3]` (or `aspect-square` — pick one, apply globally)
- Background: `surface.productImage` (`brand.200` = #FAEEE6, warm cream)
- `overflow-hidden`
- `rounded-sm` (matches card)
- Inner image: `w-full h-full object-cover object-center`
- On card hover: inner image `scale(1.03)`, `transition-transform duration-500 ease-out`

### Card Body
- Padding: `p-4`
- `flex flex-col gap-1`

### Product Name
- Class: `.type-card-title` (h3 scale, `text.headline` colour, semibold, `letterSpacing: 0.05em`)
- Max 2 lines, `line-clamp-2`

### Price
- Class: `.type-price` (h4 scale, `text.priceTag` = `secondary.300`, semibold, `letterSpacing: 0.1em`)
- `mt-1`

### Add to Cart Button
- Class: `.btn-cart`
- Full width: `w-full mt-3`
- Text: "Add to Cart"
- Icon: cart SVG, 16×16, left of text
- Always visible (not hover-only)

---

## 9. Card Load Animation

- Cards stagger on initial page render:
  - Each card: `opacity: 0; transform: translateY(8px)` → `opacity: 1; transform: translateY(0)`
  - Duration: `300ms`, easing: `ease-out`
  - Delay: `card-index × 50ms` (capped at ~400ms for last card)
  - Use CSS `animation-delay` or JS `IntersectionObserver` for below-fold cards

---

## 10. Mobile Layout

### Page Structure
```
[ NAV — global ]
[ BREADCRUMB — px-4 ]
[ PAGE HEADER — px-4 ]
[ MOBILE CONTROLS ROW — px-4 ]
[ ACTIVE FILTERS SCROLL ROW — px-4, overflow-x-auto ]
[ PRODUCT LIST — px-4, 1-col grid ]
```

### Mobile Controls Row
- `flex items-center gap-3`
- Left: "FILTERS (2)" button — `.btn-secondary` + filter icon (Lucide `SlidersHorizontal`)
  - Shows active filter count in parentheses when > 0
  - `flex-1`
- Right: sort dropdown `.input-select`, `flex-1`

### Mobile Active Filters
- Horizontal scroll row: `flex gap-2 overflow-x-auto pb-2`
- Same chip styles as desktop
- "Clear all" at end of row

### Mobile Filter Drawer
- Trigger: "FILTERS" button
- Drawer: slides up from bottom, `max-h-[85vh]`, `overflow-y-auto`
- Header: "FILTERS" title + "Done" button (right)
- Content: full sidebar filter content
- Backdrop: `bg-brand-900/60` semi-transparent overlay
- Dismiss: tap backdrop, swipe down, or "Done"
- Animation: `translateY(100%) → translateY(0)`, `duration-300 ease-out`

### Mobile Product Card
- 1-column, full-width
- Image slot: `aspect-[16/9]` or `h-48` (192px), `object-cover`, `surface.productImage` bg
- Card body: `p-4`
- Name: `.type-card-title` (same as desktop)
- Price: `.type-price` (same as desktop)
- Add to Cart: `.btn-cart`, full width

---

## 11. New Design Token to Add

### tailwind.config.ts — boxShadow additions
```ts
cardDark: '0 0 0 1px rgba(246,227,213,0.06), 0 4px 20px rgba(0,0,0,0.4)',
cardDarkHover: '0 0 0 1px rgba(246,227,213,0.14), 0 8px 32px rgba(0,0,0,0.6)',
```

---

## 12. Accent Colour Usage Map (PLP-specific)

| Element | Colour Token | Rationale |
|---------|-------------|-----------|
| Page overline text | `accent.500` | Matches homepage section overlines |
| Section labels in sidebar | `accent.500` | Category grouping emphasis |
| "Clear all" link | `accent.500` | Primary action accent |
| Active chip border | `brand.400` | Warm, not distracting |
| Checked checkbox fill | `brand.400` | Selected state warmth |
| Sort dropdown focus ring | `brand.600` | System focus colour |
| Card hover border | `brand.400` | Subtle warm glow |
| Breadcrumb current segment | `text.primary` | Contextual, not decorative |

---

## 13. Components Checklist

| Component | System Token / Class | Used on PLP End-State |
|-----------|---------------------|----------------------|
| `.card-product` | Yes | ✅ Product cards |
| `.btn-cart` | Yes | ✅ Card CTA |
| `.btn-secondary` | Yes | ✅ Mobile filter trigger |
| `.btn-ghost` | Yes | ✅ "Clear all" (adapted) |
| `.input-select` | Yes | ✅ Sort dropdown |
| `.type-overline` | Yes | ✅ Page overline, sidebar sections |
| `.type-section-hed` | Yes | ✅ Page h1 |
| `.type-card-title` | Yes | ✅ Product name |
| `.type-price` | Yes | ✅ Product price |
| `.type-metadata` | Yes | ✅ Result count |
| `.type-caption` | Yes | ✅ Breadcrumb |
| `.section-header-anchor` | Yes | ✅ Page overline, sidebar sections |
| `surface.elevated` | Yes | ✅ Sidebar bg, chips bg |
| `surface.productImage` | Yes | ✅ Card image container bg |
| `cardDark` shadow | New token | ✅ Card default shadow |
| `cardDarkHover` shadow | New token | ✅ Card hover shadow |
