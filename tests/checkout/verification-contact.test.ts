// The verification-failed screen's contact button.
//
// One question. The verification-failed screen opens the contact page. The
// button says Contact support and its address is /support. No page is served
// at /support. The contact page is /contact. The button has to open that page.
// The heading stays. The screen still tells the customer to contact support
// with the reference.
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
// node --experimental-strip-types tests/checkout/verification-contact.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCREEN = 'features/checkout/ui/payment-status/PaymentVerificationFailed.tsx'
const CONTACT_PAGE = 'app/(store)/contact/page.tsx'
const HEADING = "We couldn&apos;t verify your payment status"
const REFERENCE = 'Contact support with this reference:'
const BUTTON = 'Contact support'

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

function contactAnchor(source) {
  const match = flat(source).match(/<a [^>]*>Contact support<\/a>/)
  return match ? match[0] : ''
}

function hrefOf(anchor) {
  const match = anchor.match(/href="([^"]*)"/)
  return match ? match[1] : ''
}

function linkFinding(source) {
  const anchor = contactAnchor(source)
  if (anchor === '') return 'the contact button is missing'
  if (hrefOf(anchor) !== '/contact') return 'the contact button does not open the contact page'
  if (bounded(source, 'href="/support"') !== 0) return 'the screen still opens the missing support page'
  return null
}

function ruler() {
  if (SCREEN !== 'features/checkout/ui/payment-status/PaymentVerificationFailed.tsx') return 'the screen was rewritten'
  if (CONTACT_PAGE !== 'app/(store)/contact/page.tsx') return 'the contact page was rewritten'
  if (HEADING !== "We couldn&apos;t verify your payment status") return 'the heading was rewritten'
  if (REFERENCE !== 'Contact support with this reference:') return 'the reference line was rewritten'
  if (BUTTON !== 'Contact support') return 'the button name was rewritten'
  const support = '<a href="/support" className="btn-secondary px-6 py-2.5">Contact support</a>'
  const contact = '<a href="/contact" className="btn-secondary px-6 py-2.5">Contact support</a>'
  const longer = '<a href="/contactExtra" className="btn-secondary px-6 py-2.5">Contact support</a>'
  const nested = '<a href="/contact/extra" className="btn-secondary px-6 py-2.5">Contact support</a>'
  const leftover = `${contact} <a href="/support">Return to basket</a>`
  if (linkFinding(support) !== 'the contact button does not open the contact page') return 'the missing page was accepted'
  if (linkFinding(contact) !== null) return 'the contact page was refused'
  if (linkFinding(longer) !== 'the contact button does not open the contact page') return 'a longer address was accepted'
  if (linkFinding(nested) !== 'the contact button does not open the contact page') return 'a longer address was accepted'
  if (linkFinding(leftover) !== 'the screen still opens the missing support page') return 'a leftover missing page was accepted'
  if (bounded('href="/support"Extra', 'href="/support"') !== 0) return 'a longer support address was accepted'
  if (linkFinding(`<h1>${HEADING}</h1>`) !== 'the contact button is missing') return 'a heading was called the contact button'
  if (linkFinding(stripComments(`// ${contact}\n<h1>${HEADING}</h1>`)) !== 'the contact button is missing') return 'a comment was called the contact button'
  if (bounded(HEADING, HEADING) !== 1) return 'the heading was missed'
  if (bounded(REFERENCE, REFERENCE) !== 1) return 'the reference line was missed'
  if (bounded(`${REFERENCE}Extra`, REFERENCE) !== 0) return 'a longer reference line was accepted'
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

function groups(screen) {
  return [
    {
      question: 'The verification-failed screen opens the contact page.',
      cases: [
        ['The contact button opens the contact page', () => linkFinding(screen)],
        ['It still says the payment could not be verified', () => {
          if (bounded(screen, HEADING) !== 1) return 'the screen does not say the payment could not be verified'
          return null
        }],
        ['It still tells the customer to contact support with the reference', () => {
          if (bounded(screen, REFERENCE) !== 1) return 'the screen does not tell the customer to contact support with the reference'
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
  const screen = readShop(SCREEN)
  if (screen === '') {
    console.log('proof broken: the verification-failed screen is missing')
    return 2
  }
  const contactPage = readShop(CONTACT_PAGE)
  if (contactPage === '') {
    console.log('proof broken: the contact page is missing')
    return 2
  }
  console.log('The verification-failed screen opens the contact page.')
  const list = groups(screen)
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
