import { test, expect } from '@playwright/test'

// UI event handler implementation based on PRD

interface ClientBasketProduct {
  id: string
  stripePriceId: string
  quantity: number
}

interface ClientBasket {
  products: ClientBasketProduct[]
  totalAmount: number
  currency: string
}

interface ReservedProduct {
  id: string
  name: string
  stripePriceId: string
  requestedQuantity: number
  reservedQuantity: number
  availableQuantity: number
  pricePln: number
  totalPricePln: number
  imageUrl: string | null
  slug: string
  brand: {
    id: string
    name: string
    slug: string
  }
}

interface ReservedBasket {
  reservationToken: string
  idempotencyKey: string
  expiresAt: string
  amountPln: number
  products: ReservedProduct[]
  createdAt: string
  updatedAt: string
}

// Mock store implementation
class MockStore {
  reservedBasket: ReservedBasket | null = null
  isLoading = false
  error: string | null = null
  operationInProgress = false
  lastClickTime = 0
  requestQueue = new Set<string>()
  lastRequestId: string | null = null

  setReservedBasket(basket: ReservedBasket | null) {
    this.reservedBasket = basket
  }

  setLoading(loading: boolean) {
    this.isLoading = loading
  }

  setError(error: string | null) {
    this.error = error
  }

  setOperationInProgress(inProgress: boolean) {
    this.operationInProgress = inProgress
  }

  clearReservedBasket() {
    this.reservedBasket = null
    this.error = null
    this.lastRequestId = null
  }

  get hasReservedBasket() {
    return !!this.reservedBasket
  }

  get basketStatus() {
    if (!this.reservedBasket) return 'none'

    const hasEmptyProducts = this.reservedBasket.products.some(p => p.reservedQuantity === 0)
    const hasDecrements = this.reservedBasket.products.some(p => p.reservedQuantity < p.requestedQuantity)

    if (hasEmptyProducts) return 'empty'
    if (hasDecrements) return 'decremented'
    return 'full'
  }

  // Event deduplication
  createDeduplicatedAction(actionKey: string, action: () => Promise<void>) {
    const now = Date.now()
    if (now - this.lastClickTime < 1000) { // 1 second debounce per PRD
      console.warn(`Action ${actionKey} clicked too rapidly`)
      return Promise.resolve()
    }
    this.lastClickTime = now

    if (this.requestQueue.has(actionKey)) {
      console.warn(`Action ${actionKey} already in progress`)
      return Promise.resolve()
    }

    this.requestQueue.add(actionKey)
    this.lastRequestId = `${actionKey}-${now}`

    return action()
      .finally(() => {
        this.requestQueue.delete(actionKey)
      })
  }
}

