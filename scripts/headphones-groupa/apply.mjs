// Step 6 of the headphones-attrs sequence (sanglogium-todo.md): fills the group A cells that hold no legal value, from the fills-*.json files next to this script.
// driverConfigBucket is also derived here when the stored driverType decides it (planar only, electrostatic / amt only, or two or more driver types).
// Delete this folder once it has run (git history is the archive).
// Without --apply it only reads and prints the plan. --apply writes: ONE transaction, each patch guarded by the document's revision, then a re-read that checks the result.
// Refused (nothing written) if a fill is illegal, has no source url, overwrites a cell that already holds a legal value, or leaves a gap with neither a value nor an unresolved note.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const apply = process.argv.includes('--apply')
const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const ds = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const ver = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'
const base = `https://${pid}.api.sanity.io/v${ver}/data`

const positive = (v) => typeof v === 'number' && Number.isFinite(v) && v > 0
const oneOf = (list) => (v) => typeof v === 'string' && list.includes(v)
const someOf = (list) => (v) => Array.isArray(v) && v.length > 0 && v.every((x) => list.includes(x))
const bool = (v) => typeof v === 'boolean'
// the group A cells: every one applies to every headphone, so a cell is a gap whenever its value is not legal
const CELLS = {
  wearingStyle: oneOf(['over-ear', 'on-ear', 'in-ear']),
  acousticDesign: oneOf(['open-back', 'closed-back', 'semi-open']),
  soundSignature: oneOf(['Neutral', 'Warm', 'Bright/Analytical', 'Dark', 'V-Shaped', 'Basshead', 'Mid-Forward', 'Harman-target-like']),
  ipxRating: oneOf(['none', 'IPX2', 'IPX4', 'IPX5', 'IPX7', 'IPX8']),
  driverConfigBucket: oneOf(['single-dynamic', 'single-ba', 'multi-ba', 'hybrid-config', 'planar', 'other']),
  driverType: someOf(['dynamic', 'planar-magnetic', 'electrostatic', 'balanced-armature', 'hybrid', 'amt', 'bone-conduction', 'electret']),
  portable: bool,
  microphone: bool,
  foldable: bool,
  impedanceOhms: positive,
  sensitivityDbMw: positive,
  'freqResponseHz.min': positive,
  'freqResponseHz.max': positive,
}
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const getP = (o, p) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o)
// the touched keys removed (a nested cell removes its whole parent object), so "everything else" can be compared
const without = (fa, cells) => { const c = structuredClone(fa ?? {}); for (const p of cells) delete c[p.split('.')[0]]; return JSON.stringify(c) }
// the bucket when the driver types decide it; null when the number of drivers is needed (dynamic only, balanced armature only)
function deriveBucket(fa) {
  if (!CELLS.driverType(fa.driverType)) return null
  const t = new Set(fa.driverType)
  if (t.size >= 2) return 'hybrid-config'
  if (t.has('planar-magnetic')) return 'planar'
  if (['electrostatic', 'amt', 'bone-conduction', 'electret'].some((x) => t.has(x))) return 'other'
  return null
}

// 1. the fills (one product appears once across the files)
const files = fs.readdirSync(here).filter((f) => /^fills-.+\.json$/.test(f)).sort()
if (!files.length) throw new Error('no fills-*.json next to this script')
const fills = new Map()
const errors = []
for (const f of files) {
  for (const x of JSON.parse(fs.readFileSync(path.join(here, f), 'utf8')).fills) {
    if (fills.has(x.id)) { errors.push(`${f} ${x.name ?? x.id}: appears in a second fills entry`); continue }
    fills.set(x.id, { ...x, file: f })
  }
}

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
const before = await read()
const hpIds = sliceOf(before.catalogue, 'headphones')
// CrinEar Protocol Max is a DAC in the headphones slice (step 7a moves it out); it is not a headphone and gets no fills
const hp = before.products.filter((p) => (p.catalogueLocationKeys ?? []).some((k) => hpIds.has(k)) && p.fa?.deviceType === undefined)
const byId = new Map(hp.map((p) => [p._id, p]))

