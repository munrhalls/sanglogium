// npx playwright test tests/checkout-queue/e2e/basket-reservation-happy-path.spec.ts --headed --project=desktop-chromium
import { test, expect } from '@playwright/test'

test.describe('Basket Reservation Happy Path', () => {
  test('add to basket -> click checkout -> reservationId saved to session storage', async ({ page }) => {
    // Navigate directly to test product page
    await page.goto('/product/test-64-audio-premium-pearl-cable-3-5mm')

    // Wait for product page to load
    await page.getByTestId('product-info').waitFor()

    // Click "Add to cart" button
    const addToBasketButton = page.locator('button[data-testid^="add-to-basket-"]').first()
    await addToBasketButton.click()

    // Wait for button state to change to "in cart"
    await page.locator('button:has-text("in Cart")').waitFor({ timeout: 5000 })

    // Check localStorage to verify product was added to basket
    const basketStorage = await page.evaluate(() => {
      return localStorage.getItem('basket-storage')
    })

    expect(basketStorage).not.toBeNull()

    const basketData = JSON.parse(basketStorage)
    expect(basketData.state.basket.length).toBeGreaterThan(0)

    const expectedProductId = 'C6Tof5mjTvwXcWUxnj89oo'
    const productInBasket = basketData.state.basket.find((item: any) => item._id === expectedProductId)
    expect(productInBasket).toBeDefined()

    // Navigate to basket page
    await page.goto('/basket')

    // Wait for basket page to load
    await page.getByTestId('basket-page').waitFor()

    // Wait for checkout button to be visible
    const checkoutButton = page.getByTestId('checkout-button')
    await checkoutButton.waitFor()

    // Wait for API response
    const apiResponsePromise = page.waitForResponse(
      response => response.url().includes('/api/checkout-queue') && response.status() === 202
    )

    // Click checkout button
    await checkoutButton.click()

    // Wait for API response
    const apiResponse = await apiResponsePromise
    const responseData = await apiResponse.json()
    console.log('API Response:', JSON.stringify(responseData, null, 2))

    // Wait for navigation to checkout page
    await page.waitForURL('/checkout')

    // Verify reservationId in session storage
    const reservationId = await page.evaluate(() => {
      return sessionStorage.getItem('basketReservationId')
    })
    console.log('Session storage reservationId:', reservationId)

    // here - it should navigate to checkout/shipping
    expect(reservationId).toBeDefined()
    expect(reservationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    expect(reservationId).toBe(responseData.reservationId)

    // Navigate to checkout/shipping page
    await page.goto('/checkout/shipping')
    await page.waitForURL('/checkout/shipping')



  })
})
