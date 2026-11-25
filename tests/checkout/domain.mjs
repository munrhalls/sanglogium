// The situations each property checks.
//
// A property is one sentence that has to stay true for every situation in
// its list. The list is the whole range. Every situation is checked. Nothing
// is sampled and nothing is random, so the same run twice checks the same
// situations and gives the same answer.
//
// Lists are written smallest first. The first failure is the smallest
// situation that failed.
//
// The totals below are written as numbers. exactTotal only checks that a
// written total really is the shelf prices added up. It refuses any line
// the computer cannot store exactly. The shop is not asked.

function fail(message) {
  const error = new Error(message)
  error.proofBroken = true
  throw error
}

export function exactProduct(unit, qty) {
  if (!Number.isInteger(unit) || !Number.isInteger(qty)) fail('a price or a quantity was not a whole number')
  if (!Number.isSafeInteger(unit) || !Number.isSafeInteger(qty)) fail('a price or a quantity does not fit')
  const product = unit * qty
  if (!Number.isSafeInteger(product)) fail('a line total does not fit')
  return product
}

export function exactTotal(lines, shipping) {
  if (!Number.isInteger(shipping) || shipping < 0 || !Number.isSafeInteger(shipping)) fail('shipping is not a whole number of grosze')
  let total = 0
  for (const line of lines) {
    total += exactProduct(line.unit, line.qty)
    if (!Number.isSafeInteger(total)) fail('a basket total does not fit')
  }
  total += shipping
  if (!Number.isSafeInteger(total) || total < 1) fail('a basket total is not a positive whole number of grosze')
  return total
}

// True when id:qty survives being written as the payment's basket text.
export function idRoundTrips(id) {
  const text = `${id}:1`
  const pieces = text.split(',')
  if (pieces.length !== 1) return false
  const cut = pieces[0].split(':')
  return cut.length === 2 && cut[0] === id && cut[1] === '1'
}

// True when unit × qty is an exact whole number the computer can store.
export function productFits(unit, qty) {
  if (!Number.isInteger(unit) || !Number.isInteger(qty) || qty < 1 || unit < 1) return false
  if (unit > Number.MAX_SAFE_INTEGER || qty > Number.MAX_SAFE_INTEGER) return false
  const room = Math.floor(Number.MAX_SAFE_INTEGER / qty)
  if (!Number.isSafeInteger(room)) return false
  return unit <= room
}

export function basketText(basket) {
  return basket.lines.map((line) => `${line.id}:${line.qty}`).join(',')
}

export function sessionLines(basket) {
  return basket.lines.map((line) => ({ productId: line.id, quantity: line.qty }))
}

export function priceRows(basket) {
  return basket.lines.map((line) => ({ _id: line.id, price_data: { unit_amount: line.unit } }))
}

export function orderLines(basket) {
  return basket.lines.map((line) => ({ productId: line.id, quantity: line.qty, unit: line.unit }))
}

// The shelf starts with this many of each item in a legal basket.
export const SHELF = 10

export function stockFull(basket) {
  return Object.fromEntries(basket.lines.map((line) => [line.id, SHELF]))
}

export function stockLeft(basket) {
  const left = {}
  for (const line of basket.lines) {
    const n = SHELF - line.qty
    if (!Number.isInteger(line.qty) || n < 0) fail(`${basket.name} asks for more than the ${SHELF} on the shelf`)
    left[line.id] = n
  }
  return left
}

export const OTHER_PRICE = 9000

export function changedShelfId(basket) {
  const line = basket.lines[0]
  if (line.unit === OTHER_PRICE) fail(`${basket.name} is already priced at ${OTHER_PRICE}`)
  return line.id
}

// A basket that is not the one frozen on the payment.
export function differentSessionLines(basket) {
  const line = basket.lines[0]
  const qty = basket.lines.length === 1 && line.qty === 1 ? 2 : 1
  return [{ productId: line.id, quantity: qty }]
}

