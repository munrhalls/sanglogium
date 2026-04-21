import { test, expect } from '@playwright/test'

test.describe('Test Product Detail Page', () => {
  test('access test product from test dataset and add to basket', async ({ page }) => {
    // First test product from test dataset
    const testProductSlug = 'test-64-audio-premium-pearl-cable-3-5mm'
    const expectedProductId = 'C6Tof5mjTvwXcWUxnj89oo'

    // Navigate to product detail page
    await page.goto(`/product/${testProductSlug}`)

    // Wait for product page to load
    await page.getByTestId('product-info').waitFor()

    // Log product info
    const productName = await page.locator('h1.type-section-hed').textContent()
    console.log('Product name:', productName)

    // Verify product has add to basket button
    const addToBasketButton = page.locator('button[data-testid^="add-to-basket-"]').first()
    await addToBasketButton.waitFor()
    console.log('Add to basket button found')

    // Click add to basket
    await addToBasketButton.click()

    // Wait for button state to change
    await page.locator('button:has-text("in Cart")').waitFor({ timeout: 5000 })

    // Verify zustand basket store has product
    const basketStorage = await page.evaluate(() => {
      return localStorage.getItem('basket-storage')
    })

    expect(basketStorage).not.toBeNull()

    const basketData = JSON.parse(basketStorage)
    expect(basketData.state.basket.length).toBeGreaterThan(0)
    expect(basketData.state.basket[0]._id).toBe(expectedProductId)

    console.log('✅ Product added to basket successfully')
  })
})
