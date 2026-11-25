// Does each sentence stay steady, and can a real failure still pass it?
//
// A sentence flickers when its list of situations reads differently the
// second time, or when the same paperwork is called a pass and then a failure.
//
// A sentence lets a real failure through when wrong paperwork comes back as
// a pass, when the situation that would show that failure is gone, or when
// the sentence no longer uses its check.
//
// This file does not ask the shop. It writes the paperwork itself, reads it
// back, and then clears it. A problem here stops the proof.

import { beforeSuccess, chargeVerdict, notChargedVerdict, nothingSold, orderCountIs, orderMatches, saleVerdict, stillPayable, stockExplained } from './books.mjs'
import { shortShelf, twoCustomers } from './conservation.test.ts'
import {
  OTHER_PRICE,
  SHIPPING_MISSING,
  bankThenReturn,
  basketChanges,
  basketText,
  changedShelfId,
  checkEvery,
  differentSessionLines,
  filledShelves,
  forgedSituations,
  idRoundTrips,
  legalBaskets,
  oneBankNotice,
  oneReturn,
  productFits,
  refusalsFor,
  returnThenBank,
  shortShelves,
  twoBankNotices,
  twoReturns,
  unsignedSituations,
} from './domain.mjs'
import { deliver, refuse, saleRecorded } from './parity.test.ts'
import { bankNotice, charge, customerReturns, forgedBankNotice, notCharged, unsignedBankNotice } from './shop.test.ts'
import { backendClient, reset, seed, until } from './stock-book.mjs'

function source(run) {
  const text = String(run)
  let out = ''
  let i = 0
  let quote = ''
  while (i < text.length) {
    const pair = text.slice(i, i + 2)
    if (!quote && pair === '//') {
      const end = text.indexOf('\n', i)
      i = end < 0 ? text.length : end
      continue
    }
    if (!quote && pair === '/*') {
      const end = text.indexOf('*/', i + 2)
      i = end < 0 ? text.length : end + 2
      continue
    }
    const c = text[i]
    if (!quote && (c === "'" || c === '"' || c === '`')) quote = c
    else if (quote && c === '\\') {
      out += text.slice(i, i + 2)
      i += 2
      continue
    } else if (quote && c === quote) quote = ''
    out += c
    i += 1
  }
  return out
}

function steady(read) {
  const first = JSON.stringify(read())
  const second = JSON.stringify(read())
  if (first !== second) return 'the same situations read differently the second time'
  if (first === '[]') return 'the list of situations is empty'
  return null
}

function twice(read, wrong) {
  const first = read()
  const second = read()
  if (first !== second) return 'the same paperwork was read differently the second time'
  if (wrong && first == null) return 'wrong paperwork was called a pass'
  if (!wrong && first != null) return 'right paperwork was called a failure'
  return null
}

function uses(run, token, plain) {
  if (!source(run).includes(token)) return `the sentence no longer checks ${plain}`
  return null
}

function returnsPass(run) {
  if (source(run).includes('return null')) return 'a failure can be returned as a pass'
  return null
}

function after(run, earlier, later) {
  const text = source(run)
  const first = text.indexOf(earlier)
  const second = text.indexOf(later)
  if (first < 0 || second < 0 || first > second) return false
  return true
}

function has(ok, words) {
  if (!ok) return `the list no longer has ${words}`
  return null
}

function doorsAre(list, expected, plain) {
  if (JSON.stringify(list) !== JSON.stringify(expected)) return plain
  return null
}

function legalBasketsHold() {
  return steady(() => legalBaskets)
    ?? has(legalBaskets.length >= 2, 'more than one legal basket')
    ?? has(legalBaskets.some((basket) => basket.shipping === 0), 'a basket with no shipping')
    ?? has(legalBaskets.some((basket) => basket.shipping > 0), 'a basket with shipping')
    ?? has(legalBaskets.some((basket) => basket.lines.length > 1), 'a basket of several products')
    ?? has(legalBaskets.some((basket) => basket.lines.some((line) => line.qty > 2)), 'a quantity above two')
    ?? has(legalBaskets.some((basket) => basket.lines.some((line) => line.id !== 'a' && line.id !== 'b')), 'a product other than a and b')
    ?? has(legalBaskets.some((basket) => basket.total === 5000 && basketText(basket) === 'a:2,b:1'), 'the basket of 5000 for a:2,b:1')
}