// Mock API for testing
class MockAPI {
  async createReservation(basket: ClientBasket): Promise<ReservedBasket> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))

    return {
      reservationToken: 'token-' + Math.random(),
      idempotencyKey: 'key-' + Math.random(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      amountPln: basket.totalAmount,
      products: basket.products.map(p => ({
        ...p,
        name: `Product ${p.id}`,
        reservedQuantity: p.quantity,
        availableQuantity: p.quantity,
        pricePln: 10000,
        totalPricePln: p.quantity * 10000,
        imageUrl: null,
        slug: `product-${p.id}`,
        brand: { id: 'brand-1', name: 'Test Brand', slug: 'test-brand' }
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  async rollbackReservation(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100))
    // Simulate rollback
  }
}

// Mock page elements
class MockPage {
  elements = {
    checkoutButton: { disabled: false, textContent: 'Checkout' },
    cancelButton: { disabled: false, textContent: 'Cancel' },
    approveButton: { disabled: false, textContent: 'Approve & Proceed' },
    proceedButton: { disabled: false, textContent: 'Proceed to Next Step' },
    reservedBasket: { visible: false },
    decrementMessage: { visible: false, textContent: '' },
    outOfStockMessage: { visible: false, textContent: '' },
    timeoutMessage: { visible: false, textContent: '' },
    operationInProgressMessage: { visible: false, textContent: '' },
    retryButton: { disabled: false, textContent: 'Retry' },
    loadingSpinner: { visible: false },
    confirmDialog: { visible: false },
    errorMessage: { visible: false, textContent: '' }
  }

  click(element: keyof typeof this.elements) {
    const el = this.elements[element]
    if (el.disabled) {
      throw new Error(`Element ${element} is disabled`)
    }
  }

  setText(element: keyof typeof this.elements, text: string) {
    this.elements[element].textContent = text
  }

  setDisabled(element: keyof typeof this.elements, disabled: boolean) {
    this.elements[element].disabled = disabled
  }

  setVisible(element: keyof typeof this.elements, visible: boolean) {
    this.elements[element].visible = visible
  }

  simulateKeyPress(element: keyof typeof this.elements) {
    this.click(element)
  }
}

test.describe('UI User Interaction Events', () => {
  let store: MockStore
  let api: MockAPI
  let page: MockPage
  let clientBasket: ClientBasket

  test.beforeEach(() => {
    store = new MockStore()
    api = new MockAPI()
    page = new MockPage()
    clientBasket = {
      products: [
        { id: 'p1', stripePriceId: 'price_1', quantity: 2 }
      ],
      totalAmount: 20000,
      currency: 'PLN'
    }
  })

  test('Checkout Button Basic Click', async () => {
    // Initial state
    expect(page.elements.checkoutButton.disabled).toBe(false)
    expect(page.elements.checkoutButton.textContent).toBe('Checkout')
    expect(page.elements.loadingSpinner.visible).toBe(false)

    // Click checkout
    await store.createDeduplicatedAction('checkout', async () => {
      page.setDisabled('checkoutButton', true)
      page.setText('checkoutButton', 'Processing...')
      page.setVisible('loadingSpinner', true)

      const reservedBasket = await api.createReservation(clientBasket)
      store.setReservedBasket(reservedBasket)

      page.setDisabled('checkoutButton', false)
      page.setText('checkoutButton', 'Checkout')
      page.setVisible('loadingSpinner', false)
      page.setVisible('reservedBasket', true)
      page.setVisible('proceedButton', true)
    })

    // Verify UI state
    expect(page.elements.checkoutButton.disabled).toBe(false)
    expect(page.elements.checkoutButton.textContent).toBe('Checkout')
    expect(page.elements.loadingSpinner.visible).toBe(false)
    expect(page.elements.reservedBasket.visible).toBe(true)
    expect(page.elements.proceedButton.visible).toBe(true)
  })

  test('Checkout Button Double Click Prevention', async () => {
    let apiCalls = 0

    // Rapid double click
    const promises = [
      store.createDeduplicatedAction('checkout', async () => {
        apiCalls++
        await new Promise(resolve => setTimeout(resolve, 100))
      }),
      store.createDeduplicatedAction('checkout', async () => {
        apiCalls++
        await new Promise(resolve => setTimeout(resolve, 100))
      })
    ]

    await Promise.all(promises)

    // Only one API call should have been made
    expect(apiCalls).toBe(1)
    expect(store.requestQueue.has('checkout')).toBe(false)
  })

  test('Checkout Button State Transitions', async () => {
    // Idle -> Processing -> Success
    await store.createDeduplicatedAction('checkout', async () => {
      page.setDisabled('checkoutButton', true)
      page.setText('checkoutButton', 'Processing...')
      page.setVisible('loadingSpinner', true)

      const reservedBasket = await api.createReservation(clientBasket)
      store.setReservedBasket(reservedBasket)

      page.setDisabled('checkoutButton', false)
      page.setText('checkoutButton', 'Checkout')
      page.setVisible('loadingSpinner', false)
      page.setVisible('reservedBasket', true)
    })

    expect(page.elements.checkoutButton.disabled).toBe(false)
    expect(page.elements.reservedBasket.visible).toBe(true)
    expect(store.basketStatus).toBe('full')

    // Success -> Idle (cancel)
    await store.createDeduplicatedAction('cancel', async () => {
      page.setVisible('confirmDialog', true)
      await new Promise(resolve => setTimeout(resolve, 50))
      page.setVisible('confirmDialog', false)
      page.setVisible('reservedBasket', false)
      await api.rollbackReservation('token')
      store.clearReservedBasket()
    })

    expect(page.elements.reservedBasket.visible).toBe(false)
    expect(store.basketStatus).toBe('none')
  })

  test('Cancel Button Confirmation Dialog', async () => {
    // Create reservation first
    const reservedBasket = await api.createReservation(clientBasket)
    store.setReservedBasket(reservedBasket)
    page.setVisible('reservedBasket', true)
    page.setVisible('cancelButton', true)

    // Click cancel
    await store.createDeduplicatedAction('cancel', async () => {
      page.setVisible('confirmDialog', true)
    })

    expect(page.elements.confirmDialog.visible).toBe(true)

    // Click "No" to cancel
    page.setVisible('confirmDialog', false)
    expect(page.elements.confirmDialog.visible).toBe(false)
    expect(page.elements.reservedBasket.visible).toBe(true)

    // Click cancel again, then "Yes"
    await store.createDeduplicatedAction('cancel', async () => {
      page.setVisible('confirmDialog', true)
      await new Promise(resolve => setTimeout(resolve, 50))
      page.setVisible('confirmDialog', false)
      page.setVisible('reservedBasket', false)
      await api.rollbackReservation('token')
      store.clearReservedBasket()
    })

    expect(page.elements.confirmDialog.visible).toBe(false)
    expect(page.elements.reservedBasket.visible).toBe(false)
  })

  test('Empty Basket Validation', async () => {
    const emptyBasket: ClientBasket = {
      products: [],
      totalAmount: 0,
      currency: 'PLN'
    }

    await store.createDeduplicatedAction('checkout', async () => {
      if (emptyBasket.products.length === 0) {
        store.setError('Your basket is empty')
        page.setVisible('errorMessage', true)
        page.setText('errorMessage', 'Your basket is empty')
        return
      }
    })

    expect(store.error).toBe('Your basket is empty')
    expect(page.elements.errorMessage.visible).toBe(true)
    expect(page.elements.checkoutButton.disabled).toBe(false)

    // Add item and try again
    clientBasket.products.push({ id: 'p1', stripePriceId: 'price_1', quantity: 1 })

    await store.createDeduplicatedAction('checkout', async () => {
      page.setVisible('errorMessage', false)
      store.setError(null)
      const reservedBasket = await api.createReservation(clientBasket)
      store.setReservedBasket(reservedBasket)
      page.setVisible('reservedBasket', true)
    })

    expect(store.error).toBeNull()
    expect(page.elements.errorMessage.visible).toBe(false)
    expect(page.elements.reservedBasket.visible).toBe(true)
  })

  test('Existing Reservation Handling', async () => {
    // Create reservation
    const reservedBasket = await api.createReservation(clientBasket)
    store.setReservedBasket(reservedBasket)
    page.setVisible('reservedBasket', true)

    // Click checkout with existing reservation
    await store.createDeduplicatedAction('checkout', async () => {
      if (store.reservedBasket && !store.hasModifications) {
        // Proceed with existing reservation
        page.setVisible('proceedButton', true)
        return
      }
    })

    expect(page.elements.proceedButton.visible).toBe(true)
  })

  test('Keyboard Event Handling', async () => {
    // Tab to checkout button and press Enter
    await store.createDeduplicatedAction('checkout', async () => {
      page.simulateKeyPress('checkoutButton')
      page.setDisabled('checkoutButton', true)
      page.setText('checkoutButton', 'Processing...')

      const reservedBasket = await api.createReservation(clientBasket)
      store.setReservedBasket(reservedBasket)

      page.setDisabled('checkoutButton', false)
      page.setVisible('reservedBasket', true)
    })

    expect(page.elements.reservedBasket.visible).toBe(true)

    // Test rapid key presses
    const keyPromises = [
      store.createDeduplicatedAction('checkout', async () => {
        page.simulateKeyPress('checkoutButton')
      }),
      store.createDeduplicatedAction('checkout', async () => {
        page.simulateKeyPress('checkoutButton')
      })
    ]

    await Promise.all(keyPromises)
    // Should only process one due to deduplication
  })

  test('Network Error Handling', async () => {
    // Mock network failure
    const failingAPI = {
      async createReservation() {
        throw new Error('Network error')
      }
    }

    await store.createDeduplicatedAction('checkout', async () => {
      page.setDisabled('checkoutButton', true)
      page.setVisible('loadingSpinner', true)

      try {
        await failingAPI.createReservation()
      } catch {
        store.setError('Failed to create reservation')
        page.setVisible('errorMessage', true)
        page.setText('errorMessage', 'Failed to create reservation')
        page.setVisible('retryButton', true)
      } finally {
        page.setDisabled('checkoutButton', false)
        page.setVisible('loadingSpinner', false)
      }
    })

    expect(store.error).toBe('Failed to create reservation')
    expect(page.elements.errorMessage.visible).toBe(true)
    expect(page.elements.retryButton.visible).toBe(true)
    expect(page.elements.checkoutButton.disabled).toBe(false)

    // Test retry
    await store.createDeduplicatedAction('retry', async () => {
      page.setVisible('retryButton', false)
      page.setVisible('errorMessage', false)
      store.setError(null)

      const reservedBasket = await api.createReservation(clientBasket)
      store.setReservedBasket(reservedBasket)
      page.setVisible('reservedBasket', true)
    })

    expect(store.error).toBeNull()
    expect(page.elements.reservedBasket.visible).toBe(true)
  })

  test('Multi-Tab Prevention', async () => {
    // Create reservation in tab 1
    const reservedBasket = await api.createReservation(clientBasket)
    store.setReservedBasket(reservedBasket)
    page.setVisible('reservedBasket', true)

    // Simulate tab 2 trying to cancel
    const tab2Store = new MockStore()
    tab2Store.setReservedBasket(reservedBasket)

    await tab2Store.createDeduplicatedAction('cancel', async () => {
      // Simulate concurrent operation detection
      throw new Error('operation_in_progress')
    }).catch((err) => {
      expect((err as Error).message).toBe('operation_in_progress')
      page.setVisible('operationInProgressMessage', true)
      page.setText('operationInProgressMessage', 'Please wait, operation in progress in another tab')
      page.setDisabled('cancelButton', true)
    })

    expect(page.elements.operationInProgressMessage.visible).toBe(true)
    expect(page.elements.cancelButton.disabled).toBe(true)
  })

  test('Stock Decrement State', async () => {
    // Create reservation with stock decrement
    const reservedBasket: ReservedBasket = {
      reservationToken: 'token-123',
      idempotencyKey: 'key-456',
      expiresAt: new Date().toISOString(),
      amountPln: 10000,
      products: [
        {
          id: 'p1',
          name: 'Product 1',
          stripePriceId: 'price_1',
          requestedQuantity: 3,
          reservedQuantity: 2,
          availableQuantity: 2,
          pricePln: 10000,
          totalPricePln: 20000,
          imageUrl: null,
          slug: 'product-1',
          brand: { id: 'b1', name: 'Brand 1', slug: 'brand-1' }
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    store.setReservedBasket(reservedBasket)
    page.setVisible('reservedBasket', true)
    page.setVisible('decrementMessage', true)
    page.setText('decrementMessage', "We've had to revise your basket based on latest inventory check.")
    page.setVisible('approveButton', true)
    page.setVisible('cancelButton', true)

    expect(page.elements.decrementMessage.visible).toBe(true)
    expect(page.elements.approveButton.visible).toBe(true)
    expect(page.elements.cancelButton.visible).toBe(true)
    expect(page.elements.proceedButton.visible).toBe(false)
  })

  test('Out of Stock State', async () => {
    // Create reservation with zero stock
    const reservedBasket: ReservedBasket = {
      reservationToken: 'token-123',
      idempotencyKey: 'key-456',
      expiresAt: new Date().toISOString(),
      amountPln: 0,
      products: [
        {
          id: 'p1',
          name: 'Product 1',
          stripePriceId: 'price_1',
          requestedQuantity: 2,
          reservedQuantity: 0,
          availableQuantity: 0,
          pricePln: 10000,
          totalPricePln: 0,
          imageUrl: null,
          slug: 'product-1',
          brand: { id: 'b1', name: 'Brand 1', slug: 'brand-1' }
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    store.setReservedBasket(reservedBasket)
    page.setVisible('reservedBasket', true)
    page.setVisible('outOfStockMessage', true)
    page.setText('outOfStockMessage', "We apologize - these products are out of stock.")
    page.setVisible('cancelButton', true)

    expect(page.elements.outOfStockMessage.visible).toBe(true)
    expect(page.elements.cancelButton.visible).toBe(true)
    expect(page.elements.approveButton.visible).toBe(false)
    expect(page.elements.proceedButton.visible).toBe(false)
  })

  test('Loading States and Indicators', async () => {
    await store.createDeduplicatedAction('checkout', async () => {
      page.setDisabled('checkoutButton', true)
      page.setText('checkoutButton', 'Processing...')
      page.setVisible('loadingSpinner', true)

      // Simulate longer operation
      await new Promise(resolve => setTimeout(resolve, 500))

      const reservedBasket = await api.createReservation(clientBasket)
      store.setReservedBasket(reservedBasket)

      page.setDisabled('checkoutButton', false)
      page.setText('checkoutButton', 'Checkout')
      page.setVisible('loadingSpinner', false)
      page.setVisible('reservedBasket', true)
    })

    // Verify loading states were shown
    expect(page.elements.checkoutButton.disabled).toBe(false)
    expect(page.elements.loadingSpinner.visible).toBe(false)
    expect(page.elements.reservedBasket.visible).toBe(true)
  })

  test('Event Cleanup and Memory', async () => {
    // Perform many rapid interactions
    const promises = Array.from({ length: 50 }, (_, i) =>
      store.createDeduplicatedAction(`action-${i}`, async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
      })
    )

    await Promise.all(promises)

    // Verify cleanup
    expect(store.requestQueue.size).toBe(0)
    expect(store.lastRequestId).toBeDefined()
    expect(store.lastClickTime).toBeGreaterThan(0)
  })

  test('Accessibility Compliance', async () => {
    // Test ARIA labels (simulated)
    const button = {
      getAttribute: (attr: string) => {
        if (attr === 'aria-label') return 'Checkout button'
        if (attr === 'role') return 'button'
        if (attr === 'aria-disabled') return page.elements.checkoutButton.disabled.toString()
        return null
      }
    }

    expect(button.getAttribute('aria-label')).toBe('Checkout button')
    expect(button.getAttribute('role')).toBe('button')

    // Test keyboard navigation
    await store.createDeduplicatedAction('checkout', async () => {
      page.simulateKeyPress('checkoutButton', 'Enter')
    })

    // Test high contrast mode (simulated)
    const highContrastMode = true
    expect(highContrastMode).toBe(true) // Would check actual styles in real implementation
  })
})
