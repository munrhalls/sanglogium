// The payment summary.
//
// One question. One delivery day reads "1 business day". Any other count reads
// as that number and "business days". The words are written here. Calling
// "1 business days" one day is not a pass.
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
// node --experimental-strip-types tests/checkout/summary-days.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FILE = 'features/checkout/ui/CheckoutSummary.tsx'
const ONE = "'1 business day'"
const MANY = '`${shippingEstimatedDays} business days`'
const NEEDLE = 'const deliveryEstimate = shippingEstimatedDays ? shippingEstimatedDays === 1 ? ' + ONE + ' : ' + MANY + ' : null'
const OLD = 'const deliveryEstimate = shippingEstimatedDays ? ' + MANY + ' : null'

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

function count(source, text) {
  let found = 0
  let from = 0
  while (from <= source.length) {
    const at = source.indexOf(text, from)
    if (at < 0) return found
    found += 1
    from = at + text.length
  }
  return found
}

function ruler() {
  if (ONE !== "'1 business day'") return 'one day was rewritten'
  if (MANY !== '`${shippingEstimatedDays} business days`') return 'the other days were rewritten'
  if (!NEEDLE.includes(ONE) || !NEEDLE.includes(MANY) || !NEEDLE.includes('=== 1')) return 'the sentence lost a day'
  if (OLD.includes(NEEDLE)) return 'the old line was called one day'
  if (!('1 business days'.includes('1 business day'))) return 'the prefix trap moved'
  if ("'1 business days'".includes(ONE)) return 'one day was accepted as many days'
  const wrong = "shippingEstimatedDays === 1 ? '1 business days' : " + MANY
  if (wrong.includes(NEEDLE)) return 'many days were accepted as one day'
  if (count(NEEDLE, ONE) !== 1) return 'one day was counted twice'
  return null
}

function readSummary() {
  try {
    return stripComments(readFileSync(path.join(root, FILE), 'utf8'))
  } catch (error) {
    proofBroken(`cannot read ${FILE}: ${error.message}`)
  }
}

function groups(source) {
  return [
    {
      question: 'One delivery day on the payment summary is "1 business day". Any other count is that number and "business days".',
      cases: [
        ['One delivery day is "1 business day", and any other count is that number and "business days"', () => {
          if (count(flat(source), NEEDLE) !== 1) return 'one day is not "1 business day"'
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
  const source = readSummary()
  console.log('One day is "1 business day". "1 business days" is not a pass.')
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
