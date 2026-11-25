// The price on the screen.
//
// One question. The text the customer reads for a checkout price is the
// currency the shop charges, which is PLN. The page language is English, so
// the number keeps the English format. 1550 grosze and 15.5 zloty are the same
// money and the same text. 1500 grosze is a whole amount and hides the grosze.
// 1 grosz shows both digits.
//
// A PASS line ended as its sentence says. A NO line did not, and the text after
// NO is what actually happened. A NO is a true answer. Do not edit the sentence
// or the written text to match the shop.
//
// The text is written here. The shop is not asked to grade itself. Nothing
// here waits, rolls dice, or calls the carrier, the bank, or Sanity. The same
// run twice gives the same answer.
//
// 0 every line passed. 1 one or more lines are NO. 2 the proof itself broke.
//
// node --experimental-strip-types --import ./tools/alias-loader.mjs tests/checkout/display.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { formatPrice, formatPriceMajor } from '@/platform/utils/price'

const READ = {
  grosze1550: 'PLN\u00a015.5',
  grosze1500: 'PLN\u00a015',
  grosze1: 'PLN\u00a00.01',
  zloty15_5: 'PLN\u00a015.5',
  zloty9: 'PLN\u00a09',
}

const SCREENS = [
  ['features/checkout/ui/CheckoutSummary.tsx', 'formatPrice('],
  ['features/checkout/ui/PaymentForm.tsx', 'formatPrice('],
  ['features/checkout/ui/ShippingStep.tsx', 'formatPriceMajor('],
  ['features/checkout/view/PaymentConfirmedView.tsx', 'formatPrice('],
  ['features/checkout/view/ConfirmedOrderDetailsView.tsx', 'formatPrice('],
  ['features/checkout/adapters/resend/orderConfirmationEmail.ts', 'formatPrice('],
]

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

function proofBroken(message) {
  const error = new Error(`proof broken: ${message}`)
  error.proofBroken = true
  throw error
}

function isWritten(text) {
  return text === READ.grosze1550 || text === READ.grosze1500 || text === READ.grosze1 || text === READ.zloty9
}

function ruler() {
  const values = Object.values(READ)
  if (values.length !== 5) return 'a written price is missing'
  for (const text of values) {
    if (!text.startsWith('PLN\u00a0') || text.includes('$') || text.includes('USD')) return 'a written price names the wrong currency'
  }
  if (READ.grosze1550 !== 'PLN\u00a015.5') return '1550 grosze are not written as PLN 15.5'
  if (READ.grosze1500 !== 'PLN\u00a015') return '1500 grosze are not written as PLN 15'
  if (READ.grosze1 !== 'PLN\u00a00.01') return '1 grosz is not written as PLN 0.01'
  if (READ.zloty15_5 !== READ.grosze1550) return '15.5 zloty is not the same text as 1550 grosze'
  if (READ.zloty9 !== 'PLN\u00a09') return '9 zloty are not written as PLN 9'
  if (READ.grosze1500.includes('.')) return 'a whole zloty shows grosze'
  if (isWritten('$15.5') || isWritten('$15') || isWritten('$0.01') || isWritten('$9')) return 'a dollar string is called a written price'
  if (isWritten('PLN 15.5') || isWritten('15,5\u00a0zł')) return 'a different format is called the written price'
  if (SCREENS.length !== 6) return 'a checkout price screen is missing'
  const seen = new Set()
  for (const [file, helper] of SCREENS) {
    if (seen.has(file)) return 'a checkout price screen is listed twice'
    seen.add(file)
    if (helper !== 'formatPrice(' && helper !== 'formatPriceMajor(') return 'a screen helper is not the price helper'
  }
  return null
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function screenFinding(file, helper) {
  let source
  try {
    source = readFileSync(path.join(root, file), 'utf8')
  } catch (error) {
    proofBroken(`cannot read ${file}: ${error.message}`)
  }
  const code = stripComments(source)
  const imported = code.includes('from "@/platform/utils/price"') || code.includes("from '@/platform/utils/price'")
  if (!imported) return 'does not use the price helper'
  const other = helper === 'formatPrice(' ? 'formatPriceMajor(' : 'formatPrice('
  if (!code.includes(helper)) return 'does not format the price with the helper for its unit'
  if (code.includes(other)) return 'formats the price with the other unit'
  const bare = code.replaceAll('${', '')
  if (bare.includes('$') || bare.includes('USD')) return 'names dollars'
  return null
}

function wrote(actual) {
  return `wrote ${JSON.stringify(actual)}`
}

const groups = [
  {
    question: 'The price the customer reads is the currency they are charged.',
    cases: [
      ['1550 grosze read as PLN 15.5', () => {
        const actual = formatPrice(1550)
        return actual === READ.grosze1550 ? null : wrote(actual)
      }],
      ['1500 grosze read as PLN 15', () => {
        const actual = formatPrice(1500)
        return actual === READ.grosze1500 ? null : wrote(actual)
      }],
      ['1 grosz reads as PLN 0.01', () => {
        const actual = formatPrice(1)
        return actual === READ.grosze1 ? null : wrote(actual)
      }],
      ['15.5 zloty read as PLN 15.5', () => {
        const actual = formatPriceMajor(15.5)
        return actual === READ.zloty15_5 ? null : wrote(actual)
      }],
      ['9 zloty read as PLN 9', () => {
        const actual = formatPriceMajor(9)
        return actual === READ.zloty9 ? null : wrote(actual)
      }],
      ['1550 grosze and 15.5 zloty read as the same price', () => {
        const grosze = formatPrice(1550)
        const zloty = formatPriceMajor(15.5)
        if (grosze === READ.grosze1550 && zloty === READ.zloty15_5) return null
        return `grosze wrote ${JSON.stringify(grosze)} and zloty wrote ${JSON.stringify(zloty)}`
      }],
      ['900 grosze and 9 zloty read as the same price', () => {
        const grosze = formatPrice(900)
        const zloty = formatPriceMajor(9)
        if (grosze === READ.zloty9 && zloty === READ.zloty9) return null
        return `grosze wrote ${JSON.stringify(grosze)} and zloty wrote ${JSON.stringify(zloty)}`
      }],
    ],
  },
  {
    question: 'The checkout text that shows a price uses that reading and does not name dollars.',
    cases: SCREENS.map(([file, helper]) => [file, () => screenFinding(file, helper)]),
  },
]

function brokenFinding(error) {
  if (error?.proofBroken) return error.message
  return `proof broken: ${error?.message ?? error}`
}

async function main() {
  const broken = ruler()
  if (broken) {
    console.log(broken.startsWith('proof broken') ? broken : `proof broken: ${broken}`)
    return 2
  }
  console.log('The written prices name PLN, and a dollar string is not a pass.')
  if (groups.some((group) => group.cases.length === 0)) {
    console.log('proof broken: a question has no cases')
    return 2
  }
  const results = []
  let broke = false
  for (const group of groups) {
    for (const [name, run] of group.cases) {
      try {
        const finding = run()
        results.push({ question: group.question, name, finding })
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

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error)
    process.exit(2)
  },
)
