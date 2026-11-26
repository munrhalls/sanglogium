// What the proof is allowed to do to the shop.
//
// charge, bankNotice and customerReturns call the shop's real code.
// The card company and the warehouse are stand-ins. Email is ignored,
// because neither question is about email.
// The paperwork is read in books.mjs. This file does not decide whether
// an order is right.

import { parseWebhookEvent } from '@/features/checkout/adapters/stripe/webhooks'
import { stripe, createPayment, updatePaymentAmount, retrievePayment } from '@/features/checkout/adapters/stripe/client'
import { createPaymentIntent } from '@/features/checkout/commands/createPaymentIntent'
import { handlePaymentReturn } from '@/features/checkout/commands/handlePaymentReturn'
import { handlePaymentWebhook } from '@/features/checkout/commands/handlePaymentWebhook'
import { createOrderFromPayment } from '@/features/order/adapters/sanity/createOrderFromPayment'
import { notChargedVerdict } from './books.mjs'
import { ADDRESS } from './domain.mjs'
import { hold, orderDocs, release, reset as resetStock, seed, setPrice, until, warehouseObeysItsRule } from './stock-book.mjs'
import { allPayments, cardCompanyObeysItsRule, openPayments, remember, resetCardCompany } from './card-provider.test.ts'

export { allPayments, openPayments, setPrice as setShelfPrice }

function paymentsPort() {
  return { createPayment, updatePaymentAmount, retrievePayment, parseWebhookEvent }
}

function ordersPort() {
  return {
    createOrderFromPayment: (payment) => createOrderFromPayment(payment),
    async getOrderByPaymentIntentId(id) {
      return orderDocs().find((order) => order.paymentIntentId === id) ?? null
    },
  }
}

function doors() {
  return { orders: ordersPort(), payments: paymentsPort(), emails: { async sendOrderConfirmationEmail() {} } }
}

export function fresh() {
  resetStock()
  resetCardCompany()
}

// Null means both stand-ins kept their rules. A string means the proof must
// stop, because the shop's answers would not be trustworthy.
export async function standInsObeyTheirRules() {
  const card = await cardCompanyObeysItsRule()
  if (card) return card
  const warehouse = await warehouseObeysItsRule()
  if (warehouse) return warehouse
  fresh()
  return null
}

export function shelfPrices() {
  return [
    { _id: 'a', price_data: { unit_amount: 1000 }, stock: 10 },
    { _id: 'b', price_data: { unit_amount: 2500 }, stock: 10 },
  ]
}

export function basketSession(extra = {}) {
  return {
    checkoutSessionId: 'sess_1',
    basket: [
      { productId: 'a', quantity: 2 },
      { productId: 'b', quantity: 1 },
    ],
    shippingCost: 500,
    address: ADDRESS,
    email: 'ada@example.com',
    shippingCode: 'inpost',
    shippingMethodName: 'InPost',
    shippingCarrier: 'InPost',
    shippingEstimatedDays: 2,
    ...extra,
    async save() {},
    destroy() {},
  }
}

// The typed total is 1, and the typed basket, unit prices, shipping price and
// address are fakes. The shelf and the session decide the charge and the order.
export function charge(session, rows = shelfPrices(), body = { grandTotal: 1, metadata: { basket: 'nope:9', unitPrices: 'a:1,b:1', shippingCost: '0', address: '{}' } }) {
  return createPaymentIntent(
    {
      sessions: { getCheckoutSession: async () => session },
      catalogue: {
        async getProductUnitAmountsByIds(ids) {
          return rows.filter((row) => ids.includes(row._id))
        },
        async getPaymentProducts() { return [] },
        async getProductsByIds() { return [] },
      },
      payments: paymentsPort(),
    },
    body,
  )
}

export function seedLines(lines, start = 10) {
  seed(lines.map((line) => ({ id: line.id, unit: line.unit, stock: start })))
}

export function seedProduct(row) {
  seed([row])
}

export function payment({ id, amount, basket, shipping, status, unitPrices }) {
  return {
    id,
    object: 'payment_intent',
    amount,
    currency: 'pln',
    status,
    metadata: {
      basket,
      address: JSON.stringify(ADDRESS),
      shippingCode: 'inpost',
      shippingCost: String(shipping),
      shippingMethodName: 'InPost',
      shippingCarrier: 'InPost',
      shippingEstimatedDays: '2',
      email: 'ada@example.com',
      checkoutSessionId: 'sess_1',
      vat: '0',
      userId: '',
      ...(typeof unitPrices === 'string' ? { unitPrices } : {}),
    },
    client_secret: 'cs_test',
    receipt_email: 'ada@example.com',
    latest_charge: null,
    last_payment_error: null,
  }
}

function isRedirect(error) {
  return typeof error?.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')
}

export async function bankNotice(paid, type = 'payment_intent.succeeded') {
  const rawBody = JSON.stringify({
    id: `evt_${paid.id}_${type}`,
    object: 'event',
    api_version: '2026-05-27.dahlia',
    type,
    data: { object: paid },
  })
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: rawBody,
    secret: process.env.STRIPE_WEBHOOK_SECRET,
  })
  return handlePaymentWebhook(doors(), { rawBody, signature })
}

export async function forgedBankNotice(paid, signature) {
  const rawBody = JSON.stringify({
    id: 'evt_forged',
    object: 'event',
    type: 'payment_intent.succeeded',
    data: { object: paid },
  })
  return handlePaymentWebhook(doors(), { rawBody, signature })
}

export async function unsignedBankNotice(signature) {
  return handlePaymentWebhook(doors(), { rawBody: '{}', signature })
}

export async function customerReturns(session, paymentId) {
  try {
    await handlePaymentReturn(
      { ...doors(), sessions: { getCheckoutSession: async () => session } },
      { paymentIntent: paymentId },
    )
  } catch (error) {
    if (!isRedirect(error)) throw error
  }
}

export function rememberPayment(paid) {
  remember(paid)
}

export function pauseCommits() {
  hold()
}

export function resumeCommits() {
  release()
}

export function waitForCommits(count) {
  return until(count)
}

// No charge was sent, and no order was written. A payment that exists is
// reported first, because that is the failure the sentence names.
export function notCharged() {
  return notChargedVerdict(allPayments(), orderDocs().length)
}
