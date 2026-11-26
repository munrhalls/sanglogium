// An unknown product at the payment step.
//
// One question. An unknown product opens the basket refusal. The basket
// already says it cannot be checked out, and only for invalid_basket. The
// payment page still throws when the shelf does not know a basket product.
// That throw has to become the same refusal. A crash is not a pass. The
// invalid-price throw stays where it is.
//
// A PASS line ended as its sentence says. A NO line did not, and the text after
// NO is what actually happened. A NO is a true answer. Do not edit the sentence
// to match the shop.
//
// Nothing here waits, rolls dice, or calls the catalogue. The same run twice
// gives the same answer.
//
// 0 every line passed. 1 one or more lines are NO. 2 the proof itself broke.
//
// node --experimental-strip-types tests/checkout/unknown-product.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PAYMENT = 'features/checkout/queries/getPaymentPageData.ts'
const PAGE = 'app/(store)/basket/page.tsx'
const MISMATCH = 'payment_product_mismatch'
const PRICE = 'payment_invalid_price'
const REDIRECT = 'redirect("/basket?error=invalid_basket")'
const THROW = 'throw new Error("Product mismatch — basket contains unknown product IDs")'
const GATE = '{error === "invalid_basket" ? <BasketInvalidRefusal /> : null}'

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

function mismatchFinding(source) {
  const start = source.indexOf(MISMATCH)
  const end = source.indexOf(PRICE)
  if (start < 0 || end < 0 || end <= start) proofBroken('the mismatch branch is missing')
  const slice = source.slice(start, end)
  if (bounded(slice, THROW) !== 0) return 'the payment page still throws for an unknown product'
  if (bounded(slice, REDIRECT) !== 1) return 'an unknown product does not open the refusal'
  return null
}

function ruler() {
  if (REDIRECT !== 'redirect("/basket?error=invalid_basket")') return 'the redirect was rewritten'
  if (THROW !== 'throw new Error("Product mismatch — basket contains unknown product IDs")') return 'the throw was rewritten'
  if (GATE !== '{error === "invalid_basket" ? <BasketInvalidRefusal /> : null}') return 'the gate was rewritten'
  if (bounded('redirect("/basket?error=invalid_basket_extra")', REDIRECT) !== 0) return 'a longer code was accepted'
  if (bounded('redirect("/basket?error=invalid_basket&id=a")', REDIRECT) !== 0) return 'a longer query was accepted'
  if (bounded('throw new Error("Product mismatch — basket contains unknown product IDs extra")', THROW) !== 0) return 'a longer throw was accepted'
  if (bounded(REDIRECT, REDIRECT) !== 1) return 'the redirect was missed'
  if (bounded(THROW, THROW) !== 1) return 'the throw was missed'
  if (bounded(GATE, GATE) !== 1) return 'the gate was missed'
  if (bounded('{error === "invalid_basket_extra" ? <BasketInvalidRefusal /> : null}', GATE) !== 0) return 'a longer gate was accepted'
  const crash = `${MISMATCH} ${THROW}; ${PRICE}`
  const open = `${MISMATCH} ${REDIRECT}; ${PRICE}`
  const both = `${MISMATCH} ${REDIRECT}; ${THROW}; ${PRICE}`
  const other = `${MISMATCH} redirect("/basket?error=invalid_total"); ${PRICE}`
  if (mismatchFinding(crash) !== 'the payment page still throws for an unknown product') return 'a throw was missed'
  if (mismatchFinding(open) !== null) return 'the refusal redirect was missed'
  if (mismatchFinding(both) !== 'the payment page still throws for an unknown product') return 'a throw beside a redirect was accepted'
  if (mismatchFinding(other) !== 'an unknown product does not open the refusal') return 'another refusal was accepted'
  try {
    mismatchFinding('nothing')
    return 'a missing branch was judged'
  } catch (error) {
    if (!error?.proofBroken) return 'a missing branch broke the wrong way'
  }
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

function groups(payment, page) {
  return [
    {
      question: 'An unknown product opens the basket refusal.',
      cases: [
        ['The payment page sends an unknown product to that refusal', () => mismatchFinding(payment)],
        ['The basket shows that refusal for an invalid basket', () => {
          if (bounded(page, GATE) !== 1) return 'the basket does not show the refusal for that basket'
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
  const payment = readShop(PAYMENT)
  const page = readShop(PAGE)
  if (payment === '') {
    console.log('proof broken: the payment page is missing')
    return 2
  }
  if (page === '') {
    console.log('proof broken: the basket page is missing')
    return 2
  }
  console.log('An unknown product opens the basket refusal.')
  const list = groups(payment, page)
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
