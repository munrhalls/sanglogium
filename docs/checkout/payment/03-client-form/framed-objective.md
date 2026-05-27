# Payment Client Form - Framed Objective

**Objective:** Build the Client Component that receives grandTotal and metadata from the Server Component, fetches clientSecret from the /api/checkout/payment-intent-session Route Handler on mount, collects the user's email, displays the order summary, renders Stripe's PaymentElement, and executes payment via `stripe.confirmPayment`.

**Happy path tracer only.**

- The component is a Client Component (`'use client'` as the first line)
- Initialize `loadStripe` once, outside the component
- On mount, fetch /api/checkout/payment-intent-session with grandTotal and metadata. Receive clientSecret from Route Handler response.
- Mount Stripe `<Elements>` with the received clientSecret
- Render an email input field; include email in `confirmPayment` `billing_details`
- Display an itemized order summary (product names, quantities, prices, subtotal, shipping, grand total)
- Render `<PaymentElement>` with billing address collection suppressed (`fields.billingDetails.address: 'never'`)
- On Pay click: call `elements.submit()`, then `stripe.confirmPayment()`
- Pass the canonical session address as `billing_details` in `confirmParams.payment_method_data`
- Set `return_url` to `${window.location.origin}/api/checkout/return` (the Route Handler)
- Return-flow handling, session clearing, and success display are OUT OF SCOPE — see `docs/checkout/return/`
