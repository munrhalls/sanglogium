// npx playwright test tests/checkout-queue/e2e/basket-reservation-happy-path.spec.ts --headed --project=desktop-chromium
import { test, expect } from '@playwright/test'
import { createClient } from 'next-sanity'
import { apiVersion, projectId } from '@/sanity/env'
import { resetProductStock, getTestProducts } from '@/tests/helpers/sanity-test-products'

const client = createClient({
  projectId,
  dataset: "test",
  apiVersion,
  useCdn: false,
})

test.describe('Basket Reservation Happy Path', () => {
  test.beforeEach(async () => {
    // Reset test product stock to ensure clean state
    const testProductId = 'C6Tof5mjTvwXcWUxnj89oo'
    const testProducts = await getTestProducts()
    const testProduct = testProducts.find(p => p._id === testProductId)
    if (testProduct) {
      await resetProductStock(testProductId, testProduct.stock)
    }
  })

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

    // Intercept API request to capture payload
    const apiRequestPromise = page.waitForRequest(
      request => request.url().includes('/api/checkout-queue') && request.method() === 'POST'
    )

    // Wait for API response
    const apiResponsePromise = page.waitForResponse(
      response => response.url().includes('/api/checkout-queue') && response.status() === 202
    )

    // Click checkout button
    await checkoutButton.click()

    // Capture request payload
    const apiRequest = await apiRequestPromise
    const requestData = await apiRequest.postDataJSON()

    // Verify request basketReservation matches localStorage basket
    expect(requestData.basketReservation).toBeDefined()
    expect(Array.isArray(requestData.basketReservation)).toBe(true)
    expect(requestData.basketReservation.length).toBe(basketData.state.basket.length)

    for (const requestItem of requestData.basketReservation) {
      const basketItem = basketData.state.basket.find((p: any) => p._id === requestItem._id)
      expect(basketItem).toBeDefined()
      expect(requestItem.quantity).toBe(basketItem?.quantity)
      expect(requestItem.stripePriceId).toBe(basketItem?.stripePriceId)
      expect(requestItem.price_data.unit_amount / 100).toBe(basketItem?.price_data.unit_amount / 100)
    }

    // Wait for API response
    const apiResponse = await apiResponsePromise
    const responseData = await apiResponse.json()
    console.log('API Response:', JSON.stringify(responseData, null, 2))

    // Verify Stripe verification debug data exists
    expect(responseData.debug).toBeDefined()
    expect(responseData.debug.stripeVerification).toBeDefined()
    expect(Array.isArray(responseData.debug.stripeVerification)).toBe(true)
    expect(responseData.debug.stripeVerification.length).toBe(1)

    // Verify Stripe verification data matches product
    const stripeVerification = responseData.debug.stripeVerification[0]
    expect(stripeVerification.productId).toBe(expectedProductId)
    expect(stripeVerification.stripePriceId).toBeDefined()
    expect(typeof stripeVerification.verifiedPrice).toBe('number')
    expect(stripeVerification.verifiedPrice).toBeGreaterThan(0)

    // Verify Stripe verifiedPrice matches CMS price_data.unit_amount / 100 (realPrice in response)
    const cmsProduct = responseData.products[0]
    expect(stripeVerification.verifiedPrice).toBe(cmsProduct.realPrice)

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

    // Verify CMS state - basketReservation doc exists with matching items
    const reservationDoc = await client.fetch(
      `*[_type == "basketReservation" && _id == $id][0]`,
      { id: reservationId }
    )
    expect(reservationDoc).toBeDefined()
    expect(reservationDoc._type).toBe('basketReservation')
    expect(Array.isArray(reservationDoc.basketReservation)).toBe(true)
    expect(reservationDoc.basketReservation.length).toBe(basketData.state.basket.length)

    // Verify basket items match between CMS doc and localStorage
    for (const item of reservationDoc.basketReservation) {
      const original = basketData.state.basket.find((p: any) => p._id === item._id)
      expect(original).toBeDefined()
      expect(item.quantity).toBe(original?.quantity)
      expect(item.verifiedPrice).toBeGreaterThan(0)
    }

    // Verify reservedStock was incremented for each product
    for (const item of basketData.state.basket) {
      const product = await client.fetch(`*[_id == $id][0]{ reservedStock }`, { id: item._id })
      expect(product).toBeDefined()
      expect(product.reservedStock).toBe(item.quantity) // beforeEach resets to 0
    }

    // Navigate to checkout/shipping page
    await page.goto('/checkout/shipping')
    await page.waitForURL('/checkout/shipping')



  })
})
