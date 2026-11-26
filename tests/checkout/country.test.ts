// The order's address.
//
// One question. The customer's country code is the order's country. That same
// code is not also stored as a state. The words are written here. A copied
// state is not a pass.
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
// node --experimental-strip-types tests/checkout/country.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FILE = 'features/order/adapters/sanity/createOrderFromPayment.ts'
const COUNTRY = 'country: address.regionCode'
const STATE = 'state: address.regionCode'
const CITY = 'city: address.city'
const POSTAL = 'postalCode: address.postalCode'

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

function count(source, text) {
  let found = 0
  let from = 0
  while (from <= source.length) {
    const at = source.indexOf(text, from)
    if (at < 0) return found
    found += 1
    from = at + text.length
  }
  return found
}

function countryOnce(source) {
  const text = flat(source)
  return count(text, COUNTRY) === 1
    && count(text, STATE) === 0
    && count(text, CITY) === 1
    && count(text, POSTAL) === 1
}

function ruler() {
  if (COUNTRY !== 'country: address.regionCode') return 'the country was rewritten'
  if (STATE !== 'state: address.regionCode') return 'the state was rewritten'
  const old = 'city: address.city, state: address.regionCode, postalCode: address.postalCode, country: address.regionCode'
  const next = 'city: address.city, postalCode: address.postalCode, country: address.regionCode'
  if (countryOnce(old)) return 'a copied state was called a country'
  if (!countryOnce(next)) return 'the country was lost'
  if (!old.includes(STATE)) return 'the copied state left the ruler'
  if (next.includes(STATE)) return 'the next address still copies the state'
  return null
}

function readOrder() {
  try {
    return stripComments(readFileSync(path.join(root, FILE), 'utf8'))
  } catch (error) {
    proofBroken(`cannot read ${FILE}: ${error.message}`)
  }
}

function groups(source) {
  return [
    {
      question: 'The order\'s country is the customer\'s country code. That code is not also stored as a state.',
      cases: [
        ['The country is the customer\'s country code, and it is not also stored as a state', () => {
          if (!countryOnce(source)) return 'the country code is also stored as a state'
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
  const source = readOrder()
  console.log('The country code is the country. A copy stored as a state is not a pass.')
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
