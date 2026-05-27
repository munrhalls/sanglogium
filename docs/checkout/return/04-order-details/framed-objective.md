# Order Details - Framed Objective

**Happy path tracer only.**

**Objective:** Build the async Server Component that fetches the order from Sanity and renders it inside a Suspense boundary on the success page, with a fallback for webhook lag.

- Async Server Component in a separate file (`app/(store)/checkout/success/OrderDetails.tsx`)
- Props: `{ paymentIntentId: string; fallbackTotal: number }`
- Call `fetchOrderByPaymentIntentId(paymentIntentId)` — returns order document or `null`
- If order is `null`: render "Payment successful — generating your invoice…" + fallback amount (from `fallbackTotal` prop, formatted PLN) + `<RefreshButton />`
- If order exists: render order ID, item list (name × qty = line total), grand total (PLN), shipping address, order date, and link to `/basket`
- The success page wraps this component in `<Suspense fallback={<p>Fetching order details…</p>}>`
- `RefreshButton` is a tiny `'use client'` component that calls `router.refresh()` to re-trigger the Server Component fetch
