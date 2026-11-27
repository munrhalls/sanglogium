// The owner's emails: an order to pack, an order short of stock, a payment with no order.
//
// The shop's real webhook and return handlers and its daily sweep run, and the shop's real owner-email
// sender hands its emails to the stand-in Resend, which keeps one email per key
// the way Resend does for 24 hours. The order book and the card company behind
// the handlers are stand-ins that write down every call. Every order and payment
// carries a made-up customer's private details.

import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  calls, line, tryImport, firstLine, setOwnerList, outbox, emailText, recipients, refuseNextSends,
  answerOtherSanityQuestions, privateMarksIn, resetWorld, repoRoot, OWNER, SECOND_OWNER, PRIVATE,
} from './standins.mjs'

export const title = "The owner's emails"

const OWNERS = `${OWNER}, ${SECOND_OWNER}`
const OWNER_SET = JSON.stringify([OWNER, SECOND_OWNER].sort())

type Item = { productId: string; name: string; quantity: number; fulfilled: number; price: number }

const WHOLE: Item[] = [{ productId: 'prod-cedar-oar', name: 'Cedar Oar', quantity: 1, fulfilled: 1, price: 40_000 }]
const SHORT: Item[] = [
  { productId: 'prod-brass-tide-gauge', name: 'Brass Tide Gauge', quantity: 3, fulfilled: 1, price: 25_000 },
  { productId: 'prod-cedar-oar', name: 'Cedar Oar', quantity: 1, fulfilled: 1, price: 40_000 },
]

function orderNumber(pi: string) {
  return `ORD-PROOF-${pi.slice(-6).toUpperCase()}`
}

function snapshot(pi: string, amount: number) {
  return {
    id: pi,
    status: 'succeeded',
    amount,
    currency: 'pln',
    receiptEmail: PRIVATE.email,
    metadata: {
      checkoutSessionId: 'cs_admin_proof',
      email: PRIVATE.email,
      address: JSON.stringify({ firstName: 'Wren', lastName: 'Halloway', street: PRIVATE.street, streetNumber: PRIVATE.streetNumber, city: PRIVATE.city, postalCode: PRIVATE.postalCode, phone: PRIVATE.phone, regionCode: 'PL' }),
      basket: 'prod-cedar-oar:1',
    },
    paymentMethod: { type: 'card', card: { brand: 'visa', last4: '4242' } },
    failureMessage: null,
  }
}

// The order book: one order per payment, made the first time and never again.
function orderBook() {
  const orders = new Map<string, Record<string, unknown>>()
  const plans = new Map<string, Item[]>()
  const refusing = new Set<string>()
  const make = (payment: { id: string; amount: number }, orderedAt: string) => {
    const items = (plans.get(payment.id) ?? WHOLE).map((item) => ({ ...item, subtotal: item.price * item.quantity, returnStatus: 'none' }))
    const shippingAddress = { name: PRIVATE.name, line1: `${PRIVATE.street} ${PRIVATE.streetNumber}`, city: PRIVATE.city, state: '', postalCode: PRIVATE.postalCode, country: 'PL', phone: PRIVATE.phone }
    const doc = {
      _id: `order_${payment.id}`,
      orderNumber: orderNumber(payment.id),
      customerEmail: PRIVATE.email,
      isGuest: true,
      items,
      pricing: { subtotal: payment.amount - 1_500, shipping: 1_500, tax: 0, discount: 0, total: payment.amount, currency: 'PLN' },
      shippingAddress,
      shippingMethod: { name: 'Courier', carrier: 'courier', price: 1_500, estimatedDays: 2 },
      status: 'processing',
      dates: { orderedAt },
    }
    orders.set(payment.id, doc)
    return { doc, items, shippingAddress }
  }
  const port = {
    async createOrderFromPayment(payment: { id: string; amount: number }) {
      calls.push({ system: 'orders', method: 'createOrderFromPayment' })
      if (refusing.has(payment.id)) throw new Error(`stand-in order book refused ${payment.id}`)
      if (orders.has(payment.id)) return { created: false }
      const { doc, items, shippingAddress } = make(payment, new Date().toISOString())
      return { created: true, email: { to: PRIVATE.email, orderNumber: doc.orderNumber, items, total: payment.amount, shippingAddress, shipping: 1_500, tax: 0, orderedAt: doc.dates.orderedAt } }
    },
    async getOrderByPaymentIntentId(pi: string) {
      calls.push({ system: 'orders', method: 'getOrderByPaymentIntentId' })
      return orders.has(pi) ? structuredClone(orders.get(pi)) : null
    },
  }
  // An order placed before this run, written straight into the book.
  const seed = (payment: { id: string; amount: number }, orderedAt: string) => { make(payment, orderedAt) }
  return { port, plans, refusing, seed, has: (pi: string) => orders.has(pi) }
}

