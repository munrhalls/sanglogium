import { describe, it, expect } from 'vitest'
import { getBasketProducts } from '../../../../../../sanity-cms/lib/products/getBasketProducts'

const TEST_PRODUCT_ID = process.env.TEST_PRODUCT_ID || 'k27n1AQuIbSr5iozFz7EE4'

describe('getBasketProducts', () => {
  it('returns empty array for non-existent product IDs', async () => {
    const ids = ['non-existent-product-1', 'non-existent-product-2']
    const products = await getBasketProducts(ids)
    expect(products).toHaveLength(0)
  })

  it('returns products with correct shape for real product IDs', async () => {
    const products = await getBasketProducts([TEST_PRODUCT_ID])

    expect(products).toHaveLength(1)
    expect(products[0]._id).toBe(TEST_PRODUCT_ID)
    expect(typeof products[0].name).toBe('string')
    expect(products[0].name.length).toBeGreaterThan(0)
    expect(products[0].price_data).toBeDefined()
    expect(typeof products[0].price_data.unit_amount).toBe('number')
    expect(typeof products[0].price_data.currency).toBe('string')
    expect(typeof products[0].stock).toBe('number')
    expect(typeof products[0].reservedStock).toBe('number')
  })
})
