# Payment Page - Framed Objective

- Implement payment page as part of checkout system using Stripe Payment Intents + Stripe Elements
- Build Server Component (`/checkout/payment/page.tsx`) that:
  - Implements funnel guards (redirect if missing address or shippingCost from iron-session)
  - Queries Sanity CMS for live product prices and stock using basket IDs from session
  - Calculates subtotal (Sanity Price × Session Quantity) and grand total (subtotal + session.shippingCost)
  - Creates Stripe Payment Intent with grand total and address metadata
  - Passes client_secret to Client Component
- Build Client Component (`PaymentForm.client.tsx`) that:
  - Mounts Stripe Elements provider with client_secret
  - Renders Stripe's PaymentElement (handles Blik/Apple Pay/credit cards + billing address)
  - Executes payment via stripe.confirmPayment()
  - Redirects to /checkout/return on success
- Follow 4-layer architecture (Routing → Presentation → Mutation → Service Infrastructure)
- Use vertical slicing (tracer bullet approach) - build complete slice across all layers
- Ensure iron-session contains required data: basket, address, shippingCode, shippingCost
- Implement session cascade validation to prevent funnel jumping
