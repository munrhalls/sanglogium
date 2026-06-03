# Payment Page — Visual Design Specification
**Sang-logium · Checkout funnel · Step 4 of 4**
*Scope: visual design only — no implementation code*

---

## 1. Diagnosed Problems in Current UI

| # | Location | Problem | Severity |
|---|----------|---------|----------|
| 1 | Both | Progress stepper uses plain `type-caption` inline text — no visual step indicator, no active/done state, no brand styling | High |
| 2 | Mobile | Product name in summary truncates on narrow viewport despite `break-words` — wrapping not reliable in flex context | High |
| 3 | Mobile | Back navigation links (`Back to shipping` / `Edit basket`) are `type-caption` — 12px, touch target far below 44px min | High |
| 4 | Mobile | Summary card and payment form stacked: back nav sits *between* them — breaks visual flow and is easy to miss | Medium |
| 5 | Both | "Deliver to" address block has no visual anchor (no pin icon, no section label styling) — reads as plain body text | Medium |
| 6 | Both | Loading state for PaymentForm is bare `type-caption` text "Loading payment form…" — no skeleton, feels broken | Medium |
| 7 | Both | Error state in `PaymentPageClient.tsx` uses raw off-brand Tailwind utilities (`bg-red-50`, `text-red-800`, `bg-blue-600`) | High |
| 8 | Both | `CheckoutSummary` h2 "Order Summary" uses `type-section-hed` — correct weight but no overline / section-anchor contrast above it | Low |
| 9 | Desktop | Left column (summary + nav) and right column (payment form) are not top-aligned — `space-y-4` adds offset | Low |
| 10 | Both | VAT row always shows `0,00 zł` — visually adds noise; label "VAT (included)" is correct but value needs de-emphasis | Low |
| 11 | Mobile | No sticky Pay CTA bar — the Pay button is buried inside the form card; user must scroll to reach it | Medium |

---

## 2. Design System Reference (from tailwind.config.ts)

### 2.1 Color Tokens

| Token | Value | Role on payment page |
|-------|-------|----------------------|
| `surface.page` | `brand[700]` `#151B1B` | Page background |
| `surface.card` | `secondary[900]` `#1A1A19` | Card backgrounds (summary, form) |
| `surface.elevated` | `secondary[800]` `#2E2E2D` | Thumbnail fallback bg |
| `surface.subtle` | `brand[800]` `#0D0F0F` | Address block bg tint |
| `border.secondary` | `secondary[700]` `#4A4948` | Row dividers, card borders |
| `brand[400]` | `#F6E3D5` | CTA fill, active stepper node, selected ring |
| `brand[500]` | `#E8C9B5` | CTA hover |
| `brand[600]` | `#C9A18A` | CTA active, focus ring |
| `brand[700]` | `#151B1B` | CTA text, stepper node text |
| `text.body` | `brand[200]` `#FAEEE6` | Product names, address lines |
| `text.secondary` | `secondary[400]` `#C7C6C4` | Subtotal/shipping labels, nav links |
| `text.caption` | `secondary[500]` `#9A9997` | Delivery estimate, security badge |
| `text.priceTag` | `secondary[300]` `#E5E4E2` | All price values |
| `text.overline` | `accent[500]` `#D4AF37` | Progress step labels |
| `text.headline` | `brand[400]` `#F6E3D5` | "Order Summary", "Total" |
| `success[500]` | `#4ADE80` | Security lock icon |
| `error[500]` | `#EF4444` | Payment error messages |
| `warning[500]` | `#F59E0B` | Open Box badge text |
| `accent[500]` | `#D4AF37` | Active step label, overlines |

### 2.2 Typography Tokens (relevant)

| Token class | Size | Weight | Color token | Use |
|-------------|------|--------|-------------|-----|
| `.type-section-hed` | h1 clamp | semibold 600 | `text.headline` | "Order Summary", "Total" row |
| `.type-overline` | 12px / ls 0.260em / uppercase | medium 500 | `text.overline` (`accent[500]`) | Progress step labels |
| `.type-card-title` | 16px body | semibold 600 | `text.body` | Product names |
| `.type-metadata` | h4 clamp | medium 500 | `text.secondary` | "Deliver to" label, delivery estimate |
| `.type-price` | h4 clamp | semibold 600 | `text.priceTag` | All price values |
| `.type-body` | 16px | regular 400 | `text.body` | Address lines, row labels |
| `.type-caption` | 12px | regular 400 | `text.caption` | Security badge, nav links, delivery days |
| `.btn-cart-large` | actionLarge clamp | bold 700 | bg `brand[400]`, text `brand[700]` | Pay button |
| `.btn-secondary` | — | — | border `brand[200]`, text `brand[100]` | Back navigation (desktop ghost variant) |

