// The confirmation email's included tax.
//
// One question. The email shows the included tax the receipt shows. The words
// are written here. The amount is pricing.tax, printed with the grosze helper
// and the words VAT (included), and only when it is greater than zero. A
// divided tax is not a pass. A tax of zero is not shown. The line sits with
// the shipping price, before the delivery window.
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
// node --experimental-strip-types tests/checkout/email-tax.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ORDER_TYPES = 'features/order/core/types/orderTypes.ts'
const ORDER_WRITE = 'features/order/adapters/sanity/createOrderFromPayment.ts'
const EMAIL = 'features/checkout/adapters/resend/orderConfirmationEmail.ts'
const TYPE_TAX = 'tax: number;'
const PASS_TAX = 'tax: pricing.tax,'
const INSERT = '${taxLine}'
const LINE = 'const taxLine = data.tax > 0 ? `<p style="margin:0;">VAT (included) ${formatPrice(data.tax)}</p>` : ""'

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
  if (TYPE_TAX !== 'tax: number;') return 'the tax type was rewritten'
  if (PASS_TAX !== 'tax: pricing.tax,') return 'the tax copy was rewritten'
  if (INSERT !== '${taxLine}') return 'the email line was rewritten'
  if (LINE !== 'const taxLine = data.tax > 0 ? `<p style="margin:0;">VAT (included) ${formatPrice(data.tax)}</p>` : ""') return 'the tax line was rewritten'
  if (!LINE.includes('VAT (included)') || !LINE.includes('data.tax > 0') || !LINE.includes('formatPrice(data.tax)}') || !LINE.includes(': ""')) return 'the tax line lost its name, its check, or its amount'
  if (bounded('tax?: number;', TYPE_TAX) !== 0) return 'an optional tax was accepted'
  if (bounded('shipping: number;', TYPE_TAX) !== 0) return 'the shipping price was accepted as the tax'
  if (bounded(TYPE_TAX, TYPE_TAX) !== 1) return 'the tax type was missed'
  if (bounded('tax: pricing.tax / 100,', PASS_TAX) !== 0) return 'a divided tax was accepted'
  if (bounded('tax: pricing.shipping,', PASS_TAX) !== 0) return 'the shipping price was copied as the tax'
  if (bounded('tax: pricing.taxAmount,', PASS_TAX) !== 0) return 'a longer name was accepted as the tax'
  if (bounded(PASS_TAX, PASS_TAX) !== 1) return 'the tax copy was missed'
  if (bounded('const taxLine', INSERT) !== 0) return 'a declaration was accepted as the email line'
  if (bounded(INSERT, INSERT) !== 1) return 'the email line was missed'
  const divided = 'const taxLine = data.tax > 0 ? `<p style="margin:0;">VAT (included) ${formatPrice(data.tax / 100)}</p>` : ""'
  if (bounded(divided, LINE) !== 0) return 'a divided tax was printed'
  const always = 'const taxLine = `<p style="margin:0;">VAT (included) ${formatPrice(data.tax)}</p>`'
  if (bounded(always, LINE) !== 0) return 'a tax of zero was shown'
  const oldName = 'const taxLine = data.tax > 0 ? `<p style="margin:0;">Tax ${formatPrice(data.tax)}</p>` : ""'
  if (bounded(oldName, LINE) !== 0) return 'the old name was accepted'
  const zeroShows = 'const taxLine = data.tax >= 0 ? `<p style="margin:0;">VAT (included) ${formatPrice(data.tax)}</p>` : ""'
  if (bounded(zeroShows, LINE) !== 0) return 'a tax of zero was accepted'
  if (bounded(LINE, LINE) !== 1) return 'the tax line was missed'
  const sample = [
    '${shippingLine}',
    '${taxLine}',
    '${deliveryLine}',
  ].join('\n')
  const text = flat(sample)
  const shippingAt = text.indexOf('${shippingLine}')
  const taxAt = text.indexOf(INSERT)
  const deliveryAt = text.indexOf('${deliveryLine}')
  if (!(shippingAt >= 0 && shippingAt < taxAt && taxAt < deliveryAt)) return 'the tax was not required with the shipping price'
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
      question: 'The order confirmation email shows the included tax the receipt shows.',
      cases: [
        ['The email can hold that tax', () => {
          if (bounded(types, TYPE_TAX) !== 1) return 'the email has no stored tax'
          return null
        }],
        ['The order email copies the stored tax', () => {
          if (bounded(writer, PASS_TAX) !== 1) return 'the order email does not copy the stored tax'
          return null
        }],
        ['The email prints that tax only when it is greater than zero', () => {
          if (bounded(email, LINE) !== 1) return 'the email does not say the tax is included'
          if (bounded(email, INSERT) !== 1) return 'the email does not print the included tax'
          const text = flat(email)
          const shippingAt = text.indexOf('${shippingLine}')
          const taxAt = text.indexOf(INSERT)
          const deliveryAt = text.indexOf('${deliveryLine}')
          if (!(shippingAt >= 0 && shippingAt < taxAt && taxAt < deliveryAt)) return 'the included tax is not with the shipping price'
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
  console.log('The order confirmation email shows the included tax the receipt shows.')
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
