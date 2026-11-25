// The visit.
//
// Three questions.
//
// The step. Is the customer sent to the step their basket, address, and
// shipping allow, and kept off a step they have not reached?
//
// The charge on the page. Does the payment page show a total only when that
// total is a charge the shop can take, and is the number on the page that charge?
//
// The result. After payment, is the screen what the bank reported? A failed
// lookup is not success. A payment this session did not make, with no order,
// is not shown.
//
// A PASS line ended as its sentence says. A NO line did not, and the text after
// NO is what actually happened. A NO is a true answer. Do not edit the sentence
// to match the shop.
//
// The totals are written as numbers. The shop is not asked to grade itself.
// Nothing here waits, rolls dice, or calls the carrier, the bank, or Sanity.
// The same run twice gives the same answer.
//
// 0 every line passed. 1 one or more lines are NO. 2 the proof itself broke.
//
// node --experimental-strip-types --import ./tools/alias-loader.mjs --import ./tests/checkout/load.mjs tests/checkout/visit.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAddressPageData } from '@/features/checkout/queries/getAddressPageData'
import { getPaymentPageData } from '@/features/checkout/queries/getPaymentPageData'
import { getShippingPageData } from '@/features/checkout/queries/getShippingPageData'
import { getSuccessPageResult } from '@/features/checkout/queries/getSuccessPageResult'

const ADDRESS = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  phone: '1',
  regionCode: 'PL',
  postalCode: '00-001',
  street: 'Main',
  streetNumber: '1',
  city: 'Warsaw',
}

const OPTION = {
  provider: 'InPost',
  servicelevel: { name: 'Locker' },
  rateId: 'rate_1',
  amount: 500,
  currency: 'pln',
  estimatedDays: 2,
}

const PARCEL = { _id: 'a', parcel: { length: 10, width: 10, height: 10, weight: 500 } }

// A charge the payment command can take. Written here, not asked of the shop.
// Safe integer unit at least 1, safe integer quantity at least 1, line total a
// safe integer, shipping a safe integer at least 0, exact sum a positive safe
// integer, and the rounded sum equal to that exact sum. The id round-trips.
function chargeable(lines, shipping) {
  if (!Number.isSafeInteger(shipping) || shipping < 0) return false
  let subtotal = 0
  for (const line of lines) {
    if (typeof line.id !== 'string' || line.id === '' || line.id.includes(',') || line.id.includes(':')) return false
    if (!Number.isSafeInteger(line.qty) || line.qty < 1) return false
    if (!Number.isSafeInteger(line.unit) || line.unit < 1) return false
    if (!Number.isSafeInteger(line.unit * line.qty)) return false
    subtotal += line.unit * line.qty
  }
  const exact = subtotal + shipping
  if (!Number.isSafeInteger(exact) || exact < 1) return false
  if (Math.round(subtotal + shipping) !== exact) return false
  return true
}

// The payment page's earlier gates. A money sentence must get past these,
// or it would pass for the wrong reason.
function reachesTheTotal(lines, shipping) {
  if (lines.length === 0) return false
  for (const line of lines) {
    if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > 10) return false
    if (!Number.isFinite(line.unit)) return false
  }
  if (shipping === undefined || shipping === null) return false
  return true
}

const offers = [
  { name: 'One item and shipping show 1500', lines: [{ id: 'a', unit: 1000, qty: 1 }], shipping: 500, total: 1500 },
  { name: 'Two items and shipping show 5000', lines: [{ id: 'a', unit: 1000, qty: 2 }, { id: 'b', unit: 2500, qty: 1 }], shipping: 500, total: 5000 },
  { name: 'Free shipping shows the item price', lines: [{ id: 'a', unit: 100, qty: 1 }], shipping: 0, total: 100 },
  { name: 'Ten of an item is still a payment', lines: [{ id: 'a', unit: 100, qty: 10 }], shipping: 0, total: 1000 },
  { name: 'One grosz is still a payment', lines: [{ id: 'a', unit: 1, qty: 1 }], shipping: 0, total: 1 },
]

