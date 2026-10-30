// Step 4 of the headphones-attrs sequence (sanglogium-todo.md): writes the sourced fills from the fills-*.json files next to this script into filterAttributes.
// Delete this folder once it has run (git history is the archive).
// Default is a DRY RUN (reads only). --apply writes: backup first, ONE transaction, each patch guarded by the document's revision, then a re-read that checks the result.
// --apply is refused while any headphones product still has an unusable rule input or a cell that holds a value where the rule says "doesn't apply" (the step 4 done condition).
// A product the executors marked "unresolved" is reported and does not block: it needs a decision that is not a fill.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const BACKUP = path.join(here, '..', 'output', 'headphones-inputs-backup.json')
const apply = process.argv.includes('--apply')
const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const ds = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const ver = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'
const base = `https://${pid}.api.sanity.io/v${ver}/data`

const CONN = ['wired', 'wireless', 'true-wireless', 'hybrid']
const ANC = ['anc', 'passive', 'none']
const TERM = ['3.5mm', '2.5mm-balanced', '4.4mm-balanced', '4-pin-xlr', '6.35mm', 'usb-c', 'mmcx', '2-pin', 'fixed-cable']
const hours = (v) => v === null || (typeof v === 'number' && v > 0)
// the only cells a step 4 fill may touch, and what a legal value looks like
const LEGAL = {
  connectivity: (v) => CONN.includes(v),
  anc: (v) => ANC.includes(v),
  cableTermination: (v) => Array.isArray(v) && v.every((x) => TERM.includes(x)),
  detachableCable: (v) => typeof v === 'boolean',
  cableLengthM: hours,
  'batteryLifeHours.ancOff': hours,
  'batteryLifeHours.ancOn': hours,
}

const getP = (o, p) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o)
const setP = (o, p, v) => { const ks = p.split('.'); let a = o; for (const k of ks.slice(0, -1)) a = a[k]; a[ks.at(-1)] = v }
const without = (fa, cells) => { const c = structuredClone(fa ?? {}); for (const p of cells) { const ks = p.split('.'); let a = c; for (const k of ks.slice(0, -1)) a = a?.[k]; if (a && typeof a === 'object') delete a[ks.at(-1)] } return JSON.stringify(c) }

// the step 4 rules: usable inputs, and no value where the rule says "doesn't apply"
function problemsOf(fa) {
  const out = []
  if (!CONN.includes(fa.connectivity)) out.push(`connectivity unusable: ${JSON.stringify(fa.connectivity)}`)
  if (!ANC.includes(fa.anc)) out.push(`anc unusable: ${JSON.stringify(fa.anc)}`)
  if (CONN.includes(fa.connectivity) && fa.connectivity !== 'wired' && fa.connectivity !== 'hybrid') {
    if (typeof fa.cableLengthM === 'number') out.push('cableLengthM holds a value but there is no cable input')
    if (Array.isArray(fa.cableTermination) && fa.cableTermination.length) out.push('cableTermination holds a value but there is no cable input')
    if (fa.detachableCable === true) out.push('detachableCable is true but there is no cable input')
  }
  if (ANC.includes(fa.anc) && fa.anc !== 'anc' && typeof fa.batteryLifeHours?.ancOn === 'number') out.push('batteryLifeHours.ancOn holds a value but there is no ANC')
  return out
}

