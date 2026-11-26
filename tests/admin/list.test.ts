// The admin list: paid payments that have no order.
//
// Stripe holds 150 paid payments made up for this proof, plus a failed, a
// cancelled and a still-processing one. Sanity holds an order for every paid one
// except the 121st newest, which sits on Stripe's second page. Every payment
// carries a made-up customer's private details.

import {
  calls, line, tryImport, firstLine, signInAs, setOwnerList, setStripePayments, setSanityOrders,
  privateMarksIn, resetWorld, OWNER, PRIVATE, STRIPE_READS,
} from './standins.mjs'

export const title = 'The list of paid payments with no order'

const MINUTE = 60_000
const MISSING = 'pi_list_120'

function payment(id: string, status: string, minutesAgo: number, amount: number) {
  return {
    id,
    object: 'payment_intent',
    status,
    amount,
    currency: 'pln',
    created: Math.floor((Date.now() - minutesAgo * MINUTE) / 1000),
    receipt_email: PRIVATE.email,
    shipping: { name: PRIVATE.name, phone: PRIVATE.phone, address: { line1: `${PRIVATE.street} ${PRIVATE.streetNumber}`, city: PRIVATE.city, postal_code: PRIVATE.postalCode, country: 'PL' } },
    metadata: { email: PRIVATE.email, address: JSON.stringify({ firstName: 'Wren', lastName: 'Halloway', street: PRIVATE.street, city: PRIVATE.city, postalCode: PRIVATE.postalCode, phone: PRIVATE.phone }), basket: 'prod-cedar-oar:1' },
  }
}

export async function ask() {
  resetWorld()
  const paid = Array.from({ length: 150 }, (_, i) => payment(`pi_list_${String(i).padStart(3, '0')}`, 'succeeded', 10 + i * 60, 10_000 + i))
  setStripePayments([
    ...paid,
    payment('pi_list_failed', 'requires_payment_method', 30, 5_000),
    payment('pi_list_canceled', 'canceled', 31, 5_001),
    payment('pi_list_processing', 'processing', 32, 5_002),
  ])
  setSanityOrders(paid.filter((p) => p.id !== MISSING).map((p) => ({ _type: 'order', paymentIntentId: p.id })))
  setOwnerList(OWNER)
  signInAs({ email: OWNER, emailVerified: true, twoFactorEnabled: true, signedInAt: Date.now() - 5 * MINUTE, providers: ['credential'] })

  const door = await tryImport('@/features/admin/server')
  let rows: unknown = null
  let failure = ''
  if (door.missing) failure = door.missing
  else if (typeof door.mod.getPaymentsWithoutOrder !== 'function') failure = 'the admin door has no getPaymentsWithoutOrder'
  else {
    calls.length = 0
    try {
      rows = await door.mod.getPaymentsWithoutOrder()
    } catch (error) {
      failure = `it broke: ${firstLine(error)}`
    }
  }
  const unknown = calls.filter((call) => call.method === 'unknown question').map((call) => call.query)

  const lines = []
  {
    const id = 'pay-list'
    const question = "Does the admin list show exactly the paid payments that have no order, including ones past Stripe's first page?"
    if (failure) lines.push(line(id, question, false, `It answered no: ${failure}.`))
    else if (unknown.length) lines.push(line(id, question, false, `It answered no: it asked Sanity a question the stand-in does not know: ${unknown[0]}.`))
    else {
      const list = Array.isArray(rows) ? rows as Array<Record<string, unknown>> : []
      const ids = list.map((row) => row.paymentIntentId)
      const want = paid.find((p) => p.id === MISSING)!
      const row = list[0]
      if (ids.length === 1 && ids[0] === MISSING && row.amount === want.amount && row.currency === 'pln') {
        lines.push(line(id, question, true, `It answered yes: it showed ${MISSING} with its amount, and nothing else.`))
      } else {
        lines.push(line(id, question, false, `It answered no: it showed [${ids.join(', ')}], not [${MISSING}] with amount ${want.amount}.`))
      }
    }
  }
  {
    const id = 'leak-list'
    const question = "Does the admin list carry a customer's name, email, address or phone?"
    if (failure || !Array.isArray(rows)) lines.push(line(id, question, false, `It could not be searched: ${failure || 'the list is not a list'}.`))
    else {
      const found = privateMarksIn(JSON.stringify(rows))
      if (found.length) lines.push(line(id, question, false, `It answered yes: the list holds ${found.join(', ')}.`))
      else lines.push(line(id, question, true, 'It answered no: none of the planted details is in the list.'))
    }
  }
  {
    const id = 'write-admin'
    const question = 'Does the admin area ever ask Stripe or Sanity to change anything?'
    const writes = calls.filter((call) => (call.system === 'stripe' && !STRIPE_READS.includes(call.method)) || (call.system === 'sanity' && call.method !== 'fetch' && call.method !== 'unknown question') || call.system === 'resend')
    if (failure) lines.push(line(id, question, false, `It could not be watched: ${failure}.`))
    else if (writes.length) lines.push(line(id, question, false, `It answered yes: it called ${writes.map((call) => `${call.system} ${call.method}`).join(', ')}.`))
    else {
      const reads = calls.filter((call) => call.system === 'stripe' || call.system === 'sanity').length
      lines.push(line(id, question, true, `It answered no: all ${reads > 0 ? 'its calls were' : 'calls were'} reads.`))
    }
  }
  return lines
}
