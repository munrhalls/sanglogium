// Step 5, sourced part, of the accessories-attrs sequence (sanglogium-todo.md): writes the sourced fills from the fills-*.json files next to this script into filterAttributes.
// Delete this folder once it has run (git history is the archive).
// Default is a DRY RUN (reads only). --apply writes: ONE transaction, each patch guarded by the document's revision, then a re-read that checks the result.
// Refused (nothing written) if a fill is illegal, has no source, or targets a cell the rule says does not apply, or if a cell that applies is left without a legal value and without an unresolved note.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const apply = process.argv.includes('--apply')
const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const ds = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const ver = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'
const base = `https://${pid}.api.sanity.io/v${ver}/data`

const listOf = (items) => (v) => Array.isArray(v) && v.length > 0 && v.every((x) => items.includes(x))
const positive = (v) => typeof v === 'number' && Number.isFinite(v) && v > 0
const text = (v) => typeof v === 'string' && v.trim() !== ''
const CABLES = 'cables-interconnects', STANDS = 'stands-isolation', PARTS = 'replacement-parts', ADAPTERS = 'adapters-converters'
// the group B cells that have gaps: the accessoryType the rule gates the cell on, and what a legal value looks like when it applies
const CELLS = {
  connectorTermination: { type: CABLES, legal: listOf(['rca', 'xlr', '3.5mm', '2.5mm', '4.4mm', '6.35mm', '4-pin-mini-xlr', 'mini-to-rca']) },
  lengthM: { type: CABLES, legal: (v) => Array.isArray(v) && v.length > 0 && v.every(positive) },
  conductorMaterial: { type: CABLES, legal: listOf(['copper-ofc', 'silver', 'silver-plated-copper']) },
  balancedUnbalanced: { type: CABLES, legal: listOf(['balanced', 'unbalanced']) },
  material: { type: STANDS, legal: listOf(['wood', 'metal', 'acrylic', 'composite-mdf']) },
  adjustableHeight: { type: STANDS, legal: (v) => typeof v === 'boolean' },
  weightCapacityKg: { type: STANDS, legal: positive },
  partType: { type: PARTS, legal: (v) => v === 'ear-pads-cushions' || v === 'ear-tips' },
  compatibility: { type: PARTS, legal: (v) => Array.isArray(v) && v.length > 0 && v.every(text) },
  adapterFunction: { type: ADAPTERS, legal: listOf(['bluetooth-transmitter-receiver', 'headphone-impedance-attenuator-adapter', 'connector-adapter', 'standalone-phono-preamp', 'usb-dac-dongle']) },
}
// no legal value exists yet for this cell (step 5b), so it stays empty on purpose
const OPEN_5B = new Set(['k27n1AQuIbSr5iozG1vKge|adapterFunction'])
const applies = (cell, fa) => fa?.accessoryType === CELLS[cell].type
const without = (fa, cells) => { const c = structuredClone(fa ?? {}); for (const k of cells) delete c[k]; return JSON.stringify(c) }

// 1. the fills (one product can appear in several files: merged)
const files = fs.readdirSync(here).filter((f) => /^fills-.+\.json$/.test(f)).sort()
if (!files.length) throw new Error('no fills-*.json next to this script')
const mergedById = new Map()
for (const f of files) for (const x of JSON.parse(fs.readFileSync(path.join(here, f), 'utf8')).fills) {
  const m = mergedById.get(x.id) ?? { id: x.id, name: x.name, files: [], set: {}, sources: [], unresolvedCells: {} }
  m.files.push(f)
  Object.assign(m.set, x.set ?? {})
  m.sources.push(...(x.sources ?? []))
  Object.assign(m.unresolvedCells, x.unresolvedCells ?? {})
  mergedById.set(x.id, m)
}
for (const m of mergedById.values()) for (const c of Object.keys(m.set)) delete m.unresolvedCells[c]
const fills = [...mergedById.values()].map((m) => ({ ...m, file: m.files.join('+') }))

