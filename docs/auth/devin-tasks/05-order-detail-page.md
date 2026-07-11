# Phase 5 — Order detail / invoice / tracking page

**Depends on:** nothing (independent of phases 2–4).
**Closes:** G4.

---

## The schema already has everything — this is a pure UI/route gap

`sanity-cms/schemaTypes/orderType.ts` already defines, per order: full `items[]` (with `productId`, `name`, `slug`, `imageUrl`, `variant`, `price`, `quantity`, `subtotal`, `returnStatus`), `shippingAddress`/`billingAddress`, `shippingMethod` (including `trackingNumber` and `trackingUrl`), `pricing` breakdown (`subtotal`/`shipping`/`tax`/`discount`/`total`/`currency`), `status`, `dates` (ordered/paid/shipped/delivered/cancelled/refunded), and `payment` info (`last4`, `brand`, `method`). **Do not add any Sanity schema fields for this phase** — everything needed already exists and is presumably already populated at order-creation time by `lib/checkout/createOrderFromPaymentIntent.ts`. Confirm that assumption by reading that file's order-document construction before writing the query — if a field this page needs turns out not to be populated at creation time, that's a separate bug to flag, not something to silently work around in the UI.

## What to build

1. **New route:** `app/(store)/account/orders/[orderNumber]/page.tsx` (Server Component, `verifySession()` guard, same pattern as the existing `orders/page.tsx`).

2. **GROQ query**, scoped to the signed-in user (critical — do not fetch by `orderNumber` alone, or one signed-in user could view another user's order by guessing/incrementing the URL):
   ```groq
   *[_type == "order" && orderNumber == $orderNumber && userId == $userId][0]{
     orderNumber, status, items, shippingAddress, billingAddress,
     shippingMethod, pricing, dates, payment, metadata
   }
   ```
   If the fetch returns `null` (wrong user or nonexistent order), render Next.js `notFound()` — do not leak whether the order exists for someone else.

3. **UI sections**, in a single page (no need to split into client components — this is read-only, keep it a Server Component like `orders/page.tsx`):
   - Order summary header (number, status, date).
   - Line items table/list (image, name, variant, qty, unit price, subtotal).
   - Pricing breakdown (subtotal/shipping/tax/discount/total).
   - Shipping address + shipping method; if `trackingNumber`/`trackingUrl` are present, render a "Track package" link.
   - Payment summary (card brand + last 4, if present — never show full card numbers, better-auth/Stripe already ensures only `last4` is ever stored).

4. **Update `app/(store)/account/orders/page.tsx`** — wrap each existing list item in a `Link` to `/account/orders/${order.orderNumber}`.

## Invoice/download (optional within this phase, do only after the above works)

A downloadable invoice is a "nice to have" per the original audit, not confirmed as urgent. If pursued: render a print-friendly view at the same route via a query param (`?print=1`) with a "Print / Save as PDF" browser action, rather than generating a server-side PDF — simpler, no new dependency, and consistent with a minimalist scope. Do not add a PDF-generation library for this unless explicitly asked.

## Acceptance criteria

- Clicking an order in `/account/orders` navigates to its detail page.
- Detail page shows all sections above with real data from the order document.
- Requesting another user's order number (while signed in as a different user) returns a 404, not their order data.
- Signed-out access redirects to `/sign-in`.
