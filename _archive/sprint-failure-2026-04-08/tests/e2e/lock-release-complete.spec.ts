import { test, expect as playwrightExpect } from '@playwright/test';
import { mockTime, injectTimeMock } from '../setup/playwright-time-mock';
import {
  getProductStock,
  getProductReservedStock,
  getProductReservations,
  cleanupTestReservations,
  resetTestProducts,
  createTestProductsIfNotExists,
  createTestReservation,
  TEST_PRODUCTS
} from '../helpers/test-data';

// Use Playwright's expect
const expect = playwrightExpect;

test.describe('Lock Release - Complete Abandonment Flow', () => {
  test.beforeAll(async () => {
    // Create test products if they don't exist
    await createTestProductsIfNotExists();
  });

  test.beforeEach(async ({ page }) => {
    // Reset time and clean up test data
    mockTime.reset();
    await cleanupTestReservations();
    await resetTestProducts();
    // Inject time mock into page
    await injectTimeMock(page);
  });

  test.afterEach(async () => {
    // Clean up test data
    await cleanupTestReservations();
  });

  test('back button retry maintains single reservation', async ({ page }) => {
    // 1. Get initial stock state
    const initialStock = await getProductStock(TEST_PRODUCTS.ITEM_1);
    const initialReserved = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(initialReserved).toBe(0);

    // 2. Add items to basket from product pages
    await page.goto(`/product/test-item-1`);
    await page.locator('[data-testid="add-to-basket-test-item-1"]').click();
    await page.goto(`/product/test-item-2`);
    await page.locator('[data-testid="add-to-basket-test-item-2"]').click();

    // 3. Go to basket and checkout
    await page.goto('/basket');
    await page.locator('[data-testid="checkout-button"]').click();

    // 4. Wait for stock reservation (should redirect to Stripe or show checkout)
    await page.waitForTimeout(1000);

    // 5. Verify stock is reserved
    const reservedAfterCheckout = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterCheckout).toBeGreaterThan(0);

    // 6. Click back button
    await page.goBack();

    // 7. Verify stock is still reserved (immediate)
    const reservedAfterBack = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterBack).toBe(reservedAfterCheckout);

    // 8. Try to checkout again with same items
    await page.locator('[data-testid="checkout-button"]').click();
    await page.waitForTimeout(1000);

    // 9. Verify no additional reservation was created
    const reservedAfterRetry = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterRetry).toBe(reservedAfterCheckout); // Same amount

    // 10. Advance time past expiration
    mockTime.advance(4000); // 4 seconds (past 3 second expiry)

    // 11. Wait for cleanup (background job might need a moment)
    await page.waitForTimeout(500);

    // 12. Verify stock was released
    const reservedAfterExpiration = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterExpiration).toBe(0);

    // 13. Verify stock is back to original
    const finalStock = await getProductStock(TEST_PRODUCTS.ITEM_1);
    expect(finalStock).toBe(initialStock);
  });

  test('tab close and reopen maintains reservation', async ({ page, context }) => {
    // 1. Get initial stock state
    const initialStock = await getProductStock(TEST_PRODUCTS.ITEM_1);
    const initialReserved = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(initialReserved).toBe(0);

    // 2. Add items to basket from product pages
    await page.goto(`/product/test-item-1`);
    await page.locator('[data-testid="add-to-basket-test-item-1"]').click();
    await page.goto(`/product/test-item-2`);
    await page.locator('[data-testid="add-to-basket-test-item-2"]').click();

    // 3. Go to basket and checkout
    await page.goto('/basket');
    await page.locator('[data-testid="checkout-button"]').click();
    await page.waitForTimeout(1000);

    // 4. Verify stock is reserved
    const reservedAfterCheckout = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterCheckout).toBeGreaterThan(0);

    // 5. Close the tab
    await context.close();

    // 6. Open new tab immediately (within expiry)
    const newPage = await context.newPage();

    // 7. Verify stock is still reserved
    const reservedAfterReopen = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterReopen).toBe(reservedAfterCheckout);

    // 8. Go to basket page
    await newPage.goto('/basket');
    await newPage.waitForTimeout(1000);

    // 9. Should see the same items in basket
    const basketItems = await newPage.locator('[data-testid^="basket-item-"]').count();
    expect(basketItems).toBe(2);

    await newPage.close();
  });

  test('tab close after expiry allows new checkout', async ({ page, context }) => {
    // 1. Get initial stock state
    const initialStock = await getProductStock(TEST_PRODUCTS.ITEM_1);
    const initialReserved = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(initialReserved).toBe(0);

    // 2. Add items to basket from product pages
    await page.goto(`/product/test-item-1`);
    await page.locator('[data-testid="add-to-basket-test-item-1"]').click();
    await page.goto(`/product/test-item-2`);
    await page.locator('[data-testid="add-to-basket-test-item-2"]').click();

    // 3. Go to basket and checkout
    await page.goto('/basket');
    await page.locator('[data-testid="checkout-button"]').click();
    await page.waitForTimeout(1000);

    // 4. Verify stock is reserved
    const reservedAfterCheckout = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterCheckout).toBeGreaterThan(0);

    // 5. Close the tab
    await context.close();

    // 6. Advance time past expiration
    mockTime.advance(4000); // 4 seconds (past 3 second expiry)

    // 7. Open new tab after expiry
    const newPage = await context.newPage();

    // 8. Verify stock was released
    const reservedAfterExpiration = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterExpiration).toBe(0);

    // 9. Go to basket page
    await newPage.goto('/basket');
    await newPage.waitForTimeout(1000);

    // 10. Should be able to checkout again
    await newPage.locator('[data-testid="add-to-basket-item-1"]').click();
    await newPage.locator('[data-testid="checkout-button"]').click();
    await newPage.waitForTimeout(1000);

    // 11. Verify new reservation was created
    const reservedAfterNewCheckout = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterNewCheckout).toBeGreaterThan(0);

    await newPage.close();
  });

  test('multiple rapid abandonments do not duplicate reservations', async ({ page }) => {
    // 1. Get initial stock state
    const initialStock = await getProductStock(TEST_PRODUCTS.ITEM_1);
    const initialReserved = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(initialReserved).toBe(0);

    // 2. Add items to basket from product pages
    await page.goto(`/product/test-item-1`);
    await page.locator('[data-testid="add-to-basket-test-item-1"]').click();
    await page.goto(`/product/test-item-2`);
    await page.locator('[data-testid="add-to-basket-test-item-2"]').click();

    // 3. Go to basket and checkout
    await page.goto('/basket');
    await page.locator('[data-testid="checkout-button"]').click();
    await page.waitForTimeout(1000);

    // 4. Verify stock is reserved
    const reservedAfterCheckout = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterCheckout).toBeGreaterThan(0);

    // 5. Rapid abandonment sequence
    await page.goBack(); // Back button
    await page.waitForTimeout(100);
    await page.locator('[data-testid="checkout-button"]').click(); // Try again
    await page.waitForTimeout(100);
    await page.goBack(); // Back again
    await page.waitForTimeout(100);
    await page.locator('[data-testid="checkout-button"]').click(); // Try again
    await page.waitForTimeout(1000);

    // 6. Verify no additional reservations were created
    const reservedAfterSequence = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterSequence).toBe(reservedAfterCheckout); // Same amount

    // 7. Advance time past expiration
    mockTime.advance(4000);
    await page.waitForTimeout(500);

    // 8. Verify stock was released once
    const reservedAfterExpiration = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterExpiration).toBe(0);

    // 9. Verify stock is back to original
    const finalStock = await getProductStock(TEST_PRODUCTS.ITEM_1);
    expect(finalStock).toBe(initialStock);
  });

  test('background job cleanup works correctly', async ({ page }) => {
    // This test verifies the background job script works
    // 1. Create an expired reservation directly
    const expiresAt = new Date(Date.now() - 4000); // 4 seconds ago
    await createTestReservation(TEST_PRODUCTS.ITEM_1, 2, expiresAt);

    // 2. Verify stock is reserved
    const reservedBeforeCleanup = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedBeforeCleanup).toBe(2);

    // 3. Run background job script using child_process
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Set test environment variable
    process.env.NODE_ENV = 'test';

    await execAsync('node scripts/clean-expired-reservations.mjs');

    // 4. Verify stock was released
    const reservedAfterCleanup = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterCleanup).toBe(0);
  });
});
