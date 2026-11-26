// The confirmation email's country.
//
// One question. The email shows the country stored on the order. The words are
// written here. A longer name than country is not a pass. An empty country
// adds no line. The country line is the stored country, printed before the phone.
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
// node --experimental-strip-types tests/checkout/email-country.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FILE = 'features/checkout/adapters/resend/orderConfirmationEmail.ts'
const TYPE_COUNTRY = 'shippingAddress as typeof shippingAddress & { country?: string }'
const VIEW_COUNTRY = 'addressed.country'
const INSERT = '${countryLine}'
const PHONE_INSERT = '${phoneLine}'

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
  if (TYPE_COUNTRY !== 'shippingAddress as typeof shippingAddress & { country?: string }') return 'the country type was rewritten'
  if (VIEW_COUNTRY !== 'addressed.country') return 'the email country was rewritten'
  if (INSERT !== '${countryLine}') return 'the email line was rewritten'
  if (PHONE_INSERT !== '${phoneLine}') return 'the phone line was rewritten'
  if (bounded('shippingAddress as typeof shippingAddress & { country: string }', TYPE_COUNTRY) !== 0) return 'a required country was accepted as optional'
  if (bounded(TYPE_COUNTRY, TYPE_COUNTRY) !== 1) return 'the optional country was missed'
  if (bounded('addressed.countryCode', VIEW_COUNTRY) !== 0) return 'a longer name was accepted as the country'
  const shown = 'addressed.country ? "<p>" + addressed.country + "</p>"'
  if (bounded(shown, VIEW_COUNTRY) !== 2) return 'the email country was not counted twice'
  if (bounded('addressed.country', VIEW_COUNTRY) !== 1) return 'one mention was not counted'
  if (bounded(INSERT, INSERT) !== 1) return 'the email line was missed'
  if (bounded('const countryLine', INSERT) !== 0) return 'a declaration was accepted as the email line'
  const ordered = 'city</p> ${countryLine} ${phoneLine}'
  const countryAt = ordered.indexOf(INSERT)
  const phoneAt = ordered.indexOf(PHONE_INSERT)
  if (countryAt < 0 || phoneAt < 0 || countryAt > phoneAt) return 'the country was not required before the phone'
  return null
}

function readEmail() {
  try {
    return stripComments(readFileSync(path.join(root, FILE), 'utf8'))
  } catch (error) {
    proofBroken(`cannot read ${FILE}: ${error.message}`)
  }
}

function groups(source) {
  return [
    {
      question: 'The order confirmation email shows the country stored on the order.',
      cases: [
        ['The email address can hold a country', () => {
          if (bounded(source, TYPE_COUNTRY) !== 1) return 'the email address has no country'
          return null
        }],
        ['The email prints that country before the phone', () => {
          if (bounded(source, VIEW_COUNTRY) !== 2) return 'the email does not print the country'
          if (bounded(source, INSERT) !== 1) return 'the country line is not in the email'
          const text = flat(source)
          const countryAt = text.indexOf(INSERT)
          const phoneAt = text.indexOf(PHONE_INSERT)
          if (phoneAt < 0 || countryAt > phoneAt) return 'the country is not shown before the phone'
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
  const source = readEmail()
  console.log('The order confirmation email shows the country stored on the order.')
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
