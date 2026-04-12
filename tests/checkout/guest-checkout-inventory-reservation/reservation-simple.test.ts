import { test, expect } from '@playwright/test';
import Redis from 'ioredis';
import { createClient } from '@sanity/client';

// Sanity client with write permissions
const sanityClient = createClient({
  projectId: '2tdmkpky',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-11-26',
  token: 'sk61ZIXXfNUGrOMp9w0sDDZ3bB57Jor7EIXbW67YMp4VV2mj1Y1SQhQolqMabQSWF3C5v8aYTtjhn8JG14RXpk5mm7JlHdlyMOfyjwr7VvasgJtYzzb5JS3KHtk3syitfUjYq1JmtlgdzTpcUiaFfdCPVWcDQIUb5iEnQ11wRJzlU4K2yXRH'
});

test.describe('Reservation API - Simple Integration Test', () => {
  let redis: Redis;
  let initialStock: number;
  const productId = "YcMKSEyusPBTcaoe1xiP1b"; // Test Product Alpha

  test.beforeAll(async () => {
    // Connect to Redis
    redis = new Redis({
      host: 'localhost',
      port: 6379,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });

    await redis.ping();
    console.log('Redis connected for simple test');

    // Store initial stock
    const product = await sanityClient.fetch(
      `*[_id == $productId]{stock}[0]`,
      { productId }
    );
    initialStock = product?.stock || 5;
  });

  test.beforeEach(async () => {
    // Clear Redis
    await redis.flushdb();
    
    // Reset stock
    await sanityClient.patch(productId).set({ stock: initialStock }).commit();
  });

  test.afterAll(async () => {
    // Restore stock
    await sanityClient.patch(productId).set({ stock: initialStock }).commit();
    await redis.flushdb();
    await redis.quit();
  });

  test('POST /api/checkout/reserve - Basic reservation works', async ({ request }) => {
    const idempotencyKey = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const reserveRequest = {
      clientBasket: {
        products: [
          {
            id: productId,
            quantity: 1,
            stripePriceId: "price_1TLPiKEQ2a2vW56gjYdhtw9g"
          }
        ],
        currency: 'PLN'
      }
    };

    const response = await request.post('/api/checkout/reserve', {
      data: reserveRequest,
      headers: {
        'Idempotency-Key': idempotencyKey,
        'Content-Type': 'application/json'
      }
    });

    // Verify response
    expect(response.status()).toBe(202);
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.status).toBe('processing');
    expect(result.data.reservationToken).toBeDefined();
    expect(result.data.reservedBasket).toBeDefined();
    expect(result.data.expiresAt).toBeDefined();

    // Verify stock was decremented
    const updatedStock = await sanityClient.fetch(
      `*[_id == $productId]{stock}[0]`,
      { productId }
    );
    expect(updatedStock.stock).toBe(initialStock - 1);

    // Verify Redis reservation exists
    const reservationToken = await redis.get(`reservation:${result.data.reservationToken}`);
    expect(reservationToken).toBeTruthy();

    console.log('Test passed: Basic reservation works');
  });

  test('Idempotency - Same request returns cached response', async ({ request }) => {
    const idempotencyKey = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const reserveRequest = {
      clientBasket: {
        products: [
          {
            id: productId,
            quantity: 1,
            stripePriceId: "price_1TLPiKEQ2a2vW56gjYdhtw9g"
          }
        ],
        currency: 'PLN'
      }
    };

    // First request
    const response1 = await request.post('/api/checkout/reserve', {
      data: reserveRequest,
      headers: {
        'Idempotency-Key': idempotencyKey,
        'Content-Type': 'application/json'
      }
    });

    expect(response1.status()).toBe(202);
    const result1 = await response1.json();
    expect(result1.success).toBe(true);

    // Second request with same idempotency key
    const response2 = await request.post('/api/checkout/reserve', {
      data: reserveRequest,
      headers: {
        'Idempotency-Key': idempotencyKey,
        'Content-Type': 'application/json'
      }
    });

    expect(response2.status()).toBe(200); // Cached response
    const result2 = await response2.json();
    expect(result2.success).toBe(true);
    expect(result2.status).toBe('completed');

    // Should return the same reservation token
    expect(result1.data.reservationToken).toBe(result2.data.reservationToken);

    // Verify only one stock decrement
    const updatedStock = await sanityClient.fetch(
      `*[_id == $productId]{stock}[0]`,
      { productId }
    );
    expect(updatedStock.stock).toBe(initialStock - 1); // Only decremented once

    console.log('Test passed: Idempotency works');
  });
});
