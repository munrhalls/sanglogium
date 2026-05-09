/**
 * SPECIFICATION: Basket reservation flow — atomic CMS operation
 *
 * Core concern: A valid POST to /api/checkout-queue must:
 *   1. Return 202 with a BasketReservationResponse (reservationId, products)
 *   2. Create a basketReservation doc in Sanity with matching items
 *   3. Atomically increment reservedStock on each product by the requested quantity
 *   4. Return a product snapshot that matches the freshly-updated Sanity state
 *
 * Status: COVERED
 *
 * Already verified by:
 *   tests/checkout-queue/integration/happy-path/basket-reservation-flow-happy-path.test.ts
 *
 * This file was a near-identical copy of the happy-path variant — same file
 * header, same describe block name, same three test cases. The only difference
 * was line 110-111: this variant asserted reservedStock relative to initial
 * value (testProducts[0].reservedStock + 1) while the happy-path variant
 * asserted absolute values (expect 1, expect 2). The happy-path variant's
 * approach is stricter and preferred — it proves the exact expected value,
 * not just "initial + delta."
 *
 * Delete this file. Keep basket-reservation-flow-happy-path.test.ts.
 */
