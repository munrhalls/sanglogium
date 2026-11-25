// Saving the step.
//
// Two questions.
//
// The address. A rejected address is not stored, and the shipping choice
// already saved stays. An accepted address is stored, and that old shipping
// choice is cleared.
//
// The shipping price. A price is stored only when it is a positive whole
// number of grosze. Anything else leaves the old price where it was.
//
// A PASS line ended as its sentence says. A NO line did not, and the text after
// NO is what actually happened. A NO is a true answer. Do not edit the sentence
// to match the shop.
//
// The prices are written as numbers. Nothing here waits, rolls dice, or calls
// the registry, the carrier, the bank, or Sanity.
//
// 0 every line passed. 1 one or more lines are NO. 2 the proof itself broke.
//
// node --experimental-strip-types --import ./tools/alias-loader.mjs --import ./tests/checkout/load.mjs --import ./tests/checkout/save-load.mjs tests/checkout/save.test.ts

import { saveAddressAction } from '@/features/checkout/actions/saveAddressAction'
import { saveShippingAction } from '@/features/checkout/actions/saveShippingAction'
import { beginSession, checkCount, saveCount, savedSnapshot, scriptCheck } from './save-stand.mjs'

const TYPED = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  phone: '555',
  regionCode: 'PL',
  postalCode: '00-001',
  street: 'Typed',
  streetNumber: '1',
  city: 'Warsaw',
}

const OLD = { ...TYPED, city: 'Gdansk', street: 'Old' }

const ACCEPTED = {
  status: 'ACCEPT',
  address: { ...TYPED, city: 'Krakow', street: 'Registry' },
  geocode: { location: { latitude: 50, longitude: 19 } },
  placeId: 'place_1',
}

function legalPrice(price) {
  return Number.isInteger(price) && price >= 1
}

