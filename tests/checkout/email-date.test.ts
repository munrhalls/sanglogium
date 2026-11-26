// The confirmation email's order date.
//
// One question. The email shows the order date the receipt shows. The words
// are written here. The date is the order time the delivery window already
// reads, formatted as the English long date. It is read once. It is printed
// after the order number and before the items. A missing delivery window does
// not hide it.
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
// node --experimental-strip-types tests/checkout/email-date.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const EMAIL = 'features/checkout/adapters/resend/orderConfirmationEmail.ts'
const PLACED = 'const placed = new Date(data.orderedAt)'
const OPEN = 'const deliveryLine'
const ORDER_MARK = 'Order:</strong>'
const ITEMS = '${itemsHtml}'
const INSERT = '${dateLine}'
const DATE_CALL = "toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })"
const LINE = 'Date: ${placed.' + "toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}"

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
  if (PLACED !== 'const placed = new Date(data.orderedAt)') return 'the order time read was rewritten'
  if (OPEN !== 'const deliveryLine') return 'the window mark was rewritten'
  if (ORDER_MARK !== 'Order:</strong>') return 'the order mark was rewritten'
  if (ITEMS !== '${itemsHtml}') return 'the items mark was rewritten'
  if (INSERT !== '${dateLine}') return 'the email line was rewritten'
  if (DATE_CALL !== "toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })") return 'the date call was rewritten'
  if (LINE !== 'Date: ${placed.toLocaleDateString(\'en-US\', { year: \'numeric\', month: \'long\', day: \'numeric\' })}') return 'the date line was rewritten'
  if (bounded("toLocaleDateString('en-US', { month: 'long', day: 'numeric' })", DATE_CALL) !== 0) return 'the delivery day was accepted as the order date'
  if (bounded("toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })", DATE_CALL) !== 0) return 'a Polish date was accepted'
  if (bounded("toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })", DATE_CALL) !== 0) return 'a time zone was accepted'
  if (bounded(DATE_CALL, DATE_CALL) !== 1) return 'the date call was missed'
  if (bounded(LINE, LINE) !== 1) return 'the date line was missed'
  if (bounded('const dateLine', INSERT) !== 0) return 'a declaration was accepted as the email line'
  if (bounded('const placedAt = new Date(data.orderedAt)', PLACED) !== 0) return 'a longer name was accepted as the order time'
  const sample = [
    'const placed = new Date(data.orderedAt)',
    'const deliveryLine = days',
    '<strong>Order:</strong> ${orderNumber}',
    '${dateLine}',
    '${itemsHtml}',
    'Date: ${placed.toLocaleDateString(\'en-US\', { year: \'numeric\', month: \'long\', day: \'numeric\' })}',
  ].join('\n')
  if (bounded(sample, PLACED) !== 1) return 'the order time was not counted'
  if (bounded(sample, 'data.orderedAt') !== 1) return 'the order time was read twice in the sample'
  if (bounded(sample, DATE_CALL) !== 1) return 'the date call was not recognized'
  if (bounded(sample, LINE) !== 1) return 'the date line was not recognized'
  if (bounded(sample, INSERT) !== 1) return 'the email line was not counted'
  const text = flat(sample)
  const placedAt = text.indexOf(PLACED)
  const windowAt = text.indexOf(OPEN)
  const orderAt = text.indexOf(ORDER_MARK)
  const dateAt = text.indexOf(INSERT)
  const itemsAt = text.indexOf(ITEMS)
  if (!(placedAt >= 0 && windowAt >= 0 && placedAt < windowAt)) return 'the order time was not required outside the window'
  if (!(orderAt >= 0 && dateAt >= 0 && itemsAt >= 0 && orderAt < dateAt && dateAt < itemsAt)) return 'the date was not required before the items'
  return null
}

function readEmail() {
  try {
    return stripComments(readFileSync(path.join(root, EMAIL), 'utf8'))
  } catch (error) {
    proofBroken(`cannot read ${EMAIL}: ${error.message}`)
  }
}

function groups(email) {
  return [
    {
      question: 'The order confirmation email shows the order date the receipt shows.',
      cases: [
        ['The date is the order time, read once', () => {
          if (bounded(email, 'data.orderedAt') !== 1) return 'the order time is not read once'
          if (bounded(email, PLACED) !== 1) return 'the email does not keep that order time'
          const text = flat(email)
          if (!(text.indexOf(PLACED) < text.indexOf(OPEN))) return 'the order time is hidden inside the delivery window'
          return null
        }],
        ['The email prints that date before the items', () => {
          if (bounded(email, DATE_CALL) !== 1) return 'the date is not the English long date'
          if (bounded(email, LINE) !== 1) return 'the email does not print the order date'
          if (bounded(email, INSERT) !== 1) return 'the date line is not in the email'
          const text = flat(email)
          const orderAt = text.indexOf(ORDER_MARK)
          const dateAt = text.indexOf(INSERT)
          const itemsAt = text.indexOf(ITEMS)
          if (!(orderAt >= 0 && orderAt < dateAt && dateAt < itemsAt)) return 'the date is not shown before the items'
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
  const email = readEmail()
  console.log('The order confirmation email shows the order date the receipt shows.')
  const list = groups(email)
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
