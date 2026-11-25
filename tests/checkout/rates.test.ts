// The rates just returned.
//
// One question. A saved shipping price stays only when that rate and that
// price are among the rates the shipping page just returned. A different
// price, a missing rate, another rate at the same grosze, or a price of 0
// is not that offer, and the saved price is then gone. The new rates are
// still remembered. No address and an empty basket leave before any rates,
// and the saved price stays. The page shows every option the carrier returned.
//
// A PASS line ended as its sentence says. A NO line did not, and the text after
// NO is what actually happened. A NO is a true answer. Do not edit the sentence
// to match the shop.
//
// The prices are written here. 15.5 zloty is 1550 grosze. 9 zloty is 900.
// Nothing here waits, rolls dice, or calls the carrier, the registry, the bank,
// or Sanity. The same run twice gives the same answer.
//
// 0 every line passed. 1 one or more lines are NO. 2 the proof itself broke.
//
// node --experimental-strip-types --import ./tools/alias-loader.mjs --import ./tests/checkout/load.mjs tests/checkout/rates.test.ts

import { getShippingPageData } from '@/features/checkout/queries/getShippingPageData'

const PARCEL = { _id: 'a', parcel: { length: 10, width: 10, height: 10, weight: 500 } }

function option(rateId, amount) {
  return { provider: 'InPost', servicelevel: { name: 'Locker' }, rateId, amount, currency: 'PLN', estimatedDays: 2 }
}

const INPOST = option('inpost', 15.5)
const DHL = option('dhl', 9)
const DUST = option('dust', 0.004)
const HUGE = option('huge', 1e15)
const BOTH = [INPOST, DHL]
const ALL = [INPOST, DHL, DUST, HUGE]
const OFFERS = [
  { rateId: 'inpost', priceInCents: 1550 },
  { rateId: 'dhl', priceInCents: 900 },
]

function proofBroken(message) {
  const error = new Error(`proof broken: ${message}`)
  error.proofBroken = true
  throw error
}

function listed(offers, code, price) {
  return offers.some((offer) => offer.rateId === code && offer.priceInCents === price)
}

function ruler() {
  if (Math.round(15.5 * 100) !== 1550 || Math.round(9 * 100) !== 900) return 'the written grosze are not the carrier amounts'
  if (!listed(OFFERS, 'inpost', 1550)) return 'the saved rate was not among the written offers'
  if (listed([{ rateId: 'inpost', priceInCents: 900 }], 'inpost', 1550)) return 'a changed price was still the saved rate'
  if (listed([{ rateId: 'dhl', priceInCents: 1550 }], 'inpost', 1550)) return 'another rate was still the saved rate'
  if (listed(OFFERS, 'inpost', 0)) return 'a price of 0 was an offered rate'
  if (listed([], 'inpost', 1550)) return 'an empty rate list contained the saved rate'
  return null
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
    return { kind: 'done', value: await run() }
  } catch (error) {
    if (error?.proofBroken) throw error
    if (isRedirect(error)) return { kind: 'go', url: redirectUrl(error) }
    return { kind: 'stop', error }
  }
}

let saves = 0

function open(extra) {
  saves = 0
  const row = {
    basket: [{ productId: 'a', quantity: 1 }],
    address: { regionCode: 'PL', postalCode: '00-001', city: 'Krakow' },
    checkoutSessionId: 'sess_rates',
    shippingCode: 'inpost',
    shippingCost: 1550,
    shippingMethodName: 'Locker',
    shippingCarrier: 'InPost',
    shippingEstimatedDays: 2,
    shippingOffers: [{ rateId: 'inpost', priceInCents: 1550 }],
    ...extra,
  }
  row.save = async () => {
    saves += 1
  }
  return row
}

function ports(row, options, calls) {
  return {
    sessions: { getCheckoutSession: async () => row },
    catalogue: {
      getProductsByIds: async () => {
        calls.products += 1
        return [PARCEL]
      },
    },
    shipping: {
      fetchShippingOptions: async () => {
        calls.rates += 1
        return options
      },
    },
  }
}

function selectionKept(row) {
  return row.shippingCode === 'inpost'
    && row.shippingCost === 1550
    && row.shippingMethodName === 'Locker'
    && row.shippingCarrier === 'InPost'
    && row.shippingEstimatedDays === 2
}

function selectionCleared(row) {
  return row.shippingCode === undefined
    && row.shippingCost === undefined
    && row.shippingMethodName === undefined
    && row.shippingCarrier === undefined
    && row.shippingEstimatedDays === undefined
}

