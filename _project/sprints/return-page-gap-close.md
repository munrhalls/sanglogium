# Sprint: Return Page — Happy Path Gap Close (sang-logium-4nd)

**Beads Issue:** sang-logium-4nd | **Status:** in_progress  
**Scope:** Close 6 UI/service gaps on `/checkout/success`. 5 tasks, sequential.  
**Intelligence source:** Step 1 gap-close verification (Jun 10 2026) — corrections applied below.

---

## PHASE 0: Pre-Work Constraints

**From gap-close verification (applied as hard rules):**

- `app/checkout/layout.tsx` is the layout for `/checkout/success` — **NOT** `app/(store)/layout.tsx`
- `RESEND_API_KEY` is already in `.env` — email will actually send in local dev (no `[DEV EMAIL]` console fallback will fire unless key is removed)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-6P056J7F80` is already in `.env` (duplicated on lines 16+21 — clean the dupe during Task 4)
- `isGuest` is conditional in `createOrderFromPaymentIntent.ts` — NOT hardcoded true. Authenticated users already see "View my orders" in `OrderDetails.tsx`. Task 5 closes the guest gap only.
- Email insertion point: **after line 278** in `createOrderFromPaymentIntent.ts` (the `order_created` log event), not line 271
- `logDevEmail(type, to, url)` takes a URL as the third param — order confirmation has no URL. Adapt: pass `Order #${orderNumber}` as the third arg

---

## PHASE 1: UX Flows

### Current State (Post-Payment, Pre-Gap-Close)

