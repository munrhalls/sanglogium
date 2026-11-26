// The confirmation email's shipping price and its total.
//
// One question. The email states the shipping price before the total. The
// shipping price is part of the total. The words are written here. The price
// stays the stored shipping price, printed with the grosze helper. A divided
// price is not a pass. The column heading Total is not the total.
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
// node --experimental-strip-types tests/checkout/email-sum.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const EMAIL = 'features/checkout/adapters/resend/orderConfirmationEmail.ts'
const LINE = 'const shippingLine = `<p style="margin:0;">Shipping ${formatPrice(shipping)}</p>`'
const INSERT = '${shippingLine}'
const TOTAL = '<strong>Total:</strong> ${formatPrice(total)}'

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

function priceBeforeTotal(source) {
  const text = flat(source)
  const priceAt = text.indexOf(INSERT)
  const totalAt = text.indexOf('<strong>Total:</strong>')
  return priceAt >= 0 && totalAt >= 0 && priceAt < totalAt
}

function ruler() {
  if (LINE !== 'const shippingLine = `<p style="margin:0;">Shipping ${formatPrice(shipping)}</p>`') return 'the shipping line was rewritten'
  if (INSERT !== '${shippingLine}') return 'the email line was rewritten'
  if (TOTAL !== '<strong>Total:</strong> ${formatPrice(total)}') return 'the total was rewritten'
  if (bounded('const shippingLine', INSERT) !== 0) return 'a declaration was accepted as the email line'
  if (bounded(INSERT, INSERT) !== 1) return 'the email line was missed'
  const divided = 'const shippingLine = `<p style="margin:0;">Shipping ${formatPrice(shipping / 100)}</p>`'
  if (bounded(divided, LINE) !== 0) return 'a divided price was printed'
  if (bounded(LINE, LINE) !== 1) return 'the shipping line was missed'
  if (bounded('>Total</th>', TOTAL) !== 0) return 'the column heading was accepted as the total'
  if (bounded('<strong>Total:</strong> ${formatPrice(total / 100)}', TOTAL) !== 0) return 'a divided total was accepted'
  if (bounded('<strong>Total:</strong> ${formatPrice(totalAmount)}', TOTAL) !== 0) return 'a longer name was accepted as the total'
  if (bounded(TOTAL, TOTAL) !== 1) return 'the total was missed'
  const early = '${shippingLine}\n<strong>Total:</strong> ${formatPrice(total)}'
  const late = '<strong>Total:</strong> ${formatPrice(total)}\n${shippingLine}'
  const headingFirst = '>Total</th>\n${shippingLine}\n<strong>Total:</strong> ${formatPrice(total)}'
  if (!priceBeforeTotal(early)) return 'a price before the total was missed'
  if (priceBeforeTotal(late)) return 'a price after the total was accepted'
  if (!priceBeforeTotal(headingFirst)) return 'the column heading hid a price that comes first'
  return null
}

function readShop(file) {
  try {
    return stripComments(readFileSync(path.join(root, file), 'utf8'))
  } catch (error) {
    proofBroken(`cannot read ${file}: ${error.message}`)
  }
}

function groups(email) {
  return [
    {
      question: 'The order confirmation email states the shipping price before the total.',
      cases: [
        ['The email still prints the stored shipping price', () => {
          if (bounded(email, LINE) !== 1) return 'the email does not print the shipping price'
          return null
        }],
        ['That price comes before the total', () => {
          if (bounded(email, TOTAL) !== 1) return 'the email does not state the total'
          if (bounded(email, INSERT) !== 1) return 'the shipping price is not in the email'
          if (!priceBeforeTotal(email)) return 'the shipping price is stated after the total'
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
  const email = readShop(EMAIL)
  console.log('The order confirmation email states the shipping price before the total.')
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
