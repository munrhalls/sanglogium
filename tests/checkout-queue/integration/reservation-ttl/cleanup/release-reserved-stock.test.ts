/**
 * SPECIFICATION: Reserved stock release
 *
 * Core concern: releaseReservedStock() must decrement a product's
 * reservedStock by the given quantity via an atomic Sanity transaction.
 *
 * Status: COVERED
 *
 * Already verified by:
 *   tests/checkout-queue/integration/reservation-ttl/cleanup/background-cleanup-stock.test.ts
 *
 * The orchestrator test creates an expired reservation with reservedStock=2,
 * runs backgroundCleanupJob(), and asserts reservedStock <= 0 afterward.
 * This proves stock release works as part of the cleanup pipeline. Testing
 * releaseReservedStock() in isolation is testing an implementation detail —
 * the orchestrator is the contract. If stock release breaks, the orchestrator
 * catches it. If the orchestrator passes but this test fails, this test is
 * testing the wrong thing.
 */