function refusalHolds(rule, run, shape, missing) {
  const list = () => refusalsFor(rule)
  return steady(list)
    ?? uses(run, `refusalsFor('${rule}')`, missing)
    ?? uses(refuse, 'return notCharged()', 'that no payment and no order were written')
    ?? has(shape(list()), missing)
    ?? noChargePaper()
}

function doorSentence(run, token, plain, list, expected, wrongOrder) {
  return legalBasketsHold()
    ?? uses(run, 'legalBaskets', 'every legal basket')
    ?? uses(run, token, plain)
    ?? uses(run, 'deliver(', 'the bank notice or the customer return')
    ?? deliverHolds()
    ?? doorsAre(list, expected, wrongOrder)
}

function deliverHolds() {
  const text = source(deliver)
  const seedAt = text.indexOf('seedLines(')
  const changeAt = text.indexOf('change?.(')
  const doorsAt = text.indexOf('for (const door of doors)')
  if (seedAt < 0 || changeAt < 0 || doorsAt < 0 || !(seedAt < changeAt && changeAt < doorsAt)) {
    return 'a later price or basket is no longer applied before the sale'
  }
  if (!text.includes("door === 'bank'") || !text.includes('await bankNotice(paid)')) return 'a bank notice is no longer delivered'
  if (!text.includes("door === 'customer'") || !text.includes('await customerReturns(session, paid.id)')) return 'the customer return is no longer delivered'
  return uses(deliver, 'return saleRecorded(', 'the order for that payment') ?? recordedSaleHolds()
}

function recordedSaleHolds() {
  return uses(saleRecorded, 'saleVerdict(', 'the order and the stock')
    ?? uses(saleRecorded, 'orderCountIs(1)', 'that there is one order')
}

function changeIsInside(run, token, plain) {
  if (!after(run, 'deliver(', token)) return plain
  return null
}

function shopStillDoesTheWork() {
  return uses(charge, 'return createPaymentIntent(', 'the shop charges the payment')
    ?? uses(charge, 'grandTotal: 1', 'the price the customer typed')
    ?? uses(charge, "basket: 'nope:9'", 'the basket the customer typed')
    ?? uses(bankNotice, 'generateTestHeaderString', 'the bank signature')
    ?? uses(bankNotice, 'return handlePaymentWebhook(', 'a bank notice')
    ?? uses(forgedBankNotice, 'return handlePaymentWebhook(', 'a forged bank notice')
    ?? uses(unsignedBankNotice, 'return handlePaymentWebhook(', 'a notice with no signature')
    ?? uses(customerReturns, 'await handlePaymentReturn(', 'the customer returning')
    ?? uses(customerReturns, 'if (!isRedirect(error)) throw error', 'a failed return is reported')
}

function sellsNothing(run, token, plain) {
  return legalBasketsHold()
    ?? uses(run, 'legalBaskets', 'every legal basket')
    ?? uses(run, token, plain)
    ?? uses(run, 'return nothingSold(', 'that nothing was sold')
}

async function putOrder(id, items, total, currency = 'PLN') {
  await backendClient.transaction().create({
    _id: `order_${id}`,
    paymentIntentId: id,
    pricing: { total, currency, shipping: 0 },
    items,
  }).commit()
}

function chargePaper() {
  const paid = (amount, currency, basket) => [{ amount, currency, metadata: { basket } }]
  return twice(() => chargeVerdict(paid(1, 'pln', 'a:1'), 100, 'a:1'), true)
    ?? twice(() => chargeVerdict(paid(100, 'usd', 'a:1'), 100, 'a:1'), true)
    ?? twice(() => chargeVerdict(paid(100, 'pln', 'nope'), 100, 'a:1'), true)
    ?? twice(() => chargeVerdict([], 100, 'a:1'), true)
    ?? twice(() => chargeVerdict(paid(100, 'pln', 'a:1'), 100, 'a:1'), false)
}

