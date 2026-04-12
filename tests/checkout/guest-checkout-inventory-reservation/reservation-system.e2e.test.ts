import { test, expect } from '@playwright/test';
import Redis from 'ioredis';
import { getTestProducts, resetProductStock, getProductStock } from '../../helpers/test-data';

// Test data from verification script
const TEST_PRODUCTS = [
  {
    _id: "YcMKSEyusPBTcaoe1xiP1b",
    name: "Test Product Alpha - Full Stock",
    stock: 5,
    stripePriceId: "price_1TLPiKEQ2a2vW56gjYdhtw9g",
    displayPrice: 10000
  },
  {
    _id: "MHd9dKrYZDArdj3morESVD",
    name: "Test Product Beta - Limited Stock",
    stock: 2,
    stripePriceId: "price_1TLPiKEQ2a2vW56gjYdhtw9g",
    displayPrice: 20000
  },
  {
    _id: "MHd9dKrYZDArdj3morESpg",
    name: "Test Product Gamma - Out of Stock",
    stock: 0,
    stripePriceId: "price_1TLPiKEQ2a2vW56gjYdhtw9g",
    displayPrice: 30000
  }
];

// Sanity client for test data management
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: '2tdmkpky',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-11-26',
  token: 'sk61ZIXXfNUGrOMp9w0sDDZ3bB57Jor7EIXbW67YMp4VV2mj1Y1SQhQolqMabQSWF3C5v8aYTtjhn8JG14RXpk5mm7JlHdlyMOfyjwr7VvasgJtYzzb5JS3KHtk3syitfUjYq1JmtlgdzTpcUiaFfdCPVWcDQIUb5iEnQ11wRJzlU4K2yXRH'
});

