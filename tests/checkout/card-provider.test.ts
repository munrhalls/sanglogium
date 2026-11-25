// The card company, on this machine.
//
// One key covers every call, whether it creates a payment or changes one.
// The company remembers the first request. The same request again returns
// that same payment. Any other request with that key is refused and does
// not change the payment. That is the card company's published rule.
// No call leaves this machine.
//
// cardCompanyObeysItsRule runs before the shop is asked anything. If it
// fails, the proof stops. Later answers would have been read with a ruler
// that can be bent.

import { stripe } from '@/features/checkout/adapters/stripe/client'

const payments = new Map()
const seenKeys = new Map()
let sequence = 0

function claim(key, fingerprint, produce) {
  if (!key) throw new Error('missing idempotency key')
  const previous = seenKeys.get(key)
  if (!previous) {
    const result = produce()
    const snapshot = structuredClone(result)
    seenKeys.set(key, { fingerprint, result: snapshot })
    return structuredClone(snapshot)
  }
  if (previous.fingerprint !== fingerprint) {
    throw new Error('Keys for idempotent requests can only be used with the same parameters they were first used with')
  }
  return structuredClone(previous.result)
}

export function installCardCompany() {
  stripe.paymentIntents.create = async (body, options) => claim(
    options?.idempotencyKey,
    JSON.stringify(['create', body]),
    () => {
      sequence += 1
      const payment = {
        id: `pi_new_${sequence}`,
        object: 'payment_intent',
        amount: body.amount,
        currency: body.currency,
        status: 'requires_payment_method',
        metadata: { ...body.metadata },
        client_secret: 'cs_test',
        receipt_email: null,
        latest_charge: null,
        last_payment_error: null,
      }
      payments.set(payment.id, payment)
      return payment
    },
  )
  stripe.paymentIntents.update = async (id, body, options) => claim(
    options?.idempotencyKey,
    JSON.stringify(['update', id, body]),
    () => {
      const payment = payments.get(id)
      if (!payment) throw new Error(`no payment ${id}`)
      payment.amount = body.amount
      payment.metadata = { ...body.metadata }
      return payment
    },
  )
  stripe.paymentIntents.retrieve = async (id) => {
    const payment = payments.get(id)
    if (!payment) throw new Error(`no payment ${id}`)
    return structuredClone(payment)
  }
}

export function resetCardCompany() {
  payments.clear()
  seenKeys.clear()
  sequence = 0
}

export function remember(payment) {
  payments.set(payment.id, structuredClone(payment))
}

export function allPayments() {
  return [...payments.values()]
}

// A payment the customer can still complete. A succeeded or canceled one cannot.
export function openPayments() {
  return allPayments().filter((payment) => payment.status !== 'canceled' && payment.status !== 'succeeded')
}

// The published rule, checked on this stand-in. A string means the stand-in
// itself is wrong. Null means a repeated request came back unchanged, and a
// different request was refused without touching the remembered payment.
export async function cardCompanyObeysItsRule() {
  resetCardCompany()
  try {
    const body = { amount: 5000, currency: 'pln', metadata: { basket: 'a:2,b:1' } }
    const key = 'rule_key'
    const first = await stripe.paymentIntents.create(body, { idempotencyKey: key })
    const again = await stripe.paymentIntents.create(body, { idempotencyKey: key })
    if (again.id !== first.id) return 'the same request came back as a different payment'
    if (allPayments().length !== 1) return 'the same request created another payment'
    again.amount = 1
    const replay = await stripe.paymentIntents.create(body, { idempotencyKey: key })
    if (replay.amount !== 5000) return 'a later change rewrote the remembered payment'
    const different = await refused(() => stripe.paymentIntents.create(
      { amount: 1500, currency: 'pln', metadata: { basket: 'a:1' } },
      { idempotencyKey: key },
    ))
    if (!different) return 'a different request with the same key was accepted'
    const updated = await refused(() => stripe.paymentIntents.update(
      first.id,
      { amount: 1500, metadata: { basket: 'a:1' } },
      { idempotencyKey: key },
    ))
    if (!updated) return 'a change that reuses the create key was accepted'
    const stored = allPayments()[0]
    if (!stored || stored.amount !== 5000 || stored.metadata.basket !== 'a:2,b:1') {
      return 'a refused request changed the remembered payment'
    }
    return null
  } finally {
    resetCardCompany()
  }
}

async function refused(send) {
  try {
    await send()
    return false
  } catch (error) {
    if (String(error?.message).includes('same parameters')) return true
    throw error
  }
}