function noChargePaper() {
  return uses(notCharged, 'notChargedVerdict(', 'that no payment and no order were written')
    ?? twice(() => notChargedVerdict([{ amount: 1, metadata: { basket: 'x' } }], 0), true)
    ?? twice(() => notChargedVerdict([], 1), true)
    ?? twice(() => notChargedVerdict([], 0), false)
}

function payablePaper() {
  const payment = (status, amount, basket, currency = 'pln') => ({ status, amount, currency, metadata: { basket } })
  const judge = (payments) => stillPayable(payments, 100, 'a:1')
  return twice(() => judge([payment('succeeded', 5000, 'a:2,b:1')]), true)
    ?? twice(() => judge([payment('canceled', 5000, 'a:2,b:1')]), true)
    ?? twice(() => judge([]), true)
    ?? twice(() => judge([payment('requires_payment_method', 100, 'a:1', 'usd')]), true)
    ?? twice(() => judge([
      payment('requires_payment_method', 100, 'a:1'),
      payment('requires_payment_method', 100, 'a:1'),
    ]), true)
    ?? twice(() => judge([payment('requires_payment_method', 100, 'a:1')]), false)
    ?? twice(() => judge([
      payment('canceled', 5000, 'a:2,b:1'),
      payment('requires_payment_method', 100, 'a:1'),
    ]), false)
}

function beforePaper() {
  return twice(() => beforeSuccess('1 orders were written', 1, 1), true)
    ?? twice(() => beforeSuccess(null, 0, 1), true)
    ?? twice(() => beforeSuccess(null, 1, 1), false)
}

async function noSalePaper() {
  reset()
  seed([{ id: 'a', unit: 100, stock: 10 }])
  const quiet = twice(() => nothingSold({ a: 10 }), false)
  if (quiet) return quiet
  await putOrder('pi_std', [{ productId: 'a', quantity: 1, price: 100 }], 100)
  const sold = twice(() => nothingSold({ a: 10 }), true)
  if (sold) return sold
  reset()
  seed([{ id: 'a', unit: 100, stock: 10 }])
  return twice(() => nothingSold({ a: 9 }), true)
}

async function orderPaper() {
  const line = [{ productId: 'a', quantity: 1, unit: 100 }]
  const expect = { a: 9 }
  reset()
  const missing = twice(() => saleVerdict('pi_std', 100, 'pln', line, 0, expect), true)
  if (missing) return missing
  reset()
  seed([{ id: 'a', unit: 100, stock: 9 }])
  await putOrder('pi_std', [{ productId: 'a', quantity: 1, price: 9000 }], 100)
  const priced = twice(() => saleVerdict('pi_std', 100, 'pln', line, 0, expect), true)
  if (priced) return priced
  reset()
  seed([{ id: 'a', unit: 100, stock: 9 }])
  await putOrder('pi_std', [{ productId: 'a', quantity: 1, price: 100 }], 100, 'USD')
  const currency = twice(() => saleVerdict('pi_std', 100, 'pln', line, 0, expect), true)
  if (currency) return currency
  reset()
  seed([{ id: 'a', unit: 100, stock: 10 }])
  await putOrder('pi_std', [{ productId: 'a', quantity: 1, price: 100 }], 100)
  const unmoved = twice(() => saleVerdict('pi_std', 100, 'pln', line, 0, expect), true)
  if (unmoved) return unmoved
  reset()
  seed([{ id: 'a', unit: 100, stock: 9 }])
  await putOrder('pi_std', [{ productId: 'a', quantity: 1, price: 100 }], 100)
  const basket = { name: 'one item', lines: [{ id: 'a', qty: 1, unit: 100 }], shipping: 0, total: 100 }
  const recorded = twice(() => saleRecorded(basket, 'pi_std'), false)
  if (recorded) return recorded
  await putOrder('pi_extra', [{ productId: 'a', quantity: 1, price: 100 }], 100)
  const extra = twice(() => saleRecorded(basket, 'pi_std'), true)
  if (extra) return extra
  return twice(() => orderCountIs(1), true)
}

