# Success Page - Tasks Decomposition

**Happy path tracer only.**

**Scope:** `app/(store)/checkout/success/page.tsx` only. No OrderDetails or RefreshButton implementation (those are separate slices).

## Tasks Graph

```
A[Create page.tsx skeleton] --> B[Privacy guard]
B --> C[Verify PI status === succeeded]
C --> D[Render confirmation + OrderDetails in Suspense]
```

## Task Details

### Task 1: Create page.tsx skeleton
- File: `app/(store)/checkout/success/page.tsx`
- Server Component. No `'use client'`.
- Signature: `export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ payment_intent?: string }> })`

### Task 2: Privacy guard
- FIRST thing the page does:
  ```ts
  const { payment_intent } = await searchParams
  if (!payment_intent) redirect('/basket')
  const session = await getCheckoutSession()
  if (session.completedPaymentIntentId !== payment_intent) redirect('/basket')
  ```
- Without this guard, anyone with a leaked PI id can render another user's order

### Task 3: Verify PI status === succeeded
- Call `retrievePaymentIntent(payment_intent)`
- Confirm `pi.status === 'succeeded'`
- Error handling branches (verification_failed, failed, canceled, processing) are implemented in source but out of scope for this happy-path documentation

### Task 4: Render confirmation + OrderDetails in Suspense
- Format amount: `(pi.amount / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })`
- Detect payment method: BLIK vs card (from `pi.payment_method_types` or `pi.latest_charge`)
- Render confirmation banner
- Render `<OrderDetails paymentIntentId={payment_intent} fallbackTotal={pi.amount} />` inside `<Suspense fallback={<p>Fetching order details…</p>}>`