// 3. check every fill, compute the state after it, then derive the buckets that the driver types decide
const unresolved = [], covered = new Set()
const after = new Map(hp.map((p) => [p._id, structuredClone(p.fa ?? {})]))
const plan = new Map() // id -> { p, changes: [{ cell, old, v, url }], parentsCreated }
const planFor = (p) => { if (!plan.has(p._id)) plan.set(p._id, { p, changes: [], parentsCreated: new Set() }); return plan.get(p._id) }
function setCell(fa, entry, cell, v) {
  if (!cell.includes('.')) fa[cell] = v
  else {
    const [parent, sub] = cell.split('.')
    if (!isObj(fa[parent])) { fa[parent] = {}; entry.parentsCreated.add(parent) }
    fa[parent][sub] = v
  }
}
for (const fill of fills.values()) {
  const tag = `${fill.file} ${fill.name ?? fill.id}`
  const p = byId.get(fill.id)
  if (!p) { errors.push(`${tag}: not a headphones product id`); continue }
  const fa = after.get(fill.id)
  for (const [cell, why] of Object.entries(fill.unresolvedCells ?? {})) {
    if (!CELLS[cell]) errors.push(`${tag}: ${cell} is not a group A cell`)
    else { unresolved.push(`${tag}: ${cell}: ${why}`); covered.add(`${fill.id}|${cell}`) }
  }
  const cells = Object.keys(fill.set ?? {})
  if (!cells.length && !Object.keys(fill.unresolvedCells ?? {}).length) errors.push(`${tag}: empty fill`)
  const entry = planFor(p)
  for (const cell of cells) {
    const v = fill.set[cell]
    if (!CELLS[cell]) { errors.push(`${tag}: ${cell} is not a group A cell`); continue }
    if (CELLS[cell](getP(p.fa, cell))) { errors.push(`${tag}: ${cell} already holds a legal value ${JSON.stringify(getP(p.fa, cell))}`); continue }
    if (!CELLS[cell](v)) { errors.push(`${tag}: ${cell} illegal value ${JSON.stringify(v)}`); continue }
    const src = (fill.sources ?? []).find((s) => s.cell === cell)
    if (!src || !/^https?:\/\//.test(src.url ?? '')) { errors.push(`${tag}: ${cell} has no source url`); continue }
    entry.changes.push({ cell, old: getP(p.fa, cell), v, url: src.url })
    setCell(fa, entry, cell, v)
  }
}
let derived = 0
for (const p of hp) {
  const fa = after.get(p._id)
  if (CELLS.driverConfigBucket(fa.driverConfigBucket)) continue
  const b = deriveBucket(fa)
  if (b === null) continue
  const entry = planFor(p)
  entry.changes.push({ cell: 'driverConfigBucket', old: p.fa?.driverConfigBucket, v: b, url: 'derived from driverType ' + JSON.stringify(fa.driverType) })
  setCell(fa, entry, 'driverConfigBucket', b)
  derived++
}
for (const [id, entry] of plan) {
  const fa = after.get(id)
  if (isObj(fa.freqResponseHz) && positive(fa.freqResponseHz.min) && positive(fa.freqResponseHz.max) && fa.freqResponseHz.min >= fa.freqResponseHz.max) errors.push(`${entry.p.name}: freqResponseHz min ${fa.freqResponseHz.min} is not below max ${fa.freqResponseHz.max}`)
}
const blocking = [], remainingAccepted = []
for (const p of hp) {
  const fa = after.get(p._id)
  for (const [cell, legal] of Object.entries(CELLS)) {
    if (!legal(getP(fa, cell))) (covered.has(`${p._id}|${cell}`) ? remainingAccepted : blocking).push(`${p.name}: ${cell} = ${JSON.stringify(getP(fa, cell))}`)
  }
}
const writes = [...plan.values()].filter((x) => x.changes.length)

// 4. report
const perCell = {}
for (const w of writes) for (const c of w.changes) perCell[c.cell] = (perCell[c.cell] ?? 0) + 1
console.log(`${apply ? 'APPLY' : 'PLAN'}: ${files.length} fills file(s), ${fills.size} fills, ${writes.length} products, ${writes.reduce((n, x) => n + x.changes.length, 0)} cells (${derived} of them derived from driverType)`)
console.log(`by cell: ${JSON.stringify(perCell)}`)
console.log(`unresolved by the executors: ${unresolved.length}${unresolved.map((e) => `\n  ${e}`).join('')}`)
console.log(`\nfill errors: ${errors.length}${errors.map((e) => `\n  ${e}`).join('')}`)
console.log(`gaps left, covered by an unresolved note: ${remainingAccepted.length}`)
console.log(`gaps left with no value and no note: ${blocking.length}${blocking.map((e) => `\n  ${e}`).join('')}`)
if (errors.length) { console.log('\nRefused: fix the fills first.'); process.exit(1) }
if (!apply) { console.log('\nNothing was written. To apply, run the same command with --apply.'); process.exit(0) }
if (blocking.length) throw new Error('refused: some gaps would stay with no value and no unresolved note')

// 5. ONE transaction guarded by the revisions read above
const mutations = writes.map(({ p, changes, parentsCreated }) => {
  const set = {}
  for (const c of changes) {
    if (!c.cell.includes('.')) { set[`filterAttributes.${c.cell}`] = c.v; continue }
    const [parent, sub] = c.cell.split('.')
    if (parentsCreated.has(parent)) (set[`filterAttributes.${parent}`] ??= {})[sub] = c.v
    else set[`filterAttributes.${c.cell}`] = c.v
  }
  return { patch: { id: p._id, ifRevisionID: p._rev, set } }
})
const res = await fetch(`${base}/mutate/${ds}?returnIds=true&visibility=sync`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.SANITY_STUDIO_READ_WRITE}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ mutations }),
})
const body = await res.text()
if (!res.ok) throw new Error(`transaction refused: HTTP ${res.status} ${body.slice(0, 600)}`)
console.log(`transaction committed: ${mutations.length} patches`)

// 6. re-read and check
const re = await read()
const reById = new Map(re.products.map((p) => [p._id, p]))
const bad = []
for (const { p, changes } of writes) {
  const a = reById.get(p._id)
  for (const c of changes) if (JSON.stringify(getP(a?.fa, c.cell)) !== JSON.stringify(c.v)) bad.push(`${p._id}: ${c.cell} is ${JSON.stringify(getP(a?.fa, c.cell))}, wanted ${JSON.stringify(c.v)}`)
  if (without(p.fa, changes.map((c) => c.cell)) !== without(a?.fa, changes.map((c) => c.cell))) bad.push(`${p._id}: other filterAttributes changed`)
}
for (const p of before.products) if (!writes.some((w) => w.p._id === p._id) && JSON.stringify(p.fa) !== JSON.stringify(reById.get(p._id)?.fa)) bad.push(`${p._id}: untouched product changed`)
if (re.products.length !== before.products.length) bad.push('product count changed')
let left = 0
for (const p of re.products.filter((x) => byId.has(x._id))) for (const [cell, legal] of Object.entries(CELLS)) if (!legal(getP(p.fa, cell))) left++
console.log(bad.length ? `VERIFY FAILED:\n  ${bad.join('\n  ')}` : `verified: ${writes.length} products filled; every other filterAttributes value identical; ${left} group A cells still without a legal value; ${re.products.length} products.`)