const refuses = [
  { name: 'A fractional item price is not a payment', lines: [{ id: 'a', unit: 1.5, qty: 2 }], shipping: 0 },
  { name: 'A fractional shipping price is not a payment', lines: [{ id: 'a', unit: 100, qty: 1 }], shipping: 0.5 },
  { name: 'A zero item price is not a payment', lines: [{ id: 'a', unit: 0, qty: 1 }], shipping: 500 },
  { name: 'A negative item price is not a payment', lines: [{ id: 'a', unit: -5, qty: 1 }], shipping: 500 },
  { name: 'A negative shipping price is not a payment', lines: [{ id: 'a', unit: 100, qty: 1 }], shipping: -1 },
  { name: 'A price past a safe integer is not a payment', lines: [{ id: 'a', unit: 9007199254740992, qty: 1 }], shipping: 0 },
  { name: 'A line that overflows a safe integer is not a payment', lines: [{ id: 'a', unit: 9007199254740991, qty: 3 }], shipping: 0 },
  { name: 'An empty product id is not a payment', lines: [{ id: '', unit: 100, qty: 1 }], shipping: 0 },
  { name: 'A product id with a colon is not a payment', lines: [{ id: 'a:b', unit: 100, qty: 1 }], shipping: 0 },
  { name: 'A product id with a comma is not a payment', lines: [{ id: 'left,right', unit: 100, qty: 1 }], shipping: 0 },
]

function proofBroken(message) {
  const error = new Error(message)
  error.proofBroken = true
  throw error
}

function writtenTotalsAddUp() {
  if (offers.length === 0 || refuses.length === 0) return 'the visit list is empty'
  for (const offer of offers) {
    const sum = offer.lines.reduce((total, line) => total + line.unit * line.qty, 0) + offer.shipping
    if (sum !== offer.total) return `${offer.name} writes ${offer.total} and adds to ${sum}`
    if (!chargeable(offer.lines, offer.shipping)) return `${offer.name} is not a charge`
    if (!reachesTheTotal(offer.lines, offer.shipping)) return `${offer.name} is stopped before the total`
  }
  for (const refuse of refuses) {
    if (chargeable(refuse.lines, refuse.shipping)) return `${refuse.name} is a charge, so it cannot be a refusal`
    if (!reachesTheTotal(refuse.lines, refuse.shipping)) return `${refuse.name} is stopped before the total`
  }
  if (expectGo({ kind: 'go', url: '/basket' }, '/basket') !== '') return 'a correct step was not a pass'
  if (expectGo({ kind: 'go', url: '/checkout/payment' }, '/basket') === '') return 'the wrong step was called a pass'
  if (expectGo({ kind: 'page', value: {} }, '/basket') === '') return 'an opened page was called a step'
  if (expectNoPage({ kind: 'page', value: { grandTotal: 3 } }) === '') return 'an opened payment was called a refusal'
  if (expectNoPage({ kind: 'go', url: '/basket' }) !== '') return 'leaving the payment step was not a refusal'
  if (expectNoPage({ kind: 'stop', error: new Error('no') }) !== '') return 'a stopped payment was not a refusal'
  if (expectCharge({ kind: 'page', value: shown(offers[0]) }, offers[0]) !== '') return 'the written charge was not a pass'
  const lied = { ...offers[0], total: offers[0].total + 1 }
  if (expectCharge({ kind: 'page', value: shown(offers[0]) }, lied) === '') return 'a wrong total was called a pass'
  if (expectScreen({ kind: 'page', value: { kind: 'succeeded', amount: 1 } }, 'succeeded', 1500) === '') return 'the wrong amount was called the bank'
  if (expectScreen({ kind: 'page', value: { kind: 'canceled' } }, 'succeeded', 1500) === '') return 'a canceled payment was called success'
  if (expectScreen({ kind: 'go', url: '/basket' }, 'succeeded', 1500) === '') return 'a redirect was called the bank result'
  return ''
}

function shown(offer) {
  return {
    grandTotal: offer.total,
    shippingCost: offer.shipping,
    subtotal: offer.total - offer.shipping,
    items: offer.lines.map((line) => ({
      unitPrice: line.unit,
      quantity: line.qty,
      lineTotal: line.unit * line.qty,
    })),
  }
}

function session(over) {
  return {
    basket: [{ productId: 'a', quantity: 1 }],
    address: ADDRESS,
    shippingCost: 500,
    shippingCarrier: 'InPost',
    shippingMethodName: 'Locker',
    checkoutSessionId: 'sess_visit',
    email: 'ada@example.com',
    ...over,
  }
}

function linesOf(basket) {
  return (basket ?? []).map((line) => ({ id: line.productId, unit: 100, qty: line.quantity }))
}

function goods(lines, stock = 5) {
  return lines.map((line) => ({
    _id: line.id,
    name: 'Speaker',
    price_data: { unit_amount: line.unit },
    stock,
    imageUrl: null,
  }))
}

