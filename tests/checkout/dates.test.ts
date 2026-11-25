// The receipt dates.
//
// One question. The order date and the delivery dates speak English, the
// language of the checkout page. This machine writes the English long date
// "November 25, 2026" and the English month and day "November 25". The Polish
// locale writes "25 listopada 2026" and "25 listopada". A Polish date is not a pass.
//
// A PASS line ended as its sentence says. A NO line did not, and the text after
// NO is what actually happened. A NO is a true answer. Do not edit the sentence
// to match the shop.
//
// Nothing here waits, rolls dice, or asks the clock. The same run twice gives
// the same answer.
//
// 0 every line passed. 1 one or more lines are NO. 2 the proof itself broke.
//
// node --experimental-strip-types tests/checkout/dates.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FILE = 'features/checkout/view/ConfirmedOrderDetailsView.tsx'
const ENGLISH_ORDER = 'November 25, 2026'
const ENGLISH_DAY = 'November 25'
const POLISH_ORDER = '25 listopada 2026'
const POLISH_DAY = '25 listopada'
const ORDER_CALL = "toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})"
const ORDER_CALL_DOUBLE = 'toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})'
const DAY_CALL = "toLocaleDateString('en-US',{month:'long',day:'numeric'})"
const DAY_CALL_DOUBLE = 'toLocaleDateString("en-US",{month:"long",day:"numeric"})'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

function proofBroken(message) {
  const error = new Error(`proof broken: ${message}`)
  error.proofBroken = true
  throw error
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function compact(source) {
  return source.replace(/\s+/g, '')
}

function orderDate(source) {
  return source.includes(ORDER_CALL) || source.includes(ORDER_CALL_DOUBLE)
}

function deliveryDate(source) {
  return source.includes(DAY_CALL) || source.includes(DAY_CALL_DOUBLE)
}

function countCalls(source) {
  let found = 0
  let from = 0
  while (from <= source.length) {
    const at = source.indexOf('toLocaleDateString', from)
    if (at < 0) return found
    found += 1
    from = at + 'toLocaleDateString'.length
  }
  return found
}

function ruler() {
  if (ENGLISH_ORDER !== 'November 25, 2026' || ENGLISH_DAY !== 'November 25') return 'the written English date was rewritten'
  if (POLISH_ORDER !== '25 listopada 2026' || POLISH_DAY !== '25 listopada') return 'the written Polish date was rewritten'
  if (ENGLISH_ORDER === POLISH_ORDER || ENGLISH_DAY === POLISH_DAY) return 'a Polish date was called English'
  if (ENGLISH_ORDER.includes('listopada') || ENGLISH_DAY.includes('listopada')) return 'the written English date is Polish'
  const order = compact(ORDER_CALL)
  const day = compact(DAY_CALL)
  const polishOrder = compact("toLocaleDateString('pl-PL',{year:'numeric',month:'long',day:'numeric'})")
  const polishDay = compact("toLocaleDateString('pl-PL',{month:'long',day:'numeric'})")
  const numeric = compact("toLocaleDateString('en-US',{year:'numeric',month:'numeric',day:'numeric'})")
  if (!orderDate(order) || orderDate(polishOrder) || orderDate(day) || orderDate(numeric)) return 'the order date check accepts the wrong call'
  if (!deliveryDate(day) || deliveryDate(polishDay) || deliveryDate(order)) return 'the delivery date check accepts the wrong call'
  if (countCalls(order + day) !== 2) return 'the two date calls were not both counted'
  return null
}

function readReceipt() {
  try {
    return compact(stripComments(readFileSync(path.join(root, FILE), 'utf8')))
  } catch (error) {
    proofBroken(`cannot read ${FILE}: ${error.message}`)
  }
}

function groups(source) {
  return [
    {
      question: 'The receipt dates speak English, the language of the checkout page.',
      cases: [
        ['The order date is the English long date', () => {
          if (!orderDate(source)) return 'the order date is not English'
          return null
        }],
        ['The delivery dates are the English month and day', () => {
          if (!deliveryDate(source)) return 'the delivery date is not English'
          return null
        }],
        ['A Polish date is not used', () => {
          if (source.includes('pl-PL')) return 'the receipt uses a Polish date'
          if (countCalls(source) !== 2) return 'the receipt formats a date it should not'
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
  const source = readReceipt()
  console.log('The receipt dates are English. A Polish date is not a pass.')
  const list = groups(source)
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