1. User completes Stripe payment → lands on `/checkout/success`
2. **[GAP #3]** Order details show spinner on first load → user must manually refresh (CDN read-your-writes race)
3. Order details render: order number, items, total, shipping address ✅
4. **[GAP #5]** UI shows "Confirmation sent to: {email}" — **no email is actually sent**
5. Shipping method shows carrier + estimatedDays count — no computed delivery date shown **[GAP #4]**
6. "What happens next" timeline shows generic "Delivered" step with no date **[GAP #4]**
7. No GA4 purchase event fires **[GAP #7]**
8. Only one CTA: "Continue shopping" → `/` (generic) **[GAP #8]**
9. Authenticated users see "View my orders" in order card — guests see nothing

### Target State (After Sprint)

1. User completes payment → success page shows order details immediately, first load, no spinner
2. Order confirmation email actually fires (via Resend) with order number, items, total, address
3. Estimated delivery date is computed and shown (e.g., "Estimated delivery: Jun 12–13")
4. GA4 `purchase` event fires once on success page load
5. ALL users (guests + authenticated) see "View my orders" as a secondary CTA in page sidebar

### End-State Overview

After completing payment, the user sees full order details immediately without refreshing, receives a real confirmation email, sees an estimated delivery date rather than a vague "Delivered" step, and has a clear "View my orders" CTA regardless of auth state. Conversion is tracked via GA4 on every successful payment. The success page is honest — no false claims, no empty UI promises.

---

## PHASE 2: Architecture Contract

### Explicit Rules — No Exceptions

```
Task 1 (CDN fix):
  getOrderByPaymentIntentId.ts → swap client (useCdn:true) → backendClient (useCdn:false)
  One import change. One call site change. Zero logic change.
  Covers both: OrderDetails.tsx:19 AND page.tsx:61 (same function, fixed at source)

Task 2 (Email):
  createOrderFromPaymentIntent.ts → call sendOrderConfirmationEmail() AFTER line 278
  Wrapped in try/catch → email failure NEVER blocks order creation or user redirect
  email.ts → new export sendOrderConfirmationEmail(data: {...})
  logDevEmail adaptation: pass Order #${orderNumber} as third param (no URL in order emails)
  Guard: if (!resend) { logDevEmail(...); return; } — same as existing auth emails

Task 3 (Delivery date):
  OrderDetails.tsx → compute orderedAt + estimatedDays → show "Estimated delivery: [range]"
  page.tsx → replace hardcoded "Delivered" step with computed date when available
  No new data fetching — estimatedDays and orderedAt already in order object

Task 4 (GA4):
  app/checkout/layout.tsx → add <Script> GA4 tags, conditional on NEXT_PUBLIC_GA_MEASUREMENT_ID
  app/checkout/success/SuccessAnalytics.client.tsx (new) → Client Component, fires gtag purchase once
  app/checkout/success/page.tsx → render <SuccessAnalytics> inside succeeded branch only
  Clean: remove duplicate NEXT_PUBLIC_GA_MEASUREMENT_ID from .env
  Guard: entire component is no-op if NEXT_PUBLIC_GA_MEASUREMENT_ID is not set

Task 5 (CTA):
  page.tsx succeeded branch → add "View my orders" btn-secondary for ALL users (beside "Continue shopping")
  Guests will hit login at /account/orders — correct behavior
  Existing "View my orders" in OrderDetails.tsx (auth only) remains — Task 5 adds a second one for guests
```

### Simplicity Contract

- Task 1: one import swap, one call site — no abstraction
- Task 2: one new function in existing file, one call in existing function — no new files except the function itself
- Task 3: inline computation in JSX — no helper function unless more than 3 lines
- Task 4: one new Client Component, script tags in existing layout — no analytics wrapper abstraction
- Task 5: one `<Link>` added to existing JSX block — no component extraction

---

## PHASE 3: Scope Contracts

---

### Scope Contract 1: CDN Race Fix — Order details appear on first load

**Files touched:** `sanity-cms/lib/orders/getOrderByPaymentIntentId.ts`

#### UX Slice
- User completes payment → lands on success page → order details render immediately, no spinner
- Refresh is not required
- "Generating your order receipt…" spinner never appears for freshly created orders

#### Architecture Slice
- Replace `import { client }` with `import { backendClient }` at line 1
- Replace `return client.fetch<...>(` with `return backendClient.fetch<...>(` at line 46
- Import path: `"../backendClient"` (same directory level as `"../client"`)
- No logic change, no GROQ change, no interface change

#### Human Verification Checklist (<5 min)
- [ ] Complete a test Stripe payment (test card 4242...)
- [ ] Success page loads — order number visible on **first** page load, no spinner
- [ ] Browser DevTools Network: confirm the Sanity fetch returns the order document (non-null response)
- [ ] `getOrderByPaymentIntentId.ts` line 1 reads `backendClient`, not `client`

#### Tests
None — this is a one-line swap. Human verification is the test.

---

### Scope Contract 2: Order Confirmation Email — Email actually sends

**Files touched:** `lib/email.ts`, `lib/checkout/createOrderFromPaymentIntent.ts`

#### UX Slice
- User completes payment → receives order confirmation email with order number, items, total, shipping address
- "Confirmation sent to: {email}" in OrderDetails.tsx is now truthful (email was actually sent)
- If Resend API is down or key is missing: email fails silently, order creation proceeds, user is never affected

#### Architecture Slice

**`lib/email.ts` — add export:**
```typescript
export async function sendOrderConfirmationEmail(data: {
  to: string
  orderNumber: string
  items: Array<{ name: string; quantity: number; subtotal: number }>
  total: number
  shippingAddress: { name: string; line1: string; city: string; postalCode: string }
}): Promise<void>
```
- If `!resend`: call `logDevEmail("Order Confirmation", data.to, \`Order #${data.orderNumber}\`)` and return
- If `resend`: send HTML email with order summary

**`lib/checkout/createOrderFromPaymentIntent.ts` — call after line 278:**
```typescript
// after: await logCheckoutEvent({ ... event: 'order_created' ... })
try {
  await sendOrderConfirmationEmail({
    to: customerEmail,
    orderNumber,
    items,
    total,
    shippingAddress,
  })
} catch {
  // email failure is non-fatal — order already created
}
```
- Import `sendOrderConfirmationEmail` from `@/lib/email` at top of file

#### Human Verification Checklist (<5 min)
- [ ] Complete a test payment
- [ ] Check Resend dashboard (resend.com) → delivery log shows email sent to test address
- [ ] OR: temporarily remove/rename `RESEND_API_KEY` in `.env` → terminal shows `[DEV EMAIL] Order Confirmation` log
- [ ] Complete another payment with Resend key set → Sanity order document created AND email sent (both, not one-or-other)
- [ ] Code check: `lib/email.ts` exports `sendOrderConfirmationEmail`
- [ ] Code check: `createOrderFromPaymentIntent.ts` calls it inside `try/catch` after `order_created` event

#### Tests
None beyond human verification — idempotency guard in `createOrderFromPaymentIntent` already ensures email fires at most once per PI.

---

### Scope Contract 3: Estimated Delivery Date — User knows when to expect delivery

**Files touched:** `app/checkout/success/OrderDetails.tsx`, `app/checkout/success/page.tsx`

#### UX Slice
- Order card shows "Estimated delivery: [date range]" when `estimatedDays` is present (e.g., "Estimated delivery: Jun 12–13")
- "What happens next" timeline replaces generic "Delivered" with the computed date
- If `estimatedDays` is missing: existing display unchanged (graceful fallback)

#### Architecture Slice

**`OrderDetails.tsx`** — after the shipping row (around line 89):
- If `order.shippingMethod?.estimatedDays` and `order.dates.orderedAt` both exist:
  - Compute `deliveryFrom = orderedAt + estimatedDays days`
  - Compute `deliveryTo = orderedAt + (estimatedDays + 1) days`
  - Render: `Estimated delivery: {formatted range}`
- Format using `toLocaleDateString('pl-PL', { month: 'long', day: 'numeric' })`

**`page.tsx`** — "Delivered" list item (line 213):
- Pass order data into the succeeded branch sidebar (requires reading the order)
- OR: accept estimated delivery as a prop from the Suspense-wrapped `OrderDetails`
- **Simplest approach:** keep the timeline in `page.tsx` static for MVP — update the "Delivered" step label to "Delivery" with a note "estimated date in order details below". No prop threading needed. Reserve computed date in timeline for edge-cases scope.

#### Human Verification Checklist (<5 min)
- [ ] Complete a test payment with a shipping method that has `estimatedDays` set
- [ ] Order card shows "Estimated delivery: [date]" (not just "3 days")
- [ ] Carrier + day count still visible on shipping row
- [ ] Complete a test payment with no `estimatedDays` → no estimated delivery line shown, no error

#### Tests
None — purely presentational, data already flows.

---

### Scope Contract 4: GA4 Conversion Tracking — Purchase event fires on success

**Files touched:** `app/checkout/layout.tsx`, `app/checkout/success/page.tsx`  
**New file:** `app/checkout/success/SuccessAnalytics.client.tsx`  
**Env cleanup:** remove duplicate `NEXT_PUBLIC_GA_MEASUREMENT_ID` from `.env` (line 21)

#### UX Slice
- Invisible to user — GA4 `purchase` event fires once when success page loads with a succeeded PI
- No-op if `NEXT_PUBLIC_GA_MEASUREMENT_ID` is not set (CI, staging without var)
- Event does not double-fire on React StrictMode re-render (edge case scope, but useRef guard is trivial — add it)

#### Architecture Slice

**`app/checkout/layout.tsx` — add GA4 script tags:**
```tsx
import Script from 'next/script'
// inside <head> or directly in layout body after <body> open:
{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
    />
    <Script id="ga4-init" strategy="afterInteractive">
      {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');`}
    </Script>
  </>
)}
```

**`SuccessAnalytics.client.tsx` (new):**
```tsx
"use client"
import { useEffect, useRef } from 'react'
interface Props { transactionId: string; value: number; items: Array<{name:string;quantity:number;price:number}> }
export function SuccessAnalytics({ transactionId, value, items }: Props) {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    if (typeof window === 'undefined' || !window.gtag) return
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value / 100,
      currency: 'PLN',
      items: items.map(i => ({ item_name: i.name, quantity: i.quantity, price: i.price / 100 })),
    })
  }, [])
  return null
}
```

**`page.tsx` succeeded branch** — render `<SuccessAnalytics>` with PI data. Order items come from the order object but `OrderDetails` is inside `<Suspense>` so pass PI-level data (amount, id) for the minimum required event. Items can be passed if available without blocking.

**Simplest approach:** fire gtag with `transaction_id: pi.id`, `value: pi.amount`, `items: []` — items array refinement is edge-cases scope.

#### Human Verification Checklist (<5 min)
- [ ] Complete a test payment
- [ ] Browser DevTools → Network tab → filter "google-analytics" or "gtag" → see `purchase` event request
- [ ] Open DevTools Console → run `window.dataLayer` → find purchase event object
- [ ] Reload success page → confirm `purchase` event does NOT fire a second time (useRef guard working)
- [ ] `.env` line 21 duplicate removed — only one `NEXT_PUBLIC_GA_MEASUREMENT_ID` entry

#### Tests
None — GA4 events are observable in DevTools, not unit-testable.

---

### Scope Contract 5: CTA Improvements — All users have a next step

**Files touched:** `app/checkout/success/page.tsx`

#### UX Slice
- After successful payment, ALL users (guest and authenticated) see both CTAs in the sidebar:
  - **"Continue shopping"** (btn-primary) → `/` — unchanged
  - **"View my orders"** (btn-secondary) → `/account/orders`
- Guests clicking "View my orders" → redirected to login prompt → correct behavior (orders preserved post-login)
- Existing "View my orders" in `OrderDetails.tsx` (auth-only card) remains — this task adds it at page level for guests

#### Architecture Slice
In `page.tsx` succeeded branch, find the CTAs `<div>` (around line 220-222):
```tsx
// before:
<Link href="/" className="btn-primary block text-center py-3">Continue shopping</Link>