function world(row, extra) {
  const calls = { products: 0, rates: 0, orders: 0, bank: 0 }
  return {
    calls,
    ports: {
      sessions: {
        getCheckoutSession: async () => {
          row.save = async () => {}
          return row
        },
      },
      catalogue: {
        getPaymentProducts: async () => {
          calls.products += 1
          return extra.paymentProducts
        },
        getProductsByIds: async () => {
          calls.products += 1
          return extra.parcelProducts
        },
      },
      shipping: {
        fetchShippingOptions: async () => {
          calls.rates += 1
          return extra.options
        },
      },
      orders: {
        getOrderByPaymentIntentId: async () => {
          calls.orders += 1
          return extra.order
        },
      },
      payments: {
        retrievePayment: async () => {
          calls.bank += 1
          if (extra.bankError) throw new Error('bank down')
          return extra.payment
        },
      },
    },
  }
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
    return { kind: 'page', value: await run() }
  } catch (error) {
    if (error?.proofBroken) throw error
    if (isRedirect(error)) return { kind: 'go', url: redirectUrl(error) }
    return { kind: 'stop', error }
  }
}

function seen(result) {
  if (result.kind === 'go') return `sent to ${result.url}`
  if (result.kind === 'stop') return `stopped: ${result.error?.message ?? result.error}`
  if (result.value?.grandTotal !== undefined) return `opened payment for ${result.value.grandTotal}`
  if (result.value?.kind) return `showed ${result.value.kind}`
  if (result.value?.shippingOptions) return `showed ${result.value.shippingOptions.length} shipping options`
  if (result.value?.initialAddress) return `showed ${result.value.initialAddress.city}`
  return 'opened the step'
}

function expectGo(result, url) {
  if (result.kind === 'go' && result.url === url) return ''
  return seen(result)
}

function expectNoPage(result) {
  if (result.kind === 'page') return seen(result)
  return ''
}

function expectCharge(result, offer) {
  if (result.kind !== 'page') return seen(result)
  const value = result.value
  if (value.grandTotal !== offer.total) return `showed ${value.grandTotal}, the charge is ${offer.total}`
  if (value.shippingCost !== offer.shipping) return `showed shipping ${value.shippingCost}`
  if (value.subtotal !== offer.total - offer.shipping) return `showed items ${value.subtotal}`
  if (!Array.isArray(value.items) || value.items.length !== offer.lines.length) return `showed ${value.items?.length ?? 0} lines`
  for (let i = 0; i < offer.lines.length; i += 1) {
    const item = value.items[i]
    const line = offer.lines[i]
    if (item.unitPrice !== line.unit || item.quantity !== line.qty || item.lineTotal !== line.unit * line.qty) {
      return `showed ${item.unitPrice} times ${item.quantity}`
    }
  }
  return ''
}

function expectScreen(result, kind, amount) {
  if (result.kind !== 'page') return seen(result)
  if (result.value.kind !== kind) return `showed ${result.value.kind}`
  if (amount !== undefined && result.value.amount !== amount) return `showed ${result.value.amount}, the bank took ${amount}`
  return ''
}

function basket(lines) {
  return lines.map((line) => ({ productId: line.id, quantity: line.qty }))
}

async function openPayment(lines, shipping, products) {
  const row = session({ basket: basket(lines), shippingCost: shipping })
  const built = world(row, { paymentProducts: products ?? goods(lines) })
  const result = await ask(() => getPaymentPageData({
    sessions: built.ports.sessions,
    catalogue: built.ports.catalogue,
  }))
  return result
}

const stepQuestion = 'The customer reaches only the step the session allows.'
const chargeQuestion = 'The payment page shows a charge the shop can take, and the number is that charge.'
const resultQuestion = 'After payment, the screen is what the bank said.'

