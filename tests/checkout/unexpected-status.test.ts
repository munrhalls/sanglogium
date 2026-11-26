// The return from an unexpected payment status.
//
// One question. An unexpected payment status opens the unexpected result.
// The result page already shows that status. The return from payment still
// sends the customer to the basket, in the early redirect and in the later
// return. Both have to open the result. A normal basket is not a pass.
//
// A PASS line ended as its sentence says. A NO line did not, and the text after
// NO is what actually happened. A NO is a true answer. Do not edit the sentence
// to match the shop.
//
// Nothing here waits, rolls dice, or calls the bank. The same run twice gives
// the same answer.
//
// 0 every line passed. 1 one or more lines are NO. 2 the proof itself broke.
//
// node --experimental-strip-types tests/checkout/unexpected-status.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RETURN = 'features/checkout/commands/handlePaymentReturn.ts'
const PAGE = 'app/checkout/success/page.tsx'
const OPEN = 'redirect(`/checkout/success?payment_intent=${payment.id}`)'
const AGAIN = 'return `/checkout/success?payment_intent=${payment.id}`'
const BASKET = '/basket?error=unexpected_status'
const SCREEN = '<PaymentUnexpectedStatus paymentIntentId={result.paymentIntentId} />'

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
  if (OPEN !== 'redirect(`/checkout/success?payment_intent=${payment.id}`)') return 'the open was rewritten'
  if (AGAIN !== 'return `/checkout/success?payment_intent=${payment.id}`') return 'the return was rewritten'
  if (BASKET !== '/basket?error=unexpected_status') return 'the basket code was rewritten'
  if (SCREEN !== '<PaymentUnexpectedStatus paymentIntentId={result.paymentIntentId} />') return 'the screen was rewritten'
  if (bounded('redirect(`/checkout/success?payment_intent=${payment.idExtra}`)', OPEN) !== 0) return 'a longer id was accepted'
  if (bounded('return `/checkout/success?payment_intent=${payment.idExtra}`', AGAIN) !== 0) return 'a longer id was accepted'
  if (bounded('return `/checkout/success?payment_intent=${payment.id}&status=failed`', AGAIN) !== 0) return 'a known status was accepted'
  if (bounded('/basket?error=unexpected_status_extra', BASKET) !== 0) return 'a longer basket code was accepted'
  if (bounded('<PaymentUnexpectedStatusExtra paymentIntentId={result.paymentIntentId} />', SCREEN) !== 0) return 'a longer screen was accepted'
  if (bounded(OPEN, OPEN) !== 1) return 'the open was missed'
  if (bounded(AGAIN, AGAIN) !== 1) return 'the return was missed'
  if (bounded(BASKET, BASKET) !== 1) return 'the basket code was missed'
  if (bounded(SCREEN, SCREEN) !== 1) return 'the screen was missed'
  return null
}

function readShop(file) {
  try {
    return stripComments(readFileSync(path.join(root, file), 'utf8'))
  } catch (error) {
    if (error && error.code === 'ENOENT') return ''
    proofBroken(`cannot read ${file}: ${error.message}`)
  }
}

function groups(handler, page) {
  return [
    {
      question: 'An unexpected payment status opens the unexpected result.',
      cases: [
        ['The return opens that result', () => {
          if (bounded(handler, OPEN) !== 1 || bounded(handler, AGAIN) !== 2) return 'the return does not open the result'
          return null
        }],
        ['An unexpected status does not open the basket', () => {
          if (bounded(handler, BASKET) !== 0) return 'the unexpected status still opens the basket'
          return null
        }],
        ['The result page shows that status', () => {
          if (bounded(page, SCREEN) !== 1) return 'the result page does not show the unexpected status'
          return null
        }],
      ],
    },
  ]
}

function brokenFinding(error) {
  if (error?.proofBroken) return error.message
  if (String(error?.message ?? '').startsWith('proof broken:')) return error.message
  return `proof broken: ${error?.message ?? error}`
}

function main() {
  const broken = ruler()
  if (broken) {
    console.log(`proof broken: ${broken}`)
    return 2
  }
  const handler = readShop(RETURN)
  const page = readShop(PAGE)
  if (handler === '') {
    console.log('proof broken: the return is missing')
    return 2
  }
  if (page === '') {
    console.log('proof broken: the result page is missing')
    return 2
  }
  console.log('An unexpected payment status opens the unexpected result.')
  const list = groups(handler, page)
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
