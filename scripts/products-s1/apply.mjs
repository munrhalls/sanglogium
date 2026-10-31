// Products definition of done, step S1 (rules 4 and 6): removes the homes that make one thing exist twice.
//   1. Deletes the product "Denon AH-D9200 Headphones" (PHPYj28HJdPDHAaIBDsCuM), which nothing references. "Denon AHD9200 Headphones" stays.
//   2. In every group of published products that share a SKU, every product after the first (in _id order) gets a new SKU: its slug in capitals.
//   3. Unsets filterAttributes.networkConnection, .driverConfigBucket and .dacIncluded on every product document (published and draft).
// Delete this folder once it has run (git history is the archive).
// Without --apply it only reads and prints the plan. --apply writes ONE transaction, each patch guarded by the document's revision,
// then re-reads and checks that every product document is exactly what it was, minus the three fields, plus the new SKUs, minus the Denon duplicate.
// Refused (nothing written): the duplicate is missing, renamed or referenced; the kept Denon is missing; a new SKU would collide.
const apply = process.argv.includes('--apply')
const e = process.env
const ds = e.NEXT_PUBLIC_SANITY_DATASET || 'production'
const base = `https://${e.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${e.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'}/data`

const DUPLICATE = { id: 'PHPYj28HJdPDHAaIBDsCuM', name: 'Denon AH-D9200 Headphones' }
const KEPT = { id: 'moXlkADK7m1DHgGwWtbmis', name: 'Denon AHD9200 Headphones' }
const FIELDS = ['networkConnection', 'driverConfigBucket', 'dacIncluded']

const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
const stable = (v) => JSON.stringify(v, (_, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : 1))) : x))
const bare = ({ _rev, _updatedAt, ...rest }) => rest
const isDraft = (p) => p._id.startsWith('drafts.')

async function read(query) {
  const res = await fetch(`${base}/query/${ds}?query=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${e.SANITY_API_READ_TOKEN}` } })
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`)
  return (await res.json()).result
}
// every product document, whole, published and draft; release versions are not products of the store
const readProducts = () => read('*[_type == "product" && !(_id in path("versions.**"))] | order(_id asc)')

// 1. plan
const before = await readProducts()
const published = before.filter((p) => !isDraft(p))
const refs = await read(`*[references("${DUPLICATE.id}") || references("drafts.${DUPLICATE.id}")]{_id,_type}`)
const dup = published.find((p) => p._id === DUPLICATE.id)
const kept = published.find((p) => p._id === KEPT.id)
if (!dup || dup.name !== DUPLICATE.name) throw new Error(`refused: ${DUPLICATE.id} is missing or is no longer named "${DUPLICATE.name}"`)
if (!kept || kept.name !== KEPT.name) throw new Error(`refused: ${KEPT.id} is missing or is no longer named "${KEPT.name}"`)
if (refs.length) throw new Error(`refused: the duplicate is referenced by ${refs.map((r) => `${r._type} ${r._id}`).join(', ')}`)
const deleted = new Set(before.filter((p) => p._id === DUPLICATE.id || p._id === `drafts.${DUPLICATE.id}`).map((p) => p._id))

const groups = new Map()
for (const p of published) if (!deleted.has(p._id) && typeof p.sku === 'string' && norm(p.sku)) groups.set(norm(p.sku), [...(groups.get(norm(p.sku)) ?? []), p])
const newSku = new Map()
for (const g of groups.values()) for (const p of g.slice(1)) {
  if (typeof p.slug?.current !== 'string' || !p.slug.current) throw new Error(`refused: ${p.name} has no slug to make a SKU from`)
  newSku.set(p._id, p.slug.current.toUpperCase())
}
const finalSku = published.filter((p) => !deleted.has(p._id)).map((p) => norm(newSku.get(p._id) ?? p.sku ?? '')).filter(Boolean)
if (new Set(finalSku).size !== finalSku.length) throw new Error('refused: a new SKU would collide with another SKU')

const patches = []
const perField = Object.fromEntries(FIELDS.map((f) => [f, 0]))
for (const p of before) {
  if (deleted.has(p._id)) continue
  const unset = FIELDS.filter((f) => p.filterAttributes && f in p.filterAttributes)
  const sku = newSku.get(p._id)
  if (!unset.length && sku === undefined) continue
  unset.forEach((f) => perField[f]++)
  patches.push({ p, unset, sku })
}

// 2. report
console.log(`${apply ? 'APPLY' : 'PLAN'}: ${published.length} published and ${before.length - published.length} draft products read`)
console.log(`delete: ${[...deleted].join(', ')} ("${DUPLICATE.name}"); the duplicate is referenced by 0 documents. Kept: ${KEPT.id} ("${KEPT.name}")`)
console.log(`new SKUs (${newSku.size}):${[...newSku].map(([id, s]) => `\n  ${published.find((p) => p._id === id).sku} -> ${s}   (${published.find((p) => p._id === id).name})`).join('')}`)
console.log(`fields to unset: ${JSON.stringify(perField)}; documents to patch: ${patches.length}`)
if (!apply) { console.log('\nNothing was written. To apply, run the same command with --apply.'); process.exit(0) }

// 3. ONE transaction, each patch guarded by the revision read above
const mutations = [
  ...[...deleted].map((id) => ({ delete: { id } })),
  ...patches.map(({ p, unset, sku }) => ({ patch: { id: p._id, ifRevisionID: p._rev, ...(sku === undefined ? {} : { set: { sku } }), ...(unset.length ? { unset: unset.map((f) => `filterAttributes.${f}`) } : {}) } })),
]
const res = await fetch(`${base}/mutate/${ds}?returnIds=true&visibility=sync`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${e.SANITY_STUDIO_READ_WRITE}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ mutations }),
})
const body = await res.text()
if (!res.ok) throw new Error(`transaction refused: HTTP ${res.status} ${body.slice(0, 600)}`)
console.log(`transaction committed: ${mutations.length} mutations`)

// 4. re-read and compare every product document with what it must be
const after = await readProducts()
const expect = new Map()
for (const p of before) {
  if (deleted.has(p._id)) continue
  const x = structuredClone(bare(p))
  for (const f of FIELDS) if (x.filterAttributes) delete x.filterAttributes[f]
  if (newSku.has(p._id)) x.sku = newSku.get(p._id)
  expect.set(p._id, x)
}
const bad = []
for (const a of after) {
  if (!expect.has(a._id)) bad.push(`${a._id}: should not exist`)
  else if (stable(bare(a)) !== stable(expect.get(a._id))) bad.push(`${a._id}: differs from what it must be`)
}
for (const id of expect.keys()) if (!after.some((a) => a._id === id)) bad.push(`${id}: missing`)
console.log(bad.length ? `VERIFY FAILED:\n  ${bad.join('\n  ')}` : `verified: ${after.length} product documents, each exactly as expected; ${deleted.size} deleted, ${newSku.size} SKUs changed, none of ${FIELDS.join(', ')} left.`)
if (bad.length) process.exit(1)