const stepCases = [
  ['An empty basket leaves the address step', async () => {
    const built = world(session({ basket: [] }), {})
    const result = await ask(() => getAddressPageData({ sessions: built.ports.sessions }))
    return expectGo(result, '/basket')
  }],
  ['A missing basket leaves the address step', async () => {
    const built = world(session({ basket: undefined }), {})
    const result = await ask(() => getAddressPageData({ sessions: built.ports.sessions }))
    return expectGo(result, '/basket')
  }],
  ['A basket opens the address step', async () => {
    const built = world(session({ address: undefined }), {})
    const result = await ask(() => getAddressPageData({ sessions: built.ports.sessions }))
    if (result.kind !== 'page') return seen(result)
    if (result.value.initialAddress) return `showed ${result.value.initialAddress.city}`
    return ''
  }],
  ['The saved address is the address on the page', async () => {
    const built = world(session({}), {})
    const result = await ask(() => getAddressPageData({ sessions: built.ports.sessions }))
    if (result.kind !== 'page') return seen(result)
    if (result.value.initialAddress?.city !== 'Warsaw' || result.value.initialAddress?.postalCode !== '00-001') {
      return `showed ${result.value.initialAddress?.city ?? 'nothing'}`
    }
    return ''
  }],
  ['No address leaves the shipping step, even with an empty basket', async () => {
    const built = world(session({ address: undefined, basket: [] }), { parcelProducts: [PARCEL], options: [OPTION] })
    const result = await ask(() => getShippingPageData(built.ports))
    const finding = expectGo(result, '/checkout/address')
    if (finding) return finding
    if (built.calls.rates !== 0 || built.calls.products !== 0) return 'asked the carrier before leaving'
    return ''
  }],
  ['No address leaves the shipping step', async () => {
    const built = world(session({ address: undefined }), { parcelProducts: [PARCEL], options: [OPTION] })
    const result = await ask(() => getShippingPageData(built.ports))
    const finding = expectGo(result, '/checkout/address')
    if (finding) return finding
    if (built.calls.rates !== 0 || built.calls.products !== 0) return 'asked the carrier before leaving'
    return ''
  }],
  ['An address without a basket leaves the shipping step', async () => {
    const built = world(session({ basket: [] }), { parcelProducts: [PARCEL], options: [OPTION] })
    const result = await ask(() => getShippingPageData(built.ports))
    const finding = expectGo(result, '/basket')
    if (finding) return finding
    if (built.calls.rates !== 0 || built.calls.products !== 0) return 'asked the carrier before leaving'
    return ''
  }],
  ['A saved address and basket show the carrier options', async () => {
    const built = world(session({}), { parcelProducts: [PARCEL], options: [OPTION] })
    const result = await ask(() => getShippingPageData(built.ports))
    if (result.kind !== 'page') return seen(result)
    if (result.value.kind !== 'ok') return `showed ${result.value.kind}`
    if (JSON.stringify(result.value.shippingOptions) !== JSON.stringify([OPTION])) return 'showed different options'
    if (built.calls.rates !== 1) return `asked the carrier ${built.calls.rates} times`
    return ''
  }],
  ['An empty basket leaves the payment step', async () => {
    const built = world(session({ basket: [] }), { paymentProducts: [] })
    const result = await ask(() => getPaymentPageData({ sessions: built.ports.sessions, catalogue: built.ports.catalogue }))
    const finding = expectGo(result, '/basket')
    if (finding) return finding
    if (built.calls.products !== 0) return 'looked up products before leaving'
    return ''
  }],
  ['A zero quantity leaves the payment step', async () => {
    const built = world(session({ basket: [{ productId: 'a', quantity: 0 }], address: undefined }), { paymentProducts: [] })
    const result = await ask(() => getPaymentPageData({ sessions: built.ports.sessions, catalogue: built.ports.catalogue }))
    const finding = expectGo(result, '/basket?error=invalid_basket')
    if (finding) return finding
    if (built.calls.products !== 0) return 'looked up products before leaving'
    return ''
  }],
  ['A fractional quantity leaves the payment step', async () => {
    const built = world(session({ basket: [{ productId: 'a', quantity: 1.5 }] }), { paymentProducts: [] })
    const result = await ask(() => getPaymentPageData({ sessions: built.ports.sessions, catalogue: built.ports.catalogue }))
    return expectGo(result, '/basket?error=invalid_basket')
  }],
  ['A negative quantity leaves the payment step', async () => {
    const built = world(session({ basket: [{ productId: 'a', quantity: -1 }] }), { paymentProducts: [] })
    const result = await ask(() => getPaymentPageData({ sessions: built.ports.sessions, catalogue: built.ports.catalogue }))
    return expectGo(result, '/basket?error=invalid_basket')
  }],
  ['No address leaves the payment step', async () => {
    const built = world(session({ address: undefined, shippingCost: undefined }), { paymentProducts: [] })
    const result = await ask(() => getPaymentPageData({ sessions: built.ports.sessions, catalogue: built.ports.catalogue }))
    const finding = expectGo(result, '/checkout/address')
    if (finding) return finding
    if (built.calls.products !== 0) return 'looked up products before leaving'
    return ''
  }],
  ['No shipping choice leaves the payment step', async () => {
    const built = world(session({ shippingCost: undefined }), { paymentProducts: [] })
    const result = await ask(() => getPaymentPageData({ sessions: built.ports.sessions, catalogue: built.ports.catalogue }))
    const finding = expectGo(result, '/checkout/shipping')
    if (finding) return finding
    if (built.calls.products !== 0) return 'looked up products before leaving'
    return ''
  }],
  ['A blank shipping choice leaves the payment step', async () => {
    const built = world(session({ shippingCost: null }), { paymentProducts: [] })
    const result = await ask(() => getPaymentPageData({ sessions: built.ports.sessions, catalogue: built.ports.catalogue }))
    return expectGo(result, '/checkout/shipping')
  }],
  ['Eleven of one product leaves the payment step', async () => {
    const built = world(session({ basket: [{ productId: 'a', quantity: 11 }] }), { paymentProducts: [] })
    const result = await ask(() => getPaymentPageData({ sessions: built.ports.sessions, catalogue: built.ports.catalogue }))
    const finding = expectGo(result, '/basket?error=excessive_quantity&id=a')
    if (finding) return finding
    if (built.calls.products !== 0) return 'looked up products before leaving'
    return ''
  }],
  ['An unknown product does not open payment', async () => {
    const built = world(session({}), { paymentProducts: [] })
    const result = await ask(() => getPaymentPageData({ sessions: built.ports.sessions, catalogue: built.ports.catalogue }))
    return expectNoPage(result)
  }],
  ['A price that is not a number does not open payment', async () => {
    const product = { _id: 'a', name: 'Speaker', price_data: null, stock: 5, imageUrl: null }
    const built = world(session({}), { paymentProducts: [product] })
    const result = await ask(() => getPaymentPageData({ sessions: built.ports.sessions, catalogue: built.ports.catalogue }))
    return expectNoPage(result)
  }],
  ['Nothing on the shelf leaves the payment step', async () => {
    const built = world(session({}), { paymentProducts: goods(linesOf(session({}).basket), 0) })
    const result = await ask(() => getPaymentPageData({ sessions: built.ports.sessions, catalogue: built.ports.catalogue }))
    return expectGo(result, '/basket?error=out_of_stock&id=a')
  }],
  ['A total of zero leaves the payment step', async () => {
    const lines = [{ id: 'a', unit: 0, qty: 1 }]
    const built = world(session({ basket: basket(lines), shippingCost: 0 }), { paymentProducts: goods(lines) })
    const result = await ask(() => getPaymentPageData({ sessions: built.ports.sessions, catalogue: built.ports.catalogue }))
    return expectGo(result, '/basket?error=invalid_total')
  }],
]

