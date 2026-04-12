import { test, expect } from '@playwright/test'
import { SanityClient } from '@sanity/client'
import Redis from 'ioredis'

// Real clients - no mocks
const sanity = new SanityClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  useCdn: false,
  token: process.env.SANITY_TOKEN
})

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
})

// Test data - known state
const TEST_PRODUCTS = {
  'product-a': { stock: 5, price: 10000 },
  'product-b': { stock: 2, price: 20000 },
  'product-c': { stock: 0, price: 30000 }
}

test.describe('Basic Reservation Flow', () => {
  // Setup known state before each test
  test.beforeEach(async () => {
    // Set known stock levels
    for (const [productId, data] of Object.entries(TEST_PRODUCTS)) {
      await sanity.patch(productId).set({ stock: data.stock }).commit()
    }

    // Clear any existing reservations
    await redis.flushdb()

    // Clear browser state
    await page.goto('/basket')
    await page.evaluate(() => localStorage.clear())
  })

  // Verify no side effects after each test
  test.afterEach(async () => {
    // Check no active reservations
    const reservations = await sanity.fetch(`*[_type == "reservation" && state == "ACTIVE"]`)
    expect(reservations).toHaveLength(0)

    // Check Redis is clean
    const redisKeys = await redis.keys('*')
    expect(redisKeys.filter(k => k.startsWith('reservation:'))).toHaveLength(0)

    // Verify stock returned to known state
    for (const [productId, data] of Object.entries(TEST_PRODUCTS)) {
      const product = await sanity.fetch(`*[_id == $productId][0]`, { productId })
      expect(product.stock).toBe(data.stock)
    }
  })

  test('Step 1: Create Reservation - button disables and stock decreases', async () => {
    // Add items to basket
    await page.goto('/')
    await page.click('[data-testid="add-to-basket-product-a"]')
    await page.click('[data-testid="add-to-basket-product-b"]')
    await page.goto('/basket')

    // Verify basket has items
    await expect(page.locator('[data-testid="basket-item"]')).toHaveCount(2)

    // Click checkout
    await page.click('[data-testid="checkout-button"]')

    // Verify button state - direct observation
    await expect(page.locator('[data-testid="checkout-button"]')).toBeDisabled()
    await expect(page.locator('[data-testid="checkout-button"]')).toHaveText('Processing...')

    // Wait for real network response
    const response = await page.waitForResponse('**/api/checkout/reserve')

    // Verify actual response structure
    const responseData = await response.json()
    expect(responseData.success).toBe(true)
    expect(responseData.data.reservationToken).toBeDefined()
    expect(responseData.data.reservedBasket).toBeDefined()

    // Verify UI shows correct state
    await expect(page.locator('[data-testid="reserved-basket"]')).toBeVisible()
    await expect(page.locator('[data-testid="proceed-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="decrement-message"]')).not.toBeVisible()

    // Verify real stock was actually decreased in Sanity
    const productA = await sanity.fetch(`*[_id == "product-a"][0]`)
    const productB = await sanity.fetch(`*[_id == "product-b"][0]`)
    expect(productA.stock).toBe(4) // 5 - 1 reserved
    expect(productB.stock).toBe(1) // 2 - 1 reserved

    // Verify Redis TTL key was created
    const reservationToken = responseData.data.reservationToken
    const redisKey = await redis.get(`reservation:${reservationToken}`)
    expect(redisKey).toBeDefined()
  })

  test('Step 2: Stock Decrement - shows approval when insufficient stock', async () => {
    // Set specific stock state
    await sanity.patch('product-c').set({ stock: 2 }).commit()

    // Add more items than available
    await page.goto('/')
    await page.click('[data-testid="add-to-basket-product-c"]')
    await page.click('[data-testid="add-to-basket-product-c"]')
    await page.click('[data-testid="add-to-basket-product-c"]')
    await page.goto('/basket')

    // Create reservation
    await page.click('[data-testid="checkout-button"]')
    await page.waitForResponse('**/api/checkout/reserve')

    // Verify only available quantity was reserved
    const reservedBasketText = await page.locator('[data-testid="reserved-basket"]').textContent()
    expect(reservedBasketText).toContain('Reserved: 2')
    expect(reservedBasketText).toContain('Requested: 3')

    // Verify UI shows decrement message
    await expect(page.locator('[data-testid="decrement-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="decrement-message"]')).toContainText(
      "We've had to revise your basket based on latest inventory check"
    )

    // Verify approval buttons appear
    await expect(page.locator('[data-testid="approve-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="approve-button"]')).toBeEnabled()
    await expect(page.locator('[data-testid="cancel-button"]')).toBeVisible()

    // Verify proceed button is not shown
    await expect(page.locator('[data-testid="proceed-button"]')).not.toBeVisible()
  })

  test('Step 3: Out of Stock - shows error when no stock available', async () => {
    // Verify product has zero stock
    await sanity.patch('product-c').set({ stock: 0 }).commit()

    // Add out of stock item
    await page.goto('/')
    await page.click('[data-testid="add-to-basket-product-c"]')
    await page.goto('/basket')

    // Attempt reservation
    await page.click('[data-testid="checkout-button"]')
    await page.waitForResponse('**/api/checkout/reserve')

    // Verify zero reservation
    const reservedBasketText = await page.locator('[data-testid="reserved-basket"]').textContent()
    expect(reservedBasketText).toContain('Reserved: 0')
    expect(reservedBasketText).toContain('Requested: 1')

    // Verify out of stock message
    await expect(page.locator('[data-testid="out-of-stock-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="out-of-stock-message"]')).toContainText(
      "We apologize - these products are out of stock"
    )

    // Verify no proceed option
    await expect(page.locator('[data-testid="proceed-button"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="approve-button"]')).not.toBeVisible()

    // Verify cancel is only option
    await expect(page.locator('[data-testid="cancel-button"]')).toBeVisible()
  })

  test('Step 4: Cancel and Rollback - restores stock and enables checkout', async () => {
    // Create valid reservation first
    await page.goto('/')
    await page.click('[data-testid="add-to-basket-product-a"]')
    await page.goto('/basket')
    await page.click('[data-testid="checkout-button"]')
    const response = await page.waitForResponse('**/api/checkout/reserve')
    const responseData = await response.json()
    const reservationToken = responseData.data.reservationToken

    // Verify reservation exists
    await expect(page.locator('[data-testid="reserved-basket"]')).toBeVisible()

    // Click cancel
    await page.click('[data-testid="cancel-button"]')

    // Verify confirmation dialog appears
    await expect(page.locator('[data-testid="cancel-dialog"]')).toBeVisible()
    await expect(page.locator('[data-testid="cancel-dialog"]')).toContainText(
      "Are you sure you want to cancel your reservation?"
    )

    // Confirm cancellation
    await page.click('[data-testid="confirm-cancel"]')

    // Wait for rollback response
    await page.waitForResponse('**/api/checkout/rollback')

    // Verify reservation cleared from UI
    await expect(page.locator('[data-testid="reserved-basket"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="cancel-dialog"]')).not.toBeVisible()

    // Verify stock was actually restored
    const productA = await sanity.fetch(`*[_id == "product-a"][0]`)
    expect(productA.stock).toBe(5) // Back to original

    // Verify Redis key was deleted
    const redisKey = await redis.get(`reservation:${reservationToken}`)
    expect(redisKey).toBeNull()

    // Verify checkout button is enabled again
    await expect(page.locator('[data-testid="checkout-button"]')).toBeEnabled()
    await expect(page.locator('[data-testid="checkout-button"]')).toHaveText('Checkout')
  })

  test('Idempotency - double click creates only one reservation', async () => {
    // Add item to basket
    await page.goto('/')
    await page.click('[data-testid="add-to-basket-product-a"]')
    await page.goto('/basket')

    // Double click checkout rapidly
    await page.click('[data-testid="checkout-button"]')
    await page.click('[data-testid="checkout-button"]') // Second click

    // Wait for response
    await page.waitForResponse('**/api/checkout/reserve')

    // Verify only one reservation created
    const reservations = await sanity.fetch(`*[_type == "reservation"]`)
    expect(reservations).toHaveLength(1)

    // Verify stock decreased by only 1
    const productA = await sanity.fetch(`*[_id == "product-a"][0]`)
    expect(productA.stock).toBe(4) // 5 - 1 reserved
  })

  test('No Cookies - verifies no authentication cookies used', async () => {
    // Clear all cookies
    const context = page.context()
    await context.clearCookies()

    // Create reservation
    await page.goto('/')
    await page.click('[data-testid="add-to-basket-product-a"]')
    await page.goto('/basket')
    await page.click('[data-testid="checkout-button"]')

    // Wait for response
    await page.waitForResponse('**/api/checkout/reserve')

    // Verify reservation succeeded without cookies
    const finalResponse = await page.waitForResponse('**/api/checkout/reserve')
    expect(finalResponse.status()).toBe(200)
    await expect(page.locator('[data-testid="reserved-basket"]')).toBeVisible()

    // Verify no Set-Cookie header in response
    const headers = finalResponse.headers()
    expect(headers['set-cookie']).toBeUndefined()

    // Verify no cookies were set
    const cookies = await context.cookies()
    expect(cookies).toHaveLength(0)
  })

  test('Multi-Tab Concurrency - shows operation in progress message', async () => {
    // Setup first tab
    await page.goto('/')
    await page.click('[data-testid="add-to-basket-product-a"]')
    await page.goto('/basket')

    // Start reservation in first tab
    await page.click('[data-testid="checkout-button"]')
    await page.waitForResponse('**/api/checkout/reserve')

    // Verify reservation created in first tab
    await expect(page.locator('[data-testid="reserved-basket"]')).toBeVisible()

    // Open second tab with same context
    const secondTab = await page.context().newPage()
    await secondTab.goto('/basket')

    // Try to cancel the same reservation from second tab
    await secondTab.click('[data-testid="cancel-button"]')
    await secondTab.click('[data-testid="confirm-cancel"]')

    // Wait for response (should fail with operation_in_progress)
    const cancelResponse = await secondTab.waitForResponse('**/api/checkout/rollback')
    const cancelData = await cancelResponse.json()

    // Verify backend rejects concurrent operation
    expect(cancelData.success).toBe(false)
    expect(cancelData.error).toContain('operation_in_progress')

    // Verify UI shows state 5: operation in progress message
    await expect(secondTab.locator('[data-testid="operation-in-progress-message"]')).toBeVisible()
    await expect(secondTab.locator('[data-testid="operation-in-progress-message"]')).toContainText(
      'Please wait, operation in progress in another tab'
    )

    // Close second tab
    await secondTab.close()

    // Now cancel from first tab (should work)
    await page.click('[data-testid="cancel-button"]')
    await page.click('[data-testid="confirm-cancel"]')
    await page.waitForResponse('**/api/checkout/rollback')

    // Verify cancellation succeeded
    await expect(page.locator('[data-testid="reserved-basket"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="checkout-button"]')).toBeEnabled()
  })

  test('Server-Side TTL Expiry - automatic rollback after 10 minutes', async () => {
    // Create reservation
    await page.goto('/')
    await page.click('[data-testid="add-to-basket-product-a"]')
    await page.goto('/basket')

    // Start reservation
    await page.click('[data-testid="checkout-button"]')
    const response = await page.waitForResponse('**/api/checkout/reserve')
    const responseData = await response.json()
    const reservationToken = responseData.data.reservationToken

    // Verify reservation exists and stock decreased
    await expect(page.locator('[data-testid="reserved-basket"]')).toBeVisible()
    const productA = await sanity.fetch(`*[_id == "product-a"][0]`)
    expect(productA.stock).toBe(4) // 5 - 1 reserved

    // Verify Redis TTL key exists
    const redisKey = await redis.get(`reservation:${reservationToken}`)
    expect(redisKey).toBeDefined()

    // Fast-forward time by 10 minutes and 1 second (past TTL)
    await page.clock.install({ time: new Date('2024-01-01T00:00:00Z') })
    await page.clock.fastForward('10m1s')

    // Wait for TTL to trigger rollback (may need to poll)
    let rollbackOccurred = false
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000)
      const currentStock = await sanity.fetch(`*[_id == "product-a"][0]`)
      if (currentStock.stock === 5) {
        rollbackOccurred = true
        break
      }
    }

    // Verify automatic rollback occurred
    expect(rollbackOccurred).toBe(true)

    // Verify stock was restored
    const finalProductA = await sanity.fetch(`*[_id == "product-a"][0]`)
    expect(finalProductA.stock).toBe(5) // Back to original

    // Verify Redis key was deleted
    const finalRedisKey = await redis.get(`reservation:${reservationToken}`)
    expect(finalRedisKey).toBeNull()

    // Verify UI shows appropriate state (reservation cleared)
    await expect(page.locator('[data-testid="reserved-basket"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="checkout-button"]')).toBeEnabled()

    // Verify UI shows timeout message
    await expect(page.locator('[data-testid="timeout-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="timeout-message"]')).toContainText(
      'Your reservation has expired due to inactivity'
    )
  })
})
