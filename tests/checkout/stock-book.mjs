// The warehouse and the order file, on this machine.
//
// A write lands whole or it lands nothing. A stock change that was read
// before another sale landed is refused. Hold lets two sales read the same
// shelf, then land in the order they were queued. No call leaves this machine.
//
// warehouseObeysItsRule runs before the shop is asked anything. If it fails,
// the proof stops. A warehouse that writes half a sale, or lands two sales
// out of order, would make the later answers untrustworthy.

const products = new Map()
const orders = new Map()
let revision = 0
let holding = false
const waiting = []

function broken(message) {
  const error = new Error(`proof broken: ${message}`)
  error.proofBroken = true
  return error
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function nextRevision() {
  revision += 1
  return `r${revision}`
}

function apply(ops) {
  for (const op of ops) {
    if (op.type === 'create' && orders.has(op.doc._id)) throw new Error(`document ${op.doc._id} already exists`)
    if (op.type === 'patch') {
      const product = products.get(op.id)
      if (!product || product._rev !== op.patch.ifRevisionID) throw new Error(`revision mismatch on ${op.id}`)
    }
  }
  for (const op of ops) {
    if (op.type === 'create') orders.set(op.doc._id, clone(op.doc))
    if (op.type === 'patch') {
      const product = products.get(op.id)
      product.stock -= op.patch.dec.stock
      product._rev = nextRevision()
    }
  }
}

export const backendClient = {
  async fetch(_query, params) {
    if (params && Object.prototype.hasOwnProperty.call(params, 'paymentIntentId')) {
      const hit = [...orders.values()].find((order) => order.paymentIntentId === params.paymentIntentId)
      return hit ? { _id: hit._id } : null
    }
    if (params && Object.prototype.hasOwnProperty.call(params, 'ids')) {
      return params.ids.filter((id) => products.has(id)).map((id) => clone(products.get(id)))
    }
    throw broken('the order writer asked the stock book a question it does not know')
  },

  async getDocument(id) {
    if (orders.has(id)) return clone(orders.get(id))
    if (products.has(id)) return clone(products.get(id))
    return null
  },

  transaction() {
    const ops = []
    return {
      create(doc) {
        ops.push({ type: 'create', doc })
        return this
      },
      patch(id, patch) {
        if (patch?.dec?.stock == null || patch.ifRevisionID == null) throw broken('a stock patch was not a revisioned decrement')
        ops.push({ type: 'patch', id, patch })
        return this
      },
      commit() {
        if (!holding) {
          apply(ops)
          return Promise.resolve()
        }
        return new Promise((resolve, reject) => {
          waiting.push({
            resolve,
            reject,
            apply() {
              apply(ops)
            },
          })
        })
      },
    }
  },
}

export function reset() {
  products.clear()
  orders.clear()
  revision = 0
  holding = false
  waiting.splice(0, waiting.length)
}

export function seed(rows) {
  for (const row of rows) {
    products.set(row.id, {
      _id: row.id,
      _type: 'product',
      _rev: nextRevision(),
      name: row.name ?? row.id,
      stock: row.stock,
      price_data: row.unit == null ? null : { unit_amount: row.unit },
    })
  }
}

export function setPrice(id, unit) {
  const product = products.get(id)
  if (!product) throw broken(`no product ${id}`)
  product.price_data = { unit_amount: unit }
}

export function stocks() {
  return Object.fromEntries([...products.keys()].map((id) => [id, products.get(id).stock]))
}

export function orderDocs() {
  return [...orders.values()].map((order) => clone(order))
}

export function hold() {
  holding = true
}

export function release() {
  holding = false
  const batch = waiting.splice(0, waiting.length)
  for (const item of batch) {
    try {
      item.apply()
      item.resolve()
    } catch (error) {
      item.reject(error)
    }
  }
}

export async function until(count) {
  for (let step = 0; step < 1000; step += 1) {
    if (waiting.length >= count) return
    await Promise.resolve()
  }
  throw broken('an order write never reached its commit')
}

// The warehouse rule, checked on this stand-in. A string means the stand-in
// itself is wrong. Null means a stale reading wrote nothing, and two queued
// sales of that same reading landed in order, the second one refused whole.
export async function warehouseObeysItsRule() {
  reset()
  try {
    seed([{ id: 'c', unit: 100, stock: 1 }])
    const product = await backendClient.getDocument('c')
    const rev = product._rev
    let refused = false
    try {
      await backendClient.transaction()
        .create({ _id: 'order_bad', paymentIntentId: 'pi_bad' })
        .patch('c', { ifRevisionID: 'not-the-rev', dec: { stock: 1 } })
        .commit()
    } catch (error) {
      if (!String(error?.message).includes('revision mismatch')) throw error
      refused = true
    }
    if (!refused) return 'a stock write with a stale reading was accepted'
    if (orderDocs().length !== 0) return 'a refused sale still wrote an order'
    if (stocks().c !== 1) return 'a refused sale still changed the stock'

    hold()
    const first = backendClient.transaction()
      .create({ _id: 'order_1', paymentIntentId: 'pi_1' })
      .patch('c', { ifRevisionID: rev, dec: { stock: 1 } })
      .commit()
    const second = backendClient.transaction()
      .create({ _id: 'order_2', paymentIntentId: 'pi_2' })
      .patch('c', { ifRevisionID: rev, dec: { stock: 1 } })
      .commit()
    const firstLanded = first.then(() => true, () => false)
    const secondRefused = second.then(() => false, () => true)
    await until(2)
    if (orderDocs().length !== 0 || stocks().c !== 1) return 'a held sale changed the books before it was released'
    release()
    if (!(await firstLanded)) return 'the first queued sale did not land'
    if (!(await secondRefused)) return 'two sales from the same reading both landed'
    if (stocks().c !== 0) return `the stock is ${stocks().c} after the one sale that could be filled`
    const written = orderDocs()
    if (written.length !== 1 || written[0]._id !== 'order_1') return 'the sales did not land in the order they were queued'
    return null
  } finally {
    release()
    reset()
  }
}