// 1. the fills
const files = fs.readdirSync(here).filter((f) => /^fills-.+\.json$/.test(f)).sort()
if (!files.length) throw new Error('no fills-*.json next to this script')
const fills = []
for (const f of files) for (const x of JSON.parse(fs.readFileSync(path.join(here, f), 'utf8')).fills) fills.push({ ...x, file: f })

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
const errors = []
const seen = new Set()
const after = new Map(hp.map((p) => [p._id, structuredClone(p.fa ?? {})]))
const plan = []
const unresolved = []
for (const fill of fills) {
  const tag = `${fill.file} ${fill.name ?? fill.id}`
  const p = byId.get(fill.id)
  if (!p) { errors.push(`${tag}: not a headphones product id`); continue }
  if (seen.has(fill.id)) errors.push(`${tag}: appears in two fills`)
  seen.add(fill.id)
  if (fill.unresolved) { unresolved.push(`${tag}: ${fill.unresolved}`); continue }
  const cells = Object.keys(fill.set ?? {})
  if (!cells.length) errors.push(`${tag}: empty set`)
  const fa = after.get(fill.id)
  const changes = []
  for (const cell of cells) {
    const v = fill.set[cell]
    if (!LEGAL[cell]) { errors.push(`${tag}: ${cell} is not a step 4 cell`); continue }
    if (!LEGAL[cell](v)) { errors.push(`${tag}: ${cell} illegal value ${JSON.stringify(v)}`); continue }
    const src = (fill.sources ?? []).find((s) => s.cell === cell)
    if (!src || !/^https?:\/\//.test(src.url ?? '') || !String(src.quote ?? '').trim()) { errors.push(`${tag}: ${cell} has no source (url + quote)`); continue }
    if (cell.includes('.') && !(fa[cell.split('.')[0]] && typeof fa[cell.split('.')[0]] === 'object' && !Array.isArray(fa[cell.split('.')[0]]))) { errors.push(`${tag}: ${cell} parent object is missing`); continue }
    const old = getP(fa, cell)
    setP(fa, cell, v)
    changes.push({ cell, old, v, url: src.url })
  }
  plan.push({ p, fill, changes })
}
const unresolvedIds = new Set(fills.filter((x) => x.unresolved).map((x) => x.id))
const remaining = [], remainingAccepted = []
for (const p of hp) for (const m of problemsOf(after.get(p._id))) (unresolvedIds.has(p._id) ? remainingAccepted : remaining).push(`${p.name}: ${m}`)

// 4. report
console.log(`${apply ? 'APPLY' : 'DRY RUN'}: ${files.length} fills file(s), ${fills.length} products, ${plan.reduce((n, x) => n + x.changes.length, 0)} cells`)
for (const { p, changes } of plan) {
  console.log(`\n${p.name}`)
  for (const c of changes) console.log(`  ${c.cell}: ${c.old === undefined ? '(missing)' : JSON.stringify(c.old)} -> ${JSON.stringify(c.v)}   ${c.url}`)
}
console.log(`\nunresolved by the executors: ${unresolved.length}${unresolved.map((e) => `\n  ${e}`).join('')}`)
console.log(`\nfill errors: ${errors.length}${errors.map((e) => `\n  ${e}`).join('')}`)
console.log(`left on purpose (marked unresolved by the executors, reported above): ${remainingAccepted.length}${remainingAccepted.map((e) => `\n  ${e}`).join('')}`)
console.log(`headphones still unusable or contradicting after these fills: ${remaining.length}${remaining.map((e) => `\n  ${e}`).join('')}`)
if (errors.length) { console.log('\nRefused: fix the fills first.'); process.exit(1) }
if (!apply) { console.log(`\nNothing was written. To apply, run the same command with --apply (backup goes to ${BACKUP}).`); process.exit(0) }
if (remaining.length) throw new Error('refused: the step 4 done condition is not met by these fills')

// 5. backup first, then ONE transaction guarded by the revisions read above
fs.mkdirSync(path.dirname(BACKUP), { recursive: true })
fs.writeFileSync(BACKUP, JSON.stringify({
  takenAt: new Date().toISOString(),
  what: 'step 4: old values of the filterAttributes cells that were filled',
  entries: plan.map(({ p, changes }) => ({ _id: p._id, _rev: p._rev, name: p.name, old: Object.fromEntries(changes.map((c) => [c.cell, c.old === undefined ? '(missing)' : c.old])) })),
}, null, 1))
console.log(`backup written: ${BACKUP}`)
const mutations = plan.map(({ p, changes }) => ({ patch: { id: p._id, ifRevisionID: p._rev, set: Object.fromEntries(changes.map((c) => [`filterAttributes.${c.cell}`, c.v])) } }))
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
for (const { p, changes } of plan) {
  const a = reById.get(p._id)
  for (const c of changes) if (JSON.stringify(getP(a?.fa, c.cell)) !== JSON.stringify(c.v)) bad.push(`${p._id}: ${c.cell} is ${JSON.stringify(getP(a?.fa, c.cell))}, wanted ${JSON.stringify(c.v)}`)
  if (without(p.fa, changes.map((c) => c.cell)) !== without(a?.fa, changes.map((c) => c.cell))) bad.push(`${p._id}: other filterAttributes changed`)
}
for (const p of before.products) if (!seen.has(p._id) && JSON.stringify(p.fa) !== JSON.stringify(reById.get(p._id)?.fa)) bad.push(`${p._id}: untouched product changed`)
if (re.products.length !== before.products.length) bad.push('product count changed')
const left = re.products.filter((p) => byId.has(p._id) && !unresolvedIds.has(p._id)).flatMap((p) => problemsOf(p.fa ?? {}))
if (left.length) bad.push(`${left.length} unusable inputs or contradictions remain`)
console.log(bad.length ? `VERIFY FAILED:\n  ${bad.join('\n  ')}` : `verified: ${plan.length} products filled; every other filterAttributes value identical; 0 unusable inputs, 0 contradictions; ${re.products.length} products.`)
