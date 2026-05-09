/**
 * SPECIFICATION: Test data integrity
 *
 * Core concern: The test dataset must contain valid products with required
 * fields (_id, stock, reservedStock) for checkout queue tests to run.
 *
 * Status: INFRASTRUCTURE — not an application test
 *
 * This file tested getTestProducts(), a test helper. If that helper were
 * broken, every integration test would fail in beforeAll with a clear error
 * ("Test dataset must have at least 2 products"). Testing the test helper
 * directly adds no protection — it's a second assertion about the same
 * pre-condition that every real test already enforces.
 *
 * Test data integrity is a CI/CD concern (seed scripts, schema validation),
 * not a per-test-suite concern. If test data corruption is a recurring
 * problem, invest in a data seeding step in the CI pipeline, not in
 * tests that test other tests.
 */
