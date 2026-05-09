/**
 * SPECIFICATION: Expired reservation detection
 *
 * Core concern: findExpiredReservations() must return all basketReservation
 * documents whose expiresAt timestamp is in the past.
 *
 * Status: COVERED
 *
 * Already verified by:
 *   tests/checkout-queue/integration/reservation-ttl/cleanup/background-cleanup-stock.test.ts
 *
 * The orchestrator test creates an expired reservation, runs the full cleanup
 * pipeline, and verifies the doc is deleted — which can only happen if
 * findExpiredReservations() correctly returned it. Testing the query in
 * isolation duplicates this proof at a lower level. The orchestrator is the
 * contract; the query is an implementation detail.
 *
 * Note: There is one uncovered edge case — ensuring the GROQ query correctly
 * distinguishes expired from non-expired docs. See:
 *   tests/checkout-queue/integration/reservation-ttl/expired-docs-time-gap.test.ts
 */
