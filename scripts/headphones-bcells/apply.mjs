// Step 5, sourced part, of the headphones-attrs sequence (sanglogium-todo.md): writes the sourced fills from the fills-*.json files next to this script into filterAttributes.
// Delete this folder once it has run (git history is the archive).
// Default is a DRY RUN (reads only). --apply writes: backup first, ONE transaction, each patch guarded by the document's revision, then a re-read that checks the result.
// Refused (nothing written) if a fill is illegal, has no source, or targets a cell the rule says does not apply, or if a cell that applies is left without a legal value and without an unresolved note.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const BACKUP = path.join(here, '..', 'output', 'headphones-bcells-backup.json')
const apply = process.argv.includes('--apply')
const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const ds = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const ver = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'
const base = `https://${pid}.api.sanity.io/v${ver}/data`

const CONN = ['wired', 'wireless', 'true-wireless', 'hybrid']
const ANC = ['anc', 'passive', 'none']
const TERM = ['3.5mm', '2.5mm-balanced', '4.4mm-balanced', '4-pin-xlr', '6.35mm', 'usb-c', 'mmcx', '2-pin', 'fixed-cable']
const CODECS = ['SBC', 'AAC', 'aptX', 'aptX HD', 'aptX Adaptive', 'aptX LL', 'LDAC', 'LC3']
const positive = (v) => typeof v === 'number' && Number.isFinite(v) && v > 0
const cabled = (fa) => fa.connectivity === 'wired' || fa.connectivity === 'hybrid'
// the group B cells: does the rule say the cell applies to this product, and what a legal value looks like when it applies
const CELLS = {
  bluetoothCodecs: { applies: (fa) => fa.connectivity !== 'wired', legal: (v) => Array.isArray(v) && v.length > 0 && v.every((x) => CODECS.includes(x)) },
  cableTermination: { applies: cabled, legal: (v) => Array.isArray(v) && v.length > 0 && v.every((x) => TERM.includes(x)) },
  detachableCable: { applies: cabled, legal: (v) => typeof v === 'boolean' },
  cableLengthM: { applies: cabled, legal: positive },
  'batteryLifeHours.ancOff': { applies: (fa) => fa.connectivity !== 'wired' || fa.anc === 'anc', legal: positive },
  'batteryLifeHours.ancOn': { applies: (fa) => fa.anc === 'anc', legal: positive },
}
const usable = (fa) => CONN.includes(fa.connectivity) && ANC.includes(fa.anc)
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const getP = (o, p) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o)
// the touched keys removed (a nested cell removes its whole parent object), so "everything else" can be compared
const without = (fa, cells) => { const c = structuredClone(fa ?? {}); for (const p of cells) delete c[p.split('.')[0]]; return JSON.stringify(c) }

