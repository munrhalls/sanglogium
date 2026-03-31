# Sang Logium — Post-Homepage Products Discovery UI Audit
> Scope: Category / PLP page (desktop + mobile). Footer is out of scope.

---

## Section 1 — Dimension Ratings (1–10)

### 1. Design — **5 / 10**
The page is competent but not polished. The dark-field, high-contrast headphone photography reads well against the near-black `surface.page` (#151B1B). However, the page feels assembled rather than designed: the filter sidebar is a raw unstyled box, product cards have no image container treatment (images float on transparent/uncontrolled backgrounds), and the sort dropdown is generic browser-default. The hero "Open-Back / 6 products" title block is centred text with no visual reinforcement — no overline, no rule, no accent — breaking the editorial language established on the homepage.

### 2. Visual Hierarchy — **4 / 10**
The page title "Open-Back" is h1-sized and centred, then the user's eye drops 50 px of dead space before hitting the two-column control bar (sort + active-filter chips). The filter sidebar is visually equal in weight to the product grid — both share the same near-black background with no separation. Within each product card, name and price carry almost identical visual weight (same colour, nearly the same size), making price secondary rather than primary. Add-to-cart affordance is entirely absent from the grid.

### 3. White Space — **5 / 10**
Card-to-card gutters are acceptable (~24 px). However:
- The sidebar has too much dead vertical space at the bottom with no content to justify it.
- The page title block has excessive top-padding but no bottom rhythm before the controls.
- Cards have no consistent internal padding — the image-to-name gap appears to depend on image natural dimensions rather than a defined slot.
- Mobile: cards are 1-column full-bleed with inconsistent top/bottom breathing room.

### 4. Border Radiuses — **3 / 10**
The design system defines `borderRadius.lg = 4px`, `md = 3px`, `sm = 2px` — intentionally sharp/squared for an austere luxury feel. On the PLP, the active filter chips ("Brand: Sennheiser ×") render with visibly rounded corners that look closer to 12–16 px — inconsistent with the system. The sort dropdown also shows browser-native rounded corners. Card borders follow system correctly (near-square), but the filter checkbox squares appear oversized and misaligned. The mobile "FILTERS" pill button has a noticeably larger radius than anything in the system.

### 5. Shadows — **3 / 10**
The design system defines `card: '0 4px 20px rgba(0,0,0,0.03)'` and `cardHover: '0 8px 30px rgba(0,0,0,0.08)'`. On a near-black background both are functionally invisible — the system shadow tokens are designed for light-surface contexts. On the PLP, cards show no perceptible shadow, making card edges invisible against the page background unless the `border.secondary` (#2E2E2D) border is present. The sidebar shows no depth separation at all. Shadow system needs dark-surface variants.

### 6. Layout — **5 / 10**
The two-column grid for products is appropriate for desktop. The sidebar width (~160 px) is too narrow for its content (filter labels clip, checkboxes are cramped). The sort/filter control bar sits in the product column, which is correct, but it is not visually anchored — no separator line, no background change. On mobile the layout collapses to single-column products, which is correct, but the filter controls become a floating overlay row ("FILTERS / 6 products" bar at top) that partially obscures product content and the interaction model is unclear.

### 7. Symmetry and Positioning — **5 / 10**
Desktop grid is symmetrical (2-col). Sidebar is left-pinned and top-aligned. The page title is centred while all other content is left-aligned — a tension that is unresolved. Active filter chips are left-aligned under the sort bar, which is correct. However, the product image within each card has no defined anchor: some products bleed to card edges, some float with visible background. This creates an irregular, optically unbalanced grid when scanning across rows.

### 8. Typography — **5 / 10**
The design system has a detailed type scale (`display-1` through `small`, plus semantic tokens like `type-overline`, `type-section-hed`, `type-card-title`, `type-price`). On the PLP:
- Page title uses an undifferentiated h1 size with no overline or supporting caption — missing `type-overline` + `type-section-hed` pattern.
- Filter section labels ("BRAND", "DRIVER TYPE") use uppercase tracking which is correct (`type-overline`), but font weight appears too light to read at 12 px on dark.
- Product name reads at the same weight and colour as price. The system's `type-card-title` and `type-price` tokens exist but are not applied distinctively enough — price should stand out more.
- Sort dropdown and chip labels use inconsistent type sizes not aligned to system tokens.

### 9. Color Theory — **6 / 10**
The dark field with warm-cream `brand.400` (#F6E3D5) for typography is coherent. The accent gold (#D4AF37) used on the homepage is absent from the PLP entirely — no overlines, no hover states, no active-filter accent. Active filter chips use a generic near-white that doesn't read as "selected/active" in the colour language. The "Clear all" link has no colour differentiation from chip text. There is no use of `accent.500` which the system reserves for price tags / overlines — prices render in `secondary.300` (correct per system) but chips render in off-white that clashes.

### 10. Coherence — Web Personality — **4 / 10**
The homepage establishes a clear editorial-luxury persona: dark field, high-contrast photography, sparing gold accents, uppercase tracked headings with thin rules, ghost CTA buttons. The PLP loses this persona almost entirely. There is no editorial framing, no section overlines, no accent rules, no gold highlights on hover or selection, no motion. The page reads as a generic dark-mode e-commerce list. A user arriving from the homepage experiences a personality discontinuity.

### 11. Relative to Professional Web Design Standard — **4 / 10**
Professional PLP benchmarks (B&H, Sweetwater, Abt, high-end boutique audio stores) all share: consistent product image containers with defined aspect ratios, clear primary-action visibility on each card (add to cart / view), visible filter state differentiation, breadcrumb or page-path context, sort + result count in a single anchored bar, and mobile filter patterns (drawer or sheet — not floating overlay). None of these are fully implemented here.

### 12. System Coherence / Simplest Organisation — **4 / 10**
The design system is detailed and internally consistent. The PLP fails to deploy it: semantic type tokens (`type-card-title`, `type-price`, `type-overline`, `section-header-anchor`) are either unused or misapplied. Surface tokens (`surface.card`, `surface.elevated`) are not used to differentiate the sidebar from the product area. Button components (`btn-cart`) are absent from cards. `card-product` component class appears unused. The system exists; the page does not implement it.

### 13. Cross-Referenced Whole — **4 / 10**
Every individual rating above is consistent with each other and with the overall picture: the PLP is a functional scaffold that has not been refined to match the homepage's visual standard or the design system's own specifications. The gaps are systematic and addressable — nothing is architecturally broken — but the current state would not pass a professional design review.

---

## Section 2 — Summary of Gaps

| # | Area | Gap Description |
|---|------|-----------------|
| G-01 | Page Header | No overline, no `section-header-anchor` rule, no accent. Title + count alone provide no brand context. |
| G-02 | Breadcrumb | No path context (Home → Headphones → Open-Back). User has no back-navigation cue. |
| G-03 | Product Card — Image Container | No defined aspect-ratio slot. Images float on transparent bg. Grid rows misalign when image dimensions vary. |
| G-04 | Product Card — Typography | `type-card-title` and `type-price` not visually differentiated enough. Name and price nearly identical weight/colour. |
| G-05 | Product Card — Primary Action | No add-to-cart button visible on grid. `btn-cart` component defined in system but absent. |
| G-06 | Product Card — Hover State | No hover affordance (no border highlight, no overlay, no shadow lift using `cardHover` token). |
| G-07 | Filter Sidebar — Visual Separation | Sidebar has no background differentiation (`surface.elevated` vs `surface.page`). No border-right. Reads as part of page background. |
| G-08 | Filter Sidebar — Width | ~160 px is too narrow. Labels clip. No room for longer filter values. |
| G-09 | Filter Sidebar — Checkbox Style | Browser-native checkboxes. Not styled to system. Appear oversized and misaligned. |
| G-10 | Active Filter Chips — Style | Chips have inconsistent border-radius (~12–16 px vs system's 2–4 px). Colour does not use accent system. No accent gold highlight for selected state. |
| G-11 | Sort Dropdown — Style | Browser-native select. Does not use `input-select` component from system. |
| G-12 | Controls Bar — Anchoring | Sort + chips row has no visual anchor. No separator, no background. Floats between title and grid. |
| G-13 | Color — Accent Absence | `accent.500` (gold) used on homepage for overlines, section rules, hover states — entirely absent on PLP. |
| G-14 | Shadows — Dark-Surface | System card shadow tokens are opacities designed for light surfaces. On dark bg, completely invisible. No dark-surface shadow variant defined or applied. |
| G-15 | Border Radius Inconsistency | Chips and mobile filter button violate system radii (2–4 px). Use 12–16 px instead. |
| G-16 | Mobile — Filter UX | Floating row with "FILTERS" pill and product count is unclear interaction model. No drawer or sheet pattern. Filter state obscures content. |
| G-17 | Mobile — Single Column Cards | 1-col full-bleed cards with inconsistent internal padding. No defined image slot height. |
| G-18 | Mobile — Controls Row | "FILTERS / 6 products" bar layout is ambiguous — no clear visual separation between filter trigger and product count. |
| G-19 | Personality Continuity | Editorial-luxury language from homepage (gold accents, tracked overlines, anchor rules, ghost CTAs) does not carry into PLP. |
| G-20 | Result Count Display | Count ("6 products") shares identical styling with body text. Not differentiated as metadata. |
