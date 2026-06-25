# Payment Server Component - Tasks Decomposition

**Scope:** Server-side logic in `app/(store)/checkout/payment/page.tsx` only. No Client Component code.

## Tasks Graph

```
A[Implement funnel guards] --> B[Query Sanity for products]
B --> C[Data integrity + price validity guards]
C --> D[Stock check]
D --> E[Calculate totals]
E --> F[Pass grandTotal + metadata to Client Component]
F --> G[Render page with props]
```

## Task Details

### Task 1: Implement funnel guards
- Edit `app/(store)/checkout/payment/page.tsx`
- Guards run in this exact order, BEFORE any Sanity or Stripe call:
  1. `if (!session.basket?.length) redirect('/basket')`
  2. `if (session.basket.some(i => !Number.isInteger(i.quantity) || i.quantity < 1)) redirect('/basket?error=invalid_basket')`
  3. `if (!session.address) redirect('/checkout/address')`
  4. `if (session.shippingCost === undefined || session.shippingCost === null) redirect('/checkout/shipping')`
- `shippingCost: 0` is valid — must use `=== undefined || === null`, NOT truthiness

### Task 2: Query Sanity for products
- Extract productIds: `session.basket.map(i => i.productId)`
- GROQ: `*[_type == "product" && _id in $ids]{ _id, price_data { unit_amount }, stock }`
- Use the anonymous read client (`sanity-cms/lib/client.ts`)

### Task 3: Data integrity + price validity guards
- Count mismatch guard (run immediately after Sanity query):
  - `if (sanityProducts.length !== session.basket.length) throw new Error('Product mismatch...')`
- Price validity guard (run before any arithmetic):
  - `if (!Number.isFinite(product.price_data?.unit_amount)) throw new Error('Product ${id} has invalid price')`
- These throw to `app/(store)/checkout/error.tsx` — recoverable error boundary, not global 500

### Task 4: Stock check
- For each Sanity product: `if (product.stock === 0) redirect('/basket?error=out_of_stock&id=' + product._id)`
- Redirect keeps the user in the funnel; throw would render error boundary

### Task 5: Calculate totals
- Match each basket item to its Sanity product by `productId === _id`
- Subtotal: `Σ(price_data.unit_amount * quantity)`
- Grand total: `Math.round(subtotal + session.shippingCost)`
- If `grandTotal < 1` → `redirect('/basket?error=invalid_total')`
- All amounts are integer grosz

### Task 6: Pass grandTotal and metadata to Client Component
- Build flattened metadata from `session.address` + `session.email`:
  ```ts
  {
    firstName: address.firstName,
    lastName: address.lastName,
    phone: address.phone,
    regionCode: address.regionCode,
    postalCode: address.postalCode,
    street: address.street,
    streetNumber: address.streetNumber,
    city: address.city,
    email: session.email ?? '',
    ...(session.checkoutSessionId && { checkoutSessionId: session.checkoutSessionId }),
  }
  ```
- Pass grandTotal and metadata as props to Client Component. Do NOT call initPaymentAction here — cookie writes are invalid during Server Component render.

### Task 6b: Client Component fetches Route Handler (covered in 03-client-form/)
- Client Component (covered in 03-client-form/) fetches /api/checkout/payment-intent-session in useEffect, which calls initPaymentAction and returns clientSecret.

### Task 7: Render page with props
- Pass to Client Component:
  - `grandTotal: number`
  - `metadata: Record<string, string>`
  - `basket: session.basket`
  - `sanityProducts: sanityProducts` (for order summary)
  - `address: session.address`
  - `shippingCost: session.shippingCost`
  - `traceId: session.checkoutSessionId || 'unknown'`