function seen(result) {
  if (result.kind === 'go') return `sent to ${result.url}`
  if (result.kind === 'stop') return `stopped: ${result.error?.message ?? result.error}`
  return 'continued'
}

async function load(extra, options) {
  const row = open(extra)
  const calls = { products: 0, rates: 0 }
  const result = await ask(() => getShippingPageData(ports(row, options, calls)))
  return { row, calls, result }
}

async function stay(extra, options) {
  const { row, calls, result } = await load(extra, options)
  if (result.kind !== 'done' || result.value?.kind !== 'ok') return seen(result)
  if (JSON.stringify(result.value.shippingOptions) !== JSON.stringify(options)) return 'showed different options'
  if (calls.rates !== 1) return `asked the carrier ${calls.rates} times`
  if (saves !== 1) return `saved ${saves} times`
  if (!selectionKept(row)) return 'the saved rate was dropped'
  if (JSON.stringify(row.shippingOffers) !== JSON.stringify(OFFERS)) return `remembered ${JSON.stringify(row.shippingOffers)}`
  return null
}

async function drop(extra, options, offers) {
  const { row, calls, result } = await load(extra, options)
  if (result.kind !== 'done' || result.value?.kind !== 'ok') return seen(result)
  if (JSON.stringify(result.value.shippingOptions) !== JSON.stringify(options)) return 'showed different options'
  if (calls.rates !== 1) return `asked the carrier ${calls.rates} times`
  if (saves !== 1) return `saved ${saves} times`
  if (!selectionCleared(row)) return 'the old shipping price was kept'
  if (JSON.stringify(row.shippingOffers) !== JSON.stringify(offers)) return `remembered ${JSON.stringify(row.shippingOffers)}`
  return null
}

async function leave(extra, url) {
  const { row, calls, result } = await load(extra, BOTH)
  if (result.kind !== 'go' || result.url !== url) return seen(result)
  if (calls.rates !== 0 || calls.products !== 0) return 'asked the carrier before leaving'
  if (saves !== 0) return 'saved the session'
  if (!selectionKept(row)) return 'the saved rate was dropped'
  return null
}

const groups = [
  {
    question: 'A saved shipping price stays only when it is one of the rates just returned.',
    cases: [
      ['The same offered rate keeps the saved price', () => stay({}, BOTH)],
      ['The page shows every option the carrier returned', () => stay({}, ALL)],
      ['A new price for that rate drops the saved price', () => drop({}, [option('inpost', 9)], [{ rateId: 'inpost', priceInCents: 900 }])],
      ['A missing rate drops the saved price', () => drop({}, [DHL], [{ rateId: 'dhl', priceInCents: 900 }])],
      ['Another rate at the same grosze drops the saved price', () => drop({}, [option('dhl', 15.5)], [{ rateId: 'dhl', priceInCents: 1550 }])],
      ['A price of 0 is dropped', () => drop({ shippingCost: 0 }, BOTH, OFFERS)],
      ['No saved price stays unsaved', () => drop({
        shippingCode: undefined,
        shippingCost: undefined,
        shippingMethodName: undefined,
        shippingCarrier: undefined,
        shippingEstimatedDays: undefined,
        shippingOffers: undefined,
      }, BOTH, OFFERS)],
      ['No address keeps the saved price', () => leave({ address: undefined }, '/checkout/address')],
      ['An empty basket keeps the saved price', () => leave({ basket: [] }, '/basket')],
    ],
  },
]

function brokenFinding(error) {
  if (error?.proofBroken) return error.message
  return `proof broken: ${error?.message ?? error}`
}

async function quietly(run) {
  const log = console.log
  const error = console.error
  const warn = console.warn
  console.log = () => {}
  console.error = () => {}
  console.warn = () => {}
  try {
    return await run()
  } finally {
    console.log = log
    console.error = error
    console.warn = warn
  }
}

async function main() {
  const broken = ruler()
  if (broken) {
    console.log(`proof broken: ${broken}`)
    return 2
  }
  console.log('A changed rate is not the saved price, and leaving early asks no carrier.')
  if (groups.some((group) => group.cases.length === 0)) {
    console.log('proof broken: a question has no cases')
    return 2
  }
  const results = []
  let broke = false
  for (const group of groups) {
    for (const [name, run] of group.cases) {
      try {
        const finding = await quietly(run)
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
