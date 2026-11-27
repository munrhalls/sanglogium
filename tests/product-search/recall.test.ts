// What a shopper types: is the product they meant shown, and shown first?
//
// One question per list id. All yes means done:
//   R1  the exact name -> the product is the first result
//   R2  the exact SKU -> first result
//   R3  the brand, then the name (names that do not start with their brand) -> first result
//   R4  the name without the brand words at its start -> first result
//   R5  the name in small letters, or in capitals -> first result
//   R6  letters and numbers joined ('HD800S') or split ('HD 800 S'), or extra spaces -> first result
//   R7  the name with its symbols left out, or turned into spaces -> first result
//   R8  the name with accented letters written plainly ('Zahl') -> first result
//   R9  the SKU in small letters, or without its dashes -> first result
//   R10 part of the name -> among the results; all but the last two letters -> also among the six suggestions
//   R11 a brand -> every product of the brand in the results, ahead of every other brand's product
//   R12 a brand in small letters, or without its spaces and symbols -> every product of the brand in the results
//   F1  a product type or a feature word the shop filters by, written loosely -> that type's or feature's page
//   A1  for every search above that shows results, the suggestions are the first results, in the same order
//   E3  odd input (very long, symbols, code-like text, emoji, odd page/sort/category values) -> an ordinary page, no error
//   P1  only published products: the shop's catalogue read asks for published documents and carries no key
//
// What the shop sells is read on its own: every published product with a place in data/catalogue-index.json.
// Every search runs through the shop's own server door (features/product-search/server.ts) against the real
// catalogue, as /search and the suggestion popup call it: the words trimmed, the way the search box sends them.
// "First result" means first on /search?q=<words>. A search that jumps to a category page shows no results.
//
// A PASS line ended as its question says. A NO line did not; each finding says what happened. A NO is a true
// answer: do not edit a question to match the shop. Before the shop is judged, every judge is shown answers
// we spoiled on purpose and must say NO for exactly the spoiled case (proof.mjs spoilTest).
//
// The same catalogue gives the same answer twice: no clock, no dice, every list sorted.
// Exit 0 every question passed. 1 one or more are NO. 2 no verdict: a catalogue read failed or the proof broke.
//
// node --import ./tools/alias-loader.mjs --import ./tests/product-search/load.mjs tests/product-search/recall.test.ts [R1 …] [--full]

import { readFileSync } from 'node:fs'
import { AsyncLocalStorage } from 'node:async_hooks'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { broken, chosen, report, run, spoilTest } from './proof.mjs'
import { openCatalogue } from './live.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const QUESTIONS = {
  R1: 'If a shopper types the exact name of any product the shop sells and presses Search, is that product the first result?',
  R2: "If a shopper types a product's SKU exactly, is that product the first result?",
  R3: 'If a shopper types the brand and then the product name, for a product whose name does not start with its brand, is that product the first result?',
  R4: "If a shopper types a product's name without the brand words at its start, is that product the first result?",
  R5: "If a shopper types a product's name all in small letters, or all in capitals, is that product still the first result?",
  R6: "If a shopper types a product's name with the spaces between letters and numbers left out or put in ('HD800S' or 'HD 800 S'), or with extra spaces, is that product still the first result?",
  R7: "If a shopper types a product's name with its dashes, slashes, plus signs, inch marks and other symbols left out, or turned into spaces, is that product still the first result?",
  R8: "If a shopper types a product's name with its accented letters written plainly ('Zahl' for 'Zähl'), is that product still the first result?",
  R9: "If a shopper types a product's SKU in small letters, or without its dashes, is that product still the first result?",
  R10: "If a shopper has typed only part of a product's name (all but its last two letters, or its first 60 percent), is that product among the results, and for all-but-two-letters among the six suggestions?",
  R11: "If a shopper types a brand's name, is every product of that brand in the results, ahead of every product of other brands?",
  R12: "If a shopper types a brand's name in small letters, or without its spaces, dashes and symbols ('audiotechnica'), is every product of that brand still in the results?",
  F1: "If a shopper types a product type or a feature the shop filters by ('iem', 'dac', 'closed back', 'planar magnetic'), written loosely, do they land on that type's or feature's page?",
  A1: 'For the same words, are the first suggestions the same products, in the same order, as the first results on /search?',
  E3: 'If someone sends a search thousands of characters long, or made of symbols, quotes, code-like text or emoji, or odd page, sort and category values, does the shop answer with an ordinary page and no error?',
  P1: 'Does search only ever show products that are published?',
}
const ASKED = chosen(Object.keys(QUESTIONS))

