# Return Route Handler - Framed Objective

**Happy path tracer only.**

**Objective:** Build the `/api/checkout/return` Route Handler that Stripe redirects to after a successful `confirmPayment`. It verifies the PaymentIntent server-side, clears the checkout session, and redirects to the success page.

- Read `payment_intent` from `URL.searchParams`
- Ignore `payment_intent_client_secret` and `redirect_status` — they are client-controllable
- Call `retrievePaymentIntent(payment_intent)` and confirm `pi.status === 'succeeded'`
- Set `session.completedPaymentIntentId = pi.id` — this is the privacy-guard key for the success page
- On `succeeded`: clear `paymentIntentId`, `basket`, `address`, `shippingCode`, `shippingCost` (use `session.field = undefined`, NOT `session.destroy()`)
- Save session and redirect to `/checkout/success?payment_intent=${pi.id}`
- Error handling (missing param, Stripe API failure, non-succeeded status) is implemented in source but out of scope for this happy-path documentation
- The webhook handler is OUT OF SCOPE — it lives at `app/api/webhooks/stripe/route.ts` with its own documentation