export const legalBaskets = [
  { name: 'one item at 100', lines: [{ id: 'a', qty: 1, unit: 100 }], shipping: 0, total: 100 },
  { name: 'two items at 100', lines: [{ id: 'a', qty: 2, unit: 100 }], shipping: 0, total: 200 },
  { name: 'one each of a, b and c', lines: [
    { id: 'a', qty: 1, unit: 100 },
    { id: 'b', qty: 1, unit: 200 },
    { id: 'c', qty: 1, unit: 300 },
  ], shipping: 0, total: 600 },
  { name: 'nine items at 100', lines: [{ id: 'a', qty: 9, unit: 100 }], shipping: 0, total: 900 },
  { name: 'one item at 1000, shipping 500', lines: [{ id: 'a', qty: 1, unit: 1000 }], shipping: 500, total: 1500 },
  { name: 'one lamp at 2500', lines: [{ id: 'lamp', qty: 1, unit: 2500 }], shipping: 0, total: 2500 },
  { name: 'two of a at 1000, one of b at 2500, shipping 500', lines: [
    { id: 'a', qty: 2, unit: 1000 },
    { id: 'b', qty: 1, unit: 2500 },
  ], shipping: 500, total: 5000 },
]

export const oneBankNotice = ['bank']
export const twoBankNotices = ['bank', 'bank']
export const oneReturn = ['customer']
export const twoReturns = ['customer', 'customer']
export const returnThenBank = ['customer', 'bank']
export const bankThenReturn = ['bank', 'customer']

export function knownBasket() {
  const found = legalBaskets.find((basket) => basket.total === 5000)
  if (!found) fail('the known basket is missing')
  return found
}

export function basketChanges() {
  const pairs = []
  for (const before of legalBaskets) {
    for (const after of legalBaskets) {
      if (before === after) continue
      pairs.push({ name: `${before.name}, then ${after.name}`, before, after })
    }
  }
  return pairs
}

export const SHIPPING_MISSING = 'missing'

function refusal(rule, name, basket, shipping, rows) {
  return { rule, name, basket, shipping, rows }
}

function row(id, unit) {
  if (unit === null) return { _id: id, price_data: null }
  return { _id: id, price_data: { unit_amount: unit } }
}

const longId = `p${'x'.repeat(498)}`
const longerId = `p${'x'.repeat(597)}`

export const refusals = [
  refusal('empty', 'an empty basket', [], 0, [row('a', 100)]),

  refusal('shipping', 'one item and no shipping price', [{ productId: 'a', quantity: 1 }], SHIPPING_MISSING, [row('a', 100)]),
  refusal('shipping', 'two items and no shipping price', [
    { productId: 'a', quantity: 2 },
    { productId: 'b', quantity: 1 },
  ], SHIPPING_MISSING, [row('a', 1000), row('b', 2500)]),

  refusal('unknown', 'a product the shelf does not have', [{ productId: 'z', quantity: 1 }], 0, [row('a', 100)]),
  refusal('unknown', 'a known product beside an unknown one', [
    { productId: 'a', quantity: 1 },
    { productId: 'z', quantity: 1 },
  ], 0, [row('a', 100)]),

  refusal('price', 'a product with no price', [{ productId: 'a', quantity: 1 }], 0, [row('a', null)]),
  refusal('price', 'a product priced at 0', [{ productId: 'a', quantity: 1 }], 0, [row('a', 0)]),
  refusal('price', 'a negative price beside a real price', [
    { productId: 'a', quantity: 1 },
    { productId: 'b', quantity: 1 },
  ], 0, [row('a', -5), row('b', 100)]),

  refusal('zero', 'a quantity of 0', [{ productId: 'a', quantity: 0 }], 0, [row('a', 1000)]),
  refusal('zero', 'a quantity of 0 with shipping 500', [{ productId: 'a', quantity: 0 }], 500, [row('a', 1000)]),
  refusal('zero', 'a quantity of 0 beside a real line', [
    { productId: 'a', quantity: 0 },
    { productId: 'b', quantity: 1 },
  ], 0, [row('a', 1000), row('b', 2500)]),

  refusal('negative', 'a quantity of -1', [{ productId: 'a', quantity: -1 }], 0, [row('a', 1000)]),
  refusal('negative', 'a quantity of -1 beside a real line, shipping 500', [
    { productId: 'a', quantity: -1 },
    { productId: 'b', quantity: 1 },
  ], 500, [row('a', 1000), row('b', 2500)]),
  refusal('negative', 'a quantity of -3 beside two real items', [
    { productId: 'a', quantity: -3 },
    { productId: 'b', quantity: 2 },
  ], 0, [row('a', 100), row('b', 100)]),

  refusal('fraction', 'a quantity of 1.5', [{ productId: 'a', quantity: 1.5 }], 0, [row('a', 1000)]),
  refusal('fraction', 'a quantity of 1.5 with shipping 500', [{ productId: 'a', quantity: 1.5 }], 500, [row('a', 1000)]),
  refusal('fraction', 'a quantity of 0.5', [{ productId: 'a', quantity: 0.5 }], 0, [row('a', 100)]),
  refusal('fraction', 'a quantity of 2.25', [{ productId: 'b', quantity: 2.25 }], 0, [row('b', 200)]),

  refusal('grosze', 'shipping of half a grosz', [{ productId: 'a', quantity: 1 }], 0.5, [row('a', 1)]),
  refusal('grosze', 'shipping of half a grosz on a 10 grosz item', [{ productId: 'a', quantity: 1 }], 0.5, [row('a', 10)]),
  refusal('grosze', 'a price of 1.5 grosze', [{ productId: 'a', quantity: 2 }], 0, [row('a', 1.5)]),

  refusal('exact', '9007199254740991 grosze, three times', [{ productId: 'a', quantity: 3 }], 0, [row('a', 9007199254740991)]),
  refusal('exact', '9007199254740991 grosze, twice', [{ productId: 'a', quantity: 2 }], 0, [row('a', 9007199254740991)]),
  refusal('exact', 'a price one past what the computer can store', [{ productId: 'a', quantity: 1 }], 0, [row('a', 9007199254740992)]),

  refusal('id', 'a product id with a comma', [{ productId: 'a,b', quantity: 1 }], 0, [row('a,b', 1000)]),
  refusal('id', 'a product id with a colon', [{ productId: 'a:b', quantity: 1 }], 0, [row('a:b', 1000)]),
  refusal('id', 'a product id with a comma, quantity 2', [{ productId: 'left,right', quantity: 2 }], 0, [row('left,right', 100)]),

  refusal('fit', 'a basket text of 501 characters', [{ productId: longId, quantity: 1 }], 0, [row(longId, 1000)]),
  refusal('fit', 'a basket text of 600 characters', [{ productId: longerId, quantity: 1 }], 0, [row(longerId, 1000)]),
]

