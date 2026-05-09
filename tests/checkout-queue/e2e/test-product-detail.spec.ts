/**
 * SPECIFICATION: Test product accessibility
 *
 * Core concern: The test product must be reachable and addable to basket
 * for any checkout queue test to function.
 *
 * Status: PRE-CONDITION — not a checkout queue test
 *
 * This file tested product page navigation and basket functionality.
 * Neither touches the checkout queue. These are pre-conditions verified
 * implicitly by every real test:
 *
 * - Integration tests' beforeAll calls getTestProducts() and asserts
 *   testProducts.length >= 2, failing fast if test data is missing.
 * - The E2E happy-path test navigates to the product, adds to basket,
 *   and proceeds through checkout — if the product were inaccessible,
 *   that test fails at the first step with a clear error.
 *
 * A standalone "can I open the product page" test belongs in a product
 * page test suite, not in checkout-queue. It protects nothing about the
 * queue itself.
 */
