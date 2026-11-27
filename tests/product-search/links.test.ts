// Where search sends a shopper: does every address lead to a page that exists and lists products?
//
// One question per list id. All yes means done:
//   L1  every page jump written in the jump rule (detectSearchRedirect.ts) opens a real category page, every filter in
//       its address becomes an active filter there, and the page lists products
//   L2  every shortcut search offers (category shortcuts, popular searches, a brand shortcut for every brand that has
//       products, "Browse all products") leads to a page that lists products
//   L3  every product the shop sells has a product page that opens, at the address search links to
//
// Each address is opened through the shop's own code against the real catalogue: a listing address through the
// listing door (features/products/server.ts getListingPage, the one the /products routes call, query string
// included), a search through the search door, a product address through the product page door (getProductPage).
// The addresses come from the shop's own files and rules (the jump rule's addresses, CATEGORY_SUGGESTIONS,
// POPULAR_SEARCHES, buildSuggestionEntries, productHref), never typed into this proof.
//
// A PASS line ended as its question says. A NO line did not; each finding names the address. Every judge is first
// shown pages made by hand and must say yes to a good one and NO to each bad one.
//
// Exit 0 every question passed. 1 one or more are NO. 2 no verdict: a catalogue read failed or the proof broke.
//
// node --import ./tools/alias-loader.mjs --import ./tests/product-search/load.mjs tests/product-search/links.test.ts [L1 L2 L3]

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { broken, chosen, report, run } from './proof.mjs'
import { openCatalogue } from './live.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const QUESTIONS = {
  L1: "Does every word that search turns into a page jump (like 'iem' or 'closed back') land on a real category page that understands every filter in the address and lists products?",
  L2: "Does every shortcut search offers (category shortcuts, popular searches, brand shortcuts, 'Browse all products') lead to a page that lists products?",
  L3: 'Does every product search can show link to a product page that opens?',
}
const ASKED = chosen(Object.keys(QUESTIONS))

// ---- judges ----
// page: { notFound } | { chips: [{ path, value? }], totalCount }
function listingFinding(address, page) {
  if (page.notFound) return `${address} is a page that does not exist`
  const wanted = [...new URL(address, 'https://shop.invalid').searchParams].filter(([key]) => key !== 'page' && key !== 'sort')
  for (const [key, value] of wanted) {
    if (!page.chips.some((chip) => chip.path === key && (chip.value === undefined || chip.value === value))) return `${address} ignores ${key}=${value}`
  }
  return page.totalCount > 0 ? null : `${address} lists no products`
}
const searchFinding = (term, page, listing) => {
  if (page.redirect) return listing
  return page.totalCount > 0 ? null : `the popular search "${term}" finds nothing`
}
const productFinding = (product, page) => (page?._id === product._id ? null : `"${product.name}" at /product/${product.slug} does not open`)

function rulerOfJudges() {
  const good = { chips: [{ path: 'acousticDesign', value: 'closed-back' }], totalCount: 3 }
  const at = '/products/headphones?acousticDesign=closed-back'
  if (listingFinding(at, good) !== null) return 'a good page was judged no'
  if (listingFinding(at, { notFound: true }) === null) return 'a missing page was judged yes'
  if (listingFinding(at, { chips: [], totalCount: 3 }) === null) return 'an ignored filter was judged yes'
  if (listingFinding(at, { ...good, totalCount: 0 }) === null) return 'an empty page was judged yes'
  if (listingFinding(at, { chips: [{ path: 'acousticDesign', value: 'open-back' }], totalCount: 3 }) === null) return 'another value was judged yes'
  if (searchFinding('x', { totalCount: 0 }) === null || searchFinding('x', { totalCount: 1 }) !== null) return 'the search judge is wrong'
  if (productFinding({ _id: 'a', name: 'A', slug: 'a' }, null) === null || productFinding({ _id: 'a' }, { _id: 'a' }) !== null) return 'the product judge is wrong'
  return null
}

