// The shipping step's redirect.
//
// One question. Shipping leaves for the payment page. The action opens
// /checkout/payment by redirecting. A redirect rejects the caller. Its message
// is NEXT_REDIRECT, and its digest continues with the type, the url, and the
// status. The shipping step compares that digest to the exact word
// NEXT_REDIRECT, which does not match, then shows the message. The customer
// stays on the shipping page. The redirect has to be rethrown before any
// failure is shown. The button still says Continue to payment.
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
// node --experimental-strip-types tests/checkout/leaves-shipping.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const STEP = 'features/checkout/ui/ShippingStep.tsx'
const ACTION = 'features/checkout/actions/saveShippingAction.ts'
const PAYMENT = 'redirect("/checkout/payment")'
const RETHROW = 'unstable_rethrow(err)'
const SHOWN = 'setError(err instanceof Error ? err.message : "The shipping choice could not be saved.")'
const EXACT = 'digest === "NEXT_REDIRECT"'
const LABEL = '"Continue to payment"'
const IMPORT_SINGLE = "import { unstable_rethrow } from 'next/navigation'"
const IMPORT_DOUBLE = 'import { unstable_rethrow } from "next/navigation"'

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

function boundedAt(source, text) {
  const textFlat = flat(source)
  let found = -1
  let from = 0
  while (from <= textFlat.length) {
    const at = textFlat.indexOf(text, from)
    if (at < 0) return found
    const before = at === 0 ? '' : textFlat[at - 1]
    const after = textFlat[at + text.length] ?? ''
    if (!/[A-Za-z0-9_]/.test(before) && !/[A-Za-z0-9_]/.test(after)) return at
    from = at + text.length
  }
  return found
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

function leaveFinding(source) {
  const text = flat(stripComments(source))
  const open = text.indexOf('catch (err)')
  if (open < 0) return 'the shipping catch is missing'
  const shownAt = text.indexOf(SHOWN, open)
  if (shownAt < 0) return 'shipping no longer shows a real failure'
  const region = text.slice(open, shownAt)
  if (text.includes(EXACT) || text.includes("digest === 'NEXT_REDIRECT'")) return 'shipping shows the redirect instead of opening payment'
  if (boundedAt(region, RETHROW) < 0) return 'shipping shows the redirect instead of opening payment'
  if (!text.includes(IMPORT_SINGLE) && !text.includes(IMPORT_DOUBLE)) return 'the redirect is not rethrown'
  return null
}

function ruler() {
  if (PAYMENT !== 'redirect("/checkout/payment")') return 'the payment page was rewritten'
  if (RETHROW !== 'unstable_rethrow(err)') return 'the rethrow was rewritten'
  if (SHOWN !== 'setError(err instanceof Error ? err.message : "The shipping choice could not be saved.")') return 'the failure was rewritten'
  if (EXACT !== 'digest === "NEXT_REDIRECT"') return 'the digest compare was rewritten'
  if (LABEL !== '"Continue to payment"') return 'the label was rewritten'
  const caught = `} catch (err) { if (err instanceof Error && (err as any).digest === "NEXT_REDIRECT") { throw err; } ${SHOWN} setIsSubmitting(false); }`
  const fixed = `${IMPORT_DOUBLE} } catch (err) { unstable_rethrow(err); ${SHOWN} setIsSubmitting(false); }`
  const late = `${IMPORT_DOUBLE} } catch (err) { ${SHOWN} unstable_rethrow(err); setIsSubmitting(false); }`
  const leftover = `${IMPORT_DOUBLE} } catch (err) { unstable_rethrow(err); if (err instanceof Error && (err as any).digest === "NEXT_REDIRECT") { throw err; } ${SHOWN} }`
  const unimported = `} catch (err) { unstable_rethrow(err); ${SHOWN} setIsSubmitting(false); }`
  const longer = `${IMPORT_DOUBLE} } catch (err) { unstable_rethrow(errExtra); ${SHOWN} setIsSubmitting(false); }`
  if (leaveFinding(caught) !== 'shipping shows the redirect instead of opening payment') return 'a swallowed redirect was accepted'
  if (leaveFinding(fixed) !== null) return 'a rethrown redirect was refused'
  if (leaveFinding(late) !== 'shipping shows the redirect instead of opening payment') return 'a late rethrow was accepted'
  if (leaveFinding(leftover) !== 'shipping shows the redirect instead of opening payment') return 'the exact digest compare was accepted'
  if (leaveFinding(unimported) !== 'the redirect is not rethrown') return 'a rethrow without the router was accepted'
  if (leaveFinding(longer) !== 'shipping shows the redirect instead of opening payment') return 'a longer rethrow was accepted'
  if (leaveFinding(stripComments(`// ${IMPORT_DOUBLE}\n// unstable_rethrow(err);\n} catch (err) { ${SHOWN} }`)) !== 'shipping shows the redirect instead of opening payment') return 'a comment was called a rethrow'
  if (bounded(PAYMENT, PAYMENT) !== 1) return 'the payment page was missed'
  if (bounded('redirect("/checkout/paymentExtra")', PAYMENT) !== 0) return 'a longer payment page was accepted'
  if (bounded(LABEL, LABEL) !== 1) return 'the label was missed'
  if (bounded('"Continue to payment extra"', LABEL) !== 0) return 'a longer label was accepted'
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

function groups(step, action) {
  return [
    {
      question: 'Shipping leaves for the payment page.',
      cases: [
        ['Shipping rethrows the redirect before it shows a failure', () => leaveFinding(step)],
        ['The action still opens the payment page', () => {
          if (bounded(action, PAYMENT) !== 1) return 'shipping does not open the payment page'
          return null
        }],
        ['The button still says Continue to payment', () => {
          if (bounded(step, LABEL) !== 2) return 'the button does not say Continue to payment'
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
  const step = readShop(STEP)
  if (step === '') {
    console.log('proof broken: the shipping step is missing')
    return 2
  }
  const action = readShop(ACTION)
  if (action === '') {
    console.log('proof broken: the shipping action is missing')
    return 2
  }
  console.log('Shipping leaves for the payment page.')
  const list = groups(step, action)
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