// ---- spellings: each is one plain rewrite of the real name, brand or SKU ----
const normal = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
const squeeze = (s) => s.replace(/\s+/g, ' ').trim()
const joinLettersNumbers = (s) => s.replace(/([A-Za-z])\s+(?=\d)/g, '$1').replace(/(\d)\s+(?=[A-Za-z])/g, '$1')
const splitLettersNumbers = (s) => s.replace(/([A-Za-z])(?=\d)/g, '$1 ').replace(/(\d)(?=[A-Za-z])/g, '$1 ')
const symbolsLeftOut = (s) => squeeze(s.replace(/[^\p{L}\p{N}\s]/gu, ''))
const symbolsAsSpaces = (s) => squeeze(s.replace(/[^\p{L}\p{N}]+/gu, ' '))
const plainLetters = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC')
const hasSymbol = (s) => /[^\p{L}\p{N}\s]/u.test(s)
const startsWithBrand = (p) => p.brand && p.name.toLowerCase().startsWith(`${p.brand.toLowerCase()} `)

function main_cases(sold, brands) {
  const cases = { R1: [], R2: [], R3: [], R4: [], R5: [], R6: [], R7: [], R8: [], R9: [], R10: [], R11: [], R12: [] }
  const add = (id, product, text, how = '') => {
    if (normal(text).length >= 2) cases[id].push({ key: text.trim(), product, how })
  }
  for (const p of sold) {
    add('R1', p, p.name)
    add('R2', p, p.sku)
    if (p.brand && !normal(p.name).startsWith(normal(p.brand))) add('R3', p, `${p.brand} ${p.name}`)
    if (startsWithBrand(p)) add('R4', p, p.name.slice(p.brand.length + 1))
    add('R5', p, p.name.toLowerCase(), 'small letters')
    add('R5', p, p.name.toUpperCase(), 'capitals')
    if (joinLettersNumbers(p.name) !== p.name) add('R6', p, joinLettersNumbers(p.name), 'joined')
    if (splitLettersNumbers(p.name) !== p.name) add('R6', p, splitLettersNumbers(p.name), 'split')
    if (p.name.includes(' ')) add('R6', p, p.name.replace(/ /g, '   '), 'extra spaces')
    if (hasSymbol(p.name)) {
      add('R7', p, symbolsLeftOut(p.name), 'symbols left out')
      add('R7', p, symbolsAsSpaces(p.name), 'symbols as spaces')
    }
    if (plainLetters(p.name) !== p.name) add('R8', p, plainLetters(p.name))
    add('R9', p, p.sku.toLowerCase(), 'small letters')
    if (symbolsLeftOut(p.sku) !== p.sku) add('R9', p, symbolsLeftOut(p.sku), 'without dashes')
    if (p.name.length >= 6) add('R10', p, p.name.slice(0, -2), 'all but two letters')
    add('R10', p, p.name.slice(0, Math.ceil(p.name.length * 0.6)), 'first 60 percent')
  }
  for (const [brand, products] of brands) {
    for (const p of products) add('R11', p, brand)
    const forms = new Set([brand.toLowerCase(), brand.replace(/[^\p{L}\p{N}]/gu, '')].filter((f) => f !== brand))
    for (const form of forms) for (const p of products) add('R12', p, form)
  }
  for (const list of Object.values(cases)) for (const c of list) c.label = `${c.how ? `${c.how}: ` : ''}"${c.key}"`
  return cases
}

