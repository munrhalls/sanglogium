// The payment summary's unit price.
//
// One question. The payment summary shows the unit price the receipt shows.
// The words are written here. The price is the line's unit price, printed with
// the grosze helper and the word each. A line total in that place is not a
// pass. A divided price is not a pass. The line total stays.
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
// node --experimental-strip-types tests/checkout/summary-each.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SUMMARY = 'features/checkout/ui/CheckoutSummary.tsx'
const EACH = '({formatPrice(item.unitPrice)} each)'
const LINE_TOTAL = '{formatPrice(item.lineTotal)}'

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
  if (EACH !== '({formatPrice(item.unitPrice)} each)') return 'the each price was rewritten'
  if (LINE_TOTAL !== '{formatPrice(item.lineTotal)}') return 'the line total was rewritten'
  if (bounded('({formatPrice(item.lineTotal)} each)', EACH) !== 0) return 'a line total was accepted as the unit price'
  if (bounded('({formatPrice(item.unitPrice / 100)} each)', EACH) !== 0) return 'a divided price was accepted'
  if (bounded('({formatPrice(item.unitPriceEach)} each)', EACH) !== 0) return 'a longer name was accepted as the price'
  if (bounded('({formatPriceMajor(item.unitPrice)} each)', EACH) !== 0) return 'the other price helper was accepted'
  if (bounded(EACH, EACH) !== 1) return 'the each price was missed'
  if (bounded('const lineTotal', LINE_TOTAL) !== 0) return 'a declaration was accepted as the line total'
  if (bounded(LINE_TOTAL, LINE_TOTAL) !== 1) return 'the line total was missed'
  return null
}

function readShop(file) {
  try {
    return stripComments(readFileSync(path.join(root, file), 'utf8'))
  } catch (error) {
    proofBroken(`cannot read ${file}: ${error.message}`)
  }
}

function groups(summary) {
  return [
    {
      question: 'The payment summary shows the unit price the receipt shows.',
      cases: [
        ['The summary prints that price, and the line total stays', () => {
          if (bounded(summary, EACH) !== 1) return 'the payment summary does not print the unit price'
          if (bounded(summary, LINE_TOTAL) !== 1) return 'the payment summary does not keep the line total'
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
  const summary = readShop(SUMMARY)
  console.log('The payment summary shows the unit price the receipt shows.')
  const list = groups(summary)
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
