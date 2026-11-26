// The confirmation email's shipping method.
//
// One question. The email shows the shipping method stored on the order. The
// words are written here. A longer name than carrier or estimatedDays is not a
// pass. No method adds no line. The day words and the em dash match the receipt.
//
// A PASS line ended as its sentence says. A NO line did not, and the text after
// NO is what actually happened. A NO is a true answer. Do not edit the sentence
// to match the shop.
//
// Nothing here waits, rolls dice, or calls the carrier. The same run twice
// gives the same answer.
//
// 0 every line passed. 1 one or more lines are NO. 2 the proof itself broke.
//
// node --experimental-strip-types tests/checkout/email-method.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ORDER_TYPES = 'features/order/core/types/orderTypes.ts'
const ORDER_WRITE = 'features/order/adapters/sanity/createOrderFromPayment.ts'
const EMAIL = 'features/checkout/adapters/resend/orderConfirmationEmail.ts'
const TYPE_METHOD = 'shippingMethod?: { carrier: string; estimatedDays?: number }'
const PASS_CARRIER = 'carrier: shippingMethod.carrier'
const PASS_DAYS = 'estimatedDays: shippingMethod.estimatedDays'
const READ_METHOD = 'data.shippingMethod'
const INSERT = '${methodLine}'
const LINE = 'method ? `<p style="margin:0;">${method.carrier} \u2014 ${method.estimatedDays ?? \'?\'} ${method.estimatedDays === 1 ? \'business day\' : \'business days\'}</p>` : ""'

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
  if (TYPE_METHOD !== 'shippingMethod?: { carrier: string; estimatedDays?: number }') return 'the method type was rewritten'
  if (PASS_CARRIER !== 'carrier: shippingMethod.carrier') return 'the carrier copy was rewritten'
  if (PASS_DAYS !== 'estimatedDays: shippingMethod.estimatedDays') return 'the day copy was rewritten'
  if (READ_METHOD !== 'data.shippingMethod') return 'the email method was rewritten'
  if (INSERT !== '${methodLine}') return 'the email line was rewritten'
  if (LINE.charCodeAt(LINE.indexOf('\u2014')) !== 0x2014) return 'the dash was not the receipt dash'
  if (LINE.includes('-')) return 'a hyphen was accepted as the receipt dash'
  if (bounded('shippingMethod: { carrier: string; estimatedDays?: number }', TYPE_METHOD) !== 0) return 'a required method was accepted as optional'
  if (bounded(TYPE_METHOD, TYPE_METHOD) !== 1) return 'the optional method was missed'
  if (bounded('carrier: shippingMethod.carrierName', PASS_CARRIER) !== 0) return 'a longer name was accepted as the carrier'
  if (bounded('estimatedDays: shippingEstimatedDays', PASS_DAYS) !== 0) return 'a different day count was accepted'
  if (bounded(PASS_CARRIER, PASS_CARRIER) !== 1) return 'the carrier copy was missed'
  if (bounded(PASS_DAYS, PASS_DAYS) !== 1) return 'the day copy was missed'
  if (bounded('data.shippingMethodName', READ_METHOD) !== 0) return 'a longer name was accepted as the method'
  if (bounded(INSERT, INSERT) !== 1) return 'the email line was missed'
  if (bounded('const methodLine', INSERT) !== 0) return 'a declaration was accepted as the email line'
  const sample = [
    'const method = data.shippingMethod',
    'const methodLine = method',
    '  ? `<p style="margin:0;">${method.carrier} \u2014 ${method.estimatedDays ?? \'?\'} ${method.estimatedDays === 1 ? \'business day\' : \'business days\'}</p>`',
    '  : ""',
    '${methodLine}',
    'Shipping to:',
  ].join('\n')
  if (bounded(sample, READ_METHOD) !== 1) return 'the email method was not counted'
  if (bounded(sample, LINE) !== 1) return 'the method line was not recognized'
  if (bounded(sample, INSERT) !== 1) return 'the email line was not counted'
  const hyphen = LINE.replace('\u2014', '-')
  if (bounded(sample, hyphen) !== 0) return 'a hyphen line was accepted'
  const text = flat(sample)
  if (!(text.indexOf(INSERT) < text.indexOf('Shipping to:'))) return 'the method was not required before the address'
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
      question: 'The order confirmation email shows the shipping method stored on the order.',
      cases: [
        ['The email can hold that method', () => {
          if (bounded(types, TYPE_METHOD) !== 1) return 'the email has no shipping method'
          return null
        }],
        ['The order email passes that method', () => {
          if (bounded(order, PASS_CARRIER) !== 1) return 'the email does not get the stored carrier'
          if (bounded(order, PASS_DAYS) !== 1) return 'the email does not get the stored day count'
          return null
        }],
        ['The email prints that method before the address', () => {
          if (bounded(email, READ_METHOD) !== 1) return 'the email does not read the shipping method'
          if (bounded(email, LINE) !== 1) return 'the email does not print the carrier and the day words'
          if (bounded(email, INSERT) !== 1) return 'the method line is not in the email'
          const text = flat(email)
          if (!(text.indexOf(INSERT) < text.indexOf('Shipping to:'))) return 'the method is not shown before the address'
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
  console.log('The order confirmation email shows the shipping method stored on the order.')
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