// ---- judges: (case, answer) -> finding | null ----
let names = new Map()
const nameOf = (id) => `"${names.get(id) ?? id}"`
const placeOf = (answer, id) => answer.all.indexOf(id)

function firstResult(c, a) {
  if (a.redirect) return `${c.label} jumps to ${a.redirect}`
  const at = placeOf(a, c.product._id)
  if (at === 0) return null
  if (at < 0) return `${c.label} does not show it (${a.total} results)`
  return `${c.label} shows it at place ${at + 1}, after ${nameOf(a.all[0])}`
}

function partOfName(c, a) {
  if (a.redirect) return `${c.label} jumps to ${a.redirect}`
  if (placeOf(a, c.product._id) < 0) return `${c.label} does not show it (${a.total} results)`
  if (c.how === 'all but two letters' && !a.suggestions.includes(c.product._id)) return `${c.label} does not suggest it`
  return null
}

function brandAhead(c, a, brandIds) {
  if (a.redirect) return `${c.label} jumps to ${a.redirect}`
  const at = placeOf(a, c.product._id)
  if (at < 0) return `${c.label} does not show "${c.product.name}" (${a.total} results)`
  const other = a.all.slice(0, at).find((id) => !brandIds.has(id))
  return other ? `${c.label} shows "${c.product.name}" at place ${at + 1}, after ${nameOf(other)} of another brand` : null
}

function brandFound(c, a) {
  if (a.redirect) return `${c.label} jumps to ${a.redirect}`
  return placeOf(a, c.product._id) < 0 ? `${c.label} does not show "${c.product.name}" (${a.total} results)` : null
}

function sameOrder(c, a) {
  const first = a.all.slice(0, 6)
  if (first.length === a.suggestions.length && first.every((id, i) => id === a.suggestions[i])) return null
  return `"${c.key}": suggests ${a.suggestions.map(nameOf).join(', ') || 'nothing'}; /search starts ${first.map(nameOf).join(', ') || 'with nothing'}`
}

const without = (id) => (c, a) => (a && !a.redirect ? { ...a, all: a.all.filter((x) => x !== id), suggestions: a.suggestions.filter((x) => x !== id) } : null)
const removeProduct = (c, a) => without(c.product._id)(c, a)
const swapTwo = (c, a) => (a && a.suggestions.length >= 2 ? { ...a, suggestions: [a.suggestions[1], a.suggestions[0], ...a.suggestions.slice(2)] } : null)

// The judges, tried on answers made by hand before any real answer is judged.
function rulerOfJudges() {
  const p = { _id: 'p', name: 'Pretend Phone' }
  const c = { key: 'Pretend Phone', product: p, label: '"Pretend Phone"', how: '' }
  const cut = { ...c, how: 'all but two letters' }
  const ok = { all: ['p', 'q'], suggestions: ['p', 'q'], total: 2 }
  const second = { all: ['q', 'p'], suggestions: ['q', 'p'], total: 2 }
  const none = { all: ['q'], suggestions: ['q'], total: 1 }
  const jump = { redirect: '/products/headphones', suggestions: ['p'] }
  if (firstResult(c, ok) !== null) return 'first place was judged no'
  for (const bad of [second, none, jump]) if (firstResult(c, bad) === null) return 'a product not in first place was judged yes'
  if (partOfName(cut, { ...ok, suggestions: [] }) === null) return 'a missing suggestion was judged yes'
  if (partOfName(c, second) !== null || partOfName(c, none) === null) return 'the part-of-name judge is wrong'
  const own = new Set(['p'])
  if (brandAhead(c, ok, own) !== null || brandAhead(c, second, own) === null || brandAhead(c, none, own) === null) return 'the brand judge is wrong'
  if (brandFound(c, second) !== null || brandFound(c, none) === null) return 'the brand-found judge is wrong'
  if (sameOrder(c, ok) !== null || sameOrder(c, { ...ok, suggestions: ['q', 'p'] }) === null || sameOrder(c, { ...ok, suggestions: ['p'] }) === null) return 'the same-order judge is wrong'
  return null
}

