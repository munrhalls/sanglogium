// What every account proof shares: the shop, stand-in browsers, customers made
// through the shop's own sign-up, and the line each proof prints.
//
// A browser keeps its own cookies, sends them like a real one, and keeps what
// the shop sets. A customer is made the way a person does it: sign up, open the
// link the shop emailed, sign in. Nothing writes accounts straight into the
// database.

import { outbox, mailsTo, linksIn } from './stand-ins/email.mjs'
import { proofDb, rows } from './stand-ins/database.mjs'
import { requestScope } from './stand-ins/request.mjs'
import { put, selfCheck } from './stand-ins/sanity.mjs'
import { answerNetwork, network } from './stand-ins/world.mjs'

export const SHOP = 'https://shop.example'

export function broken(message) {
  const error = new Error(message)
  error.proofBroken = true
  throw error
}

let route = null
let booted = null

export function boot() {
  booted ??= (async () => {
    const problem = await selfCheck()
    if (problem) broken(`the stand-in Sanity does not keep Sanity's rules: ${problem}`)
    const { createAuth } = await import('@/features/auth/adapters/better-auth/auth')
    const { getMigrations } = await import('better-auth/db/migration')
    const unused = async () => broken('the table-making copy of the sign-in code was used')
    const shape = createAuth({
      profiles: { createUserProfileIfMissing: unused, syncUserProfile: unused, deleteUserProfile: unused, getProfileIdByAuthId: unused },
      orders: { anonymizeUserOrders: unused, hasOpenOrders: unused, mergeGuestOrders: unused },
      emails: { sendVerificationEmail: unused, sendResetPasswordEmail: unused, sendDeleteAccountVerification: unused },
    })
    const { runMigrations } = await getMigrations({ ...shape.options, database: { db: proofDb, type: 'sqlite' } })
    await runMigrations()
    route = await import('@/app/api/auth/[...all]/route')
  })()
  return booted
}

let nextAddress = 1

export class Browser {
  constructor(name) {
    this.name = name
    // name -> { value, expiresAt }. A real browser drops a cookie when its time is up.
    this.jar = new Map()
    this.ip = `198.51.100.${nextAddress++}`
  }

  liveCookies() {
    const now = Date.now()
    for (const [name, cookie] of this.jar) if (cookie.expiresAt !== null && cookie.expiresAt <= now) this.jar.delete(name)
    return [...this.jar].map(([name, cookie]) => [name, cookie.value])
  }

  requestHeaders() {
    const headers = new Headers({ host: 'shop.example', 'user-agent': `stand-in browser of ${this.name}`, 'x-forwarded-for': this.ip })
    const live = this.liveCookies()
    if (live.length) headers.set('cookie', live.map(([k, v]) => `${k}=${v}`).join('; '))
    return headers
  }

  keepCookie(name, value, options = {}) {
    const expiresAt = options.maxAge !== undefined ? Date.now() + options.maxAge * 1000 : options.expires ? new Date(options.expires).getTime() : null
    if (value === '' || (expiresAt !== null && expiresAt <= Date.now())) this.jar.delete(name)
    else this.jar.set(name, { value, expiresAt })
  }

  // Tom copies every cookie Anna's browser holds. His own tool sends them whatever their time.
  copyTo(name) {
    const thief = new Browser(name)
    for (const [key, value] of this.liveCookies()) thief.jar.set(key, { value, expiresAt: null })
    return thief
  }

  keep(response) {
    for (const line of response.headers.getSetCookie()) {
      const [pair, ...attributes] = line.split(';').map((part) => part.trim())
      const at = pair.indexOf('=')
      const options = {}
      for (const attribute of attributes) {
        const [key, val] = attribute.split('=')
        if (/^max-age$/i.test(key)) options.maxAge = Number(val)
        if (/^expires$/i.test(key)) options.expires = val
      }
      this.keepCookie(pair.slice(0, at), pair.slice(at + 1), options)
    }
  }

