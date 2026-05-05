import { test, expect } from '@playwright/test'

test.describe('Non-Local Basket E2E', () => {
  // Test product from test dataset
  const testProductSlug = 'test-64-audio-premium-pearl-cable-3-5mm'
  const expectedProductId = 'C6Tof5mjTvwXcWUxnj89oo'

  test.describe('Happy Path User Journey', () => {
    test('add, increment, decrement, and navigate to basket page', async ({ page }) => {
      // ARRANGE - navigate to product detail page
      await page.goto(`/product/${testProductSlug}`)
      await page.getByTestId('product-info').waitFor()

      // ACT - add product to basket
      const addToBasketButton = page.getByTestId(`add-to-basket-${expectedProductId}`)
      await addToBasketButton.click()

      // ASSERT - verify header badge shows "1"
      const basketBadge = page.getByTestId('basket-badge')
      await expect(basketBadge).toHaveText('1')

      // ACT - increment quantity twice
      const incrementButton = page.getByTestId(`increment-${expectedProductId}`)
      await incrementButton.click()
      await incrementButton.click()

      // ASSERT - verify header badge shows "3"
      await expect(basketBadge).toHaveText('3')

      // ACT - decrement quantity
      const decrementButton = page.getByTestId(`decrement-${expectedProductId}`)
      await decrementButton.click()

      // ASSERT - verify header badge shows "2"
      await expect(basketBadge).toHaveText('2')

      // ACT - click basket button
      const basketButton = page.getByTestId('basket-button')
      await basketButton.click()

      // ASSERT - verify navigation to /basket page
      await expect(page).toHaveURL('/basket')
    })
  })

  test.describe('Cross-Tab Synchronization', () => {
    test('basket state syncs across tabs', async ({ context }) => {
      // ARRANGE - open tab A and add product
      const pageA = await context.newPage()
      await pageA.goto(`/product/${testProductSlug}`)
      await pageA.getByTestId('product-info').waitFor()

      const addToBasketButton = pageA.getByTestId(`add-to-basket-${expectedProductId}`)
      await addToBasketButton.click()

      // ACT - open tab B and verify sync
      const pageB = await context.newPage()
      await pageB.goto(`/product/${testProductSlug}`)
      await pageB.getByTestId('product-info').waitFor()

      // ASSERT - verify header badge shows "1" in tab B
      const basketBadgeB = pageB.getByTestId('basket-badge')
      await expect(basketBadgeB).toHaveText('1')

      // ACT - increment in tab B
      const incrementButtonB = pageB.getByTestId(`increment-${expectedProductId}`)
      await incrementButtonB.click()

      // ASSERT - verify header badge updated in tab A
      const basketBadgeA = pageA.getByTestId('basket-badge')
      await expect(basketBadgeA).toHaveText('2')

      // Cleanup
      await pageA.close()
      await pageB.close()
    })
  })

  test.describe('Page Refresh Persistence', () => {
    test('basket state persists after page reload', async ({ page }) => {
      // ARRANGE - navigate to product page and add product
      await page.goto(`/product/${testProductSlug}`)
      await page.getByTestId('product-info').waitFor()

      const addToBasketButton = page.getByTestId(`add-to-basket-${expectedProductId}`)
      await addToBasketButton.click()

      // ACT - increment to quantity 3
      const incrementButton = page.getByTestId(`increment-${expectedProductId}`)
      await incrementButton.click()
      await incrementButton.click()

      // ACT - reload page
      await page.reload()
      await page.getByTestId('product-info').waitFor()

      // ASSERT - verify quantity still shows "3"
      const quantityDisplay = page.getByTestId('quantity-display')
      await expect(quantityDisplay).toHaveText('3')

      // ASSERT - verify header badge still shows "3"
      const basketBadge = page.getByTestId('basket-badge')
      await expect(basketBadge).toHaveText('3')
    })
  })

  test.describe('Stock Limit', () => {
    test('increment button disabled at stock limit', async ({ page }) => {
      // ARRANGE - navigate to product page
      await page.goto(`/product/${testProductSlug}`)
      await page.getByTestId('product-info').waitFor()

      // ACT - add product
      const addToBasketButton = page.getByTestId(`add-to-basket-${expectedProductId}`)
      await addToBasketButton.click()

      // ACT - increment until quantity equals stock (assuming stock >= 5 for test product)
      const incrementButton = page.getByTestId(`increment-${expectedProductId}`)
      for (let i = 0; i < 4; i++) {
        await incrementButton.click()
      }

      // ASSERT - verify increment button is disabled when at stock limit
      // Note: This assumes test product has stock of 5. Adjust if different.
      await expect(incrementButton).toBeDisabled()
    })
  })

  test.describe('Remove on Decrement to Zero', () => {
    test('item removed when decremented to zero', async ({ page }) => {
      // ARRANGE - navigate to product page and add product
      await page.goto(`/product/${testProductSlug}`)
      await page.getByTestId('product-info').waitFor()

      const addToBasketButton = page.getByTestId(`add-to-basket-${expectedProductId}`)
      await addToBasketButton.click()

      // ACT - decrement to zero
      const decrementButton = page.getByTestId(`decrement-${expectedProductId}`)
      await decrementButton.click()

      // ASSERT - verify add button reappears
      await expect(addToBasketButton).toBeVisible()

      // ASSERT - verify header badge shows "0"
      const basketBadge = page.getByTestId('basket-badge')
      await expect(basketBadge).toHaveText('0')
    })
  })
})
