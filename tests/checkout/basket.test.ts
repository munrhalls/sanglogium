// The basket the rate was for.
//
// One question. A shipping price stays only for the goods it was offered for.
// The parcel is the sum of quantities of each product. The same goods, in any
// line order, or split across lines, are the same parcel. A different quantity
// or a different product is a different parcel, and the old price is then gone.
// The address stays. Checkout still opens on the address step.
//
// A PASS line ended as its sentence says. A NO line did not, and the text after
// NO is what actually happened. A NO is a true answer. Do not edit the sentence
// to match the shop.
//
// The goods and the price are written here. Nothing here waits, rolls dice, or
// calls the carrier, the registry, the bank, or Sanity. The same run twice
// gives the same answer.
//
// 0 every line passed. 1 one or more lines are NO. 2 the proof itself broke.
//
// node --experimental-strip-types --import ./tools/alias-loader.mjs --import ./tests/checkout/load.mjs --import ./tests/checkout/save-load.mjs tests/checkout/basket.test.ts

import { initCheckoutSessionAction } from '@/features/checkout/actions/initCheckoutSessionAction'
import { beginSession } from './save-stand.mjs'

const ONE = [{ productId: 'a', quantity: 1 }]
const TWO = [{ productId: 'a', quantity: 2 }]
const SPLIT = [{ productId: 'a', quantity: 1 }, { productId: 'a', quantity: 1 }]
const BOTH = [{ productId: 'a', quantity: 1 }, { productId: 'b', quantity: 1 }]
const SWAPPED = [{ productId: 'b', quantity: 1 }, { productId: 'a', quantity: 1 }]
const OTHER = [{ productId: 'b', quantity: 1 }]

const SHIPPING = {
  address: { city: 'Krakow' },
  shippingCode: 'inpost',
  shippingCost: 1550,
  shippingMethodName: 'Locker',
  shippingCarrier: 'InPost',
  shippingEstimatedDays: 2,
  shippingOffers: [{ rateId: 'inpost', priceInCents: 1550 }],
}

function proofBroken(message) {
  const error = new Error(`proof broken: ${message}`)
  error.proofBroken = true
  throw error
}

function totals(items) {
  const map = new Map()
  for (const item of items) map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity)
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).join('|')
}

function sameGoods(left, right) {
  return totals(left) === totals(right)
}

function isRedirect(error) {
  return typeof error?.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')
}

function redirectUrl(error) {
  const parts = String(error.digest).split(';')
  const url = parts.slice(2, -2).join(';')
  const status = Number(parts.at(-2))
  if (!url.startsWith('/') || !Number.isInteger(status)) proofBroken(`unreadable redirect: ${error.digest}`)
  return url
}

async function ask(run) {
  try {
    await run()
    return { kind: 'done' }
  } catch (error) {
    if (error?.proofBroken) throw error
    if (isRedirect(error)) return { kind: 'go', url: redirectUrl(error) }
    return { kind: 'stop', error }
  }
}

function ruler() {
  if (!sameGoods(ONE, ONE) || !sameGoods(TWO, SPLIT) || !sameGoods(BOTH, SWAPPED)) return 'the same goods were called different'
  if (sameGoods(ONE, TWO) || sameGoods(ONE, OTHER) || sameGoods(BOTH, ONE) || sameGoods(ONE, [])) return 'different goods were called the same'
  if (SHIPPING.shippingCost !== 1550) return 'the written price is not 1550 grosze'
  return null
}

function shippingKept(row) {
  return row.shippingCode === 'inpost'
    && row.shippingCost === 1550
    && row.shippingMethodName === 'Locker'
    && row.shippingCarrier === 'InPost'
    && row.shippingEstimatedDays === 2
    && Array.isArray(row.shippingOffers)
    && row.shippingOffers.length === 1
    && row.shippingOffers[0].rateId === 'inpost'
    && row.shippingOffers[0].priceInCents === 1550
}

function shippingCleared(row) {
  return row.shippingCode === undefined
    && row.shippingCost === undefined
    && row.shippingMethodName === undefined
    && row.shippingCarrier === undefined
    && row.shippingEstimatedDays === undefined
    && row.shippingOffers === undefined
}

function basketIs(row, items) {
  return JSON.stringify(row.basket) === JSON.stringify(items)
}

async function start(from, items) {
  const row = beginSession({ ...SHIPPING, basket: from })
  const result = await ask(() => initCheckoutSessionAction(items, 'sess_init'))
  return { row, result }
}

function opened(result) {
  if (result.kind === 'go' && result.url === '/checkout/address') return null
  if (result.kind === 'go') return `sent to ${result.url}`
  if (result.kind === 'stop') return `stopped: ${result.error?.message ?? result.error}`
  return 'continued'
}

async function stay(from, items) {
  const { row, result } = await start(from, items)
  const step = opened(result)
  if (step) return step
  if (row.address?.city !== 'Krakow') return 'the address was dropped'
  if (!basketIs(row, items)) return 'the basket was not replaced'
  if (!shippingKept(row)) return 'the shipping price for these goods was dropped'
  return null
}

async function drop(from, items) {
  const { row, result } = await start(from, items)
  const step = opened(result)
  if (step) return step
  if (row.address?.city !== 'Krakow') return 'the address was dropped'
  if (!basketIs(row, items)) return 'the basket was not replaced'
  if (!shippingCleared(row)) return 'the old shipping price was kept'
  return null
}

const groups = [
  {
    question: 'A shipping price stays only for the goods it was offered for.',
    cases: [
      ['The same goods keep the price', () => stay(ONE, ONE)],
      ['The same goods in another order keep the price', () => stay(BOTH, SWAPPED)],
      ['The same goods split across lines keep the price', () => stay(TWO, SPLIT)],
      ['A different quantity drops the price', () => drop(ONE, TWO)],
      ['A different product drops the price', () => drop(ONE, OTHER)],
      ['An added product drops the price', () => drop(ONE, BOTH)],
      ['A removed product drops the price', () => drop(BOTH, ONE)],
      ['No goods drop the price', () => drop(ONE, [])],
    ],
  },
]

function brokenFinding(error) {
  if (error?.proofBroken) return error.message
  return `proof broken: ${error?.message ?? error}`
}

async function main() {
  const broken = ruler()
  if (broken) {
    console.log(`proof broken: ${broken}`)
    return 2
  }
  console.log('The same goods are one parcel, and a different parcel is not called the same.')
  if (groups.some((group) => group.cases.length === 0)) {
    console.log('proof broken: a question has no cases')
    return 2
  }
  const results = []
  let broke = false
  for (const group of groups) {
    for (const [name, run] of group.cases) {
      try {
        const finding = await run()
        results.push({ question: group.question, name, finding })
      } catch (error) {
        broke = true
        results.push({ question: group.question, name, finding: brokenFinding(error) })
      }
    }
  }
  let current = ''
  for (const result of results) {
    if (result.question !== current) {
      current = result.question
      console.log(current)
    }
    console.log(result.finding ? `  ${result.name}: NO — ${result.finding}` : `  ${result.name}: PASS`)
  }
  if (broke) {
    console.log('proof broken')
    return 2
  }
  const nos = results.filter((result) => result.finding)
  if (nos.length !== 0) {
    console.log(`${nos.length} NO`)
    return 1
  }
  console.log('PASS')
  return 0
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error)
    process.exit(2)
  },
)
