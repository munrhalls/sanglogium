// The billing address sent with the payment.
//
// One question. The country code is the billing country. That same code is not
// also sent as a state. The words are written here. One of the two pay paths
// still copying the state is not a pass.
//
// A PASS line ended as its sentence says. A NO line did not, and the text after
// NO is what actually happened. A NO is a true answer. Do not edit the sentence
// to match the shop.
//
// Nothing here waits, rolls dice, or calls the card company. The same run twice
// gives the same answer.
//
// 0 every line passed. 1 one or more lines are NO. 2 the proof itself broke.
//
// node --experimental-strip-types tests/checkout/billing.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FILE = 'features/checkout/ui/PaymentForm.tsx'
const BLOCK = 'line1: `${address.street} ${address.streetNumber}`, postal_code: address.postalCode, city: address.city, country: "PL",'
const STATE = 'state: address.regionCode'

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
  const textFlat = flat(source)
  let found = 0
  let from = 0
  while (from <= textFlat.length) {
    const at = textFlat.indexOf(text, from)
    if (at < 0) return found
    found += 1
    from = at + text.length
  }
  return found
}

function ruler() {
  if (!BLOCK.includes('country: "PL"') || BLOCK.includes(STATE)) return 'the billing address was rewritten'
  if (STATE !== 'state: address.regionCode') return 'the state copy was rewritten'
  const old = 'line1: `${address.street} ${address.streetNumber}`, postal_code: address.postalCode, city: address.city, state: address.regionCode, country: "PL",'
  if (old.includes(BLOCK)) return 'a copied state was called a country'
  if (count(BLOCK, BLOCK) !== 1) return 'one billing address was missed'
  if (count(BLOCK + ' ' + BLOCK, BLOCK) !== 2) return 'the two billing addresses were not both counted'
  if (!old.includes(STATE)) return 'the copied state left the ruler'
  return null
}

function readPay() {
  try {
    return stripComments(readFileSync(path.join(root, FILE), 'utf8'))
  } catch (error) {
    proofBroken(`cannot read ${FILE}: ${error.message}`)
  }
}

function groups(source) {
  return [
    {
      question: 'Neither pay path sends the country code as a billing state.',
      cases: [
        ['Both pay paths keep the country, and neither sends the country code as a state', () => {
          if (count(source, BLOCK) !== 2) return 'a pay path still sends the country code as a state'
          if (count(source, STATE) !== 0) return 'a pay path still sends the country code as a state'
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
  const source = readPay()
  console.log('The country code is the billing country. A copy sent as a state is not a pass.')
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