function proofBroken(message) {
  const error = new Error(message)
  error.proofBroken = true
  throw error
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

function seen(result) {
  if (result.kind === 'go') return `sent to ${result.url}`
  if (result.kind === 'stop') return `stopped: ${result.error?.message ?? result.error}`
  if (result.value?.status) return `returned ${result.value.status}`
  return 'continued'
}

function expectGo(result, url) {
  if (result.kind === 'go' && result.url === url) return ''
  return seen(result)
}

function shippingCleared(row) {
  return row.shippingCode === undefined
    && row.shippingCost === undefined
    && row.shippingMethodName === undefined
    && row.shippingCarrier === undefined
    && row.shippingEstimatedDays === undefined
}

function keptOldShipping(row) {
  return row.shippingCost === 500 && row.shippingCode === 'old' && row.shippingEstimatedDays === 2
}

function rulingsHold() {
  if (!legalPrice(1) || !legalPrice(500)) return 'a whole grosz price was refused on paper'
  for (const price of [0, -1, 1.5, Number.NaN]) {
    if (legalPrice(price)) return `${price} was called a price`
  }
  if (expectGo({ kind: 'go', url: '/basket' }, '/checkout/shipping') === '') return 'the wrong step was called a pass'
  if (expectGo({ kind: 'stop', error: new Error('Invalid shipping price') }, '/checkout/payment') === '') return 'a refusal was called payment'
  const cleared = { shippingCode: undefined, shippingCost: undefined, shippingMethodName: undefined, shippingCarrier: undefined, shippingEstimatedDays: undefined }
  const kept = { shippingCode: 'old', shippingCost: 500, shippingEstimatedDays: 2 }
  if (shippingCleared(cleared) !== true) return 'cleared shipping was not recognised'
  if (shippingCleared(kept) === true) return 'old shipping was called cleared'
  if (keptOldShipping(kept) !== true) return 'the old price was not recognised'
  if (keptOldShipping(cleared) === true) return 'cleared shipping was called the old price'
  return ''
}

const addressQuestion = 'An address is saved only when the check accepts it, and the old shipping choice is then cleared.'
const priceQuestion = 'A shipping price is saved only when it is a positive whole number of grosze.'

const addressCases = [
  ['An empty basket does not save an address', async () => {
    const row = beginSession({ basket: [] })
    const result = await ask(() => saveAddressAction(TYPED))
    const finding = expectGo(result, '/basket')
    if (finding) return finding
    if (checkCount() !== 0) return 'checked the address'
    if (saveCount() !== 0) return 'saved the session'
    if (!keptOldShipping(row)) return `shipping became ${row.shippingCost}`
    return ''
  }],
  ['A missing basket does not save an address', async () => {
    const row = beginSession({ basket: undefined })
    const result = await ask(() => saveAddressAction(TYPED))
    const finding = expectGo(result, '/basket')
    if (finding) return finding
    if (checkCount() !== 0) return 'checked the address'
    if (saveCount() !== 0) return 'saved the session'
    return ''
  }],
  ['A rejected address stays on the address step', async () => {
    const row = beginSession({ address: OLD })
    scriptCheck({ status: 'FIX', errors: { message: 'no such street' } })
    const result = await ask(() => saveAddressAction(TYPED))
    if (result.kind !== 'done' || result.value?.status !== 'FIX') return seen(result)
    if (saveCount() !== 0) return 'saved the session'
    if (row.address?.city !== 'Gdansk') return `address became ${row.address?.city ?? 'nothing'}`
    if (!keptOldShipping(row)) return `shipping became ${row.shippingCost}`
    return ''
  }],
  ['An unconfirmed address stays on the address step', async () => {
    const row = beginSession({ address: OLD })
    scriptCheck({ status: 'CONFIRM' })
    const result = await ask(() => saveAddressAction(TYPED))
    if (result.kind !== 'done' || result.value?.status !== 'CONFIRM') return seen(result)
    if (saveCount() !== 0) return 'saved the session'
    if (!keptOldShipping(row)) return `shipping became ${row.shippingCost}`
    return ''
  }],
  ['An accepted address is stored and the old shipping choice is cleared', async () => {
    beginSession({ address: OLD })
    scriptCheck(ACCEPTED)
    const result = await ask(() => saveAddressAction(TYPED))
    const finding = expectGo(result, '/checkout/shipping')
    if (finding) return finding
    if (saveCount() !== 1) return `saved ${saveCount()} times`
    const saved = savedSnapshot()
    if (!saved) return 'nothing was saved'
    if (saved.address?.city !== 'Krakow' || saved.address?.street !== 'Registry' || saved.address?.phone !== '555') {
      return `saved ${saved.address?.city ?? 'nothing'}`
    }
    if (saved.address?.placeId !== 'place_1' || saved.address?.geocode?.location?.latitude !== 50) return 'the registry mark was dropped'
    if (!shippingCleared(saved)) return `shipping stayed ${saved.shippingCost}`
    return ''
  }],
]

const priceCases = [
  ['An empty basket does not save a shipping price', async () => {
    const row = beginSession({ basket: [], address: OLD })
    const result = await ask(() => saveShippingAction('inpost', 500, 'Locker', 'InPost', 2))
    const finding = expectGo(result, '/basket')
    if (finding) return finding
    if (saveCount() !== 0) return 'saved the session'
    if (!keptOldShipping(row)) return `shipping became ${row.shippingCost}`
    return ''
  }],
  ['No address does not save a shipping price', async () => {
    const row = beginSession({ address: undefined })
    const result = await ask(() => saveShippingAction('inpost', 500, 'Locker', 'InPost', 2))
    const finding = expectGo(result, '/checkout/address')
    if (finding) return finding
    if (saveCount() !== 0) return 'saved the session'
    if (!keptOldShipping(row)) return `shipping became ${row.shippingCost}`
    return ''
  }],
  ['No session does not save a shipping price', async () => {
    const row = beginSession({ checkoutSessionId: undefined, address: OLD })
    const result = await ask(() => saveShippingAction('inpost', 500, 'Locker', 'InPost', 2))
    const finding = expectGo(result, '/basket')
    if (finding) return finding
    if (saveCount() !== 0) return 'saved the session'
    if (!keptOldShipping(row)) return `shipping became ${row.shippingCost}`
    return ''
  }],
  ['A zero shipping price is not saved', () => refusePrice(0)],
  ['A negative shipping price is not saved', () => refusePrice(-1)],
  ['A fractional shipping price is not saved', () => refusePrice(1.5)],
  ['A blank shipping price is not saved', () => refusePrice(Number.NaN)],
  ['One grosz of shipping is saved', () => savePrice(1)],
  ['The chosen shipping price is saved', () => savePrice(500)],
]

async function refusePrice(price) {
  const row = beginSession({ address: OLD })
  const result = await ask(() => saveShippingAction('inpost', price, 'Locker', 'InPost', 2))
  if (saveCount() !== 0) return 'saved the session'
  if (!keptOldShipping(row)) return `shipping became ${row.shippingCost}`
  if (result.kind === 'go' && result.url === '/checkout/payment') return 'sent to payment'
  if (result.kind === 'done') return 'continued'
  return ''
}

async function savePrice(price) {
  beginSession({ address: OLD })
  const result = await ask(() => saveShippingAction('inpost', price, 'Locker', 'InPost', 2))
  const finding = expectGo(result, '/checkout/payment')
  if (finding) return finding
  if (saveCount() !== 1) return `saved ${saveCount()} times`
  const saved = savedSnapshot()
  if (!saved) return 'nothing was saved'
  if (saved.shippingCost !== price) return `saved ${saved.shippingCost}, the price is ${price}`
  if (saved.shippingCode !== 'inpost' || saved.shippingMethodName !== 'Locker' || saved.shippingCarrier !== 'InPost' || saved.shippingEstimatedDays !== 2) {
    return 'the chosen service was not stored'
  }
  return ''
}

const groups = [
  { question: addressQuestion, cases: addressCases },
  { question: priceQuestion, cases: priceCases },
]

function brokenFinding(error) {
  if (error?.proofBroken) return error.message
  return `proof broken: ${error?.stack ?? error}`
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
  if (addressCases.length === 0 || priceCases.length === 0) {
    console.log('proof broken: the save list is empty')
    return 2
  }
  const ruler = rulingsHold()
  if (ruler) {
    console.log(`proof broken: ${ruler}`)
    return 2
  }
  console.log('A wrong step is not called a pass, and the old price is not called cleared.')
  const results = []
  let broken = false
  for (const group of groups) {
    for (const item of group.cases) {
      const [name, run] = item
      try {
        const finding = await quietly(run)
        results.push({ question: group.question, name, finding })
      } catch (error) {
        broken = true
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
  if (broken) {
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
