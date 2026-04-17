// Test Helpers for Zero-Mock Checkout Integration Test
// Provides utilities for Redis, Sanity, and queue state verification

import { getRedisClient } from '@/lib/checkout/reservation/redis-client'
import { client, writeClient } from '@/sanity/lib/client'
import { isTestEnvConfigured, getSanityToken } from '../config'

/**
 * Verify test environment is properly configured
 */
export function verifyTestEnv(): { ok: boolean; error?: string } {
  if (!isTestEnvConfigured()) {
    const hasToken = !!getSanityToken()
    const hasRedis = !!process.env.REDIS_HOST || !!process.env.TEST_REDIS_HOST

    let error = 'Test environment not configured:\n'
    if (!hasToken) error += '- SANITY_API_TOKEN not set\n'
    if (!hasRedis) error += '- Redis connection not configured\n'
    error += '\nTo fix:\n'
    error += '1. Copy .env.test to .env.local and fill in values\n'
    error += '2. Start Redis: docker-compose -f docker-compose.test.yml up -d\n'

    return { ok: false, error }
  }
  return { ok: true }
}

// Test product configuration
// Matches Sanity schema: name, slug, brand, stripePriceId, displayPrice, stock, reservedStock, sku, image, catalogueLocationKeys
export const TEST_PRODUCTS = [
  {
    _id: 'test-product-1',
    _type: 'product',
    name: 'Test Product 1',
    slug: {
      _type: 'slug',
      current: 'test-product-1'
    },
    stock: 10,
    reservedStock: 0,
    stripePriceId: 'price_test_1',
    displayPrice: 100,
    brand: {
      _type: 'reference',
      _ref: 'test-brand'
    },
    // Required fields per schema:
    sku: 'TEST-SKU-001',
    catalogueLocationKeys: ['featured'],
    image: { _type: 'image' }  // Minimal image structure
  },
  {
    _id: 'test-product-2',
    _type: 'product',
    name: 'Test Product 2',
    slug: {
      _type: 'slug',
      current: 'test-product-2'
    },
    stock: 5,
    reservedStock: 0,
    stripePriceId: 'price_test_2',
    displayPrice: 75,
    brand: {
      _type: 'reference',
      _ref: 'test-brand'
    },
    // Required fields per schema:
    sku: 'TEST-SKU-002',
    catalogueLocationKeys: ['featured'],
    image: { _type: 'image' }  // Minimal image structure
  }
]

// Test brand and category references
export const TEST_REFERENCES = {
  brand: {
    _id: 'test-brand',
    _type: 'brand',
    name: 'Test Brand',
    slug: {
      _type: 'slug',
      current: 'test-brand'
    }
  },
  category: {
    _id: 'test-category',
    _type: 'category',
    name: 'Test Category',
    slug: {
      _type: 'slug',
      current: 'test-category'
    }
  }
}

/**
 * Create test products in Sanity
 */
export async function createTestProducts(): Promise<void> {
  try {
    // Create brand and category first
    await writeClient.createIfNotExists(TEST_REFERENCES.brand)
    await writeClient.createIfNotExists(TEST_REFERENCES.category)

    // Create test products
    for (const product of TEST_PRODUCTS) {
      await writeClient.createIfNotExists(product)
    }

    console.log('Test products created in Sanity')
  } catch (error) {
    console.error('Failed to create test products:', error)
    throw error
  }
}

/**
 * Clean up test products from Sanity
 */
export async function cleanupTestProducts(): Promise<void> {
  try {
    // Delete test products
    for (const product of TEST_PRODUCTS) {
      await writeClient.delete(product._id)
    }

    // Delete references
    await writeClient.delete(TEST_REFERENCES.brand._id)
    await writeClient.delete(TEST_REFERENCES.category._id)

    console.log('Test products cleaned up from Sanity')
  } catch (error) {
    console.error('Failed to cleanup test products:', error)
    // Don't throw error here to allow test cleanup to continue
  }
}

/**
 * Get Redis queue state
 */
export async function getRedisQueueState(): Promise<{
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
}> {
  const redis = getRedisClient()

  // Get BullMQ queue stats using llen (list length)
  const waiting = await redis.llen('bull:queue-reservations:waiting')
  const active = await redis.llen('bull:queue-reservations:active')
  const completed = await redis.llen('bull:queue-reservations:completed')
  const failed = await redis.llen('bull:queue-reservations:failed')
  const delayed = await redis.llen('bull:queue-reservations:delayed')

  return { waiting, active, completed, failed, delayed }
}

/**
 * Verify Sanity stock updates
 */
export async function verifySanityStock(
  productId: string,
  expectedReserved: number,
  expectedStock?: number
): Promise<boolean> {
  try {
    const product = await client.fetch(
      `*[_id == $productId][0]{stock, reservedStock}`,
      { productId }
    )

    if (!product) {
      console.error(`Product ${productId} not found in Sanity`)
      return false
    }

    const reservedMatch = product.reservedStock === expectedReserved
    const stockMatch = expectedStock !== undefined ? product.stock === expectedStock : true

    console.log(`Stock verification for ${productId}:`, {
      expected: { reservedStock: expectedReserved, stock: expectedStock },
      actual: { reservedStock: product.reservedStock, stock: product.stock },
      matches: { reservedMatch, stockMatch }
    })

    return reservedMatch && stockMatch
  } catch (error) {
    console.error('Failed to verify Sanity stock:', error)
    return false
  }
}