function unmatchedOrder() {
  reset()
  return twice(() => orderMatches('pi_c1', 100, 'pln', [{ productId: 'c', quantity: 1, unit: 100 }], 0), true)
}

async function stockPaper() {
  reset()
  const missing = twice(() => stockExplained({ c: 4 }), true)
  if (missing) return missing
  reset()
  seed([{ id: 'c', unit: 100, stock: 7 }])
  await putOrder('pi_c1', [{ productId: 'c', quantity: 2, price: 100, fulfilled: 3 }], 200)
  const over = twice(() => stockExplained({ c: 10 }), true)
  if (over) return over
  reset()
  seed([{ id: 'c', unit: 100, stock: 11 }])
  await putOrder('pi_c1', [{ productId: 'c', quantity: 2, price: 100, fulfilled: -1 }], 200)
  const below = twice(() => stockExplained({ c: 10 }), true)
  if (below) return below
  reset()
  seed([{ id: 'c', unit: 100, stock: -1 }])
  const negative = twice(() => stockExplained({ c: 0 }), true)
  if (negative) return negative
  reset()
  seed([{ id: 'c', unit: 100, stock: 4 }])
  await putOrder('pi_c1', [{ productId: 'c', quantity: 2, price: 100 }], 200)
  const unexplained = twice(() => stockExplained({ c: 5 }), true)
  if (unexplained) return unexplained
  reset()
  seed([{ id: 'c', unit: 100, stock: 8 }])
  await putOrder('pi_c1', [{ productId: 'c', quantity: 2, price: 100, fulfilled: 0 }], 200)
  const fulfilled = twice(() => stockExplained({ c: 10 }), true)
  if (fulfilled) return fulfilled
  reset()
  seed([{ id: 'c', unit: 100, stock: 8 }])
  await putOrder('pi_c1', [{ productId: 'c', quantity: 2, price: 100 }], 200)
  return twice(() => stockExplained({ c: 10 }), false)
}

function changesHold() {
  const pairs = () => basketChanges()
  return steady(pairs)
    ?? has(pairs().length === legalBaskets.length * (legalBaskets.length - 1), 'every change from one legal basket to another')
    ?? has(pairs().every((change) => change.before.total !== change.after.total || basketText(change.before) !== basketText(change.after)), 'a change of the amount or the goods')
}

function priceStillChanges() {
  try {
    for (const basket of legalBaskets) {
      const id = changedShelfId(basket)
      const line = basket.lines.find((item) => item.id === id)
      if (!line || line.unit === OTHER_PRICE) return 'the later price does not change a line'
    }
    return null
  } catch (error) {
    return error?.proofBroken ? error.message : 'the later price could not be read'
  }
}

function basketStillChanges() {
  for (const basket of legalBaskets) {
    const next = differentSessionLines(basket)
    const same = next.length === basket.lines.length
      && next.every((line, index) => line.productId === basket.lines[index].id && line.quantity === basket.lines[index].qty)
    if (same) return `the later basket for ${basket.name} is the same basket`
  }
  return null
}

function processingOrder(run) {
  const text = source(run)
  const early = text.indexOf('beforeSuccess(')
  const later = text.indexOf("paid.status = 'succeeded'")
  if (early === -1 || later === -1 || early > later) {
    return 'the check that nothing was sold is no longer before the payment succeeds'
  }
  return null
}

function forgedList() {
  const list = () => forgedSituations()
  return steady(list)
    ?? has(list().length >= legalBaskets.length, 'a forged notice for every legal basket')
    ?? has(list().some((situation) => situation.signature === 't=1,v1=dead'), 'the dead signature t=1,v1=dead')
    ?? has(list().some((situation) => situation.signature !== 't=1,v1=dead'), 'a second forged signature')
}

