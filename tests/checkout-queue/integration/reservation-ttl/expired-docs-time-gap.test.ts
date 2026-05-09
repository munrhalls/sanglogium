/**
 * SPECIFICATION: Expired vs. non-expired reservation boundary
 *
 * Core concern: The GROQ query `expiresAt < now()` must correctly distinguish
 * expired reservations from active ones. A bug in the query (off-by-one,
 * timezone mishandling, string comparison instead of date comparison) could
 * cause active reservations to be deleted or expired ones to persist forever.
 *
 * Status: NEEDS NEW TEST — the original test was cargo cult (waited 1 second
 * and checked an already-1-hour-expired doc was still findable — proving
 * nothing). The real concern is the boundary condition.
 *
 * Real black-box test specification:
 *
 *   Given: Two basketReservation docs exist in Sanity:
 *     - Doc A: expiresAt = 1 hour in the past (definitely expired)
 *     - Doc B: expiresAt = 1 hour in the future (definitely active)
 *
 *   When: findExpiredReservations() is called
 *
 *   Then:
 *     - Doc A is present in the results
 *     - Doc B is NOT present in the results
 *
 *   This proves the GROQ query correctly filters on the expiresAt boundary.
 *   The existing orchestrator test only proves that an expired doc IS found
 *   and deleted — it never proves that an active doc is NOT falsely included.
 *
 * Implementation notes:
 *   - Use getBackendClient() to create both docs directly in Sanity
 *   - Clean up both docs in afterEach
 *   - No need to go through /api/checkout-queue — this is a query test
 *   - Timeout: 10s (two Sanity writes + one query)
 */
