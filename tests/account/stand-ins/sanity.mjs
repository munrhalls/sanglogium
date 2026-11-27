// Sanity, stood in. Documents live in memory. Queries are the shop's own GROQ
// text, run by groq-js, Sanity's own GROQ engine. Patches are built by Sanity's
// own client classes and applied by Sanity's own mutator. A write of several
// changes lands whole or not at all, as on Sanity. The proof can make reads or
// writes fail, the way an outage would.

import { randomUUID } from 'node:crypto'
import { Patch, Transaction } from '@sanity/client'
import { Mutation } from '@sanity/mutator'
import { evaluate, parse } from 'groq-js'

let docs = new Map()

export const outage = {
  // Each is a function given the request, returning true to refuse it.
  reads: null,
  writes: null,
}

// Real Sanity answers over the network, after a delay. Proofs about two things at once set one.
export const wire = { delayMs: 0 }
const wait = () => (wire.delayMs ? new Promise((resolve) => setTimeout(resolve, wire.delayMs)) : null)

export function put(...documents) {
  for (const doc of documents) docs.set(doc._id, stamp(structuredClone(doc)))
}

export function all(type) {
  return [...docs.values()].filter((doc) => !type || doc._type === type).map((doc) => structuredClone(doc))
}

function stamp(doc) {
  const now = new Date().toISOString()
  return { ...doc, _rev: randomUUID(), _createdAt: doc._createdAt ?? now, _updatedAt: now }
}

async function run(query, params, dataset) {
  const tree = parse(query, { params })
  const value = await evaluate(tree, { dataset: [...dataset.values()], params })
  return value.get()
}

function normalize(mutations) {
  if (Array.isArray(mutations)) return mutations
  if (mutations && typeof mutations.serialize === 'function') {
    const serialized = mutations.serialize()
    return Array.isArray(serialized) ? serialized : [{ patch: serialized }]
  }
  return [mutations]
}

async function idsFor(body, dataset) {
  if (body.id) return [body.id]
  const found = await run(`${body.query}{_id}`, body.params ?? {}, dataset)
  return (Array.isArray(found) ? found : found ? [found] : []).map((doc) => doc._id)
}

async function apply(list) {
  await wait()
  if (outage.writes && outage.writes(list)) throw new Error('stand-in Sanity refused the write')
  const next = new Map(docs)
  const results = []
  for (const mutation of list) {
    const [kind, body] = Object.entries(mutation)[0]
    if (kind === 'create') {
      const id = body._id ?? randomUUID()
      if (next.has(id)) throw new Error(`Document by ID "${id}" already exists`)
      next.set(id, stamp({ ...structuredClone(body), _id: id }))
      results.push({ id, operation: 'create' })
    } else if (kind === 'createIfNotExists') {
      if (!next.has(body._id)) next.set(body._id, stamp(structuredClone(body)))
      results.push({ id: body._id, operation: 'create' })
    } else if (kind === 'createOrReplace') {
      next.set(body._id, stamp(structuredClone(body)))
      results.push({ id: body._id, operation: 'create' })
    } else if (kind === 'delete') {
      for (const id of await idsFor(body, next)) {
        next.delete(id)
        results.push({ id, operation: 'delete' })
      }
    } else if (kind === 'patch') {
      for (const id of await idsFor(body, next)) {
        const doc = next.get(id)
        if (!doc) throw new Error(`Document "${id}" not found`)
        if (body.ifRevisionID && body.ifRevisionID !== doc._rev) throw new Error(`Document "${id}" has unexpected revision`)
        const { query, params, ...ops } = body
        const patched = new Mutation({ mutations: [{ patch: { ...ops, id } }] }).apply(doc)
        next.set(id, stamp(patched))
        results.push({ id, operation: 'update' })
      }
    } else {
      throw new Error(`the stand-in does not know the mutation ${kind}`)
    }
  }
  docs = next
  return results
}

export const backendClient = {
  async fetch(query, params = {}) {
    await wait()
    if (outage.reads && outage.reads(query)) throw new Error('stand-in Sanity refused the read')
    return structuredClone(await run(query, params, docs))
  },
  patch(selection, operations) {
    return new Patch(selection, operations, backendClient)
  },
  transaction(operations) {
    return new Transaction(operations, backendClient)
  },
  async mutate(mutations) {
    const results = await apply(normalize(mutations))
    return { transactionId: randomUUID(), results, documentIds: results.map((r) => r.id) }
  },
  async create(doc) {
    const [result] = await apply([{ create: doc }])
    return structuredClone(docs.get(result.id))
  },
  async createIfNotExists(doc) {
    await apply([{ createIfNotExists: doc }])
    return structuredClone(docs.get(doc._id))
  },
  async createOrReplace(doc) {
    await apply([{ createOrReplace: doc }])
    return structuredClone(docs.get(doc._id))
  },
  async delete(selection) {
    const body = typeof selection === 'string' ? { id: selection } : selection
    return { results: await apply([{ delete: body }]) }
  },
}

// Before the shop is asked anything: the stand-in must keep Sanity's rules.
export async function selfCheck() {
  const saved = docs
  docs = new Map()
  try {
    put({ _id: 'check-a', _type: 'check', owner: 'a', list: [{ _key: 'k1', v: 1 }] })
    put({ _id: 'check-b', _type: 'check', owner: 'b' })
    const found = await backendClient.fetch('*[_type == "check" && owner == $o][0]{_id}', { o: 'b' })
    if (found?._id !== 'check-b') return 'a GROQ filter did not pick the right document'
    await backendClient.patch('check-a').unset(['list[_key=="k1"]']).append('list', [{ _key: 'k2', v: 2 }]).commit()
    const list = docs.get('check-a').list.map((item) => item._key).join(',')
    if (list !== 'k2') return `a patch left the list as ${list}`
    try {
      await backendClient.transaction().patch('check-b', (p) => p.set({ x: 1 })).patch('missing', (p) => p.set({ x: 1 })).commit()
      return 'a transaction touching a missing document went through'
    } catch {}
    if (docs.get('check-b').x !== undefined) return 'half of a failed transaction was written'
    await backendClient.patch({ query: '*[_type == "check"]', params: {} }).set({ seen: true }).commit()
    if (!docs.get('check-a').seen || !docs.get('check-b').seen) return 'a patch by query missed a document'
    return null
  } finally {
    docs = saved
  }
}