async function checkerHolds() {
  const one = [{ name: 'small' }]
  const first = await checkEvery(one, async () => 'no')
  const second = await checkEvery(one, async () => 'no')
  if (first !== second) return 'the same situations were not the same answer twice'
  if (first !== 'small: no (1 of 1)') return 'one failure was not reported with its situation and 1 of 1'
  if (await checkEvery(one, async () => null) !== null) return 'a situation that matched was not left as a pass'
  const both = await checkEvery([{ name: 'small' }, { name: 'large' }], async (situation) => situation.name)
  if (both !== 'small: small; large: large (2 of 2)') return 'two failures did not name the first situation first, and 2 of 2'
  try {
    await checkEvery([], async () => null)
    return 'an empty list was called a pass'
  } catch (error) {
    if (!error?.proofBroken) return 'an empty list failed for another reason'
  }
  return null
}

function raceIsHeld() {
  const text = source(shortShelf)
  const pause = text.indexOf('pauseCommits(')
  const first = text.indexOf('bankNotice(first)', pause)
  const waitOne = text.indexOf('waitForCommits(1)', first)
  const second = text.indexOf('bankNotice(second)', waitOne)
  const waitTwo = text.indexOf('waitForCommits(2)', second)
  const resume = text.indexOf('resumeCommits(', waitTwo)
  const retry = text.indexOf('bankNotice(second)', second + 1)
  if (pause < 0 || first < 0 || second < 0 || retry < 0) return 'the two sales are no longer held apart'
  if (!(pause < first && first < waitOne && waitOne < second && second < waitTwo && waitTwo < resume && resume < retry)) {
    return 'the two sales are no longer held apart, with the second notice delivered again'
  }
  if (text.split('?? orderCountIs(situation.buyers)').length < 3) return 'each short shelf no longer checks how many orders were written'
  return null
}

async function aMissingCommitDoesNotPass() {
  reset()
  try {
    await until(1)
    return 'a sale that never arrives was called finished'
  } catch (error) {
    if (!error?.proofBroken) return 'a sale that never arrives failed for another reason'
    return null
  }
}