### 2.3 Component Tokens (relevant)

| Token class | Definition | Use |
|-------------|------------|-----|
| `.card-base` | bg `surface.card`, p-6, radius `lg`(4px), border `border.secondary` | Summary card, payment form card |
| `.btn-cart-large` | bg `brand[400]`, text `brand[700]`, p-4, radius `sm`(2px), bold | Pay button |
| `.type-overline` | 12px, uppercase, ls 0.260em, `accent[500]` | Stepper labels |
| `.section-header-anchor` | flex + 32px `brand[400]` line before content | Not used on this page |
| `shadow-cardDark` | `0 4px 20px rgba(255,255,255,0.03), 0 0 0 1px rgba(255,255,255,0.05)` | Card idle shadow |

---

## 3. Layout Architecture

### 3.1 Page Shell (inherited from checkout layout)
- **Background:** `surface.page` (`brand[700]` `#151B1B`)
- **Font:** Montserrat via `--font-montserrat`
- **Header:** minimal logo-only, `bg-brand-900`, `border-b border-white/5`
- **Main:** `px-4 py-8`, `max-w-4xl mx-auto`

### 3.2 Page Grid
- **Mobile (< lg):** single column, `space-y-6`
- **Desktop (lg+):** two columns, `grid grid-cols-2 gap-8 items-start`
  - Left: Order Summary card + back navigation
  - Right: Payment form card
  - `items-start` — both columns pin to top, no vertical stretching

### 3.3 Vertical Rhythm

```
[checkout header — logo only]
  ↕ 32px (py-8)
[progress stepper]              ← 4-step, "Payment" active
  ↕ 24px (mb-6)
[two-column grid]
  Left: [Order Summary card]
        ↕ 16px (mt-4)
        [back navigation row]
  Right: [Payment form card]
  ↕ 24px bottom padding
[mobile sticky Pay bar]         ← fixed bottom, mobile only
```

---

## 4. Progress Indicator

### Spec
- **Pattern:** 4-step horizontal breadcrumb — `Basket → Address → Shipping → Payment`
- **Completed steps (Basket, Address, Shipping):** `.type-overline` label, filled node `brand[400]` bg, `brand[700]` text, checkmark icon 10×10px inside node
- **Active step (Payment):** `.type-overline` label in `accent[500]`, node `brand[400]` bg, bold label
- **Connector lines:** 1px `border.secondary`, between node circles
- **Typography:** `.type-overline` (12px, uppercase, `letter-spacing: 0.260em`) for all labels
- **Mobile:** labels hidden, only circles + connectors — saves horizontal space. Completed = filled `brand[400]`. Active = `brand[400]` with subtle glow `box-shadow: 0 0 0 3px rgba(246,227,213,0.2)`
- **Desktop:** full labels visible below nodes
- **Alignment:** `flex items-center justify-center`, full width within `max-w-4xl`

---

## 5. Order Summary Card

### 5.1 Card Shell
- **Component:** `.card-base` — bg `surface.card` (`#1A1A19`), `p-6`, `rounded-lg`(4px), `border border-border-secondary`, `shadow-cardDark`
- **Heading "Order Summary":** `.type-section-hed` — left-aligned, `mb-4`

### 5.2 "Deliver to" Block
- **Background:** `surface.subtle` (`brand[800]` `#0D0F0F`) tint — `rounded-md px-3 py-2 mb-4`
- **Label "Deliver to":** `.type-caption text-text-caption` — with pin icon (12×12px, `text.caption`) inline left
- **Name line:** `.type-body text-text-body` — `font-medium`
- **Address lines:** `.type-body text-text-body` — one line per field (street+number, postal+city, country code)
- **No "Edit" link here** — editing requires going back through funnel; covered by back navigation

