/**
 * SPECIFICATION: Reservation TTL test environment readiness
 *
 * Core concern: The dev server must be running, the queue endpoint must
 * respond, and the test dataset must contain valid products before any
 * reservation TTL test can execute.
 *
 * Status: INFRASTRUCTURE — not an application test
 *
 * Every real test in this suite already verifies these pre-conditions:
 * - beforeAll checks dev server via OPTIONS request (throws if unreachable)
 * - beforeAll calls getTestProducts() and asserts length >= 1
 *
 * Testing these pre-conditions in a standalone file is redundant — if the
 * environment is broken, the real tests fail with clear, actionable errors
 * ("Dev server not running", "Test dataset must have at least 1 product").
 * A separate setup verification test adds a second failure for the same
 * root cause without improving diagnosability.
 */
