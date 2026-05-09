/**
 * SPECIFICATION: Stripe price verification integrity
 *
 * Core concern: The price verified via Stripe must match the CMS price
 * (price_data.unit_amount / 100). A mismatch means the customer could be
 * charged a different amount than what the product page displays.
 *
 * Status: COVERED
 *
 * Already verified by:
 *   tests/checkout-queue/e2e/basket-reservation-happy-path.spec.ts:98-113
 *
 * The happy-path E2E test asserts stripeVerification.verifiedPrice ===
 * cmsProduct.realPrice as part of the full checkout flow. This file was a
 * strict subset of that test — same setup, same assertions, less coverage.
 * No additional protection is gained by testing price verification in
 * isolation when the full-flow test already gates on it.
 */