### 5.3 Product Line Items

**Layout per item:** `flex items-start gap-3`

**Left — Thumbnail (48×48px):**
- Container: `relative w-12 h-12 shrink-0 rounded overflow-hidden`
- Filled: `object-cover`, bg `surface.elevated`
- Empty fallback: `bg-surface-elevated flex items-center justify-center text-text-caption text-xs` with `—`
- **Adequate size — keep as-is**

**Centre — Name + badge (flex-1, min-w-0):**
- Open Box badge (when present): `inline-block mr-1.5 px-1.5 py-0.5 rounded-sm bg-warning-500/20 text-warning-500 type-caption font-medium`
- Product name: `.type-card-title` (16px semibold) — **must use `overflow-wrap: break-word; word-break: break-word`** on the span, not just `break-words` class (which uses `overflow-wrap` only). Quantity `× N` appended inline.

**Right — Line total (shrink-0):**
- `.type-price` — h4 clamp, semibold, `text.priceTag`
- `min-w-[72px] text-right` — prevents layout jitter

### 5.4 Totals Rows

All rows: `border-t border-border-secondary pt-2`

| Row | Label style | Value style | Notes |
|-----|-------------|-------------|-------|
| Subtotal | `.type-body text-text-secondary` | `.type-price` | — |
| Shipping + estimate | `.type-body text-text-secondary` + `.type-caption text-text-caption block mt-0.5` for estimate | `.type-price` | Estimate sub-line below label |
| VAT (included) | `.type-caption text-text-caption` | `.type-caption text-text-caption` | **De-emphasised** — smaller than other rows; value `0,00 zł` is informational only |
| **Total** | `.type-section-hed` | `.type-section-hed` | Bold, full visual weight — most important row |

**Gap between items and totals:** `mt-2 border-t border-border-secondary pt-2` on the subtotal block (already done — keep)

---

## 6. Back Navigation

### Current problem
`type-caption` links (12px) with tiny SVG chevron — untappable on mobile.

### Spec
- **Position:** directly below summary card, `mt-4`
- **Layout:** `flex items-center justify-between gap-4`
- **Both links:** min touch target `min-h-[44px] flex items-center` — pad vertically to meet 44px
- **"← Back to shipping":**
  - Left chevron icon 14×14px
  - `.type-caption text-text-secondary` — slightly brighter than current `text-text-caption`
  - `hover:text-text-body transition-colors duration-200`
- **"Edit basket →":**
  - Basket icon 14×14px
  - Same style as above
- **Mobile:** these links sit *below the summary card* (not between summary and form). On mobile, payment form is below back nav. Order: `[summary] [back nav] [payment form]`

---

## 7. Payment Form Card

### 7.1 Card Shell
- **Component:** `.card-base` — same as summary card
- **No heading** — the card is self-explanatory; Stripe's ExpressCheckout provides its own context

### 7.2 Loading State
- **Not** bare text "Loading payment form…"
- **Should be:** skeleton inside `.card-base`:
  - Placeholder bar `h-11 rounded-sm bg-surface-elevated animate-pulse` (ExpressCheckout placeholder)
  - Divider `h-px bg-border-secondary mt-4 mb-4`
  - Three stacked bars `h-10 rounded-sm bg-surface-elevated animate-pulse mb-3` (PaymentElement field placeholders)
  - Pay button placeholder `h-14 rounded-sm bg-surface-elevated animate-pulse mt-6`
- **Typography below skeleton:** `.type-caption text-text-caption text-center mt-2` "Preparing secure payment…"

### 7.3 ExpressCheckout Section (Stripe Link / Apple Pay / Google Pay)
- Stripe renders its own element — **do not override Stripe component styling**
- Wrapper: no additional padding needed; Stripe handles internal spacing
- `buttonHeight: 44` — already correct (meets touch target)
- `layout: { maxColumns: 2 }` — already correct

### 7.4 "Or pay by card" Divider
- Container: `border-t border-border-secondary pt-4`
- Text: `text-center .type-caption text-text-caption mb-3`
- **Keep as-is** — correct and minimal

### 7.5 PaymentElement (card fields)
- Stripe renders its own element — do not override
- `fields: { billingDetails: { address: 'never' } }` — already correct (address pre-filled from session)

