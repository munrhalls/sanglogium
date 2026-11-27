// Every outside system the admin area and the owner emails touch, kept on this machine.
//
// Sign-in, Stripe, Sanity and Resend are stand-ins. Each one writes every call it
// gets into `calls`, answers only the reads it knows, and refuses everything else.
// No call leaves this machine. Made-up people live at .invalid addresses, which
// cannot exist anywhere.

import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export const calls = []

export function broken(message) {
  const error = new Error(`proof broken: ${message}`)
  error.proofBroken = true
  return error
}

export function firstLine(error) {
  return String(error?.message ?? error).split('\n')[0].split(repoRoot + path.sep).join('').split(repoRoot).join('')
}

export async function tryImport(specifier) {
  try {
    return { mod: await import(specifier) }
  } catch (error) {
    return { missing: `${specifier.replace(/^@\//, '')} did not load (${firstLine(error)})` }
  }
}

export function line(id, question, pass, said) {
  return { id, question, pass, said }
}

// ---- Made-up people and goods -------------------------------------------------

export const OWNER = 'keeper@harbour.invalid'
export const SECOND_OWNER = 'second.keeper@harbour.invalid'
export const CUSTOMER = 'traveller@meadow.invalid'

// A customer's private details. None of these may reach an admin page or an owner email.
export const PRIVATE = {
  name: 'Wren Halloway',
  email: 'wren.halloway@meadow.invalid',
  street: 'Lanternfold Lane',
  streetNumber: '17',
  city: 'Quillmarsh',
  postalCode: '99-417',
  phone: '+48 600 417 017',
}
export const PRIVATE_MARKS = ['Halloway', 'wren.halloway', 'Lanternfold', 'Quillmarsh', '99-417', '417 017']

export function privateMarksIn(text) {
  const lower = String(text).toLowerCase()
  return PRIVATE_MARKS.filter((mark) => lower.includes(mark.toLowerCase()))
}

export function setOwnerList(value) {
  if (value === undefined) delete process.env.OWNER_EMAILS
  else process.env.OWNER_EMAILS = value
}

// ---- Next ---------------------------------------------------------------------

export class NotFound extends Error {
  constructor() {
    super('NEXT_HTTP_ERROR_FALLBACK;404')
    this.digest = 'NEXT_HTTP_ERROR_FALLBACK;404'
    this.standIn = 'not-found'
  }
}

export class Redirect extends Error {
  constructor(url) {
    super('NEXT_REDIRECT')
    this.digest = `NEXT_REDIRECT;replace;${url};307;`
    this.standIn = 'redirect'
    this.url = url
  }
}

export function notFound() {
  throw new NotFound()
}

export function redirect(url) {
  throw new Redirect(url)
}

export function permanentRedirect(url) {
  throw new Redirect(url)
}

export async function headers() {
  return new Headers({ cookie: 'better-auth.session_token=stand-in' })
}

export async function cookies() {
  return { get: () => undefined, getAll: () => [], has: () => false }
}

// One request at a time here, so React's per-request memo is a plain call.
export function cache(fn) {
  return fn
}

// ---- Sign-in ------------------------------------------------------------------

let signedIn = null

// facts: null (signed out) or { email, emailVerified, twoFactorEnabled, signedInAt, providers }
export function signInAs(facts) {
  signedIn = facts ? structuredClone(facts) : null
}

export async function getSignInFacts() {
  calls.push({ system: 'sign-in', method: 'getSignInFacts' })
  return signedIn ? structuredClone(signedIn) : null
}

export async function getSession() {
  return null
}

export async function requireSession() {
  throw new Error('Unauthorized: no valid session')
}

export async function verifySession() {
  redirect('/sign-in')
}

export const isGoogleAuthEnabled = false
export const authRouteHandlers = {}
export async function updateUserName() {}

// Better Auth's two reads, as the real session readers call them. `record` is the
// sign-in database; `cookieCopy` is the 5-minute copy Better Auth keeps in a cookie.
export function betterAuth({ record, cookieCopy, accounts }) {
  return {
    api: {
      async getSession(input = {}) {
        const fresh = input?.query?.disableCookieCache === true
        calls.push({ system: 'sign-in', method: fresh ? 'getSession(fresh)' : 'getSession(cookie copy)' })
        const answer = fresh ? record : cookieCopy
        return answer ? structuredClone(answer) : null
      },
      async listUserAccounts() {
        calls.push({ system: 'sign-in', method: 'listUserAccounts' })
        return record ? structuredClone(accounts) : []
      },
    },
  }
}

// ---- Stripe -------------------------------------------------------------------

let stripePayments = []

export function setStripePayments(list) {
  stripePayments = structuredClone(list)
}