// 2. the live data
const query = `{
  "products": *[_type == "product" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(_id asc) { _id, _rev, name, catalogueLocationKeys, "fa": filterAttributes },
  "catalogue": *[_type == "catalogueItem"] { _id, "slug": slug.current, "parent": parent._ref }
}`
async function read() {
  const res = await fetch(`${base}/query/${ds}?query=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` } })
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status} ${await res.text()}`)
  return (await res.json()).result
}
function sliceOf(catalogue, name) {
  const ids = new Set([catalogue.find((c) => c.slug === name)._id])
  let grew = true
  while (grew) {
    grew = false
    for (const c of catalogue) if (c.parent && ids.has(c.parent) && !ids.has(c._id)) (ids.add(c._id), (grew = true))
  }
  return ids
}
const inAccessories = (data) => { const ids = sliceOf(data.catalogue, 'accessories'); return data.products.filter((p) => (p.catalogueLocationKeys ?? []).some((k) => ids.has(k))) }
const before = await read()
const acc = inAccessories(before)
const byId = new Map(acc.map((p) => [p._id, p]))

// 3. check every fill, compute the state after it
const errors = [], unresolved = [], covered = new Set()
const after = new Map(acc.map((p) => [p._id, structuredClone(p.fa ?? {})]))
const plan = []
for (const fill of fills) {
  const tag = `${fill.file} ${fill.name ?? fill.id}`
  const p = byId.get(fill.id)
  if (!p) { errors.push(`${tag}: not an accessories product id`); continue }
  const fa = after.get(fill.id)
  for (const [cell, why] of Object.entries(fill.unresolvedCells)) { unresolved.push(`${tag}: ${cell}: ${why}`); covered.add(`${fill.id}|${cell}`) }
  const cells = Object.keys(fill.set)
  if (!cells.length && !Object.keys(fill.unresolvedCells).length) errors.push(`${tag}: empty set`)
  const changes = []
  for (const cell of cells) {
    const v = fill.set[cell], def = CELLS[cell]
    if (!def) { errors.push(`${tag}: ${cell} is not a step 5 cell`); continue }
    if (!applies(cell, fa)) { errors.push(`${tag}: the rule says ${cell} does not apply to this product`); continue }
    if (!def.legal(v)) { errors.push(`${tag}: ${cell} illegal value ${JSON.stringify(v)}`); continue }
    const src = fill.sources.find((s) => s.cell === cell)
    if (!src || !/^https?:\/\//.test(src.url ?? '')) { errors.push(`${tag}: ${cell} has no source url`); continue }
    changes.push({ cell, old: fa[cell], v, url: src.url })
  }
  for (const c of changes) fa[c.cell] = c.v
  plan.push({ p, fill, changes })
}
const blocking = [], remainingAccepted = []
for (const p of acc) {
  const fa = after.get(p._id)
  for (const [cell, def] of Object.entries(CELLS)) {
    if (applies(cell, fa) && !def.legal(fa[cell])) (covered.has(`${p._id}|${cell}`) || OPEN_5B.has(`${p._id}|${cell}`) ? remainingAccepted : blocking).push(`${p.name}: ${cell} = ${JSON.stringify(fa[cell])}`)
  }
}

// 4. report
console.log(`${apply ? 'APPLY' : 'DRY RUN'}: ${files.length} fills file(s), ${fills.length} products, ${plan.reduce((n, x) => n + x.changes.length, 0)} cells`)
for (const { p, changes } of plan) {
  if (!changes.length) continue
  console.log(`\n${p.name}`)
  for (const c of changes) console.log(`  ${c.cell}: ${c.old === undefined ? '(missing)' : JSON.stringify(c.old)} -> ${JSON.stringify(c.v)}   ${c.url}`)
}
console.log(`\nunresolved by the executors: ${unresolved.length}${unresolved.map((e) => `\n  ${e}`).join('')}`)
console.log(`\nfill errors: ${errors.length}${errors.map((e) => `\n  ${e}`).join('')}`)
console.log(`applying cells left without a legal value, covered by an unresolved note (or 5b): ${remainingAccepted.length}`)
console.log(`applying cells left without a legal value and without a note: ${blocking.length}${blocking.map((e) => `\n  ${e}`).join('')}`)
if (errors.length) { console.log('\nRefused: fix the fills first.'); process.exit(1) }
if (!apply) { console.log('\nNothing was written. To apply, run the same command with --apply.'); process.exit(0) }
if (blocking.length) throw new Error('refused: some applying cells would stay empty with no unresolved note')

// 5. ONE transaction guarded by the revisions read above
const writes = plan.filter((x) => x.changes.length)
const mutations = writes.map(({ p, changes }) => ({ patch: { id: p._id, ifRevisionID: p._rev, set: Object.fromEntries(changes.map((c) => [`filterAttributes.${c.cell}`, c.v])) } }))
const res = await fetch(`${base}/mutate/${ds}?returnIds=true&visibility=sync`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.SANITY_STUDIO_READ_WRITE}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ mutations }),
})
const body = await res.text()
if (!res.ok) throw new Error(`transaction refused: HTTP ${res.status} ${body.slice(0, 600)}`)
console.log(`transaction committed: ${mutations.length} patches`)

// 6. re-read and check (accessories only: other slices are written by other work)
const afterAcc = inAccessories(await read())
const reById = new Map(afterAcc.map((p) => [p._id, p]))
const bad = []
if (afterAcc.length !== acc.length) bad.push('accessories product count changed')
for (const { p, changes } of writes) {
  const a = reById.get(p._id)
  for (const c of changes) if (JSON.stringify(a?.fa?.[c.cell]) !== JSON.stringify(c.v)) bad.push(`${p._id}: ${c.cell} is ${JSON.stringify(a?.fa?.[c.cell])}, wanted ${JSON.stringify(c.v)}`)
  if (without(p.fa, changes.map((c) => c.cell)) !== without(a?.fa, changes.map((c) => c.cell))) bad.push(`${p._id}: other filterAttributes changed`)
}
for (const p of acc) if (!writes.some((w) => w.p._id === p._id) && JSON.stringify(p.fa) !== JSON.stringify(reById.get(p._id)?.fa)) bad.push(`${p._id}: untouched product changed`)
console.log(bad.length ? `VERIFY FAILED:\n  ${bad.join('\n  ')}` : `verified: ${writes.length} products filled; every other filterAttributes value identical; ${afterAcc.length} accessories.`)
