# Payment Page - Framed Objective

**Happy path tracer only.**

- Implement payment page as part of checkout system using Stripe Payment Intents + Stripe Elements
- Build Server Component (`/checkout/payment/page.tsx`) that:
  - Implements funnel guards: if `session.address` missing → redirect `/checkout/address`; if `session.shippingCost` missing → redirect `/checkout/shipping`
  - Queries Sanity CMS for live product prices and stock using `productId`s from `session.basket`; Sanity fields: `price_data.unit_amount` (integer grosz), `stock` (integer)
  - If any item `stock = 0` → redirect `/basket?error=out_of_stock&id={productId}`
  - Calculates subtotal: `Σ(price_data.unit_amount × quantity)`; grand total: `Math.round(subtotal + session.shippingCost)` — must be integer for Stripe
  - Idempotent Payment Intent:
    - If `session.paymentIntentId` exists → try `stripe.paymentIntents.update()` with `{ amount, metadata: { ...flattenedAddressKeys } }`; if throws (terminal PI state), clear `paymentIntentId` and fall through to create
    - If no `paymentIntentId` → `stripe.paymentIntents.create({ amount, currency: 'pln', automatic_payment_methods: { enabled: true }, metadata: { ...flattenedAddressKeys } })`; store `paymentIntentId` in session
    - Flatten all address fields as individual string metadata keys: `regionCode`, `postalCode`, `street`, `streetNumber`, `city`
    - After both branches: `if (!client_secret) throw new Error('Stripe did not return client_secret')`; then `session.save()` unconditionally
  - Passes `client_secret` to Client Component
- Build Client Component (`PaymentForm.client.tsx`) that:
  - Initializes outside component: `const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)`
  - Guards: `if (!clientSecret) return <p>Loading payment form…</p>` before mounting `<Elements>`
  - Mounts: `<Elements stripe={stripePromise} options={{ clientSecret, currency: 'pln' }}>`
  - Renders Stripe's `PaymentElement` (handles Blik/Apple Pay/credit cards + billing address)
  - On submit: guards `if (!stripe || !elements) return` (hooks return null until Stripe.js loads)
  - Calls `stripe.confirmPayment({ elements, confirmParams: { return_url: \`${window.location.origin}/checkout/return\` } })`
  - `confirmPayment()` only returns to calling code on error; treat any return as error: `result.error?.message ?? 'Payment failed. Please try again.'`
  - Disables Pay button and shows loading state during submission; re-enables on error
- `/checkout/return` is a hard dependency of this tracer — it must exist and handle Stripe's `payment_intent` query param
- Follow 4-layer architecture (Routing → Presentation → Mutation → Service Infrastructure)
- Use vertical slicing (tracer bullet approach) — build complete slice across all layers
- Ensure iron-session contains required data: `basket`, `address`, `shippingCode`, `shippingCost`, `paymentIntentId` (written/updated after PI create/update)
- Implement session cascade validation to prevent funnel jumping
