// The payment summary's phone.
//
// One question. The payment summary shows the phone the customer entered. The
// words are written here. A longer name than phone is not a pass.
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
// node --experimental-strip-types tests/checkout/summary-phone.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FILE = 'features/checkout/ui/CheckoutSummary.tsx'
const TYPE_PHONE = 'phone?: string'
const VIEW_PHONE = 'address.phone'

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
  if (TYPE_PHONE !== 'phone?: string') return 'the phone type was rewritten'
  if (VIEW_PHONE !== 'address.phone') return 'the summary phone was rewritten'
  if (bounded('phone: string', TYPE_PHONE) !== 0) return 'a required phone was accepted as optional'
  if (bounded(TYPE_PHONE, TYPE_PHONE) !== 1) return 'the optional phone was missed'
  if (bounded('address.phoneNumber', VIEW_PHONE) !== 0) return 'a longer name was accepted as the phone'
  const shown = '{address.phone && ({address.phone})}'
  if (bounded(shown, VIEW_PHONE) !== 2) return 'the summary phone was not counted twice'
  if (bounded('{address.phone}', VIEW_PHONE) !== 1) return 'one mention was not counted'
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
      question: 'The payment summary shows the phone the customer entered.',
      cases: [
        ['The summary address can hold a phone', () => {
          if (bounded(source, TYPE_PHONE) !== 1) return 'the summary address has no phone'
          return null
        }],
        ['The summary prints that phone', () => {
          if (bounded(source, VIEW_PHONE) !== 2) return 'the summary does not print the phone'
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
  console.log('The payment summary shows the phone the customer entered.')
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
