// The shipping step.
//
// One question. The shipping step speaks English, the language of the checkout
// page. The words are written here. A Polish sentence is not a pass.
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
// node --experimental-strip-types tests/checkout/english.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FILE = 'features/checkout/ui/ShippingStep.tsx'
const HEADING = 'Choose a shipping method'
const ONE_DAY = '1 business day'
const MANY_DAYS = '${days} business days'
const EMPTY = 'No shipping options are available.'
const SELECTED = 'Selected:'
const RETRY = 'Try again'
const CONTINUE = 'Continue to payment'
const PROCESSING = 'Processing\u2026'
const SAVE_FAILED = 'The shipping choice could not be saved.'
const OPTIONS = 'Shipping options'
const POLISH = [
  'Wybierz metodę dostawy',
  'dzień roboczy',
  'dni robocze',
  'Nie udało się zapisać wyboru dostawy',
  'Spróbuj ponownie',
  'Brak dostępnych opcji dostawy.',
  'Opcje dostawy',
  'Wybrano:',
  'Przejdź do płatności',
  'Przetwarzanie',
]

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

function proofBroken(message) {
  const error = new Error(`proof broken: ${message}`)
  error.proofBroken = true
  throw error
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
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

function singular(source) {
  return source.includes("return '1 business day'") || source.includes('return "1 business day"')
}

function pluralReturn(source) {
  return source.includes("return '1 business days'") || source.includes('return "1 business days"')
}

function ruler() {
  if (POLISH.length !== 10) return 'a Polish sentence is missing'
  if (HEADING !== 'Choose a shipping method') return 'the heading was rewritten'
  if (ONE_DAY !== '1 business day') return 'one day was rewritten'
  if (MANY_DAYS !== '${days} business days') return 'the other days were rewritten'
  const english = [HEADING, ONE_DAY, MANY_DAYS, EMPTY, SELECTED, RETRY, CONTINUE, PROCESSING, SAVE_FAILED, OPTIONS]
  if (english.some((word) => /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(word))) return 'an English sentence uses Polish letters'
  for (const word of english) {
    if (POLISH.some((polish) => word.includes(polish))) return 'an English sentence is Polish'
  }
  const one = "return '1 business day'"
  const wrong = "return '1 business days'"
  if (!singular(one) || singular(wrong)) return 'one day was accepted as many days'
  if (!pluralReturn(wrong) || pluralReturn(one)) return 'many days were accepted as one day'
  if (count(one, ONE_DAY) !== 1) return 'one day was counted twice'
  return null
}

function readStep() {
  try {
    return stripComments(readFileSync(path.join(root, FILE), 'utf8'))
  } catch (error) {
    proofBroken(`cannot read ${FILE}: ${error.message}`)
  }
}

function groups(source) {
  return [
    {
      question: 'The shipping step speaks English, the language of the checkout page.',
      cases: [
        ['The heading is English', () => {
          if (count(source, `>${HEADING}<`) !== 1) return 'the heading is not English'
          return null
        }],
        ['One delivery day is "1 business day"', () => {
          if (!singular(source) || pluralReturn(source)) return `one day is not ${ONE_DAY}`
          return null
        }],
        ['The other delivery days are the number of days and "business days"', () => {
          if (!source.includes('days === 1')) return 'one day is not separate from the other days'
          if (count(source, `\`${MANY_DAYS}\``) !== 1) return 'the other days are not the number of business days'
          return null
        }],
        ['The rest of the step is English', () => {
          if (count(source, EMPTY) !== 1) return 'the empty list is not English'
          if (count(source, SELECTED) !== 1) return 'the selected line is not English'
          if (count(source, RETRY) !== 1) return 'the retry is not English'
          if (count(source, `"${CONTINUE}"`) !== 2) return 'a continue button is not English'
          if (count(source, PROCESSING) !== 2) return 'a processing label is not English'
          if (count(source, SAVE_FAILED) !== 1) return 'the save failure is not English'
          if (count(source, OPTIONS) !== 1) return 'the option list is not English'
          return null
        }],
        ['A Polish sentence is not left on the step', () => {
          for (const polish of POLISH) {
            if (source.includes(polish)) return `the step still says ${polish}`
          }
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
  const source = readStep()
  console.log('The checkout page is English, and a Polish sentence is not a pass.')
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
