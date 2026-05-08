// # Execution Specs: Slice - Basket Page Data Layer - CMS Fetcher

// ## Selected Slice
// - Slice: CMS Fetcher - getBasketProducts
// - Reason: Fetches products from Sanity CMS for basket page

import { describe, it, expect } from 'vitest'
import { getBasketProducts } from '../../../../../../sanity-config/lib/products/getBasketProducts'

describe('getBasketProducts', () => {
  it('returns empty array for non-existent product IDs', async () => {
    // ARRANGE - setup test state with non-existent product IDs
    const ids = ['non-existent-product-1', 'non-existent-product-2']

    // ACT - call getBasketProducts with non-existent IDs
    const products = await getBasketProducts(ids)

    // ASSERT - verify empty array returned
    expect(products).toHaveLength(0)
  })

  it('returns empty array for empty input', async () => {
    // ARRANGE - setup test state with empty array
    const ids: string[] = []

    // ACT - call getBasketProducts with empty array
    const products = await getBasketProducts(ids)

    // ASSERT - verify empty array returned
    expect(products).toHaveLength(0)
  })
})
