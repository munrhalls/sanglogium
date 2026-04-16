import { describe, it, expect } from 'vitest'
import type { ReservedBasket, BasketStatus } from '@/store/checkout/reservedBasketSlice'

// Extract the pure logic from the store getter
function calculateBasketStatus(basket: ReservedBasket | null): BasketStatus {
  if (!basket) return 'none'

  const hasEmptyProducts = basket.products.some(p => p.reservedQuantity === 0)
  const hasDecrements = basket.products.some(p => p.reservedQuantity < p.requestedQuantity)

  if (hasEmptyProducts) return 'empty'
  if (hasDecrements) return 'decremented'
  return 'full'
}

describe('basketStatus calculation', () => {
  it('should return "none" when no basket exists', () => {
    expect(calculateBasketStatus(null)).toBe('none')
  })

  it('should return "empty" when any product has 0 reserved quantity', () => {
    const basket: ReservedBasket = {
      reservationToken: 'token-123',
      idempotencyKey: 'key-123',
      expiresAt: '2024-01-01T00:00:00Z',
      amountPln: 100,
      products: [
        {
          id: 'product-1',
          name: 'Product 1',
          stripePriceId: 'price_1',
          requestedQuantity: 2,
          reservedQuantity: 0, // Empty product
          availableQuantity: 0,
          pricePln: 50,
          totalPricePln: 100,
          imageUrl: null,
          slug: 'product-1',
          brand: { id: 'brand-1', name: 'Brand 1', slug: 'brand-1' }
        },
        {
          id: 'product-2',
          name: 'Product 2',
          stripePriceId: 'price_2',
          requestedQuantity: 1,
          reservedQuantity: 1,
          availableQuantity: 1,
          pricePln: 50,
          totalPricePln: 50,
          imageUrl: null,
          slug: 'product-2',
          brand: { id: 'brand-2', name: 'Brand 2', slug: 'brand-2' }
        }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    expect(calculateBasketStatus(basket)).toBe('empty')
  })

  it('should return "decremented" when any product has less than requested', () => {
    const basket: ReservedBasket = {
      reservationToken: 'token-123',
      idempotencyKey: 'key-123',
      expiresAt: '2024-01-01T00:00:00Z',
      amountPln: 150,
      products: [
        {
          id: 'product-1',
          name: 'Product 1',
          stripePriceId: 'price_1',
          requestedQuantity: 3,
          reservedQuantity: 2, // Decremented
          availableQuantity: 2,
          pricePln: 50,
          totalPricePln: 100,
          imageUrl: null,
          slug: 'product-1',
          brand: { id: 'brand-1', name: 'Brand 1', slug: 'brand-1' }
        },
        {
          id: 'product-2',
          name: 'Product 2',
          stripePriceId: 'price_2',
          requestedQuantity: 1,
          reservedQuantity: 1,
          availableQuantity: 1,
          pricePln: 50,
          totalPricePln: 50,
          imageUrl: null,
          slug: 'product-2',
          brand: { id: 'brand-2', name: 'Brand 2', slug: 'brand-2' }
        }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    expect(calculateBasketStatus(basket)).toBe('decremented')
  })

  it('should return "full" when all products have full availability', () => {
    const basket: ReservedBasket = {
      reservationToken: 'token-123',
      idempotencyKey: 'key-123',
      expiresAt: '2024-01-01T00:00:00Z',
      amountPln: 100,
      products: [
        {
          id: 'product-1',
          name: 'Product 1',
          stripePriceId: 'price_1',
          requestedQuantity: 2,
          reservedQuantity: 2, // Full availability
          availableQuantity: 2,
          pricePln: 50,
          totalPricePln: 100,
          imageUrl: null,
          slug: 'product-1',
          brand: { id: 'brand-1', name: 'Brand 1', slug: 'brand-1' }
        }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    expect(calculateBasketStatus(basket)).toBe('full')
  })

  it('should prioritize "empty" status over "decremented"', () => {
    const basket: ReservedBasket = {
      reservationToken: 'token-123',
      idempotencyKey: 'key-123',
      expiresAt: '2024-01-01T00:00:00Z',
      amountPln: 150,
      products: [
        {
          id: 'product-1',
          name: 'Product 1',
          stripePriceId: 'price_1',
          requestedQuantity: 3,
          reservedQuantity: 0, // Empty
          availableQuantity: 0,
          pricePln: 50,
          totalPricePln: 0,
          imageUrl: null,
          slug: 'product-1',
          brand: { id: 'brand-1', name: 'Brand 1', slug: 'brand-1' }
        },
        {
          id: 'product-2',
          name: 'Product 2',
          stripePriceId: 'price_2',
          requestedQuantity: 2,
          reservedQuantity: 1, // Decremented
          availableQuantity: 1,
          pricePln: 50,
          totalPricePln: 50,
          imageUrl: null,
          slug: 'product-2',
          brand: { id: 'brand-2', name: 'Brand 2', slug: 'brand-2' }
        }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    expect(calculateBasketStatus(basket)).toBe('empty')
  })
})
