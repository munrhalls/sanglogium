// Checkout proof.
//
// Two questions. Both are asked in full.
//
// Parity. Was the customer charged the shelf price, and did that one successful
// payment become exactly one order for the same amount and the same goods?
//
// Conservation. Do the orders and the stock, read together, explain every unit?
//
// Before either question, three rulers are checked. The written situations have
// to add up to the totals written on them. The card company and the warehouse
// have to show they cannot lie. Each sentence's list is read twice, and wrong
// paperwork is not called a pass. If a ruler fails, the proof stops.
//
// A PASS line ended as its sentence says. A NO line did not, and the text after
// NO is what actually happened. A NO is a true answer. Do not edit the sentence
// to match the shop.
//
// The amounts are written as numbers. The shop is not asked to grade itself.
// The shop questions do not wait, roll dice, or call Stripe, Sanity, or the database.
// The same run twice gives the same answer.
//
// 0 every line passed. 1 one or more lines are NO. 2 the proof itself broke.
//
// node --experimental-strip-types --import ./tools/alias-loader.mjs --import ./tests/checkout/load.mjs tests/checkout/payment-order.test.ts

import { installCardCompany } from './card-provider.test.ts'
import { worldsAreExact } from './domain.mjs'
import { cases as conservationCases, question as conservationQuestion } from './conservation.test.ts'
import { testsHold } from './holds.test.ts'
import { cases as parityCases, question as parityQuestion } from './parity.test.ts'
import { standInsObeyTheirRules } from './shop.test.ts'

const groups = [
  { question: parityQuestion, cases: parityCases },
  { question: conservationQuestion, cases: conservationCases },
]

function brokenFinding(error) {
  if (error?.proofBroken) return error.message
  return `proof broken: ${error?.stack ?? error}`
}

async function quietly(run) {
  const log = console.log
  const error = console.error
  const warn = console.warn
  console.log = () => {}
  console.error = () => {}
  console.warn = () => {}
  try {
    return await run()
  } finally {
    console.log = log
    console.error = error
    console.warn = warn
  }
}

async function main() {
  installCardCompany()
  const worlds = worldsAreExact()
  if (worlds) {
    console.log(worlds.startsWith('proof broken:') ? worlds : `proof broken: ${worlds}`)
    return 2
  }
  const lie = await standInsObeyTheirRules()
  if (lie) {
    console.log(`proof broken: ${lie}`)
    return 2
  }
  const held = await testsHold(parityCases, conservationCases)
  if (held) {
    console.log(held.startsWith('proof broken:') ? held : `proof broken: ${held}`)
    return 2
  }
  console.log('Each test is steady, and a wrong result is not called a pass.')
  const results = []
  let broken = false
  for (const group of groups) {
    for (const item of group.cases) {
      const [name, run] = item
      try {
        const finding = await quietly(run)
        results.push({ question: group.question, name, finding })
      } catch (error) {
        broken = true
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
  if (broken) {
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
