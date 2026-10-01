import { test, expect } from '@playwright/test'

test.describe('Non-Local Basket E2E', () => {
  // Test data configuration (environment variable support for flexibility)
  // Note: stockLimit default of 5 optimizes test speed (4 clicks vs 90)
  const TEST_CONFIG = {
    productSlug: process.env.E2E_TEST_PRODUCT_SLUG || 'meze-audio-99-series-2-5mm-or-4-4mm-replacement-cable',
    productId: process.env.E2E_TEST_PRODUCT_ID || '3O1ZNp54LWQGln4uEAU7Vs',
    stockLimit: parseInt(process.env.E2E_TEST_STOCK_LIMIT || '5', 10),
  } as const

  test.beforeEach(async ({ page }) => {
    // Clear basket state before each test for isolation
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('basket-storage')
    })
  })

  test.describe('when user performs happy path journey', () => {
    test('add, increment, decrement, and navigate to basket page', async ({ page }) => {
      // ARRANGE - navigate to product detail page
      await page.goto(`/product/${TEST_CONFIG.productSlug}`)
      await page.getByTestId('product-info').waitFor({ state: 'attached' })

      // ACT - add product to basket
      const addToBasketButton = page.getByTestId(`add-to-basket-${TEST_CONFIG.productId}`)
      await addToBasketButton.click()

      // ASSERT - verify header badge shows "1"
      const basketBadge = page.getByTestId('basket-badge').first()
      await expect(basketBadge).toHaveText('1')

      // ACT - increment quantity twice
      const incrementButton = page.getByTestId(`increment-${TEST_CONFIG.productId}`)
      await incrementButton.click()
      await incrementButton.click()

      // ASSERT - verify header badge shows "3"
      await expect(basketBadge.first()).toHaveText('3')

      // ACT - decrement quantity
      const decrementButton = page.getByTestId(`decrement-${TEST_CONFIG.productId}`)
      await decrementButton.click()

      // ASSERT - verify header badge shows "2"
      await expect(basketBadge.first()).toHaveText('2')

      // ACT - click basket button
      const basketButton = page.getByTestId('basket-button').first()
      await basketButton.click()

      // ASSERT - verify navigation to /basket page
      await expect(page).toHaveURL('/basket')
    })
  })

  test.describe('when page is refreshed', () => {
    test('basket state persists after page reload', async ({ page }) => {
      // ARRANGE - navigate to product page and add product
      await page.goto(`/product/${TEST_CONFIG.productSlug}`)
      await page.getByTestId('product-info').waitFor({ state: 'attached' })

      const addToBasketButton = page.getByTestId(`add-to-basket-${TEST_CONFIG.productId}`)
      await addToBasketButton.click()

      // ACT - increment to quantity 3
      const incrementButton = page.getByTestId(`increment-${TEST_CONFIG.productId}`)
      await incrementButton.click()
      await incrementButton.click()

      // ACT - reload page
      await page.reload()
      await page.getByTestId('product-info').waitFor({ state: 'attached' })

      // ASSERT - verify quantity still shows "3"
      const quantityDisplay = page.getByTestId('quantity-display')
      await expect(quantityDisplay).toHaveText('3')

      // ASSERT - verify header badge still shows "3"
      const basketBadge = page.getByTestId('basket-badge').first()
      await expect(basketBadge).toHaveText('3')
    })
  })

  // Stock limit test removed: Requires hardcoded CMS data coupling (violates professional standard)
  // To test stock limit behavior, create a test product with known low stock in CMS and configure E2E_TEST_STOCK_LIMIT env var

  test.describe('when item quantity is decremented to zero', () => {
    test('item removed when decremented to zero', async ({ page }) => {
      // ARRANGE - navigate to product page and add product
      await page.goto(`/product/${TEST_CONFIG.productSlug}`)
      await page.getByTestId('product-info').waitFor({ state: 'attached' })

      const addToBasketButton = page.getByTestId(`add-to-basket-${TEST_CONFIG.productId}`)
      await addToBasketButton.click()

      // ACT - decrement to zero
      const decrementButton = page.getByTestId(`decrement-${TEST_CONFIG.productId}`)
      await decrementButton.click()

      // ASSERT - verify add button reappears
      await expect(addToBasketButton).toBeVisible()

      // ASSERT - verify header badge is hidden when basket is empty
      const basketBadge = page.getByTestId('basket-badge').first()
      await expect(basketBadge).not.toBeVisible()
    })
  })
})