// ---- P1: the shop's catalogue read, read as text ----
const strip = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
function publishedOnly(client, adapter) {
  const options = client.match(/createClient\(\{([\s\S]*?)\}\)/)?.[1]
  if (options === undefined) return 'the shop no longer makes its catalogue read with createClient({...}): read it again'
  if (!/\bperspective:\s*["']published["']/.test(options)) return 'the catalogue read does not ask for published documents only'
  if (/\btoken\s*:/.test(options)) return 'the catalogue read carries a key, which can see drafts'
  if (!/from\s+['"]@\/platform\/sanity\/client['"]/.test(adapter)) return 'search reads the catalogue through another client'
  return null
}
function rulerOfPublished() {
  const good = 'export const client = createClient({ projectId, useCdn: true, perspective: "published" })'
  const adapter = "import { sanityFetch } from '@/platform/sanity/client'"
  if (publishedOnly(good, adapter) !== null) return 'a published-only read was judged no'
  if (publishedOnly(good.replace('published', 'drafts'), adapter) === null) return 'a drafts read was judged yes'
  if (publishedOnly(good.replace('useCdn: true', 'token: x'), adapter) === null) return 'a read with a key was judged yes'
  if (publishedOnly(good, "import { backendClient } from '@/platform/sanity/backendClient'") === null) return 'another client was judged yes'
  return null
}

// ---- F1: type and feature words; the page each one should land on ----
const HEADPHONES = '/products/headphones'
const LANDINGS = [
  [['headphones', 'Headphone'], HEADPHONES],
  // In-ear products have their own category (the shop's "IEMs" shortcut); the headphones filter has no wearing style.
  [['iem', 'IEMs', 'in-ear', 'in ear', 'In-Ear Monitors', 'earbuds', 'ear buds', 'earphones'], `${HEADPHONES}/monitors-iems`],
  [['dac', 'DACs', 'digital to analog converter'], '/products/audio-electronics?deviceType=dac'],
  [['accessories', 'Accessory'], '/products/accessories'],
  ...[
    ['closed back', 'acousticDesign=closed-back'], ['open back', 'acousticDesign=open-back'], ['semi open', 'acousticDesign=semi-open'],
    ['planar magnetic', 'driverType=planar-magnetic'], ['electrostatic', 'driverType=electrostatic'], ['dynamic', 'driverType=dynamic'],
  ].map(([words, filter]) => {
    const joined = words.replace(' ', '')
    const dashed = words.replace(' ', '-')
    return [[...new Set([words, dashed, joined, `${dashed} headphones`, `${words.toUpperCase()} HEADPHONE`])], `${HEADPHONES}?${filter}`]
  }),
]
const landingCases = LANDINGS.flatMap(([forms, to]) => forms.map((form) => ({ key: form, to })))
const lands = (c, a) => (a.redirect === c.to ? null : `"${c.key}" ${a.redirect ? `lands on ${a.redirect}` : 'stays on /search'}, not ${c.to}`)

// ---- E3: odd input ----
const ODD = [
  ['a 10,000-letter word', { q: 'x'.repeat(10000) }],
  ['one short word 3,000 times', { q: 'hd '.repeat(3000) }],
  ['quotes and pipes', { q: '") || true || ("' }],
  ['a script tag', { q: '<script>alert(1)</script>' }],
  ['only stars', { q: '**' }],
  ['a star inside a word', { q: 'a*b' }],
  ['a backslash', { q: '\\' }],
  ['a percent code', { q: '%00' }],
  ['only emoji', { q: '😀😀' }],
  ['emoji and a word', { q: '😀 fiio' }],
  ['a query-language name', { q: '$query' }],
  ['a hidden control character', { q: 'ab\u0000cd' }],
  ['fifty spaces', { q: ' '.repeat(50) }],
  ['page "abc"', { q: 'fiio', page: 'abc' }],
  ['page -1', { q: 'fiio', page: '-1' }],
  ['page 999999', { q: 'fiio', page: '999999' }],
  ['an unknown sort', { q: 'fiio', sort: 'junk' }],
  ['an unknown category', { q: 'fiio', cat: 'junk' }],
  ['two words given twice', { q: ['fiio', 'sennheiser'] }],
  ['two categories', { q: 'fiio', cat: ['headphones', 'accessories'] }],
  ['an unknown filter value', { q: 'fiio', brand: 'no-such-brand' }],
]
const scope = new AsyncLocalStorage()

async function oddAnswer(door, params) {
  const logged = []
  return scope.run({ logged, failReads: params.failReads === true }, async () => {
    try {
      const q = Array.isArray(params.q) ? params.q[0] : params.q
      const suggestions = await door.getSuggestions(q)
      if (!Array.isArray(suggestions)) return 'the suggestions are not a list'
      const page = await door.getSearchPage(params)
      if (page.kind === 'redirect') return typeof page.to === 'string' && page.to.startsWith('/') ? null : `it jumps to "${page.to}"`
      const r = await page.resultsPromise
      if (!Array.isArray(r?.products) || !Number.isInteger(r.totalCount) || r.totalCount < r.products.length) return 'the results are not a list with a count'
      if (logged.length > 0) return `the shop logged an error: ${logged[0].slice(0, 120)}`
      return null
    } catch (error) {
      return `the shop threw: ${String(error?.message ?? error).slice(0, 120)}`
    }
  })
}

// ---- the run ----
run(async () => {
  const broke = rulerOfJudges() || rulerOfPublished()
  if (broke) broken(broke)

  const catalogue = await openCatalogue()
  globalThis.__searchRead = (query, params) => {
    if (scope.getStore()?.failReads) throw new Error('the catalogue is switched off on purpose')
    return catalogue.read(query, params)
  }
  const realError = console.error
  console.error = (...parts) => {
    const store = scope.getStore()
    if (store) store.logged.push(parts.map(String).join(' '))
    else realError(...parts)
  }
  const door = await import('@/features/product-search/server')

  const index = JSON.parse(readFileSync(path.join(root, 'data/catalogue-index.json'), 'utf8'))
  const places = new Set(Object.keys(index.slotMetadataMap))
  const everything = await catalogue.read('*[_type == "product"]{ _id, name, sku, "brand": brand->name, catalogueLocationKeys }')
  const sold = everything.filter((p) => (p.catalogueLocationKeys ?? []).some((k) => places.has(k))).sort((a, b) => (a.name < b.name ? -1 : 1))
  if (sold.length === 0) broken('the catalogue sells nothing')
  names = new Map(everything.map((p) => [p._id, p.name]))
  const brands = new Map()
  for (const p of sold) if (p.brand) brands.set(p.brand, [...(brands.get(p.brand) ?? []), p])

  const cases = main_cases(sold, brands)
  const needAll = new Set([...cases.R10, ...cases.R11, ...cases.R12].map((c) => c.key))
  const texts = [...new Set(Object.values(cases).flat().map((c) => c.key))].sort()

  const answers = new Map()
  async function answer(text) {
    const suggestions = (await door.getSuggestions(text)).map((p) => p._id)
    const page = await door.getSearchPage({ q: text })
    if (page.kind === 'redirect') return { redirect: page.to, suggestions }
    const first = await page.resultsPromise
    const all = first.products.map((p) => p._id)
    if (needAll.has(text)) {
      for (let n = 2; all.length < first.totalCount && n <= first.totalCount; n += 1) {
        const next = await (await door.getSearchPage({ q: text, page: String(n) })).resultsPromise
        if (next.products.length === 0) break
        all.push(...next.products.map((p) => p._id))
      }
    }
    return { all, suggestions, total: first.totalCount }
  }
  let next = 0
  await Promise.all(Array.from({ length: 300 }, async () => {
    while (next < texts.length) {
      const text = texts[next++]
      answers.set(text, await answer(text))
    }
  }))
  const odd = []
  for (const [label, params] of ODD) odd.push([label, await oddAnswer(door, params)])
  const oddSpoiled = await oddAnswer(door, { q: 'fiio', failReads: true })

  if (catalogue.stats.failed > 0) broken(`${catalogue.stats.failed} catalogue reads failed`)
  const grouping = await catalogue.sameAsSingle()
  if (grouping) broken(grouping)
  if (oddSpoiled === null) broken('E3 judged a switched-off catalogue an ordinary page')

  const brandIds = new Map([...brands].map(([b, ps]) => [b, new Set(ps.map((p) => p._id))]))
  const judges = {
    R1: firstResult, R2: firstResult, R3: firstResult, R4: firstResult, R5: firstResult, R6: firstResult,
    R7: firstResult, R8: firstResult, R9: firstResult, R10: partOfName,
    R11: (c, a) => brandAhead(c, a, brandIds.get(c.key)), R12: brandFound,
  }
  const results = []
  for (const id of ASKED) {
    if (judges[id]) {
      const list = cases[id]
      const spoiled = spoilTest(list, judges[id], answers, removeProduct)
      if (spoiled) broken(`${id}: ${spoiled}`)
      results.push({ id, text: QUESTIONS[id], checked: list.length, unit: 'searches', findings: list.map((c) => judges[id](c, answers.get(c.key))).filter(Boolean) })
    }
    if (id === 'F1') {
      const landed = new Map(await Promise.all(landingCases.map(async (c) => {
        const page = await door.getSearchPage({ q: c.key })
        return [c.key, page.kind === 'redirect' ? { redirect: page.to } : {}]
      })))
      const spoiled = spoilTest(landingCases, lands, landed, (c, a) => ({ redirect: `${a.redirect}x` }))
      if (spoiled) broken(`F1: ${spoiled}`)
      results.push({ id, text: QUESTIONS.F1, checked: landingCases.length, unit: 'words', findings: landingCases.map((c) => lands(c, landed.get(c.key))).filter(Boolean) })
    }
    if (id === 'A1') {
      const list = texts.filter((t) => !answers.get(t).redirect).map((t) => ({ key: t }))
      const spoiled = spoilTest(list, sameOrder, answers, swapTwo)
      if (spoiled) broken(`A1: ${spoiled}`)
      results.push({ id, text: QUESTIONS.A1, checked: list.length, unit: 'searches', findings: list.map((c) => sameOrder(c, answers.get(c.key))).filter(Boolean) })
    }
    if (id === 'E3') {
      results.push({ id, text: QUESTIONS.E3, checked: odd.length, unit: 'odd inputs', findings: odd.filter(([, f]) => f).map(([label, f]) => `${label}: ${f}`) })
    }
    if (id === 'P1') {
      const read = (file) => strip(readFileSync(path.join(root, file), 'utf8'))
      const finding = publishedOnly(read('platform/sanity/client.ts'), read('features/product-search/adapters/sanity/searchProducts.ts'))
      results.push({ id, text: QUESTIONS.P1, checked: 1, unit: 'catalogue read', findings: finding ? [finding] : [] })
    }
  }
  process.stderr.write(`(${catalogue.stats.requests} catalogue requests, ${Math.round(catalogue.stats.bytes / 1e6)} MB, ${texts.length} searches)\n`)
  return report(results)
})
