# Basket Design, UX/UI Audit & Specification

**Date:** 2026-04-02
**Scope:** Visual design, UX/UI, design system coherence, interaction states, responsive behavior
**Inputs:** Screenshots (homepage, catalogue, search, products page, PDP, basket), `tailwind.config.ts`, all basket components, reference components
**Out of scope:** Data flow, state management, checkout/payment internals (covered in `BASKET_AUDIT.md` and `BASKET_SPECIFICATIONS.md`)

---

## Part 1: Design System Reference (Established Patterns)

### 1.1 Brand Personality

The app presents a **dark luxury audiophile** aesthetic:
- Near-black backgrounds (`brand-900` #070808, `brand-700` #151B1B)
- Warm cream/beige text hierarchy (`brand-200` #FAEEE6, `brand-400` #F6E3D5)
- Gold accent (`accent-500` #D4AF37) for overlines, highlights, active states
- Product images on light cream surfaces (`brand-200` #FAEEE6)
- Editorial typography — Montserrat with wide letter-spacing (`0.260em`) on headings
- Minimal border radius (2–4px) — sharp, refined, not rounded/playful
- Subtle dark shadows (`cardDark`, `cardHoverDark`) with white-tinted glow
- Section header anchor pattern: horizontal gold line before heading text
- Segment titles: orbit logo decoration flanking centered heading

### 1.2 Design Tokens Summary

| Token Category | Key Values |
|----------------|-----------|
| **Page bg** | `brand-900` (#070808) |
| **Card bg** | `secondary-900` (#1A1A19) via `card-base` |
| **Elevated bg** | `secondary-800` (#2E2E2D) |
| **Product image bg** | `brand-200` (#FAEEE6) |
| **Primary text** | `brand-400` (#F6E3D5) |
| **Body text** | `brand-200` (#FAEEE6) |
| **Caption text** | `secondary-500` (#9A9997) |
| **Price text** | `secondary-300` (#E5E4E2) |
| **Accent/overline** | `accent-500` (#D4AF37) |
| **Border** | `secondary-700` (#4A4948) |
| **Border radius** | `lg`=4px, `md`=3px, `sm`=2px |
| **Shadows** | `cardDark`, `cardHoverDark`, `button`, `buttonHover` |
| **Max content** | 1280px |
| **Skeleton pulse** | `secondary-800` (#2E2E2D) — per `ProductCardSkeleton` |

### 1.3 Button System

| Token | Background | Text | Border | Usage |
|-------|-----------|------|--------|-------|
| `btn-primary` | `brand-400` | `brand-700` | none | Checkout, primary CTA |
| `btn-cart` | `brand-400` | `brand-700` | none | Add to cart on ProductCard |
| `btn-secondary` | transparent | `brand-100` | `brand-200` 1px | Continue Shopping, quantity ± on PDP |
| `btn-ghost` | transparent | `brand-400` | none | Underlined editorial links |

### 1.4 Typography System

| Token | Usage | Font Size | Weight | Color |
|-------|-------|-----------|--------|-------|
| `type-section-hed` | Page titles | h1 clamp | semibold | `text-headline` (brand-400) |
| `type-section-sub` | Section subtitles | h2 clamp | medium | `text-subtitle` (secondary-300) |
| `type-body` | Product names, body | 16px | regular | `text-body` (brand-200) |
| `type-price` | Prices | h4 clamp | semibold | `text-priceTag` (secondary-300) |
| `type-metadata` | Table headers, meta | h4 clamp | medium | `text-secondary` (secondary-400) |
| `type-caption` | Small labels, SKU | 12px | regular | `text-body` (brand-200) |
| `type-overline` | Brand labels | 12px | medium | `text-overline` (accent-500) |

### 1.5 Card Patterns

| Token | Bg | Border | Shadow | Hover |
|-------|-----|--------|--------|-------|
| `card-base` | `secondary-900` | `border-secondary` 1px | `card` | — |
| `card-product-dark` | transparent | `border-secondary` 1px | `cardDark` | `cardHoverDark` + `translateY(-2px)` + `border-brand-400` |

### 1.6 Component Patterns (from reference pages)

**ProductCard (products page):**
- `card-product-dark` wrapper with group hover
- Image: `aspect-[4/3]`, `bg-surface-productImage`, `mix-blend-multiply`, `transition-transform duration-700 group-hover:scale-110`
- Brand: `type-caption text-brand-900` positioned absolute top-left over image
- Name: `type-body font-medium line-clamp-2`
- Price: `type-price` with `toLocaleString()`
- CTA: `btn-cart` with ShoppingCart icon + "Add" text

**ProductInfo (PDP):**
- Quantity controls: `btn-secondary w-10 h-10` for ±, quantity centered in `w-12`
- Add to cart: `btn-cart w-full` with ShoppingCart icon
- Stock status: `type-caption` with semantic colors (`success-500`, `warning-500`, `error-500`)
- Price: `Price` component using `Intl.NumberFormat` → `type-price tabular-nums`

**ProductCardSkeleton:**
- `card-product-dark` wrapper
- Pulse: `bg-secondary-800 animate-pulse`

**Shelf (page wrapper):**
- `w-full py-20` outer section
- `mx-auto px-4 md:px-8 max-w-content` inner container

**SegmentTitle (page heading):**
- Centered, orbit logos flanking, `type-section-hed uppercase section-header-anchor`

---

## Part 2: Current Basket Audit Ratings

### Rating Matrix

| # | Metric | Score | Evidence |
|---|--------|-------|----------|
| 1 | **Design** | **4/10** | BasketControls uses raw `bg-black`/`text-white` — zero design token usage. Rest of basket components use tokens correctly but controls are the most interactive, visible element. |
| 2 | **Visual Hierarchy** | **5/10** | Page title clear. But "Purchase quantity:" label at `text-lg font-bold` competes with product names. "Basket Summary" at `type-section-sub` is appropriately weighted but summary line items lack clear hierarchy between labels and values. |
| 3 | **White Space** | **6/10** | `Shelf` provides `py-20`. `gap-8` between columns is consistent. Internal `p-5` in basket rows is close to system `p-6`. Summary card spacing is reasonable. But basket rows feel slightly cramped horizontally with the 4-column grid. |
| 4 | **Border Radii** | **7/10** | `card-base` uses `rounded-lg` (4px) ✅. Product images `rounded-sm` (2px) ✅. BasketControls buttons use raw `rounded` (4px default) — coincidentally matches but not using system token. |
| 5 | **Shadows** | **6/10** | `card-base` uses `shadow-card` ✅. No hover shadow on basket cards (not needed for list items). But the entire card has no dark shadow variant — should use `shadow-cardDark` to match dark page context. |
| 6 | **Layout** | **6/10** | Two-column layout (2:1 ratio) with sticky summary is correct e-commerce pattern. Grid `[3fr_1fr_1fr_auto]` for desktop rows is functional. Mobile single-column stacking works. `Shelf` wrapper is correct. |
| 7 | **Symmetry & Positioning** | **5/10** | "Purchase quantity:" text above controls creates asymmetric visual weight in the quantity column. Headers "Product/Price/Quantity" are aligned but quantity column content has extra label text on mobile. Remove button (×) is visually disconnected from quantity group. |
| 8 | **Typography** | **4/10** | BasketControls uses `text-lg font-bold` and `font-black` — completely off type system. No `type-*` token used anywhere in controls. `type-body`, `type-price`, `type-metadata`, `type-section-sub`, `type-caption` used correctly in Basket.tsx and BasketSummary.tsx. |
| 9 | **Color Theory** | **4/10** | BasketControls: `bg-black`, `text-white`, `text-gray-400`, `hover:text-red-500`, `hover:bg-gray-800` — ALL raw Tailwind, ZERO from design system palette. Rest of basket uses design tokens correctly (surface, text, border tokens). The contrast between compliant and non-compliant areas is jarring. |
| 10 | **Web Personality Coherence** | **4/10** | Homepage → catalogue → products → PDP all maintain dark luxury audiophile aesthetic. Basket page breaks this with generic Bootstrap-era quantity buttons. Empty basket state is more coherent than filled state. |
| 11 | **Professional Standard** | **4/10** | Missing: consistent price formatting, proper payment icons, add-to-cart feedback, item removal animation, line-item totals. Present but broken: quantity controls look generic, not luxury. |
| 12 | **System Coherence** | **3/10** | `BasketControls.tsx` uses ZERO design tokens — completely separate design language. Skeleton loading uses `bg-gray-200` instead of `bg-secondary-800` (every other skeleton in the app uses secondary-800). Price formatting uses `.toFixed(2)` while cards use `.toLocaleString()` and PDP uses `Intl.NumberFormat`. Three different formatting approaches in one app. |
| 13 | **Cross-Reference Whole** | **4/10** | User journey: luxurious homepage → elegant cards → polished PDP → **jarring basket with generic black buttons** → back to polished checkout. The basket is the weakest link in the visual chain and the single most trust-critical page before purchase. |

### Overall Score: **4.3 / 10**

---

## Part 3: Gap Analysis

### DG-01: BasketControls Off-System Buttons
- **Current:** `bg-black text-white rounded hover:bg-gray-800` — raw Tailwind, no tokens
- **Target:** `btn-secondary w-9 h-9` matching PDP quantity controls exactly
- **Severity:** Critical — most interactive element on basket page

### DG-02: BasketControls Off-System Typography
- **Current:** `text-lg font-bold` for "Purchase quantity:" label, `font-black` for quantity number
- **Target:** Remove "Purchase quantity:" label entirely (redundant — column header already says "Quantity"). Quantity number uses `type-body text-primary`
- **Severity:** High — breaks type system

### DG-03: BasketControls Off-System Colors
- **Current:** `text-gray-400 hover:text-red-500` for remove button
- **Target:** `text-secondary-500 hover:text-error-500` (system tokens for same visual)
- **Severity:** High — off-palette colors

### DG-04: Price Formatting Inconsistency
- **Current:** Basket uses `$item.displayPrice.toFixed(2)` → "$179.95". ProductCard uses `.toLocaleString()` → "$1,699". PDP uses `Price` component with `Intl.NumberFormat` → "$180"
- **Target:** Use `Price` component everywhere for consistent formatting. Basket totals in BasketSummary also use `Price` component or same `Intl.NumberFormat` pattern
- **Severity:** High — professional inconsistency

### DG-05: Skeleton Loading Colors
- **Current:** `bg-gray-200` in BasketClientWrapper skeleton
- **Target:** `bg-secondary-800 animate-pulse` matching `ProductCardSkeleton` established pattern
- **Severity:** Medium — visible on dark background as bright flash

### DG-06: Missing Card Shadow Variant
- **Current:** Basket card uses `card-base` which has `shadow-card` (light shadow for light contexts)
- **Target:** Either use `card-product-dark` pattern or override with `shadow-cardDark` since page background is `brand-900`
- **Severity:** Low — subtle visual refinement

### DG-07: No Line-Item Total
- **Current:** Shows price and quantity separately, no per-item total
- **Target:** Show `$price × qty = $lineTotal` or at minimum display line total on the right
- **Severity:** Medium — standard e-commerce UX expectation

### DG-08: No Add-to-Cart Feedback on PDP
- **Current:** Clicking "Add to Cart" on PDP has no visual confirmation
- **Target:** Brief toast notification or button state change ("Added ✓" for 2s) confirming action
- **Severity:** High — users have no confidence item was added

### DG-09: No Item Removal Animation
- **Current:** Item disappears instantly from basket list
- **Target:** Fade-out + collapse animation (200-300ms) for smooth removal
- **Severity:** Medium — polish, UX quality

### DG-10: Remove Button Disconnected from Quantity Group
- **Current:** × button sits adjacent to ± buttons with same gap — looks like 4 equal buttons
- **Target:** Separate remove button with visual separator (gap or divider) or move to row far-right
- **Severity:** Medium — prevents accidental removal

### DG-11: Quantity Controls Differ Between PDP and Basket
- **Current:** PDP uses `btn-secondary w-10 h-10` with `-`/`+` text. Basket uses raw `bg-black w-9 h-9`
- **Target:** Identical visual language. Extract shared `QuantitySelector` component used on both PDP and basket
- **Severity:** Critical — same action, different appearance

### DG-12: Payment Icons are Empty Placeholders
- **Current:** Four empty gray boxes with no content
- **Target:** Real SVG payment icons (Visa, Mastercard, Amex, Stripe) or remove section until real icons available
- **Severity:** Medium — placeholder hurts trust

### DG-13: Missing Basket Row Hover Enhancement
- **Current:** `hover:bg-surface-subtle` — extremely subtle (brand-800 on secondary-900)
- **Target:** Add subtle border-left accent on hover or slightly lighter bg, matching the card-product-dark hover pattern (border color change to brand-400)
- **Severity:** Low — polish

### DG-14: Mobile Basket Layout Missing Optimization
- **Current:** Mobile stacks all columns vertically with inline "Quantity:" label
- **Target:** Clean mobile card layout: image + name row, price + quantity + remove row below, clear visual grouping
- **Severity:** Medium — mobile is primary shopping device

### DG-15: No Empty State for Removed Last Item
- **Current:** Removing last item shows EmptyBasketContent (correct) but transition is instant
- **Target:** Smooth transition to empty state after last item removal
- **Severity:** Low — polish

### DG-16: Basket Summary "We Accept" Section Styling
- **Current:** Generic caption styling, empty icon boxes
- **Target:** If kept: proper payment method SVGs. If not ready: remove section entirely to avoid eroding trust
- **Severity:** Medium — trust signal must be real or absent

### DG-17: Missing Quantity Input Accessibility
- **Current:** Quantity is display-only text between two buttons
- **Target:** Quantity could be editable `input` (type="number") for direct entry, or at minimum the current display should have `role="status" aria-live="polite"` for screen readers
- **Severity:** Medium — accessibility

### DG-18: Checkout Button Padding/Sizing
- **Current:** `btn-primary block text-center mt-6` — uses btn-primary which has no explicit padding defined in the component class (relies on whatever padding the element has)
- **Target:** Add `py-3 px-6` or use a standardized button size to match PDP "Add to Cart" button sizing
- **Severity:** Medium — CTA must be prominent and properly sized

---

## Part 4: Design Specification (Target State)

### 4.1 Page Layout

```
Desktop (≥1024px):
┌─────────────────────────────────────────────────────────┐
│                    [Shelf py-20]                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │         ◎ ── YOUR BASKET ── ◎                    │   │
│  │              (SegmentTitle)                       │   │
│  └──────────────────────────────────────────────────┘   │
│                     mb-12                                │
│  ┌─────────────────────────┐  ┌────────────────────┐   │
│  │  Basket Items Card      │  │  Basket Summary    │   │
│  │  (card-base)            │  │  (card-base sticky)│   │
│  │  col-span-2             │  │  col-span-1        │   │
│  │                         │  │                    │   │
│  │  ┌─ Header Row ───────┐ │  │  Subtotal   $X,XXX│   │
│  │  │ Product Price  Qty │ │  │  Shipping   $XX.XX│   │
│  │  └────────────────────┘ │  │  ──────────────── │   │
│  │  ┌─ Item Row ─────────┐ │  │  Total     $X,XXX│   │
│  │  │ [img] Name  $XXX ±│ │  │                    │   │
│  │  └────────────────────┘ │  │  [■ Checkout    ] │   │
│  │  ┌─ Item Row ─────────┐ │  │  [□ Continue   ] │   │
│  │  │ [img] Name  $XXX ±│ │  │                    │   │
│  │  └────────────────────┘ │  │  ── We Accept ── │   │
│  └─────────────────────────┘  │  [V][M][A][S]     │   │
│                                └────────────────────┘   │
└─────────────────────────────────────────────────────────┘

Mobile (<1024px):
┌──────────────────────────┐
│   ◎ ── YOUR BASKET ── ◎  │
│                           │
│ ┌───────────────────────┐ │
│ │ [img] Product Name    │ │
│ │       $XXX × 2        │ │
│ │       [−] 2 [+]  [×]  │ │
│ ├───────────────────────┤ │
│ │ [img] Product Name    │ │
│ │       $XXX × 1        │ │
│ │       [−] 1 [+]  [×]  │ │
│ └───────────────────────┘ │
│                           │
│ ┌───────────────────────┐ │
│ │ Basket Summary        │ │
│ │ Subtotal      $X,XXX  │ │
│ │ Shipping      $XX.XX  │ │
│ │ ─────────────────     │ │
│ │ Total         $X,XXX  │ │
│ │                       │ │
│ │ [■■ Checkout ■■■■■■] │ │
│ │ [□ Continue Shopping] │ │
│ └───────────────────────┘ │
│                           │
│ [ActionBar with badge]    │
└──────────────────────────┘
```

### 4.2 Component Specifications

---

#### 4.2.1 QuantitySelector (NEW shared component)

**Purpose:** Single source of truth for quantity ± controls used on both PDP and basket page.

**Location:** `app/components/ui/QuantitySelector.tsx`

```
┌───┐ ┌───┐ ┌───┐
│ − │ │ 2 │ │ + │
└───┘ └───┘ └───┘
```

**Props:**
```typescript
interface QuantitySelectorProps {
  quantity: number;
  min?: number;         // default 1
  max: number;          // stock limit
  onIncrement: () => void;
  onDecrement: () => void;
  size?: 'sm' | 'md';  // sm for basket rows, md for PDP
}
```

**Styling specification:**

| Property | `sm` (basket) | `md` (PDP) |
|----------|---------------|------------|
| Button size | `w-8 h-8` | `w-10 h-10` |
| Button style | `btn-secondary` | `btn-secondary` |
| Quantity width | `w-8 text-center` | `w-12 text-center` |
| Quantity text | `type-body text-primary` | `type-body text-primary` |
| Gap | `gap-1` | `gap-2` |
| Button text | `type-body` | `type-body` |

**Interaction states:**
- Default: `btn-secondary` appearance (transparent bg, brand-200 border)
- Hover: `bg-brand-300 text-brand-700` (btn-secondary hover)
- Disabled (min/max reached): `opacity-40 cursor-not-allowed`
- Active: `bg-brand-500` (btn-secondary active)
- Focus-visible: `outline-2 outline-brand-600 outline-offset-2`

**Accessibility:**
- `aria-label="Decrease quantity"` / `"Increase quantity"`
- Quantity display: `role="status" aria-live="polite" aria-label="Current quantity: {n}"`

---

#### 4.2.2 BasketControls (Revised)

**Purpose:** Wraps QuantitySelector + remove button for basket page context.

```
┌───┐ ┌───┐ ┌───┐   ┌───┐
│ − │ │ 2 │ │ + │   │ × │
└───┘ └───┘ └───┘   └───┘
  QuantitySelector     Remove
        gap-1          gap-3 (separator space)
```

**Styling specification:**
- Wrapper: `flex items-center gap-3`
- QuantitySelector: `size="sm"`
- Remove button: `w-8 h-8 flex items-center justify-center rounded-sm text-secondary-500 transition-colors duration-200 hover:text-error-500 hover:bg-error-500/10`
- Remove icon: `X` from Phosphor, `size={16}`
- **No "Purchase quantity:" label** — column header provides context

**Animation on removal:**
- Row fades out: `opacity-0 transition-opacity duration-200`
- Then collapses: `max-h-0 overflow-hidden transition-[max-height] duration-300`

---

#### 4.2.3 Basket.tsx (Item List — Revised)

**Desktop row grid:** `grid-cols-[3fr_1fr_1fr_auto]`

```
┌──────────────────────────────────────────────────────────┐
│ Product          │  Price   │  Quantity  │  Line Total   │
├──────────────────┼──────────┼───────────┼───────────────┤
│ [img] Name       │  $179    │  [−]2[+]× │  $358         │
│ [img] Name       │  $6,000  │  [−]1[+]× │  $6,000       │
└──────────────────┴──────────┴───────────┴───────────────┘
```

**Column header row:**
- `hidden lg-desktop:grid lg-touch:grid` (visible on desktop only)
- Grid: `grid-cols-[3fr_1fr_1fr_1fr] gap-4`
- Text: `type-caption uppercase tracking-editorial text-secondary-500`
- Bottom border: `border-b border-border-secondary`
- Padding: `px-6 py-3`
- Headers: "Product", "Price", "Qty", "Total"

**Item row:**
- Grid: `grid-cols-[3fr_1fr_1fr_1fr] gap-4` (desktop), `grid-cols-1` (mobile)
- Padding: `px-6 py-5`
- Border: `border-b border-border-secondary last:border-b-0`
- Hover: `transition-colors duration-200 hover:bg-secondary-900/50` (subtle lightening)
- Hover border accent: `hover:border-l-2 hover:border-l-accent-500/30 hover:pl-[22px]` (left accent bar on hover, adjust padding to compensate)

**Product column (all breakpoints):**
- `flex items-center gap-4`
- Image container: `h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-surface-productImage relative`
- Image: `next/image fill unoptimized className="object-contain p-1 mix-blend-multiply"`
- Product name: `type-body font-medium hover:text-brand-100 transition-colors` wrapped in `Link`
- Mobile price+qty line: `type-caption text-secondary-500 lg-desktop:hidden lg-touch:hidden`

**Price column (desktop only):**
- `hidden lg-desktop:flex lg-touch:flex items-center justify-center`
- Price: `Price` component (shared)

**Quantity column (all breakpoints):**
- `flex items-center lg-desktop:justify-center lg-touch:justify-center`
- Mobile label: removed (unnecessary)
- Content: `<BasketControls product={item} />`

**Line total column (desktop only):**
- `hidden lg-desktop:flex lg-touch:flex items-center justify-end`
- Value: `Price` component with `value={item.displayPrice * item.quantity}`
- Style: `type-price font-semibold`

---

#### 4.2.4 BasketSummary.tsx (Revised)

**Card wrapper:** `card-base sticky top-4 p-6`

**Section layout:**

```
┌──────────────────────────────┐
│  Basket Summary              │
│  ─────────────────────────── │
│                              │
│  Subtotal (3 items)  $6,358  │
│  Shipping              $16   │
│                              │
│  ═══════════════════════════ │
│  Total               $6,374  │
│  Including VAT               │
│                              │
│  ┌──────────────────────────┐│
│  │     ■ Checkout           ││
│  └──────────────────────────┘│
│  ┌──────────────────────────┐│
│  │   ← Continue Shopping    ││
│  └──────────────────────────┘│
│                              │
│  ── We Accept ──────         │
│  [Visa][MC][Amex][Stripe]    │
│  🔒 Secure checkout          │
└──────────────────────────────┘
```

**Heading:** `type-section-sub` — keep current, correct weight

**Summary lines:**
- Label: `type-body text-secondary-400`
- Value: `type-price` via `Price` component (consistent formatting)
- Spacing: `space-y-3`

**Total section:**
- Separator: `border-t border-border-secondary pt-4 mt-4`
- Total label: `type-section-sub` (keep current)
- Total value: `type-section-sub tabular-nums`
- VAT note: `type-caption text-secondary-500 mt-1`

**Checkout button:**
- Enabled: `btn-primary w-full py-3 text-center mt-6 type-body font-bold uppercase tracking-editorial`
- Disabled: same + `opacity-40 cursor-not-allowed` (btn-primary :disabled state handles this)
- Transition: `transition-all duration-200`

**Continue Shopping:**
- `btn-secondary w-full py-3 text-center mt-3`
- ArrowLeft icon inline, `mr-2`

**Payment section:**
- Separator: `border-t border-border-secondary pt-5 mt-6`
- "We Accept" label: `type-caption text-secondary-500 mb-3`
- Icons: Real SVG payment icons (Visa, Mastercard, Amex, Stripe badge) at `h-6 w-10`, or **remove entire section if real icons not available**
- Security note: `type-caption text-secondary-500 mt-2 flex items-center gap-1` with lock icon

---

#### 4.2.5 BasketClientWrapper.tsx — Skeleton (Revised)

**Skeleton pulse color:** `bg-secondary-800 animate-pulse` (NOT `bg-gray-200`)

**Skeleton structure must mirror real layout:**
```
Desktop skeleton:
┌────────────────────────┐  ┌──────────────┐
│ ▓▓▓▓ ▓▓▓▓▓▓ ▓▓▓ ▓▓▓  │  │ ▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓ ▓▓▓▓▓▓ ▓▓▓ ▓▓▓  │  │ ▓▓▓▓   ▓▓▓▓ │
│ ▓▓▓▓ ▓▓▓▓▓▓ ▓▓▓ ▓▓▓  │  │ ▓▓▓▓   ▓▓▓▓ │
└────────────────────────┘  │ ▓▓▓▓▓▓▓▓▓▓▓ │
                            │ ▓▓▓▓▓▓▓▓▓▓▓ │
                            └──────────────┘
```

**Specification:**
- Grid: same as real layout `grid-cols-1 gap-8 lg:grid-cols-3`
- Items card skeleton: `card-base overflow-hidden` with 3 skeleton rows, each containing:
  - Image placeholder: `h-20 w-20 rounded-sm bg-secondary-800 animate-pulse`
  - Text placeholders: `h-4 bg-secondary-800 rounded-sm animate-pulse w-3/4`, `w-1/4`
- Summary card skeleton: `card-base sticky top-4` with:
  - Heading placeholder: `h-5 bg-secondary-800 rounded-sm animate-pulse w-1/2 mb-6`
  - Line placeholders: 3× `h-4 bg-secondary-800 rounded-sm animate-pulse` at varying widths
  - Button placeholder: `h-10 bg-secondary-800 rounded-sm animate-pulse w-full mt-6`

---

#### 4.2.6 EmptyBasketContent.tsx (Minor Revisions)

**Current state:** Mostly correct. Uses `card-base`, `type-section-sub`, `type-body`, `btn-primary`.

**Revisions:**
- ShoppingCart icon: change `text-secondary` to `text-secondary-600` for better visibility without being dominant
- Icon size: keep `64` — appropriate for empty state
- Button: `btn-primary flex items-center gap-2 py-3 px-6` — ensure consistent padding with checkout button
- Add subtle animation: `animate-bounce` on cart icon (once, not infinite) or fade-in on mount

---

#### 4.2.7 Add-to-Cart Feedback (PDP Integration)

**Current:** No feedback after clicking "Add to Cart" on PDP.

**Target specification:**

**Option A — Button State Change (simpler, recommended):**
1. User clicks "Add to Cart"
2. Button text changes to "Added ✓" with `bg-success-700 text-white` for 2 seconds
3. Button is disabled during feedback period
4. After 2s, button returns to normal state
5. ActionBar badge count updates immediately

**Implementation pattern:**
```
Default:    [🛒 Add to Cart]     btn-cart
Adding:     [✓ Added]            bg-success-700 text-brand-50
Return:     [🛒 Add to Cart]     btn-cart (after 2s timeout)
```

**Styling for "Added" state:**
- Background: `bg-success-700` (#15803D)
- Text: `text-brand-50` (#FEFCFB)
- Icon: `Check` from Phosphor (replaces ShoppingCart)
- Transition: `transition-all duration-300`

---

#### 4.2.8 ActionBar Basket Badge (Already Implemented ✅)

**Current implementation is correct:**
- `accent-500` background (#D4AF37 gold)
- White text, xs size, bold
- Absolute positioned `-top-1 -right-1`
- Hydration-gated (`hasHydrated && basketCount > 0`)
- Max display: `99+`

**No changes needed.**

---

### 4.3 Price Formatting Standard

**Single source of truth:** `Price` component at `app/components/ui/Price.tsx`

**Rules:**
- All prices rendered via `Price` component or identical `Intl.NumberFormat` logic
- Currency: USD
- Format: `$X,XXX` (no decimals for whole numbers, decimals for cents)
- Tabular numbers: `tabular-nums` class for alignment in columns
- Summary totals: same format with `.toFixed(2)` for shipping (always has cents)

**Usage map:**

| Location | Current | Target |
|----------|---------|--------|
| ProductCard | `$product.displayPrice.toLocaleString()` | `<Price value={product.displayPrice} />` |
| Basket item price | `$item.displayPrice.toFixed(2)` | `<Price value={item.displayPrice} />` |
| Basket line total | (missing) | `<Price value={item.displayPrice * item.quantity} />` |
| BasketSummary subtotal | `$subtotal.toFixed(2)` | `<Price value={subtotal} />` |
| BasketSummary shipping | `$shipping.toFixed(2)` | Keep `.toFixed(2)` (shipping always has cents) |
| BasketSummary total | `$total.toFixed(2)` | Use formatted total with `.toFixed(2)` for consistency with shipping decimals |
| PDP | `<Price value={product.displayPrice} />` | ✅ Correct already |

---

### 4.4 Responsive Behavior

**Breakpoints used (from tailwind.config.ts):**
- Mobile: `< 1024px` (default)
- Desktop: `lg-desktop:` (≥1024px, ≥851px height) and `lg-touch:` (≥1024px, <850px height)

**Basket page responsive rules:**

| Element | Mobile | Desktop |
|---------|--------|---------|
| Grid layout | `grid-cols-1` | `grid-cols-3` (2:1 ratio) |
| Summary card | Below items, not sticky | Right column, `sticky top-4` |
| Column headers | Hidden | Visible (`hidden lg-desktop:grid lg-touch:grid`) |
| Item row | Single column, stacked | 4-column grid |
| Price column | Inline with product name | Separate column |
| Line total | Hidden (shown as `$price × qty` inline) | Separate column |
| Quantity label | None (removed) | None (column header provides context) |
| Image size | `h-20 w-20` | `h-20 w-20` (same — appropriate) |
| Checkout button | Full width | Full width within summary card |
| ActionBar | Visible with badge | Hidden (`lg-touch:hidden lg-desktop:hidden`) |

---

### 4.5 Animation & Transition Specification

| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Basket row hover | mouseenter | `bg-secondary-900/50` | 200ms | ease |
| Basket row hover accent | mouseenter | left border accent `border-l-accent-500/30` | 200ms | ease |
| Product name hover | mouseenter | `text-brand-100` | 200ms | ease (transition-colors) |
| Quantity button hover | mouseenter | btn-secondary hover (bg-brand-300) | 200ms | ease |
| Remove button hover | mouseenter | `text-error-500 bg-error-500/10` | 200ms | ease |
| Item removal | click remove | opacity 0 → collapse height | 200ms + 300ms | ease-out |
| Add to cart feedback | click add | btn-cart → success state → btn-cart | 300ms in, 2s hold, 300ms out | ease |
| Skeleton pulse | mount | `animate-pulse` | continuous | Tailwind default |
| Empty state icon | mount | subtle fade-in | 500ms | ease-in |
| Summary totals | quantity change | value transition (tabular-nums prevents layout shift) | instant | — |

---

### 4.6 Accessibility Specification

| Requirement | Implementation |
|-------------|---------------|
| Quantity controls | `aria-label` on ± buttons, quantity `role="status" aria-live="polite"` |
| Remove button | `aria-label="Remove {product.name} from basket"` (include product name) |
| Checkout disabled | `aria-disabled="true"` with tooltip explaining why |
| Price updates | Summary total wrapped in `aria-live="polite"` region |
| Empty state | Focus management: auto-focus "Browse Products" link |
| Skeleton | `aria-busy="true"` on skeleton wrapper, `aria-label="Loading basket"` |
| Color contrast | All text meets WCAG AA: brand-200 on secondary-900 = ~12:1, secondary-500 on secondary-900 = ~4.6:1 ✅ |
| Keyboard nav | All buttons focusable, tab order: items → quantity controls → remove → next item → summary |

---

## Part 5: Gap-to-Change Mapping (Sequenced)

### Phase 1: Foundation (shared components)

| # | Gap | Change | File |
|---|-----|--------|------|
| 1 | DG-11, DG-01, DG-02, DG-03 | Create `QuantitySelector` shared component | `app/components/ui/QuantitySelector.tsx` (NEW) |
| 2 | DG-04 | Standardize `Price` component usage across all price displays | `Price.tsx` (verify), consuming files |

### Phase 2: Basket Controls

| # | Gap | Change | File |
|---|-----|--------|------|
| 3 | DG-01, DG-02, DG-03, DG-10 | Rewrite BasketControls: use QuantitySelector + separated remove button, remove "Purchase quantity:" label, use design tokens | `BasketControls.tsx` |
| 4 | DG-11 | Rewrite PDP quantity controls to use QuantitySelector (size="md") | `ProductInfo.tsx` |

### Phase 3: Basket Page Components

| # | Gap | Change | File |
|---|-----|--------|------|
| 5 | DG-07 | Add line total column (desktop), update grid to 4 columns | `Basket.tsx` |
| 6 | DG-04 | Replace all `.toFixed(2)` with `Price` component | `Basket.tsx`, `BasketSummary.tsx` |
| 7 | DG-13 | Enhance basket row hover (left accent bar) | `Basket.tsx` |
| 8 | DG-05 | Fix skeleton colors: `bg-gray-200` → `bg-secondary-800` | `BasketClientWrapper.tsx` |
| 9 | DG-18 | Add explicit padding to checkout/continue buttons | `BasketSummary.tsx` |
| 10 | DG-12, DG-16 | Remove payment placeholder section (or add real icons if available) | `BasketSummary.tsx` |
| 11 | DG-14 | Optimize mobile basket layout (clean stacked card rows) | `Basket.tsx` |

### Phase 4: Interaction & Feedback

| # | Gap | Change | File |
|---|-----|--------|------|
| 12 | DG-08 | Add "Added ✓" button feedback state on PDP | `ProductInfo.tsx` |
| 13 | DG-09, DG-15 | Add item removal animation (fade + collapse) | `Basket.tsx` or `BasketControls.tsx` |
| 14 | DG-17 | Add `aria-live`, `role="status"`, descriptive `aria-label` on interactive elements | `QuantitySelector.tsx`, `BasketControls.tsx`, `BasketSummary.tsx` |

### Phase 5: Polish

| # | Gap | Change | File |
|---|-----|--------|------|
| 15 | DG-06 | Evaluate card shadow variant for dark context | `BasketClientWrapper.tsx` |
| 16 | — | Empty state icon subtle animation | `EmptyBasketContent.tsx` |

---

## Part 6: Target Ratings (After Implementation)

| # | Metric | Current | Target | Delta |
|---|--------|---------|--------|-------|
| 1 | Design | 4 | 9 | +5 |
| 2 | Visual Hierarchy | 5 | 9 | +4 |
| 3 | White Space | 6 | 8 | +2 |
| 4 | Border Radii | 7 | 9 | +2 |
| 5 | Shadows | 6 | 8 | +2 |
| 6 | Layout | 6 | 9 | +3 |
| 7 | Symmetry & Positioning | 5 | 9 | +4 |
| 8 | Typography | 4 | 9 | +5 |
| 9 | Color Theory | 4 | 9 | +5 |
| 10 | Web Personality | 4 | 9 | +5 |
| 11 | Professional Standard | 4 | 9 | +5 |
| 12 | System Coherence | 3 | 10 | +7 |
| 13 | Cross-Reference Whole | 4 | 9 | +5 |
| | **Overall** | **4.3** | **9.1** | **+4.8** |

**Key drivers of improvement:**
- QuantitySelector shared component eliminates the single biggest coherence gap (DG-11)
- Price component standardization eliminates formatting inconsistency (DG-04)
- Design token adoption in BasketControls fixes 3 gaps simultaneously (DG-01/02/03)
- Add-to-cart feedback closes a critical UX gap (DG-08)
- The remaining gaps are polish items that collectively lift from 8 to 9+
