# Return Flow Integration - Framed Objective

**Happy path tracer only.**

**Objective:** Verify the complete happy-path return flow works end-to-end, cross-scope contracts are aligned, and scope boundaries are respected.

- Test full happy-path user journey: payment submit → Stripe redirect → Route Handler → success page → order details
- Verify cross-scope contracts: `return_url`, `paymentIntentId` field name (camelCase), currency (integer grosz)
- Confirm legacy `app/(store)/checkout/return/page.tsx` (old Stripe Checkout Client Component) is removed — it uses `session_id` and conflicts with the new architecture
- Confirm webhook handler scope is NOT in return-flow docs — it lives at `app/api/webhooks/stripe/route.ts` with separate documentation (not yet implemented)
- Confirm the success page NEVER writes to Sanity — it only reads
