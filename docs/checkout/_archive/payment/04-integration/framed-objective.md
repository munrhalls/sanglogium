# Payment Integration - Framed Objective

**Objective:** Verify the complete payment page works end-to-end, respects upstream/downstream contracts, and does not duplicate concerns owned by other scopes.

**Happy path tracer only.**

- Test the full user journey: basket → address → shipping → payment page → payment submit → redirect to `/api/checkout/return`
- Confirm payment page does NOT implement return-flow logic, session clearing, success display, or order creation — those are scoped to `docs/checkout/return/`
- Confirm payment page does NOT implement webhook handler logic — that is scoped to `app/api/webhooks/stripe/route.ts`
- Cross-reference contracts: `return_url`, `paymentIntentId` field names, and currency unit (grosz) must match `docs/checkout/return/` exactly
