import { test, expect } from '@playwright/test'

test.describe('Basket Page', () => {
  const PRODUCT_SLUG = process.env.E2E_TEST_PRODUCT_SLUG || 'meze-audio-99-series-2-5mm-or-4-4mm-replacement-cable'

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('basket-storage'))
  })

  test('add product, view in basket, adjust quantity, remove', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`)
    await expect(page.getByTestId('product-info')).toBeVisible()

    const productName = await page.locator('h1').first().textContent()

    const addButton = page.locator('[data-testid^="add-to-basket-"]')
    const testId = await addButton.getAttribute('data-testid')
    const productId = testId!.replace('add-to-basket-', '')

    await addButton.click()
    await expect(page.getByTestId('basket-badge').first()).toHaveText('1')

    await page.getByTestId('basket-button').first().click()
    await expect(page).toHaveURL('/basket')

    await expect(page.getByText(productName!)).toBeVisible()

    await page.getByTestId(`increment-${productId}`).click()
    await expect(page.getByTestId('quantity-display')).toHaveText('2')

    await page.getByTestId(`decrement-${productId}`).click()
    await expect(page.getByTestId('quantity-display')).toHaveText('1')

    await page.getByTestId(`remove-${productId}`).click()
    await expect(page.getByText(/your basket is empty/i)).toBeVisible()
    await expect(page.getByTestId('basket-badge')).toHaveCount(0)
  })
})