function inCreatedRange(created, range) {
  if (!range) return true
  if (typeof range === 'number') return created === range
  if (range.gte !== undefined && !(created >= range.gte)) return false
  if (range.gt !== undefined && !(created > range.gt)) return false
  if (range.lte !== undefined && !(created <= range.lte)) return false
  if (range.lt !== undefined && !(created < range.lt)) return false
  return true
}

// Stripe lists newest first, at most 100 a page, and pages with starting_after.
// A payment's charge (kept here as `charge`) comes back as latest_charge: its id,
// or the whole charge when the list asks for expand: ['data.latest_charge'].
function paymentPage(params) {
  const rows = stripePayments
    .filter((payment) => inCreatedRange(payment.created, params.created))
    .sort((a, b) => b.created - a.created || (a.id < b.id ? 1 : -1))
  let start = 0
  if (params.starting_after) {
    start = rows.findIndex((payment) => payment.id === params.starting_after) + 1
    if (start === 0) throw new Error(`No such payment_intent: '${params.starting_after}'`)
  }
  const limit = Math.min(Math.max(params.limit ?? 10, 1), 100)
  const expand = Array.isArray(params.expand) && params.expand.includes('data.latest_charge')
  const data = rows.slice(start, start + limit).map((payment) => {
    const { charge, ...rest } = structuredClone(payment)
    return { ...rest, latest_charge: charge ? (expand ? charge : charge.id) : null }
  })
  return { object: 'list', data, has_more: start + limit < rows.length, url: '/v1/payment_intents' }
}

function listPayments(params = {}) {
  const iterate = async function* () {
    let page = { ...params }
    while (true) {
      const answer = paymentPage(page)
      for (const payment of answer.data) yield payment
      if (!answer.has_more || answer.data.length === 0) return
      page = { ...page, starting_after: answer.data[answer.data.length - 1].id }
    }
  }
  const first = Promise.resolve().then(() => paymentPage(params))
  first[Symbol.asyncIterator] = iterate
  first.autoPagingToArray = async ({ limit } = {}) => {
    const out = []
    for await (const payment of iterate()) {
      out.push(payment)
      if (limit && out.length >= limit) break
    }
    return out
  }
  first.autoPagingEach = async (fn) => {
    for await (const payment of iterate()) {
      if ((await fn(payment)) === false) break
    }
  }
  return first
}

export const STRIPE_READS = ['paymentIntents.list']

export class Stripe {
  constructor() {
    return new Proxy({}, {
      get(_target, resource) {
        if (typeof resource !== 'string' || resource === 'then') return undefined
        return new Proxy({}, {
          get(_r, method) {
            if (typeof method !== 'string' || method === 'then') return undefined
            const name = `${resource}.${method}`
            return (...args) => {
              calls.push({ system: 'stripe', method: name })
              if (name === 'paymentIntents.list') return listPayments(args[0] ?? {})
              throw new Error(`stand-in Stripe refuses ${name}`)
            }
          },
        })
      },
    })
  }
}

// ---- Sanity -------------------------------------------------------------------

export const ORDER_IDS_QUERY = '*[_type == "order" && paymentIntentId in $ids].paymentIntentId'

let sanityOrders = []
let extraAnswer = null

function normal(query) {
  return String(query).replace(/\s+/g, ' ').trim()
}

export function setSanityOrders(list) {
  sanityOrders = structuredClone(list)
}

// For one question that only needs to see which fields a query asks for.
export function answerOtherSanityQuestions(fn) {
  extraAnswer = fn
}

export const backendClient = new Proxy({}, {
  get(_target, prop) {
    if (typeof prop !== 'string' || prop === 'then') return undefined
    if (prop === 'fetch') {
      return async (query, params = {}) => {
        calls.push({ system: 'sanity', method: 'fetch', query: normal(query) })
        if (normal(query) === normal(ORDER_IDS_QUERY)) {
          const ids = new Set(params.ids ?? [])
          return sanityOrders.filter((order) => order._type === 'order' && ids.has(order.paymentIntentId)).map((order) => order.paymentIntentId)
        }
        if (extraAnswer) return extraAnswer(query, params)
        calls.push({ system: 'sanity', method: 'unknown question', query: normal(query) })
        throw new Error('stand-in Sanity does not know this question')
      }
    }
    return (..._args) => {
      calls.push({ system: 'sanity', method: prop })
      throw new Error(`stand-in Sanity refuses ${prop}`)
    }
  },
})

// ---- Resend -------------------------------------------------------------------

// Emails that really went out.
export const outbox = []
const keptKeys = new Map()
let refusals = 0

export function refuseNextSends(count) {
  refusals = count
}

