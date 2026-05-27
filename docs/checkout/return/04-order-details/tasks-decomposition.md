# Order Details - Tasks Decomposition

**Happy path tracer only.**

**Scope:** `app/(store)/checkout/success/OrderDetails.tsx` and `RefreshButton.tsx` only.

## Tasks Graph

```
A[Create OrderDetails.tsx] --> B[Implement null fallback]
B --> C[Implement order render]
C --> D[Create RefreshButton.tsx]
D --> E[Wire Suspense in page.tsx]
```

## Task Details

### Task 1: Create OrderDetails.tsx
- File: `app/(store)/checkout/success/OrderDetails.tsx`
- Async Server Component, no `'use client'`
- Props interface:
  ```ts
  interface Props {
    paymentIntentId: string
    fallbackTotal: number // from Stripe PI, for lag-state display
  }
  ```
- Import `fetchOrderByPaymentIntentId` from `@/sanity-cms/lib/orders/getOrderByPaymentIntentId`

### Task 2: Implement null fallback (webhook lag)
- `const order = await fetchOrderByPaymentIntentId(paymentIntentId)`
- If `!order`:
  - Format fallback: `(fallbackTotal / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })`
  - Render: "Payment successful — generating your invoice…"
  - Show fallback amount
  - Render `<RefreshButton />`

### Task 3: Implement order render
- If order exists:
  - Order ID: `order._id`
  - Date: `new Date(order.dates.orderedAt).toLocaleDateString('pl-PL', ...)`
  - Items: map `order.items` → `{name} × {quantity} = {subtotal PLN}`
  - Total: `(order.pricing.total / 100)` formatted PLN
  - Shipping address: `order.shippingAddress.name`, `line1`, `postalCode`, `city`, `state`, `country`
  - Link to `/basket` for next checkout

### Task 4: Create RefreshButton.tsx
- File: `app/(store)/checkout/success/RefreshButton.tsx`
- `'use client'`
- `const router = useRouter()`
- `<button onClick={() => router.refresh()}>I've waited — refresh</button>`
- This is the ONLY client-side code in the success scope

### Task 5: Wire Suspense in page.tsx
- In the `succeeded` branch of `page.tsx`:
  ```tsx
  <Suspense fallback={<p className="text-gray-500">Fetching order details…</p>}>
    <OrderDetails paymentIntentId={payment_intent} fallbackTotal={pi.amount} />
  </Suspense>
  ```
- The page MUST NOT `await new Promise(setTimeout)` — Suspense + null-handling is the only lag mechanism