### 7.6 Error Message
- **Inline below PaymentElement, above security badge**
- Container: `rounded border border-error-500/30 bg-error-500/10 px-3 py-2 mt-2`
- Text: `.type-caption text-error-500`
- **Not** bare `type-body text-error-500` (too large)

### 7.7 Klarna Messaging Element (≥ 5000 gr)
- Position: **between the summary card and the payment form card** — not inside the form card
- Container: `mb-4` wrapper
- Stripe renders its own element — do not override styling

### 7.8 Security Badge
- Position: between PaymentElement/error and Pay button
- Layout: `flex items-center justify-center gap-1.5`
- Lock icon: 12×12px SVG, `text-success-500` (`#4ADE80`) — already correct
- Text: `.type-caption text-text-caption` "Secure payment encrypted by Stripe"
- **Keep as-is** — correct placement and style

### 7.9 Pay Button
- **Component:** `.btn-cart-large w-full justify-center py-4`
- **Label idle:** "Pay" — correct; may add total amount inline: "Pay · 714,59 zł" for clarity at final commit moment
- **Label loading:** spinner `h-4 w-4 animate-spin rounded-full border-2 border-brand-700 border-t-transparent` + "Processing…"
- **Disabled state:** opacity 0.4, cursor not-allowed — already in `.btn-cart-large:disabled`
- **Keep all of the above** — this is correct

### 7.10 Payment Method Icons Row
- `flex items-center justify-center gap-2 pt-2`
- `.type-caption text-text-secondary font-medium` for each label
- `·` separator, `text-text-caption`
- **Keep as-is** — correct

---

## 8. Error State (PaymentPageClient / system-level)

**Current problem:** Uses off-brand `bg-red-50 text-red-800 bg-blue-600` — completely breaks design system.

### Spec
- **Container:** `.card-base` (matches rest of page)
- **Heading:** `.type-section-hed` "Payment Error" — `text.headline`
- **Message:** `.type-body text-text-secondary` — the error description
- **Retry button:** `.btn-cart-large` — brand-400 fill (replaces `bg-blue-600`)
- **Go Back button:** `.btn-secondary` — transparent, `border-brand-200`, `text-brand-100`
- **Layout:** `flex gap-4 mt-6`

---

## 9. Mobile Sticky Pay Bar

### Problem
Pay button is buried in the form card — on shorter screens, user may not see it without scrolling.

### Spec
- **Condition:** Mobile only (`lg:hidden`)
- **Position:** `fixed bottom-0 left-0 w-full z-50`
- **Background:** `surface.page` (`brand[700]`) — opaque
- **Top border:** `border-t border-border-secondary`
- **Top shadow:** `box-shadow: 0 -4px 16px rgba(0,0,0,0.3)`
- **Padding:** `px-4 py-3`
- **Button:** `.btn-cart-large w-full justify-center` — same Pay button, same states
- **Form card Pay button:** hidden on mobile (`lg:block hidden`) — sticky bar is the primary CTA
- **Content reserve:** form card uses `pb-28` so Pay button inside card is never the only option

> **Note:** The Pay action must remain wired to the same `handlePay` handler — sticky bar button is a visual duplicate only, not a second handler.

---

## 10. Typography Hierarchy — Payment Page

