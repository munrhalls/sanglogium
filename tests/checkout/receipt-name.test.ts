// The receipt's shipping method name.
//
// One question. The receipt shows the shipping method name stored on the
// order. The words are written here. The name sits with the carrier and the
// day count. A carrier in that place is not the name. A hyphen is not the
// receipt dash.
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
// node --experimental-strip-types tests/checkout/receipt-name.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RECEIPT = 'features/checkout/view/ConfirmedOrderDetailsView.tsx'
const NAME = 'order.shippingMethod.name'
const ROW = '({order.shippingMethod.name} \u2014 {order.shippingMethod.carrier} \u2014 {order.shippingMethod.estimatedDays ?? \'?\'}'

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
  if (NAME !== 'order.shippingMethod.name') return 'the method name was rewritten'
  if (ROW !== '({order.shippingMethod.name} \u2014 {order.shippingMethod.carrier} \u2014 {order.shippingMethod.estimatedDays ?? \'?\'}') return 'the name row was rewritten'
  if (!ROW.includes(NAME) || !ROW.includes('order.shippingMethod.carrier') || !ROW.includes('estimatedDays ?? \'?\'')) return 'the name row lost the name, the carrier, or the day count'
  let dashes = 0
  let at = ROW.indexOf('\u2014')
  while (at >= 0) {
    if (ROW.charCodeAt(at) !== 0x2014) return 'the dash was not the receipt dash'
    dashes += 1
    at = ROW.indexOf('\u2014', at + 1)
  }
  if (dashes !== 2) return 'the name row lost a dash'
  if (bounded('order.shippingMethod.nameExtra', NAME) !== 0) return 'a longer name was accepted'
  if (bounded('order.shippingMethod.carrier', NAME) !== 0) return 'the carrier was accepted as the name'
  if (bounded('order.shippingMethodName', NAME) !== 0) return 'the session field was accepted as the name'
  if (bounded(NAME, NAME) !== 1) return 'the method name was missed'
  const oldRow = '({order.shippingMethod.carrier} \u2014 {order.shippingMethod.estimatedDays ?? \'?\'}'
  if (bounded(oldRow, ROW) !== 0) return 'the old row was accepted'
  const hyphen = '({order.shippingMethod.name} - {order.shippingMethod.carrier} - {order.shippingMethod.estimatedDays ?? \'?\'}'
  if (bounded(hyphen, ROW) !== 0) return 'a hyphen was accepted'
  if (bounded(ROW, ROW) !== 1) return 'the name row was missed'
  return null
}

function readShop(file) {
  try {
    return stripComments(readFileSync(path.join(root, file), 'utf8'))
  } catch (error) {
    proofBroken(`cannot read ${file}: ${error.message}`)
  }
}

function groups(receipt) {
  return [
    {
      question: 'The receipt shows the shipping method name stored on the order.',
      cases: [
        ['The receipt prints that name', () => {
          if (bounded(receipt, NAME) !== 1) return 'the receipt does not show the shipping method name'
          return null
        }],
        ['That name is with the carrier and the day count', () => {
          if (bounded(receipt, ROW) !== 1) return 'the shipping method name is not with the carrier'
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
  const receipt = readShop(RECEIPT)
  console.log('The receipt shows the shipping method name stored on the order.')
  const list = groups(receipt)
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