// Like Resend: a key already used with the same email returns the first answer and
// sends nothing; the same key with a different email is refused.
export class Resend {
  constructor() {
    this.emails = {
      send: async (payload, options) => {
        const key = options?.idempotencyKey ?? null
        calls.push({ system: 'resend', method: 'emails.send', key })
        if (refusals > 0) {
          refusals -= 1
          return { data: null, error: { name: 'application_error', message: 'stand-in Resend refused this send', statusCode: 500 }, headers: null }
        }
        const body = JSON.stringify(payload)
        if (key && keptKeys.has(key)) {
          const kept = keptKeys.get(key)
          if (kept.body !== body) {
            return { data: null, error: { name: 'invalid_idempotent_request', message: 'same key, different email', statusCode: 409 }, headers: null }
          }
          return { data: { id: kept.id }, error: null, headers: null }
        }
        const id = `email-${outbox.length + 1}`
        outbox.push({ ...structuredClone(payload), idempotencyKey: key })
        if (key) keptKeys.set(key, { id, body })
        return { data: { id }, error: null, headers: null }
      },
    }
  }
}

export function emailText(email) {
  const html = String(email.html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  return `${email.subject ?? ''}\n${email.text ?? ''}\n${html}`.replace(/[ \t]+/g, ' ')
}

export function recipients(email) {
  const to = Array.isArray(email.to) ? email.to : String(email.to ?? '').split(',')
  return to.map((address) => String(address).trim().toLowerCase()).filter(Boolean).sort()
}

// ---- Resetting between questions ----------------------------------------------

export function resetWorld() {
  calls.length = 0
  signedIn = null
  stripePayments = []
  sanityOrders = []
  extraAnswer = null
  outbox.length = 0
  keptKeys.clear()
  refusals = 0
  delete process.env.OWNER_EMAILS
}

// ---- Rulers: the stand-ins must keep their own rules before the shop is asked ---

export async function standInsKeepTheirRules() {
  resetWorld()
  const mail = new Resend()
  await mail.emails.send({ to: ['a@x.invalid'], subject: 's', html: 'h' }, { idempotencyKey: 'k' })
  await mail.emails.send({ to: ['a@x.invalid'], subject: 's', html: 'h' }, { idempotencyKey: 'k' })
  const conflict = await mail.emails.send({ to: ['a@x.invalid'], subject: 's2', html: 'h' }, { idempotencyKey: 'k' })
  refuseNextSends(1)
  const refused = await mail.emails.send({ to: ['a@x.invalid'], subject: 's', html: 'h' }, { idempotencyKey: 'k2' })
  if (outbox.length !== 1 || !conflict.error || !refused.error) throw broken('stand-in Resend does not keep one email per key')

  setStripePayments(Array.from({ length: 205 }, (_, i) => ({ id: `pi_ruler_${String(i).padStart(3, '0')}`, created: 1000 + i, status: 'succeeded' })))
  const stripe = new Stripe()
  const firstPage = await stripe.paymentIntents.list({ limit: 100 })
  const all = await stripe.paymentIntents.list({ limit: 100 }).autoPagingToArray({ limit: 10000 })
  const iterated = []
  for await (const payment of stripe.paymentIntents.list({ limit: 100 })) iterated.push(payment.id)
  setStripePayments([{ id: 'pi_ruler_charge', created: 1, status: 'succeeded', charge: { id: 'ch_ruler', object: 'charge', refunded: true, amount_refunded: 5 } }])
  const plain = (await stripe.paymentIntents.list({ limit: 1 })).data[0]
  const expanded = (await stripe.paymentIntents.list({ limit: 1, expand: ['data.latest_charge'] })).data[0]
  if (plain.latest_charge !== 'ch_ruler' || expanded.latest_charge?.refunded !== true || 'charge' in plain) throw broken('stand-in Stripe does not expand the charge the way Stripe does')
  if (firstPage.data.length !== 100 || !firstPage.has_more || all.length !== 205 || iterated.length !== 205 || new Set(iterated).size !== 205) {
    throw broken('stand-in Stripe does not page the way Stripe does')
  }
  let refusedWrite = false
  try { await stripe.refunds.create({}) } catch { refusedWrite = true }
  if (!refusedWrite || !calls.some((call) => call.system === 'stripe' && call.method === 'refunds.create')) throw broken('stand-in Stripe does not record and refuse a write')

  setSanityOrders([{ _type: 'order', paymentIntentId: 'pi_a' }, { _type: 'product', paymentIntentId: 'pi_b' }])
  const found = await backendClient.fetch(ORDER_IDS_QUERY, { ids: ['pi_a', 'pi_b', 'pi_c'] })
  let refusedPatch = false
  try { await backendClient.patch('x') } catch { refusedPatch = true }
  if (JSON.stringify(found) !== '["pi_a"]' || !refusedPatch) throw broken('stand-in Sanity does not answer or refuse as written')
  resetWorld()
}