| Element | Token | Size | Weight | Color |
|---------|-------|------|--------|-------|
| Progress step labels | `.type-overline` | 12px | medium | `text.overline` `accent[500]` |
| "Order Summary" heading | `.type-section-hed` | h1 clamp | semibold | `text.headline` `brand[400]` |
| "Deliver to" label | `.type-caption` | 12px | regular | `text.caption` `secondary[500]` |
| Name / address lines | `.type-body` | 16px | regular (name: medium) | `text.body` `brand[200]` |
| Product name | `.type-card-title` | 16px | semibold | `text.body` `brand[200]` |
| Open Box badge | `.type-caption` | 12px | medium | `warning[500]` on `warning[500]/20` |
| Quantity suffix `× N` | `.type-card-title` | 16px | semibold | `text.body` |
| Line total | `.type-price` | h4 clamp | semibold | `text.priceTag` `secondary[300]` |
| Row labels (subtotal, shipping) | `.type-body` | 16px | regular | `text.secondary` `secondary[400]` |
| VAT row | `.type-caption` | 12px | regular | `text.caption` `secondary[500]` |
| Delivery estimate | `.type-caption` | 12px | regular | `text.caption` |
| "Total" label + value | `.type-section-hed` | h1 clamp | semibold | `text.headline` `brand[400]` |
| Back nav links | `.type-caption` | 12px | regular | `text.secondary` → hover `text.body` |
| "Or pay by card" | `.type-caption` | 12px | regular | `text.caption` |
| Security badge | `.type-caption` | 12px | regular | `text.caption` |
| Pay button label | `.btn-cart-large` (actionLarge) | clamp | bold 700 | `brand[700]` |
| Payment method icons | `.type-caption` | 12px | medium | `text.secondary` |
| Error message (inline) | `.type-caption` | 12px | regular | `error[500]` |

---

## 11. Spacing & Sizing Reference

| Element | Spec |
|---------|------|
| Page top padding | `pt-8` (32px) |
| Progress stepper → grid gap | `mb-6` (24px) |
| Desktop grid column gap | `gap-8` (32px) |
| Summary card padding | `p-6` (24px, from `.card-base`) |
| "Deliver to" tint block padding | `px-3 py-2` |
| "Deliver to" tint block bottom margin | `mb-4` |
| Item list gap | `space-y-3` (12px) |
| Product thumbnail size | 48×48px |
| Totals row top border + padding | `border-t border-border-secondary pt-2` |
| Summary card → back nav gap | `mt-4` (16px) |
| Back nav link min height | `min-h-[44px]` |
| Right column price min-width | `min-w-[72px]` |
| Desktop grid alignment | `items-start` |
| Payment form card padding | `p-6` (from `.card-base`) |
| ExpressCheckout button height | 44px |
| Pay button padding | `py-4` (within `btn-cart-large`) |
| Mobile sticky bar padding | `px-4 py-3` |
| Mobile form bottom padding | `pb-28` |
| Klarna element bottom margin | `mb-4` |

---

## 12. Responsive Behaviour

### Mobile (< lg / < 1024px)
- Single column layout: `[stepper] [summary card] [back nav] [Klarna if ≥5000gr] [payment form card]`
- Back navigation: `flex justify-between`, min-height 44px per link
- Pay button: sticky bottom bar (`fixed bottom-0`); Pay button inside form card hidden
- Progress stepper: circles only (no text labels)
- Product names: full width, wrap freely — no truncate
- "Order Summary" heading: left-aligned, single line (or wraps — acceptable)

### Desktop (≥ lg / ≥ 1024px — both `lg-touch` and `lg-desktop`)
- Two-column grid: left = summary + back nav, right = Klarna (if applicable) + payment form
- `grid-cols-2 gap-8 items-start`
- Progress stepper: full labels visible
- Pay button: inside form card only — no sticky bar
- Both columns top-aligned (`items-start` — prevents summary card from stretching to match form height)

---

## 13. Accessibility Checklist

