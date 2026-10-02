SCOPE:
- html structure
- layout
- styling
- rwd (mobile <---> desktop)

OUT OF SCOPE:
- anything else


"""
# Return Page (Success / /checkout/success) — Design Spec
**Project:** sang-logium
**Scope:** Visual design only (mobile + desktop). No logic changes.
**Stack:** Next.js 15 / React 19 / Tailwind 3
**Date:** 2026-06-03

---

## 0. Verified Ground Truth

Extracted directly from source. All token names map 1-to-1 to tailwind.config.ts.

### Color tokens (resolved hex)
| Token | Hex | Role |
|---|---|---|
| brand-900 | #070808 | header bg (checkout layout) |
| brand-800 | #0D0F0F | page body bg (checkout layout) |
| brand-700 | #151B1B | surface.page |
| secondary-900 | #1A1A19 | surface.card (.card-base bg) |
| secondary-800 | #2E2E2D | surface.elevated |
| secondary-700 | #4A4948 | border.secondary |
| secondary-300 | #E5E4E2 | border.primary, text.priceTag, text.subtitle |
| secondary-400 | #C7C6C4 | text.secondary |
| secondary-500 | #9A9997 | text.caption |
| brand-400 | #F6E3D5 | text.headline, text.primary, CTA bg |
| brand-200 | #FAEEE6 | text.body |
| accent-500 | #D4AF37 | text.overline, text.accent (gold) |
| success-500 | #4ADE80 | success icon / active step dot |
| success-700 | #15803D | btn-in-basket-large bg |
| error-500 | #EF4444 | error icon |

### Typography utility classes (from plugin)
| Class | Size | Weight | Color |
|---|---|---|---|
| .type-section-hed | h1 clamp | 600 | text.headline = brand-400 |
| .type-section-sub | h2 clamp | 500 | text.subtitle = secondary-300 |
| .type-card-title | 16px | 600 | text.body = brand-200 |
| .type-body | 16px | 400 | text.body = brand-200 |
| .type-metadata | h4 clamp | 500 | text.secondary = secondary-400 |
| .type-price | h4 clamp | 600 | text.priceTag = secondary-300 tabular-nums |
| .type-overline | 12px | 500 uppercase | text.overline = accent-500 |
| .type-caption | 12px | 400 | text.body = brand-200 |
| .type-section-caption | 12px | 300 | text.caption = secondary-500 |

### Component classes (from plugin)
| Class | Description |
|---|---|
| .card-base | bg-secondary-900, p-6, rounded-lg, shadow, border-secondary-700 |
| .card-product-dark | transparent bg, rounded-lg, dark shadow+border, hover lift+border glow |
| .btn-primary | bg-brand-400, text-brand-700, bold, hover brand-500 |
| .btn-secondary | transparent, border-brand-200, text-brand-100 |
| .btn-ghost | transparent, no border, text-brand-400, uppercase underline |

### Breakpoints in use
| Name | Condition |
|---|---|
| xs | min-width: 475px |
| md | min-width: 768px |
| lg-touch | min-width: 1024px AND max-height: 850px |
| lg-desktop | min-width: 1024px AND min-height: 851px |

Mobile = everything below 1024px. Desktop = lg-touch / lg-desktop.

### Checkout layout wrapper (fixed — do not change)
The checkout layout sets:
- Body: `bg-brand-800 text-brand-100 font-sans`
- Header: `bg-brand-900` — logo only, no nav
- Main: `flex-1 overflow-y-auto px-4 py-8`
- Content: `mx-auto max-w-4xl` (896px max)

All return page content renders inside this wrapper.

---

## 1. Page Architecture

### 1A. Visual States

Seven distinct visual states, each is a full layout swap:

| State | Trigger | Layout shape |
|---|---|---|
| **Success** | `pi.status === 'succeeded'` + order found | Full-width banner → 2-col grid (desktop) |
| **Success-pending** | `pi.status === 'succeeded'` + order not yet in Sanity | Full-width banner → order loading skeleton |
| **Declined** | `pi.status === 'requires_payment_method'` | Single centered card |
| **Canceled** | `pi.status === 'canceled'` | Single centered card |
| **Processing** | `pi.status === 'processing'` | Single centered card |
| **Verification failed** | `error === 'verification_failed'` OR Stripe catch | Single centered card |
| **Unexpected** | Any other PI status (safety net) | Single centered card |

### 1B. Success State — Layout

```
Mobile (<1024px): single column, stacked, full-width cards
  [Success Banner]
  [Order Details Card]
  [What Happens Next Card]
  [Create Account Card] (guest only)
  [CTAs row]
  [Need Help Card]

Desktop (lg-touch / lg-desktop): full-width banner then 2-column grid
  [Success Banner — full width, col-span-full]
  grid grid-cols-[3fr_2fr] gap-6
  | Col 1 (Order Details)  | Col 2 (Sidebar)        |
  | Order Details Card     | What Happens Next      |
  |                        | Create Account (guest) |
  |                        | CTAs row               |
  |                        | Need Help              |
```

**Grid classes:**
```
<!-- Success banner: no grid, rendered above -->
<div class="grid grid-cols-1 gap-6 lg-touch:grid-cols-[3fr_2fr] lg-desktop:grid-cols-[3fr_2fr]">
  <div> <!-- Col 1: Order Details --> </div>
  <div class="flex flex-col gap-4"> <!-- Col 2: Sidebar --> </div>
</div>
```

### 1C. Non-Success States — Layout

All error/processing/canceled/unexpected states use a single centered column:
```
max-w-xl mx-auto  (within the max-w-4xl outer)
flex flex-col gap-4
```

This gives a focused, ~40rem centered card — standard pattern for error messages. Does not spread into an empty 2-column grid.

---

## 2. Checkout Header

Header is rendered by the checkout layout. No changes needed.
Renders: `bg-brand-900` bar with centered orbit logo (white SVG).
Height: `h-[var(--mobile-header-h)]` on mobile, `lg:h-[var(--desktop-header-h)]` on desktop.

---

## 3. Success Banner

Renders as the first full-width element above the 2-col grid.

```
className="card-base"
```

**Internal layout:**
```
flex flex-col gap-3
```

**Row 1 — Icon + Heading:**
```
flex items-center gap-3
```
- Icon: `<CheckCircleIcon size={28} className="text-success-500 flex-shrink-0" />`
- Heading: `<h1 className="type-section-hed">Payment confirmed</h1>`

The success-500 icon (#4ADE80) on the dark secondary-900 surface is the only green element on the page. The heading uses the brand headline cream — not success green — because cream is more premium and less jarring on dark.

**Row 2 — Amount:**
```
<p className="type-section-sub tabular-nums">714,59 zł</p>
```
type-section-sub (h2 clamp / 500 / secondary-300) — prominent but subordinate to the heading.

**Row 3 — Payment method (conditional):**
```
<p className="type-section-caption">via BLIK</p>
```
Only rendered when `paymentMethodHint` is non-null.

**Row 4 — Secured by Stripe:**
```
<div className="flex items-center gap-1.5">
  <LockClosedIcon size={12} className="text-text-caption flex-shrink-0" />
  <span className="type-section-caption">Secured by Stripe</span>
</div>
```
Smallest element, bottom-anchored. text-caption (secondary-500) — intentionally muted.

---

## 4. Order Details Card (Col 1)

```
className="card-base"
```

### 4A. Card header
```
<h2 className="type-section-sub border-b border-border-primary pb-4 mb-4">
  Order Details
</h2>
```

### 4B. Order meta block
```
<div className="space-y-1 mb-4">
```

**Order number row:**
```
<div className="flex items-center gap-2">
  <span className="type-overline">Order</span>
  <span className="type-caption font-mono text-brand-400">{order.orderNumber}</span>
</div>
```
`type-overline` for label (gold, uppercase) + `font-mono text-brand-400` for the actual number value. The monospace treatment makes the order number scannable and visually distinct.

**Date row:**
```
<p className="type-section-caption">
  Date: {formattedDate}
</p>
```

**Email confirmation row (conditional — only when `order.customerEmail` is non-null):**
```
<p className="type-section-caption">
  Confirmation sent to: <span className="text-brand-400">{order.customerEmail}</span>
</p>
```

### 4C. Items section
```
<div className="mt-4">
  <h3 className="type-overline border-b border-border-secondary pb-2 mb-3">Items</h3>
  <ul className="space-y-3">
```

**Each item row:**
```
<li className="flex items-start justify-between gap-4">
  <div className="flex-1 min-w-0">
    <p className="type-card-title line-clamp-2">{item.name}</p>
    <p className="type-section-caption">
      × {item.quantity}
      <span className="ml-1">({unitPLN} each)</span>
    </p>
  </div>
  <span className="type-price flex-shrink-0">{linePLN}</span>
</li>
```

- Product name: `.type-card-title line-clamp-2` — capped at 2 lines, prevents overflow on long names
- Qty × unit price: `.type-section-caption` — muted secondary detail
- Line total: `.type-price flex-shrink-0` — prominent, right-anchored, never wraps

No column headers (unlike basket) — this is a receipt, not an interactive table. The simpler receipt layout is more appropriate here.

### 4D. Pricing summary
```
<div className="space-y-1.5 border-t border-border-secondary pt-4 mt-4">
```

**Each summary line:**
```
<div className="flex justify-between items-baseline">
  <span className="type-section-caption">{label}</span>
  <span className="type-price">{value}</span>
</div>
```

Lines (in order):
1. `Subtotal` / subtotal value
2. `Shipping (Carrier — N days)` / shipping value — carrier + days in same `.type-section-caption` span
3. `Discount` / discount value (conditional — only when `order.pricing.discount > 0`) — value in `text-success-500` with minus prefix
4. `Tax` (conditional — only when `order.pricing.tax > 0`) / tax value

**Total line:**
```
<div className="flex justify-between items-baseline border-t border-border-primary pt-3 mt-2">
  <span className="type-section-sub">Total</span>
  <span className="type-section-sub tabular-nums text-brand-400">{totalPLN}</span>
</div>
```
Same pattern as basket summary: total earns brand-400 cream color, not the default subtitle grey.

### 4E. Shipping address block

Conditional render: **only rendered when address data is present** (at minimum `order.shippingAddress.city` must be non-empty). If address data is null or has empty fields, do not render this block. This prevents the empty grey box visible in the current screenshots.

```
<div className="mt-4 rounded-md bg-surface-subtle border border-border-secondary p-4">
  <h3 className="type-overline mb-2">Shipping address</h3>
  <address className="not-italic space-y-0.5">
    <p className="type-body">{order.shippingAddress.name}</p>
    <p className="type-body">{order.shippingAddress.line1}</p>
    <p className="type-body">{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
    {order.shippingAddress.state && (
      <p className="type-section-caption">{order.shippingAddress.state}</p>
    )}
    <p className="type-section-caption">{order.shippingAddress.country}</p>
  </address>
</div>
```

`bg-surface-subtle` = brand-800 (#0D0F0F) — slightly darker than the card's secondary-900 (#1A1A19), creating a subtle nested panel effect. This is the same surface hierarchy used throughout the design system.

---

## 5. What Happens Next Card (Col 2, top)

```
className="card-base"
```

### 5A. Heading
```
<h3 className="type-overline mb-4">What happens next</h3>
```
Gold uppercase, no border needed here — the card border is sufficient.

### 5B. Step timeline

Vertical list of 4 steps. First step is active (order confirmed), rest are inactive.

```
<ol className="space-y-3">
```

**Active step (Order confirmed):**
```
<li className="flex items-center gap-3">
  <span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-success-500" />
  <span className="type-body">Order confirmed</span>
</li>
```

**Inactive steps (Processing, Shipped, Delivered):**
```
<li className="flex items-center gap-3">
  <span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-secondary-700" />
  <span className="type-section-caption">Processing</span>
</li>
```

The dot sizes (`h-2.5 w-2.5` = 10×10px) and gap-3 create a clean vertical rhythm. No connector lines — those add complexity without adding clarity for 4 steps.

### 5C. Estimated delivery (conditional)
```
{estimatedDelivery && (
  <p className="type-body text-accent-500 mt-3">
    Estimated delivery: {estimatedDeliveryFormatted}
  </p>
)}
```
`text-accent-500` (gold #D4AF37) — warm, positive accent for the date. Adds excitement without screaming.

### 5D. Tracking note
```
<p className="type-section-caption mt-1">
  Tracking number will appear here once shipped.
</p>
```

---

## 6. Create Account Card (Col 2, guest only)

Only rendered when `order.isGuest === true`.

```
className="card-product-dark"
```
`card-product-dark` (hover border-glow) elevates this above the other cards — it's an upsell, deserves slightly more prominence.

**Internal layout:**
```
flex flex-col gap-3
```

- Heading: `<p className="type-card-title">Create an account to track your order</p>`
- Body: `<p className="type-section-caption">Save your details for faster checkout next time.</p>`
- Button: `<Link className="btn-primary block text-center py-3">Create account</Link>`

`btn-primary` (brand-400 bg, brand-700 text) — this is the only primary-style button before the Continue Shopping CTA, appropriate for the upsell.

---

## 7. Navigation CTAs (Col 2)

```
<div className="flex flex-col gap-3">
```

**Continue shopping (always present):**
```
<Link href="/" className="btn-primary block text-center py-3">
  Continue shopping
</Link>
```

**View my orders (logged-in users only — `!order.isGuest`):**
```
<Link href="/account/orders" className="btn-secondary block text-center py-3">
  View my orders
</Link>
```

Ordering: if both appear, "Continue shopping" (primary) always first, "View my orders" (secondary) below.

On mobile these are full-width stacked. On desktop (in the sidebar column) they remain full-width within the column.

---

## 8. Need Help Card (Col 2, bottom)

Lower visual hierarchy — information density reduced to minimum.

```
className="card-base"
```

- Heading: `<h3 className="type-overline mb-2">Need help?</h3>`
- Body: `<p className="type-section-caption mb-3">If you have any questions about your order, contact our support team.</p>`
- CTA: `<a className="btn-secondary inline-block px-4 py-2 text-sm">Email support</a>`

`btn-secondary` (transparent, border-brand-200, text-brand-100) — secondary treatment, no urgency.

---

## 9. Success-Pending State (Webhook Lag)

When PI status is `succeeded` but the Sanity order has not yet been created (webhook lag).

The Suspense wrapper renders `<OrderDetails />` async. Two sub-states:

### 9A. Suspense loading fallback (while async component resolves)

Replace current `<p className="text-gray-500">Fetching order details…</p>` with a dark-theme skeleton.

```
className="card-base animate-pulse"
```

Internal skeleton rows (no real data):
```
<div className="space-y-3">
  <div className="h-4 w-36 rounded-sm bg-secondary-800/60" />        <!-- order meta label -->
  <div className="h-3 w-28 rounded-sm bg-secondary-800/60" />        <!-- date -->
  <div className="h-px w-full bg-secondary-700 my-4" />               <!-- separator -->
  <div className="h-4 w-full rounded-sm bg-secondary-800/60" />       <!-- item row -->
  <div className="h-4 w-4/5 rounded-sm bg-secondary-800/60" />        <!-- item row 2 -->
  <div className="h-px w-full bg-secondary-700 my-4" />
  <div className="h-4 w-full rounded-sm bg-secondary-800/60" />       <!-- subtotal -->
  <div className="h-4 w-full rounded-sm bg-secondary-800/60" />       <!-- shipping -->
  <div className="h-px w-full bg-secondary-700 my-2" />
  <div className="h-5 w-full rounded-sm bg-secondary-800/60" />       <!-- total -->
</div>
```

Use `bg-secondary-800/60` not `bg-surface-elevated` (same fix as basket skeleton spec — higher contrast against secondary-900 card bg).

### 9B. Order not found after delay (webhook failed / too slow)

When `order === null` after the server-side delay:

```
className="card-base text-center"
```

```
<div className="flex flex-col items-center gap-4 py-4">
  <span className="type-section-caption text-text-caption">
    <HourglassIcon size={32} className="text-accent-500 mb-2 mx-auto" />
  </span>
  <p className="type-section-sub">Generating your order receipt…</p>
  <p className="type-body text-text-caption">Amount charged: {fallbackPLN}</p>
  <!-- RefreshButton styled as .btn-secondary -->
</div>
```

**RefreshButton:**
```
className="btn-secondary px-6 py-2.5"
```
Replace current unstyled/generic styling.

---

## 10. Non-Success States

All share the same structural pattern. Single centered column (`max-w-xl mx-auto`).

### Shared pattern for all error/warning cards:

```
className="card-base"
```

```
<div className="flex flex-col gap-4">
  <!-- Row 1: Icon + Heading -->
  <div className="flex items-start gap-3">
    <[Icon] size={24} className="[icon-color] flex-shrink-0 mt-0.5" />
    <h1 className="type-section-sub">[Heading]</h1>
  </div>

  <!-- Row 2: Body copy -->
  <p className="type-body text-text-caption">[Body text]</p>

  <!-- Row 3: Reference code (conditional) -->
  <code className="block font-mono type-caption text-brand-400 bg-surface-elevated rounded-md px-3 py-2">
    {payment_intent}
  </code>

  <!-- Row 4: CTAs -->
  <div className="flex flex-wrap gap-3">
    <a className="btn-primary px-6 py-2.5">[Primary CTA]</a>
    <a className="btn-secondary px-6 py-2.5">[Secondary CTA]</a>
  </div>
</div>
```

Headings stay in `type-section-sub` (brand-400 cream) — never in error-500 red. The icon carries the red signal; the heading stays readable and calm. This is the premium brand pattern (not utility/government sites that use red headings).

### 10A. Verification Failed / Stripe API Down

- **Icon:** `<AlertCircleIcon size={24} className="text-error-500" />`
- **Heading:** "We couldn't verify your payment status"
- **Body:** "Your card may have been charged. Contact support with this reference:"
- **Reference code:** `{payment_intent}` — displayed
- **CTAs:** [Return to basket] → `btn-primary`, [Contact support] → `btn-secondary`

### 10B. Payment Declined

- **Icon:** `<XCircleIcon size={24} className="text-error-500" />`
- **Heading:** "Payment was declined"
- **Body:** Stripe decline message (`last_payment_error.message`) — or "Payment was declined." if unavailable
- **No reference code**
- **CTAs:** [Try again → /checkout/payment] → `btn-primary`, [Return to basket] → `btn-secondary`

### 10C. Payment Canceled

- **Icon:** `<XCircleIcon size={24} className="text-secondary-400" />` (neutral grey, not red — cancelation is not an error)
- **Heading:** "Payment was canceled"
- **Body:** "You can try again or return to your basket."
- **No reference code**
- **CTAs:** [Try again → /checkout/payment] → `btn-primary`, [Return to basket] → `btn-secondary`

### 10D. Payment Processing

- **Icon:** `<ClockIcon size={24} className="text-accent-500" />` (gold — warming, patient, not error)
- **Heading:** "Payment is processing"
- **Body line 1:** "Your payment is being processed by your bank. This usually takes a few minutes."
- **Body line 2:** "We'll email a confirmation once settled."
- **Reference code:** `{payment_intent}` — displayed (for support reference)
- **CTAs:** [Refresh page] → `btn-secondary` only (no primary CTA — user must wait)

### 10E. Unexpected Status (safety net)

- **Icon:** `<AlertCircleIcon size={24} className="text-error-500" />`
- **Heading:** "Unexpected payment status"
- **Body:** "Contact support with this reference:"
- **Reference code:** `{payment_intent}`
- **CTA:** [Return to basket] → `btn-primary` (single CTA)

---

## 11. Typography Corrections (delta from current code)

| Location | Current | Correct | Reason |
|---|---|---|---|
| All page backgrounds | `bg-green-50`, `bg-red-50`, `bg-blue-50`, `bg-yellow-50` | `card-base` (.bg-secondary-900) with icon-only accent | Design system is dark — light bg flood is system mismatch |
| All body text | `text-gray-700`, `text-gray-600` | `.type-body` or `.type-section-caption` | Must use design system tokens |
| "Payment confirmed" h1 | `text-2xl font-bold text-green-800` | `.type-section-hed` (brand-400) | Design system class; green text not needed when icon carries the success signal |
| Amount | `text-lg text-green-700` | `.type-section-sub tabular-nums` (secondary-300) | Design system token |
| Order Details h2 | `text-xl font-semibold` | `.type-section-sub` | Design system class |
| "Items" h3 | `font-semibold` | `.type-overline` | Gold overline, consistent with basket section headers |
| Product name | `text-sm` | `.type-card-title line-clamp-2` | 600-weight, proper size, overflow guard |
| Qty/unit detail | `text-gray-500` | `.type-section-caption` | Design system token |
| Line total | `font-medium` | `.type-price` | Tabular-nums, correct weight/color |
| Subtotal/Shipping labels | `text-gray-600` | `.type-section-caption` | Design system token |
| Pricing values | unstyled | `.type-price` | Tabular-nums |
| Total label | `text-base font-bold` | `.type-section-sub` | Design system class |
| Total value | `text-base font-bold` | `.type-section-sub tabular-nums text-brand-400` | Brand cream for grand total (same as basket spec) |
| Address section bg | `bg-gray-50` | `bg-surface-subtle` (brand-800) | Dark nested panel, not light flood |
| "What happens next" h3 | `font-semibold text-blue-800` | `.type-overline` | Gold overline, dark card not blue card |
| Blue dots (inactive) | `bg-gray-300` | `bg-secondary-700` | Design system token |
| Green dot (active) | `bg-green-500` | `bg-success-500` | Design system token |
| Estimated delivery | `text-blue-700` | `.type-body text-accent-500` | Gold accent, warm/premium |
| "Create account" bg | `bg-blue-50` | `card-product-dark` | Dark elevated card |
| Create account button | `rounded bg-gray-900 text-white` | `.btn-primary` | Design system class |
| "Continue shopping" | `rounded bg-gray-900 text-white` | `.btn-primary` | Design system class |
| "View my orders" | `rounded border border-gray-300` | `.btn-secondary` | Design system class |
| Error card bg | `bg-red-50 border-red-200` | `card-base` | Dark system — icon carries signal |
| Error headings | `text-xl font-bold` (dark text) | `.type-section-sub` (brand-400 cream) | Calm heading; icon carries error color |
| Reference code blocks | `bg-gray-100 font-mono` | `bg-surface-elevated font-mono type-caption text-brand-400` | Dark system tokens |
| All gray buttons | `rounded bg-gray-900` / `rounded border-gray-300` | `.btn-primary` / `.btn-secondary` | Design system classes |
| Suspense fallback | `text-gray-500` | Dark skeleton with `bg-secondary-800/60` | Design system skeleton pattern |
| RefreshButton | unstyled/bare | `.btn-secondary px-6 py-2.5` | Must be styled |
| "Need help?" heading | `font-semibold text-gray-800` | `.type-overline` | Gold overline |
| "Email support" link | `rounded border-gray-300 text-xs` | `.btn-secondary` | Design system class |

---

## 12. Spacing & Sizing Constants

| Element | Value |
|---|---|
| Card gap (stacked, all states) | gap-6 |
| Success banner internal gap | gap-3 |
| Order meta block margin-bottom | mb-4 |
| Items section margin-top | mt-4 |
| Item row gap (name / price) | gap-4 |
| Item list space-y | space-y-3 |
| Pricing summary space-y | space-y-1.5 |
| Total row border-t padding | pt-3 mt-2 |
| Address nested panel padding | p-4 |
| Timeline step gap | gap-3 |
| Timeline step dot size | h-2.5 w-2.5 (10×10px) |
| Estimated delivery margin-top | mt-3 |
| CTA gap (flex row) | gap-3 |
| CTA button padding | py-2.5 px-6 (inline) / py-3 block w-full |
| Card internal padding | p-6 (from .card-base) |
| Error card internal flex gap | gap-4 |
| Non-success max content width | max-w-xl mx-auto |
| 2-col grid col definition | grid-cols-[3fr_2fr] |
| Sidebar flex gap | gap-4 |

---

## 13. Accessibility Checklist

| Item | Spec |
|---|---|
| Success region | `<section aria-label="Order confirmation">` wrapper |
| Error/warning regions | `role="alert"` (already in source) ✓ — confirm all error states use it |
| Order details heading | `<h2>` not `<div>` (already correct in source) |
| Items list | `<ul>` / `<li>` (already in source) ✓ |
| Address element | `<address className="not-italic">` (semantic HTML) |
| Shipping steps | `<ol>` (ordered — represents sequence) |
| Success icon | `aria-hidden="true"` (decorative — heading carries meaning) |
| RefreshButton | `type="button"` attribute present |
| All buttons/links | min touch target 44×44px equivalent — py-2.5 px-6 achieves this |
| Focus rings | All `.btn-primary`, `.btn-secondary` have `focus-visible` outlines from plugin ✓ |
| Reference code | `<code>` element (semantic) |
| Payment intent reference | Not announced as personal data — PI IDs are non-sensitive (public) |

---

## 14. Full Component × Class Mapping

### page.tsx (SuccessPage — succeeded branch)

**Outer wrapper (add):**
```tsx
<section aria-label="Order confirmation" className="flex flex-col gap-6">
```

**Success banner:**
```tsx
<div className="card-base">
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <CheckCircleIcon size={28} className="text-success-500 flex-shrink-0" aria-hidden="true" />
      <h1 className="type-section-hed">Payment confirmed</h1>
    </div>
    <p className="type-section-sub tabular-nums">{amountPLN}</p>
    {paymentMethodHint && <p className="type-section-caption">via {paymentMethodHint}</p>}
    <div className="flex items-center gap-1.5">
      <LockClosedIcon size={12} className="text-text-caption flex-shrink-0" aria-hidden="true" />
      <span className="type-section-caption">Secured by Stripe</span>
    </div>
  </div>
</div>
```

**2-column grid wrapper:**
```tsx
<div className="grid grid-cols-1 gap-6 lg-touch:grid-cols-[3fr_2fr] lg-desktop:grid-cols-[3fr_2fr]">
  <div>
    <Suspense fallback={<OrderDetailsSkeleton />}>
      <OrderDetails paymentIntentId={payment_intent} fallbackTotal={pi.amount} />
    </Suspense>
  </div>
  <div className="flex flex-col gap-4">
    {/* Sidebar content */}
  </div>
</div>
```

**Suspense fallback component (OrderDetailsSkeleton):**
```tsx
<div className="card-base animate-pulse">
  <div className="space-y-3">
    <div className="h-4 w-36 rounded-sm bg-secondary-800/60" />
    <div className="h-3 w-28 rounded-sm bg-secondary-800/60" />
    <div className="h-px w-full bg-secondary-700 my-4" />
    <div className="h-4 w-full rounded-sm bg-secondary-800/60" />
    <div className="h-4 w-4/5 rounded-sm bg-secondary-800/60" />
    <div className="h-px w-full bg-secondary-700 my-4" />
    <div className="h-4 w-full rounded-sm bg-secondary-800/60" />
    <div className="h-4 w-full rounded-sm bg-secondary-800/60" />
    <div className="h-px w-full bg-secondary-700 my-2" />
    <div className="h-5 w-full rounded-sm bg-secondary-800/60" />
  </div>
</div>
```

**All non-success state wrappers:**
```tsx
<div className="max-w-xl mx-auto">
  <div className="card-base">
    <div className="flex flex-col gap-4">
      ...
    </div>
  </div>
</div>
```

### OrderDetails.tsx

**Card wrapper:**
```tsx
<div className="card-base">
```

**Card heading:**
```tsx
<h2 className="type-section-sub border-b border-border-primary pb-4 mb-4">Order Details</h2>
```

**Order number:**
```tsx
<div className="flex items-center gap-2">
  <span className="type-overline">Order</span>
  <span className="type-caption font-mono text-brand-400">{order.orderNumber}</span>
</div>
```

**Date:**
```tsx
<p className="type-section-caption">Date: {formattedDate}</p>
```

**Email:**
```tsx
<p className="type-section-caption">
  Confirmation sent to: <span className="text-brand-400">{order.customerEmail}</span>
</p>
```

**Items section header:**
```tsx
<h3 className="type-overline border-b border-border-secondary pb-2 mb-3">Items</h3>
```

**Item row:**
```tsx
<li className="flex items-start justify-between gap-4">
  <div className="flex-1 min-w-0">
    <p className="type-card-title line-clamp-2">{item.name}</p>
    <p className="type-section-caption">× {item.quantity} <span className="ml-1">({unitPLN} each)</span></p>
  </div>
  <span className="type-price flex-shrink-0">{linePLN}</span>
</li>
```

**Pricing block:**
```tsx
<div className="space-y-1.5 border-t border-border-secondary pt-4 mt-4">
  <div className="flex justify-between items-baseline">
    <span className="type-section-caption">Subtotal</span>
    <span className="type-price">{formatPLN(order.pricing.subtotal)}</span>
  </div>
  <div className="flex justify-between items-baseline">
    <span className="type-section-caption">
      Shipping
      {order.shippingMethod && (
        <span className="ml-1">({order.shippingMethod.carrier} — {order.shippingMethod.estimatedDays} days)</span>
      )}
    </span>
    <span className="type-price">{formatPLN(order.pricing.shipping)}</span>
  </div>
  {/* discount and tax lines follow same pattern */}
  <div className="flex justify-between items-baseline border-t border-border-primary pt-3 mt-2">
    <span className="type-section-sub">Total</span>
    <span className="type-section-sub tabular-nums text-brand-400">{formatPLN(order.pricing.total)}</span>
  </div>
</div>
```

**Shipping address block (conditional):**
```tsx
{order.shippingAddress?.city && (
  <div className="mt-4 rounded-md bg-surface-subtle border border-border-secondary p-4">
    <h3 className="type-overline mb-2">Shipping address</h3>
    <address className="not-italic space-y-0.5">
      <p className="type-body">{order.shippingAddress.name}</p>
      <p className="type-body">{order.shippingAddress.line1}</p>
      <p className="type-body">{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
      {order.shippingAddress.state && <p className="type-section-caption">{order.shippingAddress.state}</p>}
      <p className="type-section-caption">{order.shippingAddress.country}</p>
    </address>
  </div>
)}
```

**What happens next section:**
```tsx
<div className="card-base">
  <h3 className="type-overline mb-4">What happens next</h3>
  <ol className="space-y-3">
    <li className="flex items-center gap-3">
      <span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-success-500" />
      <span className="type-body">Order confirmed</span>
    </li>
    <li className="flex items-center gap-3">
      <span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-secondary-700" />
      <span className="type-section-caption">Processing</span>
    </li>
    <li className="flex items-center gap-3">
      <span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-secondary-700" />
      <span className="type-section-caption">Shipped</span>
    </li>
    <li className="flex items-center gap-3">
      <span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-secondary-700" />
      <span className="type-section-caption">Delivered</span>
    </li>
  </ol>
  {estimatedDelivery && (
    <p className="type-body text-accent-500 mt-3">{estimatedDeliveryFormatted}</p>
  )}
  <p className="type-section-caption mt-1">Tracking number will appear here once shipped.</p>
</div>
```

**Create account card (guest only):**
```tsx
{order.isGuest && (
  <div className="card-product-dark p-6">
    <p className="type-card-title">Create an account to track your order</p>
    <p className="type-section-caption mt-1 mb-3">Save your details for faster checkout next time.</p>
    <Link href={...} className="btn-primary block text-center py-3">
      Create account
    </Link>
  </div>
)}
```

**CTAs:**
```tsx
<div className="flex flex-col gap-3">
  <Link href="/" className="btn-primary block text-center py-3">Continue shopping</Link>
  {!order.isGuest && (
    <Link href="/account/orders" className="btn-secondary block text-center py-3">View my orders</Link>
  )}
</div>
```

**Need help card:**
```tsx
<div className="card-base">
  <h3 className="type-overline mb-2">Need help?</h3>
  <p className="type-section-caption mb-3">If you have any questions about your order, contact our support team.</p>
  <a href="mailto:..." className="btn-secondary inline-block px-4 py-2 text-sm">Email support</a>
</div>
```

**Order not found (fallback):**
```tsx
<div className="card-base text-center">
  <div className="flex flex-col items-center gap-4 py-4">
    <HourglassIcon size={32} className="text-accent-500" aria-hidden="true" />
    <p className="type-section-sub">Generating your order receipt…</p>
    <p className="type-body text-text-caption">Amount charged: {fallbackPLN}</p>
    <RefreshButton />
  </div>
</div>
```

### RefreshButton.tsx

```tsx
className="btn-secondary px-6 py-2.5"
```

---

## 15. What Does NOT Change

- Checkout layout (header, body background, max-w-4xl wrapper) — no change
- Server-side logic: PI verification, session reading, order fetch — no change
- Suspense/streaming architecture — no change
- Route Handler (`/api/checkout/return`) — no change
- Privacy guard (completedPaymentIntentId check) — no change
- Order data fields and formatting logic — no change
- All `data-testid` attributes — must be preserved exactly
- Redirect behaviors — no change
- All server-side delay logic — no change

---

## 16. Gap & Red-Flag Audit

| Item | Status |
|---|---|
| Empty shipping address box (visible in screenshots) | ✅ Fixed — conditional render guard on `order.shippingAddress?.city` in §4E |
| Light-theme color flood (green-50, red-50, blue-50, gray-50) | ✅ Fixed — all replaced with `card-base` throughout §11 |
| Generic Tailwind classes (gray-900, gray-600, text-sm) | ✅ Fixed — full mapping in §11 and §14 |
| Unstyled RefreshButton | ✅ Fixed — `.btn-secondary px-6 py-2.5` in §9B and §14 |
| Invisible Suspense skeleton (current: single gray text) | ✅ Fixed — dark skeleton with `bg-secondary-800/60` in §9A |
| Red headings on error states | ✅ Fixed — icon carries error-500, heading stays brand-400 cream |
| "Need help" Email support as bare anchor | ✅ Fixed — `.btn-secondary` in §8 |
| Product name overflow on long titles | ✅ Fixed — `line-clamp-2` in §4C |
| Order number not visually distinct | ✅ Fixed — `font-mono text-brand-400` in §4B |
| 7 visual states missing from design | ✅ All spec'd in §10 |
| Desktop layout undefined (was single column at max-w-4xl with lots of whitespace) | ✅ Fixed — 2-col grid in §1B |
| Error states too wide (spreading into empty space on desktop) | ✅ Fixed — `max-w-xl mx-auto` wrapper in §10 |
| Total value not differentiated from other price values | ✅ Fixed — `text-brand-400` override on total in §4D |
| Discount row conditional missing | ✅ Spec'd in §4D (conditional on `discount > 0`) |
| Tax row conditional missing | ✅ Spec'd in §4D (conditional on `tax > 0`) |
| Blue "What happens next" card alien to dark design system | ✅ Fixed — `card-base` + `type-overline` gold heading in §5 |
| Estimated delivery text in wrong color (blue) | ✅ Fixed — `text-accent-500` in §5C |
| "Create account" card not elevated enough for an upsell | ✅ Fixed — `card-product-dark` in §6 |
| "Continue shopping" not primary button | ✅ Fixed — `btn-primary` in §7 |
| Semantics: address block not using `<address>` | ✅ Fixed — `<address className="not-italic">` in §4E |
| Semantics: steps not using `<ol>` | ✅ Fixed — `<ol>` in §5B |
| Accessibility: success region not labelled | ✅ Fixed — `aria-label="Order confirmation"` in §13 |
| Accessibility: icon not hidden from screen readers | ✅ Fixed — `aria-hidden="true"` on decorative icons |
"""
