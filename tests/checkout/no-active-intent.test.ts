// A return whose payment this session does not have.
//
// One question. A payment this session does not have says no payment was
// confirmed. The return already sends that visit to
// /basket?error=no_active_intent. The basket already says that sentence for a
// missing payment. It does not say it for this one. The same refusal is the
// sentence. A mismatched payment stays silent. A normal basket is not a pass.
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
// node --experimental-strip-types tests/checkout/no-active-intent.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RETURN = 'features/checkout/commands/handlePaymentReturn.ts'
const PAGE = 'app/(store)/basket/page.tsx'
const NOTICE = 'features/checkout/ui/BasketUnconfirmedRefusal.tsx'
const REDIRECT = 'redirect("/basket?error=no_active_intent")'
const GATE = '{error === "no_active_intent" ? <BasketUnconfirmedRefusal /> : null}'
const KEPT = '{error === "missing_intent" ? <BasketUnconfirmedRefusal /> : null}'
const SENTENCE = 'No payment was confirmed.'

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
  if (REDIRECT !== 'redirect("/basket?error=no_active_intent")') return 'the redirect was rewritten'
  if (GATE !== '{error === "no_active_intent" ? <BasketUnconfirmedRefusal /> : null}') return 'the gate was rewritten'
  if (KEPT !== '{error === "missing_intent" ? <BasketUnconfirmedRefusal /> : null}') return 'the kept gate was rewritten'
  if (SENTENCE !== 'No payment was confirmed.') return 'the sentence was rewritten'
  if (bounded('redirect("/basket?error=no_active_intent_extra")', REDIRECT) !== 0) return 'a longer code was accepted'
  if (bounded("redirect('/basket?error=no_active_intent')", REDIRECT) !== 0) return 'the other quotes were accepted'
  if (bounded(REDIRECT, REDIRECT) !== 1) return 'the redirect was missed'
  if (bounded('{error === "no_active_intent_extra" ? <BasketUnconfirmedRefusal /> : null}', GATE) !== 0) return 'a longer code was accepted'
  if (bounded('{error === "intent_mismatch" ? <BasketUnconfirmedRefusal /> : null}', GATE) !== 0) return 'a mismatched payment was accepted'
  if (bounded(KEPT, GATE) !== 0) return 'a missing payment was accepted as this one'
  if (bounded(GATE, GATE) !== 1) return 'the gate was missed'
  if (bounded(KEPT, KEPT) !== 1) return 'the kept gate was missed'
  if (bounded('No payment was confirmed', SENTENCE) !== 0) return 'a fragment was accepted as the sentence'
  if (bounded(SENTENCE, SENTENCE) !== 1) return 'the sentence was missed'
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

function groups(handler, page, notice) {
  return [
    {
      question: 'A payment this session does not have says no payment was confirmed.',
      cases: [
        ['The return sends that payment to the basket', () => {
          if (bounded(handler, REDIRECT) !== 1) return 'the return does not send that payment to the basket'
          return null
        }],
        ['The page shows the same refusal for that return', () => {
          if (bounded(page, SENTENCE) !== 0) return 'the basket says that on every visit'
          if (bounded(page, KEPT) !== 1) return 'the missing-payment refusal was dropped'
          if (bounded(page, GATE) !== 1) return 'the basket does not show the refusal for a payment this session does not have'
          return null
        }],
        ['The refusal still says no payment was confirmed', () => {
          if (bounded(notice, SENTENCE) !== 1) return 'the refusal does not say no payment was confirmed'
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
  const notice = readShop(NOTICE)
  if (handler === '') {
    console.log('proof broken: the return is missing')
    return 2
  }
  if (page === '') {
    console.log('proof broken: the basket page is missing')
    return 2
  }
  if (notice === '') {
    console.log('proof broken: the refusal is missing')
    return 2
  }
  console.log('A payment this session does not have says no payment was confirmed.')
  const list = groups(handler, page, notice)
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
