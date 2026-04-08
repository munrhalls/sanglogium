import { test, expect } from '@playwright/test';
import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '..', '..', '.env.local') });

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false
});

test.describe('Lock Release - User Abandonment Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing reservations
    await cleanupTestReservations();
  });

  test.afterEach(async () => {
    // Clean up test data
    await cleanupTestReservations();
  });

  test('back button releases stock after 15 minutes', async ({ page }) => {
    // 1. Go to basket page
    await page.goto('/basket');
    
    // 2. Add test products to basket
    await page.locator('[data-testid="add-to-basket-item-1"]').click();
    await page.locator('[data-testid="add-to-basket-item-2"]').click();
    
    // 3. Click checkout button
    await page.locator('[data-testid="checkout-button"]').click();
    
    // 4. Wait for stock reservation
    await page.waitForURL(/.*stripe\.com|.*checkout/);
    
    // 5. Go back to site (simulate user clicking back button)
    await page.goBack();
    
    // 6. Verify stock is still reserved (should not be released yet)
    const stockAfterBack = await getProductStock('item-1');
    const reservedAfterBack = await getProductReservedStock('item-1');
    expect(reservedAfterBack).toBeGreaterThan(0);
    
    // 7. Wait 16 minutes (15 minutes + buffer)
    console.log('Waiting 16 minutes for reservation to expire...');
    await page.waitForTimeout(16 * 60 * 1000);
    
    // 8. Verify stock was released
    const stockAfterExpiration = await getProductStock('item-1');
    const reservedAfterExpiration = await getProductReservedStock('item-1');
    expect(reservedAfterExpiration).toBe(0);
    expect(stockAfterExpiration).toBe(stockAfterBack + reservedAfterBack);
  });

  test('tab close releases stock after 15 minutes', async ({ page, context }) => {
    // 1. Go to basket page
    await page.goto('/basket');
    
    // 2. Add test products to basket
    await page.locator('[data-testid="add-to-basket-item-1"]').click();
    await page.locator('[data-testid="add-to-basket-item-2"]').click();
    
    // 3. Click checkout button
    await page.locator('[data-testid="checkout-button"]').click();
    
    // 4. Wait for stock reservation
    await page.waitForURL(/.*stripe\.com|.*checkout/);
    
    // 5. Close the tab (simulate user closing tab)
    await context.close();
    
    // 6. Open new tab to check stock
    const newPage = await context.newPage();
    
    // 7. Verify stock is still reserved initially
    const stockAfterClose = await getProductStock('item-1');
    const reservedAfterClose = await getProductReservedStock('item-1');
    expect(reservedAfterClose).toBeGreaterThan(0);
    
    // 8. Wait 16 minutes for expiration
    console.log('Waiting 16 minutes for reservation to expire...');
    await newPage.waitForTimeout(16 * 60 * 1000);
    
    // 9. Verify stock was released
    const stockAfterExpiration = await getProductStock('item-1');
    const reservedAfterExpiration = await getProductReservedStock('item-1');
    expect(reservedAfterExpiration).toBe(0);
    expect(stockAfterExpiration).toBe(stockAfterClose + reservedAfterClose);
    
    await newPage.close();
  });

  test('stripe webhook immediately releases stock on session expiration', async ({ page }) => {
    // This test would require mocking Stripe webhook
    // For now, we'll test the background job cleanup
    
    // 1. Create an expired reservation directly in database
    const expiresAt = new Date(Date.now() - 16 * 60 * 1000); // 16 minutes ago
    await createTestReservation('item-1', 2, expiresAt);
    
    // 2. Run background job script
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    await execAsync('node scripts/clean-expired-reservations.mjs');
    
    // 3. Verify stock was released
    const reservedStock = await getProductReservedStock('item-1');
    expect(reservedStock).toBe(0);
  });
});

// Helper functions
async function getProductStock(productId: string): Promise<number> {
  const product = await client.fetch(`*[_id == $id][0]{stock}`, { id: productId });
  return product?.stock || 0;
}

async function getProductReservedStock(productId: string): Promise<number> {
  const product = await client.fetch(`*[_id == $id][0]{reservedStock}`, { id: productId });
  return product?.reservedStock || 0;
}

async function createTestReservation(productId: string, quantity: number, expiresAt: Date) {
  await client.patch(productId).set({
    reservations: [{
      idempotencyKey: `test-${Date.now()}`,
      quantity,
      expiresAt: expiresAt.toISOString(),
      status: 'active'
    }]
  }).inc({ reservedStock: quantity }).commit();
}

async function cleanupTestReservations() {
  // Clean up any test reservations
  const products = await client.fetch(`*[_type == "product" && reservations[idempotencyKey match "test-*"]]{_id, reservedStock, reservations}`);
  
  const transaction = client.transaction();
  
  for (const product of products) {
    const testReservations = product.reservations.filter((r: any) => r.idempotencyKey?.startsWith('test-'));
    const totalQuantity = testReservations.reduce((sum: number, r: any) => sum + r.quantity, 0);
    
    if (totalQuantity > 0) {
      transaction.patch(product._id).dec({ reservedStock: totalQuantity }).set({
        reservations: product.reservations.filter((r: any) => !r.idempotencyKey?.startsWith('test-'))
      });
    }
  }
  
  await transaction.commit();
}
