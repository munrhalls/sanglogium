// Integration Test: Client Sends Request -> Redis Queue Receives
// Tests that client forms and sends valid basket reservation request to Redis queue
// No mocking of core logic - tests actual integration
// Scope: Client button click -> API request -> Redis queue enqueue (no processing)

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CheckoutButton } from '@/components/checkout/reservation/CheckoutButton'
import { useBasketStore } from '@/store/store'
import { useReservedBasketStore } from '@/store/checkout/reservedBasketSlice'
import { eventDeduplicator } from '@/components/checkout/reservation/EventDeduplicator'
import {
  clearRedisTestDb,
  getRedisQueueState,
  captureFetchCalls,
  TEST_BASKET,
  getIdempotencyCache,
  checkRedisHealth,
  createTestProducts,
  cleanupTestProducts,
  waitForStockUpdate
} from './test-helpers'
import type { ClientBasket, CreateReservationRequest, ClientBasketProduct } from '@/lib/checkout/reservation/types'

// Note: fetch is restored by captureFetchCalls().restore()

describe('Client Sends Request -> Redis Queue Receives', () => {
  let fetchCapture: ReturnType<typeof captureFetchCalls>

  beforeAll(async () => {
    // Create test products in Sanity
    await createTestProducts()
  }, 30000)

  afterAll(async () => {
    // Clean up test products
    await cleanupTestProducts()
  }, 30000)

  beforeEach(async () => {
    // Check Redis availability first
    const redisHealthy = await checkRedisHealth()
    if (!redisHealthy) {
      throw new Error(
        'Redis is not running on localhost:6379.\n' +
        'To start Redis:\n' +
        '  Windows: Start Redis service or use WSL\n' +
        '  Docker: docker run -d --name redis-test -p 6379:6379 redis:7-alpine\n' +
        '  Then rerun the test'
      )
    }

    // Reset stores
    useBasketStore.setState({ basket: [] })
    useReservedBasketStore.setState({
      reservedBasket: null,
      loading: false,
      error: null
    })

    // Reset event deduplicator
    eventDeduplicator.reset()

    // Clear Redis test database
    await clearRedisTestDb()

    // Set up fetch capture without mocking
    fetchCapture = captureFetchCalls()

    // Set test basket
    useBasketStore.setState({ basket: TEST_BASKET })
  })

  afterEach(async () => {
    // Restore fetch if it was set up
    if (fetchCapture) {
      fetchCapture.restore()
    }

    // Clean up Redis only if Redis is healthy
    const redisHealthy = await checkRedisHealth()
    if (redisHealthy) {
      await clearRedisTestDb()
    }
  })

  describe('1. Client forms valid request structure', () => {
    it('should create ClientBasket with correct structure', async () => {
      render(<CheckoutButton />)
      const button = screen.getByTestId('checkout-button')

      // Trigger checkout
      fireEvent.click(button)

      // Wait for fetch call
      await waitFor(() => {
        expect(fetchCapture.calls).toHaveLength(1)
      }, { timeout: 1000 })

      // Verify request structure
      const call = fetchCapture.calls[0]
      expect(call.url).toBe('/api/checkout/reserve')
      expect(call.options.method).toBe('POST')
      expect(call.options.headers).toMatchObject({
        'Content-Type': 'application/json',
        'Idempotency-Key': expect.any(String)
      })

      // Parse and verify the body matches TypeScript types
      const requestBody: CreateReservationRequest = JSON.parse(call.options.body as string)
      const clientBasket: ClientBasket = requestBody.clientBasket

      // TypeScript ensures structure, verify values
      expect(clientBasket.currency).toBe('PLN') // As per PRD
      expect(clientBasket.totalAmount).toBe(275) // 2*100 + 1*75
      expect(clientBasket.products).toHaveLength(2)

      // Verify product types (TypeScript ensures structure)
      clientBasket.products.forEach((product: ClientBasketProduct) => {
        expect(typeof product.id).toBe('string')
        expect(typeof product.stripePriceId).toBe('string')
        expect(typeof product.quantity).toBe('number')
      })
    })

    it('should format products correctly from basket', async () => {
      render(<CheckoutButton />)
      const button = screen.getByTestId('checkout-button')

      fireEvent.click(button)

      await waitFor(() => {
        expect(fetchCapture.calls).toHaveLength(1)
      }, { timeout: 1000 })

      const call = fetchCapture.calls[0]
      const requestBody: CreateReservationRequest = JSON.parse(call.options.body as string)
      const products: ClientBasketProduct[] = requestBody.clientBasket.products

      // Verify products match test basket (TypeScript ensures structure)
      expect(products[0]).toMatchObject({
        id: 'test-product-1',
        stripePriceId: 'price_test_1',
        quantity: 2
      })

      expect(products[1]).toMatchObject({
        id: 'test-product-2',
        stripePriceId: 'price_test_2',
        quantity: 1
      })
    })
  })

  describe('2. Redis queue receives request', () => {
    it('should enqueue request in Redis queue', async () => {
      render(<CheckoutButton />)
      const button = screen.getByTestId('checkout-button')

      // Get initial queue state
      const initialState = await getRedisQueueState()
      expect(initialState.waiting).toBe(0)

      // Trigger checkout
      fireEvent.click(button)

      // Wait for fetch and queue processing
      await waitFor(async () => {
        const queueState = await getRedisQueueState()
        expect(queueState.waiting).toBeGreaterThan(0)
      }, { timeout: 2000 })

      // Verify request was captured
      expect(fetchCapture.calls).toHaveLength(1)

      // Verify queue has the job
      const finalState = await getRedisQueueState()
      expect(finalState.waiting).toBe(1)
      expect(finalState.active).toBe(0)
      expect(finalState.completed).toBe(0)
      expect(finalState.failed).toBe(0)
    })

    it('should store idempotency key in Redis', async () => {
      render(<CheckoutButton />)
      const button = screen.getByTestId('checkout-button')

      fireEvent.click(button)

      // Wait for fetch call
      await waitFor(() => {
        expect(fetchCapture.calls).toHaveLength(1)
      }, { timeout: 1000 })

      // Extract idempotency key from request
      const call = fetchCapture.calls[0]
      const idempotencyKey = call.options.headers?.['Idempotency-Key'] as string

      // Verify idempotency key is stored in Redis
      await waitFor(async () => {
        const cached = await getIdempotencyCache(idempotencyKey)
        expect(cached).toBeTruthy()
        expect(cached.requestFingerprint).toBeTruthy()
      }, { timeout: 2000 })
    })
  })

  describe('3. Sanity stock verification', () => {
    it('should increment reservedStock in Sanity after queue processing', async () => {
      render(<CheckoutButton />)
      const button = screen.getByTestId('checkout-button')

      fireEvent.click(button)

      // Wait for fetch call
      await waitFor(() => {
        expect(fetchCapture.calls).toHaveLength(1)
      }, { timeout: 1000 })

      // Wait for queue processing
      await waitFor(async () => {
        const state = await getRedisQueueState()
        return state.waiting === 0 && state.active === 0
      }, { timeout: 5000 })

      // Wait for stock update with polling
      const stockUpdated = await waitForStockUpdate('test-product-1', 2, 8000)
      expect(stockUpdated).toBe(true)
    }, 20000) // 20 second timeout for stock verification test
  })

  describe('4. Type consistency verification', () => {
    it('should maintain type consistency from basket to queue', async () => {
      render(<CheckoutButton />)
      const button = screen.getByTestId('checkout-button')

      fireEvent.click(button)

      await waitFor(() => {
        expect(fetchCapture.calls).toHaveLength(1)
      }, { timeout: 1000 })

      const call = fetchCapture.calls[0]
      const requestBody: CreateReservationRequest = JSON.parse(call.options.body as string)
      const clientBasket: ClientBasket = requestBody.clientBasket

      // TypeScript ensures type consistency, just verify runtime types
      expect(typeof clientBasket.totalAmount).toBe('number')
      expect(typeof clientBasket.currency).toBe('string')
      expect(Array.isArray(clientBasket.products)).toBe(true)

      // Verify product runtime types (TypeScript ensures structure)
      clientBasket.products.forEach((product: ClientBasketProduct) => {
        expect(typeof product.id).toBe('string')
        expect(typeof product.stripePriceId).toBe('string')
        expect(typeof product.quantity).toBe('number')
      })
    })

    it('should generate unique idempotency keys', async () => {
      render(<CheckoutButton />)
      const button = screen.getByTestId('checkout-button')

      // First click
      fireEvent.click(button)

      await waitFor(() => {
        expect(fetchCapture.calls).toHaveLength(1)
      }, { timeout: 1000 })

      const firstKey = fetchCapture.calls[0].options.headers?.['Idempotency-Key'] as string

      // Reset for second click
      fetchCapture.restore()
      fetchCapture = captureFetchCalls()

      // Clear reserved basket to allow second checkout
      useReservedBasketStore.setState({ reservedBasket: null })

      // Wait for debounce period
      await new Promise(resolve => setTimeout(resolve, 1100))

      // Second click
      fireEvent.click(button)

      await waitFor(() => {
        expect(fetchCapture.calls).toHaveLength(1)
      }, { timeout: 1000 })

      const secondKey = fetchCapture.calls[0].options.headers?.['Idempotency-Key'] as string

      // Verify keys are different
      expect(firstKey).not.toBe(secondKey)
      expect(firstKey).toMatch(/^[0-9a-f-]+$/) // UUID format
      expect(secondKey).toMatch(/^[0-9a-f-]+$/) // UUID format
    })
  })
})