  // One request to the shop's sign-in address, as this browser would send it.
  // `server` is another copy of the shop's sign-in server; by default the shop's own route answers.
  async send(path, { method = 'POST', body, query, origin = SHOP, headers = {}, server } = {}) {
    await boot()
    const url = new URL(`${SHOP}/api/auth${path}`)
    for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value)
    const sent = this.requestHeaders()
    if (origin) sent.set('origin', origin)
    if (body !== undefined) sent.set('content-type', 'application/json')
    for (const [key, value] of Object.entries(headers)) sent.set(key, value)
    const request = new Request(url, { method, headers: sent, body: body === undefined ? undefined : JSON.stringify(body) })
    const response = await (server ?? (method === 'GET' ? route.GET : route.POST))(request)
    this.keep(response)
    const text = await response.text()
    let json = null
    try {
      json = JSON.parse(text)
    } catch {}
    return { status: response.status, json, text, location: response.headers.get('location'), setCookie: response.headers.getSetCookie() }
  }

  // Runs shop server code (a page, an action, a route) inside this browser's request.
  as(work) {
    return requestScope.run(this, work)
  }

  async session() {
    const answer = await this.send('/get-session', { method: 'GET', origin: null })
    return answer.json?.session ? answer.json : null
  }

  signIn(password = this.password) {
    return this.send('/sign-in/email', { body: { email: this.email, password } })
  }
}

export function mailFor(address, subjectPart) {
  const found = mailsTo(address).filter((mail) => mail.subject.includes(subjectPart))
  return found.at(-1) ?? null
}

export function linkFor(address, subjectPart) {
  const mail = mailFor(address, subjectPart)
  if (!mail) return null
  return linksIn(mail)[0] ?? null
}

// The verify page sends the token from the link to this address (features/auth/ui/VerifyEmailForm.tsx).
export async function openVerifyLink(browser, link) {
  const token = new URL(link).searchParams.get('token')
  return browser.send('/verify-email', { method: 'GET', origin: null, query: { token, callbackURL: '/sign-in?verified=true&merge=1' } })
}

export function verified(answer) {
  return answer.status === 302 && answer.location && !answer.location.includes('error=')
}

const capital = (name) => name[0].toUpperCase() + name.slice(1)

// A person, made through the shop's own screens.
export async function customer(name, { verify = true, signIn = true } = {}) {
  const browser = new Browser(name)
  browser.email = `${name}@example.com`
  browser.password = `${name}-password-1`
  const signUp = await browser.send('/sign-up/email', { body: { name: capital(name), email: browser.email, password: browser.password } })
  if (signUp.status !== 200) broken(`${capital(name)} could not sign up: ${signUp.status}`)
  if (verify) {
    const link = linkFor(browser.email, 'Verify')
    if (!link) broken(`no verification email reached ${capital(name)}`)
    if (!verified(await openVerifyLink(browser, link))) broken(`${capital(name)}'s verification link did not work`)
  }
  if (signIn) {
    const answer = await browser.send('/sign-in/email', { body: { email: browser.email, password: browser.password } })
    if (answer.status !== 200) broken(`${capital(name)} could not sign in: ${answer.status}`)
  }
  const [user] = (await rows('user')).filter((row) => row.email === browser.email)
  browser.userId = user?.id
  return browser
}

let orderCount = 0

// An order document in the stand-in Sanity, shaped like the ones checkout writes.
export function order(owner, { status = 'delivered', guestEmail } = {}) {
  orderCount += 1
  const doc = {
    _id: `order-${orderCount}`,
    _type: 'order',
    orderNumber: `SL-${1000 + orderCount}`,
    status,
    customerEmail: guestEmail ?? owner.email,
    ...(guestEmail ? { isGuest: true } : { userId: owner.userId, isGuest: false }),
    dates: { orderedAt: new Date().toISOString() },
    items: [{ _key: `item-${orderCount}`, productName: `Product ${orderCount}`, quantity: 1 }],
    shippingAddress: { fullName: `Ship ${orderCount}`, line1: `${orderCount} Proof Street` },
  }
  put(doc)
  return doc
}

