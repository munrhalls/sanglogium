// npx playwright test tests/checkout-queue/e2e/price-verification-happy-path.spec.ts --headed --project=desktop-chromium
import { test, expect } from '@playwright/test'
import { resetProductStock, getTestProducts } from '@/tests/helpers/sanity-test-products'

test.describe('Price Verification Happy Path', () => {
  test.beforeEach(async () => {
    // Reset test product stock to ensure clean state
    const testProductId = 'C6Tof5mjTvwXcWUxnj89oo'
    const testProducts = await getTestProducts()
    const testProduct = testProducts.find(p => p._id === testProductId)
    if (testProduct) {
      await resetProductStock(testProductId, testProduct.stock)
    }
  })

  test('checkout button click -> Stripe price verification matches CMS price_data.unit_amount / 100', async ({ page }) => {
    // Navigate to test product page
    await page.goto('/product/test-64-audio-premium-pearl-cable-3-5mm')
    await page.getByTestId('product-info').waitFor()

    // Add to basket
    const addToBasketButton = page.locator('button[data-testid^="add-to-basket-"]').first()
    await addToBasketButton.click()
    await page.locator('button:has-text("in Cart")').waitFor({ timeout: 5000 })

    // Navigate to basket
    await page.goto('/basket')
    await page.getByTestId('basket-page').waitFor()

    // Click checkout and capture API response
    const checkoutButton = page.getByTestId('checkout-button')
    await checkoutButton.waitFor()

    const apiResponsePromise = page.waitForResponse(
      response => response.url().includes('/api/checkout-queue') && response.status() === 202
    )

    await checkoutButton.click()
    const apiResponse = await apiResponsePromise
    const responseData = await apiResponse.json()

    // Verify Stripe verifiedPrice matches CMS price_data.unit_amount / 100
    expect(responseData.debug).toBeDefined()
    expect(responseData.debug.stripeVerification).toBeDefined()
    expect(responseData.debug.stripeVerification.length).toBe(1)

    const stripeVerification = responseData.debug.stripeVerification[0]
    const cmsProduct = responseData.products[0]

    expect(stripeVerification.verifiedPrice).toBe(cmsProduct.realPrice)
  })
})
