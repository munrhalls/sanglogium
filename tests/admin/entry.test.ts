// Who can open the admin area.
//
// Every visitor is made up on purpose: nobody, a customer, the owner, and the
// owner's account with one safety missing at a time. The shop's real owner check
// decides each one. "Page not found" is the only right answer for anyone but the
// owner: a sign-in page or an error would tell a stranger the admin area exists.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import path from 'node:path'
import {
  calls, line, tryImport, firstLine, signInAs, setOwnerList, betterAuth, repoRoot,
  OWNER, SECOND_OWNER, CUSTOMER, broken, resetWorld,
} from './standins.mjs'

export const title = 'Who can open the admin area'

const MINUTE = 60_000

function facts(change = {}) {
  return {
    email: OWNER,
    emailVerified: true,
    twoFactorEnabled: true,
    signedInAt: Date.now() - 5 * MINUTE,
    providers: ['credential'],
    ...change,
  }
}

async function adminDoor() {
  return tryImport('@/features/admin/server')
}

// What one visitor gets from the owner check.
async function visit(who, ownerList) {
  setOwnerList(ownerList)
  signInAs(who)
  const door = await adminDoor()
  if (door.missing) return { opened: false, got: door.missing }
  if (typeof door.mod.requireOwner !== 'function') return { opened: false, got: 'the admin door has no requireOwner' }
  try {
    await door.mod.requireOwner()
    return { opened: true, got: 'the page opened' }
  } catch (error) {
    if (error?.standIn === 'not-found') return { opened: false, notFound: true, got: 'page not found' }
    if (error?.standIn === 'redirect') return { opened: false, got: `it sent them to ${error.url}, which tells them the page exists` }
    return { opened: false, got: `it broke instead: ${firstLine(error)}` }
  }
}

// A "no" question: every visitor must get page not found.
async function refusesAll(id, question, visitors) {
  const wrong = []
  for (const [label, who, list] of visitors) {
    const result = await visit(who, list)
    if (!result.notFound) wrong.push(`${label}: ${result.got}`)
  }
  if (wrong.length === 0) return line(id, question, true, 'It answered no: page not found, every time.')
  return line(id, question, false, `It answered yes or broke: ${wrong.join('; ')}.`)
}

// ---- The structure of every admin file -------------------------------------

