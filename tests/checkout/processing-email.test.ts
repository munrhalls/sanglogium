// The processing screen's email promise.
//
// One question. The processing screen does not promise an email. It says the
// payment is processing. It also says a confirmation will be emailed once the
// bank settles. The shop has no customer address to send that email to. The
// promise has to go. The processing heading stays.
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
// node --experimental-strip-types tests/checkout/processing-email.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCREEN = 'features/checkout/ui/payment-status/PaymentProcessing.tsx'
const PROMISE = 'email a confirmation once settled'
const HEADING = 'Payment is processing'

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

function promiseFinding(source) {
  if (bounded(source, PROMISE) !== 0) return 'the processing screen promises an email'
  return null
}

function ruler() {
  if (PROMISE !== 'email a confirmation once settled') return 'the promise was rewritten'
  if (HEADING !== 'Payment is processing') return 'the heading was rewritten'
  if (bounded('email a confirmation once settledExtra', PROMISE) !== 0) return 'a longer promise was accepted'
  if (bounded(PROMISE, PROMISE) !== 1) return 'the promise was missed'
  if (bounded(HEADING, HEADING) !== 1) return 'the heading was missed'
  if (promiseFinding(`<p>We'll ${PROMISE}.</p>`) !== 'the processing screen promises an email') return 'a promise was missed'
  if (promiseFinding(`<p>We&apos;ll ${PROMISE}.</p>`) !== 'the processing screen promises an email') return 'an escaped promise was missed'
  if (promiseFinding(`<h1>${HEADING}</h1>`) !== null) return 'the heading was called a promise'
  if (promiseFinding(stripComments(`// ${PROMISE}\n<h1>${HEADING}</h1>`)) !== null) return 'a comment was called a promise'
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

function groups(screen) {
  return [
    {
      question: 'The processing screen does not promise an email.',
      cases: [
        ['It does not say an email will be sent', () => promiseFinding(screen)],
        ['It still says the payment is processing', () => {
          if (bounded(screen, HEADING) !== 1) return 'the processing screen does not say the payment is processing'
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
  const screen = readShop(SCREEN)
  if (screen === '') {
    console.log('proof broken: the processing screen is missing')
    return 2
  }
  console.log('The processing screen does not promise an email.')
  const list = groups(screen)
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
