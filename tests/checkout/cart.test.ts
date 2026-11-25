// The basket the customer sees.
//
// One question. A succeeded payment empties that basket. A payment that did
// not succeed leaves it. The goods are the customer's basket, two of a and
// one of b. Empty means no goods left, in the basket and in the saved copy.
//
// A PASS line ended as its sentence says. A NO line did not, and the text after
// NO is what actually happened. A NO is a true answer. Do not edit the sentence
// to match the shop.
//
// Nothing here waits, rolls dice, or calls the bank or Sanity. The same run
// twice gives the same answer.
//
// 0 every line passed. 1 one or more lines are NO. 2 the proof itself broke.
//
// node --experimental-strip-types --import ./tools/alias-loader.mjs tests/checkout/cart.test.ts

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const GOODS = [
  { productId: 'a', quantity: 2 },
  { productId: 'b', quantity: 1 },
]
const BASKET_KEY = 'basket-storage'
const KEPT = [
  'app/checkout/success/page.tsx',
  'features/checkout/ui/payment-status/PaymentDeclined.tsx',
  'features/checkout/ui/payment-status/PaymentCanceled.tsx',
  'features/checkout/ui/payment-status/PaymentProcessing.tsx',
  'features/checkout/ui/payment-status/PaymentVerificationFailed.tsx',
  'features/checkout/ui/payment-status/PaymentUnexpectedStatus.tsx',
]

const memory = new Map()
globalThis.localStorage = {
  getItem(name) {
    return memory.has(name) ? memory.get(name) : null
  },
  setItem(name, value) {
    memory.set(name, String(value))
  },
  removeItem(name) {
    memory.delete(name)
  },
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

function proofBroken(message) {
  const error = new Error(`proof broken: ${message}`)
  error.proofBroken = true
  throw error
}

function textOf(items) {
  return items.map((item) => `${item.productId}:${item.quantity}`).join(',')
}

function ruler() {
  if (textOf(GOODS) !== 'a:2,b:1') return 'the written goods are not two of a and one of b'
  if (textOf([]) !== '') return 'an empty basket was not empty'
  if (textOf(GOODS) === '') return 'a basket with goods was called empty'
  if (KEPT.length !== 6) return 'a payment result is missing'
  return null
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function read(rel) {
  try {
    return stripComments(readFileSync(path.join(root, rel), 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return null
    proofBroken(`cannot read ${rel}: ${error.message}`)
  }
}

function savedItems() {
  const raw = memory.get(BASKET_KEY)
  if (typeof raw !== 'string') return null
  const parsed = JSON.parse(raw)
  return parsed?.state?.items
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

function groups(useBasketStore) {
  return [
    {
      question: 'A succeeded payment empties the basket the customer sees. A payment that did not succeed leaves it.',
      cases: [
        ['Clearing the basket removes the goods', () => {
          useBasketStore.setState({ items: GOODS })
          if (textOf(useBasketStore.getState().items) !== 'a:2,b:1') proofBroken('the basket did not take the goods')
          useBasketStore.getState().clear()
          const left = textOf(useBasketStore.getState().items)
          if (left !== '') return `the basket still has ${left}`
          const saved = savedItems()
          if (!Array.isArray(saved) || saved.length !== 0) return 'the saved basket still has goods'
          return null
        }],
        ['Clearing an empty basket leaves it empty', () => {
          useBasketStore.getState().clear()
          const left = textOf(useBasketStore.getState().items)
          if (left !== '') return `the basket still has ${left}`
          return null
        }],
        ['A succeeded payment empties the basket', () => {
          const view = read('features/checkout/view/PaymentConfirmedView.tsx')
          const clearer = read('features/checkout/ui/ClearBoughtBasket.tsx')
          if (!view || !view.includes('<ClearBoughtBasket />')) return 'the succeeded screen does not empty the basket'
          if ((view.match(/<ClearBoughtBasket \/>/g) || []).length !== 1) return 'the basket is emptied more than once'
          if (!clearer) return 'the succeeded screen does not empty the basket'
          const compact = clearer.replace(/\s+/g, '')
          if (!compact.includes('"useclient"') && !compact.includes("'useclient'")) return 'the basket is emptied on the server'
          if (!compact.includes('useEffect(()=>{useBasketStore.getState().clear();},[])')) return 'the basket is not emptied in the browser'
          if (!compact.includes('@/features/basket/state/basketStore')) return 'the basket is not the customer basket'
          return null
        }],
        ['A payment that did not succeed leaves the basket', () => {
          for (const file of KEPT) {
            const code = read(file)
            if (code === null) proofBroken(`cannot read ${file}`)
            if (code.includes('ClearBoughtBasket') || code.includes('.clear()')) return `${file} empties the basket`
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

async function main() {
  const broken = ruler()
  if (broken) {
    console.log(`proof broken: ${broken}`)
    return 2
  }
  const store = await quietly(() => import('@/features/basket/state/basketStore'))
  const useBasketStore = store.default
  if (typeof useBasketStore.getState().clear !== 'function') {
    console.log('proof broken: the basket has no clear')
    return 2
  }
  console.log('An empty basket has no goods, and a basket with goods is not empty.')
  const list = groups(useBasketStore)
  if (list.some((group) => group.cases.length === 0)) {
    console.log('proof broken: a question has no cases')
    return 2
  }
  const results = []
  let broke = false
  for (const group of list) {
    for (const [name, run] of group.cases) {
      try {
        const finding = await quietly(run)
        results.push({ question: group.question, name, finding })
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

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error)
    process.exit(2)
  },
)
