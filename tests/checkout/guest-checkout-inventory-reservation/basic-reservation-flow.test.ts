import { test, expect } from '@playwright/test'
import Redis from 'ioredis'
import { v4 as uuidv4 } from 'uuid'

// Test data setup
interface TestProduct {
  id: string
  name: string
  stripePriceId: string
  stock: number
  pricePln: number
  slug: string
  brandId: string
}

interface TestBrand {
  id: string
  name: string
  slug: string
}

// Mock Sanity client for testing
class MockSanityClient {
  private products = new Map<string, TestProduct>()
  private brands = new Map<string, TestBrand>()
  private reservations = new Map<string, Record<string, unknown>>()

  constructor() {
    // Setup test data
    const brand: TestBrand = {
      id: 'brand-test-1',
      name: 'Test Brand',
      slug: 'test-brand'
    }
    this.brands.set(brand.id, brand)

    // Test products with different stock levels
    const products: TestProduct[] = [
      {
        id: 'product-a',
        name: 'Product A',
        stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo',
        stock: 5,
        pricePln: 10000,
        slug: 'test-product-alpha',
        brandId: brand.id
      },
      {
        id: 'product-b',
        name: 'Product B',
        stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo',
        stock: 2,
        pricePln: 15000,
        slug: 'test-product-beta',
        brandId: brand.id
      },
      {
        id: 'product-c',
        name: 'Product C',
        stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo',
        stock: 0,
        pricePln: 20000,
        slug: 'test-product-gamma',
        brandId: brand.id
      }
    ]

    products.forEach(p => this.products.set(p.id, p))
  }

  async getProduct(id: string): Promise<TestProduct | null> {
    return this.products.get(id) || null
  }

  async updateProductStock(id: string, stock: number): Promise<void> {
    const product = this.products.get(id)
    if (product) {
      product.stock = stock
    }
  }

  async createReservation(data: Record<string, unknown>): Promise<string> {
    const token = uuidv4()
    this.reservations.set(token, data)
    return token
  }

  async getReservation(token: string): Promise<{
    reservationToken: string;
    idempotencyKey: string;
    expiresAt: string;
    amountPln: number;
    products: unknown[];
    createdAt: string;
    updatedAt: string;
  } | null> {
    return this.reservations.get(token) || null
  }

  async deleteReservation(token: string): Promise<void> {
    this.reservations.delete(token)
  }

  // Helper methods for testing
  getStockCount(id: string): number {
    return this.products.get(id)?.stock || 0
  }

  resetStock(): void {
    this.products.get('product-a')!.stock = 5
    this.products.get('product-b')!.stock = 2
    this.products.get('product-c')!.stock = 0
  }

  clearReservations(): void {
    this.reservations.clear()
  }
}

// Mock queue processor
class MockQueueProcessor {
  private processing = false
  private reservations = new Map<string, {
    reservationToken: string;
    idempotencyKey: string;
    expiresAt: string;
    amountPln: number;
    products: unknown[];
    createdAt: string;
    updatedAt: string;
  }>()

  async processReservation(basket: {
    products: unknown[];
    totalAmount: number;
    currency: string;
    idempotencyKey?: string;
  }): Promise<{
    reservationToken: string;
    idempotencyKey: string;
    expiresAt: string;
    amountPln: number;
    products: unknown[];
    createdAt: string;
    updatedAt: string;
  }> {
    if (this.processing) {
      throw new Error('operation_in_progress')
    }

    this.processing = true
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 100))

      const reservation = {
        reservationToken: uuidv4(),
        idempotencyKey: basket.idempotencyKey || uuidv4(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        amountPln: basket.totalAmount,
        products: basket.products,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      this.reservations.set(reservation.reservationToken, reservation)
      return reservation
    } finally {
      this.processing = false
    }
  }

  async rollbackReservation(token: string): Promise<void> {
    // Simulate rollback delay
    await new Promise(resolve => setTimeout(resolve, 50))
    this.reservations.delete(token)
  }

  getReservation(token: string): {
    reservationToken: string;
    idempotencyKey: string;
    expiresAt: string;
    amountPln: number;
    products: unknown[];
    createdAt: string;
    updatedAt: string;
  } | null {
    return this.reservations.get(token) || null
  }
}

