// How the proof reads the paperwork.
//
// These functions only compare the order file and the shelf with numbers
// the caller wrote down. They never ask the shop what the right total was,
// and they never add the shelf up themselves. A missing order, an extra
// order, a wrong price, a negative stock count, or a paid unit with no
// record of what was actually there all come back as words. Nothing here
// calls the shop, the card company, or the network.
//
// The sentences and the check that wrong paperwork is not a pass use these
// same functions. A sentence cannot keep a second, weaker comparison.

import { orderDocs, stocks } from './stock-book.mjs'

export function orderCount() {
  return orderDocs().length
}

export function orderCountIs(count) {
  const found = orderCount()
  if (found !== count) return `${found} orders were written`
  return null
}

export function stockIs(expected) {
  const now = stocks()
  for (const [id, count] of Object.entries(expected)) {
    if (now[id] !== count) return `stock of ${id} is ${now[id]}, and it should be ${count}`
  }
  return null
}

export function nothingSold(expectedStock) {
  if (orderCount() !== 0) return `${orderCount()} orders were written`
  return stockIs(expectedStock)
}

// The charge on the payment, compared with the shelf total and the basket text.
export function chargeVerdict(payments, total, text) {
  if (payments.length !== 1) return `${payments.length} payments were left open`
  const paid = payments[0]
  if (paid.amount !== total) return `the charge is ${paid.amount}`
  if (paid.currency !== 'pln') return `the currency is ${paid.currency}`
  if (paid.metadata?.basket !== text) return `the charged basket is ${paid.metadata?.basket}`
  return null
}

// One live payment for the new amount and the new goods.
// A canceled payment does not count. None, a second one, or the old amount all come back as words.
export function stillPayable(payments, amount, text) {
  const live = payments.filter((paid) => paid.status !== 'canceled')
  if (live.length === 0) return 'the new basket was not charged'
  if (live.length !== 1) return `${live.length} payments were left open`
  const paid = live[0]
  if (paid.currency !== 'pln') return `the currency is ${paid.currency}`
  if (paid.amount !== amount || paid.metadata?.basket !== text) {
    return `still payable: ${paid.amount} ${paid.metadata?.basket}`
  }
  return null
}

// A charge that should not have happened. A payment is reported before an order.
export function notChargedVerdict(payments, orders) {
  if (payments.length !== 0) return `a payment was created for ${payments[0].amount} (${payments[0].metadata?.basket ?? ''})`
  if (orders !== 0) return `${orders} orders were written`
  return null
}

// What is true while the bank has not yet taken the money.
export function beforeSuccess(sold, basketLength, lineCount) {
  if (sold) return `while processing, ${sold}`
  if (basketLength !== lineCount) return 'the basket was cleared while the payment was still processing'
  return null
}

// The order and the stock, compared with the payment.
export function saleVerdict(paymentId, amount, currency, lines, shipping, stock) {
  return orderMatches(paymentId, amount, currency, lines, shipping) ?? stockIs(stock)
}

// One order for this payment, for this amount, for these goods.
export function orderMatches(paymentId, amount, currency, lines, shipping) {
  const found = orderDocs().filter((order) => order.paymentIntentId === paymentId)
  if (found.length !== 1) return `${found.length} orders for ${paymentId}`
  const order = found[0]
  if (order.pricing.total !== amount) return `the order total is ${order.pricing.total}`
  if (String(order.pricing.currency).toLowerCase() !== currency) return `the order currency is ${order.pricing.currency}`
  if (order.pricing.shipping !== shipping) return `shipping on the order is ${order.pricing.shipping}`
  for (const line of lines) {
    const item = order.items.find((candidate) => candidate.productId === line.productId && candidate.quantity === line.quantity)
    if (!item) return `the order has no line for ${line.productId} × ${line.quantity}`
    if (item.price !== line.unit) return `${line.productId} is priced at ${item.price} on the order`
  }
  if (order.items.length !== lines.length) return `the order has ${order.items.length} lines`
  const sum = order.items.reduce((total, item) => total + item.price * item.quantity, 0) + order.pricing.shipping
  if (sum !== amount) return `the lines plus shipping come to ${sum}`
  return null
}

// Both numbers are on the line when a paid unit was not in stock.
// When every paid unit was taken, the stock drop matching the paid quantity is enough.
export function stockExplained(before) {
  const now = stocks()
  for (const [id, was] of Object.entries(before)) {
    if (!Object.hasOwn(now, id)) return `stock of ${id} is missing`
    const left = now[id]
    if (left < 0) return `stock of ${id} is ${left}`
    const lines = orderDocs().flatMap((order) => order.items.filter((item) => item.productId === id))
    const paid = lines.reduce((total, item) => total + item.quantity, 0)
    const drop = was - left
    if (lines.length > 0 && lines.every((item) => typeof item.fulfilled === 'number')) {
      const taken = lines.reduce((total, item) => total + item.fulfilled, 0)
      if (taken !== drop) return `stock of ${id} moved by ${drop} but the orders record ${taken} fulfilled`
      const over = lines.find((item) => item.fulfilled < 0 || item.fulfilled > item.quantity)
      if (over) return `fulfilled of ${id} is ${over.fulfilled} for a quantity of ${over.quantity}`
    } else if (drop !== paid) {
      return `stock of ${id} moved by ${drop} and the orders record ${paid} paid units with no fulfilled count`
    }
  }
  return null
}
