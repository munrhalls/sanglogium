// The order's phone.
//
// One question. The phone the customer entered is stored on the order. The
// words are written here. A phone field that is only a longer name is not a pass.
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
// node --experimental-strip-types tests/checkout/phone.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const TYPE_FILE = 'features/order/core/types/orderTypes.ts'
const WRITE_FILE = 'features/order/adapters/sanity/createOrderFromPayment.ts'
const TYPE_PHONE = 'phone?: string'
const WRITE_PHONE = 'phone: address.phone'

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
    const after = textFlat[at + text.length] ?? ''
    if (!/[A-Za-z0-9_]/.test(after)) found += 1
    from = at + text.length
  }
  return found
}

function ruler() {
  if (TYPE_PHONE !== 'phone?: string') return 'the phone type was rewritten'
  if (WRITE_PHONE !== 'phone: address.phone') return 'the phone copy was rewritten'
  if (bounded('phone: string', TYPE_PHONE) !== 0) return 'a required phone was accepted as optional'
  if (bounded(TYPE_PHONE, TYPE_PHONE) !== 1) return 'the optional phone was missed'
  if (bounded('phone: address.phoneNumber', WRITE_PHONE) !== 0) return 'a longer name was accepted as the phone'
  if (bounded('phone: address.phone,', WRITE_PHONE) !== 1) return 'the phone copy was missed'
  return null
}

function readShop(file) {
  try {
    return stripComments(readFileSync(path.join(root, file), 'utf8'))
  } catch (error) {
    proofBroken(`cannot read ${file}: ${error.message}`)
  }
}

function groups(typeSource, writeSource) {
  return [
    {
      question: 'The phone the customer entered is stored on the order.',
      cases: [
        ['The order address can hold a phone', () => {
          if (bounded(typeSource, TYPE_PHONE) !== 1) return 'the order address has no phone'
          return null
        }],
        ['The order copies that phone', () => {
          if (bounded(writeSource, WRITE_PHONE) !== 1) return 'the order does not copy the phone'
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
  const typeSource = readShop(TYPE_FILE)
  const writeSource = readShop(WRITE_FILE)
  console.log('The phone on the order is the phone the customer entered.')
  const list = groups(typeSource, writeSource)
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