const ADMIN_DIR = path.join(repoRoot, 'app', '(admin)')
const PAGE_GATE = /export\s+default\s+async\s+function\s*\w*\s*\(\s*\)\s*(?::[^{]+)?\{\s*await\s+requireOwner\(\s*\)\s*;?/
const GATE_IMPORT = /import\s*\{[^}]*\brequireOwner\b[^}]*\}\s*from\s*["']@\/features\/admin\/server["']/
const ADDRESS_BAR = /\b(searchParams|params|useSearchParams|useParams|usePathname|useRouter)\b/

export function adminFileProblems(files) {
  const problems = []
  for (const { file, text } of files) {
    const base = path.basename(file)
    if (/^route\.[jt]sx?$/.test(base)) problems.push(`${file} is an admin route handler`)
    if (/["']use server["']/.test(text)) problems.push(`${file} holds a server action`)
    if (/["']use client["']/.test(text)) problems.push(`${file} runs in the browser`)
    if (ADDRESS_BAR.test(text)) problems.push(`${file} reads the address bar`)
    if (/^page\.[jt]sx?$/.test(base)) {
      if (!GATE_IMPORT.test(text) || !PAGE_GATE.test(text)) problems.push(`${file} does not check the owner first`)
    } else if (/^layout\.[jt]sx?$/.test(base)) {
      if (/\bawait\b/.test(text) || /from\s*["']@\/features\//.test(text)) problems.push(`${file} reads data in the layout`)
    } else if (!/^route\.[jt]sx?$/.test(base)) {
      problems.push(`${file} is not an admin page or layout`)
    }
  }
  return problems
}

function rulerForFiles() {
  const good = {
    file: 'app/(admin)/manager/page.tsx',
    text: 'import { requireOwner } from "@/features/admin/server";\nexport default async function Manager() {\n  await requireOwner();\n  return null;\n}\n',
  }
  const layout = { file: 'app/(admin)/layout.tsx', text: 'export default function L({ children }) { return children }' }
  const bad = [
    { file: 'app/(admin)/x/page.tsx', text: 'export default async function X() { return null }' },
    { file: 'app/(admin)/x/page.tsx', text: good.text.replace('Manager()', 'Manager({ searchParams })') },
    { file: 'app/(admin)/x/route.ts', text: 'export async function GET() {}' },
    { file: 'app/(admin)/x/page.tsx', text: `"use client";\n${good.text}` },
    { file: 'app/(admin)/layout.tsx', text: 'import { x } from "@/features/admin/server"; export default async function L() { await x() }' },
  ]
  if (adminFileProblems([good, layout]).length !== 0) throw broken('the file check refuses a correct admin page')
  for (const sample of bad) {
    if (adminFileProblems([sample]).length === 0) throw broken(`the file check passes a bad sample: ${sample.file}`)
  }
}

function walk(dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const name of readdirSync(dir).sort()) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

function adminFiles() {
  return walk(ADMIN_DIR).map((full) => ({ file: path.relative(repoRoot, full), text: readFileSync(full, 'utf8') }))
}

// ---- The questions ------------------------------------------------------------

export async function ask() {
  rulerForFiles()
  resetWorld()
  const lines = []

  lines.push(await refusesAll('entry-signed-out', 'Can a signed-out visitor open the admin page?', [
    ['signed out', null, OWNER],
  ]))

  lines.push(await refusesAll('entry-customer', 'Can a signed-in customer open the admin page?', [
    ['a customer', facts({ email: CUSTOMER }), OWNER],
  ]))

  {
    const id = 'entry-owner'
    const question = 'Can the owner open the admin page?'
    const first = await visit(facts(), OWNER)
    const second = await visit(facts({ email: SECOND_OWNER }), `${OWNER},${SECOND_OWNER}`)
    if (first.opened && second.opened) lines.push(line(id, question, true, 'It answered yes: the page opened for both owners on the list.'))
    else lines.push(line(id, question, false, `It answered no: first owner: ${first.got}; second owner: ${second.got}.`))
  }

  lines.push(await refusesAll('entry-no-2fa', 'Can an account on the owner list open it without two-factor turned on?', [
    ['two-factor off', facts({ twoFactorEnabled: false }), OWNER],
  ]))

  lines.push(await refusesAll('entry-unverified', 'Can an account on the owner list open it before its email is confirmed?', [
    ['email unconfirmed', facts({ emailVerified: false }), OWNER],
  ]))

  {
    const id = 'entry-stale'
    const question = 'Can the owner open it when the sign-in was more than an hour ago?'
    const old = await visit(facts({ signedInAt: Date.now() - 61 * MINUTE }), OWNER)
    const recent = await visit(facts({ signedInAt: Date.now() - 59 * MINUTE }), OWNER)
    if (old.notFound && recent.opened) lines.push(line(id, question, true, 'It answered no: 61 minutes got page not found, 59 minutes opened.'))
    else lines.push(line(id, question, false, `It answered wrong: 61 minutes: ${old.got}; 59 minutes: ${recent.got}.`))
  }

  lines.push(await refusesAll('entry-google', 'Can an account on the owner list open it after a Google sign-in, which skips the two-factor code?', [
    ['password and Google on the account', facts({ providers: ['credential', 'google'] }), OWNER],
    ['Google only', facts({ providers: ['google'] }), OWNER],
    ['no sign-in method', facts({ providers: [] }), OWNER],
  ]))

  {
    const id = 'entry-lookalike'
    const question = 'Can an email that only looks like an owner email get in?'
    const refusal = await refusesAll(id, question, [
      ['letters before', facts({ email: `x${OWNER}` }), OWNER],
      ['longer domain', facts({ email: `${OWNER}.example.invalid` }), OWNER],
      ['letters inside the domain', facts({ email: 'keeper@xharbour.invalid' }), OWNER],
      ['letters after', facts({ email: `${OWNER}x` }), OWNER],
      ['shorter domain', facts({ email: 'keeper@harbour' }), OWNER],
      ['part of a listed address', facts({ email: OWNER }), SECOND_OWNER],
    ])
    const real = await visit(facts({ email: OWNER.toUpperCase() }), `  Keeper@HARBOUR.invalid ,`)
    if (refusal.pass && real.opened) lines.push(line(id, question, true, 'It answered no: every lookalike got page not found, and the real address in capitals opened.'))
    else if (!refusal.pass) lines.push(refusal)
    else lines.push(line(id, question, false, `It refused the real address written in capitals with spaces: ${real.got}.`))
  }

  lines.push(await refusesAll('entry-no-list', 'Can anyone get in when the owner list is empty or not set?', [
    ['list not set', facts(), undefined],
    ['list empty', facts(), ''],
    ['list only commas', facts(), ' , , '],
    ['empty email against an empty entry', facts({ email: '' }), `${OWNER},`],
  ]))

  lines.push(await revokedSession())
  lines.push(everyPage())
  lines.push(await everyReader())
  return lines
}

async function revokedSession() {
  const id = 'entry-revoked'
  const question = 'Does a session the owner signed out of keep opening the admin page from the 5-minute cookie copy?'
  const readers = await tryImport('@/features/auth/adapters/better-auth/session')
  if (readers.missing) return line(id, question, false, `It could not be asked: ${readers.missing}.`)
  const createdAt = new Date(Date.now() - 5 * MINUTE)
  const owner = {
    session: { id: 'session-1', userId: 'user-1', token: 'stand-in', createdAt, updatedAt: createdAt, expiresAt: new Date(Date.now() + 7 * 24 * 60 * MINUTE) },
    user: { id: 'user-1', email: OWNER, name: 'Keeper', emailVerified: true, twoFactorEnabled: true, createdAt, updatedAt: createdAt },
  }
  const profiles = {
    createUserProfileIfMissing: async () => 'existing',
    syncUserProfile: async () => {},
    deleteUserProfile: async () => {},
    getProfileIdByAuthId: async () => null,
  }
  const make = (world) => readers.mod.createSessionReaders(betterAuth(world), profiles)
  if (typeof readers.mod.createSessionReaders !== 'function' || typeof make({ record: null, cookieCopy: null, accounts: [] }).getSignInFacts !== 'function') {
    return line(id, question, false, 'It answered yes: the sign-in readers have no getSignInFacts, so nothing asks for the fresh record.')
  }
  calls.length = 0
  let gone
  try {
    gone = await make({ record: null, cookieCopy: owner, accounts: [{ providerId: 'credential' }] }).getSignInFacts()
  } catch (error) {
    return line(id, question, false, `It broke instead: ${firstLine(error)}.`)
  }
  const live = await make({ record: owner, cookieCopy: null, accounts: [{ providerId: 'credential' }, { providerId: 'google' }] }).getSignInFacts()
  const want = { email: OWNER, emailVerified: true, twoFactorEnabled: true, signedInAt: createdAt.getTime(), providers: ['credential', 'google'] }
  const liveRight = live && Object.keys(want).every((key) => JSON.stringify(live[key]) === JSON.stringify(want[key]))
  const authDoor = readFileSync(path.join(repoRoot, 'features/auth/server.ts'), 'utf8')
  const adminDoorFile = path.join(repoRoot, 'features/admin/server.ts')
  const adminDoorText = existsSync(adminDoorFile) ? readFileSync(adminDoorFile, 'utf8') : ''
  const doorHandsItOut = /export\s*\{[^}]*\bgetSignInFacts\b[^}]*\}/.test(authDoor) || /export\s+(const|async function|function)\s+getSignInFacts\b/.test(authDoor)
  const gateUsesIt = /import\s*\{[^}]*\bgetSignInFacts\b[^}]*\}\s*from\s*["']@\/features\/auth\/server["']/.test(adminDoorText)
  if (gone !== null) return line(id, question, false, 'It answered yes: the signed-out session still gave the owner\'s facts from the cookie copy.')
  if (!liveRight) return line(id, question, false, `It answered wrong for a live owner: got ${JSON.stringify(live)}.`)
  if (!doorHandsItOut) return line(id, question, false, 'It answered yes: features/auth/server.ts does not hand out getSignInFacts.')
  if (!gateUsesIt) return line(id, question, false, 'It answered yes: the admin door does not read getSignInFacts from features/auth/server.')
  return line(id, question, true, 'It answered no: the reader asked the sign-in database itself and got nobody.')
}

function everyPage() {
  const id = 'entry-every-page'
  const question = 'Does every admin page check the owner on the server first, with no admin route, server action, browser-only page or address-bar input?'
  const files = adminFiles()
  const pages = files.filter(({ file }) => /(^|\/)page\.[jt]sx?$/.test(file))
  if (pages.length === 0) return line(id, question, false, 'It answered no: there is no admin page at all.')
  const problems = adminFileProblems(files)
  if (problems.length === 0) return line(id, question, true, `It answered yes: ${pages.length} admin page(s), each checks the owner first.`)
  return line(id, question, false, `It answered no: ${problems.join('; ')}.`)
}

async function everyReader() {
  const id = 'entry-every-reader'
  const question = 'Does every admin data reader refuse a stranger before it asks Stripe or Sanity anything?'
  const door = await adminDoor()
  if (door.missing) return line(id, question, false, `It could not be asked: ${door.missing}.`)
  const readers = Object.entries(door.mod).filter(([name, value]) => typeof value === 'function' && name !== 'requireOwner')
  const wrong = []
  for (const [name, reader] of readers) {
    for (const [label, who] of [['signed out', null], ['a customer', facts({ email: CUSTOMER })]]) {
      setOwnerList(OWNER)
      signInAs(who)
      calls.length = 0
      let got = 'it answered'
      try {
        await reader()
      } catch (error) {
        got = error?.standIn === 'not-found' ? 'page not found' : `it broke: ${firstLine(error)}`
      }
      const asked = calls.filter((call) => call.system === 'stripe' || call.system === 'sanity')
      if (got !== 'page not found' || asked.length > 0) wrong.push(`${name} for ${label}: ${got}, ${asked.length} call(s) to Stripe or Sanity`)
    }
  }
  if (wrong.length) return line(id, question, false, `It answered no: ${wrong.join('; ')}.`)
  const names = readers.map(([name]) => name).join(', ')
  return line(id, question, true, readers.length ? `It answered yes: ${names} refused both and asked nothing.` : 'It answered yes: the admin door has no data reader yet.')
}
