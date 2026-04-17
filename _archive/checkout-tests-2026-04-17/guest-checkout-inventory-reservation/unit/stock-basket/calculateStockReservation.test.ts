import { describe, it, expect } from 'vitest'
import { calculateStockReservation, calculateBasketReservation } from '@/lib/checkout/reservation/stock-utils'

describe('calculateStockReservation', () => {
  it('calculates available stock correctly: stock - reservedStock', () => {
    const result = calculateStockReservation({
      requestedQuantity: 5,
      stock: 10,
      reservedStock: 3,
    })

    expect(result.availableStock).toBe(7)
    expect(result.reservedQuantity).toBe(5)
    expect(result.fullyReserved).toBe(true)
  })

  it('reserves full quantity when available stock >= requested', () => {
    const result = calculateStockReservation({
      requestedQuantity: 3,
      stock: 10,
      reservedStock: 5,
    })

    expect(result.reservedQuantity).toBe(3)
    expect(result.fullyReserved).toBe(true)
    expect(result.partiallyReserved).toBe(false)
  })

  it('reserves partial quantity when available stock < requested', () => {
    const result = calculateStockReservation({
      requestedQuantity: 5,
      stock: 10,
      reservedStock: 7,
    })

    expect(result.reservedQuantity).toBe(3)
    expect(result.fullyReserved).toBe(false)
    expect(result.partiallyReserved).toBe(true)
    expect(result.outOfStock).toBe(false)
  })

  it('returns out of stock when no availability', () => {
    const result = calculateStockReservation({
      requestedQuantity: 3,
      stock: 5,
      reservedStock: 5,
    })

    expect(result.reservedQuantity).toBe(0)
    expect(result.availableStock).toBe(0)
    expect(result.outOfStock).toBe(true)
  })

  it('handles zero stock gracefully', () => {
    const result = calculateStockReservation({
      requestedQuantity: 1,
      stock: 0,
      reservedStock: 0,
    })

    expect(result.availableStock).toBe(0)
    expect(result.reservedQuantity).toBe(0)
    expect(result.outOfStock).toBe(true)
  })
})

describe('calculateBasketReservation', () => {
  it('calculates totals for multiple products', () => {
    const items = [
      { requestedQuantity: 5, stock: 10, reservedStock: 0 },
      { requestedQuantity: 3, stock: 5, reservedStock: 2 },
    ]

    const result = calculateBasketReservation(items)

    expect(result.totalRequested).toBe(8)
    expect(result.totalReserved).toBe(8) // 5 + 3
    expect(result.allAvailable).toBe(true)
  })

  it('detects when not all products are fully available', () => {
    const items = [
      { requestedQuantity: 5, stock: 10, reservedStock: 0 },
      { requestedQuantity: 5, stock: 6, reservedStock: 2 }, // Only 4 available
    ]

    const result = calculateBasketReservation(items)

    expect(result.totalReserved).toBe(9) // 5 + 4
    expect(result.allAvailable).toBe(false)
  })
})
