# Payment Server Component - Framed Objective

**Objective:** Build the `/checkout/payment` Server Component that validates session state, fetches live Sanity data, calculates totals, and produces a `client_secret` via Server Action for the Client Component.

**Happy path tracer only.**

- Query Sanity CMS for live prices and stock using productIds from `session.basket`
- Calculate subtotal and grand total in integer grosz
- Pass grandTotal and metadata as props to the Client Component. The Client Component will fetch the /api/checkout/payment-intent-session Route Handler on mount, which calls initPaymentAction in valid cookie context.
- Pass basket items, Sanity products, address, and shippingCost to the Client Component as props
- Return-flow lifecycle, webhook ordering, and order persistence are OUT OF SCOPE — see `docs/checkout/return/`
