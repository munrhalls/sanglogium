// The purchase record.
//
// One question. After the bank says the payment succeeded, the purchase record
// names the currency that was charged, PLN, and the amount of that charge.
// The amount is the bank amount in zloty: the grosze divided by 100. 1550
// grosze are 15.5, 1500 grosze are 15, and 1 grosz is 0.01.
//
// A PASS line ended as its sentence says. A NO line did not, and the text after
// NO is what actually happened. A NO is a true answer. Do not edit the sentence
// or the written currency to match the shop.
//
// The currency and the amounts are written here. The shop is not asked to
// grade itself. Nothing here waits, rolls dice, or calls the bank or Sanity.
// The same run twice gives the same answer.
//
// 0 every line passed. 1 one or more lines are NO. 2 the proof itself broke.
//
// node --experimental-strip-types tests/checkout/purchase.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CURRENCY = 'PLN'
const AMOUNTS = [
  [1550, 15.5],
  [1500, 15],
  [1, 0.01],
]

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

function proofBroken(message) {
  const error = new Error(`proof broken: ${message}`)
  error.proofBroken = true
  throw error
}

function isChargedCurrency(currency) {
  return currency === CURRENCY
}

function ruler() {
  if (CURRENCY !== 'PLN' || CURRENCY.includes('USD') || CURRENCY.includes('$')) return 'the written currency is not the charged currency'
  if (isChargedCurrency('USD') || isChargedCurrency('usd') || isChargedCurrency('$')) return 'a dollar currency is called the charged currency'
  if (AMOUNTS.length !== 3) return 'a written amount is missing'
  for (const [grosze, major] of AMOUNTS) {
    if (grosze / 100 !== major) return 'a written amount is not the charged grosze'
  }
  return null
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function read(rel) {
  try {
    return stripComments(readFileSync(path.join(root, rel), 'utf8'))
  } catch (error) {
    proofBroken(`cannot read ${rel}: ${error.message}`)
  }
}

function purchaseObject(code) {
  const at = code.indexOf('gtag(')
  if (at < 0) return null
  const purchaseAt = code.indexOf('purchase', at)
  if (purchaseAt < 0 || purchaseAt - at > 40) return null
  const open = code.indexOf('{', purchaseAt)
  const close = code.indexOf('}', open)
  if (open < 0 || close < 0) proofBroken('the purchase event has no object')
  return code.slice(open, close + 1)
}

function currencyOf(obj) {
  const found = [...obj.matchAll(/currency:\s*(["'])([A-Za-z]+)\1/g)]
  if (found.length !== 1) return null
  return found[0][2]
}

function valueOf(obj) {
  const found = obj.match(/value:\s*([^,\n]+)/)
  return found ? found[1].trim().replace(/\s+/g, '') : null
}

const groups = [
  {
    question: 'The purchase record names the currency that was charged, and the amount of that charge.',
    cases: [
      ['The purchase currency is PLN', () => {
        const code = read('features/checkout/ui/SuccessAnalytics.tsx')
        const obj = purchaseObject(code)
        if (!obj) return 'no purchase is recorded'
        const currency = currencyOf(obj)
        if (currency === CURRENCY) return null
        return currency ? `the purchase names ${currency}` : 'the purchase names no currency'
      }],
      ['The purchase amount is the charged amount in zloty', () => {
        const code = read('features/checkout/ui/SuccessAnalytics.tsx')
        const obj = purchaseObject(code)
        if (!obj) return 'no purchase is recorded'
        const value = valueOf(obj)
        if (value === 'value/100') return null
        return `the purchase amount is ${value ?? 'missing'}`
      }],
      ['The purchase is for this payment', () => {
        const code = read('features/checkout/ui/SuccessAnalytics.tsx')
        const obj = purchaseObject(code)
        if (!obj) return 'no purchase is recorded'
        if (/transaction_id:\s*transactionId\b/.test(obj)) return null
        return 'the purchase is not tied to the payment'
      }],
      ['The confirmed page sends the amount the customer was charged', () => {
        const code = read('features/checkout/view/PaymentConfirmedView.tsx')
        if (!code.includes('formatPrice(amount)')) return 'the screen does not show the charged amount'
        if (!code.includes('transactionId={paymentIntentId}')) return 'the record is not this payment'
        if (!code.includes('value={amount}')) return 'the record is not the charged amount'
        return null
      }],
      ['Only a succeeded payment is recorded', () => {
        const code = read('app/checkout/success/page.tsx')
        const start = code.indexOf("case 'succeeded':")
        const end = code.indexOf('case ', start + 1)
        if (start < 0 || end < start) proofBroken('the success page has no succeeded payment')
        const branch = code.slice(start, end)
        if (!branch.includes('<PaymentConfirmedView') || !branch.includes('amount={result.amount}')) return 'the succeeded page does not send the bank amount'
        const rest = code.slice(0, start) + code.slice(end)
        if (rest.includes('<PaymentConfirmedView')) return 'a payment that did not succeed is recorded'
        return null
      }],
      ['No analytics function sends nothing', () => {
        const code = read('features/checkout/ui/SuccessAnalytics.tsx')
        const at = code.indexOf('gtag(')
        if (at < 0) return 'no purchase is recorded'
        if (code.slice(0, at).includes('.gtag) return')) return null
        return 'a missing analytics function still sends a purchase'
      }],
      ['The purchase is recorded once', () => {
        const code = read('features/checkout/ui/SuccessAnalytics.tsx')
        const setAt = code.indexOf('fired.current = true')
        const callAt = code.indexOf('gtag(')
        if (setAt < 0 || callAt < 0 || setAt > callAt) return 'the purchase can be recorded again'
        if (!code.slice(0, setAt).includes('if (fired.current) return')) return 'the purchase can be recorded again'
        return null
      }],
    ],
  },
]

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
  console.log('The written currency is PLN, and a dollar currency is not a pass.')
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

try {
  process.exit(main())
} catch (error) {
  console.error(error)
  process.exit(2)
}
