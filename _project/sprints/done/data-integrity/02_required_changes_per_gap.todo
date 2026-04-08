# Sang Logium — Required Changes per Gap
> Sequenced from foundational → structural → component → surface → mobile

---

## Phase 1 — Foundational / System Alignment

### [G-14] Add dark-surface shadow tokens to Tailwind config
- Add to `boxShadow` in `tailwind.config.ts`:
  - `cardDark: '0 0 0 1px rgba(246,227,213,0.06), 0 4px 20px rgba(0,0,0,0.4)'`
  - `cardDarkHover: '0 0 0 1px rgba(246,227,213,0.14), 0 8px 32px rgba(0,0,0,0.6)'`
- These replace invisible light-surface shadows on dark `surface.page`.

### [G-15] Enforce system border-radius on all interactive elements
- Audit all PLP components for Tailwind `rounded-*` utilities or inline styles.
- Replace any `rounded-full`, `rounded-lg` (>4px), or browser-native radius on chips, pills, dropdowns with `rounded-sm` (2px) or `rounded` (3px) per system.

---

## Phase 2 — Layout and Structure

### [G-02] Add breadcrumb navigation
- Insert breadcrumb row above page title.
- Pattern: `Home / Headphones / Open-Back`
- Use `type-caption` styling + `text.secondary` colour.
- Separator: `/` in `text.caption` colour.
- Current page segment: `text.primary` or `accent.500`.

### [G-01] Redesign page header block
- Replace bare centred title with:
  ```
  [overline]  HEADPHONES · OPEN-BACK
  [h1]        Open-Back
  [caption]   6 products
  ```
- Apply `.type-overline` + `section-header-anchor` (::before rule) to overline.
- Align block to left (not centred) — consistent with rest of page content.
- Separate from controls row with `mb-8` or `mb-10`.