export { outbox }

// What the forgot-password screen sends (features/auth/ui/ForgotPasswordForm.tsx).
export function askForReset(browser, email) {
  return browser.send('/request-password-reset', { body: { email, redirectTo: '/reset-password' } })
}

// What the reset screen sends with the token from the link (features/auth/ui/ResetPasswordForm.tsx).
export function resetWith(browser, link, newPassword) {
  const token = new URL(link).searchParams.get('token')
  return browser.send('/reset-password', { body: { newPassword, token } })
}

// The three guards the account area uses, asked inside this browser's request.
// Pages use verifySession, the export uses getSession, actions use requireSession.
export async function guards(browser) {
  const auth = await import('@/features/auth/server')
  const page = await browser.as(() => auth.verifySession()).then((s) => s.userId, () => null)
  const route = await browser.as(() => auth.getSession()).then((s) => s?.userId ?? null, () => null)
  const action = await browser.as(() => auth.requireSession()).then((s) => s.userId, () => null)
  return { page, route, action }
}

// Which guards still let this browser in as `userId`, in words, or null.
export async function letsIn(browser, userId) {
  const opened = Object.entries(await guards(browser)).filter(([, id]) => id === userId).map(([name]) => name)
  if (!opened.length) return null
  const words = { page: 'the account pages', route: 'the data export', action: 'the account actions' }
  return opened.map((name) => words[name]).join(', ')
}

// Turns two-factor on the way the account page does: password, then the first code.
export async function turnOnTwoFactor(browser) {
  const { createOTP } = await import('@better-auth/utils/otp')
  const { base32 } = await import('@better-auth/utils/base32')
  const enabled = await browser.send('/two-factor/enable', { body: { password: browser.password } })
  if (enabled.status !== 200) return { problem: `turning two-factor on answered ${enabled.status}` }
  const encoded = new URL(enabled.json.totpURI).searchParams.get('secret')
  const secret = new TextDecoder().decode(base32.decode(encoded))
  const code = () => createOTP(secret, { digits: 6, period: 30 }).totp()
  const confirmed = await browser.send('/two-factor/verify-totp', { body: { code: await code() } })
  if (confirmed.status !== 200) return { problem: `the first code answered ${confirmed.status}` }
  browser.code = code
  browser.backupCodes = enabled.json.backupCodes
  browser.twoFactorKey = { encoded, secret }
  return { problem: null }
}

// What the delete button sends (features/account/ui/DangerZoneSection.tsx), then the link it emails.
export async function askToDelete(browser) {
  const asked = await browser.send('/delete-user', { body: { password: browser.password } })
  return { asked, link: asked.status === 200 ? linkFor(browser.email, 'deletion') : null }
}

export function openDeleteLink(browser, link) {
  const url = new URL(link)
  const query = Object.fromEntries(url.searchParams)
  return browser.send('/delete-user/callback', { method: 'GET', origin: null, query })
}

export async function userRow(email) {
  return (await rows('user')).find((row) => row.email === email) ?? null
}

const answerWords = { yes: 'Yes', no: 'No' }
const flip = { yes: 'no', no: 'yes' }

// The one line a proof prints. `check` returns null when the shop gave the safe
// answer, or the words for what happened instead. A thrown error, or any reach
// for the network, means the proof cannot be trusted.
export async function prove(question, safe, check) {
  let line
  let code
  try {
    await boot()
    const happened = await check()
    if (network.touched) broken(`the shop reached for the network (${network.touched})`)
    if (happened === null) {
      line = `PASS  ${question} ${answerWords[safe]}.`
      code = 0
    } else {
      line = `NO    ${question} ${answerWords[flip[safe]]}: ${happened}`
      code = 1
    }
  } catch (error) {
    line = `proof broken: ${question} ${String(error?.message ?? error).split('\n')[0]}`
    code = 2
  }
  process.stdout.write(`${line}\n`, () => process.exit(code))
}