run(async () => {
  const broke = rulerOfJudges()
  if (broke) broken(broke)
  const catalogue = await openCatalogue()
  globalThis.__searchRead = (query, params) => catalogue.read(query, params)
  const products = await import('@/features/products/server')
  const search = await import('@/features/product-search/server')
  const { CATEGORY_SUGGESTIONS, POPULAR_SEARCHES } = await import('@/features/product-search/core/definitions/searchSuggestions')
  const { buildSuggestionEntries } = await import('@/features/product-search/core/rules/suggestionEntries')
  const { productHref } = await import('@/features/product-search/url/searchLinks')

  const pages = new Map()
  async function openListing(address) {
    if (!pages.has(address)) {
      pages.set(address, (async () => {
        const url = new URL(address, 'https://shop.invalid')
        if (!/^\/products(\/|$)/.test(url.pathname)) return { notFound: true }
        const parts = url.pathname.split('/').filter(Boolean).slice(1)
        const query = {}
        for (const [key, value] of url.searchParams) query[key] = key in query ? [].concat(query[key], value) : value
        const result = await products.getListingPage({ slug: parts.length ? parts : null, query })
        return result.notFound ? { notFound: true } : { chips: result.filter.chips, totalCount: result.totalCount }
      })())
    }
    return pages.get(address)
  }

  const results = []
  if (ASKED.includes('L1')) {
    const rule = readFileSync(path.join(root, 'features/product-search/core/rules/detectSearchRedirect.ts'), 'utf8')
    const targets = [...new Set([...rule.matchAll(/['"`](\/products[^'"`]*)['"`]/g)].map((m) => m[1]))].sort()
    if (targets.length === 0) broken('the jump rule holds no address')
    const findings = (await Promise.all(targets.map(async (t) => listingFinding(t, await openListing(t))))).filter(Boolean)
    results.push({ id: 'L1', text: QUESTIONS.L1, checked: targets.length, unit: 'jump addresses', findings })
  }
  if (ASKED.includes('L2') || ASKED.includes('L3')) {
    const sold = (await catalogue.read('*[_type == "product" && count(catalogueLocationKeys) > 0]{ _id, name, "slug": slug.current, catalogueLocationKeys, "brand": brand->{ name, slug } }'))
    const index = JSON.parse(readFileSync(path.join(root, 'data/catalogue-index.json'), 'utf8'))
    const places = new Set(Object.keys(index.slotMetadataMap))
    const shop = sold.filter((p) => p.catalogueLocationKeys.some((k) => places.has(k))).sort((a, b) => (a.name < b.name ? -1 : 1))
    if (ASKED.includes('L2')) {
      const cases = []
      for (const c of CATEGORY_SUGGESTIONS) cases.push(['category shortcut', c.href, async () => listingFinding(c.href, await openListing(c.href))])
      cases.push(['all products', '/products', async () => listingFinding('/products', await openListing('/products'))])
      for (const term of POPULAR_SEARCHES) {
        cases.push(['popular search', term, async () => {
          const page = await search.getSearchPage({ q: term })
          if (page.kind === 'redirect') return searchFinding(term, { redirect: page.to }, listingFinding(page.to, await openListing(page.to)))
          return searchFinding(term, await page.resultsPromise)
        }])
      }
      const brands = new Map()
      for (const p of shop) if (p.brand?.name) brands.set(p.brand.name, p.brand)
      for (const brand of [...brands.values()].sort((a, b) => (a.name < b.name ? -1 : 1))) {
        cases.push(['brand shortcut', brand.name, async () => {
          const entry = buildSuggestionEntries(brand.name, [{ brand }]).find((e) => e.kind === 'brand')
          if (!entry) return `typing "${brand.name}" offers no shortcut to the brand`
          return listingFinding(entry.href, await openListing(entry.href))
        }])
      }
      const findings = (await Promise.all(cases.map(async ([, , judge]) => judge()))).filter(Boolean)
      results.push({ id: 'L2', text: QUESTIONS.L2, checked: cases.length, unit: 'shortcuts', findings })
    }
    if (ASKED.includes('L3')) {
      const findings = (await Promise.all(shop.map(async (p) => {
        const href = productHref(p.slug)
        if (href !== `/product/${p.slug}`) return `"${p.name}" links to ${href}, which is not its product page`
        const page = await products.getProductPage(p.slug)
        return productFinding(p, page.product)
      }))).filter(Boolean)
      results.push({ id: 'L3', text: QUESTIONS.L3, checked: shop.length, unit: 'products', findings })
    }
  }
  if (catalogue.stats.failed > 0) broken(`${catalogue.stats.failed} catalogue reads failed`)
  const grouping = await catalogue.sameAsSingle()
  if (grouping) broken(grouping)
  return report(results)
})
