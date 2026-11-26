// The checkout button's redirect.
//
// One question. Checkout leaves the basket for the address page. The action
// opens /checkout/address by redirecting. A redirect rejects the caller, and
// its message is NEXT_REDIRECT. The button catches that rejection and shows
// the message, so the customer stays on the basket. The redirect has to be
// rethrown before any failure is shown. The button still says Checkout.
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
// node --experimental-strip-types tests/checkout/leaves-basket.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BUTTON = 'features/checkout/ui/CheckoutButton.tsx'
const ACTION = 'features/checkout/actions/initCheckoutSessionAction.ts'
const ADDRESS = 'redirect("/checkout/address")'
const RETHROW = 'unstable_rethrow(err)'
const SHOWN = 'setError(message)'
const LABEL = "'Checkout'"
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
  let from = 0
  while (from <= textFlat.length) {
    const at = textFlat.indexOf(text, from)
    if (at < 0) return -1
    const before = at === 0 ? '' : textFlat[at - 1]
    const after = textFlat[at + text.length] ?? ''
    if (!/[A-Za-z0-9_]/.test(before) && !/[A-Za-z0-9_]/.test(after)) return at
    from = at + text.length
  }
  return -1
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

function catchBody(source) {
  const text = flat(stripComments(source))
  const open = text.indexOf('catch (err) {')
  if (open < 0) return ''
  const rest = text.slice(open + 'catch (err) {'.length)
  const end = rest.indexOf('}')
  if (end < 0) return ''
  return rest.slice(0, end)
}

function leaveFinding(source) {
  const body = catchBody(source)
  if (body === '') return 'the checkout catch is missing'
  const rethrow = boundedAt(body, RETHROW)
  const shown = boundedAt(body, SHOWN)
  if (shown < 0) return 'checkout no longer shows a real failure'
  if (rethrow < 0 || rethrow > shown) return 'checkout shows the redirect instead of leaving the basket'
  const text = flat(stripComments(source))
  if (!text.includes(IMPORT_SINGLE) && !text.includes(IMPORT_DOUBLE)) return 'the redirect is not rethrown'
  return null
}

function ruler() {
  if (ADDRESS !== 'redirect("/checkout/address")') return 'the address was rewritten'
  if (RETHROW !== 'unstable_rethrow(err)') return 'the rethrow was rewritten'
  if (SHOWN !== 'setError(message)') return 'the failure was rewritten'
  if (LABEL !== "'Checkout'") return 'the label was rewritten'
  const caught = "} catch (err) { const message = err instanceof Error ? err.message : 'Checkout failed' setError(message) setIsProcessing(false) }"
  const fixed = `${IMPORT_SINGLE} } catch (err) { unstable_rethrow(err) const message = err instanceof Error ? err.message : 'Checkout failed' setError(message) setIsProcessing(false) }`
  const late = `${IMPORT_SINGLE} } catch (err) { const message = err instanceof Error ? err.message : 'Checkout failed' setError(message) unstable_rethrow(err) setIsProcessing(false) }`
  const unimported = "} catch (err) { unstable_rethrow(err) const message = err instanceof Error ? err.message : 'Checkout failed' setError(message) setIsProcessing(false) }"
  const longer = "} catch (err) { unstable_rethrow(errExtra) const message = err instanceof Error ? err.message : 'Checkout failed' setError(message) setIsProcessing(false) }"
  if (leaveFinding(caught) !== 'checkout shows the redirect instead of leaving the basket') return 'a swallowed redirect was accepted'
  if (leaveFinding(fixed) !== null) return 'a rethrown redirect was refused'
  if (leaveFinding(late) !== 'checkout shows the redirect instead of leaving the basket') return 'a late rethrow was accepted'
  if (leaveFinding(unimported) !== 'the redirect is not rethrown') return 'a rethrow without the router was accepted'
  if (leaveFinding(longer) !== 'checkout shows the redirect instead of leaving the basket') return 'a longer rethrow was accepted'
  if (leaveFinding(stripComments(`// ${IMPORT_SINGLE}\n// unstable_rethrow(err)\n${caught}`)) !== 'checkout shows the redirect instead of leaving the basket') return 'a comment was called a rethrow'
  if (bounded(ADDRESS, ADDRESS) !== 1) return 'the address was missed'
  if (bounded('redirect("/checkout/addressExtra")', ADDRESS) !== 0) return 'a longer address was accepted'
  if (bounded(LABEL, LABEL) !== 1) return 'the label was missed'
  if (bounded("'Checkout failed'", LABEL) !== 0) return 'the failure text was called the label'
  if (bounded('CheckoutButton', LABEL) !== 0) return 'the button name was called the label'
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

function groups(button, action) {
  return [
    {
      question: 'Checkout leaves the basket for the address page.',
      cases: [
        ['Checkout rethrows the redirect before it shows a failure', () => leaveFinding(button)],
        ['The action still opens the address page', () => {
          if (bounded(action, ADDRESS) !== 1) return 'checkout does not open the address page'
          return null
        }],
        ['The button still says Checkout', () => {
          if (bounded(button, LABEL) !== 1) return 'the button does not say Checkout'
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
  const button = readShop(BUTTON)
  if (button === '') {
    console.log('proof broken: the checkout button is missing')
    return 2
  }
  const action = readShop(ACTION)
  if (action === '') {
    console.log('proof broken: the checkout action is missing')
    return 2
  }
  console.log('Checkout leaves the basket for the address page.')
  const list = groups(button, action)
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