test.describe('Guest Checkout Reservation System - Real Integration', () => {
  let redis: Redis;
  let initialStock: Map<string, number>;

  test.beforeAll(async () => {
    // Connect to test Redis instance
    redis = new Redis({
      host: 'localhost',
      port: 6379,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });

    // Verify Redis is running
    await redis.ping();
    console.log('Redis connected for tests');

    // Store initial stock for cleanup
    initialStock = new Map();
    for (const product of TEST_PRODUCTS) {
      const currentProduct = await sanityClient.fetch(
        `*[_id == $productId]{stock}[0]`,
        { productId: product._id }
      );
      initialStock.set(product._id, currentProduct?.stock || product.stock);
    }
  });

  test.beforeEach(async () => {
    // Clear Redis before each test
    await redis.flushdb();

    // Reset stock to initial state
    for (const [productId, stock] of initialStock) {
      await sanityClient.patch(productId).set({ stock }).commit();
    }
  });

  test.afterAll(async () => {
    // Restore stock to initial state
    for (const [productId, stock] of initialStock) {
      await sanityClient.patch(productId).set({ stock }).commit();
    }

    // Clean up Redis
    await redis.flushdb();
    await redis.quit();
  });

  test('Full Availability Flow - User can reserve items with sufficient stock', async ({ page }) => {
    // Navigate to basket page
    await page.goto('/basket');

    // Add 2 items of Product Alpha (stock=5) to basket
    await page.evaluate((products) => {
      // Use the basket store to add items
      const { useBasketStore } = window;
      const store = useBasketStore();

      const product = products.find(p => p._id === "YcMKSEyusPBTcaoe1xiP1b");
      if (product) {
        store.addItem({
          ...product,
          quantity: 2,
          slug: product.slug?.current || product.slug
        });
      }
    }, TEST_PRODUCTS);

    // Wait for basket to update
    await page.waitForTimeout(500);

    // Click checkout button
    await page.click('[data-testid="checkout-button"]');

    // Verify checkout button becomes disabled during processing
    await expect(page.locator('[data-testid="checkout-button"]')).toBeDisabled();

    // Should navigate to address page
    await page.waitForURL('**/checkout/address**');
    await expect(page.locator('h2')).toContainText('Shipping Address');

    // Fill address form
    await page.fill('input#street', '123 Test Street');
    await page.fill('input#city', 'Test City');
    await page.fill('input#postalCode', '12345');
    await page.fill('input#country', 'Test Country');

    // Submit address
    await page.click('button[type="submit"]');

    // Verify processing state
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
    await expect(page.locator('text=Processing...')).toBeVisible();

    // Should navigate to payment page on success
    await page.waitForURL('**/checkout/payment**', { timeout: 10000 });

    // Verify stock was decremented in Sanity
    const updatedProduct = await sanityClient.fetch(
      `*[_id == $productId]{stock}[0]`,
      { productId: "YcMKSEyusPBTcaoe1xiP1b" }
    );
    expect(updatedProduct.stock).toBe(3); // 5 - 2

    // Verify Redis reservation was created
    const reservations = await redis.hgetall('reservations');
    expect(Object.keys(reservations)).toHaveLength(1);

    // Verify guest session exists
    const sessions = await redis.keys('guest_session:*');
    expect(sessions).toHaveLength(1);
  });

  test('Stock Decrement Scenario - User sees revised basket when stock is insufficient', async ({ page }) => {
    // Navigate to basket page
    await page.goto('/basket');

    // Add 3 items of Product Beta (stock=2) to basket
    await page.evaluate((products) => {
      const { useBasketStore } = window;
      const store = useBasketStore();

      const product = products.find(p => p._id === "MHd9dKrYZDArdj3morESVD");
      if (product) {
        store.addItem({
          ...product,
          quantity: 3,
          slug: product.slug?.current || product.slug
        });
      }
    }, TEST_PRODUCTS);

    // Click checkout button
    await page.click('[data-testid="checkout-button"]');

    // Navigate to address page
    await page.waitForURL('**/checkout/address**');

    // Fill and submit address
    await page.fill('input#street', '123 Test Street');
    await page.fill('input#city', 'Test City');
    await page.fill('input#postalCode', '12345');
    await page.fill('input#country', 'Test Country');
    await page.click('button[type="submit"]');

    // Should stay on address page and show stock decrement message
    await expect(page.locator('text=We\'ve had to revise your basket')).toBeVisible({ timeout: 10000 });

    // Verify "Approve & Proceed" and "Cancel" buttons are visible
    await expect(page.locator('text=Approve & Proceed')).toBeVisible();
    await expect(page.locator('text=Cancel')).toBeVisible();

    // Verify stock is fully reserved (0 remaining)
    const updatedProduct = await sanityClient.fetch(
      `*[_id == $productId]{stock}[0]`,
      { productId: "MHd9dKrYZDArdj3morESVD" }
    );
    expect(updatedProduct.stock).toBe(0); // All 2 items reserved
  });

  test('Out of Stock Scenario - User sees out of stock message when no items available', async ({ page }) => {
    // Navigate to basket page
    await page.goto('/basket');

    // Add 1 item of Product Gamma (stock=0) to basket
    await page.evaluate((products) => {
      const { useBasketStore } = window;
      const store = useBasketStore();

      const product = products.find(p => p._id === "MHd9dKrYZDArdj3morESpg");
      if (product) {
        store.addItem({
          ...product,
          quantity: 1,
          slug: product.slug?.current || product.slug
        });
      }
    }, TEST_PRODUCTS);

    // Click checkout button
    await page.click('[data-testid="checkout-button"]');

    // Navigate to address page
    await page.waitForURL('**/checkout/address**');

    // Fill and submit address
    await page.fill('input#street', '123 Test Street');
    await page.fill('input#city', 'Test City');
    await page.fill('input#postalCode', '12345');
    await page.fill('input#country', 'Test Country');
    await page.click('button[type="submit"]');

    // Should show out of stock message
    await expect(page.locator('text=out of stock')).toBeVisible({ timeout: 10000 });

    // Verify no proceed button appears
    await expect(page.locator('text=Approve & Proceed')).not.toBeVisible();

    // Verify reservation amount is 0
    const sessions = await redis.keys('guest_session:*');
    if (sessions.length > 0) {
      const sessionData = await redis.get(sessions[0]);
      const session = JSON.parse(sessionData);
      expect(session.amountPln).toBe(0);
    }
  });

  test('Cancel and Rollback - User can cancel reservation and stock is restored', async ({ page }) => {
    // Navigate to basket page
    await page.goto('/basket');

    // Add 1 item of Product Alpha to basket
    await page.evaluate((products) => {
      const { useBasketStore } = window;
      const store = useBasketStore();

      const product = products.find(p => p._id === "YcMKSEyusPBTcaoe1xiP1b");
      if (product) {
        store.addItem({
          ...product,
          quantity: 1,
          slug: product.slug?.current || product.slug
        });
      }
    }, TEST_PRODUCTS);

    // Click checkout and submit address
    await page.click('[data-testid="checkout-button"]');
    await page.waitForURL('**/checkout/address**');

    await page.fill('input#street', '123 Test Street');
    await page.fill('input#city', 'Test City');
    await page.fill('input#postalCode', '12345');
    await page.fill('input#country', 'Test Country');
    await page.click('button[type="submit"]');

    // Wait for reservation to be created
    await page.waitForTimeout(2000);

    // Click cancel button
    await page.click('text=Cancel');

    // Should return to basket page
    await page.waitForURL('**/basket**');

    // Verify stock was restored
    const updatedProduct = await sanityClient.fetch(
      `*[_id == $productId]{stock}[0]`,
      { productId: "YcMKSEyusPBTcaoe1xiP1b" }
    );
    expect(updatedProduct.stock).toBe(5); // Restored to initial

    // Verify Redis reservation cleaned up
    const reservations = await redis.hgetall('reservations');
    expect(Object.keys(reservations)).toHaveLength(0);

    // Verify guest session cleaned up
    const sessions = await redis.keys('guest_session:*');
    expect(sessions).toHaveLength(0);
  });

  test('Idempotency Check - Duplicate requests return same reservation', async ({ page }) => {
    // This test verifies the idempotency key functionality
    // We'll need to intercept the request to send it twice

    let reservationId: string | null = null;

    // Intercept reserveStock API call
    await page.route('**/reserveStock', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      // The idempotency key is included in the request
      // const idempotencyKey = postData.idempotencyKey;

      // Let the first request through
      if (!reservationId) {
        const response = await route.fetch();
        const responseData = await response.json();

        if (responseData.success) {
          reservationId = responseData.reservationId;
        }

        // Clone and send the response
        await route.fulfill({
          status: response.status(),
          headers: response.headers(),
          body: JSON.stringify(responseData)
        });
      } else {
        // Second request with same idempotency key
        // Should return cached response
        const response = await route.fetch();
        const responseData = await response.json();

        // Verify it returns the same reservation
        expect(responseData.reservationId).toBe(reservationId);

        await route.fulfill({
          status: response.status(),
          headers: response.headers(),
          body: JSON.stringify(responseData)
        });
      }
    });

    // Navigate and create reservation
    await page.goto('/basket');

    await page.evaluate((products) => {
      const { useBasketStore } = window;
      const store = useBasketStore();

      const product = products.find(p => p._id === "YcMKSEyusPBTcaoe1xiP1b");
      if (product) {
        store.addItem({
          ...product,
          quantity: 1,
          slug: product.slug?.current || product.slug
        });
      }
    }, TEST_PRODUCTS);

    await page.click('[data-testid="checkout-button"]');
    await page.waitForURL('**/checkout/address**');

    await page.fill('input#street', '123 Test Street');
    await page.fill('input#city', 'Test City');
    await page.fill('input#postalCode', '12345');
    await page.fill('input#country', 'Test Country');

    // Submit twice (the second will be intercepted)
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    await page.click('button[type="submit"]');

    // Verify only one reservation was created
    expect(reservationId).toBeTruthy();

    const reservations = await redis.hgetall('reservations');
    expect(Object.keys(reservations)).toHaveLength(1);
  });
});