// 1. the fills
const files = fs.readdirSync(here).filter((f) => /^fills-.+\.json$/.test(f)).sort()
if (!files.length) throw new Error('no fills-*.json next to this script')
const rawFills = []
for (const f of files) for (const x of JSON.parse(fs.readFileSync(path.join(here, f), 'utf8')).fills) rawFills.push({ ...x, file: f })
// one product can appear in several files (a second pass): merge them; a cell set later is no longer unresolved
const mergedById = new Map()
for (const f of rawFills) {
  const m = mergedById.get(f.id) ?? { id: f.id, name: f.name, files: [], set: {}, sources: [], unresolvedCells: {} }
  m.files.push(f.file)
  if (f.unresolved) m.unresolved = f.unresolved
  Object.assign(m.set, f.set ?? {})
  m.sources.push(...(f.sources ?? []))
  Object.assign(m.unresolvedCells, f.unresolvedCells ?? {})
  mergedById.set(f.id, m)
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
const before = await read()
const hpIds = sliceOf(before.catalogue, 'headphones')
const hp = before.products.filter((p) => (p.catalogueLocationKeys ?? []).some((k) => hpIds.has(k)))
const byId = new Map(hp.map((p) => [p._id, p]))

// 3. check every fill, compute the state after it
const errors = [], unresolved = [], seen = new Set(), covered = new Set()
const after = new Map(hp.map((p) => [p._id, structuredClone(p.fa ?? {})]))
const plan = []
for (const fill of fills) {
  const tag = `${fill.file} ${fill.name ?? fill.id}`
  const p = byId.get(fill.id)
  if (!p) { errors.push(`${tag}: not a headphones product id`); continue }
  seen.add(fill.id)
  const fa = after.get(fill.id)
  if (fill.unresolved) { unresolved.push(`${tag}: ${fill.unresolved}`); for (const c of Object.keys(CELLS)) covered.add(`${fill.id}|${c}`); continue }
  for (const [cell, why] of Object.entries(fill.unresolvedCells ?? {})) { unresolved.push(`${tag}: ${cell}: ${why}`); covered.add(`${fill.id}|${cell}`) }
  const cells = Object.keys(fill.set ?? {})
  if (!cells.length && !Object.keys(fill.unresolvedCells ?? {}).length) errors.push(`${tag}: empty set`)
  const changes = []
  for (const cell of cells) {
    const v = fill.set[cell], def = CELLS[cell]
    if (!def) { errors.push(`${tag}: ${cell} is not a step 5 cell`); continue }
    if (!usable(fa)) { errors.push(`${tag}: rule inputs unusable`); continue }
    if (!def.applies(fa)) { errors.push(`${tag}: the rule says ${cell} does not apply to this product`); continue }
    if (!def.legal(v)) { errors.push(`${tag}: ${cell} illegal value ${JSON.stringify(v)}`); continue }
    const src = (fill.sources ?? []).find((s) => s.cell === cell)
    if (!src || !/^https?:\/\//.test(src.url ?? '') || !String(src.quote ?? '').trim()) { errors.push(`${tag}: ${cell} has no source (url + quote)`); continue }
    changes.push({ cell, old: getP(fa, cell), v, url: src.url })
  }
  // apply to the local copy; a nested cell whose parent is not an object creates the parent
  const parentsCreated = new Set()
  for (const c of changes) {
    if (!c.cell.includes('.')) fa[c.cell] = c.v
    else {
      const [parent, sub] = c.cell.split('.')
      if (!isObj(fa[parent])) { fa[parent] = {}; parentsCreated.add(parent) }
      fa[parent][sub] = c.v
    }
  }
  plan.push({ p, fill, changes, parentsCreated, before: p.fa ?? {} })
}
const blocking = [], remainingAccepted = []
for (const p of hp) {
  const fa = after.get(p._id)
  if (!usable(fa)) continue
  for (const [cell, def] of Object.entries(CELLS)) {
    if (def.applies(fa) && !def.legal(getP(fa, cell))) (covered.has(`${p._id}|${cell}`) ? remainingAccepted : blocking).push(`${p.name}: ${cell} = ${JSON.stringify(getP(fa, cell))}`)
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
console.log(`applying cells left without a legal value, covered by an unresolved note: ${remainingAccepted.length}`)
console.log(`applying cells left without a legal value and without a note: ${blocking.length}${blocking.map((e) => `\n  ${e}`).join('')}`)
if (errors.length) { console.log('\nRefused: fix the fills first.'); process.exit(1) }
if (!apply) { console.log(`\nNothing was written. To apply, run the same command with --apply (backup goes to ${BACKUP}).`); process.exit(0) }
if (blocking.length) throw new Error('refused: some applying cells would stay empty with no unresolved note')

// 5. backup first, then ONE transaction guarded by the revisions read above
const writes = plan.filter((x) => x.changes.length)
fs.mkdirSync(path.dirname(BACKUP), { recursive: true })
fs.writeFileSync(BACKUP, JSON.stringify({
  takenAt: new Date().toISOString(),
  what: 'step 5: old values of the group B cells that were filled from sources',
  entries: writes.map(({ p, changes }) => ({ _id: p._id, _rev: p._rev, name: p.name, old: Object.fromEntries(changes.map((c) => [c.cell, c.old === undefined ? '(missing)' : c.old])) })),
}, null, 1))
console.log(`backup written: ${BACKUP}`)
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
console.log(bad.length ? `VERIFY FAILED:\n  ${bad.join('\n  ')}` : `verified: ${writes.length} products filled; every other filterAttributes value identical; ${re.products.length} products.`)
