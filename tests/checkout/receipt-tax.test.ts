// The receipt's tax row.
//
// One question. The receipt says the tax is included. The payment summary
// already names that amount "VAT (included)". The words are written here.
// The receipt shows the stored tax only when it is greater than zero, with
// the grosze helper. A different name is not a pass. A divided tax is not
// a pass. A tax row that is always shown is not a pass.
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
// node --experimental-strip-types tests/checkout/receipt-tax.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SUMMARY = 'features/checkout/ui/CheckoutSummary.tsx'
const RECEIPT = 'features/checkout/view/ConfirmedOrderDetailsView.tsx'
const LABEL = 'VAT (included)'
const GUARD = 'order.pricing.tax > 0 &&'
const AMOUNT = 'formatPrice(order.pricing.tax)}'
const ROW = '>VAT (included)</span> <span className="type-price">{formatPrice(order.pricing.tax)}</span>'

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
  if (LABEL !== 'VAT (included)') return 'the included name was rewritten'
  if (GUARD !== 'order.pricing.tax > 0 &&') return 'the tax check was rewritten'
  if (AMOUNT !== 'formatPrice(order.pricing.tax)}') return 'the stored tax was rewritten'
  if (!ROW.includes(LABEL) || !ROW.includes(AMOUNT)) return 'the tax row lost its name or its amount'
  if (bounded('Tax', LABEL) !== 0) return 'the old name was accepted'
  if (bounded('Tax (included)', LABEL) !== 0) return 'a different included name was accepted'
  if (bounded('VAT (included extra)', LABEL) !== 0) return 'a longer name was accepted'
  if (bounded(LABEL, LABEL) !== 1) return 'the included name was missed'
  if (bounded('order.pricing.tax >= 0 &&', GUARD) !== 0) return 'a tax of zero was accepted'
  if (bounded('order.pricing.tax > 0.5 &&', GUARD) !== 0) return 'a different tax check was accepted'
  if (bounded(GUARD, GUARD) !== 1) return 'the tax check was missed'
  if (bounded('formatPrice(order.pricing.tax / 100)}', AMOUNT) !== 0) return 'a divided tax was accepted'
  if (bounded('formatPrice(order.pricing.taxExtra)}', AMOUNT) !== 0) return 'a longer name was accepted as the tax'
  if (bounded(AMOUNT, AMOUNT) !== 1) return 'the stored tax was missed'
  const oldRow = '>Tax</span> <span className="type-price">{formatPrice(order.pricing.tax)}</span>'
  if (bounded(oldRow, ROW) !== 0) return 'the old tax row was accepted'
  const longer = '>VAT (included tax)</span> <span className="type-price">{formatPrice(order.pricing.tax)}</span>'
  if (bounded(longer, ROW) !== 0) return 'a longer row was accepted'
  const divided = '>VAT (included)</span> <span className="type-price">{formatPrice(order.pricing.tax / 100)}</span>'
  if (bounded(divided, ROW) !== 0) return 'a divided tax row was accepted'
  if (bounded(ROW, ROW) !== 1) return 'the tax row was missed'
  return null
}

function readShop(file) {
  try {
    return stripComments(readFileSync(path.join(root, file), 'utf8'))
  } catch (error) {
    proofBroken(`cannot read ${file}: ${error.message}`)
  }
}

function groups(summary, receipt) {
  return [
    {
      question: 'The receipt says the tax is included.',
      cases: [
        ['The payment summary already names this amount', () => {
          if (bounded(summary, LABEL) !== 1) return 'the payment summary does not name the included tax'
          return null
        }],
        ['The receipt shows that tax only when it is greater than zero', () => {
          if (bounded(receipt, GUARD) !== 1) return 'the receipt does not check the tax'
          if (bounded(receipt, AMOUNT) !== 1) return 'the receipt does not print the stored tax'
          return null
        }],
        ['The receipt names that tax the way the payment summary does', () => {
          if (bounded(receipt, ROW) !== 1) return 'the receipt does not say the tax is included'
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
  const receipt = readShop(RECEIPT)
  console.log('The receipt says the tax is included.')
  const list = groups(summary, receipt)
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