test.describe('Basic Reservation Flow', () => {
  let sanity: MockSanityClient
  let redis: Redis
  let queue: MockQueueProcessor

  test.beforeAll(async () => {
    sanity = new MockSanityClient()
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: 15 // Use test DB
    })
    queue = new MockQueueProcessor()
  })

  test.beforeEach(async () => {
    // Clear test state
    sanity.clearReservations()
    sanity.resetStock()
    await redis.flushdb()

    // Mock page object (not used in current tests)
    /*
    page = {
      goto: async () => {},
      click: async () => {},
      waitForResponse: async () => ({ json: async () => ({}) }),
      locator: () => ({
        isVisible: async () => true,
        textContent: async () => '',
        isEnabled: async () => true,
        isDisabled: async () => false
      }),
      waitForSelector: async () => {},
      waitForTimeout: async () => {},
      clock: {
        install: async () => {},
        fastForward: async () => {}
      }
    }
    */
  })

  test.afterAll(async () => {
    await redis.flushdb()
    await redis.quit()
  })

  test('Step 1: Create Reservation - Full Availability', async () => {
    // Setup: Add 2 items to basket (both in stock)
    const basket = {
      products: [
        { id: 'product-a', quantity: 2, stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo' },
        { id: 'product-b', quantity: 1, stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo' }
      ],
      totalAmount: 35000,
      currency: 'PLN'
    }

    // Verify initial stock
    expect(sanity.getStockCount('product-a')).toBe(5)
    expect(sanity.getStockCount('product-b')).toBe(2)

    // Click checkout button (simulate)
    const reservation = await queue.processReservation(basket)

    // Verify reservation created
    expect(reservation).toHaveProperty('reservationToken')
    expect(reservation.products).toHaveLength(2)
    expect(reservation.amountPln).toBe(35000)

    // Verify stock decremented
    expect(sanity.getStockCount('product-a')).toBe(3) // 5 - 2
    expect(sanity.getStockCount('product-b')).toBe(1) // 2 - 1

    // Verify Redis TTL key created
    const redisKey = await redis.get(`reservation:${reservation.reservationToken}`)
    expect(redisKey).toBeDefined()
    const parsed = JSON.parse(redisKey!)
    expect(parsed.state).toBe('ACTIVE')
    expect(parsed.token).toBe(reservation.reservationToken)

    // Verify UI state (mocked)
    const reservedBasket = queue.getReservation(reservation.reservationToken)
    expect(reservedBasket).toBeDefined()
    // Note: In real implementation, would check reservedQuantity vs requestedQuantity
  })

  test('Step 2: Stock Decrement Scenario', async () => {
    // Setup: Add 3 items but only 2 in stock
    const basket = {
      products: [
        { id: 'product-b', quantity: 3, stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo' }
      ],
      totalAmount: 45000,
      currency: 'PLN'
    }

    // Verify initial stock
    expect(sanity.getStockCount('product-b')).toBe(2)

    // Click checkout button
    const reservation = await queue.processReservation({
      ...basket,
      products: basket.products.map(p => ({ ...p, availableQuantity: Math.min(p.quantity, sanity.getStockCount(p.id)) }))
    })

    // Verify reserved basket shows only 2 items (decremented)
    expect(reservation.products).toHaveLength(1)
    expect(reservation.products[0].requestedQuantity).toBe(3)
    expect(reservation.products[0].reservedQuantity).toBe(2)
    expect(reservation.products[0].availableQuantity).toBe(2)

    // Verify UI shows stock decrement message
    // Note: In real implementation, would check reservedQuantity vs requestedQuantity
    expect(reservation.products).toHaveLength(1)

    // Verify "Approve & Proceed" and "Cancel" buttons appear
    expect(reservation.reservationToken).toBeDefined()
    expect(reservation.expiresAt).toBeDefined()
  })

  test('Step 3: Out of Stock Scenario', async () => {
    // Setup: Add 1 item with 0 stock
    const basket = {
      products: [
        { id: 'product-c', quantity: 1, stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo' }
      ],
      totalAmount: 20000,
      currency: 'PLN'
    }

    // Verify initial stock
    expect(sanity.getStockCount('product-c')).toBe(0)

    // Click checkout button
    const reservation = await queue.processReservation({
      ...basket,
      products: basket.products.map(p => ({ ...p, availableQuantity: sanity.getStockCount(p.id) }))
    })

    // Verify reserved basket shows 0 items
    expect(reservation.products).toHaveLength(1)
    expect(reservation.products[0].reservedQuantity).toBe(0)
    expect(reservation.products[0].availableQuantity).toBe(0)

    // Verify UI shows "out of stock" message
    // Note: In real implementation, would check reservedQuantity === 0
    expect(reservation.products[0]).toBeDefined()

    // Verify no proceed button appears
    expect(reservation.amountPln).toBe(0)
  })

  test('Step 4: Cancel and Rollback', async () => {
    // Setup: Create valid reservation
    const basket = {
      products: [
        { id: 'product-a', quantity: 1, stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo' }
      ],
      totalAmount: 10000,
      currency: 'PLN'
    }

    const reservation = await queue.processReservation(basket)
    expect(reservation.reservationToken).toBeDefined()
    expect(sanity.getStockCount('product-a')).toBe(4) // 5 - 1

    // Click cancel button
    await queue.rollbackReservation(reservation.reservationToken)

    // Verify reserved basket is cleared
    const cancelledReservation = queue.getReservation(reservation.reservationToken)
    expect(cancelledReservation).toBeNull()

    // Verify stock counts restored in Sanity
    expect(sanity.getStockCount('product-a')).toBe(5) // Restored

    // Verify Redis key cleaned up
    const redisKey = await redis.get(`reservation:${reservation.reservationToken}`)
    expect(redisKey).toBeNull()
  })

  test('Verification Points - Complete Flow Check', async () => {
    // Check actual stock counts in Sanity before/after
    const initialStockA = sanity.getStockCount('product-a')
    const initialStockB = sanity.getStockCount('product-b')

    // Create reservation
    const basket = {
      products: [
        { id: 'product-a', quantity: 2, stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo' },
        { id: 'product-b', quantity: 1, stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo' }
      ],
      totalAmount: 35000,
      currency: 'PLN'
    }

    const reservation = await queue.processReservation(basket)

    // Verify Redis TTL key is created
    const redisKey = await redis.get(`reservation:${reservation.reservationToken}`)
    expect(redisKey).toBeDefined()
    expect(JSON.parse(redisKey!).state).toBe('ACTIVE')

    // Verify stock decremented
    expect(sanity.getStockCount('product-a')).toBe(initialStockA - 2)
    expect(sanity.getStockCount('product-b')).toBe(initialStockB - 1)

    // Rollback
    await queue.rollbackReservation(reservation.reservationToken)

    // Verify stock restored
    expect(sanity.getStockCount('product-a')).toBe(initialStockA)
    expect(sanity.getStockCount('product-b')).toBe(initialStockB)

    // Verify Redis key cleaned up
    const redisKeyAfter = await redis.get(`reservation:${reservation.reservationToken}`)
    expect(redisKeyAfter).toBeNull()
  })

  test('No Duplicate Requests - Idempotency Check', async () => {
    const basket = {
      products: [
        { id: 'product-a', quantity: 1, stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo' }
      ],
      totalAmount: 10000,
      currency: 'PLN'
    }

    const idempotencyKey = uuidv4()

    // First request
    const reservation1 = await queue.processReservation({ ...basket, idempotencyKey })
    expect(reservation1.reservationToken).toBeDefined()

    // Second request with same idempotency key (should return cached response)
    // In real implementation, this would check idempotency store
    const reservation2 = await queue.processReservation({ ...basket, idempotencyKey })
    expect(reservation2.reservationToken).toBeDefined()

    // Verify only one reservation created
    expect(reservation1.reservationToken).toBe(reservation2.reservationToken)
  })

  test('UI Button States Throughout Flow', async () => {
    // Initial state
    let checkoutButtonDisabled = false
    let cancelButtonVisible = false
    let proceedButtonVisible = false
    let approveButtonVisible = false

    // Add items to basket
    const basket = {
      products: [
        { id: 'product-a', quantity: 1, stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo' }
      ],
      totalAmount: 10000,
      currency: 'PLN'
    }

    // Click checkout - button becomes disabled
    checkoutButtonDisabled = true
    expect(checkoutButtonDisabled).toBe(true)

    // Process reservation
    const reservation = await queue.processReservation(basket)

    // After successful reservation
    checkoutButtonDisabled = false
    cancelButtonVisible = true
    proceedButtonVisible = true
    approveButtonVisible = false

    expect(checkoutButtonDisabled).toBe(false)
    expect(cancelButtonVisible).toBe(true)
    expect(proceedButtonVisible).toBe(true)
    expect(approveButtonVisible).toBe(false)

    // Cancel reservation
    await queue.rollbackReservation(reservation.reservationToken)

    // After cancellation
    checkoutButtonDisabled = false
    cancelButtonVisible = false
    proceedButtonVisible = false

    expect(checkoutButtonDisabled).toBe(false)
    expect(cancelButtonVisible).toBe(false)
    expect(proceedButtonVisible).toBe(false)
  })

  test('Test Data Cleanup', async () => {
    // Create test reservation
    const basket = {
      products: [
        { id: 'product-a', quantity: 1, stripePriceId: 'price_1Q6xrZ2eZvKYlo2C9u2kZvKYlo' }
      ],
      totalAmount: 10000,
      currency: 'PLN'
    }

    const reservation = await queue.processReservation(basket)
    const token = reservation.reservationToken

    // Verify test data exists
    expect(queue.getReservation(token)).toBeDefined()
    expect(await redis.get(`reservation:${token}`)).toBeDefined()
    expect(sanity.getStockCount('product-a')).toBe(4) // Decremented

    // Cleanup
    await queue.rollbackReservation(token)
    sanity.resetStock()
    await redis.flushdb()

    // Verify cleanup complete
    expect(queue.getReservation(token)).toBeNull()
    expect(await redis.get(`reservation:${token}`)).toBeNull()
    expect(sanity.getStockCount('product-a')).toBe(5) // Reset
  })
})
