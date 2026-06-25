# Success Page - Framed Objective

**Happy path tracer only.**

**Objective:** Build the `/checkout/success` Server Component that privacy-guards the request, verifies the PaymentIntent succeeded, and renders the confirmation with order details.

- Server Component, no `'use client'`
- **Privacy guard FIRST**: check `payment_intent` in `searchParams`, then verify `session.completedPaymentIntentId === payment_intent`; mismatch → redirect `/basket`
- Call `retrievePaymentIntent(payment_intent)` and confirm `pi.status === 'succeeded'`
- Render Stripe-derived confirmation: amount formatted in PLN, payment method hint (BLIK or card)
- Render `<OrderDetails paymentIntentId={payment_intent} fallbackTotal={pi.amount} />` inside `<Suspense fallback={<p>Fetching order details…</p>}>`
- The success page NEVER creates orders — it only reads them. Order creation depends on the webhook handler (`app/api/webhooks/stripe/route.ts`), which is not yet implemented.
- Failed, canceled, and processing branches are implemented in source but out of scope for this happy-path documentation.