### [G-07] Sidebar — visual separation
- Apply `bg-surface-elevated` (#2E2E2D) to sidebar container.
- Add `border-r border-border-secondary` right-side divider.
- Add `rounded-sm` corner treatment.
- Min-height should match grid height, not auto-collapse.

### [G-08] Sidebar — width
- Increase sidebar min-width from ~160 px to `240px` on desktop.
- Ensure filter labels never clip — use `truncate` only as last resort, prefer line-wrap.

### [G-12] Controls bar — anchor
- Wrap sort dropdown + chips row in a `border-b border-border-secondary pb-4 mb-6` container.
- Alternatively apply `bg-surface-elevated` panel with padding to create clear zone separation.

---

## Phase 3 — Component Level

### [G-09] Styled checkboxes for filter sidebar
- Replace browser-native checkboxes with custom-styled components.
- Unchecked: 14×14px border `border-border-primary`, bg `transparent`, `rounded-sm`.
- Checked: bg `brand.400`, border `brand.400`, white or `brand.700` checkmark SVG.
- Hover: border-colour transitions to `brand.400`.
- Use `transition-colors duration-150`.

### [G-10] Active filter chips — style correction
- Apply system border radius: `rounded-sm` (2px).
- Background: `surface.elevated` with `border border-brand-400`.
- Label colour: `text.primary` (`brand.400`).
- Remove icon `×`: use `text.caption` colour, upgrade to `brand.400` on chip hover.
- "Clear all" link: `text.accent` (`accent.500`) + underline, distinguishable from chips.

### [G-11] Sort dropdown — style
- Replace `<select>` with `input-select` class from design system, or a custom styled dropdown.
- Background: `surface.elevated`, border: `border.primary`, text: `text.body`.
- Use system chevron SVG from `input-select` definition in tailwind config.
- `rounded-sm`.

### [G-20] Result count — differentiate
- Apply `.type-metadata` (h4 scale, `text.secondary` colour, `letterSpacing: 0.1em`) to result count.
- Move count to same line as sort dropdown (right-aligned in flex row), freeing page header to be purely editorial.

---

## Phase 4 — Product Card

### [G-03] Product card — image container
- Define fixed aspect-ratio image slot: `aspect-[4/3]` or `aspect-square` — choose one, apply consistently.
- Background: `surface.productImage` (`brand.200`, warm cream) — matches homepage product image treatment.
- `object-fit: cover` and `object-position: center`.
- `rounded-sm` on container.
- No transparent/uncontrolled background.

### [G-04] Product card — typography hierarchy
- Product name: `.type-card-title` (h3 scale, `text.headline` colour, semibold).
- Price: `.type-price` (h4 scale, `text.priceTag` colour = `secondary.300`, semibold).
- Add vertical gap between name and price (`mt-1` or `mt-2`).
- Name should visually dominate; price should be clearly secondary but distinct.

### [G-05] Product card — add-to-cart button
- Add `.btn-cart` button to each card, visible on desktop by default (below price).
- On hover, optionally show a quick-add overlay on the image (optional enhancement).
- Mobile: always visible below price.
- Button text: "Add to Cart" with cart icon (use Lucide `ShoppingCart` or similar).

### [G-06] Product card — hover state
- On `card-product:hover`:
  - Apply `boxShadow: cardDarkHover` (new dark token from G-14).
  - Apply `border-color: brand.400` (warm cream glow).
  - Image container: subtle `scale(1.02)` on image (not card) via `transition-transform`.
  - Name colour: shift from `text.headline` to `brand.200` (brighter).
- `transition-all duration-300 ease-out` on card wrapper.

### [G-13] Restore accent gold usage
- Filter sidebar section labels ("BRAND", "DRIVER TYPE"): apply `text.accent` (`accent.500`) or keep `text.overline` colour but add `section-header-anchor ::before` rule.
- Checked filter state: checked checkbox uses `brand.400` not `accent.500` (per G-09).
- Active chip border: `brand.400` (warm cream) — not gold, to avoid overuse.
- "Clear all": `accent.500` gold.
- Sort dropdown focus ring: `brand.600`.
- Page overline: `accent.500`.

### [G-19] Restore editorial-luxury personality
- Page overline (G-01) in `accent.500` with `section-header-anchor` rule.
- Section divider rule (`::before` 32px line in `brand.400`) between controls and grid.
- Card hover border glow in `brand.400`.
- Introduce one micro-motion: cards stagger-fade in on load (`animation-delay` per card index, 0.05s increments, `opacity: 0 → 1` + `translateY: 8px → 0`).

---

## Phase 5 — Mobile

### [G-16] Mobile filter UX — replace with drawer
- Replace floating "FILTERS" pill + overlay with a bottom sheet / drawer pattern.
- Trigger: full-width "FILTERS (N active)" button at top of page, below header.
- Drawer slides up from bottom: contains full filter sidebar content.
- Dismiss: tap overlay, swipe down, or "Apply" button.
- Active filter chips remain visible on page below the filter trigger button.

### [G-17] Mobile — card layout
- 1-column layout is correct.
- Each card: image slot fixed at `h-48` (192px) or `aspect-[16/9]`, `object-cover`, warm cream bg.
- Card internal padding: `p-4` consistently.
- Name + price + add-to-cart stacked vertically with defined gaps.

### [G-18] Mobile — controls row
- Controls row: two-column flex row.
  - Left: "FILTERS (N)" button — `btn-secondary` style with filter icon.
  - Right: sort dropdown — `input-select` styled, full width of right column.
- Active filter chips row: horizontal scroll below controls row, `gap-2`, `overflow-x-auto`.
- "Clear all" chip at far right of chips row.

---

## Sequenced Implementation Order

```
1. G-14  Add dark-surface shadow tokens (config)
2. G-15  Enforce border-radius system (config/global CSS)
3. G-01  Page header redesign
4. G-02  Breadcrumb
5. G-07  Sidebar visual separation + G-08 width
6. G-12  Controls bar anchoring
7. G-09  Styled checkboxes
8. G-10  Chips style + G-11 Sort dropdown
9. G-20  Result count restyle
10. G-03  Card image container
11. G-04  Card typography
12. G-05  Card add-to-cart
13. G-06  Card hover state
14. G-13  Accent gold restoration
15. G-19  Editorial personality / motion
16. G-16  Mobile filter drawer
17. G-17  Mobile card layout
18. G-18  Mobile controls row
```
