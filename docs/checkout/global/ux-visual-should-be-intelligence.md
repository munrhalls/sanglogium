# UX Visual 'Should Be' Intelligence Specification: Checkout Flow

> **Existing implementation:** `app/checkout/layout.tsx` already provides a minimal checkout header with centered logo (`/logo-orbit-white.svg`), using `h-[var(--mobile-header-h)]` / `lg:h-[var(--desktop-header-h)]`, `bg-brand-900`, and `border-b border-white/5`. The spec below tightens alignment to the design system where the existing implementation diverges.

## 1. Topbar Visual Specification

**Goal:** A distraction-free, trust-building header restricted exclusively to the brand identity. This adheres to the e-commerce first principle of removing exit points during the checkout flow.

### Layout & Spacing

- **Alignment:** The brand logo must be perfectly centered both vertically and horizontally within the topbar container.
- **Elements:** Strictly limited to the brand logo. No back buttons, no navigation menus, no cart summary icons.
- **Height:**
  - Mobile: `h-[var(--mobile-header-h)]` (44px).
  - Desktop: `lg:h-[var(--desktop-header-h)]` (64px).

### Color & Styling (Design System Aligned)

- **Background:** `bg-brand-900` (#070808) — matches existing checkout layout; darker than `surface.page` to visually separate checkout from store browsing.
- **Border:** A single 1px solid bottom border using `border-white/5` to subtly separate the topbar from the checkout content. Matches existing implementation.
- **Logo Asset:** Use the exact same vector/SVG asset as the homepage (`/logo-orbit-white.svg`). Ensure the fill color maps to `brand.400` (#F6E3D5) if it is a monochromatic logo.

## 2. Stepper Visual Specification

**Goal:** A highly readable, logically sequenced progress indicator using Phosphor Icons, giving the user immediate context of their position in the checkout flow without visual clutter.

### Layout & Typography

- **Container:** Horizontal flexbox, fully justified (`justify-between`), positioned immediately below the topbar with a top margin of `mt-6` or `mt-8`.
- **Labels (Optional Desktop / Hidden Mobile):** If text labels are used below the icons, they must use the `.type-overline` class (text-small, uppercase, tracking-editorial) to maintain the premium feel.
- **Connecting Lines:**
  - Height: 1px or 2px thick horizontal rule bridging the icons.
  - Z-index: Positioned behind the icons.

### Sizing (Device Specific)

| Device Breakpoint | Icon Size | Label Visibility |
|-------------------|-----------|------------------|
| Mobile (below `lg`, i.e. < 1024px) | 24px (`w-6 h-6`) | Hidden — rely purely on clear icons to prevent crowding |
| Desktop (`lg` and above, ≥ 1024px — both `lg-touch` and `lg-desktop`) | 32px (`w-8 h-8`) | Visible — using `.type-overline` typography token |

### State & Color Mapping (Strict Design System Alignment)

Every state uses specific tokens from your textTokens and colors config to guarantee visual hierarchy.

#### Active Slice (Current Step)

- **Visual UX:** Must be the brightest element in the stepper to immediately draw the eye.
- **Icon/Text Color:** `text-brand-400` (#F6E3D5). This maps to `text.primary` in the design system config (`tailwind.config.ts` → `textTokens.primary`).
- **Styling:** Phosphor Icon weight should be set to fill or bold.

#### Passed Slice (Completed Step)

- **Visual UX:** Distinctly processed but muted so it doesn't compete with the Active Slice.
- **Icon/Text Color:** `text-brand-600` (#C9A18A). This provides a warm, brand-aligned fade that sits neatly behind the primary highlight without looking "disabled".
- **Connecting Line (Leading up to this point):** `bg-brand-600`.
- **Styling:** Phosphor Icon weight set to regular.

#### Not Yet Available Slice (Pending Step)

- **Visual UX:** Greyed out, pushed into the background, communicating that it cannot be interacted with yet.
- **Icon/Text Color:** `text-secondary-600` (#6E6D6B). Provides low contrast (~3.5:1 against `brand[900]` #070808) — passes WCAG AA for large text / UI icons (≥3:1) but is below the 4.5:1 normal-text threshold. Acceptable for decorative stepper icons which are supplemented by the active slice's high contrast.
- **Connecting Line (Ahead of current point):** `bg-secondary-800` or `bg-secondary-700`.
- **Styling:** Phosphor Icon weight set to light.

### Phosphor Icon Sequence (4-step checkout flow: Basket → Address → Shipping → Payment)

To ensure professional UX readability, use universally understood metaphors aligned with the actual checkout funnel:

| Step | Label | Phosphor Icon | Rationale |
|------|-------|---------------|-----------|
| 1 | Basket | `ShoppingCart` or `Bag` | Review items before entering funnel |
| 2 | Address | `MapPin` or `House` | Delivery destination |
| 3 | Shipping | `Truck` or `Package` | Carrier & method selection |
| 4 | Payment | `CreditCard` | Final transaction |

> **Note:** The return/confirmation page (`/checkout/return`) is post-checkout — it is NOT a stepper step. The stepper covers the 4 active checkout pages only.
