# Payment Page - Framed Objective

**Happy path tracer only.**

- Implement payment page as part of checkout system using Stripe Payment Intents + Stripe Elements
- Build Server Component (`/checkout/payment/page.tsx`) that:
  - Implements funnel guards: if `session.address` missing → redirect `/checkout/address`; if `session.shippingCost` missing → redirect `/checkout/shipping`
  - Queries Sanity CMS for live product prices and stock using basket IDs from session
  - If any item stock = 0 → redirect `/basket?error=out_of_stock&id={productId}`
  - Calculates subtotal (Sanity Price × Session Quantity) and grand total (subtotal + session.shippingCost)
  - Idempotent Payment Intent: if `session.paymentIntentId` exists → call `stripe.paymentIntents.update()` with current amount; if not → call `stripe.paymentIntents.create()` with `amount`, `currency: 'pln'`, and flattened address metadata keys (not address object — Stripe metadata values must be strings); store resulting `paymentIntentId` in session
  - Passes `client_secret` to Client Component
- Build Client Component (`PaymentForm.client.tsx`) that:
  - Mounts Stripe Elements provider with `client_secret`
  - Renders Stripe's `PaymentElement` (handles Blik/Apple Pay/credit cards + billing address)
  - Executes payment via `stripe.confirmPayment()` with `return_url: \`${window.location.origin}/checkout/return\`` (must be absolute)
  - Shows inline error message if `confirmPayment()` returns an error
  - Disables Pay button and shows loading state during submission
- Follow 4-layer architecture (Routing → Presentation → Mutation → Service Infrastructure)
- Use vertical slicing (tracer bullet approach) — build complete slice across all layers
- Ensure iron-session contains required data: `basket`, `address`, `shippingCode`, `shippingCost`, `paymentIntentId` (written after first PI creation)
- Implement session cascade validation to prevent funnel jumping