export function refusalsFor(rule) {
  const found = refusals.filter((situation) => situation.rule === rule)
  if (found.length === 0) fail(`no situations for ${rule}`)
  return found
}

export const deadSignatures = ['t=1,v1=dead', 'v1=nope', 't=1,v1=00']

export function forgedSituations() {
  const known = knownBasket()
  const list = legalBaskets.map((basket) => ({
    name: `${basket.name}, signed t=1,v1=dead`,
    basket,
    signature: 't=1,v1=dead',
  }))
  for (const signature of deadSignatures.slice(1)) {
    list.push({ name: `${known.name}, signed ${signature}`, basket: known, signature })
  }
  return list
}

export const unsignedSituations = [
  { name: 'no signature', signature: null },
  { name: 'an empty signature', signature: '' },
]

// Shipping is 0. The amount is the written line total.
export const filledShelves = [
  { name: 'two customers buy 1 of c, shelf has 4', unit: 100, qty: 1, amount: 100, stock: 4, buyers: 2, basket: 'c:1' },
  { name: 'two customers buy 2 of c, shelf has 5', unit: 100, qty: 2, amount: 200, stock: 5, buyers: 2, basket: 'c:2' },
  { name: 'two customers buy 9 of c, shelf has 20', unit: 100, qty: 9, amount: 900, stock: 20, buyers: 2, basket: 'c:9' },
]

export const shortShelves = [
  { name: 'one customer buys 1 of c, shelf has 0', unit: 100, qty: 1, amount: 100, stock: 0, buyers: 1, race: false, basket: 'c:1' },
  { name: 'one customer buys 2 of c, shelf has 1', unit: 100, qty: 2, amount: 200, stock: 1, buyers: 1, race: false, basket: 'c:2' },
  { name: 'two customers buy the last 1 of c, and the second notice is delivered again', unit: 100, qty: 1, amount: 100, stock: 1, buyers: 2, race: true, basket: 'c:1' },
  { name: 'two customers buy 2 of c, shelf has 1, and the second notice is delivered again', unit: 100, qty: 2, amount: 200, stock: 1, buyers: 2, race: true, basket: 'c:2' },
]

