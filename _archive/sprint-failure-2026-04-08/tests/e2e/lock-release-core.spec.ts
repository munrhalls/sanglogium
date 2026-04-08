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

test.describe('Lock Release - Core Logic Tests', () => {
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

  test('reservation expires after 3 seconds', async ({ page }) => {
    // 1. Get initial stock state
    const initialStock = await getProductStock(TEST_PRODUCTS.ITEM_1);
    const initialReserved = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(initialReserved).toBe(0);

    // 2. Create an already expired reservation (bypass UI)
    const expiresAt = new Date(Date.now() - 4000); // 4 seconds ago (already expired)
    await createTestReservation(TEST_PRODUCTS.ITEM_1, 2, expiresAt);

    // 3. Verify stock is reserved
    const reservedAfterCreation = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    const reservations = await getProductReservations(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterCreation).toBe(2);

    // 4. Run background job to clean up
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    process.env.NODE_ENV = 'test';
    await execAsync('node scripts/clean-expired-reservations.mjs');

    // 5. Verify stock was released
    const reservedAfterExpiration = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    const reservationsAfter = await getProductReservations(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterExpiration).toBe(0);

    // 6. Verify stock is back to original
    const finalStock = await getProductStock(TEST_PRODUCTS.ITEM_1);
    expect(finalStock).toBe(initialStock);
  });

  test('multiple reservations tracked separately', async ({ page }) => {
    // 1. Create reservations for two different products
    // One expired, one still active
    const expiresAt1 = new Date(Date.now() - 4000); // 4 seconds ago (expired)
    const expiresAt2 = new Date(Date.now() + 6000); // 6 seconds from now (active)

    await createTestReservation(TEST_PRODUCTS.ITEM_1, 2, expiresAt1);
    await createTestReservation(TEST_PRODUCTS.ITEM_2, 1, expiresAt2);

    // 2. Verify both reservations exist
    const reserved1 = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    const reserved2 = await getProductReservedStock(TEST_PRODUCTS.ITEM_2);
    expect(reserved1).toBe(2);
    expect(reserved2).toBe(1);

    // 3. Run cleanup (only expired reservations should be cleaned)
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    process.env.NODE_ENV = 'test';
    await execAsync('node scripts/clean-expired-reservations.mjs');

    // 4. Verify first reservation expired, second still active
    const reserved1After = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    const reserved2After = await getProductReservedStock(TEST_PRODUCTS.ITEM_2);
    expect(reserved1After).toBe(0); // Expired and cleaned
    expect(reserved2After).toBe(1); // Still active
  });

  test('background job cleanup works correctly', async ({ page }) => {
    // 1. Create an expired reservation directly
    const expiresAt = new Date(Date.now() - 4000); // 4 seconds ago
    await createTestReservation(TEST_PRODUCTS.ITEM_1, 2, expiresAt);

    // 2. Verify stock is reserved
    const reservedBeforeCleanup = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedBeforeCleanup).toBe(2);

    // 3. Run background job script
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    process.env.NODE_ENV = 'test';
    await execAsync('node scripts/clean-expired-reservations.mjs');

    // 4. Verify stock was released
    const reservedAfterCleanup = await getProductReservedStock(TEST_PRODUCTS.ITEM_1);
    expect(reservedAfterCleanup).toBe(0);
  });
});