| Requirement | Spec |
|-------------|------|
| Keyboard navigation | Tab through back nav links → Pay button; Stripe elements handle their own tab order |
| Screen reader — progress stepper | `aria-label="Checkout progress"` on `<nav>`; current step `aria-current="step"` |
| Screen reader — summary | `<h2>` "Order Summary" announces section; `<ul>` for items list |
| Screen reader — totals | Use `<dl>/<dt>/<dd>` or `<table>` for label+value pairs — not bare divs |
| Screen reader — Pay button | `aria-busy="true"` during loading; `aria-disabled="true"` when disabled |
| Focus indicator | `:focus-visible` on back nav links: `outline: 2px solid brand[600]` at 2px offset |
| Touch targets | Back nav links: `min-h-[44px]`; sticky Pay bar button: full width |
| Colour contrast | `brand[200]` (#FAEEE6) on `secondary[900]` (#1A1A19) = ~12:1 (AAA); `secondary[300]` (#E5E4E2) on `#1A1A19` = ~10:1 (AAA); `brand[400]` (#F6E3D5) on `brand[700]` (Pay button text) = verified >4.5:1 (AA) |
| Error announcement | Error message uses `role="alert"` — screen reader announces immediately on inject |
| Stripe elements | Managed by Stripe SDK — do not override; SDK is WCAG 2.1 AA compliant |

---

## 14. Motion & Transitions

| Element | Transition |
|---------|------------|
| Back nav links hover | `color duration-200 ease` |
| Error message appear | `opacity 0→1, translateY 4px→0, duration-200` |
| Pay button hover | `background-color 0.2s ease, box-shadow 0.2s ease` (from `.btn-cart-large`) |
| Pay button loading spinner | `animate-spin` |
| Skeleton pulse (loading state) | `animate-pulse` (Tailwind built-in) |
| Progress stepper completed nodes | static — no animation needed |

All transitions: `prefers-reduced-motion: reduce` collapses to instant.

---

## 15. Design Alignment to Checkout Pages

| Convention | Address page | Shipping page | Payment page |
|------------|-------------|---------------|--------------|
| Page background | `surface.page` `brand[700]` | same | same |
| Font | Montserrat | same | same |
| Card style | `.card-base` | n/a (no card) | `.card-base` for both panels |
| Section heading | `.type-section-hed text-center` | `.type-section-hed` left | `.type-section-hed` left |
| CTA button | `.btn-cart-large w-full` | `.btn-cart-large w-full` | `.btn-cart-large w-full py-4` |
| Error banner | `border-error-500/30 bg-error-500/10` | same | same |
| Progress indicator | present | present | **must match** — same 4-node pattern |
| Back navigation | `← Back` ghost link | `← Back to shipping` caption link | `← Back to shipping` + `Edit basket` |
| Max content width | `max-w-4xl` (layout) | `max-w-4xl` (layout) | `max-w-4xl` (layout, keep) |

---

## 16. What Is Correct in the Current Implementation (Keep As-Is)

1. `.card-base` for CheckoutSummary — correct component
2. `type-section-hed` for "Order Summary" and "Total" row — correct weight
3. `type-price` for all price values — correct
4. `type-caption text-text-caption` for "Deliver to" label — correct
5. `break-words` on product name span — correct intent (fix with `word-break: break-word` in addition)
6. Open Box badge: `bg-warning-500/20 text-warning-500 type-caption font-medium` — correct
7. Delivery estimate sub-line: `block type-caption text-text-caption mt-0.5` — correct
8. `btn-cart-large w-full justify-center py-4` for Pay button — correct
9. Security badge with `text-success-500` lock icon — correct position and style
10. `Visa · Mastercard · BLIK` row: `type-caption text-text-secondary` — correct
11. `border-t border-border-secondary` row dividers in totals — correct
12. Stripe `elements.submit()` before `confirmPayment` — correct SDK pattern (not a design concern but noted)
13. Two-column grid `lg-touch:grid-cols-2 lg-desktop:grid-cols-2` — correct breakpoints
14. `min-w-0` on both grid children — correct (prevents flex overflow)

---

## 17. Summary of Required Design Changes

| Priority | Element | Change |
|----------|---------|--------|
| P0 | Progress stepper | Replace plain text `type-caption` with 4-node visual stepper; "Payment" = active |
| P0 | Error state (system) | Replace off-brand `red-50/blue-600` with `.card-base` + `.btn-cart-large` + `.btn-secondary` |
| P0 | Back nav touch target | Add `min-h-[44px] flex items-center` to both links |
| P1 | Loading state (PaymentForm) | Replace bare text with pulse skeleton inside `.card-base` |
| P1 | "Deliver to" block | Add `surface.subtle` tint bg + pin icon + `font-medium` for name line |
| P1 | Product name wrapping | Add `word-break: break-word` to name span (supplement existing `break-words`) |
| P1 | VAT row de-emphasis | Downscale to `.type-caption text-text-caption` for both label and value |
| P1 | Desktop grid alignment | Add `items-start` to grid — pins both columns to top |
| P2 | Mobile sticky Pay bar | Add `fixed bottom-0` sticky bar with Pay button; hide form-card Pay button on mobile |
| P2 | Pay button label | Consider "Pay · 714,59 zł" format — total at final commit point reduces abandonment |
| P2 | Klarna element position | Move above form card (between summary and form), not inside form card |