export function worldsAreExact() {
  try {
    if (legalBaskets.length < 2) fail('the legal range has fewer than two baskets')
    let previous = 0
    const names = new Set()
    for (const basket of legalBaskets) {
      if (!basket.name || names.has(basket.name)) fail('a legal basket has a missing or repeated name')
      names.add(basket.name)
      if (basket.total < previous) fail('legal baskets are not listed smallest first')
      previous = basket.total
      const ids = new Set()
      for (const line of basket.lines) {
        if (ids.has(line.id)) fail(`${basket.name} lists ${line.id} twice`)
        ids.add(line.id)
        if (!idRoundTrips(line.id)) fail(`${basket.name} has an id that cannot be written whole`)
        if (!productFits(line.unit, line.qty)) fail(`${basket.name} is not an exact price`)
        if (line.unit === OTHER_PRICE) fail(`${basket.name} uses the stand-in later price`)
      }
      if (exactTotal(basket.lines, basket.shipping) !== basket.total) {
        fail(`${basket.name} is written as ${basket.total} and the lines do not add to that`)
      }
      stockLeft(basket)
    }
    const known = knownBasket()
    if (known.total !== 5000 || basketText(known) !== 'a:2,b:1') fail('the known basket is not 5000 for a:2,b:1')
    const left = stockLeft(known)
    if (left.a !== 8 || left.b !== 9) fail('the known basket does not leave 8 of a and 9 of b')
    const changed = differentSessionLines(known)
    if (changed.length === known.lines.length && changed.every((line, i) => line.productId === known.lines[i].id && line.quantity === known.lines[i].qty)) {
      fail('the later basket is the same as the known basket')
    }
    const rules = ['empty', 'shipping', 'unknown', 'price', 'zero', 'negative', 'fraction', 'grosze', 'exact', 'id', 'fit']
    for (const rule of rules) refusalsFor(rule)
    for (const situation of refusals) {
      if (!situation.name) fail('a refusal has no name')
      if (situation.rule === 'exact') {
        const item = situation.basket[0]
        const unit = situation.rows[0].price_data.unit_amount
        if (productFits(unit, item.quantity)) fail(`${situation.name} is an exact price`)
      }
      if (situation.rule === 'id') {
        if (idRoundTrips(situation.basket[0].productId)) fail(`${situation.name} can be written whole`)
      }
      if (situation.rule === 'fit') {
        const text = `${situation.basket[0].productId}:${situation.basket[0].quantity}`
        if (text.length <= 500) fail(`${situation.name} fits in the payment record`)
      }
    }
    for (const basket of legalBaskets) {
      if (basketText(basket).length > 500) fail(`${basket.name} does not fit in the payment record`)
    }
    for (const situation of filledShelves) checkShelf(situation, true)
    for (const situation of shortShelves) checkShelf(situation, false)
    if (basketChanges().length !== legalBaskets.length * (legalBaskets.length - 1)) fail('a basket change is missing')
    if (forgedSituations().length < legalBaskets.length) fail('a forged notice is missing')
    return null
  } catch (error) {
    return error.proofBroken ? error.message : `proof broken: ${error?.message ?? error}`
  }
}

function checkShelf(situation, filled) {
  if (exactProduct(situation.unit, situation.qty) !== situation.amount) {
    fail(`${situation.name} is written as ${situation.amount} and the line does not add to that`)
  }
  if (situation.basket !== `c:${situation.qty}`) fail(`${situation.name} does not say c:${situation.qty}`)
  const paid = situation.buyers * situation.qty
  if (!Number.isSafeInteger(paid)) fail(`${situation.name} pays an amount that does not fit`)
  if (filled && situation.stock < paid) fail(`${situation.name} is listed as filled but the shelf is short`)
  if (!filled && situation.stock >= paid) fail(`${situation.name} is listed as short but the shelf can fill it`)
  if (!filled && situation.buyers === 2 && situation.race !== true) fail(`${situation.name} does not hold the two sales apart`)
}

// Check every situation. A failure is the smallest situation that failed,
// then any other failure whose words differ. The count is how many failed
// out of how many were checked.
export async function checkEvery(situations, run) {
  if (!Array.isArray(situations) || situations.length === 0) fail('a property has no situations')
  const failures = []
  for (const situation of situations) {
    const finding = await run(situation)
    if (finding) failures.push({ situation, finding })
  }
  if (failures.length === 0) return null
  const lines = []
  const seen = new Set()
  for (const failure of failures) {
    if (seen.has(failure.finding)) continue
    seen.add(failure.finding)
    lines.push(`${failure.situation.name}: ${failure.finding}`)
    if (lines.length === 3) break
  }
  return `${lines.join('; ')} (${failures.length} of ${situations.length})`
}
