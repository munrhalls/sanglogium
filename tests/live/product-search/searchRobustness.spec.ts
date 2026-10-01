// # Execution Specs: Search Feature — Critical-Journey Robustness
//
// ## Selected Slice
// - Slice: searchProductsFull / searchProductsAutocomplete, called for real (no mocks)
// - Reason: sang-logium-3kk. The prior unit specs mocked sanityFetch and asserted GROQ
//   shapes the real implementation never produces (order-by sort, multi-call pagination
//   clamping) — a false-positive risk. These hit the live public Sanity CDN (read-only,
//   no token) so a pass proves the real query + scoring behavior, not a guess about it.
//   Fixtures are pulled from the live catalogue at run time, not hand-typed, so this
//   doesn't go stale as the catalogue changes.

import { describe, it, expect, vi, beforeAll } from 'vitest'
import groq from 'groq'
import { client } from '@/sanity-cms/lib/client'
import { searchProductsFull, searchProductsAutocomplete } from '@/sanity-cms/lib/products/searchProducts'

const TIMEOUT = 15000

let exactFixture: { name: string; sku: string; brandName: string }
let hyphenFragment: string

beforeAll(async () => {
  const filter = groq`_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0`
  // GROQ `match "*-*"` cannot express "name contains a hyphen": the match operator
  // tokenizes the pattern on the hyphen, so it degenerates to matching nearly every
  // product regardless of hyphens. Pull a bounded sample of real names instead and
  // extract a hyphenated fragment JS-side.
  const [withSku, names] = await Promise.all([
    client.fetch(groq`*[${filter} && defined(sku) && defined(brand)][0]{ name, sku, "brandName": brand->name }`),
    client.fetch(groq`*[${filter}]{ name }[0...500]`),
  ])
  exactFixture = withSku
  hyphenFragment = names
    ?.map((p: { name?: string }) => p.name?.match(/[A-Za-z0-9]+-[A-Za-z0-9]+/)?.[0])
    ?.find(Boolean)
}, TIMEOUT)

describe('search: critical-journey robustness (real catalogue, no mocks)', () => {
  it('too-short query returns empty instantly and never hits the network', async () => {
    const fetchSpy = vi.spyOn(client, 'fetch')
    const result = await searchProductsFull('a')
    expect(result).toEqual({ products: [], totalCount: 0, unfilteredCount: 0 })
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('exact SKU match returns that product as the top result', async () => {
    expect(exactFixture?.sku).toBeTruthy()
    const result = await searchProductsFull(exactFixture.sku)
    expect(result.products.length).toBeGreaterThan(0)
    expect(result.products[0].sku).toBe(exactFixture.sku)
  }, TIMEOUT)

  it('autocomplete ranks the exact SKU match first and caps at 6 results', async () => {
    const result = await searchProductsAutocomplete(exactFixture.sku)
    expect(result.length).toBeGreaterThan(0)
    expect(result.length).toBeLessThanOrEqual(6)
    expect(result[0].sku).toBe(exactFixture.sku)
  }, TIMEOUT)

  it('brand name plus a distinctive model word (two separate tokens) finds the product', async () => {
    const words = exactFixture.name.split(/\s+/).filter((w) => w.length > 3)
    const distinctiveWord = words.sort((a, b) => b.length - a.length)[0]
    const query = `${exactFixture.brandName} ${distinctiveWord}`
    const result = await searchProductsFull(query)
    expect(result.products.some((p) => p.sku === exactFixture.sku)).toBe(true)
  }, TIMEOUT)

  it('a real hyphenated model fragment (e.g. "LCD-2") returns a match without throwing', async () => {
    expect(hyphenFragment).toBeTruthy()
    const result = await searchProductsFull(hyphenFragment)
    expect(result.totalCount).toBeGreaterThan(0)
  }, TIMEOUT)

  it('a query guaranteed to match nothing returns a defined empty result, not an error', async () => {
    const result = await searchProductsFull('zzznonexistentproductqueryxyz999')
    expect(result).toEqual({ products: [], totalCount: 0, unfilteredCount: 0 })
  }, TIMEOUT)

  it('an out-of-range page clamps to the last valid page instead of erroring or emptying out', async () => {
    const first = await searchProductsFull('cable')
    expect(first.totalCount).toBeGreaterThan(24) // needs >1 page of real matches to prove anything
    const lastPage = Math.ceil(first.totalCount / 24)

    const farPage = await searchProductsFull('cable', undefined, 999999)
    const onLastPage = await searchProductsFull('cable', undefined, lastPage)

    expect(farPage.totalCount).toBe(first.totalCount)
    expect(farPage.products.length).toBeGreaterThan(0)
    expect(farPage.products.map((p) => p._id)).toEqual(onLastPage.products.map((p) => p._id))
  }, TIMEOUT)
})
