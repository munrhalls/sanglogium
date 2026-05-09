/**
 * SPECIFICATION: TTL field in API response
 *
 * Core concern: The /api/checkout-queue response must include a `ttl` field
 * (number, > 0) so the client knows when the reservation expires.
 *
 * Status: COVERED
 *
 * Already verified by:
 *   tests/checkout-queue/integration/happy-path/reservation-ttl.test.ts:63-69
 *
 * The reservation-ttl test asserts data.ttl is defined, is a number, and is
 * greater than 0 as part of the full TTL expiration flow. This file was a
 * strict subset — it created a reservation solely to check one response field.
 * The TTL field's presence is meaningless without also verifying that
 * expiration actually releases stock and deletes the doc, which the full
 * TTL test does.
 */