const chargeCases = [
  ...offers.map((offer) => [offer.name, async () => expectCharge(await openPayment(offer.lines, offer.shipping), offer)]),
  ...refuses.map((refuse) => [refuse.name, async () => expectNoPage(await openPayment(refuse.lines, refuse.shipping))]),
]

function bank(status, amount, extra) {
  return {
    id: 'pi_1',
    status,
    amount,
    currency: 'pln',
    receiptEmail: null,
    metadata: {},
    paymentMethod: null,
    failureMessage: null,
    ...extra,
  }
}

async function openResult(row, input, extra) {
  const built = world(row, extra)
  const result = await ask(() => getSuccessPageResult(built.ports, input))
  return { result, calls: built.calls }
}

const resultCases = [
  ['No payment id goes back to the basket', async () => {
    const opened = await openResult(session({}), {}, { payment: bank('succeeded', 1500), order: null })
    const finding = expectGo(opened.result, '/basket')
    if (finding) return finding
    if (opened.calls.bank !== 0) return 'asked the bank with no payment id'
    return ''
  }],
  ["Someone else's payment, with no order, goes back to the basket", async () => {
    const row = session({ completedPaymentIntentId: 'pi_other', lastPaymentIntentId: 'pi_other' })
    const opened = await openResult(row, { paymentIntent: 'pi_1' }, { payment: bank('succeeded', 1500), order: null })
    return expectGo(opened.result, '/basket')
  }],
  ["Someone else's payment, when an order exists, shows the bank amount", async () => {
    const row = session({ completedPaymentIntentId: 'pi_other', lastPaymentIntentId: 'pi_other' })
    const opened = await openResult(row, { paymentIntent: 'pi_1' }, {
      payment: bank('succeeded', 1500),
      order: { orderNumber: '9', pricing: { total: 9999 } },
    })
    return expectScreen(opened.result, 'succeeded', 1500)
  }],
  ['The completed payment is shown before the order is written', async () => {
    const row = session({ completedPaymentIntentId: 'pi_1' })
    const opened = await openResult(row, { paymentIntent: 'pi_1' }, { payment: bank('succeeded', 1500), order: null })
    return expectScreen(opened.result, 'succeeded', 1500)
  }],
  ['The last payment this session is shown before the order is written', async () => {
    const row = session({ lastPaymentIntentId: 'pi_1' })
    const opened = await openResult(row, { paymentIntent: 'pi_1' }, { payment: bank('succeeded', 100), order: null })
    return expectScreen(opened.result, 'succeeded', 100)
  }],
  ['A failed check does not show success', async () => {
    const row = session({ completedPaymentIntentId: 'pi_1' })
    const opened = await openResult(row, { paymentIntent: 'pi_1', errorParam: 'verification_failed' }, {
      payment: bank('succeeded', 1500),
      order: null,
    })
    return expectScreen(opened.result, 'verificationFailed')
  }],
  ['A bank lookup that fails does not show success', async () => {
    const row = session({ completedPaymentIntentId: 'pi_1' })
    const opened = await openResult(row, { paymentIntent: 'pi_1' }, { bankError: true, order: null })
    return expectScreen(opened.result, 'verificationFailed')
  }],
  ['A declined payment says why', async () => {
    const row = session({ completedPaymentIntentId: 'pi_1' })
    const opened = await openResult(row, { paymentIntent: 'pi_1' }, {
      payment: bank('requires_payment_method', 1500, { failureMessage: 'Card declined.' }),
      order: null,
    })
    const finding = expectScreen(opened.result, 'declined')
    if (finding) return finding
    if (opened.result.value.message !== 'Card declined.') return `said ${opened.result.value.message}`
    return ''
  }],
  ['A declined payment with no reason says it was declined', async () => {
    const row = session({ completedPaymentIntentId: 'pi_1' })
    const opened = await openResult(row, { paymentIntent: 'pi_1' }, {
      payment: bank('requires_payment_method', 1500),
      order: null,
    })
    const finding = expectScreen(opened.result, 'declined')
    if (finding) return finding
    if (opened.result.value.message !== 'Payment was declined.') return `said ${opened.result.value.message}`
    return ''
  }],
  ['A canceled payment says canceled', async () => {
    const row = session({ completedPaymentIntentId: 'pi_1' })
    const opened = await openResult(row, { paymentIntent: 'pi_1' }, { payment: bank('canceled', 1500), order: null })
    return expectScreen(opened.result, 'canceled')
  }],
  ['A payment still processing says processing', async () => {
    const row = session({ completedPaymentIntentId: 'pi_1' })
    const opened = await openResult(row, { paymentIntent: 'pi_1' }, { payment: bank('processing', 1500), order: null })
    return expectScreen(opened.result, 'processing')
  }],
  ['Any other bank status says the result was unexpected', async () => {
    const row = session({ completedPaymentIntentId: 'pi_1' })
    const opened = await openResult(row, { paymentIntent: 'pi_1' }, { payment: bank('requires_action', 1500), order: null })
    return expectScreen(opened.result, 'unexpected')
  }],
  ['The result page does not trust the status in the address bar', async () => {
    const page = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'), 'app/checkout/success/page.tsx')
    let source = ''
    try {
      source = readFileSync(page, 'utf8')
    } catch (error) {
      proofBroken(`cannot read the result page: ${error.message}`)
    }
    const start = source.indexOf('getSuccessPageResult(')
    const end = source.indexOf('switch')
    if (start < 0 || end < start) proofBroken('the result page has no result call')
    const call = source.slice(start, end)
    if (call.includes('status')) return 'the address bar status is sent to the result'
    if (!call.includes('payment_intent') || !call.includes('errorParam')) return 'the payment id or the failed check is not passed'
    return ''
  }],
]

const groups = [
  { question: stepQuestion, cases: stepCases },
  { question: chargeQuestion, cases: chargeCases },
  { question: resultQuestion, cases: resultCases },
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
  const ruler = writtenTotalsAddUp()
  if (ruler) {
    console.log(ruler.startsWith('proof broken') ? ruler : `proof broken: ${ruler}`)
    return 2
  }
  console.log('The written totals add up, and a wrong screen is not called a pass.')
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
