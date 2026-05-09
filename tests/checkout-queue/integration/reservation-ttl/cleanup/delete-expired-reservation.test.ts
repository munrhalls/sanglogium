/**
 * SPECIFICATION: Expired reservation document deletion
 *
 * Core concern: deleteExpiredReservation() must remove a basketReservation
 * document from Sanity by its _id.
 *
 * Status: COVERED
 *
 * Already verified by:
 *   tests/checkout-queue/integration/reservation-ttl/cleanup/background-cleanup-stock.test.ts
 *
 * The background cleanup orchestrator test proves deletion works end-to-end:
 * it creates an expired reservation, runs backgroundCleanupJob(), and asserts
 * the doc is null afterward. Testing deleteExpiredReservation() in isolation
 * is testing an implementation detail — the orchestrator is the contract.
 * If deletion breaks, the orchestrator test catches it. If the orchestrator
 * test passes but the isolated helper test fails, the isolated test is wrong.
 */
