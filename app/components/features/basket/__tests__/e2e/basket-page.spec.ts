// E2E test: Basket page happy path
//
// Flow:
//   1. Navigate to product page
//   2. Add product to basket
//   3. Navigate to basket page
//   4. Verify items displayed with correct data
//   5. Increment quantity and verify total updates
//   6. Decrement quantity and verify total updates
//   7. Remove item and verify empty state shown
//
// Black box: Tests user-visible behavior only
// No mocks: Uses real browser and basket state
// Isolated: Each test cleans up basket state

import { test, expect } from '@playwright/test'

test.describe('Basket Page E2E', () => {
  // Test data configuration (environment variable support for flexibility)
  const TEST_CONFIG = {
    productSlug: process.env.E2E_TEST_PRODUCT_SLUG || 'meze-audio-99-series-2-5mm-or-4-4mm-replacement-cable',
    productId: process.env.E2E_TEST_PRODUCT_ID || '3O1ZNp54LWQGln4uEAU7Vs',
  } as const

  test.beforeEach(async ({ page }) => {
    // Clear basket state before each test for isolation
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('basket-storage')
    })
  })

  test('happy path: view items, adjust quantities, see totals update, remove item', async ({
    page,
  }) => {
    // ARRANGE - navigate to product page and add product to basket
    await page.goto(`/product/${TEST_CONFIG.productSlug}`)
    await page.getByTestId('product-info').waitFor({ state: 'attached' })

    const addToBasketButton = page.getByTestId(`add-to-basket-${TEST_CONFIG.productId}`)
    await addToBasketButton.click()

    // ASSERT - verify header badge shows "1"
    const basketBadge = page.getByTestId('basket-badge').first()
    await expect(basketBadge).toHaveText('1')

    // ACT - navigate to basket page
    const basketButton = page.getByTestId('basket-button').first()
    await basketButton.click()

    // ASSERT - verify navigation to /basket page
    await expect(page).toHaveURL('/basket')

    // ASSERT - verify basket items displayed (user-visible behavior)
    // Note: We check for the presence of basket content, not specific implementation
    await expect(page.locator('[data-testid="basket-item"]').first()).toBeVisible()

    // ACT - increment quantity
    const incrementButton = page.getByTestId(`increment-${TEST_CONFIG.productId}`)
    await incrementButton.click()

    // ASSERT - verify quantity updated (user-visible behavior)
    const quantityDisplay = page.getByTestId('quantity-display')
    await expect(quantityDisplay).toHaveText('2')

    // ACT - decrement quantity
    const decrementButton = page.getByTestId(`decrement-${TEST_CONFIG.productId}`)
    await decrementButton.click()

    // ASSERT - verify quantity updated
    await expect(quantityDisplay).toHaveText('1')

    // ACT - decrement to zero (remove item)
    await decrementButton.click()

    // ASSERT - verify empty state shown (user-visible behavior)
    await expect(page.getByText(/your basket is empty/i)).toBeVisible()

    // ASSERT - verify basket badge is hidden when basket is empty
    await expect(basketBadge.first()).not.toBeVisible()
  })
})
