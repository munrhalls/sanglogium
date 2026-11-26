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
// After both questions, the shipping price proofs run exactly as they run
// alone, and their lines are printed here too. Last, every printed line has
// to be listed in docs/features/checkout/proof-book.md, with why it cannot lie.
//
// 0 every line passed. 1 one or more lines are NO. 2 the proof itself broke.
//
// npm run proof:checkout, which is:
// node --experimental-strip-types --import ./tools/alias-loader.mjs --import ./tests/checkout/load.mjs tests/checkout/payment-order.test.ts

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
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

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
const BOOK = new URL('../../docs/features/checkout/proof-book.md', import.meta.url)

// The shipping price proofs, each run exactly as it is run alone.
const shippingProofs = [
  ['--import', './tests/checkout/save-load.mjs', 'tests/checkout/save.test.ts'],
  ['tests/checkout/rates.test.ts'],
  ['--import', './tests/checkout/save-load.mjs', 'tests/checkout/basket.test.ts'],
]

// Its printed lines, without its own last line. A run that did not end in
// 0 or 1 is broken, and the first line it wrote to stderr says why.
function runAlone(args) {
  const file = args[args.length - 1]
  const run = spawnSync(process.execPath, ['--experimental-strip-types', '--import', './tools/alias-loader.mjs', '--import', './tests/checkout/load.mjs', ...args], { cwd: repoRoot, encoding: 'utf8' })
  const lines = (run.stdout ?? '').split('\n').filter((line) => line !== '')
  if (run.status === 0 || run.status === 1) {
    lines.pop()
    return { lines, broken: false }
  }
  const why = (run.stderr ?? '').split('\n').find((line) => line.trim() !== '') ?? ''
  return { lines: [...lines, `proof broken: ${file} ended with ${run.status}. ${why}`], broken: true }
}

// Null when the book lists every printed sentence once, each followed by why
// it cannot lie, and lists no sentence that nothing printed.
function bookMatches(rows, printed) {
  const sentences = printed.filter((line) => line.startsWith('  '))
  const named = (name, line) => line === `  ${name}: PASS` || line.startsWith(`  ${name}: NO — `)
  const listed = []
  for (let i = 0; i < rows.length; i += 1) {
    const hit = /^- \*\*(.+)\*\*$/.exec(rows[i])
    if (!hit) continue
    if (!/^  Cannot lie: \S/.test(rows[i + 1] ?? '')) return `the proof book does not say why “${hit[1]}” cannot lie`
    listed.push(hit[1])
  }
  for (const name of listed) {
    const count = sentences.filter((line) => named(name, line)).length
    if (count !== 1) return `the proof book lists “${name}”, and ${count} printed lines carry that name`
  }
  for (const line of sentences) {
    if (!listed.some((name) => named(name, line))) return `the proof book does not list “${line.trim()}”`
  }
  return null
}

// The book check, on paper. A string means it can lie.
function bookRuler() {
  const rows = ['- **A**', '  Cannot lie: x', '- **B: c**', '  Cannot lie: y']
  if (bookMatches(rows, ['  A: PASS', '  B: c: NO — z']) !== null) return 'a book that matches was called wrong'
  if (bookMatches(rows, ['  A: PASS']) === null) return 'a listed line that did not run was not reported'
  if (bookMatches(rows, ['  A: PASS', '  B: c: PASS', '  D: PASS']) === null) return 'a line the book does not list was not reported'
  if (bookMatches(['- **A**', '  no reason'], ['  A: PASS']) === null) return 'a line with no reason was not reported'
  return null
}

function readBook() {
  try {
    return readFileSync(BOOK, 'utf8').split('\n')
  } catch {
    return null
  }
}

async function main() {
  const ruler = bookRuler()
  if (ruler) {
    console.log(`proof broken: ${ruler}`)
    return 2
  }
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
  const printed = []
  const say = (line) => {
    printed.push(line)
    console.log(line)
  }
  let current = ''
  for (const result of results) {
    if (result.question !== current) {
      current = result.question
      say(current)
    }
    say(result.finding ? `  ${result.name}: NO — ${result.finding}` : `  ${result.name}: PASS`)
  }
  for (const args of shippingProofs) {
    const alone = runAlone(args)
    for (const line of alone.lines) say(line)
    if (alone.broken) broken = true
  }
  const rows = readBook()
  const book = rows ? bookMatches(rows, printed) : 'the proof book docs/features/checkout/proof-book.md is missing'
  if (book) {
    broken = true
    say(`proof broken: ${book}`)
  } else {
    say('Every line above is in the proof book, with why it cannot lie.')
  }
  if (broken) {
    console.log('proof broken')
    return 2
  }
  const nos = printed.filter((line) => line.startsWith('  ') && line.includes(': NO — '))
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
