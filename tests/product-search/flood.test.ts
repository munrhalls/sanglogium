// One visitor flooding search: how much of it reaches the catalogue?
//
// One question per list id. All yes means done:
//   S4  1,000 suggestion requests from one visitor within a minute: at most 120 reach the catalogue; another visitor
//       is still served at once, and the first is served again a minute later
//   S6  1,000 /search page requests from one visitor within a minute: the same
//
// The doors are the shop's own: the suggestion door is the Server Action the popup calls
// (actions/fetchSearchSuggestionsAction.ts), the page door is the one /search calls (server.ts getSearchPage). The
// visitor is who the request says it comes from (load.mjs gives each request the address the proof sets). The
// catalogue is a stand-in that counts the requests that read it and answers with one made-up product. The clock is
// a pretend one, so "a minute later" takes no time.
//
// The limit is held by each running copy of the server: a visitor whose requests are spread over many copies is
// held per copy (question S5, the owner's platform setting).
//
// A PASS line ended as its question says. A NO line says how many requests got through. Every judge is first shown
// counts made by hand and must say yes to a right one and NO to each wrong one.
//
// Exit 0 every question passed. 1 one or more are NO. 2 no verdict: the proof broke.
//
// node --import ./tools/alias-loader.mjs --import ./tests/product-search/load.mjs tests/product-search/flood.test.ts [S4 S6]

import { broken, chosen, report, run } from './proof.mjs'

const QUESTIONS = {
  S4: 'If one visitor sends 1,000 suggestion requests within a minute, do at most 120 of them reach the catalogue?',
  S6: 'If one visitor opens /search 1,000 times within a minute, do at most 120 of those reach the catalogue?',
}
const ASKED = chosen(Object.keys(QUESTIONS))
const FLOOD = 1000
const LIMIT = 120

function floodFindings({ through, otherServed, laterServed }) {
  const out = []
  if (through > LIMIT) out.push(`${through.toLocaleString('en')} of ${FLOOD.toLocaleString('en')} requests from one visitor reached the catalogue`)
  if (through === 0) out.push('not one request from the visitor reached the catalogue')
  if (!otherServed) out.push('another visitor right after was not served')
  if (!laterServed) out.push('the same visitor a minute later was not served')
  return out
}
function rulerOfJudges() {
  if (floodFindings({ through: 120, otherServed: true, laterServed: true }).length !== 0) return 'a held flood was judged no'
  if (floodFindings({ through: 121, otherServed: true, laterServed: true }).length !== 1) return 'a flood over the limit was judged yes'
  if (floodFindings({ through: 120, otherServed: false, laterServed: true }).length !== 1) return 'a locked-out visitor was judged yes'
  if (floodFindings({ through: 120, otherServed: true, laterServed: false }).length !== 1) return 'a visitor locked out for good was judged yes'
  return null
}

run(async () => {
  const broke = rulerOfJudges()
  if (broke) broken(broke)
  let now = 1_800_000_000_000
  Date.now = () => now
  let reads = 0
  const product = { _id: 'zyxwv-flood', name: 'Zyxwv Flood', sku: 'ZYX-1', brand: null, price_data: { currency: 'usd', unit_amount: 100 }, slug: { current: 'zyxwv-flood' }, image: null, catalogueLocationKeys: [], availableStock: 1, stock: 1, reservedStock: 0 }
  globalThis.__searchRead = async (query) => {
    reads += 1
    if (/^\s*count\(/.test(query)) return 1
    if (/\]\._id\s*$/.test(query)) return [product._id]
    return /match \$query\b/.test(query) ? [product] : null
  }
  const { fetchSearchSuggestionsAction } = await import('@/features/product-search/actions/fetchSearchSuggestionsAction')
  const door = await import('@/features/product-search/server')

  async function served(ask) {
    const before = reads
    await ask()
    return reads > before
  }
  async function flood(ask) {
    globalThis.__searchVisitor = '203.0.113.7'
    let through = 0
    for (let i = 0; i < FLOOD; i += 1) {
      now += 50
      if (await served(() => ask(`zyxwv flood ${i}`))) through += 1
    }
    globalThis.__searchVisitor = '198.51.100.9'
    const otherServed = await served(() => ask('zyxwv other'))
    globalThis.__searchVisitor = '203.0.113.7'
    now += 61_000
    const laterServed = await served(() => ask('zyxwv later'))
    globalThis.__searchVisitor = undefined
    now += 61_000
    return { through, otherServed, laterServed }
  }
  const page = async (q) => {
    const p = await door.getSearchPage({ q })
    if (p.kind === 'results') await p.resultsPromise
  }

  const results = []
  if (ASKED.includes('S4')) results.push({ id: 'S4', text: QUESTIONS.S4, checked: FLOOD + 2, unit: 'requests', perCase: false, findings: floodFindings(await flood((q) => fetchSearchSuggestionsAction(q))) })
  if (ASKED.includes('S6')) results.push({ id: 'S6', text: QUESTIONS.S6, checked: FLOOD + 2, unit: 'requests', perCase: false, findings: floodFindings(await flood(page)) })
  return report(results)
})
