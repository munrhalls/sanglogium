import { describe, it, expect } from 'vitest'
import { useBasketStore } from '@/store/store'

describe('basket store shape', () => {
  it('stores items with _id and quantity fields', () => {
    const store = useBasketStore.getState()

    // Verify it's a Zustand store
    expect(store).toBeDefined()
    expect(store.basket).toBeInstanceOf(Array)

    // Add an item
    store.addItem({ _id: 'test-123', quantity: 1, stock: 10 })

    // Verify basket contains the item with _id and quantity
    const basket = useBasketStore.getState().basket
    expect(basket).toHaveLength(1)
    expect(basket[0]._id).toBe('test-123')
    expect(basket[0].quantity).toBe(1)

    // Clean up
    store.clearBasket()
  })
})