export async function ask() {
  resetWorld()
  setOwnerList(OWNERS)
  const lines = []
  const book = orderBook()
  const payments = new Map<string, ReturnType<typeof snapshot>>()
  const customerMails: string[] = []
  let handled = 0
  let sweepList: string[] = []

  const sender = await tryImport('@/features/checkout/adapters/resend/ownerNoticeEmail')
  const webhook = await tryImport('@/features/checkout/commands/handlePaymentWebhook')
  const returning = await tryImport('@/features/checkout/commands/handlePaymentReturn')
  if (webhook.missing || returning.missing) throw new Error(`checkout handlers did not load: ${webhook.missing ?? returning.missing}`)
  const missingSender = sender.missing ?? (typeof sender.mod?.sendOwnerNotice !== 'function' ? 'the owner-email sender has no sendOwnerNotice' : '')

  const ports = {
    orders: book.port,
    payments: {
      parseWebhookEvent(rawBody: string) {
        calls.push({ system: 'payments', method: 'parseWebhookEvent' })
        const payment = payments.get(rawBody)
        if (!payment) throw new Error('No signatures found matching the expected signature for payload')
        return { id: `evt_${rawBody}`, rawType: 'payment_intent.succeeded', kind: 'succeeded', payment: structuredClone(payment) }
      },
      async retrievePayment(pi: string) {
        calls.push({ system: 'payments', method: 'retrievePayment' })
        return structuredClone(payments.get(pi))
      },
      async listPayments() {
        calls.push({ system: 'payments', method: 'listPayments' })
        return sweepList.map((pi) => structuredClone(payments.get(pi)))
      },
      async createPayment() {
        calls.push({ system: 'payments', method: 'createPayment' })
        throw new Error('stand-in card company refuses createPayment')
      },
      async updatePaymentAmount() {
        calls.push({ system: 'payments', method: 'updatePaymentAmount' })
        throw new Error('stand-in card company refuses updatePaymentAmount')
      },
    },
    emails: {
      async sendOrderConfirmationEmail(data: { orderNumber: string }) {
        customerMails.push(data.orderNumber)
      },
      ...(missingSender ? {} : { sendOwnerNotice: sender.mod.sendOwnerNotice }),
    },
  }

  const pay = (pi: string, amount: number, plan?: Item[]) => {
    payments.set(pi, snapshot(pi, amount))
    if (plan) book.plans.set(pi, plan)
  }
  const deliver = async (pi: string) => {
    handled += 1
    try {
      const result = await webhook.mod.handlePaymentWebhook(ports, { rawBody: pi, signature: 'stand-in' })
      return result.status as number
    } catch (error) {
      return `it broke: ${firstLine(error)}`
    }
  }
  const comeBack = async (pi: string) => {
    handled += 1
    const sessions = {
      async getCheckoutSession() {
        return { checkoutSessionId: 'cs_admin_proof', paymentIntentId: pi, basket: [{ productId: 'prod-cedar-oar', quantity: 1 }], address: { firstName: 'Wren', lastName: 'Halloway', street: PRIVATE.street, city: PRIVATE.city, postalCode: PRIVATE.postalCode, phone: PRIVATE.phone }, email: PRIVATE.email, save: async () => {}, destroy() {} }
      },
    }
    try {
      await returning.mod.handlePaymentReturn({ ...ports, sessions }, { paymentIntent: pi })
      return 'it did not send the customer anywhere'
    } catch (error) {
      return (error as { standIn?: string })?.standIn === 'redirect' ? 'redirect' : `it broke: ${firstLine(error)}`
    }
  }
  const orderMails = (pi: string) => outbox.filter((email) => emailText(email).includes(orderNumber(pi)))
  const noOrderMails = (pi: string) => outbox.filter((email) => emailText(email).includes(pi) && !emailText(email).includes(orderNumber(pi)))
  const why = (text: string) => (missingSender ? `${text} (${missingSender})` : text)

  // pack-email
  {
    const id = 'pack-email'
    const question = 'When a paid order is placed, does the owner get an email to pack it in that same moment?'
    const pi = 'pi_proof_pak001'
    pay(pi, 41_500, WHOLE)
    const before = orderMails(pi).length
    const status = await deliver(pi)
    const mails = orderMails(pi)
    const server = readFileSync(path.join(repoRoot, 'features/checkout/server.ts'), 'utf8')
    const wired = /import\s*\{[^}]*\bsendOwnerNotice\b[^}]*\}\s*from\s*["']\.\/adapters\/resend\/ownerNoticeEmail["']/.test(server) && /const\s+emails\s*:\s*OrderEmails\s*=\s*\{[^}]*\bsendOwnerNotice\b[^}]*\}/.test(server)
    if (before === 0 && mails.length === 1 && status === 200 && JSON.stringify(recipients(mails[0])) === OWNER_SET && wired) {
      lines.push(line(id, question, true, 'It answered yes: one email went to both owners during the call that placed the order.'))
    } else {
      const got = `${mails.length} email(s), webhook answered ${status}${mails[0] ? `, sent to ${recipients(mails[0]).join(' and ')}` : ''}${wired ? '' : ', and features/checkout/server.ts does not hand sendOwnerNotice to checkout'}`
      lines.push(line(id, question, false, why(`It answered no: ${got}`) + '.'))
    }
  }

  // stock-short
  {
    const id = 'stock-short'
    const question = "When a paid order is short of stock, does the owner's email say which product and how many are missing?"
    const pi = 'pi_proof_sht002'
    pay(pi, 116_500, SHORT)
    await deliver(pi)
    const short = orderMails(pi)
    const whole = orderMails('pi_proof_pak001')
    const shortText = short[0] ? emailText(short[0]) : ''
    const names = shortText.includes('Brass Tide Gauge: 2 missing')
    const noFalseAlarm = !/Cedar Oar: \d+ missing/.test(shortText) && whole.every((email) => !/missing/i.test(emailText(email)))
    let asksTaken = false
    const fetcher = await tryImport('@/features/checkout/adapters/sanity/fetchOrderByPaymentIntentId')
    if (!fetcher.missing) {
      let asked = ''
      answerOtherSanityQuestions((query: string) => { asked = String(query); return null })
      try { await fetcher.mod.fetchOrderByPaymentIntentId('pi_proof_query') } catch { /* the question is what was asked */ }
      answerOtherSanityQuestions(null)
      asksTaken = /items\[\]\s*\{[^}]*\bfulfilled\b[^}]*\}/.test(asked)
    }
    if (short.length === 1 && names && noFalseAlarm && asksTaken) {
      lines.push(line(id, question, true, 'It answered yes: "Brass Tide Gauge: 2 missing", only in the short order, and the order read asks for the units taken.'))
    } else {
      const got = [
        short.length !== 1 ? `${short.length} email(s) for the short order` : '',
        short.length === 1 && !names ? 'the email does not say "Brass Tide Gauge: 2 missing"' : '',
        !noFalseAlarm ? 'a whole line or a whole order says missing' : '',
        !asksTaken ? 'the order read does not ask Sanity for fulfilled' : '',
      ].filter(Boolean).join('; ')
      lines.push(line(id, question, false, why(`It answered no: ${got}`) + '.'))
    }
  }

  // pack-once
  {
    const id = 'pack-once'
    const question = "When the customer's return and Stripe's webhook both handle one payment, does the owner get one email, not two?"
    const pi = 'pi_proof_one003'
    pay(pi, 41_500, WHOLE)
    const back = await comeBack(pi)
    const status = await deliver(pi)
    const mails = orderMails(pi)
    if (back === 'redirect' && status === 200 && mails.length === 1) lines.push(line(id, question, true, 'It answered yes: one email for two handlings.'))
    else lines.push(line(id, question, false, why(`It answered no: return path ${back}, webhook ${status}, ${mails.length} email(s)`) + '.'))
  }

  // pack-retry
  {
    const id = 'pack-retry'
    const question = "When the owner email fails to send, is it sent on Stripe's next try?"
    const pi = 'pi_proof_rty004'
    pay(pi, 41_500, WHOLE)
    refuseNextSends(1)
    const first = await deliver(pi)
    const afterFirst = orderMails(pi).length
    refuseNextSends(0)
    const second = await deliver(pi)
    const mails = orderMails(pi)
    const stray = noOrderMails(pi).length
    const customers = customerMails.filter((n) => n === orderNumber(pi)).length
    if (first === 500 && afterFirst === 0 && second === 200 && mails.length === 1 && stray === 0 && customers === 1) {
      lines.push(line(id, question, true, 'It answered yes: the first try told Stripe "not done", the next try sent it, and the customer got one confirmation.'))
    } else {
      lines.push(line(id, question, false, why(`It answered no: first try ${first} with ${afterFirst} email(s), next try ${second} with ${mails.length} email(s), ${stray} wrong "no order" email(s), ${customers} customer confirmation(s)`) + '.'))
    }
  }

  // pack-no-owner
  {
    const id = 'pack-no-owner'
    const question = 'With no owner address set, does the shop tell Stripe the payment is not fully handled?'
    const pi = 'pi_proof_nwn005'
    pay(pi, 41_500, WHOLE)
    setOwnerList(undefined)
    const status = await deliver(pi)
    setOwnerList(OWNERS)
    const sent = outbox.filter((email) => emailText(email).includes(pi) || emailText(email).includes(orderNumber(pi))).length
    if (status === 500 && book.has(pi) && sent === 0) lines.push(line(id, question, true, 'It answered yes: the webhook said "not done" and the order still exists.'))
    else lines.push(line(id, question, false, why(`It answered no: webhook ${status}, order ${book.has(pi) ? 'exists' : 'missing'}, ${sent} email(s)`) + '.'))
  }

  // pay-no-order-email
  {
    const id = 'pay-no-order-email'
    const question = 'When a payment goes through but its order cannot be made, does the owner get an email?'
    const pi = 'pi_proof_nor006'
    pay(pi, 41_500, WHOLE)
    book.refusing.add(pi)
    const status = await deliver(pi)
    const mails = noOrderMails(pi)
    if (status === 500 && mails.length === 1 && JSON.stringify(recipients(mails[0])) === OWNER_SET) lines.push(line(id, question, true, 'It answered yes: one email naming the payment went to both owners, and Stripe was told "not done".'))
    else lines.push(line(id, question, false, why(`It answered no: webhook ${status}, ${mails.length} email(s) naming ${pi}`) + '.'))
  }

  // pay-no-order-once
  {
    const id = 'pay-no-order-once'
    const question = 'When Stripe retries that same payment five times, does the owner get one email, not five?'
    const pi = 'pi_proof_nfv007'
    pay(pi, 41_500, WHOLE)
    book.refusing.add(pi)
    const statuses = []
    for (let i = 0; i < 5; i += 1) statuses.push(await deliver(pi))
    const mails = noOrderMails(pi)
    if (statuses.every((s) => s === 500) && mails.length === 1) lines.push(line(id, question, true, 'It answered yes: five tries, one email.'))
    else lines.push(line(id, question, false, why(`It answered no: tries answered ${statuses.join(', ')}, ${mails.length} email(s)`) + '.'))
  }

  // pack-sweep-repeat
  {
    const id = 'pack-sweep-repeat'
    const question = 'When the daily sweep passes an order placed two days ago, does the owner get no second email, while an order the sweep places now gets one?'
    const old = 'pi_proof_old008'
    const fresh = 'pi_proof_new009'
    pay(old, 41_500, WHOLE)
    pay(fresh, 41_500, WHOLE)
    book.seed(payments.get(old)!, new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    sweepList = [old, fresh]
    const sweeper = await tryImport('@/features/checkout/commands/sweepPaidPayments')
    if (sweeper.missing) lines.push(line(id, question, false, `It could not be asked: ${sweeper.missing}.`))
    else {
      process.env.CRON_SECRET = 'admin-proof-cron'
      handled += 2
      let status: number | string
      try {
        const result = await sweeper.mod.sweepPaidPayments(ports, { authorization: 'Bearer admin-proof-cron', now: Math.floor(Date.now() / 1000) })
        status = result.status
      } catch (error) {
        status = `it broke: ${firstLine(error)}`
      }
      delete process.env.CRON_SECRET
      const oldMails = orderMails(old).length
      const freshMails = orderMails(fresh).length
      if (status === 200 && oldMails === 0 && freshMails === 1) lines.push(line(id, question, true, 'It answered yes: no email for the two-day-old order, one for the order the sweep placed.'))
      else lines.push(line(id, question, false, why(`It answered no: sweep ${status}, ${oldMails} email(s) for the old order, ${freshMails} for the new one`) + '.'))
    }
  }

  // leak-email
  {
    const id = 'leak-email'
    const question = "Does an owner email carry a customer's name, email, address or phone?"
    if (outbox.length === 0) lines.push(line(id, question, false, why('It could not be searched: no owner email went out at all') + '.'))
    else {
      const found = [...new Set(outbox.flatMap((email) => privateMarksIn(`${emailText(email)}\n${JSON.stringify(email)}`)))]
      if (found.length) lines.push(line(id, question, false, `It answered yes: the owner emails hold ${found.join(', ')}.`))
      else lines.push(line(id, question, true, `It answered no: none of the planted details is in the ${outbox.length} owner email(s).`))
    }
  }

  // write-notice
  {
    const id = 'write-notice'
    const question = 'Does an owner email change any product, order or payment?'
    const writes = calls.filter((call) => (call.system === 'payments' && (call.method === 'createPayment' || call.method === 'updatePaymentAmount')) || call.system === 'stripe' || (call.system === 'sanity' && call.method !== 'fetch'))
    const orderWrites = calls.filter((call) => call.system === 'orders' && call.method === 'createOrderFromPayment').length
    const otherOrderCalls = calls.filter((call) => call.system === 'orders' && call.method !== 'createOrderFromPayment' && call.method !== 'getOrderByPaymentIntentId')
    if (outbox.length === 0) {
      lines.push(line(id, question, false, why("It could not be watched: no owner email went out at all") + "."))
    } else if (writes.length === 0 && otherOrderCalls.length === 0 && orderWrites === handled) {
      lines.push(line(id, question, true, `It answered no: only checkout's own order write ran, once per handling (${handled}).`))
    } else {
      lines.push(line(id, question, false, `It answered yes: ${writes.length} write(s) to Stripe, Sanity or the card company, ${orderWrites} order write(s) for ${handled} handling(s).`))
    }
  }

  return lines
}