// after:
<Link href="/" className="btn-primary block text-center py-3">Continue shopping</Link>
<Link href="/account/orders" className="btn-secondary block text-center py-3">View my orders</Link>
```
One line added. No prop threading. No conditional logic.

#### Human Verification Checklist (<5 min)
- [ ] Complete a test payment as a **guest** → success page sidebar shows both "Continue shopping" AND "View my orders"
- [ ] Click "View my orders" as guest → lands on login page (not 404, not error)
- [ ] Complete a test payment as a **logged-in user** → same two CTAs visible in sidebar (in addition to the card-level "View my orders" in OrderDetails)
- [ ] No existing CTAs removed or broken

#### Tests
None — one-line addition, human verify is sufficient.

---

## PHASE 4: Execution Order (Cover and Move)

```
Scope 1 → verify no spinner → Scope 2 → verify email sends → Scope 3 → verify date shown
→ Scope 4 → verify GA4 fires → Scope 5 → verify CTA visible → DONE
```

**Rule:** Never start Scope N+1 until all checks for Scope N pass with evidence.

---

## PHASE 5: Final Human Check — Acceptance Gates

Must all pass before closing sang-logium-4nd happy path and unlocking edge cases:

| # | Type | Check |
|---|------|-------|
| 1 | Live | Complete test payment → order details on first load, no spinner |
| 2 | Live | Resend dashboard shows email delivered (or `[DEV EMAIL]` log if key removed) |
| 3 | Live | Success page shows estimated delivery date when `estimatedDays` present |
| 4 | Live | DevTools Network shows gtag `purchase` event fired exactly once |
| 5 | Code | `lib/email.ts` has `sendOrderConfirmationEmail` export |
| 6 | Code | `createOrderFromPaymentIntent.ts` calls it after `order_created` event, inside `try/catch` |
| 7 | Code | `getOrderByPaymentIntentId.ts` imports `backendClient` not `client` |

---

## PHASE 6: Simplicity Guardrails

Before every edit, ask:

1. **Is this the simplest possible way?** — Prefer one-line fixes over abstraction
2. **Does this touch more than one scope?** — If yes, stop and split
3. **Am I adding a new file when an existing one suffices?** — Only `SuccessAnalytics.client.tsx` is justified (Client Component boundary)
4. **Am I changing data flow or just presentation?** — Scopes 3, 5 are pure presentation. No Sanity queries. No new session fields.

---

## Scope Lock Rules

- NO changes to `route.ts` (return handler) — it is complete and correct
- NO changes to Stripe integration — payment is done
- NO new Sanity schema — all data already exists
- NO new session fields — shippingEstimatedDays already in session
- EDGE CASES LOCKED: email failure, GA4 double-fire, order-not-in-Sanity fallback — tackle after all 7 acceptance gates pass
