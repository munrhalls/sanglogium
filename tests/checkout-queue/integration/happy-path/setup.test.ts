// Setup test: Verify test dataset and product fetching
import { describe, it, expect } from 'vitest'
import { getTestProducts } from '@/tests/helpers/test-data'

describe('Test setup verification', () => {
  it('fetches products from test dataset', async () => {
    const products = await getTestProducts()
    expect(Array.isArray(products)).toBe(true)
    expect(products.length).toBeGreaterThan(0)
    expect(products[0]._id).toBeDefined()
    expect(products[0].stock).toBeDefined()
    expect(products[0].reservedStock).toBeDefined()
  })
})
