# Payment Client Form - Tasks Decomposition

**Scope:** Client-side code in `app/(store)/checkout/payment/PaymentForm.client.tsx` only. No server logic.

## Tasks Graph

```
A[Create PaymentForm.client.tsx skeleton] --> B[Fetch clientSecret from Route Handler]
B --> C[Initialize Stripe Elements]
C --> D[Add email field capture]
D --> E[Render itemized order summary]
E --> F[Render PaymentElement]
F --> G[Implement payment execution]
```

## Task Details

### Task 1: Create PaymentForm.client.tsx skeleton
- File: `app/(store)/checkout/payment/PaymentForm.client.tsx`
- First line: `'use client'`
- Props interface:
  ```ts
  interface PaymentFormProps {
    grandTotal: number;
    metadata: Record<string, string>;
    basket: Array<{ productId: string; quantity: number }>;
    sanityProducts: Array<{ _id: string; price_data?: { unit_amount?: number } | null; stock?: number | null }>;
    address: { firstName: string; lastName: string; phone: string; regionCode: string; postalCode: string; street: string; streetNumber: string; city: string };
    shippingCost: number;
    traceId: string;
  }
  ```

### Task 2: Fetch clientSecret from Route Handler
- Add state: `clientSecret` (string | null), `isLoading` (boolean)
- Add useEffect that POSTs to /api/checkout/payment-intent-session with { grandTotal, metadata }
- On success: set `clientSecret` from response
- On error: set error state, display to user
- Guard before mounting Stripe Elements: `if (!clientSecret) return <p>Loading payment form…</p>`

### Task 3: Initialize Stripe Elements
- Outside component: `const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)`
- Mount: `<Elements stripe={stripePromise} options={{ clientSecret, currency: 'pln' }}>`

### Task 4: Add email field capture
- Render email `<input type="email">`
- Validate format (HTML5 `type="email"` is sufficient for tracer; production may add Zod)
- Store email in local state
- On form submission, pass email to `confirmPayment` via `payment_method_data.billing_details.email`
- Optionally save to `session.email` via a small Server Action so future PI refreshes include it in metadata

### Task 5: Render itemized order summary
- Match each basket item to its Sanity product by `productId === _id`
- Display: product name (use `_id` as fallback if name field unavailable), quantity, unit price (PLN display), line total
- Display subtotal, shipping cost, grand total
- Position above the payment form for user verification

### Task 6: Render PaymentElement
- Import `<PaymentElement>` from `@stripe/react-stripe-js`
- Suppress billing address collection:
  ```tsx
  <PaymentElement options={{ fields: { billingDetails: { address: 'never' } } }} />
  ```
- This prevents the user from typing their address twice

### Task 7: Implement payment execution
- `const stripe = useStripe(); const elements = useElements();`
- State: `isLoading` (boolean), `error` (string | null)
- Pay button: disabled when `isLoading || !stripe || !elements`
- On click handler:
  1. `if (!stripe || !elements) return`
  2. `setIsLoading(true); setError(null)`
  3. `const { error: submitError } = await elements.submit()`
     - If `submitError`: `setError(submitError.message ?? 'Please check your payment details.'); setIsLoading(false); return`
  4. Build `billing_details`:
     ```ts
     {
       email: emailState,
       address: {
         line1: `${address.street} ${address.streetNumber}`,
         postal_code: address.postalCode,
         city: address.city,
         state: address.regionCode,
         country: 'PL',
       },
     }
     ```
  5. `const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: \`${window.location.origin}/api/checkout/return\`, payment_method_data: { billing_details } } })`
  6. If `error`: `setError(error?.message ?? 'Payment failed. Please try again.'); setIsLoading(false)`
  7. On success, Stripe redirects the browser — code below `confirmPayment` does not run
