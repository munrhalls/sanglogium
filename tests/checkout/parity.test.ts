// Parity.
//
// Was the customer charged the shelf price, and did that one successful
// payment become exactly one order for the same amount and the same goods?
//
// Each sentence is a property. It is checked for every situation in its
// list, in tests/checkout/domain.mjs. The list is the whole range. A PASS
// means every situation ended as the sentence says. A NO names the smallest
// situation that did not, and what happened instead.
//
// The amounts are the numbers written on those situations. Nothing here
// waits, rolls dice, or calls Stripe, Sanity, or the database.

import { beforeSuccess, chargeVerdict, nothingSold, orderCountIs, saleVerdict, stillPayable } from './books.mjs'
import {
  LATER_ADDRESS,
  LATER_SHIPPING,
  ORDER_DELIVERY,
  OTHER_PRICE,
  SHIPPING_MISSING,
  bankThenReturn,
  basketChanges,
  basketText,
  changedShelfId,
  checkEvery,
  differentSessionLines,
  forgedSituations,
  fullShelfRows,
  knownBasket,
  legalBaskets,
  longestAddresses,
  oneBankNotice,
  oneReturn,
  orderLines,
  priceRows,
  returnThenBank,
  SHELF,
  refusalsFor,
  sessionLines,
  stockFull,
  stockLeft,
  twoBankNotices,
  twoReturns,
  unsignedSituations,
} from './domain.mjs'
import {
  allPayments,
  bankNotice,
  basketSession,
  charge,
  customerReturns,
  forgedBankNotice,
  fresh,
  notCharged,
  openPayments,
  pauseCommits,
  payment,
  rememberPayment,
  resumeCommits,
  seedLines,
  setShelfPrice,
  unsignedBankNotice,
  waitForCommits,
} from './shop.test.ts'

export const question = 'Parity'

function sessionFor(basket, extra = {}) {
  return basketSession({
    basket: sessionLines(basket),
    shippingCost: basket.shipping,
    ...extra,
  })
}

function paidFor(basket, id, status) {
  return payment({
    id,
    amount: basket.total,
    basket: basketText(basket),
    shipping: basket.shipping,
    status,
    unitPrices: basket.lines.map((line) => `${line.id}:${line.unit}`).join(','),
  })
}

export function saleRecorded(basket, paymentId, delivery) {
  return saleVerdict(paymentId, basket.total, 'pln', orderLines(basket), basket.shipping, delivery, stockLeft(basket))
    ?? orderCountIs(1)
}

export async function deliver(basket, doors, change) {
  fresh()
  seedLines(basket.lines, SHELF)
  const session = sessionFor(basket, { paymentIntentId: 'pi_std' })
  change?.(session)
  const paid = paidFor(basket, 'pi_std', 'succeeded')
  rememberPayment(paid)
  for (const door of doors) {
    if (door === 'bank') await bankNotice(paid)
    if (door === 'customer') await customerReturns(session, paid.id)
  }
  return saleRecorded(basket, paid.id, ORDER_DELIVERY)
}

// The bank notice and the customer's return both read the shelf before
// either one writes. Their writes are held, then land one after the other.
// If the shop gives up before writing, both doors finish first, and the
// books say what is missing.
export async function sameMoment(basket) {
  fresh()
  seedLines(basket.lines, SHELF)
  const session = sessionFor(basket, { paymentIntentId: 'pi_std' })
  const paid = paidFor(basket, 'pi_std', 'succeeded')
  rememberPayment(paid)
  pauseCommits()
  const bank = bankNotice(paid)
  const customer = customerReturns(session, paid.id)
  const finished = Promise.all([bank, customer]).then(() => false)
  const held = waitForCommits(2).then(() => true, () => false)
  await Promise.race([held, finished])
  resumeCommits()
  await bank
  await customer
  return saleRecorded(basket, paid.id, ORDER_DELIVERY)
}

export async function refuse(situation) {
  fresh()
  const extra = { checkoutSessionId: 'sess_refuse', basket: situation.basket }
  if (situation.shipping === SHIPPING_MISSING) extra.shippingCost = undefined
  else extra.shippingCost = situation.shipping
  if (situation.address) extra.address = situation.address
  await charge(basketSession(extra), situation.rows)
  return notCharged()
}

