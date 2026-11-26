// The confirmation email's delivery window.
//
// One question. The email shows the delivery window the receipt shows. The
// words are written here. The window starts the stored day count after the
// order time and ends one day later. The dates are the English month and day.
// The dash between them is the receipt's en dash. No day count adds no line.
//
// A PASS line ended as its sentence says. A NO line did not, and the text after
// NO is what actually happened. A NO is a true answer. Do not edit the sentence
// to match the shop.
//
// Nothing here waits, rolls dice, or calls the carrier. The same run twice
// gives the same answer. This proof does not call Intl.
//
// 0 every line passed. 1 one or more lines are NO. 2 the proof itself broke.
//
// node --experimental-strip-types tests/checkout/email-window.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ORDER_TYPES = 'features/order/core/types/orderTypes.ts'
const ORDER_WRITE = 'features/order/adapters/sanity/createOrderFromPayment.ts'
const EMAIL = 'features/checkout/adapters/resend/orderConfirmationEmail.ts'
const TYPE_WHEN = 'orderedAt: string;'
const PASS_WHEN = 'orderedAt: now'
const READ_WHEN = 'data.orderedAt'
const GUARD = 'const days = method?.estimatedDays'
const OPEN = 'const deliveryLine = days'
const FROM_DAY = 'from.getDate() + days)'
const TO_DAY = 'to.getDate() + days + 1)'
const DAY_CALL = "toLocaleDateString('en-US', { month: 'long', day: 'numeric' })"
const WINDOW = 'Estimated delivery ${fmt(from)}\u2013${fmt(to)}'
const INSERT = '${deliveryLine}'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

