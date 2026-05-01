test.describe('Commercial Happy Path: Basket Domain Boundary', () => {

  test.use({
    timezoneId: 'Europe/Warsaw',
    geolocation: { longitude: 17.0385, latitude: 51.1079 },
    permissions: ['geolocation'],
  });

  test('User can successfully add, manage, and checkout items in basket through all layers', () => {
    // Arrange: Navigate to a known, stable product page sourced from Sanity v3 CMS
    // Assert: Verify view cart button is not rendered (basket is empty)

    // Act: Click the 'Add to Basket' button
    // Assert: Verify basketStore.addItem is called with productId, quantity=1, displayPrice, availableStock
    // Assert: Verify basket state is updated with new item
    // Assert: Verify saveToLocalStorage is called
    // Assert: Verify localStorage['basket'] contains serialized basket item
    // Assert: Verify view cart button renders with total items count = 1

    // Act: Click the view cart button
    // Assert: Verify Next.js routing transitions to /basket URL

    // Assert: Verify basket page mount operation runs
    // Assert: Verify hydrateStore is called and basket is hydrated from localStorage
    // Assert: Verify hasHydrated is set to true
    // Assert: Verify product IDs are extracted from basket items
    // Assert: Verify server action fetchProducts is called with product IDs
    // Assert: Verify CMS response is processed through CMS Data Processor
    // Assert: Verify Basket Item Comparator compares basket items with synced CMS items
    // Assert: Verify basket items are rendered immediately with displayPrice and availableStock from snapshot
    // Assert: Verify basket controls are rendered per item (add, increment, decrement, remove)
    // Assert: Verify decrement button is disabled when quantity === 1

    // Act: Click increment button
    // Assert: Verify basketStore.incrementItem is called with productId and maxQuantity
    // Assert: Verify basket state is updated with incremented quantity
    // Assert: Verify saveToLocalStorage is called
    // Assert: Verify quantity display is updated

    // Act: Click increment button until quantity reaches maxQuantity
    // Assert: Verify increment button becomes disabled when quantity === maxQuantity

    // Act: Click decrement button
    // Assert: Verify basketStore.decrementItem is called with productId
    // Assert: Verify basket state is updated with decremented quantity
    // Assert: Verify saveToLocalStorage is called
    // Assert: Verify quantity display is updated

    // Act: Click decrement button when quantity === 1
    // Assert: Verify basketStore.removeItem is called (decrement at 1 removes item)
    // Assert: Verify item is deleted from basket
    // Assert: Verify saveToLocalStorage is called

    // Act: Navigate back to product page
    // Act: Add item to basket again
    // Act: Navigate to basket page
    // Act: Click remove (X) button
    // Assert: Verify basketStore.removeItem is called with productId
    // Assert: Verify item is deleted from basket
    // Assert: Verify saveToLocalStorage is called
    // Assert: Verify item is removed from DOM

    // Act: Refresh browser page
    // Assert: Verify basket is hydrated from localStorage (hasHydrated = true)
    // Assert: Verify basket state persists across refresh

    // Act: Add item to basket
    // Act: Navigate to basket page
    // Act: Mock CMS fetch to fail
    // Assert: Verify cmsFetchFailed is set to true
    // Assert: Verify cms fetch failed banner is rendered with message and Retry button
    // Assert: Verify basket items stay as-is from basket store
    // Assert: Verify unavailableItemsArray is empty
    // Assert: Verify hasDiscrepancies is false

    // Act: Click Retry button
    // Assert: Verify page re-mounts to retry CMS fetch

    // Act: Restore CMS fetch to succeed
    // Act: Refresh page
    // Assert: Verify CMS sync completes successfully
    // Assert: Verify items are rendered with current CMS data

    // Act: Mock CMS to return price discrepancy
    // Act: Refresh basket page
    // Assert: Verify hasDiscrepancies is set to true
    // Assert: Verify items are rendered with old displayPrice struck through
    // Assert: Verify new displayPrice is displayed to the right
    // Assert: Verify discrepancy banner is rendered with close button

    // Act: Close discrepancy banner
    // Assert: Verify isDiscrepancyBannerVisible is set to false
    // Assert: Verify banner is hidden

    // Act: Mock CMS to return product not found
    // Act: Refresh basket page
    // Assert: Verify isWithUnavailable is set to true
    // Assert: Verify item is moved to unavailableItemsArray
    // Assert: Verify unavailable items are rendered under banner
    // Assert: Verify item displays with non-interactive X mark
    // Assert: Verify unavailable banner is rendered with close button

    // Act: Close unavailable banner
    // Assert: Verify isUnavailableBannerVisible is set to false
    // Assert: Verify banner is hidden

    // Act: Mock localStorage to throw error
    // Act: Add item to basket
    // Assert: Verify saveToSessionStorage is called as fallback
    // Assert: Verify storageFallback is set to 'sessionStorage'
    // Assert: Verify sessionStorage['basket'] contains serialized basket item

    // Act: Mock sessionStorage to also throw error
    // Act: Add item to basket
    // Assert: Verify storageFallback is set to 'none'
    // Assert: Verify basket state updates in memory only

    // Act: Restore localStorage
    // Act: Refresh page
    // Assert: Verify validatePayload checks localStorage data
    // Assert: Verify basket is hydrated from localStorage with valid items
    // Assert: Verify invalid items are discarded during validation

    // Confirm basket domain flow is complete and ready to hand off to checkout domain
  });

});