export const cases = [
  ['Every legal basket is charged the shelf price, not the price the customer typed', () => checkEvery(legalBaskets, async (basket) => {
    fresh()
    await charge(sessionFor(basket, { checkoutSessionId: 'sess_price' }), priceRows(basket))
    return chargeVerdict(openPayments(), basket.total, basketText(basket))
  })],

  ['A basket asking for exactly what the shelf holds is charged', () => checkEvery(legalBaskets, async (basket) => {
    fresh()
    await charge(sessionFor(basket, { checkoutSessionId: 'sess_full' }), fullShelfRows(basket))
    return chargeVerdict(openPayments(), basket.total, basketText(basket))
  })],

  ['Charging a legal basket does not sell the goods', () => checkEvery(legalBaskets, async (basket) => {
    fresh()
    seedLines(basket.lines, SHELF)
    await charge(sessionFor(basket, { checkoutSessionId: 'sess_nosale' }), priceRows(basket))
    return nothingSold(stockFull(basket))
  })],

  ['An empty basket is not charged', () => checkEvery(refusalsFor('empty'), refuse)],
  ['A missing shipping price is not charged', () => checkEvery(refusalsFor('shipping'), refuse)],
  ['An unknown product is not charged', () => checkEvery(refusalsFor('unknown'), refuse)],
  ['A product with no price is not charged', () => checkEvery(refusalsFor('price'), refuse)],
  ['A quantity of zero is not charged', () => checkEvery(refusalsFor('zero'), refuse)],
  ['A negative quantity is not charged', () => checkEvery(refusalsFor('negative'), refuse)],
  ['A fractional quantity is not charged', () => checkEvery(refusalsFor('fraction'), refuse)],
  ['A total that is not a whole number of grosze is not charged', () => checkEvery(refusalsFor('grosze'), refuse)],
  ['A price the computer cannot store exactly is not charged', () => checkEvery(refusalsFor('exact'), refuse)],
  ['A product id that cannot be written down whole is not charged', () => checkEvery(refusalsFor('id'), refuse)],
  ['A basket that does not fit in the payment record is not charged', () => checkEvery(refusalsFor('fit'), refuse)],
  ['An address that does not fit in the payment record is not charged', () => checkEvery(refusalsFor('address'), refuse)],
  ['A basket asking for more than the shelf holds is not charged', () => checkEvery(refusalsFor('stock'), refuse)],

  ['Changing to any other legal basket leaves exactly one charge for the new basket', () => checkEvery(basketChanges(), async (situation) => {
    fresh()
    const session = sessionFor(situation.before, { checkoutSessionId: 'sess_change' })
    await charge(session, priceRows(situation.before))
    session.basket = sessionLines(situation.after)
    session.shippingCost = situation.after.shipping
    await charge(session, priceRows(situation.after))
    return stillPayable(allPayments(), situation.after.total, basketText(situation.after))
  })],

  ['Every payment the shop creates becomes one order for that same payment', () => checkEvery(legalBaskets, async (basket) => {
    fresh()
    seedLines(basket.lines, SHELF)
    await charge(sessionFor(basket, { checkoutSessionId: 'sess_join' }), priceRows(basket))
    const created = openPayments()
    const wrong = chargeVerdict(created, basket.total, basketText(basket))
    if (wrong) return wrong
    created[0].status = 'succeeded'
    await bankNotice(created[0])
    return saleRecorded(basket, created[0].id, ORDER_DELIVERY)
  })],

  ['A payment the shop creates for the longest address it accepts becomes one order to that address', () => checkEvery(longestAddresses(), async (situation) => {
    const basket = knownBasket()
    fresh()
    seedLines(basket.lines, SHELF)
    await charge(sessionFor(basket, { checkoutSessionId: 'sess_address', address: situation.address }), priceRows(basket))
    const created = openPayments()
    const wrong = chargeVerdict(created, basket.total, basketText(basket))
    if (wrong) return wrong
    const written = created[0].metadata.address.length
    if (written !== 500) return `the address on the payment is ${written} characters`
    created[0].status = 'succeeded'
    await bankNotice(created[0])
    return saleRecorded(basket, created[0].id, situation.delivery)
  })],

  ['One bank notice creates one order for every legal basket', () => checkEvery(legalBaskets, (basket) => deliver(basket, oneBankNotice))],
  ['The same bank notice twice still creates one order for every legal basket', () => checkEvery(legalBaskets, (basket) => deliver(basket, twoBankNotices))],
  ['The customer returning once creates one order for every legal basket', () => checkEvery(legalBaskets, (basket) => deliver(basket, oneReturn))],
  ['The customer returning twice still creates one order for every legal basket', () => checkEvery(legalBaskets, (basket) => deliver(basket, twoReturns))],
  ['The customer returns, then the bank notice arrives: still one order for every legal basket', () => checkEvery(legalBaskets, (basket) => deliver(basket, returnThenBank))],
  ['The bank notice arrives, then the customer returns: still one order for every legal basket', () => checkEvery(legalBaskets, (basket) => deliver(basket, bankThenReturn))],
  ["The bank notice and the customer's return at the same moment still create one order for every legal basket", () => checkEvery(legalBaskets, sameMoment)],

  ['A later shelf price does not change the order when the customer returns first', () => checkEvery(legalBaskets, (basket) => deliver(
    basket,
    returnThenBank,
    () => setShelfPrice(changedShelfId(basket), OTHER_PRICE),
  ))],
  ['A later shelf price does not change the order when the bank notice arrives first', () => checkEvery(legalBaskets, (basket) => deliver(
    basket,
    bankThenReturn,
    () => setShelfPrice(changedShelfId(basket), OTHER_PRICE),
  ))],
  ['A later basket does not change the order when the customer returns first', () => checkEvery(legalBaskets, (basket) => deliver(
    basket,
    returnThenBank,
    (session) => { session.basket = differentSessionLines(basket) },
  ))],
  ['A later basket does not change the order when the bank notice arrives first', () => checkEvery(legalBaskets, (basket) => deliver(
    basket,
    bankThenReturn,
    (session) => { session.basket = differentSessionLines(basket) },
  ))],
  ['A later shipping choice does not change the order when the customer returns first', () => checkEvery(legalBaskets, (basket) => deliver(
    basket,
    returnThenBank,
    (session) => { Object.assign(session, LATER_SHIPPING) },
  ))],
  ['A later address does not change the order when the customer returns first', () => checkEvery(legalBaskets, (basket) => deliver(
    basket,
    returnThenBank,
    (session) => { session.address = LATER_ADDRESS },
  ))],

  ['A payment that is still processing sells nothing, and success afterwards sells once', () => checkEvery(legalBaskets, async (basket) => {
    fresh()
    seedLines(basket.lines, SHELF)
    const paid = paidFor(basket, 'pi_std', 'processing')
    rememberPayment(paid)
    const session = sessionFor(basket, { paymentIntentId: paid.id })
    await customerReturns(session, paid.id)
    const early = beforeSuccess(nothingSold(stockFull(basket)), session.basket.length, basket.lines.length)
    if (early) return early
    paid.status = 'succeeded'
    await bankNotice(paid)
    return saleRecorded(basket, paid.id, ORDER_DELIVERY)
  })],

  ['Returning while the bank still wants a payment method sells nothing', () => checkEvery(legalBaskets, async (basket) => {
    fresh()
    seedLines(basket.lines, SHELF)
    const paid = paidFor(basket, 'pi_std', 'requires_payment_method')
    rememberPayment(paid)
    const session = sessionFor(basket, { paymentIntentId: paid.id })
    await customerReturns(session, paid.id)
    if (session.basket.length !== basket.lines.length) return 'the basket was cleared'
    return nothingSold(stockFull(basket))
  })],
  ['Returning after the bank canceled sells nothing', () => checkEvery(legalBaskets, async (basket) => {
    fresh()
    seedLines(basket.lines, SHELF)
    const paid = paidFor(basket, 'pi_std', 'canceled')
    rememberPayment(paid)
    const session = sessionFor(basket, { paymentIntentId: paid.id })
    await customerReturns(session, paid.id)
    if (session.basket.length !== basket.lines.length) return 'the basket was cleared'
    return nothingSold(stockFull(basket))
  })],
  ['A failed bank notice sells nothing', () => checkEvery(legalBaskets, async (basket) => {
    fresh()
    seedLines(basket.lines, SHELF)
    await bankNotice(paidFor(basket, 'pi_failed', 'canceled'), 'payment_intent.payment_failed')
    return nothingSold(stockFull(basket))
  })],
  ['A canceled bank notice sells nothing', () => checkEvery(legalBaskets, async (basket) => {
    fresh()
    seedLines(basket.lines, SHELF)
    await bankNotice(paidFor(basket, 'pi_canceled', 'canceled'), 'payment_intent.canceled')
    return nothingSold(stockFull(basket))
  })],
  ['A forged bank notice sells nothing', () => checkEvery(forgedSituations(), async (situation) => {
    fresh()
    seedLines(situation.basket.lines, SHELF)
    await forgedBankNotice(paidFor(situation.basket, 'pi_forged', 'succeeded'), situation.signature)
    return nothingSold(stockFull(situation.basket))
  })],
  ['A bank notice with no signature sells nothing', () => checkEvery(unsignedSituations, async (situation) => {
    fresh()
    seedLines(knownBasket().lines, SHELF)
    await unsignedBankNotice(situation.signature)
    return nothingSold(stockFull(knownBasket()))
  })],
  ["Returning with someone else's payment sells nothing", () => checkEvery(legalBaskets, async (basket) => {
    fresh()
    seedLines(basket.lines, SHELF)
    const paid = paidFor(basket, 'pi_std', 'succeeded')
    rememberPayment(paid)
    const session = sessionFor(basket, { paymentIntentId: 'pi_std' })
    await customerReturns(session, 'pi_other')
    if (session.basket.length !== basket.lines.length) return 'the basket was cleared'
    return nothingSold(stockFull(basket))
  })],
]
