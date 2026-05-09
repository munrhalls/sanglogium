/**
 * SPECIFICATION: Expired reservation cleanup — end-to-end
 *
 * Core concern: When a reservation expires, the cleanup pipeline must:
 *   1. Detect the expired reservation
 *   2. Release its reservedStock back to available stock
 *   3. Delete the reservation document from Sanity
 *
 * Status: COVERED
 *
 * Already verified by:
 *   tests/checkout-queue/integration/reservation-ttl/cleanup/background-cleanup-stock.test.ts
 *
 * This file was a near-duplicate of background-cleanup-stock.test.ts. Both
 * tests reset stock, increment reservedStock, create an expired reservation,
 * run backgroundCleanupJob(), and assert doc deleted + stock released. The
 * only difference was naming convention ("specification" vs "integration").
 * One test proving the cleanup pipeline works is sufficient — a second test
 * with the same assertions adds maintenance burden without additional
 * protection.
 */