// Opens a page of the account area as this browser would: the page's own code runs
// inside the browser's request and returns what it would show, or where it sent the browser.
export async function openPage(browser, page, params = {}) {
  const mod = await import(`@/app/(store)/account/${page}/page`)
  try {
    const element = await browser.as(() => mod.default({ params: Promise.resolve(params), searchParams: Promise.resolve({}) }))
    return { element }
  } catch (error) {
    if (error?.redirectTo) return { redirect: error.redirectTo }
    if (error?.notFound) return { notFound: true }
    throw error
  }
}

// The "Export my data" download, fetched as this browser.
export async function exportFor(browser) {
  const { GET } = await import('@/app/api/account/export/route')
  const response = await browser.as(() => GET())
  return { status: response.status, text: await response.text() }
}

// Runs one of the shop's server actions as this browser. A thrown refusal is an answer, not a break.
export async function act(browser, file, ...args) {
  const mod = await import(`@/features/${file}`)
  const run = Object.values(mod).find((value) => typeof value === 'function')
  try {
    return { result: await browser.as(() => run(...args)) }
  } catch (error) {
    return { refused: String(error?.message ?? error) }
  }
}

export function addressForm(street) {
  const form = new FormData()
  for (const [key, value] of Object.entries({ firstName: 'Fay', lastName: 'Proof', phone: '+48 600 000 000', regionCode: 'PL', postalCode: '00-001', street, streetNumber: '1', city: 'Warszawa' })) form.set(key, value)
  return form
}

// Google, stood in. Only Google's token address answers; it vouches for whoever the proof says.
let googleUser = null
const jwtPart = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
answerNetwork((url) => url.startsWith('https://oauth2.googleapis.com/token'), async () => {
  if (!googleUser) broken('Google was asked about nobody')
  const now = Math.floor(Date.now() / 1000)
  const idToken = `${jwtPart({ alg: 'RS256', typ: 'JWT' })}.${jwtPart({ iss: 'https://accounts.google.com', aud: process.env.GOOGLE_CLIENT_ID, iat: now, exp: now + 3600, ...googleUser })}.stand-in`
  return Response.json({ access_token: 'stand-in-access', id_token: idToken, expires_in: 3600, token_type: 'Bearer', scope: 'openid email profile' })
})

// Signs in (or links, with start '/link-social') with Google as `who`: the browser goes to Google and comes back.
export async function withGoogle(browser, who, start = '/sign-in/social') {
  const asked = await browser.send(start, { body: { provider: 'google', callbackURL: '/account' } })
  if (asked.status !== 200 || !asked.json?.url) return { asked, back: null }
  googleUser = { sub: who.sub, email: who.email, email_verified: who.verified ?? true, name: who.name ?? 'Google Person' }
  const state = new URL(asked.json.url).searchParams.get('state')
  const back = await browser.send('/callback/google', { method: 'GET', origin: null, query: { code: 'stand-in-code', state } })
  googleUser = null
  return { asked, back }
}

// The settings the shop's sign-in code really runs with, as Better Auth computed them.
export async function signInContext() {
  await boot()
  const { createAuth } = await import('@/features/auth/adapters/better-auth/auth')
  const unused = async () => broken('the settings copy used a store')
  const copy = createAuth({
    profiles: { createUserProfileIfMissing: unused, syncUserProfile: unused, deleteUserProfile: unused, getProfileIdByAuthId: unused },
    orders: { anonymizeUserOrders: unused, hasOpenOrders: unused, mergeGuestOrders: unused },
    emails: { sendVerificationEmail: unused, sendResetPasswordEmail: unused, sendDeleteAccountVerification: unused },
  })
  return copy.$context
}