/**
 * Wait for stock update in Sanity with polling
 */
export async function waitForStockUpdate(
  productId: string,
  expectedReserved: number,
  timeout = 5000,
  checkInterval = 500
): Promise<boolean> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const updated = await verifySanityStock(productId, expectedReserved)
    if (updated) {
      console.log(`Stock updated for ${productId}: reservedStock=${expectedReserved}`)
      return true
    }
    await new Promise(resolve => setTimeout(resolve, checkInterval))
  }

  console.error(`Stock update timeout for ${productId}`)
  return false
}

/**
 * Wait for queue processing to complete
 */
export async function waitForQueueProcessing(
  timeout = 5000,
  checkInterval = 100
): Promise<void> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const state = await getRedisQueueState()

    if (state.waiting === 0 && state.active === 0) {
      console.log('Queue processing completed')
      return
    }

    console.log(`Queue state: waiting=${state.waiting}, active=${state.active}`)
    await new Promise(resolve => setTimeout(resolve, checkInterval))
  }

  throw new Error(`Queue processing timeout after ${timeout}ms`)
}

/**
 * Check if Redis is available
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const { checkRedisHealth: redisHealthCheck } = await import('@/lib/checkout/reservation/redis-client')
    const { healthy } = await redisHealthCheck()
    return healthy
  } catch (error) {
    console.error('Redis health check failed:', error)
    return false
  }
}

/**
 * Clear Redis test database
 */
export async function clearRedisTestDb(): Promise<void> {
  const redis = getRedisClient()
  await redis.flushdb()
  console.log('Redis test database cleared')
}

/**
 * Get idempotency cache value
 */
export async function getIdempotencyCache(idempotencyKey: string): Promise<{requestFingerprint: string; response: unknown; timestamp: string} | null> {
  const redis = getRedisClient()
  const cacheKey = `idempotency:${idempotencyKey}`
  const cached = await redis.get(cacheKey)
  return cached ? JSON.parse(cached) : null
}

/**
 * Get reservation state from Redis
 */
export async function getReservationState(reservationId: string): Promise<{state: string; data: unknown} | null> {
  const redis = getRedisClient()
  const reservationKey = `reservation:${reservationId}`
  const state = await redis.get(reservationKey)
  return state ? JSON.parse(state) : null
}

/**
 * Verify bus stop trace logs
 */
export interface BusStopTrace {
  stop: number
  name: string
  expected: string
  actual?: string
  status: 'PASS' | 'FAIL' | 'PENDING'
}

export function createBusStopTrace(
  stop: number,
  name: string,
  expected: string
): BusStopTrace {
  return {
    stop,
    name,
    expected,
    status: 'PENDING'
  }
}

/**
 * Capture fetch calls for testing while allowing real API calls
 */
export function captureFetchCalls() {
  const calls: Array<{
    url: string
    options: RequestInit
  }> = []

  const originalFetch = global.fetch

  // Intercept fetch to capture calls but still make real requests
  global.fetch = vi.fn(async (url: string, options?: RequestInit) => {
    // Capture the call
    calls.push({ url, options: options || {} })

    // Debug logging
    console.log('TRACE: fetch intercepted', { url, method: options?.method })

    // Make the real API call
    try {
      const response = await originalFetch(url, options)
      console.log('TRACE: real fetch response', { status: response.status, ok: response.ok })
      return response
    } catch (error) {
      console.log('TRACE: real fetch failed', { error })
      // Re-throw to fail test - no mocking allowed
      throw error
    }
  }) as ReturnType<typeof vi.fn>

  return {
    calls,
    restore: () => {
      global.fetch = originalFetch
    }
  }
}

/**
 * Wait for reservation to complete and be queryable
 */
export async function waitForReservationComplete(
  reservationId: string,
  timeout = 10000,
  checkInterval = 200
): Promise<boolean> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const state = await getReservationState(reservationId)

    if (state && state.state === 'active') {
      console.log(`Reservation ${reservationId} completed`)
      return true
    }

    await new Promise(resolve => setTimeout(resolve, checkInterval))
  }

  throw new Error(`Reservation completion timeout after ${timeout}ms`)
}

/**
 * Create reservation via direct API call
 */
export async function createReservationViaApi(
  basket: typeof TEST_BASKET,
  idempotencyKey: string
): Promise<Response> {
  const requestPayload = {
    clientBasket: {
      products: basket.map(item => ({
        id: item._id,
        stripePriceId: item.stripePriceId,
        quantity: item.quantity,
      })),
      totalAmount: basket.reduce((sum, item) => sum + item.displayPrice * item.quantity, 0),
      currency: 'PLN',
    },
  }

  return fetch('/api/checkout/reserve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(requestPayload),
  })
}

/**
 * Test basket configuration
 */
export const TEST_BASKET = [
  {
    _id: 'test-product-1',
    name: 'Test Product 1',
    quantity: 2,
    displayPrice: 100,
    stripePriceId: 'price_test_1',
    image: '/test1.jpg',
    slug: 'test-product-1'
  },
  {
    _id: 'test-product-2',
    name: 'Test Product 2',
    quantity: 1,
    displayPrice: 75,
    stripePriceId: 'price_test_2',
    image: '/test2.jpg',
    slug: 'test-product-2'
  }
]
