# Return Flow Foundation - Framed Objective

**Happy path tracer only.**

**Objective:** Prepare the ground-layer service infrastructure so the return flow can verify PaymentIntents and read orders from Sanity.

- Verify `lib/stripe.ts` exports `retrievePaymentIntent(paymentIntentId)` that calls `stripe.paymentIntents.retrieve()` and returns the full PaymentIntent object
- Verify the Sanity order schema exists with fields: `_type == "order"`, `paymentIntentId` (camelCase string), `items`, `pricing.total` (integer grosz), `shippingAddress`, `dates.orderedAt`
- Verify `sanity-cms/lib/orders/getOrderByPaymentIntentId.ts` exists and queries orders by `paymentIntentId`
- These helpers are shared by both the Route Handler and the success page — they must be in place before either endpoint is tested