// A screen of the shop, shown in a stand-in browser window (jsdom) for `browser`.
// The screen's own code runs: its clicks call the real sign-in client, whose requests
// are answered by the shop's route with this browser's cookies. Every place the screen
// sends the browser (a link assignment or a router push) is recorded in `went`.
let screenOwner = null
answerNetwork((url) => url.startsWith(`${SHOP}/api/auth/`), async (input, init) => {
  if (!screenOwner) broken('a screen asked the shop with no browser open')
  await boot()
  const request = new Request(input, init)
  const headers = screenOwner.requestHeaders()
  for (const [key, value] of request.headers) if (key !== 'cookie') headers.set(key, value)
  if (request.method !== 'GET') headers.set('origin', SHOP)
  const body = request.method === 'GET' ? undefined : await request.text()
  const response = await (request.method === 'GET' ? route.GET : route.POST)(new Request(request.url, { method: request.method, headers, body }))
  screenOwner.keep(response)
  // What the screen was told, kept for the proof (the two-factor setup shows its key only as a picture).
  screenOwner.told ??= {}
  screenOwner.told[new URL(request.url).pathname.replace('/api/auth', '')] = await response.clone().json().catch(() => null)
  return response
})

export async function showScreen(browser, { path = '/account', load }) {
  const { JSDOM } = await import('jsdom')
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: `${SHOP}${path}`, pretendToBeVisual: true })
  const win = dom.window
  const went = []
  const here = new URL(`${SHOP}${path}`)
  const location = {
    get href() { return here.href },
    set href(value) { went.push(String(value)) },
    assign: (value) => went.push(String(value)),
    replace: (value) => went.push(String(value)),
    reload: () => {},
    get origin() { return here.origin },
    get pathname() { return here.pathname },
    get search() { return here.search },
    get hash() { return here.hash },
  }
  const windowProxy = new Proxy(win, {
    get(target, key) {
      if (key === 'location') return location
      const value = Reflect.get(target, key, target)
      return typeof value === 'function' && !/^[A-Z]/.test(String(key)) ? value.bind(target) : value
    },
    set(target, key, value) {
      if (key === 'location') { went.push(String(value)); return true }
      return Reflect.set(target, key, value, target)
    },
  })
  const globals = { window: windowProxy, document: win.document, navigator: win.navigator, location }
  for (const name of Object.getOwnPropertyNames(win)) {
    if (/^(HTML|SVG|Node|Element|Event|MouseEvent|KeyboardEvent|InputEvent|FocusEvent|SubmitEvent|CustomEvent|FormData|MutationObserver|getComputedStyle|requestAnimationFrame|cancelAnimationFrame|DocumentFragment|Text|Comment)/.test(name)) globals[name] = win[name]
  }
  for (const [name, value] of Object.entries(globals)) Object.defineProperty(globalThis, name, { value, configurable: true, writable: true })
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const { setPage } = await import('./stand-ins/navigation.mjs')
  const router = { push: (to) => went.push(String(to)), replace: (to) => went.push(String(to)), refresh: () => {}, back: () => {}, forward: () => {}, prefetch: () => {} }
  setPage({ router, searchParams: new URLSearchParams(here.search), pathname: here.pathname })
  screenOwner = browser
  const React = await import('react')
  const { createRoot } = await import('react-dom/client')
  // The shop runs as in production, where React has no act(): updates land on React's own schedule, so wait.
  const act = async (work) => { await work(); await new Promise((resolve) => setTimeout(resolve, 0)) }
  const element = await load()
  const root = createRoot(win.document.getElementById('root'))
  await act(async () => root.render(element))
  const settle = async () => {
    for (let i = 0; i < 40; i += 1) await act(async () => { await new Promise((resolve) => setTimeout(resolve, 25)) })
  }
  const find = (test) => [...win.document.querySelectorAll('button')].find((button) => test(button.textContent.trim()))
  return {
    went,
    document: win.document,
    async type(selector, value) {
      const input = win.document.querySelector(selector)
      if (!input) broken(`the screen has no ${selector}`)
      const setter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, 'value').set
      await act(async () => {
        setter.call(input, value)
        input.dispatchEvent(new win.Event('input', { bubbles: true }))
      })
    },
    async click(text) {
      const button = find((label) => label === text)
      if (!button) broken(`the screen has no "${text}" button`)
      await act(async () => button.click())
      await settle()
    },
    text: () => win.document.body.textContent,
    close: () => { root.unmount(); screenOwner = null },
  }
}
