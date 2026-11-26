// The basket's refusal of an unchargeable total.
//
// One question. The basket says the total cannot be charged. Checkout already
// sends that basket to /basket?error=invalid_total. The words are written here.
// The page reads that query and shows the refusal only for it. The sentence
// lives on the refusal, not on every basket visit. A normal basket is not a pass.
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
// node --experimental-strip-types tests/checkout/refused-total.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PAGE = 'app/(store)/basket/page.tsx'
const NOTICE = 'features/checkout/ui/BasketTotalRefusal.tsx'
const DOOR = 'features/checkout/index.ts'
const READ = 'const { error } = await searchParams'
const GATE = '{error === "invalid_total" ? <BasketTotalRefusal /> : null}'
const IMPORT = 'import { BasketCheckout, BasketTotalRefusal } from "@/features/checkout";'
const SENTENCE = 'This total cannot be charged.'
const EXPORT = "export { BasketTotalRefusal } from './ui/BasketTotalRefusal';"

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

function readsQuery(source) {
  const text = flat(source)
  if (bounded(text, READ) !== 1) return false
  let from = 0
  while (from <= text.length) {
    const at = text.indexOf(READ, from)
    if (at < 0) return false
    const before = at === 0 ? '' : text[at - 1]
    const after = text[at + READ.length] ?? ''
    if (!/[A-Za-z0-9_]/.test(before) && !/[A-Za-z0-9_]/.test(after)) {
      return after !== '('
    }
    from = at + READ.length
  }
  return false
}

function ruler() {
  if (READ !== 'const { error } = await searchParams') return 'the query read was rewritten'
  if (GATE !== '{error === "invalid_total" ? <BasketTotalRefusal /> : null}') return 'the gate was rewritten'
  if (IMPORT !== 'import { BasketCheckout, BasketTotalRefusal } from "@/features/checkout";') return 'the import was rewritten'
  if (SENTENCE !== 'This total cannot be charged.') return 'the sentence was rewritten'
  if (EXPORT !== "export { BasketTotalRefusal } from './ui/BasketTotalRefusal';") return 'the export was rewritten'
  if (readsQuery('const { error } = await searchParams()')) return 'a call was accepted as the query'
  if (readsQuery('const { error } = searchParams')) return 'a promise was accepted as the query'
  if (!readsQuery('const { error } = await searchParams')) return 'the query read was missed'
  if (bounded('{error === "invalid_total_extra" ? <BasketTotalRefusal /> : null}', GATE) !== 0) return 'a longer code was accepted'
  if (bounded("{error === 'invalid_total' ? <BasketTotalRefusal /> : null}", GATE) !== 0) return 'the other quotes were accepted'
  if (bounded('{error === "invalid_basket" ? <BasketTotalRefusal /> : null}', GATE) !== 0) return 'another refusal was accepted'
  if (bounded('<BasketTotalRefusal />', GATE) !== 0) return 'an always-shown refusal was accepted'
  if (bounded(GATE, GATE) !== 1) return 'the gate was missed'
  if (bounded('This total cannot be charged', SENTENCE) !== 0) return 'a fragment was accepted as the sentence'
  if (bounded(SENTENCE, SENTENCE) !== 1) return 'the sentence was missed'
  if (bounded("export { BasketTotalRefusal } from './ui/BasketTotalRefusalExtra';", EXPORT) !== 0) return 'a longer path was accepted'
  if (bounded(EXPORT, EXPORT) !== 1) return 'the export was missed'
  if (bounded('import { BasketTotalRefusal } from "@/features/checkout";', IMPORT) !== 0) return 'a shorter import was accepted'
  if (bounded(IMPORT, IMPORT) !== 1) return 'the import was missed'
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

function groups(page, notice, door) {
  return [
    {
      question: 'The basket says the total cannot be charged.',
      cases: [
        ['The page reads that query and shows the refusal only for it', () => {
          if (bounded(page, SENTENCE) !== 0) return 'the basket says that on every visit'
          if (!readsQuery(page)) return 'the basket does not read the error query'
          if (bounded(page, GATE) !== 1) return 'the basket does not show the refusal for that total'
          if (bounded(page, IMPORT) !== 1) return 'the basket page does not take the refusal from the checkout door'
          return null
        }],
        ['The refusal says the total cannot be charged', () => {
          if (bounded(notice, SENTENCE) !== 1) return 'the refusal does not say the total cannot be charged'
          return null
        }],
        ['The checkout door exports the refusal', () => {
          if (bounded(door, EXPORT) !== 1) return 'the checkout door does not export the refusal'
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
  const page = readShop(PAGE)
  const notice = readShop(NOTICE)
  const door = readShop(DOOR)
  if (page === '') {
    console.log('proof broken: the basket page is missing')
    return 2
  }
  if (door === '') {
    console.log('proof broken: the checkout door is missing')
    return 2
  }
  console.log('The basket says the total cannot be charged.')
  const list = groups(page, notice, door)
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