const sentenceProofs = new Map([
  ['Every legal basket is charged the shelf price, not the price the customer typed', (run) =>
    legalBasketsHold() ?? uses(run, 'legalBaskets', 'every legal basket') ?? uses(run, 'priceRows(basket))', 'the shelf price') ?? uses(run, 'return chargeVerdict(', 'the amount, the currency, and the basket on the payment') ?? chargePaper()],

  ['Charging a legal basket does not sell the goods', async (run) =>
    legalBasketsHold() ?? uses(run, 'legalBaskets', 'every legal basket') ?? uses(run, 'priceRows(basket))', 'the shelf price') ?? uses(run, 'return nothingSold(', 'that nothing was sold') ?? await noSalePaper()],

  ['An empty basket is not charged', (run) =>
    refusalHolds('empty', run, (list) => list.some((situation) => situation.basket.length === 0), 'an empty basket')],
  ['A missing shipping price is not charged', (run) =>
    refusalHolds('shipping', run, (list) => list.some((situation) => situation.shipping === SHIPPING_MISSING) && list.some((situation) => situation.basket.length > 1), 'a missing shipping price on one item and on two items')],
  ['An unknown product is not charged', (run) =>
    refusalHolds('unknown', run, (list) => list.some((situation) => situation.basket.some((item) => situation.rows.every((row) => row._id !== item.productId))), 'a product the shelf does not have')],
  ['A product with no price is not charged', (run) =>
    refusalHolds('price', run, (list) => {
      const units = list.flatMap((situation) => situation.rows.map((row) => (row.price_data == null ? null : row.price_data.unit_amount)))
      return units.includes(null) && units.includes(0) && units.some((unit) => unit < 0)
    }, 'a missing price, a price of 0, and a negative price')],
  ['A quantity of zero is not charged', (run) =>
    refusalHolds('zero', run, (list) => list.some((situation) => situation.basket.some((item) => item.quantity === 0) && situation.shipping === 500) && list.some((situation) => situation.basket.length > 1 && situation.basket.some((item) => item.quantity === 0)), 'a quantity of 0 with shipping, and a quantity of 0 beside a real line')],
  ['A negative quantity is not charged', (run) =>
    refusalHolds('negative', run, (list) => list.some((situation) => situation.basket.some((item) => item.quantity < 0) && situation.shipping > 0) && list.some((situation) => situation.basket.some((item) => item.quantity < 0) && situation.basket.some((item) => item.quantity > 0)), 'a negative quantity beside a real line, with shipping')],
  ['A fractional quantity is not charged', (run) =>
    refusalHolds('fraction', run, (list) => list.some((situation) => situation.shipping === 0 && situation.basket.some((item) => !Number.isInteger(item.quantity))) && list.some((situation) => situation.shipping > 0 && situation.basket.some((item) => !Number.isInteger(item.quantity))), 'a fractional quantity with shipping and without it')],
  ['A total that is not a whole number of grosze is not charged', (run) =>
    refusalHolds('grosze', run, (list) => list.some((situation) => !Number.isInteger(situation.shipping)) && list.some((situation) => situation.rows.some((row) => !Number.isInteger(row.price_data?.unit_amount))), 'half a grosz of shipping, and a price that is not a whole grosz')],
  ['A price the computer cannot store exactly is not charged', (run) =>
    refusalHolds('exact', run, (list) => list.every((situation) => !productFits(situation.rows[0].price_data.unit_amount, situation.basket[0].quantity)), 'a price the computer cannot store exactly')],
  ['A product id that cannot be written down whole is not charged', (run) =>
    refusalHolds('id', run, (list) => list.every((situation) => !idRoundTrips(situation.basket[0].productId)) && list.some((situation) => situation.basket[0].productId.includes(',')) && list.some((situation) => situation.basket[0].productId.includes(':')), 'a product id with a comma and a product id with a colon')],
  ['A basket that does not fit in the payment record is not charged', (run) =>
    refusalHolds('fit', run, (list) => list.every((situation) => `${situation.basket[0].productId}:${situation.basket[0].quantity}`.length > 500), 'a basket text longer than the payment record')],

  ['Changing to any other legal basket leaves exactly one charge for the new basket', (run) =>
    changesHold()
    ?? uses(run, 'basketChanges(', 'every change from one legal basket to another')
    ?? uses(run, 'priceRows(situation.before))', 'the first shelf price')
    ?? uses(run, 'priceRows(situation.after))', 'the new shelf price')
    ?? uses(run, 'return stillPayable(', 'the one charge for the new basket')
    ?? payablePaper()],

  ['Every payment the shop creates becomes one order for that same payment', async (run) =>
    legalBasketsHold()
    ?? uses(run, 'legalBaskets', 'every legal basket')
    ?? uses(run, 'priceRows(basket))', 'the shelf price')
    ?? uses(run, 'const created = openPayments()', 'the payment the shop created')
    ?? uses(run, 'chargeVerdict(created', 'the payment the shop created')
    ?? uses(run, 'if (wrong) return wrong', 'a wrong charge')
    ?? uses(run, 'return saleRecorded(', 'the order for that payment')
    ?? recordedSaleHolds()
    ?? chargePaper()
    ?? await orderPaper()],

  ['One bank notice creates one order for every legal basket', async (run) =>
    doorSentence(run, 'oneBankNotice', 'one bank notice', oneBankNotice, ['bank'], 'one bank notice is no longer a single notice from the bank') ?? await orderPaper()],
  ['The same bank notice twice still creates one order for every legal basket', async (run) =>
    doorSentence(run, 'twoBankNotices', 'the same bank notice twice', twoBankNotices, ['bank', 'bank'], 'two bank notices are no longer the same notice twice') ?? await orderPaper()],
  ['The customer returning once creates one order for every legal basket', async (run) =>
    doorSentence(run, 'oneReturn', 'the customer returning once', oneReturn, ['customer'], 'one return is no longer a single return from the customer') ?? await orderPaper()],
  ['The customer returning twice still creates one order for every legal basket', async (run) =>
    doorSentence(run, 'twoReturns', 'the customer returning twice', twoReturns, ['customer', 'customer'], 'two returns are no longer the same return twice') ?? await orderPaper()],
  ['The customer returns, then the bank notice arrives: still one order for every legal basket', async (run) =>
    doorSentence(run, 'returnThenBank', 'the customer returning before the bank notice', returnThenBank, ['customer', 'bank'], 'the customer no longer returns before the bank notice') ?? await orderPaper()],
  ['The bank notice arrives, then the customer returns: still one order for every legal basket', async (run) =>
    doorSentence(run, 'bankThenReturn', 'the bank notice arriving before the customer returns', bankThenReturn, ['bank', 'customer'], 'the bank notice no longer arrives before the customer returns') ?? await orderPaper()],

  ['A later shelf price does not change the order when the customer returns first', async (run) =>
    doorSentence(run, 'returnThenBank', 'the customer returning before the bank notice', returnThenBank, ['customer', 'bank'], 'the customer no longer returns before the bank notice')
    ?? changeIsInside(run, 'setShelfPrice(changedShelfId', 'the later shelf price is no longer applied to the sale')
    ?? uses(run, 'OTHER_PRICE', 'the later price of 9000')
    ?? priceStillChanges()
    ?? await orderPaper()],
  ['A later shelf price does not change the order when the bank notice arrives first', async (run) =>
    doorSentence(run, 'bankThenReturn', 'the bank notice arriving before the customer returns', bankThenReturn, ['bank', 'customer'], 'the bank notice no longer arrives before the customer returns')
    ?? changeIsInside(run, 'setShelfPrice(changedShelfId', 'the later shelf price is no longer applied to the sale')
    ?? uses(run, 'OTHER_PRICE', 'the later price of 9000')
    ?? priceStillChanges()
    ?? await orderPaper()],
  ['A later basket does not change the order when the customer returns first', async (run) =>
    doorSentence(run, 'returnThenBank', 'the customer returning before the bank notice', returnThenBank, ['customer', 'bank'], 'the customer no longer returns before the bank notice')
    ?? changeIsInside(run, 'differentSessionLines(', 'the later basket is no longer applied to the sale')
    ?? basketStillChanges()
    ?? await orderPaper()],
  ['A later basket does not change the order when the bank notice arrives first', async (run) =>
    doorSentence(run, 'bankThenReturn', 'the bank notice arriving before the customer returns', bankThenReturn, ['bank', 'customer'], 'the bank notice no longer arrives before the customer returns')
    ?? changeIsInside(run, 'differentSessionLines(', 'the later basket is no longer applied to the sale')
    ?? basketStillChanges()
    ?? await orderPaper()],

  ['A payment that is still processing sells nothing, and success afterwards sells once', async (run) =>
    legalBasketsHold()
    ?? uses(run, 'legalBaskets', 'every legal basket')
    ?? uses(run, 'beforeSuccess(nothingSold(', 'that nothing was sold while the payment is still processing')
    ?? uses(run, 'if (early) return early', 'that an early sale is reported')
    ?? processingOrder(run)
    ?? uses(run, 'return saleRecorded(', 'the order after the payment succeeds')
    ?? recordedSaleHolds()
    ?? beforePaper()
    ?? await orderPaper()],

  ['Returning while the bank still wants a payment method sells nothing', async (run) =>
    sellsNothing(run, 'requires_payment_method', 'a payment the bank has not taken') ?? uses(run, "return 'the basket was cleared'", 'that the basket is still there') ?? await noSalePaper()],
  ['Returning after the bank canceled sells nothing', async (run) =>
    sellsNothing(run, 'customerReturns(', 'the customer returning') ?? uses(run, "'canceled'", 'a canceled payment') ?? uses(run, "return 'the basket was cleared'", 'that the basket is still there') ?? await noSalePaper()],
  ['A failed bank notice sells nothing', async (run) =>
    sellsNothing(run, 'payment_intent.payment_failed', 'a failed bank notice') ?? await noSalePaper()],
  ['A canceled bank notice sells nothing', async (run) =>
    sellsNothing(run, 'payment_intent.canceled', 'a canceled bank notice') ?? await noSalePaper()],
  ['A forged bank notice sells nothing', async (run) =>
    forgedList() ?? uses(run, 'forgedSituations(', 'every forged notice') ?? uses(run, 'forgedBankNotice(', 'a forged signature') ?? uses(run, 'return nothingSold(', 'that nothing was sold') ?? await noSalePaper()],
  ['A bank notice with no signature sells nothing', async (run) =>
    steady(() => unsignedSituations)
    ?? has(unsignedSituations.some((situation) => situation.signature === null), 'a notice with no signature')
    ?? has(unsignedSituations.some((situation) => situation.signature === ''), 'a notice with an empty signature')
    ?? uses(run, 'unsignedSituations', 'a notice with no signature and an empty signature')
    ?? uses(run, 'unsignedBankNotice(', 'a notice with no signature')
    ?? uses(run, 'return nothingSold(', 'that nothing was sold')
    ?? await noSalePaper()],
  ["Returning with someone else's payment sells nothing", async (run) =>
    sellsNothing(run, "customerReturns(session, 'pi_other')", "someone else's payment") ?? uses(run, "return 'the basket was cleared'", 'that the basket is still there') ?? await noSalePaper()],

  ['Every pair of payments the shelf can fill takes exactly the units they paid for', async (run) =>
    steady(() => filledShelves)
    ?? has(filledShelves.every((situation) => situation.stock >= situation.buyers * situation.qty), 'a shelf that can fill both payments')
    ?? has(filledShelves.some((situation) => situation.stock === 5 && situation.qty === 2 && situation.buyers === 2), 'two payments for 2, on a shelf of 5')
    ?? uses(run, 'filledShelves', 'every shelf that can fill both payments')
    ?? uses(run, 'twoCustomers', 'both payments')
    ?? uses(twoCustomers, 'orderMatches(', 'each order')
    ?? uses(twoCustomers, 'stockExplained(', 'the stock against the paid units')
    ?? uses(twoCustomers, '?? orderCountIs(situation.buyers)', 'how many orders were written')
    ?? unmatchedOrder()
    ?? await stockPaper()],

  ['Every payment for units the shelf does not have leaves a record of those units', async (run) =>
    steady(() => shortShelves)
    ?? has(shortShelves.every((situation) => situation.stock < situation.buyers * situation.qty), 'a shelf that is short of the paid units')
    ?? has(shortShelves.some((situation) => situation.stock === 0), 'a shelf of 0')
    ?? has(shortShelves.some((situation) => situation.buyers === 2 && situation.qty === 1 && situation.stock === 1 && situation.race === true), 'two payments for the last unit, with the second notice delivered again')
    ?? uses(run, 'shortShelves', 'every shelf that is short')
    ?? uses(run, 'shortShelf)', 'the short shelf')
    ?? uses(shortShelf, 'orderMatches(', 'each order')
    ?? uses(shortShelf, 'stockExplained(', 'the stock against the paid units')
    ?? uses(shortShelf, 'pauseCommits(', 'holding the two sales apart')
    ?? uses(shortShelf, 'waitForCommits(', 'both sales reaching their commit')
    ?? raceIsHeld()
    ?? unmatchedOrder()
    ?? await stockPaper()
    ?? await aMissingCommitDoesNotPass()],
])

export async function testsHold(parityCases, conservationCases) {
  reset()
  try {
    const sentences = new Map()
    for (const [name, run] of [...parityCases, ...conservationCases]) {
      if (sentences.has(name)) return `two sentences are named “${name}”`
      sentences.set(name, run)
    }
    const checker = await checkerHolds()
    if (checker) return checker
    const shop = shopStillDoesTheWork()
    if (shop) return shop
    const helpers = returnsPass(refuse) ?? returnsPass(deliver) ?? returnsPass(saleRecorded) ?? returnsPass(twoCustomers) ?? returnsPass(shortShelf)
    if (helpers) return helpers
    for (const [name, proof] of sentenceProofs) {
      const run = sentences.get(name)
      if (!run) return `“${name}” is not one of the sentences`
      const skipped = uses(run, 'checkEvery(', 'every situation') ?? returnsPass(run)
      if (skipped) return `“${name}”: ${skipped}`
      const hole = await proof(run)
      if (hole) return `“${name}”: ${hole}`
    }
    for (const name of sentences.keys()) {
      if (!sentenceProofs.has(name)) return `“${name}” has no check that it holds`
    }
    return null
  } finally {
    reset()
  }
}
