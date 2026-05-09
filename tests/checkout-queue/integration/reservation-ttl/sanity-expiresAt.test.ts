/**
 * SPECIFICATION: expiresAt timestamp on Sanity reservation doc
 *
 * Core concern: Every basketReservation document created via the queue must
 * include an `expiresAt` timestamp so the TTL cleanup pipeline can identify
 * and process expired reservations.
 *
 * Status: COVERED
 *
 * Already verified by:
 *   tests/checkout-queue/integration/happy-path/reservation-ttl.test.ts
 *   tests/checkout-queue/integration/happy-path/basket-reservation-flow-happy-path.test.ts
 *
 * Both tests create reservations through the API and query the resulting
 * Sanity doc. The reservation-ttl test relies on expiresAt to determine
 * when to check for cleanup (it would fail if the field were missing).
 * This file was a strict subset — it created a reservation solely to check
 * one field exists on the doc. The field's existence is meaningless without
 * verifying that the TTL pipeline actually uses it correctly, which the
 * full TTL test does.
 */
