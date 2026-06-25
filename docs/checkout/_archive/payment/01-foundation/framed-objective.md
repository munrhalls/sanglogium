# Payment Foundation - Framed Objective

**Objective:** Prepare the ground-layer prerequisites so the payment page can be built, tested, and debugged safely.

**Happy path tracer only.**

- Verify `CheckoutSession` interface in `lib/session.ts` includes `paymentIntentId?: string` and `completedPaymentIntentId?: string`
- Verify Stripe server-side and client-side env vars are present and non-empty
- Verify Stripe Dashboard has payment methods enabled for PLN (Card, Blik)
- Ensure `app/(store)/checkout/error.tsx` exists and covers Server Component throws in the checkout segment
