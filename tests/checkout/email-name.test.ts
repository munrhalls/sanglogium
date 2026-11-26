// The confirmation email's shipping method name.
//
// One question. The email shows the shipping method name the receipt shows.
// The words are written here. The name is the stored shipping method name.
// A missing name adds no line. The name comes before the carrier line. The
// carrier line stays.
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
// node --experimental-strip-types tests/checkout/email-name.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ORDER_TYPES = 'features/order/core/types/orderTypes.ts'
const ORDER_WRITE = 'features/order/adapters/sanity/createOrderFromPayment.ts'
const EMAIL = 'features/checkout/adapters/resend/orderConfirmationEmail.ts'
const TYPE_NAME = 'methodName?: string;'
const PASS_NAME = 'methodName: shippingMethod.name'
const INSERT = '${nameLine}'
const METHOD = '${methodLine}'
const LINE = 'const nameLine = data.methodName ? `<p style="margin:0;">${data.methodName}</p>` : ""'

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

function nameBeforeMethod(source) {
  const text = flat(source)
  const nameAt = text.indexOf(INSERT)
  const methodAt = text.indexOf(METHOD)
  return nameAt >= 0 && methodAt >= 0 && nameAt < methodAt
}

function ruler() {
  if (TYPE_NAME !== 'methodName?: string;') return 'the name type was rewritten'
  if (PASS_NAME !== 'methodName: shippingMethod.name') return 'the name copy was rewritten'
  if (INSERT !== '${nameLine}') return 'the email line was rewritten'
  if (METHOD !== '${methodLine}') return 'the carrier line was rewritten'
  if (LINE !== 'const nameLine = data.methodName ? `<p style="margin:0;">${data.methodName}</p>` : ""') return 'the name line was rewritten'
  if (!LINE.includes('data.methodName') || !LINE.includes(': ""')) return 'the name line lost its check'
  if (bounded('methodName: string;', TYPE_NAME) !== 0) return 'a required name was accepted'
  if (bounded('shippingMethod?: { carrier: string; estimatedDays?: number }', TYPE_NAME) !== 0) return 'the carrier type was accepted as the name'
  if (bounded(TYPE_NAME, TYPE_NAME) !== 1) return 'the name type was missed'
  if (bounded('methodName: shippingMethod.nameExtra', PASS_NAME) !== 0) return 'a longer name was accepted'
  if (bounded('methodName: shippingMethod.carrier', PASS_NAME) !== 0) return 'the carrier was copied as the name'
  if (bounded('name: shippingMethod.name', PASS_NAME) !== 0) return 'a shorter field was accepted as the name'
  if (bounded(PASS_NAME, PASS_NAME) !== 1) return 'the name copy was missed'
  if (bounded('const nameLine', INSERT) !== 0) return 'a declaration was accepted as the email line'
  if (bounded(INSERT, INSERT) !== 1) return 'the email line was missed'
  const always = 'const nameLine = `<p style="margin:0;">${data.methodName}</p>`'
  if (bounded(always, LINE) !== 0) return 'a missing name was shown'
  const address = 'const nameLine = data.methodName ? `<p style="margin:0;">${shippingAddress.name}</p>` : ""'
  if (bounded(address, LINE) !== 0) return 'the recipient name was accepted as the method name'
  if (bounded(LINE, LINE) !== 1) return 'the name line was missed'
  const early = '${nameLine}\n${methodLine}'
  const late = '${methodLine}\n${nameLine}'
  if (!nameBeforeMethod(early)) return 'a name before the carrier was missed'
  if (nameBeforeMethod(late)) return 'a name after the carrier was accepted'
  return null
}

function readShop(file) {
  try {
    return stripComments(readFileSync(path.join(root, file), 'utf8'))
  } catch (error) {
    proofBroken(`cannot read ${file}: ${error.message}`)
  }
}

function groups(types, writer, email) {
  return [
    {
      question: 'The order confirmation email shows the shipping method name the receipt shows.',
      cases: [
        ['The email can hold that name', () => {
          if (bounded(types, TYPE_NAME) !== 1) return 'the email has no shipping method name'
          return null
        }],
        ['The order email copies the stored name', () => {
          if (bounded(writer, PASS_NAME) !== 1) return 'the order email does not copy the stored name'
          return null
        }],
        ['The email prints that name before the carrier', () => {
          if (bounded(email, LINE) !== 1) return 'the email does not print the shipping method name'
          if (bounded(email, INSERT) !== 1) return 'the shipping method name is not in the email'
          if (bounded(email, METHOD) !== 1) return 'the email does not keep the carrier line'
          if (!nameBeforeMethod(email)) return 'the name is not with the carrier'
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
  const writer = readShop(ORDER_WRITE)
  const email = readShop(EMAIL)
  console.log('The order confirmation email shows the shipping method name the receipt shows.')
  const list = groups(types, writer, email)
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