function proofBroken(message) {
  const error = new Error(`proof broken: ${message}`)
  error.proofBroken = true
  throw error
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function flat(source) {
  return source.replace(/\s+/g, ' ').trim()
}

function bounded(source, text) {
  const textFlat = flat(source)
  let found = 0
  let from = 0
  while (from <= textFlat.length) {
    const at = textFlat.indexOf(text, from)
    if (at < 0) return found
    const before = at === 0 ? '' : textFlat[at - 1]
    const after = textFlat[at + text.length] ?? ''
    if (!/[A-Za-z0-9_]/.test(before) && !/[A-Za-z0-9_]/.test(after)) found += 1
    from = at + text.length
  }
  return found
}

function ruler() {
  if (TYPE_WHEN !== 'orderedAt: string;') return 'the order time type was rewritten'
  if (PASS_WHEN !== 'orderedAt: now') return 'the order time copy was rewritten'
  if (READ_WHEN !== 'data.orderedAt') return 'the email order time was rewritten'
  if (GUARD !== 'const days = method?.estimatedDays') return 'the day guard was rewritten'
  if (OPEN !== 'const deliveryLine = days') return 'the window guard was rewritten'
  if (FROM_DAY !== 'from.getDate() + days)') return 'the window start was rewritten'
  if (TO_DAY !== 'to.getDate() + days + 1)') return 'the window end was rewritten'
  if (DAY_CALL !== "toLocaleDateString('en-US', { month: 'long', day: 'numeric' })") return 'the day format was rewritten'
  if (WINDOW !== 'Estimated delivery ${fmt(from)}\u2013${fmt(to)}') return 'the window text was rewritten'
  if (INSERT !== '${deliveryLine}') return 'the email line was rewritten'
  if (WINDOW.charCodeAt(WINDOW.indexOf('\u2013')) !== 8211) return 'the range dash was not the receipt dash'
  if (WINDOW.includes('-') || WINDOW.includes('\u2014')) return 'a different dash was accepted'
  if (bounded('const days = method.estimatedDays', GUARD) !== 0) return 'a missing question mark was accepted as the guard'
  if (bounded(GUARD, GUARD) !== 1) return 'the day guard was missed'
  if (bounded('const deliveryLine = daysCount', OPEN) !== 0) return 'a longer name was accepted as the window guard'
  if (bounded(OPEN, OPEN) !== 1) return 'the window guard was missed'
  if (bounded('orderedAt?: string;', TYPE_WHEN) !== 0) return 'an optional order time was accepted'
  if (bounded(TYPE_WHEN, TYPE_WHEN) !== 1) return 'the order time type was missed'
  if (bounded('orderedAt: new Date().toISOString()', PASS_WHEN) !== 0) return 'a second clock was accepted'
  if (bounded('orderedAt: now,\norderedAt: now,', PASS_WHEN) !== 2) return 'the two order times were not both counted'
  if (bounded('orderedAt: now,', PASS_WHEN) !== 1) return 'one order time was not counted'
  if (bounded('from.getDate() + days + 1)', FROM_DAY) !== 0) return 'a later start was accepted'
  if (bounded(FROM_DAY, FROM_DAY) !== 1) return 'the window start was missed'
  if (bounded(TO_DAY, TO_DAY) !== 1) return 'the window end was missed'
  if (bounded("toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })", DAY_CALL) !== 0) return 'the order date was accepted as the window'
  if (bounded("toLocaleDateString('pl-PL', { month: 'long', day: 'numeric' })", DAY_CALL) !== 0) return 'a Polish day was accepted'
  if (bounded(DAY_CALL, DAY_CALL) !== 1) return 'the English day was missed'
  const hyphen = WINDOW.replace('\u2013', '-')
  const em = WINDOW.replace('\u2013', '\u2014')
  if (bounded(hyphen, WINDOW) !== 0 || bounded(em, WINDOW) !== 0) return 'a different dash was printed'
  if (bounded(WINDOW, WINDOW) !== 1) return 'the window text was missed'
  if (bounded(INSERT, INSERT) !== 1) return 'the email line was missed'
  if (bounded('const deliveryLine', INSERT) !== 0) return 'a declaration was accepted as the email line'
  const sample = [
    'const placed = new Date(data.orderedAt)',
    'from.setDate(from.getDate() + days)',
    'to.setDate(to.getDate() + days + 1)',
    "const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })",
    'return `<p style="margin:0;">Estimated delivery ${fmt(from)}\u2013${fmt(to)}</p>`',
    '${deliveryLine}',
    'Shipping to:',
  ].join('\n')
  if (bounded(sample, READ_WHEN) !== 1) return 'the email order time was not counted'
  if (bounded(sample, FROM_DAY) !== 1) return 'the window start was not recognized'
  if (bounded(sample, TO_DAY) !== 1) return 'the window end was not recognized'
  if (bounded(sample, DAY_CALL) !== 1) return 'the English day was not recognized'
  if (bounded(sample, WINDOW) !== 1) return 'the window text was not recognized'
  if (bounded(sample, INSERT) !== 1) return 'the email line was not counted'
  const text = flat(sample)
  if (!(text.indexOf(INSERT) < text.indexOf('Shipping to:'))) return 'the window was not required before the address'
  return null
}

function readShop(file) {
  try {
    return stripComments(readFileSync(path.join(root, file), 'utf8'))
  } catch (error) {
    proofBroken(`cannot read ${file}: ${error.message}`)
  }
}

function groups(types, order, email) {
  return [
    {
      question: 'The order confirmation email shows the delivery window the receipt shows.',
      cases: [
        ['The email receives the order time', () => {
          if (bounded(types, TYPE_WHEN) !== 1) return 'the email has no order time'
          if (bounded(order, PASS_WHEN) !== 2) return 'the email does not get the stored order time'
          return null
        }],
        ['The email prints that window before the address', () => {
          if (bounded(email, GUARD) !== 1) return 'the email does not check the day count'
          if (bounded(email, OPEN) !== 1) return 'the window does not use that day count'
          if (bounded(email, READ_WHEN) !== 1) return 'the email does not read the order time'
          if (bounded(email, FROM_DAY) !== 1) return 'the window does not start on the stored day count'
          if (bounded(email, TO_DAY) !== 1) return 'the window does not end one day later'
          if (bounded(email, DAY_CALL) !== 1) return 'the window is not the English month and day'
          if (bounded(email, WINDOW) !== 1) return 'the email does not print the window'
          if (bounded(email, INSERT) !== 1) return 'the window is not in the email'
          const text = flat(email)
          if (!(text.indexOf(INSERT) < text.indexOf('Shipping to:'))) return 'the window is not shown before the address'
          return null
        }],
      ],
    },
  ]
}

function brokenFinding(error) {
  if (error?.proofBroken) return error.message
  return `proof broken: ${error?.message ?? error}`
}

function main() {
  const broken = ruler()
  if (broken) {
    console.log(`proof broken: ${broken}`)
    return 2
  }
  const types = readShop(ORDER_TYPES)
  const order = readShop(ORDER_WRITE)
  const email = readShop(EMAIL)
  console.log('The order confirmation email shows the delivery window the receipt shows.')
  const list = groups(types, order, email)
  if (list.some((group) => group.cases.length === 0)) {
    console.log('proof broken: a question has no cases')
    return 2
  }
  const results = []
  let broke = false
  for (const group of list) {
    for (const [name, run] of group.cases) {
      try {
        results.push({ question: group.question, name, finding: run() })
      } catch (error) {
        broke = true
        results.push({ question: group.question, name, finding: brokenFinding(error) })
      }
    }
  }
  let current = ''
  for (const result of results) {
    if (result.question !== current) {
      current = result.question
      console.log(current)
    }
    console.log(result.finding ? `  ${result.name}: NO — ${result.finding}` : `  ${result.name}: PASS`)
  }
  if (broke) {
    console.log('proof broken')
    return 2
  }
  const nos = results.filter((result) => result.finding)
  if (nos.length !== 0) {
    console.log(`${nos.length} NO`)
    return 1
  }
  console.log('PASS')
  return 0
}

try {
  process.exit(main())
} catch (error) {
  console.error(error)
  process.exit(2)
}
